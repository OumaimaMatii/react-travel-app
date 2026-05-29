/**
 * SurMesureWizard.jsx – Page wizard "Voyage Sur Mesure".
 * Importation des 6 étapes depuis les composants wizard/.
 */

import React from 'react'
import { useSelector } from 'react-redux'
import { MapPin, Hotel, Zap, Plane, ArrowRight, CheckCircle } from 'lucide-react'
import Etape1Destination    from '../../components/wizard/Etape1Destination'
import Etape2Hotel          from '../../components/wizard/Etape2Hotel'
import Etape3Activites      from '../../components/wizard/Etape3Activites'
import Etape4TransportAller from '../../components/wizard/Etape4TransportAller'
import Etape5TransportRetour from '../../components/wizard/Etape5TransportRetour'
import Etape6Recapitulatif  from '../../components/wizard/Etape6Recapitulatif'

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
  const { wizard } = useSelector(s => s.surMesure)
  const currentStep    = wizard.currentStep
  const StepComponent  = STEP_COMPONENTS[currentStep]

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Titre */}
      <div>
        <h1 className="page-title">Créer mon voyage sur mesure</h1>
        <p className="text-sm text-gray-500">
          Personnalisez chaque aspect de votre voyage en quelques étapes simples.
        </p>
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
                    ${done   ? 'bg-emerald-500 text-white'  : ''}
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

      {/* Contenu de l'étape */}
      <div className="card p-6">
        {StepComponent && <StepComponent />}
      </div>
    </div>
  )
}
