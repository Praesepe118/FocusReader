import React from 'react';
import { motion } from 'motion/react';
import { 
  Type, 
  AlignJustify, 
  MoveHorizontal, 
  Trash2, 
  X,
  LogOut
} from 'lucide-react';
import { useReaderStore } from '../../store/useReaderStore';
import { useAuthStore } from '../../store/useAuthStore';

interface SettingsPanelProps {
  onClose: () => void;
}

export const SettingsPanel = ({ onClose }: SettingsPanelProps) => {
  const {
    fontSize,
    setFontSize,
    lineHeight,
    setLineHeight,
    letterSpacing,
    setLetterSpacing,
    linesPerPage,
    setLinesPerPage,
    reset
  } = useReaderStore();

  const { signOut } = useAuthStore();

  const handleReset = () => {
    if (window.confirm('确定要清空所有内容并返回首页吗？此操作无法撤销。')) {
      reset();
      onClose();
    }
  };

  const handleSignOut = () => {
    signOut();
    onClose();
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-stone-100/20 backdrop-blur-[2px] z-40"
      />
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className="fixed right-0 top-0 bottom-0 w-80 bg-white/95 backdrop-blur-xl shadow-2xl z-[100] p-6 border-l border-stone-200/50 flex flex-col"
      >
        <div className="flex justify-between items-center mb-8 flex-none">
          <h2 className="text-xl font-serif italic text-stone-800">阅读设置</h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-stone-100 rounded-full text-stone-400 transition-colors cursor-pointer"
          >
            <X size={20} strokeWidth={1.5} />
          </button>
        </div>

        <div className="space-y-8 flex-1 overflow-y-auto pr-2">
          {/* Font Size */}
          <section>
            <div className="flex justify-between mb-3">
              <label className="text-sm font-medium text-stone-600">
                字体大小
              </label>
              <span className="text-xs font-mono bg-stone-100 px-2 py-1 rounded text-stone-500">
                {fontSize}px
              </span>
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
              <label className="text-sm font-medium text-stone-600">
                行间距
              </label>
              <span className="text-xs font-mono bg-stone-100 px-2 py-1 rounded text-stone-500">
                {lineHeight}
              </span>
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
              <label className="text-sm font-medium text-stone-600">
                字间距
              </label>
              <span className="text-xs font-mono bg-stone-100 px-2 py-1 rounded text-stone-500">
                {letterSpacing}em
              </span>
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
              <label className="text-sm font-medium text-stone-600">
                每页行数
              </label>
              <span className="text-xs font-mono bg-stone-100 px-2 py-1 rounded text-stone-500">
                {linesPerPage} 行
              </span>
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
            <p className="text-xs text-stone-400 mt-2 font-light px-1">
              减少每页行数有助于减轻阅读压力。
            </p>
          </section>

          {/* Shortcuts Info */}
          <div className="p-4 bg-stone-50 rounded-xl text-xs text-stone-500 space-y-2 border border-stone-100">
            <p className="font-medium text-stone-700 mb-2">快捷键指南：</p>
            <div className="flex justify-between"><span>上一行 / 下一行</span> <span className="font-mono text-stone-400 bg-white px-1.5 rounded border border-stone-200">↑ / ↓</span></div>
            <div className="flex justify-between"><span>上一页 / 下一页</span> <span className="font-mono text-stone-400 bg-white px-1.5 rounded border border-stone-200">← / →</span></div>
          </div>
        </div>

        {/* Danger Zone - Fixed at bottom */}
        <div className="pt-6 mt-4 border-t border-stone-100 flex-none relative z-10 space-y-3">
          <button
            onClick={handleReset}
            className="w-full py-3 px-4 bg-white text-stone-500 hover:text-red-500 hover:bg-red-50 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2 border border-stone-200 hover:border-red-100 group shadow-sm cursor-pointer"
          >
            <Trash2 size={16} className="group-hover:scale-110 transition-transform" />
            清空内容并重置
          </button>
          <button
            onClick={handleSignOut}
            className="w-full py-3 px-4 bg-white text-stone-500 hover:text-stone-700 hover:bg-stone-100 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2 border border-stone-200 group shadow-sm cursor-pointer"
          >
            <LogOut size={16} className="group-hover:scale-110 transition-transform" />
            退出登录
          </button>
        </div>
      </motion.div>
    </>
  );
};
