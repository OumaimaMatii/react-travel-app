/**
 * MesForfaits.jsx – Page agent : liste ses forfaits avec actions CRUD.
 */

import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchMesForfaits, deleteForfait, createForfait, updateForfait } from '../../store/slices/forfaitSlice'
import ForfaitCard from '../../components/cards/ForfaitCard'
import ForfaitForm from '../../components/forms/ForfaitForm'
import Modal from '../../components/common/Modal'
import Loader from '../../components/common/Loader'
import Alert from '../../components/common/Alert'
import Button from '../../components/common/Button'
import { Plus, RefreshCw } from 'lucide-react'

export default function MesForfaits() {
  const dispatch = useDispatch()
  const { mesForfaits, loading, error } = useSelector(s => s.forfaits)

  const [showModal,    setShowModal]    = useState(false)
  const [editForfait,  setEditForfait]  = useState(null)   // null = création
  const [formLoading,  setFormLoading]  = useState(false)
  const [serverError,  setServerError]  = useState(null)
  const [alert,        setAlert]        = useState(null)
  const [confirmDel,   setConfirmDel]   = useState(null)   // id à supprimer

  useEffect(() => { dispatch(fetchMesForfaits()) }, [dispatch])

  // ── Ouvrir modal création ─────────────────────────────────────────────────
  const handleNew = () => {
    setEditForfait(null)
    setServerError(null)
    setShowModal(true)
  }

  // ── Ouvrir modal édition ──────────────────────────────────────────────────
  const handleEdit = (forfait) => {
    setEditForfait(forfait)
    setServerError(null)
    setShowModal(true)
  }

  // ── Fermer modal ──────────────────────────────────────────────────────────
  const handleClose = () => {
    setShowModal(false)
    setEditForfait(null)
    setServerError(null)
  }

  // ── Soumettre création / édition ──────────────────────────────────────────
  const handleSubmit = async (data) => {
    setFormLoading(true)
    setServerError(null)
    try {
      if (editForfait) {
        await dispatch(updateForfait({ id: editForfait.id, data })).unwrap()
        setAlert({ type: 'success', message: 'Forfait mis à jour avec succès.' })
      } else {
        await dispatch(createForfait(data)).unwrap()
        setAlert({ type: 'success', message: 'Forfait créé avec succès.' })
      }
      handleClose()
      dispatch(fetchMesForfaits())
    } catch (err) {
      setServerError(err)
    } finally {
      setFormLoading(false)
    }
  }

  // ── Supprimer ─────────────────────────────────────────────────────────────
  const handleDelete = async (id) => {
    try {
      await dispatch(deleteForfait(id)).unwrap()
      setAlert({ type: 'success', message: 'Forfait supprimé.' })
      setConfirmDel(null)
    } catch {
      setAlert({ type: 'error', message: 'Impossible de supprimer ce forfait.' })
    }
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="page-title">Mes forfaits</h1>
          <p className="text-sm text-gray-500">
            {mesForfaits.length} forfait{mesForfaits.length !== 1 ? 's' : ''} géré{mesForfaits.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => dispatch(fetchMesForfaits())}
            className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-500 transition-colors"
            title="Actualiser"
          >
            <RefreshCw size={16} />
          </button>
          <Button icon={Plus} onClick={handleNew}>
            Nouveau forfait
          </Button>
        </div>
      </div>

      {/* Alertes */}
      {alert && (
        <Alert
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert(null)}
        />
      )}
      {error && (
        <Alert type="error" message={typeof error === 'string' ? error : 'Erreur de chargement'} />
      )}

      {/* Confirmation suppression */}
      {confirmDel && (
        <div className="card p-4 border-red-200 bg-red-50 flex items-center justify-between gap-4">
          <p className="text-sm text-red-700 font-medium">
            Confirmer la suppression de ce forfait ? Cette action est irréversible.
          </p>
          <div className="flex gap-2 flex-shrink-0">
            <Button variant="danger" size="sm" onClick={() => handleDelete(confirmDel)}>
              Supprimer
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setConfirmDel(null)}>
              Annuler
            </Button>
          </div>
        </div>
      )}

      {/* Contenu */}
      {loading ? (
        <Loader />
      ) : mesForfaits.length === 0 ? (
        <div className="card p-16 text-center">
          <div className="w-16 h-16 bg-secondary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Plus size={28} className="text-secondary" />
          </div>
          <p className="text-gray-500 font-semibold text-lg">Aucun forfait pour le moment</p>
          <p className="text-sm text-gray-400 mt-2 mb-6">
            Créez votre premier forfait pour commencer à recevoir des réservations.
          </p>
          <Button icon={Plus} onClick={handleNew}>
            Créer mon premier forfait
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mesForfaits.map(f => (
            <ForfaitCard
              key={f.id}
              forfait={f}
              showActions
              onEdit={handleEdit}
              onDelete={(id) => setConfirmDel(id)}
            />
          ))}
        </div>
      )}

      {/* Modal création / édition */}
      <Modal
        isOpen={showModal}
        onClose={handleClose}
        title={editForfait ? `Modifier : ${editForfait.voyage?.titre || `Forfait #${editForfait.id}`}` : 'Créer un nouveau forfait'}
        size="xl"
      >
        <ForfaitForm
          initial={editForfait}
          onSubmit={handleSubmit}
          loading={formLoading}
          serverError={serverError}
        />
      </Modal>
    </div>
  )
}
