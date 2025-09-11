# Trading WebApp

Una piattaforma web mobile-first per il trading collaborativo dove gli utenti possono votare BUY o SELL su domande di trading create dagli amministratori.

## 🚀 Caratteristiche Principali

### Per gli Utenti
- **Autenticazione Sicura**: Registrazione e login con Supabase Auth
- **Interfaccia Mobile-First**: Design ottimizzato per dispositivi mobili
- **Voto BUY/SELL**: Sistema di voto intuitivo per ogni domanda di trading
- **Statistiche in Tempo Reale**: Visualizzazione immediata dei risultati dei voti
- **Storico Personale**: Tracciamento completo dei propri voti e statistiche
- **Filtri e Ricerca**: Ricerca avanzata per categoria e parole chiave

### Per gli Amministratori
- **Pannello Admin Completo**: Gestione completa delle domande di trading
- **CRUD Domande**: Creazione, modifica ed eliminazione delle domande
- **Analytics Avanzate**: Grafici e statistiche dettagliate con Recharts
- **Gestione Categorie**: Organizzazione delle domande per categoria
- **Dashboard Statistiche**: Monitoraggio dell'attività della piattaforma

## 🛠️ Stack Tecnologico

### Frontend
- **React 19** - Framework JavaScript moderno
- **Vite** - Build tool veloce e moderno
- **Tailwind CSS** - Framework CSS utility-first
- **shadcn/ui** - Componenti UI professionali
- **Lucide React** - Libreria di icone
- **Recharts** - Libreria per grafici e visualizzazioni
- **React Router** - Routing lato client

### Backend
- **Supabase** - Backend-as-a-Service
- **PostgreSQL** - Database relazionale
- **Row Level Security (RLS)** - Sicurezza a livello di riga
- **Supabase Auth** - Sistema di autenticazione

### Deployment
- **Frontend**: Deployment statico
- **Database**: Supabase Cloud

## 📱 Design e UX

### Mobile-First
- Design responsive ottimizzato per mobile
- Touch-friendly interface
- Navigazione semplificata per schermi piccoli
- Performance ottimizzata per connessioni lente

### Accessibilità
- Supporto per screen reader
- Contrasti colori ottimizzati
- Navigazione da tastiera
- Testi alternativi per immagini

## 🏗️ Architettura

### Database Schema
```sql
-- Tabella utenti (estende auth.users di Supabase)
users (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE,
  full_name TEXT,
  role TEXT DEFAULT 'user',
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)

-- Tabella domande trading
trading_questions (
  id UUID PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  created_by UUID REFERENCES users(id),
  is_active BOOLEAN DEFAULT true,
  expires_at TIMESTAMP,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)

-- Tabella voti
votes (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  question_id UUID REFERENCES trading_questions(id),
  vote_type TEXT CHECK (vote_type IN ('BUY', 'SELL')),
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  UNIQUE(user_id, question_id)
)
```

### Componenti Principali
- **AuthContext**: Gestione stato autenticazione
- **ProtectedRoute**: Protezione route autenticate
- **QuestionCard**: Card per visualizzazione domande
- **VoteAnalytics**: Componente analytics con grafici
- **AdminPanel**: Pannello amministrativo completo

## 🚀 Setup e Installazione

### Prerequisiti
- Node.js 18+ 
- npm o pnpm
- Account Supabase

### 1. Clone del Repository
```bash
git clone <repository-url>
cd trading-webapp
```

### 2. Installazione Dipendenze
```bash
pnpm install
```

### 3. Configurazione Supabase
1. Crea un nuovo progetto su [supabase.com](https://supabase.com)
2. Esegui lo script SQL in `database_schema.sql`
3. Copia le credenziali del progetto

### 4. Configurazione Ambiente
```bash
cp .env.example .env
```

Modifica il file `.env`:
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 5. Avvio Sviluppo
```bash
pnpm run dev
```

L'applicazione sarà disponibile su `http://localhost:5173`

## 📖 Guida Utilizzo

### Per Utenti Normali

1. **Registrazione/Login**
   - Accedi alla piattaforma
   - Registra un nuovo account o effettua il login
   - Conferma l'email se richiesto

2. **Votazione**
   - Visualizza le domande di trading attive
   - Leggi titolo e descrizione
   - Vota BUY o SELL
   - Visualizza i risultati in tempo reale

3. **Profilo e Storico**
   - Accedi al tuo profilo
   - Visualizza lo storico dei tuoi voti
   - Controlla le tue statistiche personali

### Per Amministratori

1. **Accesso Admin**
   - Effettua il login con account admin
   - Accedi al pannello amministrativo

2. **Gestione Domande**
   - Crea nuove domande di trading
   - Modifica domande esistenti
   - Attiva/disattiva domande
   - Imposta date di scadenza

3. **Analytics**
   - Visualizza statistiche generali
   - Analizza i dati per categoria
   - Monitora l'attività degli utenti

## 🔒 Sicurezza

### Row Level Security (RLS)
- Gli utenti possono vedere solo i propri dati
- Solo gli admin possono gestire le domande
- I voti sono protetti da modifiche non autorizzate

### Autenticazione
- Password sicure con hash bcrypt
- Sessioni gestite da Supabase Auth
- Protezione CSRF integrata

### Validazione
- Validazione input lato client e server
- Sanitizzazione dati utente
- Prevenzione SQL injection

## 📊 Analytics e Metriche

### Dati Tracciati
- Numero totale voti per domanda
- Distribuzione BUY vs SELL
- Attività utenti nel tempo
- Performance per categoria
- Tasso di partecipazione

### Visualizzazioni
- Grafici a barre per confronto domande
- Statistiche in tempo reale
- Dashboard amministrativa
- Storico personale utenti

## 🚀 Deployment

### Preparazione
1. Build dell'applicazione:
```bash
pnpm run build
```

2. Test del build:
```bash
pnpm run preview
```

### Deployment Frontend
L'applicazione può essere deployata su:
- Vercel
- Netlify
- GitHub Pages
- Qualsiasi servizio di hosting statico

### Configurazione Produzione
- Configura le variabili d'ambiente nel servizio di hosting
- Assicurati che Supabase sia configurato per produzione
- Configura CORS se necessario

## 🧪 Testing

### Test Funzionali
- [x] Registrazione e login utenti
- [x] Creazione e gestione domande (admin)
- [x] Sistema di voto BUY/SELL
- [x] Visualizzazione statistiche
- [x] Responsive design

### Test di Sicurezza
- [x] Protezione route admin
- [x] Validazione input
- [x] Row Level Security
- [x] Prevenzione voti multipli

## 🤝 Contribuire

1. Fork del repository
2. Crea un branch per la feature (`git checkout -b feature/AmazingFeature`)
3. Commit delle modifiche (`git commit -m 'Add some AmazingFeature'`)
4. Push del branch (`git push origin feature/AmazingFeature`)
5. Apri una Pull Request

## 📝 Licenza

Questo progetto è rilasciato sotto licenza MIT. Vedi il file `LICENSE` per i dettagli.

## 🆘 Supporto

Per supporto e domande:
- Apri un issue su GitHub
- Consulta la documentazione Supabase
- Controlla i log dell'applicazione

## 🔄 Roadmap Future

### Versione 2.0
- [ ] Notifiche push
- [ ] Chat in tempo reale
- [ ] API mobile native
- [ ] Integrazione social media
- [ ] Sistema di reputazione utenti
- [ ] Analisi sentiment avanzata

### Miglioramenti Tecnici
- [ ] Test automatizzati
- [ ] CI/CD pipeline
- [ ] Monitoring e logging
- [ ] Cache Redis
- [ ] Ottimizzazioni performance

---

**Trading WebApp** - La piattaforma per le decisioni di trading collaborative 📈

