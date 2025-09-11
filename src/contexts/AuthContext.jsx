import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext({})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Ottieni sessione corrente
    const getSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Errore sessione:', error)
          setUser(null)
          setProfile(null)
        } else if (session?.user) {
          console.log('✅ Sessione trovata:', session.user.email)
          setUser(session.user)
          
          // Crea profilo semplificato senza query al database
          const simpleProfile = {
            id: session.user.id,
            email: session.user.email,
            full_name: session.user.user_metadata?.full_name || session.user.email.split('@')[0],
            role: session.user.email === 'davide@oops.technology' ? 'admin' : 'user'
          }
          setProfile(simpleProfile)
          console.log('✅ Profilo creato:', simpleProfile)
        } else {
          console.log('❌ Nessuna sessione attiva')
          setUser(null)
          setProfile(null)
        }
      } catch (error) {
        console.error('Errore generale sessione:', error)
        setUser(null)
        setProfile(null)
      } finally {
        setLoading(false)
      }
    }

    getSession()

    // Listener per cambiamenti auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔄 Auth state change:', event)
        
        if (session?.user) {
          setUser(session.user)
          
          // Crea profilo semplificato
          const simpleProfile = {
            id: session.user.id,
            email: session.user.email,
            full_name: session.user.user_metadata?.full_name || session.user.email.split('@')[0],
            role: session.user.email === 'davide@oops.technology' ? 'admin' : 'user'
          }
          setProfile(simpleProfile)
          console.log('✅ Profilo aggiornato:', simpleProfile)
        } else {
          setUser(null)
          setProfile(null)
        }
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email, password) => {
    try {
      setLoading(true)
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) throw error
      
      console.log('✅ Login riuscito:', data.user.email)
      return { data, error: null }
    } catch (error) {
      console.error('❌ Errore login:', error)
      return { data: null, error }
    } finally {
      setLoading(false)
    }
  }

  const signUp = async (email, password, fullName) => {
    try {
      setLoading(true)
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName
          }
        }
      })

      if (error) throw error
      
      console.log('✅ Registrazione riuscita:', data.user?.email)
      return { data, error: null }
    } catch (error) {
      console.error('❌ Errore registrazione:', error)
      return { data: null, error }
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    try {
      console.log('🔄 Logout in corso...')
      
      // Pulisci stato locale IMMEDIATAMENTE
      setUser(null)
      setProfile(null)
      setLoading(false)
      
      // Logout da Supabase in background
      supabase.auth.signOut().catch(err => {
        console.log('Errore logout Supabase (ignorato):', err)
      })
      
      console.log('✅ Logout completato')
    } catch (error) {
      console.error('❌ Errore logout:', error)
      // Anche in caso di errore, pulisci lo stato
      setUser(null)
      setProfile(null)
      setLoading(false)
    }
  }

  // Determina se è admin basandosi solo sull'email
  const isAdmin = profile?.email === 'davide@oops.technology' || user?.email === 'davide@oops.technology'

  const value = {
    user,
    profile,
    loading,
    isAdmin,
    signIn,
    signUp,
    signOut
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

