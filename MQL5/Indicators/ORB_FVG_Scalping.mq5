//+------------------------------------------------------------------+
//|                                            ORB_FVG_Scalping.mq5 |
//|                                      Indicatore Opening Range    |
//|                                      con Fair Value Gap Detection|
//+------------------------------------------------------------------+
#property copyright "Trading Strategy Indicator"
#property link      ""
#property version   "1.00"
#property description "Strategia ORB + FVG per scalping intraday"
#property indicator_chart_window
#property indicator_buffers 0
#property indicator_plots   0

//--- Parametri Input
input group "===== ORARI APERTURA ====="
input int       MarketOpenHour      = 9;        // Ora apertura (EST)
input int       MarketOpenMinute    = 30;       // Minuti apertura (EST)
input int       BrokerTimeZoneGMT   = 2;        // Fuso orario broker (GMT+)
input int       TimeframeOR         = 5;        // Timeframe Opening Range (minuti)

input group "===== VISUALIZZAZIONE ====="
input bool      ShowORLines         = true;     // Mostra linee OR High/Low
input bool      ShowFVGBoxes        = true;     // Mostra rettangoli FVG
input bool      ShowEntrySignals    = true;     // Mostra frecce entry
input bool      ShowSLTP            = true;     // Mostra Stop Loss e Take Profit
input bool      ShowInfoPanel       = true;     // Mostra pannello info

input group "===== COLORI ====="
input color     ColorBullishFVG     = clrLime;          // Colore FVG rialzista
input color     ColorBearishFVG     = clrRed;           // Colore FVG ribassista
input color     ColorORHigh         = clrDodgerBlue;    // Colore linea OR High
input color     ColorORLow          = clrOrange;        // Colore linea OR Low
input color     ColorStopLoss       = clrRed;           // Colore Stop Loss
input color     ColorTakeProfit     = clrGreen;         // Colore Take Profit

input group "===== RISK MANAGEMENT ====="
input double    RiskRewardRatio     = 2.0;      // Risk/Reward Ratio

input group "===== FILTRI ====="
input int       MinGapSize          = 5;        // Gap minimo (pips)
input int       MaxCandleSize       = 50;       // Dimensione max candela (pips)
input int       MaxTimeWindow       = 60;       // Tempo max setup (minuti dopo OR)

input group "===== ALERT ====="
input bool      AlertOnSignal       = true;     // Alert su nuovo segnale
input bool      AlertSound          = true;     // Alert sonoro
input bool      AlertPush           = false;    // Notifica push

//--- Variabili Globali
double g_ORHigh = 0.0;              // High dell'Opening Range
double g_ORLow = 0.0;               // Low dell'Opening Range
datetime g_ORTime = 0;              // Timestamp Opening Range
datetime g_CurrentDay = 0;          // Giorno corrente per reset
bool g_ORSet = false;               // Flag: OR impostato
bool g_WeakBreakoutHigh = false;    // Flag: rottura debole verso l'alto
bool g_WeakBreakoutLow = false;     // Flag: rottura debole verso il basso
int g_SignalsToday = 0;             // Contatore segnali giornalieri
datetime g_LastSignalTime = 0;      // Timestamp ultimo segnale
string g_LastSignalType = "";       // Tipo ultimo segnale (LONG/SHORT)

//--- Struttura per memorizzare FVG attivi
struct FVGData
{
    datetime time;
    double priceTop;
    double priceBottom;
    bool isBullish;
    string objectName;
};
FVGData g_ActiveFVGs[];

//--- Struttura per memorizzare setup attivi
struct TradeSetup
{
    datetime time;
    string type;            // "LONG" o "SHORT"
    double entry;
    double stopLoss;
    double takeProfit;
    double risk;
    bool active;
    string arrowName;
    string slLineName;
    string tpLineName;
};
TradeSetup g_ActiveSetups[];

//+------------------------------------------------------------------+
//| Expert initialization function                                    |
//+------------------------------------------------------------------+
int OnInit()
{
    Print("ORB_FVG_Scalping Indicator - Inizializzazione...");

    // Reset variabili
    g_ORHigh = 0.0;
    g_ORLow = 0.0;
    g_ORTime = 0;
    g_ORSet = false;
    g_CurrentDay = 0;
    g_SignalsToday = 0;
    g_WeakBreakoutHigh = false;
    g_WeakBreakoutLow = false;

    ArrayResize(g_ActiveFVGs, 0);
    ArrayResize(g_ActiveSetups, 0);

    // Pulizia oggetti precedenti
    CleanupOldObjects();

    Print("Indicatore inizializzato. Timeframe: ", TimeframeOR, " minuti, Orario apertura: ",
          MarketOpenHour, ":", MarketOpenMinute, " EST");

    return(INIT_SUCCEEDED);
}

//+------------------------------------------------------------------+
//| Expert deinitialization function                                  |
//+------------------------------------------------------------------+
void OnDeinit(const int reason)
{
    Print("ORB_FVG_Scalping - Deinizializzazione. Reason: ", reason);

    // Opzionale: rimuovi tutti gli oggetti creati dall'indicatore
    // CleanupAllObjects();
}

//+------------------------------------------------------------------+
//| Custom indicator iteration function                               |
//+------------------------------------------------------------------+
int OnCalculate(const int rates_total,
                const int prev_calculated,
                const datetime &time[],
                const double &open[],
                const double &high[],
                const double &low[],
                const double &close[],
                const long &tick_volume[],
                const long &volume[],
                const int &spread[])
{
    // Verifica cambio giorno
    CheckNewDay();

    // FASE 1: Identifica Opening Range se non ancora impostato
    if(!g_ORSet)
    {
        GetOpeningRange();
    }

    // Se OR è impostato, procedi con il resto della logica
    if(g_ORSet)
    {
        // Disegna linee OR se abilitato
        if(ShowORLines)
        {
            DrawORLines();
        }

        // FASE 2: Cerca Fair Value Gaps
        if(ShowFVGBoxes || ShowEntrySignals)
        {
            DetectFVG();
        }

        // FASE 3: Aggiorna Info Panel
        if(ShowInfoPanel)
        {
            UpdateInfoPanel();
        }

        // FASE 4: Controlla se SL o TP sono stati raggiunti
        CheckSLTPHit();
    }

    return(rates_total);
}

//+------------------------------------------------------------------+
//| Verifica se è un nuovo giorno e resetta le variabili             |
//+------------------------------------------------------------------+
void CheckNewDay()
{
    datetime currentTime = TimeCurrent();
    MqlDateTime dt;
    TimeToStruct(currentTime, dt);

    datetime todayStart = StringToTime(StringFormat("%04d.%02d.%02d 00:00",
                                       dt.year, dt.mon, dt.day));

    if(g_CurrentDay != todayStart)
    {
        // Nuovo giorno - reset
        Print("Nuovo giorno rilevato. Reset variabili.");
        g_CurrentDay = todayStart;
        g_ORSet = false;
        g_ORHigh = 0.0;
        g_ORLow = 0.0;
        g_ORTime = 0;
        g_SignalsToday = 0;
        g_WeakBreakoutHigh = false;
        g_WeakBreakoutLow = false;
        g_LastSignalTime = 0;
        g_LastSignalType = "";

        // Pulizia oggetti vecchi (opzionale)
        CleanupOldObjects();
    }
}

//+------------------------------------------------------------------+
//| Converte orario EST in orario del broker                         |
//+------------------------------------------------------------------+
datetime ConvertESTToBrokerTime(int estHour, int estMinute)
{
    // Ottieni data corrente
    datetime currentTime = TimeCurrent();
    MqlDateTime dt;
    TimeToStruct(currentTime, dt);

    // Crea timestamp per orario EST richiesto
    // EST = GMT-5 (o GMT-4 durante EDT)
    // Dobbiamo determinare se siamo in EDT o EST
    bool isDST = IsDaylightSavingTime(currentTime);
    int estOffset = isDST ? -4 : -5;  // GMT offset per EST/EDT

    // Calcola orario GMT dell'apertura
    int gmtHour = estHour - estOffset;

    // Converti in orario broker (GMT + BrokerTimeZoneGMT)
    int brokerHour = gmtHour + BrokerTimeZoneGMT;

    // Gestisci overflow/underflow ore
    if(brokerHour >= 24)
    {
        brokerHour -= 24;
        dt.day += 1;
    }
    else if(brokerHour < 0)
    {
        brokerHour += 24;
        dt.day -= 1;
    }

    dt.hour = brokerHour;
    dt.min = estMinute;
    dt.sec = 0;

    return StructToTime(dt);
}

//+------------------------------------------------------------------+
//| Determina se è attivo Daylight Saving Time (semplificato)        |
//+------------------------------------------------------------------+
bool IsDaylightSavingTime(datetime time)
{
    // Semplificazione: DST USA va dalla seconda domenica di marzo
    // alla prima domenica di novembre
    MqlDateTime dt;
    TimeToStruct(time, dt);

    // Tra aprile e ottobre sicuramente DST
    if(dt.mon >= 4 && dt.mon <= 10)
        return true;

    // Novembre-Febbraio sicuramente no DST
    if(dt.mon >= 11 || dt.mon <= 2)
        return false;

    // Marzo: controlla se è dopo la seconda domenica
    // (logica semplificata, potrebbe non essere precisa al 100%)
    return (dt.mon == 3 && dt.day >= 8);
}

//+------------------------------------------------------------------+
//| Identifica e memorizza l'Opening Range                           |
//+------------------------------------------------------------------+
void GetOpeningRange()
{
    datetime targetTime = ConvertESTToBrokerTime(MarketOpenHour, MarketOpenMinute);

    // Cerca la candela del timeframe specificato
    ENUM_TIMEFRAMES tf = GetTimeframe(TimeframeOR);

    // Ottieni il numero di candele disponibili
    int bars = iBars(_Symbol, tf);
    if(bars < 2)
        return;

    // Cerca la candela che inizia all'orario target (o la più vicina)
    for(int i = 0; i < MathMin(bars, 100); i++)  // Cerca nelle ultime 100 candele
    {
        datetime barTime = iTime(_Symbol, tf, i);

        // Controlla se questa è la candela dell'opening range
        MqlDateTime dtBar, dtTarget;
        TimeToStruct(barTime, dtBar);
        TimeToStruct(targetTime, dtTarget);

        // Stessa data e orario
        if(dtBar.year == dtTarget.year &&
           dtBar.mon == dtTarget.mon &&
           dtBar.day == dtTarget.day &&
           dtBar.hour == dtTarget.hour &&
           dtBar.min == dtTarget.min)
        {
            // Trovata! Imposta OR
            g_ORHigh = iHigh(_Symbol, tf, i);
            g_ORLow = iLow(_Symbol, tf, i);
            g_ORTime = barTime;
            g_ORSet = true;

            double rangePoints = (g_ORHigh - g_ORLow) / _Point;
            Print("Opening Range identificato: High=", g_ORHigh,
                  " Low=", g_ORLow, " Range=", rangePoints, " points");

            // Verifica validità del range
            if(rangePoints < 20)  // Range troppo piccolo
            {
                Print("ATTENZIONE: Opening Range molto ristretto (", rangePoints, " points)");
            }

            break;
        }
    }
}

//+------------------------------------------------------------------+
//| Converte intero minuti in ENUM_TIMEFRAMES                        |
//+------------------------------------------------------------------+
ENUM_TIMEFRAMES GetTimeframe(int minutes)
{
    switch(minutes)
    {
        case 1: return PERIOD_M1;
        case 5: return PERIOD_M5;
        case 15: return PERIOD_M15;
        case 30: return PERIOD_M30;
        case 60: return PERIOD_H1;
        default: return PERIOD_M5;
    }
}

//+------------------------------------------------------------------+
//| Disegna le linee dell'Opening Range                              |
//+------------------------------------------------------------------+
void DrawORLines()
{
    if(!g_ORSet)
        return;

    string nameHigh = "ORB_Line_High";
    string nameLow = "ORB_Line_Low";

    // Linea OR High
    if(ObjectFind(0, nameHigh) < 0)
    {
        ObjectCreate(0, nameHigh, OBJ_HLINE, 0, 0, g_ORHigh);
        ObjectSetInteger(0, nameHigh, OBJPROP_COLOR, ColorORHigh);
        ObjectSetInteger(0, nameHigh, OBJPROP_STYLE, STYLE_SOLID);
        ObjectSetInteger(0, nameHigh, OBJPROP_WIDTH, 2);
        ObjectSetInteger(0, nameHigh, OBJPROP_BACK, false);
        ObjectSetInteger(0, nameHigh, OBJPROP_SELECTABLE, false);
        ObjectSetString(0, nameHigh, OBJPROP_TEXT, "OR High");
    }
    else
    {
        ObjectSetDouble(0, nameHigh, OBJPROP_PRICE, g_ORHigh);
    }

    // Linea OR Low
    if(ObjectFind(0, nameLow) < 0)
    {
        ObjectCreate(0, nameLow, OBJ_HLINE, 0, 0, g_ORLow);
        ObjectSetInteger(0, nameLow, OBJPROP_COLOR, ColorORLow);
        ObjectSetInteger(0, nameLow, OBJPROP_STYLE, STYLE_SOLID);
        ObjectSetInteger(0, nameLow, OBJPROP_WIDTH, 2);
        ObjectSetInteger(0, nameLow, OBJPROP_BACK, false);
        ObjectSetInteger(0, nameLow, OBJPROP_SELECTABLE, false);
        ObjectSetString(0, nameLow, OBJPROP_TEXT, "OR Low");
    }
    else
    {
        ObjectSetDouble(0, nameLow, OBJPROP_PRICE, g_ORLow);
    }
}

//+------------------------------------------------------------------+
//| Rileva Fair Value Gaps validi                                    |
//+------------------------------------------------------------------+
void DetectFVG()
{
    if(!g_ORSet)
        return;

    // Controlla finestra temporale massima
    datetime currentTime = TimeCurrent();
    int minutesSinceOR = (int)((currentTime - g_ORTime) / 60);

    if(minutesSinceOR > MaxTimeWindow)
        return;  // Fuori dalla finestra temporale

    // Lavoriamo su timeframe M1 per rilevare FVG
    ENUM_TIMEFRAMES tf = PERIOD_M1;
    int bars = iBars(_Symbol, tf);

    if(bars < 4)
        return;

    // Controlla le ultime 3 candele (C1=i+2, C2=i+1, C3=i)
    // i=0 è la candela corrente, quindi controlliamo da i=1 (ultima completa)
    for(int i = 1; i < MathMin(bars - 2, 50); i++)  // Controlla ultime 50 candele
    {
        datetime timeC3 = iTime(_Symbol, tf, i);

        // Se questa candela è prima dell'OR, ignora
        if(timeC3 <= g_ORTime)
            continue;

        // Verifica se abbiamo già processato questa candela
        if(WasCandleProcessed(timeC3))
            continue;

        // Ottieni dati delle 3 candele
        double C1_High = iHigh(_Symbol, tf, i+2);
        double C1_Low = iLow(_Symbol, tf, i+2);
        double C1_Close = iClose(_Symbol, tf, i+2);

        double C2_High = iHigh(_Symbol, tf, i+1);
        double C2_Low = iLow(_Symbol, tf, i+1);
        double C2_Close = iClose(_Symbol, tf, i+1);

        double C3_High = iHigh(_Symbol, tf, i);
        double C3_Low = iLow(_Symbol, tf, i);
        double C3_Close = iClose(_Symbol, tf, i);
        datetime C3_Time = timeC3;

        // BULLISH FVG
        bool isBullishFVG = false;
        if(C2_Low > C1_High)  // Gap tra C1 e C2
        {
            double gapSize = (C2_Low - C1_High) / _Point;

            // Verifica condizioni
            if(gapSize >= MinGapSize &&  // Gap minimo
               C3_Close > g_ORHigh)      // C3 chiude sopra OR High
            {
                double candleSize = (C2_High - C2_Low) / _Point;

                if(candleSize <= MaxCandleSize)  // Non è uno spike anomalo
                {
                    isBullishFVG = true;

                    // Disegna FVG Box
                    if(ShowFVGBoxes)
                    {
                        DrawFVGBox(iTime(_Symbol, tf, i+2), iTime(_Symbol, tf, i),
                                   C1_High, C2_Low, true);
                    }

                    // Genera segnale LONG
                    if(ShowEntrySignals)
                    {
                        GenerateSignal("LONG", C3_Time, C3_Close, C2_Low, tf, i);
                    }
                }
            }
        }

        // BEARISH FVG
        bool isBearishFVG = false;
        if(C2_High < C1_Low)  // Gap tra C1 e C2
        {
            double gapSize = (C1_Low - C2_High) / _Point;

            // Verifica condizioni
            if(gapSize >= MinGapSize &&  // Gap minimo
               C3_Close < g_ORLow)       // C3 chiude sotto OR Low
            {
                double candleSize = (C2_High - C2_Low) / _Point;

                if(candleSize <= MaxCandleSize)  // Non è uno spike anomalo
                {
                    isBearishFVG = true;

                    // Disegna FVG Box
                    if(ShowFVGBoxes)
                    {
                        DrawFVGBox(iTime(_Symbol, tf, i+2), iTime(_Symbol, tf, i),
                                   C2_High, C1_Low, false);
                    }

                    // Genera segnale SHORT
                    if(ShowEntrySignals)
                    {
                        GenerateSignal("SHORT", C3_Time, C3_Close, C2_High, tf, i);
                    }
                }
            }
        }

        // Se trovato FVG, interrompi (un setup alla volta)
        if(isBullishFVG || isBearishFVG)
            break;
    }
}

//+------------------------------------------------------------------+
//| Verifica se una candela è già stata processata                   |
//+------------------------------------------------------------------+
bool WasCandleProcessed(datetime candleTime)
{
    // Controlla se esiste già un setup per questo timestamp
    for(int i = 0; i < ArraySize(g_ActiveSetups); i++)
    {
        if(g_ActiveSetups[i].time == candleTime)
            return true;
    }
    return false;
}

//+------------------------------------------------------------------+
//| Disegna un rettangolo per evidenziare il FVG                     |
//+------------------------------------------------------------------+
void DrawFVGBox(datetime time1, datetime time2, double price1, double price2, bool isBullish)
{
    string name = "ORB_FVG_" + TimeToString(time2, TIME_DATE|TIME_MINUTES);

    if(ObjectFind(0, name) >= 0)
        return;  // Già esiste

    ObjectCreate(0, name, OBJ_RECTANGLE, 0, time1, price1, time2, price2);

    color boxColor = isBullish ? ColorBullishFVG : ColorBearishFVG;
    ObjectSetInteger(0, name, OBJPROP_COLOR, boxColor);
    ObjectSetInteger(0, name, OBJPROP_FILL, true);
    ObjectSetInteger(0, name, OBJPROP_BACK, true);
    ObjectSetInteger(0, name, OBJPROP_SELECTABLE, false);
    ObjectSetInteger(0, name, OBJPROP_WIDTH, 1);
    ObjectSetString(0, name, OBJPROP_TEXT, isBullish ? "Bullish FVG" : "Bearish FVG");

    // Trasparenza 85% (0-255: 255 = opaco, 0 = trasparente)
    // 85% trasparenza = 15% opacità = circa 38
    ObjectSetInteger(0, name, OBJPROP_BGCOLOR, boxColor);

    // Memorizza FVG
    int size = ArraySize(g_ActiveFVGs);
    ArrayResize(g_ActiveFVGs, size + 1);
    g_ActiveFVGs[size].time = time2;
    g_ActiveFVGs[size].priceTop = MathMax(price1, price2);
    g_ActiveFVGs[size].priceBottom = MathMin(price1, price2);
    g_ActiveFVGs[size].isBullish = isBullish;
    g_ActiveFVGs[size].objectName = name;
}

//+------------------------------------------------------------------+
//| Genera un segnale di entry con calcolo SL/TP                     |
//+------------------------------------------------------------------+
void GenerateSignal(string type, datetime time, double entry, double refPrice,
                    ENUM_TIMEFRAMES tf, int candleIndex)
{
    // Calcola Stop Loss
    double stopLoss = 0.0;

    if(type == "LONG")
    {
        // SL = Low della candela che ha chiuso sopra ORHigh
        // Cerchiamo tra le candele recenti quale ha chiuso sopra ORHigh per prima
        for(int j = candleIndex; j <= candleIndex + 3; j++)
        {
            double closePrice = iClose(_Symbol, tf, j);
            if(closePrice > g_ORHigh)
            {
                stopLoss = iLow(_Symbol, tf, j);
                break;
            }
        }

        if(stopLoss == 0.0)
            stopLoss = refPrice;  // Fallback
    }
    else  // SHORT
    {
        // SL = High della candela che ha chiuso sotto ORLow
        for(int j = candleIndex; j <= candleIndex + 3; j++)
        {
            double closePrice = iClose(_Symbol, tf, j);
            if(closePrice < g_ORLow)
            {
                stopLoss = iHigh(_Symbol, tf, j);
                break;
            }
        }

        if(stopLoss == 0.0)
            stopLoss = refPrice;  // Fallback
    }

    // Calcola Risk e Take Profit
    double risk = MathAbs(entry - stopLoss);
    double takeProfit = 0.0;

    if(type == "LONG")
    {
        takeProfit = entry + (risk * RiskRewardRatio);
    }
    else  // SHORT
    {
        takeProfit = entry - (risk * RiskRewardRatio);
    }

    // Disegna freccia di entry
    string arrowName = "ORB_Arrow_" + type + "_" + TimeToString(time, TIME_DATE|TIME_MINUTES);

    if(ObjectFind(0, arrowName) < 0)
    {
        int arrowCode = (type == "LONG") ? 233 : 234;  // 233=↑, 234=↓
        color arrowColor = (type == "LONG") ? clrLime : clrRed;

        ObjectCreate(0, arrowName, OBJ_ARROW, 0, time, entry);
        ObjectSetInteger(0, arrowName, OBJPROP_ARROWCODE, arrowCode);
        ObjectSetInteger(0, arrowName, OBJPROP_COLOR, arrowColor);
        ObjectSetInteger(0, arrowName, OBJPROP_WIDTH, 3);
        ObjectSetInteger(0, arrowName, OBJPROP_BACK, false);
        ObjectSetInteger(0, arrowName, OBJPROP_SELECTABLE, false);
        ObjectSetString(0, arrowName, OBJPROP_TEXT, type);
    }

    // Disegna SL e TP
    string slName = "";
    string tpName = "";

    if(ShowSLTP)
    {
        slName = DrawSLTPLine(time, stopLoss, "SL", ColorStopLoss);
        tpName = DrawSLTPLine(time, takeProfit, "TP", ColorTakeProfit);
    }

    // Memorizza setup
    int size = ArraySize(g_ActiveSetups);
    ArrayResize(g_ActiveSetups, size + 1);
    g_ActiveSetups[size].time = time;
    g_ActiveSetups[size].type = type;
    g_ActiveSetups[size].entry = entry;
    g_ActiveSetups[size].stopLoss = stopLoss;
    g_ActiveSetups[size].takeProfit = takeProfit;
    g_ActiveSetups[size].risk = risk;
    g_ActiveSetups[size].active = true;
    g_ActiveSetups[size].arrowName = arrowName;
    g_ActiveSetups[size].slLineName = slName;
    g_ActiveSetups[size].tpLineName = tpName;

    // Aggiorna contatori
    g_SignalsToday++;
    g_LastSignalTime = time;
    g_LastSignalType = type;

    // Log
    double riskPoints = risk / _Point;
    Print("===== NUOVO SEGNALE ", type, " =====");
    Print("Entry: ", entry);
    Print("Stop Loss: ", stopLoss);
    Print("Take Profit: ", takeProfit);
    Print("Risk: ", riskPoints, " points");
    Print("R:R: 1:", RiskRewardRatio);

    // Alert
    if(AlertOnSignal)
    {
        SendAlert(type, entry, stopLoss, takeProfit);
    }
}

//+------------------------------------------------------------------+
//| Disegna una linea per Stop Loss o Take Profit                    |
//+------------------------------------------------------------------+
string DrawSLTPLine(datetime time, double price, string label, color lineColor)
{
    string name = "ORB_" + label + "_" + TimeToString(time, TIME_DATE|TIME_MINUTES);

    if(ObjectFind(0, name) >= 0)
        return name;  // Già esiste

    // Crea linea tratteggiata
    ObjectCreate(0, name, OBJ_HLINE, 0, 0, price);
    ObjectSetInteger(0, name, OBJPROP_COLOR, lineColor);
    ObjectSetInteger(0, name, OBJPROP_STYLE, STYLE_DASH);
    ObjectSetInteger(0, name, OBJPROP_WIDTH, 1);
    ObjectSetInteger(0, name, OBJPROP_BACK, false);
    ObjectSetInteger(0, name, OBJPROP_SELECTABLE, false);

    string text = label + ": " + DoubleToString(price, _Digits);
    ObjectSetString(0, name, OBJPROP_TEXT, text);

    return name;
}

//+------------------------------------------------------------------+
//| Invia alert quando si forma un setup                             |
//+------------------------------------------------------------------+
void SendAlert(string type, double entry, double stopLoss, double takeProfit)
{
    string message = StringFormat("ORB FVG Setup: %s su %s | Entry: %s | SL: %s | TP: %s | R:R 1:%.1f",
                                  type, _Symbol,
                                  DoubleToString(entry, _Digits),
                                  DoubleToString(stopLoss, _Digits),
                                  DoubleToString(takeProfit, _Digits),
                                  RiskRewardRatio);

    // Alert popup
    Alert(message);

    // Alert sonoro
    if(AlertSound)
    {
        PlaySound("alert.wav");
    }

    // Notifica push
    if(AlertPush)
    {
        SendNotification(message);
    }
}

//+------------------------------------------------------------------+
//| Controlla se SL o TP sono stati raggiunti                        |
//+------------------------------------------------------------------+
void CheckSLTPHit()
{
    double currentPrice = SymbolInfoDouble(_Symbol, SYMBOL_BID);

    for(int i = 0; i < ArraySize(g_ActiveSetups); i++)
    {
        if(!g_ActiveSetups[i].active)
            continue;

        bool hit = false;
        string result = "";

        if(g_ActiveSetups[i].type == "LONG")
        {
            if(currentPrice <= g_ActiveSetups[i].stopLoss)
            {
                hit = true;
                result = "Stop Loss";
            }
            else if(currentPrice >= g_ActiveSetups[i].takeProfit)
            {
                hit = true;
                result = "Take Profit";
            }
        }
        else  // SHORT
        {
            if(currentPrice >= g_ActiveSetups[i].stopLoss)
            {
                hit = true;
                result = "Stop Loss";
            }
            else if(currentPrice <= g_ActiveSetups[i].takeProfit)
            {
                hit = true;
                result = "Take Profit";
            }
        }

        if(hit)
        {
            Print("Setup ", g_ActiveSetups[i].type, " chiuso: ", result);
            g_ActiveSetups[i].active = false;

            // Opzionale: cambia colore delle linee o rimuovile
            if(g_ActiveSetups[i].slLineName != "")
                ObjectSetInteger(0, g_ActiveSetups[i].slLineName, OBJPROP_STYLE, STYLE_DOT);
            if(g_ActiveSetups[i].tpLineName != "")
                ObjectSetInteger(0, g_ActiveSetups[i].tpLineName, OBJPROP_STYLE, STYLE_DOT);
        }
    }
}

//+------------------------------------------------------------------+
//| Aggiorna il pannello informativo                                 |
//+------------------------------------------------------------------+
void UpdateInfoPanel()
{
    if(!g_ORSet)
        return;

    string labelName = "ORB_InfoPanel";
    int x = 10;
    int y = 30;

    double rangePoints = (g_ORHigh - g_ORLow) / _Point;
    double rangePips = rangePoints / 10.0;  // Converti in pips (per 5 digit broker)

    string timeStr = (g_LastSignalTime > 0) ? TimeToString(g_LastSignalTime, TIME_MINUTES) : "Nessuno";
    string typeStr = (g_LastSignalType != "") ? g_LastSignalType : "-";

    string statusStr = "Waiting";
    if(g_SignalsToday > 0)
    {
        bool anyActive = false;
        for(int i = 0; i < ArraySize(g_ActiveSetups); i++)
        {
            if(g_ActiveSetups[i].active)
            {
                anyActive = true;
                break;
            }
        }
        statusStr = anyActive ? "Active" : "Closed";
    }

    string text = StringFormat(
        "═══ ORB FVG SCALPING ═══\n" +
        "OR High: %s\n" +
        "OR Low: %s\n" +
        "OR Range: %.1f pips\n" +
        "Segnali oggi: %d\n" +
        "Ultimo segnale: %s alle %s\n" +
        "Stato: %s",
        DoubleToString(g_ORHigh, _Digits),
        DoubleToString(g_ORLow, _Digits),
        rangePips,
        g_SignalsToday,
        typeStr,
        timeStr,
        statusStr
    );

    // Crea o aggiorna label
    if(ObjectFind(0, labelName) < 0)
    {
        ObjectCreate(0, labelName, OBJ_LABEL, 0, 0, 0);
        ObjectSetInteger(0, labelName, OBJPROP_CORNER, CORNER_LEFT_UPPER);
        ObjectSetInteger(0, labelName, OBJPROP_XDISTANCE, x);
        ObjectSetInteger(0, labelName, OBJPROP_YDISTANCE, y);
        ObjectSetInteger(0, labelName, OBJPROP_COLOR, clrWhite);
        ObjectSetInteger(0, labelName, OBJPROP_FONTSIZE, 9);
        ObjectSetString(0, labelName, OBJPROP_FONT, "Courier New");
        ObjectSetInteger(0, labelName, OBJPROP_SELECTABLE, false);
    }

    ObjectSetString(0, labelName, OBJPROP_TEXT, text);
}

//+------------------------------------------------------------------+
//| Rimuove oggetti grafici vecchi                                   |
//+------------------------------------------------------------------+
void CleanupOldObjects()
{
    // Rimuovi oggetti del giorno precedente (opzionale)
    // Per ora, lasciamo gli oggetti visibili per analisi storica

    // Potresti implementare logica per rimuovere oggetti più vecchi di N giorni
}

//+------------------------------------------------------------------+
//| Rimuove tutti gli oggetti creati dall'indicatore                 |
//+------------------------------------------------------------------+
void CleanupAllObjects()
{
    int total = ObjectsTotal(0);

    for(int i = total - 1; i >= 0; i--)
    {
        string name = ObjectName(0, i);

        // Rimuovi solo oggetti creati da questo indicatore
        if(StringFind(name, "ORB_") == 0)
        {
            ObjectDelete(0, name);
        }
    }
}

//+------------------------------------------------------------------+
