import React, { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { logoutUser } from '../../store/slices/authSlice'
import {
  LayoutDashboard, Map, MapPin, Hotel, Zap, Users, LogOut, Menu, Shield,
} from 'lucide-react'

/* NOTE : L'admin n'a PAS accès aux forfaits ni aux réservations.
   Ces fonctions sont gérées par les agents. */
const NAV = [
  { to: '/admin',              label: 'Dashboard',     icon: LayoutDashboard, end: true },
  { to: '/admin/sur-mesure',   label: 'Sur mesure',    icon: Map },
  { to: '/admin/destinations', label: 'Destinations',  icon: MapPin },
  { to: '/admin/hotels',       label: 'Hôtels',        icon: Hotel },
  { to: '/admin/activites',    label: 'Activités',     icon: Zap },
  { to: '/admin/utilisateurs', label: 'Utilisateurs',  icon: Users },
]

export default function AdminLayout() {
  const dispatch  = useDispatch()
  const navigate  = useNavigate()
  const { user }  = useSelector(s => s.auth)
  const [sideOpen, setSideOpen] = useState(false)

  const handleLogout = async () => {
    await dispatch(logoutUser())
    navigate('/login')
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-gray-100">
        <p className="font-display font-bold text-lg text-primary">
          Trip<span className="text-secondary">ify</span>
        </p>
        <div className="flex items-center gap-1 mt-1">
          <Shield size={11} className="text-purple-500" />
          <p className="text-xs text-purple-600 font-semibold">Administration</p>
        </div>
      </div>

      {/* User */}
      <div className="px-4 py-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-bold text-sm">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-800 truncate">{user?.name}</p>
            <p className="text-xs text-purple-600 font-medium">Administrateur</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {NAV.map(({ to, label, icon: Icon, end }) => (
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
            <Icon size={17} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
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
      {/* Sidebar desktop */}
      <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-gray-100 fixed h-full z-30">
        <SidebarContent />
      </aside>

      {/* Sidebar mobile */}
      {sideOpen && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          <div className="fixed inset-0 bg-black/40" onClick={() => setSideOpen(false)} />
          <aside className="relative w-64 bg-white h-full z-50 shadow-xl">
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 lg:ml-64">
        <div className="lg:hidden sticky top-0 z-20 bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3">
          <button onClick={() => setSideOpen(true)} className="p-1.5 rounded-lg hover:bg-gray-100">
            <Menu size={20} className="text-gray-600" />
          </button>
          <p className="font-display font-bold text-primary">Administration</p>
        </div>
        <main className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}