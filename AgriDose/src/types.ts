export type InfectionSeverityLevel = 'HEALTHY' | 'MILD' | 'MODERATE' | 'SEVERE';

export type ValidationStatus = 'SUCCESS' | 'RED_ALERT';
export type ValidationResultType = 'PASSED' | 'FAILED';
export type ErrorCategoryType = 'NONE' | 'NON_CROP_IMAGE' | 'AI_GENERATED_DETECTED' | 'UNREADABLE_IMAGE';
export type HardwareLockoutStatus = 'READY_TO_ACTUATE' | 'SPRINKLER_DISABLED' | 'SPRINKLER_LOCKED';
export type SprinklerActionTrigger = 'START_SPRAY' | 'PAUSE_SPRAY' | 'STOP_SPRAY';

export type CropType = 
  | 'Paddy'
  | 'Tomato' 
  | 'Cotton' 
  | 'Wheat' 
  | 'Maize' 
  | 'Potato' 
  | 'Grape' 
  | 'Apple' 
  | 'Rice' 
  | 'Cucumber'
  | 'Sugarcane'
  | 'Mustard'
  | 'Chilli'
  | 'Onion'
  | 'Mango'
  | 'Papaya'
  | 'Soybean'
  | 'Tea'
  | 'Coffee'
  | 'Barley'
  | 'Banana'
  | 'Guava'
  | 'Other';

export interface WeatherData {
  locationName: string;
  temperatureC: number;
  condition: string; // e.g. "Heavy Rain Expected", "Snowfall Warning", "Clear & Sunny"
  humidityPct: number;
  windKmH: number;
  precipitationRiskPct: number;
  hasExtremeWarning: boolean;
  warningType?: 'SNOWFALL' | 'HEAVY_RAINFALL' | 'THUNDERSTORM' | 'HIGH_WIND' | 'FROST' | 'NONE';
  warningMessage?: string;
  isSpraySafe: boolean; // false if rain/snow within 12h
  forecastHours: {
    time: string;
    tempC: number;
    popPct: number;
    icon: 'sun' | 'rain' | 'snow' | 'cloud' | 'storm';
  }[];
}

export type ScanModeType = 'CROP_HEALTH_ANALYSIS' | 'PESTICIDE_LABEL_SCAN';

export interface RegistrationNumbers {
  cpcb?: string;
  epa?: string;
  icar?: string;
  eu?: string;
}

export type ToxicityRatingBand = 'GREEN_TRIANGLE' | 'BLUE_TRIANGLE' | 'YELLOW_TRIANGLE' | 'RED_TRIANGLE';

export interface NozzlePresetConfig {
  flowRateMlMin: number;
  pressureBar: number;
  dropletSizeMicrons: number;
  pattern: string;
}

export interface PesticideDossier {
  commercialName: string;
  technicalCategory: string;
  formulationType: string;
  activeIngredients: string;
  casNumbers: string;
  chemicalClasses: string;
  concentrationPercentages: string;
  registrationNumbers: RegistrationNumbers;
  toxicityRating: ToxicityRatingBand;
  ghsWarningSymbols: string[];
  preHarvestIntervalDays: number;
  fieldSafetyProtocols: string;
  firstAidDirections: string;
  precisionDilutionRatio: string;
  tankMixingCompatibility: string;
  idealApplicationTimings: string;
  recommendedNozzlePresets: NozzlePresetConfig;
  targetPathogensList: string[];
  modeOfAction: string;
  geographicApprovals: string;
}

export interface PlantScanRecord {
  id: string;
  timestamp: string; // ISO date string
  scanType?: ScanModeType;
  cropType: CropType;
  infectionName: string;
  severityLevel: InfectionSeverityLevel;
  infectionPercentage: number; // 0 - 100
  affectedSymptoms: string[];
  recommendedChemical: string;
  targetDosageMlPerSqm: number; // mL per m²
  sprayDurationSec: number; // seconds
  nozzlePressureBar: number; // bar pressure
  solutionConcentrationPct: number; // % concentration
  chemicalSavingsVsUniformPct: number; // % saved vs blanket spray
  costSavedDollars: number; // $ saved
  soilToxicityReductionPct: number; // % reduction in chemical runoff
  locationSector: string; // e.g. "Sector B-12"
  gpsCoords?: {
    lat: number;
    lng: number;
  };
  imageUrl: string;
  synced: boolean;
  notes?: string;
  sprayStatus: 'PENDING' | 'SPRAYED' | 'SKIPPED';
  agronomicAdvice: string;
  // Stage 1 & 2 Engine Fields
  status?: ValidationStatus;
  validationResult?: ValidationResultType;
  hardwareSystemState?: HardwareLockoutStatus;
  errorCategory?: ErrorCategoryType;
  failureReason?: string;
  englishAlertMessage?: string;
  hindiAlertMessage?: string;
  sprinklerActionTrigger?: SprinklerActionTrigger;
  sprayDecisionReason?: string;
  totalSprayDuration?: string;
  activeCountdownTimerSec?: number;
  activeIngredients?: string;
  dilutionRatio?: string;
  applicationSafetyGuidance?: string;
  // Pipeline Execution Metrics & Hybrid CNN
  analysisTimeElapsed?: string;
  cnnConfidenceScore?: number;
  cnnPrimaryFeatureMatch?: string;
  pipelineStage?: string;
  // Deep Pesticide Dossier
  pesticideDossier?: PesticideDossier;
  // Pesticide Bottle Label OCR Fields
  scannedProductName?: string;
  detectedActiveIngredients?: string;
  chemicalCategory?: string;
  safetyWarnings?: string;
  compatibilityStatus?: 'COMPATIBLE' | 'INCOMPATIBLE' | 'CAUTION';
  compatibilityNotes?: string;
  voiceGuidanceSummary?: {
    english: string;
    hindi: string;
  };
}

export interface SprinklerHardwareState {
  connected: boolean;
  batteryLevelPct: number;
  tankLevelMl: number;
  maxTankCapacityMl: number;
  nozzlePressureBar: number;
  isSpraying: boolean;
  currentFlowRateMlSec: number;
  bluetoothSignalDbm: number;
  mode: 'AUTO_AI' | 'MANUAL_CALIBRATION' | 'ECO_PULSE';
  nozzleType: 'FINE_MIST_CONE' | 'FLAT_FAN' | 'VARIABLE_PRESSURE';
}

export interface FieldSector {
  id: string;
  name: string;
  crop: CropType;
  plantCount: number;
  avgInfectionPct: number;
  status: 'HEALTHY' | 'ATTENTION' | 'CRITICAL';
  lastScanned: string;
  recommendedSprayVolMl: number;
}

export interface AppThemeConfig {
  highContrastOutdoor: boolean; // Direct sunlight high-visibility yellow/black mode
  batterySaverEco: boolean; // Low-power OLED black canvas & throttled FX
  voiceAudioEnabled: boolean; // Audio readouts for field workers
  hapticsEnabled: boolean; // Vibration feedback simulation
  language: 'EN' | 'ES' | 'HI' | 'FR' | 'SW'; // Multilingual option
}

export interface PlantAnalysisResult {
  scanType?: ScanModeType;
  // Gatekeeper Validation & Hardware State
  status: ValidationStatus;
  validationResult: ValidationResultType;
  hardwareSystemState: HardwareLockoutStatus;
  errorCategory?: ErrorCategoryType;
  failureReason?: string;
  englishAlertMessage?: string;
  hindiAlertMessage?: string;

  // Hybrid CNN & Execution Metrics
  analysisTimeElapsed?: string;
  cnnConfidenceScore?: number;
  cnnPrimaryFeatureMatch?: string;
  pipelineStage?: string;

  // System & Gatekeeper States
  systemState?: 'READY_FOR_DIAGNOSIS' | 'AI_GENERATION_ALERT' | 'NON_CROP_ALERT' | 'UNREADABLE_ALERT';
  ensembleArchitecture?: string; // e.g. "ResNet-152 + Swin Transformer + Edge Extraction (98.4% Accuracy)"

  // Option 3: Auto-Isolation & Edge Cropping Metadata
  autoIsolationMetadata?: {
    roiExtracted: boolean;
    backgroundMaskedPct: number;
    labelUnwarped: boolean;
    bbox?: { x: number; y: number; width: number; height: number };
    isolatedImageUrl?: string;
  };

  // Option 4: Multi-Leaf Burst Scan Engine Metadata
  burstScanData?: {
    isBurstMode: boolean;
    frameCount: number;
    frames: Array<{
      frameId: string;
      damagePct: number;
      confidence: number;
      pathogen: string;
      isValid: boolean;
    }>;
    compositeDamagePct: number;
    compositeConfidence: number;
    pathogenReconciled: string;
    reconciliationNotes: string;
  };

  // Multi-Spectral Lesion Segmentation Breakdown
  multiSpectralBreakdown?: {
    necroticTissuePct: number;
    chloroticHaloPct: number;
    totalLaminaDamagePct: number;
    microSymptoms: string[];
  };

  // 1. Pathology Diagnostics
  cropType: CropType;
  infectionName: string;
  scientificName?: string;
  binomialNomenclature?: string;
  severityLevel: InfectionSeverityLevel;
  infectionPercentage: number; // Surface area damaged %
  confidenceScore: number;
  affectedSymptoms: string[];
  symptomBreakdown?: string[];
  diagnosisState?: 'CONFIRMED_DIAGNOSIS' | 'UNCERTAIN_DIAGNOSIS';
  potentialPathogens?: Array<{ pathogen: string; scientificName?: string; confidenceRange: string }>;
  databaseTrainingAction?: 'LOG_FOR_DATABASE_TRAINING' | 'NONE';
  databaseTrainingLogPayload?: {
    action: 'LOG_FOR_DATABASE_TRAINING';
    timestamp: string;
    cropType: string;
    confidenceScore: number;
    reason: string;
    imageFrameLogged: boolean;
    uncertainMatches?: Array<{ pathogen: string; confidenceRange: string }>;
  };

  // 2. Sprinkler Actuation & Controller Metrics
  sprinklerActionTrigger: SprinklerActionTrigger;
  sprayDecisionReason: string;
  totalSprayDuration: string; // e.g. "3.2 Seconds"
  activeCountdownTimerSec: number; // e.g. 3.2
  targetDosageMlPerSqm: number;
  sprayDurationSec: number;
  nozzlePressureBar: number;
  solutionConcentrationPct: number;
  chemicalSavingsVsUniformPct: number;
  costSavedDollarsPerHectare: number;
  soilToxicityReductionPct: number;

  // 3. Pesticide & Fertilizer Chemical Profile
  recommendedChemical: string;
  activeIngredients: string;
  dilutionRatio?: string;
  applicationSafetyGuidance: string;
  pesticideDossier?: PesticideDossier;

  // 4. Pesticide Label Scan Mode Specifics
  scannedProductName?: string;
  detectedActiveIngredients?: string;
  chemicalCategory?: string;
  safetyWarnings?: string;
  compatibilityStatus?: 'COMPATIBLE' | 'INCOMPATIBLE' | 'CAUTION';
  compatibilityNotes?: string;

  voiceGuidanceSummary: {
    english: string;
    hindi: string;
  };
  agronomicAdvice: string;
}

export interface DosageFormulaConfig {
  maxBlanketDosageMlPerSqm: number; // Max rate for uniform blanket spray (e.g. 100 mL/m²)
  healthyMultiplierPct: number; // Dosage % for HEALTHY (default 0%)
  mildMultiplierPct: number; // Dosage % for MILD (default 20%)
  moderateMultiplierPct: number; // Dosage % for MODERATE (default 50%)
  severeMultiplierPct: number; // Dosage % for SEVERE (default 90%)
  cropRiskModifiers: Record<string, number>; // Modifier per crop type
  pressureBarBySeverity: Record<InfectionSeverityLevel, number>;
}

export const DEFAULT_DOSAGE_CONFIG: DosageFormulaConfig = {
  maxBlanketDosageMlPerSqm: 100,
  healthyMultiplierPct: 0,
  mildMultiplierPct: 20,
  moderateMultiplierPct: 50,
  severeMultiplierPct: 90,
  cropRiskModifiers: {
    Paddy: 0,
    Tomato: 5,
    Cotton: 0,
    Wheat: -5,
    Maize: 0,
    Potato: 10,
    Grape: 15,
    Apple: 5,
    Rice: 0,
    Cucumber: 0,
    Sugarcane: 5,
    Mustard: -5,
    Chilli: 8,
    Onion: 2,
    Mango: 12,
    Papaya: 10,
    Soybean: 0,
    Tea: 10,
    Coffee: 8,
    Barley: -5,
    Banana: 12,
    Guava: 5,
    Other: 0,
  },
  pressureBarBySeverity: {
    HEALTHY: 2.0,
    MILD: 2.5,
    MODERATE: 3.0,
    SEVERE: 3.8,
  },
};

export function calculateDosageFromFormula(
  severity: InfectionSeverityLevel,
  config: DosageFormulaConfig = DEFAULT_DOSAGE_CONFIG,
  cropType: CropType = 'Tomato',
  areaSqm: number = 1
): {
  dosageMlPerSqm: number;
  totalMl: number;
  blanketTotalMl: number;
  savingsPct: number;
  sprayDurationSec: number;
  recommendedPressureBar: number;
} {
  let basePct = 0;
  if (severity === 'HEALTHY') basePct = config.healthyMultiplierPct;
  else if (severity === 'MILD') basePct = config.mildMultiplierPct;
  else if (severity === 'MODERATE') basePct = config.moderateMultiplierPct;
  else if (severity === 'SEVERE') basePct = config.severeMultiplierPct;

  const cropMod = config.cropRiskModifiers[cropType] || 0;
  const effectivePct = Math.min(100, Math.max(0, basePct + cropMod));

  const dosageMlPerSqm = Math.round((config.maxBlanketDosageMlPerSqm * effectivePct) / 100);
  const totalMl = Math.round(dosageMlPerSqm * areaSqm);
  const blanketTotalMl = Math.round(config.maxBlanketDosageMlPerSqm * areaSqm);
  const savingsPct = Math.max(0, Math.round(((blanketTotalMl - totalMl) / (blanketTotalMl || 1)) * 100));
  const sprayDurationSec = Number((dosageMlPerSqm * 0.08 * areaSqm).toFixed(1));
  const recommendedPressureBar = config.pressureBarBySeverity[severity] || 2.8;

  return {
    dosageMlPerSqm,
    totalMl,
    blanketTotalMl,
    savingsPct,
    sprayDurationSec,
    recommendedPressureBar,
  };
}

