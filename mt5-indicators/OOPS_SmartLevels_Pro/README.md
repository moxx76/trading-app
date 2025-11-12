# OOPS Smart Levels Pro v1.0

## 📊 Indicatore Professionale per Analisi Volume e Livelli

**OOPS Smart Levels Pro** è un indicatore avanzato per MetaTrader 5 che combina analisi del volume profile, identificazione di livelli chiave, e generazione di setup di trading ad alta probabilità.

![Version](https://img.shields.io/badge/version-1.0-blue)
![Platform](https://img.shields.io/badge/platform-MetaTrader%205-orange)
![License](https://img.shields.io/badge/license-Proprietary-red)

---

## 🎯 CARATTERISTICHE PRINCIPALI

### 1. **Volume Profile Z-Score Engine**
- Analizza la distribuzione del volume su 500+ candele
- Identifica **HVN (High Volume Nodes)** - zone di alta liquidità
- Identifica **LVN (Low Volume Nodes)** - zone di rapido attraversamento
- Calcolo statistico Z-Score per ogni livello di prezzo
- Aggiornamento automatico ogni N candele (configurabile)

### 2. **Price Rejection Analyzer**
- Identifica livelli con rejection ripetute (swing high/low)
- Analizza la lunghezza dei wick rispetto al body
- Filtra livelli con minimo 3 touch confermati
- Calcola la forza di ogni livello basato su frequenza e wick ratio

### 3. **Market Bias Indicator**
- Determina il bias direzionale del mercato in tempo reale
- Combina momentum dei prezzi e volume
- Output: **BULLISH** 🔼 / **BEARISH** 🔽 / **NEUTRAL** ⏸
- Score quantitativo da -3.0 a +3.0

### 4. **Session-Aware Weighting**
- Peso diverso per sessioni ASIA / EUROPA / US
- Ottimizzato per FDAX (massimo peso su sessione Europa)
- Evidenzia livelli formati nella sessione corrente
- Indicatore sessione in tempo reale

### 5. **Dynamic Range Analyzer**
- Analizza espansione/compressione del range
- Identifica fasi di **EXPANSION** ⚡ e **COMPRESSION** 🔒
- Utilizza Z-Score statistico del range
- Allerta su potenziali breakout imminenti

### 6. **Smart Alerts & Trading Suggestions**
- Alert automatici per avvicinamento a livelli chiave
- Notifiche breakout confermati
- Allerta rejection forti
- Sistema anti-spam con cooldown configurabile
- Supporto push notifications e email

### 7. **Pannello Informativo Completo**
- Visualizzazione real-time di tutti i dati
- Lista livelli chiave ordinati per forza
- **Next Trade Setup** con entry, stop, target e R:R
- Timestamp e informazioni sessione
- Design professionale e leggibile

---

## 🔧 INSTALLAZIONE

### Requisiti
- MetaTrader 5 build ≥ 3280
- Windows 10/11 (o Wine per Linux/Mac)
- Timeframe consigliati: M1, M5, M15
- Strumento target: FDAX (adattabile ad altri futures)

### Procedura
1. Copia i file nella cartella `MQL5/Indicators/`:
   ```
   MQL5/
   └── Indicators/
       └── OOPS_SmartLevels_Pro/
           ├── OOPS_SmartLevels_Pro.mq5
           ├── OOPS_SmartLevels_Pro.mqh
           └── OOPS_Config.mqh
   ```

2. Apri MetaEditor in MT5

3. Compila `OOPS_SmartLevels_Pro.mq5`:
   - Apri il file .mq5
   - Premi `F7` o clicca "Compile"
   - Verifica assenza di errori

4. Riavvia MT5 o aggiorna la lista indicatori

5. Trascina l'indicatore sul grafico FDAX M5

---

## ⚙️ CONFIGURAZIONE PARAMETRI

### Volume Profile Z-Score Engine
| Parametro | Default | Descrizione |
|-----------|---------|-------------|
| `VP_Lookback_Bars` | 500 | Numero di candele da analizzare |
| `VP_Price_Bins` | 100 | Divisioni del range di prezzo |
| `VP_ZScore_Threshold_High` | 2.0 | Soglia Z-Score per HVN |
| `VP_ZScore_Threshold_Low` | -1.0 | Soglia Z-Score per LVN |
| `VP_Update_Frequency` | 10 | Aggiorna ogni N candele |

### Price Rejection Analyzer
| Parametro | Default | Descrizione |
|-----------|---------|-------------|
| `PR_Lookback_Bars` | 200 | Candele da analizzare |
| `PR_Touch_Tolerance` | 10 | Tolleranza in punti per touch |
| `PR_MinTouches` | 3 | Minimo touch per validità |
| `PR_Wick_Ratio_Min` | 0.4 | Minimo 40% wick/range |

### Market Bias Indicator
| Parametro | Default | Descrizione |
|-----------|---------|-------------|
| `MB_Fast_Period` | 20 | Periodo media veloce |
| `MB_Slow_Period` | 50 | Periodo media lenta |
| `MB_Momentum_Period` | 14 | Periodo momentum |
| `MB_Volume_Weight` | true | Considera volume |

### Session-Aware Weighting
| Parametro | Default | Descrizione |
|-----------|---------|-------------|
| `Session_Weight_Asia` | 0.5 | Peso sessione Asia |
| `Session_Weight_Europe` | 1.0 | Peso sessione Europa (max) |
| `Session_Weight_US` | 0.7 | Peso sessione US |
| `Session_Filter_Enable` | true | Filtra per sessione |

### Dynamic Range Analyzer
| Parametro | Default | Descrizione |
|-----------|---------|-------------|
| `DR_Period` | 50 | Periodo analisi range |
| `DR_ZScore_Expansion` | 1.5 | Soglia espansione |
| `DR_ZScore_Compression` | -1.0 | Soglia compressione |

### Visualizzazione
| Parametro | Default | Descrizione |
|-----------|---------|-------------|
| `Show_VolumeProfile` | true | Mostra livelli volume profile |
| `Show_RejectionZones` | true | Mostra zone rejection |
| `Show_InfoPanel` | true | Mostra pannello informativo |
| `Show_SessionMarker` | true | Mostra marker sessione |
| `Show_WeakZones` | true | Mostra zone deboli |
| `Max_Levels_Display` | 6 | Max livelli (3 sopra + 3 sotto) |

### Colori
| Parametro | Default | Descrizione |
|-----------|---------|-------------|
| `Color_Resistance` | Red | Colore resistenze |
| `Color_Support` | Lime | Colore supporti |
| `Color_Rejection` | Orange | Colore rejection zones |
| `Color_WeakZone` | Yellow | Colore weak zones |
| `Color_BullishBias` | LimeGreen | Colore bias rialzista |
| `Color_BearishBias` | Crimson | Colore bias ribassista |

### Alerts
| Parametro | Default | Descrizione |
|-----------|---------|-------------|
| `Enable_Alerts` | true | Abilita alert sonori |
| `Enable_Push_Notifications` | false | Abilita push su mobile |
| `Enable_Email_Alerts` | false | Abilita email |
| `Alert_Cooldown_Seconds` | 60 | Cooldown anti-spam |

### Performance
| Parametro | Default | Descrizione |
|-----------|---------|-------------|
| `Calculate_On_Every_Tick` | false | Calcola su ogni tick (più CPU) |
| `CPU_Optimization_Level` | 2 | 1=max precision, 3=max speed |

### Filtri Avanzati
| Parametro | Default | Descrizione |
|-----------|---------|-------------|
| `Min_Level_Strength` | 1.8 | Z-Score minimo per mostrare livello |
| `Min_Distance_Between_Levels` | 20 | Distanza minima tra livelli (punti) |
| `Filter_By_Session` | true | Mostra solo livelli sessione corrente |

---

## 📈 COME LEGGERE L'INDICATORE

### Pannello Informativo
```
┌─── OOPS SMART LEVELS PRO v1.0 ────┐
│                                    │
│ 📊 MARKET STATUS                   │
│ Bias: 🔼 BULLISH (+1.2)           │  ← Direzione preferita
│ Range: ⚡ EXPANSION (Z: +2.1)     │  ← Fase espansione/compressione
│ Session: 🇪🇺 EUROPE (1.0x)        │  ← Sessione corrente
│                                    │
│ 🎯 KEY LEVELS                      │
│ R3: 19,150 | Z: 2.8 | 1450 ticks  │  ← Resistenza 3
│ R2: 19,120 | Z: 2.3 | 980 ticks   │  ← Resistenza 2
│ R1: 19,090 | Z: 2.1 | 850 ticks   │  ← Resistenza 1
│ ────── PRICE: 19,075 ──────       │  ← Prezzo corrente
│ S1: 19,050 | Z: 2.4 | 1120 ticks  │  ← Supporto 1
│ S2: 19,020 | Z: 2.0 | 790 ticks   │  ← Supporto 2
│ S3: 18,990 | Z: 1.9 | 680 ticks   │  ← Supporto 3
│                                    │
│ 💡 NEXT TRADE SETUP               │
│ Type: LONG BOUNCE                  │  ← Tipo operazione
│ Entry: 19,048 - 19,052             │  ← Zona entry
│ Stop: 19,035 (-17pts)              │  ← Stop loss
│ Target: 19,090 (+38pts)            │  ← Target profit
│ R:R: 1:2.2 | Prob: 68%             │  ← Risk/Reward e probabilità
└────────────────────────────────────┘
```

### Livelli sul Grafico
- **Linee ROSSE** = Resistenze (HVN sopra prezzo)
- **Linee VERDI** = Supporti (HVN sotto prezzo)
- **Rettangoli ARANCIONI** = Rejection zones (storiche)
- **Linee GIALLE tratteggiate** = Weak zones (LVN - zone di rapido attraversamento)

### Label Livelli
- **R 19050 | Z:2.45 | V:1240** → Resistenza a 19050, Z-Score 2.45, Volume 1240 ticks
- **S 19000 | Z:2.10 | V:980** → Supporto a 19000, Z-Score 2.10, Volume 980 ticks
- **REJ 19100 | 5x | W:65%** → Rejection a 19100, 5 touch, Wick medio 65%
- **WEAK 19075** → Weak zone a 19075 (attraversamento veloce atteso)

---

## 🔔 TIPI DI ALERT

### 1. Strong Level Approach
```
⚠️ APPROACHING SUPPORT 19050 | BIAS: BULLISH | Consider LONG on bounce
```
- Prezzo a meno di 15 punti da supporto forte
- Bias allineato (bullish per supporto, bearish per resistenza)
- Prepara setup di trading

### 2. Breakout Confirmed
```
🚀 BREAKOUT CONFIRMED | Level: 19100 | Direction: UP | Volume: HIGH
```
- Prezzo ha attraversato HVN zone con forza
- Range in espansione (Z > 1.5)
- Volume superiore alla media (ratio > 1.3)
- Possibile continuazione trend

### 3. Strong Rejection
```
🔄 STRONG REJECTION | Level: 19075 | Setup: REVERSAL | Entry: 19070
```
- Wick ratio > 60%
- Più di 3 touch storici
- Prezzo a ±5 punti dal livello
- Setup di reversal ad alta probabilità

### 4. Compression Warning
```
⚡ COMPRESSION DETECTED | Breakout imminent | Watch: 19050 / 19100
```
- Range Z-Score < -1.0
- Compressione durata >10 candele
- Probabile breakout imminente
- Monitora livelli chiave sopra e sotto

---

## 💡 STRATEGIE DI UTILIZZO

### Strategia 1: Bounce su Supporto (Long)
**Condizioni:**
- Bias: BULLISH 🔼
- Prezzo vicino a supporto forte (S1 con Z > 2.0)
- Range: Normale o compressione

**Entry:**
- Zona: S1 ± 2 punti
- Conferma: Candela di reazione (bullish engulfing, pin bar, etc.)

**Stop Loss:**
- 15 punti sotto S1

**Target:**
- R1 (resistenza successiva) oppure +40 punti

**R:R Tipico:** 1:2 / 1:3

---

### Strategia 2: Rejection da Resistenza (Short)
**Condizioni:**
- Bias: BEARISH 🔽
- Prezzo vicino a resistenza forte (R1 con Z > 2.0)
- Range: Normale o espansione

**Entry:**
- Zona: R1 ± 2 punti
- Conferma: Candela di rejection (shooting star, bearish engulfing)

**Stop Loss:**
- 15 punti sopra R1

**Target:**
- S1 (supporto successivo) oppure -40 punti

**R:R Tipico:** 1:2 / 1:3

---

### Strategia 3: Breakout su Expansion
**Condizioni:**
- Range: EXPANSION ⚡ (Z > 1.5)
- Prezzo supera HVN zone con volume alto
- Alert: "BREAKOUT CONFIRMED"

**Entry (Long):**
- Prezzo rompe resistenza + 5 punti
- Volume ratio > 1.3

**Entry (Short):**
- Prezzo rompe supporto - 5 punti
- Volume ratio > 1.3

**Stop Loss:**
- 20 punti oltre il livello rotto (dall'altra parte)

**Target:**
- Prossimo HVN zone oppure +50 punti

**R:R Tipico:** 1:2.5

---

### Strategia 4: Reversal su Weak Zone
**Condizioni:**
- Prezzo attraversa weak zone (LVN)
- Range: Compression 🔒
- Setup: Prezzo si avvicina a HVN dall'altra parte

**Logica:**
- Weak zone = bassa liquidità = attraversamento veloce
- Attendi arrivo a supporto/resistenza forte per entry

**Entry:**
- Al raggiungimento del prossimo HVN (S o R)
- Segui strategia 1 o 2

---

## 🎓 BEST PRACTICES

### ✅ DO
- Usa su timeframe M5 o M15 per FDAX
- Attendi conferma candlestick prima di entrare
- Rispetta sempre stop loss
- Entra solo con bias allineato al setup
- Monitora il pannello info per aggiornamenti real-time
- Usa setup con R:R ≥ 1:2
- Considera il contesto della sessione (Europa = migliore per DAX)

### ❌ DON'T
- Non entrare contro bias forte
- Non ignorare weak zones (evita entry in LVN)
- Non fare overtrading su alert frequenti
- Non entrare senza conferma su timeframe operativo
- Non usare su timeframe > H1 (non ottimizzato)
- Non disabilitare gestione risk (stop loss)

---

## 🔍 TROUBLESHOOTING

### Problema: Indicatore non mostra livelli
**Soluzione:**
- Verifica dati storici sufficienti (min 500 candele)
- Controlla parametri `Min_Level_Strength` (prova ridurre a 1.5)
- Verifica `Show_VolumeProfile = true`

### Problema: Troppi livelli visualizzati
**Soluzione:**
- Aumenta `Min_Distance_Between_Levels` (es. 30)
- Riduci `Max_Levels_Display` (es. 4)
- Aumenta `Min_Level_Strength` (es. 2.2)

### Problema: Alert troppo frequenti
**Soluzione:**
- Aumenta `Alert_Cooldown_Seconds` (es. 120)
- Aumenta soglie bias (`bullish_threshold` e `bearish_threshold`)

### Problema: Performance lenta
**Soluzione:**
- Imposta `Calculate_On_Every_Tick = false`
- Aumenta `CPU_Optimization_Level = 3`
- Riduci `VP_Lookback_Bars` (es. 300)
- Aumenta `VP_Update_Frequency` (es. 20)

### Problema: Pannello copre candele
**Soluzione:**
- Modifica posizioni X/Y nel codice (funzione `DrawInfoPanel`)
- Oppure disabilita temporaneamente con `Show_InfoPanel = false`

---

## 📊 STATISTICHE & BACKTESTING

L'indicatore include logging delle performance per valutare accuracy nel tempo.

### Metriche Tracciate
- Accuracy setup suggeriti
- Win rate per tipo di alert
- R:R medio realizzato
- Frequenza falsi segnali

### File Log
- Posizione: `MQL5/Files/OOPS_SmartLevels_Log.csv`
- Formato: CSV importabile in Excel
- Campi: Timestamp, Setup Type, Entry, Exit, Profit, R:R, Outcome

---

## 🆘 SUPPORTO

Per assistenza, bug report, o richieste di funzionalità:

- **Email:** support@oopstrading.com
- **Documentazione:** https://docs.oopstrading.com
- **Video Tutorial:** https://youtube.com/@oopstrading

---

## 📄 LICENSE

Copyright © 2024 OOPS Trading Systems. All rights reserved.

Questo software è proprietario. È vietata la redistribuzione, modifica, o reverse engineering senza autorizzazione scritta.

---

## 📌 DISCLAIMER

**ATTENZIONE:** Il trading comporta rischio di perdita del capitale. Questo indicatore è uno strumento di analisi tecnica e NON garantisce profitti. L'utente è responsabile delle proprie decisioni di trading. Testare sempre in demo prima di utilizzare con denaro reale.

---

## 🔄 AGGIORNAMENTI

Versione corrente: **1.0**

Per vedere la lista completa degli aggiornamenti, consulta [CHANGELOG.md](CHANGELOG.md)

---

**🚀 Happy Trading with OOPS Smart Levels Pro!**
