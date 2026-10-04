import React, { useState } from 'react';
import {
  CloudRain,
  Sun,
  CloudFog,
  CloudLightning,
  Wind,
  Droplets,
  Thermometer,
  AlertTriangle,
  CheckCircle2,
  Volume2,
  VolumeX,
  Truck,
  RotateCw,
  X,
  Navigation,
  ShieldAlert,
  Send,
  Sparkles,
  MapPin,
  Clock,
  ExternalLink,
  Check,
} from 'lucide-react';
import { WeatherAlert, LanguageCode, WeatherSeverity, WeatherConditionType } from '../types';
import { translations } from '../utils/translations';
import { audioSpeech } from '../utils/audioSpeech';

interface WeatherAlertRadarModalProps {
  isOpen: boolean;
  onClose: () => void;
  alerts: WeatherAlert[];
  currentLanguage: LanguageCode;
  onRefreshAlerts?: () => Promise<void>;
  isRefreshing?: boolean;
  onDismissAlert?: (id: string) => void;
  onNavigateTab?: (tab: string) => void;
}

export const WeatherAlertRadarModal: React.FC<WeatherAlertRadarModalProps> = ({
  isOpen,
  onClose,
  alerts,
  currentLanguage,
  onRefreshAlerts,
  isRefreshing = false,
  onDismissAlert,
  onNavigateTab,
}) => {
  const [selectedLocation, setSelectedLocation] = useState<string>('all');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');
  const [isPlayingAudioId, setIsPlayingAudioId] = useState<string | null>(null);
  const [notifiedDrivers, setNotifiedDrivers] = useState<Record<string, boolean>>({});
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const t = translations[currentLanguage];

  if (!isOpen) return null;

  // Extract unique locations from alerts
  const availableLocations: string[] = Array.from(new Set(alerts.map((a) => a.location)));

  const filteredAlerts = alerts.filter((alertItem) => {
    if (selectedLocation !== 'all' && alertItem.location !== selectedLocation) return false;
    if (selectedSeverity !== 'all' && alertItem.severity !== selectedSeverity) return false;
    return true;
  });

  const getSeverityBadge = (severity: WeatherSeverity) => {
    switch (severity) {
      case 'CRITICAL':
        return {
          bg: 'bg-[#C2D66E]/20 text-[#C2D66E] border-[#C2D66E]/60',
          dot: 'bg-[#C2D66E] animate-ping',
          label: currentLanguage === 'mr' ? 'अति-गंभीर धोका' : currentLanguage === 'hi' ? 'गंभीर खतरा' : 'CRITICAL',
        };
      case 'WARNING':
        return {
          bg: 'bg-[#C2D66E]/15 text-[#C2D66E] border-[#C2D66E]/40',
          dot: 'bg-[#C2D66E]',
          label: currentLanguage === 'mr' ? 'सतर्कतेचा इशारा' : currentLanguage === 'hi' ? 'चेतावनी' : 'WARNING',
        };
      case 'ADVISORY':
        return {
          bg: 'bg-[#8E9B94]/20 text-[#D4E4BC] border-[#3C4A42]',
          dot: 'bg-[#C2D66E]',
          label: currentLanguage === 'mr' ? 'सल्ला' : currentLanguage === 'hi' ? 'सलाह' : 'ADVISORY',
        };
      case 'FAVORABLE':
      default:
        return {
          bg: 'bg-[#C2D66E]/15 text-[#C2D66E] border-[#C2D66E]/40',
          dot: 'bg-[#C2D66E]',
          label: currentLanguage === 'mr' ? 'अनुकूल हवामान' : currentLanguage === 'hi' ? 'अनुकूल मौसम' : 'FAVORABLE',
        };
    }
  };

  const getConditionIcon = (condition: WeatherConditionType) => {
    switch (condition) {
      case 'HEAVY_RAIN':
        return <CloudRain className="w-5 h-5 text-[#C2D66E]" />;
      case 'HAILSTORM':
      case 'CYCLONIC_WINDS':
        return <CloudLightning className="w-5 h-5 text-[#C2D66E]" />;
      case 'HEATWAVE':
        return <Sun className="w-5 h-5 text-[#C2D66E]" />;
      case 'HIGH_HUMIDITY':
        return <Droplets className="w-5 h-5 text-[#C2D66E]" />;
      case 'FOG_MIST':
        return <CloudFog className="w-5 h-5 text-[#C2D66E]" />;
      case 'CLEAR_FAVORABLE':
      default:
        return <Sun className="w-5 h-5 text-[#C2D66E]" />;
    }
  };

  const handleSpeakAlert = (alertItem: WeatherAlert) => {
    if (isPlayingAudioId === alertItem.id) {
      audioSpeech.stop();
      setIsPlayingAudioId(null);
      return;
    }

    audioSpeech.stop();

    const title =
      alertItem.forecastTitleLocalized?.[currentLanguage] ||
      alertItem.forecastTitle;
    const advisory =
      alertItem.detailedAdvisoryLocalized?.[currentLanguage] ||
      alertItem.detailedAdvisory;
    const driverInstruction =
      alertItem.logisticsImpact.driverActionLocalized?.[currentLanguage] ||
      alertItem.logisticsImpact.driverActionInstruction;

    const speechText = `${title}. ${advisory}. ${driverInstruction}`;

    setIsPlayingAudioId(alertItem.id);
    audioSpeech.speak(
      speechText,
      currentLanguage,
      () => setIsPlayingAudioId(alertItem.id),
      () => setIsPlayingAudioId(null),
      () => setIsPlayingAudioId(null)
    );
  };

  const handleNotifyDriver = (alert: WeatherAlert) => {
    setNotifiedDrivers((prev) => ({ ...prev, [alert.id]: true }));
    const msg =
      currentLanguage === 'mr'
        ? `चालक योगिराज ससाणे यांना रीफर तापमान (${alert.logisticsImpact.recommendedReeferTempCelsius}°C) व हवामान सूचना पाठवली!`
        : currentLanguage === 'hi'
        ? `चालक योगिराज ससाणे को रीफर तापमान (${alert.logisticsImpact.recommendedReeferTempCelsius}°C) और मौसम अलर्ट भेजा गया!`
        : `Notification sent to Driver Yogiraj Sasane with Reefer Setpoint (${alert.logisticsImpact.recommendedReeferTempCelsius}°C)!`;
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[92vh] bg-[#141A17] border border-[#2C3631] rounded-3xl shadow-2xl flex flex-col overflow-hidden text-[#E5E9E7]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#2C3631] bg-[#1A221E] flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#242E28] border border-[#3C4A42] flex items-center justify-center text-[#C2D66E] shadow-inner shrink-0">
              <CloudLightning className="w-5 h-5 text-[#C2D66E] animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-[#E5E9E7]">
                  {t.realtimeWeatherRadar}
                </h2>
                <span className="bg-[#C2D66E]/20 border border-[#C2D66E]/50 text-[#C2D66E] text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#C2D66E] animate-ping"></span>
                  LIVE RADAR
                </span>
              </div>
              <p className="text-xs text-[#8E9B94]">
                {currentLanguage === 'mr'
                  ? 'शेतकऱ्यांच्या नोंदणीकृत पीक क्षेत्रासाठी थेट हवामान इशारे व वाहतूक जोखीम व्यवस्थापन'
                  : currentLanguage === 'hi'
                  ? 'पंजीकृत फसल क्षेत्रों के लिए लाइव मौसम अलर्ट एवं लॉजिस्टिक्स जोखिम सुरक्षा'
                  : 'Real-time weather radar & cold-chain transit advisories for registered farm clusters'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onRefreshAlerts && (
              <button
                id="weather-radar-rescan-btn"
                onClick={() => onRefreshAlerts()}
                disabled={isRefreshing}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#242E28] hover:bg-[#2F3C34] text-xs font-semibold text-[#D4E4BC] border border-[#3C4A42] transition-colors disabled:opacity-50 cursor-pointer"
                title={t.scanLiveWeather}
              >
                <RotateCw className={`w-3.5 h-3.5 text-[#C2D66E] ${isRefreshing ? 'animate-spin' : ''}`} />
                <span>{isRefreshing ? 'Scanning...' : t.scanLiveWeather}</span>
              </button>
            )}
            <button
              id="close-weather-modal-btn"
              onClick={onClose}
              className="p-2 rounded-xl bg-[#242E28] hover:bg-[#2F3C34] text-[#8E9B94] hover:text-[#E5E9E7] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Location & Filter Bar */}
        <div className="px-5 py-3 bg-[#111613] border-b border-[#2C3631] flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#8E9B94] shrink-0 flex items-center gap-1">
              <MapPin className="w-3 h-3 text-[#C2D66E]" /> {t.registeredCropLocations}:
            </span>
            <button
              id="filter-loc-all"
              onClick={() => setSelectedLocation('all')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedLocation === 'all'
                  ? 'bg-[#C2D66E] text-[#0F1411]'
                  : 'bg-[#1A221E] text-[#8E9B94] hover:text-[#E5E9E7] border border-[#2C3631]'
              }`}
            >
              {currentLanguage === 'mr' ? 'सर्व ठिकाणे' : currentLanguage === 'hi' ? 'सभी क्षेत्र' : 'All Regions'} ({alerts.length})
            </button>
            {availableLocations.map((loc) => (
              <button
                key={loc}
                id={`filter-loc-${loc.replace(/[^a-zA-Z0-9]/g, '-')}`}
                onClick={() => setSelectedLocation(loc)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                  selectedLocation === loc
                    ? 'bg-[#C2D66E] text-[#0F1411]'
                    : 'bg-[#1A221E] text-[#8E9B94] hover:text-[#E5E9E7] border border-[#2C3631]'
                }`}
              >
                {loc}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#8E9B94]">Severity:</span>
            {['all', 'CRITICAL', 'WARNING', 'ADVISORY'].map((sev) => (
              <button
                key={sev}
                id={`filter-sev-${sev}`}
                onClick={() => setSelectedSeverity(sev)}
                className={`px-2 py-0.5 rounded text-[11px] font-bold uppercase transition-colors ${
                  selectedSeverity === sev
                    ? 'bg-[#2C3631] text-[#E5E9E7] border border-[#C2D66E]/50'
                    : 'text-[#8E9B94] hover:text-[#E5E9E7]'
                }`}
              >
                {sev}
              </button>
            ))}
          </div>
        </div>

        {/* Toast Notification */}
        {toastMessage && (
          <div className="mx-5 mt-3 p-3 rounded-2xl bg-[#C2D66E]/15 border border-[#C2D66E]/40 text-[#D4E4BC] text-xs font-semibold flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
            <CheckCircle2 className="w-4 h-4 text-[#C2D66E] shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Alert Cards Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {filteredAlerts.length === 0 ? (
            <div className="py-12 text-center text-[#8E9B94] space-y-2">
              <CheckCircle2 className="w-10 h-10 text-[#C2D66E] mx-auto opacity-70" />
              <p className="text-sm font-semibold text-[#E5E9E7]">
                {currentLanguage === 'mr'
                  ? 'या निकषासाठी कोणतेही गंभीर हवामान धोके नाहीत.'
                  : currentLanguage === 'hi'
                  ? 'इस क्षेत्र के लिए कोई गंभीर मौसम चेतावनी नहीं है।'
                  : 'No severe weather risks detected for this selection.'}
              </p>
              <p className="text-xs">
                {currentLanguage === 'mr'
                  ? 'सर्व नोंदणीकृत पीक क्षेत्रांमध्ये वाहतूक सुरळीत सुरू आहे.'
                  : 'Highway transit and farmgate dispatch corridors are completely normal.'}
              </p>
            </div>
          ) : (
            filteredAlerts.map((alert) => {
              const badge = getSeverityBadge(alert.severity);
              const title =
                alert.forecastTitleLocalized?.[currentLanguage] ||
                alert.forecastTitle;
              const advisory =
                alert.detailedAdvisoryLocalized?.[currentLanguage] ||
                alert.detailedAdvisory;
              const driverInstruction =
                alert.logisticsImpact.driverActionLocalized?.[currentLanguage] ||
                alert.logisticsImpact.driverActionInstruction;
              const isNotified = notifiedDrivers[alert.id];

              return (
                <div
                  key={alert.id}
                  id={`weather-card-${alert.id}`}
                  className="bg-[#1A221E] border border-[#2C3631] rounded-2xl p-4 sm:p-5 hover:border-[#3C4A42] transition-all shadow-md space-y-4"
                >
                  {/* Card Header */}
                  <div className="flex flex-wrap items-start justify-between gap-2 border-b border-[#2C3631]/80 pb-3">
                    <div className="flex items-start gap-3">
                      <div className="p-2.5 rounded-xl bg-[#141A17] border border-[#2C3631] shrink-0 mt-0.5">
                        {getConditionIcon(alert.condition)}
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full border flex items-center gap-1.5 ${badge.bg}`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`}></span>
                            {badge.label}
                          </span>
                          <span className="text-xs font-semibold text-[#C2D66E] flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5" />
                            {alert.location} ({alert.district}, {alert.state})
                          </span>
                        </div>
                        <h3 className="text-sm sm:text-base font-bold text-[#E5E9E7] leading-snug">
                          {title}
                        </h3>
                      </div>
                    </div>

                    {/* Action buttons on card header */}
                    <div className="flex items-center gap-1.5">
                      <button
                        id={`audio-alert-btn-${alert.id}`}
                        onClick={() => handleSpeakAlert(alert)}
                        className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-semibold border transition-all ${
                          isPlayingAudioId === alert.id
                            ? 'bg-[#C2D66E]/20 text-[#C2D66E] border-[#C2D66E]/50 animate-pulse'
                            : 'bg-[#141A17] text-[#D4E4BC] border-[#2C3631] hover:bg-[#242E28]'
                        }`}
                        title={isPlayingAudioId === alert.id ? t.stopAudio : t.listenAudio}
                      >
                        {isPlayingAudioId === alert.id ? (
                          <>
                            <VolumeX className="w-3.5 h-3.5 text-[#C2D66E]" />
                            <span>{t.stopAudio}</span>
                          </>
                        ) : (
                          <>
                            <Volume2 className="w-3.5 h-3.5 text-[#C2D66E]" />
                            <span>{t.listenAudio}</span>
                          </>
                        )}
                      </button>

                      {onDismissAlert && (
                        <button
                          onClick={() => onDismissAlert(alert.id)}
                          className="p-1.5 rounded-xl bg-[#141A17] text-[#8E9B94] hover:text-[#E5E9E7] border border-[#2C3631] transition-colors"
                          title="Dismiss Alert"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Crop Tags & Microclimate Metrics */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    <div className="p-2.5 rounded-xl bg-[#141A17] border border-[#2C3631] flex items-center gap-2">
                      <Thermometer className="w-4 h-4 text-[#C2D66E] shrink-0" />
                      <div>
                        <span className="text-[10px] text-[#8E9B94] block">Temperature</span>
                        <span className="font-bold text-[#E5E9E7]">{alert.temperatureCelsius}°C</span>
                      </div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-[#141A17] border border-[#2C3631] flex items-center gap-2">
                      <Droplets className="w-4 h-4 text-[#C2D66E] shrink-0" />
                      <div>
                        <span className="text-[10px] text-[#8E9B94] block">Humidity</span>
                        <span className="font-bold text-[#E5E9E7]">{alert.humidityPercent}%</span>
                      </div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-[#141A17] border border-[#2C3631] flex items-center gap-2">
                      <CloudRain className="w-4 h-4 text-[#C2D66E] shrink-0" />
                      <div>
                        <span className="text-[10px] text-[#8E9B94] block">Precipitation</span>
                        <span className="font-bold text-[#E5E9E7]">
                          {alert.rainfallMm ? `${alert.rainfallMm} mm` : '0 mm'}
                        </span>
                      </div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-[#141A17] border border-[#2C3631] flex items-center gap-2">
                      <Wind className="w-4 h-4 text-[#C2D66E] shrink-0" />
                      <div>
                        <span className="text-[10px] text-[#8E9B94] block">Wind Speed</span>
                        <span className="font-bold text-[#E5E9E7]">
                          {alert.windSpeedKmh ? `${alert.windSpeedKmh} km/h` : '10 km/h'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Registered Crops in Location */}
                  <div className="flex flex-wrap items-center gap-1.5 text-xs">
                    <span className="text-[11px] font-bold text-[#8E9B94] uppercase tracking-wider">
                      Affected Registered Crops:
                    </span>
                    {alert.registeredCrops.map((crop, idx) => (
                      <span
                        key={idx}
                        className="bg-[#242E28] text-[#D4E4BC] border border-[#3C4A42] px-2 py-0.5 rounded-md font-medium text-[11px]"
                      >
                        🌾 {crop}
                      </span>
                    ))}
                  </div>

                  {/* Detailed Advisory */}
                  <p className="text-xs sm:text-sm text-[#C8D1CC] leading-relaxed bg-[#141A17]/60 p-3 rounded-xl border border-[#2C3631]">
                    {advisory}
                  </p>

                  {/* Logistics Impact & Reefer Corridor Radar Box */}
                  <div className="bg-[#121815] border border-[#2A3830] rounded-2xl p-3.5 sm:p-4 space-y-3">
                    <div className="flex items-center justify-between gap-2 border-b border-[#2C3631]/60 pb-2">
                      <div className="flex items-center gap-2">
                        <Truck className="w-4 h-4 text-[#C2D66E]" />
                        <span className="text-xs font-bold uppercase tracking-wider text-[#D4E4BC]">
                          {t.logisticsTransitRisk}: {alert.logisticsImpact.corridorName}
                        </span>
                      </div>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                          alert.logisticsImpact.delayRiskLevel === 'High' ||
                          alert.logisticsImpact.delayRiskLevel === 'Severe'
                            ? 'bg-[#C2D66E]/25 text-[#C2D66E] border-[#C2D66E]/60'
                            : alert.logisticsImpact.delayRiskLevel === 'Moderate'
                            ? 'bg-[#C2D66E]/15 text-[#C2D66E] border-[#C2D66E]/40'
                            : 'bg-[#1C2620] text-[#D4E4BC] border-[#2C3631]'
                        }`}
                      >
                        Delay Risk: {alert.logisticsImpact.delayRiskLevel} (+{alert.logisticsImpact.transitDelayMinutes}m)
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                      <div className="p-2 rounded-xl bg-[#1A221E] border border-[#2C3631]">
                        <span className="text-[10px] text-[#8E9B94] block uppercase">
                          {t.recommendedReeferTemp}
                        </span>
                        <span className="font-bold text-[#C2D66E] text-sm">
                          +{alert.logisticsImpact.recommendedReeferTempCelsius}°C
                        </span>
                        <span className="text-[10px] text-[#8E9B94] block mt-0.5">
                          {alert.logisticsImpact.preCoolingRequired ? '⚠️ Pre-cooling mandatory' : 'Standard ambient flow'}
                        </span>
                      </div>

                      <div className="p-2 rounded-xl bg-[#1A221E] border border-[#2C3631]">
                        <span className="text-[10px] text-[#8E9B94] block uppercase">
                          {t.dispatchWindow}
                        </span>
                        <span className="font-bold text-[#E5E9E7] text-xs leading-tight block">
                          {alert.logisticsImpact.recommendedDispatchWindow}
                        </span>
                        <span className="text-[10px] text-[#8E9B94] block mt-0.5">
                          {alert.logisticsImpact.cargoTarpingRequired ? '🌧️ Tarping required' : 'Open ventilation'}
                        </span>
                      </div>

                      <div className="p-2 rounded-xl bg-[#1A221E] border border-[#2C3631] flex flex-col justify-between">
                        <div>
                          <span className="text-[10px] text-[#8E9B94] block uppercase">
                            Assigned Driver
                          </span>
                          <span className="font-bold text-[#E5E9E7] text-xs">
                            Yogiraj Sasane (MH-12-Q-8890)
                          </span>
                        </div>
                        <button
                          id={`notify-driver-btn-${alert.id}`}
                          onClick={() => handleNotifyDriver(alert)}
                          className={`mt-2 w-full py-1.5 px-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                            isNotified
                              ? 'bg-[#242E28] text-[#C2D66E] border border-[#C2D66E]/40'
                              : 'bg-[#C2D66E] text-[#0F1411] hover:bg-[#D4E4BC]'
                          }`}
                        >
                          {isNotified ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-[#C2D66E]" />
                              <span>Notified Yogiraj</span>
                            </>
                          ) : (
                            <>
                              <Send className="w-3 h-3 text-[#0F1411]" />
                              <span>{t.alertDriver}</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Driver Instruction Text */}
                    <div className="bg-[#18201C] p-2.5 rounded-xl border border-[#2C3631] text-xs text-[#D4E4BC] flex items-start gap-2">
                      <Navigation className="w-3.5 h-3.5 text-[#C2D66E] shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-white mr-1.5">{t.driverAdvisory}:</span>
                        <span>{driverInstruction}</span>
                      </div>
                    </div>
                  </div>

                  {/* Validity Footer */}
                  <div className="flex items-center justify-between text-[11px] text-[#8E9B94] pt-1 border-t border-[#2C3631]/40">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" /> Issued: {alert.issuedAt}
                    </span>
                    <span>Valid until: {alert.validUntil}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-3.5 bg-[#1A221E] border-t border-[#2C3631] flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-xs text-[#8E9B94]">
            <Sparkles className="w-4 h-4 text-[#C2D66E]" />
            <span>
              {currentLanguage === 'mr'
                ? 'हवामान रडार दर १५ मिनिटांनी थेट भारतीय उपग्रह व रस्ते डेटा अपडेट करते'
                : 'Weather radar syncs with regional IMD satellites & highway toll telemetry'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {onNavigateTab && (
              <button
                id="view-logistics-corridor-btn"
                onClick={() => {
                  onClose();
                  onNavigateTab('logistics');
                }}
                className="px-3.5 py-1.5 rounded-xl bg-[#242E28] hover:bg-[#2F3C34] text-xs font-bold text-[#D4E4BC] border border-[#3C4A42] flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Truck className="w-3.5 h-3.5 text-[#C2D66E]" />
                <span>Open Logistics Software</span>
              </button>
            )}
            <button
              id="close-radar-bottom-btn"
              onClick={onClose}
              className="px-4 py-1.5 rounded-xl bg-[#C2D66E] hover:bg-[#D4E4BC] text-[#0F1411] text-xs font-bold transition-colors cursor-pointer"
            >
              Done / बंद करा
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
