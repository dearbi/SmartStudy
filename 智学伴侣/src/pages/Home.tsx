import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, LayoutDashboard, ClipboardList, Sparkles, Zap, Target, Brain, TrendingUp, Award, Clock } from 'lucide-react';

const FloatingParticle: React.FC<{ delay: number; duration: number; left: number; size: number }> = ({ delay, duration, left, size }) => (
  <div
    className="absolute rounded-full bg-gold-500/20 animate-float"
    style={{
      left: `${left}%`,
      bottom: '-20px',
      width: `${size}px`,
      height: `${size}px`,
      animationDelay: `${delay}s`,
      animationDuration: `${duration}s`,
    }}
  />
);

const NeuralNetwork: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    let animationId: number;
    const nodes: { x: number; y: number; vx: number; vy: number }[] = [];
    const nodeCount = 30;
    
    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    
    resize();
    window.addEventListener('resize', resize);
    
    for (let i = 0; i < nodeCount; i++) {
      nodes.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
      });
    }
    
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      nodes.forEach((node, i) => {
        node.x += node.vx;
        node.y += node.vy;
        
        if (node.x < 0 || node.x > canvas.width) node.vx *= -1;
        if (node.y < 0 || node.y > canvas.height) node.vy *= -1;
        
        ctx.beginPath();
        ctx.arc(node.x, node.y, 3, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(212, 175, 55, 0.6)';
        ctx.fill();
        
        nodes.slice(i + 1).forEach(other => {
          const dx = node.x - other.x;
          const dy = node.y - other.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          
          if (dist < 150) {
            ctx.beginPath();
            ctx.moveTo(node.x, node.y);
            ctx.lineTo(other.x, other.y);
            ctx.strokeStyle = `rgba(212, 175, 55, ${0.2 * (1 - dist / 150)})`;
            ctx.stroke();
          }
        });
      });
      
      animationId = requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full opacity-30" />;
};

const Home: React.FC = () => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="relative flex flex-col items-center justify-center py-8 md:py-16 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <NeuralNetwork />
        <div
          className="absolute w-[600px] h-[600px] rounded-full bg-gold-500/5 blur-[100px] pointer-events-none transition-all duration-1000 ease-out"
          style={{
            left: `${((mousePos.x / window.innerWidth) - 0.5) * 200 + 50}%`,
            top: `${((mousePos.y / window.innerHeight) - 0.5) * 200 + 50}%`,
            transform: 'translate(-50%, -50%)',
          }}
        />
        {[...Array(8)].map((_, i) => (
          <FloatingParticle
            key={i}
            delay={i * 0.5}
            duration={8 + i * 2}
            left={10 + i * 12}
            size={4 + (i % 3) * 3}
          />
        ))}
      </div>

      {/* Hero Section */}
      <div className={`relative text-center max-w-4xl mx-auto mb-12 md:mb-20 px-4 transition-all duration-1000 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <div className="inline-flex items-center justify-center px-4 py-1.5 mb-8 rounded-full border border-gold-500/30 bg-gold-500/10 backdrop-blur-sm animate-pulse-glow">
          <div className="relative flex items-center">
            <Brain className="w-4 h-4 text-gold-400 mr-2 animate-pulse" />
            <span className="text-sm font-medium text-gold-300 tracking-wide">AI 智能学习助手</span>
            <span className="ml-2 w-2 h-2 bg-green-400 rounded-full animate-ping" />
          </div>
        </div>
        
        <h1 className="text-5xl md:text-7xl font-bold mb-8 tracking-tight">
          <span className="text-white">重塑你的</span>
          <br className="md:hidden" />
          <span className="bg-clip-text text-transparent bg-gold-gradient ml-2 md:ml-4">
            学习体验
          </span>
        </h1>
        
        <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          智学伴侣为您提供全方位的沉浸式学习环境，融合AI辅助、数据可视化与任务管理，
          让每一次学习都成为享受。
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link 
            to="/learning-cabin" 
            className="group relative px-8 py-4 rounded-full bg-gold-500 hover:bg-gold-400 text-black-main font-bold text-lg transition-all duration-300 shadow-[0_0_20px_rgba(212,175,55,0.3)] hover:shadow-[0_0_40px_rgba(212,175,55,0.6)] transform hover:-translate-y-1"
          >
            <span className="relative z-10 flex items-center">
              <Sparkles className="w-5 h-5 mr-2 animate-spin-slow" />
              开始学习
            </span>
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-gold-400 to-gold-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl" />
          </Link>
          <a 
            href="https://github.com/datawhalechina/easy-vibe" 
            target="_blank" 
            rel="noopener noreferrer"
            className="group px-8 py-4 rounded-full bg-white/5 hover:bg-white/10 text-white font-medium text-lg border border-white/10 transition-all duration-300 backdrop-blur-sm hover:border-gold-500/30"
          >
            <span className="flex items-center">
              了解更多
              <Zap className="w-4 h-4 ml-2 text-gold-400 opacity-0 group-hover:opacity-100 transition-opacity" />
            </span>
          </a>
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto w-full px-4">
        {/* Feature 1 */}
        <Link to="/learning-cabin" className="group relative">
          <div className="absolute inset-0 bg-gold-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="relative h-full bg-black-card border border-gray-800 hover:border-gold-500/50 rounded-2xl p-8 transition-all duration-300 group-hover:-translate-y-2 overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gold-500/10 rounded-full blur-2xl -mr-16 -mt-16" />
            
            <div className="w-14 h-14 bg-black-light border border-gray-700 rounded-xl flex items-center justify-center mb-6 group-hover:border-gold-500/50 group-hover:text-gold-400 transition-colors text-gray-400">
              <BookOpen className="w-7 h-7" />
            </div>
            
            <div className="flex items-center gap-2 mb-3">
              <h3 className="text-2xl font-bold text-white group-hover:text-gold-400 transition-colors">沉浸式学习舱</h3>
              <div className="px-2 py-0.5 bg-purple-500/20 rounded text-[10px] text-purple-400 font-bold">AI</div>
            </div>
            <p className="text-gray-400 leading-relaxed">
              双屏学习体验，左屏笔记，右屏视频。AI实时辅助摘要生成与笔记转换，打造极致专注流。
            </p>
            
            <div className="mt-4 pt-4 border-t border-gray-800/50">
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" /> 智能摘要
                </span>
                <span className="flex items-center gap-1">
                  <Brain className="w-3 h-3" /> AI 分析
                </span>
              </div>
            </div>
          </div>
        </Link>
        
        {/* Feature 2 */}
        <Link to="/dashboard" className="group relative">
          <div className="absolute inset-0 bg-blue-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="relative h-full bg-black-card border border-gray-800 hover:border-blue-500/50 rounded-2xl p-8 transition-all duration-300 group-hover:-translate-y-2 overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl -mr-16 -mt-16" />
            
            <div className="w-14 h-14 bg-black-light border border-gray-700 rounded-xl flex items-center justify-center mb-6 group-hover:border-blue-500/50 group-hover:text-blue-400 transition-colors text-gray-400">
              <LayoutDashboard className="w-7 h-7" />
            </div>
            
            <div className="flex items-center gap-2 mb-3">
              <h3 className="text-2xl font-bold text-white group-hover:text-blue-400 transition-colors">学习数据仪表盘</h3>
              <div className="px-2 py-0.5 bg-blue-500/20 rounded text-[10px] text-blue-400 font-bold">ANALYTICS</div>
            </div>
            <p className="text-gray-400 leading-relaxed">
              全维度学习数据分析，雷达图、热力图直观展示知识掌握度与学习状态，科学指导复习计划。
            </p>
            
            <div className="mt-4 pt-4 border-t border-gray-800/50">
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" /> 进度追踪
                </span>
                <span className="flex items-center gap-1">
                  <Award className="w-3 h-3" /> 能力分析
                </span>
              </div>
            </div>
          </div>
        </Link>
        
        {/* Feature 3 */}
        <Link to="/task-board" className="group relative">
          <div className="absolute inset-0 bg-green-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="relative h-full bg-black-card border border-gray-800 hover:border-green-500/50 rounded-2xl p-8 transition-all duration-300 group-hover:-translate-y-2 overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full blur-2xl -mr-16 -mt-16" />
            
            <div className="w-14 h-14 bg-black-light border border-gray-700 rounded-xl flex items-center justify-center mb-6 group-hover:border-green-500/50 group-hover:text-green-400 transition-colors text-gray-400">
              <ClipboardList className="w-7 h-7" />
            </div>
            
            <div className="flex items-center gap-2 mb-3">
              <h3 className="text-2xl font-bold text-white group-hover:text-green-400 transition-colors">智能任务看板</h3>
              <div className="px-2 py-0.5 bg-green-500/20 rounded text-[10px] text-green-400 font-bold">AI</div>
            </div>
            <p className="text-gray-400 leading-relaxed">
              动态任务管理，支持多视图切换与专注模式。AI智能推荐任务优先级，让目标触手可及。
            </p>
            
            <div className="mt-4 pt-4 border-t border-gray-800/50">
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> 智能排序
                </span>
                <span className="flex items-center gap-1">
                  <Target className="w-3 h-3" /> 优先级
                </span>
              </div>
            </div>
          </div>
        </Link>
      </div>

      {/* Stats Section */}
      <div className="mt-24 grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-16 border-t border-gray-800 pt-12 w-full max-w-5xl px-4">
        <div className="text-center group">
          <div className="text-3xl font-bold text-white mb-2 group-hover:text-gold-400 transition-colors">100+</div>
          <div className="text-sm text-gray-500 uppercase tracking-wider">知识点覆盖</div>
          <div className="mt-2 h-1 bg-gray-800 rounded-full overflow-hidden">
            <div className="h-full bg-gold-500 rounded-full transition-all duration-1000" style={{ width: '85%' }} />
          </div>
        </div>
        <div className="text-center group">
          <div className="text-3xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">50h+</div>
          <div className="text-sm text-gray-500 uppercase tracking-wider">专注时长</div>
          <div className="mt-2 h-1 bg-gray-800 rounded-full overflow-hidden">
            <div className="h-full bg-blue-500 rounded-full transition-all duration-1000" style={{ width: '72%' }} />
          </div>
        </div>
        <div className="text-center group">
          <div className="text-3xl font-bold text-white mb-2 group-hover:text-green-400 transition-colors">98%</div>
          <div className="text-sm text-gray-500 uppercase tracking-wider">好评率</div>
          <div className="mt-2 h-1 bg-gray-800 rounded-full overflow-hidden">
            <div className="h-full bg-green-500 rounded-full transition-all duration-1000" style={{ width: '98%' }} />
          </div>
        </div>
        <div className="text-center group">
          <div className="text-3xl font-bold text-white mb-2 group-hover:text-purple-400 transition-colors">24/7</div>
          <div className="text-sm text-gray-500 uppercase tracking-wider">AI 助手在线</div>
          <div className="mt-2 h-1 bg-gray-800 rounded-full overflow-hidden">
            <div className="h-full bg-purple-500 rounded-full animate-pulse" style={{ width: '100%' }} />
          </div>
        </div>
      </div>

      {/* AI Assistant Preview */}
      <div className="mt-24 w-full max-w-3xl px-4">
        <div className="relative bg-gradient-to-br from-purple-900/30 to-blue-900/30 rounded-2xl border border-purple-500/30 p-8 overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl -mr-32 -mt-32" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl -ml-24 -mb-24" />
          
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center shadow-lg shadow-purple-500/30">
                <Brain className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">AI 学习助手</h3>
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  在线 · 随时为您服务
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="bg-black-card/50 backdrop-blur-sm rounded-lg p-4 border border-gray-800/50">
                <p className="text-gray-300 leading-relaxed">
                  "根据您的学习数据分析，我建议您今天重点复习高数第三章的积分计算。
                  根据艾宾浩斯遗忘曲线，这是您最佳的记忆巩固时机。"
                </p>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="h-[1px] flex-1 bg-gradient-to-r from-purple-500/50 to-transparent" />
                <span className="text-xs text-gray-500">AI 分析结果</span>
                <div className="h-[1px] flex-1 bg-gradient-to-l from-blue-500/50 to-transparent" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
