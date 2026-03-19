import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';
import {
  Type,
  AlignJustify,
  MoveHorizontal, 
  Trash2, 
  X,
  RotateCcw,
  PenTool,
  LogOut,
  Star,
  Eye,
  FileText,
  Infinity as InfinityIcon,
  Smartphone,
  Download,
  Maximize
} from 'lucide-react';
import { useReaderStore } from '../../store/useReaderStore';
import { useAuthStore } from '../../store/useAuthStore';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenExport?: () => void;
}

export const SettingsModal = ({ isOpen, onClose, onOpenExport }: SettingsModalProps) => {
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
    showReadStar,
    toggleShowReadStar,
    browseMode,
    toggleBrowseMode,
    globalNoteMode,
    toggleGlobalNoteMode,
    infiniteScrollMode,
    toggleInfiniteScrollMode,
    mobileMode,
    toggleMobileMode,
    reset
  } = useReaderStore();
  
  const { signOut } = useAuthStore();

  const [confirmingReset, setConfirmingReset] = React.useState(false);
  const [isFullscreen, setIsFullscreen] = React.useState(false);

  React.useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

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

  const handleSignOut = () => {
    signOut();
    onClose();
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
          <div className={cn(
            "fixed inset-0 flex items-center justify-center z-[9999] pointer-events-none",
            mobileMode ? "p-0" : "p-4"
          )}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className={cn(
                "bg-white/90 backdrop-blur-xl shadow-2xl border border-white/50 overflow-hidden pointer-events-auto flex flex-col",
                mobileMode ? "w-full h-full rounded-none" : "w-full max-w-md rounded-2xl max-h-[90vh]"
              )}
            >
              {/* Header */}
              <div className="flex justify-between items-center p-6 border-b border-stone-100 flex-shrink-0 bg-white">
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
              <div className="p-6 space-y-8 overflow-y-auto flex-1 bg-white/50">
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
                      max="60"
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

                {/* Mobile Mode Toggle */}
                <section>
                  <div className="flex justify-between items-center bg-stone-50 p-3 rounded-xl border border-stone-100">
                    <div className="flex items-center gap-3">
                      <Smartphone size={16} className="text-stone-400" />
                      <span className="text-sm font-medium text-stone-600">手机模式</span>
                    </div>
                    <button
                      onClick={toggleMobileMode}
                      className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                        mobileMode ? 'bg-stone-700' : 'bg-stone-200'
                      }`}
                    >
                      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                        mobileMode ? 'left-7' : 'left-1'
                      }`} />
                    </button>
                  </div>
                  <p className="text-xs text-stone-400 mt-2 font-light px-1">开启后，一页仅显示一句话，并居中显示，适合手机阅读。</p>
                </section>

                {/* Infinite Scroll Mode Toggle */}
                {!mobileMode && (
                  <section>
                    <div className="flex justify-between items-center bg-stone-50 p-3 rounded-xl border border-stone-100">
                      <div className="flex items-center gap-3">
                        <InfinityIcon size={16} className="text-stone-400" />
                        <span className="text-sm font-medium text-stone-600">无限滚动模式</span>
                      </div>
                      <button
                        onClick={toggleInfiniteScrollMode}
                        className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                          infiniteScrollMode ? 'bg-stone-700' : 'bg-stone-200'
                        }`}
                      >
                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                          infiniteScrollMode ? 'left-7' : 'left-1'
                        }`} />
                      </button>
                    </div>
                    <p className="text-xs text-stone-400 mt-2 font-light px-1">开启后，所有内容将在同一页显示，无需翻页。</p>
                  </section>
                )}

                {/* Lines Per Page */}
                {!infiniteScrollMode && !mobileMode && (
                  <section>
                    <div className="flex justify-between mb-3">
                      <label className="text-sm font-medium text-stone-600">每页行数</label>
                      <span className="text-xs font-mono bg-stone-100 px-2 py-1 rounded text-stone-500">{linesPerPage} 行</span>
                    </div>
                    <div className="bg-stone-50 p-3 rounded-xl border border-stone-100">
                      <input
                        type="range"
                        min="1"
                        max="100"
                        step="1"
                        value={linesPerPage}
                        onChange={(e) => setLinesPerPage(Number(e.target.value))}
                        className="w-full h-1.5 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-stone-600"
                      />
                    </div>
                    <p className="text-xs text-stone-400 mt-2 font-light px-1">减少每页行数有助于减轻阅读压力。</p>
                  </section>
                )}

                {/* Show Notes Toggle */}
                {!mobileMode && (
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
                )}

                {/* Global Note Mode Toggle */}
                {showNotes && !mobileMode && (
                  <section>
                    <div className="flex justify-between items-center bg-stone-50 p-3 rounded-xl border border-stone-100">
                      <div className="flex items-center gap-3">
                        <FileText size={16} className="text-stone-400" />
                        <span className="text-sm font-medium text-stone-600">无极笔记模式</span>
                      </div>
                      <button
                        onClick={toggleGlobalNoteMode}
                        className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                          globalNoteMode ? 'bg-stone-700' : 'bg-stone-200'
                        }`}
                      >
                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                          globalNoteMode ? 'left-7' : 'left-1'
                        }`} />
                      </button>
                    </div>
                    <p className="text-xs text-stone-400 mt-2 font-light px-1">开启后，笔记不再按行分割，而是作为全局笔记显示在右侧。</p>
                  </section>
                )}

                {/* Browse Mode Toggle */}
                <section>
                  <div className="flex justify-between items-center bg-stone-50 p-3 rounded-xl border border-stone-100">
                    <div className="flex items-center gap-3">
                      <Eye size={16} className="text-stone-400" />
                      <span className="text-sm font-medium text-stone-600">浏览模式</span>
                    </div>
                    <button
                      onClick={toggleBrowseMode}
                      className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                        browseMode ? 'bg-stone-700' : 'bg-stone-200'
                      }`}
                    >
                      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                        browseMode ? 'left-7' : 'left-1'
                      }`} />
                    </button>
                  </div>
                  <p className="text-xs text-stone-400 mt-2 font-light px-1">开启后，正文将始终显示为黑色，不再需要鼠标悬浮。</p>
                </section>

                {/* Show Read Star Toggle */}
                <section>
                  <div className="flex justify-between items-center bg-stone-50 p-3 rounded-xl border border-stone-100">
                    <div className="flex items-center gap-3">
                      <Star size={16} className="text-stone-400" />
                      <span className="text-sm font-medium text-stone-600">显示已读标记</span>
                    </div>
                    <button
                      onClick={toggleShowReadStar}
                      className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                        showReadStar ? 'bg-stone-700' : 'bg-stone-200'
                      }`}
                    >
                      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                        showReadStar ? 'left-7' : 'left-1'
                      }`} />
                    </button>
                  </div>
                  <p className="text-xs text-stone-400 mt-2 font-light px-1">开启后，已读的行左侧会显示四角星标记。</p>
                </section>

                {/* Mobile Fullscreen Toggle */}
                {mobileMode && (
                  <section>
                    <div className="flex justify-between items-center bg-stone-50 p-3 rounded-xl border border-stone-100">
                      <div className="flex items-center gap-3">
                        <Maximize size={16} className="text-stone-400" />
                        <span className="text-sm font-medium text-stone-600">全屏模式</span>
                      </div>
                      <button
                        onClick={async () => {
                          try {
                            if (!document.fullscreenElement) {
                              await document.documentElement.requestFullscreen();
                            } else {
                              if (document.exitFullscreen) {
                                await document.exitFullscreen();
                              }
                            }
                          } catch (err) {
                            console.error("Error attempting to toggle fullscreen:", err);
                          }
                        }}
                        className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                          isFullscreen ? 'bg-stone-700' : 'bg-stone-200'
                        }`}
                      >
                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                          isFullscreen ? 'left-7' : 'left-1'
                        }`} />
                      </button>
                    </div>
                  </section>
                )}
              </div>

              {/* Footer / Danger Zone */}
              <div className="p-6 border-t border-stone-100 bg-stone-50/50 space-y-3 flex-shrink-0">
                {mobileMode && onOpenExport && (
                  <button
                    onClick={() => { onClose(); onOpenExport(); }}
                    className="w-full py-3 px-4 bg-white text-stone-600 hover:text-stone-800 hover:bg-stone-100 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2 border border-stone-200 shadow-sm cursor-pointer active:scale-[0.98]"
                  >
                    <Download size={16} />
                    导出内容
                  </button>
                )}
                <button
                  onClick={handleReset}
                  className={`w-full py-3 px-4 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2 border shadow-sm cursor-pointer active:scale-[0.98] ${
                    confirmingReset
                      ? "bg-red-500 text-white border-red-600 hover:bg-red-600"
                      : "bg-white text-stone-500 hover:text-red-500 hover:bg-red-50 border-stone-200 hover:border-red-100"
                  }`}
                >
                  <RotateCcw size={16} className={confirmingReset ? "animate-spin" : "group-hover:-rotate-90 transition-transform"} />
                  {confirmingReset ? "确定要返回主页吗？" : "返回主页 (关闭当前阅读)"}
                </button>
                <button
                  onClick={handleSignOut}
                  className="w-full py-3 px-4 bg-white text-stone-500 hover:text-stone-700 hover:bg-stone-100 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2 border border-stone-200 shadow-sm cursor-pointer active:scale-[0.98]"
                >
                  <LogOut size={16} className="group-hover:scale-110 transition-transform" />
                  退出登录
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};
