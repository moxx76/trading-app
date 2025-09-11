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
  Clock,
  User
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
            description: 'Con l\'adozione istituzionale crescente e l\'halving del 2024, quale sarà la direzione di Bitcoin nei prossimi mesi?',
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
            description: 'L\'intelligenza artificiale continuerà a spingere il titolo NVIDIA verso nuovi massimi storici?',
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
    { value: 'all', label: 'Tutte', icon: '🌐', color: 'bg-gray-100 text-gray-700' },
    { value: 'crypto', label: 'Crypto', icon: '₿', color: 'bg-orange-100 text-orange-700' },
    { value: 'azioni', label: 'Azioni', icon: '📈', color: 'bg-green-100 text-green-700' },
    { value: 'forex', label: 'Forex', icon: '💱', color: 'bg-blue-100 text-blue-700' },
    { value: 'commodities', label: 'Commodities', icon: '🛢️', color: 'bg-yellow-100 text-yellow-700' },
    { value: 'indici', label: 'Indici', icon: '📊', color: 'bg-purple-100 text-purple-700' }
  ]

  const getCategoryInfo = (categoryValue) => {
    return categories.find(c => c.value === categoryValue) || categories[0]
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header Elegante */}
      <header className="bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 text-white shadow-xl border-b border-blue-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
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
              <span>Ciao, {user?.email?.split('@')[0]}</span>
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
                <Users className="h-4 w-4 sm:mr-2" />
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
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Previsioni di Mercato 📊
          </h2>
          <p className="text-lg text-gray-600">
            Vota le tue previsioni e scopri il sentiment del mercato
          </p>
        </div>

        {/* Filtri Eleganti */}
        <div className="mb-8 bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                <Input
                  placeholder="Cerca domande di trading..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 h-12 text-base border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-xl"
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
                  className={`whitespace-nowrap h-12 px-4 rounded-xl font-medium transition-all ${
                    selectedCategory === category.value 
                      ? 'bg-blue-600 text-white shadow-lg hover:bg-blue-700' 
                      : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                  }`}
                >
                  <span className="mr-2 text-base">{category.icon}</span>
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
              className="whitespace-nowrap h-12 px-4 rounded-xl border-gray-200 hover:border-blue-300 hover:bg-blue-50"
            >
              <RefreshCw className={`h-5 w-5 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Aggiorna
            </Button>
          </div>
        </div>

        {/* Questions List - BEN SEPARATE */}
        <div className="space-y-8">
          {filteredQuestions.length === 0 ? (
            <div className="text-center py-16">
              <div className="bg-white rounded-3xl shadow-lg p-12 border border-gray-100 max-w-md mx-auto">
                <div className="bg-gradient-to-r from-blue-400 to-indigo-400 p-4 rounded-full w-20 h-20 mx-auto mb-6">
                  <Brain className="h-12 w-12 text-white mx-auto" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {searchTerm || selectedCategory !== 'all' ? 'Nessun risultato' : 'Nessuna domanda'}
                </h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  {searchTerm || selectedCategory !== 'all' 
                    ? 'Prova a modificare i filtri di ricerca per trovare altre domande.'
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
                    className="rounded-xl"
                  >
                    Rimuovi Filtri
                  </Button>
                )}
              </div>
            </div>
          ) : (
            filteredQuestions.map((question, index) => {
              const userVote = votes[`${user?.id}_${question.id}`]
              const totalVotes = (question.buy_votes || 0) + (question.sell_votes || 0)
              const buyPercentage = totalVotes > 0 ? ((question.buy_votes || 0) / totalVotes) * 100 : 0
              const sellPercentage = totalVotes > 0 ? ((question.sell_votes || 0) / totalVotes) * 100 : 0
              const categoryInfo = getCategoryInfo(question.category)

              return (
                <div key={question.id} className="relative">
                  {/* Separatore visivo tra domande */}
                  {index > 0 && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-transparent via-gray-200 to-transparent rounded-full"></div>
                  )}
                  
                  <Card className="bg-white shadow-xl hover:shadow-2xl transition-all duration-300 border-0 rounded-3xl overflow-hidden">
                    {/* Header della domanda */}
                    <CardHeader className="bg-gradient-to-r from-gray-50 to-blue-50 pb-6 pt-8 px-8">
                      <div className="flex items-start justify-between mb-4">
                        <Badge 
                          className={`${categoryInfo.color} px-4 py-2 rounded-full font-semibold text-sm border-0`}
                        >
                          <span className="mr-2 text-base">{categoryInfo.icon}</span>
                          {categoryInfo.label}
                        </Badge>
                        <div className="flex items-center text-sm text-gray-500">
                          <Clock className="h-4 w-4 mr-1" />
                          {new Date(question.created_at).toLocaleDateString('it-IT', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </div>
                      </div>
                      
                      <CardTitle className="text-2xl font-bold text-gray-900 leading-tight mb-4">
                        {question.title}
                      </CardTitle>
                      
                      {question.description && (
                        <p className="text-gray-700 text-lg leading-relaxed">
                          {question.description}
                        </p>
                      )}
                    </CardHeader>
                    
                    <CardContent className="p-8">
                      {/* BOTTONI BUY/SELL COLORATI E GRANDI */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
                        <Button
                          onClick={() => handleVote(question.id, 'buy')}
                          className={`h-20 text-xl font-bold rounded-2xl transition-all duration-300 transform hover:scale-105 ${
                            userVote === 'buy' 
                              ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-2xl shadow-green-500/50 scale-105' 
                              : 'bg-gradient-to-r from-green-50 to-emerald-50 border-3 border-green-500 text-green-700 hover:from-green-100 hover:to-emerald-100 hover:border-green-600 shadow-lg hover:shadow-green-500/30'
                          }`}
                        >
                          <div className="flex flex-col items-center">
                            <TrendingUp className="h-8 w-8 mb-2" />
                            <span className="text-2xl font-black">BUY</span>
                            <span className="text-sm font-normal opacity-90">
                              {question.buy_votes || 0} voti
                            </span>
                          </div>
                        </Button>
                        
                        <Button
                          onClick={() => handleVote(question.id, 'sell')}
                          className={`h-20 text-xl font-bold rounded-2xl transition-all duration-300 transform hover:scale-105 ${
                            userVote === 'sell' 
                              ? 'bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-2xl shadow-red-500/50 scale-105' 
                              : 'bg-gradient-to-r from-red-50 to-rose-50 border-3 border-red-500 text-red-700 hover:from-red-100 hover:to-rose-100 hover:border-red-600 shadow-lg hover:shadow-red-500/30'
                          }`}
                        >
                          <div className="flex flex-col items-center">
                            <TrendingDown className="h-8 w-8 mb-2" />
                            <span className="text-2xl font-black">SELL</span>
                            <span className="text-sm font-normal opacity-90">
                              {question.sell_votes || 0} voti
                            </span>
                          </div>
                        </Button>
                      </div>

                      {/* Progress Bar Elegante */}
                      {totalVotes > 0 && (
                        <div className="space-y-4">
                          <div className="flex justify-between items-center text-base font-semibold">
                            <div className="flex items-center">
                              <div className="w-4 h-4 bg-green-500 rounded-full mr-2"></div>
                              <span className="text-green-700">BUY {buyPercentage.toFixed(0)}%</span>
                            </div>
                            <div className="bg-gray-100 px-4 py-2 rounded-full">
                              <span className="text-gray-700 font-bold">{totalVotes} voti totali</span>
                            </div>
                            <div className="flex items-center">
                              <span className="text-red-700">SELL {sellPercentage.toFixed(0)}%</span>
                              <div className="w-4 h-4 bg-red-500 rounded-full ml-2"></div>
                            </div>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden shadow-inner">
                            <div className="h-full flex">
                              <div 
                                className="bg-gradient-to-r from-green-400 to-emerald-500 transition-all duration-1000 ease-out"
                                style={{ width: `${buyPercentage}%` }}
                              ></div>
                              <div 
                                className="bg-gradient-to-r from-red-400 to-rose-500 transition-all duration-1000 ease-out"
                                style={{ width: `${sellPercentage}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Status Voto */}
                      {userVote && (
                        <div className="mt-6 text-center">
                          <div className={`inline-flex items-center px-6 py-3 rounded-full font-semibold text-base ${
                            userVote === 'buy' 
                              ? 'bg-green-100 text-green-800 border-2 border-green-200' 
                              : 'bg-red-100 text-red-800 border-2 border-red-200'
                          }`}>
                            <div className={`w-3 h-3 rounded-full mr-3 ${
                              userVote === 'buy' ? 'bg-green-500' : 'bg-red-500'
                            }`}></div>
                            ✓ Hai votato {userVote.toUpperCase()}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              )
            })
          )}
        </div>
      </main>

      {/* Footer Elegante */}
      <footer className="bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 text-white py-8 mt-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between">
            <div className="flex items-center mb-4 sm:mb-0">
              <div className="bg-gradient-to-r from-blue-400 to-indigo-400 p-2 rounded-lg mr-3">
                <Brain className="h-5 w-5 text-white" />
              </div>
              <div>
                <span className="font-bold text-lg">OOPS Tech</span>
                <Badge className="ml-3 bg-blue-600 text-white border-0">AI Powered</Badge>
              </div>
            </div>
            <div className="text-blue-200">
              <a 
                href="https://www.oopstech.it" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-blue-300 hover:text-white transition-colors font-medium"
              >
                www.oopstech.it
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

