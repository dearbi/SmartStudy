import React, { useEffect, useState, useRef } from 'react';
import RadarChart from '../../components/RadarChart';
import HeatmapChart from '../../components/HeatmapChart';
import FeedList from '../../components/FeedList';
import ErrorBoundary from '../../components/ErrorBoundary';
import { fetchMasteryScore, fetchHeatmapData, fetchFeeds } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Brain, TrendingUp, Award, Clock, Target, Sparkles, Zap, BookOpen, Activity } from 'lucide-react';

const ProgressRing: React.FC<{ progress: number; size?: number; strokeWidth?: number; color?: string }> = ({ 
  progress, 
  size = 80, 
  strokeWidth = 8,
  color = '#D4AF37'
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-lg font-bold text-white">{progress}%</span>
      </div>
    </div>
  );
};

const StatCard: React.FC<{ 
  icon: React.ReactNode; 
  title: string; 
  value: string | number;
  subtitle?: string;
  gradient: string;
  delay?: number;
}> = ({ icon, title, value, subtitle, gradient, delay = 0 }) => {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div className={`relative bg-black-card rounded-xl p-5 border border-gray-800/50 overflow-hidden transition-all duration-500 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-5`} />
      <div className="relative flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-black-light/50 flex items-center justify-center text-gray-400">
              {icon}
            </div>
            <span className="text-xs text-gray-500 uppercase tracking-wider">{title}</span>
          </div>
          <div className="text-2xl font-bold text-white mb-1">{value}</div>
          {subtitle && <div className="text-xs text-gray-400">{subtitle}</div>}
        </div>
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center opacity-20`}>
          {icon}
        </div>
      </div>
    </div>
  );
};

const DashboardContent: React.FC = () => {
  const { user } = useAuth();
  const [radarData, setRadarData] = useState<any[]>([]);
  const [heatmapData, setHeatmapData] = useState<any[]>([]);
  const [feedData, setFeedData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [masteryStats, setMasteryStats] = useState<any>(null);
  const isMounted = useRef(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    isMounted.current = true;
    const loadData = async () => {
      try {
        console.log("Dashboard: Starting data fetch...");
        setLoading(true);
        
        const targetCategory = user?.prepTarget || '考研';
        console.log(`Dashboard: Fetching feeds for category: ${targetCategory}`);

        const results = await Promise.allSettled([
            fetchMasteryScore(),
            fetchHeatmapData(),
            fetchFeeds(targetCategory)
        ]);

        if (!isMounted.current) return;

        const masteryRes = results[0].status === 'fulfilled' ? results[0].value : null;
        const activityRes = results[1].status === 'fulfilled' ? results[1].value : [];
        const feedRes = results[2].status === 'fulfilled' ? results[2].value : [];

        if (masteryRes && masteryRes.dimensions) {
            const dimensions = masteryRes.dimensions;
            const radar = [
                { dimension: '知识点覆盖度', value: Number(dimensions.knowledgeCoverage) || 0, fullMark: 100 },
                { dimension: '专注稳定性', value: Number(dimensions.focusStability) || 0, fullMark: 100 },
                { dimension: '测验准确率', value: Number(dimensions.quizAccuracy) || 0, fullMark: 100 },
                { dimension: '复习频率', value: Number(dimensions.reviewFrequency) || 0, fullMark: 100 },
            ];
            setRadarData(radar);
            setMasteryStats(masteryRes);
        } else {
            setRadarData([]);
        }
        
        setHeatmapData(Array.isArray(activityRes) ? activityRes : []);
        setFeedData(Array.isArray(feedRes) ? feedRes : []);
      } catch (error: any) {
        console.error("Failed to load dashboard data:", error);
        if (isMounted.current) setError(error.message || "加载失败");
      } finally {
        if (isMounted.current) setLoading(false);
      }
    };

    loadData();
    
    return () => {
        isMounted.current = false;
    };
  }, [user?.prepTarget]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gold-500/30 border-t-gold-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">AI 正在分析您的学习数据...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="p-8 text-center text-red-500">加载出错: {error}</div>;
  }

  const masteryScore = masteryStats?.currentScore || 0;

  return (
    <div className={`space-y-6 pb-8 transition-all duration-500 ${mounted ? 'opacity-100' : 'opacity-0'}`}>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center">
              <Brain className="w-5 h-5 text-blue-400" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-white">
              学习数据<span className="bg-clip-text text-transparent bg-gold-gradient">仪表盘</span>
            </h1>
          </div>
          <p className="text-gray-400 text-sm">实时追踪您的学习进度与能力提升</p>
        </div>
        
        {/* Mastery Progress Ring */}
        <div className="flex items-center gap-4 bg-black-card rounded-xl p-4 border border-gray-800/50">
          <ProgressRing progress={masteryScore} size={70} strokeWidth={6} color="#D4AF37" />
          <div>
            <div className="text-xs text-gray-500 uppercase tracking-wider">综合掌握度</div>
            <div className="text-sm text-gray-300">学习目标: {user?.prepTarget || '考研'}</div>
            <div className="flex items-center gap-1 mt-1">
              <Sparkles className="w-3 h-3 text-gold-400" />
              <span className="text-xs text-gold-400">AI 持续优化中</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          icon={<Clock className="w-4 h-4" />}
          title="累计专注"
          value={`${masteryStats?.overview?.totalFocusHours || 0}h`}
          subtitle="继续保持"
          gradient="from-blue-500 to-blue-600"
          delay={100}
        />
        <StatCard 
          icon={<Award className="w-4 h-4" />}
          title="完成任务"
          value={masteryStats?.overview?.completedTasks || 0}
          subtitle="效率很高"
          gradient="from-green-500 to-green-600"
          delay={200}
        />
        <StatCard 
          icon={<TrendingUp className="w-4 h-4" />}
          title="连续打卡"
          value={`${masteryStats?.overview?.consecutiveDays || 0}天`}
          subtitle="坚持就是胜利"
          gradient="from-orange-500 to-orange-600"
          delay={300}
        />
        <StatCard 
          icon={<Target className="w-4 h-4" />}
          title="今日任务"
          value="3/5"
          subtitle="完成60%"
          gradient="from-purple-500 to-purple-600"
          delay={400}
        />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Charts */}
        <div className="lg:col-span-2 space-y-6">
            {/* Top Row: Radar and Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-black-card p-6 rounded-xl shadow-sm border border-gray-800/50 overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl -mr-16 -mt-16" />
                    <div className="relative">
                      <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-bold text-white flex items-center gap-2">
                          <Activity className="w-4 h-4 text-blue-400" />
                          能力维度分析
                        </h2>
                        <div className="px-2 py-1 bg-blue-500/10 rounded text-xs text-blue-400">实时更新</div>
                      </div>
                      <div className="h-[300px]">
                          {radarData.length > 0 ? (
                              <ErrorBoundary>
                                  <RadarChart data={radarData} />
                              </ErrorBoundary>
                          ) : (
                              <div className="flex items-center justify-center h-full text-gray-400">
                                  <div className="text-center">
                                    <Sparkles className="w-8 h-8 mx-auto mb-2 text-gray-600" />
                                    <p>暂无数据</p>
                                  </div>
                              </div>
                          )}
                      </div>
                    </div>
                </div>
                
                <div className="bg-black-card p-6 rounded-xl shadow-sm border border-gray-800/50 flex flex-col overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gold-500/5 rounded-full blur-2xl -mr-16 -mt-16" />
                    <div className="relative">
                      <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-bold text-white flex items-center gap-2">
                          <Zap className="w-4 h-4 text-gold-400" />
                          学习概览
                        </h2>
                      </div>
                      <div className="grid grid-cols-2 gap-4 flex-1">
                          <div className="group bg-gradient-to-br from-blue-900/30 to-blue-900/10 border border-blue-900/50 p-4 rounded-lg flex flex-col justify-center hover:border-blue-500/50 transition-all cursor-pointer">
                            <div className="text-3xl font-bold text-blue-400 group-hover:scale-110 transition-transform">
                              {masteryStats?.overview?.totalFocusHours || 0}
                            </div>
                            <div className="text-sm text-blue-300/80 font-medium flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              累计专注小时
                            </div>
                          </div>
                          <div className="group bg-gradient-to-br from-green-900/30 to-green-900/10 border border-green-900/50 p-4 rounded-lg flex flex-col justify-center hover:border-green-500/50 transition-all cursor-pointer">
                            <div className="text-3xl font-bold text-green-400 group-hover:scale-110 transition-transform">
                              {masteryStats?.overview?.completedTasks || 0}
                            </div>
                            <div className="text-sm text-green-300/80 font-medium flex items-center gap-1">
                              <Award className="w-3 h-3" />
                              完成任务数
                            </div>
                          </div>
                          <div className="group bg-gradient-to-br from-purple-900/30 to-purple-900/10 border border-purple-900/50 p-4 rounded-lg flex flex-col justify-center hover:border-purple-500/50 transition-all cursor-pointer">
                            <div className="text-3xl font-bold text-purple-400 group-hover:scale-110 transition-transform">
                              {masteryStats?.currentScore || 0}
                            </div>
                            <div className="text-sm text-purple-300/80 font-medium flex items-center gap-1">
                              <TrendingUp className="w-3 h-3" />
                              综合掌握度
                            </div>
                          </div>
                          <div className="group bg-gradient-to-br from-orange-900/30 to-orange-900/10 border border-orange-900/50 p-4 rounded-lg flex flex-col justify-center hover:border-orange-500/50 transition-all cursor-pointer">
                            <div className="text-3xl font-bold text-orange-400 group-hover:scale-110 transition-transform">
                              {masteryStats?.overview?.consecutiveDays || 0}
                            </div>
                            <div className="text-sm text-orange-300/80 font-medium flex items-center gap-1">
                              <Sparkles className="w-3 h-3" />
                              连续打卡天数
                            </div>
                          </div>
                      </div>
                    </div>
                </div>
            </div>

            {/* Heatmap */}
            <div className="bg-black-card p-6 rounded-xl shadow-sm border border-gray-800/50 overflow-hidden relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/5 rounded-full blur-2xl -mr-16 -mt-16" />
                <div className="relative">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-bold text-white flex items-center gap-2">
                          <BookOpen className="w-4 h-4 text-green-400" />
                          学习活跃度
                        </h2>
                        <div className="text-xs text-gray-500 bg-black-light px-3 py-1.5 rounded border border-gray-700 flex items-center gap-2">
                            <span className="font-medium text-gray-400">活跃度规则：</span>
                            <span>完成任务 <span className="text-green-400 font-bold">+3</span></span>
                            <span className="w-px h-3 bg-gray-700 mx-1"></span>
                            <span>专注学习 <span className="text-blue-400 font-bold">+1</span>/小时</span>
                        </div>
                    </div>
                    <ErrorBoundary>
                        <HeatmapChart data={heatmapData} />
                    </ErrorBoundary>
                </div>
            </div>
        </div>

        {/* Right Column: Feed */}
        <div className="bg-black-card p-6 rounded-xl shadow-sm border border-gray-800/50 h-fit overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-2xl -mr-16 -mt-16" />
            <div className="relative">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-purple-400" />
                      推荐资讯
                    </h2>
                    <button className="text-sm text-gold-400 hover:text-gold-300 hover:underline">查看更多</button>
                </div>
                <ErrorBoundary>
                    <FeedList items={feedData} />
                </ErrorBoundary>
            </div>
        </div>
      </div>
    </div>
  );
};

const Dashboard: React.FC = () => {
    return (
        <ErrorBoundary>
            <DashboardContent />
        </ErrorBoundary>
    );
};

export default Dashboard;
