import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { tradingQuestions, votes } from '../lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Brain, 
  LogOut, 
  User, 
  Settings, 
  ChevronLeft, 
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Loader2,
  RefreshCw
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export const Dashboard = () => {
  const { user, profile, signOut, isAdmin } = useAuth()
  const navigate = useNavigate()
  const [questions, setQuestions] = useState([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [isVoting, setIsVoting] = useState(false)
  const [userVote, setUserVote] = useState(null)
  const [refreshing, setRefreshing] = useState(false)

  // Dati demo di fallback
  const demoQuestions = [
    {
      id: 'demo-1',
      title: 'Bitcoin raggiungerà $100,000 entro fine 2025?',
      description: 'Con l\'adozione istituzionale crescente e l\'halving del 2024, quale sarà la direzione di Bitcoin nei prossimi mesi?',
      category: 'Crypto',
      created_at: new Date(Date.now() - 86400000).toISOString(),
      is_active: true
    },
    {
      id: 'demo-2', 
      title: 'NVIDIA supererà $1,000 per azione nel 2025?',
      description: 'L\'intelligenza artificiale continuerà a spingere il titolo NVIDIA verso nuovi massimi storici?',
      category: 'Azioni',
      created_at: new Date(Date.now() - 172800000).toISOString(),
      is_active: true
    },
    {
      id: 'demo-3',
      title: 'EUR/USD tornerà sopra 1.10 entro marzo 2025?',
      description: 'Le politiche della BCE e della Fed influenzeranno significativamente il cambio euro-dollaro.',
      category: 'Forex',
      created_at: new Date(Date.now() - 259200000).toISOString(),
      is_active: true
    },
    {
      id: 'demo-4',
      title: 'L\'oro supererà $2,500/oz nel 2025?',
      description: 'Inflazione e incertezza geopolitica potrebbero spingere l\'oro verso nuovi record storici.',
      category: 'Commodities',
      created_at: new Date(Date.now() - 345600000).toISOString(),
      is_active: true
    }
  ]

  useEffect(() => {
    loadQuestions()
  }, [])

  useEffect(() => {
    if (questions.length > 0 && currentQuestionIndex < questions.length) {
      loadUserVote()
    }
  }, [currentQuestionIndex, questions])

  const loadQuestions = async () => {
    try {
      setLoading(true)
      setError('')
      
      // Prova a caricare da Supabase
      const { data, error: questionsError } = await tradingQuestions.getActiveQuestions()
      
      if (questionsError) {
        throw questionsError
      }

      if (data && data.length > 0) {
        setQuestions(data)
      } else {
        // Fallback ai dati demo se non ci sono domande
        setQuestions(demoQuestions)
      }
      setCurrentQuestionIndex(0)
    } catch (err) {
      console.warn('Errore Supabase, uso dati demo:', err.message)
      // Fallback ai dati demo in caso di errore
      setQuestions(demoQuestions)
      setCurrentQuestionIndex(0)
    } finally {
      setLoading(false)
    }
  }

  const loadUserVote = async () => {
    if (!user || questions.length === 0) return

    try {
      const currentQuestion = questions[currentQuestionIndex]
      const { data: userVoteData, error: userVoteError } = await votes.getUserVote(currentQuestion.id)
      
      if (userVoteError && userVoteError.code !== 'PGRST116') {
        throw userVoteError
      }
      
      setUserVote(userVoteData?.vote_type || null)
    } catch (err) {
      console.warn('Errore nel caricamento del voto utente:', err)
      setUserVote(null)
    }
  }

  const handleVote = async (voteType) => {
    if (!user || questions.length === 0) return

    try {
      setIsVoting(true)
      setError('')

      const currentQuestion = questions[currentQuestionIndex]
      
      // Prova a votare su Supabase
      const { error: voteError } = await votes.castVote(currentQuestion.id, voteType)
      
      if (voteError) {
        throw voteError
      }

      setUserVote(voteType)
    } catch (err) {
      console.warn('Errore voto Supabase, simulo voto locale:', err.message)
      // Fallback: simula il voto localmente
      setUserVote(voteType)
      console.log(`🗳️ Voto ${voteType.toUpperCase()} simulato per ${questions[currentQuestionIndex].title}`)
    } finally {
      setIsVoting(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await loadQuestions()
    setRefreshing(false)
  }

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (err) {
      // Fallback per logout
      if (confirm('Sei sicuro di voler uscire da OOPS Tech?')) {
        localStorage.clear()
        sessionStorage.clear()
        window.location.href = '/?logout=true'
      }
    }
  }

  const goToPreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1)
    }
  }

  const goToNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    }
  }

  const currentQuestion = questions[currentQuestionIndex]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header OOPS Tech */}
      <header className="bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 text-white shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo OOPS Tech */}
            <div className="flex items-center">
              <div className="bg-gradient-to-r from-blue-400 to-indigo-400 p-2 rounded-lg mr-3">
                <Brain className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                  OOPS Tech
                </h1>
                <p className="text-xs text-blue-200 font-medium">IA per Trading</p>
              </div>
            </div>

            {/* User Info */}
            <div className="hidden sm:flex items-center text-sm text-blue-200 mr-4">
              <User className="h-4 w-4 mr-2" />
              <span>Ciao, {profile?.full_name || user?.email?.split('@')[0] || 'Demo User'}</span>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-3">
              {isAdmin && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/admin')}
                  className="bg-white/10 border-white/30 text-white hover:bg-white/20 hover:border-white/40 transition-all"
                >
                  <Settings className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Admin</span>
                </Button>
              )}
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/profile')}
                className="bg-white/10 border-white/30 text-white hover:bg-white/20 hover:border-white/40 transition-all"
              >
                <User className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Profilo</span>
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={handleSignOut}
                className="bg-white/10 border-white/30 text-white hover:bg-white/20 hover:border-white/40 transition-all"
              >
                <LogOut className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Esci</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Previsioni di Mercato
          </h2>
          <p className="text-lg text-gray-600">
            Benvenuto nell'era dell'intelligenza finanziaria potenziata
          </p>
        </div>

        {/* Error Display */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-16">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Caricamento domande...</p>
          </div>
        )}

        {/* Single Question Display */}
        {!loading && questions.length > 0 && currentQuestion && (
          <div className="space-y-6">
            {/* Question Counter and Navigation */}
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                size="sm"
                onClick={goToPreviousQuestion}
                disabled={currentQuestionIndex === 0}
                className="flex items-center"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Precedente
              </Button>

              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">
                  {currentQuestionIndex + 1} di {questions.length}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRefresh}
                  disabled={refreshing}
                >
                  <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                </Button>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={goToNextQuestion}
                disabled={currentQuestionIndex === questions.length - 1}
                className="flex items-center"
              >
                Successiva
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>

            {/* Question Card */}
            <Card className="bg-white shadow-xl rounded-3xl overflow-hidden border-0">
              <CardHeader className="bg-gradient-to-r from-gray-50 to-blue-50 pb-6 pt-8 px-8">
                <div className="flex items-center justify-between mb-4">
                  <Badge className="bg-blue-100 text-blue-700 px-4 py-2 rounded-full font-semibold border-0">
                    {currentQuestion.category}
                  </Badge>
                  {userVote && (
                    <Badge className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">
                      Hai votato {userVote}
                    </Badge>
                  )}
                </div>
                
                <CardTitle className="text-2xl font-bold text-gray-900 leading-tight mb-4">
                  {currentQuestion.title}
                </CardTitle>
                
                {currentQuestion.description && (
                  <p className="text-gray-700 text-lg leading-relaxed">
                    {currentQuestion.description}
                  </p>
                )}
              </CardHeader>
              
              <CardContent className="p-8">
                {/* BUY/SELL Buttons - Large and Prominent */}
                {user && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <Button
                      onClick={() => handleVote('BUY')}
                      disabled={isVoting}
                      className={`h-20 text-xl font-bold rounded-2xl transition-all duration-300 transform hover:scale-105 ${
                        userVote === 'BUY' 
                          ? 'bg-green-600 hover:bg-green-700 text-white shadow-lg' 
                          : 'bg-green-500 hover:bg-green-600 text-white shadow-lg hover:shadow-xl'
                      }`}
                    >
                      {isVoting && userVote !== 'BUY' ? (
                        <Loader2 className="h-6 w-6 animate-spin mr-3" />
                      ) : (
                        <TrendingUp className="h-6 w-6 mr-3" />
                      )}
                      BUY
                    </Button>
                    
                    <Button
                      onClick={() => handleVote('SELL')}
                      disabled={isVoting}
                      className={`h-20 text-xl font-bold rounded-2xl transition-all duration-300 transform hover:scale-105 ${
                        userVote === 'SELL' 
                          ? 'bg-red-600 hover:bg-red-700 text-white shadow-lg' 
                          : 'bg-red-500 hover:bg-red-600 text-white shadow-lg hover:shadow-xl'
                      }`}
                    >
                      {isVoting && userVote !== 'SELL' ? (
                        <Loader2 className="h-6 w-6 animate-spin mr-3" />
                      ) : (
                        <TrendingDown className="h-6 w-6 mr-3" />
                      )}
                      SELL
                    </Button>
                  </div>
                )}

                {/* Message for non-authenticated users */}
                {!user && (
                  <div className="text-center py-8">
                    <p className="text-lg text-gray-600 mb-4">
                      Accedi per votare su questa domanda
                    </p>
                    <Button
                      onClick={() => navigate('/auth')}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl"
                    >
                      Accedi ora
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* No Questions State */}
        {!loading && questions.length === 0 && (
          <div className="text-center py-16">
            <div className="bg-white rounded-3xl shadow-lg p-12 border border-gray-100 max-w-md mx-auto">
              <div className="bg-gradient-to-r from-blue-400 to-indigo-400 p-4 rounded-full w-20 h-20 mx-auto mb-6">
                <Brain className="h-12 w-12 text-white mx-auto" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Nessuna domanda disponibile
              </h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Le domande di trading appariranno qui quando saranno create dagli amministratori.
              </p>
              <Button
                variant="outline"
                onClick={handleRefresh}
                className="rounded-xl"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Ricarica
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

