import React from 'react'

export default function Select({ label, error, options = [], placeholder, className = '', ...props }) {
  return (
    <div className="space-y-1">
      {label && <label className="block text-sm font-medium text-gray-700">{label}</label>}
      <select className={`input-field ${error ? 'border-danger' : ''} ${className}`} {...props}>
        {placeholder && <option value="">{placeholder}</option>}
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  )
}
