import React, { useState } from 'react';
import { Camera, Calculator, Droplets, MapPin, BarChart3, Radio, Smartphone, Maximize2, Minimize2 } from 'lucide-react';
import { AppThemeConfig } from '../types';
import { triggerHaptic } from './VoiceReader';

export type TabType = 'scanner' | 'calculator' | 'sprinkler' | 'field_map' | 'analytics' | 'offline_sync';

interface MobileContainerProps {
  children: React.ReactNode;
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  themeConfig: AppThemeConfig;
  unsyncedCount: number;
}

export const MobileContainer: React.FC<MobileContainerProps> = ({
  children,
  activeTab,
  onTabChange,
  themeConfig,
  unsyncedCount,
}) => {
  const [frameMode, setFrameMode] = useState<boolean>(true); // Frame simulator vs expanded screen
  const isHighContrast = themeConfig.highContrastOutdoor;
  const isEco = themeConfig.batterySaverEco;

  const tabs = [
    { id: 'scanner', label: 'SCAN', icon: Camera, badge: 0 },
    { id: 'calculator', label: 'CALC', icon: Calculator, badge: 0 },
    { id: 'sprinkler', label: 'SPRAY', icon: Droplets, badge: 0 },
    { id: 'field_map', label: 'MAP', icon: MapPin, badge: 0 },
    { id: 'analytics', label: 'SAVINGS', icon: BarChart3, badge: 0 },
    { id: 'offline_sync', label: 'SYNC', icon: Radio, badge: unsyncedCount },
  ];


  return (
    <div
      className={`min-h-screen transition-colors duration-200 flex flex-col items-center justify-start ${
        isHighContrast
          ? 'bg-[#080C0E] text-[#E2E8F0] font-sans'
          : isEco
          ? 'bg-[#080C0E] text-[#00FF88] font-sans'
          : 'bg-[#080C0E] text-[#E2E8F0] font-sans'
      }`}
    >
      {/* Viewport Frame Toggle Header Bar for Desktop Testing */}
      <div className="w-full max-w-md px-4 py-1.5 flex items-center justify-between text-[11px] text-[#94A3B8] border-b border-[#1E293B] bg-[#080C0E]">
        <div className="flex items-center gap-1.5">
          <Smartphone className="w-3.5 h-3.5 text-[#00FF88]" />
          <span className="font-bold uppercase tracking-wider text-[10px]">OLED Bio-Tech System</span>
        </div>
        <button
          onClick={() => setFrameMode(!frameMode)}
          className="hover:text-white transition-colors flex items-center gap-1 text-[10px] uppercase tracking-wider font-bold"
        >
          {frameMode ? (
            <>
              <Maximize2 className="w-3 h-3 text-[#00E5FF]" />
              <span>Full Screen</span>
            </>
          ) : (
            <>
              <Minimize2 className="w-3 h-3 text-[#00E5FF]" />
              <span>Mobile Frame</span>
            </>
          )}
        </button>
      </div>

      {/* Main Content Area framed like a Smartphone Screen */}
      <div
        className={`w-full flex-1 flex flex-col ${
          frameMode
            ? 'max-w-md my-0 sm:my-3 sm:rounded-[36px] sm:border sm:border-[#1E293B] sm:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.9)] overflow-hidden min-h-[820px] relative'
            : 'max-w-xl'
        } ${
          isHighContrast
            ? 'bg-[#080C0E] border-[#00FF88]'
            : isEco
            ? 'bg-[#080C0E] border-[#1E293B]'
            : 'bg-[#080C0E] border-[#1E293B]'
        }`}
      >
        {/* Children Views */}
        <div className="flex-1 flex flex-col overflow-y-auto pb-20">{children}</div>

        {/* Bottom Navigation Dock Bar */}
        <nav
          className={`sticky bottom-0 left-0 right-0 border-t z-40 transition-colors ${
            isHighContrast
              ? 'bg-[#10171D] text-[#E2E8F0] border-t-2 border-[#00FF88] font-bold backdrop-blur-xl'
              : isEco
              ? 'bg-[#10171D] text-[#00FF88] border-t border-[#1E293B]'
              : 'bg-[#10171D] text-[#E2E8F0] border-t border-[#1E293B] backdrop-blur-2xl shadow-2xl'
          }`}
        >
          <div className="flex items-center justify-around py-2 px-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    triggerHaptic(30);
                    onTabChange(tab.id as TabType);
                  }}
                  className={`flex flex-col items-center justify-center py-1.5 px-2 rounded-2xl min-w-[64px] min-h-[52px] transition-all relative ${
                    isActive
                      ? 'bg-[#10171D] text-[#00FF88] font-black border-[1.5px] border-[#00FF88] shadow-[0_0_12px_rgba(0,255,136,0.25)] scale-105'
                      : 'text-[#94A3B8] hover:text-[#E2E8F0] hover:bg-[#1E293B]/40'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5] text-[#00FF88]' : 'stroke-[1.8] text-[#94A3B8]'}`} />
                  <span
                    className={`text-[9px] mt-1 tracking-tight uppercase whitespace-nowrap ${
                      isActive ? 'font-black text-[#00FF88]' : 'font-medium text-[#94A3B8]'
                    }`}
                  >
                    {tab.label}
                  </span>

                  {/* Badge */}
                  {tab.badge > 0 && (
                    <span
                      className="absolute -top-1 -right-1 px-1.5 py-0.2 rounded-full text-[9px] font-black bg-[#FF3B30] text-white shadow-sm"
                    >
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );
};
