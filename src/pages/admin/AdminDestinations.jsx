import React, { useEffect, useState } from 'react'
import Loader from '../../components/common/Loader'
import Alert from '../../components/common/Alert'
import Modal from '../../components/common/Modal'
import Button from '../../components/common/Button'
import { Plus, RefreshCw, Edit2, Trash2, MapPin, Image } from 'lucide-react'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

/** Appel API avec support FormData (images) */
async function apiFetch(method, path, data = null) {
  const token = localStorage.getItem('token')
  const headers = { Authorization: `Bearer ${token}`, Accept: 'application/json' }
  const isFormData = data instanceof FormData

  if (!isFormData && data) headers['Content-Type'] = 'application/json'

  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: data ? (isFormData ? data : JSON.stringify(data)) : undefined,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw Object.assign(new Error(err.message || `Erreur ${res.status}`), { errors: err.errors })
  }
  return res.status === 204 ? null : res.json()
}

const EMPTY_FORM = { nom: '', pays: '', ville_id: '', actif: true, image_couverture: null }

export default function AdminDestinations() {
  const [items,        setItems]        = useState([])
  const [loading,      setLoading]      = useState(true)
  const [alert,        setAlert]        = useState(null)
  const [showModal,    setShowModal]    = useState(false)
  const [editing,      setEditing]      = useState(null)
  const [formLoading,  setFormLoading]  = useState(false)
  const [form,         setForm]         = useState(EMPTY_FORM)
  const [imagePreview, setImagePreview] = useState(null)
  const [villes,       setVilles]       = useState([])
  const [confirmDel,   setConfirmDel]   = useState(null)

  const load = async () => {
    setLoading(true)
    try {
      const [destRes, villesRes] = await Promise.all([
        apiFetch('GET', '/destinations'),
        apiFetch('GET', '/villes'),
      ])
      setItems(destRes?.data || destRes || [])
      setVilles(villesRes?.data || villesRes || [])
    } catch {}
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const openNew = () => {
    setEditing(null)
    setForm(EMPTY_FORM)
    setImagePreview(null)
    setShowModal(true)
  }

  const openEdit = (d) => {
    setEditing(d)
    setForm({ nom: d.nom, pays: d.pays, ville_id: String(d.ville_id || ''), actif: !!d.actif, image_couverture: null })
    setImagePreview(d.image_couverture || null)
    setShowModal(true)
  }

  const closeModal = () => { setShowModal(false); setEditing(null); setImagePreview(null) }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setForm(p => ({ ...p, image_couverture: file }))
    setImagePreview(URL.createObjectURL(file))
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setFormLoading(true)
    try {
      // Utiliser FormData si une image est fournie
      let payload
      if (form.image_couverture) {
        payload = new FormData()
        payload.append('nom',             form.nom)
        payload.append('pays',            form.pays)
        payload.append('ville_id',        form.ville_id)
        payload.append('actif',           form.actif ? '1' : '0')
        payload.append('image_couverture', form.image_couverture)
        // Laravel METHOD spoofing pour PUT via FormData
        if (editing) payload.append('_method', 'PUT')
      } else {
        payload = { nom: form.nom, pays: form.pays, ville_id: parseInt(form.ville_id), actif: form.actif }
      }

      if (editing) {
        // Si FormData → POST avec _method=PUT, sinon PUT direct
        if (payload instanceof FormData) {
          await apiFetch('POST', `/admin/destinations/${editing.id}`, payload)
        } else {
          await apiFetch('PUT', `/admin/destinations/${editing.id}`, payload)
        }
        setAlert({ type: 'success', message: 'Destination mise à jour.' })
      } else {
        const method = payload instanceof FormData ? 'POST' : 'POST'
        await apiFetch(method, '/admin/destinations', payload)
        setAlert({ type: 'success', message: 'Destination créée.' })
      }
      closeModal(); load()
    } catch (err) {
      setAlert({ type: 'error', message: err.message || 'Erreur lors de l\'enregistrement.' })
    } finally {
      setFormLoading(false)
    }
  }

  const handleDelete = async (id) => {
    try {
      await apiFetch('DELETE', `/admin/destinations/${id}`)
      setAlert({ type: 'success', message: 'Destination supprimée.' })
      setConfirmDel(null); load()
    } catch { setAlert({ type: 'error', message: 'Impossible de supprimer.' }) }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="page-title">Destinations</h1>
          <p className="text-sm text-gray-500">{items.length} destination{items.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={load} className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-500">
            <RefreshCw size={16} />
          </button>
          <Button icon={Plus} onClick={openNew}>Nouvelle destination</Button>
        </div>
      </div>

      {alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}

      {confirmDel && (
        <div className="card p-4 border-red-200 bg-red-50 flex items-center justify-between gap-4">
          <p className="text-sm text-red-700 font-medium">Supprimer cette destination ?</p>
          <div className="flex gap-2">
            <Button variant="danger" size="sm" onClick={() => handleDelete(confirmDel)}>Supprimer</Button>
            <Button variant="ghost"  size="sm" onClick={() => setConfirmDel(null)}>Annuler</Button>
          </div>
        </div>
      )}

      {loading ? <Loader /> : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map(d => (
            <div key={d.id} className="card overflow-hidden group">
              {d.image_couverture ? (
                <img src={d.image_couverture} alt={d.nom}
                  className="w-full h-36 object-cover -mx-5 -mt-5 mb-4"
                  style={{ width: 'calc(100% + 2.5rem)' }} />
              ) : (
                <div className="w-full h-36 bg-surface -mx-5 -mt-5 mb-4 flex items-center justify-center"
                  style={{ width: 'calc(100% + 2.5rem)' }}>
                  
                </div>
              )}
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-semibold text-gray-800 truncate">{d.nom}</p>
                  <p className="text-xs text-gray-500">{d.pays}{d.ville?.nom ? ` · ${d.ville.nom}` : ''}</p>
                  <span className={`mt-1.5 inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                    d.actif ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                    {d.actif ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  <button onClick={() => openEdit(d)}
                    className="p-1.5 text-gray-400 hover:text-secondary hover:bg-secondary/10 rounded-lg transition-colors">
                    <Edit2 size={14} />
                  </button>
                  <button onClick={() => setConfirmDel(d.id)}
                    className="p-1.5 text-gray-400 hover:text-danger hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal formulaire */}
      <Modal isOpen={showModal} onClose={closeModal}
        title={editing ? 'Modifier la destination' : 'Nouvelle destination'} size="md">
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nom *</label>
            <input type="text" value={form.nom}
              onChange={e => setForm(p => ({ ...p, nom: e.target.value }))}
              className="input-field" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Pays *</label>
            <input type="text" value={form.pays}
              onChange={e => setForm(p => ({ ...p, pays: e.target.value }))}
              className="input-field" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ville</label>
            <select value={form.ville_id}
              onChange={e => setForm(p => ({ ...p, ville_id: e.target.value }))}
              className="input-field">
              <option value="">Choisir…</option>
              {villes.map(v => <option key={v.id} value={String(v.id)}>{v.nom}</option>)}
            </select>
          </div>

          {/* Upload image */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1.5">
              <Image size={14} className="text-secondary" /> Image de couverture
            </label>
            {imagePreview && (
              <div className="mb-2 relative">
                <img src={imagePreview} alt="Aperçu"
                  className="w-full h-36 object-cover rounded-xl border border-gray-100" />
                <button type="button"
                  onClick={() => { setImagePreview(null); setForm(p => ({ ...p, image_couverture: null })) }}
                  className="absolute top-2 right-2 w-6 h-6 bg-white rounded-full shadow flex items-center justify-center text-gray-500 hover:text-danger text-xs">
                  ✕
                </button>
              </div>
            )}
            <input type="file" accept="image/*"
              onChange={handleImageChange}
              className="input-field py-2 text-sm cursor-pointer" />
            <p className="text-xs text-gray-400 mt-1">
              {editing ? 'Laisser vide pour conserver l\'image actuelle.' : 'JPG, PNG ou WebP – max 2 Mo'}
            </p>
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.actif}
              onChange={e => setForm(p => ({ ...p, actif: e.target.checked }))}
              className="w-4 h-4 text-secondary rounded" />
            <span className="text-sm font-medium text-gray-700">Active</span>
          </label>

          <Button type="submit" loading={formLoading} className="w-full">
            {editing ? 'Mettre à jour' : 'Créer'}
          </Button>
        </form>
      </Modal>
    </div>
  )
}