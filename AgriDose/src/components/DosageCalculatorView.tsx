import React, { useState } from 'react';
import {
  Calculator,
  Sliders,
  Droplets,
  Zap,
  TrendingDown,
  DollarSign,
  ShieldCheck,
  RotateCcw,
  Save,
  Check,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import {
  InfectionSeverityLevel,
  CropType,
  AppThemeConfig,
  DosageFormulaConfig,
  DEFAULT_DOSAGE_CONFIG,
  calculateDosageFromFormula,
  PlantScanRecord,
} from '../types';
import { getProfileForCrop } from '../data/cropDiseaseProfiles';
import { triggerHaptic } from './VoiceReader';
import { OfflineStorageService } from '../services/offlineStorage';

interface DosageCalculatorViewProps {
  themeConfig: AppThemeConfig;
  formulaConfig: DosageFormulaConfig;
  onUpdateFormulaConfig: (newConfig: DosageFormulaConfig) => void;
  onTriggerSpray: (dosageMl: number, durationSec: number, pressureBar: number) => void;
  onSaveScanRecord: (record: PlantScanRecord) => void;
}

export const DosageCalculatorView: React.FC<DosageCalculatorViewProps> = ({
  themeConfig,
  formulaConfig,
  onUpdateFormulaConfig,
  onTriggerSpray,
  onSaveScanRecord,
}) => {
  // Calculator inputs
  const [selectedSeverity, setSelectedSeverity] = useState<InfectionSeverityLevel>('MODERATE');
  const [selectedCrop, setSelectedCrop] = useState<CropType>('Tomato');
  const [fieldAreaSqm, setFieldAreaSqm] = useState<number>(10);
  const [infectionPct, setInfectionPct] = useState<number>(45);

  // Editable Formula Logic State
  const [showConfigPanel, setShowConfigPanel] = useState<boolean>(false);
  const [editableFormula, setEditableFormula] = useState<DosageFormulaConfig>(formulaConfig);
  const [savedSuccessMsg, setSavedSuccessMsg] = useState<string | null>(null);

  const isHighContrast = themeConfig.highContrastOutdoor;
  const isEco = themeConfig.batterySaverEco;

  // Handle Severity change
  const handleSeveritySelect = (sev: InfectionSeverityLevel) => {
    triggerHaptic(30);
    setSelectedSeverity(sev);
    if (sev === 'HEALTHY') setInfectionPct(0);
    else if (sev === 'MILD') setInfectionPct(18);
    else if (sev === 'MODERATE') setInfectionPct(45);
    else if (sev === 'SEVERE') setInfectionPct(82);
  };

  // Perform proportional calculation using current formula
  const calcResults = calculateDosageFromFormula(
    selectedSeverity,
    editableFormula,
    selectedCrop,
    fieldAreaSqm
  );

  const handleSaveFormula = () => {
    triggerHaptic([40, 40]);
    onUpdateFormulaConfig(editableFormula);
    OfflineStorageService.saveDosageFormulaConfig(editableFormula);
    setSavedSuccessMsg('Dosage calculation formula updated and saved to offline storage!');
    setTimeout(() => setSavedSuccessMsg(null), 3500);
  };

  const handleResetFormula = () => {
    triggerHaptic(40);
    setEditableFormula(DEFAULT_DOSAGE_CONFIG);
    onUpdateFormulaConfig(DEFAULT_DOSAGE_CONFIG);
    OfflineStorageService.saveDosageFormulaConfig(DEFAULT_DOSAGE_CONFIG);
    setSavedSuccessMsg('Reset to default scientific agronomic formula.');
    setTimeout(() => setSavedSuccessMsg(null), 3000);
  };

  // Save scan record locally
  const handleSaveToOfflineLog = () => {
    triggerHaptic(50);
    const newRecord: PlantScanRecord = {
      id: `calc_scan_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toISOString(),
      cropType: selectedCrop,
      infectionName: selectedSeverity === 'HEALTHY' ? 'Healthy Foliage' : `${selectedCrop} Foliar Infection`,
      severityLevel: selectedSeverity,
      infectionPercentage: infectionPct,
      affectedSymptoms: selectedSeverity === 'HEALTHY' ? ['No lesions detected'] : ['Chlorotic foliage', 'Leaf margin spot'],
      recommendedChemical: selectedSeverity === 'HEALTHY' ? 'None' : 'Precision Copper Hydroxide',
      targetDosageMlPerSqm: calcResults.dosageMlPerSqm,
      sprayDurationSec: calcResults.sprayDurationSec,
      nozzlePressureBar: calcResults.recommendedPressureBar,
      solutionConcentrationPct: 0.5,
      chemicalSavingsVsUniformPct: calcResults.savingsPct,
      costSavedDollars: Math.round((calcResults.blanketTotalMl - calcResults.totalMl) * 0.08),
      soilToxicityReductionPct: calcResults.savingsPct,
      locationSector: 'Field Sector C-Manual',
      imageUrl: 'https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?auto=format&fit=crop&w=400&q=80',
      synced: false,
      sprayStatus: 'PENDING',
      agronomicAdvice: `Proportional calculation for ${selectedSeverity} severity on ${selectedCrop}: ${calcResults.dosageMlPerSqm} mL/m². Saves ${calcResults.savingsPct}% chemical volume vs uniform blanket spray.`,
    };

    onSaveScanRecord(newRecord);
    setSavedSuccessMsg(`Saved assessment to offline log (${calcResults.totalMl} mL dosage).`);
    setTimeout(() => setSavedSuccessMsg(null), 3000);
  };

  return (
    <div className="p-4 space-y-4">
      {/* Title Header */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[10px] text-emerald-400 font-extrabold uppercase tracking-wider block">
            PRECISION PESTICIDE CALCULATION
          </span>
          <h2 className="text-base font-black text-white flex items-center gap-1.5">
            <Calculator className="w-5 h-5 text-emerald-400" />
            Dosage Rules & Calculator
          </h2>
        </div>

        <button
          onClick={() => {
            triggerHaptic(30);
            setShowConfigPanel(!showConfigPanel);
          }}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold border flex items-center gap-1.5 transition-all ${
            showConfigPanel
              ? 'bg-amber-500 text-black border-amber-300 font-extrabold'
              : 'bg-zinc-800 text-zinc-300 border-zinc-700 hover:bg-zinc-700'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>{showConfigPanel ? 'Hide Formula' : 'Edit Rules'}</span>
        </button>
      </div>

      {savedSuccessMsg && (
        <div className="p-3 rounded-2xl bg-emerald-950/90 border border-emerald-500 text-emerald-300 text-xs font-bold flex items-center gap-2 animate-fade-in">
          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{savedSuccessMsg}</span>
        </div>
      )}

      {/* Main Calculator Inputs */}
      <div className="p-4 rounded-3xl bg-[#10171D] border border-[#1E293B] text-[#E2E8F0] shadow-2xl space-y-4">
        {/* Step 1: Infection Severity Selector */}
        <div>
          <label className="text-xs font-black uppercase text-[#00FF88] mb-2 block">
            1. Select Infection Severity
          </label>
          <div className="grid grid-cols-4 gap-1.5">
            {(['HEALTHY', 'MILD', 'MODERATE', 'SEVERE'] as InfectionSeverityLevel[]).map((sev) => {
              const isSelected = selectedSeverity === sev;
              let bgStyle = 'bg-[#0B1218] text-[#94A3B8] border-[#1E293B]';

              if (isSelected) {
                if (sev === 'HEALTHY') bgStyle = 'bg-[#10171D] text-[#00FF88] border-[#00FF88] shadow-[0_0_10px_rgba(0,255,136,0.3)] font-black';
                if (sev === 'MILD') bgStyle = 'bg-[#10171D] text-[#00E5FF] border-[#00E5FF] shadow-[0_0_10px_rgba(0,229,255,0.3)] font-black';
                if (sev === 'MODERATE') bgStyle = 'bg-[#10171D] text-[#00E5FF] border-[#00E5FF] shadow-[0_0_10px_rgba(0,229,255,0.3)] font-black';
                if (sev === 'SEVERE') bgStyle = 'bg-[#10171D] text-[#FF3B30] border-[#FF3B30] shadow-[0_0_10px_rgba(255,59,48,0.3)] font-black';
              }

              return (
                <button
                  key={sev}
                  onClick={() => handleSeveritySelect(sev)}
                  className={`py-2.5 px-1 rounded-xl text-[10px] uppercase tracking-tight border transition-all text-center flex flex-col items-center justify-center ${bgStyle}`}
                >
                  <span className="font-extrabold">{sev}</span>
                  <span className="text-[8px] opacity-80">
                    {sev === 'HEALTHY' ? '0% Dose' : sev === 'MILD' ? '~20%' : sev === 'MODERATE' ? '~50%' : '100% Full'}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Step 2: Crop Type & Field Area */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[10px] font-bold uppercase text-zinc-400 mb-1 block">Crop Type</label>
            <select
              value={selectedCrop}
              onChange={(e) => {
                triggerHaptic(20);
                setSelectedCrop(e.target.value as CropType);
              }}
              className="w-full bg-zinc-950 text-white font-bold text-xs p-2.5 rounded-xl border border-zinc-700 focus:border-emerald-500 outline-none"
            >
              {(['Paddy', 'Wheat', 'Maize', 'Cotton', 'Tomato', 'Potato', 'Sugarcane', 'Soybean', 'Chilli', 'Rice', 'Grape', 'Apple', 'Cucumber', 'Mustard', 'Onion', 'Mango', 'Papaya', 'Tea', 'Coffee', 'Barley', 'Banana', 'Guava', 'Other'] as CropType[]).map((c) => (
                <option key={c} value={c}>
                  {c === 'Paddy' ? '🌾 Paddy / Rice' : c === 'Wheat' ? '🌾 Wheat' : c === 'Maize' ? '🌽 Maize / Corn' : c === 'Cotton' ? '🌿 Cotton' : c === 'Tomato' ? '🍅 Tomato' : c === 'Potato' ? '🥔 Potato' : c === 'Sugarcane' ? '🎋 Sugarcane' : c === 'Soybean' ? '🫘 Soybean' : c === 'Chilli' ? '🌶️ Chilli' : c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[10px] font-bold uppercase text-zinc-400 mb-1 block">Field Area (m²)</label>
            <div className="flex items-center gap-1">
              <input
                type="number"
                min={1}
                max={10000}
                value={fieldAreaSqm}
                onChange={(e) => setFieldAreaSqm(Math.max(1, Number(e.target.value) || 1))}
                className="w-full bg-zinc-950 text-white font-black text-xs p-2.5 rounded-xl border border-zinc-700 outline-none"
              />
            </div>
          </div>
        </div>

        {/* Base Crop Pathogen Profile Summary */}
        {(() => {
          const profile = getProfileForCrop(selectedCrop);
          return (
            <div className="p-3 rounded-2xl bg-zinc-950/80 border border-emerald-500/25 space-y-1.5 text-xs">
              <div className="flex items-center justify-between text-[10px] font-extrabold uppercase text-amber-300">
                <span>Associated Disease Profile ({selectedCrop})</span>
                <span className="text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                  {profile.recommendedChemical}
                </span>
              </div>

              <div className="text-white font-black text-xs flex items-center justify-between">
                <span>{profile.primaryDiseaseName}</span>
                <span className="text-[10px] font-bold text-zinc-400">
                  Concn: {profile.solutionConcentrationPct}%
                </span>
              </div>

              <p className="text-[10px] text-zinc-300 leading-snug">
                {profile.agronomicAdvice}
              </p>

              <div className="flex flex-wrap gap-1 pt-1">
                {profile.symptoms.map((symptom, idx) => (
                  <span key={idx} className="text-[9px] bg-zinc-900 text-emerald-300 px-1.5 py-0.5 rounded border border-zinc-800">
                    • {symptom}
                  </span>
                ))}
              </div>
            </div>
          );
        })()}

        {/* Quick Area Preset Buttons */}
        <div className="flex items-center gap-1.5">
          <span className="text-[9px] text-zinc-400 uppercase font-bold">Quick Area:</span>
          {[1, 10, 50, 100, 500].map((area) => (
            <button
              key={area}
              onClick={() => {
                triggerHaptic(20);
                setFieldAreaSqm(area);
              }}
              className={`px-2 py-0.5 rounded-lg text-[9px] font-extrabold border ${
                fieldAreaSqm === area
                  ? 'bg-emerald-600 text-white border-emerald-400'
                  : 'bg-zinc-800 text-zinc-400 border-zinc-700 hover:bg-zinc-700'
              }`}
            >
              {area} m²
            </button>
          ))}
        </div>

        {/* Fine-tune infection slider */}
        <div>
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="font-bold text-zinc-300">Specific Infection Severity:</span>
            <span className="font-black text-amber-300">{infectionPct}%</span>
          </div>
          <input
            type="range"
            min={0}
            max={100}
            value={infectionPct}
            onChange={(e) => {
              const val = Number(e.target.value);
              setInfectionPct(val);
              if (val === 0) setSelectedSeverity('HEALTHY');
              else if (val <= 25) setSelectedSeverity('MILD');
              else if (val <= 60) setSelectedSeverity('MODERATE');
              else setSelectedSeverity('SEVERE');
            }}
            className="w-full accent-emerald-500 cursor-pointer h-2 bg-zinc-800 rounded-lg"
          />
        </div>
      </div>

      {/* Calculated Proportional Dosage Result Card */}
      <div
        className={`p-4 rounded-3xl border space-y-3 ${
          isHighContrast
            ? 'bg-black text-white border-yellow-400'
            : isEco
            ? 'bg-zinc-950 border-emerald-900 text-emerald-100'
            : 'glass-card-accent border-emerald-500/35 text-white shadow-2xl backdrop-blur-2xl glow-emerald'
        }`}
      >
        <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
          <span className="text-xs font-black uppercase text-emerald-400 flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-emerald-400" />
            CALCULATED PROPORTIONAL DOSAGE
          </span>
          <span className="text-[10px] text-zinc-400 font-bold">Rule Engine v2.4</span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {/* Targeted Rate */}
          <div className="bg-zinc-900/90 p-3 rounded-2xl border border-zinc-800">
            <span className="text-[9px] text-zinc-400 font-bold uppercase block">Target Rate</span>
            <p className="text-2xl font-black text-emerald-400">{calcResults.dosageMlPerSqm} <span className="text-xs font-normal text-zinc-400">mL/m²</span></p>
            <span className="text-[9px] text-zinc-400">Total: {calcResults.totalMl} mL</span>
          </div>

          {/* Savings vs Blanket */}
          <div className="bg-zinc-900/90 p-3 rounded-2xl border border-zinc-800">
            <span className="text-[9px] text-zinc-400 font-bold uppercase block">Chemical Savings</span>
            <p className="text-2xl font-black text-amber-300">{calcResults.savingsPct}%</p>
            <span className="text-[9px] text-zinc-400">Vs {calcResults.blanketTotalMl} mL Blanket</span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-1.5 text-center text-xs pt-1">
          <div className="bg-zinc-900 p-2 rounded-xl border border-zinc-800">
            <span className="text-[8px] text-zinc-400 block uppercase">Nozzle Pressure</span>
            <span className="font-extrabold text-sky-400">{calcResults.recommendedPressureBar} bar</span>
          </div>
          <div className="bg-zinc-900 p-2 rounded-xl border border-zinc-800">
            <span className="text-[8px] text-zinc-400 block uppercase">Spray Time</span>
            <span className="font-extrabold text-emerald-400">{calcResults.sprayDurationSec}s</span>
          </div>
          <div className="bg-zinc-900 p-2 rounded-xl border border-zinc-800">
            <span className="text-[8px] text-zinc-400 block uppercase">Runoff Reduction</span>
            <span className="font-extrabold text-amber-300">{calcResults.savingsPct}%</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2 pt-2">
          <button
            onClick={() => {
              triggerHaptic([40, 40]);
              onTriggerSpray(calcResults.dosageMlPerSqm, calcResults.sprayDurationSec, calcResults.recommendedPressureBar);
            }}
            className="w-full py-3 px-4 rounded-2xl font-black text-xs uppercase flex items-center justify-center gap-2 bg-[#00FF88] hover:bg-[#00FF88]/90 text-black border border-[#00FF88] shadow-[0_0_20px_rgba(0,255,136,0.35)] active:scale-98 transition-all"
          >
            <Droplets className="w-4 h-4 fill-black stroke-[2]" />
            <span>ACTUATE SPRAY RIG WITH THIS DOSAGE ({calcResults.totalMl} mL)</span>
          </button>

          <button
            onClick={handleSaveToOfflineLog}
            className="w-full py-2.5 px-4 rounded-2xl font-bold text-xs uppercase flex items-center justify-center gap-2 bg-zinc-900 text-emerald-300 border border-zinc-700 hover:bg-zinc-800"
          >
            <Save className="w-3.5 h-3.5 text-emerald-400" />
            <span>Save Assessment To Offline Log</span>
          </button>
        </div>
      </div>

      {/* Editable Configurable Formula Panel */}
      {showConfigPanel && (
        <div className="p-4 rounded-3xl bg-zinc-900/95 border-2 border-amber-500/80 space-y-4 animate-fade-in shadow-2xl">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-amber-400" />
              <h3 className="text-xs font-black text-amber-300 uppercase">
                Configure Pesticide Calculation Rules
              </h3>
            </div>
            <button
              onClick={handleResetFormula}
              className="text-[9px] font-bold text-zinc-400 hover:text-white flex items-center gap-1 uppercase"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          </div>

          <p className="text-[10px] text-zinc-400">
            Customize the baseline dosage rates and severity multipliers used by both the online AI model and the offline local calculation engine.
          </p>

          {/* Baseline Max Rate */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-bold text-white">
              <span>Standard Blanket Spray Rate:</span>
              <span className="text-amber-300">{editableFormula.maxBlanketDosageMlPerSqm} mL/m²</span>
            </div>
            <input
              type="range"
              min={50}
              max={200}
              step={5}
              value={editableFormula.maxBlanketDosageMlPerSqm}
              onChange={(e) =>
                setEditableFormula({
                  ...editableFormula,
                  maxBlanketDosageMlPerSqm: Number(e.target.value),
                })
              }
              className="w-full accent-amber-400 h-2 bg-zinc-950 rounded-lg"
            />
          </div>

          {/* Per-Severity Multipliers */}
          <div className="space-y-2 border-t border-zinc-800 pt-2">
            <span className="text-[10px] font-extrabold uppercase text-emerald-400 block">
              Dosage Rates By Severity Level
            </span>

            <div className="grid grid-cols-2 gap-2 text-xs">
              {/* Healthy */}
              <div className="bg-zinc-950 p-2.5 rounded-xl border border-zinc-800">
                <span className="text-[9px] font-bold text-emerald-400 uppercase block">Healthy Plants</span>
                <div className="flex justify-between font-black text-white mt-1">
                  <span>Dose:</span>
                  <span>{editableFormula.healthyMultiplierPct}% ({Math.round(editableFormula.maxBlanketDosageMlPerSqm * editableFormula.healthyMultiplierPct / 100)} mL)</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={20}
                  value={editableFormula.healthyMultiplierPct}
                  onChange={(e) =>
                    setEditableFormula({
                      ...editableFormula,
                      healthyMultiplierPct: Number(e.target.value),
                    })
                  }
                  className="w-full accent-emerald-400 h-1.5 bg-zinc-800 rounded"
                />
              </div>

              {/* Mild */}
              <div className="bg-zinc-950 p-2.5 rounded-xl border border-zinc-800">
                <span className="text-[9px] font-bold text-lime-400 uppercase block">Mild Infection</span>
                <div className="flex justify-between font-black text-white mt-1">
                  <span>Dose:</span>
                  <span>{editableFormula.mildMultiplierPct}% ({Math.round(editableFormula.maxBlanketDosageMlPerSqm * editableFormula.mildMultiplierPct / 100)} mL)</span>
                </div>
                <input
                  type="range"
                  min={10}
                  max={40}
                  value={editableFormula.mildMultiplierPct}
                  onChange={(e) =>
                    setEditableFormula({
                      ...editableFormula,
                      mildMultiplierPct: Number(e.target.value),
                    })
                  }
                  className="w-full accent-lime-400 h-1.5 bg-zinc-800 rounded"
                />
              </div>

              {/* Moderate */}
              <div className="bg-zinc-950 p-2.5 rounded-xl border border-zinc-800">
                <span className="text-[9px] font-bold text-amber-400 uppercase block">Moderate Infection</span>
                <div className="flex justify-between font-black text-white mt-1">
                  <span>Dose:</span>
                  <span>{editableFormula.moderateMultiplierPct}% ({Math.round(editableFormula.maxBlanketDosageMlPerSqm * editableFormula.moderateMultiplierPct / 100)} mL)</span>
                </div>
                <input
                  type="range"
                  min={35}
                  max={70}
                  value={editableFormula.moderateMultiplierPct}
                  onChange={(e) =>
                    setEditableFormula({
                      ...editableFormula,
                      moderateMultiplierPct: Number(e.target.value),
                    })
                  }
                  className="w-full accent-amber-400 h-1.5 bg-zinc-800 rounded"
                />
              </div>

              {/* Severe */}
              <div className="bg-zinc-950 p-2.5 rounded-xl border border-zinc-800">
                <span className="text-[9px] font-bold text-red-400 uppercase block">Severe Infection</span>
                <div className="flex justify-between font-black text-white mt-1">
                  <span>Dose:</span>
                  <span>{editableFormula.severeMultiplierPct}% ({Math.round(editableFormula.maxBlanketDosageMlPerSqm * editableFormula.severeMultiplierPct / 100)} mL)</span>
                </div>
                <input
                  type="range"
                  min={70}
                  max={100}
                  value={editableFormula.severeMultiplierPct}
                  onChange={(e) =>
                    setEditableFormula({
                      ...editableFormula,
                      severeMultiplierPct: Number(e.target.value),
                    })
                  }
                  className="w-full accent-red-400 h-1.5 bg-zinc-800 rounded"
                />
              </div>
            </div>
          </div>

          <button
            onClick={handleSaveFormula}
            className="w-full py-2.5 px-4 rounded-xl font-black text-xs uppercase bg-[#00FF88] text-black hover:bg-[#00FF88]/90 border border-[#00FF88] flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(0,255,136,0.3)]"
          >
            <Save className="w-4 h-4" />
            <span>Save Custom Calculation Formula</span>
          </button>
        </div>
      )}
    </div>
  );
};
