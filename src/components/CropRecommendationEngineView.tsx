import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Sprout,
  TrendingUp,
  CloudSun,
  Layers,
  Droplets,
  DollarSign,
  Award,
  ChevronRight,
  RefreshCw,
  Volume2,
  VolumeX,
  ArrowUpRight,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  FileSpreadsheet,
  BookOpen,
  ShoppingBag,
} from 'lucide-react';
import {
  CropRecommendationResponse,
  LanguageCode,
  SoilHealthInput,
  SoilType,
  SeasonType,
  IrrigationType,
  UserRole,
} from '../types';
import { translations } from '../utils/translations';
import { audioSpeech } from '../utils/audioSpeech';
import { fetchCropRecommendations } from '../services/geminiService';
import { CropYieldAnalyticsSection } from './CropYieldAnalyticsSection';

interface CropRecommendationEngineViewProps {
  currentLanguage: LanguageCode;
  onNavigateTab: (tab: string, filter?: string) => void;
  userRole?: UserRole;
}

const PRESET_SOIL_REPORTS: { label: string; district: string; state: string; data: SoilHealthInput }[] = [
  {
    label: 'Maharashtra - Black Soil & Drip (Baramati/Pune)',
    district: 'Pune',
    state: 'Maharashtra',
    data: {
      soilType: 'black_cotton',
      phLevel: 7.2,
      organicCarbonPercent: 0.68,
      nitrogen: 'medium',
      phosphorus: 'low',
      potassium: 'high',
      electricalConductivityDsm: 0.45,
      season: 'kharif',
      state: 'Maharashtra',
      district: 'Pune / Baramati',
      irrigation: 'drip',
      landSizeAcres: 3,
      budgetPerAcreINR: 150000,
      expectedRainfall: 'Normal'
    }
  },
  {
    label: 'Maharashtra - Nashik Horticulture Loam',
    district: 'Nashik',
    state: 'Maharashtra',
    data: {
      soilType: 'red_loamy',
      phLevel: 6.8,
      organicCarbonPercent: 0.85,
      nitrogen: 'high',
      phosphorus: 'medium',
      potassium: 'medium',
      electricalConductivityDsm: 0.35,
      season: 'rabi',
      state: 'Maharashtra',
      district: 'Nashik',
      irrigation: 'drip',
      landSizeAcres: 5,
      budgetPerAcreINR: 180000,
      expectedRainfall: 'Normal'
    }
  },
  {
    label: 'Vidarbha / Marathwada - Semi-Arid Soil',
    district: 'Latur',
    state: 'Maharashtra',
    data: {
      soilType: 'clayey',
      phLevel: 7.8,
      organicCarbonPercent: 0.45,
      nitrogen: 'low',
      phosphorus: 'low',
      potassium: 'medium',
      electricalConductivityDsm: 0.8,
      season: 'zaid',
      state: 'Maharashtra',
      district: 'Latur / Nanded',
      irrigation: 'drip',
      landSizeAcres: 4,
      budgetPerAcreINR: 90000,
      expectedRainfall: 'Deficit / Drought Risk'
    }
  },
  {
    label: 'North India - Punjab/Haryana Alluvial Loam',
    district: 'Karnal',
    state: 'Haryana',
    data: {
      soilType: 'alluvial',
      phLevel: 7.4,
      organicCarbonPercent: 0.55,
      nitrogen: 'medium',
      phosphorus: 'high',
      potassium: 'high',
      electricalConductivityDsm: 0.4,
      season: 'rabi',
      state: 'Haryana',
      district: 'Karnal',
      irrigation: 'sprinkler',
      landSizeAcres: 6,
      budgetPerAcreINR: 120000,
      expectedRainfall: 'Normal'
    }
  }
];

export const CropRecommendationEngineView: React.FC<CropRecommendationEngineViewProps> = ({
  currentLanguage,
  onNavigateTab,
  userRole,
}) => {
  const t = translations[currentLanguage];

  // Form State
  const [formData, setFormData] = useState<SoilHealthInput>(PRESET_SOIL_REPORTS[0].data);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [recommendations, setRecommendations] = useState<CropRecommendationResponse | null>(null);
  const [selectedCropId, setSelectedCropId] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const [activeAccordion, setActiveAccordion] = useState<Record<string, boolean>>({});

  // Trigger initial recommendation load
  useEffect(() => {
    handleGenerateRecommendations();
  }, [currentLanguage]);

  // Clean up speech on unmount
  useEffect(() => {
    return () => {
      audioSpeech.stop();
    };
  }, []);

  const handleGenerateRecommendations = async () => {
    setIsGenerating(true);
    audioSpeech.stop();
    setIsPlayingAudio(false);

    try {
      const response = await fetchCropRecommendations(formData, currentLanguage);
      setRecommendations(response);
      if (response && response.topRecommendations && response.topRecommendations.length > 0) {
        setSelectedCropId(response.topRecommendations[0].id);
      }
    } catch (err) {
      console.error('Failed to get crop recommendations:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleLoadPreset = (preset: (typeof PRESET_SOIL_REPORTS)[0]) => {
    setFormData(preset.data);
  };

  const handleToggleAudio = () => {
    if (!recommendations) return;

    if (isPlayingAudio) {
      audioSpeech.stop();
      setIsPlayingAudio(false);
      return;
    }

    const textToSpeak = recommendations.spokenAudioScript || recommendations.expertAdvisorSummary;
    if (!textToSpeak) return;

    setIsPlayingAudio(true);
    audioSpeech.speak(
      textToSpeak,
      currentLanguage,
      () => setIsPlayingAudio(true),
      () => setIsPlayingAudio(false),
      () => setIsPlayingAudio(false)
    );
  };

  const toggleAccordion = (id: string) => {
    setActiveAccordion((prev) => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const filteredCrops = recommendations?.topRecommendations.filter((crop) => {
    if (filterCategory === 'all') return true;
    return crop.category === filterCategory;
  }) || [];

  return (
    <div className="space-y-6 sm:space-y-8 pb-24">
      {/* Header Banner */}
      <div className="bg-[#1A221E] border border-[#2C3631] rounded-3xl p-5 sm:p-7 shadow-xl relative overflow-hidden">
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-[#C2D66E]/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#C2D66E]/20 border border-[#C2D66E]/40 text-[#C2D66E] text-xs font-bold tracking-wide">
                <Sparkles className="w-3.5 h-3.5" />
                Gemini 3.8 AI Agro-Analytics
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#242C28] text-[#8E9B94] text-[11px] font-medium border border-[#2C3631]">
                <Layers className="w-3 h-3 text-[#C2D66E]" />
                Soil Health × Weather Patterns × APMC Market Demand
              </span>
            </div>
            
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#E5E9E7] tracking-tight">
              {t.cropAdvisor}
            </h1>
            
            <p className="text-sm text-[#8E9B94] max-w-2xl leading-relaxed">
              {currentLanguage === 'mr'
                ? 'माती परीक्षण अहवाल, प्रादेशिक हवामानाचा कल आणि कॉर्पोरेट खरेदीदारांची थेट मागणी यांचे विश्लेषण करून प्रति एकर सर्वाधिक निव्वळ नफा देणारी पिके निवडा.'
                : currentLanguage === 'hi'
                ? 'मिट्टी परीक्षण डेटा, क्षेत्रीय मौसम चक्र और बाजार की मांग के आधार पर अपनी जमीन के लिए सर्वाधिक लाभकारी फसलों की वैज्ञानिक सिफारिश प्राप्त करें।'
                : 'Triangulate soil nutrient profiles, multi-week weather forecasts, and corporate procurement demand to maximize farm net profit per acre.'}
            </p>
          </div>

          {/* Quick Preset Selector & Voice CTA */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {recommendations && (
              <button
                id="listen-crop-advisory-btn"
                type="button"
                onClick={handleToggleAudio}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all shadow-sm cursor-pointer ${
                  isPlayingAudio
                    ? 'bg-[#C2D66E] text-[#0F1411] ring-2 ring-[#C2D66E]/50 animate-pulse'
                    : 'bg-[#242C28] hover:bg-[#2C3631] text-[#D4E4BC] border border-[#2C3631]'
                }`}
              >
                {isPlayingAudio ? (
                  <>
                    <VolumeX className="w-4 h-4 text-[#0F1411]" />
                    <span>{t.stopAudio}</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="w-4 h-4 text-[#C2D66E]" />
                    <span>{t.listenAudio}</span>
                  </>
                )}
              </button>
            )}

            <button
              id="re-generate-plan-btn"
              type="button"
              onClick={handleGenerateRecommendations}
              disabled={isGenerating}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#C2D66E] hover:bg-[#D4E4BC] text-[#0F1411] rounded-2xl font-bold text-xs uppercase tracking-wider transition-all shadow-md active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
              <span>{isGenerating ? 'Analyzing Soil & Market...' : t.generatePlan}</span>
            </button>
          </div>
        </div>

        {/* Quick Sample Presets Bar */}
        <div className="mt-5 pt-4 border-t border-[#2C3631] flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <span className="text-[#8E9B94] font-semibold whitespace-nowrap flex items-center gap-1.5 shrink-0">
            <FileSpreadsheet className="w-3.5 h-3.5 text-[#C2D66E]" />
            {currentLanguage === 'mr' ? 'माती परीक्षण नमुना लोड करा:' : 'Quick Soil Profiles:'}
          </span>
          {PRESET_SOIL_REPORTS.map((p, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleLoadPreset(p)}
              className="px-3 py-1.5 rounded-xl bg-[#242C28] hover:bg-[#2C3631] text-[#D4E4BC] border border-[#2C3631] whitespace-nowrap transition-colors text-[11px] font-medium cursor-pointer"
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Input Parameters Matrix */}
      <div className="bg-[#1A221E] border border-[#2C3631] rounded-3xl p-5 sm:p-6 shadow-lg space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-[#2C3631]">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-[#C2D66E]" />
            <h2 className="text-base sm:text-lg font-bold text-[#E5E9E7]">
              {currentLanguage === 'mr' ? 'तुमच्या शेताचे माती, हवामान व सिंचन तपशील' : 'Farm Soil, Climate & Irrigation Parameters'}
            </h2>
          </div>
          <span className="text-xs text-[#8E9B94]">
            {currentLanguage === 'mr' ? 'बदल करून लगेच शिफारस मिळवा' : 'Adjust values to refine forecast'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          {/* 1. Soil Type & pH */}
          <div className="bg-[#141A17] p-4 rounded-2xl border border-[#2C3631] space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-[#D4E4BC] flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-[#C2D66E]" />
                {t.soilType}
              </span>
              <span className="text-[10px] text-[#C2D66E] font-semibold bg-[#C2D66E]/10 px-2 py-0.5 rounded-full">
                pH {formData.phLevel}
              </span>
            </div>

            <select
              value={formData.soilType}
              onChange={(e) => setFormData({ ...formData, soilType: e.target.value as SoilType })}
              className="w-full bg-[#1A221E] border border-[#2C3631] text-[#E5E9E7] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#C2D66E]"
            >
              <option value="black_cotton">Black Clay / Regur Soil (काळी कसदार जमीन)</option>
              <option value="red_loamy">Red Loamy & Sandy Loam (तांबडी पोयटा जमीन)</option>
              <option value="alluvial">Deep Alluvial River Loam (गाळाची जमीन)</option>
              <option value="clayey">Medium Black & Clayey (मध्यम काळी / मुरमाड)</option>
              <option value="laterite">Laterite / Konkan Soil (जांभी जमीन)</option>
              <option value="sandy_loam">Sandy Loam / Coastal (वालुकामय जमीन)</option>
            </select>

            <div>
              <div className="flex justify-between text-[11px] text-[#8E9B94] mb-1">
                <span>{t.phLevel}:</span>
                <span className="font-bold text-[#E5E9E7]">
                  {formData.phLevel} ({formData.phLevel < 6.5 ? 'Acidic' : formData.phLevel > 7.5 ? 'Alkaline' : 'Neutral/Ideal'})
                </span>
              </div>
              <input
                type="range"
                min="5.5"
                max="8.5"
                step="0.1"
                value={formData.phLevel}
                onChange={(e) => setFormData({ ...formData, phLevel: parseFloat(e.target.value) })}
                className="w-full accent-[#C2D66E] cursor-pointer"
              />
            </div>
          </div>

          {/* 2. NPK Fertility & Organic Carbon */}
          <div className="bg-[#141A17] p-4 rounded-2xl border border-[#2C3631] space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-[#D4E4BC] flex items-center gap-1.5">
                <Sprout className="w-3.5 h-3.5 text-[#C2D66E]" />
                NPK & Organic Carbon
              </span>
              <span className="text-[10px] text-[#8E9B94]">OC: {formData.organicCarbonPercent}%</span>
            </div>

            <div className="grid grid-cols-3 gap-1.5 text-center">
              <div>
                <label className="text-[10px] text-[#8E9B94] block">N (नत्र)</label>
                <select
                  value={formData.nitrogen}
                  onChange={(e) => setFormData({ ...formData, nitrogen: e.target.value as any })}
                  className="w-full bg-[#1A221E] border border-[#2C3631] text-[#E5E9E7] rounded-lg py-1 px-1 text-[11px] text-center"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="optimal">Optimal</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] text-[#8E9B94] block">P (स्फुरद)</label>
                <select
                  value={formData.phosphorus}
                  onChange={(e) => setFormData({ ...formData, phosphorus: e.target.value as any })}
                  className="w-full bg-[#1A221E] border border-[#2C3631] text-[#E5E9E7] rounded-lg py-1 px-1 text-[11px] text-center"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="optimal">Optimal</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] text-[#8E9B94] block">K (पालाश)</label>
                <select
                  value={formData.potassium}
                  onChange={(e) => setFormData({ ...formData, potassium: e.target.value as any })}
                  className="w-full bg-[#1A221E] border border-[#2C3631] text-[#E5E9E7] rounded-lg py-1 px-1 text-[11px] text-center"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="optimal">Optimal</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-[10px] text-[#8E9B94] block mb-1">Electrical Conductivity (EC dS/m)</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  step="0.05"
                  min="0.1"
                  max="3.0"
                  value={formData.electricalConductivityDsm}
                  onChange={(e) => setFormData({ ...formData, electricalConductivityDsm: parseFloat(e.target.value) || 0.4 })}
                  className="w-full bg-[#1A221E] border border-[#2C3631] text-[#E5E9E7] rounded-xl px-2.5 py-1.5 text-xs"
                />
                <span className="text-[10px] text-[#8E9B94] whitespace-nowrap">
                  {formData.electricalConductivityDsm < 0.8 ? 'Normal Salinity' : 'High Salinity'}
                </span>
              </div>
            </div>
          </div>

          {/* 3. Season & Regional Climate */}
          <div className="bg-[#141A17] p-4 rounded-2xl border border-[#2C3631] space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-[#D4E4BC] flex items-center gap-1.5">
                <CloudSun className="w-3.5 h-3.5 text-[#C2D66E]" />
                {t.seasonSelect}
              </span>
            </div>

            <select
              value={formData.season}
              onChange={(e) => setFormData({ ...formData, season: e.target.value as SeasonType })}
              className="w-full bg-[#1A221E] border border-[#2C3631] text-[#E5E9E7] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#C2D66E]"
            >
              <option value="kharif">Kharif Season (पावसाळी हंगाम - June to Oct)</option>
              <option value="rabi">Rabi Season (हिवाळी हंगाम - Oct to Feb)</option>
              <option value="zaid">Zaid / Summer (उन्हाळी हंगाम - Feb to May)</option>
              <option value="perennial">Perennial Commercial Orchard (बहुवार्षिक बागायत)</option>
            </select>

            <div>
              <label className="text-[10px] text-[#8E9B94] block mb-1">District / Agro-Zone</label>
              <input
                type="text"
                value={formData.district}
                onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                placeholder="District (e.g., Pune, Nashik, Karnal)"
                className="w-full bg-[#1A221E] border border-[#2C3631] text-[#E5E9E7] rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:border-[#C2D66E]"
              />
            </div>
          </div>

          {/* 4. Irrigation, Farm Size & Budget */}
          <div className="bg-[#141A17] p-4 rounded-2xl border border-[#2C3631] space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-[#D4E4BC] flex items-center gap-1.5">
                <Droplets className="w-3.5 h-3.5 text-[#C2D66E]" />
                {t.irrigationSource}
              </span>
              <span className="text-[10px] text-[#8E9B94]">{formData.landSizeAcres} {t.farmSize}</span>
            </div>

            <select
              value={formData.irrigation}
              onChange={(e) => setFormData({ ...formData, irrigation: e.target.value as IrrigationType })}
              className="w-full bg-[#1A221E] border border-[#2C3631] text-[#E5E9E7] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#C2D66E]"
            >
              <option value="drip">Drip Fertigation (ठिबक सिंचन)</option>
              <option value="sprinkler">Sprinkler Irrigation (तुषार सिंचन)</option>
              <option value="canal_flood">Canal / Flood Open (पाट पाणी)</option>
              <option value="borewell_well">Borewell / Well Irrigation (विहीर/बोअरवेल)</option>
              <option value="rainfed">Rainfed / Dryland (कोरडवाहू)</option>
            </select>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-[#8E9B94] block">Land (Acres)</label>
                <input
                  type="number"
                  min="0.5"
                  max="50"
                  step="0.5"
                  value={formData.landSizeAcres}
                  onChange={(e) => setFormData({ ...formData, landSizeAcres: parseFloat(e.target.value) || 1 })}
                  className="w-full bg-[#1A221E] border border-[#2C3631] text-[#E5E9E7] rounded-lg py-1 px-2 text-xs"
                />
              </div>
              <div>
                <label className="text-[10px] text-[#8E9B94] block">Budget (₹/Acre)</label>
                <input
                  type="number"
                  min="20000"
                  step="10000"
                  value={formData.budgetPerAcreINR}
                  onChange={(e) => setFormData({ ...formData, budgetPerAcreINR: parseInt(e.target.value) || 50000 })}
                  className="w-full bg-[#1A221E] border border-[#2C3631] text-[#E5E9E7] rounded-lg py-1 px-2 text-xs"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Synthesis / Loading State */}
      {isGenerating && (
        <div className="bg-[#1A221E] border border-[#C2D66E]/40 rounded-3xl p-8 text-center space-y-4 shadow-2xl animate-pulse">
          <div className="w-16 h-16 rounded-full bg-[#C2D66E]/20 border border-[#C2D66E] flex items-center justify-center mx-auto text-[#C2D66E]">
            <Sparkles className="w-8 h-8 animate-spin" />
          </div>
          <h3 className="text-lg font-serif font-bold text-[#E5E9E7]">
            {currentLanguage === 'mr'
              ? 'माती, हवामान व बाजारपेठ मागणीचे AI विश्लेषण सुरू आहे...'
              : 'Synthesizing Soil Health with Weather Models & APMC Mandi Forecasts...'}
          </h3>
          <p className="text-xs text-[#8E9B94] max-w-md mx-auto">
            Cross-referencing soil pH {formData.phLevel}, NPK ratios, regional temperature trends in {formData.district}, and B2B off-taker purchase volumes.
          </p>
        </div>
      )}

      {/* Recommendations Results Dashboard */}
      {recommendations && !isGenerating && (
        <div className="space-y-6">
          {/* Agro-Soil Diagnostic Summary Bar */}
          <div className="bg-[#141A17] border border-[#2C3631] rounded-3xl p-5 sm:p-6 shadow-md grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5 border-b md:border-b-0 md:border-r border-[#2C3631] pb-3 md:pb-0 md:pr-4">
              <span className="text-[10px] uppercase tracking-wider font-bold text-[#C2D66E] flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Soil Health Index
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-bold font-serif text-[#E5E9E7]">
                  {recommendations.overallSoilHealthAnalysis.healthIndexScore}
                </span>
                <span className="text-xs text-[#8E9B94]">/ 100 Optimal</span>
              </div>
              <p className="text-xs text-[#8E9B94] line-clamp-2">
                {recommendations.overallSoilHealthAnalysis.npkBalanceStatus}
              </p>
            </div>

            <div className="space-y-1.5 border-b md:border-b-0 md:border-r border-[#2C3631] pb-3 md:pb-0 md:pr-4">
              <span className="text-[10px] uppercase tracking-wider font-bold text-[#D4E4BC] flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5 text-[#C2D66E]" />
                Nutrient Limiting Factor
              </span>
              <p className="text-xs font-semibold text-[#E5E9E7]">
                {recommendations.overallSoilHealthAnalysis.primaryLimitingFactor}
              </p>
              <p className="text-[11px] text-[#8E9B94]">
                {recommendations.overallSoilHealthAnalysis.organicMatterStatus}
              </p>
            </div>

            <div className="space-y-1.5">
              <span className="text-[10px] uppercase tracking-wider font-bold text-[#C2D66E] flex items-center gap-1">
                <CloudSun className="w-3.5 h-3.5" />
                Seasonal Climate Match
              </span>
              <p className="text-xs text-[#D4E4BC] leading-relaxed">
                {recommendations.seasonalClimateOutlook}
              </p>
            </div>
          </div>

          {/* Visual Yield Analytics Section using Recharts */}
          <CropYieldAnalyticsSection
            crops={recommendations.topRecommendations}
            currentLanguage={currentLanguage}
            initialLandSizeAcres={formData.landSizeAcres}
            selectedCropId={selectedCropId}
            onSelectCrop={(id) => {
              setSelectedCropId(id);
              const cardElement = document.getElementById(`crop-card-${id}`);
              if (cardElement) {
                cardElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
              }
            }}
          />

          {/* Category Filter Pills & Rank Title */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#E5E9E7]">
                {t.profitRankedCrops}
              </h2>
              <p className="text-xs text-[#8E9B94]">
                {currentLanguage === 'mr'
                  ? 'सर्व पिके एकरी निव्वळ नफा आणि बाजार मागणीनुसार क्रमवारीने लावली आहेत.'
                  : 'Ranked by net profit realization, market pull, and agro-climatic resilience.'}
              </p>
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
              {[
                { id: 'all', label: t.allCrops },
                { id: 'exotic', label: t.exoticCrops },
                { id: 'fruits', label: t.fruits },
                { id: 'vegetables', label: t.vegetables },
                { id: 'grains', label: t.grains },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setFilterCategory(tab.id)}
                  className={`px-3 py-1.5 rounded-xl font-semibold transition-all whitespace-nowrap cursor-pointer ${
                    filterCategory === tab.id
                      ? 'bg-[#C2D66E] text-[#0F1411] shadow-sm'
                      : 'bg-[#1A221E] text-[#8E9B94] hover:text-[#E5E9E7] border border-[#2C3631]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Top Ranked Recommendations Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {filteredCrops.map((crop) => {
              const isAccordionOpen = activeAccordion[crop.id] ?? false;

              const isSelected = selectedCropId === crop.id;

              return (
                <div
                  key={crop.id}
                  id={`crop-card-${crop.id}`}
                  onClick={() => setSelectedCropId(crop.id)}
                  className={`bg-[#1A221E] border rounded-3xl p-5 sm:p-6 shadow-xl transition-all duration-200 flex flex-col justify-between cursor-pointer ${
                    isSelected
                      ? 'border-[#C2D66E] ring-2 ring-[#C2D66E]/40 bg-gradient-to-br from-[#1A221E] to-[#141A17]'
                      : crop.rank === 1
                      ? 'border-[#C2D66E]/70 ring-1 ring-[#C2D66E]/20 bg-gradient-to-br from-[#1A221E] to-[#141A17]'
                      : 'border-[#2C3631] hover:border-[#C2D66E]/50'
                  }`}
                >
                  <div>
                    {/* Top Badges & Rank */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-1 ${
                          crop.rank === 1
                            ? 'bg-[#C2D66E] text-[#0F1411]'
                            : 'bg-[#242C28] text-[#D4E4BC] border border-[#2C3631]'
                        }`}>
                          <Award className="w-3.5 h-3.5" />
                          #{crop.rank} Most Profitable
                        </span>

                        <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#C2D66E]/15 border border-[#C2D66E]/30 text-[#C2D66E]">
                          {crop.suitabilityScore}% Soil & Climate Fit
                        </span>

                        <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#242C28] text-[#8E9B94] border border-[#2C3631]">
                          ROI: {crop.roiPercent}%
                        </span>
                      </div>

                      <span className="text-[11px] font-semibold text-[#8E9B94] bg-[#141A17] px-2 py-1 rounded-lg border border-[#2C3631] shrink-0">
                        {crop.harvestDurationDays} Days Cycle
                      </span>
                    </div>

                    {/* Crop Name & Variety */}
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div>
                        <h3 className="text-xl font-serif font-bold text-[#E5E9E7]">
                          {crop.localName || crop.cropName}
                        </h3>
                        <p className="text-xs text-[#8E9B94]">
                          {crop.cropName} • Variety: <span className="text-[#D4E4BC] font-medium">{crop.variety}</span>
                        </p>
                      </div>

                      {crop.imageUrl && (
                        <img
                          src={crop.imageUrl}
                          alt={crop.cropName}
                          referrerPolicy="no-referrer"
                          className="w-14 h-14 rounded-2xl object-cover border border-[#2C3631] shrink-0 shadow-sm"
                        />
                      )}
                    </div>

                    {/* Financial Economics Highlight Box */}
                    <div className="bg-[#141A17] border border-[#2C3631] rounded-2xl p-3.5 mb-4 grid grid-cols-3 gap-2 text-center">
                      <div className="border-r border-[#2C3631]">
                        <span className="text-[10px] text-[#8E9B94] uppercase tracking-wider block font-semibold">
                          Net Profit / Acre
                        </span>
                        <span className="text-base sm:text-lg font-bold text-[#C2D66E]">
                          ₹{(crop.projectedProfitPerAcreINR / 100000).toFixed(2)}L
                        </span>
                        <span className="text-[9px] text-[#8E9B94] block">After all input costs</span>
                      </div>

                      <div className="border-r border-[#2C3631]">
                        <span className="text-[10px] text-[#8E9B94] uppercase tracking-wider block font-semibold">
                          Gross Revenue
                        </span>
                        <span className="text-sm sm:text-base font-bold text-[#E5E9E7]">
                          ₹{(crop.projectedRevenuePerAcreINR / 100000).toFixed(2)}L
                        </span>
                        <span className="text-[9px] text-[#8E9B94] block">Yield: {crop.expectedYieldTonsPerAcre} Tons</span>
                      </div>

                      <div>
                        <span className="text-[10px] text-[#8E9B94] uppercase tracking-wider block font-semibold">
                          Mandi Price
                        </span>
                        <span className="text-sm sm:text-base font-bold text-[#D4E4BC]">
                          ₹{crop.expectedPricePerKg.avg}/kg
                        </span>
                        <span className="text-[9px] text-[#8E9B94] block">
                          ₹{crop.expectedPricePerKg.min} - ₹{crop.expectedPricePerKg.max}
                        </span>
                      </div>
                    </div>

                    {/* 3-Pillar Compatibility Rationale */}
                    <div className="space-y-2.5 text-xs">
                      <div className="flex items-start gap-2 bg-[#242C28]/60 p-2.5 rounded-xl border border-[#2C3631]/60">
                        <Layers className="w-4 h-4 text-[#C2D66E] shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold text-[#D4E4BC]">
                            {currentLanguage === 'mr' ? 'माती सुसंगतता:' : 'Soil Match:'}{' '}
                          </span>
                          <span className="text-[#8E9B94] leading-relaxed">
                            {crop.soilCompatibilityRationale}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-start gap-2 bg-[#242C28]/60 p-2.5 rounded-xl border border-[#2C3631]/60">
                        <CloudSun className="w-4 h-4 text-[#C2D66E] shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold text-[#D4E4BC]">
                            {currentLanguage === 'mr' ? 'हवामान तग धरण्याची क्षमता:' : 'Climate Resilience:'}{' '}
                          </span>
                          <span className="text-[#8E9B94] leading-relaxed">
                            {crop.weatherResilienceRationale}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-start gap-2 bg-[#242C28]/60 p-2.5 rounded-xl border border-[#2C3631]/60">
                        <TrendingUp className="w-4 h-4 text-[#C2D66E] shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold text-[#D4E4BC]">
                            {currentLanguage === 'mr' ? 'थेट बाजार मागणी:' : 'Market Demand:'}{' '}
                          </span>
                          <span className="text-[#8E9B94] leading-relaxed">
                            {crop.marketDemandRationale}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Accordion: Soil Prescription & Cultivation Roadmap */}
                    <div className="mt-4 pt-3 border-t border-[#2C3631]">
                      <button
                        type="button"
                        onClick={() => toggleAccordion(crop.id)}
                        className="w-full flex items-center justify-between text-xs text-[#C2D66E] font-bold hover:underline py-1 cursor-pointer"
                      >
                        <span>
                          {isAccordionOpen
                            ? (currentLanguage === 'mr' ? 'खत डोस व लागवड वेळापत्रक लपवा' : 'Hide Soil Prescription & Roadmap')
                            : (currentLanguage === 'mr' ? 'खत डोस, सरकारी अनुदान व लागवड वेळापत्रक पहा' : 'View Soil Fertilizer Dose, Subsidies & Timeline')}
                        </span>
                        <ChevronRight className={`w-4 h-4 transition-transform duration-200 ${isAccordionOpen ? 'rotate-90' : ''}`} />
                      </button>

                      {isAccordionOpen && (
                        <div className="mt-3 space-y-3 pt-2 text-xs border-t border-[#2C3631]/50 animate-in fade-in duration-150">
                          {/* Fertilizer Prescription */}
                          {crop.soilNutrientPrescription && (
                            <div className="bg-[#141A17] p-3 rounded-xl border border-[#2C3631] space-y-1.5">
                              <span className="font-bold text-[#D4E4BC] flex items-center gap-1.5">
                                <Sprout className="w-3.5 h-3.5 text-[#C2D66E]" />
                                Recommended Soil Nutrient Dosage:
                              </span>
                              <p className="text-[#8E9B94]">{crop.soilNutrientPrescription.fertilizerDosage}</p>
                              <p className="text-[11px] text-[#C2D66E]">{crop.soilNutrientPrescription.organicAmendments}</p>
                            </div>
                          )}

                          {/* Government Subsidy */}
                          {crop.availableGovtSubsidy && (
                            <div className="bg-[#C2D66E]/10 border border-[#C2D66E]/30 p-2.5 rounded-xl text-xs text-[#D4E4BC] flex items-center gap-2">
                              <DollarSign className="w-4 h-4 text-[#C2D66E] shrink-0" />
                              <span>{crop.availableGovtSubsidy}</span>
                            </div>
                          )}

                          {/* Seasonal Roadmap Steps */}
                          {crop.seasonalRoadmap && (
                            <div className="space-y-1.5">
                              <span className="font-bold text-[#D4E4BC] block">
                                {currentLanguage === 'mr' ? 'लागवड टप्पे:' : 'Cultivation Schedule:'}
                              </span>
                              <div className="grid grid-cols-2 gap-2">
                                {crop.seasonalRoadmap.map((step, sIdx) => (
                                  <div key={sIdx} className="bg-[#141A17] p-2 rounded-lg border border-[#2C3631]">
                                    <div className="flex justify-between text-[10px] text-[#C2D66E] font-bold">
                                      <span>{step.stage}</span>
                                      <span>{step.timeframe}</span>
                                    </div>
                                    <p className="text-[11px] text-[#8E9B94] mt-0.5">{step.keyAction}</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Bottom Action Footer */}
                  <div className="mt-5 pt-4 border-t border-[#2C3631] flex flex-wrap items-center justify-between gap-2.5">
                    <div className="flex items-center gap-1.5 text-xs text-[#8E9B94]">
                      <ShoppingBag className="w-3.5 h-3.5 text-[#C2D66E]" />
                      <span>{crop.matchedBuyerDemandsCount || 12} Verified Buyers Active</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => onNavigateTab('tutorials')}
                        className="px-3 py-1.5 rounded-xl bg-[#242C28] hover:bg-[#2C3631] text-[#D4E4BC] border border-[#2C3631] text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <BookOpen className="w-3 h-3 text-[#C2D66E]" />
                        <span>Guide & Subsidy</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => onNavigateTab('marketplace', crop.cropName)}
                        className="px-3 py-1.5 rounded-xl bg-[#C2D66E] hover:bg-[#D4E4BC] text-[#0F1411] text-xs font-bold flex items-center gap-1 transition-colors shadow-sm cursor-pointer"
                      >
                        <span>Connect Buyers</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Expert Advisor Summary Footer */}
          <div className="bg-[#1A221E] border border-[#2C3631] rounded-3xl p-5 sm:p-6 shadow-lg space-y-3">
            <div className="flex items-center gap-2">
              <Sprout className="w-5 h-5 text-[#C2D66E]" />
              <h3 className="text-base sm:text-lg font-serif font-bold text-[#E5E9E7]">
                {currentLanguage === 'mr' ? 'किसानमित्र कृषी तज्ज्ञ सल्लागार मत' : 'KisanMitra Senior Agronomist Advice'}
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-[#D4E4BC] leading-relaxed bg-[#141A17] p-4 rounded-2xl border border-[#2C3631]">
              {recommendations.expertAdvisorSummary}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
