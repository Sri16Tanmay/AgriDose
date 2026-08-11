import React, { useState } from 'react';
import { MapPin, AlertCircle, CheckCircle2, ShieldAlert, Sparkles, Filter, Layers, RefreshCw } from 'lucide-react';
import { AppThemeConfig, FieldSector } from '../types';
import { triggerHaptic } from './VoiceReader';

interface FieldMapViewProps {
  themeConfig: AppThemeConfig;
  onSelectSectorForScan: (sectorName: string) => void;
}

const INITIAL_FIELD_SECTORS: FieldSector[] = [
  { id: 'sec-a1', name: 'Sector A-1', crop: 'Tomato', plantCount: 120, avgInfectionPct: 0, status: 'HEALTHY', lastScanned: '10 mins ago', recommendedSprayVolMl: 0 },
  { id: 'sec-a2', name: 'Sector A-2', crop: 'Tomato', plantCount: 120, avgInfectionPct: 15, status: 'ATTENTION', lastScanned: '25 mins ago', recommendedSprayVolMl: 18 },
  { id: 'sec-a3', name: 'Sector A-3', crop: 'Tomato', plantCount: 120, avgInfectionPct: 48, status: 'CRITICAL', lastScanned: '1 hour ago', recommendedSprayVolMl: 45 },
  { id: 'sec-a4', name: 'Sector A-4', crop: 'Cotton', plantCount: 150, avgInfectionPct: 5, status: 'HEALTHY', lastScanned: '2 hours ago', recommendedSprayVolMl: 10 },
  
  { id: 'sec-b1', name: 'Sector B-1', crop: 'Cotton', plantCount: 150, avgInfectionPct: 22, status: 'ATTENTION', lastScanned: 'Yesterday', recommendedSprayVolMl: 22 },
  { id: 'sec-b2', name: 'Sector B-2', crop: 'Cotton', plantCount: 150, avgInfectionPct: 0, status: 'HEALTHY', lastScanned: '3 hours ago', recommendedSprayVolMl: 0 },
  { id: 'sec-b3', name: 'Sector B-3', crop: 'Wheat', plantCount: 300, avgInfectionPct: 75, status: 'CRITICAL', lastScanned: '4 hours ago', recommendedSprayVolMl: 78 },
  { id: 'sec-b4', name: 'Sector B-4', crop: 'Wheat', plantCount: 300, avgInfectionPct: 35, status: 'ATTENTION', lastScanned: '5 hours ago', recommendedSprayVolMl: 35 },

  { id: 'sec-c1', name: 'Sector C-1', crop: 'Maize', plantCount: 200, avgInfectionPct: 0, status: 'HEALTHY', lastScanned: 'Today', recommendedSprayVolMl: 0 },
  { id: 'sec-c2', name: 'Sector C-2', crop: 'Maize', plantCount: 200, avgInfectionPct: 12, status: 'HEALTHY', lastScanned: 'Today', recommendedSprayVolMl: 12 },
  { id: 'sec-c3', name: 'Sector C-3', crop: 'Potato', plantCount: 180, avgInfectionPct: 62, status: 'CRITICAL', lastScanned: 'Yesterday', recommendedSprayVolMl: 65 },
  { id: 'sec-c4', name: 'Sector C-4', crop: 'Potato', plantCount: 180, avgInfectionPct: 0, status: 'HEALTHY', lastScanned: 'Today', recommendedSprayVolMl: 0 },
];

export const FieldMapView: React.FC<FieldMapViewProps> = ({
  themeConfig,
  onSelectSectorForScan,
}) => {
  const [sectors, setSectors] = useState<FieldSector[]>(INITIAL_FIELD_SECTORS);
  const [selectedSector, setSelectedSector] = useState<FieldSector>(INITIAL_FIELD_SECTORS[2]);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  const isHighContrast = themeConfig.highContrastOutdoor;
  const isEco = themeConfig.batterySaverEco;

  const handleSectorClick = (sec: FieldSector) => {
    triggerHaptic(30);
    setSelectedSector(sec);
  };

  const getSectorBg = (sec: FieldSector) => {
    if (sec.avgInfectionPct === 0) {
      return isHighContrast
        ? 'bg-black text-green-400 border-2 border-green-400'
        : 'bg-emerald-950/80 text-emerald-300 border-emerald-600/80 hover:bg-emerald-900';
    } else if (sec.avgInfectionPct <= 25) {
      return isHighContrast
        ? 'bg-black text-yellow-300 border-2 border-yellow-300'
        : 'bg-yellow-950/80 text-yellow-300 border-yellow-600/80 hover:bg-yellow-900';
    } else if (sec.avgInfectionPct <= 50) {
      return isHighContrast
        ? 'bg-black text-amber-400 border-2 border-amber-400'
        : 'bg-amber-950/80 text-amber-300 border-amber-600/80 hover:bg-amber-900';
    } else {
      return isHighContrast
        ? 'bg-black text-red-400 border-2 border-red-400'
        : 'bg-red-950/90 text-red-300 border-red-600/80 hover:bg-red-900';
    }
  };

  const filteredSectors = sectors.filter((s) => {
    if (filterStatus === 'ALL') return true;
    return s.status === filterStatus;
  });

  return (
    <div className="p-4 space-y-4">
      {/* Header & Filter Controls */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[10px] text-emerald-400 font-extrabold uppercase tracking-wider block">
            GEOSPATIAL INFECTION HEATMAP
          </span>
          <h2 className="text-base font-black text-white">Field Sector Grid</h2>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1 bg-zinc-950 p-1 rounded-xl border border-zinc-800">
          <button
            onClick={() => setFilterStatus('ALL')}
            className={`px-2 py-1 rounded-lg text-[10px] font-bold ${
              filterStatus === 'ALL' ? 'bg-emerald-600 text-white' : 'text-zinc-400'
            }`}
          >
            ALL
          </button>
          <button
            onClick={() => setFilterStatus('CRITICAL')}
            className={`px-2 py-1 rounded-lg text-[10px] font-bold ${
              filterStatus === 'CRITICAL' ? 'bg-red-600 text-white' : 'text-zinc-400'
            }`}
          >
            CRITICAL
          </button>
        </div>
      </div>

      {/* Interactive 4x3 Grid Matrix representing Field Sectors */}
      <div
        className={`p-3.5 rounded-3xl border space-y-2 ${
          isHighContrast
            ? 'bg-black border-yellow-400'
            : isEco
            ? 'bg-zinc-950 border-emerald-900'
            : 'glass-card border-emerald-500/25 bg-zinc-950/80 backdrop-blur-xl shadow-2xl'
        }`}
      >
        <div className="flex items-center justify-between text-[10px] text-zinc-400 font-bold px-1">
          <span>NORTH FIELD BOUNDARY</span>
          <span>GPS MAP GRID</span>
        </div>

        <div className="grid grid-cols-4 gap-2">
          {filteredSectors.map((sec) => {
            const isSelected = selectedSector.id === sec.id;

            return (
              <button
                key={sec.id}
                onClick={() => handleSectorClick(sec)}
                className={`p-2 rounded-2xl border text-center transition-all flex flex-col items-center justify-center min-h-[72px] ${getSectorBg(
                  sec
                )} ${isSelected ? 'ring-2 ring-white scale-105 shadow-xl font-black' : ''}`}
              >
                <span className="text-xs font-black truncate">{sec.name}</span>
                <span className="text-[10px] opacity-80 mt-0.5">{sec.crop}</span>
                <span className="text-[10px] font-black mt-1 bg-black/40 px-1.5 py-0.2 rounded-md">
                  {sec.avgInfectionPct}% Inf.
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Sector Details Card */}
      {selectedSector && (
        <div className="p-4 rounded-3xl bg-[#10171D] border border-[#1E293B] text-[#E2E8F0] shadow-2xl space-y-3">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
            <div>
              <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider block">
                SECTOR INSPECTOR
              </span>
              <h3 className="text-sm font-black text-white">{selectedSector.name} ({selectedSector.crop})</h3>
            </div>
            <span
              className={`px-2.5 py-1 rounded-xl text-[10px] font-black uppercase ${
                selectedSector.status === 'HEALTHY'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                  : selectedSector.status === 'ATTENTION'
                  ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/40'
                  : 'bg-red-500/20 text-red-400 border border-red-500/40'
              }`}
            >
              {selectedSector.status}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-zinc-950 p-2.5 rounded-2xl border border-zinc-800">
              <span className="text-[10px] text-zinc-400 font-bold block">Plant Density</span>
              <span className="text-sm font-black text-white">{selectedSector.plantCount} Plants</span>
            </div>
            <div className="bg-zinc-950 p-2.5 rounded-2xl border border-zinc-800">
              <span className="text-[10px] text-zinc-400 font-bold block">Target Spray Volume</span>
              <span className="text-sm font-black text-emerald-400">{selectedSector.recommendedSprayVolMl} mL / m²</span>
            </div>
          </div>

          {/* Action button to load this sector into the Leaf AI Scanner */}
          <button
            onClick={() => {
              triggerHaptic(50);
              onSelectSectorForScan(selectedSector.name);
            }}
            className={`w-full py-3 rounded-2xl font-black text-xs uppercase flex items-center justify-center gap-2 border shadow-lg ${
              isHighContrast
                ? 'bg-black text-yellow-400 border-black'
                : 'bg-emerald-600 text-white hover:bg-emerald-500 border-emerald-400'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>SCAN {selectedSector.name.toUpperCase()} WITH AI CAMERA</span>
          </button>
        </div>
      )}
    </div>
  );
};
