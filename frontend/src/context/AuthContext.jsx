import { createContext, useContext, useState, useEffect } from 'react'
import { loginUser, registerUser, getUserProfile } from '@/services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function checkAuth() {
      const token = localStorage.getItem('token') || localStorage.getItem('adminToken')
      if (!token) {
        setLoading(false)
        return
      }

      try {
        const userData = await getUserProfile()
        setUser(userData)
      } catch (err) {
        console.error('Auth verification failed:', err.message)
        localStorage.removeItem('token')
        localStorage.removeItem('adminToken')
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [])

  const login = async (email, password) => {
    const data = await loginUser(email, password)
    setUser(data.user)
    return data
  }

  const register = async (userData) => {
    const data = await registerUser(userData)
    setUser(data.user)
    return data
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('adminToken')
    setUser(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: Boolean(user),
        isAdmin: user?.role === 'admin',
        login,
        register,
        logout,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
