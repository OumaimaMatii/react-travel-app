import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { fetchForfait } from '../../store/slices/forfaitSlice'
import { createReservationForfait } from '../../store/slices/reservationSlice'
import Header from '../../components/layout/Header'
import Footer from '../../components/layout/Footer'
import Loader from '../../components/common/Loader'
import Modal from '../../components/common/Modal'
import ReservationForm from '../../components/forms/ReservationForm'
import Alert from '../../components/common/Alert'
import { formatDate, calcDuree } from '../../utils/formatDate'
import { formatPrice } from '../../utils/formatPrice'
import { getForfaitStatut } from '../../utils/statusUtils'
import { StatusBadge } from '../../components/common/Badge'
import {
  MapPin, Calendar, Users, Hotel, Star, Clock,
  CheckCircle, ArrowLeft, Plane, Zap, ChevronLeft, ChevronRight,
} from 'lucide-react'

export default function ForfaitDetailPage() {
  const { id }     = useParams()
  const dispatch   = useDispatch()
  const navigate   = useNavigate()
  const { current: forfait, loading } = useSelector(s => s.forfaits)
  const { token }  = useSelector(s => s.auth)

  const [showModal,         setShowModal]         = useState(false)
  const [reservationLoading,setReservationLoading] = useState(false)
  const [success,           setSuccess]           = useState(false)
  const [error,             setError]             = useState('')
  const [activeImg,         setActiveImg]         = useState(0)

  useEffect(() => { dispatch(fetchForfait(id)) }, [id, dispatch])

  const handleReserver = async (data) => {
    if (!token) { navigate('/login'); return }
    setReservationLoading(true)
    setError('')
    try {
      await dispatch(createReservationForfait(data)).unwrap()
      setShowModal(false)
      setSuccess(true)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (e) {
      setError(e?.message || e?.error || 'Une erreur est survenue.')
    } finally {
      setReservationLoading(false)
    }
  }

  if (loading) return <><Header /><div className="pt-20"><Loader /></div></>
  if (!forfait) return (
    <><Header />
      <div className="pt-24 text-center py-20 text-gray-400">
        <p>Forfait introuvable.</p>
        <button onClick={() => navigate('/forfaits')} className="mt-4 text-secondary text-sm hover:underline">← Retour</button>
      </div>
    </>
  )

  const voyage = forfait.voyage
  const dest   = forfait.destination
  const hotel  = forfait.hotel
  const duree  = calcDuree(voyage?.date_depart, voyage?.date_retour)
  const images = dest?.medias?.map(m => m.url).filter(Boolean).length
    ? dest.medias.map(m => m.url)
    : dest?.image_couverture
      ? [dest.image_couverture]
      : ['https://images.unsplash.com/photo-1539020140153-e479b8c22e70?w=1200&q=80']

  const statut      = forfait.statut
  const statutStyle = statut ? getForfaitStatut(statut.nom) : null

  return (
    <div className="min-h-screen bg-surface">
      <Header />
      <div className="pt-16">
        {/* Galerie */}
        <div className="relative h-72 md:h-[28rem] overflow-hidden bg-gray-900">
          <img src={images[activeImg]} alt={dest?.nom}
            className="w-full h-full object-cover opacity-90 transition-all duration-500" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

          {images.length > 1 && (
            <>
              <button onClick={() => setActiveImg(i => (i - 1 + images.length) % images.length)}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/40 hover:bg-black/60 text-white rounded-full flex items-center justify-center backdrop-blur-sm">
                <ChevronLeft size={20} />
              </button>
              <button onClick={() => setActiveImg(i => (i + 1) % images.length)}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/40 hover:bg-black/60 text-white rounded-full flex items-center justify-center backdrop-blur-sm">
                <ChevronRight size={20} />
              </button>
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
                {images.map((_, i) => (
                  <button key={i} onClick={() => setActiveImg(i)}
                    className={`rounded-full transition-all duration-300 ${i === activeImg ? 'w-6 h-2 bg-white' : 'w-2 h-2 bg-white/50'}`} />
                ))}
              </div>
            </>
          )}

          <button onClick={() => navigate('/forfaits')}
            className="absolute top-4 left-4 flex items-center gap-2 text-white text-sm bg-black/35 backdrop-blur-sm px-3 py-1.5 rounded-full hover:bg-black/55 transition-colors">
            <ArrowLeft size={15} /> Retour
          </button>

          {statut && statutStyle && (
            <div className="absolute top-4 right-4">
              <StatusBadge bg={statutStyle.bg} text={statutStyle.text} label={statut.nom} />
            </div>
          )}

          <div className="absolute bottom-6 left-6 text-white">
            <div className="flex items-center gap-2 text-sm text-white/80 mb-1">
              <MapPin size={14} /> {dest?.nom}, {dest?.pays}
            </div>
            <h1 className="font-display text-2xl md:text-3xl font-bold leading-tight">
              {voyage?.titre || `Voyage à ${dest?.nom}`}
            </h1>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {success && (
            <div className="mb-6">
              <Alert type="success"
                message="Réservation créée ! Vous avez 1 heure pour confirmer dans Mon espace → Mes réservations."
                onClose={() => setSuccess(false)} />
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Détails */}
            <div className="lg:col-span-2 space-y-6">
              {/* Badges info */}
              <div className="flex flex-wrap gap-3 text-sm">
                {voyage?.date_depart && (
                  <span className="flex items-center gap-1.5 bg-white border border-gray-100 px-3 py-1.5 rounded-full shadow-sm text-gray-600">
                    <Calendar size={14} className="text-secondary" />
                    {formatDate(voyage.date_depart)} → {formatDate(voyage.date_retour)}
                  </span>
                )}
                {duree && (
                  <span className="flex items-center gap-1.5 bg-white border border-gray-100 px-3 py-1.5 rounded-full shadow-sm text-gray-600">
                    <Clock size={14} className="text-secondary" /> {duree} jours
                  </span>
                )}
                {forfait.places_restantes != null && (
                  <span className="flex items-center gap-1.5 bg-white border border-gray-100 px-3 py-1.5 rounded-full shadow-sm text-gray-600">
                    <Users size={14} className="text-secondary" /> {forfait.places_restantes} place{forfait.places_restantes > 1 ? 's' : ''} dispo
                  </span>
                )}
                {forfait.type_forfait && (
                  <span className="flex items-center gap-1.5 bg-secondary/10 border border-secondary/20 px-3 py-1.5 rounded-full text-secondary font-medium">
                    {forfait.type_forfait.nom}
                  </span>
                )}
              </div>

              {/* Destination */}
              {dest && (
                <div className="card p-5">
                  <h2 className="font-display font-semibold text-lg text-primary mb-3 flex items-center gap-2">
                    <MapPin size={18} className="text-secondary" /> Destination
                  </h2>
                  <div className="flex items-center gap-4">
                    {dest.image_couverture && (
                      <img src={dest.image_couverture} alt={dest.nom} className="w-20 h-20 rounded-xl object-cover flex-shrink-0" />
                    )}
                    <div>
                      <p className="font-bold text-primary text-lg">{dest.nom}</p>
                      <p className="text-gray-500 text-sm">{dest.pays}{dest.ville?.nom ? ` · ${dest.ville.nom}` : ''}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Hôtel */}
              {hotel && (
                <div className="card p-5">
                  <h2 className="font-display font-semibold text-lg text-primary mb-3 flex items-center gap-2">
                    <Hotel size={18} className="text-secondary" /> Hébergement
                  </h2>
                  <div className="flex items-center gap-4">
                    {hotel.image_principale && (
                      <img src={hotel.image_principale} alt={hotel.nom} className="w-20 h-20 rounded-xl object-cover flex-shrink-0" />
                    )}
                    <div>
                      <p className="font-semibold text-gray-800">{hotel.nom}</p>
                      <div className="flex items-center gap-0.5 my-1">
                        {Array.from({ length: hotel.etoiles || 3 }).map((_, i) => (
                          <Star key={i} size={13} className="text-amber-400 fill-amber-400" />
                        ))}
                      </div>
                      {hotel.adresse && <p className="text-sm text-gray-500">{hotel.adresse}</p>}
                    </div>
                  </div>
                </div>
              )}

              {/* Activités */}
              {forfait.activites?.length > 0 && (
                <div className="card p-5">
                  <h2 className="font-display font-semibold text-lg text-primary mb-4 flex items-center gap-2">
                    <Zap size={18} className="text-secondary" /> Activités incluses
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {forfait.activites.map(act => (
                      <div key={act.id} className="flex items-center gap-3 p-3 bg-surface rounded-xl">
                        {act.image && <img src={act.image} alt={act.nom} className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-800 truncate">{act.nom}</p>
                          <p className="text-xs text-secondary font-medium">{formatPrice(act.prix)}</p>
                          {act.adapte_enfants && <p className="text-xs text-emerald-600">Adapté enfants</p>}
                        </div>
                        <CheckCircle size={15} className="text-secondary flex-shrink-0" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Programme */}
              {forfait.programme && (
                <div className="card p-5">
                  <h2 className="font-display font-semibold text-lg text-primary mb-4">Programme</h2>
                  <div className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">
                    {forfait.programme}
                  </div>
                </div>
              )}

              {/* Transports */}
              {forfait.transports?.length > 0 && (
                <div className="card p-5">
                  <h2 className="font-display font-semibold text-lg text-primary mb-4 flex items-center gap-2">
                    <Plane size={18} className="text-secondary" /> Transports
                  </h2>
                  <div className="space-y-3">
                    {forfait.transports.map((t, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 bg-surface rounded-xl">
                        <div className="w-9 h-9 bg-secondary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Plane size={16} className="text-secondary" />
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
            </div>

            {/* Sidebar réservation */}
            <div className="lg:col-span-1">
              <div className="card p-6 sticky top-24">
                <div className="text-center mb-5 pb-5 border-b border-gray-100">
                  <p className="text-xs text-gray-400 mb-1">À partir de</p>
                  <p className="text-4xl font-display font-bold text-secondary">{formatPrice(forfait.prix_adulte)}</p>
                  <p className="text-xs text-gray-400 mt-0.5">par adulte</p>
                  {forfait.prix_enfant && (
                    <p className="text-sm text-gray-500 mt-1">{formatPrice(forfait.prix_enfant)} / enfant</p>
                  )}
                </div>

                <div className="space-y-2.5 mb-5 text-sm">
                  {[
                    { label: 'Départ',            value: formatDate(voyage?.date_depart) },
                    { label: 'Retour',             value: formatDate(voyage?.date_retour) },
                    { label: 'Durée',              value: duree ? `${duree} jours` : '—' },
                    { label: 'Places restantes',   value: forfait.places_restantes != null ? `${forfait.places_restantes} place${forfait.places_restantes > 1 ? 's' : ''}` : '—' },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                      <span className="text-gray-500">{label}</span>
                      <span className="font-medium text-gray-800 text-right">{value}</span>
                    </div>
                  ))}
                </div>

                {(forfait.places_restantes ?? 1) > 0 ? (
                  <button onClick={() => setShowModal(true)}
                    className="w-full py-3.5 bg-secondary text-white rounded-xl font-semibold hover:bg-secondary-dark transition-all shadow-sm hover:shadow-md">
                    Réserver maintenant
                  </button>
                ) : (
                  <div className="w-full py-3.5 bg-gray-100 text-gray-400 rounded-xl font-semibold text-center">
                    Complet
                  </div>
                )}

                {!token && (forfait.places_restantes ?? 1) > 0 && (
                  <p className="text-xs text-center text-gray-400 mt-3">
                    <a href="/login" className="text-secondary hover:underline">Connectez-vous</a> pour réserver
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Réserver ce forfait" size="md">
        {error && (
          <div className="mb-4">
            <Alert type="error" message={error} onClose={() => setError('')} />
          </div>
        )}
        <ReservationForm forfait={forfait} onSubmit={handleReserver} loading={reservationLoading} />
      </Modal>
    </div>
  )
}
