import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useReaderStore } from '../store/useReaderStore';
import { FourPointStar } from './ui/FourPointStar';

export const ZenTimer = () => {
  const { timerState, timerEndTime, completeTimer, cancelTimer } = useReaderStore();

  useEffect(() => {
    if (timerState === 'running' && timerEndTime) {
      const interval = setInterval(() => {
        if (Date.now() >= timerEndTime) {
          completeTimer();
        }
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [timerState, timerEndTime, completeTimer]);

  // Auto-hide the finished indicator after some time? 
  // User said "jump out a 4-point star". Maybe it stays until clicked?
  // "只有时间到后跳出一个四角星在屏幕左上方" -> "Only after time is up, a 4-point star jumps out at top-left"
  
  return (
    <AnimatePresence>
      {timerState === 'finished' && (
        <motion.div
          initial={{ opacity: 0, scale: 0, rotate: -45 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          exit={{ opacity: 0, scale: 0, rotate: 45 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
          className="fixed top-8 left-8 z-50 cursor-pointer"
          onClick={cancelTimer} // Click to dismiss
          title="时间到 (点击关闭)"
        >
          <div className="relative">
             {/* Glow effect */}
             <div className="absolute inset-0 bg-amber-200 blur-xl opacity-50 animate-pulse" />
             <FourPointStar 
                className="w-12 h-12 text-amber-400 drop-shadow-md" 
                fill="currentColor" 
                strokeWidth={1}
             />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
