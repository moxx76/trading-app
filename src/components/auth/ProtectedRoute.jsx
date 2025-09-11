import { useAuth } from '../../contexts/AuthContext'
import { Navigate } from 'react-router-dom'

export const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, profile, loading, isAdmin } = useAuth()

  // Mostra loading durante la verifica
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verifica autenticazione...</p>
        </div>
      </div>
    )
  }

  // Se non autenticato, redirect al login
  if (!user) {
    return <Navigate to="/" replace />
  }

  // Se richiede admin ma non è admin
  if (adminOnly && !isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-lg">
            <h2 className="text-lg font-semibold mb-2">Accesso Negato</h2>
            <p className="mb-4">Non hai i permessi per accedere a questa sezione.</p>
            <p className="text-sm">
              User: {user?.email}<br/>
              IsAdmin: {isAdmin ? 'YES' : 'NO'}<br/>
              Required: Admin access
            </p>
            <button 
              onClick={() => window.location.href = '/dashboard'}
              className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Torna al Dashboard
            </button>
          </div>
        </div>
      </div>
    )
  }

  return children
}

