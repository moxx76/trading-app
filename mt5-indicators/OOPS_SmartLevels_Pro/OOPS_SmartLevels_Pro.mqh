//+------------------------------------------------------------------+
//|                                      OOPS_SmartLevels_Pro.mqh    |
//|                                    OOPS Smart Levels Pro v1.0    |
//|                                     Core Functions Library       |
//+------------------------------------------------------------------+
#property copyright "OOPS Trading Systems"
#property version   "1.00"
#property strict

#include "OOPS_Config.mqh"

//+------------------------------------------------------------------+
//| Classe Volume Profile Z-Score Engine                             |
//+------------------------------------------------------------------+
class CVolumeProfileEngine
{
private:
   VolumeProfileConfig m_config;
   double m_price_bins[];        // Array prezzi dei bin
   double m_volume_bins[];       // Array volumi per bin
   double m_zscore_bins[];       // Array z-score per bin
   int m_last_calculation_bar;   // Ultima barra di calcolo
   bool m_is_initialized;

   // Funzione per calcolare media
   double CalculateMean(const double &array[], int count)
   {
      if(count <= 0) return 0.0;
      double sum = 0.0;
      for(int i = 0; i < count; i++)
         sum += array[i];
      return sum / count;
   }

   // Funzione per calcolare deviazione standard
   double CalculateStdDev(const double &array[], int count, double mean)
   {
      if(count <= 1) return 0.0;
      double sum = 0.0;
      for(int i = 0; i < count; i++)
      {
         double diff = array[i] - mean;
         sum += diff * diff;
      }
      return MathSqrt(sum / (count - 1));
   }

public:
   CVolumeProfileEngine(VolumeProfileConfig &config)
   {
      m_config = config;
      m_last_calculation_bar = -1;
      m_is_initialized = false;
      ArrayResize(m_price_bins, config.price_bins);
      ArrayResize(m_volume_bins, config.price_bins);
      ArrayResize(m_zscore_bins, config.price_bins);
      ArrayInitialize(m_volume_bins, 0.0);
   }

   ~CVolumeProfileEngine()
   {
      ArrayFree(m_price_bins);
      ArrayFree(m_volume_bins);
      ArrayFree(m_zscore_bins);
   }

   // Calcola il volume profile
   bool Calculate(const double &high[], const double &low[], const double &close[],
                  const long &tick_volume[], int rates_total, int current_bar, double session_weight = 1.0)
   {
      // Verifica se è necessario ricalcolare
      if(current_bar == m_last_calculation_bar && m_is_initialized)
         return true;

      if(current_bar % m_config.update_frequency != 0 && m_is_initialized)
         return true;

      // Reset array
      ArrayInitialize(m_volume_bins, 0.0);

      // Determina range di prezzo
      int lookback_start = MathMax(0, current_bar - m_config.lookback_bars);
      double price_max = high[ArrayMaximum(high, lookback_start, m_config.lookback_bars)];
      double price_min = low[ArrayMinimum(low, lookback_start, m_config.lookback_bars)];
      double price_range = price_max - price_min;

      if(price_range <= 0) return false;

      double bin_size = price_range / m_config.price_bins;

      // Inizializza prezzi dei bin
      for(int i = 0; i < m_config.price_bins; i++)
         m_price_bins[i] = price_min + (i * bin_size) + (bin_size / 2.0);

      // Distribuisci volume nei bin
      for(int bar = lookback_start; bar < current_bar; bar++)
      {
         double price = close[bar];
         int bin_index = (int)((price - price_min) / bin_size);

         // Limita indice bin
         if(bin_index < 0) bin_index = 0;
         if(bin_index >= m_config.price_bins) bin_index = m_config.price_bins - 1;

         m_volume_bins[bin_index] += (double)tick_volume[bar] * session_weight;
      }

      // Calcola Z-Score per ogni bin
      double mean_volume = CalculateMean(m_volume_bins, m_config.price_bins);
      double stddev_volume = CalculateStdDev(m_volume_bins, m_config.price_bins, mean_volume);

      if(stddev_volume > 0)
      {
         for(int i = 0; i < m_config.price_bins; i++)
            m_zscore_bins[i] = (m_volume_bins[i] - mean_volume) / stddev_volume;
      }
      else
      {
         ArrayInitialize(m_zscore_bins, 0.0);
      }

      m_last_calculation_bar = current_bar;
      m_is_initialized = true;
      return true;
   }

   // Ottieni livelli significativi
   int GetSignificantLevels(Level &levels[], double current_price, bool filter_by_session = false,
                            ENUM_SESSION_TYPE current_session = SESSION_UNKNOWN)
   {
      if(!m_is_initialized) return 0;

      int level_count = 0;
      ArrayResize(levels, 0);

      for(int i = 0; i < m_config.price_bins; i++)
      {
         double zscore = m_zscore_bins[i];
         double price = m_price_bins[i];

         // Identifica HVN (High Volume Nodes)
         if(zscore > m_config.zscore_threshold_high)
         {
            Level level;
            level.price = price;
            level.zscore = zscore;
            level.volume = (int)m_volume_bins[i];
            level.touch_count = 0;
            level.wick_ratio = 0.0;
            level.bars_ago = 0;
            level.is_resistance = (price > current_price);
            level.is_support = (price < current_price);
            level.is_rejection = false;
            level.is_weak = false;
            level.session = current_session;
            level.strength_score = zscore;

            ArrayResize(levels, level_count + 1);
            levels[level_count] = level;
            level_count++;
         }
         // Identifica LVN (Low Volume Nodes) - weak zones
         else if(zscore < m_config.zscore_threshold_low)
         {
            Level level;
            level.price = price;
            level.zscore = zscore;
            level.volume = (int)m_volume_bins[i];
            level.touch_count = 0;
            level.wick_ratio = 0.0;
            level.bars_ago = 0;
            level.is_resistance = false;
            level.is_support = false;
            level.is_rejection = false;
            level.is_weak = true;
            level.session = current_session;
            level.strength_score = MathAbs(zscore);

            ArrayResize(levels, level_count + 1);
            levels[level_count] = level;
            level_count++;
         }
      }

      return level_count;
   }
};

//+------------------------------------------------------------------+
//| Classe Price Rejection Analyzer                                  |
//+------------------------------------------------------------------+
class CPriceRejectionAnalyzer
{
private:
   PriceRejectionConfig m_config;
   double m_swing_highs[];
   double m_swing_lows[];
   int m_touch_counts[];
   double m_wick_ratios[];

   // Identifica swing high/low
   bool IsSwingHigh(const double &high[], int bar, int left_bars = 2, int right_bars = 2)
   {
      if(bar < left_bars || bar + right_bars >= ArraySize(high))
         return false;

      double peak = high[bar];
      for(int i = 1; i <= left_bars; i++)
         if(high[bar - i] >= peak) return false;
      for(int i = 1; i <= right_bars; i++)
         if(high[bar + i] >= peak) return false;

      return true;
   }

   bool IsSwingLow(const double &low[], int bar, int left_bars = 2, int right_bars = 2)
   {
      if(bar < left_bars || bar + right_bars >= ArraySize(low))
         return false;

      double valley = low[bar];
      for(int i = 1; i <= left_bars; i++)
         if(low[bar - i] <= valley) return false;
      for(int i = 1; i <= right_bars; i++)
         if(low[bar + i] <= valley) return false;

      return true;
   }

   // Calcola wick ratio
   double CalculateWickRatio(double open, double high, double low, double close, bool is_high)
   {
      double range = high - low;
      if(range <= 0) return 0.0;

      if(is_high)
      {
         double upper_wick = high - MathMax(open, close);
         return upper_wick / range;
      }
      else
      {
         double lower_wick = MathMin(open, close) - low;
         return lower_wick / range;
      }
   }

public:
   CPriceRejectionAnalyzer(PriceRejectionConfig &config)
   {
      m_config = config;
   }

   ~CPriceRejectionAnalyzer()
   {
      ArrayFree(m_swing_highs);
      ArrayFree(m_swing_lows);
      ArrayFree(m_touch_counts);
      ArrayFree(m_wick_ratios);
   }

   // Analizza rejection levels
   int AnalyzeRejections(const double &open[], const double &high[], const double &low[],
                         const double &close[], int rates_total, int current_bar, Level &rejection_levels[])
   {
      ArrayResize(rejection_levels, 0);
      int rejection_count = 0;

      // Mappa per contare touch ai livelli
      double price_levels[];
      int touch_counts[];
      double wick_sums[];
      int wick_counts[];

      ArrayResize(price_levels, 0);
      ArrayResize(touch_counts, 0);
      ArrayResize(wick_sums, 0);
      ArrayResize(wick_counts, 0);

      int lookback_start = MathMax(0, current_bar - m_config.lookback_bars);

      // Scansiona candele per identificare rejection
      for(int bar = lookback_start; bar < current_bar; bar++)
      {
         // Verifica swing high
         if(IsSwingHigh(high, bar))
         {
            double level_price = MathRound(high[bar] / 10.0) * 10.0; // Arrotonda a multipli di 10
            double wick_ratio = CalculateWickRatio(open[bar], high[bar], low[bar], close[bar], true);

            if(wick_ratio >= m_config.wick_ratio_min)
            {
               // Cerca livello esistente
               int level_index = -1;
               for(int i = 0; i < ArraySize(price_levels); i++)
               {
                  if(MathAbs(price_levels[i] - level_price) <= m_config.touch_tolerance)
                  {
                     level_index = i;
                     break;
                  }
               }

               // Aggiungi o aggiorna livello
               if(level_index >= 0)
               {
                  touch_counts[level_index]++;
                  wick_sums[level_index] += wick_ratio;
                  wick_counts[level_index]++;
               }
               else
               {
                  int size = ArraySize(price_levels);
                  ArrayResize(price_levels, size + 1);
                  ArrayResize(touch_counts, size + 1);
                  ArrayResize(wick_sums, size + 1);
                  ArrayResize(wick_counts, size + 1);

                  price_levels[size] = level_price;
                  touch_counts[size] = 1;
                  wick_sums[size] = wick_ratio;
                  wick_counts[size] = 1;
               }
            }
         }

         // Verifica swing low
         if(IsSwingLow(low, bar))
         {
            double level_price = MathRound(low[bar] / 10.0) * 10.0;
            double wick_ratio = CalculateWickRatio(open[bar], high[bar], low[bar], close[bar], false);

            if(wick_ratio >= m_config.wick_ratio_min)
            {
               // Cerca livello esistente
               int level_index = -1;
               for(int i = 0; i < ArraySize(price_levels); i++)
               {
                  if(MathAbs(price_levels[i] - level_price) <= m_config.touch_tolerance)
                  {
                     level_index = i;
                     break;
                  }
               }

               // Aggiungi o aggiorna livello
               if(level_index >= 0)
               {
                  touch_counts[level_index]++;
                  wick_sums[level_index] += wick_ratio;
                  wick_counts[level_index]++;
               }
               else
               {
                  int size = ArraySize(price_levels);
                  ArrayResize(price_levels, size + 1);
                  ArrayResize(touch_counts, size + 1);
                  ArrayResize(wick_sums, size + 1);
                  ArrayResize(wick_counts, size + 1);

                  price_levels[size] = level_price;
                  touch_counts[size] = 1;
                  wick_sums[size] = wick_ratio;
                  wick_counts[size] = 1;
               }
            }
         }
      }

      // Filtra e crea livelli validi
      for(int i = 0; i < ArraySize(price_levels); i++)
      {
         if(touch_counts[i] >= m_config.min_touches)
         {
            Level level;
            level.price = price_levels[i];
            level.touch_count = touch_counts[i];
            level.wick_ratio = wick_sums[i] / wick_counts[i];
            level.zscore = 0.0;
            level.volume = 0;
            level.bars_ago = 0;
            level.is_resistance = false;
            level.is_support = false;
            level.is_rejection = true;
            level.is_weak = false;
            level.session = SESSION_UNKNOWN;
            level.strength_score = touch_counts[i] * level.wick_ratio;

            ArrayResize(rejection_levels, rejection_count + 1);
            rejection_levels[rejection_count] = level;
            rejection_count++;
         }
      }

      return rejection_count;
   }
};

//+------------------------------------------------------------------+
//| Classe Market Bias Indicator                                     |
//+------------------------------------------------------------------+
class CMarketBiasIndicator
{
private:
   MarketBiasConfig m_config;
   double m_momentum_buffer[];
   double m_volume_ratio_buffer[];
   double m_bias_score_buffer[];
   ENUM_MARKET_BIAS m_current_bias;

public:
   CMarketBiasIndicator(MarketBiasConfig &config)
   {
      m_config = config;
      m_current_bias = BIAS_NEUTRAL;
   }

   ~CMarketBiasIndicator()
   {
      ArrayFree(m_momentum_buffer);
      ArrayFree(m_volume_ratio_buffer);
      ArrayFree(m_bias_score_buffer);
   }

   // Calcola bias di mercato
   ENUM_MARKET_BIAS CalculateBias(const double &high[], const double &low[], const double &close[],
                                   const long &tick_volume[], int rates_total, int current_bar, double &bias_score)
   {
      if(current_bar < m_config.slow_period + m_config.momentum_period)
      {
         bias_score = 0.0;
         return BIAS_NEUTRAL;
      }

      // Calcola Price Position Z-Score
      int lookback_start = current_bar - m_config.slow_period;
      double highest = high[ArrayMaximum(high, lookback_start, m_config.slow_period)];
      double lowest = low[ArrayMinimum(low, lookback_start, m_config.slow_period)];
      double range = highest - lowest;

      double price_position = 0.5;
      if(range > 0)
         price_position = (close[current_bar] - lowest) / range;

      // Calcola Momentum Raw
      double momentum_raw = close[current_bar] - close[current_bar - m_config.momentum_period];

      // Calcola Z-Score del momentum
      double momentum_sum = 0.0;
      for(int i = 0; i < m_config.slow_period; i++)
      {
         int bar = current_bar - i;
         if(bar - m_config.momentum_period >= 0)
            momentum_sum += close[bar] - close[bar - m_config.momentum_period];
      }
      double momentum_mean = momentum_sum / m_config.slow_period;

      double momentum_variance = 0.0;
      for(int i = 0; i < m_config.slow_period; i++)
      {
         int bar = current_bar - i;
         if(bar - m_config.momentum_period >= 0)
         {
            double mom = close[bar] - close[bar - m_config.momentum_period];
            double diff = mom - momentum_mean;
            momentum_variance += diff * diff;
         }
      }
      double momentum_stddev = MathSqrt(momentum_variance / m_config.slow_period);

      double z_momentum = 0.0;
      if(momentum_stddev > 0)
         z_momentum = (momentum_raw - momentum_mean) / momentum_stddev;

      // Calcola Volume Ratio
      double vol_ratio = 1.0;
      if(m_config.volume_weight)
      {
         double vol_fast_sum = 0.0;
         double vol_slow_sum = 0.0;

         for(int i = 0; i < m_config.fast_period; i++)
            vol_fast_sum += (double)tick_volume[current_bar - i];

         for(int i = 0; i < m_config.slow_period; i++)
            vol_slow_sum += (double)tick_volume[current_bar - i];

         double vol_fast_avg = vol_fast_sum / m_config.fast_period;
         double vol_slow_avg = vol_slow_sum / m_config.slow_period;

         if(vol_slow_avg > 0)
            vol_ratio = vol_fast_avg / vol_slow_avg;
      }

      // Calcola Market Bias Score
      bias_score = (z_momentum * 0.6) + ((vol_ratio - 1.0) * 0.4);

      // Determina bias
      if(bias_score > m_config.bullish_threshold)
         m_current_bias = BIAS_BULLISH;
      else if(bias_score < m_config.bearish_threshold)
         m_current_bias = BIAS_BEARISH;
      else
         m_current_bias = BIAS_NEUTRAL;

      return m_current_bias;
   }

   ENUM_MARKET_BIAS GetCurrentBias() { return m_current_bias; }
};

//+------------------------------------------------------------------+
//| Classe Session Manager                                          |
//+------------------------------------------------------------------+
class CSessionManager
{
private:
   SessionConfig m_config;

public:
   CSessionManager(SessionConfig &config)
   {
      m_config = config;
   }

   // Determina sessione corrente
   ENUM_SESSION_TYPE GetCurrentSession(datetime time)
   {
      MqlDateTime dt;
      TimeToStruct(time, dt);
      int hour = dt.hour;

      // Sessione Asia: 23:00-07:00
      if((hour >= m_config.asia_start_hour) || (hour < m_config.asia_end_hour))
         return SESSION_ASIA;

      // Sessione Europa: 07:00-15:30
      if(hour >= m_config.europe_start_hour && hour < m_config.europe_end_hour)
         return SESSION_EUROPE;

      // Sessione US: 13:30-20:00
      if(hour >= m_config.us_start_hour && hour < m_config.us_end_hour)
         return SESSION_US;

      return SESSION_UNKNOWN;
   }

   // Ottieni peso sessione
   double GetSessionWeight(ENUM_SESSION_TYPE session)
   {
      switch(session)
      {
         case SESSION_ASIA:   return m_config.weight_asia;
         case SESSION_EUROPE: return m_config.weight_europe;
         case SESSION_US:     return m_config.weight_us;
         default:             return 0.5;
      }
   }

   // Ottieni nome sessione
   string GetSessionName(ENUM_SESSION_TYPE session)
   {
      switch(session)
      {
         case SESSION_ASIA:   return "ASIA 🌏";
         case SESSION_EUROPE: return "EUROPE 🇪🇺";
         case SESSION_US:     return "US 🇺🇸";
         default:             return "UNKNOWN";
      }
   }
};

//+------------------------------------------------------------------+
//| Classe Dynamic Range Analyzer                                   |
//+------------------------------------------------------------------+
class CDynamicRangeAnalyzer
{
private:
   DynamicRangeConfig m_config;
   double m_range_buffer[];
   ENUM_RANGE_STATE m_current_state;

public:
   CDynamicRangeAnalyzer(DynamicRangeConfig &config)
   {
      m_config = config;
      m_current_state = RANGE_NORMAL;
   }

   ~CDynamicRangeAnalyzer()
   {
      ArrayFree(m_range_buffer);
   }

   // Analizza range
   ENUM_RANGE_STATE AnalyzeRange(const double &high[], const double &low[], int rates_total,
                                  int current_bar, double &range_zscore, double &current_range)
   {
      if(current_bar < m_config.period)
      {
         range_zscore = 0.0;
         current_range = 0.0;
         return RANGE_NORMAL;
      }

      // Calcola range corrente
      current_range = high[current_bar] - low[current_bar];

      // Calcola range medio e stddev
      double range_sum = 0.0;
      for(int i = 0; i < m_config.period; i++)
      {
         double range = high[current_bar - i] - low[current_bar - i];
         range_sum += range;
      }
      double range_mean = range_sum / m_config.period;

      double range_variance = 0.0;
      for(int i = 0; i < m_config.period; i++)
      {
         double range = high[current_bar - i] - low[current_bar - i];
         double diff = range - range_mean;
         range_variance += diff * diff;
      }
      double range_stddev = MathSqrt(range_variance / m_config.period);

      // Calcola Z-Score
      if(range_stddev > 0)
         range_zscore = (current_range - range_mean) / range_stddev;
      else
         range_zscore = 0.0;

      // Determina stato
      if(range_zscore > m_config.zscore_expansion)
         m_current_state = RANGE_EXPANSION;
      else if(range_zscore < m_config.zscore_compression)
         m_current_state = RANGE_COMPRESSION;
      else
         m_current_state = RANGE_NORMAL;

      return m_current_state;
   }

   ENUM_RANGE_STATE GetCurrentState() { return m_current_state; }

   string GetStateName(ENUM_RANGE_STATE state)
   {
      switch(state)
      {
         case RANGE_EXPANSION:   return SYMBOL_EXPANSION + " EXPANSION";
         case RANGE_COMPRESSION: return SYMBOL_COMPRESSION + " COMPRESSION";
         default:                return "NORMAL";
      }
   }
};

//+------------------------------------------------------------------+
//| Classe Alert Manager                                            |
//+------------------------------------------------------------------+
class CAlertManager
{
private:
   AlertConfig m_config;
   datetime m_last_alert_times[];
   ENUM_ALERT_TYPE m_last_alert_types[];
   int m_compression_bar_count;
   double m_last_price;

public:
   CAlertManager(AlertConfig &config)
   {
      m_config = config;
      m_compression_bar_count = 0;
      m_last_price = 0.0;
   }

   ~CAlertManager()
   {
      ArrayFree(m_last_alert_times);
      ArrayFree(m_last_alert_types);
   }

   // Verifica cooldown
   bool CanSendAlert(ENUM_ALERT_TYPE alert_type)
   {
      if(!m_config.enable_alerts) return false;

      datetime current_time = TimeCurrent();

      for(int i = 0; i < ArraySize(m_last_alert_types); i++)
      {
         if(m_last_alert_types[i] == alert_type)
         {
            if(current_time - m_last_alert_times[i] < m_config.cooldown_seconds)
               return false;
         }
      }

      return true;
   }

   // Registra alert inviato
   void RegisterAlert(ENUM_ALERT_TYPE alert_type)
   {
      int size = ArraySize(m_last_alert_types);
      ArrayResize(m_last_alert_types, size + 1);
      ArrayResize(m_last_alert_times, size + 1);

      m_last_alert_types[size] = alert_type;
      m_last_alert_times[size] = TimeCurrent();

      // Limita dimensione array
      if(size > MAX_ALERTS)
      {
         ArrayRemove(m_last_alert_types, 0, 1);
         ArrayRemove(m_last_alert_times, 0, 1);
      }
   }

   // Invia alert
   void SendAlert(string message, ENUM_ALERT_TYPE alert_type)
   {
      if(!CanSendAlert(alert_type)) return;

      Alert(INDICATOR_NAME + ": " + message);

      if(m_config.enable_push)
         SendNotification(message);

      if(m_config.enable_email)
         SendMail(INDICATOR_NAME, message);

      RegisterAlert(alert_type);
   }

   // Check approaching level
   void CheckApproachingLevel(double current_price, Level &level, ENUM_MARKET_BIAS bias)
   {
      double distance = MathAbs(current_price - level.price);

      if(distance < m_config.approach_distance)
      {
         string message = "";

         if(level.is_support && bias == BIAS_BULLISH)
         {
            message = StringFormat("%s APPROACHING SUPPORT %.2f | BIAS: BULLISH | Consider LONG on bounce",
                                 SYMBOL_WARNING, level.price);
            SendAlert(message, ALERT_APPROACH);
         }
         else if(level.is_resistance && bias == BIAS_BEARISH)
         {
            message = StringFormat("%s APPROACHING RESISTANCE %.2f | BIAS: BEARISH | Consider SHORT on rejection",
                                 SYMBOL_WARNING, level.price);
            SendAlert(message, ALERT_APPROACH);
         }
      }
   }
};

//+------------------------------------------------------------------+
//| Classe Trade Setup Generator                                    |
//+------------------------------------------------------------------+
class CTradeSetupGenerator
{
public:
   // Genera setup basato su livelli e bias
   static TradeSetup GenerateSetup(double current_price, Level &nearest_support, Level &nearest_resistance,
                                   ENUM_MARKET_BIAS bias, double atr)
   {
      TradeSetup setup;
      setup.is_valid = false;
      setup.timestamp = TimeCurrent();

      // Setup LONG su supporto con bias bullish
      if(bias == BIAS_BULLISH && nearest_support.price > 0)
      {
         double distance_to_support = current_price - nearest_support.price;

         if(distance_to_support > 0 && distance_to_support < 30)
         {
            setup.type = "LONG BOUNCE";
            setup.entry_min = nearest_support.price - 2;
            setup.entry_max = nearest_support.price + 2;
            setup.stop_loss = nearest_support.price - 15;
            setup.take_profit = (nearest_resistance.price > 0) ? nearest_resistance.price - 5 : current_price + 40;

            double risk = setup.entry_max - setup.stop_loss;
            double reward = setup.take_profit - setup.entry_min;
            setup.risk_reward = (risk > 0) ? reward / risk : 0;
            setup.probability = 68;
            setup.is_valid = true;
         }
      }
      // Setup SHORT su resistenza con bias bearish
      else if(bias == BIAS_BEARISH && nearest_resistance.price > 0)
      {
         double distance_to_resistance = nearest_resistance.price - current_price;

         if(distance_to_resistance > 0 && distance_to_resistance < 30)
         {
            setup.type = "SHORT REJECTION";
            setup.entry_min = nearest_resistance.price - 2;
            setup.entry_max = nearest_resistance.price + 2;
            setup.stop_loss = nearest_resistance.price + 15;
            setup.take_profit = (nearest_support.price > 0) ? nearest_support.price + 5 : current_price - 40;

            double risk = setup.stop_loss - setup.entry_min;
            double reward = setup.entry_max - setup.take_profit;
            setup.risk_reward = (risk > 0) ? reward / risk : 0;
            setup.probability = 68;
            setup.is_valid = true;
         }
      }

      return setup;
   }
};

//+------------------------------------------------------------------+
