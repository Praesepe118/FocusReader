import React, { useState, useEffect } from 'react';
import { useAIStore, AIConfig } from '../../store/useAIStore';
import { X, Save, RefreshCw, Plus, Trash2, Check } from 'lucide-react';
import { fetchModels } from '../../lib/aiService';
import { cn } from '../../lib/utils';

export const ChatSettings = () => {
  const { 
    configs, 
    currentConfigId, 
    addConfig, 
    updateConfig, 
    removeConfig, 
    setCurrentConfigId,
    toggleSettings 
  } = useAIStore();

  const [editingConfig, setEditingConfig] = useState<Partial<AIConfig>>({
    name: 'New Config',
    baseUrl: 'https://api.openai.com/v1',
    apiKey: '',
    model: 'gpt-3.5-turbo',
    systemPrompt: '你是一个专业的阅读助手。用户正在阅读一本书，并会向你提问。\n请根据用户提供的书籍内容、用户的阅读进度以及用户的随笔笔记来回答问题。\n回答应简洁、深刻，富有禅意，与阅读器的整体风格保持一致。'
  });

  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [isLoadingModels, setIsLoadingModels] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  // Load current config into editor when selected
  useEffect(() => {
    if (currentConfigId) {
      const config = configs.find(c => c.id === currentConfigId);
      if (config) {
        setEditingConfig(config);
        setIsDirty(false);
      }
    }
  }, [currentConfigId, configs]);

  const handleSave = () => {
    if (currentConfigId) {
      updateConfig(currentConfigId, editingConfig);
    } else {
      addConfig(editingConfig as Omit<AIConfig, 'id'>);
    }
    setIsDirty(false);
  };

  const handleCreateNew = () => {
    setCurrentConfigId(''); // Deselect
    setEditingConfig({
      name: 'New Config',
      baseUrl: 'https://api.openai.com/v1',
      apiKey: '',
      model: 'gpt-3.5-turbo',
      systemPrompt: '你是一个专业的阅读助手。'
    });
    setIsDirty(true);
  };

  const handleFetchModels = async () => {
    if (!editingConfig.baseUrl || !editingConfig.apiKey) return;
    setIsLoadingModels(true);
    try {
      const models = await fetchModels(editingConfig.baseUrl, editingConfig.apiKey);
      setAvailableModels(models);
      if (models.length > 0 && !models.includes(editingConfig.model || '')) {
         setEditingConfig(prev => ({ ...prev, model: models[0] }));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingModels(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-stone-50 text-stone-700">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-stone-200">
        <h2 className="text-lg font-serif font-medium">AI 设置</h2>
        <button onClick={toggleSettings} className="p-1 hover:bg-stone-200 rounded-full transition-colors">
          <X size={20} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Profile Selector */}
        <div className="space-y-2">
          <label className="text-xs font-mono text-stone-500 uppercase">配置档案</label>
          <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
            {configs.map(config => (
              <button
                key={config.id}
                onClick={() => setCurrentConfigId(config.id)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-sm whitespace-nowrap transition-colors border",
                  currentConfigId === config.id 
                    ? "bg-amber-100 border-amber-300 text-amber-900" 
                    : "bg-white border-stone-200 text-stone-600 hover:bg-stone-100"
                )}
              >
                {config.name}
              </button>
            ))}
            <button
              onClick={handleCreateNew}
              className="px-3 py-1.5 rounded-lg text-sm whitespace-nowrap border border-dashed border-stone-300 text-stone-500 hover:bg-stone-100 flex items-center gap-1"
            >
              <Plus size={14} /> 新建
            </button>
          </div>
        </div>

        {/* Form */}
        <div className="space-y-4 bg-white p-4 rounded-xl border border-stone-200 shadow-sm">
          <div className="space-y-1">
            <label className="text-xs font-mono text-stone-500">配置名称</label>
            <input 
              type="text" 
              value={editingConfig.name}
              onChange={e => { setEditingConfig({...editingConfig, name: e.target.value}); setIsDirty(true); }}
              className="w-full px-3 py-2 rounded-lg bg-stone-50 border border-stone-200 focus:outline-none focus:border-amber-400 text-sm"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-mono text-stone-500">API Base URL</label>
            <input 
              type="text" 
              value={editingConfig.baseUrl}
              onChange={e => { setEditingConfig({...editingConfig, baseUrl: e.target.value}); setIsDirty(true); }}
              placeholder="https://api.openai.com/v1"
              className="w-full px-3 py-2 rounded-lg bg-stone-50 border border-stone-200 focus:outline-none focus:border-amber-400 text-sm font-mono"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-mono text-stone-500">API Key</label>
            <input 
              type="password" 
              value={editingConfig.apiKey}
              onChange={e => { setEditingConfig({...editingConfig, apiKey: e.target.value}); setIsDirty(true); }}
              className="w-full px-3 py-2 rounded-lg bg-stone-50 border border-stone-200 focus:outline-none focus:border-amber-400 text-sm font-mono"
            />
          </div>

          <div className="space-y-1">
            <div className="flex justify-between items-center">
                <label className="text-xs font-mono text-stone-500">模型</label>
                <button 
                    onClick={handleFetchModels}
                    disabled={isLoadingModels || !editingConfig.apiKey}
                    className="text-[10px] text-amber-600 hover:text-amber-700 flex items-center gap-1 disabled:opacity-50"
                >
                    <RefreshCw size={10} className={isLoadingModels ? "animate-spin" : ""} /> 获取列表
                </button>
            </div>
            <div className="relative">
                {availableModels.length > 0 ? (
                    <div className="flex flex-col gap-2">
                        <select
                            value={availableModels.includes(editingConfig.model || '') ? editingConfig.model : 'custom'}
                            onChange={e => { 
                                if (e.target.value === 'custom') {
                                    setEditingConfig({...editingConfig, model: ''});
                                } else {
                                    setEditingConfig({...editingConfig, model: e.target.value}); 
                                }
                                setIsDirty(true); 
                            }}
                            className="w-full px-3 py-2 rounded-lg bg-stone-50 border border-stone-200 focus:outline-none focus:border-amber-400 text-sm font-mono appearance-none"
                        >
                            {availableModels.map(m => <option key={m} value={m}>{m}</option>)}
                            <option value="custom">自定义...</option>
                        </select>
                        {(!availableModels.includes(editingConfig.model || '') || editingConfig.model === '') && (
                            <input 
                                type="text" 
                                value={editingConfig.model}
                                onChange={e => { setEditingConfig({...editingConfig, model: e.target.value}); setIsDirty(true); }}
                                placeholder="输入自定义模型名称"
                                className="w-full px-3 py-2 rounded-lg bg-stone-50 border border-stone-200 focus:outline-none focus:border-amber-400 text-sm font-mono"
                            />
                        )}
                    </div>
                ) : (
                    <input 
                        type="text" 
                        value={editingConfig.model}
                        onChange={e => { setEditingConfig({...editingConfig, model: e.target.value}); setIsDirty(true); }}
                        placeholder="输入模型名称 (如 gpt-3.5-turbo)"
                        className="w-full px-3 py-2 rounded-lg bg-stone-50 border border-stone-200 focus:outline-none focus:border-amber-400 text-sm font-mono"
                    />
                )}
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-mono text-stone-500">身份提示词 (System Prompt)</label>
            <textarea 
              value={editingConfig.systemPrompt}
              onChange={e => { setEditingConfig({...editingConfig, systemPrompt: e.target.value}); setIsDirty(true); }}
              rows={5}
              className="w-full px-3 py-2 rounded-lg bg-stone-50 border border-stone-200 focus:outline-none focus:border-amber-400 text-sm resize-none leading-relaxed"
            />
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="p-4 border-t border-stone-200 flex justify-between items-center bg-stone-50">
        {currentConfigId && (
            <button 
                onClick={() => removeConfig(currentConfigId)}
                className="p-2 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                title="删除配置"
            >
                <Trash2 size={18} />
            </button>
        )}
        <div className="flex gap-3 ml-auto">
            <button 
                onClick={toggleSettings}
                className="px-4 py-2 text-sm text-stone-500 hover:text-stone-800"
            >
                取消
            </button>
            <button 
                onClick={handleSave}
                disabled={!isDirty && !!currentConfigId}
                className={cn(
                    "px-4 py-2 rounded-lg text-sm flex items-center gap-2 transition-all",
                    isDirty || !currentConfigId
                        ? "bg-stone-800 text-white hover:bg-black shadow-md" 
                        : "bg-stone-200 text-stone-400 cursor-not-allowed"
                )}
            >
                <Save size={16} /> 保存
            </button>
        </div>
      </div>
    </div>
  );
};
