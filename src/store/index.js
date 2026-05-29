/**
 * store/index.js – Configuration du store Redux.
 * Inclut tous les slices du projet.
 */

import { configureStore } from '@reduxjs/toolkit'
import authReducer         from './slices/authSlice'
import forfaitReducer      from './slices/forfaitSlice'
import reservationReducer  from './slices/reservationSlice'
import notificationReducer from './slices/notificationSlice'
import surMesureReducer    from './slices/surMesureSlice'

export const store = configureStore({
  reducer: {
    auth:          authReducer,
    forfaits:      forfaitReducer,
    reservations:  reservationReducer,
    notifications: notificationReducer,
    surMesure:     surMesureReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      // Désactiver la vérification de sérialisation pour les dates
      serializableCheck: {
        ignoredActions: ['surMesure/submit/fulfilled'],
      },
    }),
})

export default store
