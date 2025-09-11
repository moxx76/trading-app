import { useAuth } from '../../contexts/AuthContext'
import { AuthPage } from './AuthPage'
import { Loader2 } from 'lucide-react'

export const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, loading, isAdmin } = useAuth()

  // Mostra loading durante il caricamento
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Caricamento...</p>
        </div>
      </div>
    )
  }

  // Se l'utente non è autenticato, mostra la pagina di login
  if (!user) {
    return <AuthPage />
  }

  // Se la route richiede privilegi admin e l'utente non è admin
  if (adminOnly && !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Accesso Negato
          </h1>
          <p className="text-gray-600">
            Non hai i permessi necessari per accedere a questa pagina.
          </p>
        </div>
      </div>
    )
  }

  // Se tutto è ok, mostra il contenuto protetto
  return children
}

