import { BrowserRouter } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { MotionConfig } from 'motion/react'
import { Toaster } from 'sonner'
import { AuthProvider } from '@/context/AuthProvider'
import { SocketProvider } from '@/context/SocketProvider'
import { ThemeProvider } from '@/context/ThemeProvider'
import { useTheme } from '@/hooks/useTheme'
import { queryClient } from '@/lib/queryClient'
import AppRoutes from '@/routes/AppRoutes'

function ThemedToaster() {
  const { theme } = useTheme()
  return <Toaster theme={theme} position="top-center" offset={76} mobileOffset={72} richColors closeButton />
}

export default function App() {
  return (
    // Respect the OS "reduce motion" setting for every animation.
    <MotionConfig reducedMotion="user">
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <BrowserRouter>
            <AuthProvider>
              <SocketProvider>
                <AppRoutes />
                <ThemedToaster />
              </SocketProvider>
            </AuthProvider>
          </BrowserRouter>
        </ThemeProvider>
      </QueryClientProvider>
    </MotionConfig>
  )
}
