import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sprout,
  AudioWaveform,
  Languages,
  UserCheck,
  ShieldCheck,
  ChevronDown,
  Check,
  CloudLightning,
  Sparkles,
  Building2,
  LogIn,
  LogOut,
  User,
  Store,
  MapPin,
  FileBadge,
  Mail,
  Edit3,
  Compass,
  Bell,
  AlertTriangle,
  TrendingUp,
  Clock,
  ArrowRight,
  Zap,
  Volume2,
  VolumeX,
  Tag,
  X,
} from 'lucide-react';
import { AuthRole, LanguageCode, UserProfile, UserRole, StockAlert } from '../types';
import { translations, ALL_INDIAN_LANGUAGES } from '../utils/translations';
import { GoogleLogoIcon } from './GoogleIcons';
import { audioSpeech } from '../utils/audioSpeech';

interface NavbarProps {
  currentLanguage: LanguageCode;
  onLanguageChange: (lang: LanguageCode) => void;
  userRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  onOpenVoiceModal: () => void;
  ordersCount: number;
  onNavigateTab: (tab: string, contextId?: string) => void;
  activeTab: string;
  weatherAlertsCount?: number;
  onOpenWeatherRadar?: () => void;
  stockAlertsCount?: number;
  stockAlerts?: StockAlert[];
  onOpenStockAlerts?: () => void;
  onApplyDiscount?: (listingId: string, percent: number) => void;
  onDismissStockAlert?: (alertId: string) => void;
  currentUser?: UserProfile | null;
  onOpenLoginModal?: (role?: AuthRole) => void;
  onOpenProfileEdit?: () => void;
  onLogout?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentLanguage,
  onLanguageChange,
  userRole,
  onRoleChange,
  onOpenVoiceModal,
  ordersCount,
  onNavigateTab,
  activeTab,
  weatherAlertsCount = 0,
  onOpenWeatherRadar,
  stockAlertsCount = 0,
  stockAlerts = [],
  onOpenStockAlerts,
  onApplyDiscount,
  onDismissStockAlert,
  currentUser = null,
  onOpenLoginModal,
  onOpenProfileEdit,
  onLogout,
}) => {
  const t = translations[currentLanguage];

  const [isRoleOpen, setIsRoleOpen] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isAlertsOpen, setIsAlertsOpen] = useState(false);
  const [speakingAlertId, setSpeakingAlertId] = useState<string | null>(null);

  const roleRef = useRef<HTMLDivElement>(null);
  const langRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const alertsRef = useRef<HTMLDivElement>(null);

  const activeStockAlerts = stockAlerts.filter((a) => !a.isDismissed);
  const activeAlertsCount = stockAlertsCount || activeStockAlerts.length;
  const criticalAlertsCount = activeStockAlerts.filter((a) => a.type === 'CRITICAL_EXPIRY').length;
  const peakAlertsCount = activeStockAlerts.filter((a) => a.type === 'PEAK_DEMAND_WINDOW').length;

  const handleAlertVoicePlay = (alert: StockAlert) => {
    if (speakingAlertId === alert.id) {
      audioSpeech.stop();
      setSpeakingAlertId(null);
      return;
    }
    const text = `${alert.title[currentLanguage] || alert.title.en}. ${alert.message[currentLanguage] || alert.message.en}`;
    setSpeakingAlertId(alert.id);
    audioSpeech.speak(text, currentLanguage, () => setSpeakingAlertId(null));
  };

  const languages = ALL_INDIAN_LANGUAGES;

  const roles: {
    code: UserRole;
    label: string;
    icon: React.ReactNode;
    desc: string;
  }[] = [
    {
      code: 'farmer',
      label: t.farmer,
      icon: <span className="text-sm sm:text-base leading-none">🌾</span>,
      desc: currentLanguage === 'mr' ? 'शेतमाल विक्री व भाव अंदाज' : currentLanguage === 'hi' ? 'फसल बिक्री व भाव' : 'Sell Harvest & View Forecast',
    },
    {
      code: 'fpo',
      label: t.fpo,
      icon: (
        <span className="w-5 h-5 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center justify-center text-xs shrink-0 shadow-sm">
          <Building2 className="w-3 h-3 text-emerald-300" />
        </span>
      ),
      desc: currentLanguage === 'mr' ? 'शेतकरी गट व मोठी वाहतूक' : currentLanguage === 'hi' ? 'समूह व फ्रेट सॉफ्टवेयर' : 'Aggregated Lots & Logistics',
    },
    {
      code: 'bulk_buyer',
      label: t.bulkBuyer,
      icon: <span className="text-sm sm:text-base leading-none"><Store className="w-6 h-6" /></span>,
      desc: currentLanguage === 'mr' ? 'थोक खरेदी व थेट बोली' : currentLanguage === 'hi' ? 'थोक खरीद व बोली' : 'B2B Bulk Procurement & Bids',
    },
    {
      code: 'retail_consumer',
      label: t.consumer,
      icon: <span className="text-sm sm:text-base leading-none">🥗</span>,
      desc: currentLanguage === 'mr' ? 'सेंद्रिय व शेतातून ताजी खरेदी' : currentLanguage === 'hi' ? 'फार्म फ्रेश सीधी खरीद' : 'Farm-Fresh Direct Purchase',
    },
  ];

  // Close dropdowns on outside click or escape key
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (roleRef.current && !roleRef.current.contains(event.target as Node)) {
        setIsRoleOpen(false);
      }
      if (langRef.current && !langRef.current.contains(event.target as Node)) {
        setIsLangOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
      if (alertsRef.current && !alertsRef.current.contains(event.target as Node)) {
        setIsAlertsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsRoleOpen(false);
        setIsLangOpen(false);
        setIsUserMenuOpen(false);
        setIsAlertsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleSelectRole = (role: UserRole) => {
    onRoleChange(role);
    setIsRoleOpen(false);
  };

  const handleSelectLanguage = (lang: LanguageCode) => {
    onLanguageChange(lang);
    setIsLangOpen(false);
  };

  const currentRoleObj = roles.find((r) => r.code === userRole) || roles[0];
  const currentLangObj = languages.find((l) => l.code === currentLanguage) || languages[0];

  return (
    <header className="bg-[#0F1411]/95 backdrop-blur-md text-[#E5E9E7] sticky top-0 z-40 border-b border-[#2C3631]">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between gap-2">
        {/* Brand & Identity */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <div className="flex items-center gap-1.5 sm:gap-3 cursor-pointer select-none shrink-0" onClick={() => onNavigateTab('marketplace')}>
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-[#1A221E] border border-[#2C3631] flex items-center justify-center shadow-inner text-[#C2D66E] font-bold shrink-0">
              <Sprout className="w-5 h-5 sm:w-6 sm:h-6 text-[#C2D66E]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="font-serif italic font-bold text-lg sm:text-2xl tracking-tight text-[#D4E4BC]">
                  {t.appName}
                </span>
                <span className="bg-[#C2D66E]/15 text-[#C2D66E] border border-[#C2D66E]/30 text-[8px] sm:text-[9px] font-bold px-1.5 sm:px-2 py-0.5 rounded-full uppercase tracking-widest hidden xs:inline">
                  Yield Direct
                </span>
              </div>
              <p className="text-[10px] sm:text-xs uppercase tracking-[0.18em] text-[#8E9B94] line-clamp-1 hidden sm:block font-medium">
                {t.tagline}
              </p>
            </div>
          </div>
        </div>

        {/* Right Action Tools */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0 pr-0 sm:pr-1">
          {/* Role Switcher Pill ("भूमिका बदला") */}
          <div className="relative shrink-0" ref={roleRef}>
            <button
              id="role-switcher-btn"
              type="button"
              onClick={() => {
                setIsRoleOpen(!isRoleOpen);
                setIsLangOpen(false);
                setIsUserMenuOpen(false);
              }}
              className={`flex items-center gap-1 sm:gap-2 bg-[#1A221E] hover:bg-[#242C28] border ${
                isRoleOpen ? 'border-[#C2D66E] ring-1 ring-[#C2D66E]/40' : 'border-[#2C3631]'
              } rounded-full px-1.5 sm:px-3 py-1 sm:py-1.5 text-xs text-[#E5E9E7] transition-all cursor-pointer shrink-0`}
              title={`${t.switchRole}: ${currentRoleObj.label}`}
              aria-expanded={isRoleOpen}
            >
              <span className="text-[13px] sm:text-base leading-none">{currentRoleObj.icon}</span>
              <span className="hidden sm:inline font-semibold text-[11px] sm:text-xs max-w-[80px] sm:max-w-[110px] truncate text-[#D4E4BC]">
                {currentRoleObj.label}
              </span>
              <ChevronDown className={`w-3 h-3 text-[#8E9B94] transition-transform duration-200 ${isRoleOpen ? 'rotate-180 text-[#C2D66E]' : ''}`} />
            </button>

            {/* Role Dropdown Menu */}
            <AnimatePresence>
              {isRoleOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 10 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-2 w-64 sm:w-72 bg-[#1A221E] border border-[#2C3631] rounded-2xl shadow-2xl p-2 z-50 backdrop-blur-xl"
                >
                  <div className="flex items-center justify-between px-2.5 py-1.5 border-b border-[#2C3631] mb-1">
                    <span className="text-[10px] uppercase tracking-widest font-bold text-[#8E9B94]">
                      {t.switchRole} ({t.currentRole})
                    </span>
                    <span className="text-[10px] text-[#C2D66E] font-medium bg-[#C2D66E]/10 px-2 py-0.5 rounded-full">
                      {currentRoleObj.label}
                    </span>
                  </div>

                  <div className="space-y-1">
                    {roles.map((r) => {
                      const isSelected = userRole === r.code;
                      return (
                        <button
                          key={r.code}
                          id={`role-option-${r.code}`}
                          type="button"
                          onClick={() => handleSelectRole(r.code)}
                          className={`w-full flex items-start gap-2.5 px-3 py-2 rounded-xl text-xs text-left transition-all ${
                            isSelected
                              ? 'bg-[#C2D66E] text-[#0F1411] font-bold shadow-sm'
                              : 'text-[#E5E9E7] hover:bg-[#242C28]'
                          }`}
                        >
                          <span className="text-base shrink-0 mt-0.5">{r.icon}</span>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1">
                              <span className="font-bold truncate">{r.label}</span>
                              {isSelected && <Check className="w-3.5 h-3.5 text-[#0F1411] shrink-0" />}
                            </div>
                            <p className={`text-[10px] mt-0.5 truncate ${isSelected ? 'text-[#0F1411]/80 font-medium' : 'text-[#8E9B94]'}`}>
                              {r.desc}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Automated Stock Expiry & Peak Demand Notification Bell */}
          <div className="relative shrink-0" ref={alertsRef}>
            <motion.button
              id="stock-alerts-notification-bell-btn"
              type="button"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setIsAlertsOpen(!isAlertsOpen);
                setIsRoleOpen(false);
                setIsLangOpen(false);
                setIsUserMenuOpen(false);
              }}
              className={`relative flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#1A221E] hover:bg-[#242C28] border ${
                isAlertsOpen ? 'border-[#C2D66E] ring-1 ring-[#C2D66E]/40' : 'border-[#2C3631]'
              } text-[#E5E9E7] transition-all cursor-pointer shadow-sm`}
              title={
                currentLanguage === 'mr'
                  ? 'शेतमाल साठा मुदत व पीक मागणी सूचना'
                  : currentLanguage === 'hi'
                  ? 'स्टॉक समाप्ति व पीक मांग अलर्ट'
                  : 'Automated Stock Expiry & Peak Demand Alerts'
              }
              aria-label="Stock Alerts"
              aria-expanded={isAlertsOpen}
            >
              <Bell className="w-4 h-4 text-[#C2D66E]" />
              {activeAlertsCount > 0 && (
                <span
                  className={`absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-black flex items-center justify-center shadow-md ${
                    criticalAlertsCount > 0
                      ? 'bg-red-500 text-white animate-pulse'
                      : 'bg-[#C2D66E] text-[#0F1411]'
                  }`}
                >
                  {activeAlertsCount}
                </span>
              )}
            </motion.button>

            {/* Notification Dropdown Tray */}
            <AnimatePresence>
              {isAlertsOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 10 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-2 w-80 sm:w-96 bg-[#141C17] border border-[#C2D66E]/40 rounded-3xl shadow-2xl p-3.5 z-50 backdrop-blur-xl ring-1 ring-[#C2D66E]/20"
                >
                  {/* Tray Header */}
                  <div className="flex items-center justify-between pb-2.5 border-b border-[#2C3631] mb-2.5">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-xl bg-[#C2D66E]/20 text-[#C2D66E] flex items-center justify-center font-bold text-xs">
                        <Zap className="w-4 h-4 fill-current" />
                      </div>
                      <div>
                        <h4 className="font-extrabold text-xs sm:text-sm text-[#E5E9E7] leading-tight">
                          {currentLanguage === 'mr'
                            ? 'शेतमाल मुदत व मागणी अलर्ट'
                            : currentLanguage === 'hi'
                            ? 'स्टॉक समाप्ति व पीक मांग अलर्ट'
                            : 'Stock Expiry & Peak Demand'}
                        </h4>
                        <p className="text-[10px] text-[#8E9B94]">
                          {currentLanguage === 'mr'
                            ? 'कापणी व शेल्फ-लाईफवर आधारित इशारे'
                            : 'Active alerts based on listing dates'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      {criticalAlertsCount > 0 && (
                        <span className="bg-red-500/20 text-red-300 border border-red-500/40 text-[9px] font-black px-1.5 py-0.5 rounded-full">
                          {criticalAlertsCount} {currentLanguage === 'mr' ? 'तातडीचे' : 'Critical'}
                        </span>
                      )}
                      {peakAlertsCount > 0 && (
                        <span className="bg-[#C2D66E]/20 text-[#C2D66E] border border-[#C2D66E]/40 text-[9px] font-black px-1.5 py-0.5 rounded-full">
                          {peakAlertsCount} {currentLanguage === 'mr' ? 'संधी' : 'Surge'}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Tray Alerts List */}
                  {activeStockAlerts.length === 0 ? (
                    <div className="py-6 text-center text-xs text-[#8E9B94] space-y-1">
                      <span className="text-2xl block mb-1">🌾</span>
                      <p className="text-[#D4E4BC] font-semibold">
                        {currentLanguage === 'mr'
                          ? 'सर्व शेतमाल साठा मुदतीत व सुरक्षित आहे!'
                          : currentLanguage === 'hi'
                          ? 'सभी फसल स्टॉक ताज़ा एवं सुरक्षित है!'
                          : 'All crop stock is fresh & optimal!'}
                      </p>
                      <p className="text-[11px] text-[#8E9B94]">
                        {currentLanguage === 'mr'
                          ? 'कोणताही साठा संपण्याचा तात्काळ धोका नाही.'
                          : 'No urgent expiration or surge notices right now.'}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2.5 max-h-[340px] overflow-y-auto pr-1 scrollbar-thin">
                      {activeStockAlerts.map((alert) => {
                        const isCritical = alert.type === 'CRITICAL_EXPIRY';
                        const isPeak = alert.type === 'PEAK_DEMAND_WINDOW';
                        const isSpeaking = speakingAlertId === alert.id;

                        return (
                          <div
                            key={alert.id}
                            className={`p-2.5 rounded-2xl border text-xs transition-all ${
                              isCritical
                                ? 'bg-[#221718] border-red-500/40'
                                : isPeak
                                ? 'bg-[#18231C] border-[#C2D66E]/40'
                                : 'bg-[#221F17] border-amber-500/40'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-1.5 mb-1.5">
                              <span
                                className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1 ${
                                  isCritical
                                    ? 'bg-red-500 text-white'
                                    : isPeak
                                    ? 'bg-[#C2D66E] text-[#0F1411]'
                                    : 'bg-amber-400 text-[#0F1411]'
                                }`}
                              >
                                {isCritical ? (
                                  <>
                                    <AlertTriangle className="w-2.5 h-2.5" />
                                    <span>{alert.hoursRemaining}h {currentLanguage === 'mr' ? 'मुदत' : 'Expiry'}</span>
                                  </>
                                ) : isPeak ? (
                                  <>
                                    <TrendingUp className="w-2.5 h-2.5" />
                                    <span>{currentLanguage === 'mr' ? 'पीक मागणी विंडो' : 'Peak Window'}</span>
                                  </>
                                ) : (
                                  <>
                                    <Clock className="w-2.5 h-2.5" />
                                    <span>{alert.daysRemaining}d {currentLanguage === 'mr' ? 'शिल्लक' : 'Left'}</span>
                                  </>
                                )}
                              </span>

                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => handleAlertVoicePlay(alert)}
                                  className={`p-1 rounded-md border text-[10px] transition-colors cursor-pointer ${
                                    isSpeaking
                                      ? 'bg-[#C2D66E] text-[#0F1411] border-[#C2D66E]'
                                      : 'bg-[#0F1411] text-[#8E9B94] hover:text-white border-[#2C3631]'
                                  }`}
                                  title="Listen / ऐका"
                                >
                                  {isSpeaking ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
                                </button>
                                {onDismissStockAlert && (
                                  <button
                                    type="button"
                                    onClick={() => onDismissStockAlert(alert.id)}
                                    className="p-1 rounded-md bg-[#0F1411] text-[#8E9B94] hover:text-white border border-[#2C3631] cursor-pointer"
                                    title="Dismiss / बंद करा"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                )}
                              </div>
                            </div>

                            <h5 className="font-bold text-[#E5E9E7] text-[11px] leading-snug line-clamp-1 mb-1">
                              {alert.title[currentLanguage] || alert.title.en}
                            </h5>

                            <p className="text-[10px] text-[#8E9B94] line-clamp-2 leading-relaxed mb-2">
                              {alert.message[currentLanguage] || alert.message.en}
                            </p>

                            {/* Action Buttons inside dropdown */}
                            <div className="flex items-center gap-1.5 pt-1 border-t border-[#2C3631]/60">
                              {isCritical && onApplyDiscount && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    onApplyDiscount(alert.listingId, 10);
                                  }}
                                  className="flex-1 py-1 px-2 rounded-lg bg-red-500 hover:bg-red-600 text-white font-bold text-[10px] flex items-center justify-center gap-1 transition-all cursor-pointer shadow-xs"
                                >
                                  <Tag className="w-2.5 h-2.5" />
                                  <span>{currentLanguage === 'mr' ? '१०% सवलत द्या' : '10% Clearance'}</span>
                                </button>
                              )}

                              {isPeak && alert.bestBuyerMatch && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setIsAlertsOpen(false);
                                    onNavigateTab('orders', alert.bestBuyerMatch?.id);
                                  }}
                                  className="flex-1 py-1 px-2 rounded-lg bg-[#C2D66E] hover:bg-[#D4E4BC] text-[#0F1411] font-black text-[10px] flex items-center justify-center gap-1 transition-all cursor-pointer shadow-xs"
                                >
                                  <Store className="w-2.5 h-2.5" />
                                  <span>₹{alert.bestBuyerMatch.offeredPricePerKg}/kg {currentLanguage === 'mr' ? 'थेट विका' : 'Sell Now'}</span>
                                </button>
                              )}

                              <button
                                type="button"
                                onClick={() => {
                                  setIsAlertsOpen(false);
                                  onNavigateTab('marketplace');
                                  if (onOpenStockAlerts) onOpenStockAlerts();
                                }}
                                className="py-1 px-2 rounded-lg bg-[#0F1411] hover:bg-[#1E2822] text-[#D4E4BC] font-semibold text-[10px] border border-[#2C3631] transition-all cursor-pointer ml-auto flex items-center gap-0.5"
                              >
                                <span>{currentLanguage === 'mr' ? 'तपशील' : 'Details'}</span>
                                <ArrowRight className="w-2.5 h-2.5" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Tray Footer Button */}
                  <div className="pt-2.5 mt-2 border-t border-[#2C3631] flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setIsAlertsOpen(false);
                        onNavigateTab('marketplace');
                        if (onOpenStockAlerts) onOpenStockAlerts();
                      }}
                      className="w-full py-2 rounded-xl bg-gradient-to-r from-[#1E2822] to-[#25332A] hover:from-[#C2D66E] hover:to-emerald-400 text-[#C2D66E] hover:text-[#0F1411] border border-[#C2D66E]/40 text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-1.5 uppercase tracking-wider"
                    >
                      <Zap className="w-3.5 h-3.5 fill-current" />
                      <span>
                        {currentLanguage === 'mr'
                          ? 'संपूर्ण साठा व मुदत सूचना केंद्र उघडा'
                          : currentLanguage === 'hi'
                          ? 'पूरा स्टॉक व समाप्ति अलर्ट केंद्र खोलें'
                          : 'Open Stock Alert Notification Center'}
                      </span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* User Profile / Auth State Pill */}
          <div className="relative shrink-0" ref={userMenuRef}>
            {currentUser ? (
              <motion.button
                id="user-profile-menu-btn"
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setIsUserMenuOpen(!isUserMenuOpen);
                  setIsRoleOpen(false);
                  setIsLangOpen(false);
                }}
                className={`flex items-center gap-1 sm:gap-2 bg-[#1A221E] hover:bg-[#242C28] border ${
                  isUserMenuOpen ? 'border-[#C2D66E] ring-1 ring-[#C2D66E]/40' : 'border-[#2C3631]'
                } rounded-full pl-1 sm:pl-1.5 pr-1.5 sm:pr-2.5 py-1 text-xs text-[#E5E9E7] transition-all cursor-pointer shadow-sm shrink-0`}
                title={`${currentUser.name} (${currentUser.role === 'farmer' ? t.verifiedKisan : t.verifiedMart})`}
              >
                <div className="relative">
                  {currentUser.avatarUrl ? (
                    <img
                      src={currentUser.avatarUrl}
                      alt={currentUser.name}
                      className="w-4 h-4 sm:w-6 sm:h-6 rounded-full object-cover border border-[#2C3631]"
                    />
                  ) : (
                    <div className={`w-4 h-4 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-[10px] sm:text-xs ${currentUser.role === 'farmer' ? 'bg-[#C2D66E]/20 text-[#C2D66E]' : 'bg-emerald-500/20 text-emerald-300'}`}>
                      {currentUser.role === 'farmer' ? '🌾' : <Store className="w-3 h-3 sm:w-4 sm:h-4" />}
                    </div>
                  )}
                  {currentUser.authProvider === 'google' && (
                    <span className="absolute -bottom-1 -right-1 w-2.5 sm:w-3.5 h-2.5 sm:h-3.5 rounded-full bg-white flex items-center justify-center shadow-xs border border-gray-200">
                      <GoogleLogoIcon className="w-1.5 h-1.5 sm:w-2.5 sm:h-2.5" />
                    </span>
                  )}
                </div>
                <div className="hidden sm:flex flex-col text-left">
                  <div className="flex items-center gap-1">
                    <span className="font-bold text-[11px] sm:text-xs max-w-[70px] sm:max-w-[100px] truncate text-[#E5E9E7]">
                      {currentUser.name}
                    </span>
                    <ShieldCheck className={`w-3 h-3 ${currentUser.role === 'farmer' ? 'text-[#C2D66E]' : 'text-emerald-400'}`} />
                  </div>
                </div>
                <ChevronDown className={`w-3 h-3 text-[#8E9B94] transition-transform duration-200 ${isUserMenuOpen ? 'rotate-180 text-[#C2D66E]' : ''}`} />
              </motion.button>
            ) : (
              <motion.button
                id="open-login-modal-btn"
                type="button"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => onOpenLoginModal && onOpenLoginModal('farmer')}
                className="flex items-center gap-1 sm:gap-1.5 bg-[#C2D66E] hover:bg-[#D4E4BC] text-[#0F1411] px-2 sm:px-3 py-1.5 rounded-full text-xs font-bold shadow-sm transition-all cursor-pointer uppercase tracking-wider"
                title={t.login}
              >
                <LogIn className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                <span className="hidden sm:inline">{t.login}</span>
              </motion.button>
            )}

            {/* Logged-In User Profile Menu Dropdown */}
            <AnimatePresence>
              {isUserMenuOpen && currentUser && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 10 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-2 w-72 sm:w-84 bg-[#141C17] border border-[#C2D66E]/50 rounded-2xl shadow-2xl p-3 z-50 backdrop-blur-xl ring-1 ring-[#C2D66E]/20"
                >
                  <div className="flex items-start gap-3 p-2.5 bg-[#0F1612] border border-[#233529] rounded-xl mb-3 relative overflow-hidden">
                    {currentUser.avatarUrl ? (
                      <img
                        src={currentUser.avatarUrl}
                        alt={currentUser.name}
                        className="w-12 h-12 rounded-xl object-cover border border-[#C2D66E]/40 shrink-0 shadow-sm"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-[#242E28] border border-[#C2D66E]/30 flex items-center justify-center text-xl shrink-0">
                        {currentUser.role === 'farmer' ? '🌾' : <Store className="w-6 h-6 text-emerald-400" />}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h4 className="font-bold text-sm text-[#E5E9E7] truncate">{currentUser.name}</h4>
                        <span className={`text-[9px] font-black uppercase px-1.5 py-0.2 rounded ${
                          currentUser.role === 'farmer'
                            ? 'bg-[#C2D66E] text-[#0F1411] font-bold shadow-xs'
                            : 'bg-emerald-400 text-[#0F1411] font-bold shadow-xs'
                        }`}>
                          {currentUser.role === 'farmer' ? 'Farmer' : 'Mart'}
                        </span>
                        {currentUser.authProvider === 'google' && (
                          <span className="flex items-center gap-1 bg-[#1E2B23] text-[#C2D66E] border border-[#C2D66E]/40 px-1.5 py-0.2 rounded text-[9px] font-bold">
                            <GoogleLogoIcon className="w-2.5 h-2.5" />
                            <span>Google Account</span>
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[#8E9B94] font-mono mt-0.5">{currentUser.phone}</p>
                      <p className="text-[11px] text-[#C2D66E] font-medium truncate mt-0.5">
                        {currentUser.role === 'farmer' ? currentUser.farmName : currentUser.martName}
                      </p>
                    </div>
                  </div>

                  {/* Google Account Email Pill if signed in via Google */}
                  {currentUser.googleEmail && (
                    <div className="flex items-center gap-2 p-2 bg-[#0F1612] rounded-xl border border-[#233529] mb-2.5 text-xs text-[#E5E9E7]">
                      <GoogleLogoIcon className="w-3.5 h-3.5 shrink-0" />
                      <div className="min-w-0 flex-1 truncate">
                        <span className="text-[10px] text-[#8E9B94] block leading-none">
                          {currentLanguage === 'mr' ? 'गुगल खाते' : currentLanguage === 'hi' ? 'गूगल खाता' : 'Google Account'}:
                        </span>
                        <span className="font-mono text-[11px] text-[#C2D66E] font-semibold truncate block mt-0.5">{currentUser.googleEmail}</span>
                      </div>
                      <span className="text-[9px] bg-[#C2D66E]/20 text-[#C2D66E] border border-[#C2D66E]/40 px-1.5 py-0.5 rounded font-bold shrink-0">
                        Google Verified
                      </span>
                    </div>
                  )}

                  {/* Account Details & Badges */}
                  <div className="space-y-1.5 text-xs text-[#8E9B94] p-2 bg-[#0F1612] rounded-xl border border-[#233529] mb-3">
                    {currentUser.role === 'farmer' ? (
                      <>
                        <div className="flex items-center justify-between">
                          <span>{t.districtLabel}:</span>
                          <span className="text-[#E5E9E7] font-semibold">{currentUser.villageOrDistrict}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>{t.landSizeLabel}:</span>
                          <span className="text-[#C2D66E] font-semibold">{currentUser.landSizeAcres} Acres</span>
                        </div>
                        {currentUser.kisanId && (
                          <div className="flex items-center justify-between">
                            <span>Kisan ID:</span>
                            <span className="text-[#C2D66E] font-mono font-medium">{currentUser.kisanId}</span>
                          </div>
                        )}
                      </>
                    ) : (
                      <>
                        <div className="flex items-center justify-between">
                          <span>{t.cityLabel}:</span>
                          <span className="text-[#E5E9E7] font-semibold">{currentUser.city}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>{t.procurementTonsLabel}:</span>
                          <span className="text-[#C2D66E] font-semibold">{currentUser.procurementCapacityTonsPerMonth} T/mo</span>
                        </div>
                        {currentUser.activeEscrowBalanceINR && (
                          <div className="flex items-center justify-between">
                            <span>Escrow Balance:</span>
                            <span className="text-[#C2D66E] font-bold font-mono">₹{currentUser.activeEscrowBalanceINR.toLocaleString('en-IN')}</span>
                          </div>
                        )}
                      </>
                    )}
                  </div>

                  {/* Edit Profile Action Button */}
                  <motion.button
                    id="open-edit-profile-btn"
                    type="button"
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      if (onOpenProfileEdit) onOpenProfileEdit();
                    }}
                    className="w-full mb-2.5 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-gradient-to-r from-[#C2D66E] to-emerald-400 hover:from-[#D4E4BC] hover:to-emerald-300 text-[#0F1411] text-xs font-black shadow-md shadow-[#C2D66E]/20 transition-all cursor-pointer uppercase tracking-wider"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-[#0F1411] stroke-[2.5]" />
                    <span>
                      {currentUser.role === 'farmer'
                        ? (currentLanguage === 'mr' ? 'शेती व प्रोफाइल संपादित करा' : currentLanguage === 'hi' ? 'खेत व प्रोफ़ाइल संपादित करें' : 'Edit Profile & Farm Details')
                        : (currentLanguage === 'mr' ? 'मार्ट माहिती संपादित करा' : 'Edit Mart & Sourcing Details')}
                    </span>
                  </motion.button>

                  {/* Switch Account & Logout Actions */}
                  <div className="grid grid-cols-2 gap-2">
                    <motion.button
                      id="switch-account-btn"
                      type="button"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        if (onOpenLoginModal) {
                          onOpenLoginModal(currentUser.role === 'farmer' ? 'mart' : 'farmer');
                        }
                      }}
                      className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-[#1E2822] hover:bg-[#2A372F] text-[#C2D66E] text-xs font-bold border border-[#C2D66E]/40 transition-all cursor-pointer shadow-xs"
                    >
                      <User className="w-3.5 h-3.5 text-[#C2D66E]" />
                      <span>{t.switchAccount}</span>
                    </motion.button>

                    <motion.button
                      id="user-logout-btn"
                      type="button"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        if (onLogout) onLogout();
                      }}
                      className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-red-500/15 hover:bg-red-500/25 text-red-300 text-xs font-semibold border border-red-500/30 transition-all cursor-pointer"
                      title={currentUser.authProvider === 'google' ? t.googleLogout : t.logout}
                    >
                      <LogOut className="w-3.5 h-3.5 text-red-300" />
                      <span>{currentUser.authProvider === 'google' ? t.googleLogout : t.logout}</span>
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Language Selector ("भाषा") */}
          <div className="relative shrink-0" ref={langRef}>
            <button
              id="language-selector-btn"
              type="button"
              onClick={() => {
                setIsLangOpen(!isLangOpen);
                setIsRoleOpen(false);
                setIsUserMenuOpen(false);
              }}
              className={`flex items-center gap-1 sm:gap-2 bg-[#1A221E] hover:bg-[#242C28] border ${
                isLangOpen ? 'border-[#C2D66E] ring-1 ring-[#C2D66E]/40' : 'border-[#2C3631]'
              } rounded-full px-1.5 sm:px-3 py-1 sm:py-1.5 text-xs text-[#E5E9E7] transition-all cursor-pointer shrink-0`}
              title="Change Language / भाषा निवडा"
              aria-expanded={isLangOpen}
            >
              <span className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center font-bold text-[9px] sm:text-[11px] shrink-0 ${currentLangObj.symbolStyle}`}>
                {currentLangObj.symbol}
              </span>
              <span className="hidden sm:inline font-semibold text-[11px] sm:text-xs text-[#E5E9E7]">
                {currentLangObj.label}
              </span>
              <ChevronDown className={`w-3 h-3 text-[#8E9B94] transition-transform duration-200 ${isLangOpen ? 'rotate-180 text-[#C2D66E]' : ''}`} />
            </button>

            {/* Language Dropdown Menu */}
            <AnimatePresence>
              {isLangOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 10 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-2 w-52 sm:w-60 bg-[#1A221E] border border-[#2C3631] rounded-2xl shadow-2xl p-2 z-50 backdrop-blur-xl"
                >
                  <div className="flex items-center justify-between px-2.5 py-1.5 border-b border-[#2C3631] mb-1.5">
                    <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest font-bold text-[#8E9B94]">
                      <Languages className="w-3.5 h-3.5 text-[#C2D66E]" />
                      <span>भाषा निवडा / Language</span>
                    </div>
                    <span className="text-[10px] text-[#C2D66E] font-bold bg-[#C2D66E]/10 px-2 py-0.5 rounded-full">
                      {currentLangObj.symbol}
                    </span>
                  </div>

                  <div className="space-y-1 max-h-[60vh] overflow-y-auto pr-1 scrollbar-thin">
                    {languages.map((lang) => {
                      const isSelected = currentLanguage === lang.code;
                      return (
                        <button
                          key={lang.code}
                          id={`lang-option-${lang.code}`}
                          type="button"
                          onClick={() => handleSelectLanguage(lang.code)}
                          className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-semibold text-left transition-all ${
                            isSelected
                              ? 'bg-[#C2D66E] text-[#0F1411] font-bold shadow-sm'
                              : 'text-[#E5E9E7] hover:bg-[#242C28]'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                              isSelected
                                ? 'bg-[#0F1411] text-[#C2D66E]'
                                : lang.symbolStyle
                            }`}>
                              {lang.symbol}
                            </span>
                            <div className="flex flex-col min-w-0">
                              <span className="truncate leading-tight">{lang.nativeName}</span>
                              <span className={`text-[10px] ${isSelected ? 'text-[#0F1411]/80 font-medium' : 'text-[#8E9B94]'}`}>
                                {lang.subLabel}
                              </span>
                            </div>
                          </div>
                          {isSelected && <Check className="w-4 h-4 text-[#0F1411] shrink-0 ml-1.5" />}
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  );
};

