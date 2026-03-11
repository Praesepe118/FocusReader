import React, { useState } from 'react';
import { motion } from 'motion/react';
import { BookOpen, Mail, Lock, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

export const AuthScreen = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setMessage(null);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        setMessage('注册成功！请检查您的邮箱进行验证。');
      }
    } catch (err: any) {
      setError(err.message || '发生错误，请重试');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center max-w-md mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="w-full space-y-8"
      >
        <div className="space-y-4">
          <div className="flex justify-center mb-6">
            <div className="p-5 bg-white/50 backdrop-blur-xl rounded-3xl shadow-xl shadow-stone-200/50 border border-white/60">
              <BookOpen className="w-12 h-12 text-stone-500" strokeWidth={1.5} />
            </div>
          </div>
          <h1 className="text-4xl font-serif italic tracking-tight text-stone-700">
            Focus Reader
          </h1>
          <p className="text-stone-500 text-sm">
            {isLogin ? '欢迎回来，请登录您的账号' : '创建一个新账号开始阅读'}
          </p>
        </div>

        <div className="w-full bg-white/40 backdrop-blur-md rounded-3xl shadow-2xl shadow-stone-200/50 p-8 border border-white/60 text-left">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl">
                {error}
              </div>
            )}
            {message && (
              <div className="p-3 text-sm text-emerald-600 bg-emerald-50 border border-emerald-100 rounded-xl">
                {message}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium text-stone-600 ml-1">邮箱地址</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-stone-400" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-stone-200 rounded-xl bg-white/50 focus:ring-2 focus:ring-stone-400 focus:border-transparent transition-all text-stone-700 placeholder:text-stone-400"
                  placeholder="your@email.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-stone-600 ml-1">密码</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-stone-400" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-stone-200 rounded-xl bg-white/50 focus:ring-2 focus:ring-stone-400 focus:border-transparent transition-all text-stone-700 placeholder:text-stone-400"
                  placeholder="••••••••"
                  minLength={6}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-stone-700 hover:bg-stone-800 disabled:opacity-50 text-white rounded-xl font-medium transition-all transform active:scale-[0.98] shadow-lg shadow-stone-300/50 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                isLogin ? '登录' : '注册'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setError(null);
                setMessage(null);
              }}
              className="text-sm text-stone-500 hover:text-stone-800 transition-colors"
            >
              {isLogin ? '没有账号？点击注册' : '已有账号？点击登录'}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
