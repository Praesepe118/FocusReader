import React, { useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { AlertCircle, Check, Highlighter } from 'lucide-react';
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
    showNotes
  } = useReaderStore();

  const { isSidebarPinned, toggleLineSelection, selectedLineIds } = useAIStore();
  const isSelected = selectedLineIds.includes(line.id);

  const hoverTimer = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = () => {
    if (!line.isRead) {
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

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (hoverTimer.current) {
        clearTimeout(hoverTimer.current);
      }
    };
  }, []);

  return (
    <motion.div
      layoutId={line.id}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="group relative grid grid-cols-[1fr_minmax(auto,65ch)_1fr] gap-4 items-start w-full max-w-[1600px] mx-auto"
      onClick={() => setCurrentLineIndex(globalIndex)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Left Column: Actions & Indicators */}
      <div className="flex justify-end items-center pt-2 pr-4 relative gap-3 h-full min-h-[2rem]">
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
        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center gap-1">
          {/* Highlight Mark */}
          <button 
            onClick={(e) => { e.stopPropagation(); toggleLineHighlight(line.id); }}
            className={cn(
              "p-1.5 rounded-full transition-colors",
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
              "p-1.5 rounded-full transition-colors",
              line.isConfusing ? "text-amber-600 bg-amber-50" : "text-stone-300 hover:text-amber-600 hover:bg-stone-50"
            )}
            title="标记为不懂"
          >
            <AlertCircle size={16} strokeWidth={1.5} />
          </button>
        </div>

        {/* Read Indicator Star */}
        <div className="flex items-center justify-center w-4">
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
      </div>

      {/* Center Column: Text */}
      <div className="relative px-4">
        <p 
          className={cn(
            "transition-colors duration-300 font-sans tracking-wide leading-relaxed cursor-default text-center",
            // Default grey, hover black.
            line.isConfusing ? "text-amber-800/80" : (line.isHighlighted ? "text-emerald-800/80" : "text-stone-300 hover:text-stone-900")
          )}
          style={{
            fontSize: fontSize,
            lineHeight: lineHeight,
            letterSpacing: `${letterSpacing}em`,
            textDecorationLine: (line.isConfusing || line.isHighlighted) ? 'underline' : 'none',
            textDecorationStyle: line.isConfusing ? 'wavy' : (line.isHighlighted ? 'solid' : undefined),
            textDecorationColor: line.isConfusing ? 'rgba(217, 119, 6, 0.3)' : (line.isHighlighted ? 'rgba(5, 150, 105, 0.4)' : undefined),
            textUnderlineOffset: '6px'
          }}
        >
          {line.text}
        </p>
      </div>

      {/* Right Column: Note Input */}
      <div 
        className={cn(
          "pl-4 pt-1 transition-all duration-500 h-full flex items-start group/note",
          showNotes ? "opacity-100 translate-x-0" : "opacity-0 translate-x-10 pointer-events-none"
        )}
      >
        <textarea
          value={line.note || ''}
          onChange={(e) => updateLineNote(line.id, e.target.value)}
          onFocus={() => setCurrentLineIndex(globalIndex)}
          placeholder="随笔..."
          className={cn(
            "w-full bg-transparent border-none resize-none outline-none p-0",
            "font-hand text-stone-500 text-sm leading-relaxed",
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
    </motion.div>
  );
};
