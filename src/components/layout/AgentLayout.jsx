import React, { useState, useEffect } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { logoutUser } from '../../store/slices/authSlice'
import { fetchUnreadCount } from '../../store/slices/notificationSlice'
import {
  LayoutDashboard, Package, Bell, Map, LogOut, Menu,
} from 'lucide-react'

const NAV = [
  { to: '/agent',              label: 'Tableau de bord',    icon: LayoutDashboard, end: true },
  { to: '/agent/forfaits',     label: 'Mes forfaits',        icon: Package },
  { to: '/agent/sur-mesure',   label: 'Sur mesure',          icon: Map },
  { to: '/agent/notifications',label: 'Notifications',       icon: Bell, badge: true },
]

export default function AgentLayout() {
  const dispatch  = useDispatch()
  const navigate  = useNavigate()
  const { user }  = useSelector(s => s.auth)
  const { unreadCount } = useSelector(s => s.notifications)
  const [sideOpen, setSideOpen] = useState(false)

  useEffect(() => { dispatch(fetchUnreadCount()) }, [dispatch])

  const handleLogout = async () => {
    await dispatch(logoutUser())
    navigate('/')
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="px-6 py-5 border-b border-gray-100">
        <p className="font-display font-bold text-lg text-primary">
          Trip<span className="text-secondary">ify</span>
        </p>
        <p className="text-xs text-secondary font-medium mt-0.5">Espace Agent</p>
      </div>

      <div className="px-4 py-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold text-sm">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-800 truncate">{user?.name}</p>
            <p className="text-xs text-secondary font-medium">Agent</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {NAV.map(({ to, label, icon: Icon, end, badge }) => (
          <NavLink
            key={to} to={to} end={end}
            onClick={() => setSideOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-secondary/10 text-secondary'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-primary'
              }`
            }
          >
            <Icon size={18} />
            <span className="flex-1">{label}</span>
            {badge && unreadCount > 0 && (
              <span className="w-5 h-5 bg-danger text-white text-xs rounded-full flex items-center justify-center font-bold">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="px-3 py-4 border-t border-gray-100">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-500 hover:bg-red-50 hover:text-danger transition-all"
        >
          <LogOut size={18} /> Déconnexion
        </button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen flex bg-surface">
      <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-gray-100 fixed h-full z-30">
        <SidebarContent />
      </aside>

      {sideOpen && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          <div className="fixed inset-0 bg-black/40" onClick={() => setSideOpen(false)} />
          <aside className="relative w-64 bg-white h-full z-50 shadow-xl">
            <SidebarContent />
          </aside>
        </div>
      )}

      <div className="flex-1 lg:ml-64">
        <div className="lg:hidden sticky top-0 z-20 bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3">
          <button onClick={() => setSideOpen(true)} className="p-1.5 rounded-lg hover:bg-gray-100">
            <Menu size={20} className="text-gray-600" />
          </button>
          <p className="font-display font-bold text-primary">Espace Agent</p>
        </div>
        <main className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
