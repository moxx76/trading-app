//+------------------------------------------------------------------+
//|                                            FirstCandleRule.mq5   |
//|                                 Copyright 2025, First Candle Rule|
//|                                                                  |
//+------------------------------------------------------------------+
#property copyright "Copyright 2025, First Candle Rule"
#property link      ""
#property version   "1.00"
#property indicator_chart_window
#property indicator_buffers 4
#property indicator_plots   4

//--- Plot FVG Buy Signals
#property indicator_label1  "FVG Buy"
#property indicator_type1   DRAW_ARROW
#property indicator_color1  clrLime
#property indicator_style1  STYLE_SOLID
#property indicator_width1  2

//--- Plot FVG Sell Signals
#property indicator_label2  "FVG Sell"
#property indicator_type2   DRAW_ARROW
#property indicator_color2  clrOrange
#property indicator_style2  STYLE_SOLID
#property indicator_width2  2

//--- Plot SMP Buy Signals
#property indicator_label3  "SMP Buy"
#property indicator_type3   DRAW_ARROW
#property indicator_color3  clrAqua
#property indicator_style3  STYLE_SOLID
#property indicator_width3  2

//--- Plot SMP Sell Signals
#property indicator_label4  "SMP Sell"
#property indicator_type4   DRAW_ARROW
#property indicator_color4  clrMagenta
#property indicator_style4  STYLE_SOLID
#property indicator_width4  2

//+------------------------------------------------------------------+
//| Input Parameters                                                  |
//+------------------------------------------------------------------+
input group "=== Session Settings ==="
input int SessionStartHour = 9;        // Ora inizio sessione
input int SessionStartMinute = 30;     // Minuto inizio sessione
input int FirstCandlePeriod = 30;      // Durata prima candela (minuti)
input int AnalysisTimeframe = 5;       // Timeframe analisi pattern (minuti)

input group "=== Visual Settings ==="
input color HighLineColor = clrRed;    // Colore linea HIGH
input color LowLineColor = clrBlue;    // Colore linea LOW
input int LineWidth = 2;               // Spessore linee
input color FirstCandleBoxColor = clrYellow; // Colore box prima candela
input int BoxTransparency = 90;        // Trasparenza box (0-100)

input group "=== Signal Colors ==="
input color FVG_BuyColor = clrLime;    // Colore segnale FVG long
input color FVG_SellColor = clrOrange; // Colore segnale FVG short
input color SMP_BuyColor = clrAqua;    // Colore segnale SMP long
input color SMP_SellColor = clrMagenta;// Colore segnale SMP short

input group "=== Alert Settings ==="
input bool ShowAlerts = true;          // Mostra alert popup
input bool SendNotifications = false;  // Invia notifiche push
input bool DrawStopLoss = true;        // Disegna livello stop loss
input bool DrawTarget = true;          // Disegna target 2:1 RR

input group "=== Pattern Settings ==="
input int MinFVG_Pips = 5;            // Gap minimo per FVG valido
input double MinSMP_Candles = 2;      // Minimo candele per SMP
input bool DrawFVGZones = true;       // Disegna zone FVG come rettangoli
input bool ShowInfoPanel = true;      // Mostra pannello informazioni
input bool ShowStatistics = true;     // Mostra statistiche

//+------------------------------------------------------------------+
//| Global Variables                                                  |
//+------------------------------------------------------------------+
// Indicator buffers
double FVG_BuyBuffer[];
double FVG_SellBuffer[];
double SMP_BuyBuffer[];
double SMP_SellBuffer[];

// First Candle data
struct FirstCandleData
{
   datetime time;
   double high;
   double low;
   double open;
   double close;
   bool valid;
   bool highTouched;
   bool lowTouched;
};

FirstCandleData g_firstCandle;
datetime g_currentDate = 0;
datetime g_lastBarTime = 0;

// Statistics
struct Statistics
{
   int totalSignals;
   int fvgBuySignals;
   int fvgSellSignals;
   int smpBuySignals;
   int smpSellSignals;
   int dailySignals;
   datetime lastResetDate;
};

Statistics g_stats;

// State tracking
enum TradingState
{
   STATE_WAITING_FIRST_CANDLE,
   STATE_WAITING_TOUCH,
   STATE_PATTERN_DETECTED,
   STATE_NO_SETUP
};

TradingState g_currentState = STATE_WAITING_FIRST_CANDLE;
string g_stateMessage = "";

// Object name prefixes
const string PREFIX_HIGH_LINE = "FCR_HighLine_";
const string PREFIX_LOW_LINE = "FCR_LowLine_";
const string PREFIX_BOX = "FCR_Box_";
const string PREFIX_ARROW = "FCR_Arrow_";
const string PREFIX_SL = "FCR_SL_";
const string PREFIX_TP = "FCR_TP_";
const string PREFIX_FVG_ZONE = "FCR_FVG_";
const string PREFIX_LABEL = "FCR_Label_";
const string PREFIX_INFO = "FCR_Info_";
const string PREFIX_STATS = "FCR_Stats_";

//+------------------------------------------------------------------+
//| Custom indicator initialization function                         |
//+------------------------------------------------------------------+
int OnInit()
{
   // Validate input parameters
   if(!ValidateInputs())
   {
      Print("Invalid input parameters!");
      return(INIT_PARAMETERS_INCORRECT);
   }

   // Set indicator buffers
   SetIndexBuffer(0, FVG_BuyBuffer, INDICATOR_DATA);
   SetIndexBuffer(1, FVG_SellBuffer, INDICATOR_DATA);
   SetIndexBuffer(2, SMP_BuyBuffer, INDICATOR_DATA);
   SetIndexBuffer(3, SMP_SellBuffer, INDICATOR_DATA);

   // Set arrow codes
   PlotIndexSetInteger(0, PLOT_ARROW, 233); // Up arrow for FVG Buy
   PlotIndexSetInteger(1, PLOT_ARROW, 234); // Down arrow for FVG Sell
   PlotIndexSetInteger(2, PLOT_ARROW, 241); // Up arrow for SMP Buy
   PlotIndexSetInteger(3, PLOT_ARROW, 242); // Down arrow for SMP Sell

   // Set empty values
   PlotIndexSetDouble(0, PLOT_EMPTY_VALUE, 0.0);
   PlotIndexSetDouble(1, PLOT_EMPTY_VALUE, 0.0);
   PlotIndexSetDouble(2, PLOT_EMPTY_VALUE, 0.0);
   PlotIndexSetDouble(3, PLOT_EMPTY_VALUE, 0.0);

   // Initialize arrays
   ArraySetAsSeries(FVG_BuyBuffer, true);
   ArraySetAsSeries(FVG_SellBuffer, true);
   ArraySetAsSeries(SMP_BuyBuffer, true);
   ArraySetAsSeries(SMP_SellBuffer, true);

   // Initialize buffers
   ArrayInitialize(FVG_BuyBuffer, 0.0);
   ArrayInitialize(FVG_SellBuffer, 0.0);
   ArrayInitialize(SMP_BuyBuffer, 0.0);
   ArrayInitialize(SMP_SellBuffer, 0.0);

   // Initialize first candle structure
   ResetFirstCandle();

   // Initialize statistics
   ZeroMemory(g_stats);
   g_stats.lastResetDate = TimeCurrent();

   // Set indicator name
   IndicatorSetString(INDICATOR_SHORTNAME, "First Candle Rule");
   IndicatorSetInteger(INDICATOR_DIGITS, _Digits);

   // Create info panel if enabled
   if(ShowInfoPanel)
      CreateInfoPanel();

   Print("First Candle Rule Indicator initialized successfully");
   return(INIT_SUCCEEDED);
}

//+------------------------------------------------------------------+
//| Custom indicator deinitialization function                       |
//+------------------------------------------------------------------+
void OnDeinit(const int reason)
{
   // Delete all objects created by the indicator
   DeleteAllObjects();

   Print("First Candle Rule Indicator removed. Reason: ", reason);
}

//+------------------------------------------------------------------+
//| Custom indicator iteration function                              |
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
   // Set arrays as series
   ArraySetAsSeries(time, true);
   ArraySetAsSeries(open, true);
   ArraySetAsSeries(high, true);
   ArraySetAsSeries(low, true);
   ArraySetAsSeries(close, true);

   // Check if we have enough bars
   if(rates_total < 100)
      return(0);

   // Check for new bar
   if(time[0] != g_lastBarTime)
   {
      g_lastBarTime = time[0];
      OnNewBar(time, open, high, low, close);
   }

   // Check for new day
   MqlDateTime currentTime;
   TimeToStruct(time[0], currentTime);
   datetime currentDateOnly = StringToTime(StringFormat("%04d.%02d.%02d",
                                           currentTime.year, currentTime.mon, currentTime.day));

   if(currentDateOnly != g_currentDate)
   {
      g_currentDate = currentDateOnly;
      OnNewDay();
   }

   // Update first candle if needed
   UpdateFirstCandle(time, open, high, low, close);

   // Analyze patterns on analysis timeframe
   AnalyzePatterns(time, open, high, low, close, rates_total);

   // Update info panel
   if(ShowInfoPanel)
      UpdateInfoPanel();

   // Update statistics panel
   if(ShowStatistics)
      UpdateStatisticsPanel();

   return(rates_total);
}

//+------------------------------------------------------------------+
//| Validate Input Parameters                                        |
//+------------------------------------------------------------------+
bool ValidateInputs()
{
   if(SessionStartHour < 0 || SessionStartHour > 23)
   {
      Print("Invalid SessionStartHour: must be between 0 and 23");
      return false;
   }

   if(SessionStartMinute < 0 || SessionStartMinute > 59)
   {
      Print("Invalid SessionStartMinute: must be between 0 and 59");
      return false;
   }

   if(FirstCandlePeriod <= 0)
   {
      Print("Invalid FirstCandlePeriod: must be greater than 0");
      return false;
   }

   if(AnalysisTimeframe <= 0)
   {
      Print("Invalid AnalysisTimeframe: must be greater than 0");
      return false;
   }

   if(MinFVG_Pips < 0)
   {
      Print("Invalid MinFVG_Pips: must be non-negative");
      return false;
   }

   if(MinSMP_Candles < 1)
   {
      Print("Invalid MinSMP_Candles: must be at least 1");
      return false;
   }

   return true;
}

//+------------------------------------------------------------------+
//| Reset First Candle Data                                          |
//+------------------------------------------------------------------+
void ResetFirstCandle()
{
   g_firstCandle.time = 0;
   g_firstCandle.high = 0;
   g_firstCandle.low = 0;
   g_firstCandle.open = 0;
   g_firstCandle.close = 0;
   g_firstCandle.valid = false;
   g_firstCandle.highTouched = false;
   g_firstCandle.lowTouched = false;
}

//+------------------------------------------------------------------+
//| On New Bar Event                                                 |
//+------------------------------------------------------------------+
void OnNewBar(const datetime &time[], const double &open[],
              const double &high[], const double &low[], const double &close[])
{
   // Check if price touched first candle levels
   if(g_firstCandle.valid)
   {
      if(high[1] >= g_firstCandle.high && !g_firstCandle.highTouched)
      {
         g_firstCandle.highTouched = true;
         g_currentState = STATE_PATTERN_DETECTED;
         Print("Price touched HIGH of first candle at ", TimeToString(time[1]));
      }

      if(low[1] <= g_firstCandle.low && !g_firstCandle.lowTouched)
      {
         g_firstCandle.lowTouched = true;
         g_currentState = STATE_PATTERN_DETECTED;
         Print("Price touched LOW of first candle at ", TimeToString(time[1]));
      }
   }
}

//+------------------------------------------------------------------+
//| On New Day Event                                                 |
//+------------------------------------------------------------------+
void OnNewDay()
{
   Print("New trading day detected: ", TimeToString(g_currentDate));

   // Reset first candle data
   ResetFirstCandle();

   // Reset state
   g_currentState = STATE_WAITING_FIRST_CANDLE;
   g_stateMessage = "Waiting for first candle";

   // Reset daily statistics
   g_stats.dailySignals = 0;

   // Clean up old objects from previous days
   DeleteOldDayObjects();
}

//+------------------------------------------------------------------+
//| Update First Candle                                              |
//+------------------------------------------------------------------+
void UpdateFirstCandle(const datetime &time[], const double &open[],
                       const double &high[], const double &low[], const double &close[])
{
   // If first candle already identified, return
   if(g_firstCandle.valid)
      return;

   // Get current time structure
   MqlDateTime currentBar;
   TimeToStruct(time[0], currentBar);

   // Check if we're past the session start time
   int currentMinutes = currentBar.hour * 60 + currentBar.min;
   int sessionMinutes = SessionStartHour * 60 + SessionStartMinute;
   int sessionEndMinutes = sessionMinutes + FirstCandlePeriod;

   // If we're past the first candle period, find it
   if(currentMinutes >= sessionEndMinutes)
   {
      // Find the first candle of the session
      for(int i = 0; i < 200; i++)  // Look back max 200 bars
      {
         MqlDateTime barTime;
         TimeToStruct(time[i], barTime);

         int barMinutes = barTime.hour * 60 + barTime.min;

         // Check if this bar is within the first candle period
         if(barMinutes >= sessionMinutes && barMinutes < sessionEndMinutes)
         {
            // Update first candle data (aggregate all bars in the period)
            if(!g_firstCandle.valid)
            {
               g_firstCandle.time = time[i];
               g_firstCandle.high = high[i];
               g_firstCandle.low = low[i];
               g_firstCandle.open = open[i];
               g_firstCandle.close = close[i];
               g_firstCandle.valid = true;
            }
            else
            {
               // Update high and low
               if(high[i] > g_firstCandle.high)
                  g_firstCandle.high = high[i];
               if(low[i] < g_firstCandle.low)
                  g_firstCandle.low = low[i];

               // Update open (first bar's open)
               g_firstCandle.open = open[i];
            }
         }
         else if(barMinutes < sessionMinutes)
         {
            // We've gone past the session start, stop looking
            break;
         }
      }

      // If first candle is now valid, draw it
      if(g_firstCandle.valid)
      {
         DrawFirstCandle();
         g_currentState = STATE_WAITING_TOUCH;
         g_stateMessage = "Waiting for price to touch HIGH or LOW";
         Print("First candle identified - High: ", g_firstCandle.high, " Low: ", g_firstCandle.low);
      }
   }
}

//+------------------------------------------------------------------+
//| Draw First Candle on Chart                                       |
//+------------------------------------------------------------------+
void DrawFirstCandle()
{
   string dateStr = TimeToString(g_currentDate, TIME_DATE);

   // Calculate end time for lines (end of day)
   datetime endTime = g_currentDate + 86400; // +24 hours

   // Draw HIGH line
   string highLineName = PREFIX_HIGH_LINE + dateStr;
   if(ObjectFind(0, highLineName) < 0)
   {
      ObjectCreate(0, highLineName, OBJ_TREND, 0, g_firstCandle.time, g_firstCandle.high, endTime, g_firstCandle.high);
      ObjectSetInteger(0, highLineName, OBJPROP_COLOR, HighLineColor);
      ObjectSetInteger(0, highLineName, OBJPROP_WIDTH, LineWidth);
      ObjectSetInteger(0, highLineName, OBJPROP_STYLE, STYLE_SOLID);
      ObjectSetInteger(0, highLineName, OBJPROP_RAY_RIGHT, false);
      ObjectSetInteger(0, highLineName, OBJPROP_SELECTABLE, false);
      ObjectSetString(0, highLineName, OBJPROP_TOOLTIP, "First Candle HIGH: " + DoubleToString(g_firstCandle.high, _Digits));
   }

   // Draw LOW line
   string lowLineName = PREFIX_LOW_LINE + dateStr;
   if(ObjectFind(0, lowLineName) < 0)
   {
      ObjectCreate(0, lowLineName, OBJ_TREND, 0, g_firstCandle.time, g_firstCandle.low, endTime, g_firstCandle.low);
      ObjectSetInteger(0, lowLineName, OBJPROP_COLOR, LowLineColor);
      ObjectSetInteger(0, lowLineName, OBJPROP_WIDTH, LineWidth);
      ObjectSetInteger(0, lowLineName, OBJPROP_STYLE, STYLE_SOLID);
      ObjectSetInteger(0, lowLineName, OBJPROP_RAY_RIGHT, false);
      ObjectSetInteger(0, lowLineName, OBJPROP_SELECTABLE, false);
      ObjectSetString(0, lowLineName, OBJPROP_TOOLTIP, "First Candle LOW: " + DoubleToString(g_firstCandle.low, _Digits));
   }

   // Draw box to highlight first candle
   string boxName = PREFIX_BOX + dateStr;
   if(ObjectFind(0, boxName) < 0)
   {
      datetime boxEndTime = g_firstCandle.time + FirstCandlePeriod * 60;
      ObjectCreate(0, boxName, OBJ_RECTANGLE, 0, g_firstCandle.time, g_firstCandle.high, boxEndTime, g_firstCandle.low);

      // Calculate transparent color
      int alpha = (int)((100 - BoxTransparency) * 255 / 100);
      color boxColor = (color)((alpha << 24) | (FirstCandleBoxColor & 0xFFFFFF));

      ObjectSetInteger(0, boxName, OBJPROP_COLOR, boxColor);
      ObjectSetInteger(0, boxName, OBJPROP_FILL, true);
      ObjectSetInteger(0, boxName, OBJPROP_BACK, true);
      ObjectSetInteger(0, boxName, OBJPROP_SELECTABLE, false);
      ObjectSetString(0, boxName, OBJPROP_TOOLTIP, "First Candle Range");
   }
}

//+------------------------------------------------------------------+
//| Analyze Patterns (FVG and SMP)                                   |
//+------------------------------------------------------------------+
void AnalyzePatterns(const datetime &time[], const double &open[],
                     const double &high[], const double &low[], const double &close[], int rates_total)
{
   // Only analyze if first candle is valid and a level has been touched
   if(!g_firstCandle.valid)
      return;

   if(!g_firstCandle.highTouched && !g_firstCandle.lowTouched)
      return;

   // Analyze for FVG patterns (3-candle pattern)
   if(rates_total >= 3)
   {
      CheckForFVG(time, open, high, low, close);
   }

   // Analyze for Smart Money Push patterns
   CheckForSMP(time, open, high, low, close, rates_total);
}

//+------------------------------------------------------------------+
//| Check for Fair Value Gap (FVG) Pattern                          |
//+------------------------------------------------------------------+
void CheckForFVG(const datetime &time[], const double &open[],
                 const double &high[], const double &low[], const double &close[])
{
   // FVG Pattern: 3 candles where candle 2 is large and creates a gap
   // Bullish FVG: high[3] < low[1] (gap between candle 3 and 1)
   // Bearish FVG: low[3] > high[1]

   // Check Bullish FVG
   if(g_firstCandle.lowTouched)  // After touching LOW, look for bullish reversal
   {
      double gapSize = low[1] - high[3];
      double gapInPips = gapSize / _Point / 10;

      if(gapSize > 0 && gapInPips >= MinFVG_Pips)
      {
         // Check if pattern is within first candle range
         double fvgMidpoint = (low[1] + high[3]) / 2;
         if(fvgMidpoint >= g_firstCandle.low && fvgMidpoint <= g_firstCandle.high)
         {
            // Valid Bullish FVG detected
            if(FVG_BuyBuffer[1] == 0)  // Avoid duplicate signals
            {
               FVG_BuyBuffer[1] = low[1] - 10 * _Point;  // Place arrow below the pattern

               // Draw FVG zone if enabled
               if(DrawFVGZones)
                  DrawFVGZone(time[1], high[3], low[1], true);

               // Calculate stop loss and target
               double stopLoss = low[2];  // Below the middle candle
               double entry = close[1];
               double target = entry + 2 * (entry - stopLoss);  // 2:1 RR

               // Draw SL and TP if enabled
               if(DrawStopLoss)
                  DrawStopLoss(time[1], stopLoss, true);
               if(DrawTarget)
                  DrawTarget(time[1], target, true);

               // Create label with info
               DrawSignalLabel(time[1], low[1], "FVG BUY", entry, stopLoss, target);

               // Update statistics
               g_stats.totalSignals++;
               g_stats.fvgBuySignals++;
               g_stats.dailySignals++;

               // Send alert
               if(ShowAlerts)
                  Alert("FVG BUY Signal detected at ", TimeToString(time[1]), " on ", _Symbol);

               if(SendNotifications)
                  SendNotification("FVG BUY Signal on " + _Symbol + " at " + TimeToString(time[1]));

               Print("FVG BUY signal at ", TimeToString(time[1]), " - Entry: ", entry, " SL: ", stopLoss, " TP: ", target);
            }
         }
      }
   }

   // Check Bearish FVG
   if(g_firstCandle.highTouched)  // After touching HIGH, look for bearish reversal
   {
      double gapSize = low[3] - high[1];
      double gapInPips = gapSize / _Point / 10;

      if(gapSize > 0 && gapInPips >= MinFVG_Pips)
      {
         // Check if pattern is within first candle range
         double fvgMidpoint = (low[3] + high[1]) / 2;
         if(fvgMidpoint >= g_firstCandle.low && fvgMidpoint <= g_firstCandle.high)
         {
            // Valid Bearish FVG detected
            if(FVG_SellBuffer[1] == 0)  // Avoid duplicate signals
            {
               FVG_SellBuffer[1] = high[1] + 10 * _Point;  // Place arrow above the pattern

               // Draw FVG zone if enabled
               if(DrawFVGZones)
                  DrawFVGZone(time[1], low[3], high[1], false);

               // Calculate stop loss and target
               double stopLoss = high[2];  // Above the middle candle
               double entry = close[1];
               double target = entry - 2 * (stopLoss - entry);  // 2:1 RR

               // Draw SL and TP if enabled
               if(DrawStopLoss)
                  DrawStopLoss(time[1], stopLoss, false);
               if(DrawTarget)
                  DrawTarget(time[1], target, false);

               // Create label with info
               DrawSignalLabel(time[1], high[1], "FVG SELL", entry, stopLoss, target);

               // Update statistics
               g_stats.totalSignals++;
               g_stats.fvgSellSignals++;
               g_stats.dailySignals++;

               // Send alert
               if(ShowAlerts)
                  Alert("FVG SELL Signal detected at ", TimeToString(time[1]), " on ", _Symbol);

               if(SendNotifications)
                  SendNotification("FVG SELL Signal on " + _Symbol + " at " + TimeToString(time[1]));

               Print("FVG SELL signal at ", TimeToString(time[1]), " - Entry: ", entry, " SL: ", stopLoss, " TP: ", target);
            }
         }
      }
   }
}

//+------------------------------------------------------------------+
//| Check for Smart Money Push (SMP) Pattern                        |
//+------------------------------------------------------------------+
void CheckForSMP(const datetime &time[], const double &open[],
                 const double &high[], const double &low[], const double &close[], int rates_total)
{
   // SMP: Series of consecutive candles in same direction + engulfing candle
   int minCandles = (int)MinSMP_Candles;

   if(rates_total < minCandles + 2)
      return;

   // Check Bullish SMP (after LOW touch)
   if(g_firstCandle.lowTouched)
   {
      // Count consecutive bearish candles
      int consecutiveBearish = 0;
      double seriesHigh = 0;
      double seriesLow = DBL_MAX;

      for(int i = minCandles + 1; i >= 2; i--)
      {
         if(close[i] < open[i])  // Bearish candle
         {
            consecutiveBearish++;
            if(high[i] > seriesHigh)
               seriesHigh = high[i];
            if(low[i] < seriesLow)
               seriesLow = low[i];
         }
         else
            break;
      }

      // Check if we have enough consecutive bearish candles
      if(consecutiveBearish >= minCandles)
      {
         // Check for bullish engulfing
         if(close[1] > open[1] && close[1] > seriesHigh)  // Bullish candle that closes above series high
         {
            // Check if within first candle range
            if(close[1] >= g_firstCandle.low && close[1] <= g_firstCandle.high)
            {
               if(SMP_BuyBuffer[1] == 0)  // Avoid duplicates
               {
                  SMP_BuyBuffer[1] = low[1] - 15 * _Point;

                  // Calculate SL and TP
                  double stopLoss = seriesLow - 5 * _Point;
                  double entry = close[1];
                  double target = entry + 2 * (entry - stopLoss);

                  // Draw SL and TP
                  if(DrawStopLoss)
                     DrawStopLoss(time[1], stopLoss, true);
                  if(DrawTarget)
                     DrawTarget(time[1], target, true);

                  // Draw label
                  DrawSignalLabel(time[1], low[1], "SMP BUY", entry, stopLoss, target);

                  // Update statistics
                  g_stats.totalSignals++;
                  g_stats.smpBuySignals++;
                  g_stats.dailySignals++;

                  // Alert
                  if(ShowAlerts)
                     Alert("SMP BUY Signal detected at ", TimeToString(time[1]), " on ", _Symbol);

                  if(SendNotifications)
                     SendNotification("SMP BUY Signal on " + _Symbol + " at " + TimeToString(time[1]));

                  Print("SMP BUY signal at ", TimeToString(time[1]), " after ", consecutiveBearish, " bearish candles");
               }
            }
         }
      }
   }

   // Check Bearish SMP (after HIGH touch)
   if(g_firstCandle.highTouched)
   {
      // Count consecutive bullish candles
      int consecutiveBullish = 0;
      double seriesHigh = 0;
      double seriesLow = DBL_MAX;

      for(int i = minCandles + 1; i >= 2; i--)
      {
         if(close[i] > open[i])  // Bullish candle
         {
            consecutiveBullish++;
            if(high[i] > seriesHigh)
               seriesHigh = high[i];
            if(low[i] < seriesLow)
               seriesLow = low[i];
         }
         else
            break;
      }

      // Check if we have enough consecutive bullish candles
      if(consecutiveBullish >= minCandles)
      {
         // Check for bearish engulfing
         if(close[1] < open[1] && close[1] < seriesLow)  // Bearish candle that closes below series low
         {
            // Check if within first candle range
            if(close[1] >= g_firstCandle.low && close[1] <= g_firstCandle.high)
            {
               if(SMP_SellBuffer[1] == 0)  // Avoid duplicates
               {
                  SMP_SellBuffer[1] = high[1] + 15 * _Point;

                  // Calculate SL and TP
                  double stopLoss = seriesHigh + 5 * _Point;
                  double entry = close[1];
                  double target = entry - 2 * (stopLoss - entry);

                  // Draw SL and TP
                  if(DrawStopLoss)
                     DrawStopLoss(time[1], stopLoss, false);
                  if(DrawTarget)
                     DrawTarget(time[1], target, false);

                  // Draw label
                  DrawSignalLabel(time[1], high[1], "SMP SELL", entry, stopLoss, target);

                  // Update statistics
                  g_stats.totalSignals++;
                  g_stats.smpSellSignals++;
                  g_stats.dailySignals++;

                  // Alert
                  if(ShowAlerts)
                     Alert("SMP SELL Signal detected at ", TimeToString(time[1]), " on ", _Symbol);

                  if(SendNotifications)
                     SendNotification("SMP SELL Signal on " + _Symbol + " at " + TimeToString(time[1]));

                  Print("SMP SELL signal at ", TimeToString(time[1]), " after ", consecutiveBullish, " bullish candles");
               }
            }
         }
      }
   }
}

//+------------------------------------------------------------------+
//| Draw FVG Zone                                                    |
//+------------------------------------------------------------------+
void DrawFVGZone(datetime time, double top, double bottom, bool isBullish)
{
   string zoneName = PREFIX_FVG_ZONE + TimeToString(time);

   if(ObjectFind(0, zoneName) < 0)
   {
      datetime endTime = time + AnalysisTimeframe * 60 * 10;  // Extend 10 bars
      ObjectCreate(0, zoneName, OBJ_RECTANGLE, 0, time, top, endTime, bottom);

      color zoneColor = isBullish ? FVG_BuyColor : FVG_SellColor;
      int alpha = 50;  // Semi-transparent
      color transparentColor = (color)((alpha << 24) | (zoneColor & 0xFFFFFF));

      ObjectSetInteger(0, zoneName, OBJPROP_COLOR, transparentColor);
      ObjectSetInteger(0, zoneName, OBJPROP_FILL, true);
      ObjectSetInteger(0, zoneName, OBJPROP_BACK, true);
      ObjectSetInteger(0, zoneName, OBJPROP_SELECTABLE, false);
      ObjectSetString(0, zoneName, OBJPROP_TOOLTIP, "FVG Zone " + (isBullish ? "Bullish" : "Bearish"));
   }
}

//+------------------------------------------------------------------+
//| Draw Stop Loss Level                                             |
//+------------------------------------------------------------------+
void DrawStopLoss(datetime time, double price, bool isBuy)
{
   string slName = PREFIX_SL + TimeToString(time);

   if(ObjectFind(0, slName) < 0)
   {
      datetime endTime = time + AnalysisTimeframe * 60 * 20;
      ObjectCreate(0, slName, OBJ_TREND, 0, time, price, endTime, price);
      ObjectSetInteger(0, slName, OBJPROP_COLOR, clrRed);
      ObjectSetInteger(0, slName, OBJPROP_WIDTH, 1);
      ObjectSetInteger(0, slName, OBJPROP_STYLE, STYLE_DASH);
      ObjectSetInteger(0, slName, OBJPROP_RAY_RIGHT, false);
      ObjectSetInteger(0, slName, OBJPROP_SELECTABLE, false);
      ObjectSetString(0, slName, OBJPROP_TOOLTIP, "Stop Loss: " + DoubleToString(price, _Digits));
   }
}

//+------------------------------------------------------------------+
//| Draw Target Level                                                |
//+------------------------------------------------------------------+
void DrawTarget(datetime time, double price, bool isBuy)
{
   string tpName = PREFIX_TP + TimeToString(time);

   if(ObjectFind(0, tpName) < 0)
   {
      datetime endTime = time + AnalysisTimeframe * 60 * 20;
      ObjectCreate(0, tpName, OBJ_TREND, 0, time, price, endTime, price);
      ObjectSetInteger(0, tpName, OBJPROP_COLOR, clrGreen);
      ObjectSetInteger(0, tpName, OBJPROP_WIDTH, 1);
      ObjectSetInteger(0, tpName, OBJPROP_STYLE, STYLE_DASH);
      ObjectSetInteger(0, tpName, OBJPROP_RAY_RIGHT, false);
      ObjectSetInteger(0, tpName, OBJPROP_SELECTABLE, false);
      ObjectSetString(0, tpName, OBJPROP_TOOLTIP, "Target: " + DoubleToString(price, _Digits));
   }
}

//+------------------------------------------------------------------+
//| Draw Signal Label                                                |
//+------------------------------------------------------------------+
void DrawSignalLabel(datetime time, double price, string signalType,
                     double entry, double sl, double tp)
{
   string labelName = PREFIX_LABEL + TimeToString(time);

   if(ObjectFind(0, labelName) < 0)
   {
      ObjectCreate(0, labelName, OBJ_TEXT, 0, time, price);

      double rr = MathAbs((tp - entry) / (entry - sl));
      string labelText = signalType + " | RR: " + DoubleToString(rr, 1) + ":1";

      ObjectSetString(0, labelName, OBJPROP_TEXT, labelText);
      ObjectSetInteger(0, labelName, OBJPROP_COLOR, clrWhite);
      ObjectSetInteger(0, labelName, OBJPROP_FONTSIZE, 8);
      ObjectSetInteger(0, labelName, OBJPROP_SELECTABLE, false);
      ObjectSetString(0, labelName, OBJPROP_TOOLTIP, "Entry: " + DoubleToString(entry, _Digits) +
                                                      " | SL: " + DoubleToString(sl, _Digits) +
                                                      " | TP: " + DoubleToString(tp, _Digits));
   }
}

//+------------------------------------------------------------------+
//| Create Info Panel                                                |
//+------------------------------------------------------------------+
void CreateInfoPanel()
{
   string panelName = PREFIX_INFO + "Panel";

   if(ObjectFind(0, panelName) < 0)
   {
      int x = 10;
      int y = 20;

      ObjectCreate(0, panelName, OBJ_LABEL, 0, 0, 0);
      ObjectSetInteger(0, panelName, OBJPROP_CORNER, CORNER_LEFT_UPPER);
      ObjectSetInteger(0, panelName, OBJPROP_XDISTANCE, x);
      ObjectSetInteger(0, panelName, OBJPROP_YDISTANCE, y);
      ObjectSetInteger(0, panelName, OBJPROP_COLOR, clrYellow);
      ObjectSetInteger(0, panelName, OBJPROP_FONTSIZE, 9);
      ObjectSetInteger(0, panelName, OBJPROP_SELECTABLE, false);
   }
}

//+------------------------------------------------------------------+
//| Update Info Panel                                                |
//+------------------------------------------------------------------+
void UpdateInfoPanel()
{
   string panelName = PREFIX_INFO + "Panel";

   if(ObjectFind(0, panelName) >= 0)
   {
      string statusText = "First Candle Rule - Status: " + GetStateString();

      if(g_firstCandle.valid)
      {
         statusText += "\nFirst Candle: " + TimeToString(g_firstCandle.time, TIME_MINUTES);
         statusText += " | H: " + DoubleToString(g_firstCandle.high, _Digits);
         statusText += " | L: " + DoubleToString(g_firstCandle.low, _Digits);
         statusText += "\nHigh Touched: " + (g_firstCandle.highTouched ? "YES" : "NO");
         statusText += " | Low Touched: " + (g_firstCandle.lowTouched ? "YES" : "NO");
      }

      statusText += "\nDaily Signals: " + IntegerToString(g_stats.dailySignals);

      ObjectSetString(0, panelName, OBJPROP_TEXT, statusText);
   }
}

//+------------------------------------------------------------------+
//| Update Statistics Panel                                          |
//+------------------------------------------------------------------+
void UpdateStatisticsPanel()
{
   string statsName = PREFIX_STATS + "Panel";

   if(ObjectFind(0, statsName) < 0)
   {
      int x = 10;
      int y = 100;

      ObjectCreate(0, statsName, OBJ_LABEL, 0, 0, 0);
      ObjectSetInteger(0, statsName, OBJPROP_CORNER, CORNER_LEFT_UPPER);
      ObjectSetInteger(0, statsName, OBJPROP_XDISTANCE, x);
      ObjectSetInteger(0, statsName, OBJPROP_YDISTANCE, y);
      ObjectSetInteger(0, statsName, OBJPROP_COLOR, clrAqua);
      ObjectSetInteger(0, statsName, OBJPROP_FONTSIZE, 8);
      ObjectSetInteger(0, statsName, OBJPROP_SELECTABLE, false);
   }

   string statsText = "=== STATISTICS ===";
   statsText += "\nTotal Signals: " + IntegerToString(g_stats.totalSignals);
   statsText += "\nFVG Buy: " + IntegerToString(g_stats.fvgBuySignals);
   statsText += "\nFVG Sell: " + IntegerToString(g_stats.fvgSellSignals);
   statsText += "\nSMP Buy: " + IntegerToString(g_stats.smpBuySignals);
   statsText += "\nSMP Sell: " + IntegerToString(g_stats.smpSellSignals);

   ObjectSetString(0, statsName, OBJPROP_TEXT, statsText);
}

//+------------------------------------------------------------------+
//| Get Current State String                                         |
//+------------------------------------------------------------------+
string GetStateString()
{
   switch(g_currentState)
   {
      case STATE_WAITING_FIRST_CANDLE:
         return "Waiting for first candle";
      case STATE_WAITING_TOUCH:
         return "Waiting for touch";
      case STATE_PATTERN_DETECTED:
         return "Analyzing patterns";
      case STATE_NO_SETUP:
         return "No setup today";
      default:
         return "Unknown";
   }
}

//+------------------------------------------------------------------+
//| Delete All Objects Created by Indicator                          |
//+------------------------------------------------------------------+
void DeleteAllObjects()
{
   int total = ObjectsTotal(0);

   for(int i = total - 1; i >= 0; i--)
   {
      string objName = ObjectName(0, i);

      if(StringFind(objName, "FCR_") == 0)  // If object name starts with FCR_
      {
         ObjectDelete(0, objName);
      }
   }
}

//+------------------------------------------------------------------+
//| Delete Objects from Previous Days                                |
//+------------------------------------------------------------------+
void DeleteOldDayObjects()
{
   string currentDateStr = TimeToString(g_currentDate, TIME_DATE);
   int total = ObjectsTotal(0);

   for(int i = total - 1; i >= 0; i--)
   {
      string objName = ObjectName(0, i);

      if(StringFind(objName, "FCR_") == 0)  // If object name starts with FCR_
      {
         // If object name doesn't contain current date, delete it
         if(StringFind(objName, currentDateStr) < 0)
         {
            ObjectDelete(0, objName);
         }
      }
   }
}
//+------------------------------------------------------------------+
