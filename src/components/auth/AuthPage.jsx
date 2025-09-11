import { LoginForm } from './LoginForm'
import { RegisterForm } from './RegisterForm'
import { TrendingUp } from 'lucide-react'
import { useState, useEffect } from 'react'


export const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true)

  // AGGIUNGI QUESTO USEEFFECT
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    if (urlParams.get('logout') === 'true') {
      // Pulizia completa dopo logout
      localStorage.clear()
      sessionStorage.clear()
      // Pulisci URL per rimuovere ?logout=true
      window.history.replaceState({}, document.title, '/')
      console.log('Logout completato - storage pulito')
    }
  }, [])


  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo e titolo */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-primary rounded-full p-3">
              <TrendingUp className="h-8 w-8 text-primary-foreground" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Trading WebApp
          </h1>
          <p className="text-gray-600">
            La piattaforma per le tue decisioni di trading
          </p>
        </div>

        {/* Form di autenticazione */}
        {isLogin ? (
          <LoginForm onSwitchToRegister={() => setIsLogin(false)} />
        ) : (
          <RegisterForm onSwitchToLogin={() => setIsLogin(true)} />
        )}
      </div>
    </div>
  )
}

