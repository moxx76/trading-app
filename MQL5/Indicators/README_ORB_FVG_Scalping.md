# ORB FVG Scalping - Indicatore MQL5

## 📊 Descrizione

**ORB_FVG_Scalping** è un indicatore personalizzato per MetaTrader 5 che implementa una strategia di scalping basata su:

1. **Opening Range (OR)**: Range della prima candela a 5 minuti (9:30-9:35 AM EST)
2. **Fair Value Gap (FVG)**: Gap di prezzo che indicano squilibrio di mercato
3. **Segnali automatici**: Entry, Stop Loss e Take Profit con ratio 2:1

---

## 🚀 Installazione

### Metodo 1: Installazione Manuale

1. **Copia il file** `ORB_FVG_Scalping.mq5` nella cartella degli indicatori di MetaTrader 5:
   ```
   C:\Users\[TuoNome]\AppData\Roaming\MetaQuotes\Terminal\[ID-Broker]\MQL5\Indicators\
   ```

2. **Apri MetaEditor** (premendo F4 in MT5)

3. **Compila l'indicatore**:
   - Apri il file `ORB_FVG_Scalping.mq5`
   - Premi F7 o clicca "Compile"
   - Verifica che non ci siano errori

4. **Riavvia MT5** o aggiorna il Navigator (tasto destro → Refresh)

### Metodo 2: Compilazione da MetaEditor

1. Apri MetaEditor in MT5 (F4)
2. File → Open → Seleziona `ORB_FVG_Scalping.mq5`
3. Tools → Options → Compiler → Verifica impostazioni
4. Premi F7 per compilare
5. L'indicatore compilato (.ex5) apparirà nella stessa cartella

---

## ⚙️ Configurazione

### Parametri Principali

#### **Orari Apertura**
- `MarketOpenHour`: Ora di apertura in EST (default: 9)
- `MarketOpenMinute`: Minuti (default: 30)
- `BrokerTimeZoneGMT`: Fuso orario del broker in GMT+ (default: 2)
- `TimeframeOR`: Timeframe per Opening Range in minuti (default: 5)

#### **Visualizzazione**
- `ShowORLines`: Mostra linee High/Low del range (default: true)
- `ShowFVGBoxes`: Evidenzia i Fair Value Gap (default: true)
- `ShowEntrySignals`: Mostra frecce di entry (default: true)
- `ShowSLTP`: Mostra Stop Loss e Take Profit (default: true)
- `ShowInfoPanel`: Pannello informativo (default: true)

#### **Colori**
- `ColorBullishFVG`: Colore FVG rialzista (default: Lime)
- `ColorBearishFVG`: Colore FVG ribassista (default: Red)
- `ColorORHigh`: Colore linea OR High (default: DodgerBlue)
- `ColorORLow`: Colore linea OR Low (default: Orange)
- `ColorStopLoss`: Colore linea Stop Loss (default: Red)
- `ColorTakeProfit`: Colore linea Take Profit (default: Green)

#### **Risk Management**
- `RiskRewardRatio`: Rapporto Risk/Reward (default: 2.0 → 1:2)

#### **Filtri**
- `MinGapSize`: Dimensione minima del gap in pips (default: 5)
- `MaxCandleSize`: Dimensione massima candela per evitare spike (default: 50)
- `MaxTimeWindow`: Tempo massimo per setup in minuti dopo OR (default: 60)

#### **Alert**
- `AlertOnSignal`: Abilita alert popup (default: true)
- `AlertSound`: Abilita suono di alert (default: true)
- `AlertPush`: Notifiche push su mobile (default: false)

---

## 📈 Come Funziona

### FASE 1: Identificazione Opening Range

1. L'indicatore identifica la candela a 5 minuti che inizia alle **9:30 AM EST**
2. Memorizza il **massimo** (OR High) e il **minimo** (OR Low) di questa candela
3. Disegna due linee orizzontali:
   - **Linea blu** (OR High)
   - **Linea arancione** (OR Low)

### FASE 2: Rilevamento Fair Value Gap

Un **FVG valido** si forma quando:

**Per FVG Rialzista (Bullish):**
- Tre candele consecutive su timeframe M1
- C2 (centrale) crea un gap verso l'alto: `C2.Low > C1.High`
- C3 chiude SOPRA OR High (conferma breakout)
- Dimensione gap ≥ MinGapSize pips

**Per FVG Ribassista (Bearish):**
- Tre candele consecutive su timeframe M1
- C2 (centrale) crea un gap verso il basso: `C2.High < C1.Low`
- C3 chiude SOTTO OR Low (conferma breakout)
- Dimensione gap ≥ MinGapSize pips

### FASE 3: Segnali di Entry

Quando si forma un FVG valido, l'indicatore:

- **Disegna una freccia**:
  - 🟢 Freccia verde ↑ per **LONG**
  - 🔴 Freccia rossa ↓ per **SHORT**

- **Calcola automaticamente**:
  - **Entry**: Prezzo di chiusura di C3
  - **Stop Loss**:
    - LONG → Low della candela che ha chiuso sopra OR High
    - SHORT → High della candela che ha chiuso sotto OR Low
  - **Take Profit**: Entry + (Risk × 2.0)
  - **Risk**: Distanza tra Entry e Stop Loss

### FASE 4: Visualizzazione SL/TP

- Linea **rossa tratteggiata**: Stop Loss
- Linea **verde tratteggiata**: Take Profit
- Le linee cambiano stile (punteggiato) quando il prezzo raggiunge uno dei livelli

---

## 🎯 Esempio Pratico

### Setup LONG

1. **9:30 AM EST**: Candela M5 forma OR
   - OR High = 1.1050
   - OR Low = 1.1030

2. **9:42 AM**: Tre candele M1 formano FVG bullish
   - C1: High 1.1035
   - C2: Gap verso l'alto, Low 1.1038 (gap di 3 pips)
   - C3: Close 1.1053 (sopra OR High ✓)

3. **Segnale LONG generato**:
   - Entry: 1.1053
   - Stop Loss: 1.1035 (low di C2)
   - Risk: 18 pips
   - Take Profit: 1.1089 (entry + 18×2 = +36 pips)
   - R:R = 1:2

4. **Alert**: "ORB FVG Setup: LONG su EURUSD | Entry: 1.1053 | SL: 1.1035 | TP: 1.1089 | R:R 1:2.0"

---

## 📊 Info Panel

Il pannello informativo (angolo superiore sinistro) mostra:

```
═══ ORB FVG SCALPING ═══
OR High: 1.10500
OR Low: 1.10300
OR Range: 20.0 pips
Segnali oggi: 2
Ultimo segnale: LONG alle 09:42
Stato: Active
```

**Stati possibili:**
- `Waiting`: In attesa di setup
- `Active`: Trade attivo (non ha ancora toccato SL o TP)
- `Closed`: Trade chiuso (ha raggiunto SL o TP)

---

## ⚠️ Note Importanti

### Conversione Orari

- L'indicatore converte automaticamente **EST** → **Orario Broker**
- Considera **Daylight Saving Time** (EDT vs EST)
- Verifica che `BrokerTimeZoneGMT` corrisponda al tuo broker:
  - Broker europei: GMT+2 o GMT+3
  - Broker USA: GMT-5 o GMT-4

### Gestione Giornaliera

- Ogni giorno alle 00:00 (broker time) l'indicatore si resetta
- Linee e segnali del giorno precedente rimangono visibili per analisi
- Il range viene ricalcolato per la nuova sessione

### Timeframe Consigliati

- **Grafico principale**: M1 o M5
- L'indicatore usa internamente:
  - M5 per identificare Opening Range
  - M1 per rilevare Fair Value Gap

### Limitazioni

- **Non piazza ordini**: L'indicatore è solo per analisi visiva
- **Dati storici**: Funziona su dati storici, ma è ottimizzato per trading live
- **Slippage**: Non considera slippage e spread nei calcoli

---

## 🔧 Troubleshooting

### "Opening Range non trovato"

**Causa**: La candela delle 9:30 EST non esiste nei dati
**Soluzione**:
- Verifica che il mercato fosse aperto a quell'ora
- Controlla il parametro `BrokerTimeZoneGMT`
- Assicurati di avere dati storici sufficienti

### "Nessun FVG rilevato"

**Causa**: Condizioni FVG troppo restrittive
**Soluzione**:
- Riduci `MinGapSize` (es. da 5 a 3 pips)
- Aumenta `MaxTimeWindow` (es. da 60 a 120 minuti)
- Verifica che il prezzo abbia effettivamente rotto il range

### "Alert non funzionano"

**Causa**: Alert disabilitati in MT5
**Soluzione**:
- Tools → Options → Notifications
- Abilita "Enable alerts"
- Per push: configura MetaQuotes ID

### "Oggetti grafici non visibili"

**Causa**: Layer o timeframe errato
**Soluzione**:
- Clicca destro sul grafico → Objects → Objects List
- Cerca oggetti che iniziano con "ORB_"
- Verifica che non siano nascosti

---

## 📝 Changelog

### Version 1.00 (2025-11-12)
- ✅ Rilascio iniziale
- ✅ Identificazione Opening Range
- ✅ Rilevamento Fair Value Gap
- ✅ Calcolo automatico SL/TP con ratio 2:1
- ✅ Sistema di alert completo
- ✅ Info Panel in tempo reale
- ✅ Gestione timezone EST/broker

---

## 🎓 Strategia di Trading

### Regole Base

1. **Attendere OR**: Non entrare prima che l'Opening Range sia definito
2. **Confermare FVG**: Entrare solo su FVG validi con gap minimo
3. **Rispettare SL**: Stop Loss è calcolato per proteggere il capitale
4. **Target 2:1**: Take Profit è sempre doppio del rischio

### Best Practices

- ✅ Usare su strumenti liquidi (EURUSD, GBPUSD, etc.)
- ✅ Evitare giorni di news ad alto impatto
- ✅ Considerare spread e commissioni
- ✅ Testare in demo prima di usare in live
- ✅ Combinare con analisi del contesto di mercato

### Quando NON Tradare

- ❌ Range troppo piccolo (< 10 pips)
- ❌ Range troppo grande (> 100 pips) = alta volatilità
- ❌ Prima mezz'ora dopo l'apertura (9:30-10:00)
- ❌ Ultimi 30 minuti prima della chiusura
- ❌ Giorni festivi o bassa liquidità

---

## 📞 Supporto

### Debug e Log

L'indicatore stampa informazioni nel **Terminale** (Tab "Experts"):
```
ORB_FVG_Scalping Indicator - Inizializzazione...
Opening Range identificato: High=1.10500 Low=1.10300 Range=200 points
===== NUOVO SEGNALE LONG =====
Entry: 1.10530
Stop Loss: 1.10350
Take Profit: 1.10890
Risk: 180 points
R:R: 1:2.0
```

### File di Log

Posizione: `[DataFolder]\MQL5\Logs\YYYYMMDD.log`

---

## ⚖️ Disclaimer

**QUESTO INDICATORE È SOLO A SCOPO EDUCATIVO E INFORMATIVO.**

- Non costituisce consulenza finanziaria
- Il trading comporta rischi significativi
- I risultati passati non garantiscono performance future
- Testa sempre in demo prima di usare capitale reale
- L'autore non è responsabile per perdite derivanti dall'uso

---

## 📜 Licenza

Copyright © 2025 - Tutti i diritti riservati

Uso consentito solo per scopi personali. Vietata la distribuzione commerciale senza autorizzazione.

---

## 🎯 Caratteristiche Future (Roadmap)

- [ ] Aggiunta gestione multiple sessioni (London, New York)
- [ ] Filtro volume per conferma breakout
- [ ] Modalità trailing stop opzionale
- [ ] Esportazione segnali in CSV
- [ ] Dashboard con statistiche giornaliere/settimanali
- [ ] Integrazione con Telegram per notifiche
- [ ] Backtest automatico con report performance

---

**Buon Trading! 📈**
