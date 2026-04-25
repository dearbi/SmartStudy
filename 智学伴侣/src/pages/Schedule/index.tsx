import React, { useState, useEffect } from 'react';
import { 
  Crown, 
  RotateCcw, 
  Gem, 
  Loader2, 
  Star, 
  RefreshCw, 
  ArrowDown, 
  Layers, 
  Minus, 
  Plus, 
  Check,
  Medal
} from 'lucide-react';
import AddUnitModal from './components/AddUnitModal';
import ReviewCalendar from './components/ReviewCalendar';
import StatsOverview from './components/StatsOverview';
import './Schedule.css';

// --- Types ---
interface TaskStatus {
  start: boolean;
  r1: boolean;
  r2: boolean;
  r3: boolean;
  r4: boolean;
  r5: boolean;
  [key: string]: boolean;
}

interface TaskItem {
  id: string;
  name: string;
  startDate: string | null;
  reviews: (string | null)[];
  status: TaskStatus;
}

interface PlanCategory {
  id: string;
  title: string;
  count?: number;
  prefix?: string;
  customItems?: string[];
}

type AppData = Record<string, TaskItem[]>;

interface DashboardTask extends TaskItem {
  type: string;
  label: string;
  catTitle: string;
}

// --- Fire Icon Components ---
const MiniFire: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg viewBox="0 0 24 24" className={`w-5 h-5 ${className}`} fill="none">
    <path d="M12 3C12 3 9 6 9 9C9 11 10 13 12 13C14 13 15 11 15 9C15 6 12 3 12 3Z" fill="url(#fire-gradient)" />
    <path d="M12 8C12 8 10.5 9.5 10.5 11C10.5 12 11 13 12 13C13 13 13.5 12 13.5 11C13.5 9.5 12 8 12 8Z" fill="#FFFACD" />
    <defs>
      <linearGradient id="fire-gradient" x1="12" y1="3" x2="12" y2="13" gradientUnits="userSpaceOnUse">
        <stop stopColor="#FFD700" />
        <stop offset="1" stopColor="#D4AF37" />
      </linearGradient>
    </defs>
  </svg>
);

const SingleFire: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`inline-flex items-center justify-center w-7 h-7 ${className}`}>
    <MiniFire />
  </div>
);

const DoubleFire: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`inline-flex items-center justify-center w-7 h-7 ${className}`}>
    <MiniFire className="mr-[-3px]" />
    <MiniFire className="ml-[-3px]" />
  </div>
);

const TripleFire: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`inline-flex flex-col items-center justify-center w-7 h-7 ${className}`}>
    <MiniFire className="mb-[-2px] scale-110" />
    <div className="flex">
      <MiniFire className="mr-[-2px]" />
      <MiniFire className="ml-[-2px]" />
    </div>
  </div>
);

// Lightning icon for extra category
const LightningIcon: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg viewBox="0 0 24 24" className={`w-4 h-4 inline-block ${className}`} fill="none">
    <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" fill="#FFD700" stroke="#FFA500" strokeWidth="1"/>
  </svg>
);

// Get icon by category title
const getCategoryIcon = (catTitle: string) => {
  if (catTitle.includes('高频')) return <Crown className="w-5 h-5 text-white" />;
  if (catTitle.includes('中频')) return <Medal className="w-5 h-5 text-white" />;
  if (catTitle.includes('低频')) return <Star className="w-5 h-5 text-white" />;
  return <svg viewBox="0 0 24 24" className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>;
};

// --- Constants ---
const STORAGE_KEY = 'cet6_ebbinghaus_data_v2';

const planStructure: PlanCategory[] = [
  { id: 'high', title: '高频词 (Core)', count: 0, prefix: 'List' },
  { id: 'mid', title: '中频词 (Common)', count: 0, prefix: 'List' },
  { id: 'low', title: '低频词 (Category)', customItems: ['自然科学', '人文社会', '商业经济', '医疗健康', '信息技术', '法律政治', '艺术文化'] },
  { id: 'extra', title: '非重点/补充', count: 0, prefix: 'Unit' }
];

const intervals = [1, 2, 4, 7, 15];

const Schedule: React.FC = () => {
  const [appData, setAppData] = useState<AppData>({});
  const [loading, setLoading] = useState(true);
  const [today, setToday] = useState('');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pendingAddCatId, setPendingAddCatId] = useState<string | null>(null);
  const [pendingInitialName, setPendingInitialName] = useState('');

  // --- Helpers ---
  const getTodayStr = () => new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD

  const addDays = (dateStr: string, days: number): string | null => {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    date.setDate(date.getDate() + days);
    return date.toISOString().split('T')[0];
  };

  const createTaskItem = (catId: string, index: number, name: string): TaskItem => {
    const timestamp = Date.now();
    const uniqueId = `${catId}-${timestamp}-${Math.random().toString(36).substr(2, 5)}`;
    
    return {
      id: uniqueId,
      name: name,
      startDate: null,
      reviews: [null, null, null, null, null],
      status: {
        start: false,
        r1: false, r2: false, r3: false, r4: false, r5: false
      }
    };
  };

  // --- Effects ---
  useEffect(() => {
    setToday(getTodayStr());
    
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setAppData(JSON.parse(stored));
    } else {
      // Initialize data
      const initialData: AppData = {};
      planStructure.forEach(cat => {
        initialData[cat.id] = [];
        if (cat.customItems) {
          cat.customItems.forEach((name, idx) => {
            initialData[cat.id].push(createTaskItem(cat.id, idx + 1, name));
          });
        } else if (cat.count) {
          for (let i = 1; i <= cat.count; i++) {
            initialData[cat.id].push(createTaskItem(cat.id, i, `${cat.prefix} ${i}`));
          }
        }
      });
      setAppData(initialData);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initialData));
    }
    setLoading(false);
  }, []);

  // Save whenever appData changes (except initial load)
  useEffect(() => {
    if (!loading && Object.keys(appData).length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(appData));
    }
  }, [appData, loading]);

  // --- Handlers ---
  const handleDateChange = (catId: string, itemId: string, dateValue: string) => {
    setAppData(prev => {
      const newData = { ...prev };
      const items = newData[catId];
      const itemIndex = items.findIndex(i => i.id === itemId);
      
      if (itemIndex !== -1) {
        const updatedItem = { ...items[itemIndex] };
        updatedItem.startDate = dateValue;
        
        if (dateValue) {
          updatedItem.reviews = intervals.map(days => addDays(dateValue, days));
        } else {
          updatedItem.reviews = [null, null, null, null, null];
        }
        
        const newItems = [...items];
        newItems[itemIndex] = updatedItem;
        newData[catId] = newItems;
      }
      return newData;
    });
  };

  const toggleStatus = (catId: string, itemId: string, type: string) => {
    setAppData(prev => {
      const newData = { ...prev };
      const items = newData[catId];
      const itemIndex = items.findIndex(i => i.id === itemId);
      
      if (itemIndex !== -1) {
        const updatedItem = { ...items[itemIndex] };
        updatedItem.status = { ...updatedItem.status, [type]: !updatedItem.status[type] };
        
        const newItems = [...items];
        newItems[itemIndex] = updatedItem;
        newData[catId] = newItems;
      }
      return newData;
    });
  };

  const resetData = () => {
    if (window.confirm('确定要清空所有进度并重置吗？此操作无法撤销。')) {
      localStorage.removeItem(STORAGE_KEY);
      window.location.reload();
    }
  };

  const editUnitName = (catId: string, itemId: string) => {
    const items = appData[catId];
    const item = items.find(i => i.id === itemId);
    if (!item) return;

    const newName = window.prompt('编辑单元名称:', item.name);
    if (newName && newName.trim() !== '' && newName.trim() !== item.name) {
      setAppData(prev => {
        const newData = { ...prev };
        const newItems = newData[catId].map(i => 
          i.id === itemId ? { ...i, name: newName.trim() } : i
        );
        newData[catId] = newItems;
        return newData;
      });
    }
  };

  const addUnit = (catId: string) => {
    const category = planStructure.find(cat => cat.id === catId);
    if (!category) return;

    const items = appData[catId];
    const newIndex = items.length + 1;
    let newName;

    if (category.customItems) {
      newName = `新类别 ${newIndex}`;
    } else {
      newName = `${category.prefix} ${newIndex}`;
    }

    // Open Modal instead of prompt
    setPendingAddCatId(catId);
    setPendingInitialName(newName);
    setIsModalOpen(true);
  };

  const handleConfirmAddUnit = (name: string) => {
    if (!pendingAddCatId) return;
    
    const items = appData[pendingAddCatId];
    // Recalculate index just in case
    const newIndex = items.length + 1;
    
    const newItem = createTaskItem(pendingAddCatId, newIndex, name);
    
    setAppData(prev => {
      const newData = { ...prev };
      newData[pendingAddCatId] = [...newData[pendingAddCatId], newItem];
      return newData;
    });

    // Scroll to new item
    setTimeout(() => {
      const el = document.getElementById(`row-${newItem.id}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el.style.background = 'rgba(212, 175, 55, 0.2)';
        el.style.boxShadow = '0 0 30px rgba(212, 175, 55, 0.4)';
        setTimeout(() => {
          el.style.background = 'rgba(15, 15, 15, 0.6)';
          el.style.boxShadow = 'none';
        }, 2000);
      }
    }, 100);
    
    // Close modal
    setIsModalOpen(false);
    setPendingAddCatId(null);
  };

  const removeUnit = (catId: string) => {
    const items = appData[catId];
    if (items.length <= 1) {
      alert('每个类别至少需要保留一个单元！');
      return;
    }

    const lastItem = items[items.length - 1];
    const hasProgress = lastItem.startDate || Object.values(lastItem.status).some(s => s);

    if (hasProgress) {
      if (!window.confirm(`"${lastItem.name}" 已有学习进度，确定要删除吗？此操作无法撤销。`)) {
        return;
      }
    }

    setAppData(prev => {
      const newData = { ...prev };
      newData[catId] = items.slice(0, -1);
      return newData;
    });
  };

  const scrollToItem = (itemId: string) => {
    const el = document.getElementById(`row-${itemId}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el.style.background = 'rgba(212, 175, 55, 0.2)';
      el.style.boxShadow = '0 0 30px rgba(212, 175, 55, 0.4)';
      setTimeout(() => {
        el.style.background = 'rgba(15, 15, 15, 0.6)';
        el.style.boxShadow = 'none';
      }, 2000);
    }
  };

  // --- Render Helpers ---
  const getDashboardData = () => {
    const newTasks: DashboardTask[] = [];
    const reviewTasks: DashboardTask[] = [];

    planStructure.forEach(cat => {
      if (!appData[cat.id]) return;
      appData[cat.id].forEach(item => {
        // 1. Check new tasks
        if (item.startDate === today && !item.status.start) {
          newTasks.push({ ...item, type: 'start', label: '首次背诵', catTitle: cat.title });
        }
        // 2. Check reviews
        item.reviews.forEach((date, idx) => {
          if (date === today && !item.status[`r${idx+1}`]) {
            reviewTasks.push({
              ...item,
              type: `r${idx+1}`,
              label: `复习 ${intervals[idx]}天后`,
              catTitle: cat.title
            });
          }
        });
      });
    });

    return { newTasks, reviewTasks };
  };

  const { newTasks, reviewTasks } = getDashboardData();

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-black text-gold">
      <Loader2 className="animate-spin w-10 h-10 text-[#d4af37]" />
    </div>
  );

  return (
    <div className="schedule-container pb-20">
      <div className="content-wrapper">
        {/* Watermarks */}
        <div className="watermark-layer watermark-1">bwb创作</div>
        <div className="watermark-layer watermark-2">bwb创作</div>
        <div className="watermark-layer watermark-3">bwb创作</div>

        {/* Header */}
        <header className="p-6 shadow-md sticky top-0 z-50" style={{ 
          background: 'rgba(0, 0, 0, 0.95)', 
          borderBottom: '1px solid rgba(212, 175, 55, 0.3)', 
          backdropFilter: 'blur(20px)', 
          boxShadow: '0 4px 30px rgba(0, 0, 0, 0.8), 0 0 40px rgba(212, 175, 55, 0.1)' 
        }}>
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div style={{ width: '3px', height: '40px', background: 'linear-gradient(180deg, transparent, #d4af37, transparent)' }}></div>
              <h1 className="text-2xl md:text-3xl luxury-title flex items-center">
                <Crown className="mr-3 text-[#d4af37]" />
                艾宾浩斯遗忘曲线（EBBINGHAUS MASTERY）
              </h1>
            </div>
            <div className="text-sm">
              <button onClick={resetData} className="luxury-button danger">
                <RotateCcw className="mr-2 w-4 h-4" />
                RESET
              </button>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto p-4 space-y-6">
          {/* Today's Dashboard */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <StatsOverview appData={appData} />
              
              <section className="luxury-card p-8 relative">
                <div className="corner-decoration top-left"></div>
                <div className="corner-decoration top-right"></div>
                <div className="corner-decoration bottom-left"></div>
                <div className="corner-decoration bottom-right"></div>
                
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold flex items-center gold-text">
                    <Gem className="mr-3 w-6 h-6" />
                    TODAY'S MISSION
                  </h2>
                  <span className="text-sm" style={{ color: '#999', fontFamily: 'Cinzel, serif', letterSpacing: '1px' }}>
                    今天是: {today}
                  </span>
                </div>
                
                <div className="gold-divider"></div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                  {/* New Tasks Column */}
                  <div className="p-6 rounded-lg relative" style={{ 
                    background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.05) 0%, rgba(20, 20, 20, 0.8) 100%)', 
                    border: '1px solid rgba(212, 175, 55, 0.4)', 
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(212, 175, 55, 0.1)' 
                  }}>
                    <h3 className="font-bold mb-4 pb-2 gold-text flex items-center" style={{ borderBottom: '1px solid rgba(212, 175, 55, 0.3)', fontSize: '1.1rem' }}>
                      <Star className="mr-2 w-4 h-4" />
                      NEW WORDS <span style={{ color: '#999', fontSize: '0.9rem', marginLeft: '8px' }}>({newTasks.length})</span>
                    </h3>
                    {newTasks.length === 0 ? (
                      <p className="text-sm text-center py-4" style={{ color: '#666', fontStyle: 'italic' }}>No new tasks scheduled. Set start dates below.</p>
                    ) : (
                      <ul className="space-y-3">
                        {newTasks.map(t => (
                          <li key={`${t.id}-${t.type}`} className="flex justify-between items-center p-3 rounded transition" style={{ 
                            background: 'rgba(30, 30, 30, 0.6)', 
                            border: '1px solid rgba(212, 175, 55, 0.2)', 
                            backdropFilter: 'blur(5px)' 
                          }}>
                            <span className="text-sm font-medium flex items-center" style={{ color: '#e8e8e8', fontSize: '1rem' }}>
                              <input 
                                type="checkbox" 
                                className="task-checkbox mr-3" 
                                style={{ accentColor: '#d4af37' }}
                                checked={t.status[t.type]}
                                onChange={() => {
                                  const catId = Object.keys(appData).find(key => appData[key].some(i => i.id === t.id));
                                  if (catId) toggleStatus(catId, t.id, t.type);
                                }}
                              />
                              <span className="flex items-center justify-center w-12 py-1 rounded mr-2" style={{ 
                                background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.2), rgba(212, 175, 55, 0.1))', 
                                border: '1px solid rgba(212, 175, 55, 0.3)'
                              }}>
                                {getCategoryIcon(t.catTitle)}
                              </span>
                              {t.name}
                            </span>
                            <button 
                              className="text-xs px-3 py-1.5 rounded transition flex items-center" 
                              style={{ 
                                background: 'rgba(212, 175, 55, 0.1)', 
                                color: '#d4af37', 
                                border: '1px solid rgba(212, 175, 55, 0.4)'
                              }}
                              onClick={() => scrollToItem(t.id)}
                            >
                              <ArrowDown className="mr-1 w-3 h-3" />
                              GO
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  {/* Review Tasks Column */}
                  <div className="p-6 rounded-lg relative" style={{ 
                    background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.05) 0%, rgba(20, 20, 20, 0.8) 100%)', 
                    border: '1px solid rgba(212, 175, 55, 0.4)', 
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(212, 175, 55, 0.1)' 
                  }}>
                    <h3 className="font-bold mb-4 pb-2 gold-text flex items-center" style={{ borderBottom: '1px solid rgba(212, 175, 55, 0.3)', fontSize: '1.1rem' }}>
                      <RefreshCw className="mr-2 w-4 h-4" />
                      REVIEW <span style={{ color: '#999', fontSize: '0.9rem', marginLeft: '8px' }}>({reviewTasks.length})</span>
                    </h3>
                    {reviewTasks.length === 0 ? (
                      <p className="text-sm text-center py-4" style={{ color: '#666', fontStyle: 'italic' }}>No reviews scheduled for today.</p>
                    ) : (
                      <ul className="space-y-3">
                        {reviewTasks.map(t => (
                          <li key={`${t.id}-${t.type}`} className="flex justify-between items-center p-3 rounded transition" style={{ 
                            background: 'rgba(30, 30, 30, 0.6)', 
                            border: '1px solid rgba(212, 175, 55, 0.2)', 
                            backdropFilter: 'blur(5px)' 
                          }}>
                            <span className="text-sm font-medium flex items-center flex-wrap gap-1" style={{ color: '#e8e8e8', fontSize: '1rem' }}>
                              <input 
                                type="checkbox" 
                                className="task-checkbox mr-3" 
                                style={{ accentColor: '#d4af37' }}
                                checked={t.status[t.type]}
                                onChange={() => {
                                  const catId = Object.keys(appData).find(key => appData[key].some(i => i.id === t.id));
                                  if (catId) toggleStatus(catId, t.id, t.type);
                                }}
                              />
                              <span className="flex items-center justify-center w-12 py-1 rounded mr-2" style={{ 
                                background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.2), rgba(212, 175, 55, 0.1))', 
                                border: '1px solid rgba(212, 175, 55, 0.3)'
                              }}>
                                {getCategoryIcon(t.catTitle)}
                              </span>
                              {t.name}
                              <span className="text-xs ml-2" style={{ color: '#999', fontStyle: 'italic' }}>{t.label}</span>
                            </span>
                            <button 
                              className="text-xs px-3 py-1.5 rounded transition flex items-center" 
                              style={{ 
                                background: 'rgba(212, 175, 55, 0.1)', 
                                color: '#d4af37', 
                                border: '1px solid rgba(212, 175, 55, 0.4)'
                              }}
                              onClick={() => scrollToItem(t.id)}
                            >
                              <ArrowDown className="mr-1 w-3 h-3" />
                              GO
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </section>
            </div>
            
            <div className="lg:col-span-1">
              <ReviewCalendar appData={appData} />
            </div>
          </div>

          {/* Main Tables */}
          <div id="main-content" className="space-y-8">
            {planStructure.map(cat => {
              const items = appData[cat.id] || [];
              return (
                <div key={cat.id} className="luxury-card relative overflow-visible">
                  <div className="corner-decoration top-left"></div>
                  <div className="corner-decoration top-right"></div>
                  
                  <div className="px-8 py-4" style={{ background: 'rgba(20, 20, 20, 0.6)', borderBottom: '1px solid rgba(212, 175, 55, 0.3)' }}>
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-lg gold-text flex items-center gap-2">
                        {cat.id === 'high' && <Crown className="w-5 h-5 text-white mr-1" />}
                        {cat.id === 'mid' && <Medal className="w-5 h-5 text-white mr-1" />}
                        {cat.id === 'low' && <Star className="w-5 h-5 text-white mr-1" />}
                        {cat.id === 'extra' && <svg viewBox="0 0 24 24" className="w-5 h-5 text-white mr-1" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>}
                        {cat.title}
                        <span className="unit-count ml-2">({items.length} units)</span>
                      </h3>
                      <div className="unit-controls">
                        <button onClick={() => removeUnit(cat.id)} className="luxury-button danger small" title="删除最后一个单元">
                          <Minus className="w-3 h-3" />
                        </button>
                        <button onClick={() => addUnit(cat.id)} className="luxury-button small" title="添加新单元">
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="table-container overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="text-sm" style={{ background: 'rgba(30, 30, 30, 0.8)', color: '#d4af37' }}>
                          <th className="p-4 whitespace-nowrap sticky left-0 shadow-sm z-10 w-32" style={{ background: 'rgba(30, 30, 30, 0.95)', borderBottom: '2px solid rgba(212, 175, 55, 0.3)' }}>UNIT</th>
                          <th className="p-4 whitespace-nowrap min-w-[140px]" style={{ borderBottom: '2px solid rgba(212, 175, 55, 0.3)' }}>START DATE</th>
                          {['R1', 'R2', 'R3', 'R4', 'R5'].map((r, i) => (
                            <th key={r} className="p-4 whitespace-nowrap text-center" style={{ borderBottom: '2px solid rgba(212, 175, 55, 0.3)' }}>
                              {r}<br /><span className="text-xs font-normal" style={{ color: '#999' }}>+{intervals[i]} {intervals[i] === 1 ? 'Day' : 'Days'}</span>
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="text-sm">
                        {items.map((item, idx) => (
                          <tr 
                            key={item.id} 
                            id={`row-${item.id}`} 
                            className="transition hover:bg-[rgba(212,175,55,0.08)]" 
                            style={{ background: 'rgba(15, 15, 15, 0.6)', borderBottom: '1px solid rgba(212, 175, 55, 0.1)' }}
                          >
                            <td className="p-4 font-medium sticky left-0 z-10" style={{ color: '#e8e8e8', background: 'rgba(20, 20, 20, 0.95)', borderRight: '1px solid rgba(212, 175, 55, 0.2)', fontSize: '1rem' }}>
                              <span 
                                onDoubleClick={() => editUnitName(cat.id, item.id)} 
                                className="cursor-pointer px-1 rounded transition hover:bg-[rgba(212,175,55,0.1)]"
                                title="双击编辑名称"
                              >
                                {item.name}
                              </span>
                            </td>
                            <td className="p-4">
                              <div className="flex items-center gap-3">
                                <input 
                                  type="date" 
                                  value={item.startDate || ''} 
                                  className="border rounded px-3 py-2 text-sm outline-none"
                                  onChange={(e) => handleDateChange(cat.id, item.id, e.target.value)}
                                />
                                {item.startDate && (
                                  <input 
                                    type="checkbox" 
                                    className="task-checkbox" 
                                    style={{ accentColor: '#d4af37' }}
                                    checked={item.status.start}
                                    onChange={() => toggleStatus(cat.id, item.id, 'start')}
                                  />
                                )}
                              </div>
                            </td>
                            {item.reviews.map((rDate, rIdx) => {
                              const statusKey = `r${rIdx + 1}`;
                              const isCompleted = item.status[statusKey];
                              const isToday = rDate === today;
                              const isOverdue = rDate && rDate < today && !isCompleted;
                              
                              if (!rDate) {
                                return <td key={rIdx} className="p-4 text-center" style={{ color: '#555', fontStyle: 'italic' }}>—</td>;
                              }

                              let classStr = `p-4 text-center date-cell transition-all duration-300 `;
                              if (isCompleted) classStr += 'completed ';
                              if (isToday && !isCompleted) classStr += 'today-highlight ';
                              
                              return (
                                <td key={rIdx} id={`cell-${item.id}-${statusKey}`} className={classStr}>
                                  <div className="flex flex-col items-center justify-center gap-2">
                                    <span 
                                      className={isOverdue ? 'overdue' : ''} 
                                      style={isOverdue ? {} : { color: '#e8e8e8', fontWeight: 500 }}
                                    >
                                      {rDate.slice(5)}
                                    </span>
                                    <input 
                                      type="checkbox" 
                                      className="task-checkbox" 
                                      style={{ accentColor: '#d4af37' }}
                                      checked={isCompleted}
                                      onChange={() => toggleStatus(cat.id, item.id, statusKey)}
                                    />
                                  </div>
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Corner Watermark */}
        <div className="corner-watermark">bwb创作</div>
      </div>
      
      <AddUnitModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirmAddUnit}
        initialName={pendingInitialName}
      />
    </div>
  );
};

export default Schedule;
