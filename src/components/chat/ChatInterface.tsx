import React, { useRef, useEffect, useState } from 'react';
import { useAIStore } from '../../store/useAIStore';
import { useReaderStore } from '../../store/useReaderStore';
import { Send, Plus, MessageSquare, Quote, Download, Upload, Trash2, X, Edit2, RefreshCw, Square, ChevronDown } from 'lucide-react';
import { streamChatCompletion } from '../../lib/aiService';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { cn } from '../../lib/utils';
import { FourPointStar } from '../ui/FourPointStar';
import { v4 as uuidv4 } from 'uuid';

export const ChatInterface = () => {
  const { 
    configs, 
    currentConfigId, 
    sessions, 
    currentSessionId, 
    inputMessage,
    isLoading,
    selectedLineIds,
    createSession,
    setCurrentSessionId,
    addMessage,
    updateMessageContent,
    deleteMessage,
    importSession,
    setInputMessage,
    setIsLoading,
    toggleSettings,
    deleteSession,
    renameSession,
    cleanupPendingMessages,
    clearSelection,
    toggleLineSelection,
    isSettingsOpen
  } = useAIStore();

  const { lines, rawText, currentLineIndex } = useReaderStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');

  // Derived state
  const currentSession = sessions.find(s => s.id === currentSessionId);
  const messages = currentSession?.messages || [];
  const currentConfig = configs.find(c => c.id === currentConfigId);

  // Auto-scroll to bottom
  useEffect(() => {
    if (!editingMessageId) {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages.length, messages[messages.length - 1]?.content, editingMessageId]);

  // Cleanup pending messages on mount (e.g. after a page reload)
  useEffect(() => {
    cleanupPendingMessages();
    setIsLoading(false);
  }, []);

  const handleStop = () => {
      if (abortControllerRef.current) {
          abortControllerRef.current.abort();
          abortControllerRef.current = null;
      }
      setIsLoading(false);
  };

  const handleSendMessage = async (overrideContent?: string) => {
    if (isLoading) return; // Prevent multiple submissions
    const contentToSend = overrideContent || inputMessage;
    if (!contentToSend.trim() && selectedLineIds.length === 0) return;
    if (!currentConfig) {
        toggleSettings();
        return;
    }
    
    let targetSessionId = currentSessionId;
    if (!targetSessionId) {
        if (sessions.length === 0) {
             createSession();
             targetSessionId = useAIStore.getState().currentSessionId;
        } else {
             targetSessionId = sessions[0]?.id;
        }
        if (!targetSessionId) {
             return; 
        }
    }

    // Prepare context
    const selectedLines = lines.filter(l => selectedLineIds.includes(l.id));
    const citations = selectedLines.map(l => l.text);
    
    // Construct user message
    let fullContent = contentToSend;
    if (citations.length > 0) {
        fullContent += `\n\n> 引用内容:\n${citations.map(c => `> ${c}`).join('\n')}`;
    }

    addMessage(targetSessionId, {
        role: 'user',
        content: fullContent,
        citations: citations
    });
    setInputMessage('');
    clearSelection();
    setIsLoading(true);

    await generateResponse(targetSessionId, fullContent);
  };

  const generateResponse = async (sessionId: string, lastUserContent: string) => {
      try {
          if (!currentConfig) {
              setIsLoading(false);
              return;
          }

          // Context Injection
          const contextMessage = `
当前书籍内容（部分或全文）：
${rawText || ''}

用户的阅读进度：第 ${currentLineIndex + 1} 行 / 共 ${lines.length} 行。
用户当前的随笔笔记：
${lines.filter(l => l.note).map(l => `- Line ${lines.indexOf(l)+1}: ${l.note}`).join('\n')}
`;
          
          // Prepare messages for API
          const apiMessages = [
              { role: 'system', content: `${currentConfig.systemPrompt || ''}\n\n${contextMessage}` }
          ];

          const currentSession = useAIStore.getState().sessions.find(s => s.id === sessionId);
          if (!currentSession) {
              setIsLoading(false);
              return;
          }

          currentSession.messages.forEach(m => {
              if (m.content !== '...' && !m.content.startsWith('正在思考中...')) { // Skip loading placeholders
                  apiMessages.push({ role: m.role, content: m.content });
              }
          });

          const contextLength = apiMessages.reduce((acc, msg) => acc + msg.content.length, 0);

          // Create placeholder for assistant response
          const assistantMsgId = uuidv4();
          addMessage(sessionId, {
              id: assistantMsgId,
              role: 'assistant',
              content: `正在思考中...\n\n*(系统提示：当前已发送 **${contextLength}** 字的上下文给模型。如果是十几万字的长文本，模型预处理可能需要 1~3 分钟，请耐心等待。如果长时间无响应，可能是 API 代理商拦截了超大请求。)*` // Loading state
          });

          let responseContent = '';
          
          abortControllerRef.current = new AbortController();

          await streamChatCompletion(
              currentConfig,
              apiMessages,
              (chunk) => {
                  responseContent += chunk;
                  updateMessageContent(sessionId, assistantMsgId, responseContent);
              },
              () => {
                  if (responseContent === '') {
                      updateMessageContent(sessionId, assistantMsgId, '[API 返回了空回复，请检查模型配置或稍后重试]');
                  }
                  setIsLoading(false);
                  abortControllerRef.current = null;
              },
              (error) => {
                  if (error.name === 'AbortError' && !(error.message && error.message.includes('请求超时'))) {
                      console.log('Generation stopped by user');
                      if (responseContent === '') {
                          updateMessageContent(sessionId, assistantMsgId, '[已停止生成]');
                      } else {
                          updateMessageContent(sessionId, assistantMsgId, responseContent + '\n\n[已停止生成]');
                      }
                  } else {
                      console.error(error);
                      responseContent += `\n\n[Error: ${error.message || error}]`;
                      updateMessageContent(sessionId, assistantMsgId, responseContent);
                  }
                  setIsLoading(false);
                  abortControllerRef.current = null;
              },
              abortControllerRef.current.signal
          );
      } catch (error: any) {
          console.error("Error in generateResponse:", error);
          setIsLoading(false);
          if (abortControllerRef.current) {
              abortControllerRef.current = null;
          }
          // Fallback to update message if an error occurs outside the stream
          const currentSession = useAIStore.getState().sessions.find(s => s.id === sessionId);
          if (currentSession) {
              const lastMsg = currentSession.messages[currentSession.messages.length - 1];
              if (lastMsg && lastMsg.role === 'assistant' && (lastMsg.content === '...' || lastMsg.content.startsWith('正在思考中...'))) {
                  updateMessageContent(sessionId, lastMsg.id, `[内部错误: ${error.message || error}]`);
              }
          }
      }
  };

  const handleRegenerate = async (messageId: string) => {
      if (!currentSessionId) return;
      // Find the message index
      const index = messages.findIndex(m => m.id === messageId);
      if (index === -1) return;

      // We want to regenerate THIS assistant message.
      // So we delete it, and re-trigger generation based on history UP TO this point.
      
      // 1. Delete this message
      deleteMessage(currentSessionId, messageId);
      
      // 2. Trigger generation
      // We need to know what the LAST user message was before this.
      // The `generateResponse` function builds history from the store.
      // So if we delete the assistant message, the store will have [User, Assistant, User].
      // Wait, if we delete the LAST assistant message, the store has [..., User].
      // Then `generateResponse` will take all that history.
      // But `generateResponse` expects `lastUserContent`? Actually it doesn't use it for the API call construction (it uses store history),
      // but it might use it for something else? No, I refactored it to use store history.
      // So just calling `generateResponse` is enough.
      
      setIsLoading(true);
      await generateResponse(currentSessionId, ""); 
  };

  const startEdit = (msg: any) => {
      setEditingMessageId(msg.id);
      setEditContent(msg.content);
  };

  const saveEdit = (msgId: string) => {
      if (!currentSessionId) return;
      updateMessageContent(currentSessionId, msgId, editContent);
      setEditingMessageId(null);
      setEditContent('');
  };

  // Export/Import
  const handleExport = () => {
    const data = JSON.stringify(sessions, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chat-history-${new Date().toISOString().slice(0,10)}.json`;
    a.click();
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
        try {
            const data = JSON.parse(ev.target?.result as string);
            if (Array.isArray(data)) {
                let count = 0;
                data.forEach(session => {
                    if (session.id && session.messages) {
                        importSession(session);
                        count++;
                    }
                });
                alert(`成功导入 ${count} 个对话`);
            }
        } catch (err) {
            alert("导入失败：文件格式错误");
        }
    };
    reader.readAsText(file);
    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const [isSessionDropdownOpen, setIsSessionDropdownOpen] = useState(false);
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [sessionEditTitle, setSessionEditTitle] = useState('');

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (isSessionDropdownOpen && !(e.target as Element).closest('.session-dropdown')) {
        setIsSessionDropdownOpen(false);
        setEditingSessionId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isSessionDropdownOpen]);

  const handleDeleteSession = (e: React.MouseEvent, id: string) => {
      e.stopPropagation();
      deleteSession(id);
      if (sessions.length <= 1) {
          createSession();
      } else if (currentSessionId === id) {
          const nextSession = sessions.find(s => s.id !== id);
          if (nextSession) setCurrentSessionId(nextSession.id);
      }
  };

  const handleStartRename = (e: React.MouseEvent, id: string, title: string) => {
      e.stopPropagation();
      setEditingSessionId(id);
      setSessionEditTitle(title);
  };

  const handleSaveRename = (e: React.KeyboardEvent | React.FocusEvent, id: string) => {
      e.stopPropagation();
      if (sessionEditTitle.trim()) {
          renameSession(id, sessionEditTitle.trim());
      }
      setEditingSessionId(null);
  };

  return (
    <div className="flex flex-col h-full bg-stone-50/50">
       {/* Header */}
       <div className="flex items-center justify-between p-4 border-b border-stone-200/60 bg-white/80 backdrop-blur-md z-10">
         <div className="relative session-dropdown">
            <button 
                onClick={() => setIsSessionDropdownOpen(!isSessionDropdownOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-stone-100 transition-colors"
            >
                <FourPointStar className="text-amber-500 w-4 h-4 flex-shrink-0" fill="currentColor" />
                <span className="font-serif font-medium text-stone-700 max-w-[150px] truncate text-sm">
                    {currentSession?.title || '无对话'}
                </span>
                <ChevronDown size={14} className={cn("text-stone-400 transition-transform", isSessionDropdownOpen ? "rotate-180" : "")} />
            </button>

            {/* Dropdown Menu */}
            {isSessionDropdownOpen && (
                <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-stone-100 py-2 max-h-64 overflow-y-auto z-50">
                    <div className="px-3 pb-2 mb-2 border-b border-stone-100 flex justify-between items-center">
                        <span className="text-xs font-mono text-stone-400 uppercase">历史对话</span>
                        <button onClick={() => { createSession(); setIsSessionDropdownOpen(false); }} className="text-xs text-amber-600 hover:text-amber-700 flex items-center gap-1">
                            <Plus size={12} /> 新建
                        </button>
                    </div>
                    {sessions.length === 0 ? (
                        <div className="px-4 py-3 text-sm text-stone-400 text-center">暂无对话</div>
                    ) : (
                        sessions.map(s => (
                            <div 
                                key={s.id}
                                onClick={() => { if (editingSessionId !== s.id) { setCurrentSessionId(s.id); setIsSessionDropdownOpen(false); } }}
                                className={cn(
                                    "px-4 py-2 text-sm cursor-pointer flex items-center justify-between group transition-colors",
                                    currentSessionId === s.id ? "bg-amber-50/50 text-amber-900" : "hover:bg-stone-50 text-stone-600"
                                )}
                            >
                                {editingSessionId === s.id ? (
                                    <input 
                                        type="text"
                                        autoFocus
                                        value={sessionEditTitle}
                                        onChange={(e) => setSessionEditTitle(e.target.value)}
                                        onBlur={(e) => handleSaveRename(e, s.id)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') handleSaveRename(e, s.id);
                                            if (e.key === 'Escape') setEditingSessionId(null);
                                        }}
                                        onClick={(e) => e.stopPropagation()}
                                        className="flex-1 bg-white border border-amber-200 rounded px-2 py-0.5 text-sm focus:outline-none focus:border-amber-400"
                                    />
                                ) : (
                                    <span className="truncate pr-4 flex-1">{s.title}</span>
                                )}
                                
                                {editingSessionId !== s.id && (
                                    <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity">
                                        <button 
                                            onClick={(e) => handleStartRename(e, s.id, s.title)}
                                            className="text-stone-300 hover:text-amber-500 transition-colors p-1"
                                            title="重命名对话"
                                        >
                                            <Edit2 size={12} />
                                        </button>
                                        <button 
                                            onClick={(e) => handleDeleteSession(e, s.id)}
                                            className="text-stone-300 hover:text-red-500 transition-colors p-1"
                                            title="删除对话"
                                        >
                                            <Trash2 size={12} />
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            )}
         </div>
         <div className="flex gap-1">
            <button onClick={createSession} className="p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition-colors" title="新话题">
                <Plus size={16} />
            </button>
            <button onClick={toggleSettings} className="p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition-colors" title="设置">
                <MessageSquare size={16} />
            </button>
         </div>
       </div>

       {/* Messages */}
       <div className="flex-1 overflow-y-auto p-4 space-y-6 scroll-smooth">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-stone-400 gap-4">
                <FourPointStar className="w-12 h-12 text-stone-200/60" />
                <button onClick={toggleSettings} className="text-xs text-stone-400 hover:text-stone-600 transition-colors">配置 AI 助手</button>
            </div>
          ) : (
            messages.map(msg => (
                <div key={msg.id} className={cn("flex flex-col gap-1.5 group", msg.role === 'user' ? "items-end" : "items-start")}>
                    
                    {/* Message Bubble */}
                    <div className={cn(
                        "max-w-[88%] rounded-2xl px-5 py-3.5 text-[15px] leading-relaxed relative",
                        msg.role === 'user' 
                            ? "bg-stone-800 text-stone-50 rounded-br-sm shadow-sm" 
                            : "bg-white text-stone-700 border border-stone-200/60 rounded-bl-sm shadow-sm"
                    )}>
                        {editingMessageId === msg.id ? (
                            <div className="flex flex-col gap-3 min-w-[250px]">
                                <textarea 
                                    value={editContent}
                                    onChange={(e) => setEditContent(e.target.value)}
                                    className="w-full bg-stone-50 border border-stone-200 rounded-lg p-3 text-stone-800 focus:outline-none focus:border-stone-400 focus:ring-1 focus:ring-stone-200 resize-none"
                                    rows={4}
                                />
                                <div className="flex justify-end gap-3 text-sm">
                                    <button onClick={() => setEditingMessageId(null)} className="text-stone-500 hover:text-stone-700 transition-colors">取消</button>
                                    <button onClick={() => saveEdit(msg.id)} className="text-stone-800 font-medium hover:text-black transition-colors">保存</button>
                                </div>
                            </div>
                        ) : (
                            <div className="prose prose-stone prose-sm max-w-none prose-p:leading-relaxed prose-pre:bg-stone-50 prose-pre:border prose-pre:border-stone-200">
                                <Markdown 
                                    remarkPlugins={[remarkGfm]}
                                    components={{
                                        code({node, className, children, ...props}) {
                                            return <code className={cn("bg-stone-100 px-1.5 py-0.5 rounded-md text-[13px] font-mono text-stone-600", className)} {...props}>{children}</code>
                                        }
                                    }}
                                >
                                    {msg.content}
                                </Markdown>
                            </div>
                        )}
                    </div>

                    {/* Citations indicator */}
                    {msg.citations && msg.citations.length > 0 && (
                        <div className="text-[11px] text-stone-400 flex items-center gap-1.5 px-2 mt-1">
                            <Quote size={12} className="text-stone-300" /> 引用了 {msg.citations.length} 处原文
                        </div>
                    )}

                    {/* Actions (Visible on Hover) */}
                    <div className={cn(
                        "flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity px-2 mt-1",
                        msg.role === 'user' ? "flex-row-reverse" : "flex-row"
                    )}>
                        <button onClick={() => startEdit(msg)} className="text-stone-400 hover:text-stone-600 transition-colors" title="编辑">
                            <Edit2 size={14} />
                        </button>
                        <button onClick={() => deleteMessage(currentSessionId!, msg.id)} className="text-stone-400 hover:text-red-500 transition-colors" title="删除">
                            <Trash2 size={14} />
                        </button>
                        {msg.role === 'assistant' && (
                            <button onClick={() => handleRegenerate(msg.id)} className="text-stone-400 hover:text-stone-600 transition-colors" title="重新生成">
                                <RefreshCw size={14} />
                            </button>
                        )}
                    </div>
                </div>
            ))
          )}
          <div ref={messagesEndRef} />
       </div>

       {/* Input Area */}
       <div className="p-4 bg-white/80 backdrop-blur-md border-t border-stone-200/60">
          {/* Citation Preview */}
          {selectedLineIds.length > 0 && (
             <div className="mb-3 flex flex-col gap-2">
                <div className="flex justify-between items-center px-2">
                    <span className="text-xs text-stone-500 flex items-center gap-1.5 font-medium">
                        <Quote size={12} className="text-stone-400" />
                        引用 {selectedLineIds.length} 段原文
                    </span>
                    <button onClick={clearSelection} className="text-stone-400 hover:text-stone-600 text-xs transition-colors">
                        清空
                    </button>
                </div>
                <div className="max-h-32 overflow-y-auto flex flex-col gap-1.5 no-scrollbar px-1">
                    {selectedLineIds.map(id => {
                        const line = lines.find(l => l.id === id);
                        if (!line) return null;
                        return (
                            <div key={id} className="group relative bg-stone-50 border border-stone-200/60 rounded-lg px-3 py-2 text-[13px] text-stone-600 pr-8 shadow-sm">
                                <div className="line-clamp-2 leading-relaxed">{line.text}</div>
                                <button 
                                    onClick={() => toggleLineSelection(id)} 
                                    className="absolute right-2 top-1/2 -translate-y-1/2 text-stone-300 hover:text-stone-500 opacity-0 group-hover:opacity-100 transition-all"
                                >
                                    <X size={14} />
                                </button>
                            </div>
                        );
                    })}
                </div>
             </div>
          )}

          <div className="relative">
            <textarea 
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder={selectedLineIds.length > 0 ? "关于这段内容..." : "输入消息..."}
                className="w-full bg-stone-50 border border-stone-200/60 rounded-xl px-4 py-3.5 pr-12 text-[15px] focus:outline-none focus:border-stone-300 focus:ring-2 focus:ring-stone-100 resize-none shadow-sm transition-all"
                rows={3}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                    }
                }}
            />
            {isLoading ? (
                <button 
                    onClick={handleStop}
                    className="absolute right-3 bottom-3 p-2 bg-stone-100 text-stone-500 rounded-lg hover:bg-stone-200 hover:text-stone-700 transition-colors border border-stone-200"
                    title="停止生成"
                >
                    <Square size={16} className="fill-current" />
                </button>
            ) : (
                <button 
                    onClick={() => handleSendMessage()}
                    disabled={!inputMessage.trim() && selectedLineIds.length === 0}
                    className="absolute right-3 bottom-3 p-2 bg-stone-800 text-white rounded-lg hover:bg-black disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                >
                    <Send size={16} />
                </button>
            )}
          </div>
          
          <div className="mt-3 flex justify-between items-center px-1">
             <div className="text-[11px] text-stone-400 font-mono tracking-wide">
                {currentConfig?.model || 'No Model'}
             </div>
             <div className="flex gap-3">
                <button onClick={handleExport} className="text-stone-400 hover:text-stone-600 transition-colors" title="导出记录">
                    <Download size={14} />
                </button>
                <button onClick={() => fileInputRef.current?.click()} className="text-stone-400 hover:text-stone-600 transition-colors" title="导入记录">
                    <Upload size={14} />
                </button>
                <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept=".json" 
                    onChange={handleImport} 
                />
             </div>
          </div>
       </div>
    </div>
  );
};
