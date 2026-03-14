'use client';

import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { Image as ImageIcon, Sparkles, Upload } from 'lucide-react';

interface ImageUploadProps {
  onFilesSelected: (files: File[]) => void;
  accept?: string;
  multiple?: boolean;
  label?: string;
  caption?: string;
}

export default function ImageUpload({
  onFilesSelected,
  accept = 'image/*',
  multiple = true,
  label = 'Upload images',
  caption,
}: ImageUploadProps) {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      onFilesSelected(acceptedFiles);
    },
    [onFilesSelected]
  );

  const { getRootProps, getInputProps, isDragActive, isFocused } = useDropzone({
    onDrop,
    accept: accept ? { [accept]: [] } : undefined,
    multiple,
  });

  return (
    <div
      {...getRootProps()}
      className={`group relative cursor-pointer overflow-hidden rounded-2xl border-2 border-dashed p-6 md:p-7 ${
        isDragActive || isFocused
          ? 'drag-dash bg-gradient-to-br from-[#6f78ff]/20 via-[#6f78ff]/8 to-[#22d3c5]/20'
          : 'border-white/25 bg-white/[0.055] hover:border-[#7f89ff]'
      }`}
    >
      <input {...getInputProps()} />

      <motion.div
        animate={{ x: isDragActive ? ['-10%', '110%'] : '-110%' }}
        transition={{ duration: 1.1, repeat: isDragActive ? Infinity : 0, ease: 'linear' }}
        className="pointer-events-none absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-white/25 to-transparent"
      />

      <div className="relative flex items-center gap-4">
        <motion.div
          animate={{ scale: isDragActive ? 1.08 : 1, rotate: isDragActive ? 8 : 0 }}
          className="relative flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-[#6f78ff] to-[#22d3c5] shadow-lg shadow-[#6f78ff]/30"
        >
          <AnimatePresence mode="wait">
            {isDragActive ? (
              <motion.span
                key="drop"
                initial={{ opacity: 0, y: 8, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.8 }}
                className="absolute"
              >
                <Upload className="h-6 w-6 text-white" />
              </motion.span>
            ) : (
              <motion.span
                key="idle"
                initial={{ opacity: 0, y: 8, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.8 }}
                className="absolute"
              >
                <ImageIcon className="h-6 w-6 text-white" />
              </motion.span>
            )}
          </AnimatePresence>
        </motion.div>

        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-1 text-sm font-semibold text-white">
            {isDragActive ? 'Drop to add image' : label}
            {!isDragActive && <Sparkles className="h-3.5 w-3.5 text-[#ffd8a5]" />}
          </p>
          <p className="text-xs text-[#a8b5d8]">{caption || 'Drag and drop or click to browse files'}</p>
        </div>
      </div>
    </div>
  );
}
