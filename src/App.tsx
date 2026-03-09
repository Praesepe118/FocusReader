import React from 'react';
import { useReaderStore } from './store/useReaderStore';
import { WelcomeScreen } from './components/WelcomeScreen';
import { Reader } from './components/Reader';
import { Controls } from './components/Controls';
import { cn } from './lib/utils';

export default function App() {
  const { lines } = useReaderStore();

  return (
    <div className={cn(
      "min-h-screen font-sans selection:bg-indigo-100/50"
    )}>
      {lines.length === 0 ? (
        <WelcomeScreen />
      ) : (
        <>
          <main className="h-screen flex flex-col">
            <header className="flex-none px-6 py-4 flex justify-between items-center bg-white/30 backdrop-blur-sm border-b border-white/20 sticky top-0 z-20">
              <h1 className="text-lg font-serif italic tracking-wide text-stone-500">
                Focus Reader
              </h1>
              <div className="text-xs text-stone-400 font-mono bg-white/40 px-2 py-1 rounded-full border border-white/50">
                {lines.filter(l => l.isRead).length} / {lines.length} 已读
              </div>
            </header>
            <Reader />
            <Controls />
          </main>
        </>
      )}
    </div>
  );
}
