import React from 'react'
import { Link } from 'react-router-dom'
import { MapPin, ArrowRight } from 'lucide-react'

export default function DestinationCard({ destination }) {
  const image =
    destination.medias?.[0]?.url ||
    destination.image_couverture ||
    'https://images.unsplash.com/photo-1539020140153-e479b8c22e70?w=600&q=80'

  return (
    <Link
      to={`/forfaits?destination=${destination.id}`}
      className="group relative h-64 rounded-2xl overflow-hidden block shadow-card hover:shadow-card-hover transition-all duration-300"
    >
      <img
        src={image}
        alt={destination.nom}
        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
        <div className="flex items-center gap-1.5 text-xs text-white/70 mb-1">
          
        </div>
        <h3 className="font-display font-bold text-lg leading-tight">{destination.nom}</h3>
        <div className="flex items-center gap-1 text-xs text-secondary mt-1 group-hover:gap-2 transition-all">
          Explorer <ArrowRight size={12} />
        </div>
      </div>
    </Link>
  )
}
