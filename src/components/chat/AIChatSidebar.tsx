import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAIStore } from '../../store/useAIStore';
import { useReaderStore } from '../../store/useReaderStore';
import { ChatInterface } from './ChatInterface';
import { ChatSettings } from './ChatSettings';
import { ChevronRight, Pin, PinOff, X } from 'lucide-react';
import { cn } from '../../lib/utils';

export const AIChatSidebar = () => {
  const { isSidebarOpen, setSidebarOpen, isSettingsOpen, isSidebarPinned, toggleSidebarPin } = useAIStore();
  const { mobileMode } = useReaderStore();

  return (
    <>
      {/* Hover Trigger Area (Left Edge) */}
      {!mobileMode && (
        <div 
          className="fixed top-16 left-0 bottom-0 w-4 z-40 group"
          onMouseEnter={() => !isSidebarOpen && setSidebarOpen(true)}
        />
      )}

      {/* Sidebar Container */}
      <motion.div
        initial={{ x: '-100%' }}
        animate={{ x: isSidebarOpen ? 0 : '-100%' }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className={cn(
          "fixed top-0 left-0 bottom-0 z-50 bg-white shadow-2xl border-r border-stone-200 flex flex-col",
          mobileMode ? "w-full" : "w-[400px]"
        )}
        onMouseLeave={() => !isSidebarPinned && !mobileMode && setSidebarOpen(false)}
      >
        
        <div className="flex-1 relative overflow-hidden flex flex-col h-full">
            {isSettingsOpen ? <ChatSettings /> : <ChatInterface />}
        </div>

        {/* Pin Toggle (Desktop only) */}
        {!mobileMode && (
          <div 
              className={cn(
                  "absolute top-4 -right-10 bg-white border border-stone-200 rounded-r-lg p-2 cursor-pointer shadow-sm text-stone-400 hover:text-stone-600 transition-all",
                  isSidebarPinned ? "text-stone-600 bg-stone-100 border-stone-300" : ""
              )}
              onClick={toggleSidebarPin}
              title={isSidebarPinned ? "取消固定" : "固定侧边栏"}
          >
              {isSidebarPinned ? <Pin size={16} className="fill-current" /> : <Pin size={16} />}
          </div>
        )}

        {/* Close Handle / Decoration (Desktop only) */}
        {!mobileMode && (
          <div 
              className="absolute top-1/2 -right-3 transform -translate-y-1/2 bg-white border border-stone-200 rounded-full p-1 cursor-pointer shadow-sm text-stone-400 hover:text-stone-600"
              onClick={() => setSidebarOpen(!isSidebarOpen)}
          >
              <ChevronRight size={16} className={cn("transition-transform", isSidebarOpen ? "rotate-180" : "")} />
          </div>
        )}
      </motion.div>
    </>
  );
};
