import React, { useState } from 'react';
import { useReaderStore } from '../store/useReaderStore';
import { motion } from 'motion/react';
import { BookOpen, Type, FileText } from 'lucide-react';

export const WelcomeScreen = () => {
  const [inputText, setInputText] = useState('');
  const setRawText = useReaderStore((state) => state.setRawText);

  const handleStart = () => {
    if (!inputText.trim()) return;
    setRawText(inputText);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center max-w-3xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="w-full space-y-10"
      >
        <div className="space-y-4">
          <div className="flex justify-center mb-6">
            <div className="p-5 bg-white/50 backdrop-blur-xl rounded-3xl shadow-xl shadow-stone-200/50 border border-white/60">
              <BookOpen className="w-12 h-12 text-stone-500" strokeWidth={1.5} />
            </div>
          </div>
          <h1 className="text-5xl font-serif italic tracking-tight text-stone-700">
            Focus Reader
          </h1>
        </div>

        <div className="w-full bg-white/40 backdrop-blur-md rounded-3xl shadow-2xl shadow-stone-200/50 p-2 border border-white/60">
          <textarea
            className="w-full h-64 p-6 bg-transparent border-none resize-none focus:ring-0 text-stone-600 text-lg leading-relaxed placeholder:text-stone-300 font-sans"
            placeholder="在此粘贴您想要阅读的文章内容..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
          />
          <div className="flex justify-between items-center px-6 pb-6 pt-2 border-t border-white/30">
            <span className="text-xs text-stone-400 font-mono">
              {inputText.length} 字
            </span>
            <button
              onClick={handleStart}
              disabled={!inputText.trim()}
              className="px-8 py-3 bg-stone-700 hover:bg-stone-800 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-2xl font-medium transition-all transform active:scale-95 shadow-lg shadow-stone-300/50 flex items-center gap-2"
            >
              <FileText className="w-4 h-4" />
              开始阅读
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
