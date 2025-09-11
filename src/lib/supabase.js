import { createClient } from '@supabase/supabase-js'

// Configurazione Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'YOUR_SUPABASE_URL'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Utility functions per l'autenticazione
export const auth = {
  // Registrazione utente
  signUp: async (email, password, userData = {}) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData
      }
    })
    return { data, error }
  },

  // Login utente
  signIn: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    return { data, error }
  },

  // Logout utente
  signOut: async () => {
    const { error } = await supabase.auth.signOut()
    return { error }
  },

  // Ottieni utente corrente
  getCurrentUser: () => {
    return supabase.auth.getUser()
  },

  // Ascolta cambiamenti di autenticazione
  onAuthStateChange: (callback) => {
    return supabase.auth.onAuthStateChange(callback)
  }
}

// Utility functions per le domande trading
export const tradingQuestions = {
  // Ottieni tutte le domande attive
  getActiveQuestions: async () => {
    const { data, error } = await supabase
      .from('trading_questions')
      .select(`
        *,
        created_by:users(full_name),
        votes(vote_type)
      `)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
    
    return { data, error }
  },

  // Crea nuova domanda (solo admin)
  createQuestion: async (questionData) => {
    const { data, error } = await supabase
      .from('trading_questions')
      .insert([questionData])
      .select()
    
    return { data, error }
  },

  // Aggiorna domanda (solo admin)
  updateQuestion: async (id, updates) => {
    const { data, error } = await supabase
      .from('trading_questions')
      .update(updates)
      .eq('id', id)
      .select()
    
    return { data, error }
  },

  // Elimina domanda (solo admin)
  deleteQuestion: async (id) => {
    const { error } = await supabase
      .from('trading_questions')
      .delete()
      .eq('id', id)
    
    return { error }
  }
}

// Utility functions per i voti
export const votes = {
  // Registra voto utente
  castVote: async (questionId, voteType) => {
    const { data: user } = await supabase.auth.getUser()
    
    if (!user.user) {
      return { error: { message: 'Utente non autenticato' } }
    }

    // Controlla se l'utente ha già votato per questa domanda
    const { data: existingVote } = await supabase
      .from('votes')
      .select('id')
      .eq('user_id', user.user.id)
      .eq('question_id', questionId)
      .single()

    if (existingVote) {
      // Aggiorna voto esistente
      const { data, error } = await supabase
        .from('votes')
        .update({ vote_type: voteType, updated_at: new Date().toISOString() })
        .eq('id', existingVote.id)
        .select()
      
      return { data, error }
    } else {
      // Crea nuovo voto
      const { data, error } = await supabase
        .from('votes')
        .insert([{
          user_id: user.user.id,
          question_id: questionId,
          vote_type: voteType
        }])
        .select()
      
      return { data, error }
    }
  },

  // Ottieni statistiche voti per una domanda
  getVoteStats: async (questionId) => {
    const { data, error } = await supabase
      .from('votes')
      .select('vote_type')
      .eq('question_id', questionId)
    
    if (error) return { error }

    const stats = data.reduce((acc, vote) => {
      acc[vote.vote_type] = (acc[vote.vote_type] || 0) + 1
      return acc
    }, { BUY: 0, SELL: 0 })

    return { data: stats, error: null }
  },

  // Ottieni voto utente per una domanda specifica
  getUserVote: async (questionId) => {
    const { data: user } = await supabase.auth.getUser()
    
    if (!user.user) {
      return { data: null, error: null }
    }

    const { data, error } = await supabase
      .from('votes')
      .select('vote_type')
      .eq('user_id', user.user.id)
      .eq('question_id', questionId)
      .single()
    
    return { data, error }
  },

  // Ottieni storico voti utente
  getUserVoteHistory: async () => {
    const { data: user } = await supabase.auth.getUser()
    
    if (!user.user) {
      return { data: [], error: null }
    }

    const { data, error } = await supabase
      .from('votes')
      .select(`
        *,
        trading_questions(title, description)
      `)
      .eq('user_id', user.user.id)
      .order('created_at', { ascending: false })
    
    return { data, error }
  }
}

// Utility functions per gli utenti
export const users = {
  // Ottieni profilo utente
  getProfile: async (userId) => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()
    
    return { data, error }
  },

  // Aggiorna profilo utente
  updateProfile: async (userId, updates) => {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select()
    
    return { data, error }
  },

  // Controlla se utente è admin
  isAdmin: async (userId) => {
    const { data, error } = await supabase
      .from('users')
      .select('role')
      .eq('id', userId)
      .single()
    
    if (error) return false
    return data?.role === 'admin'
  }
}

