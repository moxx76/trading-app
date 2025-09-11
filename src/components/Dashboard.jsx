import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { tradingQuestions } from '../lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  TrendingUp, 
  LogOut, 
  User, 
  Settings, 
  Search,
  Filter,
  RefreshCw,
  Loader2
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

  const handleSignOut = async () => {
    await signOut()
  }

  const getUniqueCategories = () => {
    const categories = [...new Set(questions.map(q => q.category))]
    return categories.sort()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-primary mr-3" />
              <h1 className="text-xl font-bold text-gray-900">Trading WebApp</h1>
            </div>
            
            <div className="flex items-center space-x-2 sm:space-x-4">
              <span className="hidden sm:block text-sm text-gray-600">
                Ciao, {profile?.full_name || user?.email}
              </span>
              
              {isAdmin && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/admin')}
                  className="hidden sm:flex"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Admin
                </Button>
              )}
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/profile')}
              >
                <User className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Profilo</span>
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleSignOut}
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
        {/* Welcome Section */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Dashboard Trading
          </h2>
          <p className="text-gray-600">
            Vota sulle domande di trading e scopri cosa pensa la community
          </p>
        </div>

        {/* Filters and Search */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Cerca domande..."
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
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Caricamento domande...</p>
          </div>
        )}

        {/* Questions List */}
        {!loading && (
          <>
            {filteredQuestions.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <TrendingUp className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    {questions.length === 0 
                      ? 'Nessuna domanda disponibile' 
                      : 'Nessuna domanda trovata'
                    }
                  </h3>
                  <p className="text-muted-foreground">
                    {questions.length === 0 
                      ? 'Le domande di trading appariranno qui quando saranno create dagli amministratori.'
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

        {/* Quick Stats for Mobile */}
        {!loading && questions.length > 0 && (
          <Card className="mt-8 sm:hidden">
            <CardHeader>
              <CardTitle className="text-lg">Statistiche Rapide</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-primary">
                    {questions.length}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Domande Totali
                  </p>
                </div>
                <div>
                  <div className="text-2xl font-bold text-primary">
                    {getUniqueCategories().length}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Categorie
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}

