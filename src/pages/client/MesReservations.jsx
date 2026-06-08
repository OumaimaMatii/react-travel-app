// src/pages/client/MesReservations.jsx

import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { Calendar, MapPin, RefreshCw, ArrowRight, Clock, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { fetchMesReservations } from '../../store/slices/reservationSlice';
import Badge from '../../components/common/Badge';
import Loader from '../../components/common/Loader';
import Alert from '../../components/common/Alert';
import Button from '../../components/common/Button';
import { formatDate, formatDateTime } from '../../utils/formatDate';
import { formatPrice } from '../../utils/formatPrice';
import api from '../../services/api';

export default function MesReservations() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items, loading } = useSelector(s => s.reservations);
  const [activeTab, setActiveTab] = useState('active');
  const [alert, setAlert] = useState(null);
  const [renewLoading, setRenewLoading] = useState(null);
  const [checkLoading, setCheckLoading] = useState(null);
  const [availability, setAvailability] = useState({});

  useEffect(() => {
    dispatch(fetchMesReservations());
  }, [dispatch]);

  const parseMontant = (m) =>
    typeof m === 'string' ? parseFloat(m.replace(/\s/g, '').replace(',', '.')) : (m || 0);

  const activeReservations = items.filter(r =>
    r.statut === 'confirmee' || r.statut === 'en_attente' || r.statut === 'en_attente_confirmation'
  );
  const expiredReservations = items.filter(r => r.statut === 'annulee');

  // Vérifier disponibilité
  const handleVerifier = async (reservation) => {
    setCheckLoading(reservation.id);
    try {
      let result;
      if (reservation.type_verification === 'forfait') {
        let forfaitId = null;
        
        // Source 1: via voyage.forfait.id
        if (reservation.voyage?.forfait?.id) {
          forfaitId = reservation.voyage.forfait.id;
        }
        // Source 2: via forfait_id direct
        else if (reservation.forfait_id) {
          forfaitId = reservation.forfait_id;
        }
        // Source 3: via voyage_id (requête API)
        else if (reservation.voyage_id) {
          try {
            const forfaitRes = await api.get(`/forfaits?voyage_id=${reservation.voyage_id}`);
            const forfaits = forfaitRes.data?.data || forfaitRes.data || [];
            if (forfaits.length > 0) {
              forfaitId = forfaits[0].id;
            }
          } catch (err) {
            console.error('Erreur récupération forfait:', err);
          }
        }
        
        if (!forfaitId) {
          setAvailability(prev => ({ 
            ...prev, 
            [reservation.id]: { peut_reserver: false, message: 'Forfait introuvable. Contactez le support.' } 
          }));
          setCheckLoading(null);
          return;
        }
        
        const res = await api.get(`/client/forfaits/${forfaitId}/verifier-disponibilite`);
        result = { ...res.data, type: 'forfait', forfaitId };
      } else {
        const res = await api.get(`/client/sur-mesure/${reservation.id}/verifier-transport`);
        result = { ...res.data, type: 'sur_mesure' };
      }
      setAvailability(prev => ({ ...prev, [reservation.id]: result }));
    } catch (e) {
      console.error('Erreur vérification:', e);
      setAvailability(prev => ({ 
        ...prev, 
        [reservation.id]: { 
          peut_reserver: false, 
          message: e.response?.data?.message || e.message || 'Erreur de vérification.' 
        } 
      }));
    } finally {
      setCheckLoading(null);
    }
  };

  // Prolonger une réservation forfait de +1 heure
  const handleProlonger = async (reservation) => {
    setRenewLoading(reservation.id);
    try {
      const res = await api.post(`/client/reservations/${reservation.id}/prolonger`);
      if (res.data?.success) {
        setAlert({ 
          type: 'success', 
          message: `Réservation #${reservation.id} prolongée d'une heure ! Nouveau délai: ${formatDateTime(res.data.confirmation_deadline)}` 
        });
        dispatch(fetchMesReservations());
        setActiveTab('active');
        setAvailability(prev => {
          const newState = { ...prev };
          delete newState[reservation.id];
          return newState;
        });
      } else {
        setAlert({ type: 'error', message: res.data?.message || 'Erreur lors de la prolongation.' });
      }
    } catch (e) {
      setAlert({ type: 'error', message: e.response?.data?.message || e.message || 'Impossible de prolonger la réservation.' });
    } finally {
      setRenewLoading(null);
    }
  };

  // Re-créer réservation forfait (avec ressaisie des voyageurs)
  const handleRefaireForfait = async (reservation) => {
    setRenewLoading(reservation.id);
    try {
      // Récupérer l'ID du forfait
      let forfaitId = reservation.forfait_id || reservation.voyage?.forfait?.id;
      
      if (!forfaitId && reservation.voyage_id) {
        try {
          const forfaitRes = await api.get(`/forfaits?voyage_id=${reservation.voyage_id}`);
          const forfaits = forfaitRes.data?.data || forfaitRes.data || [];
          if (forfaits.length > 0) {
            forfaitId = forfaits[0].id;
          }
        } catch (err) {
          console.error('Erreur:', err);
        }
      }
      
      if (!forfaitId) {
        setAlert({ type: 'error', message: 'Forfait introuvable. Impossible de recréer.' });
        setRenewLoading(null);
        return;
      }
      
      const res = await api.post(`/client/forfaits/${forfaitId}/refaire`);
      if (res.data?.success) {
        setAlert({ 
          type: 'success', 
          message: `Nouvelle réservation #${res.data.nouvelle_reservation_id} créée ! Vous avez 1h pour confirmer.` 
        });
        dispatch(fetchMesReservations());
        setActiveTab('active');
        setAvailability(prev => {
          const newState = { ...prev };
          delete newState[reservation.id];
          return newState;
        });
      } else {
        setAlert({ type: 'error', message: res.data?.message || 'Erreur lors de la recréation.' });
      }
    } catch (e) {
      setAlert({ type: 'error', message: e.response?.data?.message || e.message || 'Impossible de recréer la réservation.' });
    } finally {
      setRenewLoading(null);
    }
  };

  // Rediriger vers wizard sur mesure pré-rempli
  const handleRefaireSurMesure = (reservation) => {
    const prefillData = {
      reservationId: reservation.id,
      voyageId: reservation.voyage_id,
      destination: reservation.voyage?.destination,
      villeDepart: reservation.voyage?.ville_depart,
      dateDepart: reservation.voyage?.date_depart,
      dateRetour: reservation.voyage?.date_retour,
      nbAdultes: reservation.nb_adultes,
      nbEnfants: reservation.nb_enfants,
      hotel: reservation.voyage?.forfait?.hotel || null,
      details_chambres: reservation.details_chambres || [],
      transports: reservation.voyage?.transports || [],
      activites: reservation.voyage?.activites || [],
      transport_id: reservation.voyage?.transports?.[0]?.id || null
    };
    
    navigate('/client/sur-mesure', {
      state: { prefill: prefillData }
    });
  };

  if (loading) return <Loader />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Mes réservations</h1>
        <p className="text-sm text-gray-500">{items.length} réservation(s) au total</p>
      </div>

      {alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}

      {/* Onglets */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
        <button
          onClick={() => setActiveTab('active')}
          className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'active'
              ? 'bg-white text-secondary shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Actives
          {activeReservations.length > 0 && (
            <span className={`ml-2 px-1.5 py-0.5 rounded-full text-xs ${
              activeTab === 'active' ? 'bg-secondary text-white' : 'bg-gray-300 text-gray-600'
            }`}>
              {activeReservations.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('expired')}
          className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'expired'
              ? 'bg-white text-red-600 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Expirées / Annulées
          {expiredReservations.length > 0 && (
            <span className={`ml-2 px-1.5 py-0.5 rounded-full text-xs ${
              activeTab === 'expired' ? 'bg-red-100 text-red-600' : 'bg-gray-300 text-gray-600'
            }`}>
              {expiredReservations.length}
            </span>
          )}
        </button>
      </div>

      {/* Onglet Actives */}
      {activeTab === 'active' && (
        activeReservations.length === 0 ? (
          <div className="card p-16 text-center">
            <Calendar size={48} className="text-gray-200 mx-auto mb-4" />
            <p className="text-gray-500 font-medium text-lg">Aucune réservation active</p>
            <p className="text-sm text-gray-400 mt-2 mb-6">
              Explorez nos forfaits et réservez votre prochain voyage
            </p>
            <Link to="/forfaits" className="btn-primary inline-flex items-center gap-2">
              Voir les forfaits <ArrowRight size={16} />
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {activeReservations.map(r => {
              const dest = r.voyage?.destination;
              const img = dest?.medias?.[0]?.url || dest?.image_couverture;
              return (
                <Link
                  key={r.id}
                  to={`/client/reservations/${r.id}`}
                  className="card p-5 flex items-center gap-5 hover:shadow-card-hover transition-all group"
                >
                  {img ? (
                    <img src={img} alt={dest?.nom} className="w-20 h-20 rounded-xl object-cover flex-shrink-0" />
                  ) : (
                    <div className="w-20 h-20 bg-surface rounded-xl flex items-center justify-center flex-shrink-0">
                      <MapPin size={24} className="text-gray-300" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <p className="font-display font-semibold text-primary truncate">
                        {dest?.nom || `Réservation #${r.id}`}
                      </p>
                      <Badge statut={r.statut} />
                      {r.type_verification === 'sur_mesure' && (
                        <span className="text-xs text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full">
                          Sur mesure
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400">
                      Réservé le {formatDate(r.date_reservation)} · {r.nb_adultes} adulte(s)
                      {r.nb_enfants > 0 ? `, ${r.nb_enfants} enfant(s)` : ''}
                    </p>
                    {r.voyage?.date_depart && (
                      <p className="text-xs text-secondary mt-1">
                        Départ : {formatDate(r.voyage.date_depart)}
                      </p>
                    )}
                    {r.statut === 'en_attente' && r.confirmation_deadline && (
                      <p className="text-xs text-amber-600 flex items-center gap-1 mt-1">
                        <Clock size={11} /> Délai de confirmation : {formatDate(r.confirmation_deadline)}
                      </p>
                    )}
                  </div>
                  <div className="text-right flex-shrink-0 flex flex-col items-end gap-2">
                    {r.montant_total && (
                      <p className="text-lg font-bold text-secondary">
                        {formatPrice(parseMontant(r.montant_total))}
                      </p>
                    )}
                    <ArrowRight size={16} className="text-gray-300 group-hover:text-secondary transition-colors" />
                  </div>
                </Link>
              );
            })}
          </div>
        )
      )}

      {/* Onglet Expirées / Annulées */}
      {activeTab === 'expired' && (
        expiredReservations.length === 0 ? (
          <div className="card p-16 text-center">
            <CheckCircle size={48} className="text-gray-200 mx-auto mb-4" />
            <p className="text-gray-500 font-medium text-lg">Aucune réservation expirée</p>
            <p className="text-sm text-gray-400 mt-2">Toutes vos réservations sont actives.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {expiredReservations.map(r => {
              const dest = r.voyage?.destination;
              const img = dest?.medias?.[0]?.url || dest?.image_couverture;
              const avail = availability[r.id];
              const isForfait = r.type_verification === 'forfait';
              const isSurMesure = r.type_verification === 'sur_mesure';
              const forfaitId = r.forfait_id || r.voyage?.forfait?.id;

              return (
                <div key={r.id} className="card border-red-100 bg-red-50/20">
                  {/* Header */}
                  <div className="flex items-start gap-4 p-5">
                    {img ? (
                      <img 
                        src={img} 
                        alt={dest?.nom} 
                        className="w-16 h-16 rounded-xl object-cover flex-shrink-0 opacity-70" 
                      />
                    ) : (
                      <div className="w-16 h-16 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        <XCircle size={22} className="text-red-400" />
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <p className="font-semibold text-gray-700">
                          {dest?.nom || `Réservation #${r.id}`}
                        </p>
                        <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-600">
                          Annulée
                        </span>
                        {isSurMesure && (
                          <span className="text-xs text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full">
                            Sur mesure
                          </span>
                        )}
                        {isForfait && (
                          <span className="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                            Forfait
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500">
                        {r.nb_adultes} adulte(s){r.nb_enfants > 0 ? ` + ${r.nb_enfants} enfant(s)` : ''} ·{' '}
                        {formatDate(r.date_reservation)}
                      </p>
                      {r.voyage?.date_depart && (
                        <p className="text-xs text-gray-400 mt-0.5">
                          Voyage prévu : {formatDate(r.voyage.date_depart)} → {formatDate(r.voyage.date_retour)}
                        </p>
                      )}
                      {r.montant_total && (
                        <p className="text-sm font-bold text-gray-500 mt-1">
                          {formatPrice(parseMontant(r.montant_total))}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="border-t border-red-100 px-5 py-4 bg-white/50 rounded-b-2xl">
                    <div className="flex flex-wrap items-center gap-3">
                      {/* Bouton vérifier */}
                      {!avail && (
                        <Button
                          variant="outline"
                          size="sm"
                          loading={checkLoading === r.id}
                          onClick={() => handleVerifier(r)}
                        >
                          <RefreshCw size={13} /> Vérifier disponibilité
                        </Button>
                      )}

                      {/* Résultat vérification forfait */}
                      {avail && isForfait && (
                        <>
                          {avail.peut_reserver !== false && avail.places_restantes > 0 ? (
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-xs text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg flex items-center gap-1">
                                <CheckCircle size={13} /> {avail.places_restantes} place(s) disponible(s)
                              </span>
                              
                              {/* Bouton PROLONGER - Ajoute 1h sans ressaisir les voyageurs */}
                              <Button
                                size="sm"
                                variant="outline"
                                loading={renewLoading === r.id}
                                onClick={() => handleProlonger(r)}
                              >
                                Prolonger d'1h
                              </Button>
                              
                              {/* Bouton RECREER - Avec ressaisie des voyageurs */}
                              <Button
                                size="sm"
                                loading={renewLoading === r.id}
                                onClick={() => handleRefaireForfait(r)}
                              >
                                Réserver à nouveau
                              </Button>
                            </div>
                          ) : (
                            <span className="text-xs text-red-600 bg-red-50 px-3 py-1.5 rounded-lg flex items-center gap-1">
                              <XCircle size={13} /> {avail.message || 'Plus de places disponibles'}
                            </span>
                          )}
                          <button
                            onClick={() => {
                              setAvailability(prev => {
                                const n = { ...prev };
                                delete n[r.id];
                                return n;
                              });
                            }}
                            className="text-xs text-gray-400 hover:text-gray-600 underline"
                          >
                            Masquer
                          </button>
                        </>
                      )}

                      {/* Résultat vérification sur mesure */}
                      {avail && isSurMesure && (
                        <>
                          {avail.peut_refaire_reservation ? (
                            <div className="flex items-center gap-3 flex-wrap">
                              <span className="text-xs text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg flex items-center gap-1">
                                <CheckCircle size={13} /> Transport disponible
                              </span>
                              <Button
                                size="sm"
                                loading={renewLoading === r.id}
                                onClick={() => handleRefaireSurMesure(r)}
                              >
                                Refaire la demande
                              </Button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-3 flex-wrap">
                              <span className="text-xs text-amber-700 bg-amber-50 px-3 py-1.5 rounded-lg flex items-center gap-1">
                                <AlertTriangle size={13} /> {avail.message || 'Transport indisponible — vous pouvez modifier'}
                              </span>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleRefaireSurMesure(r)}
                              >
                                Modifier et refaire
                              </Button>
                            </div>
                          )}
                          <button
                            onClick={() => {
                              setAvailability(prev => {
                                const n = { ...prev };
                                delete n[r.id];
                                return n;
                              });
                            }}
                            className="text-xs text-gray-400 hover:text-gray-600 underline"
                          >
                            Masquer
                          </button>
                        </>
                      )}

                      {/* Lien vers détails */}
                      <Link
                        to={`/client/reservations/${r.id}`}
                        className="text-xs text-gray-400 hover:text-secondary transition-colors ml-auto"
                      >
                        Voir les détails →
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )
      )}
    </div>
  );
}