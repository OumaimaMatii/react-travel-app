import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { fetchMesReservations } from '../../store/slices/reservationSlice'
import { fetchUnreadCount } from '../../store/slices/notificationSlice'
import { Calendar, Bell, Map, ArrowRight, CheckCircle, Clock } from 'lucide-react'
import Badge from '../../components/common/Badge'
import { formatDate } from '../../utils/formatDate'
import { formatPrice } from '../../utils/formatPrice'

export default function ClientDashboard() {
  const dispatch = useDispatch()
  const { user } = useSelector(s => s.auth)
  const { items: reservations, loading } = useSelector(s => s.reservations)
  const { unreadCount } = useSelector(s => s.notifications)

  useEffect(() => {
    dispatch(fetchMesReservations())
    dispatch(fetchUnreadCount())
  }, [dispatch])

  const stats = {
    total:      reservations.length,
    confirmees: reservations.filter(r => r.statut === 'confirmee').length,
    enAttente:  reservations.filter(r => r.statut === 'en_attente').length,
  }

  const recent = reservations.slice(0, 3)

  const parseMontant = (m) =>
    typeof m === 'string' ? parseFloat(m.replace(/\s/g,'').replace(',','.')) : (m || 0)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="page-title">Bonjour, {user?.name?.split(' ')[0]} </h1>
        <p className="text-gray-500 text-sm">Bienvenue dans votre espace voyageur</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total réservations', value: stats.total,      icon: Calendar,     color: 'bg-blue-50 text-secondary' },
          { label: 'Confirmées',          value: stats.confirmees, icon: CheckCircle,  color: 'bg-emerald-50 text-emerald-600' },
          { label: 'En attente',          value: stats.enAttente,  icon: Clock,        color: 'bg-amber-50 text-amber-600' },
          { label: 'Notifications',       value: unreadCount,      icon: Bell,         color: 'bg-purple-50 text-purple-600' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="card p-5">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${color}`}>
              <Icon size={20} />
            </div>
            <p className="text-2xl font-display font-bold text-primary">{value}</p>
            <p className="text-xs text-gray-400 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Actions rapides */}
      <div>
        <h2 className="section-title mb-4">Actions rapides</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { to: '/forfaits',             icon: Calendar, color: 'bg-secondary/10 text-secondary group-hover:bg-secondary/20', label: 'Voir les forfaits',    sub: 'Explorez nos offres' },
            { to: '/client/sur-mesure',    icon: Map,      color: 'bg-primary/10 text-primary group-hover:bg-primary/20',      label: 'Voyage sur mesure',   sub: 'Créez votre voyage' },
            { to: '/client/notifications', icon: Bell,     color: 'bg-purple-50 text-purple-600 group-hover:bg-purple-100',    label: 'Notifications',       sub: unreadCount > 0 ? `${unreadCount} non lue${unreadCount > 1 ? 's' : ''}` : 'Tout est lu', badge: unreadCount },
          ].map(({ to, icon: Icon, color, label, sub, badge }) => (
            <Link key={to} to={to} className="card p-5 hover:shadow-card-hover transition-shadow group flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors relative ${color}`}>
                <Icon size={22} />
                {badge > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-danger text-white text-xs rounded-full flex items-center justify-center font-bold">
                    {badge}
                  </span>
                )}
              </div>
              <div>
                <p className="font-semibold text-gray-800">{label}</p>
                <p className="text-xs text-gray-400">{sub}</p>
              </div>
              <ArrowRight size={16} className="text-gray-300 ml-auto group-hover:text-secondary transition-colors" />
            </Link>
          ))}
        </div>
      </div>

      {/* Réservations récentes */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="section-title">Réservations récentes</h2>
          <Link to="/client/reservations" className="text-sm text-secondary font-medium hover:underline flex items-center gap-1">
            Voir tout <ArrowRight size={14} />
          </Link>
        </div>

        {loading ? (
          <div className="card p-8 text-center text-gray-400">Chargement…</div>
        ) : recent.length === 0 ? (
          <div className="card p-10 text-center">
            <Calendar size={36} className="text-gray-200 mx-auto mb-3" />
            <p className="text-gray-400 font-medium">Aucune réservation</p>
            <Link to="/forfaits" className="inline-flex items-center gap-1 mt-4 text-secondary text-sm font-medium">
              Voir les forfaits <ArrowRight size={14} />
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {recent.map(r => (
              <Link key={r.id} to={`/client/reservations/${r.id}`}
                className="card p-4 flex items-center gap-4 hover:shadow-card-hover transition-shadow group">
                <div className="w-12 h-12 bg-surface rounded-xl flex items-center justify-center flex-shrink-0">
                  <Calendar size={20} className="text-secondary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-800 truncate">
                    {r.voyage?.destination?.nom || `Réservation #${r.id}`}
                  </p>
                  <p className="text-xs text-gray-400">{formatDate(r.date_reservation)}</p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge statut={r.statut} />
                  {r.montant_total && (
                    <span className="text-sm font-bold text-secondary">{formatPrice(parseMontant(r.montant_total))}</span>
                  )}
                  <ArrowRight size={16} className="text-gray-300 group-hover:text-secondary transition-colors" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
