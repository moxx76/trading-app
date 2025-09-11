import { useState, useEffect } from 'react'
import { votes } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Calendar,
  CheckCircle,
  Loader2,
  Brain,
  Zap
} from 'lucide-react'

export const QuestionCard = ({ question, onVoteSuccess }) => {
  const { user } = useAuth()
  const [userVote, setUserVote] = useState(null)
  const [voteStats, setVoteStats] = useState({ BUY: 0, SELL: 0 })
  const [isVoting, setIsVoting] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadVoteData()
  }, [question.id, user])

  const loadVoteData = async () => {
    try {
      setLoading(true)
      setError('')

      // Carica statistiche voti
      const { data: stats, error: statsError } = await votes.getVoteStats(question.id)
      if (statsError) throw statsError
      setVoteStats(stats || { BUY: 0, SELL: 0 })

      // Carica voto utente se autenticato
      if (user) {
        const { data: userVoteData, error: userVoteError } = await votes.getUserVote(question.id)
        if (userVoteError && userVoteError.code !== 'PGRST116') { // Ignora errore "not found"
          throw userVoteError
        }
        setUserVote(userVoteData?.vote_type || null)
      }
    } catch (err) {
      setError(err.message || 'Errore nel caricamento dei dati')
    } finally {
      setLoading(false)
    }
  }

  const handleVote = async (voteType) => {
    if (!user) {
      setError('Devi essere autenticato per votare')
      return
    }

    try {
      setIsVoting(true)
      setError('')

      const { error: voteError } = await votes.castVote(question.id, voteType)
      if (voteError) throw voteError

      // Ricarica i dati dopo il voto
      await loadVoteData()
      onVoteSuccess?.()
    } catch (err) {
      setError(err.message || 'Errore durante il voto')
    } finally {
      setIsVoting(false)
    }
  }

  const totalVotes = voteStats.BUY + voteStats.SELL
  const buyPercentage = totalVotes > 0 ? (voteStats.BUY / totalVotes * 100) : 0
  const sellPercentage = totalVotes > 0 ? (voteStats.SELL / totalVotes * 100) : 0

  const formatDate = (dateString) => {
    if (!dateString) return null
    const date = new Date(dateString)
    const now = new Date()
    const isExpired = date < now
    
    return {
      formatted: date.toLocaleDateString('it-IT', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      isExpired
    }
  }

  const expiryInfo = question.expires_at ? formatDate(question.expires_at) : null
  const isExpired = expiryInfo?.isExpired || false

  if (loading) {
    return (
      <Card className="oops-card">
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin mr-2 text-blue-600" />
          <span className="text-muted-foreground">Caricamento...</span>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="oops-card oops-animate-slide-up">
      <CardHeader className="pb-4">
        <div className="flex flex-wrap gap-2 mb-3">
          <Badge variant="outline" className="oops-badge">
            {question.category}
          </Badge>
          
          <Badge variant="outline" className="oops-badge oops-badge-premium">
            <Brain className="h-3 w-3 mr-1" />
            AI Analysis
          </Badge>
          
          {expiryInfo && (
            <Badge variant={isExpired ? "destructive" : "secondary"} className="text-xs">
              <Calendar className="h-3 w-3 mr-1" />
              {isExpired ? 'Scaduta' : `Scade ${expiryInfo.formatted}`}
            </Badge>
          )}
          
          {userVote && (
            <Badge variant="default" className={`text-xs ${userVote === 'BUY' ? 'oops-badge-success' : 'oops-badge-danger'}`}>
              <CheckCircle className="h-3 w-3 mr-1" />
              Hai votato {userVote}
            </Badge>
          )}
        </div>
        
        <CardTitle className="oops-title text-lg leading-tight">
          {question.title}
        </CardTitle>
        
        {question.description && (
          <CardDescription className="oops-body text-sm leading-relaxed">
            {question.description}
          </CardDescription>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Statistiche voti con design OOPS Tech */}
        <div className="space-y-4">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center text-muted-foreground">
              <Users className="h-4 w-4 mr-1" />
              <span>{totalVotes} voti totali</span>
            </div>
            <div className="flex items-center text-blue-600">
              <Zap className="h-3 w-3 mr-1" />
              <span className="text-xs font-medium">Live</span>
            </div>
          </div>

          {/* Progress bar OOPS Tech style */}
          {totalVotes > 0 && (
            <div className="space-y-3">
              <div className="flex justify-between text-sm font-medium">
                <span className="text-green-600 flex items-center">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  BUY {voteStats.BUY} ({buyPercentage.toFixed(1)}%)
                </span>
                <span className="text-red-600 flex items-center">
                  <TrendingDown className="h-4 w-4 mr-1" />
                  SELL {voteStats.SELL} ({sellPercentage.toFixed(1)}%)
                </span>
              </div>
              
              <div className="oops-progress-container">
                <div className="flex h-full">
                  <div 
                    className="oops-progress-buy" 
                    style={{ width: `${buyPercentage}%` }}
                  />
                  <div 
                    className="oops-progress-sell" 
                    style={{ width: `${sellPercentage}%` }}
                  />
                </div>
              </div>
              
              {/* Sentiment indicator */}
              <div className="text-center">
                <Badge className={`${buyPercentage > 50 ? 'oops-badge-success' : buyPercentage < 50 ? 'oops-badge-danger' : 'oops-badge'}`}>
                  Sentiment: {buyPercentage > 50 ? 'Bullish' : buyPercentage < 50 ? 'Bearish' : 'Neutrale'}
                </Badge>
              </div>
            </div>
          )}
        </div>

        {/* Bottoni di voto OOPS Tech style */}
        {!isExpired && user && (
          <div className="grid grid-cols-2 gap-4 pt-4">
            <Button
              onClick={() => handleVote('BUY')}
              disabled={isVoting}
              className={`oops-button-buy ${userVote === 'BUY' ? 'ring-2 ring-green-300' : ''}`}
            >
              {isVoting && userVote !== 'BUY' ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <TrendingUp className="h-4 w-4 mr-2" />
              )}
              BUY
            </Button>
            
            <Button
              onClick={() => handleVote('SELL')}
              disabled={isVoting}
              className={`oops-button-sell ${userVote === 'SELL' ? 'ring-2 ring-red-300' : ''}`}
            >
              {isVoting && userVote !== 'SELL' ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <TrendingDown className="h-4 w-4 mr-2" />
              )}
              SELL
            </Button>
          </div>
        )}

        {/* Messaggio per utenti non autenticati */}
        {!user && (
          <div className="text-center py-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-100">
            <Brain className="h-6 w-6 mx-auto mb-2 text-blue-600" />
            <p className="text-sm text-blue-800 font-medium">
              Accedi per votare e accedere alle analisi AI
            </p>
          </div>
        )}

        {/* Messaggio per domande scadute */}
        {isExpired && (
          <div className="text-center py-4 bg-gray-50 rounded-lg border border-gray-200">
            <Calendar className="h-6 w-6 mx-auto mb-2 text-gray-400" />
            <p className="text-sm text-gray-600">
              Questa domanda è scaduta e non accetta più voti
            </p>
          </div>
        )}

        {/* Footer con branding OOPS Tech */}
        <div className="pt-2 border-t border-gray-100">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>Powered by OOPS Tech AI</span>
            <span className="flex items-center">
              <Zap className="h-3 w-3 mr-1" />
              Real-time
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

