/**
 * Redux slice pour les forfaits.
 * Corrigé : fetchMesForfaits utilise /agent/forfaits.
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const fetchForfaits = createAsyncThunk(
  'forfaits/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get('/forfaits');
      return res.data?.data || res.data || [];
    } catch (e) {
      return rejectWithValue(e.message);
    }
  }
);

export const fetchForfait = createAsyncThunk(
  'forfaits/fetchOne',
  async (id, { rejectWithValue }) => {
    try {
      const res = await api.get(`/forfaits/${id}`);
      return res.data?.data || res.data;
    } catch (e) {
      return rejectWithValue(e.message);
    }
  }
);

// ← NOUVEAU : route agent dédiée
export const fetchMesForfaits = createAsyncThunk(
  'forfaits/fetchMes',
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get('/agent/forfaits');
      return res.data?.data || res.data || [];
    } catch (e) {
      return rejectWithValue(e.message);
    }
  }
);

export const createForfait = createAsyncThunk(
  'forfaits/create',
  async (data, { rejectWithValue }) => {
    try {
      const res = await api.post('/agent/forfaits', data);
      return res.data?.data || res.data;
    } catch (e) {
      return rejectWithValue(e.json || { message: e.message, errors: e.errors });
    }
  }
);

export const updateForfait = createAsyncThunk(
  'forfaits/update',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const res = await api.put(`/agent/forfaits/${id}`, data);
      return res.data?.data || res.data;
    } catch (e) {
      return rejectWithValue(e.json || { message: e.message, errors: e.errors });
    }
  }
);

export const deleteForfait = createAsyncThunk(
  'forfaits/delete',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/agent/forfaits/${id}`);
      return id;
    } catch (e) {
      return rejectWithValue(e.message);
    }
  }
);

const forfaitSlice = createSlice({
  name: 'forfaits',
  initialState: {
    items:   [],
    mesForfaits: [],
    current: null,
    loading: false,
    error:   null,
  },
  reducers: {
    clearError(state) { state.error = null; },
    clearCurrent(state) { state.current = null; },
  },
  extraReducers: (builder) => {
    const pending   = (state) => { state.loading = true; state.error = null; };
    const rejected  = (state, action) => { state.loading = false; state.error = action.payload; };

    builder
      .addCase(fetchForfaits.pending,  pending)
      .addCase(fetchForfaits.fulfilled, (state, action) => {
        state.loading = false;
        state.items   = action.payload;
      })
      .addCase(fetchForfaits.rejected, rejected)

      .addCase(fetchForfait.pending,  pending)
      .addCase(fetchForfait.fulfilled, (state, action) => {
        state.loading = false;
        state.current = action.payload;
      })
      .addCase(fetchForfait.rejected, rejected)

      .addCase(fetchMesForfaits.pending, pending)
      .addCase(fetchMesForfaits.fulfilled, (state, action) => {
        state.loading     = false;
        state.mesForfaits = action.payload;
      })
      .addCase(fetchMesForfaits.rejected, rejected)

      .addCase(createForfait.pending, pending)
      .addCase(createForfait.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload) {
          state.mesForfaits.unshift(action.payload);
        }
      })
      .addCase(createForfait.rejected, rejected)

      .addCase(updateForfait.pending, pending)
      .addCase(updateForfait.fulfilled, (state, action) => {
        state.loading = false;
        const updated = action.payload;
        if (updated) {
          const idx = state.mesForfaits.findIndex(f => f.id === updated.id);
          if (idx !== -1) state.mesForfaits[idx] = updated;
          if (state.current?.id === updated.id) state.current = updated;
        }
      })
      .addCase(updateForfait.rejected, rejected)

      .addCase(deleteForfait.pending, pending)
      .addCase(deleteForfait.fulfilled, (state, action) => {
        state.loading     = false;
        state.mesForfaits = state.mesForfaits.filter(f => f.id !== action.payload);
      })
      .addCase(deleteForfait.rejected, rejected);
  },
});

export const { clearError, clearCurrent } = forfaitSlice.actions;
export default forfaitSlice.reducer;
