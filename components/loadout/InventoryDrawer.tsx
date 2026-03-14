'use client';

import { useMemo, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Plus, Sparkles } from 'lucide-react';
import type { GearSlot, InventoryItem } from './types';

interface InventoryDrawerProps {
  openSlot: GearSlot | null;
  items: InventoryItem[];
  selectedItemId: string | null;
  onClose: () => void;
  onAddFiles: (slot: GearSlot, files: FileList | null) => void;
  onSelectItem: (slot: GearSlot, itemId: string) => void;
  onDragStartItem: (slot: GearSlot, itemId: string) => void;
  onDragEndItem: () => void;
}

function titleFor(slot: GearSlot | null): string {
  if (!slot) return 'Inventory';
  return `${slot.charAt(0).toUpperCase()}${slot.slice(1)} Inventory`;
}

export default function InventoryDrawer({
  openSlot,
  items,
  selectedItemId,
  onClose,
  onAddFiles,
  onSelectItem,
  onDragStartItem,
  onDragEndItem,
}: InventoryDrawerProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const emptyText = useMemo(() => {
    if (!openSlot) return 'Pick a slot';
    return `Add ${openSlot} assets to start building your loadout.`;
  }, [openSlot]);

  return (
    <AnimatePresence>
      {openSlot && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 24, stiffness: 260 }}
            className="fixed inset-x-0 bottom-0 z-50 rounded-t-3xl border-t border-white/20 bg-[#080f28]/95 p-6 shadow-[0_-20px_70px_rgba(0,0,0,0.55)]"
          >
            <div className="mx-auto max-w-6xl">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-white">{titleFor(openSlot)}</h3>
                  <p className="text-sm text-[#a8b5d8]">Drag item to avatar slot or click to equip</p>
                </div>
                <button
                  onClick={onClose}
                  className="rounded-full border border-white/20 px-4 py-1.5 text-sm text-[#d4deff] hover:bg-white/10"
                >
                  Close
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                <motion.button
                  whileHover={{ y: -4, rotateX: 2, rotateY: -2 }}
                  onClick={() => inputRef.current?.click()}
                  className="relative overflow-hidden rounded-2xl border border-dashed border-[#91a4ff] bg-[#152153] p-4 text-left"
                >
                  <div className="pointer-events-none absolute inset-0 animate-[borderShift_7s_linear_infinite] bg-gradient-to-br from-[#6f78ff33] via-transparent to-[#22d3c533]" />
                  <div className="relative z-10 flex h-full flex-col justify-between gap-4">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-[#6f78ff] to-[#22d3c5]">
                      <Plus className="h-5 w-5 text-white" />
                    </div>
                    <p className="text-sm font-semibold text-white">+ Add New</p>
                  </div>
                </motion.button>

                <input
                  ref={inputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(event) => onAddFiles(openSlot, event.target.files)}
                />

                {items.map((item) => {
                  const isSelected = item.id === selectedItemId;
                  return (
                    <motion.div
                      key={item.id}
                      whileHover={{ y: -4, rotateX: 2, rotateY: -2 }}
                    >
                      <button
                        draggable
                        onDragStart={(event) => {
                          event.dataTransfer.setData(
                            'application/x-loadout-item',
                            JSON.stringify({ fromSlot: openSlot, itemId: item.id })
                          );
                          onDragStartItem(openSlot, item.id);
                        }}
                        onDragEnd={onDragEndItem}
                        onClick={() => onSelectItem(openSlot, item.id)}
                        className={`group relative w-full overflow-hidden rounded-2xl border p-2 text-left transition-all ${
                        isSelected
                          ? 'border-[#7ee8de] bg-[#113347] shadow-[0_0_25px_rgba(126,232,222,0.42)]'
                          : 'border-white/15 bg-[#111938] hover:border-[#8fa5ff]'
                        }`}
                      >
                        <img src={item.preview} alt={item.name} className="h-24 w-full rounded-xl object-cover" />
                        <p className="mt-2 truncate text-xs text-[#d7e0ff]">{item.name}</p>
                        {isSelected && (
                          <div className="absolute right-2 top-2 rounded-full bg-[#7ee8de] px-2 py-0.5 text-[10px] font-semibold text-[#04242a]">
                            Equipped
                          </div>
                        )}
                      </button>
                    </motion.div>
                  );
                })}
              </div>

              {items.length === 0 && (
                <div className="mt-6 flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-[#9fb0d9]">
                  <Sparkles className="h-4 w-4 text-[#ffd4a2]" />
                  {emptyText}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
