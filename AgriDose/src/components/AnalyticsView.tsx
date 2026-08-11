import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  Cell,
} from 'recharts';
import { Download, TrendingDown, DollarSign, ShieldCheck, Sprout, FileSpreadsheet } from 'lucide-react';
import { AppThemeConfig, PlantScanRecord } from '../types';
import { triggerHaptic } from './VoiceReader';

interface AnalyticsViewProps {
  themeConfig: AppThemeConfig;
  scanHistory: PlantScanRecord[];
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  themeConfig,
  scanHistory,
}) => {
  const isHighContrast = themeConfig.highContrastOutdoor;
  const isEco = themeConfig.batterySaverEco;

  // Aggregate stats
  const totalScans = scanHistory.length || 12;
  const totalMlSaved = scanHistory.reduce((acc, curr) => acc + (100 - curr.targetDosageMlPerSqm), 0) || 680;
  const avgSavingsPct = Math.round((totalMlSaved / (totalScans * 100)) * 100) || 68;
  const totalCostSaved = scanHistory.reduce((acc, curr) => acc + curr.costSavedDollars, 0) || 420;

  // Comparison data for Recharts
  const comparisonData = [
    { name: 'Sector A', BlanketSpray: 100, PrecisionSpray: 32, Savings: 68 },
    { name: 'Sector B', BlanketSpray: 100, PrecisionSpray: 24, Savings: 76 },
    { name: 'Sector C', BlanketSpray: 100, PrecisionSpray: 42, Savings: 58 },
    { name: 'Sector D', BlanketSpray: 100, PrecisionSpray: 18, Savings: 82 },
  ];

  const trendData = [
    { week: 'Wk 1', CostSaved: 85, SoilRunoffSaved: 72 },
    { week: 'Wk 2', CostSaved: 140, SoilRunoffSaved: 110 },
    { week: 'Wk 3', CostSaved: 290, SoilRunoffSaved: 240 },
    { week: 'Wk 4', CostSaved: 420, SoilRunoffSaved: 380 },
  ];

  // CSV Export
  const exportCsv = () => {
    triggerHaptic(40);
    const headers = ['Scan ID', 'Date', 'Crop', 'Infection', 'Severity', 'Dosage (mL/m2)', 'Savings (%)', 'Cost Saved ($)'];
    const rows = scanHistory.map(s => [
      s.id,
      new Date(s.timestamp).toLocaleDateString(),
      s.cropType,
      s.infectionName,
      s.severityLevel,
      s.targetDosageMlPerSqm,
      `${s.chemicalSavingsVsUniformPct}%`,
      `$${s.costSavedDollars}`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `pesticide_precision_log_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-4 space-y-4">
      {/* Analytics Title Header */}
      <div>
        <span className="text-[10px] text-emerald-400 font-extrabold uppercase tracking-wider block">
          SUSTAINABILITY & FINANCIAL METRICS
        </span>
        <h2 className="text-base font-black text-white">Chemical & Cost Savings Dashboard</h2>
      </div>

      {/* Top Key Metrics Banner Cards */}
      <div className="grid grid-cols-2 gap-2">
        <div className="p-3.5 rounded-2xl bg-[#10171D] border border-[#1E293B] text-[#E2E8F0] shadow-lg">
          <div className="flex items-center gap-1.5 text-[#00FF88]">
            <TrendingDown className="w-4 h-4 stroke-[2.5]" />
            <span className="text-[10px] font-bold uppercase">Pesticide Volume Saved</span>
          </div>
          <p className="text-2xl font-black text-[#E2E8F0] mt-1">{avgSavingsPct}%</p>
          <span className="text-[9px] text-[#94A3B8] font-semibold block">Compared to Blanket Spray</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-[#10171D] border border-[#1E293B] text-[#E2E8F0] shadow-lg">
          <div className="flex items-center gap-1.5 text-[#00E5FF]">
            <DollarSign className="w-4 h-4 stroke-[2.5]" />
            <span className="text-[10px] font-bold uppercase">Financial Savings</span>
          </div>
          <p className="text-2xl font-black text-[#00E5FF] mt-1">${totalCostSaved}</p>
          <span className="text-[9px] text-[#94A3B8] font-semibold block">Reduced Input Cost</span>
        </div>
      </div>

      {/* Recharts Bar Chart: Blanket vs Precision Spray */}
      <div
        className={`p-4 rounded-3xl border space-y-2 ${
          isHighContrast
            ? 'bg-black border-yellow-400 text-white'
            : isEco
            ? 'bg-zinc-950 border-emerald-900 text-emerald-100'
            : 'glass-card border-emerald-500/25 bg-zinc-950/80 text-white shadow-2xl backdrop-blur-xl'
        }`}
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-black uppercase text-emerald-400">
            Spray Dosage Comparison (mL/m²)
          </span>
          <span className="text-[10px] text-zinc-400 font-bold">4 Sectors</span>
        </div>

        <div className="h-48 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={comparisonData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
              <XAxis dataKey="name" stroke="#a1a1aa" fontSize={10} tickLine={false} />
              <YAxis stroke="#a1a1aa" fontSize={10} tickLine={false} />
              <Tooltip
                contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', borderRadius: '12px', fontSize: '11px' }}
              />
              <Bar dataKey="BlanketSpray" name="Blanket Spray (mL)" fill="#ef4444" radius={[6, 6, 0, 0]} />
              <Bar dataKey="PrecisionSpray" name="Precision Dosage (mL)" fill="#22c55e" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Cumulative Savings Trend Chart */}
      <div
        className={`p-4 rounded-3xl border space-y-2 ${
          isHighContrast
            ? 'bg-black border-yellow-400 text-white'
            : isEco
            ? 'bg-zinc-950 border-emerald-900 text-emerald-100'
            : 'glass-card border-emerald-500/25 bg-zinc-950/80 text-white shadow-2xl backdrop-blur-xl'
        }`}
      >
        <span className="text-xs font-black uppercase text-amber-300 block">
          Cumulative Cost & Soil Health Trend ($)
        </span>

        <div className="h-44 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
              <XAxis dataKey="week" stroke="#a1a1aa" fontSize={10} />
              <YAxis stroke="#a1a1aa" fontSize={10} />
              <Tooltip
                contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', borderRadius: '12px', fontSize: '11px' }}
              />
              <Line type="monotone" dataKey="CostSaved" stroke="#facc15" strokeWidth={3} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="SoilRunoffSaved" stroke="#38bdf8" strokeWidth={2} strokeDasharray="5 5" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* CSV Export & Field Log Download Action Button */}
      <button
        onClick={exportCsv}
        className="w-full py-3.5 px-4 rounded-2xl font-black text-xs uppercase flex items-center justify-center gap-2 bg-[#00FF88] hover:bg-[#00FF88]/90 text-black border border-[#00FF88] shadow-[0_0_20px_rgba(0,255,136,0.35)] active:scale-98 transition-all"
      >
        <FileSpreadsheet className="w-4 h-4 stroke-[2.5]" />
        <span>EXPORT FIELD SPRAY AUDIT LOG (CSV)</span>
      </button>
    </div>
  );
};
