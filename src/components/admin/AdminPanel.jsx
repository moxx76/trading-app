import { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Brain, Settings, Plus, BarChart3, Users, FileText, TrendingUp, Zap } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { QuestionForm } from './QuestionForm'

export const AdminPanel = () => {
  const { profile, user } = useAuth()
  const navigate = useNavigate()
  const [showQuestionForm, setShowQuestionForm] = useState(false)
  const [questions, setQuestions] = useState([])

  const handleQuestionCreated = (newQuestion) => {
    console.log('✅ Nuova domanda creata:', newQuestion)
    setQuestions(prev => [newQuestion, ...prev])
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header OOPS Tech Admin */}
      <header className="oops-header">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/dashboard')}
                className="mr-4 text-white hover:bg-white/10"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Dashboard
              </Button>
              
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-white/10 rounded-xl">
                  <Brain className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="oops-logo text-white">OOPS Tech</h1>
                  <p className="oops-tagline">Admin Panel</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="oops-badge oops-badge-premium">
                <Settings className="h-3 w-3 mr-1" />
                Administrator
              </div>
              <span className="text-sm text-white/80">
                {profile?.full_name || user?.email}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="oops-hero-title text-2xl text-gray-900 mb-2">
            Gestione Piattaforma Trading AI
          </h2>
          <p className="oops-hero-subtitle text-gray-600">
            Controlla e gestisci l'ecosistema di trading intelligente OOPS Tech
          </p>
        </div>

        {/* Quick Stats OOPS Tech Style */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card className="oops-stats-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">
                Domande Totali
              </CardTitle>
              <FileText className="h-4 w-4 text-white/80" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{questions.length}</div>
              <p className="text-xs text-white/80">
                Tutte le domande create
              </p>
            </CardContent>
          </Card>

          <Card className="oops-stats-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">
                Domande Attive
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-white/80" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{questions.filter(q => q.is_active).length}</div>
              <p className="text-xs text-white/80">
                Domande attualmente pubblicate
              </p>
            </CardContent>
          </Card>

          <Card className="oops-stats-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">
                Voti Totali
              </CardTitle>
              <BarChart3 className="h-4 w-4 text-white/80" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">0</div>
              <p className="text-xs text-white/80">
                Tutti i voti registrati
              </p>
            </CardContent>
          </Card>

          <Card className="oops-stats-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">
                AI Status
              </CardTitle>
              <Brain className="h-4 w-4 text-white/80" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white flex items-center">
                <Zap className="h-5 w-5 mr-1" />
                Live
              </div>
              <p className="text-xs text-white/80">
                Sistema attivo
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Question Form */}
        {showQuestionForm && (
          <div className="mb-8">
            <QuestionForm
              onClose={() => setShowQuestionForm(false)}
              onSuccess={handleQuestionCreated}
            />
          </div>
        )}

        {/* Main Admin Interface */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Gestione Domande */}
          <Card className="oops-card">
            <CardHeader>
              <CardTitle className="oops-title flex items-center">
                <Brain className="h-5 w-5 mr-2 text-blue-600" />
                Gestione Domande
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  Crea e gestisci le domande di trading AI per la community.
                </p>
                <Button 
                  className="w-full oops-button-primary"
                  onClick={() => setShowQuestionForm(true)}
                  disabled={showQuestionForm}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  {showQuestionForm ? 'Form Aperto' : 'Nuova Domanda'}
                </Button>
                <Button variant="outline" className="w-full">
                  <FileText className="h-4 w-4 mr-2" />
                  Gestisci Domande ({questions.length})
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Analytics */}
          <Card className="oops-card">
            <CardHeader>
              <CardTitle className="oops-title flex items-center">
                <BarChart3 className="h-5 w-5 mr-2 text-green-600" />
                Analytics AI
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  Monitora l'attività e le performance della piattaforma.
                </p>
                <Button variant="outline" className="w-full">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Visualizza Analytics
                </Button>
                <Button variant="outline" className="w-full">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Report Avanzati
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Gestione Utenti */}
          <Card className="oops-card">
            <CardHeader>
              <CardTitle className="oops-title flex items-center">
                <Users className="h-5 w-5 mr-2 text-purple-600" />
                Utenti
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  Amministra gli utenti della community OOPS Tech.
                </p>
                <Button variant="outline" className="w-full">
                  <Users className="h-4 w-4 mr-2" />
                  Lista Utenti
                </Button>
                <Button variant="outline" className="w-full">
                  <Settings className="h-4 w-4 mr-2" />
                  Impostazioni
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Lista Domande Create */}
        {questions.length > 0 && (
          <Card className="mt-8 oops-card">
            <CardHeader>
              <CardTitle className="oops-title flex items-center">
                <FileText className="h-5 w-5 mr-2 text-blue-600" />
                Domande Create ({questions.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {questions.map((question, index) => (
                  <div key={question.id || index} className="p-4 border rounded-lg bg-gray-50">
                    <h4 className="font-semibold text-gray-900 mb-2">
                      {question.title}
                    </h4>
                    {question.description && (
                      <p className="text-sm text-gray-600 mb-2">
                        {question.description}
                      </p>
                    )}
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>Categoria: {question.category}</span>
                      <span>Stato: {question.is_active ? '✅ Attiva' : '❌ Inattiva'}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Success Message */}
        <Card className="mt-8 bg-green-50 border-green-200">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="oops-stats-card inline-block">
                <Brain className="h-12 w-12 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2 text-white">
                  🎉 Pannello Admin Funzionante!
                </h3>
                <p className="text-white/80">
                  Benvenuto nel pannello amministrativo OOPS Tech.
                </p>
                <p className="text-white/60 text-sm mt-2">
                  Tutte le funzionalità admin sono ora accessibili.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer OOPS Tech */}
        <div className="mt-12 text-center text-sm text-gray-500 space-y-2">
          <p>© 2025 OOPS Tech - Admin Panel | L'intelligenza artificiale che ridefinisce l'investimento</p>
          <p>Torino, Italia | <a href="https://www.oopstech.it" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">www.oopstech.it</a></p>
        </div>
      </main>
    </div>
  )
}

