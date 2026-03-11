import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Lock, Maximize } from 'lucide-react';
import { useReaderStore } from '../../store/useReaderStore';

export const FocusModeActiveOverlay = () => {
  const { isFocusModeActive, focusModeEndTime, endFocusMode } = useReaderStore();
  const [isFullscreen, setIsFullscreen] = useState(!!document.fullscreenElement);
  const [remainingTime, setRemainingTime] = useState<string>('');

  useEffect(() => {
    setIsFullscreen(!!document.fullscreenElement);
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  useEffect(() => {
    if (!isFocusModeActive) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = ''; // Required for Chrome
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isFocusModeActive]);

  useEffect(() => {
    if (isFocusModeActive && focusModeEndTime) {
      const updateTimer = () => {
        const diff = focusModeEndTime - Date.now();
        if (diff > 0) {
          const mins = Math.floor(diff / 60000).toString().padStart(2, '0');
          const secs = Math.floor((diff % 60000) / 1000).toString().padStart(2, '0');
          setRemainingTime(`${mins}:${secs}`);
        } else {
          setRemainingTime('00:00');
          endFocusMode();
          if (document.fullscreenElement && document.exitFullscreen) {
            document.exitFullscreen().catch(err => console.error(err));
          }
        }
      };
      
      updateTimer();
      const interval = setInterval(updateTimer, 1000);
      return () => clearInterval(interval);
    }
  }, [isFocusModeActive, focusModeEndTime, endFocusMode]);

  const requestFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      }
    } catch (err) {
      console.error("Fullscreen request failed:", err);
    }
  };

  if (!isFocusModeActive) return null;

  return (
    <>
      {/* Warning Overlay if user exits fullscreen */}
      <AnimatePresence>
        {!isFullscreen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[99999] bg-stone-900/95 backdrop-blur-xl flex flex-col items-center justify-center text-white"
          >
            <Lock size={48} className="text-amber-500 mb-6" />
            <h2 className="text-3xl font-serif mb-4">专注模式进行中</h2>
            <p className="text-stone-400 mb-8 max-w-md text-center leading-relaxed">
              你设定了专注时长，在倒计时结束前无法退出。请返回全屏模式继续阅读。
            </p>
            <div className="text-5xl font-mono text-amber-400 mb-12">
              {remainingTime}
            </div>
            <button
              onClick={requestFullscreen}
              className="px-8 py-4 bg-amber-500 hover:bg-amber-600 text-stone-900 font-bold rounded-full flex items-center gap-3 transition-transform hover:scale-105 active:scale-95"
            >
              <Maximize size={20} />
              返回全屏继续
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Unobtrusive Timer while reading */}
      {isFullscreen && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
          <div className="bg-stone-900/40 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/10 flex items-center gap-2 text-white/80 shadow-lg">
            <Lock size={12} className="text-amber-400" />
            <span className="font-mono text-sm tracking-wider">{remainingTime}</span>
          </div>
        </div>
      )}
    </>
  );
};
