import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchForfaits } from '../../store/slices/forfaitSlice'
import Header from '../../components/layout/Header'
import Footer from '../../components/layout/Footer'
import ForfaitCard from '../../components/cards/ForfaitCard'
import FilterBar from '../../components/common/FilterBar'
import Loader from '../../components/common/Loader'
import { Search } from 'lucide-react'
import api from '../../services/api'

export default function ForfaitsPage() {
  const dispatch = useDispatch()
  const { items, loading } = useSelector(s => s.forfaits)
  const [destinations, setDestinations] = useState([])
  const [filtered,     setFiltered]     = useState([])
  const [search,       setSearch]       = useState('')

  useEffect(() => {
    dispatch(fetchForfaits())
    api.get('/destinations')
      .then(r => setDestinations(r.data?.data || r.data || []))
      .catch(() => {})
  }, [dispatch])

  useEffect(() => { setFiltered(items) }, [items])

  const handleFilter = ({ destination, dateDepart, prixMin, prixMax }) => {
    let result = [...items]
    if (destination) result = result.filter(f => f.destination?.id === parseInt(destination))
    if (dateDepart)  result = result.filter(f => f.voyage?.date_depart >= dateDepart)
    if (prixMin)     result = result.filter(f => f.prix_adulte >= parseFloat(prixMin))
    if (prixMax)     result = result.filter(f => f.prix_adulte <= parseFloat(prixMax))
    if (search)      result = result.filter(f =>
      f.destination?.nom?.toLowerCase().includes(search.toLowerCase()) ||
      f.voyage?.titre?.toLowerCase().includes(search.toLowerCase())
    )
    setFiltered(result)
  }

  const handleSearch = (e) => {
    const val = e.target.value
    setSearch(val)
    setFiltered(items.filter(f =>
      f.destination?.nom?.toLowerCase().includes(val.toLowerCase()) ||
      f.voyage?.titre?.toLowerCase().includes(val.toLowerCase()) ||
      f.hotel?.nom?.toLowerCase().includes(val.toLowerCase())
    ))
  }

  return (
    <div className="min-h-screen bg-surface">
      <Header />

      {/* Hero */}
      <div className="relative pt-16 bg-primary overflow-hidden">
        <div className="absolute inset-0 opacity-20"
          style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1548013146-72479768bada?w=1400&q=70)', backgroundSize: 'cover', backgroundPosition: 'center' }} />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center text-white">
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-3">Nos Forfaits Voyage</h1>
          <p className="text-white/70 text-lg max-w-xl mx-auto">
            Découvrez nos offres soigneusement sélectionnées pour des expériences inoubliables
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
        {/* Recherche */}
        <div className="relative">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Rechercher par destination, titre, hôtel…"
            value={search} onChange={handleSearch}
            className="input-field pl-12 py-3 text-base shadow-sm" />
        </div>

        <FilterBar destinations={destinations} onFilter={handleFilter} />

        <p className="text-sm text-gray-500">
          {loading ? 'Chargement…' : `${filtered.length} forfait${filtered.length !== 1 ? 's' : ''} trouvé${filtered.length !== 1 ? 's' : ''}`}
        </p>

        {loading ? (
          <Loader />
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search size={24} className="text-gray-300" />
            </div>
            <p className="text-gray-500 font-medium">Aucun forfait trouvé</p>
            <p className="text-sm text-gray-400 mt-1">Essayez de modifier vos filtres</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(f => <ForfaitCard key={f.id} forfait={f} />)}
          </div>
        )}
      </div>

      <Footer />
    </div>
  )
}
