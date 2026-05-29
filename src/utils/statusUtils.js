/**
 * Utilitaires pour les badges de statut.
 */

/**
 * Retourne les classes CSS pour le badge d'une réservation.
 */
export function getReservationStatut(statut) {
  const map = {
    en_attente:              { bg: 'bg-amber-100',   text: 'text-amber-800',   label: 'En attente' },
    en_attente_confirmation: { bg: 'bg-orange-100',  text: 'text-orange-800',  label: 'À confirmer' },
    confirmee:               { bg: 'bg-emerald-100', text: 'text-emerald-800', label: 'Confirmée' },
    annulee:                 { bg: 'bg-red-100',     text: 'text-red-800',     label: 'Annulée' },
    en_cours:                { bg: 'bg-blue-100',    text: 'text-blue-800',    label: 'En cours' },
    terminee:                { bg: 'bg-gray-100',    text: 'text-gray-800',    label: 'Terminée' },
  }
  return map[statut] || { bg: 'bg-gray-100', text: 'text-gray-600', label: statut || 'Inconnu' }
}

/**
 * Retourne les classes CSS pour le badge d'un forfait.
 */
export function getForfaitStatut(nom) {
  const map = {
    'Actif':            { bg: 'bg-emerald-100', text: 'text-emerald-800' },
    'Complet':          { bg: 'bg-red-100',     text: 'text-red-800'     },
    'En préparation':   { bg: 'bg-amber-100',   text: 'text-amber-800'   },
    'Annulé':           { bg: 'bg-gray-100',    text: 'text-gray-600'    },
    'Archivé':          { bg: 'bg-gray-100',    text: 'text-gray-500'    },
  }
  return map[nom] || { bg: 'bg-blue-100', text: 'text-blue-700' }
}
