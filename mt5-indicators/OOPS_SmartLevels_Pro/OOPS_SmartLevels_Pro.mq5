//+------------------------------------------------------------------+
//|                                      OOPS_SmartLevels_Pro.mq5    |
//|                                    OOPS Smart Levels Pro v1.0    |
//|                           Professional Volume & Level Analysis   |
//+------------------------------------------------------------------+
#property copyright "OOPS Trading Systems"
#property link      "https://oopstrading.com"
#property version   "1.00"
#property indicator_chart_window
#property indicator_buffers 0
#property indicator_plots   0

#include "OOPS_SmartLevels_Pro.mqh"

//+------------------------------------------------------------------+
//| Input Parameters - Volume Profile                                |
//+------------------------------------------------------------------+
input group "═══ VOLUME PROFILE Z-SCORE ENGINE ═══"
input int    VP_Lookback_Bars = 500;              // VP: Lookback Bars
input int    VP_Price_Bins = 100;                 // VP: Price Bins
input double VP_ZScore_Threshold_High = 2.0;      // VP: Z-Score High (HVN)
input double VP_ZScore_Threshold_Low = -1.0;      // VP: Z-Score Low (LVN)
input int    VP_Update_Frequency = 10;            // VP: Update Every N Bars

//+------------------------------------------------------------------+
//| Input Parameters - Price Rejection                               |
//+------------------------------------------------------------------+
input group "═══ PRICE REJECTION ANALYZER ═══"
input int    PR_Lookback_Bars = 200;              // PR: Lookback Bars
input int    PR_Touch_Tolerance = 10;             // PR: Touch Tolerance (points)
input int    PR_MinTouches = 3;                   // PR: Minimum Touches
input double PR_Wick_Ratio_Min = 0.4;             // PR: Minimum Wick Ratio

//+------------------------------------------------------------------+
//| Input Parameters - Market Bias                                   |
//+------------------------------------------------------------------+
input group "═══ MARKET BIAS INDICATOR ═══"
input int    MB_Fast_Period = 20;                 // MB: Fast Period
input int    MB_Slow_Period = 50;                 // MB: Slow Period
input int    MB_Momentum_Period = 14;             // MB: Momentum Period
input bool   MB_Volume_Weight = true;             // MB: Volume Weight Enable

//+------------------------------------------------------------------+
//| Input Parameters - Session                                       |
//+------------------------------------------------------------------+
input group "═══ SESSION-AWARE WEIGHTING ═══"
input double Session_Weight_Asia = 0.5;           // Session: Asia Weight
input double Session_Weight_Europe = 1.0;         // Session: Europe Weight
input double Session_Weight_US = 0.7;             // Session: US Weight
input bool   Session_Filter_Enable = true;        // Session: Filter Enable

//+------------------------------------------------------------------+
//| Input Parameters - Dynamic Range                                 |
//+------------------------------------------------------------------+
input group "═══ DYNAMIC RANGE ANALYZER ═══"
input int    DR_Period = 50;                      // DR: Period
input double DR_ZScore_Expansion = 1.5;           // DR: Expansion Threshold
input double DR_ZScore_Compression = -1.0;        // DR: Compression Threshold

//+------------------------------------------------------------------+
//| Input Parameters - Display                                       |
//+------------------------------------------------------------------+
input group "═══ VISUALIZATION ═══"
input bool   Show_VolumeProfile = true;           // Show Volume Profile Levels
input bool   Show_RejectionZones = true;          // Show Rejection Zones
input bool   Show_InfoPanel = true;               // Show Info Panel
input bool   Show_SessionMarker = true;           // Show Session Marker
input bool   Show_WeakZones = true;               // Show Weak Zones
input int    Max_Levels_Display = 6;              // Max Levels to Display

//+------------------------------------------------------------------+
//| Input Parameters - Colors                                        |
//+------------------------------------------------------------------+
input group "═══ COLORS ═══"
input color  Color_Resistance = clrRed;           // Color: Resistance
input color  Color_Support = clrLime;             // Color: Support
input color  Color_Rejection = clrOrange;         // Color: Rejection
input color  Color_WeakZone = clrYellow;          // Color: Weak Zone
input color  Color_BullishBias = clrLimeGreen;    // Color: Bullish Bias
input color  Color_BearishBias = clrCrimson;      // Color: Bearish Bias

//+------------------------------------------------------------------+
//| Input Parameters - Alerts                                        |
//+------------------------------------------------------------------+
input group "═══ ALERTS ═══"
input bool   Enable_Alerts = true;                // Enable Alerts
input bool   Enable_Push_Notifications = false;   // Enable Push Notifications
input bool   Enable_Email_Alerts = false;         // Enable Email Alerts
input int    Alert_Cooldown_Seconds = 60;         // Alert Cooldown (seconds)

//+------------------------------------------------------------------+
//| Input Parameters - Performance                                   |
//+------------------------------------------------------------------+
input group "═══ PERFORMANCE ═══"
input bool   Calculate_On_Every_Tick = false;     // Calculate On Every Tick
input int    CPU_Optimization_Level = 2;          // CPU Optimization (1-3)

//+------------------------------------------------------------------+
//| Input Parameters - Advanced Filters                              |
//+------------------------------------------------------------------+
input group "═══ ADVANCED FILTERS ═══"
input double Min_Level_Strength = 1.8;            // Min Level Strength (Z-Score)
input int    Min_Distance_Between_Levels = 20;    // Min Distance Between Levels
input bool   Filter_By_Session = true;            // Filter By Current Session

//+------------------------------------------------------------------+
//| Global Variables                                                  |
//+------------------------------------------------------------------+
CVolumeProfileEngine *g_VPEngine = NULL;
CPriceRejectionAnalyzer *g_PRAnalyzer = NULL;
CMarketBiasIndicator *g_BiasIndicator = NULL;
CSessionManager *g_SessionManager = NULL;
CDynamicRangeAnalyzer *g_RangeAnalyzer = NULL;
CAlertManager *g_AlertManager = NULL;

Level g_AllLevels[];              // Tutti i livelli identificati
Level g_DisplayLevels[];          // Livelli da visualizzare
TradeSetup g_CurrentSetup;        // Setup trading corrente

ENUM_MARKET_BIAS g_CurrentBias = BIAS_NEUTRAL;
ENUM_RANGE_STATE g_CurrentRange = RANGE_NORMAL;
ENUM_SESSION_TYPE g_CurrentSession = SESSION_UNKNOWN;

double g_BiasScore = 0.0;
double g_RangeZScore = 0.0;
double g_CurrentRange = 0.0;

int g_LastCalculatedBar = -1;

//+------------------------------------------------------------------+
//| Custom indicator initialization function                         |
//+------------------------------------------------------------------+
int OnInit()
{
   // Imposta nome indicatore
   IndicatorSetString(INDICATOR_SHORTNAME, INDICATOR_SHORT_NAME);

   // Inizializza configurazioni
   VolumeProfileConfig vp_config;
   vp_config.lookback_bars = VP_Lookback_Bars;
   vp_config.price_bins = VP_Price_Bins;
   vp_config.zscore_threshold_high = VP_ZScore_Threshold_High;
   vp_config.zscore_threshold_low = VP_ZScore_Threshold_Low;
   vp_config.update_frequency = VP_Update_Frequency;

   PriceRejectionConfig pr_config;
   pr_config.lookback_bars = PR_Lookback_Bars;
   pr_config.touch_tolerance = PR_Touch_Tolerance;
   pr_config.min_touches = PR_MinTouches;
   pr_config.wick_ratio_min = PR_Wick_Ratio_Min;

   MarketBiasConfig mb_config;
   mb_config.fast_period = MB_Fast_Period;
   mb_config.slow_period = MB_Slow_Period;
   mb_config.momentum_period = MB_Momentum_Period;
   mb_config.volume_weight = MB_Volume_Weight;
   mb_config.bullish_threshold = 0.5;
   mb_config.bearish_threshold = -0.5;

   SessionConfig session_config;
   session_config.weight_asia = Session_Weight_Asia;
   session_config.weight_europe = Session_Weight_Europe;
   session_config.weight_us = Session_Weight_US;
   session_config.filter_enable = Session_Filter_Enable;
   session_config.asia_start_hour = 23;
   session_config.asia_end_hour = 7;
   session_config.europe_start_hour = 7;
   session_config.europe_end_hour = 15;
   session_config.us_start_hour = 13;
   session_config.us_end_hour = 20;

   DynamicRangeConfig dr_config;
   dr_config.period = DR_Period;
   dr_config.zscore_expansion = DR_ZScore_Expansion;
   dr_config.zscore_compression = DR_ZScore_Compression;

   AlertConfig alert_config;
   alert_config.enable_alerts = Enable_Alerts;
   alert_config.enable_push = Enable_Push_Notifications;
   alert_config.enable_email = Enable_Email_Alerts;
   alert_config.cooldown_seconds = Alert_Cooldown_Seconds;
   alert_config.approach_distance = 15;
   alert_config.reset_distance = 30;
   alert_config.compression_min_bars = 10;

   // Crea istanze engines
   g_VPEngine = new CVolumeProfileEngine(vp_config);
   g_PRAnalyzer = new CPriceRejectionAnalyzer(pr_config);
   g_BiasIndicator = new CMarketBiasIndicator(mb_config);
   g_SessionManager = new CSessionManager(session_config);
   g_RangeAnalyzer = new CDynamicRangeAnalyzer(dr_config);
   g_AlertManager = new CAlertManager(alert_config);

   Print(INDICATOR_NAME + " v" + INDICATOR_VERSION + " initialized successfully");

   return(INIT_SUCCEEDED);
}

//+------------------------------------------------------------------+
//| Custom indicator deinitialization function                       |
//+------------------------------------------------------------------+
void OnDeinit(const int reason)
{
   // Pulisci oggetti grafici
   DeleteAllObjects();

   // Elimina engines
   if(g_VPEngine != NULL) delete g_VPEngine;
   if(g_PRAnalyzer != NULL) delete g_PRAnalyzer;
   if(g_BiasIndicator != NULL) delete g_BiasIndicator;
   if(g_SessionManager != NULL) delete g_SessionManager;
   if(g_RangeAnalyzer != NULL) delete g_RangeAnalyzer;
   if(g_AlertManager != NULL) delete g_AlertManager;

   Print(INDICATOR_NAME + " deinitialized. Reason: " + IntegerToString(reason));
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
   // Verifica dati sufficienti
   if(rates_total < MB_Slow_Period + MB_Momentum_Period)
      return 0;

   // Set as series
   ArraySetAsSeries(time, true);
   ArraySetAsSeries(open, true);
   ArraySetAsSeries(high, true);
   ArraySetAsSeries(low, true);
   ArraySetAsSeries(close, true);
   ArraySetAsSeries(tick_volume, true);

   // Ottimizzazione: calcola solo su nuova barra se richiesto
   if(!Calculate_On_Every_Tick && prev_calculated > 0)
   {
      if(g_LastCalculatedBar == 0)
         return rates_total;
   }

   int current_bar = 0;  // Barra corrente (ultima)

   // Determina sessione corrente
   g_CurrentSession = g_SessionManager.GetCurrentSession(time[current_bar]);
   double session_weight = g_SessionManager.GetSessionWeight(g_CurrentSession);

   // 1. Calcola Volume Profile
   if(Show_VolumeProfile && g_VPEngine != NULL)
   {
      g_VPEngine.Calculate(high, low, close, tick_volume, rates_total, current_bar, session_weight);
   }

   // 2. Analizza Price Rejections
   Level rejection_levels[];
   if(Show_RejectionZones && g_PRAnalyzer != NULL)
   {
      g_PRAnalyzer.AnalyzeRejections(open, high, low, close, rates_total, current_bar, rejection_levels);
   }

   // 3. Calcola Market Bias
   if(g_BiasIndicator != NULL)
   {
      g_CurrentBias = g_BiasIndicator.CalculateBias(high, low, close, tick_volume, rates_total, current_bar, g_BiasScore);
   }

   // 4. Analizza Dynamic Range
   if(g_RangeAnalyzer != NULL)
   {
      g_CurrentRange = g_RangeAnalyzer.AnalyzeRange(high, low, rates_total, current_bar, g_RangeZScore, g_CurrentRange);
   }

   // 5. Raccogli tutti i livelli
   ArrayResize(g_AllLevels, 0);

   // Aggiungi livelli volume profile
   if(Show_VolumeProfile && g_VPEngine != NULL)
   {
      Level vp_levels[];
      int vp_count = g_VPEngine.GetSignificantLevels(vp_levels, close[current_bar], Filter_By_Session, g_CurrentSession);

      for(int i = 0; i < vp_count; i++)
      {
         if(vp_levels[i].zscore >= Min_Level_Strength || vp_levels[i].is_weak)
         {
            int size = ArraySize(g_AllLevels);
            ArrayResize(g_AllLevels, size + 1);
            g_AllLevels[size] = vp_levels[i];
         }
      }
   }

   // Aggiungi livelli rejection
   if(Show_RejectionZones)
   {
      for(int i = 0; i < ArraySize(rejection_levels); i++)
      {
         int size = ArraySize(g_AllLevels);
         ArrayResize(g_AllLevels, size + 1);
         g_AllLevels[size] = rejection_levels[i];
      }
   }

   // 6. Filtra e prioritizza livelli
   FilterAndPrioritizeLevels(g_AllLevels, g_DisplayLevels, close[current_bar], Max_Levels_Display);

   // 7. Disegna livelli
   DrawLevels(g_DisplayLevels, close[current_bar]);

   // 8. Genera trade setup
   Level nearest_support, nearest_resistance;
   FindNearestLevels(g_DisplayLevels, close[current_bar], nearest_support, nearest_resistance);
   g_CurrentSetup = CTradeSetupGenerator::GenerateSetup(close[current_bar], nearest_support, nearest_resistance,
                                                         g_CurrentBias, g_CurrentRange);

   // 9. Disegna pannello informativo
   if(Show_InfoPanel)
   {
      DrawInfoPanel(close[current_bar]);
   }

   // 10. Gestisci alert
   if(Enable_Alerts && g_AlertManager != NULL)
   {
      CheckAndSendAlerts(close[current_bar], g_DisplayLevels);
   }

   g_LastCalculatedBar = current_bar;

   return rates_total;
}

//+------------------------------------------------------------------+
//| Filtra e prioritizza livelli                                    |
//+------------------------------------------------------------------+
void FilterAndPrioritizeLevels(Level &all_levels[], Level &display_levels[], double current_price, int max_levels)
{
   ArrayResize(display_levels, 0);

   // Calcola score per ogni livello
   for(int i = 0; i < ArraySize(all_levels); i++)
   {
      double recency_factor = 1.0;
      if(all_levels[i].bars_ago > 100)
         recency_factor = MathMax(0.1, 1.0 - (all_levels[i].bars_ago - 100) * 0.01);

      double session_weight = g_SessionManager.GetSessionWeight(all_levels[i].session);

      all_levels[i].strength_score = (all_levels[i].zscore * 0.4) +
                                     (all_levels[i].touch_count * 0.3) +
                                     (session_weight * 0.2) +
                                     (recency_factor * 0.1);
   }

   // Ordina per strength score decrescente
   SortLevelsByStrength(all_levels);

   // Filtra livelli troppo vicini
   for(int i = 0; i < ArraySize(all_levels) && ArraySize(display_levels) < max_levels; i++)
   {
      bool too_close = false;

      for(int j = 0; j < ArraySize(display_levels); j++)
      {
         if(MathAbs(all_levels[i].price - display_levels[j].price) < Min_Distance_Between_Levels)
         {
            too_close = true;
            break;
         }
      }

      if(!too_close)
      {
         int size = ArraySize(display_levels);
         ArrayResize(display_levels, size + 1);
         display_levels[size] = all_levels[i];
      }
   }
}

//+------------------------------------------------------------------+
//| Ordina livelli per strength                                     |
//+------------------------------------------------------------------+
void SortLevelsByStrength(Level &levels[])
{
   int count = ArraySize(levels);
   for(int i = 0; i < count - 1; i++)
   {
      for(int j = i + 1; j < count; j++)
      {
         if(levels[j].strength_score > levels[i].strength_score)
         {
            Level temp = levels[i];
            levels[i] = levels[j];
            levels[j] = temp;
         }
      }
   }
}

//+------------------------------------------------------------------+
//| Trova livelli più vicini                                        |
//+------------------------------------------------------------------+
void FindNearestLevels(Level &levels[], double current_price, Level &nearest_support, Level &nearest_resistance)
{
   nearest_support.price = 0;
   nearest_resistance.price = 0;

   double min_dist_support = 999999;
   double min_dist_resistance = 999999;

   for(int i = 0; i < ArraySize(levels); i++)
   {
      if(levels[i].is_support && levels[i].price < current_price)
      {
         double dist = current_price - levels[i].price;
         if(dist < min_dist_support)
         {
            min_dist_support = dist;
            nearest_support = levels[i];
         }
      }

      if(levels[i].is_resistance && levels[i].price > current_price)
      {
         double dist = levels[i].price - current_price;
         if(dist < min_dist_resistance)
         {
            min_dist_resistance = dist;
            nearest_resistance = levels[i];
         }
      }
   }
}

//+------------------------------------------------------------------+
//| Disegna livelli sul grafico                                     |
//+------------------------------------------------------------------+
void DrawLevels(Level &levels[], double current_price)
{
   // Elimina vecchi oggetti livelli
   DeleteObjectsByPrefix("OOPS_Level_");

   for(int i = 0; i < ArraySize(levels); i++)
   {
      string obj_name = "OOPS_Level_" + IntegerToString(i);
      double price = levels[i].price;

      color line_color = Color_Support;
      int line_style = STYLE_SOLID;
      int line_width = 2;

      if(levels[i].is_resistance)
         line_color = Color_Resistance;
      else if(levels[i].is_rejection)
         line_color = Color_Rejection;
      else if(levels[i].is_weak)
      {
         line_color = Color_WeakZone;
         line_style = STYLE_DOT;
         line_width = 1;
      }

      // Crea linea orizzontale
      ObjectCreate(0, obj_name, OBJ_HLINE, 0, 0, price);
      ObjectSetInteger(0, obj_name, OBJPROP_COLOR, line_color);
      ObjectSetInteger(0, obj_name, OBJPROP_STYLE, line_style);
      ObjectSetInteger(0, obj_name, OBJPROP_WIDTH, line_width);
      ObjectSetInteger(0, obj_name, OBJPROP_BACK, true);
      ObjectSetInteger(0, obj_name, OBJPROP_SELECTABLE, false);

      // Aggiungi label
      string label_text = "";
      if(levels[i].is_resistance)
         label_text = StringFormat("R %.2f | Z:%.2f | V:%d", price, levels[i].zscore, levels[i].volume);
      else if(levels[i].is_support)
         label_text = StringFormat("S %.2f | Z:%.2f | V:%d", price, levels[i].zscore, levels[i].volume);
      else if(levels[i].is_rejection)
         label_text = StringFormat("REJ %.2f | %dx | W:%.0f%%", price, levels[i].touch_count, levels[i].wick_ratio * 100);
      else if(levels[i].is_weak)
         label_text = StringFormat("WEAK %.2f", price);

      string label_name = obj_name + "_Label";
      ObjectCreate(0, label_name, OBJ_TEXT, 0, TimeCurrent(), price);
      ObjectSetString(0, label_name, OBJPROP_TEXT, " " + label_text);
      ObjectSetString(0, label_name, OBJPROP_FONT, LABEL_FONT);
      ObjectSetInteger(0, label_name, OBJPROP_FONTSIZE, LABEL_FONT_SIZE);
      ObjectSetInteger(0, label_name, OBJPROP_COLOR, line_color);
      ObjectSetInteger(0, label_name, OBJPROP_SELECTABLE, false);
   }
}

//+------------------------------------------------------------------+
//| Disegna pannello informativo                                    |
//+------------------------------------------------------------------+
void DrawInfoPanel(double current_price)
{
   DeleteObjectsByPrefix("OOPS_Panel_");

   int x = 10;
   int y = 30;
   int line_height = 18;
   int current_y = y;

   // Titolo
   CreateLabel("OOPS_Panel_Title", x, current_y, "═══ OOPS SMART LEVELS PRO v1.0 ═══", clrWhite, 10, "Arial Bold");
   current_y += line_height + 5;

   // Market Status
   CreateLabel("OOPS_Panel_Status_Title", x, current_y, "📊 MARKET STATUS", clrYellow, 9);
   current_y += line_height;

   // Bias
   string bias_text = "";
   color bias_color = Color_BullishBias;
   if(g_CurrentBias == BIAS_BULLISH)
      bias_text = StringFormat("Bias: %s BULLISH (+%.2f)", SYMBOL_BULLISH, g_BiasScore);
   else if(g_CurrentBias == BIAS_BEARISH)
   {
      bias_text = StringFormat("Bias: %s BEARISH (%.2f)", SYMBOL_BEARISH, g_BiasScore);
      bias_color = Color_BearishBias;
   }
   else
   {
      bias_text = StringFormat("Bias: %s NEUTRAL (%.2f)", SYMBOL_NEUTRAL, g_BiasScore);
      bias_color = clrGray;
   }

   CreateLabel("OOPS_Panel_Bias", x, current_y, bias_text, bias_color, 9);
   current_y += line_height;

   // Range
   string range_text = g_RangeAnalyzer.GetStateName(g_CurrentRange) + StringFormat(" (Z: %.2f)", g_RangeZScore);
   CreateLabel("OOPS_Panel_Range", x, current_y, "Range: " + range_text, clrAqua, 9);
   current_y += line_height;

   // Session
   if(Show_SessionMarker)
   {
      string session_text = "Session: " + g_SessionManager.GetSessionName(g_CurrentSession);
      session_text += StringFormat(" (%.1fx)", g_SessionManager.GetSessionWeight(g_CurrentSession));
      CreateLabel("OOPS_Panel_Session", x, current_y, session_text, clrLightBlue, 9);
      current_y += line_height + 5;
   }

   // Key Levels
   CreateLabel("OOPS_Panel_Levels_Title", x, current_y, "🎯 KEY LEVELS", clrYellow, 9);
   current_y += line_height;

   // Resistenze
   int resistance_count = 0;
   for(int i = 0; i < ArraySize(g_DisplayLevels) && resistance_count < 3; i++)
   {
      if(g_DisplayLevels[i].is_resistance)
      {
         resistance_count++;
         string level_text = StringFormat("R%d: %.2f | Z: %.2f | %d ticks",
                                         resistance_count, g_DisplayLevels[i].price,
                                         g_DisplayLevels[i].zscore, g_DisplayLevels[i].volume);
         CreateLabel("OOPS_Panel_R" + IntegerToString(resistance_count), x, current_y, level_text, Color_Resistance, 8);
         current_y += line_height;
      }
   }

   // Prezzo corrente
   CreateLabel("OOPS_Panel_Price", x, current_y, StringFormat("────── PRICE: %.2f ──────", current_price), clrWhite, 9, "Arial Bold");
   current_y += line_height;

   // Supporti
   int support_count = 0;
   for(int i = 0; i < ArraySize(g_DisplayLevels) && support_count < 3; i++)
   {
      if(g_DisplayLevels[i].is_support)
      {
         support_count++;
         string level_text = StringFormat("S%d: %.2f | Z: %.2f | %d ticks",
                                         support_count, g_DisplayLevels[i].price,
                                         g_DisplayLevels[i].zscore, g_DisplayLevels[i].volume);
         CreateLabel("OOPS_Panel_S" + IntegerToString(support_count), x, current_y, level_text, Color_Support, 8);
         current_y += line_height;
      }
   }

   current_y += 5;

   // Trade Setup
   if(g_CurrentSetup.is_valid)
   {
      CreateLabel("OOPS_Panel_Setup_Title", x, current_y, "💡 NEXT TRADE SETUP", clrYellow, 9);
      current_y += line_height;

      CreateLabel("OOPS_Panel_Setup_Type", x, current_y, "Type: " + g_CurrentSetup.type, clrWhite, 8);
      current_y += line_height;

      string entry_text = StringFormat("Entry: %.2f - %.2f", g_CurrentSetup.entry_min, g_CurrentSetup.entry_max);
      CreateLabel("OOPS_Panel_Setup_Entry", x, current_y, entry_text, clrLightGreen, 8);
      current_y += line_height;

      string stop_text = StringFormat("Stop: %.2f (%.0f pts)", g_CurrentSetup.stop_loss,
                                     MathAbs(g_CurrentSetup.entry_max - g_CurrentSetup.stop_loss));
      CreateLabel("OOPS_Panel_Setup_Stop", x, current_y, stop_text, clrOrangeRed, 8);
      current_y += line_height;

      string target_text = StringFormat("Target: %.2f (%.0f pts)", g_CurrentSetup.take_profit,
                                       MathAbs(g_CurrentSetup.take_profit - g_CurrentSetup.entry_min));
      CreateLabel("OOPS_Panel_Setup_Target", x, current_y, target_text, clrLightGreen, 8);
      current_y += line_height;

      string rr_text = StringFormat("R:R: 1:%.1f | Prob: %d%%", g_CurrentSetup.risk_reward, g_CurrentSetup.probability);
      CreateLabel("OOPS_Panel_Setup_RR", x, current_y, rr_text, clrGold, 8);
      current_y += line_height;
   }

   // Timestamp
   current_y += 5;
   MqlDateTime dt;
   TimeCurrent(dt);
   string time_text = StringFormat("⏰ %02d:%02d:%02d", dt.hour, dt.min, dt.sec);
   CreateLabel("OOPS_Panel_Time", x, current_y, time_text, clrGray, 8);
}

//+------------------------------------------------------------------+
//| Crea label testuale                                             |
//+------------------------------------------------------------------+
void CreateLabel(string name, int x, int y, string text, color clr, int font_size, string font = "Consolas")
{
   if(ObjectFind(0, name) >= 0)
      ObjectDelete(0, name);

   ObjectCreate(0, name, OBJ_LABEL, 0, 0, 0);
   ObjectSetInteger(0, name, OBJPROP_XDISTANCE, x);
   ObjectSetInteger(0, name, OBJPROP_YDISTANCE, y);
   ObjectSetInteger(0, name, OBJPROP_CORNER, CORNER_LEFT_UPPER);
   ObjectSetString(0, name, OBJPROP_TEXT, text);
   ObjectSetString(0, name, OBJPROP_FONT, font);
   ObjectSetInteger(0, name, OBJPROP_FONTSIZE, font_size);
   ObjectSetInteger(0, name, OBJPROP_COLOR, clr);
   ObjectSetInteger(0, name, OBJPROP_SELECTABLE, false);
}

//+------------------------------------------------------------------+
//| Controlla e invia alert                                         |
//+------------------------------------------------------------------+
void CheckAndSendAlerts(double current_price, Level &levels[])
{
   for(int i = 0; i < ArraySize(levels); i++)
   {
      g_AlertManager.CheckApproachingLevel(current_price, levels[i], g_CurrentBias);
   }
}

//+------------------------------------------------------------------+
//| Elimina oggetti per prefisso                                    |
//+------------------------------------------------------------------+
void DeleteObjectsByPrefix(string prefix)
{
   int total = ObjectsTotal(0);
   for(int i = total - 1; i >= 0; i--)
   {
      string name = ObjectName(0, i);
      if(StringFind(name, prefix) == 0)
         ObjectDelete(0, name);
   }
}

//+------------------------------------------------------------------+
//| Elimina tutti gli oggetti dell'indicatore                       |
//+------------------------------------------------------------------+
void DeleteAllObjects()
{
   DeleteObjectsByPrefix("OOPS_");
}

//+------------------------------------------------------------------+
