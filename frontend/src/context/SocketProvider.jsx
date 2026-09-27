import { useEffect, useMemo, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { io } from 'socket.io-client'
import { env } from '@/config/env'
import { useAuth } from '@/hooks/useAuth'
import { SocketContext } from './contexts'

/** Everything a score change can affect. */
const LIVE_QUERY_KEYS = [['leaderboard'], ['activity'], ['history'], ['admin']]

/**
 * Keeps one Socket.io connection per signed-in user. On `leaderboard:updated`
 * it refetches whatever is on screen — each person may be looking at a
 * different period, so the event itself carries no data.
 */
export function SocketProvider({ children }) {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [connected, setConnected] = useState(false)
  const canConnect = Boolean(user && !user.mustChangePassword)

  useEffect(() => {
    if (!canConnect) return undefined

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
  }, [canConnect, user?.id, queryClient])

  const value = useMemo(() => ({ connected }), [connected])
  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
}
