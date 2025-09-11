import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { tradingQuestions } from '../lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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
  TrendingUp as TrendingUpIcon
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { QuestionCard } from './trading/QuestionCard'

export const Dashboard = () => {
  const { user, profile, signOut, isAdmin } = useAuth()
  const navigate = useNavigate()
  const [questions, setQuestions] = useState([])
  const [filteredQuestions, setFilteredQuestions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    loadQuestions()
  }, [])

  useEffect(() => {
    filterQuestions()
  }, [questions, searchTerm, selectedCategory])

  const loadQuestions = async () => {
    try {
      setLoading(true)
      setError('')
      
      const { data, error: questionsError } = await tradingQuestions.getActiveQuestions()
      
      if (questionsError) {
        throw questionsError
      }

      setQuestions(data || [])
    } catch (err) {
      setError(err.message || 'Errore nel caricamento delle domande')
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await loadQuestions()
    setRefreshing(false)
  }

  const filterQuestions = () => {
    let filtered = questions

    // Filtro per categoria
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(q => q.category === selectedCategory)
    }

    // Filtro per ricerca
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(q => 
        q.title.toLowerCase().includes(term) ||
        q.description?.toLowerCase().includes(term) ||
        q.category.toLowerCase().includes(term)
      )
    }

    setFilteredQuestions(filtered)
  }

const handleSignOut = () => {
  if (confirm('Sei sicuro di voler uscire da OOPS Tech?')) {
    // Pulizia completa e redirect forzato
    localStorage.clear()
    sessionStorage.clear()
    window.location.href = '/?logout=true'
  }
}



  const getUniqueCategories = () => {
    const categories = [...new Set(questions.map(q => q.category))]
    return categories.sort()
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
              <div className="text-sm opacity-90">Domande Attive</div>
            </div>
            <div className="oops-stats-card">
              <Brain className="h-6 w-6 mx-auto mb-2" />
              <div className="text-2xl font-bold">AI</div>
              <div className="text-sm opacity-90">Powered</div>
            </div>
            <div className="oops-stats-card">
              <Zap className="h-6 w-6 mx-auto mb-2" />
              <div className="text-2xl font-bold">24/7</div>
              <div className="text-sm opacity-90">Attivo</div>
            </div>
            <div className="oops-stats-card">
              <User className="h-6 w-6 mx-auto mb-2" />
              <div className="text-2xl font-bold">Live</div>
              <div className="text-sm opacity-90">Community</div>
            </div>
          </div>
        </div>

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
                    <SelectItem value="all">Tutte le categorie</SelectItem>
                    {getUniqueCategories().map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
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

        {/* Error Display */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-muted-foreground">Caricamento domande...</p>
          </div>
        )}

        {/* Questions List */}
        {!loading && (
          <>
            {filteredQuestions.length === 0 ? (
              <Card className="oops-card">
                <CardContent className="text-center py-12">
                  <Brain className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="oops-title text-lg mb-2">
                    {questions.length === 0 
                      ? 'Nessuna domanda disponibile' 
                      : 'Nessuna domanda trovata'
                    }
                  </h3>
                  <p className="text-muted-foreground">
                    {questions.length === 0 
                      ? 'Le domande di trading AI appariranno qui quando saranno create dagli amministratori.'
                      : 'Prova a modificare i filtri di ricerca per trovare altre domande.'
                    }
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <p className="text-sm text-muted-foreground">
                    {filteredQuestions.length} domanda{filteredQuestions.length !== 1 ? 'e' : ''} trovata{filteredQuestions.length !== 1 ? 'e' : ''}
                  </p>
                  <div className="oops-badge oops-badge-premium">
                    <Brain className="h-3 w-3" />
                    AI Powered
                  </div>
                </div>
                
                <div className="grid gap-6">
                  {filteredQuestions.map((question) => (
                    <QuestionCard
                      key={question.id}
                      question={question}
                      onVoteSuccess={handleRefresh}
                    />
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* Footer OOPS Tech */}
        <div className="mt-12 text-center text-sm text-gray-500 space-y-2">
          <p>© 2025 OOPS Tech - L'intelligenza artificiale che ridefinisce l'investimento</p>
          <p>Torino, Italia | <a href="https://www.oopstech.it" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">www.oopstech.it</a></p>
        </div>
      </main>
    </div>
  )
}

