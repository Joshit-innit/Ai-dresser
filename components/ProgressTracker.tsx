'use client';

import { motion } from 'framer-motion';
import { Check, Loader2, Sparkles } from 'lucide-react';

type ProcessingStage =
  | 'uploading'
  | 'extracting'
  | 'analyzing'
  | 'trying-on'
  | 'refining'
  | 'quality-check'
  | 'complete';

interface ProgressTrackerProps {
  stage: ProcessingStage;
  progress: number;
}

const stages: { key: ProcessingStage; label: string; description: string }[] = [
  { key: 'uploading', label: 'Uploading', description: 'Syncing your inputs' },
  { key: 'extracting', label: 'Extracting Garments', description: 'Reading visual details' },
  { key: 'analyzing', label: 'Analyzing Body', description: 'Checking pose and framing' },
  { key: 'trying-on', label: 'Composing Look', description: 'Applying all outfit elements' },
  { key: 'refining', label: 'Refining Output', description: 'Enhancing realism and fit' },
  { key: 'quality-check', label: 'Quality Gate', description: 'Final consistency checks' },
];

export default function ProgressTracker({ stage, progress }: ProgressTrackerProps) {
  const currentStageIndex = stages.findIndex((s) => s.key === stage);

  return (
    <div className="mx-auto max-w-3xl space-y-7">
      <div className="rounded-2xl border border-white/20 bg-white/5 p-5">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="flex items-center gap-2 text-sm text-[#7ee8de]">
              <Sparkles className="h-4 w-4" />
              AI Studio Composer
            </p>
            <h2 className="text-2xl font-semibold">Generating Your Outfit</h2>
          </div>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1.4, repeat: Infinity, ease: 'linear' }}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-[#7f89ff]"
          >
            <Loader2 className="h-5 w-5 text-[#aeb5ff]" />
          </motion.div>
        </div>

        <div className="h-2 overflow-hidden rounded-full bg-white/10">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.max(progress, 8)}%` }}
            className="h-full bg-gradient-to-r from-[#6f78ff] via-[#7ee8de] to-[#ff9ec5]"
          />
        </div>
        <p className="mt-2 text-right text-xs text-[#a8b5d8]">{progress}% complete</p>
      </div>

      <div className="space-y-3">
        {stages.map((stageItem, index) => {
          const isActive = index === currentStageIndex;
          const isComplete = index < currentStageIndex;

          return (
            <motion.div
              key={stageItem.key}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.07 }}
              className={`rounded-xl border p-4 ${
                isActive
                  ? 'border-[#8f97ff] bg-gradient-to-r from-[#202b61]/90 to-[#173b4d]/80'
                  : 'border-white/10 bg-white/[0.04]'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-[#0f1639]">
                  {isComplete ? (
                    <Check className="h-4 w-4 text-[#7ee8de]" />
                  ) : isActive ? (
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                      <Loader2 className="h-4 w-4 text-[#aeb5ff]" />
                    </motion.div>
                  ) : (
                    <span className="text-xs text-[#a8b5d8]">{index + 1}</span>
                  )}
                </div>

                <div className="flex-1">
                  <div className="mb-1 flex items-center justify-between">
                    <h3 className={`text-sm font-semibold ${isActive ? 'text-white' : 'text-[#b7c2e2]'}`}>{stageItem.label}</h3>
                    {isActive && <span className="text-xs text-[#7ee8de]">Running</span>}
                  </div>
                  {isActive ? (
                    <p className="text-xs text-[#c5d1f2]">{stageItem.description}</p>
                  ) : (
                    <div className="skeleton h-3 w-2/3 rounded" />
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
