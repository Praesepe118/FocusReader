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
import { cn } from '../lib/utils';

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
    isFocusModeActive,
    mobileMode,
    setMobileNavVisible,
    isNotesReviewOpen,
    setIsNotesReviewOpen
  } = useReaderStore();

  const containerRef = useRef<HTMLDivElement>(null);

  // Calculate pagination
  const effectiveLinesPerPage = mobileMode ? 1 : linesPerPage;
  const currentPage = infiniteScrollMode && !mobileMode ? 0 : Math.floor(currentLineIndex / effectiveLinesPerPage);
  const startLineIndex = infiniteScrollMode && !mobileMode ? 0 : currentPage * effectiveLinesPerPage;
  const endLineIndex = infiniteScrollMode && !mobileMode ? lines.length : startLineIndex + effectiveLinesPerPage;
  const visibleLines = infiniteScrollMode && !mobileMode ? lines : lines.slice(startLineIndex, endLineIndex);

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
    if ((!infiniteScrollMode || mobileMode) && containerRef.current) {
      containerRef.current.scrollTop = 0;
    }
  }, [currentPage, infiniteScrollMode, mobileMode]);

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
         if (infiniteScrollMode && !mobileMode) {
            const nextIndex = Math.min(lines.length - 1, currentLineIndex + effectiveLinesPerPage);
            setCurrentLineIndex(nextIndex);
         } else {
            const nextPageStart = (currentPage + 1) * effectiveLinesPerPage;
            if (nextPageStart < lines.length) {
               setCurrentLineIndex(nextPageStart);
            }
         }
      } else if (e.key === 'ArrowLeft') {
         e.preventDefault();
         if (infiniteScrollMode && !mobileMode) {
            const prevIndex = Math.max(0, currentLineIndex - effectiveLinesPerPage);
            setCurrentLineIndex(prevIndex);
         } else {
            const prevPageStart = (currentPage - 1) * effectiveLinesPerPage;
            if (prevPageStart >= 0) {
               setCurrentLineIndex(prevPageStart);
            }
         }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentLineIndex, lines.length, setCurrentLineIndex, currentPage, effectiveLinesPerPage, infiniteScrollMode, mobileMode]);

  // Touch navigation for mobile mode
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null || !mobileMode) return;
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    const diffX = touchStartX.current - touchEndX;
    const diffY = touchStartY.current - touchEndY;
    
    // Check if it's a tap in the bottom third
    if (Math.abs(diffX) < 10 && Math.abs(diffY) < 10) {
      const screenHeight = window.innerHeight;
      if (touchEndY > screenHeight * (2/3)) {
        setMobileNavVisible(true);
      } else {
        setMobileNavVisible(false);
      }
    } else {
      setMobileNavVisible(false);
    }

    // Swipe left (next)
    if (diffX > 50 && Math.abs(diffX) > Math.abs(diffY)) {
      // Mark current line as read before moving to next
      const currentLine = lines[currentLineIndex];
      if (currentLine && !currentLine.isRead) {
        useReaderStore.getState().toggleLineRead(currentLine.id);
      }

      const nextPageStart = (currentPage + 1) * effectiveLinesPerPage;
      if (nextPageStart < lines.length) {
         setCurrentLineIndex(nextPageStart);
      } else if (infiniteScrollMode || mobileMode) {
          const nextIndex = Math.min(lines.length - 1, currentLineIndex + 1);
          setCurrentLineIndex(nextIndex);
      }
    }
    // Swipe right (prev)
    else if (diffX < -50 && Math.abs(diffX) > Math.abs(diffY)) {
      const prevPageStart = (currentPage - 1) * effectiveLinesPerPage;
      if (prevPageStart >= 0) {
         setCurrentLineIndex(prevPageStart);
      } else if (infiniteScrollMode || mobileMode) {
          const prevIndex = Math.max(0, currentLineIndex - 1);
          setCurrentLineIndex(prevIndex);
      }
    }
    touchStartX.current = null;
    touchStartY.current = null;
  };

  const handleContainerClick = (e: React.MouseEvent) => {
    // Ignore clicks on interactive elements like buttons
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('input') || target.closest('textarea') || target.closest('.group\\/note') || target.closest('.group\\/global-note')) {
      return;
    }

    // Allow clicks on paragraph text itself to propagate to container for navigation
    // This removes the restriction that only clicking blank space triggers navigation

    // Ignore if text is selected
    if (window.getSelection()?.toString()) {
      return;
    }

    const screenWidth = window.innerWidth;
    const clickX = e.clientX;
    const navZoneWidth = screenWidth / 3;

    if (clickX < navZoneWidth) {
      // Clicked left zone
      const prevPageStart = (currentPage - 1) * effectiveLinesPerPage;
      if (prevPageStart >= 0) {
         setCurrentLineIndex(prevPageStart);
      } else if (infiniteScrollMode) {
          const prevIndex = Math.max(0, currentLineIndex - 1);
          setCurrentLineIndex(prevIndex);
      }
    } else if (clickX > screenWidth - navZoneWidth) {
      // Clicked right zone
      // Mark current line as read before moving to next
      const currentLine = lines[currentLineIndex];
      if (currentLine && !currentLine.isRead) {
        useReaderStore.getState().toggleLineRead(currentLine.id);
      }

      const nextPageStart = (currentPage + 1) * effectiveLinesPerPage;
      if (nextPageStart < lines.length) {
         setCurrentLineIndex(nextPageStart);
      } else if (infiniteScrollMode) {
          const nextIndex = Math.min(lines.length - 1, currentLineIndex + 1);
          setCurrentLineIndex(nextIndex);
      }
    }
  };

  if (lines.length === 0) return null;

  return (
    <div 
      className="flex flex-col h-full relative overflow-hidden bg-stone-50/30"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onClick={handleContainerClick}
    >
      {/* Main Content Area */}
      <div
        ref={containerRef}
        className={cn(
          "flex-1 overflow-y-auto px-4 scroll-smooth no-scrollbar transition-all duration-300 flex flex-col relative z-0",
          mobileMode ? "py-4" : "py-8 pt-20"
        )}
      >
        <div className={cn(
          "w-full relative flex-1 flex flex-col pointer-events-none px-4",
          mobileMode ? "items-center" : "min-h-[60vh] pb-8"
        )}>
          <AnimatePresence mode='wait'>
            <motion.div
              key={currentPage}
              initial={{ opacity: 0, y: mobileMode ? 10 : 0 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: mobileMode ? -10 : 0 }}
              transition={{ duration: 0.3 }}
              className={cn(
                "relative z-0 w-full pointer-events-auto flex-none",
                mobileMode ? "max-w-lg text-center my-auto" : "space-y-8 pb-16"
              )}
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
          {showNotes && globalNoteMode && !mobileMode && (
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

          {mobileMode && <div className="flex-none h-4" />}

          {/* Pagination - Move INSIDE the relative wrapper so it's guaranteed to be seen at the bottom of the content */}
          {(!infiniteScrollMode && !mobileMode) && (
            <div className="flex-none mt-16 pb-16 z-50 pointer-events-auto w-full">
              <ReaderPagination />
            </div>
          )}
        </div>

        {!mobileMode && <div className="h-24" />}
      </div>

      <ReadingProgress onOpenNotes={() => setIsNotesReviewOpen(true)} />
      {!mobileMode && <PageTurnEffect trigger={pageTurnTrigger} />}
      <NotesReviewModal isOpen={isNotesReviewOpen} onClose={() => setIsNotesReviewOpen(false)} />
      <ZenTimer />
      <AIChatSidebar />
    </div>
  );
};
