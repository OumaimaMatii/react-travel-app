/**
 * ForfaitReservations.jsx – Page agent : liste des réservations d'un forfait donné.
 * Accessible via /agent/forfaits/:forfaitId/reservations
 */

import React, { useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { fetchReservationsByForfait } from '../../store/slices/reservationSlice'
import Badge from '../../components/common/Badge'
import Loader from '../../components/common/Loader'
import { formatDate } from '../../utils/formatDate'
import { formatPrice } from '../../utils/formatPrice'
import {
  ArrowLeft, Users, CheckCircle, Clock, XCircle,
  TrendingUp, Eye, Calendar,
} from 'lucide-react'

export default function ForfaitReservations() {
  const { forfaitId } = useParams()
  const navigate      = useNavigate()
  const dispatch      = useDispatch()
  const { forfaitData, loading } = useSelector(s => s.reservations)

  const { data: reservations, stats, forfait } = forfaitData

  useEffect(() => {
    if (forfaitId) dispatch(fetchReservationsByForfait(forfaitId))
  }, [forfaitId, dispatch])

  if (loading) return <Loader />

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/agent/forfaits')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft size={18} className="text-gray-500" />
        </button>
        <div>
          <h1 className="page-title mb-0">
            {forfait?.titre || `Forfait #${forfaitId}`}
          </h1>
          <p className="text-sm text-gray-400">
            {forfait?.destination && `📍 ${forfait.destination} · `}
            {forfait?.nombre_places} places · {forfait?.places_restantes} restantes
          </p>
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total',        value: stats.total,        icon: Users,       color: 'bg-blue-50 text-blue-600' },
            { label: 'Confirmées',   value: stats.confirmees,   icon: CheckCircle, color: 'bg-emerald-50 text-emerald-600' },
            { label: 'En attente',   value: stats.en_attente,   icon: Clock,       color: 'bg-amber-50 text-amber-600' },
            { label: 'Chiffre d\'affaires', value: formatPrice(stats.chiffre_affaire), icon: TrendingUp, color: 'bg-secondary/10 text-secondary' },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="card p-5">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${color}`}>
                <Icon size={18} />
              </div>
              <p className="text-xl font-display font-bold text-primary">{value}</p>
              <p className="text-xs text-gray-400 mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Liste */}
      {reservations.length === 0 ? (
        <div className="card p-16 text-center">
          <Calendar size={40} className="text-gray-200 mx-auto mb-4" />
          <p className="text-gray-400 font-medium">Aucune réservation pour ce forfait</p>
        </div>
      ) : (
        <div className="space-y-3">
          {reservations.map(r => (
            <div key={r.id} className="card p-4 flex items-center gap-4">
              {/* Avatar client */}
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 text-primary font-bold text-sm">
                {r.client?.name?.charAt(0) || '?'}
              </div>

              {/* Infos */}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-800 truncate">
                  {r.client?.name || `Client #${r.id}`}
                </p>
                <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 mt-0.5">
                  <span>Réservé le {formatDate(r.date_reservation)}</span>
                  <span className="flex items-center gap-1">
                    <Users size={11} />
                    {r.nb_adultes} adulte{r.nb_adultes > 1 ? 's' : ''}
                    {r.nb_enfants > 0 ? `, ${r.nb_enfants} enfant${r.nb_enfants > 1 ? 's' : ''}` : ''}
                  </span>
                </div>
              </div>

              {/* Statut + montant + action */}
              <div className="flex items-center gap-3 flex-shrink-0">
                <Badge statut={r.statut} />
                {r.montant_total && (
                  <span className="text-sm font-bold text-secondary hidden sm:block">
                    {formatPrice(parseFloat(String(r.montant_total).replace(/\s/g, '').replace(',', '.')))}
                  </span>
                )}
                <Link
                  to={`/agent/reservations/${r.id}`}
                  className="flex items-center gap-1.5 text-xs text-secondary border border-secondary/30 px-3 py-1.5 rounded-lg hover:bg-secondary/5 transition-colors font-medium"
                >
                  <Eye size={13} /> Détails
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
