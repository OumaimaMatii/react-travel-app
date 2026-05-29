/**
 * ReservationForm.jsx – Formulaire de réservation d'un forfait standard.
 * Corrigé :
 *  - Gestion propre des voyageurs dynamiques
 *  - Validation frontend complète
 *  - Affichage erreurs serveur (422)
 */

import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import Button from '../common/Button'
import { formatPrice } from '../../utils/formatPrice'
import { Plus, Trash2, User } from 'lucide-react'

const SEXES = [
  { value: 'homme', label: 'Homme' },
  { value: 'femme', label: 'Femme' },
]

function emptyVoyageur() {
  return { nom_complet: '', date_naissance: '', sexe: 'homme', numero_passeport: '' }
}

export default function ReservationForm({ forfait, onSubmit, loading }) {
  const { token } = useSelector(s => s.auth)

  const [nbAdultes,  setNbAdultes]  = useState(1)
  const [nbEnfants,  setNbEnfants]  = useState(0)
  const [voyageurs,  setVoyageurs]  = useState([emptyVoyageur()])
  const [errors,     setErrors]     = useState({})

  // ── Synchro voyageurs <-> nbAdultes + nbEnfants ──────────────────────────
  const handleNbAdultes = (val) => {
    const n = Math.max(1, parseInt(val) || 1)
    setNbAdultes(n)
    const total = n + nbEnfants
    setVoyageurs(prev => {
      if (prev.length < total) return [...prev, ...Array.from({ length: total - prev.length }, emptyVoyageur)]
      return prev.slice(0, total)
    })
  }

  const handleNbEnfants = (val) => {
    const n = Math.max(0, parseInt(val) || 0)
    setNbEnfants(n)
    const total = nbAdultes + n
    setVoyageurs(prev => {
      if (prev.length < total) return [...prev, ...Array.from({ length: total - prev.length }, emptyVoyageur)]
      return prev.slice(0, total)
    })
  }

  const updateVoyageur = (idx, field, val) => {
    setVoyageurs(prev => prev.map((v, i) => i === idx ? { ...v, [field]: val } : v))
  }

  // ── Validation ────────────────────────────────────────────────────────────
  const validate = () => {
    const errs = {}
    if (nbAdultes < 1) errs.nbAdultes = 'Au moins 1 adulte requis.'
    if (forfait.places_restantes < nbAdultes + nbEnfants) {
      errs.places = `Seulement ${forfait.places_restantes} place(s) disponible(s).`
    }
    voyageurs.forEach((v, i) => {
      if (!v.nom_complet.trim()) errs[`v_nom_${i}`]  = 'Nom requis.'
      if (!v.date_naissance)     errs[`v_ddn_${i}`]  = 'Date de naissance requise.'
      if (!v.sexe)               errs[`v_sexe_${i}`] = 'Sexe requis.'
    })
    return errs
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setErrors({})

    onSubmit({
      voyage_forfait_id: forfait.id,
      nb_adultes:        nbAdultes,
      nb_enfants:        nbEnfants,
      voyageurs:         voyageurs.map(v => ({
        nom_complet:      v.nom_complet.trim(),
        date_naissance:   v.date_naissance,
        sexe:             v.sexe,
        numero_passeport: v.numero_passeport.trim() || undefined,
      })),
    })
  }

  const prixTotal = forfait
    ? forfait.prix_adulte * nbAdultes + (forfait.prix_enfant ?? forfait.prix_adulte * 0.5) * nbEnfants
    : 0

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Nombre de voyageurs */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Adultes *</label>
          <input
            type="number" min="1"
            max={forfait?.places_restantes || 99}
            value={nbAdultes}
            onChange={e => handleNbAdultes(e.target.value)}
            className={`input-field ${errors.nbAdultes ? 'border-danger' : ''}`}
          />
          {errors.nbAdultes && <p className="text-xs text-danger mt-1">{errors.nbAdultes}</p>}
          {forfait?.prix_adulte && (
            <p className="text-xs text-gray-400 mt-1">{formatPrice(forfait.prix_adulte)} / adulte</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Enfants</label>
          <input
            type="number" min="0"
            max={Math.max(0, (forfait?.places_restantes || 99) - nbAdultes)}
            value={nbEnfants}
            onChange={e => handleNbEnfants(e.target.value)}
            className="input-field"
          />
          {forfait?.prix_enfant && (
            <p className="text-xs text-gray-400 mt-1">{formatPrice(forfait.prix_enfant)} / enfant</p>
          )}
        </div>
      </div>

      {errors.places && (
        <p className="text-sm text-danger bg-red-50 border border-red-100 rounded-lg px-3 py-2">
          {errors.places}
        </p>
      )}

      {/* Prix estimé */}
      <div className="bg-secondary/5 border border-secondary/20 rounded-xl p-3 flex justify-between items-center">
        <span className="text-sm text-gray-600">Montant estimé</span>
        <span className="font-bold text-secondary text-lg">{formatPrice(prixTotal)}</span>
      </div>

      {/* Voyageurs */}
      <div>
        <p className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-1.5">
          <User size={15} className="text-secondary" />
          Informations des voyageurs ({voyageurs.length})
        </p>

        <div className="space-y-4">
          {voyageurs.map((v, i) => (
            <div key={i} className="bg-surface rounded-xl p-4 space-y-3">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                {i < nbAdultes ? `Adulte ${i + 1}` : `Enfant ${i - nbAdultes + 1}`}
              </p>

              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs text-gray-500 mb-1">Nom complet *</label>
                  <input
                    type="text"
                    value={v.nom_complet}
                    onChange={e => updateVoyageur(i, 'nom_complet', e.target.value)}
                    className={`input-field text-sm py-2 ${errors[`v_nom_${i}`] ? 'border-danger' : ''}`}
                    placeholder="Prénom NOM"
                  />
                  {errors[`v_nom_${i}`] && (
                    <p className="text-xs text-danger mt-0.5">{errors[`v_nom_${i}`]}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs text-gray-500 mb-1">Date de naissance *</label>
                  <input
                    type="date"
                    value={v.date_naissance}
                    onChange={e => updateVoyageur(i, 'date_naissance', e.target.value)}
                    className={`input-field text-sm py-2 ${errors[`v_ddn_${i}`] ? 'border-danger' : ''}`}
                  />
                  {errors[`v_ddn_${i}`] && (
                    <p className="text-xs text-danger mt-0.5">{errors[`v_ddn_${i}`]}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs text-gray-500 mb-1">Sexe *</label>
                  <select
                    value={v.sexe}
                    onChange={e => updateVoyageur(i, 'sexe', e.target.value)}
                    className="input-field text-sm py-2"
                  >
                    {SEXES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="block text-xs text-gray-500 mb-1">Numéro passeport</label>
                  <input
                    type="text"
                    value={v.numero_passeport}
                    onChange={e => updateVoyageur(i, 'numero_passeport', e.target.value)}
                    className="input-field text-sm py-2"
                    placeholder="Optionnel"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Button type="submit" loading={loading} className="w-full">
        Réserver maintenant
      </Button>

      <p className="text-xs text-center text-gray-400">
        Vous aurez 1 heure pour confirmer votre réservation après création.
      </p>
    </form>
  )
}
