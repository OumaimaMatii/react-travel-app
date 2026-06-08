import React, { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { fetchCurrentUser } from './store/slices/authSlice'

/* Pages publiques */
import HomePage          from './pages/public/HomePage'
import ForfaitsPage      from './pages/public/ForfaitsPage'
import ForfaitDetailPage from './pages/public/ForfaitDetailPage'
import LoginPage         from './pages/public/LoginPage'
import RegisterPage      from './pages/public/RegisterPage'

/* Layouts */
import ClientLayout from './components/layout/ClientLayout'
import AgentLayout  from './components/layout/AgentLayout'
import AdminLayout  from './components/layout/AdminLayout'

/* Pages client */
import ClientDashboard   from './pages/client/ClientDashboard'
import MesReservations   from './pages/client/MesReservations'
import ReservationDetail from './pages/client/ReservationDetail'
import MesNotifications  from './pages/client/MesNotifications'
import SurMesureWizard   from './pages/client/SurMesureWizard'

/* Pages agent */
import AgentDashboard         from './pages/agent/AgentDashboard'
import MesForfaits            from './pages/agent/MesForfaits'
import ForfaitDetailAgent     from './pages/agent/ForfaitDetailAgent'
import ForfaitReservations    from './pages/agent/ForfaitReservations'
import ReservationDetailAgent from './pages/agent/ReservationDetailAgent'
import SurMesureAgent         from './pages/agent/SurMesureAgent'
import SurMesureDetailAgent   from './pages/agent/SurMesureDetailAgent'
import AgentNotifications     from './pages/agent/AgentNotifications'

/* Pages admin */
import AdminDashboard    from './pages/admin/AdminDashboard'
import AdminSurMesure    from './pages/admin/AdminSurMesure'
import AdminDestinations from './pages/admin/AdminDestinations'
import AdminHotels       from './pages/admin/AdminHotels'
import AdminActivites    from './pages/admin/AdminActivites'
import AdminUtilisateurs from './pages/admin/AdminUtilisateurs'

/* ---------------------------------------------------------------- */
/* Guards                                                           */
/* ---------------------------------------------------------------- */

function RequireAuth({ children }) {
  const { token } = useSelector(s => s.auth)
  if (!token) return <Navigate to="/login" replace />
  return children
}

function RequireRole({ role, children }) {
  const { user } = useSelector(s => s.auth)
  if (!user) return <Navigate to="/login" replace />
  const roles = Array.isArray(role) ? role : [role]
  if (!roles.includes(user.role)) {
    if (user.role === 'admin')  return <Navigate to="/admin"  replace />
    if (user.role === 'agent')  return <Navigate to="/agent"  replace />
    return <Navigate to="/client" replace />
  }
  return children
}

function PublicOnlyForClient({ children }) {
  const { user, token } = useSelector(s => s.auth)
  if (token && user) {
    if (user.role === 'admin')  return <Navigate to="/admin"  replace />
    if (user.role === 'agent')  return <Navigate to="/agent"  replace />
  }
  return children
}

/* ---------------------------------------------------------------- */

export default function App() {
  const dispatch   = useDispatch()
  const { token }  = useSelector(s => s.auth)

  useEffect(() => {
    if (token) dispatch(fetchCurrentUser())
  }, [dispatch, token])

  return (
    <BrowserRouter>
      <Routes>

        {/* Pages publiques */}
        <Route path="/" element={
          <PublicOnlyForClient><HomePage /></PublicOnlyForClient>
        } />
        <Route path="/forfaits" element={
          <PublicOnlyForClient><ForfaitsPage /></PublicOnlyForClient>
        } />
        <Route path="/forfaits/:id" element={
          <PublicOnlyForClient><ForfaitDetailPage /></PublicOnlyForClient>
        } />
        <Route path="/login" element={
          <PublicOnlyForClient><LoginPage /></PublicOnlyForClient>
        } />
        <Route path="/register" element={
          <PublicOnlyForClient><RegisterPage /></PublicOnlyForClient>
        } />

        {/* Espace client */}
        <Route path="/client" element={
          <RequireAuth>
            <RequireRole role="client">
              <ClientLayout />
            </RequireRole>
          </RequireAuth>
        }>
          <Route index                         element={<ClientDashboard />} />
          <Route path="reservations"           element={<MesReservations />} />
          <Route path="reservations/:id"       element={<ReservationDetail />} />
          <Route path="notifications"          element={<MesNotifications />} />
          <Route path="sur-mesure"             element={<SurMesureWizard />} />
        </Route>

        {/* Espace agent */}
        <Route path="/agent" element={
          <RequireAuth>
            <RequireRole role="agent">
              <AgentLayout />
            </RequireRole>
          </RequireAuth>
        }>
          <Route index                                         element={<AgentDashboard />} />
          <Route path="forfaits"                               element={<MesForfaits />} />
          <Route path="forfaits/:id"                           element={<ForfaitDetailAgent />} />
          <Route path="forfaits/:forfaitId/reservations"       element={<ForfaitReservations />} />
          <Route path="reservations/:id"                       element={<ReservationDetailAgent />} />
          <Route path="sur-mesure"                             element={<SurMesureAgent />} />
          <Route path="sur-mesure/:id"                         element={<SurMesureDetailAgent />} />
          <Route path="notifications"                          element={<AgentNotifications />} />
          
          {/* Route pour confirmer l'annulation du transport (agent) */}
          <Route path="reservations/:id/confirmer-annulation-transport" element={<ReservationDetailAgent />} />
        </Route>

        {/* Espace admin */}
        <Route path="/admin" element={
          <RequireAuth>
            <RequireRole role="admin">
              <AdminLayout />
            </RequireRole>
          </RequireAuth>
        }>
          <Route index                   element={<AdminDashboard />} />
          <Route path="sur-mesure"       element={<AdminSurMesure />} />
          <Route path="destinations"     element={<AdminDestinations />} />
          <Route path="hotels"           element={<AdminHotels />} />
          <Route path="activites"        element={<AdminActivites />} />
          <Route path="utilisateurs"     element={<AdminUtilisateurs />} />
          
          {/* Route pour confirmer l'annulation du transport (admin) */}
          <Route path="reservations/:id/confirmer-annulation-transport" element={<ReservationDetailAgent />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </BrowserRouter>
  )
}