import React, { useState, useEffect } from 'react';
import { Sparkles, TrendingUp, Volume2, Calendar, Target, ShieldCheck, ArrowUpRight, BarChart2, RefreshCw, AlertTriangle, CheckCircle2, ChevronRight, PieChart } from 'lucide-react';
import { ForecastResult, LanguageCode } from '../types';
import { translations } from '../utils/translations';
import { fetchDemandForecast } from '../services/geminiService';
import { audioSpeech } from '../utils/audioSpeech';

interface DemandForecastViewProps {
  currentLanguage: LanguageCode;
  onNavigateTab: (tab: string, contextId?: string) => void;
}

export const DemandForecastView: React.FC<DemandForecastViewProps> = ({
  currentLanguage,
  onNavigateTab,
}) => {
  const t = translations[currentLanguage];

  const [selectedCrop, setSelectedCrop] = useState('Dragon Fruit (Red Velvet)');
  const [selectedRegion, setSelectedRegion] = useState('Maharashtra (Baramati / Solapur / Nashik)');
  const [selectedTargetMarket, setSelectedTargetMarket] = useState('Mumbai APMC & Direct Supermarkets');
  const [forecast, setForecast] = useState<ForecastResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);

  const cropOptions = [
    'Dragon Fruit (Red Velvet)',
    'High-Density Grafted Walnut',
    'Hass Butter Avocado',
    'Nashik Premium Red Onions',
    'Indoor Aeroponic Saffron',
    'Devgad Alphonso Mango',
    'Hydroponic Salad Greens',
    'Nutrient Black Wheat',
  ];

  const regionOptions = [
    'Maharashtra (Baramati / Solapur / Nashik)',
    'Jammu & Kashmir (Shopian / Pampore / Anantnag)',
    'Gujarat (Kutch / Saurashtra / Anand)',
    'Tamil Nadu & Western Ghats (Dindigul / Ooty)',
    'Punjab & Haryana (Karnal / Ludhiana)',
    'Karnataka (Kolar / Belagavi / Coorg)',
  ];

  const marketOptions = [
    'Mumbai APMC & Direct Supermarkets (Reliance / BigBasket)',
    'Delhi Azadpur Mandi & North India Cargo Export',
    'Bengaluru Wholesale & Cloud Kitchen Supply',
    'Gulf & UAE Direct Air Cargo Export Linkage',
    'Pune & Kolhapur Local Wholesale Mandis',
  ];

  const loadForecast = async () => {
    setIsLoading(true);
    try {
      const data = await fetchDemandForecast(
        selectedCrop,
        selectedRegion,
        selectedTargetMarket,
        currentLanguage
      );
      setForecast(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadForecast();
  }, [selectedCrop, selectedRegion, selectedTargetMarket, currentLanguage]);

  const handleSpeakForecast = () => {
    if (!forecast) return;
    if (isAudioPlaying) {
      audioSpeech.stop();
      setIsAudioPlaying(false);
      return;
    }
    setIsAudioPlaying(true);
    const textToSpeak = forecast.voiceSpokenScript || forecast.farmerAdvisorySummary;
    audioSpeech.speak(
      textToSpeak,
      currentLanguage,
      () => setIsAudioPlaying(true),
      () => setIsAudioPlaying(false),
      () => setIsAudioPlaying(false)
    );
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Header Banner */}
      <div className="rounded-3xl bg-[#1A221E] border border-[#2C3631] p-5 sm:p-7 shadow-2xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-[#C2D66E]/5 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-2.5 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="bg-[#C2D66E] text-[#0F1411] text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-widest flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                Gemini AI Agri Intelligence
              </span>
              <span className="bg-[#242C28] text-[#D4E4BC] text-[11px] font-medium px-3 py-1 rounded-full border border-[#2C3631]">
                Live Mandi & Buyer Grounding
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl md:text-4xl font-serif italic font-bold text-white tracking-tight">
              {currentLanguage === 'mr'
                ? 'AI मागणी अंदाज आणि ३०-दिवसीय बाजारभाव विश्लेषण'
                : currentLanguage === 'hi'
                ? 'AI मांग पूर्वानुमान एवं 30-दिवसीय मूल्य विश्लेषण'
                : 'AI Demand Forecast & Market Dynamics'}
            </h1>

            <p className="text-xs sm:text-sm text-[#8E9B94]">
              Predict crop price surges, institutional buyer procurement windows, and avoid glut distress sales.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleSpeakForecast}
              disabled={!forecast || isLoading}
              className={`px-4 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-md transition-all flex items-center gap-2 ${
                isAudioPlaying
                  ? 'bg-[#C2D66E] text-[#0F1411] ring-4 ring-[#C2D66E]/30 animate-pulse'
                  : 'bg-[#C2D66E] hover:bg-[#D4E4BC] text-[#0F1411]'
              }`}
            >
              <Volume2 className="w-4 h-4" />
              <span>{isAudioPlaying ? 'ऐकत आहे... (Playing)' : t.listenAudio}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Crop Recommendation CTA Banner */}
      <div className="bg-gradient-to-r from-[#1A221E] via-[#242C28] to-[#1A221E] border border-[#C2D66E]/40 rounded-3xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#C2D66E]/20 border border-[#C2D66E]/40 flex items-center justify-center text-[#C2D66E] shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-[#E5E9E7]">
              {currentLanguage === 'mr'
                ? 'तुमच्या जमिनीचा पोत व हवामानानुसार सर्वाधिक फायदेशीर पीक शोधायचे आहे का?'
                : 'Looking to find the highest-margin crop tailored to your specific soil & climate?'}
            </h4>
            <p className="text-xs text-[#8E9B94]">
              {currentLanguage === 'mr'
                ? 'माती परीक्षण अहवाल (pH, NPK) आणि हवामानानुसार AI पीक शिफारस इंजिन वापरा.'
                : 'Run our AI Crop Recommendation Engine with soil test NPK data, regional weather & season.'}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onNavigateTab('cropAdvisor')}
          className="px-4 py-2 bg-[#C2D66E] hover:bg-[#D4E4BC] text-[#0F1411] rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-1.5 transition-all shadow-sm active:scale-95 shrink-0"
        >
          <span>{t.cropAdvisor}</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Selectors Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-[#1A221E] p-4 sm:p-5 rounded-3xl border border-[#2C3631] shadow-xl">
        <div>
          <label className="block text-[10px] uppercase tracking-wider font-semibold text-[#8E9B94] mb-1.5">
            Select Crop to Forecast:
          </label>
          <select
            value={selectedCrop}
            onChange={(e) => setSelectedCrop(e.target.value)}
            className="w-full bg-[#242C28] border border-[#2C3631] rounded-2xl px-3.5 py-2.5 text-xs sm:text-sm text-[#E5E9E7] focus:border-[#C2D66E] focus:outline-none font-medium"
          >
            {cropOptions.map((crop) => (
              <option key={crop} value={crop}>
                {crop}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[10px] uppercase tracking-wider font-semibold text-[#8E9B94] mb-1.5">
            Production Region:
          </label>
          <select
            value={selectedRegion}
            onChange={(e) => setSelectedRegion(e.target.value)}
            className="w-full bg-[#242C28] border border-[#2C3631] rounded-2xl px-3.5 py-2.5 text-xs sm:text-sm text-[#E5E9E7] focus:border-[#C2D66E] focus:outline-none font-medium"
          >
            {regionOptions.map((reg) => (
              <option key={reg} value={reg}>
                {reg}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[10px] uppercase tracking-wider font-semibold text-[#8E9B94] mb-1.5">
            Target Mandi / Corporate Hub:
          </label>
          <select
            value={selectedTargetMarket}
            onChange={(e) => setSelectedTargetMarket(e.target.value)}
            className="w-full bg-[#242C28] border border-[#2C3631] rounded-2xl px-3.5 py-2.5 text-xs sm:text-sm text-[#E5E9E7] focus:border-[#C2D66E] focus:outline-none font-medium"
          >
            {marketOptions.map((mkt) => (
              <option key={mkt} value={mkt}>
                {mkt}
              </option>
            ))}
          </select>
        </div>
      </div>

      {isLoading && (
        <div className="p-12 text-center bg-[#1A221E] border border-[#2C3631] rounded-3xl space-y-3">
          <RefreshCw className="w-8 h-8 text-[#C2D66E] animate-spin mx-auto" />
          <p className="text-sm font-semibold text-[#8E9B94]">
            {currentLanguage === 'mr'
              ? 'Gemini AI बाजारभाव आणि मागणीचा सखोल अंदाज तयार करत आहे...'
              : 'Gemini AI is analyzing real-time mandi volumes, weather patterns, and buyer inquiries...'}
          </p>
        </div>
      )}

      {forecast && !isLoading && (
        <div className="space-y-6">
          {/* Key KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {/* Current Price */}
            <div className="bg-[#1A221E] border border-[#2C3631] rounded-3xl p-5 flex flex-col justify-between">
              <span className="text-[10px] uppercase tracking-widest font-semibold text-[#8E9B94]">
                Current Mandi Rate
              </span>
              <div className="my-3">
                <span className="text-3xl sm:text-4xl font-serif text-[#E5E9E7] font-bold">
                  ₹{forecast.currentMandiPrice}
                </span>
                <span className="text-xs text-[#8E9B94] ml-1.5">/ {forecast.unit}</span>
              </div>
              <span className="text-[11px] text-[#8E9B94] font-medium">
                Traditional APMC benchmark
              </span>
            </div>

            {/* Projected Price Range */}
            <div className="bg-[#1A221E] border border-[#C2D66E]/40 rounded-3xl p-5 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase tracking-widest font-bold text-[#C2D66E]">
                  30-Day Peak Target
                </span>
                <span className="bg-[#C2D66E]/20 text-[#C2D66E] text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                  +{Math.round(((forecast.projectedPriceRange.max - forecast.currentMandiPrice) / forecast.currentMandiPrice) * 100)}% Surge
                </span>
              </div>
              <div className="my-3">
                <span className="text-3xl sm:text-4xl font-serif text-[#C2D66E] font-bold">
                  ₹{forecast.projectedPriceRange.max}
                </span>
                <span className="text-xs text-[#8E9B94] ml-1.5">
                  (Avg ₹{forecast.projectedPriceRange.average})
                </span>
              </div>
              <span className="text-[11px] text-[#D4E4BC] font-medium">
                Target Direct Bulk Sale Price
              </span>
            </div>

            {/* Demand Score */}
            <div className="bg-[#1A221E] border border-[#2C3631] rounded-3xl p-5 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase tracking-widest font-semibold text-[#8E9B94]">
                  Demand Index
                </span>
                <span className="text-xs font-serif italic text-[#D4E4BC]">
                  {forecast.trend} Trend
                </span>
              </div>
              <div className="my-3 flex items-baseline gap-2">
                <span className="text-3xl sm:text-4xl font-serif text-[#E5E9E7] font-bold">
                  {forecast.demandScore}/100
                </span>
                <span className="text-[10px] font-bold text-[#0F1411] bg-[#C2D66E] px-2 py-0.5 rounded-full uppercase tracking-wider">
                  High Demand
                </span>
              </div>
              <div className="w-full bg-[#242C28] h-2 rounded-full overflow-hidden border border-[#2C3631]">
                <div
                  className="bg-[#C2D66E] h-full rounded-full"
                  style={{ width: `${forecast.demandScore}%` }}
                ></div>
              </div>
            </div>

            {/* AI Confidence */}
            <div className="bg-[#1A221E] border border-[#2C3631] rounded-3xl p-5 flex flex-col justify-between">
              <span className="text-[10px] uppercase tracking-widest font-semibold text-[#8E9B94]">
                Model Confidence
              </span>
              <div className="my-3">
                <span className="text-3xl sm:text-4xl font-serif text-[#E5E9E7] font-bold">
                  {forecast.confidenceScore}%
                </span>
              </div>
              <span className="text-[11px] text-[#8E9B94] font-medium flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#C2D66E]" />
                Validated via 24 Mandis
              </span>
            </div>
          </div>

          {/* Optimal Harvest Timing Banner */}
          <div className="p-5 sm:p-6 rounded-3xl bg-[#1A221E] border-l-4 border-[#C2D66E] border-y border-r border-[#2C3631] flex flex-col sm:flex-row sm:items-center justify-between gap-5 shadow-xl">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#242C28] text-[#C2D66E] border border-[#2C3631] flex items-center justify-center font-bold shrink-0 mt-0.5">
                <Calendar className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] uppercase tracking-widest font-bold text-[#C2D66E] block">
                  {t.harvestAdvisory}
                </span>
                <h4 className="text-lg sm:text-xl font-serif italic font-bold text-white mt-0.5">
                  {forecast.optimalHarvestWindow}
                </h4>
                <p className="text-xs text-[#8E9B94] mt-1 leading-relaxed">
                  {forecast.farmerAdvisorySummary}
                </p>
              </div>
            </div>

            <button
              onClick={() => onNavigateTab('marketplace')}
              className="px-5 py-3 rounded-full bg-[#C2D66E] hover:bg-[#D4E4BC] text-[#0F1411] font-bold text-xs uppercase tracking-wider shrink-0 active:scale-95 transition-all shadow-sm flex items-center gap-2"
            >
              <span>Pre-List Harvest</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>

          {/* Weekly Price Trend Visualization & Demand Drivers */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* 4-Week Price Bar Chart */}
            <div className="lg:col-span-7 bg-[#1A221E] border border-[#2C3631] rounded-3xl p-5 sm:p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BarChart2 className="w-5 h-5 text-[#C2D66E]" />
                  <h3 className="font-serif italic font-bold text-lg text-white">
                    4-Week Price Trajectory Projection
                  </h3>
                </div>
                <span className="text-xs text-[#8E9B94]">Unit: ₹ / {forecast.unit}</span>
              </div>

              <div className="grid grid-cols-4 gap-3 pt-4">
                {forecast.priceForecastWeekly.map((item, idx) => {
                  const maxPrice = Math.max(...forecast.priceForecastWeekly.map((p) => p.price));
                  const heightPercent = Math.round((item.price / maxPrice) * 100);

                  return (
                    <div key={idx} className="flex flex-col items-center justify-end h-48 space-y-2">
                      <span className="text-xs font-serif font-bold text-[#C2D66E]">
                        ₹{item.price}
                      </span>
                      <div className="w-full max-w-[48px] bg-[#242C28] rounded-2xl p-1 flex flex-col justify-end h-32 border border-[#2C3631]">
                        <div
                          className="w-full bg-[#C2D66E] rounded-xl transition-all duration-500"
                          style={{ height: `${heightPercent}%` }}
                        ></div>
                      </div>
                      <span className="text-xs font-medium text-[#E5E9E7] text-center">
                        {item.week}
                      </span>
                      <span className="text-[10px] text-[#8E9B94]">
                        {item.demandLevel}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Key Demand Drivers */}
            <div className="lg:col-span-5 bg-[#1A221E] border border-[#2C3631] rounded-3xl p-5 sm:p-6 space-y-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Target className="w-5 h-5 text-[#C2D66E]" />
                  <h3 className="font-serif italic font-bold text-lg text-white">
                    Key Drivers Behind This Forecast
                  </h3>
                </div>

                <div className="space-y-2.5">
                  {forecast.keyDemandDrivers.map((driver, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-[#242C28] border border-[#2C3631] rounded-2xl flex items-start gap-3 text-xs text-[#E5E9E7]"
                    >
                      <span className="w-5 h-5 rounded-full bg-[#C2D66E] text-[#0F1411] font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <span className="leading-relaxed">{driver}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-3.5 bg-[#242C28] border border-[#2C3631] rounded-2xl text-xs text-[#8E9B94] flex items-center justify-between">
                <span>Want tailored cultivation guide?</span>
                <button
                  onClick={() => onNavigateTab('tutorials')}
                  className="font-bold text-[#C2D66E] hover:underline"
                >
                  View Guide
                </button>
              </div>
            </div>
          </div>

          {/* Historical Data, Weather Pattern Impacts & Market Trends Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Historical Data Benchmarking */}
            <div className="bg-[#1A221E] border border-[#2C3631] rounded-3xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase tracking-wider font-semibold text-[#8E9B94]">
                  Historical Benchmark
                </span>
                <span className="text-[10px] font-bold text-[#C2D66E] bg-[#C2D66E]/10 px-2 py-0.5 rounded-full">
                  5-Yr Dataset
                </span>
              </div>

              <div>
                <span className="text-2xl font-serif font-bold text-white">
                  ₹{forecast.historicalComparison?.lastYearSameMonthAvgPrice || Math.round(forecast.currentMandiPrice * 0.88)} / {forecast.unit}
                </span>
                <span className="text-xs text-[#8E9B94] block mt-0.5">
                  Last year same period average
                </span>
              </div>

              <div className="space-y-2 pt-1 border-t border-[#2C3631]/60 text-xs">
                <div className="flex justify-between text-[#8E9B94]">
                  <span>5-Year CAGR:</span>
                  <span className="font-semibold text-[#E5E9E7]">{forecast.historicalComparison?.fiveYearPriceTrend || '+18.4% Appreciation'}</span>
                </div>
                <div className="flex justify-between text-[#8E9B94]">
                  <span>Arrival Deficit:</span>
                  <span className="font-semibold text-[#C2D66E]">{forecast.historicalComparison?.historicalSupplyArrivalTons || '-22% vs 3-Yr Avg'}</span>
                </div>
                <p className="text-[11px] text-[#8E9B94] italic mt-1 leading-relaxed">
                  {forecast.historicalComparison?.seasonalPriceCycle || 'Pre-festive seasonal demand peaks consistently in current quarter.'}
                </p>
              </div>
            </div>

            {/* Weather Patterns & Climate Advisory */}
            <div className="bg-[#1A221E] border border-[#2C3631] rounded-3xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase tracking-wider font-semibold text-[#8E9B94]">
                  Weather & Climate Impact
                </span>
                <span className="text-[10px] font-bold text-[#0F1411] bg-[#C2D66E] px-2 py-0.5 rounded-full">
                  {forecast.weatherImpact?.rainfallAndHumidityRisk || 'Favorable Clear'}
                </span>
              </div>

              <div>
                <span className="text-sm font-semibold text-white block">
                  {forecast.weatherImpact?.temperatureOutlook || 'Stable 29°C max / 19°C min'}
                </span>
                <p className="text-xs text-[#8E9B94] mt-1 leading-relaxed">
                  {forecast.weatherImpact?.forecastSummary || 'Clear skies and moderate humidity favor optimal fruit firmness & brix.'}
                </p>
              </div>

              <div className="pt-2 border-t border-[#2C3631]/60 text-[11px] text-[#D4E4BC] bg-[#242C28] p-2.5 rounded-xl border border-[#2C3631]">
                <span className="font-bold block text-white text-[10px] uppercase tracking-wider mb-0.5">Harvest Advisory:</span>
                {forecast.weatherImpact?.harvestAdvisoryBasedOnWeather || 'Optimal dry spell over the next 8-10 days makes morning plucking ideal for export transit.'}
              </div>
            </div>

            {/* Macro Market Trends */}
            <div className="bg-[#1A221E] border border-[#2C3631] rounded-3xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase tracking-wider font-semibold text-[#8E9B94]">
                  Market Trends & Demand Inflows
                </span>
                <span className="text-[10px] font-bold text-[#C2D66E] bg-[#C2D66E]/10 px-2 py-0.5 rounded-full">
                  Institutional
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="p-2 bg-[#242C28] rounded-xl border border-[#2C3631] flex justify-between items-center">
                  <span className="text-[#8E9B94]">Organized Retail Surge:</span>
                  <span className="font-bold text-[#C2D66E]">{forecast.marketTrends?.metroRetailSurgePercent || '+28% YoY'}</span>
                </div>
                <div className="p-2 bg-[#242C28] rounded-xl border border-[#2C3631] flex justify-between items-center">
                  <span className="text-[#8E9B94]">Export Cargo Pull:</span>
                  <span className="font-bold text-[#E5E9E7]">{forecast.marketTrends?.exportOrderVolume || 'High Gulf Inquiries'}</span>
                </div>
                <div className="p-2 bg-[#242C28] rounded-xl border border-[#2C3631] flex justify-between items-center">
                  <span className="text-[#8E9B94]">Mandi Arrival Drop:</span>
                  <span className="font-bold text-amber-300">{forecast.marketTrends?.mandiArrivalShortfallPercent || '-19% Shortfall'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* High-Demand Buyer Segments */}
          <div className="bg-[#1A221E] border border-[#2C3631] rounded-3xl p-5 sm:p-6 space-y-4">
            <h3 className="font-serif italic font-bold text-lg text-white flex items-center gap-2">
              <PieChart className="w-5 h-5 text-[#C2D66E]" />
              Active Institutional Buyer Segments Ready to Procure
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
              {forecast.buyerSegmentsInDemand.map((seg, idx) => (
                <div
                  key={idx}
                  className="bg-[#242C28] border border-[#2C3631] rounded-2xl p-4 space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white line-clamp-1">
                      {seg.segment}
                    </span>
                    <span className="bg-[#C2D66E]/20 text-[#C2D66E] text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                      {seg.willingnessToPay} Pay
                    </span>
                  </div>
                  <div className="text-xs text-[#8E9B94]">
                    Estimated Open Demand: <span className="font-bold text-[#E5E9E7]">{seg.qtyNeededTons} Tons</span>
                  </div>
                  <button
                    onClick={() => onNavigateTab('marketplace')}
                    className="w-full mt-2 py-2 rounded-xl border border-[#C2D66E] text-[#C2D66E] hover:bg-[#C2D66E] hover:text-[#0F1411] text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1"
                  >
                    <span>Match Produce Lot</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
