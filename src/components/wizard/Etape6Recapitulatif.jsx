import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  submitSurMesure, fetchCommission, prevStep, resetWizard,
} from '../../store/slices/surMesureSlice'
import { useNavigate } from 'react-router-dom'
import Button from '../common/Button'
import Alert from '../common/Alert'
import {
  MapPin, Hotel, Zap, Plane, Calendar, Users,
  CheckCircle,
} from 'lucide-react'

export default function Etape6Recapitulatif() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { wizard, commission, loading, error, submitted, result } = useSelector(s => s.surMesure)

  useEffect(() => {
    dispatch(fetchCommission())
  }, [dispatch])

  const nbNuits = wizard.dateDepart && wizard.dateRetour
    ? Math.max(1, Math.ceil((new Date(wizard.dateRetour) - new Date(wizard.dateDepart)) / 86400000))
    : 0

  const prixHotel = wizard.chambres.reduce(
    (sum, c) => sum + (c.prix_par_nuit * c.quantite * nbNuits), 0
  )

  const prixActivites = wizard.activites.reduce((sum, a) => {
    return sum + (a.nb_adultes * a.prix) + ((a.nb_enfants || 0) * a.prix * 0.5)
  }, 0)

  const totalPersonnes = (wizard.nbAdultes || 0) + (wizard.nbEnfants || 0)
  const prixTranspAller = (wizard.transportAller?.prix || 0) * totalPersonnes
  const prixTranspRet = (wizard.transportRetour?.prix || 0) * totalPersonnes
  const prixTransport = prixTranspAller + prixTranspRet

  const sousTotal = prixHotel + prixActivites + prixTransport
  const montantComm = Math.round(sousTotal * commission / 100 * 100) / 100
  const total = Math.round((sousTotal + montantComm) * 100) / 100

  const handleSubmit = () => {
    const payload = {
      destination_id: wizard.destination?.id,
      ville_depart_id: wizard.villeDepart?.id,
      date_depart: wizard.dateDepart,
      date_retour: wizard.dateRetour,
      nb_adultes: wizard.nbAdultes,
      nb_enfants: wizard.nbEnfants || 0,
      hotel_id: wizard.hotel?.id || null,
      chambres: wizard.chambres.map(c => ({
        type_chambre_id: c.type_chambre_id,
        quantite: c.quantite,
      })),
      activites: wizard.activites.map(a => ({
        activite_id: a.activite_id,
        nb_adultes: a.nb_adultes,
        nb_enfants: a.nb_enfants || 0,
      })),
      transport_id: wizard.transportAller?.id || null,
      budget_estime: total,
    }
    dispatch(submitSurMesure(payload))
  }

  if (submitted) {
    return (
      <div className="text-center py-10 space-y-4">
        <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle size={32} className="text-emerald-600" />
        </div>
        <h2 className="text-xl font-display font-bold text-primary">Demande envoyée !</h2>
        <p className="text-sm text-gray-500 max-w-sm mx-auto">
          Votre demande de voyage sur mesure a été créée. Un agent vous contactera très prochainement
          pour finaliser les détails.
        </p>
        {result?.reservation?.id && (
          <p className="text-xs text-gray-400">Réservation #{result.reservation.id}</p>
        )}
        <div className="flex gap-3 justify-center pt-2">
          <Button
            variant="outline"
            onClick={() => { dispatch(resetWizard()); navigate('/client/reservations') }}
          >
            Voir mes réservations
          </Button>
          <Button onClick={() => { dispatch(resetWizard()) }}>
            Nouvelle demande
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-display font-semibold text-primary">Récapitulatif</h2>
        <p className="text-sm text-gray-400 mt-0.5">Vérifiez les détails avant de soumettre votre demande.</p>
      </div>

      {error && (
        <Alert
          type="error"
          message={typeof error === 'string' ? error : error.message || 'Une erreur est survenue.'}
        />
      )}

      <Section icon={<MapPin size={16} className="text-secondary" />} title="Voyage">
        <Row label="Destination" value={`${wizard.destination?.nom}, ${wizard.destination?.pays}`} />
        <Row label="Départ de" value={wizard.villeDepart?.nom} />
        <Row label="Date départ" value={wizard.dateDepart} />
        <Row label="Date retour" value={wizard.dateRetour} />
        <Row label="Durée" value={`${nbNuits} nuit${nbNuits > 1 ? 's' : ''}`} />
        <Row label="Voyageurs" value={`${wizard.nbAdultes} adulte${wizard.nbAdultes > 1 ? 's' : ''}${wizard.nbEnfants > 0 ? ` + ${wizard.nbEnfants} enfant${wizard.nbEnfants > 1 ? 's' : ''}` : ''}`} />
      </Section>

      {wizard.hotel && (
        <Section icon={<Hotel size={16} className="text-secondary" />} title="Hébergement">
          <Row label="Hôtel" value={`${'★'.repeat(wizard.hotel.etoiles || 3)} ${wizard.hotel.nom}`} />
          {wizard.chambres.map((c, i) => (
            <Row
              key={i}
              label={c.nom}
              value={`${c.quantite} × ${c.prix_par_nuit} DH/nuit × ${nbNuits} nuits = ${(c.prix_par_nuit * c.quantite * nbNuits).toLocaleString('fr-MA')} DH`}
            />
          ))}
          <Row label="Sous-total hôtel" value={`${prixHotel.toLocaleString('fr-MA')} DH`} bold />
        </Section>
      )}

      {wizard.activites.length > 0 && (
        <Section icon={<Zap size={16} className="text-secondary" />} title="Activités">
          {wizard.activites.map((a, i) => {
            const st = (a.nb_adultes * a.prix) + ((a.nb_enfants || 0) * a.prix * 0.5)
            return (
              <Row
                key={i}
                label={a.nom}
                value={`${a.nb_adultes}A${a.nb_enfants > 0 ? ` + ${a.nb_enfants}E` : ''} = ${st.toLocaleString('fr-MA')} DH`}
              />
            )
          })}
          <Row label="Sous-total activités" value={`${prixActivites.toLocaleString('fr-MA')} DH`} bold />
        </Section>
      )}

      <Section icon={<Plane size={16} className="text-secondary" />} title="Transport">
        {wizard.transportAller ? (
          <Row
            label={`Aller (${wizard.transportAller.compagnie})`}
            value={`${wizard.transportAller.prix} DH × ${totalPersonnes} = ${prixTranspAller.toLocaleString('fr-MA')} DH`}
          />
        ) : (
          <p className="text-xs text-gray-400 italic">Pas de transport aller sélectionné</p>
        )}
        {wizard.transportRetour && (
          <Row
            label={`Retour (${wizard.transportRetour.compagnie})`}
            value={`${wizard.transportRetour.prix} DH × ${totalPersonnes} = ${prixTranspRet.toLocaleString('fr-MA')} DH`}
          />
        )}
        <Row label="Sous-total transport" value={`${prixTransport.toLocaleString('fr-MA')} DH`} bold />
      </Section>

      <div className="bg-primary/5 border border-primary/10 rounded-xl p-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Sous-total</span>
          <span className="font-medium">{sousTotal.toLocaleString('fr-MA')} DH</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Commission agence ({commission}%)</span>
          <span className="font-medium">{montantComm.toLocaleString('fr-MA')} DH</span>
        </div>
        <div className="flex justify-between text-base font-bold border-t border-primary/10 pt-2 mt-1">
          <span className="text-primary">Total estimé</span>
          <span className="text-secondary">{total.toLocaleString('fr-MA')} DH</span>
        </div>
        <p className="text-xs text-gray-400 mt-1">
          * Ce montant est une estimation. Le prix final sera confirmé par l'agent.
        </p>
      </div>

      <div className="flex justify-between pt-2">
        <Button variant="outline" onClick={() => dispatch(prevStep())}>← Retour</Button>
        <Button onClick={handleSubmit} loading={loading}>
          {loading ? 'Envoi en cours…' : 'Soumettre ma demande'}
        </Button>
      </div>
    </div>
  )
}

function Section({ icon, title, children }) {
  return (
    <div className="bg-surface rounded-xl p-4">
      <h3 className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 mb-3">
        {icon} {title}
      </h3>
      <div className="space-y-1.5">{children}</div>
    </div>
  )
}

function Row({ label, value, bold }) {
  return (
    <div className="flex items-center justify-between gap-4 text-sm">
      <span className="text-gray-500">{label}</span>
      <span className={`text-right ${bold ? 'font-bold text-primary' : 'text-gray-700'}`}>
        {value || '—'}
      </span>
    </div>
  )
}