/**
 * Utilitaires de formatage de dates.
 */

/**
 * Formate une date ISO en format local français.
 * @param {string|Date} date
 * @returns {string}  ex: "15 mars 2025"
 */
export function formatDate(date) {
  if (!date) return '—'
  const d = new Date(date)
  if (isNaN(d)) return '—'
  return d.toLocaleDateString('fr-MA', {
    day:   '2-digit',
    month: 'long',
    year:  'numeric',
  })
}

/**
 * Formate une date + heure.
 * @param {string|Date} date
 * @returns {string}  ex: "15 mars 2025 à 14:30"
 */
export function formatDateTime(date) {
  if (!date) return '—'
  const d = new Date(date)
  if (isNaN(d)) return '—'
  return d.toLocaleDateString('fr-MA', {
    day:    '2-digit',
    month:  'long',
    year:   'numeric',
    hour:   '2-digit',
    minute: '2-digit',
  })
}

/**
 * Calcule la durée en jours entre deux dates.
 * @param {string} dateDepart
 * @param {string} dateRetour
 * @returns {number|null}
 */
export function calcDuree(dateDepart, dateRetour) {
  if (!dateDepart || !dateRetour) return null
  const diff = new Date(dateRetour) - new Date(dateDepart)
  if (diff <= 0) return null
  return Math.ceil(diff / 86400000)
}
