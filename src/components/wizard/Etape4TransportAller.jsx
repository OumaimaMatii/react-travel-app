import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  setTransportAller, fetchTransports, nextStep, prevStep,
} from '../../store/slices/surMesureSlice'
import { Plane, Bus, Train, ArrowRight } from 'lucide-react'
import Button from '../common/Button'
import Loader from '../common/Loader'

function TransportIcon({ nom }) {
  const n = (nom || '').toLowerCase()
  if (n.includes('bus') || n.includes('car')) return <Bus size={18} className="text-secondary" />
  if (n.includes('train') || n.includes('tgv')) return <Train size={18} className="text-secondary" />
  return <Plane size={18} className="text-secondary" />
}

export default function Etape4TransportAller() {
  const dispatch = useDispatch()
  const { wizard, transports, loading } = useSelector(s => s.surMesure)
  const [error, setError] = useState('')

  useEffect(() => {
    const villeDepart = wizard.villeDepart?.nom || ''
    const villeArrivee = wizard.destination?.ville?.nom || wizard.destination?.nom || ''
    
    if (villeDepart) {
      dispatch(fetchTransports({ villeDepart, villeArrivee }))
    }
  }, [wizard.villeDepart, wizard.destination, dispatch])

  const handleSelect = (t) => {
    dispatch(setTransportAller(t))
    setError('')
  }

  const handleNext = () => {
    if (!wizard.transportAller) {
      setError('Veuillez sélectionner un transport aller.')
      return
    }
    dispatch(nextStep())
  }

  const totalPersonnes = (wizard.nbAdultes || 0) + (wizard.nbEnfants || 0)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-display font-semibold text-primary flex items-center gap-2">
          <Plane size={20} className="text-secondary" /> Transport aller
        </h2>
        <p className="text-sm text-gray-400 mt-1">
          Transports disponibles au départ de{' '}
          <span className="font-medium text-primary">{wizard.villeDepart?.nom || '—'}</span>
          {wizard.destination?.ville?.nom && (
            <> vers <span className="font-medium text-primary">{wizard.destination.ville.nom}</span></>
          )}
        </p>
      </div>

      {loading ? (
        <Loader />
      ) : transports.length === 0 ? (
        <div className="bg-surface rounded-xl p-8 text-center">
          <Plane size={32} className="text-gray-200 mx-auto mb-3" />
          <p className="text-sm text-gray-500 font-medium">Aucun transport disponible</p>
          <p className="text-xs text-gray-400 mt-1">
            depuis {wizard.villeDepart?.nom || 'la ville sélectionnée'}
            {wizard.destination?.ville?.nom && ` vers ${wizard.destination.ville.nom}`}.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {transports.map(t => {
            const selected = wizard.transportAller?.id === t.id
            const prixTotal = (t.prix || 0) * totalPersonnes

            return (
              <button
                key={t.id}
                type="button"
                onClick={() => handleSelect(t)}
                className={`w-full text-left p-4 rounded-xl border-2 transition-all ${selected
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
                      <span>{t.depart}</span>
                      <ArrowRight size={11} />
                      <span>{t.arrivee}</span>
                      {t.heure_depart && <span className="text-gray-400">· {t.heure_depart}</span>}
                    </div>
                    {t.type && <p className="text-xs text-gray-400 mt-0.5">{t.type.nom}</p>}
                    {t.places_disponibles > 0 && (
                      <p className="text-xs text-green-600 mt-0.5">{t.places_disponibles} places disponibles</p>
                    )}
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-bold text-secondary text-sm">
                      {(t.prix || 0).toLocaleString('fr-MA')} DH
                    </p>
                    <p className="text-xs text-gray-400">/pers.</p>
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

      {error && <p className="text-xs text-danger">{error}</p>}

      <div className="flex justify-between pt-2">
        <Button variant="outline" onClick={() => dispatch(prevStep())}>← Retour</Button>
        <Button onClick={handleNext}>Suivant →</Button>
      </div>
    </div>
  )
}