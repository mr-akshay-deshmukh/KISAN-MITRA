import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Download,
  Smartphone,
  X,
  Sparkles,
  Zap,
  CheckCircle2,
  ShieldCheck,
  Star,
  Layers,
  HelpCircle,
} from 'lucide-react';
import { usePWAInstall } from '../utils/usePWAInstall';
import { LanguageCode } from '../types';
import { AndroidInstallModal } from './AndroidInstallModal';

interface AndroidInstallBannerProps {
  currentLanguage: LanguageCode;
  forceShowForDemo?: boolean;
}

export const AndroidInstallBanner: React.FC<AndroidInstallBannerProps> = ({
  currentLanguage,
  forceShowForDemo = false,
}) => {
  const {
    isInstallable,
    isStandalone,
    isAndroid,
    isIOS,
    isMobile,
    isServiceWorkerReady,
    isBannerDismissed,
    dismissBanner,
    promptInstall,
  } = usePWAInstall();

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isInstalling, setIsInstalling] = useState<boolean>(false);
  const [installSuccess, setInstallSuccess] = useState<boolean>(false);

  // Condition specified by prompt:
  // "specifically detects 'standalone' mode absence on Android devices and triggers a native installation banner above the logo."
  const isStandaloneAbsentOnAndroid = !isStandalone && (isAndroid || isMobile || forceShowForDemo);
  const shouldRender = isStandaloneAbsentOnAndroid && !isBannerDismissed;

  if (!shouldRender) {
    return null;
  }

  const handleInstallClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsInstalling(true);

    if (isInstallable) {
      const outcome = await promptInstall();
      setIsInstalling(false);
      if (outcome) {
        setInstallSuccess(true);
        setTimeout(() => {
          setInstallSuccess(false);
        }, 3000);
      } else {
        setIsModalOpen(true);
      }
    } else {
      setIsInstalling(false);
      setIsModalOpen(true);
    }
  };

  // Localized banner strings for Indian languages
  const textStrings: Record<
    string,
    {
      badge: string;
      title: string;
      desc: string;
      installBtn: string;
      guideBtn: string;
    }
  > = {
    mr: {
      badge: 'अधिकृत अँड्रॉइड ॲप',
      title: 'किसानमित्र अँड्रॉइड ॲप इन्स्टॉल करा',
      desc: 'थेट शेतातून जलद बाजारभाव, AI शिफारस व व्हॉइस असिस्टंट — फक्त २.४ MB!',
      installBtn: 'इन्स्टॉल करा',
      guideBtn: 'मार्गदर्शन',
    },
    hi: {
      badge: 'आधिकारिक एंड्रॉइड ऐप',
      title: 'किसानमित्र एंड्रॉइड ऐप इंस्टॉल करें',
      desc: 'सीधे मंडी भाव, AI फसल सलाह और वॉयस असिस्टेंट — केवल 2.4 MB!',
      installBtn: 'इंस्टॉल करें',
      guideBtn: 'गाइड',
    },
    en: {
      badge: 'Official Android App',
      title: 'Install KisanMitra Android App',
      desc: 'Instant Mandi rates, AI crop analytics & offline voice helper — 2.4 MB lightweight PWA!',
      installBtn: 'Install App',
      guideBtn: 'Guide',
    },
    kn: {
      badge: 'ಅಧಿಕೃತ ಆಂಡ್ರಾಯ್ಡ್ ಆಪ್',
      title: 'ಕಿಸಾನ್‌ಮಿತ್ರ ಆಂಡ್ರಾಯ್ಡ್ ಆಪ್ ಸ್ಥಾಪಿಸಿ',
      desc: 'ವೇಗದ ಮಂಡಿ ದರಗಳು ಮತ್ತು ಆಫ್‌ಲೈನ್ ಕೃಷಿ ಮಾಹಿತಿ — ಕೇವಲ 2.4 MB!',
      installBtn: 'ಸ್ಥಾಪಿಸಿ',
      guideBtn: 'ಮಾರ್ಗದರ್ಶನ',
    },
    te: {
      badge: 'అధికారిక ఆండ్రాయిడ్ యాప్',
      title: 'కిసాన్‌మిత్ర ఆండ్రాయిడ్ యాప్ ఇన్‌స్టాల్ చేయండి',
      desc: 'తక్షణ మార్కెట్ ధరలు & ఆఫ్‌లైన్ వాయిస్ సహాయం — కేవలం 2.4 MB!',
      installBtn: 'ఇన్‌స్టాల్',
      guideBtn: 'గైడ్',
    },
    ta: {
      badge: 'அதிகாரப்பூர்வ ஆண்ட்ராய்டு ஆப்',
      title: 'கிசான்மித்ரா ஆண்ட்ராய்டு ஆப் நிறுவவும்',
      desc: 'உடனடி சந்தை விலை & ஆஃப்லைன் குரல் உதவி — 2.4 MB!',
      installBtn: 'நிறுவவும்',
      guideBtn: 'வழிகாட்டி',
    },
    gu: {
      badge: 'સત્તાવાર એન્ડ્રોઇડ એપ',
      title: 'કિસાનમિત્ર એન્ડ્રોઇડ એપ ઇન્સ્ટોલ કરો',
      desc: 'ઝડપી બજાર ભાવો અને AI ખેતી સલાહ — માત્ર 2.4 MB!',
      installBtn: 'ઇન્સ્ટોલ કરો',
      guideBtn: 'માર્ગદર્શિકા',
    },
    bn: {
      badge: 'অফিসিয়াল অ্যান্ড্রয়েড অ্যাপ',
      title: 'কিসানমিত্র অ্যান্ড্রয়েড অ্যাপ ইনস্টল করুন',
      desc: 'দ্রুত মান্ডি রেট ও ভয়েস অ্যাসিস্ট্যান্ট — মাত্র ২.৪ MB!',
      installBtn: 'ইনস্টল করুন',
      guideBtn: 'গাইড',
    },
    pa: {
      badge: 'ਅਧਿਕਾਰਤ ਐਂਡਰੌਇਡ ਐਪ',
      title: 'ਕਿਸਾਨਮਿੱਤਰ ਐਂਡਰੌਇਡ ਐਪ ਇੰਸਟਾਲ ਕਰੋ',
      desc: 'ਤੁਰੰਤ ਮੰਡੀ ਰੇਟ ਅਤੇ ਵੌਇਸ ਅਸਿਸਟੈਂਟ — ਸਿਰਫ਼ 2.4 MB!',
      installBtn: 'ਇੰਸਟਾਲ ਕਰੋ',
      guideBtn: 'ਗਾਈਡ',
    },
    ml: {
      badge: 'ഔദ്യോഗിക ആൻഡ്രോയിഡ് ആപ്പ്',
      title: 'കിസാൻമിത്ര ആൻഡ്രോയിഡ് ആപ്പ് ഇൻസ്റ്റാൾ ചെയ്യുക',
      desc: 'തത്സമയ വിപണി വിലകളും വോയ്‌സ് അസിസ്റ്റന്റും — 2.4 MB മാത്രം!',
      installBtn: 'ഇൻസ്റ്റാൾ ചെയ്യുക',
      guideBtn: 'ഗൈഡ്',
    },
    or: {
      badge: 'ଅଫିସିଆଲ୍ ଆଣ୍ଡ୍ରଏଡ୍ ଆପ୍',
      title: 'କିସାନମିତ୍ର ଆଣ୍ଡ୍ରଏଡ୍ ଆପ୍ ଇନଷ୍ଟଲ୍ କରନ୍ତୁ',
      desc: 'ତତକ୍ଷଣାତ ମଣ୍ଡି ଦର ଏବଂ ଭଏସ୍ ସହାୟକ — ମାତ୍ର 2.4 MB!',
      installBtn: 'ଇନଷ୍ଟଲ୍ କରନ୍ତୁ',
      guideBtn: 'ଗାଇଡ୍',
    },
  };

  const t = textStrings[currentLanguage] || textStrings.en;

  return (
    <>
      <AnimatePresence>
        <motion.div
          id="android-native-install-banner-above-logo"
          initial={{ opacity: 0, height: 0, y: -10 }}
          animate={{ opacity: 1, height: 'auto', y: 0 }}
          exit={{ opacity: 0, height: 0, y: -10 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="relative bg-gradient-to-r from-[#0C1510] via-[#142319] to-[#0A1610] border-b border-[#C2D66E]/30 text-[#E5E9E7] shadow-md z-30 overflow-hidden"
        >
          {/* Subtle green ambient line */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#C2D66E] to-transparent opacity-80" />

          <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2 sm:py-2.5 flex flex-col sm:flex-row items-center justify-between gap-2.5">
            {/* Left Info: App Icon, Android Badge, Standalone Absence Indicator, & Value Proposition */}
            <div className="flex items-center gap-2.5 sm:gap-3.5 w-full sm:w-auto">
              {/* App Icon with Android & SW Indicator */}
              <div className="relative shrink-0">
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-[#1B2920] to-[#0D1812] border border-[#C2D66E]/50 p-1 flex items-center justify-center shadow-md shadow-[#C2D66E]/15">
                  <img
                    src="/pwa-192x192.png"
                    alt="KisanMitra Android App"
                    className="w-full h-full rounded-lg object-contain"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = '/icon.svg';
                    }}
                  />
                </div>
                {/* Android / SW status pulse indicator */}
                <span
                  className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-[#10B981] border-2 border-[#0C1510] flex items-center justify-center shadow-sm"
                  title={isServiceWorkerReady ? 'Service Worker Active (Offline Ready)' : 'PWA Ready'}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                </span>
              </div>

              {/* Text Information */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center flex-wrap gap-1.5 sm:gap-2">
                  <span className="font-bold text-xs sm:text-sm text-[#D4E4BC] tracking-tight">
                    {t.title}
                  </span>
                  <span className="inline-flex items-center gap-1 bg-[#C2D66E]/20 text-[#C2D66E] border border-[#C2D66E]/40 text-[9px] font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wider">
                    <Smartphone className="w-2.5 h-2.5" />
                    <span>{t.badge}</span>
                  </span>
                  {/* Rating / Size Badge */}
                  <span className="hidden md:inline-flex items-center gap-1 text-[10px] text-[#A6B5AD] bg-[#16231C] px-2 py-0.5 rounded-full border border-[#26372D]">
                    <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                    <span className="font-semibold text-white">4.9</span>
                    <span>• 2.4 MB • PWA</span>
                  </span>
                </div>
                <p className="text-[11px] sm:text-xs text-[#9EAEA5] line-clamp-1 mt-0.5">
                  {t.desc}
                </p>
              </div>
            </div>

            {/* Right CTAs: Install Trigger & Close */}
            <div className="flex items-center justify-end gap-2 w-full sm:w-auto shrink-0">
              {/* Service Worker Status Tag (Mobile Compact) */}
              {isServiceWorkerReady && (
                <span className="hidden lg:inline-flex items-center gap-1 text-[10px] text-emerald-400 font-medium bg-emerald-950/40 border border-emerald-800/40 px-2 py-1 rounded-lg">
                  <Zap className="w-3 h-3 text-emerald-400" />
                  <span>SW Cached</span>
                </span>
              )}

              {/* Guide Button */}
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="hidden xs:inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-[#18231D] hover:bg-[#23322A] text-[#C2D66E] border border-[#2D4033] hover:border-[#C2D66E]/40 text-xs font-semibold transition-all cursor-pointer"
                title="Installation instructions"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>{t.guideBtn}</span>
              </button>

              {/* Primary Native Install Button */}
              <motion.button
                id="native-android-install-banner-btn"
                type="button"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                disabled={isInstalling || installSuccess}
                onClick={handleInstallClick}
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 sm:gap-2 px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-gradient-to-r from-[#C2D66E] to-[#A2C44D] hover:from-[#D4E4BC] hover:to-[#B6D860] text-[#0F1411] font-black text-xs sm:text-sm tracking-wide shadow-md shadow-[#C2D66E]/20 transition-all cursor-pointer select-none"
              >
                {installSuccess ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#0F1411]" />
                    <span>इन्स्टॉल झाले!</span>
                  </>
                ) : isInstalling ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-[#0F1411] border-t-transparent rounded-full animate-spin" />
                    <span>थांबा...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>{t.installBtn}</span>
                  </>
                )}
              </motion.button>

              {/* Dismiss Button */}
              <button
                type="button"
                onClick={dismissBanner}
                className="p-1.5 rounded-lg bg-[#141E18] hover:bg-[#212E26] text-[#8E9B94] hover:text-[#E5E9E7] transition-all cursor-pointer shrink-0"
                title="Dismiss banner"
                aria-label="Close Android install banner"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Full Android Install Modal */}
      <AndroidInstallModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        currentLanguage={currentLanguage}
        onInstallDirect={promptInstall}
        isInstallable={isInstallable}
        isAndroid={isAndroid}
        isIOS={isIOS}
      />
    </>
  );
};
