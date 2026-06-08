
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react'

const ALERT_CONFIG = {
  success: { icon: CheckCircle, bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-800', iconColor: 'text-emerald-500' },
  error:   { icon: XCircle,     bg: 'bg-red-50',     border: 'border-red-200',     text: 'text-red-800',     iconColor: 'text-red-500'     },
  warn:    { icon: AlertTriangle,bg: 'bg-amber-50',   border: 'border-amber-200',   text: 'text-amber-800',   iconColor: 'text-amber-500'   },
  info:    { icon: Info,         bg: 'bg-blue-50',    border: 'border-blue-200',    text: 'text-blue-800',    iconColor: 'text-blue-500'    },
}

export function Alert({ type = 'info', message, onClose }) {
  if (!message) return null
  const { icon: Icon, bg, border, text, iconColor } = ALERT_CONFIG[type] || ALERT_CONFIG.info
  return (
    <div className={`flex items-start gap-3 p-4 rounded-xl border ${bg} ${border}`}>
      <Icon size={18} className={`flex-shrink-0 mt-0.5 ${iconColor}`} />
      <p className={`text-sm flex-1 ${text}`}>{message}</p>
      {onClose && (
        <button onClick={onClose} className={`${text} opacity-60 hover:opacity-100 transition-opacity`}>
          <X size={16} />
        </button>
      )}
    </div>
  )
}

export default Alert
