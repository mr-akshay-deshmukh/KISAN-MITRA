import React, { useEffect, useState } from 'react';
import { WifiOff } from 'lucide-react';
import { LanguageCode } from '../types';

interface OfflineIndicatorProps {
  currentLanguage?: LanguageCode;
}

export const OfflineIndicator: React.FC<OfflineIndicatorProps> = ({ currentLanguage = 'mr' }) => {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) return null;

  const messages = {
    mr: 'ऑफलाइन मोड — सेव्ह केलेला डेटा वापरला जात आहे.',
    hi: 'ऑफलाइन मोड — सहेजा गया डेटा उपयोग किया जा रहा है।',
    en: 'Offline Mode — Using locally cached data.',
    kn: 'ಆಫ್‌ಲೈನ್ ಮೋಡ್ — ಸಂಗ್ರಹಿಸಲಾದ ಡೇಟಾ ಬಳಸಲಾಗುತ್ತಿದೆ.',
    te: 'ఆఫ్‌లైన్ మోడ్ — కాష్ చేసిన డేటా ఉపయోగించబడుతోంది.',
    ta: 'ஆஃப்லைன் முறை — சேமிக்கப்பட்ட தரவு பயன்படுத்தப்படுகிறது.',
    gu: 'ઓફલાઇન મોડ — સાચવેલો ડેટા વપરાઈ રહ્યો છે.',
    bn: 'অফলাইন মোড — সংরক্ষিত ডেটা ব্যবহৃত হচ্ছে।',
    pa: 'ਔਫਲਾਈਨ ਮੋਡ — ਸੁਰੱਖਿਅਤ ਡਾਟਾ ਵਰਤਿਆ ਜਾ ਰਿਹਾ ਹੈ।',
    ml: 'ഓഫ്‌ലൈൻ മോഡ് — കാഷെ ചെയ്ത ഡാറ്റ ഉപയോഗിക്കുന്നു.',
    or: 'ଅଫଲାଇନ୍ ମୋଡ୍ — ସଂରକ୍ଷିତ ଡାଟା ବ୍ୟବହୃତ ହେଉଛି।',
  };

  return (
    <div className="fixed bottom-20 left-4 z-50 flex items-center gap-2 rounded-xl bg-amber-600/90 backdrop-blur-md border border-amber-400/40 px-3.5 py-2 text-xs font-semibold text-white shadow-2xl animate-fade-in">
      <span className="h-2.5 w-2.5 rounded-full bg-white animate-pulse" />
      <WifiOff className="w-4 h-4 text-amber-100" />
      <span>{messages[currentLanguage] || messages.en}</span>
    </div>
  );
};
