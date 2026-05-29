/**
 * Etape2Hotel.jsx – Sélection hôtel + types de chambre + quantités.
 */

import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { setHotel, updateChambre, nextStep, prevStep } from '../../store/slices/surMesureSlice'
import api from '../../services/api'
import { Hotel, Star, ChevronDown, ChevronUp } from 'lucide-react'
import Button from '../common/Button'

export default function Etape2Hotel() {
  const dispatch = useDispatch()
  const { wizard } = useSelector(s => s.surMesure)

  const [hotels,       setHotels]       = useState([])
  const [hotelDetail,  setHotelDetail]  = useState(null)  // détail avec typeChambres
  const [loading,      setLoading]      = useState(false)
  const [error,        setError]        = useState('')

  // Charger la liste des hôtels
  useEffect(() => {
    api.get('/hotels').then(r => setHotels(r.data?.data || r.data || []))
  }, [])

  // Charger le détail quand un hôtel est sélectionné
  const handleSelectHotel = async (hotel) => {
    dispatch(setHotel(hotel))
    setLoading(true)
    try {
      const res = await api.get(`/hotels/${hotel.id}`)
      setHotelDetail(res.data?.data || res.data)
    } catch {
      setHotelDetail(hotel)
    } finally {
      setLoading(false)
    }
  }

  const selectedHotel = wizard.hotel

  const handleNext = () => {
    if (!selectedHotel) { setError('Veuillez choisir un hôtel.'); return }
    if (wizard.chambres.length === 0) { setError('Veuillez sélectionner au moins un type de chambre.'); return }
    setError('')
    dispatch(nextStep())
  }

  // Quantité d'une chambre dans le wizard
  const getQty = (typeChambreId) =>
    wizard.chambres.find(c => c.type_chambre_id === typeChambreId)?.quantite || 0

  const handleQtyChange = (tc, qty) => {
    dispatch(updateChambre({
      type_chambre_id: tc.id,
      nom:             tc.nom,
      quantite:        parseInt(qty) || 0,
      prix_par_nuit:   tc.pivot?.prix_par_nuit || 0,
    }))
  }

  const typeChambres = hotelDetail?.type_chambres || selectedHotel?.type_chambres || []

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-display font-semibold text-primary flex items-center gap-2">
          <Hotel size={20} className="text-secondary" /> Hébergement
        </h2>
        <p className="text-sm text-gray-400 mt-1">Choisissez votre hôtel et vos chambres.</p>
      </div>

      {/* Sélection hôtel */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Hôtel *</label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-72 overflow-y-auto pr-1">
          {hotels.map(h => (
            <button
              key={h.id}
              type="button"
              onClick={() => handleSelectHotel(h)}
              className={`text-left p-3 rounded-xl border-2 transition-all ${
                selectedHotel?.id === h.id
                  ? 'border-secondary bg-secondary/5'
                  : 'border-gray-100 hover:border-gray-200'
              }`}
            >
              {h.image_principale && (
                <img src={h.image_principale} alt={h.nom}
                  className="w-full h-24 object-cover rounded-lg mb-2" />
              )}
              <div className="flex items-start justify-between">
                <p className="font-semibold text-sm text-gray-800">{h.nom}</p>
                <div className="flex gap-0.5 flex-shrink-0 ml-2">
                  {Array.from({ length: h.etoiles || 3 }).map((_, i) => (
                    <Star key={i} size={10} className="text-amber-400 fill-amber-400" />
                  ))}
                </div>
              </div>
              {h.ville && <p className="text-xs text-gray-400 mt-0.5">{h.ville.nom}</p>}
            </button>
          ))}
        </div>
        {error && <p className="text-xs text-danger mt-1">{error}</p>}
      </div>

      {/* Types de chambre */}
      {selectedHotel && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Chambres à {selectedHotel.nom}
          </label>

          {loading ? (
            <p className="text-sm text-gray-400">Chargement des chambres…</p>
          ) : typeChambres.length === 0 ? (
            <p className="text-sm text-gray-400 bg-surface p-3 rounded-xl">
              Aucun type de chambre disponible pour cet hôtel.
            </p>
          ) : (
            <div className="space-y-2">
              {typeChambres.map(tc => {
                const qty        = getQty(tc.id)
                const prixNuit   = tc.pivot?.prix_par_nuit || 0
                const nbNuits    = wizard.dateDepart && wizard.dateRetour
                  ? Math.max(1, Math.ceil(
                      (new Date(wizard.dateRetour) - new Date(wizard.dateDepart)) / 86400000
                    ))
                  : 1

                return (
                  <div key={tc.id}
                    className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                      qty > 0 ? 'border-secondary/40 bg-secondary/5' : 'border-gray-100'
                    }`}
                  >
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-800">{tc.nom}</p>
                      <p className="text-xs text-gray-400">
                        Capacité : {tc.capacite_max} pers.
                        {prixNuit > 0 && ` · ${prixNuit} DH/nuit`}
                        {qty > 0 && ` · Sous-total : ${(prixNuit * qty * nbNuits).toLocaleString('fr-MA')} DH`}
                      </p>
                    </div>

                    {/* Compteur */}
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleQtyChange(tc, Math.max(0, qty - 1))}
                        className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-100 transition-colors text-gray-600"
                      >
                        −
                      </button>
                      <span className="w-6 text-center text-sm font-semibold">{qty}</span>
                      <button
                        type="button"
                        onClick={() => handleQtyChange(tc, qty + 1)}
                        className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-100 transition-colors text-gray-600"
                      >
                        +
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between pt-2">
        <Button variant="outline" onClick={() => dispatch(prevStep())}>← Retour</Button>
        <Button onClick={handleNext}>Suivant →</Button>
      </div>
    </div>
  )
}
