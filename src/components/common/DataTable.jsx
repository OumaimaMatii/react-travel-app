/**
 * DataTable.jsx – Tableau de données générique.
 * Correction : la balise fermante </td> était incorrectement écrite <td> dans l'original.
 */

import React from 'react'
import Loader from './Loader'

export default function DataTable({
  columns,
  data,
  loading,
  emptyMessage = 'Aucune donnée',
  onRowClick,
}) {
  if (loading) return <Loader />

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-100">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-surface border-b border-gray-100">
            {columns.map(col => (
              <th
                key={col.key}
                className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide"
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="px-4 py-10 text-center text-gray-400 text-sm"
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, i) => (
              <tr
                key={row.id || i}
                onClick={() => onRowClick?.(row)}
                className={`hover:bg-surface/60 transition-colors ${onRowClick ? 'cursor-pointer' : ''}`}
              >
                {columns.map(col => (
                  <td key={col.key} className="px-4 py-3 text-gray-700">
                    {col.render ? col.render(row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
