import { useState, useEffect } from 'react';
import api from '../../lib/api';
import { formatKobo, formatDate } from '../../lib/utils';
import toast from 'react-hot-toast';

export default function Reports() {
  const [tab, setTab] = useState('summary');
  const [summary, setSummary] = useState(null);
  const [volume, setVolume] = useState(null);
  const [revenue, setRevenue] = useState(null);
  const [topUsers, setTopUsers] = useState(null);
  const [loading, setLoading] = useState(false);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [type, setType] = useState('');

  const fetchSummary = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/admin/reports/summary');
      setSummary(data.data);
    } catch { toast.error('Failed to load summary'); }
    setLoading(false);
  };

  const fetchVolume = async () => {
    setLoading(true);
    try {
      const params = {};
      if (from) params.from = from;
      if (to) params.to = to;
      if (type) params.type = type;
      const { data } = await api.get('/admin/reports/volume', { params });
      setVolume(data.data);
    } catch { toast.error('Failed to load volume'); }
    setLoading(false);
  };

  const fetchRevenue = async () => {
    setLoading(true);
    try {
      const params = {};
      if (from) params.from = from;
      if (to) params.to = to;
      const { data } = await api.get('/admin/reports/revenue', { params });
      setRevenue(data.data);
    } catch { toast.error('Failed to load revenue'); }
    setLoading(false);
  };

  const fetchTopUsers = async () => {
    setLoading(true);
    try {
      const params = {};
      if (from) params.from = from;
      if (to) params.to = to;
      const { data } = await api.get('/admin/reports/top-users', { params });
      setTopUsers(data.data);
    } catch { toast.error('Failed to load top users'); }
    setLoading(false);
  };

  useEffect(() => {
    if (tab === 'summary') fetchSummary();
    if (tab === 'volume') fetchVolume();
    if (tab === 'revenue') fetchRevenue();
    if (tab === 'topUsers') fetchTopUsers();
  }, [tab]);

  const tabs = [
    { key: 'summary', label: 'Summary' },
    { key: 'volume', label: 'Volume' },
    { key: 'revenue', label: 'Revenue' },
    { key: 'topUsers', label: 'Top Users' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Reports</h1>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              tab === t.key
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Date Filters (for volume, revenue, topUsers) */}
      {tab !== 'summary' && (
        <div className="flex flex-wrap gap-3 mb-6 items-end">
          <div>
            <label className="block text-xs text-gray-400 mb-1">From</label>
            <input type="date" value={from} onChange={e => setFrom(e.target.value)}
              className="bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">To</label>
            <input type="date" value={to} onChange={e => setTo(e.target.value)}
              className="bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm" />
          </div>
          {tab === 'volume' && (
            <div>
              <label className="block text-xs text-gray-400 mb-1">Type</label>
              <select value={type} onChange={e => setType(e.target.value)}
                className="bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm">
                <option value="">All</option>
                <option value="transfer">Transfer</option>
                <option value="card_payment">Card Payment</option>
                <option value="funding">Funding</option>
                <option value="credit">Credit</option>
              </select>
            </div>
          )}
          <button onClick={() => {
            if (tab === 'volume') fetchVolume();
            if (tab === 'revenue') fetchRevenue();
            if (tab === 'topUsers') fetchTopUsers();
          }} className="bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded text-sm">
            Apply
          </button>
        </div>
      )}

      {loading && <p className="text-gray-400">Loading...</p>}

      {/* ── Summary Tab ── */}
      {tab === 'summary' && summary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total Users" value={summary.users.total} sub={`${summary.users.verified} verified`} />
          <StatCard title="Wallets" value={summary.wallets.total} sub={`Balance: ${formatKobo(summary.wallets.total_balance)}`} />
          <StatCard title="Transactions" value={summary.transactions.total}
            sub={`${summary.transactions.success} success / ${summary.transactions.failed} failed / ${summary.transactions.pending} pending`} />
          <StatCard title="Revenue" value={formatKobo(summary.revenue.total_profit)}
            sub={`Volume: ${formatKobo(summary.revenue.total_volume)} | Fees: ${formatKobo(summary.revenue.total_fees)}`} />
        </div>
      )}

      {/* ── Volume Tab ── */}
      {tab === 'volume' && volume && (
        <div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <StatCard title="Total Txns" value={volume.totals.count} />
            <StatCard title="Volume" value={formatKobo(volume.totals.volume)} />
            <StatCard title="Fees" value={formatKobo(volume.totals.fees)} />
            <StatCard title="Profit" value={formatKobo(volume.totals.profit)} />
          </div>
          <div className="bg-gray-800 rounded-xl overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-700/50">
                <tr>
                  <th className="text-left p-3">Date</th>
                  <th className="text-right p-3">Count</th>
                  <th className="text-right p-3">Volume</th>
                  <th className="text-right p-3">Fees</th>
                  <th className="text-right p-3">Profit</th>
                </tr>
              </thead>
              <tbody>
                {volume.days.map(day => (
                  <tr key={day.date} className="border-t border-gray-700">
                    <td className="p-3">{day.date}</td>
                    <td className="p-3 text-right">{day.count}</td>
                    <td className="p-3 text-right">{formatKobo(day.volume)}</td>
                    <td className="p-3 text-right">{formatKobo(day.fees)}</td>
                    <td className="p-3 text-right">{formatKobo(day.profit)}</td>
                  </tr>
                ))}
                {volume.days.length === 0 && (
                  <tr><td colSpan="5" className="p-6 text-center text-gray-500">No data for this range</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Revenue Tab ── */}
      {tab === 'revenue' && revenue && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold mb-3">By Type</h3>
            <div className="bg-gray-800 rounded-xl overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-700/50">
                  <tr>
                    <th className="text-left p-3">Type</th>
                    <th className="text-right p-3">Count</th>
                    <th className="text-right p-3">Volume</th>
                    <th className="text-right p-3">Fees</th>
                    <th className="text-right p-3">Profit</th>
                  </tr>
                </thead>
                <tbody>
                  {revenue.by_type.map(row => (
                    <tr key={row.type} className="border-t border-gray-700">
                      <td className="p-3 capitalize">{row.type}</td>
                      <td className="p-3 text-right">{row.count}</td>
                      <td className="p-3 text-right">{formatKobo(row.volume)}</td>
                      <td className="p-3 text-right">{formatKobo(row.fees)}</td>
                      <td className="p-3 text-right">{formatKobo(row.profit)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-3">By Provider</h3>
            <div className="bg-gray-800 rounded-xl overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-700/50">
                  <tr>
                    <th className="text-left p-3">Provider</th>
                    <th className="text-right p-3">Count</th>
                    <th className="text-right p-3">Volume</th>
                    <th className="text-right p-3">Fees</th>
                    <th className="text-right p-3">Profit</th>
                  </tr>
                </thead>
                <tbody>
                  {revenue.by_provider.map(row => (
                    <tr key={row.provider} className="border-t border-gray-700">
                      <td className="p-3 capitalize">{row.provider}</td>
                      <td className="p-3 text-right">{row.count}</td>
                      <td className="p-3 text-right">{formatKobo(row.volume)}</td>
                      <td className="p-3 text-right">{formatKobo(row.fees)}</td>
                      <td className="p-3 text-right">{formatKobo(row.profit)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── Top Users Tab ── */}
      {tab === 'topUsers' && topUsers && (
        <div className="bg-gray-800 rounded-xl overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-700/50">
              <tr>
                <th className="text-left p-3">#</th>
                <th className="text-left p-3">User</th>
                <th className="text-right p-3">Transactions</th>
                <th className="text-right p-3">Volume</th>
                <th className="text-right p-3">Fees</th>
              </tr>
            </thead>
            <tbody>
              {topUsers.users.map((row, i) => (
                <tr key={row.user?.id || i} className="border-t border-gray-700">
                  <td className="p-3">{i + 1}</td>
                  <td className="p-3">
                    <div className="font-medium">{row.user?.name}</div>
                    <div className="text-xs text-gray-400">{row.user?.email}</div>
                  </td>
                  <td className="p-3 text-right">{row.transaction_count}</td>
                  <td className="p-3 text-right">{formatKobo(row.total_volume)}</td>
                  <td className="p-3 text-right">{formatKobo(row.total_fees)}</td>
                </tr>
              ))}
              {topUsers.users.length === 0 && (
                <tr><td colSpan="5" className="p-6 text-center text-gray-500">No data</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function StatCard({ title, value, sub }) {
  return (
    <div className="bg-gray-800 rounded-xl p-5">
      <p className="text-xs text-gray-400 uppercase tracking-wider">{title}</p>
      <p className="text-2xl font-bold mt-1">{value}</p>
      {sub && <p className="text-xs text-gray-500 mt-1">{sub}</p>}
    </div>
  );
}
