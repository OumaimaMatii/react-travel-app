// src/pages/admin/AdminUtilisateurs.jsx
// Version finale — utilise la vraie route GET/POST/PUT/DELETE /admin/users
// (nécessite l'ajout du UserController côté backend)

import React, { useEffect, useState } from 'react'
import Loader from '../../components/common/Loader'
import Alert from '../../components/common/Alert'
import Modal from '../../components/common/Modal'
import Button from '../../components/common/Button'
import {
  Search, RefreshCw, User, Shield, Briefcase,
  Plus, Edit2, Trash2, Eye, EyeOff,
} from 'lucide-react'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

async function apiFetch(method, path, data = null) {
  const token = localStorage.getItem('token')
  const headers = { Authorization: `Bearer ${token}`, Accept: 'application/json' }
  if (data && !(data instanceof FormData)) headers['Content-Type'] = 'application/json'
  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: data ? (data instanceof FormData ? data : JSON.stringify(data)) : undefined,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw Object.assign(new Error(err.message || `Erreur ${res.status}`), { errors: err.errors })
  }
  return res.status === 204 ? null : res.json()
}

const ROLE_CONFIG = {
  admin:  { label: 'Admin',  icon: Shield,    color: 'bg-purple-100 text-purple-700' },
  agent:  { label: 'Agent',  icon: Briefcase, color: 'bg-blue-100 text-blue-700'    },
  client: { label: 'Client', icon: User,      color: 'bg-gray-100 text-gray-600'    },
}

const EMPTY_FORM = { name: '', email: '', password: '', role: 'agent' }

export default function AdminUtilisateurs() {
  const [users,       setUsers]       = useState([])
  const [stats,       setStats]       = useState({ total: 0, admins: 0, agents: 0, clients: 0 })
  const [loading,     setLoading]     = useState(true)
  const [alert,       setAlert]       = useState(null)
  const [search,      setSearch]      = useState('')
  const [roleFilter,  setRoleFilter]  = useState('')
  const [showModal,   setShowModal]   = useState(false)
  const [editing,     setEditing]     = useState(null)
  const [form,        setForm]        = useState(EMPTY_FORM)
  const [formLoading, setFormLoading] = useState(false)
  const [showPwd,     setShowPwd]     = useState(false)
  const [confirmDel,  setConfirmDel]  = useState(null)
  const [formErrors,  setFormErrors]  = useState({})

  // ── Chargement via /admin/users (si disponible) ou fallback ─────────────
  const load = async () => {
    setLoading(true)
    try {
      // Essayer d'abord la vraie route admin/users
      const res = await apiFetch('GET', '/admin/users')
      setUsers(res?.data || [])
      if (res?.stats) setStats(res.stats)
    } catch (primaryErr) {
      // Fallback : extraire depuis les réservations/forfaits
      try {
        const [resRes, forfRes] = await Promise.allSettled([
          apiFetch('GET', '/admin/reservations'),
          apiFetch('GET', '/admin/forfaits'),
        ])

        const usersMap = {}

        if (resRes.status === 'fulfilled') {
          const reservations = resRes.value?.data || resRes.value || []
          reservations.forEach(r => {
            const u = r.client || r.user
            if (u) usersMap[u.id] = { ...u, _reservations: (usersMap[u.id]?._reservations || 0) + 1 }
          })
        }

        if (forfRes.status === 'fulfilled') {
          const forfaits = forfRes.value?.data || forfRes.value || []
          forfaits.forEach(f => {
            if (f.agent) {
              usersMap[f.agent.id] = {
                ...f.agent,
                ...usersMap[f.agent.id],
                _forfaits: (usersMap[f.agent.id]?._forfaits || 0) + 1
              }
            }
          })
        }

        const allUsers = Object.values(usersMap).sort((a, b) => {
          const order = { admin: 0, agent: 1, client: 2 }
          return (order[a.role] ?? 3) - (order[b.role] ?? 3)
        })
        setUsers(allUsers)
        setStats({
          total:   allUsers.length,
          admins:  allUsers.filter(u => u.role === 'admin').length,
          agents:  allUsers.filter(u => u.role === 'agent').length,
          clients: allUsers.filter(u => u.role === 'client').length,
        })
        setAlert({ type: 'warn', message: 'Route /admin/users non disponible. Données extraites depuis les réservations et forfaits existants. Ajoutez UserController pour accéder à tous les utilisateurs.' })
      } catch (fallbackErr) {
        setAlert({ type: 'error', message: 'Impossible de charger les utilisateurs.' })
      }
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

  const openNew = () => {
    setEditing(null); setForm(EMPTY_FORM); setFormErrors({}); setShowPwd(false); setShowModal(true)
  }
  const openEdit = (u) => {
    setEditing(u)
    setForm({ name: u.name, email: u.email, password: '', role: u.role || 'client' })
    setFormErrors({}); setShowPwd(false); setShowModal(true)
  }
  const closeModal = () => { setShowModal(false); setEditing(null); setFormErrors({}) }

  const validate = () => {
    const errs = {}
    if (!form.name.trim())  errs.name  = 'Nom requis.'
    if (!form.email.trim()) errs.email = 'Email requis.'
    if (!editing && !form.password) errs.password = 'Mot de passe requis.'
    if (form.password && form.password.length < 8) errs.password = 'Min. 8 caractères.'
    return errs
  }

  const handleSave = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setFormErrors(errs); return }
    setFormLoading(true); setFormErrors({})
    try {
      const payload = { name: form.name, email: form.email, role: form.role }
      if (form.password) payload.password = form.password

      if (editing) {
        await apiFetch('PUT', `/admin/users/${editing.id}`, payload)
        setAlert({ type: 'success', message: 'Utilisateur mis à jour.' })
      } else {
        await apiFetch('POST', '/admin/users', payload)
        setAlert({ type: 'success', message: `Utilisateur "${form.name}" créé.` })
      }
      closeModal(); load()
    } catch (err) {
      if (err.errors) {
        const mapped = {}
        Object.entries(err.errors).forEach(([k, v]) => { mapped[k] = Array.isArray(v) ? v[0] : v })
        setFormErrors(mapped)
      } else {
        setAlert({ type: 'error', message: err.message || 'Erreur lors de l\'enregistrement.' })
      }
    } finally {
      setFormLoading(false)
    }
  }

  const handleDelete = async (id) => {
    try {
      await apiFetch('DELETE', `/admin/users/${id}`)
      setAlert({ type: 'success', message: 'Utilisateur supprimé.' })
      setConfirmDel(null); load()
    } catch (err) {
      setAlert({ type: 'error', message: err.message || 'Impossible de supprimer.' })
      setConfirmDel(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="page-title">Utilisateurs</h1>
          <p className="text-sm text-gray-500">{stats.total} utilisateur{stats.total !== 1 ? 's' : ''}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={load} className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-500 transition-colors">
            <RefreshCw size={16} />
          </button>
          <Button icon={Plus} onClick={openNew}>Nouvel utilisateur</Button>
        </div>
      </div>

      {alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total',   value: stats.total,   action: () => setRoleFilter(''),       bg: 'bg-gray-50'    },
          { label: 'Admins',  value: stats.admins,  action: () => setRoleFilter('admin'),  bg: 'bg-purple-50'  },
          { label: 'Agents',  value: stats.agents,  action: () => setRoleFilter('agent'),  bg: 'bg-blue-50'    },
          { label: 'Clients', value: stats.clients, action: () => setRoleFilter('client'), bg: 'bg-emerald-50' },
        ].map(({ label, value, action, bg }) => (
          <button key={label} onClick={action}
            className={`card p-4 text-left hover:shadow-card-hover transition-shadow ${bg}`}>
            <p className="text-2xl font-display font-bold text-primary">{loading ? '…' : value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{label}</p>
          </button>
        ))}
      </div>

      {confirmDel && (
        <div className="card p-4 border-red-200 bg-red-50 flex items-center justify-between gap-4">
          <p className="text-sm text-red-700 font-medium">Supprimer définitivement cet utilisateur ?</p>
          <div className="flex gap-2">
            <Button variant="danger" size="sm" onClick={() => handleDelete(confirmDel)}>Supprimer</Button>
            <Button variant="ghost"  size="sm" onClick={() => setConfirmDel(null)}>Annuler</Button>
          </div>
        </div>
      )}

      {/* Filtres */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Rechercher par nom ou email…"
            value={search} onChange={e => setSearch(e.target.value)}
            className="input-field pl-10 py-2" />
        </div>
        <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)}
          className="input-field py-2 w-auto">
          <option value="">Tous les rôles</option>
          <option value="admin">Admin</option>
          <option value="agent">Agent</option>
          <option value="client">Client</option>
        </select>
      </div>

      {/* Liste */}
      {loading ? <Loader /> : filtered.length === 0 ? (
        <div className="card p-12 text-center">
          <User size={40} className="text-gray-200 mx-auto mb-3" />
          <p className="text-gray-400 font-medium">Aucun utilisateur trouvé</p>
          <Button icon={Plus} onClick={openNew} className="mt-4">Créer un utilisateur</Button>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(u => {
            const roleConf = ROLE_CONFIG[u.role] || ROLE_CONFIG.client
            const RoleIcon = roleConf.icon
            return (
              <div key={u.id} className="card p-4 flex items-center gap-4 hover:shadow-card-hover transition-shadow">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 ${
                  u.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                  u.role === 'agent' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
                }`}>
                  {u.name?.charAt(0).toUpperCase()}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-gray-800 truncate">{u.name}</p>
                    {u.id && <span className="text-xs text-gray-300">#{u.id}</span>}
                  </div>
                  <p className="text-xs text-gray-400 truncate">{u.email}</p>
                  {/* Activité */}
                  <div className="flex gap-3 mt-0.5">
                    {u._reservations > 0 && <span className="text-xs text-gray-400">{u._reservations} rés.</span>}
                    {u._forfaits > 0 && <span className="text-xs text-gray-400">{u._forfaits} forfait(s)</span>}
                  </div>
                </div>

                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${roleConf.color}`}>
                    <RoleIcon size={11} /> {roleConf.label}
                  </span>
                  <div className="flex gap-1">
                    <button onClick={() => openEdit(u)}
                      className="p-1.5 text-gray-400 hover:text-secondary hover:bg-secondary/10 rounded-lg transition-colors"
                      title="Modifier">
                      <Edit2 size={14} />
                    </button>
                    <button onClick={() => setConfirmDel(u.id)}
                      className="p-1.5 text-gray-400 hover:text-danger hover:bg-red-50 rounded-lg transition-colors"
                      title="Supprimer">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Modal */}
      <Modal isOpen={showModal} onClose={closeModal}
        title={editing ? `Modifier — ${editing.name}` : 'Nouvel utilisateur'} size="md">
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nom complet *</label>
            <input type="text" value={form.name}
              onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
              className={`input-field ${formErrors.name ? 'border-danger' : ''}`}
              placeholder="Prénom NOM" />
            {formErrors.name && <p className="text-xs text-danger mt-1">{formErrors.name}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
            <input type="email" value={form.email}
              onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
              className={`input-field ${formErrors.email ? 'border-danger' : ''}`}
              placeholder="email@exemple.com" />
            {formErrors.email && <p className="text-xs text-danger mt-1">{formErrors.email}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Rôle *</label>
            <select value={form.role}
              onChange={e => setForm(p => ({ ...p, role: e.target.value }))}
              className="input-field">
              <option value="agent">Agent</option>
              <option value="admin">Administrateur</option>
              <option value="client">Client</option>
            </select>
            <p className="text-xs text-gray-400 mt-1">
              Agents : créent des forfaits. Admins : accès total au système.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mot de passe {editing ? <span className="text-gray-400 font-normal">(laisser vide pour ne pas modifier)</span> : '*'}
            </label>
            <div className="relative">
              <input type={showPwd ? 'text' : 'password'}
                value={form.password}
                onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                className={`input-field pr-10 ${formErrors.password ? 'border-danger' : ''}`}
                placeholder={editing ? '••••••••' : 'Min. 8 caractères'} />
              <button type="button" onClick={() => setShowPwd(s => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {formErrors.password && <p className="text-xs text-danger mt-1">{formErrors.password}</p>}
          </div>

          <Button type="submit" loading={formLoading} className="w-full">
            {editing ? 'Mettre à jour' : 'Créer l\'utilisateur'}
          </Button>
        </form>
      </Modal>
    </div>
  )
}