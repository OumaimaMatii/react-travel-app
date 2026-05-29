/**
 * ReservationDetailAgent.jsx – Vue agent des détails d'une réservation.
 * Différences par rapport à la vue client :
 *   ✗ Pas de section paiement / confirmation
 *   ✗ Pas de bouton "Confirmer et payer"
 *   ✓ Infos complètes sur le client et les voyageurs
 *   ✓ Upload de documents
 *   ✓ Lien vers la liste des réservations du forfait
 */

import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { fetchReservationAgent } from '../../store/slices/reservationSlice'
import Badge from '../../components/common/Badge'
import Loader from '../../components/common/Loader'
import Alert from '../../components/common/Alert'
import Button from '../../components/common/Button'
import { formatDate } from '../../utils/formatDate'
import { formatPrice } from '../../utils/formatPrice'
import api from '../../services/api'
import {
  ArrowLeft, MapPin, Calendar, Users, FileText,
  Download, Upload, Hotel, User, Star, Trash2,
} from 'lucide-react'

export default function ReservationDetailAgent() {
  const { id }     = useParams()
  const dispatch   = useDispatch()
  const navigate   = useNavigate()
  const { current: reservation, loading } = useSelector(s => s.reservations)

  const [docs,          setDocs]          = useState([])
  const [uploading,     setUploading]     = useState(false)
  const [uploadAlert,   setUploadAlert]   = useState(null)
  const [uploadData,    setUploadData]    = useState({ titre: '', type: 'autre', file: null })

  useEffect(() => {
    if (id) {
      dispatch(fetchReservationAgent(id))
      loadDocs()
    }
  }, [id])

  const loadDocs = async () => {
    try {
      const res = await api.get(`/agent/reservations/${id}/documents`)
      setDocs(res.data?.data || [])
    } catch { /* silencieux */ }
  }

  const handleUpload = async (e) => {
    e.preventDefault()
    if (!uploadData.file || !uploadData.titre) return

    setUploading(true)
    setUploadAlert(null)
    try {
      const form = new FormData()
      form.append('document', uploadData.file)
      form.append('titre',    uploadData.titre)
      form.append('type',     uploadData.type)

      await api.post(`/agent/reservations/${id}/documents`, form)
      setUploadAlert({ type: 'success', message: 'Document ajouté avec succès.' })
      setUploadData({ titre: '', type: 'autre', file: null })
      loadDocs()
    } catch (err) {
      setUploadAlert({ type: 'error', message: err.message || 'Erreur lors de l\'upload.' })
    } finally {
      setUploading(false)
    }
  }

  const handleDeleteDoc = async (docId) => {
    try {
      await api.delete(`/agent/documents/${docId}`)
      setDocs(prev => prev.filter(d => d.id !== docId))
    } catch {
      setUploadAlert({ type: 'error', message: 'Impossible de supprimer le document.' })
    }
  }

  if (loading) return <Loader />
  if (!reservation) return (
    <div className="text-center py-20 text-gray-400">
      <p>Réservation introuvable.</p>
      <button onClick={() => navigate(-1)} className="mt-4 text-secondary text-sm">← Retour</button>
    </div>
  )

  const dest   = reservation.voyage?.destination
  const voyage = reservation.voyage

  const parseMontant = (m) =>
    typeof m === 'string' ? parseFloat(m.replace(/\s/g, '').replace(',', '.')) : (m || 0)

  return (
    <div className="space-y-6 max-w-3xl">
      {/* En-tête */}
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <ArrowLeft size={18} className="text-gray-500" />
        </button>
        <div>
          <h1 className="page-title mb-0">Réservation #{reservation.id}</h1>
          <p className="text-sm text-gray-400">Vue agent – informations complètes</p>
        </div>
      </div>

      {uploadAlert && (
        <Alert type={uploadAlert.type} message={uploadAlert.message} onClose={() => setUploadAlert(null)} />
      )}

      {/* Statut */}
      <div className="card p-5 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-surface rounded-xl flex items-center justify-center">
            <Calendar size={18} className="text-secondary" />
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-1">Statut</p>
            <Badge statut={reservation.statut} />
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-400">Montant total</p>
          <p className="text-xl font-bold text-secondary">
            {reservation.montant_total ? formatPrice(parseMontant(reservation.montant_total)) : '—'}
          </p>
        </div>
      </div>

      {/* Infos client */}
      <div className="card p-6">
        <h2 className="font-display font-semibold text-primary mb-4 flex items-center gap-2">
          <User size={18} className="text-secondary" /> Client
        </h2>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold text-lg">
            {reservation.client?.name?.charAt(0) || '?'}
          </div>
          <div>
            <p className="font-semibold text-gray-800">{reservation.client?.name}</p>
            <p className="text-sm text-gray-400">{reservation.client?.email}</p>
          </div>
        </div>
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
              <p className="text-xs text-gray-400 mb-0.5">Réservé le</p>
              <p className="font-medium">{formatDate(reservation.date_reservation)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-0.5">Type</p>
              <p className="font-medium capitalize">{reservation.type_verification || '—'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Détail chambres */}
      {reservation.details?.length > 0 && (
        <div className="card p-6">
          <h2 className="font-display font-semibold text-primary mb-4 flex items-center gap-2">
            <Hotel size={18} className="text-secondary" /> Chambres
          </h2>
          <div className="space-y-2">
            {reservation.details.map((d, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-surface rounded-xl">
                <div>
                  <p className="font-medium text-sm">{d.hotel?.nom}</p>
                  <p className="text-xs text-gray-500">
                    {d.type_chambre?.nom} × {d.quantite} nuit(s)
                  </p>
                </div>
                <p className="font-bold text-secondary text-sm">{formatPrice(d.prix_unitaire)}/nuit</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Voyageurs */}
      {reservation.voyageurs?.length > 0 && (
        <div className="card p-6">
          <h2 className="font-display font-semibold text-primary mb-4 flex items-center gap-2">
            <Users size={18} className="text-secondary" /> Liste des voyageurs
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

        {/* Upload */}
        <form onSubmit={handleUpload} className="bg-surface rounded-xl p-4 mb-4 space-y-3">
          <p className="text-sm font-medium text-gray-700">Ajouter un document</p>
          <div className="grid grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="Titre du document *"
              value={uploadData.titre}
              onChange={e => setUploadData(p => ({ ...p, titre: e.target.value }))}
              className="input-field text-sm py-2"
              required
            />
            <select
              value={uploadData.type}
              onChange={e => setUploadData(p => ({ ...p, type: e.target.value }))}
              className="input-field text-sm py-2"
            >
              <option value="billet_avion">Billet avion</option>
              <option value="billet_train">Billet train</option>
              <option value="confirmation_hotel">Confirmation hôtel</option>
              <option value="itineraire">Itinéraire</option>
              <option value="assurance">Assurance</option>
              <option value="facture">Facture</option>
              <option value="visa">Visa</option>
              <option value="autre">Autre</option>
            </select>
          </div>
          <div className="flex gap-3 items-center">
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={e => setUploadData(p => ({ ...p, file: e.target.files[0] }))}
              className="flex-1 input-field text-sm py-2"
              required
            />
            <Button type="submit" icon={Upload} loading={uploading} size="sm">
              Envoyer
            </Button>
          </div>
        </form>

        {/* Liste */}
        {docs.length === 0 ? (
          <div className="text-center py-6">
            <FileText size={32} className="text-gray-200 mx-auto mb-2" />
            <p className="text-sm text-gray-400">Aucun document pour le moment</p>
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
                <div className="flex gap-2">
                  <a
                    href={`${import.meta.env.VITE_API_URL}/documents/${doc.id}/download`}
                    target="_blank" rel="noreferrer"
                    className="flex items-center gap-1.5 text-xs text-secondary font-medium hover:text-secondary-dark px-3 py-1.5 border border-secondary/30 rounded-lg hover:bg-secondary/5 transition-colors"
                  >
                    <Download size={13} /> Télécharger
                  </a>
                  <button
                    onClick={() => handleDeleteDoc(doc.id)}
                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
