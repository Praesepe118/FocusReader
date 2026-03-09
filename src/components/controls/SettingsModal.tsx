import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Type, 
  AlignJustify, 
  MoveHorizontal, 
  Trash2, 
  X,
  RotateCcw,
  PenTool
} from 'lucide-react';
import { useReaderStore } from '../../store/useReaderStore';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal = ({ isOpen, onClose }: SettingsModalProps) => {
  const {
    fontSize,
    setFontSize,
    lineHeight,
    setLineHeight,
    letterSpacing,
    setLetterSpacing,
    linesPerPage,
    setLinesPerPage,
    showNotes,
    toggleShowNotes,
    reset
  } = useReaderStore();

  const [confirmingReset, setConfirmingReset] = React.useState(false);

  const handleReset = () => {
    if (confirmingReset) {
      reset();
      onClose();
    } else {
      setConfirmingReset(true);
      // Auto-reset confirmation state after 3 seconds if not clicked
      setTimeout(() => setConfirmingReset(false), 3000);
    }
  };

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
            className="fixed inset-0 bg-stone-900/20 backdrop-blur-sm z-[9998]"
          />
          
          {/* Modal Container */}
          <div className="fixed inset-0 flex items-center justify-center z-[9999] pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="w-full max-w-md bg-white/90 backdrop-blur-xl shadow-2xl rounded-2xl border border-white/50 overflow-hidden pointer-events-auto mx-4"
            >
              {/* Header */}
              <div className="flex justify-between items-center p-6 border-b border-stone-100">
                <h2 className="text-xl font-serif italic text-stone-800 flex items-center gap-2">
                  <RotateCcw size={18} className="text-stone-400" />
                  阅读设置
                </h2>
                <button 
                  onClick={onClose}
                  className="p-2 hover:bg-stone-100 rounded-full text-stone-400 transition-colors cursor-pointer"
                >
                  <X size={20} strokeWidth={1.5} />
                </button>
              </div>

              {/* Body */}
              <div className="p-6 space-y-8 max-h-[60vh] overflow-y-auto">
                {/* Font Size */}
                <section>
                  <div className="flex justify-between mb-3">
                    <label className="text-sm font-medium text-stone-600">字体大小</label>
                    <span className="text-xs font-mono bg-stone-100 px-2 py-1 rounded text-stone-500">{fontSize}px</span>
                  </div>
                  <div className="flex items-center gap-3 bg-stone-50 p-3 rounded-xl border border-stone-100">
                    <Type size={14} className="text-stone-400" />
                    <input
                      type="range"
                      min="14"
                      max="32"
                      step="1"
                      value={fontSize}
                      onChange={(e) => setFontSize(Number(e.target.value))}
                      className="flex-1 h-1.5 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-stone-600"
                    />
                    <Type size={20} className="text-stone-500" />
                  </div>
                </section>

                {/* Line Height */}
                <section>
                  <div className="flex justify-between mb-3">
                    <label className="text-sm font-medium text-stone-600">行间距</label>
                    <span className="text-xs font-mono bg-stone-100 px-2 py-1 rounded text-stone-500">{lineHeight}</span>
                  </div>
                  <div className="flex items-center gap-3 bg-stone-50 p-3 rounded-xl border border-stone-100">
                    <AlignJustify size={14} className="text-stone-400" />
                    <input
                      type="range"
                      min="1.5"
                      max="3.0"
                      step="0.1"
                      value={lineHeight}
                      onChange={(e) => setLineHeight(Number(e.target.value))}
                      className="flex-1 h-1.5 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-stone-600"
                    />
                    <AlignJustify size={20} className="text-stone-500" />
                  </div>
                </section>

                {/* Letter Spacing */}
                <section>
                  <div className="flex justify-between mb-3">
                    <label className="text-sm font-medium text-stone-600">字间距</label>
                    <span className="text-xs font-mono bg-stone-100 px-2 py-1 rounded text-stone-500">{letterSpacing}em</span>
                  </div>
                  <div className="flex items-center gap-3 bg-stone-50 p-3 rounded-xl border border-stone-100">
                    <MoveHorizontal size={14} className="text-stone-400" />
                    <input
                      type="range"
                      min="0"
                      max="0.5"
                      step="0.01"
                      value={letterSpacing}
                      onChange={(e) => setLetterSpacing(Number(e.target.value))}
                      className="flex-1 h-1.5 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-stone-600"
                    />
                    <MoveHorizontal size={20} className="text-stone-500" />
                  </div>
                </section>

                {/* Lines Per Page */}
                <section>
                  <div className="flex justify-between mb-3">
                    <label className="text-sm font-medium text-stone-600">每页行数</label>
                    <span className="text-xs font-mono bg-stone-100 px-2 py-1 rounded text-stone-500">{linesPerPage} 行</span>
                  </div>
                  <div className="bg-stone-50 p-3 rounded-xl border border-stone-100">
                    <input
                      type="range"
                      min="1"
                      max="20"
                      step="1"
                      value={linesPerPage}
                      onChange={(e) => setLinesPerPage(Number(e.target.value))}
                      className="w-full h-1.5 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-stone-600"
                    />
                  </div>
                  <p className="text-xs text-stone-400 mt-2 font-light px-1">减少每页行数有助于减轻阅读压力。</p>
                </section>

                {/* Show Notes Toggle */}
                <section>
                  <div className="flex justify-between items-center bg-stone-50 p-3 rounded-xl border border-stone-100">
                    <div className="flex items-center gap-3">
                      <PenTool size={16} className="text-stone-400" />
                      <span className="text-sm font-medium text-stone-600">显示随笔区</span>
                    </div>
                    <button
                      onClick={toggleShowNotes}
                      className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                        showNotes ? 'bg-stone-700' : 'bg-stone-200'
                      }`}
                    >
                      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                        showNotes ? 'left-7' : 'left-1'
                      }`} />
                    </button>
                  </div>
                  <p className="text-xs text-stone-400 mt-2 font-light px-1">开启后，鼠标悬浮在行右侧即可输入随笔。</p>
                </section>
              </div>

              {/* Footer / Danger Zone */}
              <div className="p-6 border-t border-stone-100 bg-stone-50/50">
                <button
                  onClick={handleReset}
                  className={`w-full py-3 px-4 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2 border shadow-sm cursor-pointer active:scale-[0.98] ${
                    confirmingReset 
                      ? "bg-red-500 text-white border-red-600 hover:bg-red-600" 
                      : "bg-white text-stone-500 hover:text-red-500 hover:bg-red-50 border-stone-200 hover:border-red-100"
                  }`}
                >
                  <Trash2 size={16} className={confirmingReset ? "animate-pulse" : "group-hover:scale-110 transition-transform"} />
                  {confirmingReset ? "确定要清空吗？再次点击确认" : "清空内容并重置"}
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};
