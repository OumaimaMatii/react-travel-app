/**
 * ReservationDetail.jsx – Vue client d'une réservation.
 * Corrigé :
 *  - Utilise le champ `details` (alias de details_chambres) depuis la resource
 *  - confirmation_deadline exposé correctement
 *  - Gestion propre du timer
 */

import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import {
  fetchReservation, fetchReservationDetails,
  annulerReservation, confirmerReservation,
} from '../../store/slices/reservationSlice'
import Badge from '../../components/common/Badge'
import Loader from '../../components/common/Loader'
import Alert from '../../components/common/Alert'
import Button from '../../components/common/Button'
import { formatDate } from '../../utils/formatDate'
import { formatPrice } from '../../utils/formatPrice'
import {
  Calendar, MapPin, Users, FileText, Download, ArrowLeft,
  AlertTriangle, User, Clock, CheckCircle, CreditCard, Hotel,
} from 'lucide-react'
import api from '../../services/api'

export default function ReservationDetail() {
  const { id }     = useParams()
  const dispatch   = useDispatch()
  const navigate   = useNavigate()
  const { current: reservation, details, loading } = useSelector(s => s.reservations)

  const [docs,          setDocs]          = useState([])
  const [annulLoading,  setAnnulLoading]  = useState(false)
  const [confirmLoading,setConfirmLoading]= useState(false)
  const [alert,         setAlert]         = useState(null)
  const [confirmAnnul,  setConfirmAnnul]  = useState(false)
  const [modePaiement,  setModePaiement]  = useState('carte')
  const [deadlineLeft,  setDeadlineLeft]  = useState(null)

  useEffect(() => {
    if (id) {
      dispatch(fetchReservation(id))
      dispatch(fetchReservationDetails(id))
      api.get(`/client/reservations/${id}/documents`)
        .then(r => setDocs(r.data?.data || []))
        .catch(() => {})
    }
  }, [id, dispatch])

  // Timer compte à rebours
  useEffect(() => {
    if (!reservation?.confirmation_deadline) { setDeadlineLeft(null); return }
    const deadline = new Date(reservation.confirmation_deadline)

    const tick = () => {
      const diff = deadline - Date.now()
      if (diff <= 0) { setDeadlineLeft(null); return }
      const h = Math.floor(diff / 3600000)
      const m = Math.floor((diff % 3600000) / 60000)
      const s = Math.floor((diff % 60000) / 1000)
      setDeadlineLeft(`${h}h ${String(m).padStart(2,'0')}m ${String(s).padStart(2,'0')}s`)
    }
    tick()
    const iv = setInterval(tick, 1000)
    return () => clearInterval(iv)
  }, [reservation?.confirmation_deadline])

  const handleAnnuler = async () => {
    setAnnulLoading(true)
    try {
      await dispatch(annulerReservation(id)).unwrap()
      setAlert({ type: 'success', message: 'Réservation annulée avec succès.' })
      setConfirmAnnul(false)
    } catch (e) {
      setAlert({ type: 'error', message: e?.message || 'Impossible d\'annuler.' })
    } finally {
      setAnnulLoading(false)
    }
  }

  const handleConfirmer = async () => {
    setConfirmLoading(true)
    try {
      await dispatch(confirmerReservation({ id, data: { mode_paiement: modePaiement } })).unwrap()
      setAlert({ type: 'success', message: '✅ Réservation confirmée ! Bon voyage !' })
      dispatch(fetchReservation(id))
    } catch (e) {
      setAlert({ type: 'error', message: e?.message || 'Erreur lors de la confirmation.' })
    } finally {
      setConfirmLoading(false)
    }
  }

  const parseMontant = (m) =>
    typeof m === 'string' ? parseFloat(m.replace(/\s/g,'').replace(',','.')) : (m || 0)

  if (loading) return <Loader />
  if (!reservation) return (
    <div className="text-center py-20 text-gray-400">
      <p>Réservation introuvable.</p>
      <button onClick={() => navigate('/client/reservations')} className="mt-4 text-secondary text-sm">
        ← Retour
      </button>
    </div>
  )

  const dest    = reservation.voyage?.destination
  const voyage  = reservation.voyage
  const isEnAtt = ['en_attente', 'en_attente_confirmation'].includes(reservation.statut)
  const canConf = reservation.statut === 'en_attente_confirmation' && deadlineLeft

  // Utilise details de la resource (alias details_chambres)
  const detailsChambres = details || reservation.details || reservation.details_chambres || []
  const totalChambres   = detailsChambres.reduce(
    (sum, d) => sum + (d.prix_unitaire * d.quantite), 0
  )

  return (
    <div className="space-y-6 max-w-3xl">
      {/* En-tête */}
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/client/reservations')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <ArrowLeft size={18} className="text-gray-500" />
        </button>
        <div>
          <h1 className="page-title mb-0">Réservation #{reservation.id}</h1>
          <p className="text-sm text-gray-400">Détail complet de votre réservation</p>
        </div>
      </div>

      {alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}

      {/* Alerte délai */}
      {canConf && (
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 flex items-start gap-3">
          <Clock size={18} className="text-orange-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-orange-800">Confirmation requise</p>
            <p className="text-sm text-orange-600 mt-0.5">
              Temps restant : <span className="font-bold font-mono">{deadlineLeft}</span>
            </p>
            <p className="text-xs text-orange-500 mt-1">
              Passé ce délai, votre réservation sera automatiquement annulée.
            </p>
          </div>
        </div>
      )}

      {/* Statut & actions */}
      <div className="card p-5">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-surface rounded-xl flex items-center justify-center">
              <Calendar size={18} className="text-secondary" />
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">Statut</p>
              <Badge statut={reservation.statut} />
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {isEnAtt && !confirmAnnul && (
              <button onClick={() => setConfirmAnnul(true)}
                className="flex items-center gap-1.5 text-sm text-danger border border-red-200 px-4 py-2 rounded-lg hover:bg-red-50 transition-colors">
                <AlertTriangle size={14} /> Annuler
              </button>
            )}
            {confirmAnnul && (
              <div className="flex items-center gap-2">
                <p className="text-sm text-gray-600">Confirmer l'annulation ?</p>
                <Button variant="danger" size="sm" onClick={handleAnnuler} loading={annulLoading}>
                  Oui, annuler
                </Button>
                <button onClick={() => setConfirmAnnul(false)}
                  className="text-sm text-gray-500 px-3 py-1.5 hover:bg-gray-100 rounded-lg">
                  Non
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Section paiement (uniquement si en attente de confirmation) */}
        {canConf && (
          <div className="mt-4 pt-4 border-t border-gray-100 space-y-3">
            <p className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
              <CreditCard size={15} className="text-secondary" /> Confirmer votre réservation
            </p>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Mode de paiement</label>
              <select
                className="input-field text-sm"
                value={modePaiement}
                onChange={e => setModePaiement(e.target.value)}
              >
                <option value="carte">Carte bancaire</option>
                <option value="virement">Virement bancaire</option>
                <option value="especes">Espèces (en agence)</option>
                <option value="cheque">Chèque</option>
              </select>
            </div>
            <Button icon={CheckCircle} onClick={handleConfirmer} loading={confirmLoading} className="w-full">
              Confirmer et payer {reservation.montant_total ? formatPrice(parseMontant(reservation.montant_total)) : ''}
            </Button>
          </div>
        )}
      </div>

      {/* Infos voyage */}
      <div className="card p-6 space-y-4">
        <h2 className="font-display font-semibold text-primary">Informations du voyage</h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="space-y-3">
            {dest && (
              <div>
                <p className="text-xs text-gray-400 mb-0.5">Destination</p>
                <p className="font-medium flex items-center gap-1">
                  <MapPin size={13} className="text-secondary" />{dest.nom}, {dest.pays}
                </p>
              </div>
            )}
            {voyage?.date_depart && (
              <div>
                <p className="text-xs text-gray-400 mb-0.5">Date de départ</p>
                <p className="font-medium">{formatDate(voyage.date_depart)}</p>
              </div>
            )}
            {voyage?.date_retour && (
              <div>
                <p className="text-xs text-gray-400 mb-0.5">Date de retour</p>
                <p className="font-medium">{formatDate(voyage.date_retour)}</p>
              </div>
            )}
          </div>
          <div className="space-y-3">
            <div>
              <p className="text-xs text-gray-400 mb-0.5">Voyageurs</p>
              <p className="font-medium flex items-center gap-1">
                <Users size={13} className="text-secondary" />
                {reservation.nb_adultes} adulte{reservation.nb_adultes > 1 ? 's' : ''}
                {reservation.nb_enfants > 0 ? `, ${reservation.nb_enfants} enfant${reservation.nb_enfants > 1 ? 's' : ''}` : ''}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-0.5">Date de réservation</p>
              <p className="font-medium">{formatDate(reservation.date_reservation)}</p>
            </div>
            {reservation.montant_total && (
              <div>
                <p className="text-xs text-gray-400 mb-0.5">Montant total</p>
                <p className="font-bold text-secondary text-lg">
                  {formatPrice(parseMontant(reservation.montant_total))}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Chambres */}
      {detailsChambres.length > 0 && (
        <div className="card p-6">
          <h2 className="font-display font-semibold text-primary mb-4 flex items-center gap-2">
            <Hotel size={18} className="text-secondary" /> Hébergement
          </h2>
          <div className="space-y-2">
            {detailsChambres.map((d, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-surface rounded-xl">
                <div>
                  <p className="font-medium text-sm">{d.hotel?.nom}</p>
                  <p className="text-xs text-gray-500">
                    {d.type_chambre?.nom} × {d.quantite} nuit(s)
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-secondary">{formatPrice(d.prix_unitaire)}</p>
                  <p className="text-xs text-gray-400">/nuit</p>
                </div>
              </div>
            ))}
          </div>
          {totalChambres > 0 && (
            <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between">
              <p className="text-sm font-semibold text-gray-700">Total hébergement</p>
              <p className="text-sm font-bold text-secondary">{formatPrice(totalChambres)}</p>
            </div>
          )}
        </div>
      )}

      {/* Voyageurs */}
      {reservation.voyageurs?.length > 0 && (
        <div className="card p-6">
          <h2 className="font-display font-semibold text-primary mb-4 flex items-center gap-2">
            <User size={18} className="text-secondary" /> Voyageurs
          </h2>
          <div className="space-y-2">
            {reservation.voyageurs.map((v, i) => (
              <div key={v.id || i} className="flex items-center gap-4 p-3 bg-surface rounded-xl">
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold text-sm flex-shrink-0">
                  {i + 1}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm">{v.nom_complet}</p>
                  <p className="text-xs text-gray-400 capitalize">
                    {v.sexe} · Né(e) le {formatDate(v.date_naissance)}
                  </p>
                </div>
                {v.numero_passeport && (
                  <p className="text-xs text-gray-400 font-mono">Passeport : {v.numero_passeport}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Documents */}
      <div className="card p-6">
        <h2 className="font-display font-semibold text-primary mb-4 flex items-center gap-2">
          <FileText size={18} className="text-secondary" /> Documents de voyage
        </h2>
        {docs.length === 0 ? (
          <div className="text-center py-6">
            <FileText size={32} className="text-gray-200 mx-auto mb-2" />
            <p className="text-sm text-gray-400">Aucun document disponible</p>
            <p className="text-xs text-gray-300 mt-1">L'agent ajoutera vos billets et confirmations ici</p>
          </div>
        ) : (
          <div className="space-y-2">
            {docs.map(doc => (
              <div key={doc.id} className="flex items-center gap-3 p-3 bg-surface rounded-xl">
                <div className="w-9 h-9 bg-secondary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <FileText size={16} className="text-secondary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{doc.titre}</p>
                  <p className="text-xs text-gray-400">{doc.nom_fichier_original} · {doc.taille} Ko</p>
                </div>
                <a
                  href={`${import.meta.env.VITE_API_URL}/documents/${doc.id}/download`}
                  target="_blank" rel="noreferrer"
                  className="flex items-center gap-1.5 text-xs text-secondary font-medium hover:text-secondary-dark px-3 py-1.5 border border-secondary/30 rounded-lg hover:bg-secondary/5 transition-colors"
                >
                  <Download size={13} /> Télécharger
                </a>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
