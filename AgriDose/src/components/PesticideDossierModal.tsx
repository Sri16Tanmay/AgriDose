import React, { useState } from 'react';
import { PesticideDossier } from '../types';
import {
  X,
  ShieldAlert,
  Beaker,
  AlertTriangle,
  Clock,
  Settings,
  Globe2,
  FileCheck2,
  Droplets,
  Check,
  Copy,
  Printer,
  Sparkles,
} from 'lucide-react';
import { triggerHaptic } from './VoiceReader';

interface PesticideDossierModalProps {
  dossier: PesticideDossier;
  isOpen: boolean;
  onClose: () => void;
  isHighContrast?: boolean;
}

export const PesticideDossierModal: React.FC<PesticideDossierModalProps> = ({
  dossier,
  isOpen,
  onClose,
  isHighContrast = false,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const getToxicityBadge = (rating: string) => {
    switch (rating) {
      case 'RED_TRIANGLE':
        return {
          label: 'EXTREMELY TOXIC (Red Triangle)',
          bg: 'bg-red-950 text-red-200 border-red-500',
          badgeColor: 'border-b-[12px] border-b-red-600 border-x-[8px] border-x-transparent',
        };
      case 'YELLOW_TRIANGLE':
        return {
          label: 'HIGHLY TOXIC (Yellow Triangle)',
          bg: 'bg-amber-950 text-amber-200 border-amber-500',
          badgeColor: 'border-b-[12px] border-b-yellow-500 border-x-[8px] border-x-transparent',
        };
      case 'BLUE_TRIANGLE':
        return {
          label: 'MODERATE TOXICITY (Blue Triangle)',
          bg: 'bg-blue-950 text-blue-200 border-blue-500',
          badgeColor: 'border-b-[12px] border-b-blue-500 border-x-[8px] border-x-transparent',
        };
      case 'GREEN_TRIANGLE':
      default:
        return {
          label: 'SLIGHT TOXICITY / SAFE (Green Triangle)',
          bg: 'bg-emerald-950 text-emerald-200 border-emerald-500',
          badgeColor: 'border-b-[12px] border-b-emerald-500 border-x-[8px] border-x-transparent',
        };
    }
  };

  const tox = getToxicityBadge(dossier.toxicityRating);

  const handleCopy = () => {
    const text = `
AGRICULTURAL PESTICIDE DOSSIER: ${dossier.commercialName}
Category: ${dossier.technicalCategory}
Formulation: ${dossier.formulationType}
Active Ingredients: ${dossier.activeIngredients} (CAS: ${dossier.casNumbers})
CPCB Reg No: ${dossier.registrationNumbers.cpcb || 'N/A'} | EPA Reg: ${dossier.registrationNumbers.epa || 'N/A'}
Toxicity Band: ${dossier.toxicityRating}
Pre-Harvest Interval (PHI): ${dossier.preHarvestIntervalDays} Days
Dilution: ${dossier.precisionDilutionRatio}
Field Safety: ${dossier.fieldSafetyProtocols}
First Aid: ${dossier.firstAidDirections}
Nozzle Presets: ${dossier.recommendedNozzlePresets.pressureBar} Bar, ${dossier.recommendedNozzlePresets.flowRateMlMin} mL/min, ${dossier.recommendedNozzlePresets.dropletSizeMicrons} µm (${dossier.recommendedNozzlePresets.pattern})
Mode of Action: ${dossier.modeOfAction}
    `.trim();

    navigator.clipboard.writeText(text);
    setCopied(true);
    triggerHaptic(30);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div
        className="w-full max-w-2xl max-h-[90vh] rounded-3xl border border-[#1E293B] bg-[#10171D] text-[#E2E8F0] flex flex-col overflow-hidden shadow-2xl transition-all"
      >
        {/* Header Bar */}
        <div className="p-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/80">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-emerald-900/60 text-emerald-400 border border-emerald-500/30">
              <Beaker className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-emerald-900/80 text-emerald-300 border border-emerald-700">
                  Detailed Pesticide Portal
                </span>
                <span className="text-[10px] text-zinc-400 font-bold">PHI: {dossier.preHarvestIntervalDays} Days</span>
              </div>
              <h2 className="text-base font-black tracking-tight text-white mt-0.5">{dossier.commercialName}</h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="p-2 rounded-xl bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-700 text-xs font-bold flex items-center gap-1"
              title="Copy Dossier Details"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span className="hidden sm:inline">{copied ? 'Copied' : 'Copy'}</span>
            </button>
            <button
              onClick={() => {
                triggerHaptic(20);
                onClose();
              }}
              className="p-2 rounded-xl bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Toxicity & GHS Banner */}
          <div className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 ${tox.bg}`}>
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-black/40 border border-white/20">
                <div className={`w-0 h-0 ${tox.badgeColor}`} />
              </div>
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wide opacity-80">Toxicity Band</span>
                <p className="text-xs font-black">{tox.label}</p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 flex-wrap">
              {dossier.ghsWarningSymbols.map((symbol, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded-lg bg-black/50 border border-white/20 text-[10px] font-bold text-white flex items-center gap-1"
                >
                  <AlertTriangle className="w-3 h-3 text-amber-400" />
                  {symbol}
                </span>
              ))}
            </div>
          </div>

          {/* Section 1: Core Product & Active Composition */}
          <div className="p-4 rounded-2xl bg-zinc-900/90 border border-zinc-800 space-y-3">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
              <Sparkles className="w-4 h-4" /> 1. Core Composition & Chemistry
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800/80">
                <span className="text-[10px] text-zinc-400 uppercase font-bold">Technical Category</span>
                <p className="font-semibold text-zinc-200 mt-0.5">{dossier.technicalCategory}</p>
              </div>

              <div className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800/80">
                <span className="text-[10px] text-zinc-400 uppercase font-bold">Formulation Type</span>
                <p className="font-semibold text-zinc-200 mt-0.5">{dossier.formulationType}</p>
              </div>

              <div className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800/80 col-span-1 sm:col-span-2">
                <span className="text-[10px] text-zinc-400 uppercase font-bold">Active Ingredients & Concentration</span>
                <p className="font-bold text-emerald-300 mt-0.5">{dossier.activeIngredients}</p>
              </div>

              <div className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800/80">
                <span className="text-[10px] text-zinc-400 uppercase font-bold">CAS Numbers</span>
                <p className="font-mono text-zinc-300 mt-0.5 text-[11px]">{dossier.casNumbers}</p>
              </div>

              <div className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800/80">
                <span className="text-[10px] text-zinc-400 uppercase font-bold">Chemical Classes</span>
                <p className="font-semibold text-zinc-200 mt-0.5">{dossier.chemicalClasses}</p>
              </div>
            </div>
          </div>

          {/* Section 2: Regulatory & Registration */}
          <div className="p-4 rounded-2xl bg-zinc-900/90 border border-zinc-800 space-y-3">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
              <FileCheck2 className="w-4 h-4" /> 2. Regulatory & Statutory Registrations
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div className="p-2 rounded-xl bg-zinc-950 border border-zinc-800 text-center">
                <span className="text-[9px] text-zinc-500 uppercase font-black">CPCB (India)</span>
                <p className="font-mono text-[10px] font-bold text-amber-300 mt-0.5">{dossier.registrationNumbers.cpcb || 'Verified'}</p>
              </div>
              <div className="p-2 rounded-xl bg-zinc-950 border border-zinc-800 text-center">
                <span className="text-[9px] text-zinc-500 uppercase font-black">US EPA</span>
                <p className="font-mono text-[10px] font-bold text-cyan-300 mt-0.5">{dossier.registrationNumbers.epa || 'Verified'}</p>
              </div>
              <div className="p-2 rounded-xl bg-zinc-950 border border-zinc-800 text-center">
                <span className="text-[9px] text-zinc-500 uppercase font-black">ICAR Standard</span>
                <p className="font-mono text-[10px] font-bold text-emerald-300 mt-0.5">{dossier.registrationNumbers.icar || 'Compliant'}</p>
              </div>
              <div className="p-2 rounded-xl bg-zinc-950 border border-zinc-800 text-center">
                <span className="text-[9px] text-zinc-500 uppercase font-black">EU Annex I</span>
                <p className="font-mono text-[10px] font-bold text-indigo-300 mt-0.5">{dossier.registrationNumbers.eu || 'Approved'}</p>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center gap-2 text-xs text-zinc-300">
              <Globe2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>
                <strong className="text-white">Geographic Approval:</strong> {dossier.geographicApprovals}
              </span>
            </div>
          </div>

          {/* Section 3: Field Worker Safety & Protocols */}
          <div className="p-4 rounded-2xl bg-zinc-900/90 border border-zinc-800 space-y-3">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-amber-400 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4" /> 3. Field Safety, PHI & First Aid
            </h3>

            <div className="space-y-2 text-xs">
              <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-500/30 text-amber-100">
                <strong className="text-amber-300 block mb-1 font-bold">Field Worker Protocols & PPE:</strong>
                <p className="leading-relaxed">{dossier.fieldSafetyProtocols}</p>
              </div>

              <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/30 text-red-100">
                <strong className="text-red-300 block mb-1 font-bold">Emergency First Aid Directions:</strong>
                <p className="leading-relaxed">{dossier.firstAidDirections}</p>
              </div>
            </div>
          </div>

          {/* Section 4: Precision Application & Nozzle Presets */}
          <div className="p-4 rounded-2xl bg-zinc-900/90 border border-zinc-800 space-y-3">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-cyan-400 flex items-center gap-2">
              <Settings className="w-4 h-4" /> 4. Actionable Usage & Nozzle Calibration
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800">
                <span className="text-[10px] text-zinc-400 uppercase font-bold">Precision Dilution Ratio</span>
                <p className="font-bold text-white mt-0.5">{dossier.precisionDilutionRatio}</p>
              </div>

              <div className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800">
                <span className="text-[10px] text-zinc-400 uppercase font-bold">Ideal Timing</span>
                <p className="font-semibold text-zinc-200 mt-0.5">{dossier.idealApplicationTimings}</p>
              </div>

              <div className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800 col-span-1 sm:col-span-2">
                <span className="text-[10px] text-zinc-400 uppercase font-bold">Tank-Mixing Compatibility</span>
                <p className="font-medium text-zinc-300 mt-0.5">{dossier.tankMixingCompatibility}</p>
              </div>
            </div>

            {/* Nozzle Presets Bar */}
            <div className="p-3 rounded-xl bg-cyan-950/50 border border-cyan-500/40 text-cyan-200 space-y-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-cyan-300 block">
                Sprinkler Nozzle Control Presets
              </span>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs font-bold">
                <div className="p-2 rounded-lg bg-black/60 border border-cyan-500/30">
                  <span className="text-[9px] text-zinc-400 block font-normal">Pressure</span>
                  <span className="text-white text-sm">{dossier.recommendedNozzlePresets.pressureBar} Bar</span>
                </div>
                <div className="p-2 rounded-lg bg-black/60 border border-cyan-500/30">
                  <span className="text-[9px] text-zinc-400 block font-normal">Flow Rate</span>
                  <span className="text-white text-sm">{dossier.recommendedNozzlePresets.flowRateMlMin} mL/min</span>
                </div>
                <div className="p-2 rounded-lg bg-black/60 border border-cyan-500/30">
                  <span className="text-[9px] text-zinc-400 block font-normal">Droplet Size</span>
                  <span className="text-white text-sm">{dossier.recommendedNozzlePresets.dropletSizeMicrons} µm</span>
                </div>
                <div className="p-2 rounded-lg bg-black/60 border border-cyan-500/30">
                  <span className="text-[9px] text-zinc-400 block font-normal">Pattern</span>
                  <span className="text-cyan-300 text-xs font-extrabold truncate block">{dossier.recommendedNozzlePresets.pattern}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Section 5: Efficacy & Mode of Action */}
          <div className="p-4 rounded-2xl bg-zinc-900/90 border border-zinc-800 space-y-3">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
              <Droplets className="w-4 h-4" /> 5. Efficacy & Mode of Action (FRAC/IRAC)
            </h3>

            <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 text-xs space-y-2">
              <p className="text-zinc-200 leading-relaxed font-medium">
                <strong className="text-emerald-300">Biochemical Mode of Action:</strong> {dossier.modeOfAction}
              </p>

              <div>
                <strong className="text-zinc-400 text-[10px] uppercase font-bold block mb-1">Target Pathogens & Pests:</strong>
                <div className="flex flex-wrap gap-1.5">
                  {dossier.targetPathogensList.map((pathogen, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded-lg bg-emerald-950/80 text-emerald-300 border border-emerald-700/60 text-[10px] font-bold"
                    >
                      {pathogen}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Bar */}
        <div className="p-3 border-t border-zinc-800 bg-zinc-900/80 flex items-center justify-between">
          <span className="text-[10px] text-zinc-400 font-semibold">
            AgriDose Industrial Pesticide Database • Verified Agronomic Standard
          </span>

          <button
            onClick={() => {
              triggerHaptic(20);
              onClose();
            }}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-md shadow-emerald-950"
          >
            Close Dossier
          </button>
        </div>
      </div>
    </div>
  );
};
