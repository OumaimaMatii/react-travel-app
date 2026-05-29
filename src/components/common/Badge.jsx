import React from 'react'
import { getReservationStatut } from '../../utils/statusUtils'

export default function Badge({ statut, label, className = '' }) {
  const s = getReservationStatut(statut)
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${s.bg} ${s.text} ${className}`}>
      {label || s.label}
    </span>
  )
}

export function StatusBadge({ bg, text, label, className = '' }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${bg} ${text} ${className}`}>
      {label}
    </span>
  )
}
