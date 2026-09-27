import { useCallback, useEffect, useMemo, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { onSessionLost } from '@/services/api'
import { authService } from '@/services/authService'
import { AuthContext } from './contexts'

export function AuthProvider({ children }) {
  const queryClient = useQueryClient()
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  // Restore the admin session from the httpOnly cookie. Visitors get user: null.
  useEffect(() => {
    let cancelled = false
    authService
      .me()
      .then((sessionUser) => !cancelled && setUser(sessionUser))
      .catch(() => {})
      .finally(() => !cancelled && setIsLoading(false))
    return () => {
      cancelled = true
    }
  }, [])

  // An admin request that finds the session gone (expired or password changed) signs the admin out.
  useEffect(() => {
    onSessionLost((error) => {
      setUser(null)
      queryClient.clear()
      toast.error(error.message, { id: 'session-lost' })
    })
  }, [queryClient])

  const login = useCallback(async (email, password) => {
    const sessionUser = await authService.login(email, password)
    setUser(sessionUser)
    return sessionUser
  }, [])

  const logout = useCallback(async () => {
    try {
      await authService.logout()
    } finally {
      setUser(null)
      queryClient.clear()
    }
  }, [queryClient])

  const changePassword = useCallback(async (body) => {
    const sessionUser = await authService.changePassword(body)
    setUser(sessionUser)
    return sessionUser
  }, [])

  const value = useMemo(
    () => ({ user, isLoading, isAdmin: user?.role === 'admin', login, logout, changePassword }),
    [user, isLoading, login, logout, changePassword]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
