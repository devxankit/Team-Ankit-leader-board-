import { http } from './api'

/** Read-only views every signed-in user can see. */
export const boardService = {
  leaderboard: (period) => http.get('/leaderboard', { params: { period } }).then((res) => res.data),
  activity: (limit = 40) => http.get('/activity', { params: { limit } }).then((res) => res.data.items),
  history: (memberId, page = 1) =>
    http.get(`/members/${memberId}/history`, { params: { page, limit: 20 } }).then((res) => res.data),
}
