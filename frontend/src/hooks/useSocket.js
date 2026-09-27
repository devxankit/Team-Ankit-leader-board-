import { useContext } from 'react'
import { SocketContext } from '@/context/contexts'

/** `connected` is true while live updates are flowing. */
export const useSocket = () => useContext(SocketContext)
