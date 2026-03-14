'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface OutfitComparisonProps {
  outfits: string[];
}

export default function OutfitComparison({ outfits }: OutfitComparisonProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  if (outfits.length <= 1) return null;

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold text-[#1a255e]">Outfit History</h3>

      <div className="relative">
        <div className="overflow-hidden rounded-2xl border border-white/80 bg-white/60">
          <AnimatePresence mode="wait">
            <motion.img
              key={selectedIndex}
              initial={{ opacity: 0, x: 80 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -80 }}
              src={outfits[selectedIndex]}
              alt={`Outfit ${selectedIndex + 1}`}
              className="h-auto max-h-[600px] w-full object-contain"
            />
          </AnimatePresence>
        </div>

        <button
          onClick={() => setSelectedIndex((prev) => (prev > 0 ? prev - 1 : outfits.length - 1))}
          className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2.5 shadow-lg shadow-[#4054f5]/20 transition-colors hover:bg-white"
        >
          <ChevronLeft className="h-5 w-5 text-[#3243b8]" />
        </button>

        <button
          onClick={() => setSelectedIndex((prev) => (prev < outfits.length - 1 ? prev + 1 : 0))}
          className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2.5 shadow-lg shadow-[#18c9b7]/20 transition-colors hover:bg-white"
        >
          <ChevronRight className="h-5 w-5 text-[#1c9f92]" />
        </button>
      </div>

      <div className="flex justify-center gap-2">
        {outfits.map((_, index) => (
          <button
            key={index}
            onClick={() => setSelectedIndex(index)}
            className={`h-2 rounded-full transition-all ${
              index === selectedIndex ? 'w-10 bg-gradient-to-r from-[#4054f5] to-[#18c9b7]' : 'w-2 bg-[#cad3ff] hover:bg-[#9caeff]'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
