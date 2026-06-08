// src/pages/client/SurMesureWizard.jsx

import React, { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useLocation } from 'react-router-dom'
import { MapPin, Hotel, Zap, Plane, ArrowRight, CheckCircle, AlertTriangle } from 'lucide-react'
import {
  setDestination, setVilleDepart, setDates, setVoyageurs,
  setHotel, toggleActivite, setTransportAller, updateChambre, goToStep,
} from '../../store/slices/surMesureSlice'
import Etape1Destination    from '../../components/wizard/Etape1Destination'
import Etape2Hotel          from '../../components/wizard/Etape2Hotel'
import Etape3Activites      from '../../components/wizard/Etape3Activites'
import Etape4TransportAller from '../../components/wizard/Etape4TransportAller'
import Etape5TransportRetour from '../../components/wizard/Etape5TransportRetour'
import Etape6Recapitulatif  from '../../components/wizard/Etape6Recapitulatif'
import api from '../../services/api'

const STEPS = [
  { id: 1, label: 'Destination', icon: MapPin },
  { id: 2, label: 'Hôtel',       icon: Hotel },
  { id: 3, label: 'Activités',   icon: Zap },
  { id: 4, label: 'Aller',       icon: Plane },
  { id: 5, label: 'Retour',      icon: ArrowRight },
  { id: 6, label: 'Résumé',      icon: CheckCircle },
]

const STEP_COMPONENTS = {
  1: Etape1Destination,
  2: Etape2Hotel,
  3: Etape3Activites,
  4: Etape4TransportAller,
  5: Etape5TransportRetour,
  6: Etape6Recapitulatif,
}

export default function SurMesureWizard() {
  const dispatch = useDispatch()
  const location = useLocation()
  const { wizard } = useSelector(s => s.surMesure)
  const currentStep   = wizard.currentStep
  const StepComponent = STEP_COMPONENTS[currentStep]

  // ── Pré-remplissage depuis une réservation expirée ───────────────────────
  useEffect(() => {
    const prefill = location.state?.prefill
    if (!prefill) return

    // Remplir les données de l'étape 1
    if (prefill.destination) dispatch(setDestination(prefill.destination))
    if (prefill.villeDepart) dispatch(setVilleDepart(prefill.villeDepart))
    if (prefill.dateDepart || prefill.dateRetour) {
      dispatch(setDates({
        dateDepart: prefill.dateDepart || '',
        dateRetour: prefill.dateRetour || '',
      }))
    }
    if (prefill.nbAdultes) {
      dispatch(setVoyageurs({
        nbAdultes: prefill.nbAdultes || 1,
        nbEnfants: prefill.nbEnfants || 0,
      }))
    }

    // Pré-remplir l'hôtel si disponible
    if (prefill.hotel) dispatch(setHotel(prefill.hotel))

    // Pré-remplir les chambres si disponibles
    if (prefill.details_chambres?.length > 0) {
      prefill.details_chambres.forEach(detail => {
        if (detail.type_chambre) {
          dispatch(updateChambre({
            type_chambre_id: detail.type_chambre.id,
            nom: detail.type_chambre.nom,
            quantite: detail.quantite,
            prix_par_nuit: detail.prix_unitaire,
            capacite_max: detail.type_chambre.capacite_max || 2,
          }))
        }
      })
    }

    // Pré-remplir les activités
    if (prefill.activites?.length > 0) {
      prefill.activites.forEach(act => {
        dispatch(toggleActivite({
          activite_id: act.id,
          nom: act.nom,
          prix: act.prix,
          adapte_enfants: act.adapte_enfants || false,
        }))
      })
    }

    // Charger le transport depuis l'API si nécessaire
    const loadTransport = async () => {
      if (prefill.transport_id) {
        try {
          const res = await api.get(`/transports/${prefill.transport_id}`)
          dispatch(setTransportAller(res.data?.data || res.data))
        } catch (error) {
          console.error('Erreur chargement transport:', error)
        }
      }
    }
    loadTransport()

    // Aller à l'étape 1 pour vérification
    dispatch(goToStep(1))
  }, [location.state, dispatch])

  const hasPrefill = !!location.state?.prefill

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="page-title">
          {hasPrefill ? 'Refaire ma demande sur mesure' : 'Créer mon voyage sur mesure'}
        </h1>
        <p className="text-sm text-gray-500">
          {hasPrefill
            ? 'Vos anciennes informations ont été pré-remplies. Vérifiez et modifiez si nécessaire, notamment le transport.'
            : 'Personnalisez chaque aspect de votre voyage en quelques étapes simples.'
          }
        </p>
        {hasPrefill && (
          <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-700 flex items-start gap-2">
            <AlertTriangle size={16} className="flex-shrink-0 mt-0.5" />
            <span>
              Vérifiez la disponibilité du transport à l'étape 4. Si le transport précédent n'est plus disponible,
              choisissez-en un nouveau parmi les alternatives proposées.
            </span>
          </div>
        )}
      </div>

      {/* Indicateur d'étapes */}
      <div className="card p-4">
        <div className="flex items-center">
          {STEPS.map((step, i) => {
            const Icon  = step.icon
            const done  = currentStep > step.id
            const active = currentStep === step.id
            return (
              <React.Fragment key={step.id}>
                <div className="flex flex-col items-center">
                  <div className={`
                    w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300
                    ${done   ? 'bg-emerald-500 text-white'   : ''}
                    ${active ? 'bg-secondary text-white shadow-md' : ''}
                    ${!done && !active ? 'bg-gray-100 text-gray-400' : ''}
                  `}>
                    {done ? <CheckCircle size={16} /> : <Icon size={15} />}
                  </div>
                  <p className={`
                    text-xs mt-1 font-medium hidden md:block
                    ${active ? 'text-secondary' : done ? 'text-emerald-600' : 'text-gray-400'}
                  `}>
                    {step.label}
                  </p>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-2 transition-all duration-300 ${done ? 'bg-emerald-400' : 'bg-gray-100'}`} />
                )}
              </React.Fragment>
            )
          })}
        </div>
        <p className="text-center text-xs text-gray-400 mt-3 md:hidden">
          Étape {currentStep}/{STEPS.length} — {STEPS[currentStep - 1]?.label}
        </p>
      </div>

      <div className="card p-6">
        {StepComponent && <StepComponent />}
      </div>
    </div>
  )
}