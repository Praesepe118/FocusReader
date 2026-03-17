import React, { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertCircle, Check, Highlighter, Square } from 'lucide-react';
import { cn } from '../../lib/utils';
import { LineData, useReaderStore } from '../../store/useReaderStore';
import { FourPointStar } from '../ui/FourPointStar';
import { useAIStore } from '../../store/useAIStore';

interface ReaderLineProps {
  line: LineData;
  globalIndex: number;
  isActive: boolean;
}

export const ReaderLine: React.FC<ReaderLineProps> = ({ line, globalIndex, isActive }) => {
  const { 
    fontSize, 
    lineHeight, 
    letterSpacing, 
    setCurrentLineIndex, 
    toggleLineConfusing, 
    toggleLineHighlight,
    markLineAsRead,
    toggleLineRead,
    updateLineNote,
    showNotes,
    showReadStar,
    browseMode,
    globalNoteMode,
    mobileMode,
    smartFontSize
  } = useReaderStore();

  const { isSidebarPinned, toggleLineSelection, selectedLineIds } = useAIStore();
  const isSelected = selectedLineIds.includes(line.id);

  const hoverTimer = useRef<NodeJS.Timeout | null>(null);
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  const [showBubble, setShowBubble] = useState(false);
  const [computedFontSize, setComputedFontSize] = useState(fontSize);

  useEffect(() => {
    const calculateFontSize = () => {
      const isFullscreen = !!document.fullscreenElement;
      
      if (smartFontSize) {
        const screenWidth = window.innerWidth;
        const screenHeight = window.innerHeight;
        // Adjust target area based on mobile mode to avoid overflowing horizontally
        const targetArea = screenWidth * screenHeight * (mobileMode ? 0.6 : 0.8); 
        const textLength = Math.max(line.text.length, 10);
        
        let calculatedSize = Math.sqrt(targetArea / textLength);
        // Reduce size slightly to account for line height and letter spacing
        calculatedSize = calculatedSize * 0.8;
        calculatedSize = Math.max(16, Math.min(calculatedSize, 80)); // Clamp
        setComputedFontSize(calculatedSize);
      } else {
        let baseSize = mobileMode ? Math.max(fontSize, 20) : fontSize;
        if (isFullscreen) {
          baseSize = Math.min(baseSize * 1.5, 48); // Increase by 50%, max 48
        }
        setComputedFontSize(baseSize);
      }
    };

    calculateFontSize();
    window.addEventListener('resize', calculateFontSize);
    document.addEventListener('fullscreenchange', calculateFontSize);
    return () => {
      window.removeEventListener('resize', calculateFontSize);
      document.removeEventListener('fullscreenchange', calculateFontSize);
    };
  }, [smartFontSize, fontSize, mobileMode, line.text.length]);

  const handleMouseEnter = () => {
    if (!line.isRead && !mobileMode) {
      hoverTimer.current = setTimeout(() => {
        markLineAsRead(line.id);
      }, 1000); // 1 second threshold
    }
  };

  const handleMouseLeave = () => {
    if (hoverTimer.current) {
      clearTimeout(hoverTimer.current);
      hoverTimer.current = null;
    }
  };

  // Mobile Long Press Handlers
  const handleTouchStart = () => {
    if (!mobileMode) return;
    longPressTimer.current = setTimeout(() => {
      setShowBubble(true);
    }, 500); // 500ms for long press
  };

  const handleTouchEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  const handleTouchMove = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (hoverTimer.current) clearTimeout(hoverTimer.current);
      if (longPressTimer.current) clearTimeout(longPressTimer.current);
    };
  }, []);

  // Close bubble when clicking outside
  const bubbleRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handleClickOutside = (e: TouchEvent | MouseEvent) => {
      if (bubbleRef.current && !bubbleRef.current.contains(e.target as Node)) {
        setShowBubble(false);
      }
    };
    if (showBubble) {
      document.addEventListener('touchstart', handleClickOutside);
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('touchstart', handleClickOutside);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showBubble]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className={cn(
        "group relative items-start w-full mx-auto",
        mobileMode 
          ? "flex flex-col items-center justify-center min-h-[50vh] gap-8 px-4" 
          : "grid grid-cols-[1fr_minmax(auto,65ch)_1fr] gap-4 max-w-[1600px]"
      )}
      onClick={() => setCurrentLineIndex(globalIndex)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Actions & Indicators (Desktop) */}
      {!mobileMode && (
        <div className="flex items-center gap-3 relative justify-end pt-2 pr-4 h-full min-h-[2rem]">
          {/* Selection Checkbox (AI Mode) */}
          {isSidebarPinned && (
              <div 
                  className="cursor-pointer"
                  onClick={(e) => { e.stopPropagation(); toggleLineSelection(line.id); }}
              >
                  <div className={cn(
                      "w-4 h-4 rounded border transition-colors flex items-center justify-center",
                      isSelected ? "bg-amber-500 border-amber-500" : "border-stone-300 bg-transparent hover:border-amber-400"
                  )}>
                      {isSelected && <Check size={12} className="text-white" strokeWidth={3} />}
                  </div>
              </div>
          )}

          {/* Hover Actions */}
          <div className="transition-opacity duration-300 flex items-center gap-1 opacity-0 group-hover:opacity-100">
            {/* Highlight Mark */}
            <button 
              onClick={(e) => { e.stopPropagation(); toggleLineHighlight(line.id); }}
              className={cn(
                "p-2 rounded-full transition-colors",
                line.isHighlighted ? "text-emerald-600 bg-emerald-50" : "text-stone-300 hover:text-emerald-600 hover:bg-stone-50"
              )}
              title="高亮"
            >
              <Highlighter size={16} strokeWidth={1.5} />
            </button>

            {/* Confusing Mark */}
            <button 
              onClick={(e) => { e.stopPropagation(); toggleLineConfusing(line.id); }}
              className={cn(
                "p-2 rounded-full transition-colors",
                line.isConfusing ? "text-amber-600 bg-amber-50" : "text-stone-300 hover:text-amber-600 hover:bg-stone-50"
              )}
              title="标记为不懂"
            >
              <AlertCircle size={16} strokeWidth={1.5} />
            </button>
          </div>

          {/* Read Indicator Star */}
          {showReadStar && (
            <div className="flex items-center justify-center w-6">
                <button
                    onClick={(e) => { e.stopPropagation(); toggleLineRead(line.id); }}
                    className={cn(
                        "transition-all duration-300 transform",
                        line.isRead 
                            ? "text-amber-400 scale-100 opacity-100" 
                            : "text-stone-200 scale-0 opacity-0 group-hover:scale-75 group-hover:opacity-50 hover:!scale-100 hover:!opacity-100 hover:!text-amber-300"
                    )}
                    title={line.isRead ? "已读 (点击取消)" : "未读"}
                >
                  <FourPointStar size={14} fill={line.isRead ? "currentColor" : "none"} strokeWidth={2} />
                </button>
            </div>
          )}
        </div>
      )}

      {/* Center Column: Text */}
      <div className={cn(
        "relative",
        mobileMode ? "w-full order-1" : "px-4"
      )}>
        <p 
          className={cn(
            "transition-colors duration-300 font-sans tracking-wide leading-relaxed cursor-default text-center select-none",
            // Default grey, hover black.
            line.isConfusing ? "text-amber-800/80" : (line.isHighlighted ? "text-emerald-800/80" : (browseMode || mobileMode ? "text-stone-900" : "text-stone-300 hover:text-stone-900"))
          )}
          style={{
            fontSize: computedFontSize,
            lineHeight: lineHeight,
            letterSpacing: `${letterSpacing}em`,
            textDecorationLine: (line.isConfusing || line.isHighlighted) ? 'underline' : 'none',
            textDecorationStyle: line.isConfusing ? 'wavy' : (line.isHighlighted ? 'solid' : undefined),
            textDecorationColor: line.isConfusing ? 'rgba(217, 119, 6, 0.3)' : (line.isHighlighted ? 'rgba(5, 150, 105, 0.4)' : undefined),
            textUnderlineOffset: '6px'
          }}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onTouchMove={handleTouchMove}
        >
          {line.text}
        </p>

        {/* Mobile Long Press Bubble */}
        <AnimatePresence>
          {mobileMode && showBubble && (
            <motion.div
              ref={bubbleRef}
              initial={{ opacity: 0, y: 10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.9 }}
              className="absolute -top-16 left-1/2 -translate-x-1/2 flex items-center bg-stone-800/90 backdrop-blur-md rounded-full shadow-xl border border-stone-600/50 z-50 overflow-hidden"
              onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
            >
              <button 
                onClick={(e) => { e.stopPropagation(); toggleLineSelection(line.id); setShowBubble(false); }}
                className="p-3 text-stone-200 hover:bg-white/10 transition-colors flex items-center justify-center"
              >
                {isSelected ? <Check size={18} className="text-amber-400" /> : <Square size={18} />}
              </button>
              <div className="w-[1px] h-6 bg-stone-600/50" />
              <button 
                onClick={(e) => { e.stopPropagation(); toggleLineHighlight(line.id); setShowBubble(false); }}
                className={cn(
                  "p-3 transition-colors flex items-center justify-center",
                  line.isHighlighted ? "text-emerald-400 bg-emerald-900/30" : "text-stone-200 hover:bg-white/10"
                )}
              >
                <Highlighter size={18} />
              </button>
              <div className="w-[1px] h-6 bg-stone-600/50" />
              <button 
                onClick={(e) => { e.stopPropagation(); toggleLineConfusing(line.id); setShowBubble(false); }}
                className={cn(
                  "p-3 transition-colors flex items-center justify-center",
                  line.isConfusing ? "text-amber-400 bg-amber-900/30" : "text-stone-200 hover:bg-white/10"
                )}
              >
                <AlertCircle size={18} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Right Column: Note Input */}
      {!globalNoteMode && !mobileMode && (
        <div 
          className={cn(
            "transition-all duration-500 flex items-start group/note",
            "pl-4 pt-1 h-full",
            showNotes ? "opacity-100 translate-x-0" : "opacity-0 translate-x-10 pointer-events-none"
          )}
        >
          <textarea
            value={line.note || ''}
            onChange={(e) => updateLineNote(line.id, e.target.value)}
            onFocus={() => setCurrentLineIndex(globalIndex)}
            placeholder="随笔..."
            className={cn(
              "bg-transparent border-none resize-none outline-none p-0",
              "font-hand text-stone-500 text-sm leading-relaxed",
              "w-full",
              "placeholder:text-stone-200/0 focus:placeholder:text-stone-200/50 group-hover/note:placeholder:text-stone-200/50", // Placeholder visible on hover/focus
              "opacity-0 group-hover/note:opacity-100 focus:opacity-100 transition-opacity duration-300"
            )}
            style={{
               opacity: line.note ? 1 : undefined // If note exists, stay visible.
            }}
            rows={Math.max(2, Math.ceil(line.text.length / 20))}
            spellCheck={false}
          />
        </div>
      )}
    </motion.div>
  );
};
