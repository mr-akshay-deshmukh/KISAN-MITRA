import React from 'react';
import { Store, TrendingUp, Truck, BookOpen, FileCheck, AudioWaveform, Sparkles, Compass } from 'lucide-react';
import { LanguageCode } from '../types';
import { translations } from '../utils/translations';

interface BottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  currentLanguage: LanguageCode;
  onOpenVoiceModal: () => void;
  activeOrdersCount: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onTabChange,
  currentLanguage,
  onOpenVoiceModal,
  activeOrdersCount,
}) => {
  const t = translations[currentLanguage] || translations.mr;

  const navItems = [
    {
      id: 'marketplace',
      label: t.marketplace,
      icon: Store,
    },
    {
      id: 'cropAdvisor',
      label: t.cropAdvisor,
      icon: Sparkles,
      badge: 'AI',
    },
    {
      id: 'map',
      label: t.farmDetails,
      icon: Compass,
    },
    {
      id: 'voice',
      label: t.voiceTalk,
      icon: AudioWaveform,
      isSpecialFab: true,
    },
    {
      id: 'forecast',
      label: t.forecast,
      icon: TrendingUp,
    },
    {
      id: 'logistics',
      label: t.logistics,
      icon: Truck,
    },
    {
      id: 'orders',
      label: t.orders,
      icon: FileCheck,
      count: activeOrdersCount,
    },
  ];

  return (
    <nav className="shrink-0 bg-[#0F1411]/95 backdrop-blur-lg border-t border-[#2C3631] pb-safe sm:pb-3 z-40 relative mt-auto w-full">
      <div className="w-full mx-auto grid grid-cols-7 items-end max-w-md px-1 py-1.5 sm:py-2 gap-0">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          if (item.isSpecialFab) {
            return (
              <button
                key={item.id}
                id="bottom-nav-voice-fab"
                onClick={onOpenVoiceModal}
                className="relative -top-3 sm:-top-4 flex flex-col items-center group focus:outline-none w-full"
              >
                <div className="relative">
                  <span className="absolute -inset-1 rounded-full bg-[#C2D66E]/30 blur-xs animate-ping"></span>
                  <div className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#C2D66E] text-[#0F1411] flex items-center justify-center shadow-lg shadow-[#C2D66E]/30 group-active:scale-95 group-hover:scale-105 transition-transform border-[3px] border-[#0F1411]">
                    <AudioWaveform className="w-4 h-4 sm:w-5 sm:h-5 animate-pulse" />
                  </div>
                </div>
                <span className="text-[8px] sm:text-[10px] font-bold uppercase tracking-wider text-[#C2D66E] mt-0.5 whitespace-nowrap text-center">
                  {t.voiceTalk}
                </span>
              </button>
            );
          }

          return (
            <button
              key={item.id}
              id={`nav-tab-${item.id}`}
              onClick={() => onTabChange(item.id)}
              className={`flex flex-col items-center justify-end w-full py-1 transition-all rounded-xl relative ${
                isActive ? 'text-[#C2D66E] font-bold scale-105' : 'text-[#8E9B94] hover:text-[#E5E9E7]'
              }`}
            >
              <div className="relative">
                <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${isActive ? 'text-[#C2D66E] stroke-[2.4]' : 'stroke-[1.6]'}`} />
                {item.badge && (
                  <span className="absolute -top-1.5 -right-2 sm:-right-2 bg-[#C2D66E] text-[#0F1411] font-black text-[7px] px-0.5 sm:px-1 rounded-full uppercase">
                    {item.badge}
                  </span>
                )}
                {typeof item.count === 'number' && item.count > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-[#D4E4BC] text-[#0F1411] font-bold text-[8px] w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full flex items-center justify-center">
                    {item.count}
                  </span>
                )}
              </div>
              <span className="text-[8px] sm:text-[9px] font-medium mt-1 truncate w-[120%] text-center leading-tight tracking-tight scale-90 sm:scale-100 origin-top">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
