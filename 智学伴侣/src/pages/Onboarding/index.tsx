import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, GraduationCap, School, Briefcase, Sparkles, Brain, Check, ChevronRight, Bot, Zap, Target } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { updateProfile } from '../../services/api';
import { TaskCategory } from '../../types';

interface TargetOption {
  key: TaskCategory;
  title: string;
  desc: string;
  subDesc: string;
  icon: React.ReactNode;
  color: string;
  gradient: string;
  borderGlow: string;
}

const Onboarding: React.FC = () => {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [selectedTarget, setSelectedTarget] = useState<TaskCategory | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSelect = async (target: TaskCategory) => {
    if (!user) return;
    setSelectedTarget(target);
    setLoading(true);
    try {
        const updatedUser = await updateProfile({ prepTarget: target });
        updateUser(updatedUser);
        navigate('/');
    } catch (error: any) {
        console.error("Failed to set prep target:", error);
        alert(`设置目标失败: ${error.message || '未知错误'}`);
    } finally {
        setLoading(false);
    }
  };

  const targets: TargetOption[] = [
    { 
        key: '中考', 
        title: '中考冲刺', 
        desc: '夯实基础，决胜中考',
        subDesc: '系统复习初中全部知识点，查漏补缺，冲刺理想高中',
        icon: <BookOpen size={40} />, 
        color: 'text-green-400',
        gradient: 'from-green-500/20 to-green-600/5',
        borderGlow: 'hover:shadow-green-500/30'
    },
    { 
        key: '高考', 
        title: '高考备战', 
        desc: '全力以赴，金榜题名',
        subDesc: '高中知识体系全面覆盖，重点难点逐一突破',
        icon: <School size={40} />, 
        color: 'text-orange-400',
        gradient: 'from-orange-500/20 to-orange-600/5',
        borderGlow: 'hover:shadow-orange-500/30'
    },
    { 
        key: '考研', 
        title: '考研上岸', 
        desc: '深造之路，研途有你',
        subDesc: '考研全科备考规划，政治+英语+专业课一站式服务',
        icon: <GraduationCap size={40} />, 
        color: 'text-blue-400',
        gradient: 'from-blue-500/20 to-blue-600/5',
        borderGlow: 'hover:shadow-blue-500/30'
    },
    { 
        key: '考公', 
        title: '考公必胜', 
        desc: '公职之路，为民服务',
        subDesc: '行政职业能力测试+申论，科学备考策略',
        icon: <Briefcase size={40} />, 
        color: 'text-red-400',
        gradient: 'from-red-500/20 to-red-600/5',
        borderGlow: 'hover:shadow-red-500/30'
    },
  ];

  return (
    <div className="min-h-screen bg-black-main flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[128px] animate-float-slow" />
        <div className="absolute bottom-1/4 -right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[128px] animate-float-slow-delayed" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gold-500/5 rounded-full blur-[200px] animate-pulse-slow" />
      </div>

      {/* AI Assistant Avatar */}
      <div className={`relative mb-8 transition-all duration-1000 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <div className="relative">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 via-blue-500 to-gold-500 p-1 shadow-2xl shadow-purple-500/30 animate-float">
            <div className="w-full h-full rounded-full bg-black-main flex items-center justify-center">
              <Brain className="w-12 h-12 text-transparent bg-clip-text bg-gradient-to-br from-purple-400 to-blue-400" />
            </div>
          </div>
          <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center border-4 border-black-main animate-pulse">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div className="absolute -top-1 -left-1 w-3 h-3 bg-gold-500 rounded-full animate-ping" />
        </div>
      </div>

      {/* Header */}
      <div className={`text-center mb-10 transition-all duration-1000 delay-200 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/30 mb-4">
          <Bot className="w-4 h-4 text-purple-400" />
          <span className="text-sm text-purple-300">AI 学习助手</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
          欢迎来到 <span className="bg-clip-text text-transparent bg-gold-gradient">智学伴侣</span>
        </h1>
        <p className="text-gray-400 max-w-md mx-auto">
          让我为您量身定制学习计划，请选择您当前的备考目标
        </p>
      </div>

      {/* Target Cards */}
      <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl transition-all duration-1000 delay-400 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        {targets.map((target, index) => (
            <button
                key={target.key}
                onClick={() => handleSelect(target.key)}
                disabled={loading}
                className={`group relative flex items-start gap-5 p-6 rounded-2xl border transition-all duration-500 transform hover:-translate-y-1 hover:scale-[1.02] ${
                  selectedTarget === target.key 
                    ? 'bg-gradient-to-br ' + target.gradient + ' border-' + target.color.split('-')[1] + '-500/50 shadow-xl ' + target.borderGlow
                    : 'bg-black-card border-gray-800 hover:border-gray-700'
                } ${loading && selectedTarget !== target.key ? 'opacity-50 cursor-not-allowed' : ''}`}
                style={{ 
                  animationDelay: `${index * 100}ms`,
                  transitionDelay: `${index * 50}ms`
                }}
            >
                {/* Glow effect */}
                <div className={`absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br ${target.gradient}`} />
                
                <div className="relative z-10 flex items-start gap-5 w-full">
                    <div className={`shrink-0 p-4 rounded-2xl bg-black-light/50 backdrop-blur-sm border border-gray-700/50 ${selectedTarget === target.key ? target.color : 'text-gray-400 group-hover:text-gray-300'} transition-colors`}>
                        {target.icon}
                    </div>
                    
                    <div className="flex-1 text-left">
                        <div className="flex items-center gap-2 mb-1">
                            <h3 className={`text-xl font-bold ${selectedTarget === target.key ? target.color : 'text-white'}`}>
                                {target.title}
                            </h3>
                            {selectedTarget === target.key && (
                                <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                                    <Check className="w-3 h-3 text-white" />
                                </div>
                            )}
                        </div>
                        <p className="text-sm text-gray-400 mb-2">{target.desc}</p>
                        <p className="text-xs text-gray-500 leading-relaxed">{target.subDesc}</p>
                    </div>
                    
                    <ChevronRight className={`shrink-0 w-5 h-5 transition-all duration-300 ${selectedTarget === target.key ? 'text-green-400 translate-x-1' : 'text-gray-600 group-hover:text-gray-400 group-hover:translate-x-1'}`} />
                </div>
                
                {/* Selected indicator */}
                {selectedTarget === target.key && (
                    <div className="absolute inset-0 rounded-2xl border-2 border-current animate-pulse" style={{ borderColor: 'inherit' }} />
                )}
            </button>
        ))}
      </div>

      {/* AI Features Preview */}
      <div className={`mt-16 w-full max-w-3xl transition-all duration-1000 delay-600 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <div className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 rounded-2xl border border-purple-500/20 p-6 backdrop-blur-sm">
            <div className="flex items-center justify-center gap-8">
                <div className="flex items-center gap-3 text-gray-400">
                    <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
                        <Brain className="w-5 h-5 text-purple-400" />
                    </div>
                    <div>
                        <div className="text-sm font-medium text-white">AI 智能分析</div>
                        <div className="text-xs text-gray-500">个性化学习路径</div>
                    </div>
                </div>
                
                <div className="h-8 w-px bg-gradient-to-b from-transparent via-purple-500/50 to-transparent" />
                
                <div className="flex items-center gap-3 text-gray-400">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                        <Target className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                        <div className="text-sm font-medium text-white">艾宾浩斯记忆</div>
                        <div className="text-xs text-gray-500">科学复习计划</div>
                    </div>
                </div>
                
                <div className="h-8 w-px bg-gradient-to-b from-transparent via-blue-500/50 to-transparent" />
                
                <div className="flex items-center gap-3 text-gray-400">
                    <div className="w-10 h-10 rounded-xl bg-gold-500/20 flex items-center justify-center">
                        <Zap className="w-5 h-5 text-gold-400" />
                    </div>
                    <div>
                        <div className="text-sm font-medium text-white">沉浸式学习</div>
                        <div className="text-xs text-gray-500">高效专注体验</div>
                    </div>
                </div>
            </div>
        </div>
      </div>

      {/* Loading overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="text-center">
                <div className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto mb-4" />
                <p className="text-white font-medium">正在为您配置学习环境...</p>
                <p className="text-gray-400 text-sm mt-2">这只需要几秒钟</p>
            </div>
        </div>
      )}
    </div>
  );
};

export default Onboarding;
