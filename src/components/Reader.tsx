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
  } = useReaderStore();

  const [isNotesOpen, setIsNotesOpen] = React.useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  // Calculate pagination
  const currentPage = Math.floor(currentLineIndex / linesPerPage);
  const startLineIndex = currentPage * linesPerPage;
  const endLineIndex = startLineIndex + linesPerPage;
  const visibleLines = lines.slice(startLineIndex, endLineIndex);

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
    if (containerRef.current) {
      containerRef.current.scrollTop = 0;
    }
  }, [currentPage]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
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
         const nextPageStart = (currentPage + 1) * linesPerPage;
         if (nextPageStart < lines.length) {
            setCurrentLineIndex(nextPageStart);
         }
      } else if (e.key === 'ArrowLeft') {
         e.preventDefault();
         const prevPageStart = (currentPage - 1) * linesPerPage;
         if (prevPageStart >= 0) {
            setCurrentLineIndex(prevPageStart);
         }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentLineIndex, lines.length, setCurrentLineIndex, currentPage, linesPerPage]);

  if (lines.length === 0) return null;

  return (
    <div className="flex flex-col h-full relative overflow-hidden bg-stone-50/30">
      {/* Main Content Area */}
      <div 
        ref={containerRef}
        className="flex-1 overflow-y-auto px-4 py-8 scroll-smooth no-scrollbar transition-all duration-300"
      >
        <div className="w-full min-h-[60vh] pb-32">
          <AnimatePresence mode='wait'>
            <motion.div
              key={currentPage}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-8"
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
        </div>
        
        <ReaderPagination />
        
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
