# Guida al Deployment - Trading WebApp

Questa guida ti aiuterà a deployare la Trading WebApp in produzione.

## 🚀 Opzioni di Deployment

### 1. Vercel (Raccomandato)

Vercel è la piattaforma ideale per applicazioni React con Vite.

#### Setup Vercel
1. Crea un account su [vercel.com](https://vercel.com)
2. Installa Vercel CLI:
```bash
npm i -g vercel
```

#### Deploy
1. Nella directory del progetto:
```bash
vercel
```

2. Segui le istruzioni:
   - Collega il repository GitHub
   - Configura le variabili d'ambiente
   - Deploy automatico

#### Variabili d'Ambiente Vercel
Nel dashboard Vercel, aggiungi:
```
VITE_SUPABASE_URL=your_production_supabase_url
VITE_SUPABASE_ANON_KEY=your_production_supabase_anon_key
```

### 2. Netlify

#### Setup Netlify
1. Crea un account su [netlify.com](https://netlify.com)
2. Collega il repository GitHub
3. Configura build settings:
   - Build command: `pnpm run build`
   - Publish directory: `dist`

#### Variabili d'Ambiente Netlify
Nel dashboard Netlify > Site settings > Environment variables:
```
VITE_SUPABASE_URL=your_production_supabase_url
VITE_SUPABASE_ANON_KEY=your_production_supabase_anon_key
```

### 3. GitHub Pages

#### Setup GitHub Pages
1. Nel repository GitHub, vai su Settings > Pages
2. Seleziona source: GitHub Actions
3. Crea `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'pnpm'
    
    - name: Install dependencies
      run: pnpm install
    
    - name: Build
      run: pnpm run build
      env:
        VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
        VITE_SUPABASE_ANON_KEY: ${{ secrets.VITE_SUPABASE_ANON_KEY }}
    
    - name: Deploy
      uses: peaceiris/actions-gh-pages@v3
      with:
        github_token: ${{ secrets.GITHUB_TOKEN }}
        publish_dir: ./dist
```

#### Configurazione Secrets GitHub
In GitHub repository > Settings > Secrets and variables > Actions:
```
VITE_SUPABASE_URL=your_production_supabase_url
VITE_SUPABASE_ANON_KEY=your_production_supabase_anon_key
```

## 🗄️ Setup Database Produzione

### 1. Configurazione Supabase Produzione

#### Nuovo Progetto Produzione
1. Crea un nuovo progetto Supabase per produzione
2. Esegui lo script `database_schema.sql`
3. Configura le policy RLS
4. Testa la connessione

#### Configurazione Auth
1. In Authentication > Settings:
   - Configura Site URL con il dominio di produzione
   - Configura Redirect URLs
   - Abilita email confirmations se necessario

#### Configurazione CORS
1. In API > Settings:
   - Aggiungi il dominio di produzione agli allowed origins
   - Configura CORS headers se necessario

### 2. Migrazione Dati (se necessario)

Se hai dati di sviluppo da migrare:

```sql
-- Export da sviluppo
pg_dump "postgresql://..." > backup.sql

-- Import in produzione
psql "postgresql://..." < backup.sql
```

## 🔧 Configurazione Produzione

### 1. Ottimizzazioni Build

#### Vite Config Produzione
Aggiorna `vite.config.js`:

```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu'],
          charts: ['recharts']
        }
      }
    }
  }
})
```

### 2. Variabili d'Ambiente

#### File .env.production
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_production_anon_key
NODE_ENV=production
```

### 3. Sicurezza Produzione

#### Headers di Sicurezza
Configura nel tuo hosting provider:

```
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
```

#### HTTPS
- Assicurati che HTTPS sia abilitato
- Configura redirect automatico da HTTP a HTTPS
- Usa certificati SSL validi

## 📊 Monitoring e Analytics

### 1. Supabase Analytics
- Monitora l'utilizzo del database
- Controlla i log delle query
- Imposta alerting per errori

### 2. Frontend Monitoring
Aggiungi servizi di monitoring come:
- Sentry per error tracking
- Google Analytics per usage analytics
- Vercel Analytics (se usi Vercel)

### 3. Performance Monitoring
- Lighthouse CI per performance
- Web Vitals monitoring
- Database query optimization

## 🔄 CI/CD Pipeline

### GitHub Actions Completa

```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'pnpm'
    
    - name: Install dependencies
      run: pnpm install
    
    - name: Lint
      run: pnpm run lint
    
    - name: Type check
      run: pnpm run type-check
    
    - name: Build
      run: pnpm run build

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
    - uses: actions/checkout@v3
    - name: Deploy to Vercel
      uses: amondnet/vercel-action@v20
      with:
        vercel-token: ${{ secrets.VERCEL_TOKEN }}
        vercel-org-id: ${{ secrets.ORG_ID }}
        vercel-project-id: ${{ secrets.PROJECT_ID }}
        vercel-args: '--prod'
```

## 🚨 Troubleshooting

### Problemi Comuni

#### 1. Errori di Build
```bash
# Pulisci cache e reinstalla
rm -rf node_modules pnpm-lock.yaml
pnpm install
pnpm run build
```

#### 2. Errori Supabase
- Verifica URL e chiavi
- Controlla policy RLS
- Verifica configurazione CORS

#### 3. Errori di Routing
- Configura redirects per SPA
- Verifica configurazione base URL

### Configurazione Redirects

#### Vercel (_redirects)
```
/*    /index.html   200
```

#### Netlify (_redirects)
```
/*    /index.html   200
```

## 📋 Checklist Pre-Deploy

- [ ] Test completi in ambiente di staging
- [ ] Configurazione variabili d'ambiente produzione
- [ ] Setup database produzione
- [ ] Configurazione domini e SSL
- [ ] Test performance e sicurezza
- [ ] Backup database
- [ ] Monitoring e alerting configurati
- [ ] Documentazione aggiornata

## 🔄 Post-Deploy

### 1. Verifica Funzionalità
- [ ] Registrazione e login utenti
- [ ] Creazione domande (admin)
- [ ] Sistema di voto
- [ ] Analytics e statistiche
- [ ] Responsive design

### 2. Performance Check
- [ ] Lighthouse score > 90
- [ ] Tempi di caricamento < 3s
- [ ] Database query ottimizzate

### 3. Monitoring Setup
- [ ] Error tracking attivo
- [ ] Analytics configurate
- [ ] Backup automatici
- [ ] Alerting configurato

---

🎉 **Congratulazioni!** La tua Trading WebApp è ora live in produzione!

