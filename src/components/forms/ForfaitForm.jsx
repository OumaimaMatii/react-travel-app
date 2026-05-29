/**
 * ForfaitForm.jsx – Formulaire creation/modification forfait.
 *
 * Aligné sur VoyageForfaitController::store() et ::update() :
 *
 * Champs envoyés :
 *   titre, description          → stockés dans Voyage (pas VoyageForfait)
 *   date_depart, date_retour    → Voyage
 *   destination_id              → Voyage
 *   ville_depart_id             → Voyage
 *   type_voyage_id              → Voyage (valeur fixe 1 = forfait)
 *   prix_adulte, prix_enfant    → VoyageForfait
 *   hotel_id                    → VoyageForfait
 *   programme                   → VoyageForfait
 *   nombre_places               → VoyageForfait
 *   statut_forfait_id           → VoyageForfait (table: statut_forfait sans 's')
 *   type_forfait_id             → VoyageForfait (nullable)
 *   type_bus_aller_id           → crée Transport aller (required)
 *   prix_bus_aller              → Transport aller (nullable)
 *   type_bus_retour_id          → crée Transport retour (nullable)
 *   prix_bus_retour             → Transport retour (nullable)
 *   activites[]                 → IDs entiers, sync sur voyage
 *
 * Pré-remplissage édition depuis VoyageForfaitResource :
 *   forfait.voyage.titre
 *   forfait.voyage.date_depart / date_retour
 *   forfait.voyage.ville_depart_id
 *   forfait.destination.id
 *   forfait.hotel.id
 *   forfait.statut.id
 *   forfait.type_forfait.id
 *   forfait.transport.type.id  (aller, ordre=1)
 *   forfait.transport_retour.type.id  (retour, ordre=2)
 *   forfait.activites[].id
 */

import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import Button from '../common/Button'
import api from '../../services/api'

export default function ForfaitForm({ initial, onSubmit, loading, serverError }) {
  const [destinations,   setDestinations]   = useState([])
  const [hotels,         setHotels]         = useState([])
  const [statutForfaits, setStatutForfaits] = useState([])
  const [typeForfaits,   setTypeForfaits]   = useState([])
  const [typeTransports, setTypeTransports] = useState([])
  const [villes,         setVilles]         = useState([])
  const [activites,      setActivites]      = useState([])
  const [loadingData,    setLoadingData]    = useState(true)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: {
      titre:              '',
      date_depart:        '',
      date_retour:        '',
      destination_id:     '',
      ville_depart_id:    '',
      hotel_id:           '',
      prix_adulte:        '',
      prix_enfant:        '',
      nombre_places:      '',
      statut_forfait_id:  '',
      type_forfait_id:    '',
      type_bus_aller_id:  '',
      prix_bus_aller:     '',
      type_bus_retour_id: '',
      prix_bus_retour:    '',
      programme:          '',
      activites:          [],
    },
  })

  /* ─── Chargement des listes de référence ──────────────────────────────── */
  useEffect(() => {
    const load = async () => {
      setLoadingData(true)
      try {
        const [destRes, hotelRes, statutRes, typeForRes, busRes, villesRes, actRes] =
          await Promise.all([
            api.get('/destinations'),
            api.get('/hotels'),
            // ← table statut_forfait SANS 's' dans l'URL (cf. api.php)
            api.get('/statut-forfait'),
            api.get('/type-forfaits'),
            api.get('/type-transports'),
            api.get('/villes'),
            api.get('/activites'),
          ])

        setDestinations(destRes.data?.data   || destRes.data   || [])
        setHotels(hotelRes.data?.data        || hotelRes.data  || [])
        setStatutForfaits(statutRes.data?.data || statutRes.data || [])
        setTypeForfaits(typeForRes.data?.data || typeForRes.data || [])
        setTypeTransports(busRes.data?.data  || busRes.data    || [])
        setVilles(villesRes.data?.data       || villesRes.data || [])
        setActivites(actRes.data?.data       || actRes.data    || [])

        /* ── Pré-remplissage mode édition ── */
        if (initial) {
          /**
           * initial = VoyageForfaitResource :
           *   initial.voyage.titre          ← titre
           *   initial.voyage.date_depart    ← date_depart
           *   initial.voyage.date_retour    ← date_retour
           *   initial.voyage.ville_depart_id
           *   initial.destination.id        ← destination_id
           *   initial.hotel.id              ← hotel_id
           *   initial.statut.id             ← statut_forfait_id
           *   initial.type_forfait.id       ← type_forfait_id
           *   initial.transport.type.id     ← type_bus_aller_id  (ordre=1)
           *   initial.transport.prix        ← prix_bus_aller
           *   initial.transport_retour.type.id  ← type_bus_retour_id  (ordre=2)
           *   initial.transport_retour.prix     ← prix_bus_retour
           *   initial.activites[].id        ← activites[]
           */
          reset({
            titre:              initial.voyage?.titre           || '',
            date_depart:        initial.voyage?.date_depart     || '',
            date_retour:        initial.voyage?.date_retour     || '',
            destination_id:     String(initial.destination?.id  || ''),
            ville_depart_id:    String(initial.voyage?.ville_depart_id || initial.voyage?.ville_depart?.id || ''),
            hotel_id:           String(initial.hotel?.id        || ''),
            prix_adulte:        initial.prix_adulte             ?? '',
            prix_enfant:        initial.prix_enfant             ?? '',
            nombre_places:      initial.nombre_places           ?? '',
            statut_forfait_id:  String(initial.statut?.id       || ''),
            type_forfait_id:    String(initial.type_forfait?.id || ''),
            programme:          initial.programme               || '',

            // Transport aller : initial.transport (alias du premier transport ordre=1)
            type_bus_aller_id:  String(initial.transport?.type?.id || ''),
            prix_bus_aller:     initial.transport?.prix          ?? '',

            // Transport retour : initial.transport_retour (ordre=2)
            type_bus_retour_id: String(initial.transport_retour?.type?.id || ''),
            prix_bus_retour:    initial.transport_retour?.prix   ?? '',

            // Activités : tableau d'IDs en string pour les checkboxes
            activites: (initial.activites || []).map(a => String(a.id)),
          })
        }
      } catch (err) {
        console.error('Erreur chargement formulaire forfait :', err)
      } finally {
        setLoadingData(false)
      }
    }
    load()
  }, [initial]) // eslint-disable-line

  /* ─── Soumission ───────────────────────────────────────────────────────── */
  const handleFormSubmit = (data) => {
    /**
     * Le controller attend exactement ces clés.
     * type_voyage_id = 1 (forfait), valeur fixe.
     * activites = tableau d'entiers (IDs).
     */
    const payload = {
      titre:              data.titre              || null,
      description:        data.description        || null,
      date_depart:        data.date_depart,
      date_retour:        data.date_retour,
      destination_id:     parseInt(data.destination_id),
      ville_depart_id:    parseInt(data.ville_depart_id),
      type_voyage_id:     1,                          // toujours 1 = forfait
      hotel_id:           parseInt(data.hotel_id),
      prix_adulte:        parseFloat(data.prix_adulte),
      prix_enfant:        data.prix_enfant ? parseFloat(data.prix_enfant) : null,
      nombre_places:      parseInt(data.nombre_places),
      statut_forfait_id:  data.statut_forfait_id  ? parseInt(data.statut_forfait_id)  : null,
      type_forfait_id:    data.type_forfait_id    ? parseInt(data.type_forfait_id)    : null,
      programme:          data.programme,
      type_bus_aller_id:  parseInt(data.type_bus_aller_id),
      prix_bus_aller:     data.prix_bus_aller     ? parseFloat(data.prix_bus_aller)   : 0,
      type_bus_retour_id: data.type_bus_retour_id ? parseInt(data.type_bus_retour_id) : null,
      prix_bus_retour:    data.prix_bus_retour    ? parseFloat(data.prix_bus_retour)  : 0,
      // Activités : convertir en entiers
      activites: Array.isArray(data.activites)
        ? data.activites.map(Number).filter(Boolean)
        : [],
    }
    onSubmit(payload)
  }

  /* ─── Affichage ────────────────────────────────────────────────────────── */
  if (loadingData) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-secondary" />
        <p className="ml-3 text-sm text-gray-400">Chargement du formulaire…</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-5">

      {/* Erreur serveur globale */}
      {serverError && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
          {typeof serverError === 'string'
            ? serverError
            : serverError.message || 'Erreur serveur'}
          {serverError.errors && (
            <ul className="mt-1 list-disc list-inside text-xs">
              {Object.entries(serverError.errors).map(([k, v]) => (
                <li key={k}>{Array.isArray(v) ? v[0] : v}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* ── Titre ── */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Titre du forfait
        </label>
        <input
          type="text"
          className="input-field"
          placeholder="Ex : Escapade à Marrakech…"
          {...register('titre')}
        />
      </div>

      {/* ── Dates ── */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Date de départ *
          </label>
          <input
            type="date"
            className={`input-field ${errors.date_depart ? 'border-danger' : ''}`}
            {...register('date_depart', { required: 'Date de départ requise' })}
          />
          {errors.date_depart && (
            <p className="text-xs text-danger mt-1">{errors.date_depart.message}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Date de retour *
          </label>
          <input
            type="date"
            className={`input-field ${errors.date_retour ? 'border-danger' : ''}`}
            {...register('date_retour', { required: 'Date de retour requise' })}
          />
          {errors.date_retour && (
            <p className="text-xs text-danger mt-1">{errors.date_retour.message}</p>
          )}
        </div>
      </div>

      {/* ── Destination & Ville départ ── */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Destination *
          </label>
          <select
            className={`input-field ${errors.destination_id ? 'border-danger' : ''}`}
            {...register('destination_id', { required: 'Destination requise' })}
          >
            <option value="">Choisir…</option>
            {destinations.map(d => (
              <option key={d.id} value={String(d.id)}>
                {d.nom} – {d.pays}
              </option>
            ))}
          </select>
          {errors.destination_id && (
            <p className="text-xs text-danger mt-1">{errors.destination_id.message}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Ville de départ *
          </label>
          <select
            className={`input-field ${errors.ville_depart_id ? 'border-danger' : ''}`}
            {...register('ville_depart_id', { required: 'Ville de départ requise' })}
          >
            <option value="">Choisir…</option>
            {villes.map(v => (
              <option key={v.id} value={String(v.id)}>{v.nom}</option>
            ))}
          </select>
          {errors.ville_depart_id && (
            <p className="text-xs text-danger mt-1">{errors.ville_depart_id.message}</p>
          )}
        </div>
      </div>

      {/* ── Hôtel ── */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Hôtel *</label>
        <select
          className={`input-field ${errors.hotel_id ? 'border-danger' : ''}`}
          {...register('hotel_id', { required: 'Hôtel requis' })}
        >
          <option value="">Choisir un hôtel…</option>
          {hotels.map(h => (
            <option key={h.id} value={String(h.id)}>
              {'★'.repeat(h.etoiles || 3)} {h.nom}
              {h.ville ? ` – ${h.ville.nom}` : ''}
            </option>
          ))}
        </select>
        {errors.hotel_id && (
          <p className="text-xs text-danger mt-1">{errors.hotel_id.message}</p>
        )}
      </div>

      {/* ── Prix ── */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Prix adulte (DH) *
          </label>
          <input
            type="number" step="0.01" min="0"
            className={`input-field ${errors.prix_adulte ? 'border-danger' : ''}`}
            {...register('prix_adulte', { required: 'Prix adulte requis' })}
          />
          {errors.prix_adulte && (
            <p className="text-xs text-danger mt-1">{errors.prix_adulte.message}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Prix enfant (DH)
          </label>
          <input
            type="number" step="0.01" min="0"
            placeholder="Optionnel"
            className="input-field"
            {...register('prix_enfant')}
          />
        </div>
      </div>

      {/* ── Nombre de places ── */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Nombre de places *
          
        </label>
        <input
          type="number" min="1"
          className={`input-field ${errors.nombre_places ? 'border-danger' : ''}`}
          {...register('nombre_places', { required: 'Nombre de places requis' })}
        />
        {errors.nombre_places && (
          <p className="text-xs text-danger mt-1">{errors.nombre_places.message}</p>
        )}
      </div>

      {/* ── Statut & Type forfait ── */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
          <select className="input-field" {...register('statut_forfait_id')}>
            <option value="">Aucun statut</option>
            {statutForfaits.map(s => (
              <option key={s.id} value={String(s.id)}>{s.nom}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Type de forfait
          </label>
          <select className="input-field" {...register('type_forfait_id')}>
            <option value="">Aucun type</option>
            {typeForfaits.map(t => (
              <option key={t.id} value={String(t.id)}>{t.nom}</option>
            ))}
          </select>
        </div>
      </div>

      {/* ── Transport aller ── */}
      <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl space-y-3">
        <p className="text-sm font-semibold text-blue-800">🚌 Transport aller</p>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Type de bus aller *
            </label>
            <select
              className={`input-field ${errors.type_bus_aller_id ? 'border-danger' : ''}`}
              {...register('type_bus_aller_id', { required: 'Bus aller requis' })}
            >
              <option value="">Choisir…</option>
              {typeTransports.map(t => (
                <option key={t.id} value={String(t.id)}>{t.nom}</option>
              ))}
            </select>
            {errors.type_bus_aller_id && (
              <p className="text-xs text-danger mt-1">{errors.type_bus_aller_id.message}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Prix bus aller (DH)
            </label>
            <input
              type="number" step="0.01" min="0"
              placeholder="0"
              className="input-field"
              {...register('prix_bus_aller')}
            />
          </div>
        </div>
      </div>

      {/* ── Transport retour ── */}
      <div className="p-4 bg-gray-50 border border-gray-100 rounded-xl space-y-3">
        <p className="text-sm font-semibold text-gray-600">
          🚌 Transport retour
          <span className="text-xs font-normal text-gray-400 ml-2">
            (laisser vide = même bus que l'aller)
          </span>
        </p>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Type de bus retour
            </label>
            <select className="input-field" {...register('type_bus_retour_id')}>
              <option value="">Même que l'aller</option>
              {typeTransports.map(t => (
                <option key={t.id} value={String(t.id)}>{t.nom}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Prix bus retour (DH)
            </label>
            <input
              type="number" step="0.01" min="0"
              placeholder="0"
              className="input-field"
              {...register('prix_bus_retour')}
            />
          </div>
        </div>
      </div>

      {/* ── Programme ── */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Programme *
        </label>
        <textarea
          rows={6}
          placeholder="Détaillez le programme jour par jour…&#10;Jour 1 : Arrivée…&#10;Jour 2 : Visite…"
          className={`input-field ${errors.programme ? 'border-danger' : ''}`}
          {...register('programme', { required: 'Programme requis' })}
        />
        {errors.programme && (
          <p className="text-xs text-danger mt-1">{errors.programme.message}</p>
        )}
      </div>

      {/* ── Activités ── */}
      {activites.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Activités incluses
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-52 overflow-y-auto border border-gray-100 rounded-xl p-3">
            {activites.map(a => (
              <label
                key={a.id}
                className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 cursor-pointer text-sm"
              >
                <input
                  type="checkbox"
                  value={String(a.id)}
                  {...register('activites')}
                  className="w-4 h-4 text-secondary rounded border-gray-300"
                />
                <span className="flex-1 min-w-0 truncate">{a.nom}</span>
                <span className="text-xs text-gray-400 flex-shrink-0">{a.prix} DH</span>
                {a.adapte_enfants && (
                  <span className="text-xs text-emerald-600 flex-shrink-0">👶</span>
                )}
              </label>
            ))}
          </div>
        </div>
      )}

      {/* ── Bouton ── */}
      <Button type="submit" loading={loading} className="w-full">
        {initial ? 'Mettre à jour le forfait' : 'Créer le forfait'}
      </Button>
    </form>
  )
}