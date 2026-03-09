import React from 'react';
import { ExportModal } from './ExportModal';
import { SettingsModal } from './controls/SettingsModal';
import { 
  Settings, 
  Download
} from 'lucide-react';
import { motion } from 'motion/react';

export const Controls = () => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [isExportOpen, setIsExportOpen] = React.useState(false);

  return (
    <>
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3">
        <motion.button
          className="p-4 bg-white/80 backdrop-blur-md text-stone-600 rounded-full shadow-lg shadow-stone-200/50 border border-white/60 hover:bg-white transition-all cursor-pointer"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsExportOpen(true)}
          title="导出内容"
        >
          <Download size={22} strokeWidth={1.5} />
        </motion.button>

        <motion.button
          className="p-4 bg-stone-700/90 backdrop-blur-md text-white rounded-full shadow-lg shadow-stone-400/50 hover:bg-stone-800 transition-all border border-stone-600/20 cursor-pointer"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(true)}
        >
          <Settings size={22} strokeWidth={1.5} />
        </motion.button>
      </div>

      <ExportModal isOpen={isExportOpen} onClose={() => setIsExportOpen(false)} />
      <SettingsModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
};
