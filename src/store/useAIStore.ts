import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';

export interface AIConfig {
  id: string;
  name: string;
  baseUrl: string;
  apiKey: string;
  model: string;
  systemPrompt: string;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  citations?: string[]; // Array of text content cited
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
}

interface AIStoreState {
  // Configs
  configs: AIConfig[];
  currentConfigId: string | null;
  
  // Chat Data
  sessions: ChatSession[];
  currentSessionId: string | null;
  
  // UI State
  isSidebarOpen: boolean;
  isSidebarPinned: boolean;
  isSettingsOpen: boolean;
  inputMessage: string;
  isLoading: boolean;
  
  // Selection/Citation
  selectedLineIds: string[]; // IDs of lines selected for citation

  // Actions
  addConfig: (config: Omit<AIConfig, 'id'>) => void;
  updateConfig: (id: string, updates: Partial<AIConfig>) => void;
  removeConfig: (id: string) => void;
  setCurrentConfigId: (id: string) => void;
  
  createSession: () => void;
  deleteSession: (id: string) => void;
  renameSession: (id: string, newTitle: string) => void;
  importSession: (session: ChatSession) => void;
  setCurrentSessionId: (id: string) => void;
  addMessage: (sessionId: string, message: Omit<Message, 'id' | 'timestamp'> & { id?: string }) => void;
  updateMessageContent: (sessionId: string, messageId: string, content: string) => void;
  deleteMessage: (sessionId: string, messageId: string) => void;
  cleanupPendingMessages: () => void;
  
  toggleSidebar: () => void;
  setSidebarOpen: (isOpen: boolean) => void;
  toggleSidebarPin: () => void;
  toggleSettings: () => void;
  setInputMessage: (msg: string) => void;
  setIsLoading: (loading: boolean) => void;
  
  toggleLineSelection: (lineId: string) => void;
  clearSelection: () => void;
}

const DEFAULT_SYSTEM_PROMPT = `你是一个专业的阅读助手。用户正在阅读一本书，并会向你提问。
请根据用户提供的书籍内容、用户的阅读进度以及用户的随笔笔记来回答问题。
回答应简洁、深刻，富有禅意，与阅读器的整体风格保持一致。`;

export const useAIStore = create<AIStoreState>()(
  persist(
    (set, get) => ({
      configs: [],
      currentConfigId: null,
      
      sessions: [],
      currentSessionId: null,
      
      isSidebarOpen: false,
      isSidebarPinned: false,
      isSettingsOpen: false,
      inputMessage: '',
      isLoading: false,
      
      selectedLineIds: [],

      addConfig: (config) => set((state) => {
        const newConfig = { ...config, id: uuidv4() };
        return {
          configs: [...state.configs, newConfig],
          currentConfigId: state.currentConfigId || newConfig.id // Auto-select if first
        };
      }),

      updateConfig: (id, updates) => set((state) => ({
        configs: state.configs.map(c => c.id === id ? { ...c, ...updates } : c)
      })),

      removeConfig: (id) => set((state) => ({
        configs: state.configs.filter(c => c.id !== id),
        currentConfigId: state.currentConfigId === id ? (state.configs.find(c => c.id !== id)?.id || null) : state.currentConfigId
      })),

      setCurrentConfigId: (id) => set({ currentConfigId: id }),

      createSession: () => set((state) => {
        const newSession: ChatSession = {
          id: uuidv4(),
          title: '新对话',
          messages: [],
          createdAt: Date.now(),
          updatedAt: Date.now()
        };
        return {
          sessions: [newSession, ...state.sessions],
          currentSessionId: newSession.id,
          selectedLineIds: [] // Clear selection on new session
        };
      }),

      deleteSession: (id) => set((state) => ({
        sessions: state.sessions.filter(s => s.id !== id),
        currentSessionId: state.currentSessionId === id ? null : state.currentSessionId
      })),

      renameSession: (id, newTitle) => set((state) => ({
        sessions: state.sessions.map(s => s.id === id ? { ...s, title: newTitle } : s)
      })),

      importSession: (session) => set((state) => {
        // Check for ID conflict
        let sessionToImport = session;
        if (state.sessions.some(s => s.id === session.id)) {
            sessionToImport = { ...session, id: uuidv4() };
        }
        return {
          sessions: [sessionToImport, ...state.sessions],
          currentSessionId: sessionToImport.id
        };
      }),

      setCurrentSessionId: (id) => set({ currentSessionId: id }),

      addMessage: (sessionId, message) => set((state) => ({
        sessions: state.sessions.map(s => {
          if (s.id !== sessionId) return s;
          const newMessages = [...s.messages, { ...message, id: message.id || uuidv4(), timestamp: Date.now() }];
          return {
            ...s,
            messages: newMessages,
            updatedAt: Date.now(),
            // Auto-update title if it's the first user message
            title: (s.messages.length === 0 && message.role === 'user') 
              ? message.content.slice(0, 20) + (message.content.length > 20 ? '...' : '') 
              : s.title
          };
        })
      })),

      updateMessageContent: (sessionId, messageId, content) => set((state) => ({
        sessions: state.sessions.map(s => {
          if (s.id !== sessionId) return s;
          return {
            ...s,
            messages: s.messages.map(m => m.id === messageId ? { ...m, content } : m)
          };
        })
      })),

      deleteMessage: (sessionId, messageId) => set((state) => ({
        sessions: state.sessions.map(s => {
          if (s.id !== sessionId) return s;
          return {
            ...s,
            messages: s.messages.filter(m => m.id !== messageId)
          };
        })
      })),

      cleanupPendingMessages: () => set((state) => ({
        sessions: state.sessions.map(s => ({
          ...s,
          messages: s.messages.map(m => 
            (m.role === 'assistant' && (m.content === '...' || m.content.startsWith('正在思考中...')))
              ? { ...m, content: '[生成已中断]' }
              : m
          )
        }))
      })),

      toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
      setSidebarOpen: (isOpen) => set({ isSidebarOpen: isOpen }),
      toggleSidebarPin: () => set((state) => ({ isSidebarPinned: !state.isSidebarPinned })),
      toggleSettings: () => set((state) => ({ isSettingsOpen: !state.isSettingsOpen })),
      setInputMessage: (msg) => set({ inputMessage: msg }),
      setIsLoading: (loading) => set({ isLoading: loading }),

      toggleLineSelection: (lineId) => set((state) => {
        const isSelected = state.selectedLineIds.includes(lineId);
        return {
          selectedLineIds: isSelected 
            ? state.selectedLineIds.filter(id => id !== lineId)
            : [...state.selectedLineIds, lineId]
        };
      }),

      clearSelection: () => set({ selectedLineIds: [] }),
    }),
    {
      name: 'focus-reader-ai-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        configs: state.configs,
        currentConfigId: state.currentConfigId,
        sessions: state.sessions,
        currentSessionId: state.currentSessionId,
        isSidebarPinned: state.isSidebarPinned,
      }),
    }
  )
);
