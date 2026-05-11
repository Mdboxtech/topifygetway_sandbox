import { useEffect, useState } from 'react'
import api from '../lib/api'
import toast, { Toaster } from 'react-hot-toast'

export default function Notifications() {
  const [prefs, setPrefs] = useState({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    api.get('/notifications/preferences').then(({ data }) => {
      setPrefs(data.data || {})
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const toggle = (key) => {
    setPrefs({ ...prefs, [key]: !prefs[key] })
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const { data } = await api.patch('/notifications/preferences', prefs)
      if (data.status) toast.success('Preferences saved')
      else toast.error(data.message)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed')
    } finally { setSaving(false) }
  }

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" /></div>

  const prefLabels = {
    email_transaction: 'Email — Transaction alerts',
    email_login: 'Email — Login notifications',
    email_kyc: 'Email — KYC updates',
    sms_transaction: 'SMS — Transaction alerts',
    sms_login: 'SMS — Login notifications',
    push_transaction: 'Push — Transaction alerts',
    push_marketing: 'Push — Marketing & offers',
  }

  return (
    <div>
      <Toaster position="top-right" />
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Notification Preferences</h1>
        <p className="text-sm text-slate-500 mt-1">Control which notifications you receive</p>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 max-w-lg">
        <div className="space-y-4">
          {Object.entries(prefs).length === 0 ? (
            Object.entries(prefLabels).map(([key, label]) => (
              <label key={key} className="flex items-center justify-between py-2 cursor-pointer">
                <span className="text-sm text-slate-300">{label}</span>
                <input type="checkbox" checked={prefs[key] || false} onChange={() => toggle(key)}
                  className="w-4 h-4 rounded border-slate-600 text-indigo-600 focus:ring-indigo-500" />
              </label>
            ))
          ) : (
            Object.entries(prefs).map(([key, val]) => (
              <label key={key} className="flex items-center justify-between py-2 cursor-pointer">
                <span className="text-sm text-slate-300">{prefLabels[key] || key.replace(/_/g, ' ')}</span>
                <input type="checkbox" checked={!!val} onChange={() => toggle(key)}
                  className="w-4 h-4 rounded border-slate-600 text-indigo-600 focus:ring-indigo-500" />
              </label>
            ))
          )}
        </div>
        <button onClick={handleSave} disabled={saving}
          className="mt-6 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors">
          {saving ? 'Saving...' : 'Save Preferences'}
        </button>
      </div>
    </div>
  )
}
