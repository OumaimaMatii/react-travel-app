import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../../services/api'
import Loader from '../../components/common/Loader'
import Alert from '../../components/common/Alert'
import Button from '../../components/common/Button'
import { formatDate } from '../../utils/formatDate'
import { formatPrice } from '../../utils/formatPrice'
import {
  ArrowLeft, MapPin, Calendar, User, TrendingUp, Plane,
  Hotel, Zap, FileText, Download, Upload, Trash2,
  CheckCircle, XCircle, Clock
} from 'lucide-react'

const STATUT_COLORS = {
  'En attente': 'bg-amber-100 text-amber-700',
  'En validation': 'bg-blue-100 text-blue-700',
  'Valide': 'bg-emerald-100 text-emerald-700',
  'Refuse': 'bg-red-100 text-red-700',
  'En cours de traitement': 'bg-purple-100 text-purple-700',
  'Devis envoye': 'bg-indigo-100 text-indigo-700',
  'Facture envoyee': 'bg-cyan-100 text-cyan-700',
}

export default function SurMesureDetailAgent() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [demande, setDemande] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [statuts, setStatuts] = useState([])
  const [updating, setUpdating] = useState(false)
  const [docs, setDocs] = useState([])
  const [uploading, setUploading] = useState(false)
  const [uploadAlert, setUploadAlert] = useState(null)
  const [uploadData, setUploadData] = useState({ titre: '', type: 'autre', file: null })

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const [demandeRes, statutsRes] = await Promise.all([
          api.get(`/agent/sur-mesure/${id}`),
          api.get('/statut-sur-mesure')
        ])
        setDemande(demandeRes.data?.data || demandeRes.data)
        setStatuts(statutsRes.data?.data || statutsRes.data || [])
      } catch (err) {
        setError('Erreur de chargement de la demande')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
    loadDocs()
  }, [id])

  const loadDocs = async () => {
    try {
      const res = await api.get(`/agent/sur-mesure/${id}/documents`)
      setDocs(res.data?.data || [])
    } catch {
      // Pas de documents ou erreur silencieuse
    }
  }

  const handleUpload = async (e) => {
    e.preventDefault()
    if (!uploadData.file || !uploadData.titre) return

    setUploading(true)
    setUploadAlert(null)
    try {
      const form = new FormData()
      form.append('document', uploadData.file)
      form.append('titre', uploadData.titre)
      form.append('type', uploadData.type)

      await api.post(`/agent/sur-mesure/${id}/documents`, form)
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
      setUploadAlert({ type: 'success', message: 'Document supprimé avec succès.' })
    } catch {
      setUploadAlert({ type: 'error', message: 'Impossible de supprimer le document.' })
    }
  }

  const handleStatutChange = async (statutId) => {
    setUpdating(true)
    try {
      await api.put(`/agent/sur-mesure/${id}`, { statut_sur_mesure_id: parseInt(statutId) })
      setDemande(prev => ({ ...prev, statut: statuts.find(s => s.id === parseInt(statutId)) }))
      setUploadAlert({ type: 'success', message: 'Statut mis à jour avec succès.' })
    } catch {
      setUploadAlert({ type: 'error', message: 'Erreur lors de la mise à jour du statut.' })
    } finally {
      setUpdating(false)
    }
  }

  if (loading) return <Loader />
  if (error) return <Alert type="error" message={error} />
  if (!demande) return <Alert type="error" message="Demande non trouvée" />

  const voyage = demande.voyage
  const destination = demande.destination || voyage?.destination
  const client = demande.client
  const statut = demande.statut

  const nbNuits = voyage?.date_depart && voyage?.date_retour
    ? Math.max(1, Math.floor((new Date(voyage.date_retour) - new Date(voyage.date_depart)) / 86400000))
    : 0

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <ArrowLeft size={18} className="text-gray-500" />
        </button>
        <div>
          <h1 className="page-title mb-0">Demande sur mesure #{demande.id}</h1>
          <p className="text-sm text-gray-400">Vue agent – informations complètes</p>
        </div>
      </div>

      {uploadAlert && (
        <Alert type={uploadAlert.type} message={uploadAlert.message} onClose={() => setUploadAlert(null)} />
      )}

      <div className="card p-5 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-surface rounded-xl flex items-center justify-center">
            <TrendingUp size={18} className="text-secondary" />
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-1">Statut actuel</p>
            <div className="flex items-center gap-2">
              {statut && (
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                  STATUT_COLORS[statut.nom] || 'bg-gray-100 text-gray-600'
                }`}>
                  {statut.nom}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-400">Budget estimé</p>
          <p className="text-xl font-bold text-secondary">{formatPrice(demande.budget_estime)}</p>
        </div>
      </div>

      <div className="card p-6">
        <h2 className="font-display font-semibold text-primary mb-4 flex items-center gap-2">
          <User size={18} className="text-secondary" /> Client
        </h2>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold text-lg">
            {client?.name?.charAt(0) || '?'}
          </div>
          <div>
            <p className="font-semibold text-gray-800">{client?.name}</p>
            <p className="text-sm text-gray-400">{client?.email}</p>
          </div>
        </div>
      </div>

      <div className="card p-6">
        <h2 className="font-display font-semibold text-primary mb-4 flex items-center gap-2">
          <MapPin size={18} className="text-secondary" /> Détails du voyage
        </h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="space-y-3">
            <div>
              <p className="text-xs text-gray-400 mb-0.5">Destination</p>
              <p className="font-medium">{destination?.nom}, {destination?.pays}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-0.5">Date de départ</p>
              <p className="font-medium">{formatDate(voyage?.date_depart)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-0.5">Date de retour</p>
              <p className="font-medium">{formatDate(voyage?.date_retour)}</p>
            </div>
          </div>
          <div className="space-y-3">
            <div>
              <p className="text-xs text-gray-400 mb-0.5">Durée</p>
              <p className="font-medium">{nbNuits} nuit{nbNuits > 1 ? 's' : ''}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-0.5">Ville de départ</p>
              <p className="font-medium">{voyage?.ville_depart?.nom || '—'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-0.5">Créée le</p>
              <p className="font-medium">{formatDate(demande.created_at)}</p>
            </div>
          </div>
        </div>
      </div>

      {voyage?.transports && voyage.transports.length > 0 && (
        <div className="card p-6">
          <h2 className="font-display font-semibold text-primary mb-4 flex items-center gap-2">
            <Plane size={18} className="text-secondary" /> Transport
          </h2>
          {voyage.transports.map((t, i) => (
            <div key={i} className="flex items-center justify-between p-3 bg-surface rounded-xl mb-2 last:mb-0">
              <div>
                <p className="font-medium text-sm">{t.compagnie}</p>
                <p className="text-xs text-gray-500">
                  {t.depart} → {t.arrivee}
                </p>
              </div>
              <p className="font-bold text-secondary text-sm">{formatPrice(t.prix)} / pers.</p>
            </div>
          ))}
        </div>
      )}

      {voyage?.activites && voyage.activites.length > 0 && (
        <div className="card p-6">
          <h2 className="font-display font-semibold text-primary mb-4 flex items-center gap-2">
            <Zap size={18} className="text-secondary" /> Activités sélectionnées
          </h2>
          <div className="space-y-2">
            {voyage.activites.map((act, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-surface rounded-xl">
                <div>
                  <p className="font-medium text-sm">{act.nom}</p>
                  <p className="text-xs text-gray-500">{act.prix} DH / adulte</p>
                </div>
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
              <option value="devis">Devis</option>
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

      <div className="card p-6">
        <h2 className="font-display font-semibold text-primary mb-4 flex items-center gap-2">
          <Clock size={18} className="text-secondary" /> Changer le statut
        </h2>
        <div className="flex items-center gap-3 flex-wrap">
          <select
            value={statut?.id || ''}
            onChange={e => handleStatutChange(e.target.value)}
            className="input-field text-sm py-2"
            disabled={updating}
          >
            <option value="">Changer le statut…</option>
            {statuts.map(s => (
              <option key={s.id} value={s.id}>{s.nom}</option>
            ))}
          </select>
          {updating && <Loader size="sm" />}
        </div>
      </div>

      <div className="bg-primary/5 border border-primary/10 rounded-xl p-4">
        <div className="flex justify-between items-center">
          <span className="font-semibold text-primary">Budget estimé total</span>
          <span className="text-2xl font-bold text-secondary">{formatPrice(demande.budget_estime)}</span>
        </div>
        <p className="text-xs text-gray-400 mt-2">
          Ce montant est une estimation. Le prix final sera confirmé après validation.
        </p>
      </div>

      <div className="flex justify-between pt-2">
        <Button variant="outline" onClick={() => navigate('/agent/sur-mesure')}>
          ← Retour à la liste
        </Button>
        <Button onClick={() => window.print()}>
          Imprimer la demande
        </Button>
      </div>
    </div>
  )
}