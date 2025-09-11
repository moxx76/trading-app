# Guida Setup Supabase per Trading WebApp

## 1. Creazione Progetto Supabase

1. Vai su [supabase.com](https://supabase.com) e crea un account
2. Clicca su "New Project"
3. Scegli un nome per il progetto (es. "trading-webapp")
4. Imposta una password sicura per il database
5. Seleziona la regione più vicina ai tuoi utenti
6. Clicca "Create new project"

## 2. Configurazione Database

1. Una volta creato il progetto, vai nella sezione "SQL Editor"
2. Copia e incolla tutto il contenuto del file `database_schema.sql`
3. Esegui lo script cliccando "Run"
4. Verifica che tutte le tabelle siano state create correttamente nella sezione "Table Editor"

## 3. Configurazione Autenticazione

1. Vai nella sezione "Authentication" > "Settings"
2. Abilita "Enable email confirmations" se desideri conferma email
3. Configura i provider di autenticazione desiderati (Email/Password è già abilitato)
4. Personalizza i template email se necessario

## 4. Configurazione Variabili d'Ambiente

1. Nella dashboard Supabase, vai su "Settings" > "API"
2. Copia l'URL del progetto e la chiave "anon public"
3. Nel progetto React, copia `.env.example` in `.env`:
   ```bash
   cp .env.example .env
   ```
4. Modifica il file `.env` inserendo i tuoi valori:
   ```
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```

## 5. Test Configurazione

1. Avvia il server di sviluppo:
   ```bash
   pnpm run dev
   ```
2. Apri la console del browser e verifica che non ci siano errori di connessione
3. Testa la registrazione di un nuovo utente
4. Verifica che il profilo utente venga creato automaticamente nella tabella `users`

## 6. Creazione Utente Admin

Per creare il primo utente amministratore:

1. Registra un utente normale tramite l'interfaccia
2. Vai nella sezione "Table Editor" > "users"
3. Trova l'utente appena creato e modifica il campo `role` da "user" a "admin"
4. Salva le modifiche

Oppure, esegui questa query SQL nell'editor (sostituendo l'email):

```sql
UPDATE public.users 
SET role = 'admin' 
WHERE email = 'tuo-email@example.com';
```

## 7. Configurazione Row Level Security (RLS)

Le policy RLS sono già configurate nello schema. Verifica che siano attive:

1. Vai in "Authentication" > "Policies"
2. Dovresti vedere le policy per ogni tabella
3. Se necessario, puoi modificarle o aggiungerne di nuove

## 8. Backup e Sicurezza

1. Configura backup automatici in "Settings" > "Database"
2. Monitora l'utilizzo in "Settings" > "Usage"
3. Configura alerting se necessario
4. Mantieni aggiornate le dipendenze del progetto

## 9. Variabili d'Ambiente per Produzione

Per il deployment in produzione, assicurati di:

1. Configurare le variabili d'ambiente nel servizio di hosting
2. Non committare mai il file `.env` nel repository
3. Utilizzare HTTPS per tutte le comunicazioni
4. Configurare CORS appropriatamente se necessario

## 10. Troubleshooting

### Errore di connessione
- Verifica che URL e chiave siano corretti
- Controlla che il progetto Supabase sia attivo
- Verifica la connessione internet

### Errori di autenticazione
- Controlla le policy RLS
- Verifica che l'utente sia confermato (se richiesto)
- Controlla i log in Supabase Dashboard

### Errori di database
- Verifica che lo schema sia stato applicato correttamente
- Controlla i log SQL nell'editor
- Verifica i permessi delle tabelle

## Struttura Database

### Tabelle Principali

- **users**: Profili utenti estesi
- **trading_questions**: Domande di trading create dagli admin
- **votes**: Voti BUY/SELL degli utenti

### Relazioni

- Un utente può creare molte domande (se admin)
- Un utente può votare una volta per domanda
- Una domanda può avere molti voti

### Indici e Performance

Gli indici sono già configurati per ottimizzare:
- Ricerca domande attive
- Aggregazione voti per domanda
- Storico voti utente
- Query di statistiche

