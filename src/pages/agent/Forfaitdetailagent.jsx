import React, { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import api from '../../services/api'
import Loader from '../../components/common/Loader'
import Alert from '../../components/common/Alert'
import Modal from '../../components/common/Modal'
import ForfaitForm from '../../components/forms/ForfaitForm'
import Button from '../../components/common/Button'
import { formatDate, calcDuree } from '../../utils/formatDate'
import { formatPrice } from '../../utils/formatPrice'
import { getForfaitStatut } from '../../utils/statusUtils'
import { StatusBadge } from '../../components/common/Badge'
import {
  ArrowLeft, MapPin, Calendar, Users, Hotel, Star,
  Clock, CheckCircle, Plane, Zap, Edit2, Eye,
  ChevronLeft, ChevronRight,
} from 'lucide-react'

export default function ForfaitDetailAgent() {
  const { id }       = useParams()
  const navigate     = useNavigate()

  const [forfait,     setForfait]     = useState(null)
  const [loading,     setLoading]     = useState(true)
  const [alert,       setAlert]       = useState(null)
  const [showEdit,    setShowEdit]    = useState(false)
  const [formLoading, setFormLoading] = useState(false)
  const [activeImg,   setActiveImg]   = useState(0)

  const load = async () => {
    setLoading(true)
    try {
      const res = await api.get(`/agent/forfaits/${id}`)
      setForfait(res.data?.data || res.data)
    } catch {
      setAlert({ type: 'error', message: 'Impossible de charger ce forfait.' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [id])

  const handleUpdate = async (data) => {
    setFormLoading(true)
    try {
      await api.put(`/agent/forfaits/${id}`, data)
      setAlert({ type: 'success', message: 'Forfait mis à jour avec succès.' })
      setShowEdit(false)
      load()
    } catch (e) {
      setAlert({ type: 'error', message: e.message || 'Erreur lors de la mise à jour.' })
    } finally {
      setFormLoading(false)
    }
  }

  if (loading) return <Loader />
  if (!forfait) return (
    <div className="text-center py-20 text-gray-400">
      <p>Forfait introuvable.</p>
      <button onClick={() => navigate('/agent/forfaits')} className="mt-4 text-secondary text-sm">← Retour</button>
    </div>
  )

  const voyage      = forfait.voyage
  const dest        = forfait.destination
  const hotel       = forfait.hotel
  const duree       = calcDuree(voyage?.date_depart, voyage?.date_retour)
  const statut      = forfait.statut
  const statutStyle = statut ? getForfaitStatut(statut.nom) : null

  const images = dest?.medias?.map(m => m.url).filter(Boolean).length
    ? dest.medias.map(m => m.url)
    : dest?.image_couverture
      ? [dest.image_couverture]
      : ['https://images.unsplash.com/photo-1539020140153-e479b8c22e70?w=1200&q=80']

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/agent/forfaits')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft size={18} className="text-gray-500" />
          </button>
          <div>
            <h1 className="page-title mb-0">
              {voyage?.titre || `Forfait #${forfait.id}`}
            </h1>
            <p className="text-sm text-gray-400">Détail du forfait – vue agent</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link
            to={`/agent/forfaits/${id}/reservations`}
            className="btn-outline flex items-center gap-2 text-sm"
          >
            <Eye size={15} /> Voir les réservations
          </Link>
          <Button icon={Edit2} onClick={() => setShowEdit(true)}>
            Modifier
          </Button>
        </div>
      </div>

      {alert && (
        <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />
      )}

      {/* Galerie image */}
      <div className="relative h-56 md:h-80 rounded-2xl overflow-hidden bg-gray-900">
        <img
          src={images[activeImg]}
          alt={dest?.nom}
          className="w-full h-full object-cover opacity-90 transition-all duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/10" />

        {images.length > 1 && (
          <>
            <button
              onClick={() => setActiveImg(i => (i - 1 + images.length) % images.length)}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/40 hover:bg-black/60 text-white rounded-full flex items-center justify-center backdrop-blur-sm"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={() => setActiveImg(i => (i + 1) % images.length)}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/40 hover:bg-black/60 text-white rounded-full flex items-center justify-center backdrop-blur-sm"
            >
              <ChevronRight size={18} />
            </button>
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
              {images.map((_, i) => (
                <button key={i} onClick={() => setActiveImg(i)}
                  className={`rounded-full transition-all duration-300 ${i === activeImg ? 'w-5 h-2 bg-white' : 'w-2 h-2 bg-white/50'}`} />
              ))}
            </div>
          </>
        )}

        {statut && statutStyle && (
          <div className="absolute top-3 right-3">
            <StatusBadge bg={statutStyle.bg} text={statutStyle.text} label={statut.nom} />
          </div>
        )}
        {forfait.type_forfait && (
          <div className="absolute top-3 left-3">
            <span className="px-2.5 py-1 bg-secondary/90 text-white text-xs font-semibold rounded-full">
              {forfait.type_forfait.nom}
            </span>
          </div>
        )}
        <div className="absolute bottom-4 left-4 text-white">
          <div className="flex items-center gap-1.5 text-xs text-white/80 mb-1">
            <MapPin size={13} /> {dest?.nom}, {dest?.pays}
          </div>
        </div>
      </div>

      {/* Infos rapides */}
      <div className="flex flex-wrap gap-3 text-sm">
        {voyage?.date_depart && (
          <span className="flex items-center gap-1.5 bg-white border border-gray-100 px-3 py-1.5 rounded-full shadow-sm text-gray-600">
            <Calendar size={13} className="text-secondary" />
            {formatDate(voyage.date_depart)} → {formatDate(voyage.date_retour)}
          </span>
        )}
        {duree && (
          <span className="flex items-center gap-1.5 bg-white border border-gray-100 px-3 py-1.5 rounded-full shadow-sm text-gray-600">
            <Clock size={13} className="text-secondary" /> {duree} jours
          </span>
        )}
        <span className="flex items-center gap-1.5 bg-white border border-gray-100 px-3 py-1.5 rounded-full shadow-sm text-gray-600">
          <Users size={13} className="text-secondary" />
          {forfait.places_restantes}/{forfait.nombre_places} places restantes
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Colonne principale */}
        <div className="lg:col-span-2 space-y-5">

          {/* Destination */}
          {dest && (
            <div className="card p-5">
              <h2 className="font-display font-semibold text-primary mb-3 flex items-center gap-2">
                <MapPin size={17} className="text-secondary" /> Destination
              </h2>
              <div className="flex items-center gap-4">
                {dest.image_couverture && (
                  <img src={dest.image_couverture} alt={dest.nom} className="w-16 h-16 rounded-xl object-cover flex-shrink-0" />
                )}
                <div>
                  <p className="font-bold text-primary text-base">{dest.nom}</p>
                  <p className="text-gray-500 text-sm">{dest.pays}{dest.ville?.nom ? ` · ${dest.ville.nom}` : ''}</p>
                </div>
              </div>
            </div>
          )}

          {/* Hôtel */}
          {hotel && (
            <div className="card p-5">
              <h2 className="font-display font-semibold text-primary mb-3 flex items-center gap-2">
                <Hotel size={17} className="text-secondary" /> Hébergement
              </h2>
              <div className="flex items-center gap-4">
                {hotel.image_principale && (
                  <img src={hotel.image_principale} alt={hotel.nom} className="w-16 h-16 rounded-xl object-cover flex-shrink-0" />
                )}
                <div>
                  <p className="font-semibold text-gray-800">{hotel.nom}</p>
                  <div className="flex gap-0.5 my-1">
                    {Array.from({ length: hotel.etoiles || 3 }).map((_, i) => (
                      <Star key={i} size={12} className="text-amber-400 fill-amber-400" />
                    ))}
                  </div>
                  {hotel.adresse && <p className="text-xs text-gray-500">{hotel.adresse}</p>}
                  {hotel.ville && <p className="text-xs text-gray-400">{hotel.ville.nom}</p>}
                </div>
              </div>
            </div>
          )}

          {/* Activités */}
          {forfait.activites?.length > 0 && (
            <div className="card p-5">
              <h2 className="font-display font-semibold text-primary mb-4 flex items-center gap-2">
                <Zap size={17} className="text-secondary" /> Activités incluses
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {forfait.activites.map(act => (
                  <div key={act.id} className="flex items-center gap-3 p-3 bg-surface rounded-xl">
                    {act.image && <img src={act.image} alt={act.nom} className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800 truncate">{act.nom}</p>
                      <p className="text-xs text-secondary">{formatPrice(act.prix)}</p>
                    </div>
                    <CheckCircle size={14} className="text-secondary flex-shrink-0" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Transports */}
          {forfait.transports?.length > 0 && (
            <div className="card p-5">
              <h2 className="font-display font-semibold text-primary mb-4 flex items-center gap-2">
                <Plane size={17} className="text-secondary" /> Transports
              </h2>
              <div className="space-y-2">
                {forfait.transports.map((t, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 bg-surface rounded-xl">
                    <div className="w-9 h-9 bg-secondary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Plane size={15} className="text-secondary" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-800">{t.compagnie}</p>
                      <p className="text-xs text-gray-500">{t.depart} → {t.arrivee}</p>
                      {t.type && <p className="text-xs text-gray-400">{t.type.nom}</p>}
                    </div>
                    {t.prix > 0 && <p className="text-sm font-semibold text-secondary">{formatPrice(t.prix)}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Programme */}
          {forfait.programme && (
            <div className="card p-5">
              <h2 className="font-display font-semibold text-primary mb-3">Programme</h2>
              <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{forfait.programme}</p>
            </div>
          )}
        </div>

        {/* Sidebar infos */}
        <div className="lg:col-span-1">
          <div className="card p-5 space-y-4 sticky top-24">
            <h3 className="font-display font-semibold text-primary">Récapitulatif</h3>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between py-2 border-b border-gray-50">
                <span className="text-gray-500">Prix adulte</span>
                <span className="font-bold text-secondary">{formatPrice(forfait.prix_adulte)}</span>
              </div>
              {forfait.prix_enfant && (
                <div className="flex justify-between py-2 border-b border-gray-50">
                  <span className="text-gray-500">Prix enfant</span>
                  <span className="font-medium">{formatPrice(forfait.prix_enfant)}</span>
                </div>
              )}
              <div className="flex justify-between py-2 border-b border-gray-50">
                <span className="text-gray-500">Places totales</span>
                <span className="font-medium">{forfait.nombre_places}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-50">
                <span className="text-gray-500">Places restantes</span>
                <span className={`font-semibold ${forfait.places_restantes < 5 ? 'text-danger' : 'text-emerald-600'}`}>
                  {forfait.places_restantes}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-50">
                <span className="text-gray-500">Réservées</span>
                <span className="font-medium">{forfait.nombre_places - forfait.places_restantes}</span>
              </div>
              {voyage?.date_depart && (
                <div className="flex justify-between py-2 border-b border-gray-50">
                  <span className="text-gray-500">Départ</span>
                  <span className="font-medium text-right">{formatDate(voyage.date_depart)}</span>
                </div>
              )}
              {voyage?.date_retour && (
                <div className="flex justify-between py-2 border-b border-gray-50">
                  <span className="text-gray-500">Retour</span>
                  <span className="font-medium text-right">{formatDate(voyage.date_retour)}</span>
                </div>
              )}
              {duree && (
                <div className="flex justify-between py-2">
                  <span className="text-gray-500">Durée</span>
                  <span className="font-medium">{duree} jours</span>
                </div>
              )}
            </div>

            {/* Barre remplissage */}
            {forfait.nombre_places > 0 && (
              <div>
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>Taux de remplissage</span>
                  <span className="font-semibold">
                    {Math.round(((forfait.nombre_places - forfait.places_restantes) / forfait.nombre_places) * 100)}%
                  </span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-secondary rounded-full transition-all duration-500"
                    style={{ width: `${((forfait.nombre_places - forfait.places_restantes) / forfait.nombre_places) * 100}%` }}
                  />
                </div>
              </div>
            )}

            <Link
              to={`/agent/forfaits/${id}/reservations`}
              className="w-full btn-primary justify-center"
            >
              <Eye size={15} /> Voir les réservations
            </Link>
          </div>
        </div>
      </div>

      {/* Modal modification */}
      <Modal isOpen={showEdit} onClose={() => setShowEdit(false)}
        title={`Modifier : ${voyage?.titre || `Forfait #${forfait.id}`}`} size="xl">
        <ForfaitForm
          initial={forfait}
          onSubmit={handleUpdate}
          loading={formLoading}
          serverError={null}
        />
      </Modal>
    </div>
  )
}