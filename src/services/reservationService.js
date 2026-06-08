/**
 * reservationService.js – Service pour les reservations expirees
 */

import api from './api';

const reservationService = {
  async verifierForfaitDisponible(forfaitId) {
    try {
      const res = await api.get(`/client/forfaits/${forfaitId}/verifier-disponibilite`);
      return res.data;
    } catch (error) {
      throw error;
    }
  },

  async refaireReservationForfait(ancienneReservationId) {
    try {
      const res = await api.post(`/client/forfaits/${ancienneReservationId}/refaire`);
      return res.data;
    } catch (error) {
      throw error;
    }
  },

  async verifierTransportSurMesure(reservationId) {
    try {
      const res = await api.get(`/client/sur-mesure/${reservationId}/verifier-transport`);
      return res.data;
    } catch (error) {
      throw error;
    }
  },

  async refaireReservationSurMesure(ancienneReservationId) {
    try {
      // Correction : utiliser la bonne route
      const res = await api.post(`/client/sur-mesure/${ancienneReservationId}/refaire`);
      return res.data;
    } catch (error) {
      throw error;
    }
  },
};

export default reservationService;