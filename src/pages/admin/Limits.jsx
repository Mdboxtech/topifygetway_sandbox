import { useState } from 'react'
import api from '../../lib/api'
import { formatKobo } from '../../lib/utils'
import toast, { Toaster } from 'react-hot-toast'

export default function AdminLimits() {
  const [userId, setUserId] = useState('')
  const [limits, setLimits] = useState(null)
  const [loading, setLoading] = useState(false)
  const [editForm, setEditForm] = useState({})
  const [saving, setSaving] = useState(false)

  const handleLookup = async (e) => {
    e.preventDefault()
    if (!userId) return
    setLoading(true)
    try {
      const { data } = await api.get(`/admin/limits/${userId}`)
      setLimits(data.data)
      setEditForm(data.data?.limits || data.data || {})
    } catch (err) {
      toast.error(err.response?.data?.message || 'User not found')
      setLimits(null)
    } finally { setLoading(false) }
  }

  const handleUpdate = async () => {
    setSaving(true)
    try {
      const { data } = await api.put(`/admin/limits/${userId}`, editForm)
      if (data.status) { toast.success('Limits updated'); handleLookup({ preventDefault: () => {} }) }
      else toast.error(data.message)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed')
    } finally { setSaving(false) }
  }

  const handleReset = async () => {
    if (!confirm('Reset limits to global defaults?')) return
    try {
      const { data } = await api.delete(`/admin/limits/${userId}`)
      if (data.status) { toast.success('Limits reset'); handleLookup({ preventDefault: () => {} }) }
      else toast.error(data.message)
    } catch (err) { toast.error(err.response?.data?.message || 'Failed') }
  }

  return (
    <div>
      <Toaster position="top-right" />
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Transaction Limits</h1>
        <p className="text-sm text-slate-500 mt-1">View and override per-user limits</p>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 mb-6">
        <form onSubmit={handleLookup} className="flex gap-3">
          <input type="number" value={userId} onChange={(e) => setUserId(e.target.value)}
            placeholder="User ID"
            className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm w-32" required />
          <button type="submit" disabled={loading}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg">
            {loading ? 'Loading...' : 'Lookup'}
          </button>
        </form>
      </div>

      {limits && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">User #{userId} Limits</h3>
            <button onClick={handleReset}
              className="px-3 py-1.5 bg-red-600/20 text-red-400 text-xs font-medium rounded-lg border border-red-600/30 hover:bg-red-600/30">
              Reset to Defaults
            </button>
          </div>

          <div className="space-y-4 max-w-md">
            {Object.entries(editForm).map(([key, val]) => (
              <div key={key}>
                <label className="block text-sm text-slate-400 mb-1">{key.replace(/_/g, ' ')}</label>
                <input type="number" value={val || ''}
                  onChange={(e) => setEditForm({ ...editForm, [key]: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm" />
                <p className="text-xs text-slate-600 mt-0.5">{formatKobo(val)} in Naira</p>
              </div>
            ))}
            <button onClick={handleUpdate} disabled={saving}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg">
              {saving ? 'Saving...' : 'Update Limits'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
