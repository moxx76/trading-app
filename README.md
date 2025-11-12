# OOPS Tech - Trading WebApp

**L'intelligenza artificiale che ridefinisce l'investimento**

Una piattaforma web mobile-first per il trading collaborativo dove gli utenti possono votare BUY o SELL su domande di trading create dagli amministratori. Powered by OOPS Tech AI.

## 🧠 Il futuro non si prevede. Si crea.

Benvenuto nell'era dell'intelligenza finanziaria potenziata. Non è solo tecnologia - è una rivoluzione nel modo di pensare il trading. La nostra intelligenza artificiale non si limita ad analizzare il presente, plasma attivamente il domani degli investimenti.

## 🚀 Caratteristiche Principali

### Per gli Utenti
- **Autenticazione Sicura**: Registrazione e login con Supabase Auth
- **Interfaccia Mobile-First**: Design ottimizzato per dispositivi mobili
- **Voto BUY/SELL**: Sistema di voto intuitivo per ogni domanda di trading
- **AI-Powered Analytics**: Statistiche in tempo reale potenziate dall'IA
- **Storico Personale**: Tracciamento completo dei propri voti e statistiche
- **Filtri Intelligenti**: Ricerca avanzata per categoria e parole chiave

### Per gli Amministratori
- **Pannello Admin Completo**: Gestione completa delle domande di trading
- **CRUD Domande**: Creazione, modifica ed eliminazione delle domande
- **Analytics Avanzate**: Grafici e statistiche dettagliate con Recharts
- **Gestione Categorie**: Organizzazione delle domande per categoria
- **Dashboard AI**: Monitoraggio dell'attività della piattaforma con insights IA

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

### Design System
- **OOPS Tech Brand Colors** - Palette colori personalizzata
- **Inter Font Family** - Typography moderna e leggibile
- **Mobile-First Approach** - Design ottimizzato per mobile
- **AI-Inspired UI** - Elementi di design ispirati all'intelligenza artificiale

## 🎨 Branding OOPS Tech

### Colori Principali
- **Nero elegante**: #1a1a1a (colore principale)
- **Bianco/Grigio chiaro**: #f8f9fa (sfondo)
- **Blu tecnologico**: #007bff (accenti)
- **Verde**: #28a745 (per BUY)
- **Rosso**: #dc3545 (per SELL)

### Elementi Distintivi
- Logo OOPS Tech con icona Brain (cervello)
- Tagline: "IA per Trading"
- Messaging: "L'intelligenza artificiale che ridefinisce l'investimento"
- Gradients e animazioni moderne
- Badges "AI Powered" e "Live"

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
- **QuestionCard**: Card per visualizzazione domande con stili OOPS Tech
- **VoteAnalytics**: Componente analytics con grafici AI-powered
- **AdminPanel**: Pannello amministrativo completo con branding

## 🚀 Setup e Installazione

### Prerequisiti
- Node.js 18+ 
- npm o pnpm
- Account Supabase

### 1. Clone del Repository
```bash
git clone <repository-url>
cd oops-trading-webapp
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
   - Accedi alla piattaforma OOPS Tech
   - Registra un nuovo account o effettua il login
   - Conferma l'email se richiesto

2. **Votazione AI-Powered**
   - Visualizza le domande di trading attive
   - Leggi titolo, descrizione e analisi AI
   - Vota BUY o SELL
   - Visualizza i risultati e sentiment in tempo reale

3. **Profilo e Storico**
   - Accedi al tuo profilo
   - Visualizza lo storico dei tuoi voti
   - Controlla le tue statistiche personali e insights AI

### Per Amministratori

1. **Accesso Admin**
   - Effettua il login con account admin
   - Accedi al pannello amministrativo OOPS Tech

2. **Gestione Domande**
   - Crea nuove domande di trading AI-powered
   - Modifica domande esistenti
   - Attiva/disattiva domande
   - Imposta date di scadenza

3. **Analytics AI**
   - Visualizza statistiche generali
   - Analizza i dati per categoria
   - Monitora l'attività degli utenti con insights IA

## 🔒 Sicurezza

### Row Level Security (RLS)
- Gli utenti possono vedere solo i propri dati
- Solo gli admin possono gestire le domande
- I voti sono protetti da modifiche non autorizzate

### Autenticazione
- Password sicure con hash bcrypt
- Sessioni gestite da Supabase Auth
- Protezione CSRF integrata

## 📊 Analytics e Metriche AI

### Dati Tracciati
- Numero totale voti per domanda
- Distribuzione BUY vs SELL
- Sentiment analysis in tempo reale
- Performance per categoria
- Tasso di partecipazione

### Visualizzazioni AI-Powered
- Grafici a barre per confronto domande
- Statistiche in tempo reale
- Dashboard amministrativa con insights IA
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

### Deployment su Vercel (Raccomandato)
1. Connetti il repository GitHub a Vercel
2. Configura le variabili d'ambiente
3. Deploy automatico

### Configurazione Produzione
- Configura le variabili d'ambiente nel servizio di hosting
- Assicurati che Supabase sia configurato per produzione
- Aggiorna Site URL in Supabase con il dominio finale

## 🧪 Testing

### Test Funzionali
- [x] Registrazione e login utenti
- [x] Creazione e gestione domande (admin)
- [x] Sistema di voto BUY/SELL
- [x] Visualizzazione statistiche AI
- [x] Responsive design mobile-first

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
- Visita [www.oopstech.it](https://www.oopstech.it)
- Apri un issue su GitHub
- Consulta la documentazione Supabase

## 📊 Indicatore MetaTrader 5 - DAX ZigZag Strategy

### 🎯 Descrizione

Questo repository include anche un **indicatore avanzato per MetaTrader 5** che implementa la strategia DAX ZigZag 0.3%.

L'indicatore automatizza:
- ✅ Rilevamento pattern 1-2-3 (LONG/SHORT)
- ✅ Calcolo automatico Entry, Stop Loss e Target
- ✅ Visualizzazione grafica completa con zone rischio/profitto
- ✅ Sistema alert multi-canale (popup, suono, push, email)
- ✅ Statistiche e tracking in tempo reale
- ✅ Export CSV per analisi performance

### 📥 File MT5

I file dell'indicatore si trovano nella cartella [`mt5-indicators/`](./mt5-indicators/):

- **`DAX_ZigZag_Strategy.mq5`** - Indicatore principale MQL5
- **`README_INDICATOR.md`** - Documentazione completa (Italian)
- **`GUIDA_RAPIDA.md`** - Guida installazione rapida

### 🚀 Installazione Rapida

1. Copia `DAX_ZigZag_Strategy.mq5` in `MQL5\Indicators\`
2. Compila con MetaEditor (F7)
3. Applica al grafico DAX M10

**Documentazione completa**: [mt5-indicators/README_INDICATOR.md](./mt5-indicators/README_INDICATOR.md)

### 🎯 Caratteristiche MT5 Indicator

- **ZigZag 0.3%** per filtrare il rumore di mercato
- **Target fisso 40 punti** configurabile
- **Rischio massimo 150 punti** con filtri automatici
- **3 modalità entry**: tocco, consolidato, migliorato
- **Pannello informativo** con statistiche live
- **Zone semi-trasparenti** per visualizzare rischio/profitto
- **Export CSV** per backtesting esterno

### ⚠️ Disclaimer Trading

⚠️ **Attenzione**: Il trading comporta rischio di perdita capitale.
- L'indicatore è uno strumento di analisi, non un consiglio finanziario
- Testa sempre su account demo prima di operare con denaro reale
- Usa stop loss e money management appropriati
- I risultati passati non garantiscono performance future

## 🔄 Roadmap Future

### Versione 2.0
- [ ] Notifiche push AI-powered
- [ ] Chat in tempo reale con bot IA
- [ ] API mobile native
- [ ] Integrazione social media
- [ ] Sistema di reputazione utenti basato su IA
- [ ] Analisi sentiment avanzata con ML

### Miglioramenti Tecnici
- [ ] Test automatizzati
- [ ] CI/CD pipeline
- [ ] Monitoring e logging avanzato
- [ ] Cache Redis per performance
- [ ] Ottimizzazioni AI/ML

---

**OOPS Tech Trading WebApp** - L'intelligenza artificiale che ridefinisce l'investimento 🧠📈

*Torino, Italia - Nel cuore dell'innovazione fintech*

