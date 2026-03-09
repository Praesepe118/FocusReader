import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAIStore } from '../../store/useAIStore';
import { ChatInterface } from './ChatInterface';
import { ChatSettings } from './ChatSettings';
import { ChevronRight, Pin, PinOff } from 'lucide-react';
import { cn } from '../../lib/utils';

export const AIChatSidebar = () => {
  const { isSidebarOpen, setSidebarOpen, isSettingsOpen, isSidebarPinned, toggleSidebarPin } = useAIStore();

  return (
    <>
      {/* Hover Trigger Area (Left Edge) */}
      <div 
        className="fixed top-0 left-0 bottom-0 w-4 z-40 group"
        onMouseEnter={() => !isSidebarOpen && setSidebarOpen(true)}
      />

      {/* Sidebar Container */}
      <motion.div
        initial={{ x: -400 }}
        animate={{ x: isSidebarOpen ? 0 : -400 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="fixed top-0 left-0 bottom-0 w-[400px] z-50 bg-white shadow-2xl border-r border-stone-200 flex flex-col"
        onMouseLeave={() => !isSidebarPinned && setSidebarOpen(false)}
      >
        
        <div className="flex-1 relative overflow-hidden flex flex-col h-full">
            {isSettingsOpen ? <ChatSettings /> : <ChatInterface />}
        </div>

        {/* Pin Toggle */}
        <div 
            className={cn(
                "absolute top-4 -right-10 bg-white border border-stone-200 rounded-r-lg p-2 cursor-pointer shadow-sm text-stone-400 hover:text-stone-600 transition-all",
                isSidebarPinned ? "text-amber-600 bg-amber-50 border-amber-200" : ""
            )}
            onClick={toggleSidebarPin}
            title={isSidebarPinned ? "取消固定" : "固定侧边栏"}
        >
            {isSidebarPinned ? <Pin size={16} className="fill-current" /> : <Pin size={16} />}
        </div>

        {/* Close Handle / Decoration */}
        <div 
            className="absolute top-1/2 -right-3 transform -translate-y-1/2 bg-white border border-stone-200 rounded-full p-1 cursor-pointer shadow-sm text-stone-400 hover:text-stone-600"
            onClick={() => setSidebarOpen(!isSidebarOpen)}
        >
            <ChevronRight size={16} className={cn("transition-transform", isSidebarOpen ? "rotate-180" : "")} />
        </div>
      </motion.div>
    </>
  );
};
