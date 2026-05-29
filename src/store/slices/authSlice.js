/**
 * authSlice.js – Redux slice pour l'authentification.
 * Corrigé :
 *  - Persistance token + user dans localStorage
 *  - Login / register / logout
 *  - Hydratation au démarrage
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../services/api'

// Hydratation depuis localStorage
function loadAuth() {
  try {
    const token = localStorage.getItem('token')
    const user  = JSON.parse(localStorage.getItem('user') || 'null')
    return { token, user }
  } catch {
    return { token: null, user: null }
  }
}

export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const res = await api.post('/login', credentials)
      return res.data
    } catch (e) {
      return rejectWithValue(e.json || { message: e.message, errors: e.errors })
    }
  }
)

export const registerUser = createAsyncThunk(
  'auth/register',
  async (data, { rejectWithValue }) => {
    try {
      const res = await api.post('/register', data)
      return res.data
    } catch (e) {
      return rejectWithValue(e.json || { message: e.message, errors: e.errors })
    }
  }
)

export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await api.post('/logout')
    } catch { /* on logout quand même */ }
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    return true
  }
)

export const fetchCurrentUser = createAsyncThunk(
  'auth/fetchCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get('/user')
      return res.data
    } catch (e) {
      return rejectWithValue(e.message)
    }
  }
)

const { token: initToken, user: initUser } = loadAuth()

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    token:   initToken,
    user:    initUser,
    loading: false,
    error:   null,
  },
  reducers: {
    clearError(state) { state.error = null },
    setUser(state, action) { state.user = action.payload },
  },
  extraReducers: (builder) => {
    const handleAuth = (state, action) => {
      state.loading = false
      state.token   = action.payload.token
      state.user    = action.payload.user
      localStorage.setItem('token', action.payload.token)
      localStorage.setItem('user',  JSON.stringify(action.payload.user))
    }

    builder
      // Login
      .addCase(loginUser.pending,   (state) => { state.loading = true; state.error = null })
      .addCase(loginUser.fulfilled,  handleAuth)
      .addCase(loginUser.rejected,  (state, action) => {
        state.loading = false
        state.error   = action.payload
      })

      // Register
      .addCase(registerUser.pending,   (state) => { state.loading = true; state.error = null })
      .addCase(registerUser.fulfilled,  handleAuth)
      .addCase(registerUser.rejected,  (state, action) => {
        state.loading = false
        state.error   = action.payload
      })

      // Logout
      .addCase(logoutUser.fulfilled, (state) => {
        state.token = null
        state.user  = null
      })

      // fetchCurrentUser
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.user = action.payload
        localStorage.setItem('user', JSON.stringify(action.payload))
      })
      .addCase(fetchCurrentUser.rejected, (state) => {
        // Token invalide → déconnecter
        state.token = null
        state.user  = null
        localStorage.removeItem('token')
        localStorage.removeItem('user')
      })
  },
})

export const { clearError, setUser } = authSlice.actions
export default authSlice.reducer
