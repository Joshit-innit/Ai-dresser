'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Check, Sparkles } from 'lucide-react';

interface Step {
  id: number;
  title: string;
  hint: string;
}

interface StepFlowProps {
  steps: Step[];
  activeStep: number;
}

export default function StepFlow({ steps, activeStep }: StepFlowProps) {
  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-3 rounded-2xl border border-white/15 bg-white/5 p-4 md:flex-row md:items-center md:justify-between">
      {steps.map((step, index) => {
        const isActive = step.id === activeStep;
        const isComplete = step.id < activeStep;

        return (
          <div key={step.id} className="relative flex items-center gap-3">
            <div className="group relative">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className={`flex h-10 w-10 items-center justify-center rounded-full border text-sm font-semibold transition-all ${
                  isComplete
                    ? 'border-transparent bg-gradient-to-br from-[#6f78ff] to-[#22d3c5] text-white'
                    : isActive
                      ? 'step-pulse border-[#95a0ff] bg-[#1b2454] text-white'
                      : 'border-white/25 bg-[#0f1638] text-[#a8b5d8]'
                }`}
              >
                {isComplete ? <Check className="h-4 w-4" /> : step.id}
              </motion.div>

              <AnimatePresence>
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  whileHover={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 6 }}
                  className="pointer-events-none absolute left-1/2 top-12 z-20 hidden w-40 -translate-x-1/2 rounded-lg border border-white/20 bg-[#0b1230]/95 px-3 py-2 text-xs text-[#dce4ff] shadow-lg group-hover:block"
                >
                  {step.hint}
                </motion.div>
              </AnimatePresence>
            </div>

            <div>
              <p className={`text-sm font-semibold ${isActive ? 'text-white' : 'text-[#a8b5d8]'}`}>{step.title}</p>
              {isActive && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center gap-1 text-xs text-[#7ee8de]"
                >
                  <Sparkles className="h-3 w-3" />
                  Active step
                </motion.p>
              )}
            </div>

            {index < steps.length - 1 && <div className="mx-2 hidden h-px w-8 bg-gradient-to-r from-white/10 to-white/30 md:block" />}
          </div>
        );
      })}
    </div>
  );
}
