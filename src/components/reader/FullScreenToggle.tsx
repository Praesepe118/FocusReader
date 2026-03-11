import React, { useState, useEffect } from 'react';
import { Maximize, Minimize } from 'lucide-react';
import { cn } from '../../lib/utils';
import { motion } from 'motion/react';

export const FullScreenToggle = ({ className }: { className?: string }) => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        }
      }
    } catch (err) {
      console.error("Error attempting to toggle fullscreen:", err);
    }
  };

  return (
    <motion.button
      onClick={toggleFullscreen}
      className={cn(
        "p-4 bg-white/80 backdrop-blur-md text-stone-600 rounded-full shadow-lg shadow-stone-200/50 border border-white/60 hover:bg-white transition-all cursor-pointer",
        className
      )}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      title={isFullscreen ? "退出全屏" : "全屏模式"}
    >
      {isFullscreen ? <Minimize size={22} strokeWidth={1.5} /> : <Maximize size={22} strokeWidth={1.5} />}
    </motion.button>
  );
};
