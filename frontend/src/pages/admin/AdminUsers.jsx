import { useState, useEffect } from 'react'
import { fetchUsersAdmin, deleteUserAdmin } from '@/services/api'
import { useAuth } from '@/context/AuthContext'
import PageLoader from '@/components/ui/PageLoader'

export default function AdminUsers() {
  const { user: currentUser } = useAuth()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const loadUsers = async () => {
    try {
      setLoading(true)
      const data = await fetchUsersAdmin()
      setUsers(data || [])
    } catch (err) {
      setError(err.message || 'Failed to fetch users')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadUsers()
  }, [])

  const handleDelete = async (id, email) => {
    if (!window.confirm(`Are you sure you want to delete user: ${email}?`)) {
      return
    }

    try {
      await deleteUserAdmin(id)
      setSuccess(`User ${email} deleted successfully.`)
      setUsers(users.filter((u) => u._id !== id))
    } catch (err) {
      setError(err.message || 'Failed to delete user')
    }
  }

  if (loading) return <PageLoader />

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Users Management</h1>
          <p className="text-xs text-slate-400">View and manage registered user accounts</p>
        </div>
        <button
          onClick={loadUsers}
          className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 self-start sm:self-auto"
        >
          Refresh List
        </button>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-300">
          {success}
        </div>
      )}

      <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 shadow-xl overflow-hidden">
        {users.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-sm">
            No users found in database.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="border-b border-slate-800 bg-slate-950/60 text-slate-400 uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3.5">Name</th>
                  <th className="px-4 py-3.5">Email</th>
                  <th className="px-4 py-3.5">Role</th>
                  <th className="px-4 py-3.5">Registered</th>
                  <th className="px-4 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {users.map((u) => {
                  const isCurrent = u._id === currentUser?._id || u.email === currentUser?.email
                  return (
                    <tr key={u._id} className="hover:bg-slate-800/30">
                      <td className="px-4 py-3.5 font-medium text-white flex items-center gap-2">
                        {u.name}
                        {isCurrent && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-400">
                            You
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-slate-400">{u.email}</td>
                      <td className="px-4 py-3.5">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${
                            u.role === 'admin'
                              ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                              : 'bg-slate-800 text-slate-300 border border-slate-700'
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-slate-400">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        {!isCurrent && (
                          <button
                            onClick={() => handleDelete(u._id, u.email)}
                            className="px-3 py-1 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 font-semibold transition-colors"
                          >
                            Delete
                          </button>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
