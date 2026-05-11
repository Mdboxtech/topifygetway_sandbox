import { useEffect, useState } from 'react'
import api from '../../lib/api'
import toast, { Toaster } from 'react-hot-toast'

export default function AdminSettings() {
  const [settings, setSettings] = useState({})
  const [loading, setLoading] = useState(true)
  const [editKey, setEditKey] = useState(null)
  const [editValue, setEditValue] = useState('')

  useEffect(() => {
    api.get('/admin/settings').then(({ data }) => {
      setSettings(data.data || {})
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const handleUpdate = async (group, key) => {
    try {
      const { data } = await api.put(`/admin/settings/${group}/${key}`, { value: editValue })
      if (data.status) {
        toast.success('Updated')
        setEditKey(null)
        // Refresh
        const res = await api.get('/admin/settings')
        setSettings(res.data.data || {})
      } else toast.error(data.message)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed')
    }
  }

  const handleFlushCache = async () => {
    try {
      const { data } = await api.post('/admin/settings/cache/flush')
      if (data.status) toast.success('Cache flushed')
      else toast.error(data.message)
    } catch (err) { toast.error(err.response?.data?.message || 'Failed') }
  }

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" /></div>

  return (
    <div>
      <Toaster position="top-right" />
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Settings</h1>
          <p className="text-sm text-slate-500 mt-1">Manage system configuration</p>
        </div>
        <button onClick={handleFlushCache}
          className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-sm font-medium rounded-lg transition-colors">
          Flush Cache
        </button>
      </div>

      {Object.entries(settings).length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center">
          <p className="text-slate-500">No settings configured</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(settings).map(([group, items]) => (
            <div key={group} className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
              <div className="px-5 py-3 border-b border-slate-800">
                <h3 className="text-sm font-bold uppercase tracking-wider text-indigo-400">{group}</h3>
              </div>
              <div className="divide-y divide-slate-800">
                {(Array.isArray(items) ? items : Object.entries(items).map(([k, v]) => ({ key: k, value: v }))).map((item) => {
                  const itemKey = item.key || item.name
                  const fullKey = `${group}.${itemKey}`
                  return (
                    <div key={itemKey} className="px-5 py-3 flex items-center justify-between">
                      <div className="flex-1">
                        <p className="text-sm text-white">{itemKey}</p>
                        {editKey === fullKey ? (
                          <div className="flex gap-2 mt-2">
                            <input type="text" value={editValue} onChange={(e) => setEditValue(e.target.value)}
                              className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm flex-1" />
                            <button onClick={() => handleUpdate(group, itemKey)}
                              className="px-3 py-1.5 bg-indigo-600 text-white text-xs rounded-lg">Save</button>
                            <button onClick={() => setEditKey(null)}
                              className="px-3 py-1.5 bg-slate-700 text-slate-300 text-xs rounded-lg">Cancel</button>
                          </div>
                        ) : (
                          <p className="text-xs text-slate-500 font-mono mt-0.5">{String(item.value ?? '')}</p>
                        )}
                      </div>
                      {editKey !== fullKey && (
                        <button onClick={() => { setEditKey(fullKey); setEditValue(String(item.value ?? '')) }}
                          className="text-xs text-indigo-400 hover:text-indigo-300 ml-3">Edit</button>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
