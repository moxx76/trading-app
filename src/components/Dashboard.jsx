import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Brain, 
  LogOut, 
  Settings, 
  Search, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  RefreshCw,
  AlertCircle,
  CheckCircle
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

  // Carica dati demo
  const loadData = () => {
    try {
      const savedQuestions = localStorage.getItem('oops_questions')
      const savedVotes = localStorage.getItem('oops_votes')
      
      if (savedQuestions) {
        const parsedQuestions = JSON.parse(savedQuestions)
        setQuestions(parsedQuestions)
        console.log('✅ Domande caricate:', parsedQuestions.length)
      } else {
        // Domande demo
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
        localStorage.setItem('oops_questions', JSON.stringify(demoQuestions))
      }
      
      if (savedVotes) {
        setVotes(JSON.parse(savedVotes))
      }
      
    } catch (error) {
      console.error('❌ Errore caricamento:', error)
      setQuestions([])
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  // Filtraggio domande
  useEffect(() => {
    let filtered = questions

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(q => q.category === selectedCategory)
    }

    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase()
      filtered = filtered.filter(q => 
        q.title.toLowerCase().includes(search) ||
        (q.description && q.description.toLowerCase().includes(search))
      )
    }

    setFilteredQuestions(filtered)
  }, [questions, selectedCategory, searchTerm])

  const handleVote = (questionId, voteType) => {
    const userVoteKey = `${user?.id}_${questionId}`
    const currentVote = votes[userVoteKey]

    const newVotes = { ...votes }
    
    if (currentVote === voteType) {
      delete newVotes[userVoteKey]
    } else {
      newVotes[userVoteKey] = voteType
    }
    
    setVotes(newVotes)
    
    // Aggiorna contatori
    setQuestions(prevQuestions => 
      prevQuestions.map(q => {
        if (q.id === questionId) {
          let newBuyVotes = q.buy_votes || 0
          let newSellVotes = q.sell_votes || 0
          
          if (currentVote === 'buy') newBuyVotes--
          if (currentVote === 'sell') newSellVotes--
          
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
    
    localStorage.setItem('oops_votes', JSON.stringify(newVotes))
    console.log(`🗳️ Voto ${voteType.toUpperCase()} per ${questionId}`)
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header Compatto */}
      <header className="bg-gradient-to-r from-gray-900 to-blue-900 text-white shadow-lg">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-14">
            {/* Logo */}
            <div className="flex items-center">
              <Brain className="h-7 w-7 mr-2 text-blue-400" />
              <div>
                <h1 className="text-lg font-bold">OOPS Tech</h1>
                <p className="text-xs text-blue-200">IA per Trading</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-2">
              {isAdmin && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/admin')}
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                >
                  <Settings className="h-4 w-4 sm:mr-1" />
                  <span className="hidden sm:inline">Admin</span>
                </Button>
              )}
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/profile')}
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                <Users className="h-4 w-4 sm:mr-1" />
                <span className="hidden sm:inline">Profilo</span>
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={handleSignOut}
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                <LogOut className="h-4 w-4 sm:mr-1" />
                <span className="hidden sm:inline">Esci</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        {/* Welcome Compatto */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-1">
            Ciao {user?.email?.split('@')[0]}! 👋
          </h2>
          <p className="text-gray-600 text-sm">
            Vota le tue previsioni di mercato
          </p>
        </div>

        {/* Filtri Compatti */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Cerca domande..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-10"
                />
              </div>
            </div>

            {/* Categories */}
            <div className="flex gap-2 flex-wrap">
              {categories.map((category) => (
                <Button
                  key={category.value}
                  variant={selectedCategory === category.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category.value)}
                  className="whitespace-nowrap h-10"
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
              className="whitespace-nowrap h-10"
            >
              <RefreshCw className={`h-4 w-4 mr-1 ${refreshing ? 'animate-spin' : ''}`} />
              Aggiorna
            </Button>
          </div>
        </div>

        {/* Questions List - FOCUS PRINCIPALE */}
        <div className="space-y-4">
          {filteredQuestions.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <Brain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {searchTerm || selectedCategory !== 'all' ? 'Nessun risultato' : 'Nessuna domanda'}
                </h3>
                <p className="text-gray-600 mb-4">
                  {searchTerm || selectedCategory !== 'all' 
                    ? 'Prova a modificare i filtri di ricerca.'
                    : 'Le domande di trading appariranno qui.'
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
                <Card key={question.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg mb-2 leading-tight">{question.title}</CardTitle>
                        {question.description && (
                          <p className="text-gray-600 text-sm mb-3 leading-relaxed">{question.description}</p>
                        )}
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <Badge variant="outline" className="capitalize">
                            {categories.find(c => c.value === question.category)?.icon} {question.category}
                          </Badge>
                          <span>•</span>
                          <span>{new Date(question.created_at).toLocaleDateString('it-IT')}</span>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pt-0">
                    {/* BOTTONI BUY/SELL - FOCUS PRINCIPALE */}
                    <div className="grid grid-cols-2 gap-6 mb-6">
                      <Button
                        onClick={() => handleVote(question.id, 'buy')}
                        variant={userVote === 'buy' ? 'default' : 'outline'}
                        className={`h-16 text-lg font-semibold transition-all ${
                          userVote === 'buy' 
                            ? 'bg-green-600 hover:bg-green-700 text-white shadow-lg scale-105' 
                            : 'border-2 border-green-600 text-green-600 hover:bg-green-50 hover:border-green-700'
                        }`}
                      >
                        <div className="flex flex-col items-center">
                          <TrendingUp className="h-6 w-6 mb-1" />
                          <span>BUY</span>
                          <span className="text-sm font-normal">({question.buy_votes || 0})</span>
                        </div>
                      </Button>
                      
                      <Button
                        onClick={() => handleVote(question.id, 'sell')}
                        variant={userVote === 'sell' ? 'default' : 'outline'}
                        className={`h-16 text-lg font-semibold transition-all ${
                          userVote === 'sell' 
                            ? 'bg-red-600 hover:bg-red-700 text-white shadow-lg scale-105' 
                            : 'border-2 border-red-600 text-red-600 hover:bg-red-50 hover:border-red-700'
                        }`}
                      >
                        <div className="flex flex-col items-center">
                          <TrendingDown className="h-6 w-6 mb-1" />
                          <span>SELL</span>
                          <span className="text-sm font-normal">({question.sell_votes || 0})</span>
                        </div>
                      </Button>
                    </div>

                    {/* Progress Bar Semplice */}
                    {totalVotes > 0 && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm font-medium">
                          <span className="text-green-600">BUY {buyPercentage.toFixed(0)}%</span>
                          <span className="text-gray-500">{totalVotes} voti</span>
                          <span className="text-red-600">SELL {sellPercentage.toFixed(0)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                          <div className="h-full flex">
                            <div 
                              className="bg-green-500 transition-all duration-700"
                              style={{ width: `${buyPercentage}%` }}
                            ></div>
                            <div 
                              className="bg-red-500 transition-all duration-700"
                              style={{ width: `${sellPercentage}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Status Voto */}
                    {userVote && (
                      <div className="mt-4 text-center">
                        <Badge 
                          variant="outline" 
                          className={`${
                            userVote === 'buy' 
                              ? 'border-green-500 text-green-700 bg-green-50' 
                              : 'border-red-500 text-red-700 bg-red-50'
                          } px-3 py-1`}
                        >
                          ✓ Hai votato {userVote.toUpperCase()}
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

      {/* Footer Minimo */}
      <footer className="bg-gray-900 text-white py-4 mt-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row items-center justify-between text-sm">
            <div className="flex items-center mb-2 sm:mb-0">
              <Brain className="h-4 w-4 mr-2 text-blue-400" />
              <span className="font-medium">OOPS Tech</span>
              <Badge className="ml-2 bg-blue-600 text-xs">AI Powered</Badge>
            </div>
            <div className="text-gray-400 text-center">
              <a href="https://www.oopstech.it" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">
                www.oopstech.it
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

