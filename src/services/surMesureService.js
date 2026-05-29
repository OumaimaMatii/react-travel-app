/**
 * Service dédié aux appels API du voyage sur mesure côté client.
 */

import api from './api';

const surMesureService = {
  /**
   * Récupère les transports publics filtrés par ville de départ.
   * @param {string} villeDepart - Nom de la ville
   */
  getTransports(villeDepart = '') {
    const params = villeDepart ? { ville_depart: villeDepart } : {};
    return api.get('/client/sur-mesure/transports', params);
  },

  /**
   * Récupère le pourcentage de commission.
   */
  getCommission() {
    return api.get('/client/sur-mesure/commission');
  },

  /**
   * Calcul du prix total côté serveur.
   * @param {Object} payload - Éléments sélectionnés par le client
   */
  calculerPrix(payload) {
    return api.post('/client/sur-mesure/calculer', payload);
  },

  /**
   * Crée une demande de voyage sur mesure.
   * @param {Object} payload - Données complètes du formulaire
   */
  creer(payload) {
    return api.post('/client/sur-mesure', payload);
  },

  /**
   * Liste les demandes du client connecté.
   */
  mesDemandes() {
    return api.get('/client/sur-mesure');
  },

  /**
   * Détail d'une demande.
   * @param {number} id
   */
  getById(id) {
    return api.get(`/client/sur-mesure/${id}`);
  },
};

export default surMesureService;
