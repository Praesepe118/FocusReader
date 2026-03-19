import React from 'react';
import { ChevronRight } from 'lucide-react';
import { useReaderStore } from '../../store/useReaderStore';

export const ReaderPagination = () => {
  const {
    lines,
    currentLineIndex,
    setCurrentLineIndex,
    linesPerPage,
    mobileMode
  } = useReaderStore();

  const effectiveLinesPerPage = mobileMode ? 1 : linesPerPage;
  const currentPage = Math.floor(currentLineIndex / effectiveLinesPerPage);
  const endLineIndex = (currentPage + 1) * effectiveLinesPerPage;

  if (mobileMode) return null;

  return (
    <div className="max-w-2xl mx-auto flex justify-between items-center text-stone-400 text-sm pointer-events-auto px-4">
      <button
        onClick={(e) => { e.stopPropagation(); setCurrentLineIndex(Math.max(0, (currentPage - 1) * effectiveLinesPerPage)); }}
        disabled={currentPage === 0}
        className="flex items-center gap-1 hover:text-stone-600 disabled:opacity-30 disabled:hover:text-stone-400 transition-colors cursor-pointer px-4 py-2"
      >
        上一页
      </button>
      <span className="font-mono text-xs opacity-50">
        {currentPage + 1} / {Math.ceil(lines.length / effectiveLinesPerPage)}
      </span>
      <button
        onClick={(e) => { e.stopPropagation(); setCurrentLineIndex(Math.min(lines.length - 1, (currentPage + 1) * effectiveLinesPerPage)); }}
        disabled={endLineIndex >= lines.length}
        className="flex items-center gap-1 hover:text-stone-600 disabled:opacity-30 disabled:hover:text-stone-400 transition-colors cursor-pointer px-4 py-2"
      >
        下一页 <ChevronRight size={14} />
      </button>
    </div>
  );
};
