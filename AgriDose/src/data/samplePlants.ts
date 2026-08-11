import { CropType, InfectionSeverityLevel } from '../types';

export interface SamplePlantLeaf {
  id: string;
  name: string;
  cropType: CropType;
  infectionName: string;
  severityLevel: InfectionSeverityLevel;
  infectionPercentage: number;
  imageUrl: string;
  description: string;
  recommendedChemical: string;
  targetDosageMlPerSqm: number;
  sprayDurationSec: number;
  nozzlePressureBar: number;
  solutionConcentrationPct: number;
  chemicalSavingsVsUniformPct: number;
  costSavedDollars: number;
  soilToxicityReductionPct: number;
  agronomicAdvice: string;
}

// Crisp vector SVG Data URLs representing leaves with various disease severity stages
const createLeafSvg = (color: string, spotColor: string, spotsCount: number, label: string) => {
  let spots = '';
  for (let i = 0; i < spotsCount; i++) {
    const cx = 120 + (Math.sin(i * 1.7) * 70);
    const cy = 100 + (Math.cos(i * 1.3) * 60);
    const r = 6 + (i % 4) * 3;
    spots += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${spotColor}" opacity="0.85" stroke="#330000" stroke-width="1.5"/>`;
    spots += `<circle cx="${cx}" cy="${cy}" r="${r * 1.8}" fill="${spotColor}" opacity="0.25"/>`;
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300" width="100%" height="100%">
    <defs>
      <linearGradient id="leafGrad${label.replace(/\s+/g, '')}" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${color}"/>
        <stop offset="100%" stop-color="#1b3d18"/>
      </linearGradient>
      <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
        <feDropShadow dx="2" dy="4" stdDeviation="4" flood-opacity="0.3"/>
      </filter>
    </defs>
    <rect width="300" height="300" fill="#0f1911" rx="16"/>
    <!-- Grid background for field scanner look -->
    <path d="M 0,50 L 300,50 M 0,100 L 300,100 M 0,150 L 300,150 M 0,200 L 300,200 M 0,250 L 300,250" stroke="#1d3020" stroke-width="1"/>
    <path d="M 50,0 L 50,300 M 100,0 L 100,300 M 150,0 L 150,300 M 200,0 L 200,300 M 250,0 L 250,300" stroke="#1d3020" stroke-width="1"/>
    
    <!-- Main Leaf Body -->
    <g filter="url(#shadow)">
      <!-- Stem -->
      <path d="M 150,280 C 150,230 148,150 148,30" stroke="#8da832" stroke-width="6" stroke-linecap="round" fill="none"/>
      <!-- Leaf blade -->
      <path d="M 150,30 C 240,80 260,180 150,250 C 40,180 60,80 150,30 Z" fill="url(#leafGrad${label.replace(/\s+/g, '')})" stroke="#4d7c2a" stroke-width="3"/>
      <!-- Veins -->
      <path d="M 150,70 Q 190,100 220,110 M 150,110 Q 200,140 230,155 M 150,150 Q 190,180 215,195" stroke="#71a33c" stroke-width="2.5" fill="none" opacity="0.7"/>
      <path d="M 150,70 Q 110,100 80,110 M 150,110 Q 100,140 70,155 M 150,150 Q 110,180 85,195" stroke="#71a33c" stroke-width="2.5" fill="none" opacity="0.7"/>
    </g>
    <!-- Lesions / Spots -->
    ${spots}
    
    <!-- Reticle Bounding Box -->
    <rect x="40" y="30" width="220" height="230" fill="none" stroke="#22c55e" stroke-width="2" stroke-dasharray="6,4" rx="8" opacity="0.6"/>
    <text x="150" y="285" fill="#facc15" font-family="sans-serif" font-size="12" font-weight="bold" text-anchor="middle">${label}</text>
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

export interface SamplePesticideBottle {
  id: string;
  brandName: string;
  activeIngredients: string;
  chemicalCategory: string;
  imageUrl: string;
  dilutionRatio: string;
  targetPathogens: string;
  safetyWarnings: string;
  cropType: CropType;
}

const createPesticideBottleSvg = (brandName: string, category: string) => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300" width="100%" height="100%">
    <rect width="300" height="300" fill="#091319" rx="16"/>
    <!-- Grid -->
    <path d="M 0,50 L 300,50 M 0,100 L 300,100 M 0,150 L 300,150 M 0,200 L 300,200 M 0,250 L 300,250" stroke="#162c38" stroke-width="1"/>
    <!-- Bottle Shape -->
    <g filter="drop-shadow(2px 4px 6px rgba(0,0,0,0.5))">
      <!-- Cap -->
      <rect x="125" y="35" width="50" height="25" fill="#facc15" rx="4" stroke="#a16207" stroke-width="2"/>
      <!-- Bottle Body -->
      <path d="M 130,60 L 170,60 L 185,90 L 185,240 Q 185,250 175,250 L 125,250 Q 115,250 115,240 L 115,90 Z" fill="#1e293b" stroke="#38bdf8" stroke-width="3"/>
      <!-- Bottle Label -->
      <rect x="120" y="100" width="60" height="130" fill="#f8fafc" rx="4" stroke="#e2e8f0" stroke-width="1.5"/>
      <!-- Hazard Diamond -->
      <polygon points="150,110 160,120 150,130 140,120" fill="#ef4444"/>
      <!-- Label Text lines -->
      <text x="150" y="145" fill="#0f172a" font-family="sans-serif" font-size="8" font-weight="bold" text-anchor="middle">${brandName.substring(0, 16)}</text>
      <text x="150" y="158" fill="#0284c7" font-family="sans-serif" font-size="6" text-anchor="middle">${category.substring(0, 20)}</text>
      <line x1="125" y1="165" x2="175" y2="165" stroke="#cbd5e1" stroke-width="1"/>
      <rect x="125" y="170" width="50" height="4" fill="#94a3b8" rx="1"/>
      <rect x="125" y="178" width="40" height="4" fill="#94a3b8" rx="1"/>
      <rect x="125" y="186" width="45" height="4" fill="#94a3b8" rx="1"/>
      <text x="150" y="215" fill="#dc2626" font-family="sans-serif" font-size="6" font-weight="bold" text-anchor="middle">ACTIVE 75% WP</text>
    </g>
    <!-- Scanning Reticle -->
    <rect x="75" y="25" width="150" height="240" fill="none" stroke="#06b6d4" stroke-width="2" stroke-dasharray="8,5" rx="10"/>
    <text x="150" y="282" fill="#38bdf8" font-family="sans-serif" font-size="11" font-weight="bold" text-anchor="middle">PESTICIDE CONTAINER OCR</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

export const SAMPLE_PESTICIDE_BOTTLES: SamplePesticideBottle[] = [
  {
    id: 'sample-bottle-mancozeb',
    brandName: 'Mancozeb 75% WP + Copper Fungicide',
    activeIngredients: 'Ethylenebisdithiocarbamate 75%, Metallic Copper Equivalent 50%',
    chemicalCategory: 'Broad-Spectrum Protective Contact Fungicide',
    imageUrl: createPesticideBottleSvg('Mancozeb 75% WP', 'Contact Fungicide'),
    dilutionRatio: '2.5 g per Litre of water',
    targetPathogens: 'Foliar Fungal Spot, Early Blight, Downy Mildew, Paddy Blast',
    safetyWarnings: 'Pre-Harvest Interval (PHI): 7 days. Wear N95 protective mask & gloves.',
    cropType: 'Tomato',
  },
  {
    id: 'sample-bottle-tricyclazole',
    brandName: 'Beam 75% WP (Tricyclazole)',
    activeIngredients: 'Tricyclazole 75% w/w',
    chemicalCategory: 'Systemic Melanin Biosynthesis Inhibitor Fungicide',
    imageUrl: createPesticideBottleSvg('Beam Tricyclazole', 'Systemic Fungicide'),
    dilutionRatio: '0.6 g per Litre of water',
    targetPathogens: 'Rice / Paddy Neck Blast & Foliar Blast',
    safetyWarnings: 'Pre-Harvest Interval (PHI): 21 days. Harmful if swallowed.',
    cropType: 'Paddy',
  },
  {
    id: 'sample-bottle-copper-oxy',
    brandName: 'Blitox 50% WP (Copper Oxychloride)',
    activeIngredients: 'Copper Oxychloride 50% WP (Metallic Copper Equivalent 45%)',
    chemicalCategory: 'Copper-Based Bactericide & Contact Fungicide',
    imageUrl: createPesticideBottleSvg('Blitox Copper 50', 'Contact Bactericide'),
    dilutionRatio: '3.0 g per Litre of water',
    targetPathogens: 'Bacterial Spot, Leaf Canker, Late Blight',
    safetyWarnings: 'Toxic to aquatic organisms. Wear protective eye goggles during mixing.',
    cropType: 'Potato',
  },
];

export const SAMPLE_PLANT_LEAVES: SamplePlantLeaf[] = [
  {
    id: 'sample-paddy-blast',
    name: 'Paddy Blast Leaf',
    cropType: 'Paddy',
    infectionName: 'Rice / Paddy Blast (Magnaporthe oryzae)',
    severityLevel: 'MODERATE',
    infectionPercentage: 42,
    imageUrl: createLeafSvg('#22c55e', '#b91c1c', 8, 'PADDY BLAST (42%)'),
    description: 'Spindle-shaped lesions with grayish-white centers and reddish-brown borders on Paddy leaf.',
    recommendedChemical: 'Tricyclazole 75% WP or Isoprothiolane 40% EC',
    targetDosageMlPerSqm: 40,
    sprayDurationSec: 3.2,
    nozzlePressureBar: 2.8,
    solutionConcentrationPct: 0.6,
    chemicalSavingsVsUniformPct: 60,
    costSavedDollars: 12.80,
    soilToxicityReductionPct: 62,
    agronomicAdvice: 'Apply micro-spray at lower canopy during tillering stage to prevent neck blast migration.',
  },
  {
    id: 'sample-healthy-tomato',
    name: 'Healthy Tomato Leaf',
    cropType: 'Tomato',
    infectionName: 'Healthy (No Pathogen Detected)',
    severityLevel: 'HEALTHY',
    infectionPercentage: 0,
    imageUrl: createLeafSvg('#34d399', '#22c55e', 0, 'HEALTHY TOMATO (0%)'),
    description: 'Vibrant green chlorophyll pigment with undamaged cuticles and crisp cell wall margins.',
    recommendedChemical: 'None (Pure Water Mist / Organic Bio-Stimulant optional)',
    targetDosageMlPerSqm: 0,
    sprayDurationSec: 0,
    nozzlePressureBar: 1.5,
    solutionConcentrationPct: 0,
    chemicalSavingsVsUniformPct: 100,
    costSavedDollars: 18.50,
    soilToxicityReductionPct: 100,
    agronomicAdvice: 'Plant is completely healthy. Zero pesticide needed. Saves 100% of chemicals and prevents unnecessary soil contamination.',
  },
  {
    id: 'sample-mild-cotton',
    name: 'Cotton Leaf Spot',
    cropType: 'Cotton',
    infectionName: 'Alternaria Leaf Spot (Mild Stage)',
    severityLevel: 'MILD',
    infectionPercentage: 18,
    imageUrl: createLeafSvg('#a3e635', '#a16207', 4, 'MILD COTTON SPOT (18%)'),
    description: 'Initial circular brown lesions with faint chlorotic halos localized on lower leaves.',
    recommendedChemical: 'Mancozeb 75% WP or Copper Oxychloride',
    targetDosageMlPerSqm: 18,
    sprayDurationSec: 1.8,
    nozzlePressureBar: 2.2,
    solutionConcentrationPct: 0.2,
    chemicalSavingsVsUniformPct: 82,
    costSavedDollars: 15.20,
    soilToxicityReductionPct: 82,
    agronomicAdvice: 'Targeted low-volume micro-pulse spray. Apply 18 mL/m² at 2.2 bar pressure. Avoid blanket spraying adjacent healthy plants.',
  },
  {
    id: 'sample-moderate-wheat',
    name: 'Wheat Yellow Rust',
    cropType: 'Wheat',
    infectionName: 'Puccinia striiformis (Moderate Yellow Rust)',
    severityLevel: 'MODERATE',
    infectionPercentage: 45,
    imageUrl: createLeafSvg('#eab308', '#c2410c', 9, 'MODERATE WHEAT RUST (45%)'),
    description: 'Striped orange-yellow pustules rupturing leaf epidermis along vascular veins.',
    recommendedChemical: 'Propiconazole 25% EC or Tebuconazole',
    targetDosageMlPerSqm: 42,
    sprayDurationSec: 3.5,
    nozzlePressureBar: 3.0,
    solutionConcentrationPct: 0.5,
    chemicalSavingsVsUniformPct: 58,
    costSavedDollars: 11.40,
    soilToxicityReductionPct: 60,
    agronomicAdvice: 'Proportional medium spray rate. 42 mL/m² with fine mist atomization to cover pustules without dripping into soil.',
  },
  {
    id: 'sample-severe-maize',
    name: 'Maize Northern Leaf Blight',
    cropType: 'Maize',
    infectionName: 'Exserohilum turcicum (Severe Blight)',
    severityLevel: 'SEVERE',
    infectionPercentage: 82,
    imageUrl: createLeafSvg('#f97316', '#7f1d1d', 16, 'SEVERE MAIZE BLIGHT (82%)'),
    description: 'Large elliptical grayish-green necrotic lesions merging across over 80% of leaf blade surface.',
    recommendedChemical: 'Azoxystrobin + Difenoconazole systemic fungicide',
    targetDosageMlPerSqm: 78,
    sprayDurationSec: 6.2,
    nozzlePressureBar: 3.8,
    solutionConcentrationPct: 1.2,
    chemicalSavingsVsUniformPct: 22,
    costSavedDollars: 4.10,
    soilToxicityReductionPct: 25,
    agronomicAdvice: 'Severe infection level detected. Intensive targeted high-volume spray required (78 mL/m²) to stop sporulation and protect grain yield.',
  },
  {
    id: 'sample-severe-potato',
    name: 'Potato Late Blight',
    cropType: 'Potato',
    infectionName: 'Phytophthora infestans (Late Blight)',
    severityLevel: 'SEVERE',
    infectionPercentage: 75,
    imageUrl: createLeafSvg('#84cc16', '#450a0a', 14, 'POTATO LATE BLIGHT (75%)'),
    description: 'Dark water-soaked necrotic lesions with surrounding chlorotic halo on Potato foliage.',
    recommendedChemical: 'Cymoxanil + Mancozeb or Metalaxyl-M',
    targetDosageMlPerSqm: 72,
    sprayDurationSec: 5.8,
    nozzlePressureBar: 3.5,
    solutionConcentrationPct: 0.8,
    chemicalSavingsVsUniformPct: 28,
    costSavedDollars: 5.50,
    soilToxicityReductionPct: 30,
    agronomicAdvice: 'Systemic spray required immediately to halt tuber infection. Ensure nozzle pressure covers undersides.',
  },
  {
    id: 'sample-moderate-sugarcane',
    name: 'Sugarcane Red Rot',
    cropType: 'Sugarcane',
    infectionName: 'Colletotrichum falcatum (Red Rot)',
    severityLevel: 'MODERATE',
    infectionPercentage: 38,
    imageUrl: createLeafSvg('#15803d', '#991b1b', 7, 'SUGARCANE RED ROT (38%)'),
    description: 'Reddening along vascular leaf midrib with scattered red lesions.',
    recommendedChemical: 'Carbendazim 50% WP or Trichoderma viride',
    targetDosageMlPerSqm: 38,
    sprayDurationSec: 3.0,
    nozzlePressureBar: 2.7,
    solutionConcentrationPct: 0.6,
    chemicalSavingsVsUniformPct: 62,
    costSavedDollars: 13.50,
    soilToxicityReductionPct: 65,
    agronomicAdvice: 'Drench root base and spray infected leaf midribs at 2.7 bar pressure.',
  },
  {
    id: 'sample-moderate-cucumber',
    name: 'Cucumber Powdery Mildew',
    cropType: 'Cucumber',
    infectionName: 'Erysiphe cichoracearum (Powdery Mildew)',
    severityLevel: 'MODERATE',
    infectionPercentage: 55,
    imageUrl: createLeafSvg('#84cc16', '#e2e8f0', 12, 'MODERATE MILDEW (55%)'),
    description: 'Talc-like white fungal colonies expanding over upper leaf surface.',
    recommendedChemical: 'Wettable Sulfur 80% WDG or Myclobutanil',
    targetDosageMlPerSqm: 50,
    sprayDurationSec: 4.0,
    nozzlePressureBar: 2.8,
    solutionConcentrationPct: 0.8,
    chemicalSavingsVsUniformPct: 50,
    costSavedDollars: 9.80,
    soilToxicityReductionPct: 52,
    agronomicAdvice: 'Apply 50 mL/m² with wide fan nozzle. Sulfur treatment protects soil ecology while stripping fungal mycelium.',
  }
];
