const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

function getAuthHeader() {
  const token = localStorage.getItem('token') || localStorage.getItem('adminToken')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

// --- Auth APIs ---
export async function loginUser(email, password) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  const data = await res.json()
  if (!res.ok) {
    throw new Error(data.message || 'Failed to sign in')
  }
  if (data.token) {
    localStorage.setItem('token', data.token)
    if (data.user?.role === 'admin') {
      localStorage.setItem('adminToken', data.token)
    }
  }
  return data
}

export async function registerUser(userData) {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData),
  })
  const data = await res.json()
  if (!res.ok) {
    throw new Error(data.message || 'Registration failed')
  }
  if (data.token) {
    localStorage.setItem('token', data.token)
  }
  return data
}

export async function getUserProfile() {
  const res = await fetch(`${API_BASE}/auth/me`, {
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
  })
  const data = await res.json()
  if (!res.ok) {
    throw new Error(data.message || 'Session expired')
  }
  return data.user
}

export async function updateUserProfile(profileData) {
  const res = await fetch(`${API_BASE}/auth/profile`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
    body: JSON.stringify(profileData),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.message || 'Failed to update profile')
  return data
}

export async function changeUserPassword(passwordData) {
  const res = await fetch(`${API_BASE}/auth/change-password`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
    body: JSON.stringify(passwordData),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.message || 'Failed to change password')
  return data
}

// Aliases for admin backwards compatibility
export const adminLogin = loginUser
export const getAdminProfile = getUserProfile
export const updateAdminProfile = updateUserProfile
export const changeAdminPassword = changeUserPassword

// --- Admin User Management APIs ---
export async function fetchUsersAdmin() {
  const res = await fetch(`${API_BASE}/users`, {
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.message || 'Failed to fetch users')
  return data.users || []
}

export async function deleteUserAdmin(id) {
  const res = await fetch(`${API_BASE}/users/${id}`, {
    method: 'DELETE',
    headers: {
      ...getAuthHeader(),
    },
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.message || 'Failed to delete user')
  return data
}

// --- Health Check ---
export async function checkServerHealth() {
  try {
    const res = await fetch(`${API_BASE}/health`)
    return res.ok
  } catch {
    return false
  }
}
