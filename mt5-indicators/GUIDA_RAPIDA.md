# 🚀 Guida Rapida - Installazione Indicatore DAX ZigZag

## ⏱️ Installazione in 3 Minuti

### 1️⃣ Copia il File (30 secondi)

1. Apri **MetaTrader 5**
2. Clicca su **File** → **Apri cartella dati**
3. Naviga in: `MQL5\Indicators\`
4. Copia il file **`DAX_ZigZag_Strategy.mq5`** in questa cartella

### 2️⃣ Compila l'Indicatore (30 secondi)

1. Premi **F4** per aprire MetaEditor
2. Nel pannello **Navigator** (sinistra), trova:
   - `Indicators` → `DAX_ZigZag_Strategy.mq5`
3. Doppio click per aprire il file
4. Premi **F7** oppure clicca **Compile** (in alto)
5. Verifica nella scheda **Errors**: dovrebbe dire **0 error(s)**

✅ Se vedi "0 error(s), 0 warning(s)" → tutto OK!

### 3️⃣ Aggiungi al Grafico (1 minuto)

1. Torna su **MetaTrader 5** (Alt+Tab)
2. Apri un grafico **DAX** (o altro strumento)
3. Imposta timeframe **M10** (consigliato)
4. Dal **Navigator** (Ctrl+N), espandi:
   - `Indicators` → `Custom`
5. Trascina **`DAX_ZigZag_Strategy`** sul grafico
6. Nella finestra parametri:
   - Lascia i default per iniziare
   - Oppure modifica secondo necessità (vedi sotto)
7. Clicca **OK**

---

## ⚙️ Configurazione Consigliata (Principianti)

Lascia tutto di default tranne:

```
Entry_Mode = 2            (modalità consolidato - più sicura)
Enable_Alerts = true      (abilita alert)
Alert_Popup = true        (popup visibili)
Alert_Sound = true        (suono udibile)
Max_Risk_Points = 150     (limite rischio)
```

---

## ⚙️ Configurazione Avanzata (Esperti)

Per trader più aggressivi:

```
Entry_Mode = 1            (entry al tocco - più veloce)
Max_Risk_Points = 200     (accetta più rischio)
Warning_Risk_Points = 150 (warning più alto)
Alert_Push = true         (notifiche su mobile - richiede config MT5)
```

---

## 📊 Verifica Funzionamento

Dopo l'installazione dovresti vedere:

✅ **Punti colorati** sul grafico (1, 2, 3)
✅ **Linee tratteggiate** tra i punti
✅ **Linee orizzontali** gialle (entry), rosse (stop), verdi (target)
✅ **Zone semi-trasparenti** rosse e verdi
✅ **Pannello informativo** in alto a sinistra

Se non vedi nulla:
- Attendi qualche minuto (pattern potrebbero non esserci ancora)
- Scorri indietro nel grafico per vedere pattern passati
- Verifica parametri ZigZag (prova aumentare `ZigZag_Depth` a 24)

---

## 🔔 Configurare Alert Mobile (Opzionale)

Per ricevere notifiche sul telefono:

### Su MT5 Desktop:
1. **Strumenti** → **Opzioni** → **Notifiche**
2. Abilita **"Abilita notifiche push"**
3. Annota il **MetaQuotes ID**

### Su MT5 Mobile (Android/iOS):
1. Installa app **MetaTrader 5**
2. Apri app → **Impostazioni** → **Chat e Messaggi**
3. Inserisci il **MetaQuotes ID** (dal desktop)

### Nell'Indicatore:
1. Parametri indicatore → `Alert_Push = true`
2. Salva

✅ Ora riceverai notifiche push su mobile!

---

## 📧 Configurare Alert Email (Opzionale)

Per ricevere email:

1. **Strumenti** → **Opzioni** → **Email**
2. Configura server SMTP:
   ```
   Server SMTP: smtp.gmail.com (per Gmail)
   Porta: 465
   Login: tua-email@gmail.com
   Password: [App Password se Gmail]
   ```
3. Testa con **"Test"**
4. Nell'indicatore: `Alert_Email = true`

⚠️ **Gmail richiede "App Password"**, non la password normale.

---

## 🎯 Primi Passi

### 1. Osserva Qualche Giorno
- Lascia girare l'indicatore in modalità **osservazione**
- Annota i setup sul **paper trading** (trading simulato)
- Studia come si formano i pattern

### 2. Testa su Demo
- Apri **account demo** su MT5
- Opera i segnali per 1-2 settimane
- Valuta win rate e P&L

### 3. Passa a Live (se profittevole)
- Inizia con **micro lotti** (0.01)
- Usa **stop loss** sempre
- Non rischiare più dell'**1-2%** per trade

---

## 🎨 Personalizzazione Grafica

Se i colori non ti piacciono:

```
Color_Long = clrBlue          → Cambia colore setup LONG
Color_Short = clrRed          → Cambia colore setup SHORT
Color_Entry = clrYellow       → Cambia colore linea entry
Color_Stop = clrRed           → Cambia colore stop loss
Color_Target = clrLimeGreen   → Cambia colore target
```

Colori disponibili: `clrRed`, `clrBlue`, `clrGreen`, `clrYellow`, `clrWhite`, `clrBlack`, `clrOrange`, `clrPink`, etc.

---

## 📈 Ottimizzazione per Altri Strumenti

L'indicatore funziona su qualsiasi strumento, ma i parametri ottimali variano:

### Per EUR/USD (M15)
```
ZigZag_Deviation = 0.2%
Target_Points = 20
Max_Risk_Points = 80
```

### Per S&P 500 (M30)
```
ZigZag_Deviation = 0.4%
Target_Points = 30
Max_Risk_Points = 100
```

### Per Bitcoin (H1)
```
ZigZag_Deviation = 0.5%
Target_Points = 200
Max_Risk_Points = 800
```

⚠️ **Testa sempre su demo prima!**

---

## ❓ FAQ Rapide

**Q: L'indicatore rallenta MT5?**
A: No, è ottimizzato. Se rallenta, riduci `Historical_Setups_Count`.

**Q: Posso usarlo su timeframe diversi da M10?**
A: Sì, funziona su tutti i TF. M10 è ottimale per DAX.

**Q: I pattern si ridisegnano?**
A: L'ultimo punto ZigZag può cambiare finché non si forma il punto successivo. Attendi conferma pattern completo.

**Q: Quanti setup al giorno?**
A: Dipende dalla volatilità. Sul DAX M10: 2-5 setup/giorno in media.

**Q: Posso modificare il codice?**
A: Sì, è completamente modificabile. Usa MetaEditor.

**Q: Funziona in modalità backtest?**
A: Sì, ma ricorda che ZigZag ha ridisegno intrinseco. Usa Strategy Tester con cautela.

---

## 🆘 Problemi Comuni

### ❌ "ZigZag handle invalid"
- **Causa**: ZigZag standard MT5 non trovato
- **Soluzione**: Reinstalla MT5 o scarica ZigZag da MQL5 Market

### ❌ Nessun pattern visualizzato
- **Causa**: Parametri troppo stretti o poche candele
- **Soluzione**: Aumenta `ZigZag_Depth` o scorri indietro nel grafico

### ❌ Alert non suonano
- **Causa**: Volume sistema a 0 o file audio mancante
- **Soluzione**: Alza volume o cambia `Alert_SoundFile`

---

## 📚 Prossimi Passi

1. ✅ Installato → Leggi [README_INDICATOR.md](README_INDICATOR.md) completo
2. ✅ Configurato → Studia la strategia DAX ZigZag
3. ✅ Testato → Analizza CSV export per performance
4. ✅ Profittevole → Scala gradualmente position size

---

## 📞 Supporto

**Documentazione completa**: [README_INDICATOR.md](README_INDICATOR.md)

**Troubleshooting**: Vedi sezione dedicata nella documentazione

---

**Buon trading! 🚀📈**

_Ricorda: Testa sempre su demo prima di usare denaro reale!_
