import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Lock, Play } from 'lucide-react';
import { useReaderStore } from '../../store/useReaderStore';

interface FocusModeSetupProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FocusModeSetup = ({ isOpen, onClose }: FocusModeSetupProps) => {
  const { startFocusMode } = useReaderStore();
  const [duration, setDuration] = useState(25);

  const handleStart = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      }
    } catch (err) {
      console.error("Fullscreen request failed:", err);
    }
    startFocusMode(duration);
    onClose();
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
            className="fixed inset-0 bg-stone-900/40 backdrop-blur-sm z-[9998]"
          />
          <div className="fixed inset-0 flex items-center justify-center z-[9999] pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-sm bg-white rounded-2xl shadow-2xl border border-stone-100 overflow-hidden pointer-events-auto mx-4"
            >
              <div className="p-6 text-center space-y-6">
                <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Lock size={24} />
                </div>
                
                <div>
                  <h2 className="text-xl font-serif text-stone-800 mb-2">沉浸专注模式</h2>
                  <p className="text-sm text-stone-500">
                    开启后将进入全屏，隐藏所有多余界面，且在倒计时结束前无法退出。
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-center gap-4">
                    <button 
                      onClick={() => setDuration(Math.max(5, duration - 5))}
                      className="w-10 h-10 rounded-full bg-stone-100 text-stone-600 hover:bg-stone-200 flex items-center justify-center text-xl"
                    >-</button>
                    <div className="text-3xl font-mono text-stone-800 w-20 text-center">
                      {duration}
                      <span className="text-sm text-stone-400 ml-1">min</span>
                    </div>
                    <button 
                      onClick={() => setDuration(Math.min(120, duration + 5))}
                      className="w-10 h-10 rounded-full bg-stone-100 text-stone-600 hover:bg-stone-200 flex items-center justify-center text-xl"
                    >+</button>
                  </div>
                  
                  <div className="flex gap-2 justify-center">
                    {[15, 25, 45, 60].map(m => (
                      <button
                        key={m}
                        onClick={() => setDuration(m)}
                        className={`px-3 py-1 rounded-full text-xs font-mono transition-colors ${
                          duration === m ? 'bg-amber-100 text-amber-700' : 'bg-stone-50 text-stone-500 hover:bg-stone-100'
                        }`}
                      >
                        {m}m
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-4 flex gap-3">
                  <button
                    onClick={onClose}
                    className="flex-1 py-3 rounded-xl bg-stone-100 text-stone-600 font-medium hover:bg-stone-200 transition-colors"
                  >
                    取消
                  </button>
                  <button
                    onClick={handleStart}
                    className="flex-1 py-3 rounded-xl bg-stone-800 text-white font-medium hover:bg-stone-900 transition-colors flex items-center justify-center gap-2"
                  >
                    <Play size={16} />
                    开始专注
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};
