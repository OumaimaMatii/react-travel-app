import React, { useState } from 'react'
import { SlidersHorizontal, RotateCcw } from 'lucide-react'

export default function FilterBar({ destinations = [], onFilter }) {
  const [filters, setFilters] = useState({
    destination: '', dateDepart: '', prixMin: '', prixMax: '',
  })

  const handleChange = (e) => {
    const updated = { ...filters, [e.target.name]: e.target.value }
    setFilters(updated)
    onFilter(updated)
  }

  const reset = () => {
    const empty = { destination: '', dateDepart: '', prixMin: '', prixMax: '' }
    setFilters(empty)
    onFilter(empty)
  }

  return (
    <div className="card p-4 flex flex-wrap gap-3 items-end">
      <div className="flex items-center gap-2 text-primary font-medium text-sm w-full sm:w-auto">
        <SlidersHorizontal size={16} />
        <span>Filtres</span>
      </div>

      <div className="flex-1 min-w-36">
        <label className="block text-xs text-gray-500 mb-1">Destination</label>
        <select name="destination" value={filters.destination} onChange={handleChange} className="input-field text-sm py-2">
          <option value="">Toutes</option>
          {destinations.map(d => <option key={d.id} value={d.id}>{d.nom}</option>)}
        </select>
      </div>

      <div className="min-w-36">
        <label className="block text-xs text-gray-500 mb-1">Date départ</label>
        <input type="date" name="dateDepart" value={filters.dateDepart} onChange={handleChange} className="input-field text-sm py-2" />
      </div>

      <div className="min-w-28">
        <label className="block text-xs text-gray-500 mb-1">Prix min (DH)</label>
        <input type="number" name="prixMin" value={filters.prixMin} onChange={handleChange} placeholder="0" className="input-field text-sm py-2" />
      </div>

      <div className="min-w-28">
        <label className="block text-xs text-gray-500 mb-1">Prix max (DH)</label>
        <input type="number" name="prixMax" value={filters.prixMax} onChange={handleChange} placeholder="∞" className="input-field text-sm py-2" />
      </div>

      <button
        onClick={reset}
        className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-500 hover:text-primary border border-gray-200 rounded-lg hover:border-primary/30 transition-all"
      >
        <RotateCcw size={14} /> Réinitialiser
      </button>
    </div>
  )
}
