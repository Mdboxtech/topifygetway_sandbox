import { useEffect, useState } from 'react'
import api from '../lib/api'
import toast, { Toaster } from 'react-hot-toast'

export default function VirtualAccounts() {
  const [accounts, setAccounts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showProvision, setShowProvision] = useState(false)
  const [provider, setProvider] = useState('palmpay')
  const [provisioning, setProvisioning] = useState(false)

  useEffect(() => {
    loadAccounts()
  }, [])

  const loadAccounts = () => {
    api.get('/virtual-accounts').then(({ data }) => {
      setAccounts(data.data?.data || data.data || [])
    }).catch(() => {}).finally(() => setLoading(false))
  }

  const handleProvision = async (e) => {
    e.preventDefault()
    setProvisioning(true)
    try {
      const { data } = await api.post('/virtual-accounts/provision', { provider })
      if (data.status) {
        toast.success(data.message)
        setShowProvision(false)
        loadAccounts()
      } else {
        toast.error(data.message)
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed')
    } finally { setProvisioning(false) }
  }

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" /></div>

  return (
    <div>
      <Toaster position="top-right" />
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Virtual Accounts</h1>
          <p className="text-sm text-slate-500 mt-1">Receive bank transfers via virtual accounts</p>
        </div>
        <button onClick={() => setShowProvision(!showProvision)}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors">
          Provision Account
        </button>
      </div>

      {showProvision && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 mb-6">
          <h3 className="text-lg font-semibold text-white mb-4">Provision Virtual Account</h3>
          <form onSubmit={handleProvision} className="flex gap-4 items-end">
            <div>
              <label className="block text-sm text-slate-400 mb-1">Provider</label>
              <select value={provider} onChange={(e) => setProvider(e.target.value)}
                className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-indigo-500">
                <option value="palmpay">PalmPay</option>
                <option value="ninepsb">9PSB</option>
                <option value="monnify">Monnify</option>
              </select>
            </div>
            <button type="submit" disabled={provisioning}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors">
              {provisioning ? 'Provisioning...' : 'Create'}
            </button>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {accounts.length === 0 ? (
          <p className="col-span-3 text-center text-slate-600 text-sm py-12">No virtual accounts provisioned yet</p>
        ) : accounts.map((acc, i) => (
          <div key={acc.id || i} className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">{acc.provider}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full ${
                acc.status === 'active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
              }`}>{acc.status}</span>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Bank</span>
                <span className="text-white">{acc.bank_name || acc.bank || '—'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Account No</span>
                <span className="text-white font-mono">{acc.account_number || '—'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Account Name</span>
                <span className="text-white text-xs">{acc.account_name || '—'}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
