import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { 
  Brain, 
  LogOut, 
  Settings, 
  Search, 
  Filter, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  BarChart3,
  Smartphone,
  Monitor,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react'

export const Dashboard = () => {
  const { user, signOut, isAdmin } = useAuth()
  const navigate = useNavigate()
  const [questions, setQuestions] = useState([])
  const [filteredQuestions, setFilteredQuestions] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [refreshing, setRefreshing] = useState(false)
  const [votes, setVotes] = useState({})
  const [storageStatus, setStorageStatus] = useState('loading')
  const [isMobile, setIsMobile] = useState(false)

  // Rilevamento mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768 || /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent))
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Sistema storage robusto con fallback multipli
  const loadData = () => {
    try {
      // Prova localStorage
      const savedQuestions = localStorage.getItem('oops_questions')
      const savedVotes = localStorage.getItem('oops_votes')
      
      if (savedQuestions) {
        const parsedQuestions = JSON.parse(savedQuestions)
        setQuestions(parsedQuestions)
        setStorageStatus('loaded')
        console.log('✅ Dati caricati da localStorage:', parsedQuestions.length, 'domande')
      } else {
        // Fallback: sessionStorage
        const sessionQuestions = sessionStorage.getItem('oops_questions')
        if (sessionQuestions) {
          const parsedQuestions = JSON.parse(sessionQuestions)
          setQuestions(parsedQuestions)
          setStorageStatus('session')
          console.log('✅ Dati caricati da sessionStorage:', parsedQuestions.length, 'domande')
        } else {
          // Ultimo fallback: domande demo hardcoded
          const demoQuestions = [
            {
              id: 'demo-1',
              title: 'Bitcoin raggiungerà $100,000 entro fine 2025?',
              description: 'Con l\'adozione istituzionale crescente e l\'halving del 2024, quale sarà la direzione di Bitcoin?',
              category: 'crypto',
              created_by: 'demo-user',
              creator_email: 'demo@oops.technology',
              is_active: true,
              created_at: new Date(Date.now() - 86400000).toISOString(),
              buy_votes: 156,
              sell_votes: 89
            },
            {
              id: 'demo-2', 
              title: 'NVIDIA supererà $1,000 per azione nel 2025?',
              description: 'L\'intelligenza artificiale continuerà a spingere il titolo NVIDIA verso nuovi massimi?',
              category: 'azioni',
              created_by: 'demo-user',
              creator_email: 'demo@oops.technology', 
              is_active: true,
              created_at: new Date(Date.now() - 172800000).toISOString(),
              buy_votes: 203,
              sell_votes: 67
            },
            {
              id: 'demo-3',
              title: 'EUR/USD tornerà sopra 1.10 entro marzo 2025?',
              description: 'Le politiche della BCE e della Fed influenzeranno significativamente il cambio euro-dollaro.',
              category: 'forex',
              created_by: 'demo-user',
              creator_email: 'demo@oops.technology',
              is_active: true,
              created_at: new Date(Date.now() - 259200000).toISOString(),
              buy_votes: 78,
              sell_votes: 134
            },
            {
              id: 'demo-4',
              title: 'L\'oro supererà $2,500/oz nel 2025?',
              description: 'Inflazione e incertezza geopolitica potrebbero spingere l\'oro verso nuovi record storici.',
              category: 'commodities',
              created_by: 'demo-user',
              creator_email: 'demo@oops.technology',
              is_active: true,
              created_at: new Date(Date.now() - 345600000).toISOString(),
              buy_votes: 167,
              sell_votes: 98
            }
          ]
          
          setQuestions(demoQuestions)
          setStorageStatus('demo')
          console.log('✅ Dati demo caricati:', demoQuestions.length, 'domande')
          
          // Salva le demo per persistenza
          try {
            localStorage.setItem('oops_questions', JSON.stringify(demoQuestions))
          } catch (e) {
            sessionStorage.setItem('oops_questions', JSON.stringify(demoQuestions))
          }
        }
      }
      
      // Carica voti
      if (savedVotes) {
        setVotes(JSON.parse(savedVotes))
      }
      
    } catch (error) {
      console.error('❌ Errore caricamento dati:', error)
      setStorageStatus('error')
      // Fallback finale: array vuoto
      setQuestions([])
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  // Filtraggio domande
  useEffect(() => {
    let filtered = questions

    // Filtro per categoria
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(q => q.category === selectedCategory)
    }

    // Filtro per ricerca
    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase()
      filtered = filtered.filter(q => 
        q.title.toLowerCase().includes(search) ||
        (q.description && q.description.toLowerCase().includes(search)) ||
        q.category.toLowerCase().includes(search)
      )
    }

    setFilteredQuestions(filtered)
  }, [questions, selectedCategory, searchTerm])

  const handleVote = (questionId, voteType) => {
    const userVoteKey = `${user?.id}_${questionId}`
    const currentVote = votes[userVoteKey]

    // Aggiorna voti locali
    const newVotes = { ...votes }
    
    if (currentVote === voteType) {
      // Rimuovi voto se clicchi lo stesso
      delete newVotes[userVoteKey]
    } else {
      // Aggiungi/cambia voto
      newVotes[userVoteKey] = voteType
    }
    
    setVotes(newVotes)
    
    // Aggiorna contatori domande
    setQuestions(prevQuestions => 
      prevQuestions.map(q => {
        if (q.id === questionId) {
          let newBuyVotes = q.buy_votes || 0
          let newSellVotes = q.sell_votes || 0
          
          // Rimuovi voto precedente
          if (currentVote === 'buy') newBuyVotes--
          if (currentVote === 'sell') newSellVotes--
          
          // Aggiungi nuovo voto
          if (newVotes[userVoteKey] === 'buy') newBuyVotes++
          if (newVotes[userVoteKey] === 'sell') newSellVotes++
          
          return {
            ...q,
            buy_votes: Math.max(0, newBuyVotes),
            sell_votes: Math.max(0, newSellVotes)
          }
        }
        return q
      })
    )
    
    // Salva in storage
    try {
      localStorage.setItem('oops_votes', JSON.stringify(newVotes))
    } catch (e) {
      sessionStorage.setItem('oops_votes', JSON.stringify(newVotes))
    }
    
    console.log(`🗳️ Voto ${voteType.toUpperCase()} per domanda ${questionId}`)
  }

  const handleRefresh = () => {
    setRefreshing(true)
    setTimeout(() => {
      loadData()
      setRefreshing(false)
    }, 1000)
  }

  const handleSignOut = () => {
    if (confirm('Sei sicuro di voler uscire da OOPS Tech?')) {
      localStorage.clear()
      sessionStorage.clear()
      window.location.href = '/?logout=true'
    }
  }

  const categories = [
    { value: 'all', label: 'Tutte', icon: '🌐' },
    { value: 'crypto', label: 'Crypto', icon: '₿' },
    { value: 'azioni', label: 'Azioni', icon: '📈' },
    { value: 'forex', label: 'Forex', icon: '💱' },
    { value: 'commodities', label: 'Commodities', icon: '🛢️' },
    { value: 'indici', label: 'Indici', icon: '📊' }
  ]

  const getStorageStatusInfo = () => {
    switch (storageStatus) {
      case 'loaded':
        return { text: 'Dati Caricati', color: 'bg-green-100 text-green-800 border-green-200', icon: CheckCircle }
      case 'session':
        return { text: 'Sessione Attiva', color: 'bg-blue-100 text-blue-800 border-blue-200', icon: Clock }
      case 'demo':
        return { text: 'Demo Attiva', color: 'bg-blue-100 text-blue-800 border-blue-200', icon: Brain }
      case 'error':
        return { text: 'Modalità Fallback', color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: AlertCircle }
      default:
        return { text: 'Caricamento...', color: 'bg-gray-100 text-gray-800 border-gray-200', icon: RefreshCw }
    }
  }

  const statusInfo = getStorageStatusInfo()
  const StatusIcon = statusInfo.icon

  const totalVotes = filteredQuestions.reduce((sum, q) => sum + (q.buy_votes || 0) + (q.sell_votes || 0), 0)
  const totalBuyVotes = filteredQuestions.reduce((sum, q) => sum + (q.buy_votes || 0), 0)
  const totalSellVotes = filteredQuestions.reduce((sum, q) => sum + (q.sell_votes || 0), 0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-gray-900 to-blue-900 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Brain className="h-8 w-8 mr-3 text-blue-400" />
              <div>
                <h1 className="text-xl font-bold">OOPS Tech</h1>
                <p className="text-xs text-blue-200">IA per Trading</p>
              </div>
            </div>

            {/* User Info & Actions */}
            <div className="flex items-center space-x-2 sm:space-x-4">
              {/* Device Indicator */}
              <div className="hidden sm:flex items-center text-blue-200">
                {isMobile ? <Smartphone className="h-4 w-4 mr-1" /> : <Monitor className="h-4 w-4 mr-1" />}
                <span className="text-xs">{isMobile ? 'Mobile' : 'Desktop'}</span>
              </div>

              {/* Admin Button */}
              {isAdmin && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/admin')}
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                >
                  <Settings className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Admin</span>
                </Button>
              )}

              {/* Profile Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/profile')}
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                <Users className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Profilo</span>
              </Button>

              {/* Logout Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={handleSignOut}
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                <LogOut className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Esci</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Benvenuto, {user?.email?.split('@')[0]}! 👋
          </h2>
          <p className="text-gray-600">
            L'intelligenza artificiale che ridefinisce l'investimento
          </p>
        </div>

        {/* Status Alert */}
        <Alert className={`mb-6 ${statusInfo.color}`}>
          <StatusIcon className="h-4 w-4" />
          <AlertDescription>
            <strong>{isMobile ? '📱' : '💻'} {statusInfo.text}:</strong> 
            {storageStatus === 'demo' && ' Modalità demo attiva con domande di esempio.'}
            {storageStatus === 'loaded' && ' Dati caricati correttamente dal browser.'}
            {storageStatus === 'session' && ' Dati temporanei della sessione corrente.'}
            {storageStatus === 'error' && ' Utilizzando modalità di emergenza.'}
          </AlertDescription>
        </Alert>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <BarChart3 className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Domande Attive</p>
                  <p className="text-2xl font-bold text-gray-900">{questions.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <TrendingUp className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Voti BUY</p>
                  <p className="text-2xl font-bold text-green-600">{totalBuyVotes}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <TrendingDown className="h-8 w-8 text-red-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Voti SELL</p>
                  <p className="text-2xl font-bold text-red-600">{totalSellVotes}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Sentiment</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {totalBuyVotes > totalSellVotes ? '🐂 Bullish' : totalSellVotes > totalBuyVotes ? '🐻 Bearish' : '⚖️ Neutrale'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Cerca domande..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Category Filter */}
              <div className="flex gap-2 flex-wrap">
                {categories.map((category) => (
                  <Button
                    key={category.value}
                    variant={selectedCategory === category.value ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(category.value)}
                    className="whitespace-nowrap"
                  >
                    <span className="mr-1">{category.icon}</span>
                    {category.label}
                  </Button>
                ))}
              </div>

              {/* Refresh */}
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={refreshing}
                className="whitespace-nowrap"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                Aggiorna
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Results Info - FIX REFUSO QUI */}
        {searchTerm || selectedCategory !== 'all' ? (
          <div className="mb-4">
            <p className="text-sm text-gray-600">
              {filteredQuestions.length === 0 ? (
                'Nessuna domanda trovata'
              ) : filteredQuestions.length === 1 ? (
                '1 domanda trovata'
              ) : (
                `${filteredQuestions.length} domande trovate`
              )}
              {searchTerm && ` per "${searchTerm}"`}
              {selectedCategory !== 'all' && ` nella categoria ${categories.find(c => c.value === selectedCategory)?.label}`}
            </p>
          </div>
        ) : null}

        {/* Questions List */}
        <div className="space-y-6">
          {filteredQuestions.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Brain className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {searchTerm || selectedCategory !== 'all' ? 'Nessun risultato' : 'Nessuna domanda disponibile'}
                </h3>
                <p className="text-gray-600 mb-6">
                  {searchTerm || selectedCategory !== 'all' 
                    ? 'Prova a modificare i filtri di ricerca.'
                    : 'Le domande di trading appariranno qui quando saranno disponibili.'
                  }
                </p>
                {(searchTerm || selectedCategory !== 'all') && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchTerm('')
                      setSelectedCategory('all')
                    }}
                  >
                    Rimuovi Filtri
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            filteredQuestions.map((question) => {
              const userVote = votes[`${user?.id}_${question.id}`]
              const totalVotes = (question.buy_votes || 0) + (question.sell_votes || 0)
              const buyPercentage = totalVotes > 0 ? ((question.buy_votes || 0) / totalVotes) * 100 : 0
              const sellPercentage = totalVotes > 0 ? ((question.sell_votes || 0) / totalVotes) * 100 : 0

              return (
                <Card key={question.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg mb-2">{question.title}</CardTitle>
                        {question.description && (
                          <p className="text-gray-600 text-sm mb-3">{question.description}</p>
                        )}
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <Badge variant="outline" className="capitalize">
                            {categories.find(c => c.value === question.category)?.icon} {question.category}
                          </Badge>
                          <span>•</span>
                          <span>da {question.creator_email?.split('@')[0] || 'Anonimo'}</span>
                          <span>•</span>
                          <span>{new Date(question.created_at).toLocaleDateString('it-IT')}</span>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {/* Vote Buttons */}
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <Button
                        onClick={() => handleVote(question.id, 'buy')}
                        variant={userVote === 'buy' ? 'default' : 'outline'}
                        className={`h-12 ${
                          userVote === 'buy' 
                            ? 'bg-green-600 hover:bg-green-700 text-white' 
                            : 'border-green-600 text-green-600 hover:bg-green-50'
                        }`}
                      >
                        <TrendingUp className="h-5 w-5 mr-2" />
                        BUY ({question.buy_votes || 0})
                      </Button>
                      <Button
                        onClick={() => handleVote(question.id, 'sell')}
                        variant={userVote === 'sell' ? 'default' : 'outline'}
                        className={`h-12 ${
                          userVote === 'sell' 
                            ? 'bg-red-600 hover:bg-red-700 text-white' 
                            : 'border-red-600 text-red-600 hover:bg-red-50'
                        }`}
                      >
                        <TrendingDown className="h-5 w-5 mr-2" />
                        SELL ({question.sell_votes || 0})
                      </Button>
                    </div>

                    {/* Progress Bar */}
                    {totalVotes > 0 && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-green-600 font-medium">BUY {buyPercentage.toFixed(1)}%</span>
                          <span className="text-red-600 font-medium">SELL {sellPercentage.toFixed(1)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-green-500 h-2 rounded-l-full transition-all duration-500"
                            style={{ width: `${buyPercentage}%` }}
                          ></div>
                          <div 
                            className="bg-red-500 h-2 rounded-r-full transition-all duration-500 -mt-2 ml-auto"
                            style={{ width: `${sellPercentage}%` }}
                          ></div>
                        </div>
                        <p className="text-center text-xs text-gray-500">
                          {totalVotes} voti totali
                        </p>
                      </div>
                    )}

                    {userVote && (
                      <div className="mt-3 text-center">
                        <Badge variant="outline" className={userVote === 'buy' ? 'border-green-500 text-green-700' : 'border-red-500 text-red-700'}>
                          Hai votato {userVote.toUpperCase()}
                        </Badge>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center mb-4 md:mb-0">
              <Brain className="h-6 w-6 mr-2 text-blue-400" />
              <span className="font-semibold">OOPS Tech</span>
              <Badge className="ml-2 bg-blue-600">AI Powered</Badge>
            </div>
            <div className="text-sm text-gray-400 text-center md:text-right">
              <p>Il futuro non si prevede. Si crea.</p>
              <p className="mt-1">
                <a href="https://www.oopstech.it" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">
                  www.oopstech.it
                </a>
              </p>
            </div>
          </div>
          
          {/* Debug Footer */}
          <div className="mt-4 pt-4 border-t border-gray-800 text-xs text-gray-500 text-center">
            {isMobile ? '📱' : '💻'} Ottimizzato per {isMobile ? 'Mobile' : 'Desktop'} • 
            Storage: {storageStatus} • 
            Domande: {questions.length} • 
            Voti: {Object.keys(votes).length}
          </div>
        </div>
      </footer>
    </div>
  )
}

