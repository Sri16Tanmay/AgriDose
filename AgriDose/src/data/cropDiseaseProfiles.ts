import { CropType } from '../types';

export interface CropDiseaseProfile {
  cropType: CropType;
  primaryDiseaseName: string;
  scientificName?: string;
  symptoms: string[];
  recommendedChemical: string;
  solutionConcentrationPct: number;
  baseDosageMlPerSqm: number;
  nozzlePressureBar: number;
  sprayDurationSec: number;
  description: string;
  agronomicAdvice: string;
  alternateDiseases: {
    name: string;
    symptoms: string[];
    recommendedChemical: string;
  }[];
}

export const CROP_DISEASE_PROFILES: Record<string, CropDiseaseProfile> = {
  Paddy: {
    cropType: 'Paddy',
    primaryDiseaseName: 'Rice / Paddy Blast (Magnaporthe oryzae)',
    scientificName: 'Magnaporthe oryzae',
    symptoms: ['Spindle/diamond-shaped foliar lesions', 'Necrotic brown borders with gray centers', 'Stunted panicle growth'],
    recommendedChemical: 'Tricyclazole 75% WP or Isoprothiolane 40% EC',
    solutionConcentrationPct: 0.6,
    baseDosageMlPerSqm: 40,
    nozzlePressureBar: 2.8,
    sprayDurationSec: 3.2,
    description: 'Fungal pathogen causing destructive lesions on paddy leaves and panicle necks in humid conditions.',
    agronomicAdvice: 'Target spray at lower canopy during early tillering. Avoid excessive nitrogen fertilizer.',
    alternateDiseases: [
      { name: 'Sheath Blight (Rhizoctonia solani)', symptoms: ['Oval greenish-gray lesions on leaf sheath', 'Stem weakness'], recommendedChemical: 'Validamycin 3% L or Hexaconazole 5% EC' },
      { name: 'Bacterial Leaf Blight (Xanthomonas)', symptoms: ['Water-soaked yellow-orange stripes along leaf margins'], recommendedChemical: 'Copper Hydroxide + Streptocycline' }
    ]
  },
  Rice: {
    cropType: 'Rice',
    primaryDiseaseName: 'Rice Blast (Magnaporthe oryzae)',
    scientificName: 'Magnaporthe oryzae',
    symptoms: ['Spindle-shaped leaf lesions', 'Grayish white center with reddish-brown margin'],
    recommendedChemical: 'Tricyclazole 75% WP',
    solutionConcentrationPct: 0.6,
    baseDosageMlPerSqm: 40,
    nozzlePressureBar: 2.8,
    sprayDurationSec: 3.2,
    description: 'Destructive fungal blast affecting rice foliage and panicles.',
    agronomicAdvice: 'Apply targeted micro-spray on affected tillers to prevent neck blast stage.',
    alternateDiseases: [
      { name: 'Brown Spot (Bipolaris oryzae)', symptoms: ['Circular brown spots on leaves and grains'], recommendedChemical: 'Mancozeb 75% WP' }
    ]
  },
  Wheat: {
    cropType: 'Wheat',
    primaryDiseaseName: 'Yellow Rust / Stripe Rust',
    scientificName: 'Puccinia striiformis',
    symptoms: ['Bright orange-yellow linear pustules along leaf veins', 'Chlorotic striping'],
    recommendedChemical: 'Propiconazole 25% EC or Tebuconazole 250 EC',
    solutionConcentrationPct: 0.5,
    baseDosageMlPerSqm: 42,
    nozzlePressureBar: 3.0,
    sprayDurationSec: 3.5,
    description: 'Vascular rust fungal pustules that break leaf epidermis and cause severe yield loss.',
    agronomicAdvice: 'Apply fine atomized mist directly onto upper canopy stripes upon first detection.',
    alternateDiseases: [
      { name: 'Powdery Mildew (Blumeria graminis)', symptoms: ['White fluffy fungal patches on lower leaves'], recommendedChemical: 'Sulfur 80% WDG or Triadimefon' },
      { name: 'Leaf Blight (Helminthosporium)', symptoms: ['Oval tan spots with dark brown ring'], recommendedChemical: 'Mancozeb 75% WP' }
    ]
  },
  Maize: {
    cropType: 'Maize',
    primaryDiseaseName: 'Northern Corn Leaf Blight',
    scientificName: 'Exserohilum turcicum',
    symptoms: ['Large cigar-shaped grayish-green necrotic lesions', 'Severe leaf necrosis'],
    recommendedChemical: 'Azoxystrobin + Difenoconazole',
    solutionConcentrationPct: 1.0,
    baseDosageMlPerSqm: 45,
    nozzlePressureBar: 3.2,
    sprayDurationSec: 3.6,
    description: 'Fungal disease causing widespread leaf destruction in corn/maize fields.',
    agronomicAdvice: 'Direct high-pressure spray toward leaf axils before silking phase.',
    alternateDiseases: [
      { name: 'Common Rust (Puccinia sorghi)', symptoms: ['Golden brown oval pustules on leaf surfaces'], recommendedChemical: 'Mancozeb 75% WP' },
      { name: 'Fall Armyworm Damage', symptoms: ['Shot-holes and ragged margins on leaf whorl'], recommendedChemical: 'Emamectin Benzoate 5% SG' }
    ]
  },
  Cotton: {
    cropType: 'Cotton',
    primaryDiseaseName: 'Alternaria Leaf Spot',
    scientificName: 'Alternaria macrospora',
    symptoms: ['Circular reddish-brown spots with concentric rings', 'Foliar leaf drop'],
    recommendedChemical: 'Mancozeb 75% WP or Copper Oxychloride 50% WP',
    solutionConcentrationPct: 0.4,
    baseDosageMlPerSqm: 35,
    nozzlePressureBar: 2.5,
    sprayDurationSec: 2.8,
    description: 'Concentric ring lesions affecting cotton leaves, leading to defoliation.',
    agronomicAdvice: 'Spot-treat lower canopy during early boll development.',
    alternateDiseases: [
      { name: 'Bacterial Blight (Xanthomonas citri)', symptoms: ['Angular water-soaked spots along veins'], recommendedChemical: 'Copper Hydroxide + Streptomycin' },
      { name: 'Grey Mildew (Ramularia areola)', symptoms: ['Angular white powdery patches under leaf'], recommendedChemical: 'Wettable Sulfur 80%' }
    ]
  },
  Tomato: {
    cropType: 'Tomato',
    primaryDiseaseName: 'Early Blight (Alternaria solani)',
    scientificName: 'Alternaria solani',
    symptoms: ['Target-like concentric brown rings', 'Yellowing margins around leaf spots'],
    recommendedChemical: 'Chlorothalonil 75% WP or Difenoconazole',
    solutionConcentrationPct: 0.5,
    baseDosageMlPerSqm: 38,
    nozzlePressureBar: 2.6,
    sprayDurationSec: 3.0,
    description: 'Target-board fungal spot affecting lower tomato leaves first.',
    agronomicAdvice: 'Maintain air circulation and spray at base of plant canopy.',
    alternateDiseases: [
      { name: 'Late Blight (Phytophthora infestans)', symptoms: ['Water-soaked dark lesions with white mold underneath'], recommendedChemical: 'Metalaxyl + Mancozeb' },
      { name: 'Leaf Mold (Passalora fulva)', symptoms: ['Pale green spots on upper leaf with olive mold below'], recommendedChemical: 'Copper Hydroxide' }
    ]
  },
  Potato: {
    cropType: 'Potato',
    primaryDiseaseName: 'Late Blight (Phytophthora infestans)',
    scientificName: 'Phytophthora infestans',
    symptoms: ['Irregular dark water-soaked spots', 'White downy mildew on underside in damp weather'],
    recommendedChemical: 'Cymoxanil + Mancozeb or Metalaxyl-M',
    solutionConcentrationPct: 0.8,
    baseDosageMlPerSqm: 48,
    nozzlePressureBar: 3.2,
    sprayDurationSec: 3.8,
    description: 'Devastating water-mold infection capable of destroying potato foliage rapidly.',
    agronomicAdvice: 'Apply systemic spray immediately upon noticing water-soaked leaf margins.',
    alternateDiseases: [
      { name: 'Early Blight (Alternaria solani)', symptoms: ['Dark brown spots with target rings'], recommendedChemical: 'Mancozeb 75% WP' }
    ]
  },
  Sugarcane: {
    cropType: 'Sugarcane',
    primaryDiseaseName: 'Red Rot (Colletotrichum falcatum)',
    scientificName: 'Colletotrichum falcatum',
    symptoms: ['Reddening of vascular bundle inside stalk', 'Yellowing and drying of leaf midribs'],
    recommendedChemical: 'Carbendazim 50% WP or Trichoderma viride',
    solutionConcentrationPct: 0.6,
    baseDosageMlPerSqm: 42,
    nozzlePressureBar: 2.8,
    sprayDurationSec: 3.4,
    description: 'Serious fungal vascular wilt affecting sugarcane stalks and midribs.',
    agronomicAdvice: 'Apply root drenching and foliage spray at base of stool.',
    alternateDiseases: [
      { name: 'Smut (Sporisorium scitamineum)', symptoms: ['Whip-like black structures emerging from shoot apex'], recommendedChemical: 'Tebuconazole 250 EC' }
    ]
  },
  Chilli: {
    cropType: 'Chilli',
    primaryDiseaseName: 'Anthracnose / Fruit Rot',
    scientificName: 'Colletotrichum capsici',
    symptoms: ['Circular dark sunken spots on leaves & fruits', 'Die-back of twigs'],
    recommendedChemical: 'Azoxystrobin 23% SC or Copper Oxychloride',
    solutionConcentrationPct: 0.5,
    baseDosageMlPerSqm: 36,
    nozzlePressureBar: 2.5,
    sprayDurationSec: 2.9,
    description: 'Fungal rot causing dieback of chilli twigs and dark sunken circular spots.',
    agronomicAdvice: 'Spray evenly over canopy avoiding excessive soil runoff.',
    alternateDiseases: [
      { name: 'Powdery Mildew (Oidiopsis taurica)', symptoms: ['Yellow patches on upper leaf with white powder below'], recommendedChemical: 'Wettable Sulfur 80%' }
    ]
  },
  Soybean: {
    cropType: 'Soybean',
    primaryDiseaseName: 'Asian Soybean Rust',
    scientificName: 'Phakopsora pachyrhizi',
    symptoms: ['Small tan to reddish-brown lesions on leaf underside', 'Early leaf yellowing'],
    recommendedChemical: 'Pyraclostrobin + Fluxapyroxad',
    solutionConcentrationPct: 0.5,
    baseDosageMlPerSqm: 38,
    nozzlePressureBar: 2.7,
    sprayDurationSec: 3.0,
    description: 'Fast-spreading rust fungal pathogen that causes premature defoliation.',
    agronomicAdvice: 'Spray mid-canopy during early pod development.',
    alternateDiseases: [
      { name: 'Frogeye Leaf Spot (Cercospora)', symptoms: ['Circular spots with dark reddish-brown borders'], recommendedChemical: 'Azoxystrobin' }
    ]
  },
  Mustard: {
    cropType: 'Mustard',
    primaryDiseaseName: 'Alternaria Blight',
    scientificName: 'Alternaria brassicae',
    symptoms: ['Concentric dark spots on leaves, stems, and pods'],
    recommendedChemical: 'Mancozeb 75% WP or Iprodione',
    solutionConcentrationPct: 0.4,
    baseDosageMlPerSqm: 32,
    nozzlePressureBar: 2.2,
    sprayDurationSec: 2.5,
    description: 'Concentric ring blight affecting leaves and seed pods in mustard crops.',
    agronomicAdvice: 'Apply early morning when dew dries up.',
    alternateDiseases: [
      { name: 'White Rust (Albugo candida)', symptoms: ['White raised pustules on lower leaf surface'], recommendedChemical: 'Metalaxyl 8% + Mancozeb 64%' }
    ]
  },
  Onion: {
    cropType: 'Onion',
    primaryDiseaseName: 'Purple Blotch',
    scientificName: 'Alternaria porri',
    symptoms: ['Purple-centered sunken lesions on tubular leaves'],
    recommendedChemical: 'Mancozeb 75% WP or Difenoconazole',
    solutionConcentrationPct: 0.5,
    baseDosageMlPerSqm: 35,
    nozzlePressureBar: 2.5,
    sprayDurationSec: 2.8,
    description: 'Fungal infection causing elongated purple lesions that break onion foliage.',
    agronomicAdvice: 'Use non-ionic sticker adjuvant to ensure adherence to waxy onion leaves.',
    alternateDiseases: [
      { name: 'Downy Mildew (Peronospora destructor)', symptoms: ['Pale yellowish spots with violet velvety growth'], recommendedChemical: 'Metalaxyl + Mancozeb' }
    ]
  },
  Grape: {
    cropType: 'Grape',
    primaryDiseaseName: 'Downy Mildew (Plasmopara viticola)',
    scientificName: 'Plasmopara viticola',
    symptoms: ['Yellow translucent "oil spot" lesions on upper surface', 'White cottony fungal growth below'],
    recommendedChemical: 'Fosetyl-Al or Metalaxyl + Mancozeb',
    solutionConcentrationPct: 0.7,
    baseDosageMlPerSqm: 45,
    nozzlePressureBar: 3.0,
    sprayDurationSec: 3.6,
    description: 'Severe oomycete disease attacking grapevine leaves and berry clusters.',
    agronomicAdvice: 'Spray lower leaf surfaces thoroughly under grape canopy.',
    alternateDiseases: [
      { name: 'Powdery Mildew (Uncinula necator)', symptoms: ['Ash-gray powdery coating on leaves and shoots'], recommendedChemical: 'Myclobutanil or Sulfur' }
    ]
  },
  Apple: {
    cropType: 'Apple',
    primaryDiseaseName: 'Apple Scab (Venturia inaequalis)',
    scientificName: 'Venturia inaequalis',
    symptoms: ['Olive-green velvety spots turning dark brown/black on leaves'],
    recommendedChemical: 'Mancozeb 75% WP or Captan or Myclobutanil',
    solutionConcentrationPct: 0.6,
    baseDosageMlPerSqm: 42,
    nozzlePressureBar: 2.8,
    sprayDurationSec: 3.3,
    description: 'Fungal scab causing corky dark spots on apple leaves and young fruits.',
    agronomicAdvice: 'Spray post-pink bud stage through petal fall.',
    alternateDiseases: [
      { name: 'Cedar Apple Rust', symptoms: ['Bright orange spots with yellow halo'], recommendedChemical: 'Myclobutanil' }
    ]
  },
  Cucumber: {
    cropType: 'Cucumber',
    primaryDiseaseName: 'Powdery Mildew',
    scientificName: 'Erysiphe cichoracearum',
    symptoms: ['White talc-like powdery spots expanding on leaf blade'],
    recommendedChemical: 'Wettable Sulfur 80% WDG or Myclobutanil',
    solutionConcentrationPct: 0.5,
    baseDosageMlPerSqm: 35,
    nozzlePressureBar: 2.4,
    sprayDurationSec: 2.8,
    description: 'Powdery fungal coating obstructing photosynthesis in cucurbit crops.',
    agronomicAdvice: 'Apply fine mist with sulfur or bio-fungicide.',
    alternateDiseases: [
      { name: 'Downy Mildew (Pseudoperonospora cubensis)', symptoms: ['Angular yellow lesions bounded by leaf veins'], recommendedChemical: 'Fluopicolide + Propamocarb' }
    ]
  },
  Mango: {
    cropType: 'Mango',
    primaryDiseaseName: 'Mango Anthracnose',
    scientificName: 'Colletotrichum gloeosporioides',
    symptoms: ['Dark brown irregular spots on young leaves and flower panicles'],
    recommendedChemical: 'Carbendazim 50% WP or Copper Oxychloride',
    solutionConcentrationPct: 0.6,
    baseDosageMlPerSqm: 45,
    nozzlePressureBar: 3.2,
    sprayDurationSec: 3.8,
    description: 'Fungal blossom blight and leaf spot in mango groves.',
    agronomicAdvice: 'Target spray on new vegetative flushes and emerging inflorescences.',
    alternateDiseases: [
      { name: 'Powdery Mildew (Oidium mangiferae)', symptoms: ['White powdery coating on flowers and leaves'], recommendedChemical: 'Wettable Sulfur 80%' }
    ]
  },
  Tea: {
    cropType: 'Tea',
    primaryDiseaseName: 'Blister Blight (Exobasidium vexans)',
    scientificName: 'Exobasidium vexans',
    symptoms: ['Translucent circular spots turning into white hollow blisters'],
    recommendedChemical: 'Copper Oxychloride + Hexaconazole',
    solutionConcentrationPct: 0.5,
    baseDosageMlPerSqm: 38,
    nozzlePressureBar: 2.6,
    sprayDurationSec: 3.0,
    description: 'Fungal blister infection affecting tender tea shoots and plucking tables.',
    agronomicAdvice: 'Spray immediately after plucking round in mist conditions.',
    alternateDiseases: [
      { name: 'Black Rot (Corticium theae)', symptoms: ['Blackened leaves bound together by fungal threads'], recommendedChemical: 'Copper Oxychloride' }
    ]
  },
  Coffee: {
    cropType: 'Coffee',
    primaryDiseaseName: 'Coffee Leaf Rust (Hemileia vastatrix)',
    scientificName: 'Hemileia vastatrix',
    symptoms: ['Yellow-orange powdery spots on lower leaf surface'],
    recommendedChemical: 'Copper Oxychloride 50% WP or Triadimefon',
    solutionConcentrationPct: 0.6,
    baseDosageMlPerSqm: 40,
    nozzlePressureBar: 2.8,
    sprayDurationSec: 3.2,
    description: 'Destructive rust fungus causing severe defoliation in Arabica and Robusta coffee.',
    agronomicAdvice: 'Ensure thorough under-leaf coverage before rainy season onset.',
    alternateDiseases: [
      { name: 'Black Rot (Koleroga)', symptoms: ['Black rot of leaves and berries hanging by mycelial thread'], recommendedChemical: 'Bordeaux Mixture 1%' }
    ]
  },
  Banana: {
    cropType: 'Banana',
    primaryDiseaseName: 'Black Sigatoka (Mycosphaerella fijiensis)',
    scientificName: 'Mycosphaerella fijiensis',
    symptoms: ['Reddish-brown streaks merging into dark necrotic lesions with yellow halo'],
    recommendedChemical: 'Mancozeb + Azoxystrobin or Propiconazole',
    solutionConcentrationPct: 0.8,
    baseDosageMlPerSqm: 50,
    nozzlePressureBar: 3.5,
    sprayDurationSec: 4.2,
    description: 'Foliar streak disease causing premature leaf death and reduced bunch size.',
    agronomicAdvice: 'Target spray on young expanding leaves 1 to 3.',
    alternateDiseases: [
      { name: 'Panama Disease / Fusarium Wilt', symptoms: ['Yellowing and collapse of leaf petioles at pseudostem'], recommendedChemical: 'Bio-control Trichoderma harzianum' }
    ]
  },
  Other: {
    cropType: 'Other',
    primaryDiseaseName: 'General Foliar Lesion / Blight Complex',
    scientificName: 'Pathogen Complex',
    symptoms: ['Chlorotic spots', 'Necrotic leaf margins', 'Localized foliar blight'],
    recommendedChemical: 'Broad-Spectrum Copper Hydroxide or Mancozeb 75% WP',
    solutionConcentrationPct: 0.5,
    baseDosageMlPerSqm: 35,
    nozzlePressureBar: 2.5,
    sprayDurationSec: 2.8,
    description: 'General foliar infection detected on agricultural plant leaf.',
    agronomicAdvice: 'Apply targeted precision micro-dose to affected leaves.',
    alternateDiseases: []
  }
};

export function getProfileForCrop(crop: CropType): CropDiseaseProfile {
  if (crop === 'Paddy') return CROP_DISEASE_PROFILES['Paddy'];
  if (CROP_DISEASE_PROFILES[crop]) return CROP_DISEASE_PROFILES[crop];
  return CROP_DISEASE_PROFILES['Other'];
}
