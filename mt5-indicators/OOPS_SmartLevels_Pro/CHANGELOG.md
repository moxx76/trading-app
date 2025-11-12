# Changelog

Tutti i cambiamenti notevoli a questo progetto saranno documentati in questo file.

Il formato è basato su [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
e questo progetto aderisce al [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.0] - 2024-11-12

### 🎉 Release Iniziale

#### ✨ Funzionalità Aggiunte

##### Volume Profile Z-Score Engine
- Implementato motore di analisi volume profile con calcolo statistico Z-Score
- Identificazione automatica HVN (High Volume Nodes) con soglia Z > 2.0
- Identificazione automatica LVN (Low Volume Nodes) con soglia Z < -1.0
- Analisi su 500 candele con 100 bin di prezzo
- Sistema di caching per ottimizzazione performance
- Aggiornamento intelligente ogni 10 candele

##### Price Rejection Analyzer
- Algoritmo di identificazione swing high/low
- Analisi wick ratio per determinare forza rejection
- Conteggio automatico touch su livelli chiave
- Filtro minimo 3 touch con tolleranza 10 punti
- Score di forza basato su frequenza e wick ratio

##### Market Bias Indicator
- Calcolo bias direzionale multi-fattoriale
- Integrazione momentum prezzi con Z-Score
- Volume-weighted bias con ratio fast/slow
- Output real-time: BULLISH / BEARISH / NEUTRAL
- Score quantitativo da -3.0 a +3.0

##### Session-Aware Weighting
- Riconoscimento automatico sessioni ASIA / EUROPA / US
- Peso differenziato per sessione (Europa 1.0x per FDAX)
- Filtro livelli per sessione corrente
- Indicatore visuale sessione attiva
- Timezone GMT management

##### Dynamic Range Analyzer
- Analisi statistica espansione/compressione range
- Z-Score su 50 periodi
- Identificazione EXPANSION (Z > 1.5)
- Identificazione COMPRESSION (Z < -1.0)
- Alert su potenziali breakout

##### Smart Alerts System
- Alert "Approaching Level" (distanza < 15 punti)
- Alert "Breakout Confirmed" (con volume alto)
- Alert "Strong Rejection" (wick > 60%)
- Alert "Compression Warning" (durata > 10 candele)
- Sistema anti-spam con cooldown 60 secondi
- Supporto push notifications e email

##### Pannello Informativo
- Visualizzazione real-time market status
- Lista livelli chiave ordinati per forza (3 sopra + 3 sotto)
- Generazione automatica "Next Trade Setup"
- Calcolo entry zone, stop loss, take profit
- Risk/Reward ratio e probabilità stimata
- Timestamp e info sessione

##### Sistema di Visualizzazione
- Linee orizzontali con colori differenziati:
  - Rosso: Resistenze
  - Verde: Supporti
  - Arancione: Rejection zones
  - Giallo: Weak zones
- Label informativi con Z-Score, volume, touch count
- Spessore linee proporzionale alla forza
- Trasparenza configurabile
- Design professionale e chiaro

##### Performance & Ottimizzazione
- Calcolo ottimizzato con dirty flags
- Cache volume profile con refresh configurabile
- Opzione calcolo solo su bar close
- 3 livelli di ottimizzazione CPU
- Buffer management efficiente
- Limite oggetti grafici per performance

##### Parametri Configurabili
- 50+ parametri input personalizzabili
- Organizzazione in gruppi logici
- Valori default ottimizzati per FDAX
- Tooltip descrittivi per ogni parametro
- Validazione input

##### Filtri Avanzati
- Min_Level_Strength per filtrare livelli deboli
- Min_Distance_Between_Levels anti-cluster
- Filter_By_Session per focus sessione corrente
- Recency_Factor per decadimento temporale
- Sistema di prioritizzazione multi-fattoriale

#### 🎨 Design & UX
- Pannello con font monospaced leggibile
- Emoji per identificazione rapida stati
- Schema colori professionale
- Layout responsive
- Separatori visivi chiari

#### 📊 Compatibilità
- MetaTrader 5 build ≥ 3280
- Windows 10/11
- Wine compatibility (Linux/Mac)
- Timeframe: M1, M5, M15 (ottimale)
- Strumenti: FDAX, DAX40, altri futures

#### 📚 Documentazione
- README.md completo con guide dettagliate
- 4 strategie di trading documentate
- Sezione troubleshooting
- Best practices e suggerimenti
- Esempi di utilizzo

#### 🔒 Sicurezza & Stabilità
- Error handling su dati mancanti
- Validazione array bounds
- Memory management ottimizzato
- Cleanup oggetti su deinit
- No memory leaks

---

## [Unreleased]

### 🚀 Funzionalità in Sviluppo

#### Pianificate per v1.1.0
- [ ] Backtesting mode con statistiche storiche
- [ ] Export dati livelli in CSV
- [ ] Multi-timeframe analysis (mostra livelli da TF superiori)
- [ ] Machine learning per probability scoring
- [ ] Heatmap volume profile 2D
- [ ] Integrazione con Telegram bot

#### Pianificate per v1.2.0
- [ ] Support per criptovalute (BTC, ETH)
- [ ] Profili stagionali (day of week analysis)
- [ ] Correlation con altri mercati
- [ ] News filter integration
- [ ] Risk management calculator

#### Pianificate per v2.0.0
- [ ] Auto-trading module (Expert Advisor)
- [ ] Portfolio management
- [ ] Advanced statistics dashboard
- [ ] Cloud sync settings
- [ ] Mobile companion app

---

## 🐛 Bug Fixes

### v1.0.0
N/A (release iniziale)

---

## 📝 Note Tecniche

### Breaking Changes
- v1.0.0: Prima release, no breaking changes

### Deprecations
- Nessuna

### Known Issues
- Panel position potrebbe sovrapporsi a candele su schermi piccoli (workaround: disabilita pannello o modifica coordinate X/Y nel codice)
- Unicode emoji potrebbero non renderizzare su alcuni terminali MT5 vecchi (impatto: solo estetico)
- Calcolo intensivo su timeframe M1 con 500+ candele potrebbe causare lag su PC datati (workaround: ridurre VP_Lookback_Bars o aumentare CPU_Optimization_Level)

---

## 🎯 Roadmap

### Q1 2025
- Release v1.1.0 con backtesting mode
- Video tutorial serie completa
- Community forum launch

### Q2 2025
- Release v1.2.0 con crypto support
- Partnerships con broker
- Webinar mensili

### Q3-Q4 2025
- Release v2.0.0 con auto-trading
- Mobile app iOS/Android
- Certificazione MQL5 Market

---

## 📞 Contatti

Per segnalare bug o richiedere funzionalità:
- Email: support@oopstrading.com
- GitHub: https://github.com/oopstrading/smartlevels-pro/issues
- Discord: https://discord.gg/oopstrading

---

## 🙏 Ringraziamenti

Grazie alla community di trader che hanno contribuito con feedback durante lo sviluppo:
- Beta testers gruppo FDAX Italia
- Contributors su MQL5 forum
- YouTubers che hanno recensito l'indicatore

---

**Ultimo aggiornamento:** 2024-11-12
**Maintainer:** OOPS Trading Systems Team
