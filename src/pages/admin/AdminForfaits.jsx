import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchForfaits, deleteForfait } from '../../store/slices/forfaitSlice'
import ForfaitCard from '../../components/cards/ForfaitCard'
import ForfaitForm from '../../components/forms/ForfaitForm'
import Modal from '../../components/common/Modal'
import Loader from '../../components/common/Loader'
import Alert from '../../components/common/Alert'
import Button from '../../components/common/Button'
import { Plus, RefreshCw, Search } from 'lucide-react'
import api from '../../services/api'

export default function AdminForfaits() {
  const dispatch = useDispatch()
  const { items, loading } = useSelector(s => s.forfaits)

  const [showModal,   setShowModal]   = useState(false)
  const [editForfait, setEditForfait] = useState(null)
  const [formLoading, setFormLoading] = useState(false)
  const [serverError, setServerError] = useState(null)
  const [alert,       setAlert]       = useState(null)
  const [confirmDel,  setConfirmDel]  = useState(null)
  const [search,      setSearch]      = useState('')

  useEffect(() => { dispatch(fetchForfaits()) }, [dispatch])

  const filtered = items.filter(f =>
    !search ||
    f.destination?.nom?.toLowerCase().includes(search.toLowerCase()) ||
    f.voyage?.titre?.toLowerCase().includes(search.toLowerCase())
  )

  const handleNew = () => { setEditForfait(null); setServerError(null); setShowModal(true) }
  const handleEdit = (f) => { setEditForfait(f); setServerError(null); setShowModal(true) }
  const handleClose = () => { setShowModal(false); setEditForfait(null); setServerError(null) }

  const handleSubmit = async (data) => {
    setFormLoading(true); setServerError(null)
    try {
      if (editForfait) {
        await api.put(`/admin/forfaits/${editForfait.id}`, data)
        setAlert({ type: 'success', message: 'Forfait mis à jour.' })
      } else {
        await api.post('/admin/forfaits', data)
        setAlert({ type: 'success', message: 'Forfait créé.' })
      }
      handleClose(); dispatch(fetchForfaits())
    } catch (e) { setServerError(e.json || { message: e.message }) }
    finally { setFormLoading(false) }
  }

  const handleDelete = async (id) => {
    try {
      await dispatch(deleteForfait(id)).unwrap()
      setAlert({ type: 'success', message: 'Forfait supprimé.' }); setConfirmDel(null)
    } catch { setAlert({ type: 'error', message: 'Impossible de supprimer.' }) }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="page-title">Gestion des forfaits</h1>
          <p className="text-sm text-gray-500">{items.length} forfait{items.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => dispatch(fetchForfaits())}
            className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-500 transition-colors">
            <RefreshCw size={16} />
          </button>
          <Button icon={Plus} onClick={handleNew}>Nouveau forfait</Button>
        </div>
      </div>

      {alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}

      {confirmDel && (
        <div className="card p-4 border-red-200 bg-red-50 flex items-center justify-between gap-4">
          <p className="text-sm text-red-700 font-medium">Confirmer la suppression ? Cette action est irréversible.</p>
          <div className="flex gap-2">
            <Button variant="danger" size="sm" onClick={() => handleDelete(confirmDel)}>Supprimer</Button>
            <Button variant="ghost"  size="sm" onClick={() => setConfirmDel(null)}>Annuler</Button>
          </div>
        </div>
      )}

      {/* Recherche */}
      <div className="relative">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
        <input type="text" placeholder="Rechercher un forfait…" value={search}
          onChange={e => setSearch(e.target.value)}
          className="input-field pl-10 py-2.5" />
      </div>

      {loading ? <Loader /> : filtered.length === 0 ? (
        <div className="card p-16 text-center">
          <p className="text-gray-400">Aucun forfait trouvé.</p>
          <Button icon={Plus} onClick={handleNew} className="mt-4">Créer un forfait</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(f => (
            <ForfaitCard key={f.id} forfait={f} showActions onEdit={handleEdit} onDelete={id => setConfirmDel(id)} />
          ))}
        </div>
      )}

      <Modal isOpen={showModal} onClose={handleClose}
        title={editForfait ? `Modifier : ${editForfait.voyage?.titre || `Forfait #${editForfait.id}`}` : 'Créer un forfait'} size="xl">
        <ForfaitForm initial={editForfait} onSubmit={handleSubmit} loading={formLoading} serverError={serverError} />
      </Modal>
    </div>
  )
}
