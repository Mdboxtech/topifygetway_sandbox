import { useEffect, useState } from 'react'
import api from '../lib/api'
import toast from 'react-hot-toast'
import { HiOutlineEye, HiOutlineEyeSlash, HiOutlineClipboardDocument, HiOutlineArrowPath } from 'react-icons/hi2'

function CopyableKey({ label, value, hidden: isSecret }) {
  const [visible, setVisible] = useState(false)

  const copy = () => {
    navigator.clipboard.writeText(value)
    toast.success(`${label} copied!`)
  }

  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 min-w-0">
        <p className="text-xs text-slate-500 mb-1">{label}</p>
        <p className="text-sm font-mono text-white truncate">
          {isSecret && !visible ? '••••••••••••••••••••••••' : value}
        </p>
      </div>
      {isSecret && (
        <button onClick={() => setVisible(!visible)} className="p-1.5 text-slate-400 hover:text-white">
          {visible ? <HiOutlineEyeSlash className="w-4 h-4" /> : <HiOutlineEye className="w-4 h-4" />}
        </button>
      )}
      <button onClick={copy} className="p-1.5 text-slate-400 hover:text-indigo-400">
        <HiOutlineClipboardDocument className="w-4 h-4" />
      </button>
    </div>
  )
}

export default function Developer() {
  const [creds, setCreds] = useState(null)
  const [loading, setLoading] = useState(true)
  const [webhookUrl, setWebhookUrl] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => { loadCreds() }, [])

  const loadCreds = async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/developer')
      if (data.status) {
        setCreds(data.data)
        setWebhookUrl(data.data.webhook_url || '')
      }
    } catch {} finally { setLoading(false) }
  }

  const regenerateKeys = async (mode) => {
    if (!confirm(`Regenerate ${mode} keys? This will invalidate the current ${mode} keys.`)) return
    try {
      const { data } = await api.post('/developer/regenerate-keys', { mode })
      if (data.status) { toast.success(data.message); loadCreds() }
      else toast.error(data.message)
    } catch (err) { toast.error(err.response?.data?.message || 'Failed') }
  }

  const regenerateWebhook = async () => {
    if (!confirm('Regenerate webhook secret? Update your server accordingly.')) return
    try {
      const { data } = await api.post('/developer/regenerate-webhook')
      if (data.status) { toast.success(data.message); loadCreds() }
      else toast.error(data.message)
    } catch (err) { toast.error(err.response?.data?.message || 'Failed') }
  }

  const updateWebhook = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const { data } = await api.put('/developer/webhook', { webhook_url: webhookUrl })
      if (data.status) toast.success(data.message)
      else toast.error(data.message)
    } catch (err) { toast.error(err.response?.data?.message || 'Failed') }
    finally { setSaving(false) }
  }

  const switchMode = async (mode) => {
    try {
      const { data } = await api.put('/developer/mode', { mode })
      if (data.status) { toast.success(data.message); loadCreds() }
      else toast.error(data.message)
    } catch (err) { toast.error(err.response?.data?.message || 'Failed') }
  }

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" /></div>

  if (!creds) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-white mb-2">Developer</h1>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center">
          <p className="text-slate-400">Complete business verification to access API credentials.</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Developer</h1>
          <p className="text-sm text-slate-500 mt-1">API Keys & Webhook Configuration</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 mr-1">Mode:</span>
          {['test', 'live'].map((m) => (
            <button key={m} onClick={() => switchMode(m)}
              className={`px-3 py-1 text-xs font-semibold rounded-full transition-colors ${
                creds.mode === m
                  ? m === 'live' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                  : 'bg-slate-800 text-slate-500 hover:text-slate-300'
              }`}>
              {m.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Test Keys */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 mb-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-yellow-400">Test Keys</h3>
          <button onClick={() => regenerateKeys('test')}
            className="flex items-center gap-1 text-xs text-slate-400 hover:text-white">
            <HiOutlineArrowPath className="w-3.5 h-3.5" /> Regenerate
          </button>
        </div>
        <div className="space-y-4">
          <CopyableKey label="Test Public Key" value={creds.test_public_key} />
          <CopyableKey label="Test Secret Key" value={creds.test_secret_key} hidden />
        </div>
      </div>

      {/* Live Keys */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 mb-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-green-400">Live Keys</h3>
          <button onClick={() => regenerateKeys('live')}
            className="flex items-center gap-1 text-xs text-slate-400 hover:text-white">
            <HiOutlineArrowPath className="w-3.5 h-3.5" /> Regenerate
          </button>
        </div>
        <div className="space-y-4">
          <CopyableKey label="Live Public Key" value={creds.live_public_key} />
          <CopyableKey label="Live Secret Key" value={creds.live_secret_key} hidden />
        </div>
      </div>

      {/* Webhook */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">Webhook</h3>
          <button onClick={regenerateWebhook}
            className="flex items-center gap-1 text-xs text-slate-400 hover:text-white">
            <HiOutlineArrowPath className="w-3.5 h-3.5" /> Regenerate Secret
          </button>
        </div>
        <div className="mb-4">
          <CopyableKey label="Webhook Secret" value={creds.webhook_secret} hidden />
        </div>
        <form onSubmit={updateWebhook} className="flex gap-2">
          <input type="url" value={webhookUrl} placeholder="https://your-app.com/webhook"
            onChange={(e) => setWebhookUrl(e.target.value)}
            className="flex-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-indigo-500" />
          <button type="submit" disabled={saving}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors">
            {saving ? 'Saving...' : 'Save URL'}
          </button>
        </form>
      </div>
    </div>
  )
}
