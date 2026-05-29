import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { logoutUser } from '../../store/slices/authSlice'
import { Menu, X, User, LogOut, ChevronDown } from 'lucide-react'

export default function Header({ transparent = false }) {
  const dispatch  = useDispatch()
  const navigate  = useNavigate()
  const { user, token } = useSelector(s => s.auth)
  const [scrolled,    setScrolled]    = useState(false)
  const [mobileOpen,  setMobileOpen]  = useState(false)
  const [dropOpen,    setDropOpen]    = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const handleLogout = async () => {
    await dispatch(logoutUser())
    navigate('/')
  }

  const dashboardPath = () => {
    if (!user) return '/login'
    if (user.role === 'admin')  return '/admin'
    if (user.role === 'agent')  return '/agent'
    return '/client'
  }

  const bg = transparent && !scrolled && !mobileOpen
    ? 'bg-transparent'
    : 'bg-white shadow-sm'

  const textColor = transparent && !scrolled && !mobileOpen
    ? 'text-white'
    : 'text-primary'

  return (
    <header className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${bg}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className={`font-display font-bold text-xl ${textColor}`}>
            Trip<span className="text-secondary">ify</span>
          </Link>

          {/* Nav desktop */}
          <nav className="hidden md:flex items-center gap-8">
            <Link to="/forfaits" className={`text-sm font-medium hover:text-secondary transition-colors ${textColor}`}>
              Forfaits
            </Link>
            <Link to="/client/sur-mesure" className={`text-sm font-medium hover:text-secondary transition-colors ${textColor}`}>
              Sur mesure
            </Link>
          </nav>

          {/* Actions */}
          <div className="hidden md:flex items-center gap-3">
            {token && user ? (
              <div className="relative">
                <button
                  onClick={() => setDropOpen(o => !o)}
                  className={`flex items-center gap-2 text-sm font-medium hover:text-secondary transition-colors ${textColor}`}
                >
                  <div className="w-8 h-8 bg-secondary/20 rounded-full flex items-center justify-center text-secondary font-bold text-xs">
                    {user.name?.charAt(0).toUpperCase()}
                  </div>
                  {user.name?.split(' ')[0]}
                  <ChevronDown size={14} />
                </button>
                {dropOpen && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-50">
                    <Link
                      to={dashboardPath()}
                      onClick={() => setDropOpen(false)}
                      className="flex items-center gap-2 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <User size={15} /> Mon espace
                    </Link>
                    <button
                      onClick={() => { setDropOpen(false); handleLogout() }}
                      className="w-full flex items-center gap-2 px-4 py-3 text-sm text-danger hover:bg-red-50"
                    >
                      <LogOut size={15} /> Déconnexion
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link to="/login"    className={`text-sm font-medium hover:text-secondary transition-colors ${textColor}`}>Connexion</Link>
                <Link to="/register" className="btn-primary text-xs px-4 py-2">S'inscrire</Link>
              </>
            )}
          </div>

          {/* Mobile toggle */}
          <button
            className={`md:hidden p-2 ${textColor}`}
            onClick={() => setMobileOpen(o => !o)}
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 py-4 space-y-3">
          <Link to="/forfaits"          onClick={() => setMobileOpen(false)} className="block text-sm font-medium text-gray-700 py-2">Forfaits</Link>
          <Link to="/client/sur-mesure" onClick={() => setMobileOpen(false)} className="block text-sm font-medium text-gray-700 py-2">Sur mesure</Link>
          {token && user ? (
            <>
              <Link to={dashboardPath()} onClick={() => setMobileOpen(false)} className="block text-sm font-medium text-secondary py-2">Mon espace</Link>
              <button onClick={handleLogout} className="block text-sm font-medium text-danger py-2">Déconnexion</button>
            </>
          ) : (
            <>
              <Link to="/login"    onClick={() => setMobileOpen(false)} className="block text-sm font-medium text-gray-700 py-2">Connexion</Link>
              <Link to="/register" onClick={() => setMobileOpen(false)} className="block text-sm font-medium text-secondary py-2">S'inscrire</Link>
            </>
          )}
        </div>
      )}
    </header>
  )
}
