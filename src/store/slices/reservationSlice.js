/**
 * Redux slice pour les réservations.
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const fetchMesReservations = createAsyncThunk(
  'reservations/fetchMes',
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get('/client/reservations');
      return res.data?.data || res.data || [];
    } catch (e) {
      return rejectWithValue(e.message);
    }
  }
);

export const fetchReservation = createAsyncThunk(
  'reservations/fetchOne',
  async (id, { rejectWithValue }) => {
    try {
      const res = await api.get(`/client/reservations/${id}`);
      return res.data?.data || res.data;
    } catch (e) {
      return rejectWithValue(e.message);
    }
  }
);

export const fetchReservationDetails = createAsyncThunk(
  'reservations/fetchDetails',
  async (id, { rejectWithValue }) => {
    try {
      const res = await api.get(`/client/reservations/${id}/details-chambres`);
      return res.data?.data || res.data || [];
    } catch (e) {
      return rejectWithValue(e.message);
    }
  }
);

export const createReservationForfait = createAsyncThunk(
  'reservations/createForfait',
  async (data, { rejectWithValue }) => {
    try {
      const res = await api.post('/client/reservations/forfait', data);
      return res.data?.data || res.data;
    } catch (e) {
      return rejectWithValue(e.json || { message: e.message, errors: e.errors });
    }
  }
);

export const annulerReservation = createAsyncThunk(
  'reservations/annuler',
  async (id, { rejectWithValue }) => {
    try {
      const res = await api.post(`/client/reservations/${id}/annuler`);
      return { id, ...res.data };
    } catch (e) {
      return rejectWithValue(e.message);
    }
  }
);

export const confirmerReservation = createAsyncThunk(
  'reservations/confirmer',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const res = await api.post(`/client/reservations/${id}/confirmer`, data);
      return { id, ...res.data };
    } catch (e) {
      return rejectWithValue(e.json || { message: e.message });
    }
  }
);

// Pour l'agent
export const fetchReservationsByForfait = createAsyncThunk(
  'reservations/byForfait',
  async (forfaitId, { rejectWithValue }) => {
    try {
      const res = await api.get(`/agent/forfaits/${forfaitId}/reservations`);
      return {
        data:    res.data?.data || [],
        stats:   res.data?.stats || {},
        forfait: res.data?.forfait || null,
      };
    } catch (e) {
      return rejectWithValue(e.message);
    }
  }
);

export const fetchReservationAgent = createAsyncThunk(
  'reservations/fetchOneAgent',
  async (id, { rejectWithValue }) => {
    try {
      const res = await api.get(`/agent/reservations/${id}`);
      return res.data?.data || res.data;
    } catch (e) {
      return rejectWithValue(e.message);
    }
  }
);

const reservationSlice = createSlice({
  name: 'reservations',
  initialState: {
    items:        [],
    current:      null,
    details:      [],
    forfaitData:  { data: [], stats: {}, forfait: null },
    loading:      false,
    error:        null,
  },
  reducers: {
    clearCurrent(state) { state.current = null; },
    clearError(state)   { state.error   = null; },
  },
  extraReducers: (builder) => {
    const pending  = (state) => { state.loading = true; state.error = null; };
    const rejected = (state, action) => { state.loading = false; state.error = action.payload; };

    builder
      .addCase(fetchMesReservations.pending,  pending)
      .addCase(fetchMesReservations.fulfilled, (state, action) => {
        state.loading = false;
        state.items   = action.payload;
      })
      .addCase(fetchMesReservations.rejected, rejected)

      .addCase(fetchReservation.pending,  pending)
      .addCase(fetchReservation.fulfilled, (state, action) => {
        state.loading = false;
        state.current = action.payload;
      })
      .addCase(fetchReservation.rejected, rejected)

      .addCase(fetchReservationDetails.fulfilled, (state, action) => {
        state.details = action.payload;
      })

      .addCase(createReservationForfait.pending, pending)
      .addCase(createReservationForfait.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload) state.items.unshift(action.payload);
      })
      .addCase(createReservationForfait.rejected, rejected)

      .addCase(annulerReservation.pending, pending)
      .addCase(annulerReservation.fulfilled, (state, action) => {
        state.loading = false;
        const idx = state.items.findIndex(r => r.id === action.payload.id);
        if (idx !== -1) state.items[idx].statut = 'annulee';
        if (state.current?.id === action.payload.id) state.current.statut = 'annulee';
      })
      .addCase(annulerReservation.rejected, rejected)

      .addCase(confirmerReservation.pending, pending)
      .addCase(confirmerReservation.fulfilled, (state, action) => {
        state.loading = false;
        if (state.current?.id === action.payload.id) state.current.statut = 'confirmee';
      })
      .addCase(confirmerReservation.rejected, rejected)

      .addCase(fetchReservationsByForfait.pending, pending)
      .addCase(fetchReservationsByForfait.fulfilled, (state, action) => {
        state.loading    = false;
        state.forfaitData = action.payload;
      })
      .addCase(fetchReservationsByForfait.rejected, rejected)

      .addCase(fetchReservationAgent.pending, pending)
      .addCase(fetchReservationAgent.fulfilled, (state, action) => {
        state.loading = false;
        state.current = action.payload;
      })
      .addCase(fetchReservationAgent.rejected, rejected);
  },
});

export const { clearCurrent, clearError } = reservationSlice.actions;
export default reservationSlice.reducer;
