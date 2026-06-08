import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../services/api'
import Loader from '../../components/common/Loader'
import Alert from '../../components/common/Alert'
import { formatDate } from '../../utils/formatDate'
import { formatPrice } from '../../utils/formatPrice'
import { MapPin, Calendar, User, TrendingUp, Eye, RefreshCw } from 'lucide-react'

const STATUT_COLORS = {
  'En attente':    'bg-amber-100 text-amber-700',
  'En validation': 'bg-blue-100 text-blue-700',
  'Valide':        'bg-emerald-100 text-emerald-700',
  'Refuse':        'bg-red-100 text-red-700',
  'En cours de traitement': 'bg-purple-100 text-purple-700',
  'Devis envoye':  'bg-indigo-100 text-indigo-700',
  'Facture envoyee': 'bg-cyan-100 text-cyan-700',
}

export default function SurMesureAgent() {
  const [demandes, setDemandes] = useState([])
  const [loading,  setLoading]  = useState(true)
  const [alert,    setAlert]    = useState(null)
  const [statutFilter, setStatutFilter] = useState('')

  const load = async () => {
    setLoading(true)
    try {
      const res = await api.get('/agent/sur-mesure')
      setDemandes(res.data?.data || res.data || [])
    } catch (e) {
      setAlert({ type: 'error', message: 'Erreur de chargement des demandes.' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const handleStatutChange = async (id, statutId) => {
    try {
      await api.put(`/agent/sur-mesure/${id}`, { statut_sur_mesure_id: parseInt(statutId) })
      setAlert({ type: 'success', message: 'Statut mis à jour.' })
      load()
    } catch {
      setAlert({ type: 'error', message: 'Erreur lors de la mise à jour du statut.' })
    }
  }

  const filtered = statutFilter
    ? demandes.filter(d => d.statut?.nom === statutFilter)
    : demandes

  const statuts = [...new Set(demandes.map(d => d.statut?.nom).filter(Boolean))]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="page-title">Voyages sur mesure</h1>
          <p className="text-sm text-gray-500">{demandes.length} demande{demandes.length !== 1 ? 's' : ''}</p>
        </div>
        <button
          onClick={load}
          className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-500 transition-colors"
        >
          <RefreshCw size={16} />
        </button>
      </div>

      {alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}

      {statuts.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setStatutFilter('')}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              !statutFilter ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Tous ({demandes.length})
          </button>
          {statuts.map(s => (
            <button
              key={s}
              onClick={() => setStatutFilter(s)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                statutFilter === s ? 'bg-secondary text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {s} ({demandes.filter(d => d.statut?.nom === s).length})
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <Loader />
      ) : filtered.length === 0 ? (
        <div className="card p-16 text-center">
          <TrendingUp size={40} className="text-gray-200 mx-auto mb-4" />
          <p className="text-gray-400 font-medium">Aucune demande sur mesure</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(d => (
            <div key={d.id} className="card p-5">
              <div className="flex items-start gap-4">
                {d.destination?.image_couverture ? (
                  <img
                    src={d.destination.image_couverture}
                    alt={d.destination.nom}
                    className="w-16 h-16 rounded-xl object-cover flex-shrink-0 hidden sm:block"
                  />
                ) : (
                  <div className="w-16 h-16 bg-surface rounded-xl flex items-center justify-center flex-shrink-0 hidden sm:flex">
                    <MapPin size={22} className="text-gray-300" />
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div>
                      <p className="font-semibold text-gray-800">
                        Demande #{d.id} –{' '}
                        {d.destination?.nom || 'Destination inconnue'}
                        {d.destination?.pays ? `, ${d.destination.pays}` : ''}
                      </p>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 mt-1">
                        <span className="flex items-center gap-1">
                          <User size={11} /> {d.client?.name}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar size={11} />
                          {formatDate(d.voyage?.date_depart)} → {formatDate(d.voyage?.date_retour)}
                        </span>
                        <span className="flex items-center gap-1">
                          <TrendingUp size={11} /> Budget : {formatPrice(d.budget_estime)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      {d.statut && (
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          STATUT_COLORS[d.statut.nom] || 'bg-gray-100 text-gray-600'
                        }`}>
                          {d.statut.nom}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 mt-3 flex-wrap">
                    <StatutSelect id={d.id} currentStatutId={d.statut?.id} onChange={handleStatutChange} />
                    
                    <Link
                      to={`/agent/sur-mesure/${d.id}`}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-secondary/10 text-secondary hover:bg-secondary/20 transition-colors"
                    >
                      <Eye size={14} /> Voir les détails
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function StatutSelect({ id, currentStatutId, onChange }) {
  const [statuts, setStatuts] = useState([])

  useEffect(() => {
    api.get('/statut-sur-mesure')
      .then(r => setStatuts(r.data?.data || r.data || []))
      .catch(() => {})
  }, [])

  if (!statuts.length) return null

  return (
    <select
      value={currentStatutId || ''}
      onChange={e => onChange(id, e.target.value)}
      className="input-field text-xs py-1.5 w-auto"
    >
      <option value="">Changer le statut…</option>
      {statuts.map(s => (
        <option key={s.id} value={s.id}>{s.nom}</option>
      ))}
    </select>
  )
}