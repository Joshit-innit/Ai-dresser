'use client';

import { useCallback, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Image as ImageIcon, Sparkles, UserRound, WandSparkles } from 'lucide-react';
import AvatarStudio from '@/components/loadout/AvatarStudio';
import InventoryDrawer from '@/components/loadout/InventoryDrawer';
import type { GearSlot, InventoryItem } from '@/components/loadout/types';
import ResultViewer from '@/components/ResultViewer';
import OutfitComparison from '@/components/OutfitComparison';
import { processVirtualTryOn } from '@/lib/api';

type ProcessingStage =
  | 'idle'
  | 'uploading'
  | 'extracting'
  | 'analyzing'
  | 'trying-on'
  | 'refining'
  | 'quality-check'
  | 'complete'
  | 'error';

type InventoryBySlot = Record<GearSlot, InventoryItem[]>;
type EquippedBySlot = Record<GearSlot, string | null>;

const slotOrder: GearSlot[] = ['shirt', 'trousers', 'shoes'];

function createInventoryItems(files: File[]): InventoryItem[] {
  return files.map((file) => ({
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    file,
    name: file.name,
    preview: URL.createObjectURL(file),
  }));
}

export default function Home() {
  const [inventory, setInventory] = useState<InventoryBySlot>({ shirt: [], trousers: [], shoes: [] });
  const [equipped, setEquipped] = useState<EquippedBySlot>({ shirt: null, trousers: null, shoes: null });
  const [openSlot, setOpenSlot] = useState<GearSlot | null>(null);
  const [draggingSlot, setDraggingSlot] = useState<GearSlot | null>(null);
  const [modelImage, setModelImage] = useState<InventoryItem | null>(null);

  const [stage, setStage] = useState<ProcessingStage>('idle');
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [outfitHistory, setOutfitHistory] = useState<string[]>([]);

  const equippedItems = useMemo(() => {
    return {
      shirt: inventory.shirt.find((item) => item.id === equipped.shirt) ?? null,
      trousers: inventory.trousers.find((item) => item.id === equipped.trousers) ?? null,
      shoes: inventory.shoes.find((item) => item.id === equipped.shoes) ?? null,
    };
  }, [equipped, inventory]);

  const readyToGenerate = Boolean(equippedItems.shirt && equippedItems.trousers && equippedItems.shoes);
  const isGenerating = stage !== 'idle' && stage !== 'complete' && stage !== 'error';

  const recyclePreview = (item: InventoryItem | null) => {
    if (item) {
      URL.revokeObjectURL(item.preview);
    }
  };

  const addInventoryFiles = useCallback((slot: GearSlot, fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;

    const files = Array.from(fileList).filter((file) => file.type.startsWith('image/'));
    if (files.length === 0) return;

    const newItems = createInventoryItems(files);

    setInventory((prev) => ({
      ...prev,
      [slot]: [...prev[slot], ...newItems],
    }));

    setEquipped((prev) => {
      if (prev[slot]) return prev;
      return {
        ...prev,
        [slot]: newItems[0]?.id ?? null,
      };
    });
  }, []);

  const equipItem = useCallback((slot: GearSlot, itemId: string) => {
    setEquipped((prev) => ({ ...prev, [slot]: itemId }));
  }, []);

  const handleDropOnSlot = useCallback(
    (slot: GearSlot, payload: { fromSlot: GearSlot; itemId: string }) => {
      if (slot !== payload.fromSlot) return;
      equipItem(slot, payload.itemId);
      setDraggingSlot(null);
    },
    [equipItem]
  );

  const handleModelUpload = useCallback((files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    if (!file.type.startsWith('image/')) return;

    const nextModel: InventoryItem = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      file,
      name: file.name,
      preview: URL.createObjectURL(file),
    };

    setModelImage((prev) => {
      recyclePreview(prev);
      return nextModel;
    });
  }, []);

  const handleGenerate = useCallback(async () => {
    if (!readyToGenerate || !equippedItems.shirt || !equippedItems.trousers || !equippedItems.shoes) {
      setError('Equip shirt, trousers, and shoes first.');
      return;
    }

    setError(null);
    setStage('uploading');
    setProgress(5);

    try {
      const progressInterval = setInterval(() => {
        setProgress((prev) => (prev >= 92 ? prev : prev + 6));
      }, 420);

      const resultUrl = await processVirtualTryOn({
        shirt: equippedItems.shirt.file,
        trousers: equippedItems.trousers.file,
        shoes: equippedItems.shoes.file,
        modelImage: modelImage?.file,
        onProgress: (nextStage, nextProgress) => {
          setStage(nextStage);
          setProgress(nextProgress);
        },
      });

      clearInterval(progressInterval);
      setProgress(100);
      setStage('complete');
      setResult(resultUrl);
      setOutfitHistory((prev) => [resultUrl, ...prev]);
    } catch (err: unknown) {
      setStage('error');
      setError(err instanceof Error ? err.message : 'Generation failed');
    }
  }, [equippedItems, modelImage, readyToGenerate]);

  const handleReset = useCallback(() => {
    setInventory((prev) => {
      for (const slot of slotOrder) {
        prev[slot].forEach((item) => recyclePreview(item));
      }
      return { shirt: [], trousers: [], shoes: [] };
    });

    setEquipped({ shirt: null, trousers: null, shoes: null });
    setOpenSlot(null);
    setDraggingSlot(null);
    setModelImage((prev) => {
      recyclePreview(prev);
      return null;
    });
    setStage('idle');
    setProgress(0);
    setResult(null);
    setError(null);
  }, []);

  const drawerItems = openSlot ? inventory[openSlot] : [];
  const selectedDrawerItem = openSlot ? equipped[openSlot] : null;

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#050914] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(111,120,255,0.28),transparent_40%),radial-gradient(circle_at_80%_0%,rgba(62,231,208,0.22),transparent_40%),radial-gradient(circle_at_50%_100%,rgba(255,105,180,0.16),transparent_48%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-30 [background-image:radial-gradient(circle_at_center,rgba(255,255,255,0.2)_1px,transparent_1px)] [background-size:24px_24px]" />

      <header className="relative z-20 border-b border-white/10 bg-[#050914]/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <h1 className="text-2xl font-bold tracking-tight">
            AI Dresser <span className="text-[#8fd8ff]">Loadout Studio</span>
          </h1>
          <span className="rounded-full border border-white/20 px-3 py-1 text-xs text-[#b4c4ff]">Game Mode</span>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-7xl px-5 py-8 sm:px-8 sm:py-10">
        <AnimatePresence mode="wait">
          {stage === 'idle' && (
            <motion.div key="builder" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
              <section className="glass-panel rounded-3xl p-6 sm:p-8">
                <p className="mb-3 flex items-center gap-2 text-sm text-[#9ac8ff]">
                  <Sparkles className="h-4 w-4 text-[#ffd39f]" />
                  Outfit Builder Studio
                </p>
                <h2 className="text-3xl font-bold sm:text-5xl">
                  Dress the Avatar Like a <span className="gradient-text">Pro Loadout Screen</span>
                </h2>
                <p className="mt-3 max-w-3xl text-[#aec2ef]">
                  Choose each gear piece, drop it on the mannequin zone, and generate a polished AI fashion render.
                </p>
              </section>

              <div className="grid gap-6 lg:grid-cols-[330px_1fr_330px]">
                <section className="glass-panel rounded-3xl p-5">
                  <h3 className="mb-4 text-lg font-semibold text-[#d5e3ff]">Loadout Slots</h3>
                  <div className="space-y-3">
                    {slotOrder.map((slot) => {
                      const item = equippedItems[slot];
                      return (
                        <button
                          key={slot}
                          onClick={() => setOpenSlot(slot)}
                          className={`w-full rounded-xl border px-4 py-3 text-left transition-all ${
                            item
                              ? 'border-[#6df1d8]/70 bg-[#132f42] shadow-[0_0_20px_rgba(109,241,216,0.25)]'
                              : 'border-[#7f93ff]/55 bg-[#141f4a] hover:border-[#9fb0ff]'
                          }`}
                        >
                          <p className="text-sm font-semibold capitalize">{slot}</p>
                          <p className="text-xs text-[#abc0ea]">{item ? item.name : `Tap to equip ${slot}`}</p>
                        </button>
                      );
                    })}
                  </div>

                  <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-4">
                    <p className="mb-2 flex items-center gap-2 text-sm font-semibold">
                      <UserRound className="h-4 w-4 text-[#8fd8ff]" />
                      Model Photo (Optional)
                    </p>
                    <label className="block cursor-pointer rounded-xl border border-dashed border-white/25 bg-[#0f1533] p-4 text-center text-sm text-[#b7c6e9] hover:border-[#91a4ff]">
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(event) => handleModelUpload(event.target.files)}
                      />
                      {modelImage ? 'Change model image' : 'Upload model image'}
                    </label>
                    {modelImage && (
                      <motion.img
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        src={modelImage.preview}
                        alt="Model"
                        className="mt-3 h-36 w-full rounded-xl object-cover"
                      />
                    )}
                  </div>
                </section>

                <section className="glass-panel rounded-3xl p-4 sm:p-6">
                  <AvatarStudio
                    equipped={equippedItems}
                    selectedSlot={openSlot}
                    draggingSlot={draggingSlot}
                    onOpenSlot={setOpenSlot}
                    onDropOnSlot={handleDropOnSlot}
                  />
                </section>

                <section className="glass-panel rounded-3xl p-5">
                  <h3 className="mb-3 text-lg font-semibold">Generate</h3>
                  <p className="text-sm text-[#b4c4e6]">Equip all three slots, then render your final outfit.</p>

                  <motion.button
                    onClick={handleGenerate}
                    disabled={!readyToGenerate || isGenerating}
                    whileHover={{ scale: readyToGenerate ? 1.03 : 1 }}
                    whileTap={{ scale: readyToGenerate ? 0.98 : 1 }}
                    className="glow-cta mt-5 flex w-full items-center justify-center gap-2 rounded-full px-6 py-4 font-semibold text-white disabled:opacity-45"
                  >
                    {isGenerating ? (
                      <>
                        <motion.span
                          animate={{ x: ['-120%', '120%'] }}
                          transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
                          className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                        />
                        <span className="relative z-10">Generating... {progress}%</span>
                      </>
                    ) : (
                      <>
                        <WandSparkles className="h-5 w-5" />
                        Generate Outfit
                      </>
                    )}
                  </motion.button>

                  <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
                    <motion.div
                      animate={{ width: `${isGenerating ? progress : readyToGenerate ? 100 : 10}%` }}
                      className="h-full bg-gradient-to-r from-[#6f78ff] via-[#7beee6] to-[#ff7bb6]"
                    />
                  </div>

                  <p className="mt-3 text-xs text-[#b7c7e8]">
                    {readyToGenerate ? 'Ready to launch render.' : 'Equip Shirt, Trousers, and Shoes.'}
                  </p>

                  <AnimatePresence>
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0, x: [0, -4, 4, -2, 2, 0] }}
                        exit={{ opacity: 0, y: -6 }}
                        className="mt-4 rounded-xl border border-[#ff8ea7]/40 bg-[#ff5f8522] p-3 text-sm text-[#ffc5d2]"
                      >
                        {error}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </section>
              </div>
            </motion.div>
          )}

          {isGenerating && (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mx-auto max-w-3xl">
              <div className="glass-panel rounded-3xl p-8 text-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: 'linear' }}
                  className="mx-auto mb-4 h-16 w-16 rounded-full border-2 border-[#7f8bff] border-t-[#7beee6]"
                />
                <h2 className="text-2xl font-semibold">AI Outfit Forge</h2>
                <p className="mt-2 text-[#abc0ea]">Composing your look with photorealistic styling...</p>
                <div className="mx-auto mt-6 h-2 max-w-lg overflow-hidden rounded-full bg-white/10">
                  <motion.div
                    animate={{ width: `${progress}%` }}
                    className="h-full bg-gradient-to-r from-[#6f78ff] via-[#7beee6] to-[#ff7bb6]"
                  />
                </div>
              </div>
            </motion.div>
          )}

          {stage === 'complete' && result && (
            <motion.div key="result" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6">
              <div className="glass-panel rounded-3xl p-6">
                <h2 className="text-3xl font-bold">Loadout Generated</h2>
                <p className="mt-1 text-[#aec2ef]">Your avatar styling has been rendered successfully.</p>
              </div>

              <div className="glass-panel rounded-3xl p-4 sm:p-6">
                <ResultViewer resultImage={result} originalModel={modelImage?.preview ?? null} />
              </div>

              {outfitHistory.length > 1 && (
                <div className="glass-panel rounded-3xl p-4 sm:p-6">
                  <OutfitComparison outfits={outfitHistory} />
                </div>
              )}

              <button
                onClick={handleReset}
                className="rounded-full border border-white/20 bg-white/10 px-7 py-2.5 font-semibold hover:bg-white/15"
              >
                Start New Loadout
              </button>
            </motion.div>
          )}

          {stage === 'error' && (
            <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mx-auto max-w-xl">
              <div className="glass-panel rounded-3xl p-8 text-center">
                <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#ff5f8522]">
                  <ImageIcon className="h-5 w-5 text-[#ffb6cb]" />
                </div>
                <h2 className="text-2xl font-semibold">Generation Error</h2>
                <p className="mt-2 text-[#aec2ef]">{error}</p>
                <button onClick={handleReset} className="glow-cta mt-5 rounded-full px-6 py-2.5 font-semibold">
                  Back to Studio
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <InventoryDrawer
        openSlot={openSlot}
        items={drawerItems}
        selectedItemId={selectedDrawerItem}
        onClose={() => setOpenSlot(null)}
        onAddFiles={addInventoryFiles}
        onSelectItem={equipItem}
        onDragStartItem={(slot) => setDraggingSlot(slot)}
        onDragEndItem={() => setDraggingSlot(null)}
      />
    </div>
  );
}
