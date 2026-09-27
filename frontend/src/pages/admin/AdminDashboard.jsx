import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { fetchUsersAdmin, checkServerHealth } from '@/services/api'
import { useAuth } from '@/context/AuthContext'
import PageLoader from '@/components/ui/PageLoader'

export default function AdminDashboard() {
  const { user } = useAuth()
  const [users, setUsers] = useState([])
  const [serverOnline, setServerOnline] = useState(true)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      try {
        const [usersData, isOnline] = await Promise.all([
          fetchUsersAdmin().catch(() => []),
          checkServerHealth(),
        ])
        setUsers(usersData || [])
        setServerOnline(isOnline)
      } catch (err) {
        console.error('Failed to load dashboard:', err.message)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  if (loading) return <PageLoader />

  const adminCount = users.filter((u) => u.role === 'admin').length
  const regularUserCount = users.filter((u) => u.role !== 'admin').length

  return (
    <div className="space-y-8">
      {/* Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-r from-indigo-950/60 via-slate-900 to-slate-950 p-6 sm:p-8">
        <div className="relative z-10 max-w-2xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-300 mb-3">
            <span className={`h-2 w-2 rounded-full ${serverOnline ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`} />
            {serverOnline ? 'Backend API Active' : 'Backend Disconnected'}
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">
            Welcome back, {user?.name || 'Admin'}
          </h1>
          <p className="mt-2 text-sm text-slate-300 leading-relaxed">
            This is your ready-to-use boilerplate admin console. Manage accounts, inspect database metrics, and expand features for any new project.
          </p>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Total Users
            <span className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-bold text-sm">
              👥
            </span>
          </div>
          <p className="mt-3 text-3xl font-bold text-white">{users.length}</p>
          <p className="mt-1 text-xs text-slate-400">Registered across the system</p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Administrators
            <span className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center font-bold text-sm">
              🛡️
            </span>
          </div>
          <p className="mt-3 text-3xl font-bold text-white">{adminCount}</p>
          <p className="mt-1 text-xs text-slate-400">Privileged access roles</p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Standard Members
            <span className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold text-sm">
              👤
            </span>
          </div>
          <p className="mt-3 text-3xl font-bold text-white">{regularUserCount}</p>
          <p className="mt-1 text-xs text-slate-400">User accounts</p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400 uppercase tracking-wider">
            System Health
            <span className="w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center font-bold text-sm">
              ⚡
            </span>
          </div>
          <div className="mt-2 text-xs">
            <span className={`font-semibold ${serverOnline ? 'text-emerald-400' : 'text-rose-400'}`}>
              {serverOnline ? 'All Systems Operational' : 'API Unreachable'}
            </span>
          </div>
          <Link
            to="/admin/users"
            className="mt-3 inline-flex items-center justify-between text-xs font-semibold text-indigo-400 hover:text-indigo-300"
          >
            <span>Manage Users →</span>
          </Link>
        </div>
      </div>

      {/* Recent Users Table */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold text-white">Registered Users</h2>
            <p className="text-xs text-slate-400">Overview of all platform accounts</p>
          </div>
          <Link
            to="/admin/users"
            className="text-xs font-semibold text-indigo-400 hover:text-indigo-300"
          >
            View all ({users.length}) →
          </Link>
        </div>

        {users.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-800 p-8 text-center text-xs text-slate-400">
            No users registered yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="border-b border-slate-800 bg-slate-950/50 text-slate-400 uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {users.slice(0, 5).map((u) => (
                  <tr key={u._id} className="hover:bg-slate-800/30">
                    <td className="px-4 py-3 font-medium text-white">{u.name}</td>
                    <td className="px-4 py-3 text-slate-400">{u.email}</td>
                    <td className="px-4 py-3">
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
                    <td className="px-4 py-3 text-slate-400">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
