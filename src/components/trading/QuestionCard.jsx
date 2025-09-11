import { useState, useEffect } from 'react'
import { votes } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Calendar,
  CheckCircle,
  Loader2
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
      <Card className="w-full">
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          <span className="text-muted-foreground">Caricamento...</span>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="pb-4">
        <div className="flex flex-wrap gap-2 mb-3">
          <Badge variant="outline">{question.category}</Badge>
          {expiryInfo && (
            <Badge variant={isExpired ? "destructive" : "secondary"} className="text-xs">
              <Calendar className="h-3 w-3 mr-1" />
              {isExpired ? 'Scaduta' : `Scade ${expiryInfo.formatted}`}
            </Badge>
          )}
          {userVote && (
            <Badge variant="default" className="text-xs">
              <CheckCircle className="h-3 w-3 mr-1" />
              Hai votato {userVote}
            </Badge>
          )}
        </div>
        
        <CardTitle className="text-lg leading-tight">
          {question.title}
        </CardTitle>
        
        {question.description && (
          <CardDescription className="text-sm leading-relaxed">
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

        {/* Statistiche voti */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center text-muted-foreground">
              <Users className="h-4 w-4 mr-1" />
              <span>{totalVotes} voti totali</span>
            </div>
          </div>

          {/* Progress bar visiva */}
          {totalVotes > 0 && (
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-green-600 font-medium">
                  BUY {voteStats.BUY} ({buyPercentage.toFixed(1)}%)
                </span>
                <span className="text-red-600 font-medium">
                  SELL {voteStats.SELL} ({sellPercentage.toFixed(1)}%)
                </span>
              </div>
              <div className="flex h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="bg-green-500 transition-all duration-300" 
                  style={{ width: `${buyPercentage}%` }}
                />
                <div 
                  className="bg-red-500 transition-all duration-300" 
                  style={{ width: `${sellPercentage}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Bottoni di voto */}
        {!isExpired && user && (
          <div className="grid grid-cols-2 gap-3 pt-2">
            <Button
              onClick={() => handleVote('BUY')}
              disabled={isVoting}
              variant={userVote === 'BUY' ? 'default' : 'outline'}
              className={`flex-1 ${
                userVote === 'BUY' 
                  ? 'bg-green-600 hover:bg-green-700 text-white' 
                  : 'border-green-600 text-green-600 hover:bg-green-50'
              }`}
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
              variant={userVote === 'SELL' ? 'default' : 'outline'}
              className={`flex-1 ${
                userVote === 'SELL' 
                  ? 'bg-red-600 hover:bg-red-700 text-white' 
                  : 'border-red-600 text-red-600 hover:bg-red-50'
              }`}
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
          <div className="text-center py-2">
            <p className="text-sm text-muted-foreground">
              Accedi per votare su questa domanda
            </p>
          </div>
        )}

        {/* Messaggio per domande scadute */}
        {isExpired && (
          <div className="text-center py-2">
            <p className="text-sm text-muted-foreground">
              Questa domanda è scaduta e non accetta più voti
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

