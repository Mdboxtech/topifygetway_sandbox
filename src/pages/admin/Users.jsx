import { useEffect, useState } from 'react'
import api from '../../lib/api'
import { formatDate } from '../../lib/utils'

export default function AdminUsers() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedUser, setSelectedUser] = useState(null)

  useEffect(() => {
    api.get('/admin/users').then(({ data }) => {
      setUsers(data.data?.data || data.data || [])
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const viewUser = async (id) => {
    try {
      const { data } = await api.get(`/admin/users/${id}`)
      setSelectedUser(data.data)
    } catch {}
  }

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" /></div>

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">User Management</h1>
        <p className="text-sm text-slate-500 mt-1">View and manage all users</p>
      </div>

      {/* Detail Modal */}
      {selectedUser && (
        <div className="bg-slate-900 border border-indigo-600/30 rounded-xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">{selectedUser.name}</h3>
            <button onClick={() => setSelectedUser(null)} className="text-sm text-slate-500 hover:text-slate-300">Close</button>
          </div>
          <pre className="bg-slate-800 rounded-lg p-4 text-xs text-slate-300 overflow-auto max-h-64">
            {JSON.stringify(selectedUser, null, 2)}
          </pre>
        </div>
      )}

      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-slate-600 uppercase">
              <th className="px-5 py-3">ID</th>
              <th className="px-5 py-3">Name</th>
              <th className="px-5 py-3">Email</th>
              <th className="px-5 py-3">Role</th>
              <th className="px-5 py-3">KYC</th>
              <th className="px-5 py-3">Joined</th>
              <th className="px-5 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-slate-800/50">
                <td className="px-5 py-3 text-slate-500">{u.id}</td>
                <td className="px-5 py-3 text-white">{u.name}</td>
                <td className="px-5 py-3 text-slate-400 text-xs">{u.email}</td>
                <td className="px-5 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    u.is_admin ? 'bg-purple-500/10 text-purple-400' : 'bg-slate-700/50 text-slate-400'
                  }`}>{u.is_admin ? 'Admin' : 'User'}</span>
                </td>
                <td className="px-5 py-3 capitalize text-xs text-slate-400">{u.kyc_status || u.kyc_tier || '—'}</td>
                <td className="px-5 py-3 text-slate-500 text-xs">{formatDate(u.created_at)}</td>
                <td className="px-5 py-3">
                  <button onClick={() => viewUser(u.id)}
                    className="text-xs text-indigo-400 hover:text-indigo-300">View</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
