import React, { useEffect, useState } from 'react'
import api from '../../services/api'
import Loader from '../../components/common/Loader'
import Alert from '../../components/common/Alert'
import Modal from '../../components/common/Modal'
import Button from '../../components/common/Button'
import { formatPrice } from '../../utils/formatPrice'
import { Plus, RefreshCw, Edit2, Trash2, Zap } from 'lucide-react'

export default function AdminActivites() {
  const [items,       setItems]       = useState([])
  const [loading,     setLoading]     = useState(true)
  const [alert,       setAlert]       = useState(null)
  const [showModal,   setShowModal]   = useState(false)
  const [editing,     setEditing]     = useState(null)
  const [formLoading, setFormLoading] = useState(false)
  const [form,        setForm]        = useState({ nom: '', description: '', prix: '', destination_id: '', adapte_enfants: false })
  const [destinations,setDestinations]= useState([])
  const [confirmDel,  setConfirmDel]  = useState(null)

  const load = async () => {
    setLoading(true)
    try {
      const [aRes, dRes] = await Promise.all([api.get('/activites'), api.get('/destinations')])
      setItems(aRes.data?.data || aRes.data || [])
      setDestinations(dRes.data?.data || dRes.data || [])
    } catch {}
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const openNew  = () => { setEditing(null); setForm({ nom: '', description: '', prix: '', destination_id: '', adapte_enfants: false }); setShowModal(true) }
  const openEdit = (a) => { setEditing(a); setForm({ nom: a.nom, description: a.description || '', prix: a.prix, destination_id: String(a.destination_id || ''), adapte_enfants: !!a.adapte_enfants }); setShowModal(true) }
  const closeModal = () => { setShowModal(false); setEditing(null) }

  const handleSave = async (e) => {
    e.preventDefault(); setFormLoading(true)
    try {
      const payload = { ...form, prix: parseFloat(form.prix), destination_id: parseInt(form.destination_id) }
      if (editing) await api.put(`/admin/activites/${editing.id}`, payload)
      else         await api.post('/admin/activites', payload)
      setAlert({ type: 'success', message: editing ? 'Activité mise à jour.' : 'Activité créée.' })
      closeModal(); load()
    } catch (e) { setAlert({ type: 'error', message: e.message || 'Erreur.' }) }
    finally { setFormLoading(false) }
  }

  const handleDelete = async (id) => {
    try {
      await api.delete(`/admin/activites/${id}`)
      setAlert({ type: 'success', message: 'Activité supprimée.' }); setConfirmDel(null); load()
    } catch { setAlert({ type: 'error', message: 'Impossible de supprimer.' }) }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="page-title">Activités</h1>
          <p className="text-sm text-gray-500">{items.length} activité{items.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={load} className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-500"><RefreshCw size={16} /></button>
          <Button icon={Plus} onClick={openNew}>Nouvelle activité</Button>
        </div>
      </div>

      {alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}
      {confirmDel && (
        <div className="card p-4 border-red-200 bg-red-50 flex items-center justify-between gap-4">
          <p className="text-sm text-red-700 font-medium">Supprimer cette activité ?</p>
          <div className="flex gap-2">
            <Button variant="danger" size="sm" onClick={() => handleDelete(confirmDel)}>Supprimer</Button>
            <Button variant="ghost"  size="sm" onClick={() => setConfirmDel(null)}>Annuler</Button>
          </div>
        </div>
      )}

      {loading ? <Loader /> : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map(a => (
            <div key={a.id} className="card">
              {a.image ? (
                <img src={a.image} alt={a.nom} className="w-full h-28 object-cover rounded-xl mb-3" />
              ) : (
                <div className="w-full h-28 bg-surface rounded-xl mb-3 flex items-center justify-center">
                  <Zap size={24} className="text-gray-300" />
                </div>
              )}
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-semibold text-gray-800 truncate">{a.nom}</p>
                  <p className="text-sm font-bold text-secondary">{formatPrice(a.prix)}</p>
                  <p className="text-xs text-gray-400">{a.destination?.nom || '—'}</p>
                  {a.adapte_enfants && <span className="text-xs text-emerald-600">Adapté enfants</span>}
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  <button onClick={() => openEdit(a)} className="p-1.5 text-gray-400 hover:text-secondary hover:bg-secondary/10 rounded-lg transition-colors"><Edit2 size={14} /></button>
                  <button onClick={() => setConfirmDel(a.id)} className="p-1.5 text-gray-400 hover:text-danger hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={14} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={showModal} onClose={closeModal} title={editing ? 'Modifier l\'activité' : 'Nouvelle activité'} size="md">
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nom *</label>
            <input type="text" value={form.nom} onChange={e => setForm(p=>({...p,nom:e.target.value}))} className="input-field" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea rows={3} value={form.description} onChange={e => setForm(p=>({...p,description:e.target.value}))} className="input-field" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Prix (DH) *</label>
              <input type="number" step="0.01" min="0" value={form.prix} onChange={e => setForm(p=>({...p,prix:e.target.value}))} className="input-field" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Destination *</label>
              <select value={form.destination_id} onChange={e => setForm(p=>({...p,destination_id:e.target.value}))} className="input-field" required>
                <option value="">Choisir…</option>
                {destinations.map(d => <option key={d.id} value={String(d.id)}>{d.nom}</option>)}
              </select>
            </div>
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.adapte_enfants} onChange={e => setForm(p=>({...p,adapte_enfants:e.target.checked}))} className="w-4 h-4 text-secondary rounded" />
            <span className="text-sm font-medium text-gray-700">Adapté aux enfants</span>
          </label>
          <Button type="submit" loading={formLoading} className="w-full">{editing ? 'Mettre à jour' : 'Créer'}</Button>
        </form>
      </Modal>
    </div>
  )
}
