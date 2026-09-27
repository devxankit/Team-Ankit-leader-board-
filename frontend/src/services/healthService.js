import { api } from './api'

// Simple example service call used by the Home page to prove the
// frontend <-> backend wiring works end to end.
export const getHealth = async () => {
  const { data } = await api.get('/health')
  return data
}
