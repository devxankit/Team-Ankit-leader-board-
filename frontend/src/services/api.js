import axios from 'axios'
import { env } from '@/config/env'

/** An API failure carrying the server's message, error code and per-field errors. */
export class ApiRequestError extends Error {
  constructor({ message, status, code, fieldErrors }) {
    super(message)
    this.name = 'ApiRequestError'
    this.status = status
    this.code = code
    this.fieldErrors = fieldErrors ?? {}
  }
}

/** Session cookie is httpOnly, so every request just sends credentials. */
export const http = axios.create({
  baseURL: env.apiUrl,
  withCredentials: true,
  timeout: 20000,
})

let handleSessionLost = () => {}

/** AuthProvider registers what happens when the server says the admin session is gone. */
export function onSessionLost(handler) {
  handleSessionLost = handler
}

const SESSION_CHECK_URLS = ['/auth/login', '/auth/me']

http.interceptors.response.use(
  // Every response is { success, data, message } — hand callers the envelope.
  (response) => response.data,
  (error) => {
    const status = error.response?.status ?? 0
    const body = error.response?.data ?? {}
    const apiError = new ApiRequestError({
      status,
      code: body.code ?? (status ? 'HTTP_ERROR' : 'NETWORK_ERROR'),
      message:
        body.message ??
        (status ? 'Something went wrong. Please try again.' : "Can't reach the server. Check your connection."),
      fieldErrors: body.fieldErrors,
    })

    const url = error.config?.url ?? ''
    if (status === 401 && !SESSION_CHECK_URLS.some((path) => url.startsWith(path))) handleSessionLost(apiError)

    return Promise.reject(apiError)
  }
)
