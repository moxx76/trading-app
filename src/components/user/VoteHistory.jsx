import { useState, useEffect } from 'react'
import { votes } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  TrendingUp, 
  TrendingDown, 
  Calendar,
  Loader2,
  History
} from 'lucide-react'

export const VoteHistory = () => {
  const { user } = useAuth()
  const [voteHistory, setVoteHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [stats, setStats] = useState({ total: 0, buy: 0, sell: 0 })

  useEffect(() => {
    if (user) {
      loadVoteHistory()
    }
  }, [user])

  const loadVoteHistory = async () => {
    try {
      setLoading(true)
      setError('')

      const { data, error: historyError } = await votes.getUserVoteHistory()
      
      if (historyError) {
        throw historyError
      }

      setVoteHistory(data || [])
      
      // Calcola statistiche
      const buyCount = data?.filter(vote => vote.vote_type === 'BUY').length || 0
      const sellCount = data?.filter(vote => vote.vote_type === 'SELL').length || 0
      
      setStats({
        total: (data?.length || 0),
        buy: buyCount,
        sell: sellCount
      })

    } catch (err) {
      setError(err.message || 'Errore nel caricamento dello storico voti')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('it-IT', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          <span className="text-muted-foreground">Caricamento storico...</span>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-6">
      {/* Statistiche Personali */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Voti Totali</CardTitle>
            <History className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
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
            <div className="text-2xl font-bold text-green-600">{stats.buy}</div>
            <p className="text-xs text-muted-foreground">
              {stats.total > 0 ? Math.round((stats.buy / stats.total) * 100) : 0}% del totale
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Voti SELL</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.sell}</div>
            <p className="text-xs text-muted-foreground">
              {stats.total > 0 ? Math.round((stats.sell / stats.total) * 100) : 0}% del totale
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Storico Voti */}
      <Card>
        <CardHeader>
          <CardTitle>Storico Voti</CardTitle>
          <CardDescription>
            Cronologia completa dei tuoi voti sulle domande di trading
          </CardDescription>
        </CardHeader>
        <CardContent>
          {voteHistory.length === 0 ? (
            <div className="text-center py-8">
              <History className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nessun voto registrato</h3>
              <p className="text-muted-foreground">
                I tuoi voti appariranno qui quando inizierai a partecipare alle domande di trading.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {voteHistory.map((vote) => (
                <div 
                  key={vote.id} 
                  className="flex items-start justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-1">
                    <h4 className="font-medium text-sm mb-1">
                      {vote.trading_questions?.title || 'Domanda non disponibile'}
                    </h4>
                    {vote.trading_questions?.description && (
                      <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                        {vote.trading_questions.description}
                      </p>
                    )}
                    <div className="flex items-center text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3 mr-1" />
                      {formatDate(vote.created_at)}
                    </div>
                  </div>
                  
                  <div className="ml-4 flex flex-col items-end">
                    <Badge 
                      variant={vote.vote_type === 'BUY' ? 'default' : 'destructive'}
                      className={`mb-2 ${
                        vote.vote_type === 'BUY' 
                          ? 'bg-green-600 hover:bg-green-700' 
                          : 'bg-red-600 hover:bg-red-700'
                      }`}
                    >
                      {vote.vote_type === 'BUY' ? (
                        <TrendingUp className="h-3 w-3 mr-1" />
                      ) : (
                        <TrendingDown className="h-3 w-3 mr-1" />
                      )}
                      {vote.vote_type}
                    </Badge>
                    
                    {vote.updated_at !== vote.created_at && (
                      <span className="text-xs text-muted-foreground">
                        Aggiornato: {formatDate(vote.updated_at)}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Insight Personali */}
      {stats.total > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>I Tuoi Insight</CardTitle>
            <CardDescription>
              Analisi del tuo comportamento di voto
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Tendenza BUY vs SELL</span>
                  <span className="font-medium">
                    {stats.buy > stats.sell ? 'Più Bullish' : stats.sell > stats.buy ? 'Più Bearish' : 'Equilibrato'}
                  </span>
                </div>
                <div className="flex h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="bg-green-500" 
                    style={{ width: `${(stats.buy / stats.total) * 100}%` }}
                  />
                  <div 
                    className="bg-red-500" 
                    style={{ width: `${(stats.sell / stats.total) * 100}%` }}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="text-lg font-bold text-green-600">
                    {Math.round((stats.buy / stats.total) * 100)}%
                  </div>
                  <p className="text-xs text-muted-foreground">Voti BUY</p>
                </div>
                <div>
                  <div className="text-lg font-bold text-red-600">
                    {Math.round((stats.sell / stats.total) * 100)}%
                  </div>
                  <p className="text-xs text-muted-foreground">Voti SELL</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

