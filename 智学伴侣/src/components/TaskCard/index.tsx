import React, { useState } from 'react';
import { Calendar, CheckCircle, Trash2, Sparkles, XCircle, Pencil, Save, X } from 'lucide-react';
import { TaskCardProps, TaskPriority } from '../../types';

interface ExtendedTaskCardProps extends TaskCardProps {
    isRecommended?: boolean;
}

const TaskCard: React.FC<ExtendedTaskCardProps> = ({ task, isRecommended, onComplete, onUncomplete, onDelete, onPriorityChange, onDeadlineChange }) => {
  const [isEditingDeadline, setIsEditingDeadline] = useState(false);
  const [newDeadline, setNewDeadline] = useState(task.deadline || '');

  const handleDeadlineSave = () => {
    if (onDeadlineChange) {
      onDeadlineChange(task.id, newDeadline);
    }
    setIsEditingDeadline(false);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-400 bg-red-900/20 border-red-900/50';
      case 'medium': return 'text-yellow-400 bg-yellow-900/20 border-yellow-900/50';
      case 'low': return 'text-green-400 bg-green-900/20 border-green-900/50';
      default: return 'text-gray-400 bg-gray-800 border-gray-700';
    }
  };

  const handlePriorityClick = () => {
    if (!onPriorityChange) return;
    
    let newPriority: TaskPriority = 'medium';
    if (task.priority === 'high') newPriority = 'low';
    else if (task.priority === 'medium') newPriority = 'high';
    else newPriority = 'medium';

    onPriorityChange(task.id, newPriority);
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case '中考': return 'border-l-green-500';
      case '高考': return 'border-l-orange-500';
      case '考研': return 'border-l-blue-500';
      case '考公': return 'border-l-red-500';
      default: return 'border-l-gray-500';
    }
  };

  return (
    <div 
      id={`task-${task.id}`}
      className={`
      relative bg-gradient-to-br from-gray-900/90 to-black/70 p-4 rounded-xl shadow-lg border border-l-4 transition-all duration-300 hover:shadow-xl hover:shadow-gold-500/10 hover:-translate-y-1 group backdrop-blur-sm
      ${getCategoryColor(task.category)}
      ${(task.isAIRecommended || isRecommended) 
          ? 'border-gold-500 border-2 ring-4 ring-gold-500/20 shadow-[0_0_30px_rgba(212,175,55,0.2)] bg-gradient-to-br from-gray-900/90 to-[#1a1a1a] scale-[1.02] z-10' 
          : 'border-gray-700/50 hover:border-gold-500/30'
      }
    `}>
      {(task.isAIRecommended || isRecommended) && (
        <div className="absolute -top-3 -right-2 bg-gradient-to-r from-gold-500 to-yellow-600 text-black text-xs font-bold px-3 py-1.5 rounded-full flex items-center shadow-lg shadow-gold-500/40 z-20 animate-bounce ring-2 ring-black">
          <Sparkles size={14} className="mr-1 fill-black" /> AI 推荐
        </div>
      )}
      
      <div className="flex justify-between items-start mb-3">
        <span 
            onClick={handlePriorityClick}
            className={`text-xs px-2.5 py-1 rounded-lg border ${getPriorityColor(task.priority)} ${onPriorityChange ? 'cursor-pointer hover:opacity-80 select-none' : ''}`}
            title={onPriorityChange ? "点击切换优先级" : ""}
        >
          {task.priority === 'high' ? '🔥 高优先级' : task.priority === 'medium' ? '⚡ 中优先级' : '💤 低优先级'}
        </span>
        {task.status === 'done' && (
             <span className="text-green-400 bg-green-500/10 px-2 py-1 rounded-lg text-xs border border-green-500/30 flex items-center shadow-sm shadow-green-500/20">
                 <CheckCircle size={12} className="mr-1" /> 已完成
             </span>
        )}
      </div>
      
      <h3 className={`font-bold text-base mb-2 transition-colors ${task.status === 'done' ? 'text-gray-500 line-through decoration-gray-600' : 'text-white'}`}>
        {task.title}
      </h3>
      
      {task.description && (
        <p className={`text-sm mb-3 line-clamp-2 ${task.status === 'done' ? 'text-gray-600' : 'text-gray-400'}`}>
            {task.description}
        </p>
      )}

      <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-800/50">
        {isEditingDeadline ? (
          <div className="flex items-center space-x-2">
            <input 
              type="date"
              value={newDeadline}
              onChange={(e) => setNewDeadline(e.target.value)}
              className="bg-black/50 border border-gray-700 rounded-lg px-3 py-1 text-xs text-gray-200 outline-none focus:border-gold-500 transition-colors"
              autoFocus
            />
            <button onClick={handleDeadlineSave} className="p-1.5 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors">
              <Save size={14} />
            </button>
            <button onClick={() => setIsEditingDeadline(false)} className="p-1.5 bg-gray-800 text-gray-500 rounded-lg hover:bg-gray-700 transition-colors">
              <X size={14} />
            </button>
          </div>
        ) : (
            <div className="flex items-center text-xs text-gray-500 group/deadline bg-gray-800/50 px-2.5 py-1.5 rounded-lg">
            <Calendar size={12} className="mr-1.5 text-gold-400" />
            <span className={!task.deadline ? "italic text-gray-600" : "text-gray-300"}>
                {task.deadline || "无截止日期"}
            </span>
            {onDeadlineChange && (
                <button 
                onClick={() => {
                    setNewDeadline(task.deadline || '');
                    setIsEditingDeadline(true);
                }}
                className="ml-2 opacity-0 group-hover/deadline:opacity-100 transition-opacity text-gray-500 hover:text-gold-400"
                title="修改截止日期"
                >
                <Pencil size={12} />
                </button>
            )}
            </div>
        )}
        
        <div className="flex space-x-1.5 ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
             {task.status === 'done' ? (
                 <button 
                    onClick={() => onUncomplete && onUncomplete(task.id)}
                    className="p-2 text-gray-500 hover:text-orange-400 hover:bg-orange-500/10 rounded-lg transition-all"
                    title="撤销完成"
                 >
                    <XCircle size={18} />
                 </button>
             ) : (
                 <button 
                    onClick={() => onComplete && onComplete(task.id)}
                    className="p-2 text-gray-500 hover:text-green-400 hover:bg-green-500/10 rounded-lg transition-all"
                    title="完成任务"
                 >
                    <CheckCircle size={18} />
                 </button>
             )}
             
             <button 
                onClick={() => onDelete && onDelete(task.id)}
                className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                title="删除任务"
             >
                <Trash2 size={18} />
             </button>
        </div>
      </div>
    </div>
  );
};

export default TaskCard;
