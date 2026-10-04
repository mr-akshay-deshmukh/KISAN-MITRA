import React, { useState } from 'react';
import {
  Truck,
  MapPin,
  Navigation,
  Sparkles,
  ShieldCheck,
  Thermometer,
  Clock,
  Phone,
  RefreshCw,
  CheckCircle2,
  ChevronRight,
  Share2,
  Layers,
  DollarSign,
  ArrowRight,
  CloudLightning,
  Volume2,
  VolumeX,
  Droplets,
  CloudRain,
  AlertTriangle,
  RotateCw,
  Compass,
  Map,
} from 'lucide-react';
import { FreightShipment, LanguageCode, RouteOptimizationResult, WeatherAlert } from '../types';
import { translations } from '../utils/translations';
import { fetchRouteOptimization } from '../services/geminiService';
import { WeatherAlertBanner } from './WeatherAlertBanner';
import { InteractiveRouteVisualizer } from './InteractiveRouteVisualizer';
import { audioSpeech } from '../utils/audioSpeech';
import confetti from 'canvas-confetti';

interface LogisticsSupportViewProps {
  shipments: FreightShipment[];
  currentLanguage: LanguageCode;
  onNavigateTab: (tab: string) => void;
  weatherAlerts?: WeatherAlert[];
  onOpenWeatherRadar?: () => void;
  onRefreshWeatherAlerts?: () => Promise<void>;
  isRefreshingWeatherAlerts?: boolean;
}

export const LogisticsSupportView: React.FC<LogisticsSupportViewProps> = ({
  shipments,
  currentLanguage,
  onNavigateTab,
  weatherAlerts = [],
  onOpenWeatherRadar,
  onRefreshWeatherAlerts,
  isRefreshingWeatherAlerts = false,
}) => {
  const t = translations[currentLanguage];

  const [activeSubTab, setActiveSubTab] = useState<'route_visualizer' | 'pooling' | 'route_optimizer' | 'live_tracking'>('route_visualizer');
  const [selectedTruckType, setSelectedTruckType] = useState('10-Ton Reefer Cold Chain (+4°C to +8°C)');
  const [destinationHub, setDestinationHub] = useState('Vashi APMC Navi Mumbai / Cold Logistics Hub');
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizationResult, setOptimizationResult] = useState<RouteOptimizationResult | null>(null);
  const [activeTrackingShipment, setActiveTrackingShipment] = useState<FreightShipment>(shipments[0]);
  const [bookingSuccessMsg, setBookingSuccessMsg] = useState<string | null>(null);
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);

  // Sample farm cluster for pooling
  const [clusterFarms, setClusterFarms] = useState([
    { id: 1, name: 'Suresh Patil Farm (Baramati)', crop: 'Dragon Fruit', qtyTons: 2.5, isJoined: true },
    { id: 2, name: 'Ganesh FPO Packhouse (Indapur)', crop: 'Pomegranates', qtyTons: 3.2, isJoined: true },
    { id: 3, name: 'Anand Agro Orchards (Daund)', crop: 'Walnuts & Greens', qtyTons: 2.8, isJoined: true },
    { id: 4, name: 'Khandke Organic Greens (Saswad)', crop: 'Hydroponics', qtyTons: 1.5, isJoined: false },
  ]);

  const toggleJoinPool = (id: number) => {
    setClusterFarms((prev) =>
      prev.map((f) => (f.id === id ? { ...f, isJoined: !f.isJoined } : f))
    );
  };

  const handleRunRouteOptimization = async () => {
    setIsOptimizing(true);
    try {
      const activeFarms = clusterFarms.filter((f) => f.isJoined);
      const result = await fetchRouteOptimization(
        activeFarms,
        destinationHub,
        selectedTruckType,
        currentLanguage
      );
      setOptimizationResult(result);
    } catch (e) {
      console.error(e);
    } finally {
      setIsOptimizing(false);
    }
  };

  const handleBookPooledTruck = () => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch (e) {}

    setBookingSuccessMsg(
      currentLanguage === 'mr'
        ? '✅ १०-टन शेअर्ड कोल्ड-चेन ट्रक यशस्वीरित्या आरक्षित झाला! ड्रायव्हर योगिराज ससाणे (MH-12-Q-8890) उद्या सकाळी ०६:०० वाजता पहिल्या शेतावर पोहोचतील.'
        : currentLanguage === 'hi'
        ? '✅ 10-टन साझा कोल्ड-चेन ट्रक सफलतापूर्वक बुक हो गया! ड्राइवर योगिराज ससाणे (MH-12-Q-8890) कल सुबह 06:00 बजे पहले खेत पर पहुंचेंगे।'
        : '✅ 10-Ton Shared Reefer Truck booked successfully! Driver Yogiraj Sasane (MH-12-Q-8890) will arrive at Stop 1 at 06:00 AM.'
    );
  };

  const handleSpeakWeather = (alert: WeatherAlert) => {
    if (playingAudioId === alert.id) {
      audioSpeech.stop();
      setPlayingAudioId(null);
      return;
    }

    const title =
      alert.forecastTitleLocalized?.[currentLanguage] ||
      alert.forecastTitle;
    const advisory =
      alert.detailedAdvisoryLocalized?.[currentLanguage] ||
      alert.detailedAdvisory;
    const driverInstruction =
      alert.logisticsImpact.driverActionLocalized?.[currentLanguage] ||
      alert.logisticsImpact.driverActionInstruction;

    const speechText = `${title}. ${advisory}. ${driverInstruction}`;

    audioSpeech.speak(
      speechText,
      currentLanguage,
      () => setPlayingAudioId(alert.id),
      () => setPlayingAudioId(null),
      () => setPlayingAudioId(null)
    );
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
                <Truck className="w-3.5 h-3.5" />
                Agri-Logistics & Cold-Chain
              </span>
              <span className="bg-[#242C28] text-[#D4E4BC] text-[11px] font-medium px-3 py-1 rounded-full border border-[#2C3631]">
                40-45% Freight Savings
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl md:text-4xl font-serif italic font-bold text-white tracking-tight">
              {t.logistics}
            </h1>

            <p className="text-xs sm:text-sm text-[#8E9B94]">
              {t.saveCostFreight}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setActiveSubTab('route_optimizer')}
              className="px-5 py-3 rounded-full bg-[#C2D66E] text-[#0F1411] font-bold text-xs uppercase tracking-widest hover:bg-[#D4E4BC] active:scale-95 transition-all shadow-sm flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>{t.routeOptimizer}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Sub Tab Switcher */}
      <div className="flex items-center gap-2 border-b border-[#2C3631] pb-3 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveSubTab('route_visualizer')}
          className={`px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wider whitespace-nowrap transition-all flex items-center gap-2 ${
            activeSubTab === 'route_visualizer'
              ? 'bg-[#C2D66E] text-[#0F1411] font-bold shadow-sm'
              : 'bg-[#1A221E] border border-[#2C3631] text-[#8E9B94] hover:text-[#E5E9E7]'
          }`}
        >
          <Compass className="w-4 h-4" />
          <span>{currentLanguage === 'mr' ? 'मार्ग नकाशा दर्शक' : currentLanguage === 'hi' ? 'रूट विज़ुअलाइज़र' : 'Route Visualizer'}</span>
        </button>

        <button
          onClick={() => setActiveSubTab('pooling')}
          className={`px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wider whitespace-nowrap transition-all flex items-center gap-2 ${
            activeSubTab === 'pooling'
              ? 'bg-[#C2D66E] text-[#0F1411] font-bold shadow-sm'
              : 'bg-[#1A221E] border border-[#2C3631] text-[#8E9B94] hover:text-[#E5E9E7]'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>{t.sharedPooling}</span>
        </button>

        <button
          onClick={() => {
            setActiveSubTab('route_optimizer');
            if (!optimizationResult) {
              handleRunRouteOptimization();
            }
          }}
          className={`px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wider whitespace-nowrap transition-all flex items-center gap-2 ${
            activeSubTab === 'route_optimizer'
              ? 'bg-[#C2D66E] text-[#0F1411] font-bold shadow-sm'
              : 'bg-[#1A221E] border border-[#2C3631] text-[#8E9B94] hover:text-[#E5E9E7]'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>{t.routeOptimizer}</span>
        </button>

        <button
          onClick={() => setActiveSubTab('live_tracking')}
          className={`px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wider whitespace-nowrap transition-all flex items-center gap-2 ${
            activeSubTab === 'live_tracking'
              ? 'bg-[#C2D66E] text-[#0F1411] font-bold shadow-sm'
              : 'bg-[#1A221E] border border-[#2C3631] text-[#8E9B94] hover:text-[#E5E9E7]'
          }`}
        >
          <Navigation className="w-4 h-4" />
          <span>{t.liveTruckTracking}</span>
        </button>
      </div>

      {bookingSuccessMsg && (
        <div className="p-4 bg-[#1A221E] border-l-4 border-[#C2D66E] border-y border-r border-[#2C3631] rounded-2xl text-xs sm:text-sm text-[#D4E4BC] font-medium flex items-center justify-between shadow-lg">
          <span>{bookingSuccessMsg}</span>
          <button onClick={() => setBookingSuccessMsg(null)} className="underline font-bold text-[#C2D66E] ml-2">
            Dismiss
          </button>
        </div>
      )}

      {/* 0. INTERACTIVE ROUTE VISUALIZATION TOOL */}
      {activeSubTab === 'route_visualizer' && (
        <div className="space-y-6">
          <InteractiveRouteVisualizer
            currentLanguage={currentLanguage}
            onBookPooledTruck={() => {
              handleBookPooledTruck();
              setActiveSubTab('pooling');
            }}
          />
        </div>
      )}

      {/* 1. SHARED FREIGHT SOFTWARE TAB */}
      {activeSubTab === 'pooling' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Active Cluster Logistics Software */}
            <div className="lg:col-span-7 bg-[#1A221E] border border-[#2C3631] rounded-3xl p-5 sm:p-6 space-y-4 shadow-xl">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-serif italic font-bold text-lg text-white">
                    Baramati-Indapur-Daund Logistics Management Software
                  </h3>
                  <p className="text-xs text-[#8E9B94]">
                    Automated shipment consolidation software connecting nearby small farmer harvest lots into one 10-Ton Reefer
                  </p>
                </div>
                <span className="bg-[#C2D66E]/20 text-[#C2D66E] text-[10px] font-bold px-3 py-1 rounded-full">
                  Save 43% Freight
                </span>
              </div>

              {/* Farms in cluster */}
              <div className="space-y-2.5 pt-2">
                {clusterFarms.map((farm) => (
                  <div
                    key={farm.id}
                    className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                      farm.isJoined
                        ? 'bg-[#242C28] border-[#C2D66E]/50 text-white'
                        : 'bg-[#1A221E] border-[#2C3631] text-[#8E9B94] opacity-75'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={farm.isJoined}
                        onChange={() => toggleJoinPool(farm.id)}
                        className="w-4 h-4 rounded text-[#C2D66E] bg-[#0F1411] border-[#2C3631] accent-[#C2D66E]"
                      />
                      <div>
                        <h4 className="font-medium text-xs sm:text-sm text-white">
                          {farm.name}
                        </h4>
                        <span className="text-[11px] text-[#8E9B94]">
                          {farm.crop} • {farm.qtyTons} Tons
                        </span>
                      </div>
                    </div>

                    <span className="text-xs font-serif font-bold text-[#C2D66E] bg-[#0F1411] px-3 py-1 rounded-full border border-[#2C3631]">
                      {farm.qtyTons} MT
                    </span>
                  </div>
                ))}
              </div>

              {/* Total Capacity Meter */}
              {(() => {
                const totalJoinedTons = clusterFarms
                  .filter((f) => f.isJoined)
                  .reduce((acc, curr) => acc + curr.qtyTons, 0);
                const truckCapacityTons = 10.0;
                const fillPercent = Math.min(100, Math.round((totalJoinedTons / truckCapacityTons) * 100));

                return (
                  <div className="p-4 bg-[#242C28] rounded-2xl border border-[#2C3631] space-y-2.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-[#8E9B94]">
                        10-Ton Reefer Truck Capacity:
                      </span>
                      <span className="font-serif font-bold text-[#C2D66E]">
                        {totalJoinedTons.toFixed(1)} / {truckCapacityTons} Tons ({fillPercent}% Full)
                      </span>
                    </div>

                    <div className="w-full bg-[#0F1411] h-2 rounded-full overflow-hidden border border-[#2C3631]">
                      <div
                        className="bg-[#C2D66E] h-full rounded-full transition-all duration-300"
                        style={{ width: `${fillPercent}%` }}
                      ></div>
                    </div>

                    <p className="text-[11px] text-[#8E9B94]">
                      When shipment consolidation reaches 80%+ capacity, software reduces per-kg freight from ₹3.50/kg to ₹1.85/kg.
                    </p>
                  </div>
                );
              })()}

              <button
                onClick={handleBookPooledTruck}
                className="w-full py-3.5 rounded-2xl bg-[#C2D66E] hover:bg-[#D4E4BC] text-[#0F1411] font-bold text-xs uppercase tracking-widest active:scale-95 transition-all flex items-center justify-center gap-2 shadow-sm"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirm & Lock Freight Software Booking</span>
              </button>
            </div>

            {/* Right: Freight Comparison Card */}
            <div className="lg:col-span-5 space-y-4">
              <div className="bg-[#1A221E] border border-[#2C3631] rounded-3xl p-5 sm:p-6 space-y-4 shadow-xl">
                <h3 className="font-serif italic font-bold text-lg text-white flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-[#C2D66E]" />
                  Cost Comparison (Separate vs Logistics Software)
                </h3>

                <div className="space-y-3">
                  <div className="p-4 bg-[#242C28] border border-[#2C3631] rounded-2xl">
                    <span className="text-xs text-[#8E9B94] block font-semibold">
                      Traditional Separate Trucks (4 Small Tempos):
                    </span>
                    <span className="text-xl font-serif font-bold text-[#8E9B94]">
                      ₹24,500 <span className="text-xs font-normal font-sans">(~₹3.60 / kg)</span>
                    </span>
                    <p className="text-[10px] text-[#8E9B94] mt-1">
                      High individual diesel cost, no temperature control, 8-12% crop weight loss in transit.
                    </p>
                  </div>

                  <div className="p-4 bg-[#242C28] border border-[#C2D66E]/50 rounded-2xl">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-[#D4E4BC] font-semibold">
                        KisanMitra Logistics Software (+5°C Cold Chain):
                      </span>
                      <span className="bg-[#C2D66E] text-[#0F1411] text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
                        SAVE 43.5%
                      </span>
                    </div>
                    <span className="text-2xl font-serif font-bold text-[#C2D66E] block mt-1">
                      ₹13,800 <span className="text-xs font-normal font-sans text-[#8E9B94]">(~₹1.85 / kg)</span>
                    </span>
                    <p className="text-[10px] text-[#D4E4BC] mt-1">
                      Pre-cooled sealed container, 0% spoilage, automated digital weighment at buyer destination.
                    </p>
                  </div>
                </div>

                <div className="p-3.5 bg-[#242C28] rounded-2xl border border-[#2C3631] space-y-2 text-xs text-[#8E9B94]">
                  <div className="flex items-center justify-between">
                    <span>CO2 Emissions Saved:</span>
                    <span className="font-bold text-[#C2D66E]">86 kg CO2</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Cold Chain Guarantee:</span>
                    <span className="font-bold text-white">+4°C to +7°C</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Escrow Release Trigger:</span>
                    <span className="font-bold text-white">Digital QR at Gate</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. AI ROUTE OPTIMIZER TAB */}
      {activeSubTab === 'route_optimizer' && (
        <div className="space-y-6">
          <div className="bg-[#1A221E] border border-[#2C3631] rounded-3xl p-5 sm:p-6 space-y-4 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-serif italic font-bold text-lg text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-[#C2D66E]" />
                  AI Multi-Farm Pickup & Drop Route Optimizer
                </h3>
                <p className="text-xs text-[#8E9B94]">
                  Calculates optimal sequence of farm pickups to minimize total kilometers and highway transit time
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => setActiveSubTab('route_visualizer')}
                  className="px-4 py-2 rounded-full bg-[#242C28] hover:bg-[#2C3631] text-[#C2D66E] border border-[#C2D66E]/40 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors"
                >
                  <Compass className="w-3.5 h-3.5" />
                  <span>Open GIS Map</span>
                </button>

                <button
                  onClick={handleRunRouteOptimization}
                  disabled={isOptimizing}
                  className="px-4 py-2 rounded-full border border-[#C2D66E] text-[#C2D66E] hover:bg-[#C2D66E] hover:text-[#0F1411] text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shrink-0 transition-colors"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isOptimizing ? 'animate-spin' : ''}`} />
                  <span>Re-Optimize</span>
                </button>
              </div>
            </div>

            {isOptimizing && (
              <div className="p-8 text-center bg-[#242C28] rounded-2xl border border-[#2C3631]">
                <RefreshCw className="w-7 h-7 text-[#C2D66E] animate-spin mx-auto mb-2" />
                <p className="text-xs text-[#8E9B94]">
                  AI is evaluating road conditions, cluster coordinates, and traffic patterns...
                </p>
              </div>
            )}

            {optimizationResult && !isOptimizing && (
              <div className="space-y-5">
                {/* Result KPI Bar */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-4 bg-[#242C28] rounded-2xl border border-[#2C3631]">
                    <span className="text-[10px] uppercase tracking-wider text-[#8E9B94] block">Total Distance:</span>
                    <span className="text-xl font-serif font-bold text-white">{optimizationResult.totalDistanceKm} km</span>
                  </div>
                  <div className="p-4 bg-[#242C28] rounded-2xl border border-[#2C3631]">
                    <span className="text-[10px] uppercase tracking-wider text-[#8E9B94] block">Transit Time:</span>
                    <span className="text-xl font-serif font-bold text-[#D4E4BC]">{optimizationResult.estimatedTransitTimeHours} Hours</span>
                  </div>
                  <div className="p-4 bg-[#242C28] rounded-2xl border border-[#2C3631]">
                    <span className="text-[10px] uppercase tracking-wider text-[#8E9B94] block">Software Cost:</span>
                    <span className="text-xl font-serif font-bold text-[#C2D66E]">₹{optimizationResult.optimizedPooledCostINR.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="p-4 bg-[#242C28] rounded-2xl border border-[#2C3631]">
                    <span className="text-[10px] uppercase tracking-wider text-[#8E9B94] block">Cost Savings:</span>
                    <span className="text-xl font-serif font-bold text-[#C2D66E]">+{optimizationResult.farmerCostSavingsPercent}%</span>
                  </div>
                </div>

                {/* Traffic Intelligence & Delivery Window Compliance Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Traffic & Toll Corridor Optimization */}
                  <div className="p-4 bg-[#242C28] border border-[#2C3631] rounded-2xl space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase tracking-wider font-bold text-[#C2D66E]">
                        Traffic & Corridor Intelligence
                      </span>
                      <span className="text-[10px] bg-[#C2D66E]/10 text-[#C2D66E] px-2 py-0.5 rounded-full font-bold">
                        {optimizationResult.trafficDetails?.congestionRiskLevel || 'Low Congestion'}
                      </span>
                    </div>

                    <div className="space-y-1.5 text-xs">
                      <div className="flex justify-between text-[#8E9B94]">
                        <span>Peak Congestion Avoided:</span>
                        <span className="font-bold text-white">~{optimizationResult.trafficDetails?.peakCongestionAvoidedHours || 1.8} hrs</span>
                      </div>
                      <div className="flex justify-between text-[#8E9B94]">
                        <span>Diesel Fuel Saved:</span>
                        <span className="font-bold text-[#C2D66E]">~{optimizationResult.trafficDetails?.estimatedFuelSavedLiters || 34} Liters</span>
                      </div>
                      <p className="text-[11px] text-[#D4E4BC] pt-1 border-t border-[#2C3631]/60">
                        {optimizationResult.trafficDetails?.expresswayCorridorRecommendation || 'Pune-Mumbai Expressway green corridor route with FASTag automatic tolling.'}
                      </p>
                    </div>
                  </div>

                  {/* Delivery Window & Freshness Compliance */}
                  <div className="p-4 bg-[#242C28] border border-[#2C3631] rounded-2xl space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase tracking-wider font-bold text-[#C2D66E]">
                        Buyer Delivery Window Compliance
                      </span>
                      <span className="text-[10px] bg-[#C2D66E] text-[#0F1411] px-2 py-0.5 rounded-full font-bold">
                        {optimizationResult.deliveryWindowDetails?.onTimeProbability || '99.2%'} On-Time
                      </span>
                    </div>

                    <div className="space-y-1.5 text-xs">
                      <div className="flex justify-between text-[#8E9B94]">
                        <span>Target Buyer Window:</span>
                        <span className="font-bold text-white">{optimizationResult.deliveryWindowDetails?.deliveryWindowStart || '01:00 PM'} - {optimizationResult.deliveryWindowDetails?.deliveryWindowEnd || '03:00 PM'}</span>
                      </div>
                      <div className="flex justify-between text-[#8E9B94]">
                        <span>Projected Arrival:</span>
                        <span className="font-bold text-[#C2D66E]">{optimizationResult.deliveryWindowDetails?.projectedHubArrival || '01:45 PM'}</span>
                      </div>
                      <div className="flex justify-between text-[#8E9B94]">
                        <span>Freshness Preserved:</span>
                        <span className="font-bold text-[#D4E4BC]">+{optimizationResult.deliveryWindowDetails?.shelfLifePreservedDays || 6} Days</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Pickup Waypoint Sequence */}
                <div className="space-y-3">
                  <h4 className="text-xs font-semibold text-[#8E9B94] uppercase tracking-wider">
                    AI Suggested Waypoint & Milk-Run Schedule:
                  </h4>

                  <div className="space-y-2.5">
                    {optimizationResult.pickupSequence.map((step) => (
                      <div
                        key={step.step}
                        className="p-4 bg-[#242C28] border border-[#2C3631] rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                      >
                        <div className="flex items-start sm:items-center gap-3">
                          <span className="w-6 h-6 rounded-full bg-[#C2D66E] text-[#0F1411] font-bold flex items-center justify-center shrink-0 text-xs">
                            {step.step}
                          </span>
                          <div>
                            <span className="font-serif font-bold text-white text-sm block">
                              {step.location}
                            </span>
                            <span className="text-[#8E9B94] text-xs">
                              {step.action}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 text-right">
                          <div>
                            <span className="text-[10px] text-[#8E9B94] block">Schedule ETA:</span>
                            <span className="font-bold text-[#D4E4BC]">{step.eta}</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-[#8E9B94] block">Temp Seal:</span>
                            <span className="font-bold text-[#C2D66E]">{step.tempRequirement}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* AI Optimization Notes */}
                <div className="p-4 bg-[#242C28] border border-[#2C3631] rounded-2xl space-y-2 text-xs">
                  <span className="font-bold text-[#C2D66E] block uppercase tracking-wider text-[10px]">
                    AI Route Efficiency Insights:
                  </span>
                  <ul className="space-y-1 text-[#E5E9E7]">
                    {optimizationResult.aiOptimizationNotes.map((note, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-[#C2D66E]">•</span>
                        <span>{note}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. LIVE TRUCK TRACKING TAB */}
      {activeSubTab === 'live_tracking' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Live Map / Telemetry Simulation */}
            <div className="lg:col-span-7 bg-[#1A221E] border border-[#2C3631] rounded-3xl p-5 sm:p-6 space-y-4 shadow-xl">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#C2D66E] animate-pulse"></span>
                    <span className="text-xs font-semibold text-[#C2D66E] uppercase tracking-wider">
                      Live Telemetry Active
                    </span>
                  </div>
                  <h3 className="font-serif italic font-bold text-lg text-white mt-0.5">
                    {activeTrackingShipment.truckId} • {activeTrackingShipment.truckType}
                  </h3>
                </div>

                <div className="flex items-center gap-1.5 bg-[#242C28] px-3 py-1.5 rounded-full border border-[#2C3631] text-xs">
                  <Thermometer className="w-4 h-4 text-[#C2D66E]" />
                  <span className="font-mono font-bold text-white">
                    {activeTrackingShipment.currentTempCelsius}°C
                  </span>
                </div>
              </div>

              {/* Simulated Map Visual Box */}
              <div className="h-64 rounded-2xl bg-[#0F1411] border border-[#2C3631] relative overflow-hidden flex flex-col justify-between p-4">
                <div className="absolute inset-0 bg-[radial-gradient(#2C3631_1px,transparent_1px)] [background-size:16px_16px] opacity-40"></div>

                {/* Top Overlay */}
                <div className="relative z-10 flex items-center justify-between text-xs">
                  <span className="bg-[#1A221E]/90 text-[#E5E9E7] px-3 py-1 rounded-full border border-[#2C3631]">
                    Route: Baramati ➔ Mumbai Expressway
                  </span>
                  <span className="bg-[#C2D66E] text-[#0F1411] font-bold px-2.5 py-0.5 rounded-full text-[10px] uppercase">
                    Speed: 64 km/h
                  </span>
                </div>

                {/* Animated Truck in center */}
                <div className="relative z-10 flex items-center justify-center my-auto">
                  <div className="p-4 rounded-3xl bg-[#1A221E] border-2 border-[#C2D66E] shadow-2xl flex items-center gap-3">
                    <Truck className="w-7 h-7 text-[#C2D66E] animate-pulse" />
                    <div>
                      <span className="text-[9px] text-[#8E9B94] block font-bold uppercase tracking-wider">Current Location</span>
                      <span className="font-serif font-bold text-white text-xs sm:text-sm">
                        {activeTrackingShipment.currentLocationName}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bottom Route Progress */}
                <div className="relative z-10 bg-[#1A221E]/90 backdrop-blur-md p-3 rounded-2xl border border-[#2C3631] flex items-center justify-between text-xs">
                  <span className="text-[#8E9B94] font-medium">ETA to Hub:</span>
                  <span className="font-bold text-[#C2D66E]">{activeTrackingShipment.eta}</span>
                </div>
              </div>

              {/* Driver Contact & Milestones */}
              <div className="p-4 bg-[#242C28] border border-[#2C3631] rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div>
                  <span className="text-[#8E9B94] block">Assigned Driver:</span>
                  <span className="font-bold text-white text-sm">{activeTrackingShipment.driverName}</span>
                  <span className="text-[#8E9B94] block text-[11px]">{activeTrackingShipment.driverPhone}</span>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={`tel:${activeTrackingShipment.driverPhone}`}
                    className="px-4 py-2 rounded-full bg-[#C2D66E] hover:bg-[#D4E4BC] text-[#0F1411] font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-sm"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Call Driver</span>
                  </a>
                </div>
              </div>

              {/* Highway Corridor Weather & Cold-Chain Radar for Driver Yogiraj */}
              {weatherAlerts.length > 0 && (
                <div className="p-4 bg-[#141F18] border border-[#2E4234] rounded-2xl space-y-3 shadow-inner">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CloudLightning className="w-4 h-4 text-[#C2D66E] animate-pulse" />
                      <span className="text-xs font-bold text-[#C2D66E] uppercase tracking-wider">
                        Transit Corridor Weather Alert
                      </span>
                    </div>
                    {onOpenWeatherRadar && (
                      <button
                        onClick={onOpenWeatherRadar}
                        className="text-[11px] font-bold text-[#C2D66E] hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <span>Full Radar</span>
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>

                  {weatherAlerts.slice(0, 1).map((alert) => (
                    <div key={alert.id} className="space-y-2 text-xs">
                      <div className="flex flex-wrap items-center justify-between gap-2 text-[11px]">
                        <span className="text-[#D4E4BC] font-semibold flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-[#C2D66E]" />
                          {alert.location} Corridor ({alert.logisticsImpact.corridorName})
                        </span>
                        <span className="bg-[#C2D66E]/15 text-[#C2D66E] px-2 py-0.5 rounded font-bold border border-[#C2D66E]/30">
                          Reefer Setpoint: +{alert.logisticsImpact.recommendedReeferTempCelsius}°C
                        </span>
                      </div>

                      <p className="text-[#A2B3A9] leading-relaxed">
                        {alert.detailedAdvisoryLocalized?.[currentLanguage] || alert.detailedAdvisory}
                      </p>

                      <div className="p-2.5 bg-[#1C2620] rounded-xl border border-[#2C3631] flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <Navigation className="w-3.5 h-3.5 text-[#C2D66E] shrink-0" />
                          <span className="text-[11px] text-[#D4E4BC]">
                            <strong className="text-white">Instruction for Driver Yogiraj:</strong>{' '}
                            {alert.logisticsImpact.driverActionLocalized?.[currentLanguage] ||
                              alert.logisticsImpact.driverActionInstruction}
                          </span>
                        </div>
                        <button
                          onClick={() => handleSpeakWeather(alert)}
                          className="shrink-0 p-1.5 rounded-lg bg-[#242E28] hover:bg-[#2F3C34] text-[#C2D66E] transition-colors"
                          title="Speak advisory"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right: Milestone Stops */}
            <div className="lg:col-span-5 bg-[#1A221E] border border-[#2C3631] rounded-3xl p-5 sm:p-6 space-y-4 shadow-xl">
              <h3 className="font-serif italic font-bold text-lg text-white flex items-center gap-2">
                <Clock className="w-5 h-5 text-[#C2D66E]" />
                Live Farm Pickup Milestones
              </h3>

              <div className="space-y-3">
                {activeTrackingShipment.routeStops.map((stop) => (
                  <div
                    key={stop.stopNumber}
                    className={`p-3.5 rounded-2xl border transition-all text-xs ${
                      stop.completed
                        ? 'bg-[#242C28] border-[#C2D66E]/40 text-[#E5E9E7]'
                        : 'bg-[#1A221E] border-[#2C3631] text-[#8E9B94]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-serif font-bold text-white flex items-center gap-2">
                        {stop.completed ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#C2D66E]" />
                        ) : (
                          <span className="w-3.5 h-3.5 rounded-full border border-[#2C3631]"></span>
                        )}
                        {stop.farmName}
                      </span>
                      <span className="text-[10px] font-semibold text-[#D4E4BC]">
                        {stop.scheduledTime}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#8E9B94] pl-5">
                      {stop.action} • {stop.location}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
