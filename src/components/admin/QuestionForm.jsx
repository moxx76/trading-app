import { useState } from 'react'
import { tradingQuestions } from '../../lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Loader2, Plus, Edit } from 'lucide-react'

export const QuestionForm = ({ question = null, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    title: question?.title || '',
    description: question?.description || '',
    category: question?.category || '',
    is_active: question?.is_active ?? true,
    expires_at: question?.expires_at ? new Date(question.expires_at).toISOString().slice(0, 16) : ''
  })
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const isEditing = !!question

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const validateForm = () => {
    if (!formData.title.trim()) {
      return 'Il titolo è obbligatorio'
    }
    if (!formData.description.trim()) {
      return 'La descrizione è obbligatoria'
    }
    if (!formData.category.trim()) {
      return 'La categoria è obbligatoria'
    }
    return null
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    const validationError = validateForm()
    if (validationError) {
      setError(validationError)
      setIsLoading(false)
      return
    }

    try {
      const questionData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        category: formData.category.trim(),
        is_active: formData.is_active,
        expires_at: formData.expires_at || null
      }

      let result
      if (isEditing) {
        result = await tradingQuestions.updateQuestion(question.id, questionData)
      } else {
        result = await tradingQuestions.createQuestion(questionData)
      }

      if (result.error) {
        throw result.error
      }

      onSuccess?.(result.data)
    } catch (err) {
      setError(err.message || `Errore durante ${isEditing ? 'l\'aggiornamento' : 'la creazione'} della domanda`)
    } finally {
      setIsLoading(false)
    }
  }

  const categories = [
    'Azioni',
    'Forex',
    'Criptovalute',
    'Commodities',
    'Indici',
    'Obbligazioni',
    'ETF',
    'Altro'
  ]

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center">
          {isEditing ? (
            <>
              <Edit className="h-5 w-5 mr-2" />
              Modifica Domanda
            </>
          ) : (
            <>
              <Plus className="h-5 w-5 mr-2" />
              Nuova Domanda Trading
            </>
          )}
        </CardTitle>
        <CardDescription>
          {isEditing 
            ? 'Modifica i dettagli della domanda di trading'
            : 'Crea una nuova domanda per la community di trading'
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="title">Titolo della Domanda *</Label>
            <Input
              id="title"
              type="text"
              placeholder="Es: Bitcoin raggiungerà i $100,000 entro fine anno?"
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              disabled={isLoading}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrizione</Label>
            <Textarea
              id="description"
              placeholder="Fornisci maggiori dettagli sulla domanda, contesto di mercato, fattori da considerare..."
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              disabled={isLoading}
              rows={4}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Categoria *</Label>
            <Select 
              value={formData.category} 
              onValueChange={(value) => handleChange('category', value)}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleziona una categoria" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="expires_at">Data di Scadenza (Opzionale)</Label>
            <Input
              id="expires_at"
              type="datetime-local"
              value={formData.expires_at}
              onChange={(e) => handleChange('expires_at', e.target.value)}
              disabled={isLoading}
            />
            <p className="text-xs text-muted-foreground">
              Se non specificata, la domanda rimarrà attiva indefinitamente
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="is_active"
              checked={formData.is_active}
              onCheckedChange={(checked) => handleChange('is_active', checked)}
              disabled={isLoading}
            />
            <Label htmlFor="is_active">Domanda attiva</Label>
          </div>

          <div className="flex space-x-2 pt-4">
            <Button 
              type="submit" 
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isEditing ? 'Aggiornando...' : 'Creando...'}
                </>
              ) : (
                isEditing ? 'Aggiorna Domanda' : 'Crea Domanda'
              )}
            </Button>
            
            {onCancel && (
              <Button 
                type="button" 
                variant="outline" 
                onClick={onCancel}
                disabled={isLoading}
              >
                Annulla
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

