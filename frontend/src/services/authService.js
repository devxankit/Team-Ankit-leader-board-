import { http } from './api'

export const authService = {
  me: () => http.get('/auth/me').then((res) => res.data.user),
  login: (email, password) => http.post('/auth/login', { email, password }).then((res) => res.data.user),
  logout: () => http.post('/auth/logout'),
  changePassword: (body) => http.post('/auth/change-password', body).then((res) => res.data.user),
}
