import React, { useState, useEffect } from 'react';
import { Wifi, Battery, SignalHigh } from 'lucide-react';

export const AndroidStatusBar: React.FC = () => {
  const [time, setTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: false }));
    };
    updateTime();
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full h-8 bg-[#0F1411] flex items-center justify-between px-6 z-50 shrink-0 select-none">
      <div className="text-[12px] font-medium text-[#E5E9E7] tracking-wider">{time}</div>
      <div className="flex items-center gap-1.5 text-[#E5E9E7]">
        <SignalHigh className="w-3.5 h-3.5" />
        <Wifi className="w-3.5 h-3.5" />
        <div className="flex items-center gap-0.5 ml-0.5">
          <Battery className="w-4 h-4" />
        </div>
      </div>
    </div>
  );
};
