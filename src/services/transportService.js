/**
 * transportService.js – Service pour les transports.
 */
import api from './api'

const transportService = {
  /**
   * Récupère les types de transport pour les forfaits (Bus, Mini-bus…)
   */
  async getForfaitTypeTransports() {
    try {
      const res = await api.get('/type-transports')
      return res.data?.data || res.data || []
    } catch {
      return []
    }
  },

  /**
   * Récupère les transports publics filtrés par ville de départ.
   * @param {string} villeDepart - Nom de la ville
   */
  async getPublicTransports(villeDepart = '') {
    const params = villeDepart ? { ville_depart: villeDepart } : {}
    const res = await api.get('/transports/publics', params)
    return res.data?.data || res.data || []
  },
}

export default transportService
