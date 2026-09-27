import { http } from './api'

const compact = (params) =>
  Object.fromEntries(Object.entries(params).filter(([, value]) => value !== '' && value != null))

export const adminService = {
  members: (status = 'all') => http.get('/admin/members', { params: { status } }).then((res) => res.data.items),
  createMember: (body) => http.post('/admin/members', body).then((res) => res.data.member),
  updateMember: (id, body) => http.patch(`/admin/members/${id}`, body).then((res) => res.data.member),
  setMemberStatus: (id, isActive) =>
    http.patch(`/admin/members/${id}/status`, { isActive }).then((res) => res.data.member),

  rules: (status = 'active') => http.get('/admin/rules', { params: { status } }).then((res) => res.data.items),
  createRule: (body) => http.post('/admin/rules', body).then((res) => res.data.rule),
  updateRule: (id, body) => http.patch(`/admin/rules/${id}`, body).then((res) => res.data.rule),
  archiveRule: (id) => http.delete(`/admin/rules/${id}`).then((res) => res.data.rule),

  /** { memberIds, ruleId } or { memberIds, custom: { label, points } }, plus note. */
  applyPoints: (body) => http.post('/admin/points', body).then((res) => res.data),

  events: (filters) => http.get('/admin/events', { params: compact(filters) }).then((res) => res.data),
  voidEvent: (id) => http.patch(`/admin/events/${id}/void`).then((res) => res.data.event),
}
