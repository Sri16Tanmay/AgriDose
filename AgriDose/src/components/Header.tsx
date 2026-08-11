import React from 'react';
import {
  Sun,
  Zap,
  Wifi,
  WifiOff,
  Sprout,
  ShieldAlert,
  BatteryCharging,
} from 'lucide-react';
import { AppThemeConfig } from '../types';
import { triggerHaptic } from './VoiceReader';

interface HeaderProps {
  themeConfig: AppThemeConfig;
  onUpdateTheme: (updated: Partial<AppThemeConfig>) => void;
  isOnline: boolean;
  unsyncedCount: number;
  batteryLevel: number;
}

export const Header: React.FC<HeaderProps> = ({
  themeConfig,
  onUpdateTheme,
  isOnline,
  unsyncedCount,
  batteryLevel,
}) => {
  const isHighContrast = themeConfig.highContrastOutdoor;
  const isEco = themeConfig.batterySaverEco;

  return (
    <header
      className={`w-full transition-colors duration-200 relative z-30 ${
        isHighContrast
          ? 'bg-black text-[#E2E8F0] border-b-2 border-[#00FF88] font-bold backdrop-blur-xl'
          : isEco
          ? 'bg-[#080C0E] text-[#00FF88] border-b border-[#1E293B]'
          : 'bg-[#10171D] text-[#E2E8F0] border-b border-[#1E293B] backdrop-blur-xl shadow-2xl'
      }`}
    >
      <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
        {/* Brand & Title */}
        <div className="flex items-center gap-2.5">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all ${
              isHighContrast
                ? 'bg-[#00FF88] text-black border-[#00FF88] font-black'
                : 'bg-[#0B1218] text-[#00FF88] border-[#00FF88]/40 shadow-[0_0_15px_rgba(0,255,136,0.2)]'
            }`}
          >
            <Sprout className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <h1 className="text-lg font-black tracking-tight leading-none text-[#E2E8F0] flex items-center">
              Agr
              <span className="relative inline-block text-[#E2E8F0]">
                i
                <span className="absolute -top-0.5 right-0.2 w-1.5 h-1.5 rounded-full bg-[#00FF88] shadow-[0_0_8px_#00FF88]" />
              </span>
              Dose
            </h1>
            <p className="text-[10px] uppercase font-bold tracking-wider text-[#94A3B8] mt-0.5">
              Precision Dosage & Infection AI
            </p>
          </div>
        </div>

        {/* Quick Field Mode Controls */}
        <div className="flex items-center gap-1.5">
          {/* Online/Offline Badge */}
          <div
            className={`px-2.5 py-1 rounded-full text-[11px] font-extrabold flex items-center gap-1.5 border transition-all ${
              isOnline
                ? 'bg-[rgba(0,229,255,0.1)] text-[#00E5FF] border-[#00E5FF]/30 shadow-[0_0_12px_rgba(0,229,255,0.15)]'
                : 'bg-[rgba(255,59,48,0.15)] text-[#FF3B30] border-[#FF3B30]/40 shadow-[0_0_12px_rgba(255,59,48,0.2)]'
            }`}
            title={isOnline ? 'Connected to Network' : 'Offline Mode (Local AI Heuristics Active)'}
          >
            <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${isOnline ? 'bg-[#00E5FF]' : 'bg-[#FF3B30]'}`} />
            {isOnline ? <Wifi className="w-3.5 h-3.5 stroke-[2.5]" /> : <WifiOff className="w-3.5 h-3.5 stroke-[2.5]" />}
            <span className="hidden sm:inline tracking-wider">{isOnline ? 'ONLINE' : 'OFFLINE'}</span>
            {unsyncedCount > 0 && (
              <span className="ml-1 bg-[#00FF88] text-black px-1.5 py-0.2 rounded-full text-[10px] font-black">
                {unsyncedCount}
              </span>
            )}
          </div>

          {/* Direct Sunlight High Contrast Mode Toggle */}
          <button
            onClick={() => {
              triggerHaptic(40);
              onUpdateTheme({ highContrastOutdoor: !themeConfig.highContrastOutdoor });
            }}
            className={`p-2 rounded-xl transition-all border ${
              isHighContrast
                ? 'bg-[#00FF88] text-black border-[#00FF88] shadow-[0_0_15px_rgba(0,255,136,0.4)]'
                : 'bg-[#0B1218] text-[#00E5FF] hover:text-[#00FF88] border-[#1E293B] hover:border-[#00E5FF]/50'
            }`}
            title="Toggle Direct Sunlight High-Contrast OLED Mode"
          >
            <Sun className="w-4 h-4 stroke-[2.5]" />
          </button>

          {/* Eco Battery Saver Mode Toggle */}
          <button
            onClick={() => {
              triggerHaptic(40);
              onUpdateTheme({ batterySaverEco: !themeConfig.batterySaverEco });
            }}
            className={`p-2 rounded-xl transition-all border ${
              isEco
                ? 'bg-[#00FF88] text-black border-[#00FF88] shadow-[0_0_15px_rgba(0,255,136,0.4)]'
                : 'bg-[#0B1218] text-[#94A3B8] hover:text-[#00FF88] border-[#1E293B] hover:border-[#00FF88]/50'
            }`}
            title="Toggle Low-Power Battery Saver Eco Mode"
          >
            <Zap className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>
      </div>

      {/* Battery status bar indicator in Eco mode */}
      {isEco && (
        <div className="bg-[#080C0E] px-4 py-1 border-t border-[#1E293B] flex items-center justify-between text-[11px] font-semibold text-[#00FF88]">
          <div className="flex items-center gap-1.5">
            <BatteryCharging className="w-3.5 h-3.5 text-[#00FF88]" />
            <span>OLED ECO POWER OPTIMIZED</span>
          </div>
          <span className="text-[#E2E8F0]">{batteryLevel}% Field Power</span>
        </div>
      )}
    </header>
  );
};
