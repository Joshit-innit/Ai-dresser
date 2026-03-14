'use client';

import { motion } from 'framer-motion';

const pieces = Array.from({ length: 16 }).map((_, i) => ({
  id: i,
  left: `${6 + (i % 8) * 11}%`,
  delay: (i % 7) * 0.08,
  duration: 1.4 + (i % 3) * 0.25,
  color: ['#6f78ff', '#22d3c5', '#ff73a9', '#ffc96a'][i % 4],
}));

export default function ConfettiBurst() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {pieces.map((piece) => (
        <motion.span
          key={piece.id}
          initial={{ y: -20, opacity: 0, scale: 0.7 }}
          animate={{ y: [0, 90, 180], opacity: [0, 1, 0], rotate: [0, 40, 90], scale: [0.7, 1, 0.8] }}
          transition={{ duration: piece.duration, delay: piece.delay, ease: 'easeOut' }}
          className="absolute top-0 h-2 w-2 rounded-sm"
          style={{ left: piece.left, backgroundColor: piece.color }}
        />
      ))}
    </div>
  );
}
