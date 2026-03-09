import React, { useState } from 'react';
import { useReaderStore } from '../store/useReaderStore';
import { Download, Copy, X, Check, FileText, StickyNote } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ExportModal = ({ isOpen, onClose }: ExportModalProps) => {
  const { lines } = useReaderStore();
  const [exportType, setExportType] = useState<'all' | 'notes'>('all');
  const [includeOriginal, setIncludeOriginal] = useState(true);
  const [includeNotes, setIncludeNotes] = useState(true);
  const [includeMarks, setIncludeMarks] = useState(true);
  const [range, setRange] = useState<'all' | 'selection'>('all');
  const [selectedLines, setSelectedLines] = useState<Set<string>>(new Set(lines.map(l => l.id)));
  const [copied, setCopied] = useState(false);

  // Reset selection when lines change
  React.useEffect(() => {
    if (range === 'all') {
      setSelectedLines(new Set(lines.map(l => l.id)));
    }
  }, [lines, range]);

  const toggleLineSelection = (id: string) => {
    const newSet = new Set(selectedLines);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedLines(newSet);
    if (range === 'all') setRange('selection');
  };

  const generateContent = () => {
    let content = '';
    const linesToProcess = lines.filter(l => selectedLines.has(l.id));

    if (exportType === 'notes') {
      // Only export notes
      linesToProcess.forEach(line => {
        if (line.note && line.note.trim()) {
          content += `[随笔] ${line.note}\n`;
          if (includeOriginal) {
             content += `> 原文：${line.text}\n`;
          }
          content += '\n';
        }
      });
      if (!content) content = "没有找到随笔内容。";
    } else {
      // Export all content
      linesToProcess.forEach(line => {
        let lineText = line.text;
        
        // Add marks
        if (includeMarks && line.isConfusing) {
          lineText = `[?] ${lineText}`;
        }

        content += lineText + '\n';

        // Add notes inline
        if (includeNotes && line.note && line.note.trim()) {
          content += `    └── [随笔] ${line.note}\n`;
        }
      });
    }
    return content;
  };

  const handleCopy = () => {
    const content = generateContent();
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const content = generateContent();
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `focus-reader-export-${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-stone-100/20 backdrop-blur-[2px] z-50"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 m-auto w-full max-w-2xl h-[80vh] bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden border border-white/50"
          >
            {/* Header */}
            <div className="flex justify-between items-center p-6 border-b border-stone-100">
              <h2 className="text-xl font-serif italic text-stone-800">导出内容</h2>
              <button onClick={onClose} className="p-2 hover:bg-stone-100 rounded-full text-stone-500 transition-colors">
                <X size={20} strokeWidth={1.5} />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              {/* Export Type */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-stone-500">导出类型</label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setExportType('all')}
                    className={cn(
                      "p-4 rounded-xl border text-left transition-all",
                      exportType === 'all' 
                        ? "border-stone-400 bg-stone-50 ring-1 ring-stone-400" 
                        : "border-stone-200 hover:border-stone-300"
                    )}
                  >
                    <div className="flex items-center gap-2 mb-1 font-semibold text-stone-700">
                      <FileText size={18} /> 全部内容
                    </div>
                    <p className="text-xs text-stone-400">导出正文、随笔和标记</p>
                  </button>
                  <button
                    onClick={() => setExportType('notes')}
                    className={cn(
                      "p-4 rounded-xl border text-left transition-all",
                      exportType === 'notes' 
                        ? "border-stone-400 bg-stone-50 ring-1 ring-stone-400" 
                        : "border-stone-200 hover:border-stone-300"
                    )}
                  >
                    <div className="flex items-center gap-2 mb-1 font-semibold text-stone-700">
                      <StickyNote size={18} /> 仅随笔
                    </div>
                    <p className="text-xs text-stone-400">只导出有随笔的段落</p>
                  </button>
                </div>
              </div>

              {/* Options */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-stone-500">包含内容</label>
                <div className="flex flex-wrap gap-3">
                  {exportType === 'notes' && (
                    <button
                      onClick={() => setIncludeOriginal(!includeOriginal)}
                      className={cn(
                        "px-3 py-1.5 rounded-lg text-sm border transition-colors",
                        includeOriginal ? "bg-stone-100 border-stone-300 text-stone-700" : "border-stone-200 text-stone-400"
                      )}
                    >
                      包含原文
                    </button>
                  )}
                  {exportType === 'all' && (
                    <>
                      <button
                        onClick={() => setIncludeNotes(!includeNotes)}
                        className={cn(
                          "px-3 py-1.5 rounded-lg text-sm border transition-colors",
                          includeNotes ? "bg-stone-100 border-stone-300 text-stone-700" : "border-stone-200 text-stone-400"
                        )}
                      >
                        包含随笔
                      </button>
                      <button
                        onClick={() => setIncludeMarks(!includeMarks)}
                        className={cn(
                          "px-3 py-1.5 rounded-lg text-sm border transition-colors",
                          includeMarks ? "bg-stone-100 border-stone-300 text-stone-700" : "border-stone-200 text-stone-400"
                        )}
                      >
                        包含[?]标记
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Selection Preview */}
              <div className="space-y-3 flex-1 min-h-0 flex flex-col">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium text-stone-500">
                    选择导出范围 ({selectedLines.size} 行)
                  </label>
                  <div className="space-x-2">
                    <button 
                      onClick={() => { setSelectedLines(new Set(lines.map(l => l.id))); setRange('all'); }}
                      className="text-xs text-stone-600 hover:underline"
                    >
                      全选
                    </button>
                    <button 
                      onClick={() => { setSelectedLines(new Set()); setRange('selection'); }}
                      className="text-xs text-stone-400 hover:underline"
                    >
                      清空
                    </button>
                  </div>
                </div>
                <div className="flex-1 border border-stone-200 rounded-xl overflow-y-auto p-2 bg-stone-50/50">
                  {lines.map((line, index) => (
                    <div 
                      key={line.id}
                      onClick={() => toggleLineSelection(line.id)}
                      className={cn(
                        "p-2 rounded cursor-pointer flex gap-3 text-sm hover:bg-white transition-colors",
                        selectedLines.has(line.id) ? "opacity-100" : "opacity-40 grayscale"
                      )}
                    >
                      <div className={cn(
                        "w-4 h-4 mt-0.5 rounded border flex items-center justify-center flex-none",
                        selectedLines.has(line.id) ? "bg-stone-500 border-stone-500 text-white" : "border-stone-300"
                      )}>
                        {selectedLines.has(line.id) && <Check size={10} />}
                      </div>
                      <div className="flex-1">
                        <p className="line-clamp-1 text-stone-700">{line.text}</p>
                        {line.note && <p className="text-xs text-stone-500 mt-0.5 font-hand">随笔: {line.note}</p>}
                        {line.isConfusing && <span className="text-[10px] text-amber-600 bg-amber-50 px-1 rounded border border-amber-100">不懂</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-stone-100 bg-stone-50/50 flex justify-end gap-3">
              <button
                onClick={handleCopy}
                className="px-4 py-2 rounded-xl text-stone-600 hover:bg-stone-200 transition-colors flex items-center gap-2 font-medium"
              >
                {copied ? <Check size={18} /> : <Copy size={18} />}
                {copied ? '已复制' : '复制文本'}
              </button>
              <button
                onClick={handleDownload}
                className="px-6 py-2 rounded-xl bg-stone-700 text-white hover:bg-stone-800 transition-colors flex items-center gap-2 font-medium shadow-lg shadow-stone-300/50"
              >
                <Download size={18} />
                导出文件
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
