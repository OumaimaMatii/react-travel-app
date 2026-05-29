/**
 * notificationSlice.js – Redux slice pour les notifications.
 * Compatible avec les routes /client/notifications et /agent/notifications.
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../services/api'

// Détermine le préfixe selon le rôle stocké
function getPrefix() {
  try {
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    if (user.role === 'agent' || user.role === 'admin') return '/agent'
    return '/client'
  } catch {
    return '/client'
  }
}

export const fetchNotifications = createAsyncThunk(
  'notifications/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const prefix = getPrefix()
      const res = await api.get(`${prefix}/notifications`)
      return {
        items:       res.data?.data?.data || res.data?.data || [],
        unreadCount: res.data?.unread_count ?? 0,
      }
    } catch (e) {
      return rejectWithValue(e.message)
    }
  }
)

export const fetchUnreadCount = createAsyncThunk(
  'notifications/fetchUnreadCount',
  async (_, { rejectWithValue }) => {
    try {
      const prefix = getPrefix()
      const res = await api.get(`${prefix}/notifications/unread-count`)
      return res.data?.count ?? 0
    } catch (e) {
      return rejectWithValue(e.message)
    }
  }
)

export const markAsRead = createAsyncThunk(
  'notifications/markAsRead',
  async (id, { rejectWithValue }) => {
    try {
      const prefix = getPrefix()
      await api.patch(`${prefix}/notifications/${id}/read`)
      return id
    } catch (e) {
      return rejectWithValue(e.message)
    }
  }
)

export const markAllAsRead = createAsyncThunk(
  'notifications/markAllAsRead',
  async (_, { rejectWithValue }) => {
    try {
      const prefix = getPrefix()
      await api.post(`${prefix}/notifications/read-all`)
      return true
    } catch (e) {
      return rejectWithValue(e.message)
    }
  }
)

export const deleteNotification = createAsyncThunk(
  'notifications/delete',
  async (id, { rejectWithValue }) => {
    try {
      const prefix = getPrefix()
      await api.delete(`${prefix}/notifications/${id}`)
      return id
    } catch (e) {
      return rejectWithValue(e.message)
    }
  }
)

const notificationSlice = createSlice({
  name: 'notifications',
  initialState: {
    items:       [],
    unreadCount: 0,
    loading:     false,
    error:       null,
  },
  reducers: {
    clearError(state) { state.error = null },
  },
  extraReducers: (builder) => {
    builder
      // fetchNotifications
      .addCase(fetchNotifications.pending, (state) => { state.loading = true })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading     = false
        state.items       = action.payload.items
        state.unreadCount = action.payload.unreadCount
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading = false
        state.error   = action.payload
      })

      // fetchUnreadCount
      .addCase(fetchUnreadCount.fulfilled, (state, action) => {
        state.unreadCount = action.payload
      })

      // markAsRead
      .addCase(markAsRead.fulfilled, (state, action) => {
        const n = state.items.find(n => n.id === action.payload)
        if (n && !n.lue) {
          n.lue = true
          state.unreadCount = Math.max(0, state.unreadCount - 1)
        }
      })

      // markAllAsRead
      .addCase(markAllAsRead.fulfilled, (state) => {
        state.items.forEach(n => { n.lue = true })
        state.unreadCount = 0
      })

      // deleteNotification
      .addCase(deleteNotification.fulfilled, (state, action) => {
        const n = state.items.find(n => n.id === action.payload)
        if (n && !n.lue) state.unreadCount = Math.max(0, state.unreadCount - 1)
        state.items = state.items.filter(n => n.id !== action.payload)
      })
  },
})

export const { clearError } = notificationSlice.actions
export default notificationSlice.reducer
