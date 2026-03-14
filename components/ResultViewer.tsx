'use client';

import { motion } from 'framer-motion';
import { Download, Share2 } from 'lucide-react';
import { ReactCompareSlider, ReactCompareSliderImage } from 'react-compare-slider';

interface ResultViewerProps {
  resultImage: string;
  originalModel: string | null;
}

export default function ResultViewer({ resultImage, originalModel }: ResultViewerProps) {
  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = resultImage;
    link.download = 'virtual-try-on-result.jpg';
    link.click();
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        const response = await fetch(resultImage);
        const blob = await response.blob();
        const file = new File([blob], 'virtual-try-on.jpg', { type: 'image/jpeg' });
        await navigator.share({
          files: [file],
          title: 'Virtual Try-On Result',
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  return (
    <div className="space-y-6">
      {originalModel ? (
        <div className="overflow-hidden rounded-2xl border border-white/80 bg-white/65">
          <ReactCompareSlider
            itemOne={<ReactCompareSliderImage src={originalModel} alt="Original" />}
            itemTwo={<ReactCompareSliderImage src={resultImage} alt="Result" />}
            style={{ width: '100%', height: '600px' }}
          />
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="overflow-hidden rounded-2xl border border-white/80 bg-white/65"
        >
          <img src={resultImage} alt="Virtual Try-On Result" className="h-auto max-h-[800px] w-full object-contain" />
        </motion.div>
      )}

      <div className="flex items-center justify-center gap-4">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleDownload}
          className="luxe-button flex items-center gap-2 rounded-full px-6 py-3 font-semibold text-white shadow-lg shadow-[#4054f5]/30"
        >
          <Download className="h-4 w-4" />
          <span>Download</span>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleShare}
          className="flex items-center gap-2 rounded-full border border-[#9dacf8] bg-white/80 px-6 py-3 font-semibold text-[#3040ad] transition-colors hover:bg-white"
        >
          <Share2 className="h-4 w-4" />
          <span>Share</span>
        </motion.button>
      </div>
    </div>
  );
}
