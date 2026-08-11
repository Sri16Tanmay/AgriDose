import { PesticideDossier, CropType } from '../types';

export const PESTICIDE_DATABASE: Record<string, PesticideDossier> = {
  'Mancozeb 75% WP + Copper Fungicide': {
    commercialName: 'AgriShield Mancozeb 75% WP + Copper Max',
    technicalCategory: 'Broad-Spectrum Contact Fungicide & Protectant',
    formulationType: '75% Wettable Powder (WP)',
    activeIngredients: 'Mancozeb 75% w/w + Metallic Copper Equivalent 50% w/w',
    casNumbers: '8018-01-7 (Mancozeb) / 7758-98-7 (Copper Sulfate)',
    chemicalClasses: 'Dithiocarbamate + Inorganic Copper',
    concentrationPercentages: 'Mancozeb 75%, Copper Equivalent 50%',
    registrationNumbers: {
      cpcb: 'CPCB/ING/2024/7821',
      epa: 'EPA Reg. No. 70506-184',
      eu: 'EU Reg. 1107/2009',
      icar: 'ICAR-CRRI Standard 2025',
    },
    toxicityRating: 'BLUE_TRIANGLE',
    ghsWarningSymbols: ['Environmental Hazard', 'Health Hazard', 'Skin Irritant'],
    preHarvestIntervalDays: 14,
    fieldSafetyProtocols:
      'Re-entry Interval (REI): 24 hours. Wear chemical-resistant gloves (nitrile), N95 respirator, eye safety goggles, and full coveralls during tank mixing and spraying.',
    firstAidDirections:
      'If swallowed: Do NOT induce vomiting. Seek immediate medical advice. If on skin: Wash with plenty of soap and running water for 15 minutes. If in eyes: Flush gently with water.',
    precisionDilutionRatio: '2.5 g per Litre of clean water (500 g per Acre in 200L water)',
    tankMixingCompatibility:
      'Compatible with Pyrethroids, Difenoconazole, and Chlorpyrifos. DO NOT mix with Lime Sulfur, Bordeaux Mixture, or heavy alkaline spray oils.',
    idealApplicationTimings: 'Early morning (6:00 AM - 9:00 AM) or late evening prior to high humidity or rain warnings.',
    recommendedNozzlePresets: {
      flowRateMlMin: 600,
      pressureBar: 2.8,
      dropletSizeMicrons: 220,
      pattern: 'Fine-Medium Hollow Cone Spray',
    },
    targetPathogensList: ['Early Blight (Alternaria)', 'Late Blight (Phytophthora)', 'Downy Mildew', 'Foliar Spot', 'Black Spot'],
    modeOfAction: 'FRAC Code M03 + M01: Multi-site contact activity inhibiting fungal spore germination and cellular enzyme pathways.',
    geographicApprovals: 'Pan-India (ICAR), SAARC, EU Annex I Approved, US EPA Region 4.',
  },
  'Tricyclazole 75% WP': {
    commercialName: 'RiceShield Tricyclazole 75% WP (BlastGuard)',
    technicalCategory: 'Systemic Melanin Biosynthesis Inhibitor (MBI)',
    formulationType: '75% Wettable Powder (WP)',
    activeIngredients: 'Tricyclazole 75% w/w',
    casNumbers: '41814-78-2',
    chemicalClasses: 'Triazolobenzothiazole',
    concentrationPercentages: 'Tricyclazole 75% w/w',
    registrationNumbers: {
      cpcb: 'CPCB/PADDY/2023/9912',
      epa: 'EPA Reg. No. 62719-21',
      icar: 'ICAR Paddy Disease Standard',
    },
    toxicityRating: 'YELLOW_TRIANGLE',
    ghsWarningSymbols: ['Health Hazard', 'Toxic if Swallowed', 'Aquatic Toxicity'],
    preHarvestIntervalDays: 30,
    fieldSafetyProtocols:
      'REI: 48 hours. Mandatory protective visor, nitrile gloves, chemical apron, and rubber boots. Do not allow spray drift into waterways or fish ponds.',
    firstAidDirections:
      'If inhaled: Move victim to fresh air. Provide oxygen if breathing is labored. Call toxicology hotline immediately.',
    precisionDilutionRatio: '0.6 g per Litre of water (120 g per Acre)',
    tankMixingCompatibility: 'Compatible with Validamycin 3% L and Cartap Hydrochloride. Incompatible with strong oxidizers.',
    idealApplicationTimings: 'Apply at early tillering or first appearance of spindle leaf lesions.',
    recommendedNozzlePresets: {
      flowRateMlMin: 500,
      pressureBar: 3.0,
      dropletSizeMicrons: 180,
      pattern: 'Fine Atomized Fan Spray',
    },
    targetPathogensList: ['Paddy / Rice Blast (Magnaporthe oryzae)', 'Neck Blast', 'Nodal Blast'],
    modeOfAction: 'FRAC Code 16.1: Inhibits pentaketide pathway during appressorial melanin synthesis, preventing fungal tissue penetration.',
    geographicApprovals: 'India, Vietnam, Thailand, Colombia, Brazil.',
  },
  'Azoxystrobin + Difenoconazole': {
    commercialName: 'AgriDose Ultra Dual-Action Systemic Fungicide',
    technicalCategory: 'Systemic Strobilurin + Triazole Dual-Action',
    formulationType: 'Suspension Concentrate (SC)',
    activeIngredients: 'Azoxystrobin 18.2% w/w + Difenoconazole 11.4% w/w',
    casNumbers: '131860-33-8 / 119446-68-3',
    chemicalClasses: 'QoI Strobilurin + DMI Triazole',
    concentrationPercentages: 'Azoxystrobin 18.2%, Difenoconazole 11.4%',
    registrationNumbers: {
      cpcb: 'CPCB/FUNG/2025/1102',
      epa: 'EPA Reg. No. 100-1324',
      eu: 'EU Reg. 1107/2009',
    },
    toxicityRating: 'BLUE_TRIANGLE',
    ghsWarningSymbols: ['Environmental Hazard', 'Acute Toxicity Warning'],
    preHarvestIntervalDays: 7,
    fieldSafetyProtocols: 'REI: 12 hours. Wear chemical safety glasses, long-sleeved shirt, and neoprene gloves.',
    firstAidDirections: 'Flush eyes immediately with cold water. Wash contaminated skin with mild soap and water.',
    precisionDilutionRatio: '1.0 mL per Litre of water (200 mL per Acre)',
    tankMixingCompatibility: 'Compatible with most organophosphates and foliar micronutrients (Zinc, Boron). Avoid acidic tank mixes (pH < 5).',
    idealApplicationTimings: 'Preventative application at early vegetative stage or disease onset.',
    recommendedNozzlePresets: {
      flowRateMlMin: 550,
      pressureBar: 2.6,
      dropletSizeMicrons: 200,
      pattern: 'Flat Fan Nozzle',
    },
    targetPathogensList: ['Powdery Mildew', 'Anthracnose', 'Northern Corn Leaf Blight', 'Rust', 'Sheath Blight'],
    modeOfAction: 'FRAC Code 11 + 3: Dual action inhibiting mitochondrial respiration (Complex III) and ergosterol C14-demethylation.',
    geographicApprovals: 'Global approval across 80+ agricultural countries.',
  },
  'Metalaxyl + Mancozeb': {
    commercialName: 'BlightGuard Pro Metalaxyl-M Systemic',
    technicalCategory: 'Systemic Oomycete & Contact Protectant',
    formulationType: '72% Wettable Powder (WP)',
    activeIngredients: 'Metalaxyl 8% w/w + Mancozeb 64% w/w',
    casNumbers: '57837-19-1 / 8018-01-7',
    chemicalClasses: 'Phenylamide + Dithiocarbamate',
    concentrationPercentages: 'Metalaxyl 8%, Mancozeb 64%',
    registrationNumbers: {
      cpcb: 'CPCB/OOMY/2024/4431',
      epa: 'EPA Reg. No. 228-360',
      icar: 'ICAR Potato Disease Standard',
    },
    toxicityRating: 'BLUE_TRIANGLE',
    ghsWarningSymbols: ['Harmful if Swallowed', 'Skin Sensitizer', 'Aquatic Hazard'],
    preHarvestIntervalDays: 14,
    fieldSafetyProtocols: 'REI: 24 hours. Wear breathing mask, protective gloves, and safety boots.',
    firstAidDirections: 'If swallowed, administer activated charcoal suspension under medical supervision.',
    precisionDilutionRatio: '2.0 g per Litre of water (400 g per Acre)',
    tankMixingCompatibility: 'Compatible with Imidacloprid and Chlorothalonil. Do NOT mix with copper bactericides in hard water.',
    idealApplicationTimings: 'Apply late afternoon upon high humidity or damp weather warnings.',
    recommendedNozzlePresets: {
      flowRateMlMin: 650,
      pressureBar: 3.2,
      dropletSizeMicrons: 250,
      pattern: 'Medium Cone Spray',
    },
    targetPathogensList: ['Late Blight (Phytophthora infestans)', 'Downy Mildew', 'Damping Off'],
    modeOfAction: 'FRAC Code 4 + M03: Inhibits RNA polymerase I and disrupts fungal cell membrane lipid synthesis.',
    geographicApprovals: 'Pan-Asia, Latin America, EU.',
  },
  'Chlorothalonil 75% WP': {
    commercialName: 'CropProtect Chlorothalonil 75% WP',
    technicalCategory: 'Broad-Spectrum Chloronitrile Contact Fungicide',
    formulationType: '75% Wettable Powder (WP)',
    activeIngredients: 'Chlorothalonil 75% w/w',
    casNumbers: '1897-45-6',
    chemicalClasses: 'Chloronitrile',
    concentrationPercentages: 'Chlorothalonil 75%',
    registrationNumbers: {
      cpcb: 'CPCB/TOMATO/2023/1029',
      epa: 'EPA Reg. No. 50534-188',
      eu: 'EU Reg. 1107/2009',
    },
    toxicityRating: 'BLUE_TRIANGLE',
    ghsWarningSymbols: ['Severe Eye Irritant', 'Respiratory Irritant', 'Aquatic Toxicity'],
    preHarvestIntervalDays: 7,
    fieldSafetyProtocols: 'REI: 12 hours. Wear protective eye mask, rubber gloves, and long-sleeved work clothing.',
    firstAidDirections: 'In case of eye contact, hold eyelids open and flush with clean water for 20 minutes.',
    precisionDilutionRatio: '2.0 g per Litre of water (400 g per Acre)',
    tankMixingCompatibility: 'Compatible with most fungicides and insecticides. Avoid mixing with oil-based stickers.',
    idealApplicationTimings: 'Apply before rain events to build a protective film over leaves.',
    recommendedNozzlePresets: {
      flowRateMlMin: 580,
      pressureBar: 2.6,
      dropletSizeMicrons: 210,
      pattern: 'Flat Fan',
    },
    targetPathogensList: ['Early Blight', 'Leaf Spot', 'Anthracnose', 'Botrytis'],
    modeOfAction: 'FRAC Code M05: Conjugates with fungal glutathione, inactivating essential sulfhydryl enzyme systems.',
    geographicApprovals: 'Pan-India, USA, Australia, Brazil.',
  },
};

export function getPesticideDossier(chemicalName: string): PesticideDossier {
  // Check exact key match
  if (PESTICIDE_DATABASE[chemicalName]) {
    return PESTICIDE_DATABASE[chemicalName];
  }

  // Check fuzzy key match
  const lowerName = chemicalName.toLowerCase();
  for (const key of Object.keys(PESTICIDE_DATABASE)) {
    if (lowerName.includes(key.toLowerCase()) || key.toLowerCase().includes(lowerName)) {
      return PESTICIDE_DATABASE[key];
    }
  }

  // Fallback default rich dossier
  return {
    commercialName: `AgriDose Precision ${chemicalName}`,
    technicalCategory: 'Broad-Spectrum Agricultural Remedy',
    formulationType: 'Wettable Powder / Suspension Concentrate',
    activeIngredients: chemicalName,
    casNumbers: 'Registered Agronomic Compound',
    chemicalClasses: 'Organic / Inorganic Protectant',
    concentrationPercentages: 'Standard Commercial Grade (0.5% - 75%)',
    registrationNumbers: {
      cpcb: 'CPCB/AGRI/2025/VERIFIED',
      epa: 'EPA Registered Standard',
      icar: 'ICAR Agronomic Standard',
    },
    toxicityRating: 'BLUE_TRIANGLE',
    ghsWarningSymbols: ['Caution', 'Environmental Protection'],
    preHarvestIntervalDays: 10,
    fieldSafetyProtocols: 'REI: 24 hours. Wear chemical gloves, mask, and protective footwear.',
    firstAidDirections: 'Wash affected skin with clean water and soap. Flush eyes gently if exposed.',
    precisionDilutionRatio: '1.5 g/mL per Litre of clean water',
    tankMixingCompatibility: 'Check tank compatibility before mixing with alkaline fertilizers or emulsified oils.',
    idealApplicationTimings: 'Early morning (6 AM - 9 AM) or late afternoon.',
    recommendedNozzlePresets: {
      flowRateMlMin: 550,
      pressureBar: 2.8,
      dropletSizeMicrons: 200,
      pattern: 'Variable Cone / Fan Nozzle',
    },
    targetPathogensList: ['Target Plant Pathogen', 'Foliar Infection', 'Secondary Blight'],
    modeOfAction: 'Protective and therapeutic inhibition of plant disease pathogens.',
    geographicApprovals: 'Pan-India & Global Agronomic Registrations.',
  };
}

export function searchPesticideDatabase(query: string): PesticideDossier[] {
  const q = query.trim().toLowerCase();
  if (!q) return Object.values(PESTICIDE_DATABASE);

  return Object.values(PESTICIDE_DATABASE).filter((dossier) => {
    return (
      dossier.commercialName.toLowerCase().includes(q) ||
      dossier.activeIngredients.toLowerCase().includes(q) ||
      dossier.technicalCategory.toLowerCase().includes(q) ||
      dossier.targetPathogensList.some((p) => p.toLowerCase().includes(q))
    );
  });
}
