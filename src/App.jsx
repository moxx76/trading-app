import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { AuthPage } from './components/auth/AuthPage'
import { Dashboard } from './components/Dashboard'
import { AdminPanel } from './components/admin/AdminPanel'
import { UserProfile } from './components/UserProfile'
import { ProtectedRoute } from './components/auth/ProtectedRoute'

function AppContent() {
  const { user, loading } = useAuth()

  // Timeout per evitare loading infinito
  const [forceReady, setForceReady] = useState(false)
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setForceReady(true)
    }, 3000) // Dopo 3 secondi forza il render
    
    return () => clearTimeout(timer)
  }, [])

  // Mostra loading solo per i primi 3 secondi
  if (loading && !forceReady) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Caricamento OOPS Tech...</p>
          <p className="text-xs text-gray-400 mt-2">Se il caricamento persiste, ricarica la pagina</p>
        </div>
      </div>
    )
  }

  return (
    <Router>
      <Routes>
        <Route 
          path="/" 
          element={user ? <Navigate to="/dashboard" replace /> : <AuthPage />} 
        />
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute adminOnly>
              <AdminPanel />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/profile" 
          element={
            <ProtectedRoute>
              <UserProfile />
            </ProtectedRoute>
          } 
        />
        {/* Redirect per route non trovate */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  )
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App

