import { supabase } from './supabase';
import { LineData } from '../store/useReaderStore';

export const cloudSyncService = {
  /**
   * 同步单本书籍的阅读进度、笔记、高亮等数据
   */
  async syncBookData(
    bookId: string,
    progress: number,
    linesData: LineData[]
  ) {
    const { error } = await supabase
      .from('books')
      .update({
        progress,
        lines_data: linesData,
        updated_at: new Date().toISOString()
      })
      .eq('id', bookId);

    if (error) throw error;
  },

  /**
   * 同步单本书籍的 AI 聊天记录
   */
  async syncChatHistory(bookId: string, chatHistory: any[]) {
    const { error } = await supabase
      .from('books')
      .update({
        chat_history: chatHistory,
        updated_at: new Date().toISOString()
      })
      .eq('id', bookId);

    if (error) throw error;
  },

  /**
   * 获取单本书籍的云端数据（进度、笔记、聊天记录等）
   */
  async getBookSyncData(bookId: string) {
    const { data, error } = await supabase
      .from('books')
      .select('progress, lines_data, chat_history')
      .eq('id', bookId)
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * 同步全局 API 配置（例如 Gemini API Key 和模型选择）
   */
  async syncApiConfig(userId: string, apiConfig: any) {
    const { error } = await supabase
      .from('user_settings')
      .upsert({
        user_id: userId,
        api_config: apiConfig,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id' });

    if (error) throw error;
  },

  /**
   * 获取全局 API 配置
   */
  async getApiConfig(userId: string) {
    const { data, error } = await supabase
      .from('user_settings')
      .select('api_config')
      .eq('user_id', userId)
      .single();

    // 如果没有记录，不抛出错误，而是返回 null
    if (error && error.code !== 'PGRST116') throw error; 
    return data?.api_config || null;
  }
};
