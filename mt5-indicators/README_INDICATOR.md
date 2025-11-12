# 📊 Indicatore DAX ZigZag Strategy 0.3%

## 🎯 Descrizione

Indicatore avanzato per MetaTrader 5 che automatizza l'identificazione e visualizzazione dei setup di trading basati sulla strategia DAX 10 minuti con ZigZag 0.3%.

L'indicatore rileva automaticamente i pattern 1-2-3, calcola i livelli operativi (Entry, Stop Loss, Target), mostra graficamente le zone di rischio/profitto e gestisce alert in tempo reale.

---

## ✨ Caratteristiche Principali

### 🔍 Rilevamento Pattern
- **Pattern 1-2-3 automatico** per setup LONG e SHORT
- **ZigZag 0.3%** per filtrare il rumore di mercato
- **Validazione automatica** con filtri operativi

### 📈 Visualizzazione Grafica
- **Punti numerati** (1, 2, 3) colorati sul grafico
- **Linee di connessione** tratteggiate tra i punti
- **Livelli operativi** (Entry, Stop, Target) ben visibili
- **Zone semi-trasparenti** per rischio (rosso) e profitto (verde)
- **Pannello informativo** con statistiche in tempo reale

### 🔔 Sistema Alert Completo
- Alert pattern completato
- Alert entry signal (3 modalità)
- Alert stop loss hit
- Alert target hit
- Supporto popup, suono, push notification, email

### 📊 Statistiche e Tracking
- Contatore setup attivi
- Win rate in tempo reale
- P&L cumulativo
- Drawdown massimo
- Storico completo degli ultimi N setup

### 💾 Export Dati
- Export automatico in CSV
- Tutti i setup con esito (win/loss)
- Analisi performance esterna

---

## 📥 Installazione

### Passo 1: Copia File
1. Apri la **Data Folder** di MetaTrader 5:
   - Menu `File` → `Apri cartella dati`
2. Naviga in: `MQL5\Indicators\`
3. Copia il file `DAX_ZigZag_Strategy.mq5` in questa cartella

### Passo 2: Compila Indicatore
1. Apri **MetaEditor** (F4 da MT5)
2. Nel Navigator, trova `Indicators` → `DAX_ZigZag_Strategy.mq5`
3. Clicca destro → **Compile** (o premi F7)
4. Verifica che la compilazione sia riuscita (0 errori)

### Passo 3: Applica al Grafico
1. Apri un grafico DAX (o altro strumento)
2. Imposta timeframe **M10** (consigliato)
3. Dal Navigator, trascina `DAX_ZigZag_Strategy` sul grafico
4. Configura i parametri (vedi sezione successiva)
5. Clicca **OK**

### ⚠️ Requisiti
- MetaTrader 5 (build 3000+)
- Indicatore ZigZag standard di MT5 (già incluso)
- Timeframe consigliato: M10 (ma funziona su tutti)

---

## ⚙️ Parametri Configurabili

### 🔧 Parametri ZigZag

| Parametro | Default | Descrizione |
|-----------|---------|-------------|
| `ZigZag_Deviation` | 0.3 | Deviazione percentuale (0.3% consigliato per DAX M10) |
| `ZigZag_Depth` | 12 | Profondità ricerca ZigZag |
| `ZigZag_Backstep` | 3 | Backstep ZigZag |

### 💰 Parametri Rischio/Target

| Parametro | Default | Descrizione |
|-----------|---------|-------------|
| `Max_Risk_Points` | 150 | Rischio massimo accettabile (punti). Setup oltre questo limite vengono scartati |
| `Warning_Risk_Points` | 120 | Soglia warning per rischio elevato |
| `Target_Points` | 40 | Target fisso in punti (configurabile) |

### 🎨 Parametri Visualizzazione

| Parametro | Default | Descrizione |
|-----------|---------|-------------|
| `Show_Pattern_Lines` | true | Mostra linee tratteggiate tra punti 1-2-3 |
| `Show_Risk_Zones` | true | Mostra rettangoli semi-trasparenti rischio/profitto |
| `Show_Info_Panel` | true | Mostra pannello informativo in alto a sinistra |
| `Lines_Extension` | 15 | Estensione linee operative (in candele) |

### 🎯 Parametri Entry

| Parametro | Default | Descrizione |
|-----------|---------|-------------|
| `Entry_Mode` | 2 | **1** = Al tocco<br>**2** = Consolidato (candela chiude oltre entry)<br>**3** = Migliorato (con offset) |
| `Entry_Offset` | 5 | Offset in punti per modalità 3 |

**Spiegazione Entry Mode:**
- **Modalità 1 (Tocco)**: Entry triggerata quando il prezzo tocca il livello Punto 2
- **Modalità 2 (Consolidato)**: Entry triggerata quando una candela chiude oltre il livello Punto 2 (più conservativo)
- **Modalità 3 (Migliorato)**: Entry a prezzo migliorato di N punti rispetto a Punto 2

### 🔔 Parametri Alert

| Parametro | Default | Descrizione |
|-----------|---------|-------------|
| `Enable_Alerts` | true | Abilita sistema alert |
| `Alert_Pattern` | true | Alert quando si completa un pattern 1-2-3 |
| `Alert_Entry` | true | Alert quando viene triggerata l'entry |
| `Alert_Stop` | true | Alert quando viene colpito lo stop loss |
| `Alert_Target` | true | Alert quando viene raggiunto il target |
| `Alert_Popup` | true | Mostra popup MT5 |
| `Alert_Sound` | true | Riproduci suono |
| `Alert_Push` | false | Invia notifica push (richiede configurazione MT5) |
| `Alert_Email` | false | Invia email (richiede configurazione MT5) |
| `Alert_SoundFile` | "alert.wav" | File audio per alert |

### 🎨 Parametri Colori

| Parametro | Default | Descrizione |
|-----------|---------|-------------|
| `Color_Long` | Blu | Colore setup LONG |
| `Color_Short` | Rosso | Colore setup SHORT |
| `Color_Entry` | Giallo | Colore linea entry |
| `Color_Stop` | Rosso | Colore linea stop loss |
| `Color_Target` | Verde lime | Colore linea target |
| `Color_Risk_Zone` | Cremisi | Colore zona rischio |
| `Color_Profit_Zone` | Verde lime | Colore zona profitto |

### 📊 Parametri Statistiche

| Parametro | Default | Descrizione |
|-----------|---------|-------------|
| `Historical_Setups_Count` | 50 | Numero massimo di setup storici da conservare |
| `Winrate_Sample` | 20 | Campione per calcolo win rate |

### 🗂️ Parametri Gestione Setup

| Parametro | Default | Descrizione |
|-----------|---------|-------------|
| `Hide_Old_Setups` | false | Nascondi automaticamente setup vecchi |
| `Setup_Expiry_Candles` | 100 | Candele dopo cui un setup viene considerato scaduto |
| `Old_Setup_Opacity` | 50 | Opacità (0-100) per setup vecchi |

### 💾 Parametri Export

| Parametro | Default | Descrizione |
|-----------|---------|-------------|
| `Auto_Export_CSV` | false | Export automatico CSV alla chiusura |
| `Export_Filename` | "DAX_Setups.csv" | Nome file CSV |

---

## 📖 Come Funziona

### 🔍 Rilevamento Pattern 1-2-3

#### Setup LONG (dopo downtrend)
```
Punto 1: Minimo locale ZigZag (LOW)
Punto 2: Massimo ritracciamento (HIGH)
Punto 3: Nuovo minimo ≥ Punto 1 (conferma pattern)

Esempio:
        ●2 (giallo)
       / \
      /   \●3 (arancione)
     /
●1 (blu)

Entry = Punto 2
Stop Loss = Punto 1
Target = Entry + 40 punti
```

#### Setup SHORT (dopo uptrend)
```
Punto 1: Massimo locale ZigZag (HIGH)
Punto 2: Minimo ritracciamento (LOW)
Punto 3: Nuovo massimo ≤ Punto 1 (conferma pattern)

Esempio:
●1 (rosso)
 \
  \   ●3 (arancione)
   \ /
    ●2 (giallo)

Entry = Punto 2
Stop Loss = Punto 1
Target = Entry - 40 punti
```

### ✅ Validazione Setup

Un setup è considerato **VALIDO** se:
1. ✅ Pattern 1-2-3 completato correttamente
2. ✅ Distanza rischio (|P1-P2|) ≤ 150 punti
3. ✅ Almeno 1 onda ZigZag precedente (conferma trend)

**Setup NON VALIDO** se:
- ❌ Rischio > 150 punti → Setup scartato automaticamente
- ⚠️ Rischio tra 120-150 punti → Warning "RISCHIO ELEVATO"

### 📊 Calcoli Automatici

Per ogni setup valido, l'indicatore calcola:

```
DISTANZA_RISCHIO = |Punto1 - Punto2| (in punti)
ENTRY_PRICE = Prezzo Punto 2
STOP_LOSS = Prezzo Punto 1
TARGET = Entry ± 40 punti
RISK_REWARD_RATIO = 40 / DISTANZA_RISCHIO
```

**Esempio pratico:**
- Setup SHORT
- Punto 1 (HIGH): 18.500
- Punto 2 (LOW): 18.450
- Punto 3 (HIGH): 18.490

```
Rischio = 18.500 - 18.450 = 50 punti ✅
Entry = 18.450
Stop = 18.500
Target = 18.450 - 40 = 18.410
R:R = 40 / 50 = 0.8 → 1:0.8
```

---

## 🎨 Visualizzazione Grafica

### Elementi sul Grafico

#### 1. **Punti Pattern**
- **Punto 1**: Cerchio ROSSO (SHORT) o BLU (LONG) + label "1"
- **Punto 2**: Cerchio GIALLO + label "2"
- **Punto 3**: Cerchio ARANCIONE + label "3"

#### 2. **Linee Pattern**
- Linee **tratteggiate** che connettono 1→2→3
- Colore: Verde per LONG, Rosso per SHORT

#### 3. **Livelli Operativi**
- **Entry Line**: Linea orizzontale GIALLA tratteggiata
- **Stop Loss**: Linea orizzontale ROSSA continua (spessa)
- **Target**: Linea orizzontale VERDE continua (spessa)
- Estese di 15 candele a destra (configurabile)

#### 4. **Zone Rischio/Profitto**
- **Zona Rischio**: Rettangolo ROSSO semi-trasparente (20% opacità)
  - Tra Entry e Stop Loss
- **Zona Profitto**: Rettangolo VERDE semi-trasparente (20% opacità)
  - Tra Entry e Target

#### 5. **Box Informativo** (alto-sinistra)
```
═══ DAX ZIGZAG STRATEGY ═══

ULTIMO SETUP: LONG
Entry:  18450.0
Stop:   18400.0
Target: 18490.0
Risk:   50.0 pts
Reward: 40 pts
R:R = 1:0.80
Status: PENDING

─────────────────
STATISTICHE SESSIONE
Setup totali: 5
Attivi: 2
Win: 2
Loss: 1
Win Rate: 66.7%
P&L: +30.0 pts
Max DD: -50.0 pts
```

---

## 🔔 Sistema Alert

### Tipi di Alert

1. **Pattern Completato** (`Alert_Pattern`)
   - Quando si forma un nuovo pattern 1-2-3 valido
   - Messaggio: `"PATTERN LONG RILEVATO | Entry: 18450 | Stop: 18400 | Target: 18490 | R:R = 1:0.80"`

2. **Entry Signal** (`Alert_Entry`)
   - Quando il prezzo raggiunge il livello di entry
   - Messaggio: `"ENTRY SIGNAL LONG @ 18450.0"`

3. **Stop Hit** (`Alert_Stop`)
   - Quando viene colpito lo stop loss
   - Messaggio: `"STOP HIT LONG | Loss: -50.0 pts"`

4. **Target Hit** (`Alert_Target`)
   - Quando viene raggiunto il target
   - Messaggio: `"TARGET HIT LONG | Win: +40.0 pts"`

### Modalità Alert

- ✅ **Popup**: Finestra popup MT5
- ✅ **Suono**: Riproduce file audio (default: alert.wav)
- ✅ **Push Notification**: Notifica su app mobile MT5 (richiede configurazione)
- ✅ **Email**: Invio email (richiede configurazione SMTP in MT5)

### Configurazione Push/Email

Per abilitare notifiche push o email:

1. **Push Notification**:
   - Menu MT5: `Strumenti` → `Opzioni` → `Notifiche`
   - Configura MetaQuotes ID
   - Imposta `Alert_Push = true`

2. **Email**:
   - Menu MT5: `Strumenti` → `Opzioni` → `Email`
   - Configura server SMTP
   - Imposta `Alert_Email = true`

---

## 📊 Statistiche e Tracking

### Statistiche Tempo Reale (nel pannello info)

- **Setup totali**: Numero totale di pattern rilevati nella sessione
- **Setup attivi**: Setup ancora in corso (non chiusi)
- **Win**: Setup chiusi in profitto (target raggiunto)
- **Loss**: Setup chiusi in perdita (stop colpito)
- **Win Rate**: Percentuale di vincita (Win / Totali chiusi)
- **P&L**: Profit & Loss cumulativo in punti
- **Max DD**: Drawdown massimo in punti

### Storico Setup

L'indicatore mantiene uno **storico degli ultimi N setup** (default: 50) con tutte le informazioni:
- Data e ora formazione
- Tipo (LONG/SHORT)
- Prezzi (Entry, Stop, Target)
- Rischio e Reward
- Esito (WIN/LOSS)
- P&L in punti

---

## 💾 Export CSV

### Export Automatico

Se abilitato (`Auto_Export_CSV = true`), l'indicatore esporta automaticamente tutti i setup storici in un file CSV alla chiusura.

### Export Manuale

Per esportare manualmente:
1. Rimuovi l'indicatore dal grafico
2. Il file CSV viene generato automaticamente in: `MQL5\Files\DAX_Setups.csv`

### Formato CSV

```csv
Data,Ora,Tipo,Entry,Stop,Target,Rischio_Pts,Reward_Pts,RR_Ratio,Outcome,PnL_Pts,Status
2025-11-12,10:30:00,LONG,18450.0,18400.0,18490.0,50.0,40.0,0.80,WIN,40.0,WIN +40.0 pts
2025-11-12,11:15:00,SHORT,18500.0,18550.0,18460.0,50.0,40.0,0.80,LOSS,-50.0,LOSS -50.0 pts
```

### Analisi Esterna

Il file CSV può essere importato in:
- **Excel** per analisi dettagliate
- **Python/R** per backtesting avanzato
- **Software statistici** per performance analysis

---

## 🎯 Consigli Operativi

### ✅ Best Practices

1. **Timeframe**: Usa M10 per DAX (come da strategia originale)
2. **Filtro Rischio**: Mantieni `Max_Risk_Points` a 150 o meno
3. **Entry Mode**: Usa modalità 2 (consolidato) per conferme più affidabili
4. **Gestione Capitale**: Non rischiare più dell'1-2% per trade
5. **Alert**: Abilita almeno popup e suono per non perdere segnali

### ⚠️ Attenzioni

1. **Ridisegno ZigZag**: L'ultimo punto ZigZag può ridisegnarsi. Attendi conferma pattern completo (punto 3)
2. **Orari Volatilità**: Evita aperture/chiusure mercati (8:00-9:00, 22:00-23:00 CET)
3. **News**: Non operare durante news ad alto impatto (calendario economico)
4. **Slippage**: In mercati veloci lo slippage può essere significativo

### 📈 Ottimizzazioni Suggerite

Per strategie diverse dal DAX M10, prova a modificare:
- `ZigZag_Deviation`: 0.2% per mercati meno volatili, 0.5% per più volatili
- `Target_Points`: Adatta al tuo risk/reward preferito
- `Max_Risk_Points`: Basato sulla volatilità dello strumento

---

## 🐛 Troubleshooting

### ❌ Indicatore non si carica

**Problema**: Errore "ZigZag handle invalid"
**Soluzione**:
- Verifica che l'indicatore ZigZag standard sia installato in MT5
- Path: `Indicators\Examples\ZigZag`
- Reinstalla MT5 se necessario

### ❌ Nessun pattern rilevato

**Problema**: Nessun setup mostrato sul grafico
**Soluzione**:
- Aumenta `ZigZag_Depth` (es. 24)
- Riduci `ZigZag_Deviation` (es. 0.2%)
- Verifica che ci siano almeno 100+ candele sul grafico

### ❌ Alert non funzionano

**Problema**: Nessun alert ricevuto
**Soluzione**:
- Verifica `Enable_Alerts = true`
- Controlla volume sistema (per alert sonori)
- Per push/email, verifica configurazione MT5

### ❌ Grafico troppo lento

**Problema**: MT5 rallenta con indicatore attivo
**Soluzione**:
- Riduci `Historical_Setups_Count` (es. 20)
- Disabilita `Show_Risk_Zones` se non necessario
- Riduci `Lines_Extension` (es. 5-10 candele)

---

## 📝 Note Tecniche

### Logica Anti-Repainting

L'indicatore utilizza i valori **chiusi** di ZigZag per evitare ridisegni eccessivi. Tuttavia:
- ⚠️ L'ultimo punto ZigZag **può** ancora ridisegnarsi finché non si forma il punto successivo
- ✅ I setup con **punto 3 confermato** NON ridisegnano

### Performance

- **Calcolo**: O(n) dove n = numero barre visibili
- **Memoria**: ~10KB per 50 setup storici
- **CPU**: Leggero (< 1% su CPU moderni)

### Limitazioni

1. **ZigZag Lag**: Il ZigZag ha un ritardo intrinseco (ultima onda può cambiare)
2. **Storico**: Setup storici limitati a parametro configurabile (default 50)
3. **Multi-timeframe**: Un indicatore per grafico (non multi-TF)

---

## 📜 Versioning

### v1.0 (2025-11-12)
- ✅ Implementazione completa strategia DAX ZigZag 0.3%
- ✅ Pattern 1-2-3 automatico
- ✅ Visualizzazione grafica completa
- ✅ Sistema alert multi-canale
- ✅ Statistiche e tracking
- ✅ Export CSV

---

## 🤝 Supporto

Per problemi, domande o suggerimenti:
- Verifica questa documentazione
- Controlla la sezione Troubleshooting
- Consulta i log MT5 (scheda "Experts")

---

## ⚖️ Disclaimer

Questo indicatore è uno **strumento di analisi tecnica**.

**IMPORTANTE**:
- ⚠️ Non costituisce consulenza finanziaria
- ⚠️ I risultati passati non garantiscono performance future
- ⚠️ Il trading comporta rischio di perdita capitale
- ⚠️ Opera solo con capitale che puoi permetterti di perdere

**L'autore non è responsabile per:**
- Perdite derivanti dall'uso dell'indicatore
- Errori di calcolo o bug
- Decisioni di trading basate sui segnali

**Usa sempre:**
- ✅ Stop loss appropriati
- ✅ Money management rigoroso
- ✅ Account demo per test prima di operare con denaro reale

---

## 📚 Risorse Aggiuntive

### Strategia DAX ZigZag
- Timeframe: M10
- Strumento: DAX (Germany 40)
- Deviazione: 0.3%
- Target fisso: 40 punti
- Rischio massimo: 150 punti

### Link Utili
- [MetaTrader 5 Download](https://www.metatrader5.com/)
- [MQL5 Documentation](https://www.mql5.com/en/docs)
- [ZigZag Indicator Guide](https://www.mql5.com/en/code/7566)

---

**Buon trading! 📈**
