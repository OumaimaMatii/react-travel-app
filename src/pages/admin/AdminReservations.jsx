import React, { useEffect, useState } from 'react'
import api from '../../services/api'
import Loader from '../../components/common/Loader'
import Badge from '../../components/common/Badge'
import { formatDate } from '../../utils/formatDate'
import { formatPrice } from '../../utils/formatPrice'
import { Search, RefreshCw, Eye } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function AdminReservations() {
  const [reservations, setReservations] = useState([])
  const [loading,      setLoading]      = useState(true)
  const [search,       setSearch]       = useState('')
  const [statutFilter, setStatutFilter] = useState('')

  const load = async () => {
    setLoading(true)
    try {
      const res = await api.get('/admin/reservations')
      setReservations(res.data?.data || res.data || [])
    } catch {}
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const parseMontant = (m) =>
    typeof m === 'string' ? parseFloat(m.replace(/\s/g,'').replace(',','.')) : (m || 0)

  const filtered = reservations.filter(r => {
    const matchSearch = !search ||
      r.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
      String(r.id).includes(search) ||
      r.voyage?.destination?.nom?.toLowerCase().includes(search.toLowerCase())
    const matchStatut = !statutFilter || r.statut === statutFilter
    return matchSearch && matchStatut
  })

  const STATUTS = ['en_attente','en_attente_confirmation','confirmee','annulee']

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="page-title">Toutes les réservations</h1>
          <p className="text-sm text-gray-500">{reservations.length} réservation{reservations.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={load}
          className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-500 transition-colors">
          <RefreshCw size={16} />
        </button>
      </div>

      {/* Filtres */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Rechercher…" value={search}
            onChange={e => setSearch(e.target.value)}
            className="input-field pl-10 py-2" />
        </div>
        <select value={statutFilter} onChange={e => setStatutFilter(e.target.value)}
          className="input-field py-2 w-auto">
          <option value="">Tous les statuts</option>
          {STATUTS.map(s => <option key={s} value={s}>{s.replace(/_/g,' ')}</option>)}
        </select>
      </div>

      {loading ? <Loader /> : filtered.length === 0 ? (
        <div className="card p-12 text-center text-gray-400">Aucune réservation trouvée.</div>
      ) : (
        <div className="space-y-3">
          {filtered.map(r => (
            <div key={r.id} className="card p-4 flex items-center gap-4">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold text-sm flex-shrink-0">
                {r.client?.name?.charAt(0) || r.user?.name?.charAt(0) || '?'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-800 text-sm">
                  #{r.id} · {r.client?.name || r.user?.name || '—'}
                </p>
                <div className="flex flex-wrap gap-2 text-xs text-gray-500 mt-0.5">
                  <span>{r.voyage?.destination?.nom || '—'}</span>
                  <span>·</span>
                  <span>{formatDate(r.date_reservation)}</span>
                  <span>·</span>
                  <span>{r.nb_adultes} adulte{r.nb_adultes > 1 ? 's' : ''}{r.nb_enfants > 0 ? ` + ${r.nb_enfants}E` : ''}</span>
                </div>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <Badge statut={r.statut} />
                {r.montant_total && (
                  <span className="text-sm font-bold text-secondary hidden sm:block">
                    {formatPrice(parseMontant(r.montant_total))}
                  </span>
                )}
                <Link to={`/admin/reservations/${r.id}`}
                  className="flex items-center gap-1 text-xs text-secondary border border-secondary/30 px-2.5 py-1.5 rounded-lg hover:bg-secondary/5 transition-colors font-medium">
                  <Eye size={13} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
