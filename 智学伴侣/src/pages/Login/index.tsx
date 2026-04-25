import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { login as loginApi } from '../../services/api';
import { Brain, Sparkles, BookOpen } from 'lucide-react';

const AnimatedBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black-main to-blue-900/20" />
      <div className="absolute top-1/4 -left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-[128px] animate-float-slow" />
      <div className="absolute bottom-1/4 -right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-[128px] animate-float-slow-delayed" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gold-500/5 rounded-full blur-[150px] animate-pulse-slow" />
      
      {/* Floating particles */}
      {[...Array(12)].map((_, i) => (
        <div
          key={i}
          className="absolute w-1 h-1 bg-gold-500/40 rounded-full animate-float-particle"
          style={{
            left: `${10 + i * 7}%`,
            top: `${20 + (i % 3) * 25}%`,
            animationDelay: `${i * 0.3}s`,
            animationDuration: `${6 + i * 0.5}s`,
          }}
        />
      ))}
    </div>
  );
};

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await loginApi({ username, password });
      login(response.token, response.user);
      
      if (!response.user.prepTarget) {
          navigate('/onboarding');
      } else {
          navigate('/');
      }
    } catch (err: any) {
      setError(err.message || '登录失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      <AnimatedBackground />
      
      {/* Decorative elements */}
      <div className="absolute top-10 left-10 animate-float">
        <BookOpen className="w-12 h-12 text-gold-500/20" />
      </div>
      <div className="absolute bottom-10 right-10 animate-float-delayed">
        <Brain className="w-16 h-16 text-purple-500/20" />
      </div>
      
      <div className="relative z-10 w-full max-w-md mx-4">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-gold-400 to-gold-600 mb-4 shadow-lg shadow-gold-500/30">
            <BookOpen className="w-8 h-8 text-black-main" />
          </div>
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gold-gradient mb-2">
            SmartStudy
          </h1>
          <p className="text-gray-400 text-sm">智能学习伴侣 · 让学习更高效</p>
        </div>
        
        {/* Login Card */}
        <div className="relative backdrop-blur-xl bg-black-card/80 border border-gray-800/50 rounded-2xl p-8 shadow-2xl shadow-black/50">
          {/* Glow effect */}
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-gold-500/5 to-purple-500/5 pointer-events-none" />
          
          <div className="relative">
            <h2 className="text-2xl font-bold text-white mb-2 text-center">欢迎回来</h2>
            <p className="text-gray-400 text-sm text-center mb-6">登录您的账户继续学习</p>
            
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded-lg mb-4 text-sm flex items-center gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="relative group">
                <label className="block text-xs font-medium text-gray-400 mb-2 ml-1 uppercase tracking-wider">
                  用户名
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    onFocus={() => setFocusedField('username')}
                    onBlur={() => setFocusedField(null)}
                    className={`w-full bg-black-light/50 border rounded-lg px-4 py-3 text-gray-200 outline-none transition-all duration-300 ${
                      focusedField === 'username' 
                        ? 'border-gold-500/50 shadow-[0_0_20px_rgba(212,175,55,0.1)]' 
                        : 'border-gray-700 hover:border-gray-600'
                    }`}
                    placeholder="请输入用户名"
                    required
                  />
                  <div className={`absolute inset-0 rounded-lg pointer-events-none transition-opacity duration-300 ${
                    focusedField === 'username' ? 'opacity-100' : 'opacity-0'
                  }`}>
                    <div className="absolute top-0 left-0 w-full h-full rounded-lg border-2 border-gold-500/30 animate-pulse" />
                  </div>
                </div>
              </div>
              
              <div className="relative group">
                <label className="block text-xs font-medium text-gray-400 mb-2 ml-1 uppercase tracking-wider">
                  密码
                </label>
                <div className="relative">
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setFocusedField('password')}
                    onBlur={() => setFocusedField(null)}
                    className={`w-full bg-black-light/50 border rounded-lg px-4 py-3 text-gray-200 outline-none transition-all duration-300 ${
                      focusedField === 'password' 
                        ? 'border-gold-500/50 shadow-[0_0_20px_rgba(212,175,55,0.1)]' 
                        : 'border-gray-700 hover:border-gray-600'
                    }`}
                    placeholder="请输入密码"
                    required
                  />
                  <div className={`absolute inset-0 rounded-lg pointer-events-none transition-opacity duration-300 ${
                    focusedField === 'password' ? 'opacity-100' : 'opacity-0'
                  }`}>
                    <div className="absolute top-0 left-0 w-full h-full rounded-lg border-2 border-gold-500/30 animate-pulse" />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="group relative w-full bg-gradient-to-r from-gold-500 to-gold-600 text-black-main font-bold py-3 rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-gold-500/30 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-black-main/30 border-t-black-main rounded-full animate-spin" />
                      登录中...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 group-hover:animate-spin" />
                      登录
                    </>
                  )}
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-gold-400 to-gold-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </button>
            </form>

            <div className="mt-6 text-center text-sm">
              <span className="text-gray-500">还没有账号？</span>
              <Link to="/register" className="text-gold-400 hover:text-gold-300 font-medium ml-1 hover:underline underline-offset-4 transition-colors">
                立即注册
              </Link>
            </div>
          </div>
        </div>
        
        {/* AI Assistant hint */}
        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-gray-500">
          <Brain className="w-4 h-4 text-purple-400" />
          <span>AI 驱动的智能学习平台</span>
        </div>
      </div>
    </div>
  );
};

export default Login;
