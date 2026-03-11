import React, { useState } from 'react';
import { useReaderStore } from '../store/useReaderStore';
import { useAuthStore } from '../store/useAuthStore';
import { motion, AnimatePresence } from 'motion/react';
import { BookOpen, Type, FileText, LogOut, Zap, Library } from 'lucide-react';
import { Bookshelf } from './Bookshelf';

export const WelcomeScreen = () => {
  const [inputText, setInputText] = useState('');
  const [activeTab, setActiveTab] = useState<'quick' | 'bookshelf'>('bookshelf');
  const setRawText = useReaderStore((state) => state.setRawText);
  const { signOut, user } = useAuthStore();

  const handleStart = () => {
    if (!inputText.trim()) return;
    setRawText(inputText);
  };

  return (
    <div className="flex flex-col min-h-screen bg-stone-50 p-6 relative">
      {/* Header */}
      <div className="absolute top-6 right-6 flex items-center gap-4 z-50">
        <span className="text-sm text-stone-500 bg-white/50 px-3 py-1.5 rounded-full border border-stone-200 backdrop-blur-sm">
          {user?.email}
        </span>
        <button
          onClick={() => signOut()}
          className="p-2 text-stone-400 hover:text-stone-600 hover:bg-stone-200 bg-white/50 border border-stone-200 backdrop-blur-sm rounded-full transition-colors"
          title="退出登录"
        >
          <LogOut size={18} />
        </button>
      </div>
      
      <div className="w-full max-w-5xl mx-auto mt-12 flex flex-col items-center">
        {/* Logo & Title */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center mb-10"
        >
          <div className="p-4 bg-white rounded-2xl shadow-sm border border-stone-100 mb-4">
            <BookOpen className="w-10 h-10 text-stone-600" strokeWidth={1.5} />
          </div>
          <h1 className="text-4xl font-serif italic tracking-tight text-stone-800">
            Focus Reader
          </h1>
          <p className="text-stone-500 mt-2 font-light">沉浸式阅读与 AI 思考助手</p>
        </motion.div>

        {/* Tabs */}
        <div className="flex bg-stone-200/50 p-1.5 rounded-2xl mb-8 backdrop-blur-sm">
          <button
            onClick={() => setActiveTab('bookshelf')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-medium transition-all ${
              activeTab === 'bookshelf' 
                ? 'bg-white text-stone-800 shadow-sm' 
                : 'text-stone-500 hover:text-stone-700 hover:bg-stone-200/50'
            }`}
          >
            <Library size={18} />
            我的书架
          </button>
          <button
            onClick={() => setActiveTab('quick')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-medium transition-all ${
              activeTab === 'quick' 
                ? 'bg-white text-stone-800 shadow-sm' 
                : 'text-stone-500 hover:text-stone-700 hover:bg-stone-200/50'
            }`}
          >
            <Zap size={18} />
            快速阅读
          </button>
        </div>

        {/* Content Area */}
        <div className="w-full">
          <AnimatePresence mode="wait">
            {activeTab === 'bookshelf' ? (
              <motion.div
                key="bookshelf"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <Bookshelf />
              </motion.div>
            ) : (
              <motion.div
                key="quick"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="max-w-3xl mx-auto"
              >
                <div className="w-full bg-white/80 backdrop-blur-md rounded-3xl shadow-xl shadow-stone-200/50 p-2 border border-white">
                  <textarea
                    className="w-full h-64 p-6 bg-transparent border-none resize-none focus:ring-0 text-stone-700 text-lg leading-relaxed placeholder:text-stone-400 font-sans outline-none"
                    placeholder="在此粘贴您想要临时阅读的文章内容... (不会保存到云端书架)"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                  />
                  <div className="flex justify-between items-center px-6 pb-6 pt-2 border-t border-stone-100">
                    <span className="text-xs text-stone-400 font-mono">
                      {inputText.length} 字
                    </span>
                    <button
                      onClick={handleStart}
                      disabled={!inputText.trim()}
                      className="px-8 py-3 bg-stone-800 hover:bg-stone-900 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-2xl font-medium transition-all transform active:scale-95 shadow-md flex items-center gap-2"
                    >
                      <FileText className="w-4 h-4" />
                      开始阅读
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
