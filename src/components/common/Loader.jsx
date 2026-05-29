import React from 'react'
import { Loader2 } from 'lucide-react'

export default function Loader({ text = 'Chargement…', fullPage = false }) {
  if (fullPage) return (
    <div className="fixed inset-0 flex items-center justify-center bg-white/80 z-50 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-3">
        <Loader2 size={36} className="animate-spin text-secondary" />
        <p className="text-sm text-gray-500 font-medium">{text}</p>
      </div>
    </div>
  )
  return (
    <div className="flex items-center justify-center py-12">
      <Loader2 size={28} className="animate-spin text-secondary" />
    </div>
  )
}
