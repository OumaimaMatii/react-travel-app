/**
 * Etape3Activites.jsx – Sélection activités + nb voyageurs par activité.
 */

import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { toggleActivite, updateActiviteVoyageurs, nextStep, prevStep } from '../../store/slices/surMesureSlice'
import api from '../../services/api'
import { Zap, CheckCircle } from 'lucide-react'
import Button from '../common/Button'

export default function Etape3Activites() {
  const dispatch = useDispatch()
  const { wizard } = useSelector(s => s.surMesure)

  const [activitesList, setActivitesList] = useState([])
  const [loading,       setLoading]       = useState(true)

  useEffect(() => {
    setLoading(true)
    api.get('/activites')
      .then(r => setActivitesList(r.data?.data || r.data || []))
      .finally(() => setLoading(false))
  }, [])

  const isSelected = (id) => wizard.activites.some(a => a.activite_id === id)
  const getAct     = (id) => wizard.activites.find(a => a.activite_id === id)

  // Filtrer par destination si fournie
  const filteredActivites = wizard.destination?.id
    ? activitesList.filter(a => !a.destination_id || a.destination_id === wizard.destination.id)
    : activitesList

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-display font-semibold text-primary flex items-center gap-2">
          <Zap size={20} className="text-secondary" /> Activités
        </h2>
        <p className="text-sm text-gray-400 mt-1">
          Sélectionnez les activités souhaitées et précisez le nombre de participants.
          Cette étape est facultative.
        </p>
      </div>

      {loading ? (
        <p className="text-sm text-gray-400">Chargement des activités…</p>
      ) : filteredActivites.length === 0 ? (
        <div className="bg-surface rounded-xl p-6 text-center">
          <Zap size={28} className="text-gray-200 mx-auto mb-2" />
          <p className="text-sm text-gray-400">Aucune activité disponible pour cette destination.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredActivites.map(act => {
            const selected = isSelected(act.id)
            const actData  = getAct(act.id)

            return (
              <div key={act.id}
                className={`rounded-xl border-2 transition-all overflow-hidden ${
                  selected ? 'border-secondary' : 'border-gray-100'
                }`}
              >
                {/* En-tête activité */}
                <button
                  type="button"
                  onClick={() => dispatch(toggleActivite({
                    activite_id:    act.id,
                    nom:            act.nom,
                    prix:           act.prix,
                    adapte_enfants: act.adapte_enfants,
                  }))}
                  className="w-full flex items-center gap-3 p-3 text-left"
                >
                  {act.image && (
                    <img src={act.image} alt={act.nom}
                      className="w-14 h-14 rounded-lg object-cover flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800">{act.nom}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {act.prix} DH/adulte
                      {act.adapte_enfants && ' · Enfants : 50%'}
                    </p>
                    {act.description && (
                      <p className="text-xs text-gray-400 mt-0.5 truncate">{act.description}</p>
                    )}
                  </div>
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                    selected ? 'bg-secondary border-secondary' : 'border-gray-300'
                  }`}>
                    {selected && <CheckCircle size={14} className="text-white" />}
                  </div>
                </button>

                {/* Voyageurs par activité (visible si sélectionnée) */}
                {selected && (
                  <div className="border-t border-secondary/20 bg-secondary/5 px-4 py-3">
                    <p className="text-xs font-medium text-gray-600 mb-2">Participants à cette activité :</p>
                    <div className="flex gap-6">
                      <label className="flex items-center gap-2 text-xs text-gray-600">
                        Adultes :
                        <input
                          type="number"
                          min="0"
                          max={wizard.nbAdultes}
                          value={actData?.nb_adultes ?? wizard.nbAdultes}
                          onChange={e => dispatch(updateActiviteVoyageurs({
                            activite_id: act.id,
                            nb_adultes:  parseInt(e.target.value) || 0,
                            nb_enfants:  actData?.nb_enfants ?? 0,
                          }))}
                          className="w-16 input-field py-1 text-sm text-center"
                        />
                      </label>
                      {act.adapte_enfants && wizard.nbEnfants > 0 && (
                        <label className="flex items-center gap-2 text-xs text-gray-600">
                          Enfants :
                          <input
                            type="number"
                            min="0"
                            max={wizard.nbEnfants}
                            value={actData?.nb_enfants ?? 0}
                            onChange={e => dispatch(updateActiviteVoyageurs({
                              activite_id: act.id,
                              nb_adultes:  actData?.nb_adultes ?? wizard.nbAdultes,
                              nb_enfants:  parseInt(e.target.value) || 0,
                            }))}
                            className="w-16 input-field py-1 text-sm text-center"
                          />
                        </label>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Résumé activités sélectionnées */}
      {wizard.activites.length > 0 && (
        <div className="bg-secondary/5 rounded-xl p-3">
          <p className="text-xs font-semibold text-secondary mb-1">
            {wizard.activites.length} activité{wizard.activites.length > 1 ? 's' : ''} sélectionnée{wizard.activites.length > 1 ? 's' : ''}
          </p>
          {wizard.activites.map(a => {
            const total = (a.nb_adultes * a.prix) + ((a.nb_enfants || 0) * a.prix * 0.5)
            return (
              <p key={a.activite_id} className="text-xs text-gray-500">
                · {a.nom} — {total.toLocaleString('fr-MA')} DH
              </p>
            )
          })}
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between pt-2">
        <Button variant="outline" onClick={() => dispatch(prevStep())}>← Retour</Button>
        <Button onClick={() => dispatch(nextStep())}>
          {wizard.activites.length === 0 ? 'Passer →' : 'Suivant →'}
        </Button>
      </div>
    </div>
  )
}
