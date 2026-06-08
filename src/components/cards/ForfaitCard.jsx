
import React from 'react'
import { Link } from 'react-router-dom'
import { Calendar, MapPin, Users, Star, ArrowRight, Eye } from 'lucide-react'
import { formatPrice } from '../../utils/formatPrice'
import { formatDate, calcDuree } from '../../utils/formatDate'
import { getForfaitStatut } from '../../utils/statusUtils'
import { StatusBadge } from '../common/Badge'

export default function ForfaitCard({ forfait, showActions = false, onEdit, onDelete }) {
  const dest    = forfait.destination
  const hotel   = forfait.hotel
  const voyage  = forfait.voyage
  const statut  = forfait.statut
  const duree   = calcDuree(voyage?.date_depart, voyage?.date_retour)

  const image =
    dest?.medias?.[0]?.url ||
    dest?.image_couverture  ||
    'https://images.unsplash.com/photo-1539020140153-e479b8c22e70?w=600&q=80'

  const statutStyle = statut ? getForfaitStatut(statut.nom) : null

  return (
    <div className="card hover:shadow-card-hover transition-all duration-300 overflow-hidden group">
      {/* Image */}
      <div className="relative h-48 overflow-hidden -mx-5 -mt-5 mb-4">
        <img
          src={image}
          alt={dest?.nom}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

        {statut && statutStyle && (
          <div className="absolute top-3 right-3">
            <StatusBadge bg={statutStyle.bg} text={statutStyle.text} label={statut.nom} />
          </div>
        )}

        {forfait.type_forfait && (
          <div className="absolute top-3 left-3">
            <span className="px-2 py-0.5 bg-secondary/90 text-white text-xs font-semibold rounded-full">
              {forfait.type_forfait.nom}
            </span>
          </div>
        )}

        <div className="absolute bottom-3 left-3 text-white">
          <div className="flex items-center gap-1 text-xs font-medium">
            
            {dest?.nom}{dest?.pays ? `, ${dest.pays}` : ''}
          </div>
        </div>
      </div>

      {/* Contenu */}
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-display font-semibold text-primary leading-tight text-sm">
            {voyage?.titre || (dest?.nom ? `Voyage à ${dest.nom}` : `Forfait #${forfait.id}`)}
          </h3>
          <div className="text-right flex-shrink-0">
            <p className="text-base font-bold text-secondary">{formatPrice(forfait.prix_adulte)}</p>
            <p className="text-xs text-gray-400">/ adulte</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
          {voyage?.date_depart && (
            <span className="flex items-center gap-1">
              <Calendar size={11} className="text-secondary" />
              {formatDate(voyage.date_depart)}
            </span>
          )}
          {duree && (
            <span className="flex items-center gap-1">
              <span className="w-1 h-1 bg-gray-300 rounded-full" />
              {duree}j
            </span>
          )}
          {forfait.places_restantes != null && (
            <span className="flex items-center gap-1">
              <Users size={11} className="text-secondary" />
              {forfait.places_restantes} pl. restantes
            </span>
          )}
        </div>

        {hotel && (
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <Star size={11} className="text-amber-400 fill-amber-400" />
            <span>{hotel.nom}</span>
            <span className="text-gray-300">·</span>
            <span>{'★'.repeat(hotel.etoiles || 3)}</span>
          </div>
        )}

        {showActions ? (
          <div className="space-y-2 pt-1">
            {/* Bouton voir réservations */}
            <Link
              to={`/agent/forfaits/${forfait.id}/reservations`}
              className="w-full flex items-center justify-center gap-1.5 text-xs px-3 py-2 bg-secondary/10 text-secondary rounded-lg hover:bg-secondary/20 transition-colors font-medium"
            >
              <Eye size={13} /> Voir les réservations
            </Link>
            <div className="flex gap-2">
              <button
                onClick={() => onEdit(forfait)}
                className="flex-1 text-xs px-3 py-2 border border-secondary/30 text-secondary rounded-lg hover:bg-secondary/5 transition-colors font-medium"
              >
                Modifier
              </button>
              <button
                onClick={() => onDelete(forfait.id)}
                className="flex-1 text-xs px-3 py-2 border border-red-200 text-danger rounded-lg hover:bg-red-50 transition-colors font-medium"
              >
                Supprimer
              </button>
            </div>
          </div>
        ) : (
          <Link
            to={`/forfaits/${forfait.id}`}
            className="flex items-center justify-between text-secondary text-sm font-medium pt-1 group-hover:gap-2 transition-all"
          >
            Voir les détails <ArrowRight size={15} />
          </Link>
        )}
      </div>
    </div>
  )
}
