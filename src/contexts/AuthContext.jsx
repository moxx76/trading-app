import React, { createContext, useContext, useEffect, useState } from 'react'
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

  // Determina se l'utente è admin basandosi sull'email
  const isAdmin = user?.email === 'davide@oops.technology'

  useEffect(() => {
    // Ottieni la sessione corrente
    const getSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('❌ Errore sessione:', error)
        } else if (session?.user) {
          console.log('✅ Sessione trovata:', session.user.email)
          setUser(session.user)
          
          // Crea profilo locale senza database
          const localProfile = {
            id: session.user.id,
            email: session.user.email,
            full_name: session.user.user_metadata?.full_name || session.user.email.split('@')[0],
            role: session.user.email === 'davide@oops.technology' ? 'admin' : 'user',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
          
          setProfile(localProfile)
          console.log('✅ Profilo locale creato:', localProfile)
        } else {
          console.log('ℹ️ Nessuna sessione attiva')
        }
      } catch (error) {
        console.error('❌ Errore generale sessione:', error)
      } finally {
        setLoading(false)
      }
    }

    getSession()

    // Ascolta i cambiamenti di autenticazione
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔄 Auth state change:', event, session?.user?.email)
        
        if (session?.user) {
          setUser(session.user)
          
          // Crea profilo locale
          const localProfile = {
            id: session.user.id,
            email: session.user.email,
            full_name: session.user.user_metadata?.full_name || session.user.email.split('@')[0],
            role: session.user.email === 'davide@oops.technology' ? 'admin' : 'user',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
          
          setProfile(localProfile)
        } else {
          setUser(null)
          setProfile(null)
        }
        
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const signUp = async (email, password, userData = {}) => {
    try {
      setLoading(true)
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: userData.full_name || email.split('@')[0],
            ...userData
          }
        }
      })

      if (error) {
        console.error('❌ Errore registrazione:', error)
        throw error
      }

      console.log('✅ Registrazione completata:', data.user?.email)
      return { data, error: null }
      
    } catch (error) {
      console.error('❌ Errore registrazione:', error)
      return { data: null, error }
    } finally {
      setLoading(false)
    }
  }

  const signIn = async (email, password) => {
    try {
      setLoading(true)
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) {
        console.error('❌ Errore login:', error)
        throw error
      }

      console.log('✅ Login completato:', data.user?.email)
      return { data, error: null }
      
    } catch (error) {
      console.error('❌ Errore login:', error)
      return { data: null, error }
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    try {
      console.log('🔄 Inizio logout...')
      
      // Pulisci stato locale PRIMA del logout
      setUser(null)
      setProfile(null)
      setLoading(false)
      
      // Pulisci storage del browser
      localStorage.clear()
      sessionStorage.clear()
      
      // Logout da Supabase (in background)
      supabase.auth.signOut().catch(err => {
        console.log('⚠️ Errore logout Supabase (ignorato):', err)
      })
      
      // Forza il redirect immediato
      setTimeout(() => {
        window.location.href = '/'
      }, 100)
      
    } catch (error) {
      console.error('❌ Errore logout:', error)
      
      // Anche in caso di errore, forza la pulizia
      setUser(null)
      setProfile(null)
      setLoading(false)
      localStorage.clear()
      sessionStorage.clear()
      window.location.href = '/'
    }
  }

  const value = {
    user,
    profile,
    loading,
    isAdmin,
    signUp,
    signIn,
    signOut
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

