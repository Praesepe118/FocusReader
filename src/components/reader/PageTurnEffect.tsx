import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles } from 'lucide-react';

export const PageTurnEffect = ({ trigger }: { trigger: number }) => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (trigger > 0) {
      setShow(true);
      const timer = setTimeout(() => setShow(false), 1000); 
      return () => clearTimeout(timer);
    }
  }, [trigger]);

  // Target: Bottom center
  const windowHeight = typeof window !== 'undefined' ? window.innerHeight : 800;
  const targetY = windowHeight / 2 - 20; 

  return (
    <AnimatePresence>
      {show && (
        <motion.div
            className="fixed inset-0 pointer-events-none z-[100] flex items-center justify-center overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
        >
            {/* The Star */}
            <motion.div
                initial={{ 
                    scale: 0.5, 
                    y: 0, 
                    opacity: 0,
                }}
                animate={{ 
                    scale: [0.5, 1.2, 0.2], 
                    y: [0, 0, targetY], // Move to bottom
                    opacity: [0, 1, 0],
                }}
                transition={{ 
                    duration: 0.8, 
                    ease: "easeInOut" 
                }}
                className="text-amber-300 drop-shadow-[0_0_10px_rgba(251,191,36,0.5)]"
            >
                <Sparkles size={32} strokeWidth={1.5} fill="currentColor" />
            </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
