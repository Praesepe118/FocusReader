import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useReaderStore } from '../../store/useReaderStore';
import { cn } from '../../lib/utils';
import { FourPointStar } from '../ui/FourPointStar';

export const MobileVerticalProgress = () => {
  const { lines, currentLineIndex, setCurrentLineIndex, mobileMode, mobileNavVisible } = useReaderStore();
  const [isDragging, setIsDragging] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);

  if (!mobileMode || lines.length === 0) return null;

  const totalLines = lines.length;
  // Calculate progress as 0 to 1
  const progress = totalLines > 1 ? currentLineIndex / (totalLines - 1) : 0;

  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    handlePointerMove(e);
    // Capture pointer so dragging works even if finger leaves the track area slightly
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging && e.type !== 'pointerdown') return;
    if (!trackRef.current) return;

    const rect = trackRef.current.getBoundingClientRect();
    // Calculate Y position relative to the track
    let y = e.clientY - rect.top;

    // Clamp between 0 and track height
    y = Math.max(0, Math.min(y, rect.height));

    const percentage = y / rect.height;
    const targetIndex = Math.floor(percentage * (totalLines - 1));

    setCurrentLineIndex(targetIndex);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    setIsDragging(false);
    e.currentTarget.releasePointerCapture(e.pointerId);
  };

  return (
    <AnimatePresence>
      {mobileNavVisible && (
        <motion.div
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 50, opacity: 0 }}
          className="fixed right-2 top-1/4 bottom-1/4 z-50 flex items-center justify-center w-8 touch-none"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
        >
          {/* Track */}
          <div
            ref={trackRef}
            className="relative h-full w-1.5 bg-stone-200/50 rounded-full"
          >
            {/* Active Track */}
            <div
              className="absolute top-0 left-0 w-full bg-amber-400 rounded-full pointer-events-none"
              style={{ height: `${progress * 100}%` }}
            />

            {/* Thumb (Star) */}
            <div
              className="absolute left-[3px] pointer-events-none flex items-center justify-center transition-transform"
              style={{
                top: `${progress * 100}%`,
                transform: `translate(-50%, -50%) scale(${isDragging ? 1.5 : 1})`
              }}
            >
              <div className="text-amber-500 drop-shadow-md w-[7mm] h-[7mm] flex items-center justify-center bg-white rounded-full shadow-sm border border-stone-100">
                <FourPointStar className="w-4 h-4" fill="currentColor" strokeWidth={2} />
              </div>
            </div>
          </div>

          {/* Progress Tooltip (visible while dragging) */}
          <AnimatePresence>
            {isDragging && (
              <motion.div
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                className="absolute right-12 bg-stone-800 text-white text-xs px-2 py-1 rounded shadow-lg whitespace-nowrap font-mono pointer-events-none"
                style={{ top: `${progress * 100}%`, transform: 'translateY(-50%)' }}
              >
                {currentLineIndex + 1} / {totalLines}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
