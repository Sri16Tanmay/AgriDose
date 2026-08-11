import React, { useState, useEffect, useRef } from 'react';
import {
  Droplets,
  Bluetooth,
  Battery,
  Gauge,
  RotateCcw,
  Play,
  Pause,
  Zap,
  ShieldAlert,
  FlaskConical,
  Clock,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Info,
  ExternalLink,
} from 'lucide-react';
import { AppThemeConfig, SprinklerHardwareState, PlantScanRecord, CropType } from '../types';
import { triggerHaptic } from './VoiceReader';
import { CropSelectorCarousel } from './CropSelectorCarousel';
import { PesticideDossierModal } from './PesticideDossierModal';
import { getPesticideDossier } from '../data/pesticideDatabase';

interface SprinklerViewProps {
  themeConfig: AppThemeConfig;
  hardwareState: SprinklerHardwareState;
  onUpdateHardware: (updated: Partial<SprinklerHardwareState>) => void;
  pendingDosageMl?: number;
  latestScanRecord?: PlantScanRecord;
  autoStartSpray?: boolean;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  life: number;
  maxLife: number;
  type: 'droplet' | 'mist' | 'shimmer';
  color: string;
}

export const SprinklerView: React.FC<SprinklerViewProps> = ({
  themeConfig,
  hardwareState,
  onUpdateHardware,
  pendingDosageMl = 50,
  latestScanRecord,
  autoStartSpray = false,
}) => {
  const [isActuating, setIsActuating] = useState<boolean>(autoStartSpray);
  const [dispensedMl, setDispensedMl] = useState<number>(0);
  const [targetMl, setTargetMl] = useState<number>(pendingDosageMl || 50);
  const [manualPressure, setManualPressure] = useState<number>(hardwareState.nozzlePressureBar || 2.8);
  const [selectedCrop, setSelectedCrop] = useState<CropType>(latestScanRecord?.cropType || 'Tomato');
  const [isDossierOpen, setIsDossierOpen] = useState<boolean>(false);

  // High precision timer state
  const [remainingMs, setRemainingMs] = useState<number>(0);
  const [totalMs, setTotalMs] = useState<number>(1600); // Default 1.60 seconds for 50 mL
  const animFrameId = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);

  // Canvas ref for ultra-realistic field particle simulation
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<Particle[]>([]);

  const isHighContrast = themeConfig.highContrastOutdoor;
  const isEco = themeConfig.batterySaverEco;

  // Sync target ML when pending dosage changes or autoStartSpray triggers
  useEffect(() => {
    if (pendingDosageMl && pendingDosageMl > 0) {
      setTargetMl(pendingDosageMl);
    }
  }, [pendingDosageMl]);

  useEffect(() => {
    if (autoStartSpray) {
      setIsActuating(true);
      onUpdateHardware({ isSpraying: true });
    }
  }, [autoStartSpray]);

  // Recalculate default total duration based on target ML (e.g. 50 mL = 1.60s -> 31.25 mL/s rate)
  useEffect(() => {
    const calculatedDurationMs = Math.round((targetMl / 31.25) * 1000);
    setTotalMs(Math.max(800, calculatedDurationMs));
  }, [targetMl]);

  // Handle Actuation Timer & Real-time Countdown Loop
  useEffect(() => {
    if (isActuating) {
      startTimeRef.current = performance.now();
      const duration = totalMs;

      const updateTimer = () => {
        const now = performance.now();
        const elapsed = now - startTimeRef.current;
        const remaining = Math.max(0, duration - elapsed);
        const currentMl = Math.min(targetMl, Number(((elapsed / duration) * targetMl).toFixed(1)));

        setRemainingMs(remaining);
        setDispensedMl(currentMl);

        if (remaining <= 0) {
          // Actuation completed
          setIsActuating(false);
          setDispensedMl(targetMl);
          setRemainingMs(0);
          onUpdateHardware({
            isSpraying: false,
            tankLevelMl: Math.max(0, hardwareState.tankLevelMl - targetMl),
          });
          triggerHaptic([100, 50, 100]);
        } else {
          animFrameId.current = requestAnimationFrame(updateTimer);
        }
      };

      animFrameId.current = requestAnimationFrame(updateTimer);
    } else {
      if (animFrameId.current) {
        cancelAnimationFrame(animFrameId.current);
      }
    }

    return () => {
      if (animFrameId.current) {
        cancelAnimationFrame(animFrameId.current);
      }
    };
  }, [isActuating, totalMs, targetMl, hardwareState.tankLevelMl]);

  // Canvas 2D Photorealistic Farm Field & Mist Particle Simulation Engine
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let particleAnimId: number;

    const resizeCanvas = () => {
      if (canvas.parentElement) {
        canvas.width = canvas.parentElement.clientWidth;
        canvas.height = canvas.parentElement.clientHeight;
      }
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const particles = particlesRef.current;
    let frameTime = 0;

    const render = () => {
      frameTime += 0.03;
      const width = canvas.width;
      const height = canvas.height;
      const horizonY = height * 0.38;
      const nozzleX = width / 2;
      const nozzleY = 28;

      // -------------------------------------------------------------
      // 1. DRAW PHOTOREALISTIC FIELD BACKGROUND
      // -------------------------------------------------------------
      
      // Sky & Golden Hour Horizon Gradient
      const skyGradient = ctx.createLinearGradient(0, 0, 0, horizonY);
      skyGradient.addColorStop(0, '#020617'); // Midnight deep sky
      skyGradient.addColorStop(0.5, '#0f172a'); // Slate atmosphere
      skyGradient.addColorStop(0.85, '#1e293b'); // Soft horizon dusk
      skyGradient.addColorStop(1, '#334155'); // Horizon glow
      ctx.fillStyle = skyGradient;
      ctx.fillRect(0, 0, width, horizonY);

      // Sun glow at horizon
      const sunGlow = ctx.createRadialGradient(nozzleX, horizonY, 5, nozzleX, horizonY, 90);
      sunGlow.addColorStop(0, 'rgba(251, 191, 36, 0.35)');
      sunGlow.addColorStop(0.5, 'rgba(245, 158, 11, 0.15)');
      sunGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = sunGlow;
      ctx.fillRect(0, 0, width, horizonY);

      // Distant Horizon Treeline/Hills
      ctx.fillStyle = '#0f291e';
      ctx.beginPath();
      ctx.moveTo(0, horizonY);
      for (let x = 0; x <= width; x += 20) {
        const hillY = horizonY - 4 - Math.sin(x * 0.03) * 3 - Math.cos(x * 0.08) * 2;
        ctx.lineTo(x, hillY);
      }
      ctx.lineTo(width, horizonY);
      ctx.closePath();
      ctx.fill();

      // Soil Bed & Earth Ground (Rich dark agricultural soil with 3D perspective)
      const groundGradient = ctx.createLinearGradient(0, horizonY, 0, height);
      groundGradient.addColorStop(0, '#1c130d'); // Dark distant earth
      groundGradient.addColorStop(0.5, '#2a1a10'); // Rich loam
      groundGradient.addColorStop(1, '#170e08'); // Deep foreground soil
      ctx.fillStyle = groundGradient;
      ctx.fillRect(0, horizonY, width, height - horizonY);

      // Perspective Soil Furrow Rows converging toward horizon
      const numRows = 7;
      for (let i = 0; i < numRows; i++) {
        const t = (i / (numRows - 1)) - 0.5; // -0.5 to 0.5
        const bottomX = nozzleX + t * width * 1.6;
        const topX = nozzleX + t * width * 0.25;

        // Furrow shadow line
        ctx.beginPath();
        ctx.moveTo(topX, horizonY);
        ctx.lineTo(bottomX, height);
        ctx.strokeStyle = '#0d0704';
        ctx.lineWidth = 3 + (1 - Math.abs(t)) * 4;
        ctx.stroke();

        // Highlighting furrow ridge
        ctx.beginPath();
        ctx.moveTo(topX + 2, horizonY);
        ctx.lineTo(bottomX + 6, height);
        ctx.strokeStyle = '#3d2618';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      // Render Perspective Crop Rows (Young Maize / Cotton Plants)
      const renderCropPlants = () => {
        const numPlantedRows = 5;
        for (let r = 0; r < numPlantedRows; r++) {
          const rowPos = (r / (numPlantedRows - 1)) - 0.5; // -0.5 to 0.5
          const rowStartX = nozzleX + rowPos * width * 1.35;
          const rowEndX = nozzleX + rowPos * width * 0.22;

          // Render plant stalks along each perspective row
          const numPlants = 14;
          for (let p = 0; p < numPlants; p++) {
            const depth = p / (numPlants - 1); // 0 (horizon) to 1 (foreground)
            const plantY = horizonY + Math.pow(depth, 1.8) * (height - horizonY - 10);
            const plantX = rowEndX + (rowStartX - rowEndX) * depth;
            const plantScale = 0.25 + depth * 1.15;

            // Sway in wind
            const sway = Math.sin(frameTime * 2 + p * 0.5 + r) * (2 * plantScale);

            // Leaf color gradient
            const leafGreen = depth > 0.6 ? '#10b981' : '#059669';
            const leafHighlight = isActuating ? '#6ee7b7' : '#34d399';

            // Draw Maize/Cotton Leaf Cluster
            ctx.save();
            ctx.translate(plantX + sway, plantY);
            ctx.scale(plantScale, plantScale);

            // Left Leaf
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.quadraticCurveTo(-14, -12, -22, -4);
            ctx.quadraticCurveTo(-12, 4, 0, 0);
            ctx.fillStyle = leafGreen;
            ctx.fill();

            // Right Leaf
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.quadraticCurveTo(14, -14, 24, -5);
            ctx.quadraticCurveTo(12, 5, 0, 0);
            ctx.fillStyle = '#047857';
            ctx.fill();

            // Center Upward Shoot
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.quadraticCurveTo(-4, -18, 0, -26);
            ctx.quadraticCurveTo(4, -18, 0, 0);
            ctx.fillStyle = leafHighlight;
            ctx.fill();

            // Moisture droplet glints on leaves if spraying
            if (isActuating && depth > 0.4) {
              ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
              ctx.beginPath();
              ctx.arc(-8, -6, 1.5, 0, Math.PI * 2);
              ctx.arc(10, -8, 1.2, 0, Math.PI * 2);
              ctx.arc(2, -16, 1.8, 0, Math.PI * 2);
              ctx.fill();
            }

            ctx.restore();
          }
        }
      };

      renderCropPlants();

      // -------------------------------------------------------------
      // 2. IDLE VS ACTIVE SPRAY SIMULATION
      // -------------------------------------------------------------

      if (!isActuating) {
        // Draw static orange nozzle head in foreground
        ctx.save();
        ctx.shadowColor = '#f59e0b';
        ctx.shadowBlur = 14;

        // Nozzle mount bracket
        ctx.fillStyle = '#18181b';
        ctx.fillRect(nozzleX - 28, 2, 56, 16);
        ctx.strokeStyle = '#3f3f46';
        ctx.lineWidth = 2;
        ctx.strokeRect(nozzleX - 28, 2, 56, 16);

        // Nozzle Body (Orange Indicator)
        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.moveTo(nozzleX - 14, 18);
        ctx.lineTo(nozzleX + 14, 18);
        ctx.lineTo(nozzleX + 7, nozzleY);
        ctx.lineTo(nozzleX - 7, nozzleY);
        ctx.closePath();
        ctx.fill();

        // Glowing Orifice Tip
        ctx.fillStyle = '#fbbf24';
        ctx.beginPath();
        ctx.arc(nozzleX, nozzleY, 4.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // Idle Status Overlay Badge
        ctx.save();
        ctx.fillStyle = 'rgba(9, 9, 11, 0.75)';
        ctx.strokeStyle = '#27272a';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(nozzleX - 110, height - 42, 220, 32, 12);
        ctx.fill();
        ctx.stroke();

        ctx.font = '900 11px sans-serif';
        ctx.fillStyle = '#fbbf24';
        ctx.textAlign = 'center';
        ctx.fillText('NOZZLE IDLE - STANDBY', nozzleX, height - 26);

        ctx.font = '600 9px sans-serif';
        ctx.fillStyle = '#9ca3af';
        ctx.fillText('Ready for variable-rate field actuation', nozzleX, height - 14);
        ctx.restore();
      } else {
        // ACTIVE SPRAY STATE - Ultra-Realistic Photorealistic Mist & Droplets
        
        // Spawn high-density droplets and fine mist clouds
        const spawnRate = hardwareState.nozzleType === 'FLAT_FAN' ? 24 : 18;
        for (let i = 0; i < spawnRate; i++) {
          const isFineMist = Math.random() > 0.35;
          const isShimmer = Math.random() > 0.85;
          const spreadAngle = (Math.random() - 0.5) * (hardwareState.nozzleType === 'FLAT_FAN' ? 1.6 : 1.1);
          const speed = Math.random() * 5.5 + 3.0;

          particles.push({
            x: nozzleX + (Math.random() - 0.5) * 6,
            y: nozzleY + 2,
            vx: Math.sin(spreadAngle) * speed + (Math.random() - 0.5) * 0.8,
            vy: Math.cos(spreadAngle) * speed,
            size: isShimmer ? Math.random() * 1.5 + 0.8 : isFineMist ? Math.random() * 4.5 + 2.0 : Math.random() * 2.5 + 1.2,
            alpha: Math.random() * 0.75 + 0.25,
            life: 0,
            maxLife: Math.random() * 32 + 22,
            type: isShimmer ? 'shimmer' : isFineMist ? 'mist' : 'droplet',
            color: isShimmer ? '#ffffff' : isFineMist ? 'rgba(56, 189, 248, ' : 'rgba(52, 211, 153, ',
          });
        }

        // Render Photorealistic Volumetric Light Cone & Refraction Haze
        ctx.save();
        const mistBeam = ctx.createLinearGradient(nozzleX, nozzleY, nozzleX, height);
        mistBeam.addColorStop(0, 'rgba(56, 189, 248, 0.65)');
        mistBeam.addColorStop(0.3, 'rgba(56, 189, 248, 0.35)');
        mistBeam.addColorStop(0.7, 'rgba(16, 185, 129, 0.20)');
        mistBeam.addColorStop(1, 'rgba(0, 0, 0, 0.02)');

        ctx.beginPath();
        ctx.moveTo(nozzleX - 4, nozzleY);
        ctx.lineTo(nozzleX + 4, nozzleY);
        ctx.lineTo(nozzleX + width * 0.48, height);
        ctx.lineTo(nozzleX - width * 0.48, height);
        ctx.closePath();
        ctx.fillStyle = mistBeam;
        ctx.fill();

        // Shimmering Light Refraction Core
        const coreGlow = ctx.createRadialGradient(nozzleX, nozzleY + 30, 2, nozzleX, nozzleY + 80, 70);
        coreGlow.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
        coreGlow.addColorStop(0.4, 'rgba(56, 189, 248, 0.4)');
        coreGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = coreGlow;
        ctx.fillRect(0, 0, width, height);
        ctx.restore();

        // Update and render particle physics
        for (let i = particles.length - 1; i >= 0; i--) {
          const p = particles[i];
          p.x += p.vx;
          p.y += p.vy;
          p.vy += 0.09; // Gravity pull
          p.life++;

          const fade = 1 - (p.life / p.maxLife);
          const currentAlpha = Math.max(0, p.alpha * fade);

          ctx.save();
          if (p.type === 'shimmer') {
            ctx.fillStyle = `rgba(255, 255, 255, ${currentAlpha})`;
            ctx.shadowBlur = 6;
            ctx.shadowColor = '#ffffff';
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
          } else if (p.type === 'mist') {
            ctx.fillStyle = `${p.color}${currentAlpha * 0.6})`;
            ctx.shadowBlur = 8;
            ctx.shadowColor = '#38bdf8';
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size * 1.5, 0, Math.PI * 2);
            ctx.fill();
          } else {
            ctx.fillStyle = `${p.color}${currentAlpha})`;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.restore();

          if (p.life >= p.maxLife || p.y >= height) {
            particles.splice(i, 1);
          }
        }

        // Active Nozzle Head Graphic with Cyan/Gold Glow
        ctx.save();
        ctx.shadowColor = '#38bdf8';
        ctx.shadowBlur = 22;

        ctx.fillStyle = '#38bdf8';
        ctx.beginPath();
        ctx.moveTo(nozzleX - 14, 18);
        ctx.lineTo(nozzleX + 14, 18);
        ctx.lineTo(nozzleX + 7, nozzleY);
        ctx.lineTo(nozzleX - 7, nozzleY);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(nozzleX, nozzleY, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // Active Spray Overlay Banner
        ctx.save();
        ctx.fillStyle = 'rgba(2, 132, 199, 0.85)';
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.roundRect(nozzleX - 120, height - 42, 240, 32, 12);
        ctx.fill();
        ctx.stroke();

        ctx.font = '900 11px sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.fillText(`DISPENSING MIST CONE (${dispensedMl} / ${targetMl} mL)`, nozzleX, height - 26);

        ctx.font = '700 9px sans-serif';
        ctx.fillStyle = '#bae6fd';
        ctx.fillText(`Flowing @ ${manualPressure} Bar Nozzle Pressure`, nozzleX, height - 14);
        ctx.restore();
      }

      particleAnimId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(particleAnimId);
    };
  }, [isActuating, hardwareState.nozzleType, dispensedMl, targetMl, manualPressure]);

  const handleStartSpray = () => {
    triggerHaptic([60, 40, 60]);
    setDispensedMl(0);
    setRemainingMs(totalMs);
    setIsActuating(true);
    onUpdateHardware({ isSpraying: true });
  };

  const handleStopSpray = () => {
    triggerHaptic(80);
    setIsActuating(false);
    onUpdateHardware({ isSpraying: false });
  };

  const handleRefillTank = () => {
    triggerHaptic(50);
    onUpdateHardware({ tankLevelMl: hardwareState.maxTankCapacityMl });
    setDispensedMl(0);
  };

  // Time format helper: 00:01.60 S
  const formatTime = (ms: number) => {
    const mins = Math.floor(ms / 60000).toString().padStart(2, '0');
    const secs = Math.floor((ms % 60000) / 1000).toString().padStart(2, '0');
    const hundredths = Math.floor((ms % 1000) / 10).toString().padStart(2, '0');
    return `${mins}:${secs}.${hundredths}`;
  };

  const totalTimeStr = formatTime(totalMs);
  const remainingTimeStr = formatTime(remainingMs);
  const progressPct = isActuating
    ? Math.min(100, Math.max(0, ((totalMs - remainingMs) / totalMs) * 100))
    : 0;

  // Resolved chemical profile data (from camera diagnostic or default)
  const chemicalProfile = {
    pesticideName: latestScanRecord?.recommendedChemical || 'Mancozeb 75% WP + Copper Fungicide',
    composition: latestScanRecord?.activeIngredients || 'Ethylenebisdithiocarbamate 75% w/w, Metallic Copper equivalent 50% WP',
    targetPathogen: latestScanRecord?.infectionName || 'Foliar Fungal Spot / Early Blight (Alternaria solani)',
    cropType: latestScanRecord?.cropType || 'Tomato',
    dilutionRatio: '2.5 g per Litre of clean water',
    safetyProtocol: latestScanRecord?.applicationSafetyGuidance || 'Wear N95 respiratory mask and nitrile gloves during spraying. Observe 7-day PHI (Pre-Harvest Interval) before harvesting.',
    savingsVsBlanket: latestScanRecord?.chemicalSavingsVsUniformPct || 68,
    dosageMl: latestScanRecord?.targetDosageMlPerSqm || targetMl,
  };

  return (
    <div className="p-4 space-y-4">
      {/* Bluetooth Rig Hardware Connection Status Header */}
      <div className="p-3.5 rounded-3xl bg-[#10171D] border border-[#1E293B] text-[#E2E8F0] shadow-lg flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-[#0B1218] border border-[#1E293B] flex items-center justify-center">
            <Bluetooth className="w-5 h-5 text-[#00E5FF] stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-black text-[#E2E8F0]">AgriSprayer Rig #12</span>
              <span className="w-2 h-2 rounded-full bg-[#00FF88] animate-pulse" />
            </div>
            <span className="text-[10px] text-[#00FF88] font-semibold block">BT Paired (-68 dBm)</span>
          </div>
        </div>

        <div className="flex items-center gap-3 text-right">
          <div>
            <span className="text-[10px] text-zinc-400 uppercase font-bold block">Rig Battery</span>
            <div className="flex items-center gap-1 font-black text-xs text-emerald-400">
              <Battery className="w-3.5 h-3.5" />
              <span>{hardwareState.batteryLevelPct}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Spray Nozzle Chamber Actuation Card */}
      <div
        className={`p-4 rounded-3xl border space-y-4 ${
          isHighContrast
            ? 'bg-black text-white border-yellow-400'
            : isEco
            ? 'bg-zinc-950 text-emerald-100 border-emerald-800'
            : 'glass-card-accent border-emerald-500/35 text-white shadow-2xl backdrop-blur-2xl glow-emerald'
        }`}
      >
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] text-emerald-400 font-black uppercase tracking-wider block">
              PRECISION VARIABLE-RATE ACTUATOR
            </span>
            <h2 className="text-base font-black text-white mt-0.5">Sprinkler Nozzle Control</h2>
          </div>
          <div className="px-2.5 py-1 rounded-xl bg-emerald-950 border border-emerald-700/60 text-xs font-bold text-emerald-300 flex items-center gap-1">
            <Zap className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
            <span>{hardwareState.mode}</span>
          </div>
        </div>

        {/* 1. Ultra-Realistic Field Simulation Viewport Window */}
        <div className="relative h-52 rounded-2xl bg-zinc-950 border-2 border-zinc-800 overflow-hidden shadow-2xl">
          <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
        </div>

        {/* Target Dosage adjustment slider */}
        <div>
          <div className="flex justify-between text-xs font-bold mb-1">
            <span className="text-zinc-300">CALIBRATE DOSAGE VOLUME</span>
            <span className="text-amber-300 font-black">{targetMl} mL / m²</span>
          </div>
          <input
            type="range"
            min="10"
            max="100"
            step="5"
            value={targetMl}
            disabled={isActuating}
            onChange={(e) => setTargetMl(Number(e.target.value))}
            className="w-full accent-emerald-500 bg-zinc-800 h-2 rounded-lg cursor-pointer"
          />
        </div>

        {/* Nozzle Pressure Dial & Flow Settings */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="bg-zinc-950 p-2.5 rounded-2xl border border-zinc-800">
            <span className="text-[10px] text-zinc-400 font-bold uppercase block">Nozzle Pressure</span>
            <div className="flex items-center justify-between mt-1">
              <Gauge className="w-4 h-4 text-emerald-400" />
              <span className="text-sm font-black text-white">{manualPressure} Bar</span>
            </div>
            <input
              type="range"
              min="1.5"
              max="4.0"
              step="0.1"
              value={manualPressure}
              disabled={isActuating}
              onChange={(e) => {
                setManualPressure(Number(e.target.value));
                onUpdateHardware({ nozzlePressureBar: Number(e.target.value) });
              }}
              className="w-full mt-1.5 accent-amber-400 bg-zinc-800 h-1.5 rounded-lg"
            />
          </div>

          <div className="bg-zinc-950 p-2.5 rounded-2xl border border-zinc-800">
            <span className="text-[10px] text-zinc-400 font-bold uppercase block">Spray Pattern</span>
            <select
              value={hardwareState.nozzleType}
              disabled={isActuating}
              onChange={(e) => onUpdateHardware({ nozzleType: e.target.value as any })}
              className="w-full mt-1 bg-zinc-900 text-white text-xs font-bold p-1 rounded-xl border border-zinc-700"
            >
              <option value="FINE_MIST_CONE">Fine Mist Cone</option>
              <option value="FLAT_FAN">Flat Fan (110°)</option>
              <option value="VARIABLE_PRESSURE">Variable Pulse</option>
            </select>
          </div>
        </div>

        {/* 2. Primary Actuation Button with Premium Glow */}
        <div className="flex gap-2">
          {isActuating ? (
            <button
              onClick={handleStopSpray}
              className="flex-1 py-4 rounded-2xl bg-red-600 text-white font-black text-xs flex items-center justify-center gap-2 border-2 border-red-400 shadow-[0_0_25px_rgba(220,38,38,0.5)] transition-all active:scale-98 animate-pulse"
            >
              <Pause className="w-4 h-4 stroke-[2.5]" />
              <span>⏸ EMERGENCY STOP SPRAY</span>
            </button>
          ) : (
            <button
              onClick={handleStartSpray}
              className="flex-1 py-4 rounded-2xl bg-[#00FF88] hover:bg-[#00FF88]/90 text-black font-black text-xs flex items-center justify-center gap-2 border border-[#00FF88] shadow-[0_0_25px_rgba(0,255,136,0.35)] transition-all active:scale-98"
            >
              <Play className="w-4 h-4 stroke-[2.5] fill-black" />
              <span>[ ▶ ACTUATE TEST SPRAY ]</span>
            </button>
          )}
        </div>

        {/* Dedicated Live Metric Box (Positioned directly BELOW Actuation Button): SPRAY COUNTDOWN & ELAPSED TIME */}
        <div className="p-3.5 bg-black/95 rounded-2xl border border-zinc-800 space-y-2.5">
          <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-wider text-zinc-400">
            <div className="flex items-center gap-1.5 text-amber-400">
              <Clock className="w-3.5 h-3.5" />
              <span>SPRAY COUNTDOWN & ELAPSED TIME</span>
            </div>
            {isActuating ? (
              <span className="px-2 py-0.5 rounded-full bg-sky-950 text-sky-400 border border-sky-700 animate-pulse font-bold">
                SPRAYING ACTIVE
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-700 font-bold">
                [ READY TO DISPENSE ]
              </span>
            )}
          </div>

          {/* Real-time Decrementing Digital Timer Display with Milliseconds */}
          <div className="flex items-baseline justify-between bg-zinc-950 p-3 rounded-xl border border-zinc-800 font-mono">
            <div>
              <span className="text-[10px] text-zinc-500 block font-sans font-bold uppercase">
                {isActuating ? 'REMAINING TIME' : 'TIMER SPECIFICATION'}
              </span>
              <span className={`text-xl font-black ${isActuating ? 'text-sky-400 animate-pulse' : 'text-emerald-400'}`}>
                {isActuating ? `${remainingTimeStr} S REMAINING` : `00:00.00 / ${totalTimeStr} S`}
              </span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-zinc-500 block font-sans font-bold uppercase">DISPENSED</span>
              <span className="text-sm font-black text-white">{dispensedMl} / {targetMl} mL</span>
            </div>
          </div>

          {/* Dynamic Visual Progress Bar */}
          <div className="w-full h-3 bg-zinc-900 rounded-full overflow-hidden p-0.5 border border-zinc-800">
            <div
              className={`h-full rounded-full transition-all duration-75 ${
                isActuating ? 'bg-gradient-to-r from-sky-400 via-emerald-400 to-amber-400' : 'bg-zinc-700'
              }`}
              style={{ width: `${isActuating ? progressPct : 0}%` }}
            />
          </div>
        </div>
      </div>

      {/* CROP SELECTOR & SEARCH BAR DIRECTLY BELOW SPRINKLER NOZZLE CONTROL */}
      <div className="p-3.5 rounded-3xl bg-zinc-950 border border-zinc-800 space-y-2">
        <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 block">
          SELECT CROP CONTEXT FOR SPRAY CONTROL
        </span>
        <CropSelectorCarousel
          selectedCrop={selectedCrop}
          onSelectCrop={(crop) => {
            setSelectedCrop(crop);
            triggerHaptic(20);
          }}
          isHighContrast={isHighContrast}
        />
      </div>

      {/* 3. Recommended Pesticide Card (Positioned AT THE VERY BOTTOM of Spray Section) */}
      <div className="p-4 rounded-3xl bg-zinc-950 border-2 border-emerald-500/40 space-y-3.5 text-white shadow-2xl">
        {/* Header Tag */}
        <div className="flex items-center justify-between border-b border-emerald-800/80 pb-2.5">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
              <FlaskConical className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-sm font-black tracking-tight text-white uppercase">
                {latestScanRecord?.scannedProductName ? 'VERIFIED FROM BOTTLE SCAN' : 'RECOMMENDED PESTICIDE'}
              </h3>
              <p className="text-[10px] text-emerald-400 font-bold">
                Agronomic Database Mapping for {selectedCrop}
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              triggerHaptic(25);
              setIsDossierOpen(true);
            }}
            className="px-2.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-black flex items-center gap-1 shadow-md transition-all active:scale-95"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>INSPECT DOSSIER</span>
          </button>
        </div>

        {/* Populated Database Fields */}
        <div className="space-y-2.5">
          {/* Commercial Brand Name */}
          <div className="bg-zinc-900/90 p-3 rounded-2xl border border-zinc-800">
            <span className="text-[10px] font-extrabold text-amber-400 uppercase block tracking-wider">
              Commercial Brand Name
            </span>
            <p className="text-sm font-black text-white mt-0.5 leading-snug">
              {chemicalProfile.pesticideName}
            </p>
          </div>

          {/* Active Chemical Ingredients & Concentrations */}
          <div className="bg-zinc-900/90 p-3 rounded-2xl border border-zinc-800">
            <span className="text-[10px] font-extrabold text-zinc-400 uppercase block tracking-wider">
              Active Chemical Ingredients & Concentrations
            </span>
            <p className="text-xs font-bold text-zinc-200 mt-0.5 leading-relaxed">
              {chemicalProfile.composition}
            </p>
          </div>

          {/* Precise Dilution & Water Ratios & Target Diseases Controlled */}
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-zinc-900/90 p-3 rounded-2xl border border-zinc-800">
              <span className="text-[10px] font-extrabold text-zinc-400 uppercase block tracking-wider">
                Target Diseases Controlled
              </span>
              <p className="text-xs font-extrabold text-emerald-400 mt-0.5">
                {chemicalProfile.targetPathogen}
              </p>
            </div>

            <div className="bg-zinc-900/90 p-3 rounded-2xl border border-zinc-800">
              <span className="text-[10px] font-extrabold text-zinc-400 uppercase block tracking-wider">
                Precise Dilution & Water Ratios
              </span>
              <p className="text-xs font-extrabold text-sky-400 mt-0.5">
                {chemicalProfile.dilutionRatio}
              </p>
            </div>
          </div>

          {/* Pre-Harvest Interval (PHI in days) & PPE Protocols */}
          <div className="bg-[#10171D] p-3 rounded-2xl border border-[#1E293B] space-y-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-[#00E5FF]">
                <ShieldAlert className="w-4 h-4 stroke-[2.5]" />
                <span className="text-[10px] font-black uppercase tracking-wider">
                  Field Worker Safety PPE Protocols
                </span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-[#00E5FF]/10 text-[#00E5FF] text-[9px] font-black border border-[#00E5FF]/30">
                PHI: 7 DAYS (Pre-Harvest)
              </span>
            </div>
            <p className="text-xs font-medium text-[#E2E8F0] leading-relaxed">
              {chemicalProfile.safetyProtocol}
            </p>
          </div>
        </div>
      </div>

      {/* Chemical Tank Level Gauge & Refill Button */}
      <div className="p-3.5 rounded-3xl bg-[#10171D] border border-[#1E293B] text-[#E2E8F0] shadow-lg flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Droplets className="w-6 h-6 text-sky-400 stroke-[2]" />
          <div>
            <span className="text-[10px] text-zinc-400 font-bold uppercase block">Pesticide Tank Level</span>
            <p className="text-sm font-black text-white">
              {hardwareState.tankLevelMl} / {hardwareState.maxTankCapacityMl} mL
            </p>
          </div>
        </div>

        <button
          onClick={handleRefillTank}
          className="px-3 py-2 rounded-xl bg-zinc-800 text-zinc-200 text-xs font-bold hover:bg-zinc-700 border border-zinc-700 flex items-center gap-1 transition-all active:scale-95"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>REFILL TANK</span>
        </button>
      </div>

      {/* Pesticide Dossier Modal Modal */}
      <PesticideDossierModal
        dossier={getPesticideDossier(chemicalProfile.pesticideName)}
        isOpen={isDossierOpen}
        onClose={() => setIsDossierOpen(false)}
        isHighContrast={isHighContrast}
      />
    </div>
  );
};
