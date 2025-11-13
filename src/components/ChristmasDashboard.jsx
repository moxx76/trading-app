import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { tradingQuestions, votes } from '../lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Star,
  LogOut,
  User,
  Settings,
  TrendingUp,
  TrendingDown,
  Loader2,
  RefreshCw,
  X,
  Sparkles
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export const ChristmasDashboard = () => {
  const { user, profile, signOut, isAdmin } = useAuth()
  const navigate = useNavigate()
  const [questions, setQuestions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedQuestion, setSelectedQuestion] = useState(null)
  const [isVoting, setIsVoting] = useState(false)
  const [userVotes, setUserVotes] = useState({})
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
    },
    {
      id: 'demo-5',
      title: 'Tesla raggiungerà $500 per azione?',
      description: 'I nuovi modelli e l\'espansione globale porteranno Tesla a nuovi record?',
      category: 'Azioni',
      created_at: new Date(Date.now() - 432000000).toISOString(),
      is_active: true
    },
    {
      id: 'demo-6',
      title: 'Ethereum supererà $5,000?',
      description: 'Gli upgrade della rete e le applicazioni DeFi spingeranno ETH verso nuovi massimi?',
      category: 'Crypto',
      created_at: new Date(Date.now() - 518400000).toISOString(),
      is_active: true
    }
  ]

  // Colori natalizi per le palline
  const christmasColors = [
    { bg: 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)', shadow: 'rgba(220, 38, 38, 0.5)' }, // Rosso
    { bg: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)', shadow: 'rgba(22, 163, 74, 0.5)' }, // Verde
    { bg: 'linear-gradient(135deg, #eab308 0%, #ca8a04 100%)', shadow: 'rgba(234, 179, 8, 0.5)' }, // Oro
    { bg: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)', shadow: 'rgba(59, 130, 246, 0.5)' }, // Blu
    { bg: 'linear-gradient(135deg, #ec4899 0%, #be185d 100%)', shadow: 'rgba(236, 72, 153, 0.5)' }, // Rosa
    { bg: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)', shadow: 'rgba(139, 92, 246, 0.5)' }, // Viola
  ]

  useEffect(() => {
    loadQuestions()
  }, [])

  useEffect(() => {
    if (questions.length > 0 && user) {
      loadAllUserVotes()
    }
  }, [questions, user])

  const loadQuestions = async () => {
    try {
      setLoading(true)
      setError('')

      const { data, error: questionsError } = await tradingQuestions.getActiveQuestions()

      if (questionsError) {
        throw questionsError
      }

      if (data && data.length > 0) {
        setQuestions(data)
      } else {
        setQuestions(demoQuestions)
      }
    } catch (err) {
      console.warn('Errore Supabase, uso dati demo:', err.message)
      setQuestions(demoQuestions)
    } finally {
      setLoading(false)
    }
  }

  const loadAllUserVotes = async () => {
    if (!user) return

    const votesMap = {}
    for (const question of questions) {
      try {
        const { data: userVoteData } = await votes.getUserVote(question.id)
        if (userVoteData?.vote_type) {
          votesMap[question.id] = userVoteData.vote_type
        }
      } catch (err) {
        console.warn('Errore caricamento voto per', question.id)
      }
    }
    setUserVotes(votesMap)
  }

  const handleVote = async (questionId, voteType) => {
    if (!user) return

    try {
      setIsVoting(true)
      setError('')

      const { error: voteError } = await votes.castVote(questionId, voteType)

      if (voteError) {
        throw voteError
      }

      setUserVotes(prev => ({ ...prev, [questionId]: voteType }))
    } catch (err) {
      console.warn('Errore voto Supabase, simulo voto locale:', err.message)
      setUserVotes(prev => ({ ...prev, [questionId]: voteType }))
      console.log(`🗳️ Voto ${voteType.toUpperCase()} simulato`)
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
      if (confirm('Sei sicuro di voler uscire da OOPS Tech?')) {
        localStorage.clear()
        sessionStorage.clear()
        window.location.href = '/?logout=true'
      }
    }
  }

  // Disposizione delle palline a forma di albero
  const getTreeLayout = () => {
    const layout = [
      { row: 0, count: 1 }, // Cima (1 pallina)
      { row: 1, count: 2 }, // Secondo livello (2 palline)
      { row: 2, count: 3 }, // Terzo livello (3 palline)
      { row: 3, count: 4 }, // Quarto livello (4 palline) - rimosso per avere 6 totali
    ]

    let questionIndex = 0
    return layout.map(level => {
      const balls = []
      for (let i = 0; i < level.count && questionIndex < questions.length; i++) {
        balls.push({
          question: questions[questionIndex],
          color: christmasColors[questionIndex % christmasColors.length],
          index: questionIndex
        })
        questionIndex++
      }
      return { ...level, balls }
    })
  }

  const treeLayout = getTreeLayout()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 relative overflow-hidden">
      {/* Falling snow effect */}
      <div className="christmas-snow"></div>

      {/* Header OOPS Tech */}
      <header className="bg-gradient-to-r from-red-800 via-green-800 to-red-800 text-white shadow-xl relative z-10">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            <div className="flex items-center">
              <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 p-1.5 sm:p-2 rounded-lg mr-2 sm:mr-3 animate-pulse">
                <Star className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
              </div>
              <div>
                <h1 className="text-sm sm:text-xl font-bold bg-gradient-to-r from-white to-yellow-200 bg-clip-text text-transparent">
                  OOPS Tech 🎄
                </h1>
                <p className="text-xs text-yellow-200 font-medium hidden sm:block">Speciale Natale</p>
              </div>
            </div>

            <div className="hidden md:flex items-center text-sm text-green-200 mr-4">
              <User className="h-4 w-4 mr-2" />
              <span>Ciao, {profile?.full_name || user?.email?.split('@')[0] || 'Demo User'}</span>
            </div>

            <div className="flex items-center space-x-1 sm:space-x-3">
              {isAdmin && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/admin')}
                  className="bg-white/10 border-white/30 text-white hover:bg-white/20 hover:border-white/40 transition-all text-xs sm:text-sm px-2 sm:px-3"
                >
                  <Settings className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Admin</span>
                </Button>
              )}

              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/profile')}
                className="bg-white/10 border-white/30 text-white hover:bg-white/20 hover:border-white/40 transition-all text-xs sm:text-sm px-2 sm:px-3"
              >
                <User className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2" />
                <span className="hidden sm:inline">Profilo</span>
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={handleSignOut}
                className="bg-white/10 border-white/30 text-white hover:bg-white/20 hover:border-white/40 transition-all text-xs sm:text-sm px-2 sm:px-3"
              >
                <LogOut className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2" />
                <span className="hidden sm:inline">Esci</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 relative z-10">
        {/* Welcome Section */}
        <div className="text-center mb-6 sm:mb-8">
          <h2 className="text-2xl sm:text-4xl font-bold text-white mb-1 sm:mb-2 flex items-center justify-center gap-2">
            <Sparkles className="text-yellow-300 animate-pulse" />
            Albero delle Previsioni Natalizie
            <Sparkles className="text-yellow-300 animate-pulse" />
          </h2>
          <p className="text-sm sm:text-lg text-yellow-200">
            Clicca su una pallina per votare le tue previsioni di mercato
          </p>

          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
            className="mt-4 bg-white/10 border-white/30 text-white hover:bg-white/20"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Aggiorna
          </Button>
        </div>

        {/* Error Display */}
        {error && (
          <Alert variant="destructive" className="mb-4 sm:mb-6">
            <AlertDescription className="text-sm">{error}</AlertDescription>
          </Alert>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12 sm:py-16">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-white" />
            <p className="text-white">Caricamento domande...</p>
          </div>
        )}

        {/* Christmas Tree with Ball Ornaments */}
        {!loading && questions.length > 0 && (
          <div className="relative">
            {/* Star on top */}
            <div className="flex justify-center mb-8">
              <div className="christmas-star">
                <Star className="h-16 w-16 text-yellow-300 fill-yellow-300" />
              </div>
            </div>

            {/* Tree with balls */}
            <div className="space-y-6 sm:space-y-8">
              {treeLayout.map((level, levelIndex) => (
                <div
                  key={levelIndex}
                  className="flex justify-center items-center gap-4 sm:gap-8"
                  style={{
                    paddingLeft: `${(3 - level.count) * 40}px`,
                    paddingRight: `${(3 - level.count) * 40}px`
                  }}
                >
                  {level.balls.map((ball, ballIndex) => {
                    const hasVoted = userVotes[ball.question.id]
                    return (
                      <div
                        key={ball.question.id}
                        className="christmas-ball"
                        style={{
                          background: ball.color.bg,
                          boxShadow: `0 10px 30px ${ball.color.shadow}, 0 0 20px ${ball.color.shadow}`,
                          animationDelay: `${(levelIndex * level.count + ballIndex) * 0.2}s`
                        }}
                        onClick={() => setSelectedQuestion(ball.question)}
                      >
                        <div className="absolute inset-0 flex items-center justify-center text-white font-bold text-center p-4">
                          <div>
                            <div className="text-xs mb-1 opacity-90">{ball.question.category}</div>
                            <div className="text-sm leading-tight line-clamp-3">{ball.question.title}</div>
                            {hasVoted && (
                              <Badge className="mt-2 text-xs bg-white/20 text-white border-white/30">
                                ✓ {hasVoted}
                              </Badge>
                            )}
                          </div>
                        </div>

                        {/* Shine effect */}
                        <div className="christmas-ball-shine"></div>

                        {/* Ornament cap */}
                        <div className="christmas-ball-cap"></div>
                      </div>
                    )
                  })}
                </div>
              ))}
            </div>

            {/* Tree trunk */}
            <div className="flex justify-center mt-8">
              <div className="christmas-trunk"></div>
            </div>
          </div>
        )}

        {/* No Questions State */}
        {!loading && questions.length === 0 && (
          <div className="text-center py-12 text-white">
            <Star className="h-16 w-16 mx-auto mb-4 text-yellow-300" />
            <h3 className="text-xl font-bold mb-2">Nessuna pallina sull'albero</h3>
            <p className="text-gray-300 mb-6">Le domande appariranno qui quando saranno create.</p>
            <Button onClick={handleRefresh} className="bg-red-600 hover:bg-red-700">
              <RefreshCw className="h-4 w-4 mr-2" />
              Ricarica
            </Button>
          </div>
        )}
      </main>

      {/* Question Modal */}
      {selectedQuestion && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <Card className="bg-white max-w-2xl w-full shadow-2xl animate-in zoom-in-95 duration-300">
            <CardHeader className="bg-gradient-to-r from-red-50 to-green-50 pb-4">
              <div className="flex items-center justify-between mb-3">
                <Badge className="bg-blue-100 text-blue-700 px-4 py-2 rounded-full font-semibold">
                  {selectedQuestion.category}
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedQuestion(null)}
                  className="rounded-full"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <CardTitle className="text-2xl font-bold text-gray-900 leading-tight mb-3">
                {selectedQuestion.title}
              </CardTitle>

              {selectedQuestion.description && (
                <p className="text-gray-700 text-lg leading-relaxed">
                  {selectedQuestion.description}
                </p>
              )}
            </CardHeader>

            <CardContent className="p-8">
              {user ? (
                <div className="space-y-4">
                  {userVotes[selectedQuestion.id] && (
                    <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                      <p className="text-green-700 font-medium">
                        ✓ Hai già votato: {userVotes[selectedQuestion.id]}
                      </p>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => {
                        handleVote(selectedQuestion.id, 'BUY')
                        setSelectedQuestion(null)
                      }}
                      disabled={isVoting}
                      className={`py-6 rounded-xl transition-all duration-200 flex flex-col items-center justify-center text-white font-bold text-xl shadow-lg hover:shadow-xl ${
                        userVotes[selectedQuestion.id] === 'BUY'
                          ? 'bg-green-700 ring-4 ring-green-300'
                          : 'bg-green-600 hover:bg-green-700'
                      } ${isVoting ? 'opacity-75' : ''}`}
                    >
                      {isVoting ? (
                        <Loader2 className="h-8 w-8 animate-spin" />
                      ) : (
                        <>
                          <TrendingUp className="h-8 w-8 mb-2" />
                          BUY
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => {
                        handleVote(selectedQuestion.id, 'SELL')
                        setSelectedQuestion(null)
                      }}
                      disabled={isVoting}
                      className={`py-6 rounded-xl transition-all duration-200 flex flex-col items-center justify-center text-white font-bold text-xl shadow-lg hover:shadow-xl ${
                        userVotes[selectedQuestion.id] === 'SELL'
                          ? 'bg-red-700 ring-4 ring-red-300'
                          : 'bg-red-600 hover:bg-red-700'
                      } ${isVoting ? 'opacity-75' : ''}`}
                    >
                      {isVoting ? (
                        <Loader2 className="h-8 w-8 animate-spin" />
                      ) : (
                        <>
                          <TrendingDown className="h-8 w-8 mb-2" />
                          SELL
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-lg text-gray-600 mb-4">
                    Accedi per votare su questa domanda
                  </p>
                  <Button
                    onClick={() => navigate('/auth')}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl text-base"
                  >
                    Accedi ora
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
