import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { BookOpen, LayoutDashboard, ClipboardList, LogOut, Edit2, Check, X, Sparkles, Brain, Activity, FileText } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { updateProfile } from '../services/api';

const Layout: React.FC = () => {
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [isEditingTarget, setIsEditingTarget] = useState(false);
  const [editTarget, setEditTarget] = useState('');
  const [error, setError] = useState('');

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const startEditing = () => {
    setEditName(user?.username || '');
    setIsEditing(true);
    setError('');
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setError('');
  };

  const startEditingTarget = () => {
    setEditTarget(user?.prepTarget || '中考');
    setIsEditingTarget(true);
    setError('');
  };

  const cancelEditingTarget = () => {
    setIsEditingTarget(false);
    setError('');
  };

  const saveName = async () => {
    if (!editName.trim()) {
        setError('用户名不能为空');
        return;
    }
    if (editName === user?.username) {
        setIsEditing(false);
        return;
    }
    try {
        const updated = await updateProfile({ username: editName });
        updateUser(updated);
        setIsEditing(false);
    } catch (e: any) {
        setError(e.message || '更新失败');
    }
  };

  const saveTarget = async (target: string) => {
      try {
          const updated = await updateProfile({ prepTarget: target });
          updateUser(updated);
          setIsEditingTarget(false);
      } catch (e: any) {
          setError(e.message || '更新目标失败');
      }
  };

  return (
    <div className="min-h-screen bg-black-main text-gray-200 font-sans overflow-x-hidden">
      <header className="bg-black-main/95 backdrop-blur-xl border-b border-gray-800/50 sticky top-0 z-50">
        <div className="max-w-[1400px] mx-auto px-4 h-16 flex items-center justify-between gap-2">
          <NavLink to="/" className="flex items-center space-x-2 shrink-0 group">
            <div className="relative">
              <div className="w-9 h-9 bg-gradient-to-br from-gold-400 to-gold-600 rounded-lg flex items-center justify-center shadow-lg shadow-gold-500/20 transition-transform group-hover:scale-110 group-hover:rotate-3">
                <BookOpen className="text-black-main w-5 h-5" />
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-black-main animate-pulse" />
            </div>
            <span className="text-lg md:text-xl font-bold text-transparent bg-clip-text bg-gold-gradient hidden sm:block">SmartStudy</span>
          </NavLink>
          
          <nav className="flex items-center space-x-1 overflow-x-auto no-scrollbar mx-2 py-1">
            <NavLink 
              to="/learning-cabin" 
              className={({ isActive }) => 
                `group relative flex items-center space-x-1 md:space-x-2 px-2 md:px-4 py-2 rounded-lg transition-all duration-300 shrink-0 ${
                  isActive 
                    ? 'bg-gradient-to-r from-purple-500/20 to-purple-600/10 text-purple-400 font-medium shadow-[0_0_15px_rgba(168,85,247,0.15)]' 
                    : 'text-gray-400 hover:bg-white/5 hover:text-purple-300'
                }`
              }
            >
              <div className="relative">
                <BookOpen className="w-4 h-4 shrink-0" />
              </div>
              <span className="text-xs md:text-sm hidden sm:inline">学习舱</span>
              <span className="text-[10px] px-1 py-0.5 bg-purple-500/20 text-purple-400 rounded sm:hidden">AI</span>
            </NavLink>
            
            <NavLink 
              to="/dashboard" 
              className={({ isActive }) => 
                `group relative flex items-center space-x-1 md:space-x-2 px-2 md:px-4 py-2 rounded-lg transition-all duration-300 shrink-0 ${
                  isActive 
                    ? 'bg-gradient-to-r from-blue-500/20 to-blue-600/10 text-blue-400 font-medium shadow-[0_0_15px_rgba(59,130,246,0.15)]' 
                    : 'text-gray-400 hover:bg-white/5 hover:text-blue-300'
                }`
              }
            >
              <LayoutDashboard className="w-4 h-4 shrink-0" />
              <span className="text-xs md:text-sm hidden sm:inline">仪表盘</span>
            </NavLink>
            
            <NavLink 
              to="/task-board" 
              className={({ isActive }) => 
                `group relative flex items-center space-x-1 md:space-x-2 px-2 md:px-4 py-2 rounded-lg transition-all duration-300 shrink-0 ${
                  isActive 
                    ? 'bg-gradient-to-r from-green-500/20 to-green-600/10 text-green-400 font-medium shadow-[0_0_15px_rgba(34,197,94,0.15)]' 
                    : 'text-gray-400 hover:bg-white/5 hover:text-green-300'
                }`
              }
            >
              <ClipboardList className="w-4 h-4 shrink-0" />
              <span className="text-xs md:text-sm hidden sm:inline">任务看板</span>
            </NavLink>

            <NavLink 
              to="/schedule" 
              className={({ isActive }) => 
                `group relative flex items-center space-x-1 md:space-x-2 px-2 md:px-4 py-2 rounded-lg transition-all duration-300 shrink-0 ${
                  isActive 
                    ? 'bg-gradient-to-r from-gold-500/20 to-gold-600/10 text-gold-400 font-medium shadow-[0_0_15px_rgba(212,175,55,0.15)]' 
                    : 'text-gray-400 hover:bg-white/5 hover:text-gold-300'
                }`
              }
            >
              <Activity className="w-4 h-4 shrink-0" />
              <span className="text-xs md:text-sm hidden sm:inline">背诵计划</span>
            </NavLink>

            <NavLink 
              to="/notes" 
              className={({ isActive }) => 
                `group relative flex items-center space-x-1 md:space-x-2 px-2 md:px-4 py-2 rounded-lg transition-all duration-300 shrink-0 ${
                  isActive 
                    ? 'bg-gradient-to-r from-amber-500/20 to-amber-600/10 text-amber-400 font-medium shadow-[0_0_15px_rgba(251,191,36,0.15)]' 
                    : 'text-gray-400 hover:bg-white/5 hover:text-amber-300'
                }`
              }
            >
              <FileText className="w-4 h-4 shrink-0" />
              <span className="text-xs md:text-sm hidden sm:inline">我的笔记</span>
            </NavLink>
          </nav>
          
          <div className="flex items-center space-x-1 md:space-x-4 shrink-0">
             {/* AI Status */}
             <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-full border border-purple-500/20">
                <div className="relative">
                    <Brain className="w-4 h-4 text-purple-400" />
                    <div className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                </div>
                <span className="text-xs text-gray-400">AI 在线</span>
             </div>

             {/* Target Selector */}
             <div className="relative hidden xs:block shrink-0">
                {isEditingTarget ? (
                    <div className="flex items-center gap-1">
                        <select 
                            value={editTarget}
                            onChange={(e) => {
                                setEditTarget(e.target.value);
                                saveTarget(e.target.value);
                            }}
                            onBlur={() => setIsEditingTarget(false)}
                            className="bg-black-light border border-gray-700 rounded-lg px-2 py-1.5 text-xs text-gold-400 focus:border-gold-500 outline-none cursor-pointer appearance-none pr-8"
                            style={{
                                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23d4af37'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                                backgroundRepeat: 'no-repeat',
                                backgroundPosition: 'right 8px center',
                                backgroundSize: '16px',
                            }}
                            autoFocus
                        >
                            <option value="中考">中考冲刺</option>
                            <option value="高考">高考备战</option>
                            <option value="考研">考研上岸</option>
                            <option value="考公">考公必胜</option>
                        </select>
                    </div>
                ) : (
                    <div 
                        onClick={startEditingTarget} 
                        className="group px-2 py-1.5 rounded-lg bg-gradient-to-r from-gold-900/20 to-gold-800/10 border border-gold-700/50 text-gold-400 text-xs font-bold cursor-pointer hover:from-gold-900/40 hover:to-gold-800/20 hover:border-gold-600 transition-all flex items-center space-x-1.5"
                        title="点击切换备考目标"
                    >
                        <Sparkles className="w-3 h-3" />
                        <span>{user?.prepTarget || '设置目标'}</span>
                        <Edit2 size={8} className="opacity-50 group-hover:opacity-100 transition-opacity" />
                    </div>
                )}
             </div>

             <div className="flex items-center space-x-1 md:space-x-2 shrink-0">
                 {/* Avatar */}
                <div className="relative">
                    <div className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-gradient-to-br from-gold-400/20 to-purple-500/20 border border-gold-500/30 flex items-center justify-center text-xs md:text-sm font-medium text-gold-400 shadow-sm shrink-0 overflow-hidden">
                        {user?.username?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-black-main" />
                </div>
                
                {/* Username */}
                {!isEditing ? (
                    <div className="hidden md:flex items-center space-x-2 group cursor-pointer" onClick={startEditing} title="点击修改用户名">
                        <span className="text-sm font-medium text-gray-300 group-hover:text-gold-300 transition-colors truncate max-w-[100px]">{user?.username}</span>
                        <Edit2 size={12} className="text-gray-600 group-hover:text-gold-400 opacity-0 group-hover:opacity-100 transition-all shrink-0" />
                    </div>
                ) : (
                    <div className="hidden md:flex items-center space-x-1">
                        <input
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') saveName();
                                if (e.key === 'Escape') cancelEditing();
                            }}
                            className="w-24 bg-black-light border border-gold-500/50 rounded px-2 py-1 text-sm text-gold-400 outline-none"
                            autoFocus
                        />
                        <button onClick={saveName} className="p-1 text-green-400 hover:text-green-300">
                            <Check size={14} />
                        </button>
                        <button onClick={cancelEditing} className="p-1 text-red-400 hover:text-red-300">
                            <X size={14} />
                        </button>
                    </div>
                )}
             </div>
             
             {/* Logout */}
             <button 
                onClick={handleLogout}
                className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all shrink-0"
                title="退出登录"
             >
                <LogOut className="w-4 h-4 md:w-5 md:h-5" />
             </button>
          </div>
        </div>
      </header>
      
      <main className="max-w-[1400px] mx-auto px-4 py-4 md:py-6">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
