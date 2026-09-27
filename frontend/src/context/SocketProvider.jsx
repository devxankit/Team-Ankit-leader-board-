import { useEffect, useMemo, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { io } from 'socket.io-client'
import { env } from '@/config/env'
import { SocketContext } from './contexts'

/** Everything a score change can affect. */
const LIVE_QUERY_KEYS = [['leaderboard'], ['activity'], ['history'], ['admin']]

/**
 * One Socket.io connection for everyone viewing the (public) leaderboard. On
 * `leaderboard:updated` it refetches whatever is on screen — people may be
 * looking at different periods, so the event itself carries no data.
 */
export function SocketProvider({ children }) {
  const queryClient = useQueryClient()
  const [connected, setConnected] = useState(false)

  useEffect(() => {
    const socket = io(env.socketUrl, { withCredentials: true })
    let timer

    const refreshLiveData = () => {
      clearTimeout(timer)
      // A bulk "apply" can land as a burst — refetch once.
      timer = setTimeout(() => {
        LIVE_QUERY_KEYS.forEach((queryKey) => queryClient.invalidateQueries({ queryKey }))
      }, 250)
    }

    socket.on('connect', () => setConnected(true))
    socket.on('disconnect', () => setConnected(false))
    socket.on('leaderboard:updated', refreshLiveData)
    // Catch up on anything missed while offline.
    socket.io.on('reconnect', refreshLiveData)

    return () => {
      clearTimeout(timer)
      socket.disconnect()
      setConnected(false)
    }
  }, [queryClient])

  const value = useMemo(() => ({ connected }), [connected])
  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
}
