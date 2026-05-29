import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { fetchMesReservations } from '../../store/slices/reservationSlice'
import Badge from '../../components/common/Badge'
import Loader from '../../components/common/Loader'
import { Calendar, ArrowRight, MapPin } from 'lucide-react'
import { formatDate } from '../../utils/formatDate'
import { formatPrice } from '../../utils/formatPrice'

export default function MesReservations() {
  const dispatch = useDispatch()
  const { items, loading } = useSelector(s => s.reservations)

  useEffect(() => { dispatch(fetchMesReservations()) }, [dispatch])

  const parseMontant = (m) =>
    typeof m === 'string' ? parseFloat(m.replace(/\s/g, '').replace(',', '.')) : (m || 0)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Mes réservations</h1>
        <p className="text-sm text-gray-500">
          {items.length} réservation{items.length !== 1 ? 's' : ''} au total
        </p>
      </div>

      {loading ? (
        <Loader />
      ) : items.length === 0 ? (
        <div className="card p-16 text-center">
          <Calendar size={48} className="text-gray-200 mx-auto mb-4" />
          <p className="text-gray-500 font-medium text-lg">Aucune réservation</p>
          <p className="text-sm text-gray-400 mt-2 mb-6">
            Explorez nos forfaits et réservez votre prochain voyage
          </p>
          <Link to="/forfaits" className="btn-primary inline-flex items-center gap-2">
            Voir les forfaits <ArrowRight size={16} />
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {items.map(r => {
            const dest = r.voyage?.destination
            const img  = dest?.medias?.[0]?.url || dest?.image_couverture
            return (
              <Link
                key={r.id}
                to={`/client/reservations/${r.id}`}
                className="card p-5 flex items-center gap-5 hover:shadow-card-hover transition-all group"
              >
                {img ? (
                  <img src={img} alt={dest?.nom} className="w-20 h-20 rounded-xl object-cover flex-shrink-0" />
                ) : (
                  <div className="w-20 h-20 bg-surface rounded-xl flex items-center justify-center flex-shrink-0">
                    <Calendar size={24} className="text-gray-300" />
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-display font-semibold text-primary truncate">
                      {dest?.nom || `Réservation #${r.id}`}
                    </p>
                    <Badge statut={r.statut} />
                  </div>
                  {dest && (
                    <p className="text-xs text-gray-400 flex items-center gap-1 mb-1">
                      <MapPin size={11} /> {dest.pays}
                    </p>
                  )}
                  <p className="text-xs text-gray-400">
                    Réservé le {formatDate(r.date_reservation)} · {r.nb_adultes} adulte{r.nb_adultes > 1 ? 's' : ''}
                    {r.nb_enfants > 0 ? `, ${r.nb_enfants} enfant${r.nb_enfants > 1 ? 's' : ''}` : ''}
                  </p>
                  {r.voyage?.date_depart && (
                    <p className="text-xs text-secondary mt-1">
                      Départ : {formatDate(r.voyage.date_depart)}
                    </p>
                  )}
                </div>

                <div className="text-right flex-shrink-0 flex flex-col items-end gap-2">
                  {r.montant_total && (
                    <p className="text-lg font-bold text-secondary">
                      {formatPrice(parseMontant(r.montant_total))}
                    </p>
                  )}
                  <ArrowRight size={16} className="text-gray-300 group-hover:text-secondary transition-colors" />
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
