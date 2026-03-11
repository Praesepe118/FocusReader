import React, { useEffect, useRef } from 'react';
import { useReaderStore } from '../store/useReaderStore';
import { AnimatePresence, motion } from 'motion/react';
import { ReaderLine } from './reader/ReaderLine';
import { ReaderPagination } from './reader/ReaderPagination';
import { ReadingProgress } from './reader/ReadingProgress';
import { PageTurnEffect } from './reader/PageTurnEffect';
import { NotesReviewModal } from './reader/NotesReviewModal';
import { ZenTimer } from './ZenTimer';
import { AIChatSidebar } from './chat/AIChatSidebar';

export const Reader = () => {
  const { 
    lines, 
    currentLineIndex, 
    setCurrentLineIndex, 
    linesPerPage, 
    reset,
    showNotes,
    globalNoteMode,
    globalNote,
    setGlobalNote,
    infiniteScrollMode,
    isFocusModeActive
  } = useReaderStore();

  const [isNotesOpen, setIsNotesOpen] = React.useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  // Calculate pagination
  const currentPage = infiniteScrollMode ? 0 : Math.floor(currentLineIndex / linesPerPage);
  const startLineIndex = infiniteScrollMode ? 0 : currentPage * linesPerPage;
  const endLineIndex = infiniteScrollMode ? lines.length : startLineIndex + linesPerPage;
  const visibleLines = infiniteScrollMode ? lines : lines.slice(startLineIndex, endLineIndex);

  // Track page changes for animation
  const prevPageRef = useRef(currentPage);
  const [pageTurnTrigger, setPageTurnTrigger] = React.useState(0);

  useEffect(() => {
    if (currentPage > prevPageRef.current) {
        // Only trigger on forward page turn
        setPageTurnTrigger(prev => prev + 1);
    }
    prevPageRef.current = currentPage;
  }, [currentPage]);

  useEffect(() => {
    if (!infiniteScrollMode && containerRef.current) {
      containerRef.current.scrollTop = 0;
    }
  }, [currentPage, infiniteScrollMode]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in input/textarea
      const activeElement = document.activeElement;
      const isInput = activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA');
      if (isInput) return;

      if (e.key === 'ArrowDown' || e.key === 'j') {
        e.preventDefault();
        if (currentLineIndex < lines.length - 1) {
          setCurrentLineIndex(currentLineIndex + 1);
        }
      } else if (e.key === 'ArrowUp' || e.key === 'k') {
        e.preventDefault();
        if (currentLineIndex > 0) {
          setCurrentLineIndex(currentLineIndex - 1);
        }
      } else if (e.key === 'ArrowRight') {
         e.preventDefault();
         if (infiniteScrollMode) {
            const nextIndex = Math.min(lines.length - 1, currentLineIndex + linesPerPage);
            setCurrentLineIndex(nextIndex);
         } else {
            const nextPageStart = (currentPage + 1) * linesPerPage;
            if (nextPageStart < lines.length) {
               setCurrentLineIndex(nextPageStart);
            }
         }
      } else if (e.key === 'ArrowLeft') {
         e.preventDefault();
         if (infiniteScrollMode) {
            const prevIndex = Math.max(0, currentLineIndex - linesPerPage);
            setCurrentLineIndex(prevIndex);
         } else {
            const prevPageStart = (currentPage - 1) * linesPerPage;
            if (prevPageStart >= 0) {
               setCurrentLineIndex(prevPageStart);
            }
         }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentLineIndex, lines.length, setCurrentLineIndex, currentPage, linesPerPage, infiniteScrollMode]);

  if (lines.length === 0) return null;

  return (
    <div className="flex flex-col h-full relative overflow-hidden bg-stone-50/30">
      {/* Main Content Area */}
      <div 
        ref={containerRef}
        className="flex-1 overflow-y-auto px-4 py-8 pt-20 scroll-smooth no-scrollbar transition-all duration-300"
      >
        <div className="w-full min-h-[60vh] pb-32 relative">
          <AnimatePresence mode='wait'>
            <motion.div
              key={currentPage}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-8 relative z-0"
            >
              {visibleLines.map((line, index) => {
                const globalIndex = startLineIndex + index;
                const isActive = globalIndex === currentLineIndex;
                
                return (
                  <ReaderLine
                    key={line.id}
                    line={line}
                    globalIndex={globalIndex}
                    isActive={isActive}
                  />
                );
              })}
            </motion.div>
          </AnimatePresence>

          {/* Global Note Area Overlay */}
          {showNotes && globalNoteMode && (
            <div className="absolute inset-0 pointer-events-none z-10">
              <div className="grid grid-cols-[1fr_minmax(auto,65ch)_1fr] gap-4 w-full max-w-[1600px] mx-auto h-full">
                <div /> {/* Left padding column */}
                <div /> {/* Center content column */}
                <div className="pl-4 pt-1 pointer-events-auto h-full group/global-note">
                  <textarea
                    value={globalNote}
                    onChange={(e) => setGlobalNote(e.target.value)}
                    placeholder=""
                    className="w-full h-full bg-transparent border-none resize-none outline-none p-0 font-hand text-stone-500 text-sm leading-relaxed placeholder:text-transparent focus:placeholder:text-stone-200/50 group-hover/global-note:placeholder:text-stone-200/50 transition-colors"
                    spellCheck={false}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
        
        {!infiniteScrollMode && <ReaderPagination />}
        
        <div className="h-24" />
      </div>

      <ReadingProgress onOpenNotes={() => setIsNotesOpen(true)} />
      <PageTurnEffect trigger={pageTurnTrigger} />
      <NotesReviewModal isOpen={isNotesOpen} onClose={() => setIsNotesOpen(false)} />
      <ZenTimer />
      <AIChatSidebar />
    </div>
  );
};
