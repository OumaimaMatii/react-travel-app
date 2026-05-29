/**
 * Formate un prix en DH marocain.
 * @param {number|string} value
 * @returns {string}  ex: "1 500,00 DH"
 */
export function formatPrice(value) {
  const num = typeof value === 'string'
    ? parseFloat(value.replace(/\s/g, '').replace(',', '.'))
    : (value || 0)

  if (isNaN(num)) return '— DH'

  return new Intl.NumberFormat('fr-MA', {
    style:                'decimal',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num) + ' DH'
}
