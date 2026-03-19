import React from 'react';
import { ExportModal } from './ExportModal';
import { SettingsModal } from './controls/SettingsModal';
import {
  Settings,
  Download,
  PenTool,
  Sparkles,
  AlignLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useReaderStore } from '../store/useReaderStore';
import { useAIStore } from '../store/useAIStore';
import { FullScreenToggle } from './reader/FullScreenToggle';
import { MobileVerticalProgress } from './reader/MobileVerticalProgress';

export const Controls = () => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [isExportOpen, setIsExportOpen] = React.useState(false);
  const [isMobileProgressOpen, setIsMobileProgressOpen] = React.useState(false);
  const { isFocusModeActive, mobileMode, mobileNavVisible, setMobileNavVisible, setIsNotesReviewOpen } = useReaderStore();
  const { setSidebarOpen } = useAIStore();

  if (mobileMode) {
    return (
      <>
        <AnimatePresence>
          {mobileNavVisible && (
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              className="fixed bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-stone-100/90 backdrop-blur-xl p-2 rounded-2xl shadow-2xl border border-stone-200/50 z-50"
            >
              <button onClick={() => { setIsNotesReviewOpen(true); setMobileNavVisible(false); }} className="p-3 text-stone-600 hover:bg-white/50 rounded-xl flex flex-col items-center gap-1"><PenTool size={20}/><span className="text-[10px]">笔记</span></button>
              <div className="w-[1px] h-8 bg-stone-300/50" />
              <button onClick={() => { setSidebarOpen(true); setMobileNavVisible(false); }} className="p-3 text-stone-600 hover:bg-white/50 rounded-xl flex flex-col items-center gap-1"><Sparkles size={20}/><span className="text-[10px]">AI</span></button>
              <div className="w-[1px] h-8 bg-stone-300/50" />
              <button onClick={() => { setIsMobileProgressOpen(!isMobileProgressOpen); }} className={`p-3 rounded-xl flex flex-col items-center gap-1 ${isMobileProgressOpen ? 'text-amber-600 bg-amber-50' : 'text-stone-600 hover:bg-white/50'}`}><AlignLeft size={20}/><span className="text-[10px]">进度</span></button>
              <div className="w-[1px] h-8 bg-stone-300/50" />
              <button onClick={() => { setIsOpen(true); setMobileNavVisible(false); }} className="p-3 text-stone-600 hover:bg-white/50 rounded-xl flex flex-col items-center gap-1"><Settings size={20}/><span className="text-[10px]">设置</span></button>
            </motion.div>
          )}
        </AnimatePresence>
        {isMobileProgressOpen && <MobileVerticalProgress />}
        <ExportModal isOpen={isExportOpen} onClose={() => setIsExportOpen(false)} />
        <SettingsModal isOpen={isOpen} onClose={() => setIsOpen(false)} onOpenExport={() => setIsExportOpen(true)} />
      </>
    );
  }

  return (
    <>
      <div className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-50 flex flex-col gap-3">
        {!isFocusModeActive && <FullScreenToggle />}
        
        <motion.button
          className="p-3 md:p-4 bg-white/80 backdrop-blur-md text-stone-600 rounded-full shadow-lg shadow-stone-200/50 border border-white/60 hover:bg-white transition-all cursor-pointer"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsExportOpen(true)}
          title="导出内容"
        >
          <Download size={20} className="md:w-[22px] md:h-[22px]" strokeWidth={1.5} />
        </motion.button>

        <motion.button
          className="p-3 md:p-4 bg-stone-700/90 backdrop-blur-md text-white rounded-full shadow-lg shadow-stone-400/50 hover:bg-stone-800 transition-all border border-stone-600/20 cursor-pointer"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(true)}
        >
          <Settings size={20} className="md:w-[22px] md:h-[22px]" strokeWidth={1.5} />
        </motion.button>
      </div>

      <ExportModal isOpen={isExportOpen} onClose={() => setIsExportOpen(false)} />
      <SettingsModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
};
