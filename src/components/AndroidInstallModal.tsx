import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Download,
  Smartphone,
  CheckCircle2,
  X,
  Share2,
  PlusSquare,
  Sparkles,
  WifiOff,
  Mic,
  TrendingUp,
  ShieldCheck,
  ExternalLink,
  ChevronRight,
  Info
} from 'lucide-react';
import { LanguageCode } from '../types';

interface AndroidInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLanguage: LanguageCode;
  onInstallDirect: () => Promise<boolean>;
  isInstallable: boolean;
  isAndroid: boolean;
  isIOS: boolean;
}

export const AndroidInstallModal: React.FC<AndroidInstallModalProps> = ({
  isOpen,
  onClose,
  currentLanguage,
  onInstallDirect,
  isInstallable,
  isAndroid,
  isIOS,
}) => {
  const [installing, setInstalling] = useState(false);
  const [installSuccess, setInstallSuccess] = useState(false);

  if (!isOpen) return null;

  const handleInstallClick = async () => {
    setInstalling(true);
    const success = await onInstallDirect();
    setInstalling(false);
    if (success) {
      setInstallSuccess(true);
      setTimeout(() => {
        onClose();
        setInstallSuccess(false);
      }, 2000);
    }
  };

  // Localized texts
  const titles = {
    mr: 'किसानमित्र सॉफ्टवेअर इन्स्टॉल करा',
    hi: 'किसानमित्र सॉफ्टवेयर इंस्टॉल करें',
    en: 'Install KisanMitra Software',
    kn: 'ಕಿಸಾನ್‌ಮಿತ್ರ ಸಾಫ್ಟ್‌ವೇರ್ ಸ್ಥಾಪಿಸಿ',
    te: 'కిసాన్‌మిత్ర సాఫ్ట్‌వేర్‌ను ఇన్‌స్టాల్ చేయండి',
    ta: 'கிசான்மித்ரா மென்பொருளை நிறுவவும்',
    gu: 'કિસાનમિત્ર સોફ્ટવેર ઇન્સ્ટોલ કરો',
    bn: 'কিসানমিত্র সফটওয়্যার ইনস্টল করুন',
    pa: 'ਕਿਸਾਨਮਿੱਤਰ ਸਾਫਟਵੇਅਰ ਇੰਸਟਾਲ ਕਰੋ',
    ml: 'കിസാൻമിത്ര സോഫ്റ്റ്‌വെയർ ഇൻസ്റ്റാൾ ചെയ്യുക',
    or: 'କିସାନମିତ୍ର ସଫ୍ଟୱେର୍ ଇନଷ୍ଟଲ୍ କରନ୍ତୁ',
  };

  const subtitles = {
    mr: 'तुमच्या अँड्रॉइड किंवा मोबाईलवर एका क्लिकमध्ये मोफत इन्स्टॉल करा — थेट होम स्क्रीनवरून वापरा!',
    hi: 'अपने एंड्रॉइड या मोबाइल पर 1-क्लिक में मुफ्त इंस्टॉल करें — सीधे होम स्क्रीन से चलाएं!',
    en: '1-Click Free Install for Android & Mobile — Access instantly from your home screen!',
    kn: 'ನಿಮ್ಮ ಆಂಡ್ರಾಯ್ಡ್ ಮೊಬೈಲ್‌ನಲ್ಲಿ ಉಚಿತವಾಗಿ ಸ್ಥಾಪಿಸಿ — ಮುಖಪುಟದಿಂದ ನೇರವಾಗಿ ಬಳಸಿ!',
    te: 'మీ ఆండ్రాయిడ్ మొబైల్‌లో ఉచితంగా ఇన్‌స్టాల్ చేయండి — హోమ్ స్క్రీన్ నుండి నేరుగా వాడండి!',
    ta: 'உங்கள் ஆண்ட்ராய்டு மொபைலில் இலவசமாக நிறுவவும்!',
    gu: 'તમારા એન્ડ્રોઇડ મોબાઇલમાં મફત ઇન્સ્ટોલ કરો!',
    bn: 'আপনার অ্যান্ড্রয়েড মোবাইলে বিনামূল্যে ইনস্টল করুন!',
    pa: 'ਆਪਣੇ ਐਂਡਰੌਇਡ ਮੋਬਾਈਲ ਤੇ ਮੁਫਤ ਇੰਸਟਾਲ ਕਰੋ!',
    ml: 'നിങ്ങളുടെ ആൻഡ്രോയിഡ് ഫോണിൽ ഇൻസ്റ്റാൾ ചെയ്യുക!',
    or: 'ଆପଣଙ୍କ ଆଣ୍ଡ୍ରଏଡ୍ ମୋବାଇଲ୍‌ରେ ମାଗଣାରେ ଇନଷ୍ଟଲ୍ କରନ୍ତୁ!',
  };

  const btnText = {
    mr: 'आत्ताच ॲप इन्स्टॉल करा (मोफत)',
    hi: 'अभी ऐप इंस्टॉल करें (मुफ्त)',
    en: 'Install App Now (Free)',
    kn: 'ಈಗಲೇ ಸ್ಥಾಪಿಸಿ',
    te: 'ఇప్పుడే ఇన్‌స్టాల్ చేయండి',
    ta: 'இப்போதே நிறுவவும்',
    gu: 'હમણાં જ ઇન્સ્ટોલ કરો',
    bn: 'এখনই ইনস্টল করুন',
    pa: 'ਹੁਣੇ ਇੰਸਟਾਲ ਕਰੋ',
    ml: 'ഇപ്പോൾ ഇൻസ്റ്റാൾ ചെയ്യുക',
    or: 'ବର୍ତ୍ତମାନ ଇନଷ୍ଟଲ୍ କରନ୍ତୁ',
  };

  const currentTitle = titles[currentLanguage] || titles.en;
  const currentSubtitle = subtitles[currentLanguage] || subtitles.en;
  const currentBtnText = btnText[currentLanguage] || btnText.en;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 20 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="relative w-full max-w-lg bg-[#141C17] border border-[#C2D66E]/40 rounded-3xl p-5 sm:p-6 shadow-2xl text-[#E5E9E7] overflow-hidden my-auto ring-1 ring-[#C2D66E]/20"
        >
          {/* Top Background Glow Effect */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-72 h-32 bg-[#C2D66E]/15 blur-3xl pointer-events-none" />

          {/* Close Button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-[#1F2A23] hover:bg-[#2C3B32] text-[#8E9B94] hover:text-[#E5E9E7] transition-all cursor-pointer z-10"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Logo & App Identification Banner */}
          <div className="flex items-center gap-3.5 mb-5">
            <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-[#1E2E24] to-[#0D1610] border-2 border-[#C2D66E] flex items-center justify-center shadow-lg shadow-[#C2D66E]/20 shrink-0 p-1">
              <img
                src="/pwa-192x192.png"
                alt="KisanMitra Logo"
                className="w-full h-full rounded-xl object-contain"
                onError={(e) => {
                  // Fallback to SVG if png not loaded
                  (e.currentTarget as HTMLImageElement).src = '/icon.svg';
                }}
              />
              <span className="absolute -bottom-1 -right-1 bg-[#10B981] text-black text-[9px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-wider border border-white/20">
                APK/PWA
              </span>
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-serif italic font-bold text-xl sm:text-2xl text-[#D4E4BC] tracking-tight truncate">
                  KisanMitra
                </h3>
                <span className="bg-[#C2D66E]/20 text-[#C2D66E] border border-[#C2D66E]/40 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Android & Web
                </span>
              </div>
              <p className="text-xs text-[#8E9B94] mt-0.5 line-clamp-1 font-medium">
                {currentSubtitle}
              </p>
            </div>
          </div>

          {/* Key Advantages Grid */}
          <div className="grid grid-cols-2 gap-2.5 mb-5 text-xs">
            <div className="flex items-start gap-2 p-2.5 rounded-xl bg-[#0F1612] border border-[#233529]">
              <div className="p-1.5 rounded-lg bg-[#C2D66E]/15 text-[#C2D66E] shrink-0 mt-0.5">
                <Smartphone className="w-4 h-4" />
              </div>
              <div>
                <div className="font-bold text-[#E5E9E7]">1-Tap Fast Launch</div>
                <div className="text-[11px] text-[#8E9B94]">Direct home screen icon without typing URL</div>
              </div>
            </div>

            <div className="flex items-start gap-2 p-2.5 rounded-xl bg-[#0F1612] border border-[#233529]">
              <div className="p-1.5 rounded-lg bg-emerald-500/15 text-emerald-300 shrink-0 mt-0.5">
                <Mic className="w-4 h-4" />
              </div>
              <div>
                <div className="font-bold text-[#E5E9E7]">Voice AI Assistant</div>
                <div className="text-[11px] text-[#8E9B94]">Hands-free speaking in Marathi, Hindi & 10+ languages</div>
              </div>
            </div>

            <div className="flex items-start gap-2 p-2.5 rounded-xl bg-[#0F1612] border border-[#233529]">
              <div className="p-1.5 rounded-lg bg-amber-500/15 text-amber-300 shrink-0 mt-0.5">
                <WifiOff className="w-4 h-4" />
              </div>
              <div>
                <div className="font-bold text-[#E5E9E7]">Offline Capable</div>
                <div className="text-[11px] text-[#8E9B94]">Works smoothly in low network farm fields</div>
              </div>
            </div>

            <div className="flex items-start gap-2 p-2.5 rounded-xl bg-[#0F1612] border border-[#233529] hover:border-emerald-500/40 transition-colors">
              <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shrink-0 mt-0.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
              </div>
              <div>
                <div className="font-bold text-emerald-300 flex items-center gap-1.5">
                  <span>Safe & Lightweight</span>
                  <span className="bg-emerald-500/20 text-emerald-300 text-[9px] font-black px-1.5 py-0.2 rounded uppercase">100% Safe</span>
                </div>
                <div className="text-[11px] text-[#A6B5AD]">&lt; 2 MB size, zero background battery drain</div>
              </div>
            </div>
          </div>

          {/* Direct Install CTA button if browser triggered prompt */}
          {isInstallable ? (
            <div className="mb-4">
              <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={installing || installSuccess}
                onClick={handleInstallClick}
                className="w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-[#C2D66E] via-[#A8C750] to-[#10B981] hover:from-[#D4E4BC] hover:to-[#34D399] text-[#0F1411] font-black text-sm sm:text-base flex items-center justify-center gap-2.5 shadow-lg shadow-[#C2D66E]/25 transition-all cursor-pointer uppercase tracking-wider"
              >
                {installSuccess ? (
                  <>
                    <CheckCircle2 className="w-5 h-5 text-[#0F1411]" />
                    <span>इन्स्टॉलेशन यशस्वी! (Installed)</span>
                  </>
                ) : installing ? (
                  <>
                    <div className="w-5 h-5 border-2 border-[#0F1411] border-t-transparent rounded-full animate-spin" />
                    <span>इन्स्टॉल होत आहे...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-5 h-5 stroke-[2.5]" />
                    <span>{currentBtnText}</span>
                  </>
                )}
              </motion.button>
            </div>
          ) : null}

          {/* Android Step-by-Step Instructions (Works on all mobile browsers) */}
          <div className="p-3.5 rounded-2xl bg-[#0B100D] border border-[#233529] space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-bold text-[#C2D66E] uppercase tracking-wider">
              <Info className="w-4 h-4" />
              <span>
                {isIOS
                  ? 'iPhone / iPad वर इन्स्टॉल कसे करावे'
                  : 'अँड्रॉइड फोनवर इन्स्टॉल करण्याची सोपी पद्धत (2 Steps)'}
              </span>
            </div>

            {isIOS ? (
              <div className="space-y-2 text-xs text-[#CBD5E1]">
                <div className="flex items-start gap-2.5 bg-[#141C17] p-2.5 rounded-xl border border-[#233529]">
                  <span className="w-5 h-5 rounded-full bg-[#C2D66E]/20 text-[#C2D66E] font-bold flex items-center justify-center shrink-0 text-xs">
                    1
                  </span>
                  <div>
                    Safari मध्ये खालील <Share2 className="w-3.5 h-3.5 inline mx-1 text-blue-400" /> <strong>Share (शेअर)</strong> बटनावर टॅप करा.
                  </div>
                </div>
                <div className="flex items-start gap-2.5 bg-[#141C17] p-2.5 rounded-xl border border-[#233529]">
                  <span className="w-5 h-5 rounded-full bg-[#C2D66E]/20 text-[#C2D66E] font-bold flex items-center justify-center shrink-0 text-xs">
                    2
                  </span>
                  <div>
                    खाली स्क्रोल करा आणि <PlusSquare className="w-3.5 h-3.5 inline mx-1 text-[#C2D66E]" /> <strong>"Add to Home Screen"</strong> निवडा.
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-2 text-xs text-[#CBD5E1]">
                <div className="flex items-start gap-2.5 bg-[#141C17] p-2.5 rounded-xl border border-[#233529]">
                  <span className="w-5 h-5 rounded-full bg-[#C2D66E]/20 text-[#C2D66E] font-bold flex items-center justify-center shrink-0 text-xs">
                    1
                  </span>
                  <div>
                    ब्राउझरच्या उजव्या कोपऱ्यातील तीन बिंदूंवर <strong>(⋮ Menu)</strong> किंवा खालील <strong>"Install / ॲड टू होम स्क्रीन"</strong> वर टॅप करा.
                  </div>
                </div>
                <div className="flex items-start gap-2.5 bg-[#141C17] p-2.5 rounded-xl border border-[#233529]">
                  <span className="w-5 h-5 rounded-full bg-[#C2D66E]/20 text-[#C2D66E] font-bold flex items-center justify-center shrink-0 text-xs">
                    2
                  </span>
                  <div>
                    <strong>"Install app"</strong> किंवा <strong>"Add to Home screen"</strong> बटण दाबून Confirm करा.
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer Action */}
          <div className="mt-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 text-[11px] text-[#8E9B94]">
              <Sparkles className="w-3.5 h-3.5 text-[#C2D66E]" />
              <span>Official KisanMitra PWA v2.4</span>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 rounded-xl bg-[#1E2822] hover:bg-[#2A372F] text-xs font-semibold text-[#E5E9E7] transition-all cursor-pointer"
            >
              समजले (Close)
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
