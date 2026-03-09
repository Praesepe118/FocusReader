import React from 'react';
import { ChevronRight } from 'lucide-react';
import { useReaderStore } from '../../store/useReaderStore';

export const ReaderPagination = () => {
  const { 
    lines, 
    currentLineIndex, 
    setCurrentLineIndex, 
    linesPerPage 
  } = useReaderStore();

  const currentPage = Math.floor(currentLineIndex / linesPerPage);
  const endLineIndex = (currentPage + 1) * linesPerPage;

  return (
    <div className="max-w-2xl mx-auto mt-12 flex justify-between items-center text-stone-400 text-sm">
      <button 
        onClick={() => setCurrentLineIndex(Math.max(0, (currentPage - 1) * linesPerPage))}
        disabled={currentPage === 0}
        className="flex items-center gap-1 hover:text-stone-600 disabled:opacity-30 disabled:hover:text-stone-400 transition-colors"
      >
        上一页
      </button>
      <span className="font-mono text-xs opacity-50">
        {currentPage + 1} / {Math.ceil(lines.length / linesPerPage)}
      </span>
      <button 
        onClick={() => setCurrentLineIndex(Math.min(lines.length - 1, (currentPage + 1) * linesPerPage))}
        disabled={endLineIndex >= lines.length}
        className="flex items-center gap-1 hover:text-stone-600 disabled:opacity-30 disabled:hover:text-stone-400 transition-colors"
      >
        下一页 <ChevronRight size={14} />
      </button>
    </div>
  );
};
