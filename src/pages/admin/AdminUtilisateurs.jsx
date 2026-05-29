import React, { useEffect, useState } from 'react'
import api from '../../services/api'
import Loader from '../../components/common/Loader'
import Alert from '../../components/common/Alert'
import { Search, RefreshCw, User, Shield, Briefcase } from 'lucide-react'

const ROLE_CONFIG = {
  admin:  { label: 'Admin',  icon: Shield,    color: 'bg-purple-100 text-purple-700' },
  agent:  { label: 'Agent',  icon: Briefcase, color: 'bg-blue-100 text-blue-700'    },
  client: { label: 'Client', icon: User,      color: 'bg-gray-100 text-gray-600'    },
}

export default function AdminUtilisateurs() {
  const [users,   setUsers]   = useState([])
  const [loading, setLoading] = useState(true)
  const [alert,   setAlert]   = useState(null)
  const [search,  setSearch]  = useState('')
  const [roleFilter, setRoleFilter] = useState('')

  const load = async () => {
    setLoading(true)
    try {
      // Récupérer via l'endpoint réservations pour extraire les users uniques
      // (à remplacer par /admin/users si l'endpoint existe)
      const res = await api.get('/admin/reservations')
      const reservations = res.data?.data || res.data || []
      const usersMap = {}
      reservations.forEach(r => {
        const u = r.client || r.user
        if (u && !usersMap[u.id]) usersMap[u.id] = { ...u, reservations: 0 }
        if (u) usersMap[u.id].reservations++
      })
      setUsers(Object.values(usersMap))
    } catch {
      setAlert({ type: 'error', message: 'Erreur de chargement des utilisateurs.' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const filtered = users.filter(u => {
    const matchSearch = !search ||
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase())
    const matchRole = !roleFilter || u.role === roleFilter
    return matchSearch && matchRole
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="page-title">Utilisateurs</h1>
          <p className="text-sm text-gray-500">{users.length} utilisateur{users.length !== 1 ? 's' : ''}</p>
        </div>
        <button
          onClick={load}
          className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-500 transition-colors"
        >
          <RefreshCw size={16} />
        </button>
      </div>

      {alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}

      {/* Filtres */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text" placeholder="Rechercher…" value={search}
            onChange={e => setSearch(e.target.value)}
            className="input-field pl-10 py-2"
          />
        </div>
        <select
          value={roleFilter}
          onChange={e => setRoleFilter(e.target.value)}
          className="input-field py-2 w-auto"
        >
          <option value="">Tous les rôles</option>
          <option value="admin">Admin</option>
          <option value="agent">Agent</option>
          <option value="client">Client</option>
        </select>
      </div>

      {loading ? (
        <Loader />
      ) : filtered.length === 0 ? (
        <div className="card p-12 text-center text-gray-400">Aucun utilisateur trouvé.</div>
      ) : (
        <div className="space-y-2">
          {filtered.map(u => {
            const roleConf = ROLE_CONFIG[u.role] || ROLE_CONFIG.client
            const RoleIcon = roleConf.icon
            return (
              <div key={u.id} className="card p-4 flex items-center gap-4">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold text-sm flex-shrink-0">
                  {u.name?.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-800 truncate">{u.name}</p>
                  <p className="text-xs text-gray-400 truncate">{u.email}</p>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${roleConf.color}`}>
                    <RoleIcon size={11} /> {roleConf.label}
                  </span>
                  {u.reservations > 0 && (
                    <span className="text-xs text-gray-400">
                      {u.reservations} rés.
                    </span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
