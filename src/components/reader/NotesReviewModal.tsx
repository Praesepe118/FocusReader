import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Edit3, Quote, List, FileText } from 'lucide-react';
import { useReaderStore } from '../../store/useReaderStore';
import { cn } from '../../lib/utils';

interface NotesReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotesReviewModal = ({ isOpen, onClose }: NotesReviewModalProps) => {
  const { lines, currentLineIndex, updateLineNote, setCurrentLineIndex, globalNote, setGlobalNote } = useReaderStore();
  const [viewMode, setViewMode] = useState<'lines' | 'global'>('lines');

  // Filter lines that have notes
  const existingNotes = lines.filter(line => line.note && line.note.trim().length > 0);

  // Include current line if it doesn't have a note
  const currentLine = lines[currentLineIndex];
  const hasCurrentLineNote = currentLine?.note && currentLine.note.trim().length > 0;

  const notes = hasCurrentLineNote
    ? existingNotes
    : [currentLine, ...existingNotes].filter(Boolean);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-stone-900/10 backdrop-blur-sm z-[9998]"
          />

          {/* Modal Container */}
          <div className="fixed inset-0 flex items-center justify-center z-[9999] pointer-events-none p-4 md:p-12">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="w-full max-w-4xl h-full max-h-[80vh] bg-stone-100/80 backdrop-blur-2xl shadow-2xl rounded-2xl border border-white/60 overflow-hidden pointer-events-auto flex flex-col relative"
            >
              {/* Header */}
              <div className="flex justify-between items-center p-4 md:p-6 border-b border-stone-200/50 bg-white/40 backdrop-blur-md">
                <div className="flex items-center gap-4">
                  <h2 className="text-xl md:text-2xl font-serif italic text-stone-800 flex items-center gap-2 md:gap-3">
                    <Edit3 size={20} className="text-stone-400" />
                    随笔集
                  </h2>
                  <div className="flex bg-stone-200/50 p-1 rounded-lg ml-4">
                    <button
                      onClick={() => setViewMode('lines')}
                      className={cn(
                        "px-3 py-1.5 rounded-md text-xs md:text-sm font-medium transition-all flex items-center gap-2",
                        viewMode === 'lines' ? "bg-white text-stone-700 shadow-sm" : "text-stone-500 hover:text-stone-700"
                      )}
                    >
                      <List size={14} /> 行内笔记
                    </button>
                    <button
                      onClick={() => setViewMode('global')}
                      className={cn(
                        "px-3 py-1.5 rounded-md text-xs md:text-sm font-medium transition-all flex items-center gap-2",
                        viewMode === 'global' ? "bg-white text-stone-700 shadow-sm" : "text-stone-500 hover:text-stone-700"
                      )}
                    >
                      <FileText size={14} /> 全局笔记
                    </button>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-stone-200/50 rounded-full text-stone-400 transition-colors cursor-pointer"
                >
                  <X size={20} strokeWidth={1.5} />
                </button>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8 scroll-smooth">
                {viewMode === 'global' ? (
                  <div className="h-full bg-white/60 backdrop-blur-md rounded-xl p-6 border border-white/50 shadow-inner">
                    <textarea
                      value={globalNote}
                      onChange={(e) => setGlobalNote(e.target.value)}
                      placeholder="在这里写下关于整篇文章的整体想法..."
                      className="w-full h-full bg-transparent border-none resize-none outline-none font-hand text-stone-700 text-lg leading-relaxed"
                      spellCheck={false}
                    />
                  </div>
                ) : notes.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-stone-300 space-y-4">
                        <Edit3 size={48} strokeWidth={1} />
                        <p className="font-serif italic">暂无随笔，在阅读时记录下你的想法...</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-6">
                        {notes.map((line, index) => (
                            <motion.div
                                key={line.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="group bg-white/60 backdrop-blur-md p-4 md:p-6 rounded-xl shadow-sm border border-white/50 hover:bg-white/80 hover:shadow-md transition-all duration-300"
                            >
                                {/* Original Text Context */}
                                <div className="flex gap-3 md:gap-4 mb-4">
                                    <Quote size={16} className="text-stone-300 shrink-0 mt-1" />
                                    <p
                                        className="text-stone-400 text-xs md:text-sm font-serif italic leading-relaxed line-clamp-2 hover:line-clamp-none transition-all cursor-pointer"
                                        onClick={() => {
                                            // Find index and jump
                                            const idx = lines.findIndex(l => l.id === line.id);
                                            if (idx !== -1) {
                                                setCurrentLineIndex(idx);
                                                onClose();
                                            }
                                        }}
                                        title="点击跳转到原文"
                                    >
                                        {line.text}
                                    </p>
                                </div>

                                {/* Note Content */}
                                <div className="pl-6 md:pl-8 relative">
                                    <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-stone-200" />
                                    <textarea
                                        value={line.note || ''}
                                        onChange={(e) => updateLineNote(line.id, e.target.value)}
                                        className="w-full bg-transparent border-none resize-none outline-none p-0 font-hand text-stone-700 text-sm md:text-base leading-relaxed"
                                        rows={Math.max(2, Math.ceil((line.note || '').length / 30))}
                                        placeholder="在这里写下你的想法..."
                                    />
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};
