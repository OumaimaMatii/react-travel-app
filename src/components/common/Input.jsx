import React from 'react'

export default function Input({ label, error, className = '', ...props }) {
  return (
    <div className="space-y-1">
      {label && <label className="block text-sm font-medium text-gray-700">{label}</label>}
      <input
        className={`input-field ${error ? 'border-danger ring-1 ring-danger/30' : ''} ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  )
}
