import React, { useEffect, useState } from 'react'
import api from '../../services/api'
import Loader from '../../components/common/Loader'
import Alert from '../../components/common/Alert'
import { formatDate } from '../../utils/formatDate'
import { formatPrice } from '../../utils/formatPrice'
import { RefreshCw, TrendingUp, MapPin, Calendar, User } from 'lucide-react'

const STATUT_COLORS = {
  'En attente': 'bg-amber-100 text-amber-700',
  'En cours':   'bg-blue-100 text-blue-700',
  'Confirmé':   'bg-emerald-100 text-emerald-700',
  'Annulé':     'bg-red-100 text-red-700',
}

export default function AdminSurMesure() {
  const [demandes, setDemandes] = useState([])
  const [loading,  setLoading]  = useState(true)
  const [alert,    setAlert]    = useState(null)

  const load = async () => {
    setLoading(true)
    try {
      const res = await api.get('/admin/sur-mesure')
      setDemandes(res.data?.data || res.data || [])
    } catch { setAlert({ type: 'error', message: 'Erreur de chargement.' }) }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const handleStatut = async (id, statutId) => {
    try {
      await api.put(`/admin/sur-mesure/${id}`, { statut_sur_mesure_id: parseInt(statutId) })
      setAlert({ type: 'success', message: 'Statut mis à jour.' })
      load()
    } catch { setAlert({ type: 'error', message: 'Erreur.' }) }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Voyages sur mesure</h1>
          <p className="text-sm text-gray-500">{demandes.length} demande{demandes.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={load} className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-500">
          <RefreshCw size={16} />
        </button>
      </div>

      {alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}

      {loading ? <Loader /> : demandes.length === 0 ? (
        <div className="card p-12 text-center text-gray-400">Aucune demande sur mesure.</div>
      ) : (
        <div className="space-y-3">
          {demandes.map(d => (
            <div key={d.id} className="card p-4">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-800 text-sm">
                    Demande #{d.id} – {d.destination?.nom || '—'}, {d.destination?.pays || ''}
                  </p>
                  <div className="flex flex-wrap gap-3 text-xs text-gray-500 mt-1">
                    <span className="flex items-center gap-1"><User size={11} /> {d.client?.name}</span>
                    <span className="flex items-center gap-1"><Calendar size={11} /> {formatDate(d.voyage?.date_depart)}</span>
                    <span className="flex items-center gap-1"><TrendingUp size={11} /> {formatPrice(d.budget_estime)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {d.statut && (
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${STATUT_COLORS[d.statut.nom] || 'bg-gray-100 text-gray-600'}`}>
                      {d.statut.nom}
                    </span>
                  )}
                  <StatutSelect id={d.id} currentId={d.statut?.id} onChange={handleStatut} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function StatutSelect({ id, currentId, onChange }) {
  const [statuts, setStatuts] = useState([])
  useEffect(() => {
    api.get('/admin/statut-sur-mesure').then(r => setStatuts(r.data?.data || r.data || [])).catch(() => {})
  }, [])
  if (!statuts.length) return null
  return (
    <select value={currentId || ''} onChange={e => onChange(id, e.target.value)}
      className="input-field text-xs py-1 w-auto">
      <option value="">Changer…</option>
      {statuts.map(s => <option key={s.id} value={s.id}>{s.nom}</option>)}
    </select>
  )
}
