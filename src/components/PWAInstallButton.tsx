import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Download, Smartphone, CheckCircle, Sparkles } from 'lucide-react';
import { usePWAInstall } from '../utils/usePWAInstall';
import { LanguageCode } from '../types';
import { AndroidInstallModal } from './AndroidInstallModal';

interface PWAInstallButtonProps {
  currentLanguage: LanguageCode;
  variant?: 'navbar' | 'compact' | 'header-badge' | 'hero';
  className?: string;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  currentLanguage,
  variant = 'navbar',
  className = '',
}) => {
  const { isInstallable, isInstalled, isAndroid, isIOS, isMobile, promptInstall } = usePWAInstall();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // If already installed and running standalone, show a small badge or hide
  if (isInstalled) {
    if (variant === 'navbar' || variant === 'header-badge') {
      return (
        <span className="hidden xs:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[9px] sm:text-[10px] font-bold shrink-0">
          <CheckCircle className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-emerald-400" />
          <span>App Installed</span>
        </span>
      );
    }
    return null;
  }

  const handleInstallClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isInstallable) {
      const accepted = await promptInstall();
      if (!accepted) {
        setIsModalOpen(true);
      }
    } else {
      setIsModalOpen(true);
    }
  };

  const labels = {
    mr: {
      short: 'इन्स्टॉल',
      full: 'ॲप इन्स्टॉल करा',
      android: 'अँड्रॉइड ॲप',
    },
    hi: {
      short: 'इंस्टॉल',
      full: 'ऐप इंस्टॉल करें',
      android: 'एंड्रॉइड ऐप',
    },
    en: {
      short: 'Install',
      full: 'Install Software',
      android: 'Android App',
    },
    kn: {
      short: 'ಸ್ಥಾಪಿಸಿ',
      full: 'ಸಾಫ್ಟ್‌ವೇರ್ ಸ್ಥಾಪಿಸಿ',
      android: 'ಆಂಡ್ರಾಯ್ಡ್ ಆಪ್',
    },
    te: {
      short: 'ఇన్‌స్టాల్',
      full: 'యాప్ ఇన్‌స్టాల్ చేయండి',
      android: 'ఆండ్రాయిడ్ యాప్',
    },
    ta: {
      short: 'நிறுவவும்',
      full: 'ஆப் நிறுவவும்',
      android: 'ஆண்ட்ராய்டு ஆப்',
    },
    gu: {
      short: 'ઇન્સ્ટોલ',
      full: 'એપ ઇન્સ્ટોલ કરો',
      android: 'એન્ડ્રોઇડ એપ',
    },
    bn: {
      short: 'ইনস্টল',
      full: 'অ্যাপ ইনস্টল করুন',
      android: 'অ্যান্ড্রয়েড অ্যাপ',
    },
    pa: {
      short: 'ਇੰਸਟਾਲ',
      full: 'ਐਪ ਇੰਸਟਾਲ ਕਰੋ',
      android: 'ਐਂਡਰੌਇਡ ਐਪ',
    },
    ml: {
      short: 'ഇൻസ്റ്റാൾ',
      full: 'ആപ്പ് ഇൻസ്റ്റാൾ ചെയ്യുക',
      android: 'ആൻഡ്രോയിഡ് ആപ്പ്',
    },
    or: {
      short: 'ଇନଷ୍ଟଲ୍',
      full: 'ଆପ୍ ଇନଷ୍ଟଲ୍ କରନ୍ତୁ',
      android: 'ଆଣ୍ଡ୍ରଏଡ୍ ଆପ୍',
    },
  };

  const l = labels[currentLanguage] || labels.en;

  return (
    <>
      <motion.button
        id="pwa-install-software-btn"
        type="button"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleInstallClick}
        className={`group relative inline-flex items-center gap-1 sm:gap-1.5 rounded-full bg-gradient-to-r from-emerald-500/20 via-[#C2D66E]/25 to-emerald-400/20 hover:from-emerald-500/35 hover:to-[#C2D66E]/40 border border-[#C2D66E]/70 hover:border-[#C2D66E] text-[#D4E4BC] hover:text-[#0F1411] hover:bg-[#C2D66E] px-2 sm:px-2.5 py-1 text-[10px] sm:text-xs font-bold transition-all shadow-sm shadow-[#C2D66E]/20 cursor-pointer shrink-0 select-none ${className}`}
        title={l.full}
        aria-label={l.full}
      >
        {/* Pulsing indicator dot */}
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#C2D66E] opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-[#10B981]" />
        </span>

        {/* Android or Download Icon */}
        <Smartphone className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#C2D66E] group-hover:text-[#0F1411] transition-colors" />

        <span className="font-extrabold tracking-tight">
          {variant === 'compact' ? l.short : (
            <>
              <span className="hidden sm:inline">{l.full}</span>
              <span className="sm:hidden">{l.short}</span>
            </>
          )}
        </span>

        {/* Small "APK" or "App" tag */}
        <span className="bg-[#10B981]/25 group-hover:bg-[#0F1411]/20 text-[#C2D66E] group-hover:text-[#0F1411] text-[8px] font-black px-1 rounded uppercase tracking-wider hidden xs:inline transition-colors">
          APK
        </span>
      </motion.button>

      {/* Android & Mobile Install Guide Modal */}
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
