import React, { useState } from 'react';
import { CropType } from '../types';
import { Search, Check, Sprout } from 'lucide-react';
import { triggerHaptic } from './VoiceReader';

interface CropSelectorCarouselProps {
  selectedCrop: CropType;
  onSelectCrop: (crop: CropType) => void;
  isHighContrast?: boolean;
}

interface CropItem {
  name: CropType;
  emoji: string;
  category: string;
}

const CROPS: CropItem[] = [
  { name: 'Potato', emoji: '🥔', category: 'Tuber' },
  { name: 'Tomato', emoji: '🍅', category: 'Vegetable' },
  { name: 'Wheat', emoji: '🌾', category: 'Grain' },
  { name: 'Cotton', emoji: '🌿', category: 'Cash Crop' },
  { name: 'Maize', emoji: '🌽', category: 'Grain' },
  { name: 'Paddy', emoji: '🌾', category: 'Grain' },
  { name: 'Rice', emoji: '🌾', category: 'Grain' },
  { name: 'Chilli', emoji: '🌶️', category: 'Spice' },
  { name: 'Mustard', emoji: '🌼', category: 'Oilseed' },
  { name: 'Onion', emoji: '🧅', category: 'Vegetable' },
  { name: 'Grape', emoji: '🍇', category: 'Horticulture' },
  { name: 'Apple', emoji: '🍎', category: 'Horticulture' },
  { name: 'Cucumber', emoji: '🥒', category: 'Vegetable' },
  { name: 'Sugarcane', emoji: '🎋', category: 'Cash Crop' },
  { name: 'Mango', emoji: '🥭', category: 'Fruit' },
  { name: 'Papaya', emoji: '🍈', category: 'Fruit' },
  { name: 'Soybean', emoji: '🫘', category: 'Legume' },
  { name: 'Tea', emoji: '🍃', category: 'Plantation' },
  { name: 'Coffee', emoji: '☕', category: 'Plantation' },
  { name: 'Banana', emoji: '🍌', category: 'Fruit' },
  { name: 'Guava', emoji: '🍈', category: 'Fruit' },
];

export const CropSelectorCarousel: React.FC<CropSelectorCarouselProps> = ({
  selectedCrop,
  onSelectCrop,
  isHighContrast = false,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCrops = CROPS.filter((c) =>
    c.name.toLowerCase().includes(searchTerm.trim().toLowerCase())
  );

  return (
    <div className="w-full space-y-2.5 my-3 p-3.5 rounded-[16px] bg-[#10171D]/90 backdrop-blur-md border border-[#1E293B] shadow-xl">
      {/* Search Input Bar */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B] pointer-events-none" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search Crop (e.g., Potato, Tomato)..."
          className="w-full pl-9 pr-8 py-2 rounded-xl text-xs font-semibold outline-none transition-all bg-[#0B1218] text-[#E2E8F0] border border-[#1E293B] placeholder-[#64748B] focus:border-[#00E5FF] focus:ring-1 focus:ring-[#00E5FF]/40"
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B] text-xs hover:text-[#E2E8F0] font-bold"
          >
            Clear
          </button>
        )}
      </div>

      {/* Horizontal Crop Carousel Badges */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1.5 scrollbar-none">
        {filteredCrops.length > 0 ? (
          filteredCrops.map((crop) => {
            const isSelected = selectedCrop === crop.name;
            return (
              <button
                key={crop.name}
                onClick={() => {
                  triggerHaptic(25);
                  onSelectCrop(crop.name);
                }}
                className={`flex-none flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-bold transition-all whitespace-nowrap shadow-sm ${
                  isSelected
                    ? 'bg-[#10171D] text-[#00E5FF] border-[#00E5FF] shadow-[0_0_12px_rgba(0,229,255,0.25)] scale-102'
                    : 'bg-[#1E293B] text-[#94A3B8] border-[#1E293B] hover:text-[#E2E8F0] hover:border-[#94A3B8]/50'
                }`}
              >
                <span className="text-sm">{crop.emoji}</span>
                <span>{crop.name}</span>
                {isSelected && (
                  <span className="p-0.5 rounded-full bg-[#00E5FF]/20 text-[#00E5FF]">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </span>
                )}
              </button>
            );
          })
        ) : (
          <div className="p-2 text-xs text-[#94A3B8] flex items-center gap-2">
            <Sprout className="w-4 h-4 text-[#00FF88]" />
            <span>No crops match "{searchTerm}". Try another search query.</span>
          </div>
        )}
      </div>
    </div>
  );
};
