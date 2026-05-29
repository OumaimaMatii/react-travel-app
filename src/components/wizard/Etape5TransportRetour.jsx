/**
 * Etape5TransportRetour.jsx – Sélection transport retour (optionnel).
 */

import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { setTransportRetour, nextStep, prevStep } from '../../store/slices/surMesureSlice'
import { ArrowRight, Plane, Bus, Train, SkipForward } from 'lucide-react'
import Button from '../common/Button'

function TransportIcon({ nom }) {
  const n = (nom || '').toLowerCase()
  if (n.includes('bus') || n.includes('car'))   return <Bus   size={18} className="text-secondary" />
  if (n.includes('train') || n.includes('tgv')) return <Train size={18} className="text-secondary" />
  return <Plane size={18} className="text-secondary" />
}

export default function Etape5TransportRetour() {
  const dispatch    = useDispatch()
  const { wizard, transports } = useSelector(s => s.surMesure)
  const totalPersonnes = wizard.nbAdultes + wizard.nbEnfants

  const handleSelect = (t) => dispatch(setTransportRetour(t))
  const handleSkip   = () => { dispatch(setTransportRetour(null)); dispatch(nextStep()) }
  const handleNext   = () => dispatch(nextStep())

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-display font-semibold text-primary flex items-center gap-2">
          <Plane size={20} className="text-secondary" /> Transport retour
        </h2>
        <p className="text-sm text-gray-400 mt-1">
          Optionnel – vers <span className="font-medium text-primary">{wizard.villeDepart?.nom || '—'}</span>
        </p>
      </div>

      {/* Même aller sélectionné par défaut */}
      {wizard.transportAller && (
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-sm text-blue-700 flex items-center gap-2">
          <Plane size={14} />
          Transport aller sélectionné : <strong>{wizard.transportAller.compagnie}</strong> ·{' '}
          {wizard.transportAller.depart} → {wizard.transportAller.arrivee}
        </div>
      )}

      {transports.length === 0 ? (
        <div className="bg-surface rounded-xl p-8 text-center">
          <p className="text-sm text-gray-400">Aucun transport retour disponible. Vous pouvez passer cette étape.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {/* Option "Pas de transport retour" */}
          <button
            type="button"
            onClick={() => dispatch(setTransportRetour(null))}
            className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
              wizard.transportRetour === null
                ? 'border-secondary bg-secondary/5'
                : 'border-gray-100 hover:border-gray-200'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <SkipForward size={18} className="text-gray-400" />
              </div>
              <div>
                <p className="font-semibold text-sm text-gray-700">Je n'ai pas besoin de transport retour</p>
                <p className="text-xs text-gray-400 mt-0.5">Arrangement personnel pour le retour</p>
              </div>
            </div>
          </button>

          {/* Transports disponibles */}
          {transports.map(t => {
            const selected  = wizard.transportRetour?.id === t.id
            const prixTotal = (t.prix || 0) * totalPersonnes

            return (
              <button
                key={t.id}
                type="button"
                onClick={() => handleSelect(t)}
                className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                  selected
                    ? 'border-secondary bg-secondary/5'
                    : 'border-gray-100 hover:border-gray-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-secondary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <TransportIcon nom={t.type?.nom || t.compagnie} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-gray-800">{t.compagnie}</p>
                    <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                      <span>{t.arrivee}</span>
                      <ArrowRight size={11} />
                      <span>{t.depart}</span>
                      {t.heure_depart && <span>· {t.heure_depart}</span>}
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-bold text-secondary text-sm">
                      {(t.prix || 0).toLocaleString('fr-MA')} DH/pers.
                    </p>
                    {totalPersonnes > 1 && (
                      <p className="text-xs text-gray-500 mt-0.5">
                        Total : {prixTotal.toLocaleString('fr-MA')} DH
                      </p>
                    )}
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between pt-2">
        <Button variant="outline" onClick={() => dispatch(prevStep())}>← Retour</Button>
        <Button onClick={handleNext}>Voir le récapitulatif →</Button>
      </div>
    </div>
  )
}
