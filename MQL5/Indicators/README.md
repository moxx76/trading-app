# First Candle Rule Indicator for MetaTrader 5

Indicatore personalizzato MQL5 che implementa la strategia "First Candle Rule" per il trading intraday su futures e altri strumenti.

## Descrizione

L'indicatore identifica automaticamente:
- **Prima candela da 30 minuti** della sessione di trading
- **Fair Value Gap (FVG)**: pattern a 3 candele che creano gap di prezzo
- **Smart Money Push (SMP)**: serie di candele consecutive seguite da engulfing

## Caratteristiche Principali

### 1. Identificazione Prima Candela
- Orario di inizio sessione configurabile (default: 09:30)
- Durata personalizzabile (default: 30 minuti)
- Visualizzazione con linee orizzontali per HIGH e LOW
- Box colorato semitrasparente per evidenziare il range

### 2. Fair Value Gap (FVG)
- Pattern a 3 candele sul timeframe 5 minuti
- Candela centrale ampia che crea gap tra prima e terza candela
- Si attiva DOPO che il prezzo tocca HIGH o LOW della prima candela
- Deve rientrare nel range della prima candela
- Segnale con frecce colorate

### 3. Smart Money Push (SMP)
- Serie di candele consecutive nella stessa direzione
- Engulfing della serie con candela di inversione
- Stesso criterio: dopo touch del livello e rientro nel range
- Segnale con frecce di colore diverso dal FVG

## Installazione

1. Copiare il file `FirstCandleRule.mq5` nella cartella:
   ```
   [MetaTrader 5 Data Folder]/MQL5/Indicators/
   ```

2. In MetaTrader 5:
   - Cliccare su "File" → "Open Data Folder"
   - Navigare in MQL5/Indicators/
   - Incollare il file
   - Riavviare MT5 o compilare il file (F7 nell'editor)

3. Aggiungere al grafico:
   - Navigatore → Indicators → Custom → FirstCandleRule
   - Trascinare sul grafico desiderato

## Parametri Configurabili

### Session Settings
- **SessionStartHour** (default: 9): Ora di inizio sessione (0-23)
- **SessionStartMinute** (default: 30): Minuto di inizio (0-59)
- **FirstCandlePeriod** (default: 30): Durata prima candela in minuti
- **AnalysisTimeframe** (default: 5): Timeframe per analisi pattern in minuti

### Visual Settings
- **HighLineColor** (default: Red): Colore linea HIGH
- **LowLineColor** (default: Blue): Colore linea LOW
- **LineWidth** (default: 2): Spessore linee
- **FirstCandleBoxColor** (default: Yellow): Colore box prima candela
- **BoxTransparency** (default: 90): Trasparenza box (0-100)

### Signal Colors
- **FVG_BuyColor** (default: Lime): Colore segnale FVG long
- **FVG_SellColor** (default: Orange): Colore segnale FVG short
- **SMP_BuyColor** (default: Aqua): Colore segnale SMP long
- **SMP_SellColor** (default: Magenta): Colore segnale SMP short

### Alert Settings
- **ShowAlerts** (default: true): Mostra alert popup
- **SendNotifications** (default: false): Invia notifiche push
- **DrawStopLoss** (default: true): Disegna livello stop loss
- **DrawTarget** (default: true): Disegna target 2:1 RR

### Pattern Settings
- **MinFVG_Pips** (default: 5): Gap minimo in pips per FVG valido
- **MinSMP_Candles** (default: 2): Numero minimo candele per SMP
- **DrawFVGZones** (default: true): Disegna zone FVG come rettangoli
- **ShowInfoPanel** (default: true): Mostra pannello informazioni
- **ShowStatistics** (default: true): Mostra statistiche

## Come Funziona

### Logica di Rilevamento

1. **All'inizio di ogni giorno:**
   - L'indicatore identifica la candela da 30 minuti all'orario configurato
   - Salva i valori HIGH e LOW
   - Disegna le linee orizzontali e il box sul grafico

2. **Durante la sessione:**
   - Monitora se il prezzo tocca HIGH o LOW della prima candela
   - Dopo il touch, inizia a cercare pattern FVG o SMP
   - Verifica che il pattern rientri nel range della prima candela

3. **Quando trova un pattern valido:**
   - Disegna freccia sul grafico
   - Calcola stop loss (ai body delle candele)
   - Calcola target con ratio 2:1 (Risk/Reward)
   - Genera alert se abilitato
   - Aggiorna statistiche

### Fair Value Gap (FVG) - Dettagli

**Pattern Bullish:**
- Si cerca dopo il touch del LOW della prima candela
- Serve un gap verso l'alto: `low[1] > high[3]`
- Gap minimo configurabile (default: 5 pips)
- Stop Loss: sotto la candela centrale
- Target: 2x il rischio

**Pattern Bearish:**
- Si cerca dopo il touch dell'HIGH della prima candela
- Serve un gap verso il basso: `low[3] > high[1]`
- Gap minimo configurabile (default: 5 pips)
- Stop Loss: sopra la candela centrale
- Target: 2x il rischio

### Smart Money Push (SMP) - Dettagli

**Pattern Bullish:**
- Si cerca dopo il touch del LOW
- Serie di N candele bearish consecutive (default: minimo 2)
- Candela bullish engulfing che chiude sopra il massimo della serie
- Stop Loss: sotto il minimo della serie
- Target: 2x il rischio

**Pattern Bearish:**
- Si cerca dopo il touch dell'HIGH
- Serie di N candele bullish consecutive (default: minimo 2)
- Candela bearish engulfing che chiude sotto il minimo della serie
- Stop Loss: sopra il massimo della serie
- Target: 2x il rischio

## Visualizzazione Grafica

L'indicatore visualizza:

1. **Linee orizzontali** per HIGH e LOW della prima candela (si estendono per tutta la sessione)
2. **Box semitrasparente** per evidenziare la prima candela
3. **Frecce UP** (↑) per segnali di acquisto:
   - Verde lime per FVG Buy
   - Azzurro per SMP Buy
4. **Frecce DOWN** (↓) per segnali di vendita:
   - Arancione per FVG Sell
   - Magenta per SMP Sell
5. **Linee tratteggiate rosse** per stop loss
6. **Linee tratteggiate verdi** per target
7. **Label** con informazioni: tipo segnale, RR ratio, orario
8. **Rettangoli semitrasparenti** per zone FVG (opzionale)

## Pannelli Informativi

### Info Panel (in alto a sinistra)
Mostra:
- Status corrente: "Waiting for first candle", "Waiting for touch", "Analyzing patterns"
- Dettagli prima candela (orario, HIGH, LOW)
- Touch status (HIGH/LOW toccati)
- Numero segnali giornalieri

### Statistics Panel (sotto l'info panel)
Mostra:
- Totale segnali generati
- Breakdown per tipo (FVG Buy/Sell, SMP Buy/Sell)
- Contatore giornaliero

## Timeframe Consigliati

- **Grafico principale**: 5 minuti (per visualizzare i pattern)
- **First Candle**: 30 minuti (default)
- **Analisi pattern**: 5 minuti (default)

L'indicatore funziona meglio su timeframe a 5 minuti, ma può essere adattato modificando i parametri.

## Strumenti Consigliati

- Futures USA (ES, NQ, YM)
- Forex major pairs
- Indici
- Commodity futures

**Nota:** Funziona meglio su mercati liquidi con sessioni ben definite.

## Alert e Notifiche

### Alert Popup
Quando abilitato (`ShowAlerts = true`), l'indicatore genera un alert popup quando:
- Viene rilevato un FVG Buy o Sell
- Viene rilevato un SMP Buy o Sell

L'alert include:
- Tipo di segnale
- Simbolo
- Orario di rilevamento

### Notifiche Push
Quando abilitato (`SendNotifications = true`), invia notifiche push all'app mobile di MT5.

**Per abilitare le notifiche push:**
1. In MT5: Tools → Options → Notifications
2. Inserire MetaQuotes ID (dall'app mobile)
3. Test per verificare la connessione

## Gestione Errori

L'indicatore include controlli per:
- **Validazione parametri**: verifica che tutti i parametri siano in range validi
- **Timeframe compatibili**: verifica che il grafico sia su un timeframe appropriato
- **Gestione weekend**: salta giorni non di trading
- **Pulizia oggetti**: rimuove automaticamente oggetti grafici dei giorni precedenti
- **Log eventi**: registra eventi principali nell'Experts log

Se ci sono parametri non validi, l'indicatore:
- Mostra un messaggio di errore nel log
- Non si carica sul grafico
- Indica quale parametro è errato

## Ottimizzazione Performance

L'indicatore è ottimizzato per:
- Non ricalcolare inutilmente i dati
- Gestire multi-timeframe in modo efficiente
- Minimizzare il numero di oggetti grafici
- Rimuovere automaticamente dati obsoleti

## Esempi di Utilizzo

### Setup Tipico per Futures USA

```
SessionStartHour = 9
SessionStartMinute = 30
FirstCandlePeriod = 30
AnalysisTimeframe = 5
MinFVG_Pips = 5
MinSMP_Candles = 2
```

### Setup per Forex (sessione europea)

```
SessionStartHour = 8
SessionStartMinute = 0
FirstCandlePeriod = 30
AnalysisTimeframe = 5
MinFVG_Pips = 10
MinSMP_Candles = 3
```

### Setup Aggressivo (più segnali)

```
MinFVG_Pips = 3
MinSMP_Candles = 2
```

### Setup Conservativo (meno segnali, più qualità)

```
MinFVG_Pips = 10
MinSMP_Candles = 4
```

## Troubleshooting

### L'indicatore non mostra la prima candela
- Verificare che l'orario di inizio sessione sia corretto per il proprio fuso orario
- Controllare che sia passato il periodo della prima candela
- Verificare che non sia weekend o festivo

### Nessun segnale viene generato
- Assicurarsi che il prezzo abbia toccato HIGH o LOW della prima candela
- Verificare che i pattern si formino all'interno del range
- Ridurre `MinFVG_Pips` o `MinSMP_Candles` per aumentare la sensibilità

### Troppi segnali falsi
- Aumentare `MinFVG_Pips` per gap più significativi
- Aumentare `MinSMP_Candles` per pattern più robusti
- Usare su timeframe più alti o mercati più liquidi

### Gli oggetti grafici non vengono visualizzati
- Verificare che le opzioni di visualizzazione siano abilitate
- Controllare che i colori non siano troppo simili allo sfondo
- Provare a riavviare MT5

## Best Practices

1. **Backtesting**: Testare l'indicatore su dati storici prima di usarlo in real-time
2. **Demo Trading**: Usare su account demo prima di operare con soldi reali
3. **Risk Management**: Rispettare sempre stop loss calcolati
4. **Conferme**: Usare l'indicatore in combinazione con altri strumenti di analisi
5. **Filtraggio**: Non tutti i segnali sono uguali - valutare il contesto di mercato
6. **Sessioni**: Funziona meglio nelle prime ore della sessione

## Limitazioni

- L'indicatore è basato su pattern tecnici e non garantisce profitti
- Può generare falsi segnali in mercati range-bound o con bassa liquidità
- Richiede che il prezzo tocchi i livelli della prima candela
- I pattern devono rientrare nel range della prima candela

## Supporto e Aggiornamenti

Per domande, bug report o suggerimenti:
- Controllare che si stia usando l'ultima versione
- Verificare i log di MT5 per messaggi di errore
- Documentare il problema con screenshot e dettagli

## Versione

**v1.00** - Prima release
- Implementazione completa strategia First Candle Rule
- Rilevamento FVG e SMP
- Pannelli info e statistiche
- Alert e notifiche
- Visualizzazione grafica completa

## Licenza

Copyright 2025, First Candle Rule

---

**DISCLAIMER**: Questo indicatore è fornito a scopo educativo e informativo. Il trading comporta rischi significativi. Non garantiamo profitti o performance. Utilizzare a proprio rischio e responsabilità.
