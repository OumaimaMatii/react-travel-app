/**
 * Redux slice pour le wizard "Voyage Sur Mesure".
 * Gère :
 *   - l'état du wizard (étapes 1-6)
 *   - les données sélectionnées par le client
 *   - le calcul de prix
 *   - la soumission finale
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import surMesureService from '../../services/surMesureService';

// ─── Thunks ────────────────────────────────────────────────────────────────

export const fetchTransports = createAsyncThunk(
  'surMesure/fetchTransports',
  async (villeDepart, { rejectWithValue }) => {
    try {
      const res = await surMesureService.getTransports(villeDepart);
      return res.data?.data || [];
    } catch (e) {
      return rejectWithValue(e.message);
    }
  }
);

export const fetchCommission = createAsyncThunk(
  'surMesure/fetchCommission',
  async (_, { rejectWithValue }) => {
    try {
      const res = await surMesureService.getCommission();
      return res.data?.pourcentage ?? 15;
    } catch (e) {
      return rejectWithValue(e.message);
    }
  }
);

export const calculerPrix = createAsyncThunk(
  'surMesure/calculerPrix',
  async (payload, { rejectWithValue }) => {
    try {
      const res = await surMesureService.calculerPrix(payload);
      return res.data?.data || {};
    } catch (e) {
      return rejectWithValue(e.message);
    }
  }
);

export const submitSurMesure = createAsyncThunk(
  'surMesure/submit',
  async (payload, { rejectWithValue }) => {
    try {
      const res = await surMesureService.creer(payload);
      return res.data;
    } catch (e) {
      return rejectWithValue(e.json || { message: e.message });
    }
  }
);

// ─── État initial ───────────────────────────────────────────────────────────

const initialWizard = {
  currentStep: 1,
  // Étape 1
  destination: null,
  villeDepart: null,
  dateDepart: '',
  dateRetour: '',
  nbAdultes: 1,
  nbEnfants: 0,
  // Étape 2 – Hôtel
  hotel: null,
  chambres: [],       // [{ type_chambre_id, nom, quantite, prix_par_nuit }]
  // Étape 3 – Activités
  activites: [],      // [{ activite_id, nom, prix, nb_adultes, nb_enfants }]
  // Étape 4 – Transport aller
  transportAller: null,
  // Étape 5 – Transport retour
  transportRetour: null,
};

const initialState = {
  wizard:      initialWizard,
  transports:  [],
  commission:  15,
  calcul:      null,  // résultat de calculerPrix
  loading:     false,
  calcLoading: false,
  error:       null,
  submitted:   false,
  result:      null,  // réponse API après soumission
};

// ─── Slice ──────────────────────────────────────────────────────────────────

const surMesureSlice = createSlice({
  name: 'surMesure',
  initialState,
  reducers: {
    // Navigation wizard
    nextStep(state) {
      if (state.wizard.currentStep < 6) state.wizard.currentStep += 1;
    },
    prevStep(state) {
      if (state.wizard.currentStep > 1) state.wizard.currentStep -= 1;
    },
    goToStep(state, action) {
      state.wizard.currentStep = action.payload;
    },

    // Étape 1 – Infos de base
    setDestination(state, action) {
      state.wizard.destination = action.payload;
    },
    setVilleDepart(state, action) {
      state.wizard.villeDepart = action.payload;
      // Réinitialiser les transports quand la ville change
      state.wizard.transportAller  = null;
      state.wizard.transportRetour = null;
      state.transports = [];
    },
    setDates(state, action) {
      state.wizard.dateDepart = action.payload.dateDepart;
      state.wizard.dateRetour = action.payload.dateRetour;
    },
    setVoyageurs(state, action) {
      state.wizard.nbAdultes = action.payload.nbAdultes;
      state.wizard.nbEnfants = action.payload.nbEnfants ?? 0;
    },

    // Étape 2 – Hôtel
    setHotel(state, action) {
      state.wizard.hotel   = action.payload;
      state.wizard.chambres = [];
    },
    updateChambre(state, action) {
      // action.payload: { type_chambre_id, nom, quantite, prix_par_nuit }
      const { type_chambre_id } = action.payload;
      const idx = state.wizard.chambres.findIndex(c => c.type_chambre_id === type_chambre_id);

      if (action.payload.quantite <= 0) {
        // Retirer la chambre si quantité = 0
        if (idx !== -1) state.wizard.chambres.splice(idx, 1);
      } else if (idx !== -1) {
        state.wizard.chambres[idx] = action.payload;
      } else {
        state.wizard.chambres.push(action.payload);
      }
    },

    // Étape 3 – Activités
    toggleActivite(state, action) {
      // action.payload: { activite_id, nom, prix, adapte_enfants }
      const { activite_id } = action.payload;
      const idx = state.wizard.activites.findIndex(a => a.activite_id === activite_id);

      if (idx !== -1) {
        state.wizard.activites.splice(idx, 1);
      } else {
        state.wizard.activites.push({
          ...action.payload,
          nb_adultes: state.wizard.nbAdultes,
          nb_enfants: 0,
        });
      }
    },
    updateActiviteVoyageurs(state, action) {
      // action.payload: { activite_id, nb_adultes, nb_enfants }
      const idx = state.wizard.activites.findIndex(a => a.activite_id === action.payload.activite_id);
      if (idx !== -1) {
        state.wizard.activites[idx].nb_adultes = action.payload.nb_adultes;
        state.wizard.activites[idx].nb_enfants = action.payload.nb_enfants ?? 0;
      }
    },

    // Étapes 4 & 5 – Transports
    setTransportAller(state, action) {
      state.wizard.transportAller = action.payload;
    },
    setTransportRetour(state, action) {
      state.wizard.transportRetour = action.payload;
    },

    // Reset
    resetWizard(state) {
      state.wizard    = initialWizard;
      state.calcul    = null;
      state.error     = null;
      state.submitted = false;
      state.result    = null;
    },
    clearError(state) {
      state.error = null;
    },
  },

  extraReducers: (builder) => {
    // fetchTransports
    builder
      .addCase(fetchTransports.pending, (state) => { state.loading = true; })
      .addCase(fetchTransports.fulfilled, (state, action) => {
        state.loading    = false;
        state.transports = action.payload;
      })
      .addCase(fetchTransports.rejected, (state, action) => {
        state.loading = false;
        state.error   = action.payload;
      });

    // fetchCommission
    builder
      .addCase(fetchCommission.fulfilled, (state, action) => {
        state.commission = action.payload;
      });

    // calculerPrix
    builder
      .addCase(calculerPrix.pending, (state) => { state.calcLoading = true; })
      .addCase(calculerPrix.fulfilled, (state, action) => {
        state.calcLoading = false;
        state.calcul      = action.payload;
      })
      .addCase(calculerPrix.rejected, (state, action) => {
        state.calcLoading = false;
        state.error       = action.payload;
      });

    // submitSurMesure
    builder
      .addCase(submitSurMesure.pending, (state) => {
        state.loading = true;
        state.error   = null;
      })
      .addCase(submitSurMesure.fulfilled, (state, action) => {
        state.loading   = false;
        state.submitted = true;
        state.result    = action.payload;
      })
      .addCase(submitSurMesure.rejected, (state, action) => {
        state.loading = false;
        state.error   = action.payload;
      });
  },
});

export const {
  nextStep, prevStep, goToStep,
  setDestination, setVilleDepart, setDates, setVoyageurs,
  setHotel, updateChambre,
  toggleActivite, updateActiviteVoyageurs,
  setTransportAller, setTransportRetour,
  resetWizard, clearError,
} = surMesureSlice.actions;

export default surMesureSlice.reducer;
