import { useState, useEffect } from 'react'
import { tradingQuestions, votes } from '../../lib/supabase'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts'
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  FileText,
  BarChart3,
  Loader2
} from 'lucide-react'

export const VoteAnalytics = () => {
  const [analytics, setAnalytics] = useState({
    totalQuestions: 0,
    totalVotes: 0,
    buyVotes: 0,
    sellVotes: 0,
    questionStats: [],
    categoryStats: [],
    recentActivity: []
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadAnalytics()
  }, [])

  const loadAnalytics = async () => {
    try {
      setLoading(true)
      setError('')

      // Carica tutte le domande
      const { data: questions, error: questionsError } = await tradingQuestions.getActiveQuestions()
      if (questionsError) throw questionsError

      if (!questions || questions.length === 0) {
        setAnalytics({
          totalQuestions: 0,
          totalVotes: 0,
          buyVotes: 0,
          sellVotes: 0,
          questionStats: [],
          categoryStats: [],
          recentActivity: []
        })
        return
      }

      // Calcola statistiche per ogni domanda
      const questionStats = []
      const categoryMap = new Map()
      let totalBuyVotes = 0
      let totalSellVotes = 0

      for (const question of questions) {
        const { data: voteStats } = await votes.getVoteStats(question.id)
        const stats = voteStats || { BUY: 0, SELL: 0 }
        
        const totalVotes = stats.BUY + stats.SELL
        const buyPercentage = totalVotes > 0 ? (stats.BUY / totalVotes * 100) : 0

        questionStats.push({
          id: question.id,
          title: question.title.length > 30 ? question.title.substring(0, 30) + '...' : question.title,
          category: question.category,
          buyVotes: stats.BUY,
          sellVotes: stats.SELL,
          totalVotes,
          buyPercentage: Math.round(buyPercentage),
          sellPercentage: Math.round(100 - buyPercentage)
        })

        // Aggrega per categoria
        if (!categoryMap.has(question.category)) {
          categoryMap.set(question.category, { BUY: 0, SELL: 0, questions: 0 })
        }
        const categoryData = categoryMap.get(question.category)
        categoryData.BUY += stats.BUY
        categoryData.SELL += stats.SELL
        categoryData.questions += 1

        totalBuyVotes += stats.BUY
        totalSellVotes += stats.SELL
      }

      // Converti mappa categorie in array
      const categoryStats = Array.from(categoryMap.entries()).map(([category, data]) => ({
        category,
        buyVotes: data.BUY,
        sellVotes: data.SELL,
        totalVotes: data.BUY + data.SELL,
        questions: data.questions
      })).sort((a, b) => b.totalVotes - a.totalVotes)

      // Ordina domande per numero di voti
      questionStats.sort((a, b) => b.totalVotes - a.totalVotes)

      setAnalytics({
        totalQuestions: questions.length,
        totalVotes: totalBuyVotes + totalSellVotes,
        buyVotes: totalBuyVotes,
        sellVotes: totalSellVotes,
        questionStats: questionStats.slice(0, 10), // Top 10
        categoryStats,
        recentActivity: questionStats.slice(0, 5) // Ultime 5 per attività recente
      })

    } catch (err) {
      setError(err.message || 'Errore nel caricamento delle analytics')
    } finally {
      setLoading(false)
    }
  }

  const COLORS = ['#10b981', '#ef4444', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899']

  if (loading) {
    return (
      <div className="text-center py-12">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
        <p className="text-muted-foreground">Caricamento analytics...</p>
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  const buyPercentage = analytics.totalVotes > 0 
    ? Math.round((analytics.buyVotes / analytics.totalVotes) * 100) 
    : 0

  return (
    <div className="space-y-6">
      {/* Statistiche Generali */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Domande Totali</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalQuestions}</div>
            <p className="text-xs text-muted-foreground">
              Domande pubblicate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Voti Totali</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalVotes}</div>
            <p className="text-xs text-muted-foreground">
              Voti registrati
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Voti BUY</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{analytics.buyVotes}</div>
            <p className="text-xs text-muted-foreground">
              {buyPercentage}% del totale
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Voti SELL</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{analytics.sellVotes}</div>
            <p className="text-xs text-muted-foreground">
              {100 - buyPercentage}% del totale
            </p>
          </CardContent>
        </Card>
      </div>

      {analytics.totalVotes === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nessun dato disponibile</h3>
            <p className="text-muted-foreground">
              Le analytics appariranno qui quando gli utenti inizieranno a votare.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Grafico Domande più Votate */}
          <Card>
            <CardHeader>
              <CardTitle>Domande più Votate</CardTitle>
              <CardDescription>
                Top 10 domande per numero di voti ricevuti
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={analytics.questionStats}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="title" 
                    angle={-45}
                    textAnchor="end"
                    height={100}
                    fontSize={12}
                  />
                  <YAxis />
                  <Tooltip 
                    formatter={(value, name) => [value, name === 'buyVotes' ? 'Voti BUY' : 'Voti SELL']}
                    labelFormatter={(label) => `Domanda: ${label}`}
                  />
                  <Bar dataKey="buyVotes" fill="#10b981" name="BUY" />
                  <Bar dataKey="sellVotes" fill="#ef4444" name="SELL" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Statistiche per Categoria */}
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Voti per Categoria</CardTitle>
                <CardDescription>
                  Distribuzione dei voti nelle diverse categorie
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analytics.categoryStats}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="category" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="buyVotes" fill="#10b981" name="BUY" />
                    <Bar dataKey="sellVotes" fill="#ef4444" name="SELL" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Sentiment Generale</CardTitle>
                <CardDescription>
                  Distribuzione complessiva BUY vs SELL
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <div className="w-4 h-4 bg-green-500 rounded mr-2"></div>
                      <span className="text-sm">BUY</span>
                    </div>
                    <span className="font-semibold">{analytics.buyVotes} ({buyPercentage}%)</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <div className="w-4 h-4 bg-red-500 rounded mr-2"></div>
                      <span className="text-sm">SELL</span>
                    </div>
                    <span className="font-semibold">{analytics.sellVotes} ({100 - buyPercentage}%)</span>
                  </div>

                  <div className="mt-4">
                    <div className="flex h-4 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="bg-green-500" 
                        style={{ width: `${buyPercentage}%` }}
                      />
                      <div 
                        className="bg-red-500" 
                        style={{ width: `${100 - buyPercentage}%` }}
                      />
                    </div>
                  </div>

                  <div className="text-center mt-4">
                    <Badge variant={buyPercentage > 50 ? "default" : "destructive"}>
                      Sentiment: {buyPercentage > 50 ? 'Bullish' : buyPercentage < 50 ? 'Bearish' : 'Neutrale'}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tabella Categorie */}
          <Card>
            <CardHeader>
              <CardTitle>Statistiche per Categoria</CardTitle>
              <CardDescription>
                Dettaglio completo delle performance per categoria
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">Categoria</th>
                      <th className="text-center py-2">Domande</th>
                      <th className="text-center py-2">Voti Totali</th>
                      <th className="text-center py-2">BUY</th>
                      <th className="text-center py-2">SELL</th>
                      <th className="text-center py-2">Sentiment</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analytics.categoryStats.map((category, index) => {
                      const categoryBuyPercentage = category.totalVotes > 0 
                        ? Math.round((category.buyVotes / category.totalVotes) * 100) 
                        : 0
                      
                      return (
                        <tr key={index} className="border-b">
                          <td className="py-2 font-medium">{category.category}</td>
                          <td className="text-center py-2">{category.questions}</td>
                          <td className="text-center py-2">{category.totalVotes}</td>
                          <td className="text-center py-2 text-green-600">{category.buyVotes}</td>
                          <td className="text-center py-2 text-red-600">{category.sellVotes}</td>
                          <td className="text-center py-2">
                            <Badge 
                              variant={categoryBuyPercentage > 50 ? "default" : "destructive"}
                              className="text-xs"
                            >
                              {categoryBuyPercentage}% BUY
                            </Badge>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}

