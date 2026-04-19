import { Navigate, Route, Routes, Outlet } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { useAuth } from './contexts/useAuth'
import { SocketProvider } from './contexts/SocketContext'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ChatPage from './pages/ChatPage'
import ChatsPage from './pages/ChatsPage'
import DashboardPage from './pages/DashboardPage'
import GroupsPage from './pages/GroupsPage'
import MediaPage from './pages/MediaPage'
import SettingsPage from './pages/SettingsPage'
import LandingPage from './pages/LandingPage'
import { FallingPattern } from './components/ui/falling-pattern'
import ProtectedRoute from './routes/ProtectedRoute'

function App() {
  const { isAuthenticated } = useAuth()

  return (
    <div className="relative min-h-screen">
      <div className="fixed inset-0 -z-50 pointer-events-none overflow-hidden">
        <FallingPattern 
          color="#7f1d1d" 
          duration={200} 
          blurIntensity="0rem"
          density={0.8}
          className="opacity-40 [mask-image:radial-gradient(ellipse_at_center,white,transparent)]"
        />
      </div>
      <Routes>
        {/* Public */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />} />
        <Route path="/register" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <RegisterPage />} />

        {/* Protected — wrapped in a layout route to persist SocketProvider */}
        <Route
          element={
            <ProtectedRoute>
              <SocketProvider>
                <Outlet />
              </SocketProvider>
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/chats" element={<ChatsPage />} />
          <Route path="/groups" element={<GroupsPage />} />
          <Route path="/media" element={<MediaPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>

        {/* Catch-all */}
        <Route path="*" element={<Navigate to={isAuthenticated ? '/dashboard' : '/login'} replace />} />
      </Routes>
      <ToastContainer position="top-right" autoClose={2500} theme="dark" />
    </div>
  )
}

export default App