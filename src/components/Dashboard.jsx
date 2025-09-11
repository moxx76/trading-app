import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Brain, 
  LogOut, 
  User, 
  Settings, 
  Search,
  Filter,
  RefreshCw,
  Loader2,
  Zap,
  TrendingUp as TrendingUpIcon,
  ThumbsUp,
  ThumbsDown,
  BarChart3,
  Clock,
  Smartphone
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'

// Storage utility che funziona su mobile
const storage = {
  set: (key, value) => {
    try {
      const data = JSON.stringify(value)
      // Prova localStorage prima
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(key, data)
        return true
      }
      // Fallback a sessionStorage
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.setItem(key, data)
        return true
      }
      // Fallback a variabile globale
      if (typeof window !== 'undefined') {
        window[`oops_${key}`] = data
        return true
      }
      return false
    } catch (error) {
      console.warn('Storage error:', error)
      return false
    }
  },
  
  get: (key) => {
    try {
      let data = null
      // Prova localStorage prima
      if (typeof localStorage !== 'undefined') {
        data = localStorage.getItem(key)
      }
      // Fallback a sessionStorage
      if (!data && typeof sessionStorage !== 'undefined') {
        data = sessionStorage.getItem(key)
      }
      // Fallback a variabile globale
      if (!data && typeof window !== 'undefined') {
        data = window[`oops_${key}`]
      }
      
      return data ? JSON.parse(data) : null
    } catch (error) {
      console.warn('Storage get error:', error)
      return null
    }
  },
  
  clear: () => {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.clear()
      }
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.clear()
      }
      if (typeof window !== 'undefined') {
        Object.keys(window).forEach(key => {
          if (key.startsWith('oops_')) {
            delete window[key]
          }
        })
      }
    } catch (error) {
      console.warn('Storage clear error:', error)
    }
  }
}

export const Dashboard = () => {
  const { user, profile, signOut, isAdmin } = useAuth()
  const navigate = useNavigate()
  const [questions, setQuestions] = useState([])
  const [filteredQuestions, setFilteredQuestions] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [refreshing, setRefreshing] = useState(false)
  const [votes, setVotes] = useState({})
  const [isMobile, setIsMobile] = useState(false)
  const [storageStatus, setStorageStatus] = useState('checking')

  // Rileva se è mobile
  useEffect(() => {
    const checkMobile = () => {
      const mobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
                    window.innerWidth <= 768
      setIsMobile(mobile)
      console.log('📱 Mobile detected:', mobile)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Carica domande con fallback robusto
  useEffect(() => {
    loadQuestionsRobust()
  }, [user])

  // Filtra domande
  useEffect(() => {
    let filtered = questions
    
    if (searchTerm) {
      filtered = filtered.filter(q => 
        q.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.description?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(q => q.category === selectedCategory)
    }
    
    setFilteredQuestions(filtered)
  }, [questions, searchTerm, selectedCategory])

  const loadQuestionsRobust = async () => {
    try {
      setLoading(true)
      setStorageStatus('loading')
      
      console.log('🔄 Caricamento domande...')
      console.log('📱 Mobile:', isMobile)
      console.log('👤 User:', user?.email)
      
      // Prova a caricare da storage
      let storedQuestions = storage.get('questions')
      let storedVotes = storage.get('votes')
      
      console.log('💾 Stored questions:', storedQuestions?.length || 0)
      console.log('🗳️ Stored votes:', Object.keys(storedVotes || {}).length)
      
      if (storedQuestions && storedQuestions.length > 0) {
        setQuestions(storedQuestions)
        setStorageStatus('loaded')
      } else {
        // Crea domande demo sempre disponibili
        console.log('🎯 Creazione domande demo...')
        const demoQuestions = createDemoQuestions()
        setQuestions(demoQuestions)
        storage.set('questions', demoQuestions)
        setStorageStatus('demo')
      }
      
      if (storedVotes) {
        setVotes(storedVotes)
      }
      
    } catch (error) {
      console.error('❌ Errore caricamento:', error)
      // Fallback assoluto - domande hardcoded
      const fallbackQuestions = createDemoQuestions()
      setQuestions(fallbackQuestions)
      setStorageStatus('fallback')
    } finally {
      setLoading(false)
    }
  }

  const createDemoQuestions = () => {
    const now = new Date().toISOString()
    return [
      {
        id: 'demo-btc-' + Date.now(),
        title: 'Bitcoin raggiungerà $100,000 entro fine 2025?',
        description: 'Considerando l\'adozione istituzionale crescente, l\'halving del 2024 e le politiche monetarie globali, quale sarà la direzione di Bitcoin?',
        category: 'crypto',
        created_by: user?.id || 'demo-user',
        creator_email: user?.email || 'demo@oopstech.it',
        is_active: true,
        created_at: now,
        buy_votes: 15,
        sell_votes: 8
      },
      {
        id: 'demo-tsla-' + Date.now(),
        title: 'Tesla supererà $300 per azione entro giugno 2025?',
        description: 'Con i nuovi modelli in arrivo, l\'espansione in Asia e gli sviluppi nell\'AI, come si comporterà il titolo TSLA?',
        category: 'azioni',
        created_by: user?.id || 'demo-user',
        creator_email: user?.email || 'demo@oopstech.it',
        is_active: true,
        created_at: now,
        buy_votes: 22,
        sell_votes: 6
      },
      {
        id: 'demo-eur-' + Date.now(),
        title: 'EUR/USD salirà sopra 1.15 entro marzo 2025?',
        description: 'Con le politiche BCE e Fed divergenti e l\'inflazione in calo, come si comporterà la coppia EUR/USD?',
        category: 'forex',
        created_by: user?.id || 'demo-user',
        creator_email: user?.email || 'demo@oopstech.it',
        is_active: true,
        created_at: now,
        buy_votes: 11,
        sell_votes: 14
      },
      {
        id: 'demo-ai-' + Date.now(),
        title: 'Il settore AI crescerà del 50% nel 2025?',
        description: 'Con l\'esplosione dell\'intelligenza artificiale e gli investimenti massicci, il settore tech AI continuerà la crescita esponenziale?',
        category: 'azioni',
        created_by: user?.id || 'demo-user',
        creator_email: user?.email || 'demo@oopstech.it',
        is_active: true,
        created_at: now,
        buy_votes: 28,
        sell_votes: 4
      }
    ]
  }

  const handleVote = (questionId, voteType) => {
    try {
      console.log('🗳️ Voto:', questionId, voteType)
      
      const newVotes = { ...votes }
      const voteKey = `${user?.id || 'demo'}-${questionId}`
      
      // Se ha già votato, rimuovi il voto
      if (newVotes[voteKey]) {
        delete newVotes[voteKey]
        console.log('🗑️ Voto rimosso')
      } else {
        // Aggiungi nuovo voto
        newVotes[voteKey] = {
          questionId,
          voteType,
          userId: user?.id || 'demo',
          timestamp: new Date().toISOString()
        }
        console.log('✅ Nuovo voto aggiunto')
      }
      
      setVotes(newVotes)
      storage.set('votes', newVotes)
      
      // Aggiorna contatori domande
      const updatedQuestions = questions.map(q => {
        if (q.id === questionId) {
          const questionVotes = Object.values(newVotes).filter(v => v.questionId === questionId)
          const buyCount = questionVotes.filter(v => v.voteType === 'BUY').length
          const sellCount = questionVotes.filter(v => v.voteType === 'SELL').length
          
          return {
            ...q,
            buy_votes: buyCount,
            sell_votes: sellCount
          }
        }
        return q
      })
      
      setQuestions(updatedQuestions)
      storage.set('questions', updatedQuestions)
      
    } catch (error) {
      console.error('❌ Errore voto:', error)
    }
  }

  const getUserVote = (questionId) => {
    const voteKey = `${user?.id || 'demo'}-${questionId}`
    return votes[voteKey]?.voteType || null
  }

  const handleSignOut = () => {
    if (confirm('Sei sicuro di voler uscire da OOPS Tech?')) {
      storage.clear()
      window.location.href = '/?logout=true'
    }
  }

  const handleRefresh = () => {
    setRefreshing(true)
    loadQuestionsRobust()
    setTimeout(() => {
      setRefreshing(false)
    }, 1000)
  }

  const categories = [
    { value: 'all', label: 'Tutte le categorie' },
    { value: 'crypto', label: 'Cryptocurrency' },
    { value: 'azioni', label: 'Azioni' },
    { value: 'forex', label: 'Forex' },
    { value: 'commodities', label: 'Commodities' },
    { value: 'indici', label: 'Indici' },
    { value: 'generale', label: 'Generale' }
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="oops-stats-card mb-4">
            <Brain className="h-12 w-12 mx-auto mb-4 animate-pulse" />
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
            <p className="text-white">Caricamento OOPS Tech...</p>
            <p className="text-white/60 text-sm mt-2">
              {isMobile ? '📱 Modalità Mobile' : '💻 Modalità Desktop'}
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header OOPS Tech */}
      <header className="oops-header sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-white/10 rounded-xl">
                  <Brain className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="oops-logo text-white">OOPS Tech</h1>
                  <p className="oops-tagline">Trading Dashboard</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 sm:space-x-4">
              <span className="hidden sm:block text-sm text-white/80">
                Ciao, {profile?.full_name || user?.email}
              </span>
              
              {/* BOTTONE ADMIN */}
              {isAdmin && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/admin')}
                  className="hidden sm:flex bg-white/10 border-white/20 text-white hover:bg-white/20"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Admin
                </Button>
              )}
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/profile')}
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                <User className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Profilo</span>
              </Button>
              
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
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Welcome Section OOPS Tech */}
        <div className="mb-8 text-center">
          <h2 className="oops-hero-title text-3xl text-gray-900 mb-3">
            L'intelligenza artificiale che ridefinisce l'investimento
          </h2>
          <p className="oops-hero-subtitle text-gray-600 max-w-2xl mx-auto">
            Vota sulle domande di trading e scopri cosa pensa la community. 
            Powered by OOPS Tech AI.
          </p>
          
          {/* Stats rapide */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
            <div className="oops-stats-card">
              <TrendingUpIcon className="h-6 w-6 mx-auto mb-2" />
              <div className="text-2xl font-bold">{questions.length}</div>
              <div className="text-sm opacity-90">Domande</div>
            </div>
            <div className="oops-stats-card">
              <Brain className="h-6 w-6 mx-auto mb-2" />
              <div className="text-2xl font-bold">AI</div>
              <div className="text-sm opacity-90">Powered</div>
            </div>
            <div className="oops-stats-card">
              {isMobile ? <Smartphone className="h-6 w-6 mx-auto mb-2" /> : <Zap className="h-6 w-6 mx-auto mb-2" />}
              <div className="text-2xl font-bold">{isMobile ? 'Mobile' : '24/7'}</div>
              <div className="text-sm opacity-90">{isMobile ? 'Ready' : 'Attivo'}</div>
            </div>
            <div className="oops-stats-card">
              <User className="h-6 w-6 mx-auto mb-2" />
              <div className="text-2xl font-bold">Demo</div>
              <div className="text-sm opacity-90">Mode</div>
            </div>
          </div>
        </div>

        {/* Status Info */}
        <Alert className={`mb-6 ${
          storageStatus === 'loaded' ? 'border-green-200 bg-green-50' :
          storageStatus === 'demo' ? 'border-blue-200 bg-blue-50' :
          'border-yellow-200 bg-yellow-50'
        }`}>
          <Brain className="h-4 w-4" />
          <AlertDescription className={
            storageStatus === 'loaded' ? 'text-green-800' :
            storageStatus === 'demo' ? 'text-blue-800' :
            'text-yellow-800'
          }>
            <strong>
              {isMobile ? '📱 Mobile Mode' : '💻 Desktop Mode'} - 
              {storageStatus === 'loaded' ? ' Dati Caricati' :
               storageStatus === 'demo' ? ' Demo Attiva' :
               ' Modalità Fallback'}:
            </strong> 
            {storageStatus === 'loaded' ? ' I tuoi dati sono stati ripristinati con successo.' :
             storageStatus === 'demo' ? ' Domande demo caricate. Perfetto per testare l\'interfaccia OOPS Tech!' :
             ' Sistema di backup attivo. Tutte le funzionalità disponibili.'}
          </AlertDescription>
        </Alert>

        {/* Filters and Search */}
        <Card className="oops-card mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Cerca domande di trading..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="sm:w-48">
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <Button
                variant="outline"
                size="icon"
                onClick={handleRefresh}
                disabled={refreshing}
                className="oops-button-primary"
              >
                <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Questions List */}
        <div className="space-y-4">
          {filteredQuestions.map((question) => {
            const userVote = getUserVote(question.id)
            const totalVotes = (question.buy_votes || 0) + (question.sell_votes || 0)
            const buyPercentage = totalVotes > 0 ? ((question.buy_votes || 0) / totalVotes * 100) : 50
            const sellPercentage = totalVotes > 0 ? ((question.sell_votes || 0) / totalVotes * 100) : 50

            return (
              <Card key={question.id} className="oops-card">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="oops-title text-lg mb-2">
                        {question.title}
                      </CardTitle>
                      {question.description && (
                        <p className="text-gray-600 text-sm mb-3">
                          {question.description}
                        </p>
                      )}
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span className="oops-badge oops-badge-category">
                          {question.category}
                        </span>
                        <span className="flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {new Date(question.created_at).toLocaleDateString()}
                        </span>
                        <span className="flex items-center">
                          <BarChart3 className="h-3 w-3 mr-1" />
                          {totalVotes} voti
                        </span>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex justify-between text-xs text-gray-600 mb-1">
                      <span>BUY {buyPercentage.toFixed(0)}%</span>
                      <span>SELL {sellPercentage.toFixed(0)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-l-full transition-all duration-300"
                        style={{ width: `${buyPercentage}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Vote Buttons */}
                  <div className="flex gap-3">
                    <Button
                      onClick={() => handleVote(question.id, 'BUY')}
                      variant={userVote === 'BUY' ? 'default' : 'outline'}
                      className={`flex-1 ${
                        userVote === 'BUY' 
                          ? 'bg-green-600 hover:bg-green-700 text-white' 
                          : 'border-green-600 text-green-600 hover:bg-green-50'
                      }`}
                    >
                      <ThumbsUp className="h-4 w-4 mr-2" />
                      BUY ({question.buy_votes || 0})
                    </Button>
                    
                    <Button
                      onClick={() => handleVote(question.id, 'SELL')}
                      variant={userVote === 'SELL' ? 'default' : 'outline'}
                      className={`flex-1 ${
                        userVote === 'SELL' 
                          ? 'bg-red-600 hover:bg-red-700 text-white' 
                          : 'border-red-600 text-red-600 hover:bg-red-50'
                      }`}
                    >
                      <ThumbsDown className="h-4 w-4 mr-2" />
                      SELL ({question.sell_votes || 0})
                    </Button>
                  </div>

                  {userVote && (
                    <p className="text-xs text-center mt-2 text-gray-500">
                      Hai votato: <strong>{userVote}</strong> • Clicca di nuovo per rimuovere
                    </p>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>

        {filteredQuestions.length === 0 && (
          <Card className="oops-card">
            <CardContent className="text-center py-12">
              <Brain className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="oops-title text-lg mb-2">
                Nessuna domanda trovata
              </h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || selectedCategory !== 'all' 
                  ? 'Prova a modificare i filtri di ricerca.'
                  : 'Le domande di trading AI appariranno qui.'
                }
              </p>
              {isAdmin && (
                <Button 
                  onClick={() => navigate('/admin')}
                  className="oops-button-primary"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Vai al Pannello Admin
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {/* Footer OOPS Tech */}
        <div className="mt-12 text-center text-sm text-gray-500 space-y-2">
          <p>© 2025 OOPS Tech - L'intelligenza artificiale che ridefinisce l'investimento</p>
          <p>Torino, Italia | <a href="https://www.oopstech.it" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">www.oopstech.it</a></p>
          <p className="text-xs">
            {isMobile ? '📱 Ottimizzato per Mobile' : '💻 Versione Desktop'} • 
            Storage: {storageStatus} • 
            Domande: {questions.length} • 
            Voti: {Object.keys(votes).length}
          </p>
        </div>
      </main>
    </div>
  )
}

