import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  HiOutlineHome, HiOutlineWallet, HiOutlineCreditCard, HiOutlineIdentification,
  HiOutlineBell, HiOutlineArrowRightOnRectangle, HiOutlineCog6Tooth,
  HiOutlineUsers, HiOutlineDocumentChartBar, HiOutlineClipboardDocumentList,
  HiOutlineShieldCheck, HiOutlineBanknotes, HiOutlineScale,
  HiOutlineChartBarSquare, HiOutlineBuildingOffice2, HiOutlineCommandLine,
} from 'react-icons/hi2'

const userNav = [
  { to: '/',            icon: HiOutlineHome,          label: 'Dashboard' },
  { to: '/wallet',      icon: HiOutlineWallet,        label: 'Wallet' },
  { to: '/payments',    icon: HiOutlineCreditCard,    label: 'Payments' },
  { to: '/transactions',icon: HiOutlineClipboardDocumentList, label: 'Transactions' },
  { to: '/virtual-accounts', icon: HiOutlineBanknotes, label: 'Virtual Accounts' },
  { to: '/kyc',         icon: HiOutlineIdentification,label: 'KYC' },
  { to: '/fees',        icon: HiOutlineScale,         label: 'Fee Preview' },
  { to: '/notifications', icon: HiOutlineBell,        label: 'Notifications' },
  { to: '/business',    icon: HiOutlineBuildingOffice2, label: 'Business' },
  { to: '/developer',   icon: HiOutlineCommandLine,    label: 'Developer' },
]

const adminNav = [
  { to: '/admin/users',        icon: HiOutlineUsers,              label: 'Users' },
  { to: '/admin/transactions', icon: HiOutlineDocumentChartBar,   label: 'Transactions' },
  { to: '/admin/kyc',          icon: HiOutlineShieldCheck,        label: 'KYC Review' },
  { to: '/admin/settings',     icon: HiOutlineCog6Tooth,          label: 'Settings' },
  { to: '/admin/limits',       icon: HiOutlineScale,              label: 'Limits' },
  { to: '/admin/audit-logs',   icon: HiOutlineClipboardDocumentList, label: 'Audit Logs' },
  { to: '/admin/wallet-fund',  icon: HiOutlineBanknotes,          label: 'Fund Wallet' },
  { to: '/admin/reports',      icon: HiOutlineChartBarSquare,     label: 'Reports' },
  { to: '/admin/businesses',   icon: HiOutlineBuildingOffice2,    label: 'Businesses' },
]

function SideLink({ to, icon: Icon, label }) {
  return (
    <NavLink
      to={to}
      end={to === '/'}
      className={({ isActive }) =>
        `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
          isActive
            ? 'bg-indigo-600/20 text-indigo-400 font-medium'
            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
        }`
      }
    >
      <Icon className="w-5 h-5 shrink-0" />
      <span>{label}</span>
    </NavLink>
  )
}

export default function Layout() {
  const { user, logout, isAdmin } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col shrink-0">
        <div className="px-5 py-5 border-b border-slate-800">
          <h1 className="text-lg font-bold text-white tracking-tight">Topify Gateway</h1>
          <span className="text-[0.65rem] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full">
            Sandbox
          </span>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {userNav.map((n) => <SideLink key={n.to} {...n} />)}

          {isAdmin && (
            <>
              <div className="pt-4 pb-1 px-3">
                <span className="text-[0.65rem] font-bold uppercase tracking-widest text-slate-600">
                  Admin
                </span>
              </div>
              {adminNav.map((n) => <SideLink key={n.to} {...n} />)}
            </>
          )}
        </nav>

        <div className="p-3 border-t border-slate-800">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-8 h-8 rounded-full bg-indigo-600/30 flex items-center justify-center text-indigo-400 font-bold text-sm">
              {user?.name?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-200 truncate">{user?.name}</p>
              <p className="text-xs text-slate-500 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full mt-2 flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
          >
            <HiOutlineArrowRightOnRectangle className="w-5 h-5" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto bg-slate-950">
        <div className="max-w-6xl mx-auto p-6">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
