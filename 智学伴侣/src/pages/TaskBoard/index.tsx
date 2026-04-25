import React, { useState, useEffect, useRef } from 'react';
import { useAutoAnimate } from '@formkit/auto-animate/react';
import TaskCard from '../../components/TaskCard';
import { TaskCategory, TaskPriority } from '../../types';
import { Plus, Sparkles, Loader2, ArrowRight, Brain, TrendingUp, Award, Zap, Target, Flame } from 'lucide-react';
import { fetchTasks, updateTask, deleteTask, createTask, fetchAiTaskRecommendation } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const TaskColumn: React.FC<{
    cat: any;
    tasks: any[];
    onComplete: (id: string) => void;
    onUncomplete: (id: string) => void;
    onDelete: (id: string) => void;
    onPriorityChange: (id: string, priority: TaskPriority) => void;
    onDeadlineChange: (id: string, deadline: string) => void;
    handleCreateMock: () => void;
}> = ({ cat, tasks, onComplete, onUncomplete, onDelete, onPriorityChange, onDeadlineChange, handleCreateMock }) => {
    const [parent] = useAutoAnimate();
    const completedCount = tasks?.filter(t => t.status === 'done').length || 0;
    const totalCount = tasks?.length || 0;
    const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;
    
    return (
        <div className={`flex flex-col rounded-2xl ${cat.bgClass} border border-gray-700/50 h-full w-full overflow-hidden shadow-xl shadow-black/30`}>
            {/* Header */}
            <div className="p-5 border-b border-gray-700/50 bg-gradient-to-r from-black/40 to-transparent backdrop-blur-sm">
                <div className="flex justify-between items-center mb-3">
                    <h2 className={`font-bold text-lg flex items-center gap-2 ${cat.colorClass}`}>
                        {cat.icon}
                        {cat.title}
                    </h2>
                    <span className="bg-black/60 px-3 py-1.5 rounded-full text-xs font-bold text-gray-300 shadow-lg border border-gray-600/50 flex items-center gap-1.5">
                        <Flame className="w-3.5 h-3.5 text-green-400" />
                        {totalCount}
                    </span>
                </div>
                {/* Progress Bar */}
                <div className="h-1.5 bg-gray-700/50 rounded-full overflow-hidden">
                    <div 
                        className="h-full bg-gradient-to-r from-green-500 to-green-400 rounded-full transition-all duration-500"
                        style={{ width: `${progress}%` }}
                    />
                </div>
                <p className="text-xs text-gray-500 mt-1.5">{completedCount}/{totalCount} 已完成</p>
            </div>
            
            {/* Task List */}
            <div ref={parent} className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                {tasks?.map((task) => (
                    <TaskCard 
                        key={task.id} 
                        task={task} 
                        isRecommended={task.id === cat.recommendedTaskId}
                        onComplete={onComplete}
                        onUncomplete={onUncomplete}
                        onDelete={onDelete}
                        onPriorityChange={onPriorityChange}
                        onDeadlineChange={onDeadlineChange}
                    />
                ))}
                
                <button 
                    onClick={handleCreateMock}
                    className="w-full py-4 border-2 border-dashed border-gray-700/50 rounded-xl text-gray-500 text-sm font-medium hover:border-green-500/50 hover:text-green-400 hover:bg-green-500/5 transition-all flex items-center justify-center group">
                    <Plus size={18} className="mr-2 group-hover:scale-110 group-hover:rotate-90 transition-transform" /> 
                    添加新任务
                </button>
            </div>
        </div>
    );
};

const TaskBoard: React.FC = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Record<string, any[]>>({});
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<TaskCategory>((user?.prepTarget as TaskCategory) || '中考');
  
  const [aiRecommendation, setAiRecommendation] = useState<any>(null);
  const [aiLoading, setAiLoading] = useState(true);
  const isMounted = useRef(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDesc, setNewTaskDesc] = useState('');
  const [newTaskDeadline, setNewTaskDeadline] = useState('');

  useEffect(() => {
    if (user?.prepTarget) {
      console.log('TaskBoard: Syncing activeCategory with user target:', user.prepTarget);
      setActiveCategory(user.prepTarget as TaskCategory);
    }
  }, [user]);

  const loadTasks = async () => {
    try {
      const allTasks = await fetchTasks();
      
      const PRIORITY_MAP: Record<string, number> = {
          'high': 3,
          'medium': 2,
          'low': 1
      };

      const grouped = allTasks.reduce((acc: any, task: any) => {
        if (!acc[task.category]) acc[task.category] = [];
        acc[task.category].push(task);
        return acc;
      }, {});

      Object.keys(grouped).forEach(key => {
          grouped[key].sort((a: any, b: any) => {
              const isDoneA = a.status === 'done';
              const isDoneB = b.status === 'done';
              if (isDoneA && !isDoneB) return 1;
              if (!isDoneA && isDoneB) return -1;

              const weightA = PRIORITY_MAP[a.priority] || 0;
              const weightB = PRIORITY_MAP[b.priority] || 0;
              if (weightA !== weightB) {
                  return weightB - weightA;
              }

              if (a.deadline && b.deadline) {
                  return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
              }
              if (a.deadline) return -1;
              if (b.deadline) return 1;

              return 0;
          });
      });

      setTasks(grouped);
    } catch (error) {
      console.error("Failed to load tasks:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    isMounted.current = true;
    loadTasks();
    
    return () => {
        isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    const currentCategoryTasks = tasks[activeCategory] || [];
    
    if (currentCategoryTasks.length > 0) {
        setAiLoading(true);
        setAiRecommendation(null);
        
        const todoTasks = currentCategoryTasks.filter(t => t.status !== 'done');

        if (todoTasks.length === 0) {
            setAiLoading(false);
            setAiRecommendation({ taskId: null, reason: '当前分类下暂无待办任务，请先添加任务。' });
            return;
        }

        const candidateTasks = todoTasks.slice(0, 15);

        fetchAiTaskRecommendation(candidateTasks)
            .then(rec => {
                if (isMounted.current) {
                    setAiRecommendation(rec);
                    setAiLoading(false);
                }
            })
            .catch(err => {
                console.error("Failed to fetch AI recommendation:", err);
                if (isMounted.current) {
                    setAiLoading(false);
                    setAiRecommendation({ taskId: null, reason: 'AI 服务暂时不可用，请稍后重试。' });
                }
            });
    } else {
        if (!loading) {
             setAiRecommendation(null);
        }
    }
  }, [tasks, activeCategory]);

  const handleComplete = async (id: string) => {
    try {
      await updateTask(id, { status: 'done' });
      await loadTasks();
    } catch (error) {
      console.error("Failed to complete task:", error);
    }
  };

  const handleUncomplete = async (id: string) => {
    try {
      await updateTask(id, { status: 'todo' });
      await loadTasks();
    } catch (error) {
      console.error("Failed to uncomplete task:", error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      if (confirm('确认删除此任务吗？')) {
        await deleteTask(id);
        await loadTasks();
      }
    } catch (error) {
      console.error("Failed to delete task:", error);
    }
  };

  const handlePriorityChange = async (id: string, priority: TaskPriority) => {
    try {
        await updateTask(id, { priority });
        await loadTasks();
    } catch (error) {
        console.error("Failed to update priority:", error);
    }
  };

  const handleDeadlineChange = async (id: string, deadline: string) => {
    try {
        await updateTask(id, { deadline: deadline || null });
        await loadTasks();
    } catch (error) {
        console.error("Failed to update deadline:", error);
    }
  };

  const handleCreateMock = () => {
      setNewTaskTitle('');
      setNewTaskDesc('');
      setNewTaskDeadline('');
      setIsModalOpen(true);
  };

  const handleConfirmCreate = async () => {
      if (!newTaskTitle.trim()) return;
      
      const title = newTaskTitle;
      const description = newTaskDesc.trim() || undefined;
      const deadline = newTaskDeadline || undefined;
      const category = activeCategory;
      
      try {
          await createTask({
              title,
              description,
              deadline,
              category,
              priority: 'medium',
              status: 'todo'
          });
          setIsModalOpen(false);
          loadTasks();
      } catch (e) {
          console.error("Failed to create task", e);
      }
  };

  const scrollToTask = (taskId: string) => {
      const el = document.getElementById(`task-${taskId}`);
      if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          el.classList.add('ring-2', 'ring-purple-500', 'ring-offset-2', 'ring-offset-black');
          setTimeout(() => el.classList.remove('ring-2', 'ring-purple-500', 'ring-offset-2', 'ring-offset-black'), 3000);
      } else {
          alert("该任务可能在其他分类下或已完成");
      }
  };

  const categories: { key: TaskCategory; title: string; colorClass: string; bgClass: string; icon: React.ReactNode }[] = [
    { key: '中考', title: '中考冲刺', colorClass: 'text-green-400', bgClass: 'bg-green-900/10', icon: <Flame className="w-4 h-4" /> },
    { key: '高考', title: '高考备战', colorClass: 'text-orange-400', bgClass: 'bg-orange-900/10', icon: <Target className="w-4 h-4" /> },
    { key: '考研', title: '考研上岸', colorClass: 'text-blue-400', bgClass: 'bg-blue-900/10', icon: <Award className="w-4 h-4" /> },
    { key: '考公', title: '考公必胜', colorClass: 'text-red-400', bgClass: 'bg-red-900/10', icon: <TrendingUp className="w-4 h-4" /> },
  ];

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
            <div className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-400">AI 正在分析您的任务...</p>
        </div>
    </div>
  );

  const visibleCategories = categories.filter(c => c.key === activeCategory);

  return (
    <div className="h-full flex flex-col">
      {/* AI Recommendation Banner */}
      <div className="mb-6 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 border border-green-500/30 p-6 rounded-2xl shadow-2xl shadow-black/50 relative overflow-hidden shrink-0">
        <div className="absolute top-0 right-0 p-6 opacity-10 pointer-events-none">
            <Brain className="w-40 h-40 text-green-400" />
        </div>
        <div className="absolute top-0 left-0 w-96 h-32 bg-gradient-to-r from-green-500/10 to-transparent" />
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-green-500/5 rounded-full blur-3xl" />
        <div className="absolute top-4 left-1/4 w-2 h-2 bg-green-400/60 rounded-full animate-pulse" style={{ animationDelay: '0s' }}></div>
        <div className="absolute top-8 left-1/3 w-1.5 h-1.5 bg-green-300/60 rounded-full animate-pulse" style={{ animationDelay: '0.3s' }}></div>
        
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-lg shadow-green-500/30 border border-green-400/50">
                        <Sparkles className="w-6 h-6 text-black" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-white flex items-center gap-2">
                            ✨ AI 智能任务推荐
                        </h2>
                        <p className="text-sm text-gray-400">基于您的学习进度和目标智能分析</p>
                    </div>
                </div>

                {aiLoading ? (
                    <div className="flex items-center gap-3 text-gray-400">
                        <Loader2 className="w-5 h-5 animate-spin text-green-400" />
                        <span className="flex items-center gap-2">
                            <span className="inline-block w-2 h-2 bg-green-400 rounded-full animate-ping" />
                            正在分析任务优先级...
                        </span>
                    </div>
                ) : aiRecommendation ? (
                    aiRecommendation.taskId ? (
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <span className={`text-xs px-2 py-1 rounded-lg border ${
                                    aiRecommendation.priority === 'high' ? 'bg-red-500/20 border-red-500/50 text-red-400' : 
                                    aiRecommendation.priority === 'medium' ? 'bg-yellow-500/20 border-yellow-500/50 text-yellow-400' : 
                                    'bg-green-500/20 border-green-500/50 text-green-400'
                                }`}>
                                    {aiRecommendation.priority === 'high' ? '高优先级' : aiRecommendation.priority === 'medium' ? '中优先级' : '低优先级'}
                                </span>
                                <h3 className="font-bold text-white text-lg">{aiRecommendation.title}</h3>
                            </div>
                            <div className="text-gray-300 text-sm leading-relaxed">
                                {(() => {
                                    const parseReason = (r: any) => {
                                        if (typeof r === 'string') {
                                            try {
                                                if (r.trim().startsWith('{')) return JSON.parse(r);
                                                return r;
                                            } catch (e) {
                                                return r;
                                            }
                                        }
                                        return r;
                                    };

                                    const parsedReason = parseReason(aiRecommendation.aiReason);

                                    if (typeof parsedReason === 'object' && parsedReason !== null) {
                                        return (
                                            <div className="space-y-3">
                                                <div className="relative pl-4 border-l-2 border-gold-500/50">
                                                    <p className="text-gray-200 leading-relaxed">
                                                        {parsedReason.recommendation || parsedReason.推荐理由 || parsedReason.reason}
                                                    </p>
                                                </div>
                                                
                                                {(parsedReason.advice || parsedReason.实施建议 || parsedReason.action) && (
                                                    <div className="bg-gradient-to-r from-green-500/10 to-green-500/10 border border-green-500/30 rounded-lg p-3 flex items-start gap-3">
                                                        <div className="mt-0.5 bg-green-500/20 p-1.5 rounded-lg shrink-0">
                                                            <Zap className="w-4 h-4 text-green-300" />
                                                        </div>
                                                        <div className="flex-1">
                                                            <span className="text-green-300/70 text-xs font-bold uppercase tracking-wider block mb-1">实施建议</span>
                                                            <p className="text-gray-100 text-sm font-medium leading-snug">
                                                                {parsedReason.advice || parsedReason.实施建议 || parsedReason.action}
                                                            </p>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    }
                                    return <p className="text-gray-200 leading-relaxed">{parsedReason}</p>;
                                })()}
                            </div>
                        </div>
                    ) : (
                         <div className="text-gray-300 text-sm italic">
                            {(() => {
                                const reason = aiRecommendation.reason || aiRecommendation.aiReason || "暂无具体任务推荐，但请继续保持学习！";
                                const parseReason = (r: any) => {
                                    if (typeof r === 'string') {
                                        try {
                                            if (r.trim().startsWith('{')) return JSON.parse(r);
                                            return r;
                                        } catch (e) {
                                            return r;
                                        }
                                    }
                                    return r;
                                };

                                const parsedReason = parseReason(reason);

                                if (typeof parsedReason === 'object' && parsedReason !== null) {
                                    return (
                                        <div className="space-y-3">
                                            <div className="relative pl-4 border-l-2 border-gold-500/50">
                                                <p className="text-gray-200 leading-relaxed">
                                                    {parsedReason.recommendation || parsedReason.推荐理由 || parsedReason.reason}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                }
                                return <p className="text-gray-200 leading-relaxed">{parsedReason}</p>;
                            })()}
                        </div>
                    )
                ) : (
                    <div className="text-gray-400 text-sm flex items-center gap-2">
                        <Sparkles className="w-4 h-4" />
                        暂无推荐任务，请先添加一些待办事项。
                    </div>
                )}
            </div>

            {aiRecommendation && aiRecommendation.taskId && (
                <button 
                    onClick={() => scrollToTask(aiRecommendation.taskId)}
                    className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-400 hover:to-green-500 text-black font-bold text-sm rounded-lg transition-all shadow-lg shadow-green-500/30 whitespace-nowrap border border-green-400/50 group"
                >
                    <Target className="w-4 h-4" />
                    定位任务
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
            )}
        </div>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4 shrink-0">
        <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500/20 to-green-600/10 flex items-center justify-center border border-green-500/30">
                <Sparkles className="w-5 h-5 text-green-400" />
            </div>
            <div>
                <h1 className="text-2xl font-bold text-white">
                    动态任务<span className="bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-green-500">看板</span>
                </h1>
                <p className="text-xs text-gray-400">AI 智能管理您的学习任务</p>
            </div>
        </div>

        <button 
            onClick={handleCreateMock}
            className="flex items-center space-x-2 px-5 py-2.5 bg-gradient-to-r from-green-500 to-green-600 text-black-main font-bold rounded-lg hover:from-green-400 hover:to-green-500 transition-all shadow-lg shadow-green-500/20 whitespace-nowrap"
        >
            <Plus size={18} />
            <span>新建任务</span>
        </button>
      </div>

      <div className="flex-1 overflow-x-auto">
        <div className={`flex gap-6 h-full pb-2 w-full max-w-5xl mx-auto`}>
            {visibleCategories.map((cat) => (
                <TaskColumn 
                    key={cat.key}
                    cat={{
                        ...cat,
                        recommendedTaskId: aiRecommendation?.taskId
                    }}
                    tasks={tasks[cat.key] || []}
                    onComplete={handleComplete}
                    onUncomplete={handleUncomplete}
                    onDelete={handleDelete}
                    onPriorityChange={handlePriorityChange}
                    onDeadlineChange={handleDeadlineChange}
                    handleCreateMock={handleCreateMock}
                />
            ))}
        </div>
      </div>

      {/* Create Task Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-black-card border border-gray-800/50 rounded-2xl p-6 w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-200">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500/20 to-green-600/10 flex items-center justify-center">
                        <Plus className="w-5 h-5 text-green-400" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-white">新建任务</h3>
                        <p className="text-xs text-gray-400">创建新的学习任务</p>
                    </div>
                </div>
                
                <div className="space-y-4 mb-6">
                    <div>
                        <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">任务标题</label>
                        <input 
                            type="text" 
                            value={newTaskTitle}
                            onChange={(e) => setNewTaskTitle(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleConfirmCreate()}
                            placeholder="请输入任务标题..."
                            className="w-full bg-black-light/50 border border-gray-700 rounded-lg px-4 py-3 text-gray-200 focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none transition-all"
                            autoFocus
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">任务描述（可选）</label>
                        <textarea 
                            value={newTaskDesc}
                            onChange={(e) => setNewTaskDesc(e.target.value)}
                            placeholder="简单描述一下任务内容..."
                            className="w-full bg-black-light/50 border border-gray-700 rounded-lg px-4 py-3 text-gray-200 focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none h-24 resize-none custom-scrollbar transition-all"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">截止日期（可选）</label>
                        <input 
                            type="date" 
                            value={newTaskDeadline}
                            onChange={(e) => setNewTaskDeadline(e.target.value)}
                            className="w-full bg-black-light/50 border border-gray-700 rounded-lg px-4 py-3 text-gray-200 focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none transition-all"
                        />
                    </div>
                </div>
                <div className="flex justify-end space-x-3">
                    <button 
                        onClick={() => setIsModalOpen(false)}
                        className="px-5 py-2.5 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
                    >
                        取消
                    </button>
                    <button 
                        onClick={handleConfirmCreate}
                        disabled={!newTaskTitle.trim()}
                        className="px-6 py-2.5 bg-gradient-to-r from-green-500 to-green-600 text-black-main font-bold rounded-lg hover:from-green-400 hover:to-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-green-500/20"
                    >
                        创建任务
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default TaskBoard;
