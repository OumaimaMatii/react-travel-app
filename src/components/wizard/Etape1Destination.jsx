import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  setDestination, setVilleDepart, setDates, setVoyageurs, nextStep,
} from '../../store/slices/surMesureSlice'
import api from '../../services/api'
import { MapPin, Calendar, Users } from 'lucide-react'
import Button from '../common/Button'

export default function Etape1Destination() {
  const dispatch = useDispatch()
  const { wizard } = useSelector(s => s.surMesure)

  const [destinations, setDestinations] = useState([])
  const [villes, setVilles] = useState([])
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(true)

  const [destId, setDestId] = useState(wizard.destination?.id || '')
  const [villeId, setVilleId] = useState(wizard.villeDepart?.id || '')
  const [dateDepart, setDateDepart] = useState(wizard.dateDepart || '')
  const [dateRetour, setDateRetour] = useState(wizard.dateRetour || '')
  const [nbAdultes, setNbAdultes] = useState(wizard.nbAdultes || 1)
  const [nbEnfants, setNbEnfants] = useState(wizard.nbEnfants || 0)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [destRes, villesRes] = await Promise.all([
          api.get('/destinations'),
          api.get('/villes')
        ])
        setDestinations(destRes.data?.data || destRes.data || [])
        setVilles(villesRes.data?.data || villesRes.data || [])
      } catch (err) {
        setErrors(prev => ({ ...prev, global: 'Erreur de chargement des données' }))
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const validate = () => {
    const errs = {}
    if (!destId) errs.destination = 'Veuillez choisir une destination.'
    if (!villeId) errs.ville = 'Veuillez choisir une ville de départ.'
    if (!dateDepart) errs.dateDepart = 'Date de départ requise.'
    if (!dateRetour) errs.dateRetour = 'Date de retour requise.'
    if (dateDepart && dateRetour && dateRetour <= dateDepart)
      errs.dateRetour = 'La date de retour doit être après la date de départ.'
    if (nbAdultes < 1) errs.voyageurs = 'Au moins 1 adulte requis.'
    return errs
  }

  const handleNext = () => {
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }

    const dest = destinations.find(d => d.id === parseInt(destId))
    const ville = villes.find(v => v.id === parseInt(villeId))

    dispatch(setDestination(dest))
    dispatch(setVilleDepart(ville))
    dispatch(setDates({ dateDepart, dateRetour }))
    dispatch(setVoyageurs({ nbAdultes: parseInt(nbAdultes), nbEnfants: parseInt(nbEnfants) }))
    dispatch(nextStep())
  }

  const today = new Date().toISOString().split('T')[0]

  if (loading) {
    return <div className="text-center py-8 text-gray-500">Chargement...</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-display font-semibold text-primary flex items-center gap-2">
          <MapPin size={20} className="text-secondary" /> Votre destination
        </h2>
        <p className="text-sm text-gray-400 mt-1">Où souhaitez-vous voyager ?</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Destination *</label>
        <select
          value={destId}
          onChange={e => setDestId(e.target.value)}
          className={`input-field ${errors.destination ? 'border-danger' : ''}`}
        >
          <option value="">Choisir une destination…</option>
          {destinations.map(d => (
            <option key={d.id} value={d.id}>{d.nom} – {d.pays}</option>
          ))}
        </select>
        {errors.destination && <p className="text-xs text-danger mt-1">{errors.destination}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Ville de départ *</label>
        <select
          value={villeId}
          onChange={e => setVilleId(e.target.value)}
          className={`input-field ${errors.ville ? 'border-danger' : ''}`}
        >
          <option value="">Choisir une ville…</option>
          {villes.map(v => (
            <option key={v.id} value={v.id}>{v.nom}</option>
          ))}
        </select>
        {errors.ville && <p className="text-xs text-danger mt-1">{errors.ville}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
            <Calendar size={14} className="text-secondary" /> Date de départ *
          </label>
          <input
            type="date"
            min={today}
            value={dateDepart}
            onChange={e => setDateDepart(e.target.value)}
            className={`input-field ${errors.dateDepart ? 'border-danger' : ''}`}
          />
          {errors.dateDepart && <p className="text-xs text-danger mt-1">{errors.dateDepart}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
            <Calendar size={14} className="text-secondary" /> Date de retour *
          </label>
          <input
            type="date"
            min={dateDepart || today}
            value={dateRetour}
            onChange={e => setDateRetour(e.target.value)}
            className={`input-field ${errors.dateRetour ? 'border-danger' : ''}`}
          />
          {errors.dateRetour && <p className="text-xs text-danger mt-1">{errors.dateRetour}</p>}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
          <Users size={14} className="text-secondary" /> Nombre de voyageurs *
        </label>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Adultes (≥ 12 ans)</label>
            <input
              type="number" min="1" max="50"
              value={nbAdultes}
              onChange={e => setNbAdultes(Math.max(1, parseInt(e.target.value) || 1))}
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Enfants (2–11 ans)</label>
            <input
              type="number" min="0" max="50"
              value={nbEnfants}
              onChange={e => setNbEnfants(Math.max(0, parseInt(e.target.value) || 0))}
              className="input-field"
            />
          </div>
        </div>
        {errors.voyageurs && <p className="text-xs text-danger mt-1">{errors.voyageurs}</p>}
      </div>

      <div className="flex justify-end">
        <Button onClick={handleNext}>Suivant →</Button>
      </div>
    </div>
  )
}