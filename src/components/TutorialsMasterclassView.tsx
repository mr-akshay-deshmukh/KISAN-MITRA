import React, { useState } from 'react';
import { BookOpen, Sparkles, Volume2, Play, CheckCircle2, Award, DollarSign, Sprout, ShieldCheck, ChevronRight, HelpCircle, ArrowRight, MessageSquare, Send, TrendingUp, Lightbulb } from 'lucide-react';
import { ModernCropTutorial, LanguageCode } from '../types';
import { translations } from '../utils/translations';
import { audioSpeech } from '../utils/audioSpeech';
import { askCropAdvisoryAI } from '../services/geminiService';

interface TutorialsMasterclassViewProps {
  tutorials: ModernCropTutorial[];
  currentLanguage: LanguageCode;
  selectedTutorialId?: string;
  onNavigateTab: (tab: string, contextId?: string) => void;
}

export const TutorialsMasterclassView: React.FC<TutorialsMasterclassViewProps> = ({
  tutorials,
  currentLanguage,
  selectedTutorialId,
  onNavigateTab,
}) => {
  const t = translations[currentLanguage];

  const [activeTutorial, setActiveTutorial] = useState<ModernCropTutorial>(
    tutorials.find((tut) => tut.id === selectedTutorialId) || tutorials[0]
  );
  const [activeTab, setActiveTab] = useState<'overview' | 'stages' | 'subsidy' | 'economics' | 'ai_advisor'>('overview');
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);

  // AI Crop Advisor Q&A
  const [advisoryQuestion, setAdvisoryQuestion] = useState('');
  const [advisoryAnswer, setAdvisoryAnswer] = useState<any>(null);
  const [isAdvisoryLoading, setIsAdvisoryLoading] = useState(false);

  const getCropTitleInLang = (tut: ModernCropTutorial) => {
    if (currentLanguage === 'mr' && tut.marathiName) return tut.marathiName;
    if (currentLanguage === 'hi' && tut.hindiName) return tut.hindiName;
    return tut.cropName;
  };

  const handleSpeakOverview = () => {
    setIsAudioPlaying(true);
    const spoken = currentLanguage === 'mr'
      ? `शेतकरी दादा, ${tutNameMR(activeTutorial.cropName)} आधुनिक शेती मार्गदर्शन. गुंतवणूक ${activeTutorial.investmentPerAcre}, वार्षिक उत्पन्न ${activeTutorial.annualIncomePotential}. शासकीय अनुदान ५० टक्के उपलब्ध आहे.`
      : currentLanguage === 'hi'
      ? `किसान भाई, ${activeTutorial.cropName} की उन्नत आधुनिक खेती जानकारी। लागत ${activeTutorial.investmentPerAcre}, वार्षिक आय ${activeTutorial.annualIncomePotential}। 50% तक सरकारी सब्सिडी उपलब्ध है।`
      : `Masterclass for ${activeTutorial.cropName}. Estimated investment ${activeTutorial.investmentPerAcre}, annual income potential ${activeTutorial.annualIncomePotential}. 50% government subsidy available under MIDH.`;

    audioSpeech.speak(
      spoken,
      currentLanguage,
      undefined,
      () => setIsAudioPlaying(false),
      () => setIsAudioPlaying(false)
    );
  };

  const tutNameMR = (name: string) => {
    if (name.toLowerCase().includes('walnut')) return 'अक्रोड';
    if (name.toLowerCase().includes('dragon')) return 'ड्रॅगन फ्रूट';
    if (name.toLowerCase().includes('avocado')) return 'हॅस बटरफ्रूट (अ‍ॅव्होकॅडो)';
    if (name.toLowerCase().includes('saffron')) return 'केशर (Saffron)';
    return name;
  };

  const handleAskAIAdvisor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!advisoryQuestion.trim()) return;

    setIsAdvisoryLoading(true);
    try {
      const response = await askCropAdvisoryAI(
        activeTutorial.cropName,
        advisoryQuestion,
        currentLanguage
      );
      setAdvisoryAnswer(response);
    } catch (err) {
      console.error(err);
    } finally {
      setIsAdvisoryLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Top Banner */}
      <div className="rounded-3xl bg-[#1A221E] border border-[#2C3631] p-5 sm:p-7 shadow-2xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-[#C2D66E]/5 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-2.5 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="bg-[#C2D66E] text-[#0F1411] text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-widest flex items-center gap-1">
                <BookOpen className="w-3.5 h-3.5" />
                Modern Crop Masterclasses
              </span>
              <span className="bg-[#242C28] text-[#D4E4BC] text-[11px] font-medium px-3 py-1 rounded-full border border-[#2C3631]">
                50% Govt Subsidies Grounded
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl md:text-4xl font-serif italic font-bold text-white tracking-tight">
              {currentLanguage === 'mr'
                ? 'आधुनिक शेतीचे प्रगत प्रशिक्षण: अक्रोड, ड्रॅगन फ्रूट व उच्च-नफा पिके'
                : currentLanguage === 'hi'
                ? 'उन्नत व आधुनिक खेती मास्टरक्लास: अखरोट, ड्रैगन फ्रूट एवं उच्च-लाभ फसलें'
                : 'Modern New-Edge Crop Masterclasses'}
            </h1>

            <p className="text-xs sm:text-sm text-[#8E9B94]">
              Complete blueprint for high-density walnut orchards, concrete pole dragon fruit trellis, soilless aeroponics, and verified 40-50% MIDH horticulture subsidies.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleSpeakOverview}
              className={`px-4 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-md transition-all flex items-center gap-2 ${
                isAudioPlaying
                  ? 'bg-[#C2D66E] text-[#0F1411] ring-4 ring-[#C2D66E]/30 animate-pulse'
                  : 'bg-[#C2D66E] hover:bg-[#D4E4BC] text-[#0F1411]'
              }`}
            >
              <Volume2 className="w-4 h-4" />
              <span>{isAudioPlaying ? 'माहिती ऐकत आहे... (Playing)' : t.listenAudio}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tutorial Selector Chips */}
      <div className="flex items-center gap-2.5 overflow-x-auto no-scrollbar pb-1">
        {tutorials.map((tut) => {
          const isSelected = activeTutorial.id === tut.id;
          return (
            <button
              key={tut.id}
              onClick={() => {
                setActiveTutorial(tut);
                setAdvisoryAnswer(null);
                setAdvisoryQuestion('');
              }}
              className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2.5 ${
                isSelected
                  ? 'bg-[#C2D66E] text-[#0F1411] font-bold shadow-md'
                  : 'bg-[#1A221E] border border-[#2C3631] text-[#8E9B94] hover:bg-[#242C28] hover:text-[#E5E9E7]'
              }`}
            >
              <img src={tut.bannerImage} alt={tut.cropName} className="w-5 h-5 rounded-full object-cover" />
              <span>{getCropTitleInLang(tut)}</span>
            </button>
          );
        })}
      </div>

      {/* Active Tutorial Hero Container */}
      <div className="bg-[#1A221E] border border-[#2C3631] rounded-3xl overflow-hidden shadow-2xl">
        {/* Banner with Thumbnail */}
        <div className="relative h-60 sm:h-80 w-full overflow-hidden bg-[#0F1411]">
          <img
            src={activeTutorial.bannerImage}
            alt={activeTutorial.cropName}
            className="w-full h-full object-cover brightness-75"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1A221E] via-[#1A221E]/60 to-transparent"></div>

          {/* Top Badges */}
          <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
            <span className="bg-[#0F1411]/90 backdrop-blur-md text-[#C2D66E] text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border border-[#2C3631] shadow-md">
              {activeTutorial.badge}
            </span>

            <span className="bg-[#242C28]/95 backdrop-blur-md text-[#D4E4BC] text-xs font-medium px-3 py-1 rounded-full border border-[#2C3631] shadow-md">
              Gestation: {activeTutorial.gestationMonths} Months
            </span>
          </div>

          {/* Bottom Title & Financials */}
          <div className="absolute bottom-4 left-4 right-4 space-y-1.5">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif italic font-bold text-white drop-shadow-md">
              {getCropTitleInLang(activeTutorial)}
            </h2>
            <p className="text-xs sm:text-sm text-[#E5E9E7] line-clamp-2">
              {activeTutorial.tagline}
            </p>
          </div>
        </div>

        {/* Tab Navigation for active tutorial */}
        <div className="flex items-center gap-2 border-b border-[#2C3631] px-4 sm:px-6 pt-2 overflow-x-auto no-scrollbar bg-[#151C18]">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-3 px-3 text-xs sm:text-sm font-semibold uppercase tracking-wider border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'overview'
                ? 'border-[#C2D66E] text-[#C2D66E]'
                : 'border-transparent text-[#8E9B94] hover:text-white'
            }`}
          >
            Overview & Advantages
          </button>

          <button
            onClick={() => setActiveTab('stages')}
            className={`py-3 px-3 text-xs sm:text-sm font-semibold uppercase tracking-wider border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'stages'
                ? 'border-[#C2D66E] text-[#C2D66E]'
                : 'border-transparent text-[#8E9B94] hover:text-white'
            }`}
          >
            Farming Stages ({activeTutorial.stages.length})
          </button>

          <button
            onClick={() => setActiveTab('economics')}
            className={`py-3 px-3 text-xs sm:text-sm font-semibold uppercase tracking-wider border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'economics'
                ? 'border-[#C2D66E] text-[#C2D66E]'
                : 'border-transparent text-[#8E9B94] hover:text-white'
            }`}
          >
            5-Year Financial Roadmap
          </button>

          <button
            onClick={() => setActiveTab('subsidy')}
            className={`py-3 px-3 text-xs sm:text-sm font-semibold uppercase tracking-wider border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'subsidy'
                ? 'border-[#C2D66E] text-[#C2D66E]'
                : 'border-transparent text-[#8E9B94] hover:text-white'
            }`}
          >
            Subsidies & Schemes
          </button>

          <button
            onClick={() => setActiveTab('ai_advisor')}
            className={`py-3 px-3 text-xs sm:text-sm font-semibold uppercase tracking-wider border-b-2 transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'ai_advisor'
                ? 'border-[#C2D66E] text-[#C2D66E]'
                : 'border-transparent text-[#8E9B94] hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-[#C2D66E]" />
            <span>Ask Crop Doctor AI</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="p-4 sm:p-6 space-y-6">
          {/* 1. OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Financial Returns 3-Box Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-5 rounded-3xl bg-[#242C28] border border-[#2C3631]">
                  <span className="text-[10px] uppercase tracking-widest font-semibold text-[#8E9B94] block">
                    Initial Investment:
                  </span>
                  <span className="text-2xl sm:text-3xl font-serif font-bold text-[#E5E9E7] mt-1 block">
                    {activeTutorial.investmentPerAcre}
                  </span>
                  <span className="text-[11px] text-[#8E9B94] block mt-1">
                    Includes poles, grafting, drip
                  </span>
                </div>

                <div className="p-5 rounded-3xl bg-[#242C28] border border-[#C2D66E]/50">
                  <span className="text-[10px] uppercase tracking-widest font-bold text-[#C2D66E] block">
                    Annual Income Potential:
                  </span>
                  <span className="text-2xl sm:text-3xl font-serif font-bold text-[#C2D66E] mt-1 block">
                    {activeTutorial.annualIncomePotential}
                  </span>
                  <span className="text-[11px] text-[#D4E4BC] block mt-1 font-medium">
                    {activeTutorial.roiDurationYears}
                  </span>
                </div>

                <div className="p-5 rounded-3xl bg-[#242C28] border border-[#2C3631]">
                  <span className="text-[10px] uppercase tracking-widest font-semibold text-[#8E9B94] block">
                    Gestation Timeline:
                  </span>
                  <span className="text-2xl sm:text-3xl font-serif font-bold text-white mt-1 block">
                    {activeTutorial.gestationMonths} Months
                  </span>
                  <span className="text-[11px] text-[#8E9B94] block mt-1">
                    First commercial crop
                  </span>
                </div>
              </div>

              {/* Detailed Overview Text */}
              <div className="space-y-3">
                <h3 className="font-serif italic font-bold text-lg text-white">Commercial Cultivation Overview</h3>
                <p className="text-xs sm:text-sm text-[#8E9B94] leading-relaxed">
                  {activeTutorial.overview}
                </p>
              </div>

              {/* Why switch to this crop bullet points */}
              <div className="p-5 bg-[#242C28] border border-[#2C3631] rounded-3xl space-y-3">
                <h4 className="font-serif italic font-bold text-sm sm:text-base text-[#D4E4BC] flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-[#C2D66E]" />
                  Key Reasons Progressive Farmers Are Switching to this Crop:
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-[#E5E9E7]">
                  {activeTutorial.whySwitchToThisCrop.map((reason, idx) => (
                    <div key={idx} className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-[#C2D66E] shrink-0 mt-0.5" />
                      <span>{reason}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Soil & Water Specs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-4 bg-[#242C28] rounded-2xl border border-[#2C3631]">
                  <span className="font-bold text-[#8E9B94] block">Soil Compatibility:</span>
                  <span className="text-[#E5E9E7] mt-1 block">{activeTutorial.soilType}</span>
                </div>
                <div className="p-4 bg-[#242C28] rounded-2xl border border-[#2C3631]">
                  <span className="font-bold text-[#8E9B94] block">Water Requirement:</span>
                  <span className="text-[#E5E9E7] mt-1 block">{activeTutorial.waterRequirement}</span>
                </div>
              </div>

              {/* Linkage Callout */}
              <div className="p-5 bg-[#242C28] border border-[#2C3631] rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h4 className="font-serif italic font-bold text-base text-white">
                    Ready to list your upcoming harvest on KisanMitra?
                  </h4>
                  <p className="text-xs text-[#8E9B94] mt-0.5">
                    Connect directly with supermarket chains and exporters before harvesting
                  </p>
                </div>
                <button
                  onClick={() => onNavigateTab('marketplace')}
                  className="px-5 py-2.5 rounded-full bg-[#C2D66E] text-[#0F1411] font-bold text-xs uppercase tracking-wider shrink-0 flex items-center gap-1.5 shadow-sm hover:bg-[#D4E4BC] transition-all"
                >
                  <span>Pre-List Harvest</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* 2. STAGES */}
          {activeTab === 'stages' && (
            <div className="space-y-4">
              <h3 className="font-serif italic font-bold text-lg text-white">
                Step-by-Step Implementation Protocol
              </h3>

              <div className="space-y-3.5">
                {activeTutorial.stages.map((stg) => (
                  <div
                    key={stg.stageNumber}
                    className="p-5 bg-[#242C28] border border-[#2C3631] rounded-3xl space-y-3 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="w-7 h-7 rounded-full bg-[#C2D66E] text-[#0F1411] font-bold flex items-center justify-center text-xs">
                          {stg.stageNumber}
                        </span>
                        <h4 className="font-serif font-bold text-base text-white">
                          {stg.title}
                        </h4>
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#C2D66E] bg-[#0F1411] px-3 py-1 rounded-full border border-[#2C3631]">
                        {stg.duration}
                      </span>
                    </div>

                    <ul className="space-y-1.5 pl-10 text-[#8E9B94]">
                      {stg.instructions.map((inst, idx) => (
                        <li key={idx} className="list-disc leading-relaxed">
                          {inst}
                        </li>
                      ))}
                    </ul>

                    <div className="pl-10 pt-2 border-t border-[#2C3631] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px]">
                      <span className="text-[#D4E4BC] font-medium flex items-center gap-1.5">
                        <Lightbulb className="w-3.5 h-3.5 text-[#C2D66E]" />
                        <strong>Pro Tip:</strong> {stg.proTip}
                      </span>
                      {stg.equipmentNeeded && (
                        <span className="text-[#8E9B94]">
                          Equipment: <strong className="text-white">{stg.equipmentNeeded}</strong>
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 3. FINANCIAL ROADMAP / ECONOMICS */}
          {activeTab === 'economics' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-serif italic font-bold text-lg text-white flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-[#C2D66E]" />
                    5-Year Cashflow & Profit Projections (Per 1 Acre)
                  </h3>
                  <p className="text-xs text-[#8E9B94]">
                    Calculated based on average farm-gate direct pricing on KisanMitra
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border border-[#2C3631] rounded-2xl overflow-hidden">
                  <thead className="bg-[#151C18] text-[#8E9B94] font-semibold uppercase tracking-wider">
                    <tr>
                      <th className="p-3.5">Year</th>
                      <th className="p-3.5">Operating Expense</th>
                      <th className="p-3.5">Yield (Tons)</th>
                      <th className="p-3.5">Gross Income</th>
                      <th className="p-3.5 text-[#C2D66E] font-bold">Net Profit</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#2C3631] bg-[#1A221E]">
                    {activeTutorial.economics.map((ec) => (
                      <tr key={ec.year} className="hover:bg-[#242C28]">
                        <td className="p-3.5 font-bold text-white font-serif">Year {ec.year}</td>
                        <td className="p-3.5 text-[#8E9B94]">₹{ec.expensesINR.toLocaleString('en-IN')}</td>
                        <td className="p-3.5 text-[#E5E9E7]">{ec.yieldTons} MT</td>
                        <td className="p-3.5 text-[#D4E4BC] font-serif">₹{ec.grossIncomeINR.toLocaleString('en-IN')}</td>
                        <td className="p-3.5 font-serif font-bold text-[#C2D66E]">
                          {ec.netProfitINR >= 0 ? `₹${ec.netProfitINR.toLocaleString('en-IN')}` : `-₹${Math.abs(ec.netProfitINR).toLocaleString('en-IN')}`}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 4. SUBSIDY */}
          {activeTab === 'subsidy' && (
            <div className="space-y-4">
              <div className="p-5 sm:p-6 bg-[#242C28] border border-[#2C3631] rounded-3xl space-y-4">
                <div className="flex items-center justify-between">
                  <span className="bg-[#C2D66E] text-[#0F1411] font-bold text-[10px] uppercase tracking-widest px-3 py-1 rounded-full">
                    Central & State Horticulture Scheme
                  </span>
                  <span className="text-[#D4E4BC] font-serif font-bold text-xs">
                    {activeTutorial.subsidyInfo.percent}
                  </span>
                </div>

                <h3 className="text-lg sm:text-xl font-serif italic font-bold text-white">
                  {activeTutorial.subsidyInfo.schemeName}
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs pt-1">
                  <div className="p-4 bg-[#1A221E] rounded-2xl border border-[#2C3631]">
                    <span className="text-[#8E9B94] block text-[10px] uppercase tracking-wider font-semibold">Max Subsidy Amount:</span>
                    <span className="text-xl font-serif font-bold text-[#C2D66E] mt-1 block">
                      {activeTutorial.subsidyInfo.maxAmount}
                    </span>
                  </div>

                  <div className="p-4 bg-[#1A221E] rounded-2xl border border-[#2C3631]">
                    <span className="text-[#8E9B94] block text-[10px] uppercase tracking-wider font-semibold">Online Application Portal:</span>
                    <span className="text-[#D4E4BC] mt-1 block font-mono">
                      {activeTutorial.subsidyInfo.govtPortal}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 5. AI CROP DOCTOR */}
          {activeTab === 'ai_advisor' && (
            <div className="space-y-4">
              <div className="p-5 bg-[#242C28] border border-[#2C3631] rounded-3xl space-y-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-[#C2D66E]" />
                  <h3 className="font-serif italic font-bold text-base text-white">
                    Ask Gemini Crop Doctor about {activeTutorial.cropName}
                  </h3>
                </div>

                <form onSubmit={handleAskAIAdvisor} className="flex gap-2">
                  <input
                    type="text"
                    value={advisoryQuestion}
                    onChange={(e) => setAdvisoryQuestion(e.target.value)}
                    placeholder={`Ask anything: e.g. fertilizer dose, disease cure, irrigation intervals for ${activeTutorial.cropName}`}
                    className="flex-1 bg-[#1A221E] border border-[#2C3631] focus:border-[#C2D66E] rounded-2xl px-4 py-2.5 text-xs sm:text-sm text-white outline-none"
                  />
                  <button
                    type="submit"
                    disabled={isAdvisoryLoading || !advisoryQuestion.trim()}
                    className="px-5 py-2.5 rounded-full bg-[#C2D66E] hover:bg-[#D4E4BC] text-[#0F1411] font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 shrink-0 disabled:opacity-50 transition-all shadow-sm"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Ask AI</span>
                  </button>
                </form>
              </div>

              {isAdvisoryLoading && (
                <div className="p-8 text-center bg-[#242C28] rounded-3xl border border-[#2C3631]">
                  <Sparkles className="w-6 h-6 text-[#C2D66E] animate-spin mx-auto mb-2" />
                  <p className="text-xs text-[#8E9B94]">
                    Analyzing agronomy parameters and disease shield protocols...
                  </p>
                </div>
              )}

              {advisoryAnswer && !isAdvisoryLoading && (
                <div className="p-5 bg-[#242C28] border border-[#2C3631] rounded-3xl space-y-3 text-xs text-[#E5E9E7]">
                  <div className="flex items-center justify-between">
                    <span className="font-serif font-bold text-[#C2D66E] text-sm">
                      Kisan AI Agronomy Advisory
                    </span>
                    <button
                      onClick={() => {
                        audioSpeech.speak(
                          advisoryAnswer.voiceOverviewScript || advisoryAnswer.botanicalInfo,
                          currentLanguage
                        );
                      }}
                      className="text-[#C2D66E] flex items-center gap-1 font-semibold hover:underline"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>Listen</span>
                    </button>
                  </div>

                  <p className="leading-relaxed text-[#8E9B94]">
                    {advisoryAnswer.botanicalInfo}
                  </p>

                  {advisoryAnswer.expertTips && advisoryAnswer.expertTips.length > 0 && (
                    <div className="space-y-1.5 pt-2 border-t border-[#2C3631]">
                      <span className="font-bold text-white block">Key Expert Tips:</span>
                      <ul className="list-disc pl-4 space-y-1 text-[#8E9B94]">
                        {advisoryAnswer.expertTips.map((tip: string, idx: number) => (
                          <li key={idx}>{tip}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
