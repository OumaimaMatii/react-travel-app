import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  fetchNotifications, markAsRead, markAllAsRead, deleteNotification,
} from '../../store/slices/notificationSlice'
import Loader from '../../components/common/Loader'
import { Bell, Check, CheckCheck, Trash2, ExternalLink } from 'lucide-react'
import { formatDateTime } from '../../utils/formatDate'
import { Link } from 'react-router-dom'

const TYPE_COLORS = {
  reservation: 'bg-blue-100 text-blue-600',
  paiement:    'bg-emerald-100 text-emerald-600',
  annulation:  'bg-red-100 text-red-600',
  document:    'bg-purple-100 text-purple-600',
  rappel:      'bg-amber-100 text-amber-600',
  alerte:      'bg-orange-100 text-orange-600',
  info:        'bg-gray-100 text-gray-600',
}

export default function MesNotifications() {
  const dispatch = useDispatch()
  const { items, unreadCount, loading } = useSelector(s => s.notifications)

  useEffect(() => { dispatch(fetchNotifications()) }, [dispatch])

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title mb-0">Notifications</h1>
          <p className="text-sm text-gray-400">
            {unreadCount > 0 ? `${unreadCount} non lue${unreadCount > 1 ? 's' : ''}` : 'Tout est lu'}
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={() => dispatch(markAllAsRead())}
            className="flex items-center gap-1.5 text-sm text-secondary font-medium hover:text-secondary-dark transition-colors"
          >
            <CheckCheck size={16} /> Tout marquer comme lu
          </button>
        )}
      </div>

      {loading ? (
        <Loader />
      ) : items.length === 0 ? (
        <div className="card p-16 text-center">
          <Bell size={48} className="text-gray-200 mx-auto mb-4" />
          <p className="text-gray-400 font-medium">Aucune notification</p>
        </div>
      ) : (
        <div className="space-y-2">
          {items.map(n => (
            <div
              key={n.id}
              className={`card p-4 flex items-start gap-4 transition-all ${
                !n.lue ? 'border-secondary/30 bg-secondary/5' : ''
              }`}
            >
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-sm ${
                TYPE_COLORS[n.type] || TYPE_COLORS.info
              }`}>
                <Bell size={16} />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className={`text-sm font-semibold ${!n.lue ? 'text-primary' : 'text-gray-700'}`}>
                    {n.titre}
                  </p>
                  {!n.lue && <span className="w-2 h-2 bg-secondary rounded-full flex-shrink-0 mt-1.5" />}
                </div>
                <p className="text-sm text-gray-500 mt-0.5 leading-relaxed">{n.message}</p>
                <div className="flex items-center gap-3 mt-2">
                  <p className="text-xs text-gray-300">{formatDateTime(n.created_at)}</p>
                  {n.lien && (
                    <Link to={n.lien} className="text-xs text-secondary flex items-center gap-0.5 hover:underline">
                      Voir <ExternalLink size={11} />
                    </Link>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-1 flex-shrink-0">
                {!n.lue && (
                  <button
                    onClick={() => dispatch(markAsRead(n.id))}
                    className="p-1.5 text-gray-400 hover:text-secondary hover:bg-secondary/10 rounded-lg transition-colors"
                    title="Marquer comme lu"
                  >
                    <Check size={14} />
                  </button>
                )}
                <button
                  onClick={() => dispatch(deleteNotification(n.id))}
                  className="p-1.5 text-gray-400 hover:text-danger hover:bg-red-50 rounded-lg transition-colors"
                  title="Supprimer"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
