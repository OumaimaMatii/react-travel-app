/**
 * AgentDashboard.jsx – Dashboard principal de l'agent.
 * Affiche les stats, les forfaits récents et les demandes sur mesure.
 */

import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { fetchMesForfaits } from '../../store/slices/forfaitSlice'
import { fetchUnreadCount } from '../../store/slices/notificationSlice'
import {
  Calendar, Bell, Users, TrendingUp, ArrowRight,
  Plus, Eye, Package,
} from 'lucide-react'
import { formatPrice } from '../../utils/formatPrice'
import { formatDate } from '../../utils/formatDate'
import Badge from '../../components/common/Badge'
import Loader from '../../components/common/Loader'

export default function AgentDashboard() {
  const dispatch = useDispatch()
  const { user }                       = useSelector(s => s.auth)
  const { mesForfaits, loading }       = useSelector(s => s.forfaits)
  const { unreadCount }                = useSelector(s => s.notifications)

  useEffect(() => {
    dispatch(fetchMesForfaits())
    dispatch(fetchUnreadCount())
  }, [dispatch])

  // Stats calculées depuis les forfaits
  const totalPlaces     = mesForfaits.reduce((s, f) => s + (f.nombre_places || 0), 0)
  const placesRestantes = mesForfaits.reduce((s, f) => s + (f.places_restantes || 0), 0)
  const placesReservees = totalPlaces - placesRestantes
  const tauxRemplissage = totalPlaces > 0 ? Math.round((placesReservees / totalPlaces) * 100) : 0

  const recent = mesForfaits.slice(0, 4)

  return (
    <div className="space-y-8">
      {/* Bienvenue */}
      <div>
        <h1 className="page-title">Bonjour, {user?.name?.split(' ')[0]} </h1>
        <p className="text-gray-500 text-sm">Espace agent – gérez vos forfaits et réservations</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            label: 'Mes forfaits',
            value: mesForfaits.length,
            icon:  Package,
            color: 'bg-blue-50 text-secondary',
          },
          {
            label: 'Places réservées',
            value: placesReservees,
            icon:  Users,
            color: 'bg-emerald-50 text-emerald-600',
          },
          {
            label: 'Taux remplissage',
            value: `${tauxRemplissage}%`,
            icon:  TrendingUp,
            color: 'bg-amber-50 text-amber-600',
          },
          {
            label: 'Notifications',
            value: unreadCount,
            icon:  Bell,
            color: 'bg-purple-50 text-purple-600',
          },
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
          <Link
            to="/agent/forfaits"
            className="card p-5 hover:shadow-card-hover transition-shadow group flex items-center gap-4"
          >
            <div className="w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-secondary/20 transition-colors">
              <Package size={22} className="text-secondary" />
            </div>
            <div>
              <p className="font-semibold text-gray-800">Mes forfaits</p>
              <p className="text-xs text-gray-400">Gérer et créer des forfaits</p>
            </div>
            <ArrowRight size={16} className="text-gray-300 ml-auto group-hover:text-secondary transition-colors" />
          </Link>

          <Link
            to="/agent/sur-mesure"
            className="card p-5 hover:shadow-card-hover transition-shadow group flex items-center gap-4"
          >
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
              <Calendar size={22} className="text-primary" />
            </div>
            <div>
              <p className="font-semibold text-gray-800">Voyages sur mesure</p>
              <p className="text-xs text-gray-400">Gérer les demandes clients</p>
            </div>
            <ArrowRight size={16} className="text-gray-300 ml-auto group-hover:text-primary transition-colors" />
          </Link>

          <Link
            to="/agent/notifications"
            className="card p-5 hover:shadow-card-hover transition-shadow group flex items-center gap-4"
          >
            <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-purple-100 transition-colors relative">
              <Bell size={22} className="text-purple-600" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-danger text-white text-xs rounded-full flex items-center justify-center font-bold">
                  {unreadCount}
                </span>
              )}
            </div>
            <div>
              <p className="font-semibold text-gray-800">Notifications</p>
              <p className="text-xs text-gray-400">
                {unreadCount > 0 ? `${unreadCount} non lue${unreadCount > 1 ? 's' : ''}` : 'Tout est lu'}
              </p>
            </div>
            <ArrowRight size={16} className="text-gray-300 ml-auto group-hover:text-purple-600 transition-colors" />
          </Link>
        </div>
      </div>

      {/* Forfaits récents */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="section-title">Mes forfaits récents</h2>
          <Link
            to="/agent/forfaits"
            className="text-sm text-secondary font-medium hover:underline flex items-center gap-1"
          >
            Voir tout <ArrowRight size={14} />
          </Link>
        </div>

        {loading ? (
          <Loader />
        ) : recent.length === 0 ? (
          <div className="card p-10 text-center">
            <Package size={36} className="text-gray-200 mx-auto mb-3" />
            <p className="text-gray-400 font-medium">Aucun forfait créé</p>
            <p className="text-sm text-gray-300 mt-1 mb-4">
              Commencez par créer votre premier forfait
            </p>
            <Link
              to="/agent/forfaits"
              className="inline-flex items-center gap-1.5 text-sm text-secondary font-medium"
            >
              <Plus size={14} /> Créer un forfait
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {recent.map(f => (
              <div
                key={f.id}
                className="card p-4 flex items-center gap-4"
              >
                {/* Image destination */}
                {f.destination?.medias?.[0]?.url || f.destination?.image_couverture ? (
                  <img
                    src={f.destination.medias?.[0]?.url || f.destination.image_couverture}
                    alt={f.destination?.nom}
                    className="w-14 h-14 rounded-xl object-cover flex-shrink-0"
                  />
                ) : (
                  <div className="w-14 h-14 bg-surface rounded-xl flex items-center justify-center flex-shrink-0">
                    <Package size={22} className="text-gray-300" />
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-800 truncate">
                    {f.voyage?.titre || f.destination?.nom || `Forfait #${f.id}`}
                  </p>
                  <div className="flex flex-wrap items-center gap-2 mt-0.5 text-xs text-gray-400">
                    {f.voyage?.date_depart && (
                      <span>{formatDate(f.voyage.date_depart)}</span>
                    )}
                    <span>·</span>
                    <span>{f.places_restantes}/{f.nombre_places} places</span>
                    {f.statut && (
                      <>
                        <span>·</span>
                        <Badge statut={f.statut.nom} label={f.statut.nom} />
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 flex-shrink-0">
                  <div className="text-right hidden sm:block">
                    <p className="font-bold text-secondary text-sm">
                      {formatPrice(f.prix_adulte)}
                    </p>
                    <p className="text-xs text-gray-400">/adulte</p>
                  </div>
                  <Link
                    to={`/agent/forfaits/${f.id}/reservations`}
                    className="flex items-center gap-1.5 text-xs text-secondary border border-secondary/30 px-3 py-1.5 rounded-lg hover:bg-secondary/5 transition-colors font-medium"
                  >
                    <Eye size={13} /> Réservations
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
