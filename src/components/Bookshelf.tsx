import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Book, bookshelfService } from '../lib/bookshelfService';
import { cloudSyncService } from '../lib/cloudSyncService';
import { useAuthStore } from '../store/useAuthStore';
import { useReaderStore } from '../store/useReaderStore';
import { useAIStore } from '../store/useAIStore';
import { BookOpen, Plus, Trash2, Loader2, FileText, UploadCloud } from 'lucide-react';

export const Bookshelf = () => {
  const user = useAuthStore((state) => state.user);
  
  const setRawText = useReaderStore((state) => state.setRawText);
  const setLines = useReaderStore((state) => state.setLines);
  const setCurrentLineIndex = useReaderStore((state) => state.setCurrentLineIndex);
  const setCurrentBookId = useReaderStore((state) => state.setCurrentBookId);
  
  const [books, setBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadContent, setUploadContent] = useState('');

  useEffect(() => {
    if (user) {
      loadBooks();
    }
  }, [user]);

  const loadBooks = async () => {
    try {
      setIsLoading(true);
      const data = await bookshelfService.getBooks(user!.id);
      setBooks(data);
    } catch (error) {
      console.error('Failed to load books:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpload = async () => {
    if (!uploadTitle.trim() || !uploadContent.trim() || !user) return;
    try {
      setIsUploading(true);
      await bookshelfService.uploadBook(user.id, uploadTitle, uploadContent);
      setShowUpload(false);
      setUploadTitle('');
      setUploadContent('');
      await loadBooks();
    } catch (error) {
      console.error('Upload failed:', error);
      alert('上传失败，请重试');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (bookId: string, storagePath: string) => {
    if (!window.confirm('确定要删除这本书吗？云端数据将一并删除。')) return;
    try {
      await bookshelfService.deleteBook(bookId, storagePath);
      await loadBooks();
    } catch (error) {
      console.error('Delete failed:', error);
      alert('删除失败');
    }
  };

  const handleRead = async (book: Book) => {
    try {
      setIsLoading(true);
      // 1. 获取文本内容
      const content = await bookshelfService.getBookContent(book.storage_path);
      
      // 2. 获取云端同步数据（进度、笔记等）
      const syncData = await cloudSyncService.getBookSyncData(book.id);

      // 3. 更新本地状态
      setCurrentBookId(book.id);
      setRawText(content);
      
      if (syncData?.lines_data && syncData.lines_data.length > 0) {
        setLines(syncData.lines_data);
      }
      if (syncData?.progress !== undefined) {
        setCurrentLineIndex(syncData.progress);
      }
      
      // 4. 恢复 AI 聊天记录
      if (syncData?.chat_history) {
        useAIStore.setState({ sessions: syncData.chat_history });
      } else {
        useAIStore.setState({ sessions: [] });
      }
    } catch (error) {
      console.error('Failed to open book:', error);
      alert('打开书籍失败');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && books.length === 0) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-stone-400" />
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-serif italic text-stone-700 flex items-center gap-3">
          <BookOpen className="text-stone-400" />
          我的书架
        </h2>
        <button
          onClick={() => setShowUpload(!showUpload)}
          className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl font-medium transition-colors flex items-center gap-2 text-sm"
        >
          {showUpload ? '取消上传' : <><Plus size={16} /> 上传新书</>}
        </button>
      </div>

      {showUpload && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mb-8 bg-white/60 backdrop-blur-md p-6 rounded-2xl border border-stone-200 shadow-sm"
        >
          <div className="space-y-4">
            <input
              type="text"
              placeholder="书籍名称"
              value={uploadTitle}
              onChange={(e) => setUploadTitle(e.target.value)}
              className="w-full px-4 py-2 bg-white/50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-stone-400 outline-none"
            />
            <textarea
              placeholder="在此粘贴书籍文本内容..."
              value={uploadContent}
              onChange={(e) => setUploadContent(e.target.value)}
              className="w-full h-40 px-4 py-3 bg-white/50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-stone-400 outline-none resize-none"
            />
            <button
              onClick={handleUpload}
              disabled={isUploading || !uploadTitle.trim() || !uploadContent.trim()}
              className="w-full py-3 bg-stone-700 hover:bg-stone-800 disabled:opacity-50 text-white rounded-xl font-medium transition-all flex items-center justify-center gap-2"
            >
              {isUploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <UploadCloud size={18} />}
              确认上传到云端
            </button>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {books.map((book) => (
          <motion.div
            key={book.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white/60 backdrop-blur-sm p-5 rounded-2xl border border-stone-200 shadow-sm hover:shadow-md transition-all group flex flex-col"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-stone-100 rounded-xl text-stone-500">
                <FileText size={24} />
              </div>
              <button
                onClick={() => handleDelete(book.id, book.storage_path)}
                className="p-2 text-stone-300 hover:text-red-500 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                title="删除书籍"
              >
                <Trash2 size={16} />
              </button>
            </div>
            
            <h3 className="font-medium text-stone-800 mb-1 line-clamp-1" title={book.title}>
              {book.title}
            </h3>
            
            <div className="text-xs text-stone-400 mb-4 flex justify-between items-center">
              <span>{new Date(book.created_at).toLocaleDateString()}</span>
              <span>{book.total_lines} 行</span>
            </div>

            <div className="mt-auto">
              <div className="w-full bg-stone-100 rounded-full h-1.5 mb-3">
                <div 
                  className="bg-stone-400 h-1.5 rounded-full" 
                  style={{ width: `${Math.min(100, Math.max(0, (book.progress / book.total_lines) * 100))}%` }}
                />
              </div>
              <button
                onClick={() => handleRead(book)}
                className="w-full py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-sm font-medium transition-colors"
              >
                {book.progress > 0 ? '继续阅读' : '开始阅读'}
              </button>
            </div>
          </motion.div>
        ))}
        
        {books.length === 0 && !showUpload && !isLoading && (
          <div className="col-span-full py-12 text-center text-stone-400 border-2 border-dashed border-stone-200 rounded-2xl">
            <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>书架空空如也，点击上方按钮上传新书吧</p>
          </div>
        )}
      </div>
    </div>
  );
};
