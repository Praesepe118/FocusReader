import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BookOpen, Clock, Hourglass, Lock } from 'lucide-react';
import { useReaderStore } from '../../store/useReaderStore';
import { cn } from '../../lib/utils';
import { FourPointStar } from '../ui/FourPointStar';
import { FocusModeSetup } from './FocusModeSetup';

interface ReadingProgressProps {
  onOpenNotes: () => void;
}

export const ReadingProgress: React.FC<ReadingProgressProps> = ({ onOpenNotes }) => {
  const { lines, startTimer, cancelTimer, timerState, timerEndTime, totalFocusTime, isFocusModeActive, currentLineIndex, mobileMode, setCurrentLineIndex } = useReaderStore();
  const [isHovered, setIsHovered] = useState(false);
  const [showTimerSettings, setShowTimerSettings] = useState(false);
  const [showFocusSetup, setShowFocusSetup] = useState(false);
  const [remainingTime, setRemainingTime] = useState<string>('');

  const readLines = lines.filter(l => l.isRead);
  const totalLines = lines.length;
  // In mobile mode, use currentLineIndex for progress, otherwise use readLines
  const progress = totalLines > 0 ? (mobileMode ? (currentLineIndex / (totalLines - 1)) * 100 : (readLines.length / totalLines) * 100) : 0;

  const readChars = readLines.reduce((acc, line) => acc + line.text.length, 0);

  // Calculate stars: 1 star for every 10% progress, max 10 stars.
  const starCount = Math.floor(progress / 10);
  const stars = Array.from({ length: 10 }, (_, i) => i < starCount);

  const timerOptions = [5, 10, 15, 20, 25, 30, 45, 60];

  const handleStartTimer = (minutes: number) => {
    startTimer(minutes);
    setShowTimerSettings(false);
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!mobileMode || totalLines === 0) return;

    // Calculate click position as a percentage
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, x / rect.width));

    // Map percentage to a line index
    const targetIndex = Math.floor(percentage * (totalLines - 1));
    setCurrentLineIndex(targetIndex);
  };

  // Timer countdown effect
  useEffect(() => {
    if (timerState === 'running' && timerEndTime) {
      const updateTimer = () => {
        const diff = timerEndTime - Date.now();
        if (diff > 0) {
          const mins = Math.floor(diff / 60000);
          const secs = Math.floor((diff % 60000) / 1000);
          setRemainingTime(`${mins}分${secs}秒`);
        } else {
          setRemainingTime('0分0秒');
        }
      };
      
      updateTimer(); // Initial call
      const interval = setInterval(updateTimer, 1000);
      return () => clearInterval(interval);
    }
  }, [timerState, timerEndTime]);

  const isTimerRunning = timerState === 'running';

  const formatFocusTime = (ms: number) => {
    const totalMins = Math.floor(ms / 60000);
    if (totalMins < 60) return `${totalMins}分钟`;
    const hrs = Math.floor(totalMins / 60);
    const mins = totalMins % 60;
    return `${hrs}小时${mins}分钟`;
  };

  if (mobileMode) return null;

  return (
    <>
      <div
        className={cn(
          "fixed bottom-0 left-0 right-0 z-50 flex flex-col items-center justify-end transition-all duration-500 ease-out",
          isHovered ? "h-auto py-6 bg-white/90 backdrop-blur-md border-t border-stone-200 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]" : "h-1.5 bg-transparent"
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => {
          setIsHovered(false);
          setShowTimerSettings(false);
        }}
      >
        {/* The Trigger Line (Always visible as a thin hint) */}
        <div
          className={cn(
            "absolute top-0 left-0 right-0 h-1.5 transition-all duration-300",
            isHovered ? "opacity-0" : "bg-stone-200/50 hover:bg-amber-200/50 cursor-pointer"
          )}
          onClick={handleProgressClick}
        >
          <motion.div
            className="h-full bg-amber-400/50"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ type: 'spring', stiffness: 50, damping: 20 }}
          />
        </div>

        {/* Expanded Content */}
        <AnimatePresence>
          {isHovered && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="flex flex-col items-center gap-4 w-full max-w-3xl px-4"
            >
              {/* Star Collection */}
              <div className="flex items-center gap-2">
                  {stars.map((isEarned, index) => (
                      <motion.div
                          key={index}
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: index * 0.05 }}
                          className={cn(
                              "transition-colors duration-300",
                              isEarned ? "text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.4)]" : "text-stone-200"
                          )}
                      >
                          <FourPointStar className="w-5 h-5" strokeWidth={isEarned ? 2 : 1.5} fill={isEarned ? "currentColor" : "none"} />
                      </motion.div>
                  ))}
              </div>

              {/* Progress Bar (Expanded) */}
              <div
                className="relative w-full h-1.5 bg-stone-100 rounded-full overflow-hidden cursor-pointer"
                onClick={handleProgressClick}
              >
                  <motion.div
                  className="absolute top-0 bottom-0 left-0 bg-amber-400 pointer-events-none"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ type: 'spring', stiffness: 50, damping: 20 }}
                  />
              </div>

              {/* Stats & Controls */}
              <div className="flex flex-col sm:flex-row items-center justify-between w-full text-xs font-serif text-stone-500 relative gap-4">
                  <div className="flex flex-wrap items-center justify-center gap-4">
                      {mobileMode ? (
                        <>
                          <span><span className="font-mono text-stone-800 text-sm">{currentLineIndex + 1}</span> / {totalLines} 句</span>
                          <span><span className="font-mono text-stone-800 text-sm">{Math.round(progress)}%</span> 进度</span>
                        </>
                      ) : (
                        <>
                          <span><span className="font-mono text-stone-800 text-sm">{readChars}</span> 字</span>
                          <span><span className="font-mono text-stone-800 text-sm">{Math.round(progress)}%</span> 完成</span>
                        </>
                      )}
                      <span className="flex items-center gap-1 text-stone-400">
                          <Hourglass size={10} />
                          <span>专注 <span className="font-mono text-stone-600">{formatFocusTime(totalFocusTime)}</span></span>
                      </span>
                  </div>

                  <div className="flex flex-wrap items-center justify-center gap-3">
                      {/* Focus Mode Control */}
                      <button
                          onClick={() => !isFocusModeActive && setShowFocusSetup(true)}
                          className={cn(
                            "flex items-center gap-2 px-3 py-1.5 rounded-full transition-colors border",
                            isFocusModeActive 
                              ? "bg-amber-50 text-amber-600 border-amber-200 cursor-default" 
                              : "bg-stone-800 text-white border-stone-800 hover:bg-stone-900"
                          )}
                          title={isFocusModeActive ? "专注模式进行中" : "沉浸专注模式"}
                      >
                          <Lock size={14} />
                          <span>{isFocusModeActive ? "专注中" : "专注模式"}</span>
                      </button>

                      {/* Timer Control */}
                      <div className="relative group/timer">
                          <button
                              onClick={() => setShowTimerSettings(!showTimerSettings)}
                              className={cn(
                                  "flex items-center gap-2 px-3 py-1.5 rounded-full transition-colors border",
                                  isTimerRunning 
                                      ? "bg-amber-50 text-amber-600 border-amber-200" 
                                      : "bg-stone-50 text-stone-400 border-stone-200 hover:border-stone-300 hover:text-stone-600"
                              )}
                              title="阅读闹钟"
                          >
                              <Clock size={14} />
                              {isTimerRunning && <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />}
                          </button>

                          {/* Remaining Time Tooltip (Only when running and hovered) */}
                          {isTimerRunning && (
                              <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 px-2 py-1 bg-stone-800 text-white text-[10px] rounded opacity-0 group-hover/timer:opacity-100 transition-opacity pointer-events-none whitespace-nowrap font-mono">
                                  剩余 {remainingTime}
                              </div>
                          )}

                          {/* Timer Settings Popover */}
                          <AnimatePresence>
                              {showTimerSettings && (
                                  <motion.div
                                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                      animate={{ opacity: 1, y: 0, scale: 1 }}
                                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                      className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 bg-white rounded-xl shadow-xl border border-stone-100 p-3 min-w-[200px] grid grid-cols-4 gap-2 z-50"
                                  >
                                      {timerOptions.map(min => (
                                          <button
                                              key={min}
                                              onClick={() => handleStartTimer(min)}
                                              className="px-2 py-1.5 rounded-lg hover:bg-stone-100 text-stone-600 font-mono text-xs transition-colors"
                                          >
                                              {min}m
                                          </button>
                                      ))}
                                      {isTimerRunning && (
                                          <button
                                              onClick={() => { cancelTimer(); setShowTimerSettings(false); }}
                                              className="col-span-4 mt-1 px-2 py-1.5 rounded-lg bg-stone-100 hover:bg-red-50 text-stone-500 hover:text-red-500 text-xs transition-colors border border-stone-200"
                                          >
                                              取消闹钟
                                          </button>
                                      )}
                                  </motion.div>
                              )}
                          </AnimatePresence>
                      </div>

                      <button 
                          onClick={onOpenNotes}
                          className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-stone-100 hover:bg-amber-50 text-stone-600 hover:text-amber-700 transition-colors border border-stone-200 hover:border-amber-200"
                      >
                          <BookOpen size={14} />
                          <span className="italic">审视随笔</span>
                      </button>
                  </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <FocusModeSetup isOpen={showFocusSetup} onClose={() => setShowFocusSetup(false)} />
    </>
  );
};
