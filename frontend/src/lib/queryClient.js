import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Live updates arrive over the socket, so data rarely goes stale on its own.
      staleTime: 60_000,
      // Retry network blips and server errors, never auth or validation failures.
      retry: (failureCount, error) => (error?.status === 0 || error?.status >= 500) && failureCount < 2,
    },
  },
})
