import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface LineData {
  id: string;
  text: string;
  isRead: boolean;
  isConfusing: boolean;
  isHighlighted?: boolean;
  note: string;
}

interface ReaderState {
  // Content
  currentBookId: string | null;
  rawText: string;
  lines: LineData[];
  
  // State
  currentLineIndex: number;
  
  // Settings
  linesPerPage: number;
  fontSize: number;
  lineHeight: number;
  letterSpacing: number;
  showNotes: boolean;
  showReadStar: boolean;
  browseMode: boolean;
  globalNoteMode: boolean;
  globalNote: string;
  infiniteScrollMode: boolean;
  
  // Actions
  setCurrentBookId: (id: string | null) => void;
  setRawText: (text: string) => void;
  setLines: (lines: LineData[]) => void;
  setCurrentLineIndex: (index: number) => void;
  
  // Settings Actions
  setLinesPerPage: (count: number) => void;
  setFontSize: (size: number) => void;
  setLineHeight: (height: number) => void;
  setLetterSpacing: (spacing: number) => void;
  toggleShowNotes: () => void;
  toggleShowReadStar: () => void;
  toggleBrowseMode: () => void;
  toggleGlobalNoteMode: () => void;
  setGlobalNote: (note: string) => void;
  toggleInfiniteScrollMode: () => void;
  
  // Interaction Actions
  toggleLineRead: (id: string) => void;
  markLineAsRead: (id: string) => void;
  toggleLineConfusing: (id: string) => void;
  toggleLineHighlight: (id: string) => void;
  updateLineNote: (id: string, note: string) => void;
  
  // System Actions
  reset: () => void;
  
  // Timer State
  timerEndTime: number | null;
  timerStartTime: number | null;
  timerState: 'idle' | 'running' | 'finished';
  totalFocusTime: number; // in milliseconds
  
  // Focus Mode State
  isFocusModeActive: boolean;
  focusModeEndTime: number | null;
  
  // Timer Actions
  startTimer: (minutes: number) => void;
  cancelTimer: () => void;
  completeTimer: () => void;
  
  // Focus Mode Actions
  startFocusMode: (minutes: number) => void;
  endFocusMode: () => void;
}

export const useReaderStore = create<ReaderState>()(
  persist(
    (set) => ({
      // Initial State
      currentBookId: null,
      rawText: '',
      lines: [],
      currentLineIndex: 0,
      linesPerPage: 10,
      fontSize: 18,
      lineHeight: 2,
      letterSpacing: 0.05,
      showNotes: true,
      showReadStar: true,
      browseMode: false,
      globalNoteMode: false,
      globalNote: '',
      infiniteScrollMode: false,
      
      timerEndTime: null,
      timerStartTime: null,
      timerState: 'idle',
      totalFocusTime: 0,
      
      isFocusModeActive: false,
      focusModeEndTime: null,

      // Actions
      setCurrentBookId: (id) => set({ currentBookId: id }),
      setRawText: (text) => {
        const lines = text.split('\n').map((line, index) => ({
          id: `line-${Date.now()}-${index}`,
          text: line,
          isRead: false,
          isConfusing: false,
          note: '',
        })).filter(l => l.text.trim() !== '');
        
        set({ rawText: text, lines, currentLineIndex: 0 });
      },

      setLines: (lines) => set({ lines }),
      setCurrentLineIndex: (index) => set({ currentLineIndex: index }),
      
      setLinesPerPage: (count) => set({ linesPerPage: count }),
      setFontSize: (size) => set({ fontSize: size }),
      setLineHeight: (height) => set({ lineHeight: height }),
      setLetterSpacing: (spacing) => set({ letterSpacing: spacing }),
      toggleShowNotes: () => set((state) => ({ showNotes: !state.showNotes })),
      toggleShowReadStar: () => set((state) => ({ showReadStar: !state.showReadStar })),
      toggleBrowseMode: () => set((state) => ({ browseMode: !state.browseMode })),
      toggleGlobalNoteMode: () => set((state) => ({ globalNoteMode: !state.globalNoteMode })),
      setGlobalNote: (note) => set({ globalNote: note }),
      toggleInfiniteScrollMode: () => set((state) => ({ infiniteScrollMode: !state.infiniteScrollMode })),
      
      toggleLineRead: (id) => set((state) => ({
        lines: state.lines.map(l => l.id === id ? { ...l, isRead: !l.isRead } : l)
      })),

      markLineAsRead: (id) => set((state) => ({
        lines: state.lines.map(l => l.id === id ? { ...l, isRead: true } : l)
      })),
      
      toggleLineConfusing: (id) => set((state) => ({
        lines: state.lines.map(l => l.id === id ? { ...l, isConfusing: !l.isConfusing } : l)
      })),

      toggleLineHighlight: (id) => set((state) => ({
        lines: state.lines.map(l => l.id === id ? { ...l, isHighlighted: !l.isHighlighted } : l)
      })),
      
      updateLineNote: (id, note) => set((state) => ({
        lines: state.lines.map(l => l.id === id ? { ...l, note } : l)
      })),
      
      startTimer: (minutes) => set({
        timerEndTime: Date.now() + minutes * 60 * 1000,
        timerStartTime: Date.now(),
        timerState: 'running'
      }),
      
      cancelTimer: () => set((state) => {
        let addedTime = 0;
        if (state.timerStartTime) {
            addedTime = Date.now() - state.timerStartTime;
        }
        return {
            timerEndTime: null,
            timerStartTime: null,
            timerState: 'idle',
            totalFocusTime: state.totalFocusTime + addedTime
        };
      }),
      
      completeTimer: () => set((state) => {
        let addedTime = 0;
        if (state.timerStartTime) {
            addedTime = Date.now() - state.timerStartTime;
        }
        return {
            timerState: 'finished',
            timerEndTime: null,
            timerStartTime: null,
            totalFocusTime: state.totalFocusTime + addedTime
        };
      }),
      
      startFocusMode: (minutes) => set({
        isFocusModeActive: true,
        focusModeEndTime: Date.now() + minutes * 60 * 1000
      }),
      
      endFocusMode: () => set({
        isFocusModeActive: false,
        focusModeEndTime: null
      }),

      reset: () => {
        set({
          currentBookId: null,
          rawText: '',
          lines: [],
          currentLineIndex: 0,
          timerEndTime: null,
          timerStartTime: null,
          timerState: 'idle',
          totalFocusTime: 0,
          globalNote: '',
          // Keep settings intact, or reset them if desired. We'll keep them intact for better UX.
        });
      }
    }),
    {
      name: 'focus-reader-storage-v5', // Changed key to v5 to ensure new settings are initialized
      storage: createJSONStorage(() => localStorage),
      version: 1,
    }
  )
);
