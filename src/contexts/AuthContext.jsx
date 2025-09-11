import { createContext, useContext, useEffect, useState } from 'react'
import { supabase, auth, users } from '../lib/supabase'

const AuthContext = createContext({})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth deve essere utilizzato all\'interno di AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    // Ottieni la sessione corrente
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        setUser(session.user)
        await loadUserProfile(session.user.id)
      }
      setLoading(false)
    }

    getSession()

    // Ascolta i cambiamenti di autenticazione
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setUser(session.user)
          await loadUserProfile(session.user.id)
        } else {
          setUser(null)
          setProfile(null)
          setIsAdmin(false)
        }
        setLoading(false)
      }
    )

    return () => subscription?.unsubscribe()
  }, [])

  const loadUserProfile = async (userId) => {
    try {
      const { data: profileData, error } = await users.getProfile(userId)
      if (error) {
        console.error('Errore nel caricamento del profilo:', error)
        return
      }
      
      setProfile(profileData)
      setIsAdmin(profileData?.role === 'admin')
    } catch (error) {
      console.error('Errore nel caricamento del profilo:', error)
    }
  }

  const signUp = async (email, password, fullName) => {
    try {
      setLoading(true)
      const { data, error } = await auth.signUp(email, password, {
        full_name: fullName
      })
      
      if (error) throw error
      
      return { data, error: null }
    } catch (error) {
      console.error('Errore nella registrazione:', error)
      return { data: null, error }
    } finally {
      setLoading(false)
    }
  }

  const signIn = async (email, password) => {
    try {
      setLoading(true)
      const { data, error } = await auth.signIn(email, password)
      
      if (error) throw error
      
      return { data, error: null }
    } catch (error) {
      console.error('Errore nel login:', error)
      return { data: null, error }
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
  try {
    setLoading(true)
    
    // Pulisci lo stato locale PRIMA del logout
    setUser(null)
    setProfile(null)
    
    // Esegui il logout da Supabase
    const { error } = await supabase.auth.signOut()
    
    if (error) {
      console.error('Errore durante il logout:', error)
      // Anche se c'è un errore, mantieni lo stato pulito
    }
    
    // Forza il redirect alla pagina di login
    window.location.href = '/'
    
  } catch (error) {
    console.error('Errore durante il logout:', error)
    // In caso di errore, pulisci comunque lo stato
    setUser(null)
    setProfile(null)
    window.location.href = '/'
  } finally {
    setLoading(false)
  }
}


  const updateProfile = async (updates) => {
    try {
      if (!user) throw new Error('Utente non autenticato')
      
      const { data, error } = await users.updateProfile(user.id, updates)
      
      if (error) throw error
      
      setProfile(data[0])
      return { data, error: null }
    } catch (error) {
      console.error('Errore nell\'aggiornamento del profilo:', error)
      return { data: null, error }
    }
  }

  const value = {
    user,
    profile,
    loading,
    isAdmin,
    signUp,
    signIn,
    signOut,
    updateProfile,
    loadUserProfile
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

