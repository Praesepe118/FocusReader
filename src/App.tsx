import React, { useEffect, useRef } from 'react';
import { useReaderStore } from './store/useReaderStore';
import { useAuthStore } from './store/useAuthStore';
import { useAIStore } from './store/useAIStore';
import { cloudSyncService } from './lib/cloudSyncService';
import { WelcomeScreen } from './components/WelcomeScreen';
import { AuthScreen } from './components/AuthScreen';
import { Reader } from './components/Reader';
import { Controls } from './components/Controls';
import { FocusModeActiveOverlay } from './components/reader/FocusModeActiveOverlay';
import { cn } from './lib/utils';
import { Loader2, ArrowLeft } from 'lucide-react';

export default function App() {
  const lines = useReaderStore((state) => state.lines);
  const currentLineIndex = useReaderStore((state) => state.currentLineIndex);
  const currentBookId = useReaderStore((state) => state.currentBookId);
  const isFocusModeActive = useReaderStore((state) => state.isFocusModeActive);
  const setCurrentBookId = useReaderStore((state) => state.setCurrentBookId);
  const setMobileMode = useReaderStore((state) => state.setMobileMode);
  const mobileMode = useReaderStore((state) => state.mobileMode);
  
  const session = useAuthStore((state) => state.session);
  const isLoading = useAuthStore((state) => state.isLoading);
  const initialize = useAuthStore((state) => state.initialize);
  const user = useAuthStore((state) => state.user);

  const configs = useAIStore((state) => state.configs);
  const currentConfigId = useAIStore((state) => state.currentConfigId);
  const sessions = useAIStore((state) => state.sessions);
  
  const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const aiSyncTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    initialize();
  }, [initialize]);

  // Auto-detect mobile mode
  useEffect(() => {
    const checkMobile = () => {
      setMobileMode(window.innerWidth < 768);
    };
    checkMobile(); // Initial check
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [setMobileMode]);

  // Load global API config on login
  useEffect(() => {
    if (user) {
      cloudSyncService.getApiConfig(user.id).then(config => {
        if (config && config.configs) {
          useAIStore.setState({ configs: config.configs });
          if (config.currentConfigId) {
            useAIStore.setState({ currentConfigId: config.currentConfigId });
          }
        }
      }).catch(console.error);
    }
  }, [user]);

  // Sync reading progress, notes, and chat history to cloud
  useEffect(() => {
    if (!currentBookId || lines.length === 0) return;

    if (syncTimeoutRef.current) {
      clearTimeout(syncTimeoutRef.current);
    }

    syncTimeoutRef.current = setTimeout(async () => {
      try {
        await cloudSyncService.syncBookData(currentBookId, currentLineIndex, lines);
        await cloudSyncService.syncChatHistory(currentBookId, sessions);
        console.log('Synced book data to cloud successfully');
      } catch (error) {
        console.error('Failed to sync to cloud:', error);
      }
    }, 2000); // Debounce for 2 seconds

    return () => {
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }
    };
  }, [currentBookId, currentLineIndex, lines, sessions]);

  // Sync API config to cloud
  useEffect(() => {
    if (!user || configs.length === 0) return;

    if (aiSyncTimeoutRef.current) {
      clearTimeout(aiSyncTimeoutRef.current);
    }

    aiSyncTimeoutRef.current = setTimeout(async () => {
      try {
        await cloudSyncService.syncApiConfig(user.id, {
          configs,
          currentConfigId
        });
        console.log('Synced API config to cloud successfully');
      } catch (error) {
        console.error('Failed to sync API config:', error);
      }
    }, 2000);

    return () => {
      if (aiSyncTimeoutRef.current) {
        clearTimeout(aiSyncTimeoutRef.current);
      }
    };
  }, [user, configs, currentConfigId]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <Loader2 className="w-8 h-8 animate-spin text-stone-400" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className={cn("min-h-screen font-sans selection:bg-indigo-100/50")}>
        <AuthScreen />
      </div>
    );
  }

  return (
    <div className={cn(
      "min-h-screen font-sans selection:bg-indigo-100/50"
    )}>
      {lines.length === 0 ? (
        <WelcomeScreen />
      ) : (
        <>
          <main className="h-screen flex flex-col">
            <header className="flex-none px-4 py-3 md:px-6 md:py-4 flex justify-between items-center bg-white/30 backdrop-blur-sm border-b border-white/20 sticky top-0 z-20">
              <div className="flex items-center gap-2 md:gap-3">
                {!isFocusModeActive && (
                  <button 
                    onClick={() => setCurrentBookId(null)}
                    className="p-1.5 md:p-2 -ml-1 md:-ml-2 text-stone-400 hover:text-stone-600 hover:bg-stone-100 rounded-full transition-colors"
                    title="返回书架"
                  >
                    <ArrowLeft size={20} className="w-4 h-4 md:w-5 md:h-5" />
                  </button>
                )}
                {!mobileMode && (
                  <h1 className="text-base md:text-lg font-serif italic tracking-wide text-stone-500">
                    Focus Reader
                  </h1>
                )}
              </div>
              <div className="text-[10px] md:text-xs text-stone-400 font-mono bg-white/40 px-2 py-1 rounded-full border border-white/50">
                {lines.filter(l => l.isRead).length} / {lines.length} {!mobileMode && '已读'}
              </div>
            </header>
            <Reader />
            <Controls />
            <FocusModeActiveOverlay />
          </main>
        </>
      )}
    </div>
  );
}
