import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  AlertTriangle,
  TrendingUp,
  Clock,
  Sparkles,
  ShieldAlert,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Tag,
  Truck,
  Store,
  Volume2,
  VolumeX,
  X,
  ArrowRight,
  BadgePercent,
  Bell,
  Check,
  Calendar,
  Layers,
  MapPin,
  ExternalLink,
  Flame,
  Zap,
} from 'lucide-react';
import { StockAlert, LanguageCode, ProduceListing, BulkBuyerProfile } from '../types';
import { translations } from '../utils/translations';
import { audioSpeech } from '../utils/audioSpeech';

interface StockAlertNotificationCenterProps {
  alerts: StockAlert[];
  currentLanguage: LanguageCode;
  onApplyDiscount: (listingId: string, percent: number) => void;
  onMarkSold: (listingId: string) => void;
  onNavigateTab: (tab: string, contextId?: string) => void;
  onSelectListingForBid?: (listing: ProduceListing) => void;
  listings: ProduceListing[];
  bulkBuyers: BulkBuyerProfile[];
  onDismissAlert?: (alertId: string) => void;
}

export const StockAlertNotificationCenter: React.FC<StockAlertNotificationCenterProps> = ({
  alerts,
  currentLanguage,
  onApplyDiscount,
  onMarkSold,
  onNavigateTab,
  onSelectListingForBid,
  listings,
  bulkBuyers,
  onDismissAlert,
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  const [activeFilter, setActiveFilter] = useState<'all' | 'peak'>('all');
  const [speakingAlertId, setSpeakingAlertId] = useState<string | null>(null);
  const [dismissedAlertIds, setDismissedAlertIds] = useState<Set<string>>(new Set());
  const [appliedDiscounts, setAppliedDiscounts] = useState<Record<string, number>>({});

  const t = translations[currentLanguage];

  // Filter out dismissed alerts
  const visibleAlerts = alerts.filter(
    (a) => !dismissedAlertIds.has(a.id) && (!a.isDismissed)
  );

  const filteredAlerts = visibleAlerts.filter((a) => {
    if (activeFilter === 'peak') {
      return a.type === 'PEAK_DEMAND_WINDOW' || a.type === 'OPTIMAL_HARVEST_DISPATCH';
    }
    return true;
  });

  const peakCount = visibleAlerts.filter((a) => a.type === 'PEAK_DEMAND_WINDOW').length;

  if (visibleAlerts.length === 0) {
    return null;
  }

  const handleDismiss = (alertId: string) => {
    setDismissedAlertIds((prev) => new Set([...prev, alertId]));
    if (onDismissAlert) {
      onDismissAlert(alertId);
    }
  };

  const handlePlayVoiceAlert = (alert: StockAlert) => {
    if (speakingAlertId === alert.id) {
      audioSpeech.stop();
      setSpeakingAlertId(null);
      return;
    }

    const titleText = alert.title[currentLanguage] || alert.title.en;
    const msgText = alert.message[currentLanguage] || alert.message.en;
    const recText = alert.recommendation[currentLanguage] || alert.recommendation.en;
    const speechText = `${titleText}. ${msgText}. ${recText}`;

    setSpeakingAlertId(alert.id);
    audioSpeech.speak(speechText, currentLanguage, () => {
      setSpeakingAlertId(null);
    });
  };

  const handleApplyDiscountAction = (alert: StockAlert, percent: number) => {
    onApplyDiscount(alert.listingId, percent);
    setAppliedDiscounts((prev) => ({ ...prev, [alert.listingId]: percent }));
  };

  const handleDirectBuyerMatch = (alert: StockAlert) => {
    if (alert.bestBuyerMatch) {
      onNavigateTab('orders', alert.bestBuyerMatch.id);
    } else {
      onNavigateTab('marketplace');
    }
  };

  return (
    <div className="mb-6 rounded-3xl bg-gradient-to-br from-[#18231C] via-[#141B17] to-[#121A15] border border-[#2C3631] shadow-2xl overflow-hidden text-[#E5E9E7] transition-all">
      {/* Header Banner */}
      <div className="px-4 sm:px-6 py-3.5 sm:py-4 bg-[#1C2820]/90 border-b border-[#2C3631] flex flex-wrap items-center justify-between gap-3 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-2xl bg-[#C2D66E]/20 text-[#C2D66E] border border-[#C2D66E]/40 flex items-center justify-center shadow-inner font-black shrink-0">
              <Bell className="w-5 h-5 animate-bounce" />
            </div>
            {peakCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#C2D66E] text-[#0F1411] rounded-full text-[10px] font-black flex items-center justify-center animate-ping" />
            )}
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-extrabold text-base sm:text-lg text-[#E5E9E7] tracking-tight font-serif">
                {currentLanguage === 'mr'
                  ? 'शेतमाल पीक मागणी व थेट खरेदीदार सूचना केंद्र'
                  : currentLanguage === 'hi'
                  ? 'फसल मांग व खरीदार अलर्ट केंद्र'
                  : 'Peak Market Demand & Buyer Matching Alerts'}
              </h3>
              <span className="bg-[#C2D66E] text-[#0F1411] font-black text-[10px] uppercase px-2.5 py-0.5 rounded-full tracking-wider shadow-sm flex items-center gap-1">
                <Zap className="w-3 h-3 fill-current" />
                {visibleAlerts.length} {currentLanguage === 'mr' ? 'सक्रिय सूचना' : 'Active Alerts'}
              </span>
            </div>
            <p className="text-xs text-[#8E9B94] mt-0.5">
              {currentLanguage === 'mr'
                ? 'थेट सुपरमार्ट खरेदीदार आणि कॉर्पोरेट मागणीवर आधारित भाव वाढ सूचना'
                : currentLanguage === 'hi'
                ? 'सीधे सुपरमार्ट खरीदारों और कॉर्पोरेट मांग पर आधारित प्रीमियम मूल्य अलर्ट'
                : 'Real-time surge demand and verified bulk buyer procurement opportunities'}
            </p>
          </div>
        </div>

        {/* Right Toggle & Filter Pills */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="hidden sm:flex items-center bg-[#0F1411] p-1 rounded-xl border border-[#2C3631] text-xs">
            <button
              type="button"
              onClick={() => setActiveFilter('all')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                activeFilter === 'all' ? 'bg-[#C2D66E] text-[#0F1411]' : 'text-[#8E9B94] hover:text-[#E5E9E7]'
              }`}
            >
              {currentLanguage === 'mr' ? 'सर्व' : 'All'} ({visibleAlerts.length})
            </button>
            {peakCount > 0 && (
              <button
                type="button"
                onClick={() => setActiveFilter('peak')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1 ${
                  activeFilter === 'peak' ? 'bg-amber-400 text-[#0F1411]' : 'text-amber-300 hover:text-amber-200'
                }`}
              >
                <span>📈 {currentLanguage === 'mr' ? 'पीक मागणी' : 'Peak Demand'}</span>
                <span>({peakCount})</span>
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="px-3 py-1.5 bg-[#121A15] hover:bg-[#202B25] border border-[#2C3631] rounded-xl text-xs font-bold text-[#E5E9E7] flex items-center gap-1.5 transition-all cursor-pointer shadow-inner"
          >
            <span>{isExpanded ? (currentLanguage === 'mr' ? 'लपवा' : 'Collapse') : (currentLanguage === 'mr' ? 'उघडा' : 'Expand')}</span>
            {isExpanded ? <ChevronUp className="w-4 h-4 text-[#C2D66E]" /> : <ChevronDown className="w-4 h-4 text-[#C2D66E]" />}
          </button>
        </div>
      </div>

      {/* Collapsible Alerts List */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="p-4 sm:p-6 space-y-4"
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {filteredAlerts.map((alert) => {
                const isSpeaking = speakingAlertId === alert.id;
                const hasDiscount = appliedDiscounts[alert.listingId];

                return (
                  <motion.div
                    key={alert.id}
                    layout
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="rounded-2xl border p-4 sm:p-5 flex flex-col justify-between relative overflow-hidden transition-all shadow-lg bg-[#18231C]/90 border-[#C2D66E]/50 shadow-[#C2D66E]/10"
                  >
                    {/* Top Alert Category Banner */}
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full bg-[#C2D66E]/20 border border-[#C2D66E]/40 text-[#C2D66E] font-black text-[10px] uppercase tracking-wider flex items-center gap-1">
                          <TrendingUp className="w-3 h-3" />
                          {currentLanguage === 'mr' ? 'पीक मागणी विंडो (+ भाव वाढ)' : 'Peak Demand Window'}
                        </span>

                        <span className="text-[11px] font-mono text-[#8E9B94] flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {currentLanguage === 'mr' ? 'कापणी:' : 'Harvest:'} {alert.harvestDate}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {/* Audio voice playback */}
                        <button
                          type="button"
                          onClick={() => handlePlayVoiceAlert(alert)}
                          className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                            isSpeaking
                              ? 'bg-[#C2D66E] text-[#0F1411] border-[#C2D66E]'
                              : 'bg-[#121A15] text-[#8E9B94] hover:text-[#E5E9E7] border-[#2C3631]'
                          }`}
                          title="Listen to voice notification / आवाज ऐका"
                        >
                          {isSpeaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                        </button>

                        {/* Dismiss */}
                        <button
                          type="button"
                          onClick={() => handleDismiss(alert.id)}
                          className="p-1.5 rounded-lg bg-[#121A15] hover:bg-[#202B25] text-[#8E9B94] hover:text-[#E5E9E7] border border-[#2C3631] transition-colors cursor-pointer"
                          title="Dismiss notification / सूचना बंद करा"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Alert Title & Message */}
                    <div className="space-y-1.5 mb-3.5">
                      <h4 className="font-extrabold text-sm sm:text-base text-[#E5E9E7] leading-snug">
                        {alert.title[currentLanguage] || alert.title.en}
                      </h4>
                      <p className="text-xs text-[#CBD5D0] leading-relaxed">
                        {alert.message[currentLanguage] || alert.message.en}
                      </p>
                    </div>

                    {/* Matched Bulk Mart Demand Snapshot (If Peak Window or Available) */}
                    {alert.bestBuyerMatch && (
                      <div className="mb-3.5 p-3 rounded-xl bg-[#121E17] border border-[#2B4232] flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-8 h-8 rounded-lg bg-emerald-400/20 text-emerald-300 flex items-center justify-center font-bold text-sm shrink-0">
                            🏬
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-xs text-[#E5E9E7] truncate">
                                {alert.bestBuyerMatch.companyName}
                              </span>
                              <span className="bg-emerald-400/20 text-emerald-300 text-[9px] font-black px-1.5 py-0.2 rounded">
                                High Bid
                              </span>
                            </div>
                            <p className="text-[10px] text-[#8E9B94] truncate">
                              📍 {alert.bestBuyerMatch.deliveryLocation} • {alert.bestBuyerMatch.neededQtyTons} T {currentLanguage === 'mr' ? 'मागणी' : 'Demand'}
                            </p>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <div className="text-xs font-mono font-black text-[#C2D66E]">
                            ₹{alert.bestBuyerMatch.offeredPricePerKg}/kg
                          </div>
                          <button
                            type="button"
                            onClick={() => handleDirectBuyerMatch(alert)}
                            className="text-[10px] text-[#C2D66E] hover:underline font-bold flex items-center gap-0.5 mt-0.5 cursor-pointer"
                          >
                            <span>{currentLanguage === 'mr' ? 'थेट विका' : 'Sell Now'}</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    )}

                    {/* AI Smart Recommendation Tip */}
                    <div className="p-2.5 rounded-xl bg-[#0F1411]/80 border border-[#2C3631] text-[11px] text-[#D4E4BC] mb-3.5 leading-relaxed">
                      {alert.recommendation[currentLanguage] || alert.recommendation.en}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-[#2C3631]/80">
                      {/* Action 1: Peak Buyer Match */}
                      {alert.bestBuyerMatch && (
                        <button
                          type="button"
                          onClick={() => handleDirectBuyerMatch(alert)}
                          className="px-3 py-1.5 rounded-xl bg-[#C2D66E] hover:bg-[#D4E4BC] text-[#0F1411] font-black text-xs transition-all cursor-pointer flex items-center gap-1.5 shadow-md shadow-[#C2D66E]/20"
                        >
                          <Store className="w-3.5 h-3.5" />
                          <span>
                            {currentLanguage === 'mr'
                              ? `₹${alert.bestBuyerMatch.offeredPricePerKg}/किलोने थेट विका`
                              : `Sell at ₹${alert.bestBuyerMatch.offeredPricePerKg}/kg Now`}
                          </span>
                        </button>
                      )}

                      {/* Action 3: Book Reefer Cold Transport */}
                      <button
                        type="button"
                        onClick={() => onNavigateTab('logistics')}
                        className="px-3 py-1.5 rounded-xl bg-[#141B17] hover:bg-[#202B25] text-[#8E9B94] hover:text-[#E5E9E7] border border-[#2C3631] font-bold text-xs transition-colors cursor-pointer flex items-center gap-1.5"
                      >
                        <Truck className="w-3.5 h-3.5 text-[#C2D66E]" />
                        <span>{currentLanguage === 'mr' ? 'कोल्ड ट्रक शोधा' : 'Reefer Cold Chain'}</span>
                      </button>

                      {/* Action 4: Mark Sold */}
                      <button
                        type="button"
                        onClick={() => onMarkSold(alert.listingId)}
                        className="px-3 py-1.5 rounded-xl bg-[#141B17] hover:bg-[#202B25] text-[#8E9B94] hover:text-emerald-300 border border-[#2C3631] font-bold text-xs transition-colors cursor-pointer flex items-center gap-1.5 ml-auto"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>{currentLanguage === 'mr' ? 'विक्री झाली' : 'Mark Sold'}</span>
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
