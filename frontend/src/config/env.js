// Centralised access to Vite env vars — the rest of the app never touches
// import.meta.env directly.
export const env = {
  appName: import.meta.env.VITE_APP_NAME || 'TA',
  apiUrl: import.meta.env.VITE_API_URL || '/api',
  /** Undefined = connect to the page's own origin (proxied in development). */
  socketUrl: import.meta.env.VITE_SOCKET_URL || undefined,
}
