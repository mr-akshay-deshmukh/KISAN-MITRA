import React, { useState } from 'react';
import {
  CloudLightning,
  Volume2,
  VolumeX,
  ChevronRight,
  MapPin,
  Truck,
  X,
  AlertTriangle,
  Droplets,
  CloudRain,
  Sun,
  ShieldAlert,
} from 'lucide-react';
import { WeatherAlert, LanguageCode } from '../types';
import { translations } from '../utils/translations';
import { audioSpeech } from '../utils/audioSpeech';

interface WeatherAlertBannerProps {
  alerts: WeatherAlert[];
  currentLanguage: LanguageCode;
  onOpenRadar: () => void;
  onDismissAlert?: (id: string) => void;
}

export const WeatherAlertBanner: React.FC<WeatherAlertBannerProps> = ({
  alerts,
  currentLanguage,
  onOpenRadar,
  onDismissAlert,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const t = translations[currentLanguage];

  // Only consider active warning/critical alerts for top banner
  const activeAlerts = alerts.filter(
    (a) => !a.isDismissed && (a.severity === 'CRITICAL' || a.severity === 'WARNING' || a.severity === 'ADVISORY')
  );

  if (activeAlerts.length === 0 || isCollapsed) return null;

  const currentAlert = activeAlerts[currentIndex % activeAlerts.length];

  const handleSpeak = (e: React.MouseEvent) => {
    e.stopPropagation();

    if (isPlayingAudio) {
      audioSpeech.stop();
      setIsPlayingAudio(false);
      return;
    }

    const title =
      currentAlert.forecastTitleLocalized?.[currentLanguage] ||
      currentAlert.forecastTitle;
    const advisory =
      currentAlert.detailedAdvisoryLocalized?.[currentLanguage] ||
      currentAlert.detailedAdvisory;
    const driverInstruction =
      currentAlert.logisticsImpact.driverActionLocalized?.[currentLanguage] ||
      currentAlert.logisticsImpact.driverActionInstruction;

    const speechText = `${currentAlert.location}: ${title}. ${advisory}. ${driverInstruction}`;

    audioSpeech.speak(
      speechText,
      currentLanguage,
      () => setIsPlayingAudio(true),
      () => setIsPlayingAudio(false),
      () => setIsPlayingAudio(false)
    );
  };

  const isCritical = currentAlert.severity === 'CRITICAL';

  return (
    <div
      id="live-weather-alert-banner"
      className="w-full mb-3 rounded-2xl border transition-all cursor-pointer shadow-lg overflow-hidden bg-gradient-to-r from-[#17261C] via-[#142018] to-[#101913] border-[#C2D66E]/50 text-[#E5E9E7] hover:border-[#C2D66E]/80 shadow-[#C2D66E]/5"
      onClick={onOpenRadar}
    >
      <div className="px-3.5 sm:px-4 py-2.5 flex flex-wrap sm:flex-nowrap items-center justify-between gap-2.5">
        {/* Left icon and message */}
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border shadow-inner bg-[#C2D66E]/15 border-[#C2D66E]/50 text-[#C2D66E]">
            <CloudLightning className="w-4 h-4 animate-pulse text-[#C2D66E]" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[9px] font-extrabold uppercase tracking-wider px-1.5 py-0.2 rounded border bg-[#C2D66E]/20 border-[#C2D66E]/50 text-[#C2D66E]">
                {isCritical ? 'WEATHER ALERT • HIGH PRIORITY' : 'WEATHER ALERT • LIVE RADAR'}
              </span>
              <span className="text-[11px] font-bold text-[#E5E9E7] flex items-center gap-1">
                <MapPin className="w-3 h-3 text-[#C2D66E]" />
                {currentAlert.location}
              </span>
              <span className="text-[10px] text-[#8E9B94] hidden md:inline">
                ({currentAlert.registeredCrops.join(', ')})
              </span>
            </div>

            <p className="text-xs font-semibold text-[#E5E9E7] truncate mt-0.5">
              {currentAlert.forecastTitleLocalized?.[currentLanguage] || currentAlert.forecastTitle} —{' '}
              <span className="text-xs text-[#C8D1CC] font-normal">
                {currentAlert.detailedAdvisoryLocalized?.[currentLanguage] || currentAlert.detailedAdvisory}
              </span>
            </p>
          </div>
        </div>

        {/* Right Action buttons */}
        <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
          {/* Quick Audio Voice Broadcast */}
          <button
            id="banner-voice-speak-btn"
            onClick={handleSpeak}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold border transition-colors ${
              isPlayingAudio
                ? 'bg-[#C2D66E] text-[#0F1411] border-[#C2D66E] animate-pulse'
                : 'bg-[#141A17] text-[#D4E4BC] border-[#2C3631] hover:bg-[#242E28]'
            }`}
            title={isPlayingAudio ? t.stopAudio : t.listenAudio}
          >
            {isPlayingAudio ? (
              <>
                <VolumeX className="w-3 h-3 text-[#0F1411]" />
                <span className="hidden xs:inline">{t.stopAudio}</span>
              </>
            ) : (
              <>
                <Volume2 className="w-3 h-3 text-[#C2D66E]" />
                <span className="hidden xs:inline">{t.listenAudio}</span>
              </>
            )}
          </button>

          {/* View Radar button */}
          <button
            id="banner-open-radar-btn"
            onClick={onOpenRadar}
            className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#C2D66E] text-[#0F1411] text-[11px] font-bold hover:bg-[#D4E4BC] transition-colors"
          >
            <span>{currentLanguage === 'mr' ? 'रडार पहा' : currentLanguage === 'hi' ? 'रडार देखें' : 'View Radar'}</span>
            <ChevronRight className="w-3 h-3" />
          </button>

          {/* Dismiss banner */}
          <button
            id="banner-dismiss-btn"
            onClick={(e) => {
              e.stopPropagation();
              setIsCollapsed(true);
            }}
            className="p-1 rounded-full hover:bg-white/10 text-[#8E9B94] hover:text-[#E5E9E7] transition-colors"
            title="Dismiss"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
