import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ArrowLeft, User, Mail, Calendar, Shield, Loader2, History } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { VoteHistory } from './user/VoteHistory'

export const UserProfile = () => {
  const { user, profile, updateProfile, isAdmin } = useAuth()
  const navigate = useNavigate()
  const [isEditing, setIsEditing] = useState(false)
  const [fullName, setFullName] = useState(profile?.full_name || '')
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const handleSave = async () => {
    setIsLoading(true)
    setMessage('')
    setError('')

    const { error: updateError } = await updateProfile({
      full_name: fullName
    })

    if (updateError) {
      setError('Errore nell\'aggiornamento del profilo')
    } else {
      setMessage('Profilo aggiornato con successo!')
      setIsEditing(false)
    }

    setIsLoading(false)
  }

  const handleCancel = () => {
    setFullName(profile?.full_name || '')
    setIsEditing(false)
    setError('')
    setMessage('')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/')}
                className="mr-4"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Torna alla Dashboard
              </Button>
              <h1 className="text-xl font-bold text-gray-900">Profilo Utente</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="profile">Profilo</TabsTrigger>
            <TabsTrigger value="history">Storico Voti</TabsTrigger>
          </TabsList>

          {/* Tab Profilo */}
          <TabsContent value="profile">
            <div className="grid gap-6 lg:grid-cols-3">
              {/* Informazioni Profilo */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <User className="h-5 w-5 mr-2" />
                      Informazioni Profilo
                    </CardTitle>
                    <CardDescription>
                      Gestisci le tue informazioni personali
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {message && (
                      <Alert>
                        <AlertDescription>{message}</AlertDescription>
                      </Alert>
                    )}
                    
                    {error && (
                      <Alert variant="destructive">
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="email"
                          type="email"
                          value={user?.email || ''}
                          className="pl-10"
                          disabled
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        L'email non può essere modificata
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="fullName">Nome Completo</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="fullName"
                          type="text"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          className="pl-10"
                          disabled={!isEditing}
                        />
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      {!isEditing ? (
                        <Button onClick={() => setIsEditing(true)}>
                          Modifica Profilo
                        </Button>
                      ) : (
                        <>
                          <Button 
                            onClick={handleSave} 
                            disabled={isLoading}
                          >
                            {isLoading ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Salvando...
                              </>
                            ) : (
                              'Salva'
                            )}
                          </Button>
                          <Button 
                            variant="outline" 
                            onClick={handleCancel}
                            disabled={isLoading}
                          >
                            Annulla
                          </Button>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Informazioni Account */}
              <div>
                <Card>
                  <CardHeader>
                    <CardTitle>Informazioni Account</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Registrato il</p>
                        <p className="text-xs text-muted-foreground">
                          {profile?.created_at ? 
                            new Date(profile.created_at).toLocaleDateString('it-IT') : 
                            'N/A'
                          }
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Shield className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Ruolo</p>
                        <p className="text-xs text-muted-foreground">
                          {isAdmin ? 'Amministratore' : 'Utente'}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Tab Storico Voti */}
          <TabsContent value="history">
            <VoteHistory />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}

