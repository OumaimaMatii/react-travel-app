import React, { useEffect, useState } from 'react'
import Loader from '../../components/common/Loader'
import Alert from '../../components/common/Alert'
import Modal from '../../components/common/Modal'
import Button from '../../components/common/Button'
import { Plus, RefreshCw, Edit2, Trash2, Star, Hotel, Image } from 'lucide-react'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

async function apiFetch(method, path, data = null) {
  const token = localStorage.getItem('token')
  const headers = { Authorization: `Bearer ${token}`, Accept: 'application/json' }
  const isFormData = data instanceof FormData
  if (!isFormData && data) headers['Content-Type'] = 'application/json'
  const res = await fetch(`${API_URL}${path}`, {
    method, headers,
    body: data ? (isFormData ? data : JSON.stringify(data)) : undefined,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw Object.assign(new Error(err.message || `Erreur ${res.status}`), { errors: err.errors })
  }
  return res.status === 204 ? null : res.json()
}

const EMPTY = { nom: '', adresse: '', etoiles: 3, ville_id: '', image_principale: null }

export default function AdminHotels() {
  const [items,        setItems]        = useState([])
  const [loading,      setLoading]      = useState(true)
  const [alert,        setAlert]        = useState(null)
  const [showModal,    setShowModal]    = useState(false)
  const [editing,      setEditing]      = useState(null)
  const [formLoading,  setFormLoading]  = useState(false)
  const [form,         setForm]         = useState(EMPTY)
  const [imagePreview, setImagePreview] = useState(null)
  const [villes,       setVilles]       = useState([])
  const [confirmDel,   setConfirmDel]   = useState(null)

  const load = async () => {
    setLoading(true)
    try {
      const [hRes, vRes] = await Promise.all([
        apiFetch('GET', '/hotels'),
        apiFetch('GET', '/villes'),
      ])
      setItems(hRes?.data || hRes || [])
      setVilles(vRes?.data || vRes || [])
    } catch {}
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const openNew  = () => { setEditing(null); setForm(EMPTY); setImagePreview(null); setShowModal(true) }
  const openEdit = (h) => {
    setEditing(h)
    setForm({ nom: h.nom, adresse: h.adresse || '', etoiles: h.etoiles, ville_id: String(h.ville_id || ''), image_principale: null })
    setImagePreview(h.image_principale || null)
    setShowModal(true)
  }
  const closeModal = () => { setShowModal(false); setEditing(null); setImagePreview(null) }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setForm(p => ({ ...p, image_principale: file }))
    setImagePreview(URL.createObjectURL(file))
  }

  const handleSave = async (e) => {
    e.preventDefault(); setFormLoading(true)
    try {
      let payload
      if (form.image_principale) {
        payload = new FormData()
        payload.append('nom',              form.nom)
        payload.append('adresse',          form.adresse)
        payload.append('etoiles',          String(form.etoiles))
        payload.append('ville_id',         form.ville_id)
        payload.append('image_principale', form.image_principale)
        if (editing) payload.append('_method', 'PUT')
      } else {
        payload = { nom: form.nom, adresse: form.adresse, etoiles: parseInt(form.etoiles), ville_id: parseInt(form.ville_id) }
      }

      if (editing) {
        await apiFetch(payload instanceof FormData ? 'POST' : 'PUT', `/admin/hotels/${editing.id}`, payload)
        setAlert({ type: 'success', message: 'Hôtel mis à jour.' })
      } else {
        await apiFetch('POST', '/admin/hotels', payload)
        setAlert({ type: 'success', message: 'Hôtel créé.' })
      }
      closeModal(); load()
    } catch (err) {
      setAlert({ type: 'error', message: err.message || 'Erreur.' })
    } finally {
      setFormLoading(false)
    }
  }

  const handleDelete = async (id) => {
    try {
      await apiFetch('DELETE', `/admin/hotels/${id}`)
      setAlert({ type: 'success', message: 'Hôtel supprimé.' }); setConfirmDel(null); load()
    } catch { setAlert({ type: 'error', message: 'Impossible de supprimer.' }) }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="page-title">Hôtels</h1>
          <p className="text-sm text-gray-500">{items.length} hôtel{items.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={load} className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-500"><RefreshCw size={16} /></button>
          <Button icon={Plus} onClick={openNew}>Nouvel hôtel</Button>
        </div>
      </div>

      {alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}

      {confirmDel && (
        <div className="card p-4 border-red-200 bg-red-50 flex items-center justify-between gap-4">
          <p className="text-sm text-red-700 font-medium">Supprimer cet hôtel ?</p>
          <div className="flex gap-2">
            <Button variant="danger" size="sm" onClick={() => handleDelete(confirmDel)}>Supprimer</Button>
            <Button variant="ghost"  size="sm" onClick={() => setConfirmDel(null)}>Annuler</Button>
          </div>
        </div>
      )}

      {loading ? <Loader /> : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map(h => (
            <div key={h.id} className="card">
              {h.image_principale ? (
                <img src={h.image_principale} alt={h.nom} className="w-full h-32 object-cover rounded-xl mb-3" />
              ) : (
                <div className="w-full h-32 bg-surface rounded-xl mb-3 flex items-center justify-center">
                  <Hotel size={28} className="text-gray-300" />
                </div>
              )}
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-semibold text-gray-800 truncate">{h.nom}</p>
                  <div className="flex gap-0.5 my-1">
                    {Array.from({ length: h.etoiles || 3 }).map((_, i) => (
                      <Star key={i} size={11} className="text-amber-400 fill-amber-400" />
                    ))}
                  </div>
                  <p className="text-xs text-gray-500">{h.ville?.nom || '—'}</p>
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  <button onClick={() => openEdit(h)} className="p-1.5 text-gray-400 hover:text-secondary hover:bg-secondary/10 rounded-lg transition-colors"><Edit2 size={14} /></button>
                  <button onClick={() => setConfirmDel(h.id)} className="p-1.5 text-gray-400 hover:text-danger hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={14} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={showModal} onClose={closeModal}
        title={editing ? 'Modifier l\'hôtel' : 'Nouvel hôtel'} size="md">
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nom *</label>
            <input type="text" value={form.nom} onChange={e => setForm(p => ({...p,nom:e.target.value}))} className="input-field" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Adresse</label>
            <input type="text" value={form.adresse} onChange={e => setForm(p => ({...p,adresse:e.target.value}))} className="input-field" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Étoiles *</label>
              <select value={form.etoiles} onChange={e => setForm(p => ({...p,etoiles:e.target.value}))} className="input-field">
                {[1,2,3,4,5].map(n => <option key={n} value={n}>{n} ★</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ville *</label>
              <select value={form.ville_id} onChange={e => setForm(p => ({...p,ville_id:e.target.value}))} className="input-field" required>
                <option value="">Choisir…</option>
                {villes.map(v => <option key={v.id} value={String(v.id)}>{v.nom}</option>)}
              </select>
            </div>
          </div>

          {/* Upload image */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1.5">
              <Image size={14} className="text-secondary" /> Image principale
            </label>
            {imagePreview && (
              <div className="mb-2 relative">
                <img src={imagePreview} alt="Aperçu" className="w-full h-32 object-cover rounded-xl border border-gray-100" />
                <button type="button"
                  onClick={() => { setImagePreview(null); setForm(p => ({...p, image_principale: null})) }}
                  className="absolute top-2 right-2 w-6 h-6 bg-white rounded-full shadow flex items-center justify-center text-gray-500 hover:text-danger text-xs">
                  ✕
                </button>
              </div>
            )}
            <input type="file" accept="image/*" onChange={handleImageChange} className="input-field py-2 text-sm cursor-pointer" />
            <p className="text-xs text-gray-400 mt-1">
              {editing ? 'Laisser vide pour conserver l\'image actuelle.' : 'JPG, PNG ou WebP – max 2 Mo'}
            </p>
          </div>

          <Button type="submit" loading={formLoading} className="w-full">
            {editing ? 'Mettre à jour' : 'Créer'}
          </Button>
        </form>
      </Modal>
    </div>
  )
}