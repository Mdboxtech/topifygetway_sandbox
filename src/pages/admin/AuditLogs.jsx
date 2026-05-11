import { useEffect, useState } from 'react'
import api from '../../lib/api'
import { formatDate } from '../../lib/utils'

export default function AdminAuditLogs() {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState({ action: '', actor_id: '' })

  useEffect(() => { loadLogs() }, [])

  const loadLogs = (params = {}) => {
    setLoading(true)
    const query = new URLSearchParams(Object.fromEntries(Object.entries({ ...filter, ...params }).filter(([_, v]) => v))).toString()
    api.get(`/admin/audit-logs${query ? '?' + query : ''}`).then(({ data }) => {
      setLogs(data.data?.data || data.data || [])
    }).catch(() => {}).finally(() => setLoading(false))
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Audit Logs</h1>
        <p className="text-sm text-slate-500 mt-1">System-wide activity trail</p>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-4">
        <input type="text" placeholder="Filter by action..." value={filter.action}
          onChange={(e) => setFilter({ ...filter, action: e.target.value })}
          onKeyDown={(e) => e.key === 'Enter' && loadLogs()}
          className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm w-48" />
        <input type="number" placeholder="Actor ID" value={filter.actor_id}
          onChange={(e) => setFilter({ ...filter, actor_id: e.target.value })}
          onKeyDown={(e) => e.key === 'Enter' && loadLogs()}
          className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm w-32" />
        <button onClick={() => loadLogs()}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg">
          Filter
        </button>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-32"><div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" /></div>
        ) : logs.length === 0 ? (
          <p className="px-5 py-8 text-center text-slate-600 text-sm">No audit logs found</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-slate-600 uppercase">
                <th className="px-5 py-3">Action</th>
                <th className="px-5 py-3">Actor</th>
                <th className="px-5 py-3">Target</th>
                <th className="px-5 py-3">Details</th>
                <th className="px-5 py-3">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {logs.map((log, i) => (
                <tr key={log.id || i} className="hover:bg-slate-800/50">
                  <td className="px-5 py-3">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400">{log.action}</span>
                  </td>
                  <td className="px-5 py-3 text-slate-400 text-xs">{log.actor?.name || log.actor_type || 'System'}</td>
                  <td className="px-5 py-3 text-slate-400 text-xs font-mono">{log.auditable_type?.split('\\').pop()} #{log.auditable_id}</td>
                  <td className="px-5 py-3 text-slate-500 text-xs max-w-[200px] truncate">
                    {log.description || JSON.stringify(log.metadata || log.properties || '').substring(0, 60)}
                  </td>
                  <td className="px-5 py-3 text-slate-500 text-xs">{formatDate(log.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
