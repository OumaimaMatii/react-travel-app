import React from 'react'
import { Loader2 } from 'lucide-react'

const VARIANTS = {
  primary:   'btn-primary',
  secondary: 'btn-secondary',
  outline:   'btn-outline',
  ghost:     'btn-ghost',
  danger:    'btn-danger',
}

const SIZES = {
  sm: 'px-3 py-1.5 text-xs',
  md: '',
  lg: 'px-7 py-3 text-base',
}

export default function Button({
  children, variant = 'primary', size = 'md',
  loading, icon: Icon, className = '', ...props
}) {
  return (
    <button
      className={`${VARIANTS[variant]} ${SIZES[size]} inline-flex items-center gap-2 font-medium rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading
        ? <Loader2 size={15} className="animate-spin" />
        : Icon ? <Icon size={15} /> : null
      }
      {children}
    </button>
  )
}
