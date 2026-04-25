import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { register as registerApi } from '../../services/api';
import { Brain, Sparkles, BookOpen, Check, Lock, User } from 'lucide-react';

const AnimatedBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-black-main to-purple-900/20" />
      <div className="absolute top-1/4 -right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-[128px] animate-float-slow" />
      <div className="absolute bottom-1/4 -left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-[128px] animate-float-slow-delayed" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gold-500/5 rounded-full blur-[150px] animate-pulse-slow" />
      
      {[...Array(12)].map((_, i) => (
        <div
          key={i}
          className="absolute w-1 h-1 bg-blue-500/40 rounded-full animate-float-particle"
          style={{
            left: `${15 + i * 6}%`,
            top: `${25 + (i % 4) * 20}%`,
            animationDelay: `${i * 0.4}s`,
            animationDuration: `${7 + i * 0.3}s`,
          }}
        />
      ))}
    </div>
  );
};

const Register: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const { login } = useAuth();
  const navigate = useNavigate();

  const passwordRequirements = [
    { met: password.length >= 6, text: '至少6个字符' },
    { met: /[A-Z]/.test(password), text: '包含大写字母' },
    { met: /[0-9]/.test(password), text: '包含数字' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('两次输入的密码不一致');
      return;
    }

    setLoading(true);

    try {
      const response = await registerApi({ username, password });
      login(response.token, response.user);
      
      if (!response.user.prepTarget) {
          navigate('/onboarding');
      } else {
          navigate('/');
      }
    } catch (err: any) {
      setError(err.message || '注册失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden py-8">
      <AnimatedBackground />
      
      <div className="absolute top-10 right-10 animate-float">
        <Sparkles className="w-12 h-12 text-blue-500/20" />
      </div>
      <div className="absolute bottom-10 left-10 animate-float-delayed">
        <Brain className="w-16 h-16 text-purple-500/20" />
      </div>
      
      <div className="relative z-10 w-full max-w-md mx-4">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-400 to-purple-500 mb-4 shadow-lg shadow-purple-500/30">
            <BookOpen className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 mb-2">
            加入 SmartStudy
          </h1>
          <p className="text-gray-400 text-sm">开启您的智能学习之旅</p>
        </div>
        
        {/* Register Card */}
        <div className="relative backdrop-blur-xl bg-black-card/80 border border-gray-800/50 rounded-2xl p-8 shadow-2xl shadow-black/50">
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500/5 to-purple-500/5 pointer-events-none" />
          
          <div className="relative">
            <h2 className="text-2xl font-bold text-white mb-2 text-center">创建账户</h2>
            <p className="text-gray-400 text-sm text-center mb-6">注册后立即开始学习</p>
            
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded-lg mb-4 text-sm flex items-center gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="relative group">
                <label className="block text-xs font-medium text-gray-400 mb-2 ml-1 uppercase tracking-wider flex items-center gap-1">
                  <User className="w-3 h-3" />
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
                        ? 'border-blue-500/50 shadow-[0_0_20px_rgba(59,130,246,0.1)]' 
                        : 'border-gray-700 hover:border-gray-600'
                    }`}
                    placeholder="选择一个用户名"
                    required
                  />
                </div>
              </div>
              
              <div className="relative group">
                <label className="block text-xs font-medium text-gray-400 mb-2 ml-1 uppercase tracking-wider flex items-center gap-1">
                  <Lock className="w-3 h-3" />
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
                        ? 'border-blue-500/50 shadow-[0_0_20px_rgba(59,130,246,0.1)]' 
                        : 'border-gray-700 hover:border-gray-600'
                    }`}
                    placeholder="创建密码"
                    required
                  />
                </div>
                
                {/* Password strength indicator */}
                {password && (
                  <div className="mt-2 flex gap-1">
                    {[0, 1, 2].map((i) => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                          passwordRequirements.filter(r => r.met).length > i
                            ? passwordRequirements.filter(r => r.met).length === 3
                              ? 'bg-green-500'
                              : 'bg-yellow-500'
                            : 'bg-gray-700'
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>

              {password && (
                <div className="bg-black-light/30 rounded-lg p-3 space-y-1.5">
                  {passwordRequirements.map((req, i) => (
                    <div key={i} className={`flex items-center gap-2 text-xs ${req.met ? 'text-green-400' : 'text-gray-500'}`}>
                      <Check className={`w-3 h-3 ${req.met ? 'opacity-100' : 'opacity-30'}`} />
                      {req.text}
                    </div>
                  ))}
                </div>
              )}

              <div className="relative group">
                <label className="block text-xs font-medium text-gray-400 mb-2 ml-1 uppercase tracking-wider flex items-center gap-1">
                  <Lock className="w-3 h-3" />
                  确认密码
                </label>
                <div className="relative">
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    onFocus={() => setFocusedField('confirm')}
                    onBlur={() => setFocusedField(null)}
                    className={`w-full bg-black-light/50 border rounded-lg px-4 py-3 text-gray-200 outline-none transition-all duration-300 ${
                      focusedField === 'confirm' 
                        ? 'border-blue-500/50 shadow-[0_0_20px_rgba(59,130,246,0.1)]' 
                        : confirmPassword && password !== confirmPassword
                          ? 'border-red-500/50'
                          : confirmPassword && password === confirmPassword
                            ? 'border-green-500/50'
                            : 'border-gray-700 hover:border-gray-600'
                    }`}
                    placeholder="再次输入密码"
                    required
                  />
                  {confirmPassword && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      {password === confirmPassword ? (
                        <Check className="w-5 h-5 text-green-400" />
                      ) : (
                        <div className="w-5 h-5 rounded-full border-2 border-red-500/50" />
                      )}
                    </div>
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || (password !== confirmPassword && confirmPassword !== '')}
                className="group relative w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold py-3 rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/30 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      注册中...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      创建账户
                    </>
                  )}
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </button>
            </form>

            <div className="mt-6 text-center text-sm">
              <span className="text-gray-500">已有账户？</span>
              <Link to="/login" className="text-blue-400 hover:text-blue-300 font-medium ml-1 hover:underline underline-offset-4 transition-colors">
                立即登录
              </Link>
            </div>
          </div>
        </div>
        
        {/* Features hint */}
        <div className="mt-6 flex items-center justify-center gap-4 text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 bg-green-400 rounded-full" />
            <span>AI 智能辅导</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 bg-blue-400 rounded-full" />
            <span>数据可视化</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 bg-purple-400 rounded-full" />
            <span>个性化学习</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
