import React, { useState } from 'react';
import Button from '../common/Button';
import Alert from '../common/Alert';
import reservationService from '../../services/reservationService';
import { formatDate } from '../../utils/formatDate';
import { formatPrice } from '../../utils/formatPrice';
import Badge from '../common/Badge';
import api from '../../services/api';

export default function ExpiredReservationCard({ reservation, onRenewed, onProlonged }) {
  const [loading, setLoading] = useState(false);
  const [prolongLoading, setProlongLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [availability, setAvailability] = useState(null);
  const [error, setError] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  const isForfait = reservation.type_verification === 'forfait';
  const isSurMesure = reservation.type_verification === 'sur_mesure';

  const handleVerifier = async () => {
    setVerifying(true);
    setError(null);
    try {
      let result;
      if (isForfait) {
        let forfaitId = reservation.voyage?.forfait?.id || reservation.forfait_id;
        if (!forfaitId && reservation.voyage_id) {
          const forfaitRes = await api.get(`/forfaits?voyage_id=${reservation.voyage_id}`);
          const forfaits = forfaitRes.data?.data || forfaitRes.data || [];
          if (forfaits.length > 0) forfaitId = forfaits[0].id;
        }
        if (!forfaitId) throw new Error('Forfait introuvable');
        result = await reservationService.verifierForfaitDisponible(forfaitId);
      } else {
        result = await reservationService.verifierTransportSurMesure(reservation.id);
      }
      setAvailability(result);
    } catch (err) {
      setError(err.message || 'Erreur lors de la verification');
    } finally {
      setVerifying(false);
    }
  };

  const handleProlonger = async () => {
    setProlongLoading(true);
    setError(null);
    try {
      const res = await api.post(`/client/reservations/${reservation.id}/prolonger`);
      if (res.data?.success && onProlonged) {
        onProlonged(reservation.id, res.data.confirmation_deadline);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Erreur lors de la prolongation');
    } finally {
      setProlongLoading(false);
    }
  };

  const handleRefaire = async () => {
    setLoading(true);
    setError(null);
    try {
      let result;
      if (isForfait) {
        result = await reservationService.refaireReservationForfait(reservation.id);
      } else {
        result = await reservationService.refaireReservationSurMesure(reservation.id);
      }
      if (result.success && onRenewed) {
        onRenewed(result.nouvelle_reservation_id);
      }
    } catch (err) {
      setError(err.message || 'Erreur lors de la recreation');
    } finally {
      setLoading(false);
    }
  };

  const dest = reservation.voyage?.destination;
  const montant = parseFloat(String(reservation.montant_total || 0).replace(/\s/g, '').replace(',', '.'));

  return (
    <div className="card p-5 border-red-200 bg-red-50/30">
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
          <span className="text-red-600 font-bold text-lg">!</span>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
            <h3 className="font-semibold text-gray-800">
              Reservation numero {reservation.id} – {dest?.nom || 'Voyage'}
            </h3>
            <Badge statut="annulee" />
          </div>

          <p className="text-sm text-gray-600 mb-2">
            Cette reservation a expire le {formatDate(reservation.confirmation_deadline)}.
            {isForfait && ' Les places ont ete liberees.'}
            {isSurMesure && ' Les places temporaires du transport ont ete liberees.'}
          </p>

          <div className="flex flex-wrap gap-3 text-xs text-gray-500 mb-3">
            <span>Date: {formatDate(reservation.date_reservation)}</span>
            <span>Voyageurs: {reservation.nb_adultes} adulte(s)
              {reservation.nb_enfants > 0 ? ` + ${reservation.nb_enfants} enfant(s)` : ''}
            </span>
            {montant > 0 && <span>Montant: {formatPrice(montant)}</span>}
          </div>

          <div className="flex flex-wrap gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleVerifier}
              loading={verifying}
            >
              Verifier disponibilite
            </Button>

            {availability && availability.places_restantes > 0 && isForfait && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleProlonger}
                loading={prolongLoading}
              >
                Prolonger d'1h
              </Button>
            )}

            {availability && availability.peut_refaire_reservation && isSurMesure && (
              <Button
                variant="primary"
                size="sm"
                onClick={handleRefaire}
                loading={loading}
              >
                Recreer la reservation
              </Button>
            )}

            <button
              onClick={() => setShowDetails(!showDetails)}
              className="text-xs text-gray-500 hover:text-secondary underline"
            >
              {showDetails ? 'Masquer details' : 'Voir les details'}
            </button>
          </div>

          {error && (
            <Alert type="error" message={error} className="mt-3" onClose={() => setError(null)} />
          )}

          {availability && !availability.peut_refaire_reservation && isSurMesure && (
            <div className="mt-3 p-3 bg-amber-50 rounded-xl border border-amber-200">
              <p className="text-sm text-amber-700">{availability.message}</p>
              {availability.transport_details && (
                <div className="mt-2 text-xs text-amber-600">
                  <p>Transport: {availability.transport_details.compagnie}</p>
                  <p>Places disponibles: {availability.transport_details.places_disponibles}</p>
                  <p>Places necessaires: {availability.transport_details.places_necessaires}</p>
                </div>
              )}
            </div>
          )}

          {showDetails && (
            <div className="mt-3 p-3 bg-white rounded-xl border border-gray-100 text-sm">
              <p className="font-medium text-gray-700 mb-2">Details de la reservation expiree :</p>
              <div className="space-y-1 text-xs text-gray-600">
                <p>Hotel: {reservation.voyage?.forfait?.hotel?.nom || reservation.voyage?.hotel?.nom || 'Non specifie'}</p>
                {isForfait && (
                  <>
                    <p>Forfait: {reservation.voyage?.forfait?.titre || '#' + reservation.voyage_id}</p>
                    <p>Places restantes: {reservation.voyage?.forfait?.places_restantes || '?'}</p>
                  </>
                )}
                {isSurMesure && (
                  <p>Transport: {reservation.voyage?.transports?.[0]?.compagnie || 'Non specifie'}</p>
                )}
                <p>Depart: {formatDate(reservation.voyage?.date_depart)}</p>
                <p>Retour: {formatDate(reservation.voyage?.date_retour)}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}