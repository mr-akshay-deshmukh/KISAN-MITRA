import React, { useState, useEffect, useRef } from 'react';
import {
  AudioWaveform,
  AudioLines,
  Volume2,
  VolumeX,
  X,
  Send,
  Sparkles,
  ArrowRight,
  Bot,
  User,
  Languages,
  Square,
  Mic,
  RotateCcw,
  BookOpen,
  HelpCircle,
  Play,
  Truck,
  Navigation,
  Thermometer,
  MapPin,
  Phone,
  CheckCircle2,
  Clock,
  ExternalLink,
  Snowflake,
  ShieldCheck,
  TrendingDown,
  Users,
  Compass,
  Lightbulb,
  ChevronDown,
  ChevronUp,
  PlusCircle,
  Store,
  CloudSun,
} from 'lucide-react';
import { AuthRole, FreightShipment, LanguageCode, UserProfile, UserRole, VoiceMessage } from '../types';
import { translations, ALL_INDIAN_LANGUAGES } from '../utils/translations';
import { audioSpeech } from '../utils/audioSpeech';
import { askKisanVoiceAI } from '../services/geminiService';
import { activeFreightShipments } from '../data/mockData';
import { VoiceCommandCheatSheet, VoiceCommandItem } from './VoiceCommandCheatSheet';

interface ShipmentTrackingCardProps {
  shipments: FreightShipment[];
  activeLang: LanguageCode;
  onOpenLogistics: () => void;
}

export const ShipmentTrackingCard: React.FC<ShipmentTrackingCardProps> = ({
  shipments,
  activeLang,
  onOpenLogistics,
}) => {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const currentShipment = shipments[selectedIdx] || shipments[0];

  if (!currentShipment) return null;

  return (
    <div className="mt-3.5 rounded-2xl border border-[#23382B] bg-[#111A15] p-3 sm:p-4 text-[#E5E9E7] shadow-xl overflow-hidden text-left">
      {/* Multi-Shipment Tabs if multiple shipments */}
      {shipments.length > 1 && (
        <div className="flex items-center gap-1.5 pb-2.5 mb-2.5 border-b border-[#23382B] overflow-x-auto no-scrollbar">
          <span className="text-[10px] uppercase font-bold text-[#8E9B94] shrink-0 mr-1">
            {activeLang === 'mr' ? 'गाडी निवडा:' : activeLang === 'hi' ? 'गाड़ी चुनें:' : 'Select Truck:'}
          </span>
          {shipments.map((s, idx) => (
            <button
              key={s.id}
              onClick={() => setSelectedIdx(idx)}
              className={`px-2.5 py-1 rounded-full text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${
                selectedIdx === idx
                  ? 'bg-[#C2D66E] text-[#0F1411] shadow-md font-black'
                  : 'bg-[#18241E] text-[#8E9B94] hover:text-white border border-[#2C3631]'
              }`}
            >
              <Truck className="w-3 h-3" />
              <span>{s.truckId}</span>
              <span className="text-[9px] opacity-75">
                ({s.truckType.includes('Reefer') ? 'Reefer' : 'Ventilated'})
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Header Banner: Status & Live Satellite Telemetry */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-[#23382B]">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 font-bold">
            {activeLang === 'mr'
              ? 'लाईव्ह जीपीएस व कोल्ड-चेन सेन्सर'
              : activeLang === 'hi'
              ? 'लाइव जीपीएस व कोल्ड-चेन सेंसर'
              : 'Live GPS & Cold-Chain Telemetry'}
          </span>
        </div>

        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
          <Compass className="w-3 h-3 text-emerald-400 animate-spin" style={{ animationDuration: '6s' }} />
          {currentShipment.status}
        </span>
      </div>

      {/* Primary Telemetry Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 my-3">
        {/* Truck & Cold Chain Card */}
        <div className="p-3 rounded-xl bg-[#16221C] border border-[#283D30] flex flex-col justify-between">
          <div className="flex items-center justify-between gap-1 mb-1.5">
            <div className="flex items-center gap-1.5 text-xs font-black text-white">
              <Truck className="w-4 h-4 text-[#C2D66E]" />
              <span>{currentShipment.truckId}</span>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-md bg-[#24352B] text-[#C2D66E] font-medium border border-[#374B3E]">
              {currentShipment.truckType.includes('Reefer') ? '❄️ Cold Reefer' : '🌬️ Ventilated'}
            </span>
          </div>

          <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#23382B]">
            <span className="text-[11px] text-[#8E9B94] flex items-center gap-1">
              <Thermometer className="w-3.5 h-3.5 text-cyan-400" />
              {activeLang === 'mr' ? 'कंटेनर तापमान' : activeLang === 'hi' ? 'तापमान' : 'Reefer Temp'}:
            </span>
            <span className="text-sm font-black text-cyan-300 flex items-center gap-1">
              +{currentShipment.currentTempCelsius}°C
              <span className="text-[10px] font-normal text-cyan-400/80">({currentShipment.temperatureRange.split(' ')[0]})</span>
            </span>
          </div>
        </div>

        {/* Current Location & ETA Card */}
        <div className="p-3 rounded-xl bg-[#16221C] border border-[#283D30] flex flex-col justify-between">
          <div>
            <span className="text-[10px] text-[#8E9B94] font-bold uppercase tracking-wider block mb-1">
              📍 {activeLang === 'mr' ? 'सध्याचे स्थान' : activeLang === 'hi' ? 'वर्तमान स्थान' : 'Current Position'}
            </span>
            <p className="text-xs font-bold text-white line-clamp-1">
              {currentShipment.currentLocationName}
            </p>
          </div>

          <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#23382B]">
            <span className="text-[11px] text-[#8E9B94] flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-[#C2D66E]" /> ETA:
            </span>
            <span className="text-xs font-bold text-[#C2D66E]">
              {currentShipment.eta}
            </span>
          </div>
        </div>
      </div>

      {/* Route Corridor Indicator */}
      <div className="p-2.5 rounded-xl bg-[#0D1510] border border-[#23382B] mb-3">
        <div className="flex items-center justify-between text-[11px] text-[#8E9B94] mb-1">
          <span className="font-semibold truncate max-w-[45%]">{currentShipment.originHub}</span>
          <ArrowRight className="w-3.5 h-3.5 text-[#C2D66E] shrink-0 mx-1" />
          <span className="font-semibold text-[#D4E4BC] truncate max-w-[45%]">{currentShipment.destinationMandi}</span>
        </div>

        {/* Visual Progress Bar */}
        <div className="w-full bg-[#1F2E25] h-1.5 rounded-full overflow-hidden my-1.5">
          <div className="bg-gradient-to-r from-emerald-500 to-[#C2D66E] h-full rounded-full" style={{ width: '75%' }}></div>
        </div>
      </div>

      {/* Stops Stepper Timeline */}
      <div className="mb-3 space-y-1.5">
        <div className="text-[10px] font-bold uppercase tracking-wider text-[#8E9B94]">
          {activeLang === 'mr' ? 'रूट थांबे व प्रगती (Route Stops):' : activeLang === 'hi' ? 'रूट स्टॉप्स व स्थिति:' : 'Route Stops & Progress:'}
        </div>
        <div className="space-y-1">
          {currentShipment.routeStops.map((stop) => (
            <div
              key={stop.stopNumber}
              className={`flex items-center justify-between p-1.5 rounded-lg text-xs ${
                stop.completed
                  ? 'bg-[#15211A] text-[#8E9B94]'
                  : 'bg-[#1F2E25] text-white border border-[#C2D66E]/30'
              }`}
            >
              <div className="flex items-center gap-2 truncate pr-2">
                {stop.completed ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                ) : (
                  <span className="w-3.5 h-3.5 rounded-full border-2 border-[#C2D66E] flex items-center justify-center text-[9px] font-bold text-[#C2D66E] shrink-0">
                    {stop.stopNumber}
                  </span>
                )}
                <span className={`truncate text-[11px] ${stop.completed ? 'line-through text-[#8E9B94]' : 'font-semibold text-white'}`}>
                  {stop.farmName} ({stop.location})
                </span>
              </div>
              <div className="text-[10px] text-right shrink-0 flex items-center gap-1.5">
                <span className="text-[#C2D66E] font-medium">{stop.action}</span>
                <span className="text-[#8E9B94]">({stop.scheduledTime})</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Driver Contact Bar & Shared Savings Stats */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-2.5 border-t border-[#23382B]">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-[#24352B] flex items-center justify-center text-[#C2D66E] font-bold text-xs">
            👤
          </div>
          <div>
            <p className="text-xs font-bold text-white leading-tight">{currentShipment.driverName}</p>
            <p className="text-[10px] text-[#8E9B94]">{currentShipment.driverPhone}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <a
            href={`tel:${currentShipment.driverPhone.replace(/\s+/g, '')}`}
            className="flex items-center gap-1 px-3 py-1 rounded-xl bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500 hover:text-black border border-emerald-500/30 text-xs font-bold transition-all"
          >
            <Phone className="w-3 h-3" />
            <span>{activeLang === 'mr' ? 'कॉल करा' : activeLang === 'hi' ? 'कॉल करें' : 'Call'}</span>
          </a>

          <button
            onClick={onOpenLogistics}
            className="flex items-center gap-1 px-3 py-1 rounded-xl bg-[#C2D66E] text-[#0F1411] hover:bg-[#D4E4BC] text-xs font-black transition-all shadow-md cursor-pointer"
          >
            <span>{activeLang === 'mr' ? 'संपूर्ण रडार' : activeLang === 'hi' ? 'लॉजिस्टिक्स रडार' : 'Full Radar'}</span>
            <ExternalLink className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Savings Metric Footer */}
      <div className="mt-2.5 pt-2 border-t border-[#23382B] flex items-center justify-between text-[10px] text-[#8E9B94]">
        <span className="flex items-center gap-1">
          <Users className="w-3 h-3 text-[#C2D66E]" />
          {currentShipment.participatingFarmersCount} {activeLang === 'mr' ? 'शेतकरी एकत्र' : 'Farmers Pooled'}
        </span>
        <span className="text-emerald-400 font-bold">
          💰 {currentShipment.costSavedPercent}% {activeLang === 'mr' ? 'भाडे बचत' : 'Freight Saved'}
        </span>
        <span className="text-[#C2D66E] font-bold">
          📦 {currentShipment.capacityUtilizationPercent}% {activeLang === 'mr' ? 'क्षमता' : 'Capacity'}
        </span>
      </div>
    </div>
  );
};

interface VoiceTipsHelperCardProps {
  userRole?: UserRole | AuthRole | string;
  activeLang: LanguageCode;
  onExecuteCommand: (phrase: string) => void;
  onPlayPronunciation: (phrase: string) => void;
  onOpenListProduce?: () => void;
  onOpenAddDemand?: () => void;
  onOpenWeatherModal?: () => void;
  onNavigateTab: (tab: string, contextId?: string) => void;
  onClose: () => void;
}

export const VoiceTipsHelperCard: React.FC<VoiceTipsHelperCardProps> = ({
  userRole = 'farmer',
  activeLang,
  onExecuteCommand,
  onPlayPronunciation,
  onOpenListProduce,
  onOpenAddDemand,
  onOpenWeatherModal,
  onNavigateTab,
  onClose,
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(true);

  const isBuyerRole =
    userRole === 'buyer' ||
    userRole === 'processor' ||
    userRole === 'exporter' ||
    userRole === 'fpo_buyer';

  const roleTitle = isBuyerRole
    ? activeLang === 'mr'
      ? '🏢 खरेदीदार व्हॉईस आज्ञा टिप्स (Buyer Tips)'
      : activeLang === 'hi'
      ? '🏢 थोक खरीदार वॉयस टिप्स (Buyer Tips)'
      : '🏢 Bulk Buyer Voice Tips'
    : activeLang === 'mr'
    ? '👨‍🌾 शेतकरी व्हॉईस आज्ञा टिप्स (Farmer Tips)'
    : activeLang === 'hi'
    ? '👨‍🌾 किसान वॉयस कमांड टिप्स (Farmer Tips)'
    : '👨‍🌾 Farmer Voice Tips';

  // Role-specific tips
  const tips = isBuyerRole
    ? [
        {
          id: 'tip-track',
          icon: <Truck className="w-3.5 h-3.5 text-emerald-400" />,
          phrase:
            activeLang === 'mr'
              ? 'माझी गाडी ट्रॅक करा'
              : activeLang === 'hi'
              ? 'मेरी शिपमेंट ट्रैक करो'
              : 'Track my shipment',
          badge: 'Live GPS',
          sublabel:
            activeLang === 'mr'
              ? 'थेट वाहनाचे स्थान व तापमान तपासा'
              : activeLang === 'hi'
              ? 'लाइव गाड़ी व तापमान देखें'
              : 'Live GPS & Cold-Chain Telemetry',
          onRun: () =>
            onExecuteCommand(
              activeLang === 'mr'
                ? 'माझी गाडी ट्रॅक करा'
                : activeLang === 'hi'
                ? 'मेरी शिपमेंट ट्रैक करो'
                : 'Track my shipment'
            ),
        },
        {
          id: 'tip-demand',
          icon: <PlusCircle className="w-3.5 h-3.5 text-[#C2D66E]" />,
          phrase:
            activeLang === 'mr'
              ? 'खरेदी मागणी नोंदवा'
              : activeLang === 'hi'
              ? 'थोक खरीद मांग दर्ज करें'
              : 'Post procurement demand',
          badge: 'Buy Bulk',
          sublabel:
            activeLang === 'mr'
              ? 'शेतमाल खरेदी मागणी फॉर्म उघडा'
              : activeLang === 'hi'
              ? 'थोक खरीद मांग फॉर्म खोलें'
              : 'Direct Farm-gate Procurement',
          onRun: () => {
            onClose();
            if (onOpenAddDemand) onOpenAddDemand();
            else onNavigateTab('marketplace');
          },
        },
        {
          id: 'tip-market',
          icon: <Store className="w-3.5 h-3.5 text-amber-400" />,
          phrase:
            activeLang === 'mr'
              ? 'बाजारपेठ उघडा'
              : activeLang === 'hi'
              ? 'मंडी में ताजा फसलें देखें'
              : 'Browse fresh marketplace lots',
          badge: '100% Escrow',
          sublabel:
            activeLang === 'mr'
              ? 'शेतकऱ्यांचे थेट लॉट्स व भाव तपासा'
              : activeLang === 'hi'
              ? 'किसानों के सत्यापित लॉट्स देखें'
              : 'Verified Farmer Produce Lots',
          onRun: () => {
            onClose();
            onNavigateTab('marketplace');
          },
        },
        {
          id: 'tip-freight',
          icon: <Navigation className="w-3.5 h-3.5 text-cyan-400" />,
          phrase:
            activeLang === 'mr'
              ? '४५% स्वस्त वाहतूक सॉफ्टवेअर'
              : activeLang === 'hi'
              ? '45% सस्ता ट्रांसपोर्ट सॉफ्टवेयर'
              : 'Shared cold-chain freight',
          badge: 'Save 45%',
          sublabel:
            activeLang === 'mr'
              ? 'कोल्ड-चेन रीफर मार्ग नियोजन'
              : activeLang === 'hi'
              ? 'रीफर रूट व भाड़ा बचत'
              : 'Reefer Milk-Run Routing',
          onRun: () => {
            onClose();
            onNavigateTab('logistics');
          },
        },
      ]
    : [
        {
          id: 'tip-track',
          icon: <Truck className="w-3.5 h-3.5 text-emerald-400" />,
          phrase:
            activeLang === 'mr'
              ? 'माझी गाडी ट्रॅक करा'
              : activeLang === 'hi'
              ? 'मेरी शिपमेंट ट्रैक करो'
              : 'Track my shipment',
          badge: 'Live GPS',
          sublabel:
            activeLang === 'mr'
              ? 'सध्याच्या गाडीचे स्थान व +५.२°C तापमान'
              : activeLang === 'hi'
              ? 'गाड़ी की लाइव लोकेशन व तापमान'
              : 'Real-time Cold Chain & ETA',
          onRun: () =>
            onExecuteCommand(
              activeLang === 'mr'
                ? 'माझी गाडी ट्रॅक करा'
                : activeLang === 'hi'
                ? 'मेरी शिपमेंट ट्रैक करो'
                : 'Track my shipment'
            ),
        },
        {
          id: 'tip-list',
          icon: <PlusCircle className="w-3.5 h-3.5 text-[#C2D66E]" />,
          phrase:
            activeLang === 'mr'
              ? 'नवीन शेतमाल विका'
              : activeLang === 'hi'
              ? 'नई फसल बिक्री फॉर्म'
              : 'Create new listing',
          badge: 'Direct Sale',
          sublabel:
            activeLang === 'mr'
              ? 'थेट खरेदीदारांसाठी लॉट विक्री नोंदणी'
              : activeLang === 'hi'
              ? 'सीधी बिक्री के लिए फसल लिस्ट करें'
              : 'Sell Produce to Bulk Buyers',
          onRun: () => {
            onClose();
            if (onOpenListProduce) onOpenListProduce();
            else onNavigateTab('marketplace');
          },
        },
        {
          id: 'tip-forecast',
          icon: <TrendingDown className="w-3.5 h-3.5 text-amber-400" />,
          phrase:
            activeLang === 'mr'
              ? 'ड्रॅगन फ्रूट भाव अंदाज'
              : activeLang === 'hi'
              ? 'ड्रैगन फ्रूट का क्या भाव मिलेगा'
              : 'Price & demand forecast',
          badge: 'AI Trends',
          sublabel:
            activeLang === 'mr'
              ? 'पुढील ३० दिवसांतील बाजारभाव व मागणी'
              : activeLang === 'hi'
              ? '30 दिनों का मंडी भाव विश्लेषण'
              : '30-Day Mandi Price Projections',
          onRun: () =>
            onExecuteCommand(
              activeLang === 'mr'
                ? 'ड्रॅगन फ्रूट भाव अंदाज'
                : activeLang === 'hi'
                ? 'ड्रैगन फ्रूट का क्या भाव मिलेगा'
                : 'Price & demand forecast'
            ),
        },
        {
          id: 'tip-weather',
          icon: <CloudSun className="w-3.5 h-3.5 text-sky-400" />,
          phrase:
            activeLang === 'mr'
              ? 'हवामान व वाहतूक इशारा'
              : activeLang === 'hi'
              ? 'मौसम व बारिश की चेतावनी'
              : 'Weather & transit alert',
          badge: 'Radar',
          sublabel:
            activeLang === 'mr'
              ? 'पाऊस, धुके व महामार्ग धोका सल्ला'
              : activeLang === 'hi'
              ? 'घाटी में कोहरा व बारिश सलाह'
              : 'Rain, Fog & Highway Safety',
          onRun: () => {
            onClose();
            if (onOpenWeatherModal) onOpenWeatherModal();
          },
        },
      ];

  return (
    <div className="bg-[#141C18] border-b border-[#243329] px-3 sm:px-4 py-2 transition-all text-left">
      {/* Collapsible Bar Header */}
      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-1.5 text-left group cursor-pointer"
        >
          <div className="w-5 h-5 rounded-md bg-[#C2D66E]/20 text-[#C2D66E] flex items-center justify-center shrink-0">
            <Lightbulb className="w-3 h-3 text-[#C2D66E]" />
          </div>
          <span className="text-xs font-bold text-[#E5E9E7] group-hover:text-[#C2D66E] transition-colors flex items-center gap-1">
            {roleTitle}
          </span>
          <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#202C25] text-[#8E9B94] font-medium border border-[#2B3B32]">
            {isBuyerRole ? 'Buyer Mode' : 'Farmer Mode'}
          </span>
        </button>

        <div className="flex items-center gap-1.5">
          {!isExpanded && (
            <div
              onClick={() => setIsExpanded(true)}
              className="hidden sm:flex items-center gap-1 text-[11px] text-[#8E9B94] hover:text-white cursor-pointer"
            >
              <span className="truncate max-w-[200px]">
                "{tips[0].phrase}", "{tips[1].phrase}"
              </span>
            </div>
          )}

          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 rounded-lg bg-[#1D2721] hover:bg-[#2A3930] text-[#8E9B94] hover:text-[#C2D66E] transition-all cursor-pointer flex items-center gap-1 text-[11px] font-semibold"
            title={isExpanded ? 'Collapse Voice Tips' : 'Expand Voice Tips'}
          >
            <span className="hidden sm:inline text-[10px]">
              {isExpanded
                ? activeLang === 'mr' ? 'लपवा' : activeLang === 'hi' ? 'छिपाएं' : 'Hide'
                : activeLang === 'mr' ? 'दाखवा' : activeLang === 'hi' ? 'दिखाएं' : 'Show Tips'}
            </span>
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Expanded Tips Content Grid */}
      {isExpanded && (
        <div className="mt-2 pt-2 border-t border-[#202C25] space-y-1.5 animate-fadeIn">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
            {tips.map((tip) => (
              <div
                key={tip.id}
                className="flex items-center justify-between gap-2 p-2 rounded-xl bg-[#1A241E] hover:bg-[#202C25] border border-[#27362E] hover:border-[#C2D66E]/40 transition-all group"
              >
                <div className="flex items-center gap-2 truncate pr-1">
                  <div className="p-1 rounded-lg bg-[#141C18] border border-[#27362E] shrink-0">
                    {tip.icon}
                  </div>
                  <div className="truncate">
                    <p className="text-xs font-bold text-white group-hover:text-[#C2D66E] transition-colors truncate">
                      "{tip.phrase}"
                    </p>
                    <p className="text-[10px] text-[#8E9B94] truncate">
                      {tip.sublabel}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onPlayPronunciation(tip.phrase);
                    }}
                    className="p-1 rounded-md bg-[#141C18] hover:bg-[#2B3A31] text-[#8E9B94] hover:text-white border border-[#27362E] transition-colors cursor-pointer"
                    title="Listen pronunciation"
                  >
                    <Volume2 className="w-3 h-3" />
                  </button>

                  <button
                    type="button"
                    onClick={() => tip.onRun()}
                    className="flex items-center gap-1 px-2 py-1 rounded-lg bg-[#C2D66E] hover:bg-[#D4E4BC] text-[#0F1411] text-[11px] font-bold transition-all shadow-sm cursor-pointer active:scale-95"
                    title="Say or run this command"
                  >
                    <Play className="w-2.5 h-2.5 fill-current" />
                    <span>{activeLang === 'mr' ? 'बोला / Run' : activeLang === 'hi' ? 'बोलें / Run' : 'Run'}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between text-[10px] text-[#8E9B94] pt-0.5 px-0.5">
            <span className="flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-[#C2D66E]" />
              {activeLang === 'mr'
                ? 'कोणत्याही आज्ञेवर टॅप करा किंवा माईक दाबून बोला.'
                : activeLang === 'hi'
                ? 'किसी भी कमांड पर टैप करें या माइक दबाकर बोलें।'
                : 'Tap any tip to execute instantly or speak into the mic.'}
            </span>
            <span className="text-[10px] font-semibold text-[#C2D66E]">
              {tips.length} {activeLang === 'mr' ? 'आज्ञा' : 'Commands'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

interface VoiceAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLanguage: LanguageCode;
  onNavigateTab: (tab: string, contextId?: string) => void;
  onLanguageChange?: (lang: LanguageCode) => void;
  onOpenListProduce?: () => void;
  onOpenAddDemand?: () => void;
  onOpenWeatherModal?: () => void;
  onOpenProfileModal?: () => void;
  userRole?: UserRole | AuthRole | string;
  currentUser?: UserProfile | null;
}

export const VoiceAssistantModal: React.FC<VoiceAssistantModalProps> = ({
  isOpen,
  onClose,
  currentLanguage,
  onNavigateTab,
  onLanguageChange,
  onOpenListProduce,
  onOpenAddDemand,
  onOpenWeatherModal,
  onOpenProfileModal,
  userRole = 'farmer',
  currentUser,
}) => {
  const [activeLang, setActiveLang] = useState<LanguageCode>(currentLanguage);
  const t = translations[activeLang] || translations.mr;

  const [messages, setMessages] = useState<VoiceMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [audioLevel, setAudioLevel] = useState<number>(0);
  const [isSpeakingAudio, setIsSpeakingAudio] = useState(false);
  const [autoPlayVoice, setAutoPlayVoice] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [playingMessageId, setPlayingMessageId] = useState<string | null>(null);
  const [micError, setMicError] = useState<string | null>(null);
  const [isCheatSheetOpen, setIsCheatSheetOpen] = useState<boolean>(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Sync active language with prop when changed externally
  useEffect(() => {
    setActiveLang(currentLanguage);
  }, [currentLanguage]);

  const languageOptions = ALL_INDIAN_LANGUAGES;

  // Initialize initial welcome greeting based on active language
  useEffect(() => {
    if (isOpen) {
      handleStopAudio();
      if (isRecording) {
        audioSpeech.stopListening();
        setIsRecording(false);
        setAudioLevel(0);
      }

      const welcomeMap: Record<LanguageCode, { text: string; spoken: string }> = {
        mr: {
          text: 'नमस्कार शेतकरी दादा! मी तुमचा "Kisan Mitra Bot" सहाय्यक आहे. खालील माईक दाबून बोला किंवा प्रश्न विचारा: आजचे बाजारभाव, ड्रॅगन फ्रूट किंवा अक्रोड शेती, सरकारी अनुदान व वाहतूक खर्च.',
          spoken: 'नमस्कार शेतकरी दादा! मी तुमचा किसान मित्र आवाज सहाय्यक आहे. माईक दाबून बोला, मी लगेच उत्तर देतो.',
        },
        hi: {
          text: 'नमस्ते किसान भाई! मैं आपका "Kisan Mitra Bot" सहायक हूँ। नीचे माइक दबाकर बोलें या पूछें: आज के मंडी भाव, ड्रैगन फ्रूट या अखरोट की खेती, सरकारी सब्सिडी और सस्ती ट्रांसपोर्ट।',
          spoken: 'नमस्ते किसान भाई! मैं आपका किसान मित्र वॉयस सहायक हूँ। माइक दबाकर बोलिए, मैं तुरंत मदद करूँगा।',
        },
        en: {
          text: 'Hello Farmer friend! I am your "Kisan Mitra Bot" Voice Assistant. Tap the microphone to speak or ask about live mandi rates, dragon fruit or walnut cultivation, MIDH subsidies, and shared freight.',
          spoken: 'Hello farmer friend! Welcome to Kisan Mitra Voice Assistant. Tap the mic to speak your query.',
        },
        gu: {
          text: 'નમસ્તે ખેડૂત મિત્ર! હું તમારો "Kisan Mitra Bot" સહાયક છું. માઇક દબાવીને બોલો: માર્કેટ ભાવ, ડ્રેગન ફ્રૂટ કે અખરોટની ખેતી અને સરકારી સબસિડી વિશે પૂછો.',
          spoken: 'નમસ્તે ખેડૂત મિત્ર! કિસાન મિત્રમાં આપનું સ્વાગત છે. માઇક દબાવીને બોલો.',
        },
        te: {
          text: 'నమస్కారం రైతు మిత్రమా! నేను మీ "Kisan Mitra Bot" సహాయకుడిని. మైక్ నొక్కి మాట్లాడండి: మార్కెట్ ధరలు, డ్రాగన్ ఫ్రూట్ లేదా వాల్నట్ సాగు, ప్రభుత్వ రాయితీ గురించి తెలుసుకోండి.',
          spoken: 'నమస్కారం రైతు మిత్రమా! కిసాన్ మిత్ర కి స్వాగతం. మైక్ నొక్కి మీ ప్రశ్న అడగండి.',
        },
        ta: {
          text: 'வணக்கம் விவசாய தோழரே! நான் உங்கள் "Kisan Mitra Bot" உதவியாளர். மைக் தொட்டு பேசுங்கள்: சந்தை விலைகள், டிராகன் பழம் சாகுபடி மற்றும் அரசு மானியம் பற்றி தெரிந்துகொள்ளுங்கள்.',
          spoken: 'வணக்கம் விவசாய தோழரே! மைக் தொட்டு உங்கள் விவசாய கேள்விகளை கேளுங்கள்.',
        },
        kn: {
          text: 'ನಮಸ್ಕಾರ ರೈತ ಮಿತ್ರರೇ! ನಾನು ನಿಮ್ಮ "Kisan Mitra Bot" ಸಹಾಯಕ. ಮೈಕ್ ಒತ್ತಿ ಮಾತನಾಡಿ: ಮಾರುಕಟ್ಟೆ ದರಗಳು, ಡ್ರ್ಯಾಗನ್ ಹಣ್ಣು ಕೃಷಿ ಮತ್ತು ಸರ್ಕಾರಿ ಸಬ್ಸಿಡಿ ಬಗ್ಗೆ ತಿಳಿದುಕೊಳ್ಳಿ.',
          spoken: 'ನಮಸ್ಕಾರ ರೈತ ಮಿತ್ರರೇ! ಮೈಕ್ ಒತ್ತಿ ನಿಮ್ಮ ಪ್ರಶ್ನೆಗಳನ್ನು ಕೇಳಿ.',
        },
        ml: {
          text: 'നമസ്കാരം കർഷക സുഹൃത്തേ! ഞാൻ നിങ്ങളുടെ "Kisan Mitra Bot" വോയ്‌സ് അസിസ്റ്റന്റാണ്. മൈക്ക് അമർത്തി സംസാരിക്കൂ: വിപണി വിലകൾ, കൃഷി രീതികൾ, സർക്കാർ സബ്സിഡി.',
          spoken: 'നമസ്കാരം കർഷക സുഹൃത്തേ! മൈക്ക് അമർത്തി നിങ്ങളുടെ സംശയങ്ങൾ ചോദിക്കൂ.',
        },
        bn: {
          text: 'নমস্কার কৃষক বন্ধু! আমি আপনার "Kisan Mitra Bot" ভয়েস সহকারী। মাইক চেপে কথা বলুন: আজকের বাজার দর, ড্রাগন ফ্রুট চাষ ও সরকারি ভর্তুকি সম্পর্কে জানুন।',
          spoken: 'নমস্কার কৃষক বন্ধু! মাইক চেপে আপনার প্রশ্ন বলুন।',
        },
        pa: {
          text: 'ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ ਕਿਸਾਨ ਵੀਰੋ! ਮੈਂ ਤੁਹਾਡਾ "Kisan Mitra Bot" ਆਵਾਜ਼ ਸਹਾਇਕ ਹਾਂ। ਮਾਈਕ ਦਬਾ ਕੇ ਬੋਲੋ: ਮੰਡੀ ਭਾਅ, ਡ੍ਰੈਗਨ ਫਰੂਟ ਦੀ ਖੇਤੀ, ਸਰਕਾਰੀ ਸਬਸਿਡੀ ਬਾਰੇ ਪੁੱਛੋ।',
          spoken: 'ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ ਕਿਸਾਨ ਵੀਰੋ! ਮਾਈਕ ਦਬਾ ਕੇ ਆਪਣਾ ਸਵਾਲ ਪੁੱਛੋ।',
        },
        or: {
          text: 'ନମସ୍କାର କୃଷକ ଭାଇ! ମୁଁ ଆପଣଙ୍କ "Kisan Mitra Bot" ଭଏସ୍ ସହାୟକ। ମାଇକ୍ ଚିପି କୁହନ୍ତୁ: ବଜାର ଦର, ଡ୍ରାଗନ ଫଳ ଚାଷ, ସରକାରୀ ସବସିଡି ବିଷୟରେ ପଚାରନ୍ତୁ।',
          spoken: 'ନମସ୍କାର କୃଷକ ଭାଇ! ମାଇକ୍ ଚିପି ଆପଣଙ୍କ ପ୍ରଶ୍ନ ପଚାରନ୍ତୁ।',
        },
        as: {
          text: 'নমস্কাৰ কৃষক বন্ধু! মই আপোনাৰ "Kisan Mitra Bot" সহায়ক। মাইক টিপি কথা কওক: বজাৰ মূল্য, ড্ৰেগন ফল খেতি আৰু চৰকাৰী ৰেহাই সম্পৰ্কে সোধক।',
          spoken: 'নমস্কাৰ কৃষক বন্ধু! মাইক টিপি আপোনাৰ প্ৰশ্ন সোধক।',
        },
        ur: {
          text: 'السلام علیکم کسان بھائی! میں آپ کا "Kisan Mitra Bot" وائس اسسٹنٹ ہوں۔ مائیک دبا کر بولیے: منڈی ریٹ، ڈریگن فروٹ کی کاشت، اور سرکاری سبسڈی کے بارے میں پوچھیے۔',
          spoken: 'السلام علیکم کسان بھائی! مائیک دبا کر اپنا سوال پوچھیے۔',
        },
      };

      const welcome = welcomeMap[activeLang] || welcomeMap.mr;
      const initialMsg: VoiceMessage = {
        id: `msg-welcome-${activeLang}`,
        sender: 'assistant',
        text: welcome.text,
        spokenAudioText: welcome.spoken,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedActions: [
          {
            label:
              activeLang === 'mr'
                ? '📊 ड्रॅगन फ्रूट भाव अंदाज'
                : activeLang === 'hi'
                ? '📊 ड्रैगन फ्रूट भाव व मांग'
                : activeLang === 'gu'
                ? '📊 ડ્રેગન ફ્રૂટ ભાવ આગાહી'
                : activeLang === 'te'
                ? '📊 మార్కెట్ ధరల అంచనా'
                : '📊 Dragon Fruit Price Forecast',
            actionType: 'FORECAST',
            target: 'Dragon Fruit',
          },
          {
            label:
              activeLang === 'mr'
                ? '🌰 अक्रोड आधुनिक लागवड'
                : activeLang === 'hi'
                ? '🌰 अखरोट की उन्नत खेती'
                : activeLang === 'gu'
                ? '🌰 અખરોટ માસ્ટરક્લાસ'
                : '🌰 High-Density Walnut Masterclass',
            actionType: 'TUTORIAL',
            target: 'tut-walnut-grafted',
          },
          {
            label:
              activeLang === 'mr'
                ? '🚛 ४५% स्वस्त वाहतूक सॉफ्टवेअर'
                : activeLang === 'hi'
                ? '🚛 45% सस्ता ट्रांसपोर्ट सॉफ्टवेयर'
                : '🚛 45% Cheaper Smart Freight',
            actionType: 'LOGISTICS',
            target: 'logistics',
          },
        ],
      };

      setMessages([initialMsg]);
    }
  }, [isOpen, activeLang]);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading, isRecording]);

  const handleSpeak = (text: string, lang: LanguageCode = activeLang, messageId?: string) => {
    if (isSpeakingAudio && messageId && playingMessageId === messageId) {
      handleStopAudio();
      return;
    }

    // Stop mic so bot never hears itself
    if (isRecording) {
      audioSpeech.stopListening();
      setIsRecording(false);
      setAudioLevel(0);
    }

    if (messageId) {
      setPlayingMessageId(messageId);
    }

    audioSpeech.speak(
      text,
      lang,
      () => {
        setIsSpeakingAudio(true);
        if (messageId) setPlayingMessageId(messageId);
      },
      () => {
        setIsSpeakingAudio(false);
        setPlayingMessageId(null);
      },
      () => {
        setIsSpeakingAudio(false);
        setPlayingMessageId(null);
      }
    );
  };

  const handleStopAudio = () => {
    audioSpeech.stop();
    setIsSpeakingAudio(false);
    setPlayingMessageId(null);
  };

  const changeLanguage = (newLang: LanguageCode) => {
    handleStopAudio();
    if (isRecording) {
      audioSpeech.stopListening();
      setIsRecording(false);
      setAudioLevel(0);
    }
    setActiveLang(newLang);
    if (onLanguageChange) {
      onLanguageChange(newLang);
    }
  };

  /**
   * Tap-to-Speak / Tap-to-Send Toggle
   */
  const toggleRecording = () => {
    // If user is already recording and taps mic again: FINISH & SEND!
    if (isRecording) {
      audioSpeech.stopListening();
      setIsRecording(false);
      setAudioLevel(0);
      const queryToSend = inputText.trim();
      if (queryToSend.length >= 2) {
        sendQuery(queryToSend);
      }
      return;
    }

    // Otherwise: START recording fresh
    handleStopAudio();
    setMicError(null);
    setInputText('');
    setIsRecording(true);
    setAudioLevel(15);

    const started = audioSpeech.startListening(
      activeLang,
      (transcript, _isFinal) => {
        // Live update input box so farmer can see every word in real-time
        if (transcript && transcript.trim()) {
          setInputText(transcript);
        }
      },
      (error) => {
        setMicError(error);
        setIsRecording(false);
        setAudioLevel(0);
      },
      () => {
        // Microphone ended or paused
        setIsRecording(false);
        setAudioLevel(0);
      },
      (level) => {
        setAudioLevel(level);
      }
    );

    if (!started) {
      setIsRecording(false);
      setAudioLevel(0);
    }
  };

  const cancelRecording = () => {
    audioSpeech.stopListening();
    setIsRecording(false);
    setAudioLevel(0);
    setInputText('');
  };

  const handleExecuteCheatSheetCommand = (cmd: VoiceCommandItem, customQuery?: string) => {
    setIsCheatSheetOpen(false);
    handleStopAudio();

    if (cmd.actionType === 'NAVIGATE' && cmd.targetPayload) {
      onNavigateTab(cmd.targetPayload);
      onClose();
    } else if (cmd.actionType === 'OPEN_LIST_PRODUCE') {
      onClose();
      if (onOpenListProduce) {
        onOpenListProduce();
      } else {
        onNavigateTab('marketplace');
      }
    } else if (cmd.actionType === 'OPEN_ADD_DEMAND') {
      onClose();
      if (onOpenAddDemand) {
        onOpenAddDemand();
      } else {
        onNavigateTab('marketplace');
      }
    } else if (cmd.actionType === 'OPEN_WEATHER') {
      onClose();
      if (onOpenWeatherModal) {
        onOpenWeatherModal();
      }
    } else if (cmd.actionType === 'OPEN_PROFILE') {
      onClose();
      if (onOpenProfileModal) {
        onOpenProfileModal();
      }
    } else if (cmd.actionType === 'QUERY_AI') {
      const query = customQuery || (cmd.phrases[activeLang] ? cmd.phrases[activeLang][0] : cmd.englishAlias);
      sendQuery(query);
    }
  };

  const handlePlayPronunciation = (phrase: string) => {
    handleSpeak(phrase, activeLang);
  };

  const sendQuery = async (queryText: string) => {
    const cleanQuery = queryText.trim();
    if (!cleanQuery) return;

    handleStopAudio();
    if (isRecording) {
      audioSpeech.stopListening();
      setIsRecording(false);
      setAudioLevel(0);
    }

    const userMsg: VoiceMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: cleanQuery,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');

    const lower = cleanQuery.toLowerCase();

    // Check for Cheat Sheet intent
    if (
      lower.includes('cheat sheet') ||
      lower.includes('चीट शीट') ||
      lower.includes('कमांड') ||
      lower.includes('commands') ||
      lower.includes('आज्ञा') ||
      lower.includes('मार्गदर्शक') ||
      lower.includes('help')
    ) {
      setIsCheatSheetOpen(true);
      const helpText =
        activeLang === 'mr'
          ? 'आवाज आज्ञा मार्गदर्शक (Voice Cheat Sheet) उघडले आहे. आपण यापैकी कोणतीही आज्ञा बोलू शकता किंवा Run वर टॅप करू शकता.'
          : activeLang === 'hi'
          ? 'वॉयस कमांड्स चीट शीट खुल गई है। आप इनमें से कोई भी कमांड बोल सकते हैं या Run पर टैप कर सकते हैं।'
          : 'Voice Commands Cheat Sheet opened. You can speak any phrase or tap Run.';
      const helpMsg: VoiceMessage = {
        id: `bot-${Date.now()}`,
        sender: 'assistant',
        text: helpText,
        spokenAudioText: helpText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, helpMsg]);
      if (autoPlayVoice) handleSpeak(helpText, activeLang, helpMsg.id);
      return;
    }

    // 1. Direct Shipment Tracking Intent Check (Track my shipment / Where is my truck)
    const isShipmentTracking =
      lower.includes('track my shipment') ||
      lower.includes('track shipment') ||
      lower.includes('track the shipment') ||
      lower.includes('where is my shipment') ||
      lower.includes('where is my truck') ||
      lower.includes('check my shipment') ||
      lower.includes('shipment status') ||
      lower.includes('track truck') ||
      lower.includes('track my vehicle') ||
      lower.includes('tracking') ||
      lower.includes('गाडी कुठे') ||
      lower.includes('ट्रक कुठे') ||
      lower.includes('शिपमेंट ट्रॅक') ||
      lower.includes('वाहतूक ट्रॅकिंग') ||
      lower.includes('माझी गाडी') ||
      lower.includes('माझा माल कुठे') ||
      lower.includes('गाडीचे लोकेशन') ||
      lower.includes('मेरी शिपमेंट') ||
      lower.includes('गाड़ी कहां') ||
      lower.includes('ट्रक कहां') ||
      lower.includes('शिपमेंट ट्रैक') ||
      lower.includes('ગાડી ક્યાં') ||
      lower.includes('શિપમેન્ટ ટ્રેક') ||
      lower.includes('రవాణాను ట్రాక్') ||
      lower.includes('ట్రక్ ఎక్కడ') ||
      lower.includes('சரக்கை கண்காணிக்க') ||
      lower.includes('ಸಾಗಣೆಯನ್ನು ಟ್ರ್ಯಾಕ್') ||
      lower.includes('കയറ്റുമതി ട്രാക്ക്') ||
      lower.includes('চালান ট্র্যাক') ||
      lower.includes('ਸ਼ਿਪਮੈਂਟ ਟ੍ਰੈਕ') ||
      lower.includes('ପରିବହନ ଟ୍ରାକ୍') ||
      lower.includes('চালন ট্ৰেক') ||
      lower.includes('شپمنٹ ٹریک');

    if (isShipmentTracking) {
      setIsLoading(true);
      // Fetch active shipments directly from logistics module
      const shipments = activeFreightShipments;
      const primary = shipments[0];

      const spokenTexts: Record<LanguageCode, string> = {
        mr: `शेतकरी दादा, तुमची ${primary.truckId} ही १०-टन कोल्ड-चेन गाडी सध्या ${primary.currentLocationName} येथे असून तापमान +${primary.currentTempCelsius}°C वर सुरक्षित आहे. अंदाजित आगमन वेळ ${primary.eta} आहे.`,
        hi: `किसान भाई, आपकी ${primary.truckId} 10-टन रीफर गाड़ी इस समय ${primary.currentLocationName} पर है। तापमान +${primary.currentTempCelsius}°C पर सुरक्षित है और डिलीवरी ${primary.eta} होगी।`,
        en: `Farmer friend, your cold-chain shipment ${primary.truckId} is currently in transit near ${primary.currentLocationName}. Cold-chain temperature is stable at +${primary.currentTempCelsius}°C with ETA ${primary.eta}.`,
        gu: `ખેડૂત મિત્ર, તમારી કોલ્ડ-ચેઇન ગાડી ${primary.truckId} હાલ ${primary.currentLocationName} પાસે છે. તાપમાન +${primary.currentTempCelsius}°C છે અને ડિલિવરી ${primary.eta} થશે.`,
        te: `రైతు మిత్రమా, మీ కోల్డ్ చైన్ రవాణా ${primary.truckId} ప్రస్తుతం ${primary.currentLocationName} వద్ద ఉంది. ఉష్ణోగ్రత +${primary.currentTempCelsius}°C గా ఉంది మరియు ETA ${primary.eta}.`,
        ta: `விவசாய தோழரே, உங்கள் லாரி ${primary.truckId} தற்போது ${primary.currentLocationName} அருகே உள்ளது. வெப்பநிலை +${primary.currentTempCelsius}°C, வருகை நேரம் ${primary.eta}.`,
        kn: `ರೈತ ಮಿತ್ರರೇ, ನಿಮ್ಮ ${primary.truckId} ವಾಹನವು ಪ್ರಸ್ತುತ ${primary.currentLocationName} ಬಳಿ ಚಲಿಸುತ್ತಿದೆ. ತಾಪಮಾನ +${primary.currentTempCelsius}°C ಮತ್ತು ಆಗಮನದ ಸಮಯ ${primary.eta}.`,
        ml: `കർഷക മിത്രമേ, നിങ്ങളുടെ ${primary.truckId} വാಹനം ഇപ്പോൾ ${primary.currentLocationName} ന് അടുത്ത് എത്തിയിരിക്കുന്നു. താപനില +${primary.currentTempCelsius}°C ആണ്, സമയം ${primary.eta}.`,
        bn: `কৃষক বন্ধু, আপনার ${primary.truckId} গাড়িটি বর্তমানে ${primary.currentLocationName} এর কাছে রয়েছে। তাপমাত্রা +${primary.currentTempCelsius}°C এবং পৌঁছানোর সময় ${primary.eta}।`,
        pa: `ਕਿਸਾਨ ਵੀਰ ਜੀ, ਤੁਹਾਡੀ ${primary.truckId} ਗੱਡੀ ਇਸ ਵੇਲੇ ${primary.currentLocationName} ਦੇ ਨੇੜੇ ਹੈ। ਤਾਪਮਾਨ +${primary.currentTempCelsius}°C ਹੈ ਅਤੇ ਪਹੁੰਚਣ ਦਾ ਸਮਾਂ ${primary.eta} ਹੈ।`,
        or: `କୃଷକ ଭାଇ, ଆପଣଙ୍କର ${primary.truckId} ଗାଡ଼ି ବର୍ତ୍ତମାନ ${primary.currentLocationName} ନିକଟରେ ଅଛି। ତାପମାତ୍ରା +${primary.currentTempCelsius}°C ଏବଂ ପହଞ୍ଚିବା ସମୟ ${primary.eta}।`,
        as: `কৃষক বন্ধু, আপোনাৰ ${primary.truckId} বাহনখন এতিয়া ${primary.currentLocationName}ৰ ওচৰত আছে। উষ্ণতা +${primary.currentTempCelsius}°C আৰু সময় ${primary.eta}।`,
        ur: `کسان بھائی، آپ کی گاڑی ${primary.truckId} اس وقت ${primary.currentLocationName} کے قریب ہے۔ درجہ حرارت +${primary.currentTempCelsius}°C ہے اور متوقع وقت ${primary.eta} ہے۔`,
      };

      const spoken = spokenTexts[activeLang] || spokenTexts.mr;
      const display =
        activeLang === 'mr'
          ? `🚛 **थेट वाहतूक व शिपमेंट ट्रॅकिंग रिपोर्ट (Live GPS & Cold-Chain):**\n• **गाडी क्रमांक:** \`${primary.truckId}\` (${primary.truckType})\n• **सध्याचे स्थान:** 📍 ${primary.currentLocationName}\n• **कंटेनर तापमान:** ❄️ +${primary.currentTempCelsius}°C (${primary.temperatureRange})\n• **अंदाजित वेळ (ETA):** ⏱️ ${primary.eta}\n• **चालक:** 👤 ${primary.driverName} (${primary.driverPhone})\n• **मार्ग:** ${primary.originHub} ➔ ${primary.destinationMandi}`
          : activeLang === 'hi'
          ? `🚛 **लाइव फ्रेट व शिपमेंट ट्रैकिंग रिपोर्ट (Live GPS & Cold-Chain):**\n• **गाड़ी संख्या:** \`${primary.truckId}\` (${primary.truckType})\n• **वर्तमान स्थान:** 📍 ${primary.currentLocationName}\n• **तापमान:** ❄️ +${primary.currentTempCelsius}°C (${primary.temperatureRange})\n• **संभावित समय (ETA):** ⏱️ ${primary.eta}\n• **चालक:** 👤 ${primary.driverName} (${primary.driverPhone})\n• **रूट:** ${primary.originHub} ➔ ${primary.destinationMandi}`
          : `🚛 **Live Freight & Shipment Telemetry (GPS & Cold-Chain Active):**\n• **Truck ID:** \`${primary.truckId}\` (${primary.truckType})\n• **Current Location:** 📍 ${primary.currentLocationName}\n• **Sensor Temperature:** ❄️ +${primary.currentTempCelsius}°C (${primary.temperatureRange})\n• **ETA:** ⏱️ ${primary.eta}\n• **Driver:** 👤 ${primary.driverName} (${primary.driverPhone})\n• **Corridor:** ${primary.originHub} ➔ ${primary.destinationMandi}`;

      const trackingMsg: VoiceMessage = {
        id: `bot-track-${Date.now()}`,
        sender: 'assistant',
        text: display,
        spokenAudioText: spoken,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedActions: [
          {
            label:
              activeLang === 'mr'
                ? '🚛 संपूर्ण वाहतूक रडार उघडा'
                : activeLang === 'hi'
                ? '🚛 संपूर्ण लॉजिस्टिक्स रडार खोलें'
                : '🚛 Open Full Logistics Radar',
            actionType: 'LOGISTICS',
            target: 'logistics',
          },
          {
            label:
              activeLang === 'mr'
                ? '📊 ड्रॅगन फ्रूट भाव अंदाज'
                : activeLang === 'hi'
                ? '📊 30 दिन का मंडी भाव'
                : '📊 30-Day Demand Forecast',
            actionType: 'FORECAST',
            target: 'Dragon Fruit',
          },
        ],
        shipmentsData: shipments,
      };

      setTimeout(() => {
        setIsLoading(false);
        setMessages((prev) => [...prev, trackingMsg]);
        if (autoPlayVoice) {
          handleSpeak(spoken, activeLang, trackingMsg.id);
        }
      }, 400);
      return;
    }

    // Direct Voice Navigation / Listing shortcuts
    if (
      lower.includes('बाजारपेठ') ||
      lower.includes('मंडी') ||
      lower.includes('marketplace') ||
      lower.includes('go to market') ||
      lower.includes('open market')
    ) {
      const confirmText =
        activeLang === 'mr'
          ? 'बाजारपेठ उघडत आहे...'
          : activeLang === 'hi'
          ? 'मंडी व बाजारपेठ खोली जा रही है...'
          : 'Opening Marketplace...';
      const navMsg: VoiceMessage = {
        id: `bot-${Date.now()}`,
        sender: 'assistant',
        text: confirmText,
        spokenAudioText: confirmText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, navMsg]);
      if (autoPlayVoice) handleSpeak(confirmText, activeLang, navMsg.id);
      setTimeout(() => {
        onNavigateTab('marketplace');
        onClose();
      }, 700);
      return;
    }

    if (
      lower.includes('नवीन शेतमाल') ||
      lower.includes('माल विका') ||
      lower.includes('फसल बेचो') ||
      lower.includes('नई फसल') ||
      lower.includes('list produce') ||
      lower.includes('sell crop') ||
      lower.includes('add lot')
    ) {
      const confirmText =
        activeLang === 'mr'
          ? 'नवीन शेतमाल विक्री नोंदणी फॉर्म उघडत आहे...'
          : activeLang === 'hi'
          ? 'नई फसल बिक्री फॉर्म खोला जा रहा है...'
          : 'Opening Produce Listing Form...';
      const navMsg: VoiceMessage = {
        id: `bot-${Date.now()}`,
        sender: 'assistant',
        text: confirmText,
        spokenAudioText: confirmText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, navMsg]);
      if (autoPlayVoice) handleSpeak(confirmText, activeLang, navMsg.id);
      setTimeout(() => {
        onClose();
        if (onOpenListProduce) onOpenListProduce();
        else onNavigateTab('marketplace');
      }, 700);
      return;
    }

    if (
      lower.includes('खरेदी मागणी') ||
      lower.includes('खरीद मांग') ||
      lower.includes('procurement demand') ||
      lower.includes('buy bulk') ||
      lower.includes('बल्क मागणी')
    ) {
      const confirmText =
        activeLang === 'mr'
          ? 'थोक खरेदी मागणी नोंदणी फॉर्म उघडत आहे...'
          : activeLang === 'hi'
          ? 'थोक खरीद मांग फॉर्म खोला जा रहा है...'
          : 'Opening Bulk Procurement Demand Form...';
      const navMsg: VoiceMessage = {
        id: `bot-${Date.now()}`,
        sender: 'assistant',
        text: confirmText,
        spokenAudioText: confirmText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, navMsg]);
      if (autoPlayVoice) handleSpeak(confirmText, activeLang, navMsg.id);
      setTimeout(() => {
        onClose();
        if (onOpenAddDemand) onOpenAddDemand();
        else onNavigateTab('marketplace');
      }, 700);
      return;
    }

    if (
      lower.includes('वाहतूक') ||
      lower.includes('ट्रक') ||
      lower.includes('ट्रांसपोर्ट') ||
      lower.includes('logistics') ||
      lower.includes('freight')
    ) {
      const confirmText =
        activeLang === 'mr'
          ? '४५% स्वस्त वाहतूक सॉफ्टवेअर उघडत आहे...'
          : activeLang === 'hi'
          ? '45% सस्ता ट्रांसपोर्ट व लॉजिस्टिक्स सॉफ्टवेयर खोला जा रहा है...'
          : 'Opening Smart Logistics & Freight Software...';
      const navMsg: VoiceMessage = {
        id: `bot-${Date.now()}`,
        sender: 'assistant',
        text: confirmText,
        spokenAudioText: confirmText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, navMsg]);
      if (autoPlayVoice) handleSpeak(confirmText, activeLang, navMsg.id);
      setTimeout(() => {
        onNavigateTab('logistics');
        onClose();
      }, 700);
      return;
    }

    setIsLoading(true);

    try {
      const response = await askKisanVoiceAI(cleanQuery, activeLang, {});
      const botMsg: VoiceMessage = {
        id: `bot-${Date.now()}`,
        sender: 'assistant',
        text: response.displayText || response.voiceText,
        spokenAudioText: response.voiceText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedActions: response.suggestedActions,
      };

      setMessages((prev) => [...prev, botMsg]);
      setIsLoading(false);

      // Auto-speak response aloud in native voice if autoPlay is enabled
      if (autoPlayVoice && response.voiceText) {
        handleSpeak(response.voiceText, activeLang, botMsg.id);
      }
    } catch (err: any) {
      setIsLoading(false);
      const fallbackText =
        activeLang === 'mr'
          ? 'शेतकरी दादा, सर्व्हरशी संपर्क होऊ शकला नाही. कृपया आपला प्रश्न पुन्हा विचारा.'
          : activeLang === 'hi'
          ? 'किसान भाई, सर्वर से संपर्क नहीं हो पाया। कृपया अपना प्रश्न दोबारा पूछें।'
          : activeLang === 'gu'
          ? 'ખેડૂત મિત્ર, સર્વર સાથે સંપર્ક થઈ શક્યો નથી. કૃપા કરીને ફરીથી પૂછો.'
          : activeLang === 'te'
          ? 'రైతు మిత్రమా, సర్వర్ తో కనెక్షన్ సమస్య వచ్చింది. దయచేసి మళ్ళీ అడగండి.'
          : activeLang === 'ta'
          ? 'விவசாய தோழரே, சர்வர் இணைப்பு கிடைக்கவில்லை. தயவுசெய்து மீண்டும் கேட்கவும்.'
          : activeLang === 'kn'
          ? 'ರೈತ ಮಿತ್ರರೇ, ಸರ್ವರ್ ಸಂಪರ್ಕ ಸಾಧ್ಯವಾಗಲಿಲ್ಲ. ದಯವಿಟ್ಟು ಮತ್ತೆ ಕೇಳಿ.'
          : 'Could not connect to voice intelligence right now. Please try asking again.';

      const fallbackBotMsg: VoiceMessage = {
        id: `bot-${Date.now()}`,
        sender: 'assistant',
        text: fallbackText,
        spokenAudioText: fallbackText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, fallbackBotMsg]);
      if (autoPlayVoice) {
        handleSpeak(fallbackText, activeLang, fallbackBotMsg.id);
      }
    }
  };

  const handleActionClick = (action: { actionType: string; target: string }) => {
    handleStopAudio();
    onClose();

    if (action.actionType === 'FORECAST') {
      onNavigateTab('forecast');
    } else if (action.actionType === 'TUTORIAL') {
      onNavigateTab('tutorials', action.target);
    } else if (action.actionType === 'LOGISTICS') {
      onNavigateTab('logistics');
    } else {
      onNavigateTab('marketplace');
    }
  };

  const quickPrompts: Record<LanguageCode, string[]> = {
    mr: [
      '🚛 माझी गाडी / शिपमेंट ट्रॅक करा',
      'ड्रॅगन फ्रूटसाठी आजचा बाजारभाव व मागणी काय आहे?',
      'अक्रोड शेतीसाठी ५०% सरकारी अनुदान कसे मिळवायचे?',
      'वाहतूक खर्च ४०% कमी करण्यासाठी शेअर्ड ट्रक कसा बुक करावा?',
      'सातारा/सांगली भागात ड्रॅगन फ्रूट खरेदीदार कोण आहेत?',
    ],
    hi: [
      '🚛 मेरी शिपमेंट / ट्रक ट्रैक करो',
      'आज ड्रैगन फ्रूट का सबसे अच्छा मंडी भाव क्या है?',
      'अखरोट की खेती पर 50% सरकारी सब्सिडी कैसे लें?',
      'माल भाड़ा 40% कम करने के लिए लॉजिस्टिक्स सॉफ्टवेयर कैसे इस्तेमाल करें?',
      'कम पानी में सबसे ज्यादा मुनाफा देने वाली फसल कौन सी है?',
    ],
    en: [
      '🚛 Track my shipment',
      'What is the current demand and price for Dragon Fruit?',
      'How to get 50% government subsidy for Grafted Walnut?',
      'How does KisanMitra logistics software reduce transport cost by 45%?',
      'Best high-yield crops for 1 acre land with drip irrigation?',
    ],
    gu: [
      '🚛 મારી શિપમેન્ટ ટ્રેક કરો',
      'ડ્રેગન ફ્રૂટનો સારો બજાર ભાવ કેવી રીતે મેળવવો?',
      'અખરોટની ખેતી માટે સરકારી સબસિડી વિગતો',
      'લોજિસ્ટિક્સ સોફ્ટવેરથી ૪૫% ખર્ચ કેવી રીતે બચે?',
      'ડ્રેગન ફ્રૂટના મોટા ખરીદદારો કોણ છે?',
    ],
    te: [
      '🚛 నా రవాణాను ట్రాక్ చేయండి',
      'డ్రాగన్ ఫ్రూట్ మార్కెట్ డిమాండ్ ఎలా ఉంది?',
      'వాల్నట్ సాగుకు ప్రభుత్వ రాయితీ ఎలా పొందాలి?',
      'లాజిస్టిక్స్ సాఫ్ట్‌వేర్ ద్వారా రవాణా ఖర్చు 45% తగ్గించే విధానం?',
    ],
    ta: [
      '🚛 எனது சரக்கை கண்காணிக்கவும்',
      'டிராகன் பழத்தின் இன்றைய சந்தை விலை என்ன?',
      'வால்நட் சாகுபடிக்கு 50% மானியம் பெறுவது எப்படி?',
      'லாஜிஸ்டிக்ஸ் மூலம் போக்குவரத்து செலவை குறைப்பது எப்படி?',
    ],
    kn: [
      '🚛 ನನ್ನ ಸಾಗಣೆಯನ್ನು ಟ್ರ್ಯಾಕ್ ಮಾಡಿ',
      'ಡ್ರ್ಯಾಗನ್ ಹಣ್ಣಿನ ಇಂದಿನ ಮಾರುಕಟ್ಟೆ ದರ ಎಷ್ಟು?',
      'ಅಕ್ರೋಟ ಕೃಷಿಗೆ 50% ಸರ್ಕಾರಿ ಸಬ್ಸಿಡಿ ಪಡೆಯುವುದು ಹೇಗೆ?',
      'ಸಾರಿಗೆ ವೆಚ್ಚ 45% ಉಳಿಸುವುದು ಹೇಗೆ?',
    ],
    ml: [
      '🚛 എന്റെ കയറ്റുമതി ട്രാക്ക് ചെയ്യുക',
      'ഡ്രാഗൺ ഫ്രൂട്ടിന്റെ ഇന്നത്തെ വിപണി വില എത്രയാണ്?',
      'വാൽനട്ട് കൃഷിക്ക് സർക്കാർ സബ്സിഡി എങ്ങനെ ലഭിക്കും?',
      'ചരക്ക് കൂലി കുറയ്ക്കാനുള്ള ലോജിസ്റ്റിക്സ് സോഫ്റ്റ്‌വെയർ',
    ],
    bn: [
      '🚛 আমার চালান ট্র্যাক করুন',
      'ড্রাগন ফলের আজকের বাজার দর ও চাহিদা কত?',
      'আখরোট চাষে ৫০% সরকারি ভর্তুকি কীভাবে পাবেন?',
      'লজিস্টিকস সফটওয়্যার দিয়ে ৪৫% পরিবহন খরচ সাশ্রয়',
    ],
    pa: [
      '🚛 ਮੇਰੀ ਸ਼ਿਪਮੈਂਟ ਟ੍ਰੈਕ ਕਰੋ',
      'ਡ੍ਰੈਗਨ ਫਰੂਟ ਦਾ ਅੱਜ ਦਾ ਮੰਡੀ ਭਾਅ ਕੀ ਹੈ?',
      'ਅਖਰੋਟ ਦੀ ਖੇਤੀ ਤੇ 50% ਸਰਕਾਰੀ ਸਬਸਿਡੀ ਕਿਵੇਂ ਮਿਲੇਗੀ?',
      'ਟਰਾਂਸਪੋਰਟ ਖਰਚਾ 45% ਘੱਟ ਕਰਨ ਦਾ ਤਰੀਕਾ',
    ],
    or: [
      '🚛 ମୋର ପରିବହନ ଟ୍ରାକ୍ କରନ୍ତୁ',
      'ଡ୍ରାଗନ ଫଳର ଆଜିର ବଜାର ଦର କେତେ?',
      'ଅଖରୋଟ ଚାଷ ପାଇଁ ୫୦% ସରକାରୀ ସବସିଡି କିପରି ପାଇବେ?',
      'ପରିବହନ ଖର୍ଚ୍ଚ ୪୫% କମାଇବାର ଉପାୟ',
    ],
    as: [
      '🚛 মোৰ চালান ট্ৰেক কৰক',
      'ড্ৰেগন ফলৰ আজিৰ বজাৰ মূল্য কিমান?',
      'আখৰোট খেতিৰ বাবে ৫০% চৰকাৰী ৰেহাই কেনেকৈ পাব?',
      'পৰিবহন ব্যয় ৪৫% ৰেহাই কৰাৰ উপায়',
    ],
    ur: [
      '🚛 میری شپمنٹ ٹریک کریں',
      'ڈریگن فروٹ کی موجودہ منڈی قیمت کیا ہے؟',
      'اخروٹ کی کاشت پر 50% سرکاری سبسڈی کیسے حاصل کریں؟',
      'ٹرانسپورٹ کرایہ 45% کم کرنے کا طریقہ',
    ],
  };

  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="bg-[#1A221E] border border-[#2C3631] rounded-3xl w-full max-w-xl h-[92vh] max-h-[760px] flex flex-col shadow-2xl overflow-hidden text-[#E5E9E7] relative">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-[#151C18] border-b border-[#2C3631]">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#C2D66E]/15 border border-[#C2D66E]/40 text-[#C2D66E] flex items-center justify-center font-bold shadow-md relative">
                <AudioWaveform className="w-5 h-5 text-[#C2D66E]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-serif italic font-bold text-base sm:text-lg text-white">
                    {t.voiceTalk}
                  </h3>
                  <span className="bg-[#242C28] text-[#C2D66E] text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full border border-[#2C3631]">
                    Smart Voice AI
                  </span>
                </div>
                <p className="text-xs text-[#8E9B94]">
                  {activeLang === 'mr'
                    ? 'आपल्या भाषेत बोला • अचूक बाजारभाव व शेती मार्गदर्शन'
                    : activeLang === 'hi'
                    ? 'अपनी भाषा में बोलें • सटीक मंडी भाव व कृषि मार्गदर्शन'
                    : 'Speak in your language • Live mandi rates & farm advice'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Voice Commands Cheat Sheet Toggle Button */}
              <button
                onClick={() => {
                  if (isSpeakingAudio) handleStopAudio();
                  setIsCheatSheetOpen(!isCheatSheetOpen);
                }}
                className={`px-2.5 py-1.5 rounded-full border text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  isCheatSheetOpen
                    ? 'bg-[#C2D66E] text-[#0F1411] border-[#C2D66E] shadow-sm font-black'
                    : 'bg-[#242C28] text-[#C2D66E] border-[#2C3631] hover:border-[#C2D66E] hover:bg-[#2C3631]'
                }`}
                title="Voice Commands Cheat Sheet"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">
                  {activeLang === 'mr' ? 'आज्ञा (Cheat Sheet)' : activeLang === 'hi' ? 'कमांड्स (Cheat Sheet)' : 'Cheat Sheet'}
                </span>
              </button>

              {/* Voice auto-play sound toggle */}
              <button
                onClick={() => {
                  if (isSpeakingAudio) handleStopAudio();
                  setAutoPlayVoice(!autoPlayVoice);
                }}
                className={`p-2 rounded-full border transition-all ${
                  autoPlayVoice
                    ? 'bg-[#242C28] text-[#C2D66E] border-[#2C3631] hover:border-[#C2D66E]'
                    : 'bg-[#151C18] text-[#8E9B94] border-[#2C3631] hover:text-white'
                }`}
                title={autoPlayVoice ? 'Voice Audio Enabled (Click to Mute)' : 'Voice Audio Muted (Click to Unmute)'}
              >
                {autoPlayVoice ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </button>

              {isSpeakingAudio && (
                <button
                  onClick={handleStopAudio}
                  className="px-3 py-1.5 rounded-full bg-rose-950/80 text-rose-300 hover:bg-rose-900 border border-rose-700/50 flex items-center gap-1.5 text-xs font-bold transition-all animate-pulse"
                  title={t.stopAudio}
                >
                  <VolumeX className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{t.stopAudio}</span>
                </button>
              )}

              <button
                onClick={() => {
                  handleStopAudio();
                  if (isRecording) {
                    audioSpeech.stopListening();
                  }
                  onClose();
                }}
                className="p-2 rounded-full text-[#8E9B94] hover:text-white hover:bg-[#242C28] transition-colors cursor-pointer"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Direct Language Switcher Bar */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1">
            <span className="text-[10px] uppercase font-bold text-[#8E9B94] tracking-wider shrink-0 flex items-center gap-1 mr-1">
              <Languages className="w-3.5 h-3.5 text-[#C2D66E]" /> भाषा:
            </span>
            {languageOptions.map((lang) => {
              const isSelected = activeLang === lang.code;
              return (
                <button
                  key={lang.code}
                  onClick={() => changeLanguage(lang.code)}
                  className={`px-2.5 py-1 rounded-full text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${
                    isSelected
                      ? 'bg-[#C2D66E] text-[#0F1411] shadow-md scale-102 font-black'
                      : 'bg-[#242C28] text-[#8E9B94] hover:text-white hover:bg-[#2C3631]'
                  }`}
                >
                  <span
                    className={`w-4 h-4 rounded-full flex items-center justify-center font-bold text-[9px] shrink-0 ${
                      isSelected ? 'bg-[#0F1411] text-[#C2D66E]' : lang.symbolStyle
                    }`}
                  >
                    {lang.symbol}
                  </span>
                  <span>{lang.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Role-Based Small Collapsible Voice Tips Helper Card */}
        <VoiceTipsHelperCard
          userRole={userRole}
          activeLang={activeLang}
          onExecuteCommand={(phrase) => sendQuery(phrase)}
          onPlayPronunciation={(phrase) => handleSpeak(phrase, activeLang)}
          onOpenListProduce={onOpenListProduce}
          onOpenAddDemand={onOpenAddDemand}
          onOpenWeatherModal={onOpenWeatherModal}
          onNavigateTab={onNavigateTab}
          onClose={onClose}
        />

        {/* Live Audio Visualizer Banner during active speech recognition */}
        {isRecording && (
          <div className="bg-gradient-to-r from-emerald-950 via-[#151C18] to-emerald-950 border-b border-[#C2D66E]/40 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2.5 text-xs font-bold text-[#C2D66E]">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
              </span>
              <div>
                <p className="text-white font-semibold text-xs sm:text-sm">
                  {activeLang === 'mr'
                    ? 'आवाज ऐकत आहे... बोला'
                    : activeLang === 'hi'
                    ? 'आवाज सुन रहा है... बोलिए'
                    : 'Listening... speak clearly'}
                </p>
                <p className="text-[11px] text-[#8E9B94] font-normal">
                  {activeLang === 'mr'
                    ? 'बोलून झाल्यावर पुन्हा माईक दाबा किंवा पाठवा'
                    : activeLang === 'hi'
                    ? 'बोलने के बाद फिर से माइक दबाएं या भेजें'
                    : 'Tap mic again when done to send query'}
                </p>
              </div>
            </div>

            {/* Dynamic Sound Wave Level Bars */}
            <div className="flex items-center gap-1 h-6 px-2 bg-black/30 rounded-lg border border-[#2C3631]">
              <span
                className="w-1 bg-[#C2D66E] rounded-full transition-all duration-75"
                style={{ height: `${Math.max(6, audioLevel * 0.4 + 4)}px` }}
              ></span>
              <span
                className="w-1 bg-[#D4E4BC] rounded-full transition-all duration-75"
                style={{ height: `${Math.max(8, audioLevel * 0.7 + 6)}px` }}
              ></span>
              <span
                className="w-1 bg-[#C2D66E] rounded-full transition-all duration-75"
                style={{ height: `${Math.max(14, audioLevel * 1.0 + 8)}px` }}
              ></span>
              <span
                className="w-1 bg-[#D4E4BC] rounded-full transition-all duration-75"
                style={{ height: `${Math.max(8, audioLevel * 0.7 + 6)}px` }}
              ></span>
              <span
                className="w-1 bg-[#C2D66E] rounded-full transition-all duration-75"
                style={{ height: `${Math.max(6, audioLevel * 0.4 + 4)}px` }}
              ></span>
            </div>
          </div>
        )}

        {/* Live Audio Visualizer Banner when speaking aloud */}
        {isSpeakingAudio && !isRecording && (
          <div className="bg-[#151C18] border-b border-[#2C3631] px-4 py-2.5 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-[#C2D66E] font-medium">
              <Volume2 className="w-4 h-4 text-[#C2D66E] animate-bounce" />
              <span>{t.listenAudio}...</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-4 bg-[#C2D66E] rounded-full animate-pulse"></span>
                <span className="w-1.5 h-6 bg-[#D4E4BC] rounded-full animate-pulse delay-75"></span>
                <span className="w-1.5 h-3 bg-[#C2D66E] rounded-full animate-pulse delay-150"></span>
                <span className="w-1.5 h-5 bg-[#D4E4BC] rounded-full animate-pulse delay-100"></span>
              </div>
              <button
                onClick={handleStopAudio}
                className="text-[11px] px-2 py-0.5 rounded bg-[#242C28] text-[#8E9B94] hover:text-white"
              >
                {t.stopAudio}
              </button>
            </div>
          </div>
        )}

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar bg-[#0F1411]/50">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[92%] sm:max-w-[85%] rounded-3xl p-4 text-sm shadow-md ${
                  msg.sender === 'user'
                    ? 'bg-[#C2D66E] text-[#0F1411] font-medium rounded-br-none'
                    : 'bg-[#242C28] border border-[#2C3631] text-[#E5E9E7] rounded-bl-none'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 ${
                      msg.sender === 'user' ? 'text-[#0F1411]/70' : 'text-[#8E9B94]'
                    }`}
                  >
                    {msg.sender === 'user' ? (
                      <>
                        <User className="w-3 h-3 text-[#0F1411]" /> {t.farmer}
                      </>
                    ) : (
                      <>
                        <Bot className="w-3 h-3 text-[#C2D66E]" /> Kisan AI
                      </>
                    )}
                  </span>
                  <span className={`text-[10px] ${msg.sender === 'user' ? 'text-[#0F1411]/60' : 'text-[#8E9B94]'}`}>
                    {msg.timestamp}
                  </span>
                </div>

                <p className="leading-relaxed whitespace-pre-line text-sm sm:text-base">{msg.text}</p>

                {/* Interactive Real-Time Live Shipment Tracking Card */}
                {msg.shipmentsData && msg.shipmentsData.length > 0 && (
                  <ShipmentTrackingCard
                    shipments={msg.shipmentsData}
                    activeLang={activeLang}
                    onOpenLogistics={() => {
                      handleStopAudio();
                      onClose();
                      onNavigateTab('logistics');
                    }}
                  />
                )}

                {/* Read aloud button for bot message */}
                {msg.sender === 'assistant' && msg.spokenAudioText && (
                  <div className="mt-3 pt-2.5 border-t border-[#2C3631] flex items-center justify-between">
                    <button
                      onClick={() => handleSpeak(msg.spokenAudioText || msg.text, activeLang, msg.id)}
                      className={`inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-full border transition-all cursor-pointer ${
                        isSpeakingAudio && playingMessageId === msg.id
                          ? 'bg-[#C2D66E] text-[#0F1411] border-[#C2D66E] animate-pulse'
                          : 'bg-[#151C18] text-[#C2D66E] border-[#2C3631] hover:border-[#C2D66E] hover:text-[#D4E4BC]'
                      }`}
                    >
                      {isSpeakingAudio && playingMessageId === msg.id ? (
                        <>
                          <VolumeX className="w-3.5 h-3.5" />
                          <span>{t.stopAudio}</span>
                        </>
                      ) : (
                        <>
                          <Volume2 className="w-3.5 h-3.5" />
                          <span>{t.listenAudio}</span>
                        </>
                      )}
                    </button>
                  </div>
                )}

                {/* Suggested Action Pills */}
                {msg.suggestedActions && msg.suggestedActions.length > 0 && (
                  <div className="mt-3 space-y-2 pt-2.5 border-t border-[#2C3631]">
                    <div className="text-[10px] uppercase tracking-wider text-[#8E9B94] font-semibold">
                      {activeLang === 'mr'
                        ? '💡 पुढील कृती (Quick Actions):'
                        : activeLang === 'hi'
                        ? '💡 त्वरित कार्य (Quick Actions):'
                        : '💡 Recommended Actions:'}
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {msg.suggestedActions.map((act, i) => (
                        <button
                          key={i}
                          onClick={() => handleActionClick(act)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#1A221E] hover:bg-[#C2D66E] hover:text-[#0F1411] border border-[#2C3631] text-[#D4E4BC] text-xs font-semibold transition-all hover:scale-102 cursor-pointer"
                        >
                          <span>{act.label}</span>
                          <ArrowRight className="w-3 h-3 text-[#C2D66E]" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex items-start">
              <div className="bg-[#242C28] border border-[#2C3631] rounded-2xl rounded-bl-none p-3.5 text-xs text-[#8E9B94] flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#C2D66E] animate-spin" />
                <span>
                  {activeLang === 'mr'
                    ? 'किसान AI माहिती तपासत आहे...'
                    : activeLang === 'hi'
                    ? 'किसान AI जानकारी तैयार कर रहा है...'
                    : 'Kisan AI is analyzing agricultural intelligence...'}
                </span>
              </div>
            </div>
          )}

          <div ref={chatBottomRef} />
        </div>

        {/* Quick Suggestion Chips */}
        <div className="px-3 py-2 bg-[#151C18] border-t border-[#2C3631] overflow-x-auto no-scrollbar flex items-center gap-2">
          {/* Quick Voice Cheat Sheet Access Chip */}
          <button
            onClick={() => setIsCheatSheetOpen(true)}
            className="px-3 py-1 rounded-full bg-[#C2D66E]/20 hover:bg-[#C2D66E] hover:text-[#0F1411] border border-[#C2D66E]/40 text-[#C2D66E] text-xs whitespace-nowrap transition-all font-bold flex items-center gap-1.5 cursor-pointer shrink-0"
            title="Open Voice Commands Cheat Sheet"
          >
            <BookOpen className="w-3 h-3" />
            <span>
              {activeLang === 'mr'
                ? '📖 सर्व आवाज आज्ञा (Cheat Sheet)'
                : activeLang === 'hi'
                ? '📖 सभी वॉयस कमांड्स (Cheat Sheet)'
                : '📖 Voice Cheat Sheet'}
            </span>
          </button>

          <span className="text-[10px] uppercase tracking-wider text-[#8E9B94] whitespace-nowrap font-bold">
            {activeLang === 'mr' ? 'उदा.' : activeLang === 'hi' ? 'उदा.' : 'Suggestions:'}
          </span>
          {(quickPrompts[activeLang] || quickPrompts.mr).map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => sendQuery(prompt)}
              className="px-3 py-1 rounded-full bg-[#242C28] hover:bg-[#C2D66E] hover:text-[#0F1411] border border-[#2C3631] text-[#8E9B94] hover:text-[#0F1411] text-xs whitespace-nowrap transition-colors cursor-pointer shrink-0"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Mic Notice if any */}
        {micError && (
          <div className="px-4 py-2 bg-rose-950/80 border-t border-rose-800 text-xs text-rose-200 flex items-center justify-between">
            <span>{micError}</span>
            <button onClick={() => setMicError(null)} className="underline font-bold text-white ml-2 cursor-pointer">
              Dismiss
            </button>
          </div>
        )}

        {/* Input Bar with Voice Record & Send Controls */}
        <div className="p-3 sm:p-4 bg-[#151C18] border-t border-[#2C3631] flex items-center gap-2.5">
          {/* Main Voice Mic Button: Tap to start / Tap to send */}
          <button
            id="voice-mic-record-btn"
            onClick={toggleRecording}
            className={`p-3.5 rounded-2xl transition-all shadow-md flex items-center justify-center relative cursor-pointer ${
              isRecording
                ? 'bg-rose-600 text-white animate-pulse ring-4 ring-rose-500/40 hover:bg-rose-700'
                : 'bg-[#C2D66E] text-[#0F1411] hover:bg-[#D4E4BC] active:scale-95 font-bold'
            }`}
            title={
              isRecording
                ? activeLang === 'mr'
                  ? 'बोलणे संपवा व पाठवा (Finish & Send)'
                  : activeLang === 'hi'
                  ? 'बोलना समाप्त करें और भेजें (Finish & Send)'
                  : 'Tap to Finish & Send'
                : t.tapToSpeak
            }
          >
            {isRecording ? <Square className="w-5 h-5 fill-current" /> : <Mic className="w-5 h-5" />}
          </button>

          {/* Input text field */}
          <div className="flex-1 relative">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  sendQuery(inputText);
                }
              }}
              placeholder={
                isRecording
                  ? activeLang === 'mr'
                    ? 'आवाज ऐकत आहे... बोला...'
                    : activeLang === 'hi'
                    ? 'आवाज सुन रहा है... बोलिए...'
                    : 'Listening... speak now...'
                  : t.askKisanPrompt
              }
              className={`w-full bg-[#1A221E] border rounded-2xl px-4 py-2.5 text-sm text-[#E5E9E7] placeholder:text-[#8E9B94] outline-none pr-16 transition-all ${
                isRecording ? 'border-[#C2D66E] ring-2 ring-[#C2D66E]/20' : 'border-[#2C3631] focus:border-[#C2D66E]'
              }`}
            />

            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
              {/* Cancel button if recording or text present */}
              {(isRecording || inputText.trim()) && (
                <button
                  onClick={isRecording ? cancelRecording : () => setInputText('')}
                  className="p-1.5 hover:bg-[#2C3631] text-[#8E9B94] hover:text-white rounded-xl transition-all cursor-pointer"
                  title="Clear"
                >
                  <X className="w-4 h-4" />
                </button>
              )}

              {/* Send button */}
              {inputText.trim() && (
                <button
                  onClick={() => sendQuery(inputText)}
                  className="p-2 bg-[#C2D66E] text-[#0F1411] hover:bg-[#D4E4BC] rounded-xl transition-all font-bold cursor-pointer"
                  title="Send"
                >
                  <Send className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Interactive Voice Command Cheat Sheet Overlay */}
        <VoiceCommandCheatSheet
          isOpen={isCheatSheetOpen}
          onClose={() => setIsCheatSheetOpen(false)}
          currentLanguage={activeLang}
          onExecuteCommand={handleExecuteCheatSheetCommand}
          onPlayPronunciation={handlePlayPronunciation}
          isSpeakingAudio={isSpeakingAudio}
        />
      </div>
    </div>
  );
};
