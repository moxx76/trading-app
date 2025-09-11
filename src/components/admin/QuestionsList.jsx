import { useState, useEffect } from 'react'
import { tradingQuestions, votes } from '../../lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { 
  Edit, 
  Trash2, 
  MoreVertical, 
  Eye, 
  EyeOff, 
  Calendar,
  TrendingUp,
  TrendingDown,
  Users
} from 'lucide-react'

export const QuestionsList = ({ onEdit, onRefresh }) => {
  const [questions, setQuestions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [deleteDialog, setDeleteDialog] = useState({ open: false, question: null })
  const [questionStats, setQuestionStats] = useState({})

  useEffect(() => {
    loadQuestions()
  }, [onRefresh])

  const loadQuestions = async () => {
    try {
      setLoading(true)
      setError('')
      
      const { data, error: questionsError } = await tradingQuestions.getActiveQuestions()
      
      if (questionsError) {
        throw questionsError
      }

      setQuestions(data || [])
      
      // Carica statistiche per ogni domanda
      if (data && data.length > 0) {
        const stats = {}
        for (const question of data) {
          const { data: voteStats } = await votes.getVoteStats(question.id)
          stats[question.id] = voteStats || { BUY: 0, SELL: 0 }
        }
        setQuestionStats(stats)
      }
    } catch (err) {
      setError(err.message || 'Errore nel caricamento delle domande')
    } finally {
      setLoading(false)
    }
  }

  const handleToggleActive = async (question) => {
    try {
      const { error } = await tradingQuestions.updateQuestion(question.id, {
        is_active: !question.is_active
      })
      
      if (error) throw error
      
      await loadQuestions()
    } catch (err) {
      setError(err.message || 'Errore nell\'aggiornamento della domanda')
    }
  }

  const handleDelete = async () => {
    if (!deleteDialog.question) return
    
    try {
      const { error } = await tradingQuestions.deleteQuestion(deleteDialog.question.id)
      
      if (error) throw error
      
      setDeleteDialog({ open: false, question: null })
      await loadQuestions()
    } catch (err) {
      setError(err.message || 'Errore nell\'eliminazione della domanda')
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'Nessuna scadenza'
    return new Date(dateString).toLocaleDateString('it-IT', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getTotalVotes = (questionId) => {
    const stats = questionStats[questionId] || { BUY: 0, SELL: 0 }
    return stats.BUY + stats.SELL
  }

  if (loading) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Caricamento domande...</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {questions.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground">
              Nessuna domanda trovata. Crea la prima domanda di trading!
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {questions.map((question) => {
            const stats = questionStats[question.id] || { BUY: 0, SELL: 0 }
            const totalVotes = getTotalVotes(question.id)
            const buyPercentage = totalVotes > 0 ? (stats.BUY / totalVotes * 100).toFixed(1) : 0
            const sellPercentage = totalVotes > 0 ? (stats.SELL / totalVotes * 100).toFixed(1) : 0

            return (
              <Card key={question.id} className="relative">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-2">
                        {question.title}
                      </CardTitle>
                      <CardDescription className="text-sm">
                        {question.description}
                      </CardDescription>
                    </div>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onEdit?.(question)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Modifica
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleToggleActive(question)}>
                          {question.is_active ? (
                            <>
                              <EyeOff className="h-4 w-4 mr-2" />
                              Disattiva
                            </>
                          ) : (
                            <>
                              <Eye className="h-4 w-4 mr-2" />
                              Attiva
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => setDeleteDialog({ open: true, question })}
                          className="text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Elimina
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <div className="flex flex-wrap gap-2 mb-4">
                    <Badge variant={question.is_active ? "default" : "secondary"}>
                      {question.is_active ? 'Attiva' : 'Inattiva'}
                    </Badge>
                    <Badge variant="outline">
                      {question.category}
                    </Badge>
                    {question.expires_at && (
                      <Badge variant="outline" className="text-xs">
                        <Calendar className="h-3 w-3 mr-1" />
                        {formatDate(question.expires_at)}
                      </Badge>
                    )}
                  </div>

                  {/* Statistiche voti */}
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-1">
                        <Users className="h-4 w-4 mr-1 text-muted-foreground" />
                        <span className="font-medium">{totalVotes}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">Voti Totali</p>
                    </div>
                    
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-1">
                        <TrendingUp className="h-4 w-4 mr-1 text-green-600" />
                        <span className="font-medium text-green-600">
                          {stats.BUY} ({buyPercentage}%)
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">BUY</p>
                    </div>
                    
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-1">
                        <TrendingDown className="h-4 w-4 mr-1 text-red-600" />
                        <span className="font-medium text-red-600">
                          {stats.SELL} ({sellPercentage}%)
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">SELL</p>
                    </div>
                  </div>

                  {/* Barra di progresso visiva */}
                  {totalVotes > 0 && (
                    <div className="mt-3">
                      <div className="flex h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="bg-green-500" 
                          style={{ width: `${buyPercentage}%` }}
                        />
                        <div 
                          className="bg-red-500" 
                          style={{ width: `${sellPercentage}%` }}
                        />
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Dialog di conferma eliminazione */}
      <AlertDialog open={deleteDialog.open} onOpenChange={(open) => 
        setDeleteDialog({ open, question: deleteDialog.question })
      }>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Conferma Eliminazione</AlertDialogTitle>
            <AlertDialogDescription>
              Sei sicuro di voler eliminare la domanda "{deleteDialog.question?.title}"?
              Questa azione non può essere annullata e tutti i voti associati verranno persi.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annulla</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Elimina
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

