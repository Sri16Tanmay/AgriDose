import React, { useState } from 'react';
import { Wifi, WifiOff, RefreshCw, BatteryCharging, Zap, Globe, ShieldAlert, CheckCircle, Smartphone } from 'lucide-react';
import { AppThemeConfig, PlantScanRecord } from '../types';
import { OfflineStorageService } from '../services/offlineStorage';
import { triggerHaptic } from './VoiceReader';

interface OfflineSyncViewProps {
  themeConfig: AppThemeConfig;
  onUpdateTheme: (updated: Partial<AppThemeConfig>) => void;
  isOnline: boolean;
  onToggleSimulatedOffline: () => void;
  unsyncedQueue: PlantScanRecord[];
  onSyncCompleted: () => void;
  batteryLevel: number;
}

export const OfflineSyncView: React.FC<OfflineSyncViewProps> = ({
  themeConfig,
  onUpdateTheme,
  isOnline,
  onToggleSimulatedOffline,
  unsyncedQueue,
  onSyncCompleted,
  batteryLevel,
}) => {
  const [syncing, setSyncing] = useState<boolean>(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);

  const isHighContrast = themeConfig.highContrastOutdoor;
  const isEco = themeConfig.batterySaverEco;

  const handleSyncNow = async () => {
    triggerHaptic([50, 50, 50]);
    setSyncing(true);
    setSyncMessage(null);

    try {
      const response = await fetch('/api/sync-scans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scans: unsyncedQueue }),
      });

      const data = await response.json();
      if (data.success) {
        // Mark items as synced in storage
        const ids = unsyncedQueue.map((q) => q.id);
        OfflineStorageService.markAsSynced(ids);
        onSyncCompleted();
        setSyncMessage(`Successfully synchronized ${ids.length} field scans to central server.`);
      } else {
        throw new Error('Sync failed');
      }
    } catch (e) {
      setSyncMessage('Sync postponed. Will auto-retry when connection stabilizes.');
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="p-4 space-y-4">
      {/* Title Header */}
      <div>
        <span className="text-[10px] text-emerald-400 font-extrabold uppercase tracking-wider block">
          FIELD CONVERGENCE & POWER
        </span>
        <h2 className="text-base font-black text-white">Offline Sync & Battery Optimization</h2>
      </div>

      {/* Connection Mode Card */}
      <div className="p-4 rounded-3xl bg-[#10171D] border border-[#1E293B] text-[#E2E8F0] shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isOnline ? (
              <Wifi className="w-5 h-5 text-emerald-400 stroke-[2.5]" />
            ) : (
              <WifiOff className="w-5 h-5 text-amber-400 stroke-[2.5]" />
            )}
            <div>
              <h3 className="text-sm font-black text-white">
                {isOnline ? 'Online Cloud Mode' : 'Remote Field Offline Mode'}
              </h3>
              <p className="text-[10px] text-zinc-400 font-medium">
                {isOnline ? 'Direct Gemini AI & Live Cloud Sync Active' : 'Local Agronomic Heuristic AI Engine Active'}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              triggerHaptic(40);
              onToggleSimulatedOffline();
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
              isOnline
                ? 'bg-[#0B1218] text-[#00E5FF] border-[#1E293B] hover:border-[#00E5FF]/50'
                : 'bg-[#00FF88] text-black border-[#00FF88] font-extrabold shadow-[0_0_12px_rgba(0,255,136,0.3)]'
            }`}
          >
            {isOnline ? 'Simulate Offline' : 'Go Online'}
          </button>
        </div>

        {/* Offline Queue Status Pill */}
        <div className="bg-[#0B1218] p-3 rounded-2xl border border-[#1E293B] flex items-center justify-between">
          <div>
            <span className="text-[10px] text-[#94A3B8] font-bold uppercase block">Pending Scans Queue</span>
            <p className="text-sm font-black text-[#00FF88]">{unsyncedQueue.length} Scans Saved Locally</p>
          </div>

          <button
            onClick={handleSyncNow}
            disabled={syncing || unsyncedQueue.length === 0 || !isOnline}
            className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 border shadow-md transition-all ${
              unsyncedQueue.length > 0 && isOnline
                ? 'bg-emerald-600 text-white border-emerald-400 hover:bg-emerald-500'
                : 'bg-zinc-800 text-zinc-500 border-zinc-700 cursor-not-allowed'
            }`}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
            <span>{syncing ? 'SYNCING...' : 'SYNC NOW'}</span>
          </button>
        </div>

        {syncMessage && (
          <p className="text-xs font-bold text-emerald-400 bg-emerald-950/80 p-2 rounded-xl border border-emerald-700 text-center">
            {syncMessage}
          </p>
        )}
      </div>

      {/* Field Worker Battery & Power Consumption Settings */}
      <div
        className={`p-4 rounded-3xl border space-y-3 ${
          isHighContrast
            ? 'bg-black text-white border-yellow-400'
            : isEco
            ? 'bg-zinc-950 border-emerald-900 text-emerald-100'
            : 'glass-card border-emerald-500/25 text-white shadow-xl backdrop-blur-xl'
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-emerald-400 stroke-[2.5]" />
            <div>
              <h3 className="text-sm font-black text-white">12-Hour Battery Saver Mode</h3>
              <p className="text-[10px] text-zinc-400">Extends field operating time for older devices</p>
            </div>
          </div>

          <button
            onClick={() => {
              triggerHaptic(40);
              onUpdateTheme({ batterySaverEco: !themeConfig.batterySaverEco });
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold border ${
              isEco
                ? 'bg-emerald-500 text-black border-emerald-300 font-extrabold'
                : 'bg-zinc-800 text-zinc-300 border-zinc-700'
            }`}
          >
            {isEco ? 'ECO ON' : 'ECO OFF'}
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="bg-zinc-950 p-2.5 rounded-2xl border border-zinc-800">
            <span className="text-[10px] text-zinc-400 font-bold uppercase block">Battery Remaining</span>
            <span className="text-base font-black text-emerald-400">{batteryLevel}%</span>
          </div>
          <div className="bg-zinc-950 p-2.5 rounded-2xl border border-zinc-800">
            <span className="text-[10px] text-zinc-400 font-bold uppercase block">Est. Field Shift</span>
            <span className="text-base font-black text-amber-300">~14.5 Hours</span>
          </div>
        </div>
      </div>

      {/* Multilingual Voice Readout Selector for Non-Technical Field Workers */}
      <div className="p-4 rounded-3xl bg-[#10171D] border border-[#1E293B] text-[#E2E8F0] space-y-3">
        <div className="flex items-center gap-2">
          <Globe className="w-5 h-5 text-sky-400 stroke-[2.5]" />
          <div>
            <h3 className="text-sm font-black text-white">Voice & Audio Accessibility</h3>
            <p className="text-[10px] text-zinc-400">Audio readouts for non-technical field operators</p>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-zinc-300">Audio Prompts</span>
          <button
            onClick={() => {
              triggerHaptic(40);
              onUpdateTheme({ voiceAudioEnabled: !themeConfig.voiceAudioEnabled });
            }}
            className={`px-3 py-1 rounded-xl text-xs font-bold border ${
              themeConfig.voiceAudioEnabled
                ? 'bg-emerald-600 text-white border-emerald-400'
                : 'bg-zinc-800 text-zinc-400 border-zinc-700'
            }`}
          >
            {themeConfig.voiceAudioEnabled ? 'ENABLED' : 'DISABLED'}
          </button>
        </div>
      </div>
    </div>
  );
};
