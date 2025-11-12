//+------------------------------------------------------------------+
//|                                        DAX_ZigZag_Strategy.mq5   |
//|                        Indicatore Strategy DAX ZigZag 0.3%       |
//|                        Versione 1.0 - © 2025                     |
//+------------------------------------------------------------------+
#property copyright "Trading Strategy Indicator"
#property link      ""
#property version   "1.00"
#property indicator_chart_window
#property indicator_buffers 0
#property indicator_plots   0

//+------------------------------------------------------------------+
//| PARAMETRI INPUT CONFIGURABILI                                     |
//+------------------------------------------------------------------+

// === Parametri ZigZag ===
input double   ZigZag_Deviation = 0.3;           // Deviazione ZigZag (%)
input int      ZigZag_Depth = 12;                // Profondità ZigZag
input int      ZigZag_Backstep = 3;              // Backstep ZigZag

// === Parametri Rischio/Target ===
input int      Max_Risk_Points = 150;            // Rischio massimo (punti)
input int      Warning_Risk_Points = 120;        // Warning rischio (punti)
input int      Target_Points = 40;               // Target fisso (punti)

// === Parametri Visualizzazione ===
input bool     Show_Pattern_Lines = true;        // Mostra linee pattern
input bool     Show_Risk_Zones = true;           // Mostra zone rischio
input bool     Show_Info_Panel = true;           // Mostra pannello info
input int      Lines_Extension = 15;             // Estensione linee (candele)

// === Parametri Entry ===
input int      Entry_Mode = 2;                   // Modalità Entry (1=tocco, 2=consolidato, 3=migliorato)
input int      Entry_Offset = 5;                 // Offset entry migliorato (punti)

// === Parametri Alert ===
input bool     Enable_Alerts = true;             // Abilita alert
input bool     Alert_Pattern = true;             // Alert pattern completato
input bool     Alert_Entry = true;               // Alert entry signal
input bool     Alert_Stop = true;                // Alert stop hit
input bool     Alert_Target = true;              // Alert target hit
input bool     Alert_Popup = true;               // Alert popup
input bool     Alert_Sound = true;               // Alert sonoro
input bool     Alert_Push = false;               // Alert push notification
input bool     Alert_Email = false;              // Alert email
input string   Alert_SoundFile = "alert.wav";    // File audio alert

// === Parametri Colori ===
input color    Color_Long = clrBlue;             // Colore setup LONG
input color    Color_Short = clrRed;             // Colore setup SHORT
input color    Color_Entry = clrYellow;          // Colore linea entry
input color    Color_Stop = clrRed;              // Colore linea stop
input color    Color_Target = clrLimeGreen;      // Colore linea target
input color    Color_Risk_Zone = clrCrimson;     // Colore zona rischio
input color    Color_Profit_Zone = clrLimeGreen; // Colore zona profitto

// === Parametri Statistiche ===
input int      Historical_Setups_Count = 50;     // Numero setup storici da tracciare
input int      Winrate_Sample = 20;              // Sample per calcolo winrate

// === Parametri Gestione Setup ===
input bool     Hide_Old_Setups = false;          // Nascondi setup vecchi
input int      Setup_Expiry_Candles = 100;       // Candele prima di nascondere setup
input int      Old_Setup_Opacity = 50;           // Opacità setup vecchi (0-100)

// === Parametri Export ===
input bool     Auto_Export_CSV = false;          // Export automatico CSV
input string   Export_Filename = "DAX_Setups.csv"; // Nome file export

//+------------------------------------------------------------------+
//| STRUTTURE DATI                                                    |
//+------------------------------------------------------------------+

// Enumerazione tipo pattern
enum ENUM_PATTERN_TYPE
{
   PATTERN_NONE = 0,
   PATTERN_LONG = 1,
   PATTERN_SHORT = 2
};

// Enumerazione stato setup
enum ENUM_SETUP_STATUS
{
   SETUP_ACTIVE = 0,
   SETUP_WIN = 1,
   SETUP_LOSS = 2,
   SETUP_EXPIRED = 3
};

// Struttura setup completo
struct SSetup
{
   datetime       time;                  // Timestamp creazione
   ENUM_PATTERN_TYPE type;               // Tipo pattern (LONG/SHORT)
   int            point1_index;          // Indice candela punto 1
   int            point2_index;          // Indice candela punto 2
   int            point3_index;          // Indice candela punto 3
   double         point1_price;          // Prezzo punto 1 (HIGH/LOW)
   double         point2_price;          // Prezzo punto 2 (LOW/HIGH)
   double         point3_price;          // Prezzo punto 3
   double         entry_price;           // Prezzo entry
   double         stop_price;            // Prezzo stop loss
   double         target_price;          // Prezzo target
   double         risk_points;           // Punti di rischio
   double         reward_points;         // Punti di reward (40)
   double         risk_reward_ratio;     // Ratio R:R
   bool           is_valid;              // Setup valido (rispetta filtri)
   ENUM_SETUP_STATUS status;             // Stato corrente
   bool           entry_triggered;       // Entry triggerata
   bool           alert_sent;            // Alert già inviato
   int            candles_since_formed;  // Candele da formazione
   double         pnl_points;            // Profit/Loss in punti
};

// Struttura punto ZigZag
struct SZigZagPoint
{
   datetime time;
   int      index;
   double   price;
   bool     is_high;    // true = high, false = low
};

//+------------------------------------------------------------------+
//| VARIABILI GLOBALI                                                 |
//+------------------------------------------------------------------+

// Array setup attivi e storici
SSetup g_ActiveSetups[];
SSetup g_HistoricalSetups[];
int g_ActiveSetupsCount = 0;
int g_HistoricalSetupsCount = 0;

// Array punti ZigZag
SZigZagPoint g_ZigZagPoints[];
int g_ZigZagCount = 0;

// Handle indicatore ZigZag
int g_ZigZagHandle = INVALID_HANDLE;

// Buffer ZigZag
double g_ZigZagBuffer[];
double g_ZigZagHighBuffer[];
double g_ZigZagLowBuffer[];

// Statistiche sessione
int g_TotalSetups = 0;
int g_WinSetups = 0;
int g_LossSetups = 0;
double g_TotalPnL = 0.0;
double g_MaxDrawdown = 0.0;
double g_CurrentDrawdown = 0.0;

// Nomi oggetti grafici (per gestione)
string g_ObjectPrefix = "DAXZZ_";

// Timestamp ultimo check
datetime g_LastCheckTime = 0;

//+------------------------------------------------------------------+
//| Funzione di inizializzazione                                     |
//+------------------------------------------------------------------+
int OnInit()
{
   // Inizializza handle ZigZag
   g_ZigZagHandle = iCustom(_Symbol, _Period, "Examples\\ZigZag",
                            ZigZag_Depth, ZigZag_Deviation, ZigZag_Backstep);

   if(g_ZigZagHandle == INVALID_HANDLE)
   {
      Print("ERRORE: Impossibile creare handle ZigZag. Verificare installazione MT5.");
      return(INIT_FAILED);
   }

   // Dimensiona array
   ArrayResize(g_ActiveSetups, 10);
   ArrayResize(g_HistoricalSetups, Historical_Setups_Count);
   ArrayResize(g_ZigZagPoints, 100);
   ArrayResize(g_ZigZagBuffer, 1000);
   ArrayResize(g_ZigZagHighBuffer, 1000);
   ArrayResize(g_ZigZagLowBuffer, 1000);

   // Inizializza contatori
   g_ActiveSetupsCount = 0;
   g_HistoricalSetupsCount = 0;
   g_ZigZagCount = 0;

   // Reset statistiche
   g_TotalSetups = 0;
   g_WinSetups = 0;
   g_LossSetups = 0;
   g_TotalPnL = 0.0;
   g_MaxDrawdown = 0.0;
   g_CurrentDrawdown = 0.0;

   // Pulisci oggetti grafici precedenti
   CleanupGraphicalObjects();

   Print("DAX ZigZag Strategy Indicator v1.0 inizializzato con successo");
   Print("Parametri: ZigZag Deviation = ", ZigZag_Deviation, "%, Max Risk = ", Max_Risk_Points, " pts, Target = ", Target_Points, " pts");

   return(INIT_SUCCEEDED);
}

//+------------------------------------------------------------------+
//| Funzione di deinizializzazione                                    |
//+------------------------------------------------------------------+
void OnDeinit(const int reason)
{
   // Rilascia handle ZigZag
   if(g_ZigZagHandle != INVALID_HANDLE)
      IndicatorRelease(g_ZigZagHandle);

   // Export automatico CSV se abilitato
   if(Auto_Export_CSV && g_HistoricalSetupsCount > 0)
   {
      ExportSetupsToCSV();
   }

   // Pulisci oggetti grafici
   CleanupGraphicalObjects();

   Print("DAX ZigZag Strategy Indicator deinizializzato");
   Print("Statistiche sessione: ", g_TotalSetups, " setup totali, ",
         g_WinSetups, " win, ", g_LossSetups, " loss, P&L: ",
         DoubleToString(g_TotalPnL, 1), " punti");
}

//+------------------------------------------------------------------+
//| Funzione principale di calcolo (chiamata ad ogni tick)           |
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
   // Verifica che ci siano abbastanza barre
   if(rates_total < 100)
      return(0);

   // Copia dati ZigZag
   if(CopyBuffer(g_ZigZagHandle, 0, 0, rates_total, g_ZigZagBuffer) <= 0)
      return(0);

   // Imposta come serie temporale
   ArraySetAsSeries(g_ZigZagBuffer, true);

   // Estrai punti ZigZag
   ExtractZigZagPoints(rates_total, time, high, low);

   // Cerca pattern 1-2-3
   DetectPatterns123(time, high, low, close);

   // Aggiorna stato setup attivi
   UpdateActiveSetups(close[0]);

   // Disegna tutto sul grafico
   DrawAll();

   // Salva timestamp
   g_LastCheckTime = time[0];

   return(rates_total);
}

//+------------------------------------------------------------------+
//| Estrae punti ZigZag dal buffer                                   |
//+------------------------------------------------------------------+
void ExtractZigZagPoints(const int rates_total,
                         const datetime &time[],
                         const double &high[],
                         const double &low[])
{
   ArraySetAsSeries(time, true);
   ArraySetAsSeries(high, true);
   ArraySetAsSeries(low, true);

   g_ZigZagCount = 0;

   // Scorri le barre per trovare punti ZigZag
   for(int i = 0; i < rates_total && i < 500; i++)
   {
      if(g_ZigZagBuffer[i] != 0.0 && g_ZigZagBuffer[i] != EMPTY_VALUE)
      {
         if(g_ZigZagCount >= ArraySize(g_ZigZagPoints))
            ArrayResize(g_ZigZagPoints, g_ZigZagCount + 50);

         g_ZigZagPoints[g_ZigZagCount].time = time[i];
         g_ZigZagPoints[g_ZigZagCount].index = i;
         g_ZigZagPoints[g_ZigZagCount].price = g_ZigZagBuffer[i];

         // Determina se è HIGH o LOW
         if(MathAbs(g_ZigZagBuffer[i] - high[i]) < MathAbs(g_ZigZagBuffer[i] - low[i]))
            g_ZigZagPoints[g_ZigZagCount].is_high = true;
         else
            g_ZigZagPoints[g_ZigZagCount].is_high = false;

         g_ZigZagCount++;
      }
   }
}

//+------------------------------------------------------------------+
//| Rileva pattern 1-2-3                                              |
//+------------------------------------------------------------------+
void DetectPatterns123(const datetime &time[],
                       const double &high[],
                       const double &low[],
                       const double &close[])
{
   ArraySetAsSeries(time, true);
   ArraySetAsSeries(high, true);
   ArraySetAsSeries(low, true);
   ArraySetAsSeries(close, true);

   // Servono almeno 3 punti ZigZag per formare un pattern
   if(g_ZigZagCount < 3)
      return;

   // Verifica gli ultimi 3 punti ZigZag
   // Pattern SHORT: HIGH (1) -> LOW (2) -> HIGH (3) dove HIGH(3) <= HIGH(1)
   // Pattern LONG: LOW (1) -> HIGH (2) -> LOW (3) dove LOW(3) >= LOW(1)

   SZigZagPoint point1 = g_ZigZagPoints[2];  // Punto più vecchio
   SZigZagPoint point2 = g_ZigZagPoints[1];  // Punto medio
   SZigZagPoint point3 = g_ZigZagPoints[0];  // Punto più recente

   // Verifica che ci sia almeno 1 onda precedente per validare trend
   if(g_ZigZagCount < 4)
      return;

   ENUM_PATTERN_TYPE patternType = PATTERN_NONE;

   // Pattern SHORT: 1=HIGH, 2=LOW, 3=HIGH con 3<=1
   if(point1.is_high && !point2.is_high && point3.is_high)
   {
      if(point3.price <= point1.price)
      {
         patternType = PATTERN_SHORT;
      }
   }

   // Pattern LONG: 1=LOW, 2=HIGH, 3=LOW con 3>=1
   if(!point1.is_high && point2.is_high && !point3.is_high)
   {
      if(point3.price >= point1.price)
      {
         patternType = PATTERN_LONG;
      }
   }

   // Se trovato un pattern, verifica se è nuovo
   if(patternType != PATTERN_NONE)
   {
      // Verifica se questo setup esiste già
      bool setupExists = false;
      for(int i = 0; i < g_ActiveSetupsCount; i++)
      {
         if(g_ActiveSetups[i].point3_index == point3.index)
         {
            setupExists = true;
            break;
         }
      }

      if(!setupExists)
      {
         // Crea nuovo setup
         CreateSetup(patternType, point1, point2, point3);
      }
   }
}

//+------------------------------------------------------------------+
//| Crea un nuovo setup                                              |
//+------------------------------------------------------------------+
void CreateSetup(ENUM_PATTERN_TYPE type,
                 SZigZagPoint &point1,
                 SZigZagPoint &point2,
                 SZigZagPoint &point3)
{
   // Espandi array se necessario
   if(g_ActiveSetupsCount >= ArraySize(g_ActiveSetups))
      ArrayResize(g_ActiveSetups, g_ActiveSetupsCount + 10);

   SSetup setup;

   // Dati base
   setup.time = TimeCurrent();
   setup.type = type;
   setup.point1_index = point1.index;
   setup.point2_index = point2.index;
   setup.point3_index = point3.index;
   setup.point1_price = point1.price;
   setup.point2_price = point2.price;
   setup.point3_price = point3.price;

   // Calcoli operativi
   setup.entry_price = point2.price;
   setup.stop_price = point1.price;
   setup.risk_points = MathAbs(setup.entry_price - setup.stop_price);
   setup.reward_points = Target_Points;

   if(type == PATTERN_LONG)
      setup.target_price = setup.entry_price + Target_Points * _Point;
   else
      setup.target_price = setup.entry_price - Target_Points * _Point;

   // Risk/Reward ratio
   if(setup.risk_points > 0)
      setup.risk_reward_ratio = setup.reward_points / (setup.risk_points / _Point);
   else
      setup.risk_reward_ratio = 0;

   // Validazione
   setup.is_valid = ValidateSetup(setup);

   // Stato
   setup.status = SETUP_ACTIVE;
   setup.entry_triggered = false;
   setup.alert_sent = false;
   setup.candles_since_formed = 0;
   setup.pnl_points = 0;

   // Aggiungi a lista attivi
   g_ActiveSetups[g_ActiveSetupsCount] = setup;
   g_ActiveSetupsCount++;
   g_TotalSetups++;

   // Alert pattern completato
   if(Enable_Alerts && Alert_Pattern && setup.is_valid)
   {
      string msg = "PATTERN " + (type == PATTERN_LONG ? "LONG" : "SHORT") +
                   " RILEVATO | Entry: " + DoubleToString(setup.entry_price, _Digits) +
                   " | Stop: " + DoubleToString(setup.stop_price, _Digits) +
                   " | Target: " + DoubleToString(setup.target_price, _Digits) +
                   " | R:R = 1:" + DoubleToString(setup.risk_reward_ratio, 2);
      SendAlert(msg);
   }
   else if(!setup.is_valid)
   {
      string msg = "PATTERN " + (type == PATTERN_LONG ? "LONG" : "SHORT") +
                   " RILEVATO MA NON VALIDO | Rischio: " +
                   DoubleToString(setup.risk_points / _Point, 1) + " pts (max: " +
                   IntegerToString(Max_Risk_Points) + " pts)";
      Print(msg);
   }

   Print("Nuovo setup ", (type == PATTERN_LONG ? "LONG" : "SHORT"),
         " creato. Valido: ", (setup.is_valid ? "SI" : "NO"),
         " | Rischio: ", DoubleToString(setup.risk_points / _Point, 1), " pts");
}

//+------------------------------------------------------------------+
//| Valida un setup secondo i filtri operativi                       |
//+------------------------------------------------------------------+
bool ValidateSetup(SSetup &setup)
{
   double riskPoints = setup.risk_points / _Point;

   // Filtro distanza massima
   if(riskPoints > Max_Risk_Points)
      return false;

   // Altri filtri potrebbero essere aggiunti qui
   // Es: filtro orario, filtro volatilità, ecc.

   return true;
}

//+------------------------------------------------------------------+
//| Aggiorna stato setup attivi                                      |
//+------------------------------------------------------------------+
void UpdateActiveSetups(double currentPrice)
{
   for(int i = g_ActiveSetupsCount - 1; i >= 0; i--)
   {
      g_ActiveSetups[i].candles_since_formed++;

      // Verifica se entry è stata triggerata
      if(!g_ActiveSetups[i].entry_triggered)
      {
         bool entryHit = false;

         if(Entry_Mode == 1) // Tocco
         {
            if(g_ActiveSetups[i].type == PATTERN_LONG)
               entryHit = (currentPrice <= g_ActiveSetups[i].entry_price);
            else
               entryHit = (currentPrice >= g_ActiveSetups[i].entry_price);
         }
         else if(Entry_Mode == 2) // Consolidato
         {
            // Verrà verificato con close[0] in OnCalculate
            if(g_ActiveSetups[i].type == PATTERN_LONG)
               entryHit = (currentPrice >= g_ActiveSetups[i].entry_price);
            else
               entryHit = (currentPrice <= g_ActiveSetups[i].entry_price);
         }

         if(entryHit)
         {
            g_ActiveSetups[i].entry_triggered = true;

            if(Enable_Alerts && Alert_Entry && !g_ActiveSetups[i].alert_sent)
            {
               string msg = "ENTRY SIGNAL " +
                           (g_ActiveSetups[i].type == PATTERN_LONG ? "LONG" : "SHORT") +
                           " @ " + DoubleToString(currentPrice, _Digits);
               SendAlert(msg);
               g_ActiveSetups[i].alert_sent = true;
            }
         }
      }

      // Verifica stop/target se entry triggerata
      if(g_ActiveSetups[i].entry_triggered && g_ActiveSetups[i].status == SETUP_ACTIVE)
      {
         bool stopHit = false;
         bool targetHit = false;

         if(g_ActiveSetups[i].type == PATTERN_LONG)
         {
            if(currentPrice <= g_ActiveSetups[i].stop_price)
               stopHit = true;
            else if(currentPrice >= g_ActiveSetups[i].target_price)
               targetHit = true;
         }
         else // SHORT
         {
            if(currentPrice >= g_ActiveSetups[i].stop_price)
               stopHit = true;
            else if(currentPrice <= g_ActiveSetups[i].target_price)
               targetHit = true;
         }

         if(stopHit)
         {
            g_ActiveSetups[i].status = SETUP_LOSS;
            g_ActiveSetups[i].pnl_points = -(g_ActiveSetups[i].risk_points / _Point);
            g_LossSetups++;
            g_TotalPnL += g_ActiveSetups[i].pnl_points;
            g_CurrentDrawdown += g_ActiveSetups[i].pnl_points;

            if(g_CurrentDrawdown < g_MaxDrawdown)
               g_MaxDrawdown = g_CurrentDrawdown;

            if(Enable_Alerts && Alert_Stop)
            {
               string msg = "STOP HIT " +
                           (g_ActiveSetups[i].type == PATTERN_LONG ? "LONG" : "SHORT") +
                           " | Loss: " + DoubleToString(g_ActiveSetups[i].pnl_points, 1) + " pts";
               SendAlert(msg);
            }

            MoveToHistorical(i);
         }
         else if(targetHit)
         {
            g_ActiveSetups[i].status = SETUP_WIN;
            g_ActiveSetups[i].pnl_points = g_ActiveSetups[i].reward_points;
            g_WinSetups++;
            g_TotalPnL += g_ActiveSetups[i].pnl_points;
            g_CurrentDrawdown += g_ActiveSetups[i].pnl_points;

            if(g_CurrentDrawdown > 0)
               g_CurrentDrawdown = 0; // Reset drawdown su vincita

            if(Enable_Alerts && Alert_Target)
            {
               string msg = "TARGET HIT " +
                           (g_ActiveSetups[i].type == PATTERN_LONG ? "LONG" : "SHORT") +
                           " | Win: " + DoubleToString(g_ActiveSetups[i].pnl_points, 1) + " pts";
               SendAlert(msg);
            }

            MoveToHistorical(i);
         }
      }

      // Gestione setup scaduti
      if(Hide_Old_Setups && g_ActiveSetups[i].candles_since_formed > Setup_Expiry_Candles)
      {
         g_ActiveSetups[i].status = SETUP_EXPIRED;
         MoveToHistorical(i);
      }
   }
}

//+------------------------------------------------------------------+
//| Sposta setup da attivi a storici                                 |
//+------------------------------------------------------------------+
void MoveToHistorical(int activeIndex)
{
   // Aggiungi a storici (FIFO)
   if(g_HistoricalSetupsCount >= Historical_Setups_Count)
   {
      // Shifta array
      for(int i = 0; i < Historical_Setups_Count - 1; i++)
         g_HistoricalSetups[i] = g_HistoricalSetups[i + 1];
      g_HistoricalSetupsCount = Historical_Setups_Count - 1;
   }

   g_HistoricalSetups[g_HistoricalSetupsCount] = g_ActiveSetups[activeIndex];
   g_HistoricalSetupsCount++;

   // Rimuovi da attivi
   for(int i = activeIndex; i < g_ActiveSetupsCount - 1; i++)
      g_ActiveSetups[i] = g_ActiveSetups[i + 1];
   g_ActiveSetupsCount--;
}

//+------------------------------------------------------------------+
//| Disegna tutti gli elementi grafici                               |
//+------------------------------------------------------------------+
void DrawAll()
{
   // Pulisci oggetti vecchi
   CleanupGraphicalObjects();

   // Disegna setup attivi
   for(int i = 0; i < g_ActiveSetupsCount; i++)
   {
      int opacity = 100;
      if(Hide_Old_Setups && g_ActiveSetups[i].candles_since_formed > (Setup_Expiry_Candles / 2))
         opacity = Old_Setup_Opacity;

      DrawSetup(g_ActiveSetups[i], i, opacity);
   }

   // Disegna info panel
   if(Show_Info_Panel)
      DrawInfoPanel();

   ChartRedraw();
}

//+------------------------------------------------------------------+
//| Disegna un singolo setup                                         |
//+------------------------------------------------------------------+
void DrawSetup(SSetup &setup, int index, int opacity)
{
   string prefix = g_ObjectPrefix + IntegerToString(index) + "_";

   color setupColor = (setup.type == PATTERN_LONG) ? Color_Long : Color_Short;
   color setupColorFaded = ColorWithOpacity(setupColor, opacity);

   // === Disegna punti ===
   datetime point1Time = iTime(_Symbol, _Period, setup.point1_index);
   datetime point2Time = iTime(_Symbol, _Period, setup.point2_index);
   datetime point3Time = iTime(_Symbol, _Period, setup.point3_index);

   // Punto 1
   DrawPoint(prefix + "P1", point1Time, setup.point1_price, setupColorFaded, "1");

   // Punto 2
   DrawPoint(prefix + "P2", point2Time, setup.point2_price, ColorWithOpacity(Color_Entry, opacity), "2");

   // Punto 3
   DrawPoint(prefix + "P3", point3Time, setup.point3_price, ColorWithOpacity(clrOrange, opacity), "3");

   // === Disegna linee pattern ===
   if(Show_Pattern_Lines)
   {
      DrawTrendLine(prefix + "L12", point1Time, setup.point1_price,
                    point2Time, setup.point2_price, setupColorFaded, STYLE_DOT);
      DrawTrendLine(prefix + "L23", point2Time, setup.point2_price,
                    point3Time, setup.point3_price, setupColorFaded, STYLE_DOT);
   }

   // === Disegna livelli operativi ===
   datetime currentTime = TimeCurrent();
   datetime extendTime = currentTime + Lines_Extension * PeriodSeconds(_Period);

   // Entry line
   DrawHorizontalLine(prefix + "Entry", point3Time, extendTime,
                      setup.entry_price, ColorWithOpacity(Color_Entry, opacity), STYLE_DASH, 1);

   // Stop line
   DrawHorizontalLine(prefix + "Stop", point3Time, extendTime,
                      setup.stop_price, ColorWithOpacity(Color_Stop, opacity), STYLE_SOLID, 2);

   // Target line
   DrawHorizontalLine(prefix + "Target", point3Time, extendTime,
                      setup.target_price, ColorWithOpacity(Color_Target, opacity), STYLE_SOLID, 2);

   // === Disegna zone rischio/profitto ===
   if(Show_Risk_Zones)
   {
      // Zona rischio (tra entry e stop)
      DrawRectangle(prefix + "RiskZone", point3Time, setup.entry_price,
                    extendTime, setup.stop_price,
                    ColorWithOpacity(Color_Risk_Zone, 20), STYLE_SOLID);

      // Zona profitto (tra entry e target)
      DrawRectangle(prefix + "ProfitZone", point3Time, setup.entry_price,
                    extendTime, setup.target_price,
                    ColorWithOpacity(Color_Profit_Zone, 20), STYLE_SOLID);
   }

   // === Label info setup ===
   string setupInfo = (setup.type == PATTERN_LONG ? "LONG" : "SHORT") + "\n" +
                      "R: " + DoubleToString(setup.risk_points / _Point, 1) + " pts\n" +
                      "RR: 1:" + DoubleToString(setup.risk_reward_ratio, 2);

   if(!setup.is_valid)
      setupInfo += "\n[INVALID]";

   DrawText(prefix + "Info", point3Time, setup.point3_price, setupInfo,
            setupColorFaded, 8);
}

//+------------------------------------------------------------------+
//| Disegna pannello informativo                                     |
//+------------------------------------------------------------------+
void DrawInfoPanel()
{
   string panelText = "═══ DAX ZIGZAG STRATEGY ═══\n\n";

   // Setup attivo più recente
   if(g_ActiveSetupsCount > 0)
   {
      SSetup lastSetup = g_ActiveSetups[g_ActiveSetupsCount - 1];

      panelText += "ULTIMO SETUP: " + (lastSetup.type == PATTERN_LONG ? "LONG" : "SHORT") + "\n";
      panelText += "Entry:  " + DoubleToString(lastSetup.entry_price, _Digits) + "\n";
      panelText += "Stop:   " + DoubleToString(lastSetup.stop_price, _Digits) + "\n";
      panelText += "Target: " + DoubleToString(lastSetup.target_price, _Digits) + "\n";
      panelText += "Risk:   " + DoubleToString(lastSetup.risk_points / _Point, 1) + " pts\n";
      panelText += "Reward: " + IntegerToString(Target_Points) + " pts\n";
      panelText += "R:R = 1:" + DoubleToString(lastSetup.risk_reward_ratio, 2) + "\n";
      panelText += "Status: " + GetSetupStatusString(lastSetup) + "\n\n";

      // Warning se rischio alto
      double riskPoints = lastSetup.risk_points / _Point;
      if(riskPoints > Warning_Risk_Points && riskPoints <= Max_Risk_Points)
         panelText += "⚠ RISCHIO ELEVATO ⚠\n\n";
   }
   else
   {
      panelText += "Nessun setup attivo\n\n";
   }

   // Statistiche
   panelText += "─────────────────\n";
   panelText += "STATISTICHE SESSIONE\n";
   panelText += "Setup totali: " + IntegerToString(g_TotalSetups) + "\n";
   panelText += "Attivi: " + IntegerToString(g_ActiveSetupsCount) + "\n";
   panelText += "Win: " + IntegerToString(g_WinSetups) + "\n";
   panelText += "Loss: " + IntegerToString(g_LossSetups) + "\n";

   if(g_WinSetups + g_LossSetups > 0)
   {
      double winRate = (double)g_WinSetups / (g_WinSetups + g_LossSetups) * 100.0;
      panelText += "Win Rate: " + DoubleToString(winRate, 1) + "%\n";
   }

   panelText += "P&L: " + DoubleToString(g_TotalPnL, 1) + " pts\n";
   panelText += "Max DD: " + DoubleToString(g_MaxDrawdown, 1) + " pts\n";

   // Disegna label
   DrawLabel(g_ObjectPrefix + "InfoPanel", 10, 30, panelText, clrWhite, 9);
}

//+------------------------------------------------------------------+
//| Funzioni di disegno helper                                       |
//+------------------------------------------------------------------+

void DrawPoint(string name, datetime time, double price, color clr, string label)
{
   if(ObjectFind(0, name) < 0)
      ObjectCreate(0, name, OBJ_ARROW, 0, time, price);

   ObjectSetInteger(0, name, OBJPROP_COLOR, clr);
   ObjectSetInteger(0, name, OBJPROP_ARROWCODE, 159); // Cerchio
   ObjectSetInteger(0, name, OBJPROP_WIDTH, 3);
   ObjectSetInteger(0, name, OBJPROP_BACK, false);
   ObjectSetInteger(0, name, OBJPROP_SELECTABLE, false);
   ObjectSetInteger(0, name, OBJPROP_HIDDEN, true);

   // Label punto
   string labelName = name + "_label";
   if(ObjectFind(0, labelName) < 0)
      ObjectCreate(0, labelName, OBJ_TEXT, 0, time, price);

   ObjectSetString(0, labelName, OBJPROP_TEXT, label);
   ObjectSetInteger(0, labelName, OBJPROP_COLOR, clr);
   ObjectSetInteger(0, labelName, OBJPROP_FONTSIZE, 10);
   ObjectSetInteger(0, labelName, OBJPROP_BACK, false);
   ObjectSetInteger(0, labelName, OBJPROP_SELECTABLE, false);
   ObjectSetInteger(0, labelName, OBJPROP_HIDDEN, true);
}

void DrawTrendLine(string name, datetime time1, double price1,
                   datetime time2, double price2, color clr, ENUM_LINE_STYLE style)
{
   if(ObjectFind(0, name) < 0)
      ObjectCreate(0, name, OBJ_TREND, 0, time1, price1, time2, price2);
   else
   {
      ObjectSetInteger(0, name, OBJPROP_TIME, 0, time1);
      ObjectSetDouble(0, name, OBJPROP_PRICE, 0, price1);
      ObjectSetInteger(0, name, OBJPROP_TIME, 1, time2);
      ObjectSetDouble(0, name, OBJPROP_PRICE, 1, price2);
   }

   ObjectSetInteger(0, name, OBJPROP_COLOR, clr);
   ObjectSetInteger(0, name, OBJPROP_STYLE, style);
   ObjectSetInteger(0, name, OBJPROP_WIDTH, 2);
   ObjectSetInteger(0, name, OBJPROP_RAY_RIGHT, false);
   ObjectSetInteger(0, name, OBJPROP_BACK, false);
   ObjectSetInteger(0, name, OBJPROP_SELECTABLE, false);
   ObjectSetInteger(0, name, OBJPROP_HIDDEN, true);
}

void DrawHorizontalLine(string name, datetime time1, datetime time2,
                        double price, color clr, ENUM_LINE_STYLE style, int width)
{
   if(ObjectFind(0, name) < 0)
      ObjectCreate(0, name, OBJ_TREND, 0, time1, price, time2, price);
   else
   {
      ObjectSetInteger(0, name, OBJPROP_TIME, 0, time1);
      ObjectSetDouble(0, name, OBJPROP_PRICE, 0, price);
      ObjectSetInteger(0, name, OBJPROP_TIME, 1, time2);
      ObjectSetDouble(0, name, OBJPROP_PRICE, 1, price);
   }

   ObjectSetInteger(0, name, OBJPROP_COLOR, clr);
   ObjectSetInteger(0, name, OBJPROP_STYLE, style);
   ObjectSetInteger(0, name, OBJPROP_WIDTH, width);
   ObjectSetInteger(0, name, OBJPROP_RAY_RIGHT, false);
   ObjectSetInteger(0, name, OBJPROP_BACK, false);
   ObjectSetInteger(0, name, OBJPROP_SELECTABLE, false);
   ObjectSetInteger(0, name, OBJPROP_HIDDEN, true);
}

void DrawRectangle(string name, datetime time1, double price1,
                   datetime time2, double price2, color clr, ENUM_LINE_STYLE style)
{
   if(ObjectFind(0, name) < 0)
      ObjectCreate(0, name, OBJ_RECTANGLE, 0, time1, price1, time2, price2);
   else
   {
      ObjectSetInteger(0, name, OBJPROP_TIME, 0, time1);
      ObjectSetDouble(0, name, OBJPROP_PRICE, 0, price1);
      ObjectSetInteger(0, name, OBJPROP_TIME, 1, time2);
      ObjectSetDouble(0, name, OBJPROP_PRICE, 1, price2);
   }

   ObjectSetInteger(0, name, OBJPROP_COLOR, clr);
   ObjectSetInteger(0, name, OBJPROP_STYLE, style);
   ObjectSetInteger(0, name, OBJPROP_FILL, true);
   ObjectSetInteger(0, name, OBJPROP_BACK, true);
   ObjectSetInteger(0, name, OBJPROP_SELECTABLE, false);
   ObjectSetInteger(0, name, OBJPROP_HIDDEN, true);
}

void DrawText(string name, datetime time, double price, string text, color clr, int size)
{
   if(ObjectFind(0, name) < 0)
      ObjectCreate(0, name, OBJ_TEXT, 0, time, price);

   ObjectSetString(0, name, OBJPROP_TEXT, text);
   ObjectSetInteger(0, name, OBJPROP_COLOR, clr);
   ObjectSetInteger(0, name, OBJPROP_FONTSIZE, size);
   ObjectSetInteger(0, name, OBJPROP_BACK, false);
   ObjectSetInteger(0, name, OBJPROP_SELECTABLE, false);
   ObjectSetInteger(0, name, OBJPROP_HIDDEN, true);
}

void DrawLabel(string name, int x, int y, string text, color clr, int size)
{
   if(ObjectFind(0, name) < 0)
      ObjectCreate(0, name, OBJ_LABEL, 0, 0, 0);

   ObjectSetInteger(0, name, OBJPROP_XDISTANCE, x);
   ObjectSetInteger(0, name, OBJPROP_YDISTANCE, y);
   ObjectSetString(0, name, OBJPROP_TEXT, text);
   ObjectSetInteger(0, name, OBJPROP_COLOR, clr);
   ObjectSetInteger(0, name, OBJPROP_FONTSIZE, size);
   ObjectSetInteger(0, name, OBJPROP_CORNER, CORNER_LEFT_UPPER);
   ObjectSetInteger(0, name, OBJPROP_ANCHOR, ANCHOR_LEFT_UPPER);
   ObjectSetInteger(0, name, OBJPROP_BACK, false);
   ObjectSetInteger(0, name, OBJPROP_SELECTABLE, false);
   ObjectSetInteger(0, name, OBJPROP_HIDDEN, true);
}

//+------------------------------------------------------------------+
//| Pulisce oggetti grafici                                          |
//+------------------------------------------------------------------+
void CleanupGraphicalObjects()
{
   int total = ObjectsTotal(0, 0, -1);

   for(int i = total - 1; i >= 0; i--)
   {
      string name = ObjectName(0, i, 0, -1);
      if(StringFind(name, g_ObjectPrefix) == 0)
         ObjectDelete(0, name);
   }
}

//+------------------------------------------------------------------+
//| Funzioni di utilità                                              |
//+------------------------------------------------------------------+

color ColorWithOpacity(color baseColor, int opacity)
{
   if(opacity >= 100)
      return baseColor;

   int r = (baseColor & 0xFF);
   int g = ((baseColor >> 8) & 0xFF);
   int b = ((baseColor >> 16) & 0xFF);

   // Simula opacità mescolando con bianco
   double factor = opacity / 100.0;
   r = (int)(r * factor + 255 * (1 - factor));
   g = (int)(g * factor + 255 * (1 - factor));
   b = (int)(b * factor + 255 * (1 - factor));

   return (color)((b << 16) | (g << 8) | r);
}

string GetSetupStatusString(SSetup &setup)
{
   if(!setup.is_valid)
      return "INVALID";

   switch(setup.status)
   {
      case SETUP_ACTIVE:
         return setup.entry_triggered ? "ENTRY TRIGGERED" : "PENDING";
      case SETUP_WIN:
         return "WIN +" + DoubleToString(setup.pnl_points, 1) + " pts";
      case SETUP_LOSS:
         return "LOSS " + DoubleToString(setup.pnl_points, 1) + " pts";
      case SETUP_EXPIRED:
         return "EXPIRED";
      default:
         return "UNKNOWN";
   }
}

//+------------------------------------------------------------------+
//| Sistema di alert                                                 |
//+------------------------------------------------------------------+
void SendAlert(string message)
{
   if(Alert_Popup)
      Alert(message);

   if(Alert_Sound)
      PlaySound(Alert_SoundFile);

   if(Alert_Push)
      SendNotification(message);

   if(Alert_Email)
   {
      string subject = "DAX ZigZag Strategy - Alert";
      SendMail(subject, message);
   }
}

//+------------------------------------------------------------------+
//| Export CSV                                                        |
//+------------------------------------------------------------------+
void ExportSetupsToCSV()
{
   int handle = FileOpen(Export_Filename, FILE_WRITE|FILE_CSV|FILE_ANSI, ',');

   if(handle == INVALID_HANDLE)
   {
      Print("ERRORE: Impossibile creare file CSV: ", Export_Filename);
      return;
   }

   // Header
   FileWrite(handle, "Data", "Ora", "Tipo", "Entry", "Stop", "Target",
             "Rischio_Pts", "Reward_Pts", "RR_Ratio", "Outcome", "PnL_Pts", "Status");

   // Dati storici
   for(int i = 0; i < g_HistoricalSetupsCount; i++)
   {
      SSetup s = g_HistoricalSetups[i];

      MqlDateTime dt;
      TimeToStruct(s.time, dt);

      string dateStr = StringFormat("%04d-%02d-%02d", dt.year, dt.mon, dt.day);
      string timeStr = StringFormat("%02d:%02d:%02d", dt.hour, dt.min, dt.sec);
      string typeStr = (s.type == PATTERN_LONG ? "LONG" : "SHORT");
      string statusStr = GetSetupStatusString(s);

      FileWrite(handle, dateStr, timeStr, typeStr,
                DoubleToString(s.entry_price, _Digits),
                DoubleToString(s.stop_price, _Digits),
                DoubleToString(s.target_price, _Digits),
                DoubleToString(s.risk_points / _Point, 1),
                DoubleToString(s.reward_points, 1),
                DoubleToString(s.risk_reward_ratio, 2),
                (s.status == SETUP_WIN ? "WIN" : (s.status == SETUP_LOSS ? "LOSS" : "N/A")),
                DoubleToString(s.pnl_points, 1),
                statusStr);
   }

   FileClose(handle);
   Print("Export CSV completato: ", Export_Filename, " (", g_HistoricalSetupsCount, " setup)");
}

//+------------------------------------------------------------------+
//| Event handler per timer (opzionale)                              |
//+------------------------------------------------------------------+
void OnTimer()
{
   // Funzionalità timer opzionali
   // Es: export periodico, controlli aggiuntivi, etc.
}

//+------------------------------------------------------------------+
//| Event handler per oggetti chart (opzionale)                      |
//+------------------------------------------------------------------+
void OnChartEvent(const int id,
                  const long &lparam,
                  const double &dparam,
                  const string &sparam)
{
   // Gestione eventi chart
   // Es: click su oggetti per info aggiuntive, etc.
}

//+------------------------------------------------------------------+
