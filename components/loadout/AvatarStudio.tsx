'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Footprints, Scan, Shirt } from 'lucide-react';
import type { GearSlot, InventoryItem } from './types';

interface AvatarStudioProps {
  equipped: Record<GearSlot, InventoryItem | null>;
  selectedSlot: GearSlot | null;
  draggingSlot: GearSlot | null;
  onOpenSlot: (slot: GearSlot) => void;
  onDropOnSlot: (slot: GearSlot, payload: { fromSlot: GearSlot; itemId: string }) => void;
}

const slotMeta: Record<
  GearSlot,
  { label: string; top: string; left: string; icon: typeof Shirt }
> = {
  shirt: { label: 'Shirt', top: '26%', left: '50%', icon: Shirt },
  trousers: { label: 'Trousers', top: '52%', left: '50%', icon: Scan },
  shoes: { label: 'Shoes', top: '79%', left: '50%', icon: Footprints },
};

export default function AvatarStudio({
  equipped,
  selectedSlot,
  draggingSlot,
  onOpenSlot,
  onDropOnSlot,
}: AvatarStudioProps) {
  return (
    <div className="relative mx-auto h-[36rem] w-full max-w-[25rem] lg:h-[42rem] lg:max-w-[28rem]">
      <motion.div
        className="pointer-events-none absolute inset-0 rounded-[2rem] bg-gradient-to-b from-[#6d6bff33] via-[#3ee7d022] to-[#ff69b411] blur-2xl"
        animate={{ opacity: [0.7, 1, 0.75] }}
        transition={{ duration: 4, repeat: Infinity }}
      />

      <motion.div
        className="absolute left-1/2 top-1/2 h-[90%] w-[68%] -translate-x-1/2 -translate-y-1/2 rounded-[45%] border border-white/15 bg-gradient-to-b from-[#222c64cc] via-[#161e4acc] to-[#0c1230dd] shadow-[0_0_80px_rgba(114,130,255,0.32)]"
        animate={{ scale: [1, 1.015, 1], rotate: [0, 0.7, -0.7, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
      >
        <div className="absolute inset-5 rounded-[40%] border border-white/10" />
        <div className="absolute left-1/2 top-8 h-12 w-12 -translate-x-1/2 rounded-full border border-white/15 bg-[#2a3470]/70" />
        <div className="absolute inset-x-12 top-16 h-24 rounded-full bg-gradient-to-b from-[#94a5ff22] to-transparent blur-lg" />
      </motion.div>

      {(Object.keys(slotMeta) as GearSlot[]).map((slot) => {
        const meta = slotMeta[slot];
        const Icon = meta.icon;
        const isSelected = selectedSlot === slot;
        const isDragMatch = draggingSlot === slot;
        const item = equipped[slot];

        return (
          <motion.button
            key={slot}
            onClick={() => onOpenSlot(slot)}
            onDragOver={(event) => {
              if (draggingSlot === slot) {
                event.preventDefault();
              }
            }}
            onDrop={(event) => {
              event.preventDefault();
              const raw = event.dataTransfer.getData('application/x-loadout-item');
              if (!raw) return;
              const parsed = JSON.parse(raw) as { fromSlot: GearSlot; itemId: string };
              onDropOnSlot(slot, parsed);
            }}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.98 }}
            style={{ top: meta.top, left: meta.left }}
            className={`absolute z-20 flex h-24 w-24 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-2xl border text-center transition-all duration-300 ${
              item
                ? 'border-[#7bf9e2]/70 bg-[#10263acc] shadow-[0_0_30px_rgba(84,242,214,0.45)]'
                : 'border-[#7891ff]/80 bg-[#111c4dcc] shadow-[0_0_30px_rgba(114,130,255,0.35)]'
            } ${isSelected || isDragMatch ? 'ring-2 ring-[#8fa5ff] ring-offset-2 ring-offset-[#0b1026]' : ''}`}
          >
            {!item && (
              <motion.div
                className="absolute inset-0 rounded-2xl"
                animate={{ opacity: [0.35, 0.75, 0.35] }}
                transition={{ duration: 1.8, repeat: Infinity }}
                style={{ background: 'linear-gradient(130deg, rgba(109,107,255,0.4), rgba(62,231,208,0.2))' }}
              />
            )}

            <AnimatePresence mode="wait">
              {item ? (
                <motion.img
                  key={item.id}
                  src={item.preview}
                  alt={item.name}
                  initial={{ opacity: 0, scale: 0.75 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.85 }}
                  className="relative z-10 h-20 w-20 rounded-xl object-cover"
                />
              ) : (
                <motion.div
                  key={`${slot}-empty`}
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="relative z-10 flex flex-col items-center"
                >
                  <Icon className="h-6 w-6 text-[#d4deff]" />
                  <span className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-[#d4deff]">
                    {meta.label}
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        );
      })}
    </div>
  );
}
