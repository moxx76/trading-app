//+------------------------------------------------------------------+
//|                                                 OOPS_Config.mqh  |
//|                                    OOPS Smart Levels Pro v1.0    |
//|                                   Configuration & Constants      |
//+------------------------------------------------------------------+
#property copyright "OOPS Trading Systems"
#property version   "1.00"
#property strict

//+------------------------------------------------------------------+
//| Configurazioni Volume Profile Z-Score Engine                      |
//+------------------------------------------------------------------+
struct VolumeProfileConfig
{
   int      lookback_bars;           // Finestra di analisi
   int      price_bins;              // Numero di livelli di prezzo
   double   zscore_threshold_high;   // HVN threshold
   double   zscore_threshold_low;    // LVN threshold
   int      update_frequency;        // Aggiorna ogni N candele
};

//+------------------------------------------------------------------+
//| Configurazioni Price Rejection Analyzer                          |
//+------------------------------------------------------------------+
struct PriceRejectionConfig
{
   int      lookback_bars;           // Finestra di analisi
   int      touch_tolerance;         // Tolleranza in punti
   int      min_touches;             // Minimo touch per validità
   double   wick_ratio_min;          // Minimo ratio wick/range
};

//+------------------------------------------------------------------+
//| Configurazioni Market Bias Indicator                             |
//+------------------------------------------------------------------+
struct MarketBiasConfig
{
   int      fast_period;             // Periodo veloce
   int      slow_period;             // Periodo lento
   int      momentum_period;         // Periodo momentum
   bool     volume_weight;           // Considera volume
   double   bullish_threshold;       // Soglia bullish
   double   bearish_threshold;       // Soglia bearish
};

//+------------------------------------------------------------------+
//| Configurazioni Session-Aware Weighting                           |
//+------------------------------------------------------------------+
struct SessionConfig
{
   double   weight_asia;             // Peso sessione Asia
   double   weight_europe;           // Peso sessione Europa
   double   weight_us;               // Peso sessione US
   bool     filter_enable;           // Abilita filtro sessione
   int      asia_start_hour;         // Ora inizio Asia (GMT)
   int      asia_end_hour;           // Ora fine Asia (GMT)
   int      europe_start_hour;       // Ora inizio Europa (GMT)
   int      europe_end_hour;         // Ora fine Europa (GMT)
   int      us_start_hour;           // Ora inizio US (GMT)
   int      us_end_hour;             // Ora fine US (GMT)
};

//+------------------------------------------------------------------+
//| Configurazioni Dynamic Range Analyzer                            |
//+------------------------------------------------------------------+
struct DynamicRangeConfig
{
   int      period;                  // Periodo analisi
   double   zscore_expansion;        // Threshold espansione
   double   zscore_compression;      // Threshold compressione
};

//+------------------------------------------------------------------+
//| Configurazioni Alert System                                      |
//+------------------------------------------------------------------+
struct AlertConfig
{
   bool     enable_alerts;           // Abilita alert
   bool     enable_push;             // Abilita push notifications
   bool     enable_email;            // Abilita email
   int      cooldown_seconds;        // Cooldown anti-spam
   int      approach_distance;       // Distanza per "approaching level"
   int      reset_distance;          // Distanza reset alert
   int      compression_min_bars;    // Minimo candele per compression
};

//+------------------------------------------------------------------+
//| Configurazioni Visualizzazione                                   |
//+------------------------------------------------------------------+
struct DisplayConfig
{
   bool     show_volume_profile;     // Mostra volume profile
   bool     show_rejection_zones;    // Mostra rejection zones
   bool     show_info_panel;         // Mostra pannello info
   bool     show_session_marker;     // Mostra marker sessione
   bool     show_weak_zones;         // Mostra zone deboli
   int      max_levels_display;      // Max livelli da mostrare
   color    color_resistance;        // Colore resistenze
   color    color_support;           // Colore supporti
   color    color_rejection;         // Colore rejection zones
   color    color_weak_zone;         // Colore weak zones
   color    color_bullish_bias;      // Colore bias bullish
   color    color_bearish_bias;      // Colore bias bearish
   int      line_width;              // Spessore linee
};

//+------------------------------------------------------------------+
//| Configurazioni Performance                                       |
//+------------------------------------------------------------------+
struct PerformanceConfig
{
   bool     calculate_on_tick;       // Calcola su ogni tick
   int      optimization_level;      // Livello ottimizzazione (1-3)
   bool     enable_caching;          // Abilita cache
   int      cache_duration;          // Durata cache in bars
};

//+------------------------------------------------------------------+
//| Configurazioni Filtri Avanzati                                  |
//+------------------------------------------------------------------+
struct FilterConfig
{
   double   min_level_strength;      // Z-score minimo livello
   int      min_distance_levels;     // Distanza minima tra livelli
   bool     filter_by_session;       // Filtra per sessione
   double   recency_decay;           // Fattore decadimento temporale
};

//+------------------------------------------------------------------+
//| Enumerazioni                                                     |
//+------------------------------------------------------------------+
enum ENUM_MARKET_BIAS
{
   BIAS_BULLISH,      // Bias rialzista
   BIAS_BEARISH,      // Bias ribassista
   BIAS_NEUTRAL       // Bias neutro
};

enum ENUM_RANGE_STATE
{
   RANGE_EXPANSION,   // Espansione
   RANGE_COMPRESSION, // Compressione
   RANGE_NORMAL       // Normale
};

enum ENUM_SESSION_TYPE
{
   SESSION_ASIA,      // Sessione Asia
   SESSION_EUROPE,    // Sessione Europa
   SESSION_US,        // Sessione US
   SESSION_UNKNOWN    // Sessione sconosciuta
};

enum ENUM_ALERT_TYPE
{
   ALERT_APPROACH,         // Avvicinamento a livello
   ALERT_BREAKOUT,         // Breakout confermato
   ALERT_REJECTION,        // Rejection forte
   ALERT_COMPRESSION       // Compressione rilevata
};

//+------------------------------------------------------------------+
//| Struttura Level                                                  |
//+------------------------------------------------------------------+
struct Level
{
   double   price;              // Prezzo del livello
   double   zscore;             // Z-Score del livello
   int      volume;             // Volume totale
   int      touch_count;        // Numero di touch
   double   wick_ratio;         // Ratio wick medio
   double   strength_score;     // Score di forza complessivo
   int      bars_ago;           // Candele fa dalla formazione
   bool     is_resistance;      // True se resistenza
   bool     is_support;         // True se supporto
   bool     is_rejection;       // True se rejection zone
   bool     is_weak;            // True se weak zone
   ENUM_SESSION_TYPE session;   // Sessione di formazione
};

//+------------------------------------------------------------------+
//| Struttura Trade Setup                                           |
//+------------------------------------------------------------------+
struct TradeSetup
{
   string   type;               // Tipo setup (LONG/SHORT)
   double   entry_min;          // Entry minimo
   double   entry_max;          // Entry massimo
   double   stop_loss;          // Stop loss
   double   take_profit;        // Take profit
   double   risk_reward;        // Rapporto R:R
   int      probability;        // Probabilità % (0-100)
   datetime timestamp;          // Timestamp generazione
   bool     is_valid;           // Setup valido
};

//+------------------------------------------------------------------+
//| Costanti Globali                                                 |
//+------------------------------------------------------------------+
#define INDICATOR_NAME "OOPS SmartLevels Pro"
#define INDICATOR_VERSION "1.0"
#define INDICATOR_SHORT_NAME "OOPS_SLP"

// Colori predefiniti
#define COLOR_RESISTANCE    clrRed
#define COLOR_SUPPORT       clrLime
#define COLOR_REJECTION     clrOrange
#define COLOR_WEAK_ZONE     clrYellow
#define COLOR_BULLISH       clrLimeGreen
#define COLOR_BEARISH       clrCrimson
#define COLOR_NEUTRAL       clrGray

// Transparenze
#define ALPHA_WEAK_ZONE     64   // Trasparenza 25%
#define ALPHA_REJECTION     77   // Trasparenza 30%
#define ALPHA_BIAS_BG       13   // Trasparenza 95%
#define ALPHA_PANEL_BG      128  // Trasparenza 50%

// Dimensioni
#define MAX_LEVELS          100   // Max livelli tracciabili
#define MAX_ALERTS          50    // Max alert in coda
#define PANEL_WIDTH         350   // Larghezza pannello
#define PANEL_HEIGHT        500   // Altezza pannello

// Simboli grafici
#define SYMBOL_BULLISH      "🔼"
#define SYMBOL_BEARISH      "🔽"
#define SYMBOL_NEUTRAL      "⏸"
#define SYMBOL_EXPANSION    "⚡"
#define SYMBOL_COMPRESSION  "🔒"
#define SYMBOL_SESSION_DOT  "●"
#define SYMBOL_WARNING      "⚠️"
#define SYMBOL_BREAKOUT     "🚀"
#define SYMBOL_REJECTION_SYM "🔄"

// Font settings
#define PANEL_FONT          "Consolas"
#define PANEL_FONT_SIZE     9
#define LABEL_FONT          "Arial"
#define LABEL_FONT_SIZE     8

//+------------------------------------------------------------------+
//| Valori di default                                                |
//+------------------------------------------------------------------+
class CDefaultConfig
{
public:
   static VolumeProfileConfig GetDefaultVPConfig()
   {
      VolumeProfileConfig config;
      config.lookback_bars = 500;
      config.price_bins = 100;
      config.zscore_threshold_high = 2.0;
      config.zscore_threshold_low = -1.0;
      config.update_frequency = 10;
      return config;
   }

   static PriceRejectionConfig GetDefaultPRConfig()
   {
      PriceRejectionConfig config;
      config.lookback_bars = 200;
      config.touch_tolerance = 10;
      config.min_touches = 3;
      config.wick_ratio_min = 0.4;
      return config;
   }

   static MarketBiasConfig GetDefaultMBConfig()
   {
      MarketBiasConfig config;
      config.fast_period = 20;
      config.slow_period = 50;
      config.momentum_period = 14;
      config.volume_weight = true;
      config.bullish_threshold = 0.5;
      config.bearish_threshold = -0.5;
      return config;
   }

   static SessionConfig GetDefaultSessionConfig()
   {
      SessionConfig config;
      config.weight_asia = 0.5;
      config.weight_europe = 1.0;
      config.weight_us = 0.7;
      config.filter_enable = true;
      config.asia_start_hour = 23;
      config.asia_end_hour = 7;
      config.europe_start_hour = 7;
      config.europe_end_hour = 15;  // 15:30 -> 15
      config.us_start_hour = 13;    // 13:30 -> 13
      config.us_end_hour = 20;
      return config;
   }

   static DynamicRangeConfig GetDefaultDRConfig()
   {
      DynamicRangeConfig config;
      config.period = 50;
      config.zscore_expansion = 1.5;
      config.zscore_compression = -1.0;
      return config;
   }

   static AlertConfig GetDefaultAlertConfig()
   {
      AlertConfig config;
      config.enable_alerts = true;
      config.enable_push = false;
      config.enable_email = false;
      config.cooldown_seconds = 60;
      config.approach_distance = 15;
      config.reset_distance = 30;
      config.compression_min_bars = 10;
      return config;
   }

   static DisplayConfig GetDefaultDisplayConfig()
   {
      DisplayConfig config;
      config.show_volume_profile = true;
      config.show_rejection_zones = true;
      config.show_info_panel = true;
      config.show_session_marker = true;
      config.show_weak_zones = true;
      config.max_levels_display = 6;
      config.color_resistance = COLOR_RESISTANCE;
      config.color_support = COLOR_SUPPORT;
      config.color_rejection = COLOR_REJECTION;
      config.color_weak_zone = COLOR_WEAK_ZONE;
      config.color_bullish_bias = COLOR_BULLISH;
      config.color_bearish_bias = COLOR_BEARISH;
      config.line_width = 2;
      return config;
   }

   static PerformanceConfig GetDefaultPerfConfig()
   {
      PerformanceConfig config;
      config.calculate_on_tick = false;
      config.optimization_level = 2;
      config.enable_caching = true;
      config.cache_duration = 10;
      return config;
   }

   static FilterConfig GetDefaultFilterConfig()
   {
      FilterConfig config;
      config.min_level_strength = 1.8;
      config.min_distance_levels = 20;
      config.filter_by_session = true;
      config.recency_decay = 0.01;  // Decadimento per bar
      return config;
   }
};

//+------------------------------------------------------------------+
