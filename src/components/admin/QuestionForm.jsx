import { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Label } from '@/components/ui/label'
import { Brain, Plus, Save, X, Calendar } from 'lucide-react'

export const QuestionForm = ({ onClose, onSuccess }) => {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'crypto',
    expires_at: ''
  })

  const categories = [
    { value: 'crypto', label: 'Cryptocurrency' },
    { value: 'azioni', label: 'Azioni' },
    { value: 'forex', label: 'Forex' },
    { value: 'commodities', label: 'Commodities' },
    { value: 'indici', label: 'Indici' },
    { value: 'generale', label: 'Generale' }
  ]

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.title.trim()) {
      setError('Il titolo è obbligatorio')
      return
    }

    setLoading(true)
    setError('')
    setSuccess('')

    try {
      console.log('🔄 Creazione domanda...')
      console.log('User ID:', user?.id)
      console.log('Form data:', formData)

      // Prepara i dati per l'inserimento
      const questionData = {
        title: formData.title.trim(),
        description: formData.description.trim() || null,
        category: formData.category,
        created_by: user?.id,
        is_active: true,
        expires_at: formData.expires_at ? new Date(formData.expires_at).toISOString() : null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      console.log('📝 Dati da inserire:', questionData)

      // Inserisci la domanda
      const { data, error } = await supabase
        .from('trading_questions')
        .insert([questionData])
        .select()
        .single()

      if (error) {
        console.error('❌ Errore Supabase:', error)
        throw error
      }

      console.log('✅ Domanda creata:', data)
      
      setSuccess('Domanda creata con successo!')
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        category: 'crypto',
        expires_at: ''
      })

      // Notifica il componente padre
      if (onSuccess) {
        onSuccess(data)
      }

      // Chiudi il form dopo 2 secondi
      setTimeout(() => {
        if (onClose) {
          onClose()
        }
      }, 2000)

    } catch (error) {
      console.error('❌ Errore creazione domanda:', error)
      
      let errorMessage = 'Errore durante la creazione della domanda'
      
      if (error.message) {
        errorMessage = error.message
      } else if (error.details) {
        errorMessage = error.details
      } else if (error.hint) {
        errorMessage = error.hint
      }
      
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    setFormData({
      title: '',
      description: '',
      category: 'crypto',
      expires_at: ''
    })
    setError('')
    setSuccess('')
    if (onClose) {
      onClose()
    }
  }

  return (
    <Card className="oops-card">
      <CardHeader>
        <CardTitle className="oops-title flex items-center justify-between">
          <div className="flex items-center">
            <Brain className="h-5 w-5 mr-2 text-blue-600" />
            Crea Nuova Domanda Trading AI
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCancel}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-4 w-4" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Titolo */}
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-medium">
              Titolo della Domanda *
            </Label>
            <Input
              id="title"
              type="text"
              placeholder="Es: Bitcoin raggiungerà $100,000 entro fine 2025?"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              className="w-full"
              maxLength={200}
              required
            />
            <p className="text-xs text-gray-500">
              {formData.title.length}/200 caratteri
            </p>
          </div>

          {/* Descrizione */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium">
              Descrizione (Opzionale)
            </Label>
            <Textarea
              id="description"
              placeholder="Fornisci contesto aggiuntivo per aiutare gli utenti a votare in modo informato..."
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              className="w-full min-h-[100px]"
              maxLength={1000}
            />
            <p className="text-xs text-gray-500">
              {formData.description.length}/1000 caratteri
            </p>
          </div>

          {/* Categoria */}
          <div className="space-y-2">
            <Label htmlFor="category" className="text-sm font-medium">
              Categoria
            </Label>
            <Select
              value={formData.category}
              onValueChange={(value) => handleInputChange('category', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleziona categoria" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Data Scadenza */}
          <div className="space-y-2">
            <Label htmlFor="expires_at" className="text-sm font-medium">
              Data di Scadenza (Opzionale)
            </Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="expires_at"
                type="datetime-local"
                value={formData.expires_at}
                onChange={(e) => handleInputChange('expires_at', e.target.value)}
                className="pl-10"
                min={new Date().toISOString().slice(0, 16)}
              />
            </div>
            <p className="text-xs text-gray-500">
              Se non specificata, la domanda rimarrà attiva indefinitamente
            </p>
          </div>

          {/* Error Display */}
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Success Display */}
          {success && (
            <Alert className="border-green-200 bg-green-50">
              <AlertDescription className="text-green-800">
                {success}
              </AlertDescription>
            </Alert>
          )}

          {/* Debug Info */}
          <div className="bg-gray-50 p-3 rounded text-xs text-gray-600">
            <strong>Debug:</strong><br/>
            User ID: {user?.id}<br/>
            User Email: {user?.email}<br/>
            Form Valid: {formData.title.trim() ? 'YES' : 'NO'}
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              disabled={loading || !formData.title.trim()}
              className="oops-button-primary flex-1"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creazione...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Crea Domanda
                </>
              )}
            </Button>
            
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={loading}
              className="flex-1"
            >
              <X className="h-4 w-4 mr-2" />
              Annulla
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

