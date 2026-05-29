import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../services/api'
import { Map, MapPin, Hotel, Zap, Users, ArrowRight, TrendingUp } from 'lucide-react'

export default function AdminDashboard() {
  const [stats,   setStats]   = useState({ surMesure: 0, destinations: 0, hotels: 0, activites: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const [surRes, destRes, hotelRes, actRes] = await Promise.all([
          api.get('/admin/sur-mesure'),
          api.get('/destinations'),
          api.get('/hotels'),
          api.get('/activites'),
        ])
        setStats({
          surMesure:    (surRes.data?.data   || surRes.data   || []).length,
          destinations: (destRes.data?.data  || destRes.data  || []).length,
          hotels:       (hotelRes.data?.data || hotelRes.data || []).length,
          activites:    (actRes.data?.data   || actRes.data   || []).length,
        })
      } catch {}
      finally { setLoading(false) }
    }
    load()
  }, [])

  const cards = [
    { label: 'Sur mesure',   value: stats.surMesure,    icon: TrendingUp, color: 'bg-amber-50 text-amber-600',    to: '/admin/sur-mesure'   },
    { label: 'Destinations', value: stats.destinations, icon: MapPin,     color: 'bg-purple-50 text-purple-600',  to: '/admin/destinations' },
    { label: 'Hôtels',       value: stats.hotels,       icon: Hotel,      color: 'bg-pink-50 text-pink-600',      to: '/admin/hotels'       },
    { label: 'Activités',    value: stats.activites,    icon: Zap,        color: 'bg-orange-50 text-orange-600',  to: '/admin/activites'    },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="page-title">Administration</h1>
        <p className="text-gray-500 text-sm">Gestion des références et voyages sur mesure</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {cards.map(({ label, value, icon: Icon, color, to }) => (
          <Link key={label} to={to} className="card p-5 hover:shadow-card-hover transition-shadow">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${color}`}>
              <Icon size={20} />
            </div>
            <p className="text-2xl font-display font-bold text-primary">
              {loading ? '…' : value}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">{label}</p>
          </Link>
        ))}
      </div>

      {/* Accès rapides */}
      <div>
        <h2 className="section-title mb-4">Gestion des référentiels</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { to: '/admin/destinations', label: 'Gérer les destinations',  desc: 'Ajouter, modifier ou désactiver des destinations' },
            { to: '/admin/hotels',       label: 'Gérer les hôtels',        desc: 'Hôtels disponibles pour les forfaits' },
            { to: '/admin/activites',    label: 'Gérer les activités',     desc: 'Activités proposées aux voyageurs' },
            { to: '/admin/sur-mesure',   label: 'Voyages sur mesure',      desc: 'Suivre et gérer les demandes personnalisées' },
            { to: '/admin/utilisateurs', label: 'Utilisateurs',            desc: 'Voir les clients et agents de la plateforme' },
          ].map(({ to, label, desc }) => (
            <Link key={to} to={to}
              className="card p-5 hover:shadow-card-hover transition-shadow group flex items-center justify-between">
              <div>
                <p className="font-semibold text-gray-800">{label}</p>
                <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
              </div>
              <ArrowRight size={16} className="text-gray-300 group-hover:text-secondary transition-colors flex-shrink-0" />
            </Link>
          ))}
        </div>
      </div>

      {/* Info */}
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-700">
        <p className="font-semibold mb-1"> Gestion des forfaits et réservations</p>
        <p className="text-blue-600 text-xs">
          Les forfaits et réservations sont gérés directement par les agents depuis leur espace dédié.
          En tant qu'administrateur, vous gérez les référentiels (destinations, hôtels, activités) et les voyages sur mesure.
        </p>
      </div>
    </div>
  )
}