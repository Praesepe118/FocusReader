import { supabase } from './supabase';

export interface Book {
  id: string;
  user_id: string;
  title: string;
  storage_path: string;
  progress: number;
  total_lines: number;
  created_at: string;
  updated_at: string;
}

export const bookshelfService = {
  /**
   * 上传新书籍到云端
   */
  async uploadBook(userId: string, title: string, content: string): Promise<Book> {
    const fileName = `${userId}/${Date.now()}-${title}.txt`;

    // 1. 上传文本内容到 Supabase Storage
    const { error: storageError } = await supabase.storage
      .from('books')
      .upload(fileName, content, {
        contentType: 'text/plain',
        upsert: true
      });

    if (storageError) throw storageError;

    // 2. 在数据库中创建书籍记录
    const { data: bookData, error: dbError } = await supabase
      .from('books')
      .insert([{
        user_id: userId,
        title,
        storage_path: fileName,
        progress: 0,
        total_lines: content.split('\n').filter(l => l.trim() !== '').length,
        lines_data: [], // 存储每行的阅读状态、笔记等
        chat_history: [] // 存储该书的 AI 聊天记录
      }])
      .select()
      .single();

    if (dbError) throw dbError;
    return bookData as Book;
  },

  /**
   * 获取用户的书架列表
   */
  async getBooks(userId: string): Promise<Book[]> {
    const { data, error } = await supabase
      .from('books')
      .select('id, user_id, title, storage_path, progress, total_lines, created_at, updated_at')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    if (error) throw error;
    return data as Book[];
  },

  /**
   * 下载书籍文本内容
   */
  async getBookContent(storagePath: string): Promise<string> {
    const { data, error } = await supabase.storage
      .from('books')
      .download(storagePath);

    if (error) throw error;
    return await data.text();
  },

  /**
   * 删除书籍
   */
  async deleteBook(bookId: string, storagePath: string): Promise<void> {
    // 1. 从 Storage 删除文件
    const { error: storageError } = await supabase.storage
      .from('books')
      .remove([storagePath]);

    if (storageError) console.error('Failed to delete from storage:', storageError);

    // 2. 从数据库删除记录
    const { error: dbError } = await supabase
      .from('books')
      .delete()
      .eq('id', bookId);

    if (dbError) throw dbError;
  }
};
