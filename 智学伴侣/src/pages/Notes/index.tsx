import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  BookOpen, 
  Search, 
  Plus, 
  Clock, 
  Video, 
  Tag, 
  Trash2, 
  Edit3, 
  Eye,
  Sparkles,
  Calendar,
  Filter,
  Star,
  Archive,
  MoreVertical,
  ChevronDown,
  X,
  RefreshCw,
  FileText,
  Layers,
  BarChart2,
  TrendingUp,
  ClockIcon,
  Type,
  AlignLeft,
  Hash
} from 'lucide-react';
import { getAllNotes, deleteNoteById, searchNotes, getAllTags } from '../../services/api';

interface Note {
  id: string;
  sessionId: string;
  title: string;
  content: string;
  videoSrc?: string;
  videoTitle?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

const NotesPage: React.FC = () => {
  const navigate = useNavigate();
  const [notes, setNotes] = useState<Note[]>([]);
  const [filteredNotes, setFilteredNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [allTags, setAllTags] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'updated' | 'created' | 'title'>('updated');
  const [showFilters, setShowFilters] = useState(false);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const [selectedNotes, setSelectedNotes] = useState<string[]>([]);
  const [showBulkActions, setShowBulkActions] = useState(false);

  useEffect(() => {
    loadNotes();
    loadTags();
  }, []);

  useEffect(() => {
    filterAndSortNotes();
  }, [notes, searchQuery, selectedTag, sortBy]);

  const loadNotes = async () => {
    try {
      setLoading(true);
      console.log('[NotesPage] Loading notes from /learning/notes/all');
      const data = await getAllNotes();
      console.log('[NotesPage] Received notes:', data);
      setNotes(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to load notes:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTags = async () => {
    try {
      const tags = await getAllTags();
      setAllTags(tags || []);
    } catch (error) {
      console.error('Failed to load tags:', error);
    }
  };

  const filterAndSortNotes = () => {
    let result = [...notes];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(note => 
        note.title.toLowerCase().includes(query) ||
        note.content.toLowerCase().includes(query) ||
        note.videoTitle?.toLowerCase().includes(query) ||
        note.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // Tag filter
    if (selectedTag) {
      result = result.filter(note => note.tags.includes(selectedTag));
    }

    // Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case 'created':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'title':
          return a.title.localeCompare(b.title);
        default:
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      }
    });

    setFilteredNotes(result);
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.length >= 2) {
      try {
        const results = await searchNotes(query);
        setFilteredNotes(results);
      } catch (error) {
        console.error('Search failed:', error);
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这条笔记吗？')) return;
    try {
      await deleteNoteById(id);
      setNotes(prev => prev.filter(n => n.id !== id));
      setMenuOpen(null);
    } catch (error) {
      console.error('Delete failed:', error);
      alert('删除失败');
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return '今天';
    if (days === 1) return '昨天';
    if (days < 7) return `${days}天前`;
    return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
  };

  const getPreviewContent = (content: string, maxLength = 150) => {
    const clean = content.replace(/[#*`\[\]()]/g, '').replace(/\n+/g, ' ').trim();
    return clean.length > maxLength ? clean.slice(0, maxLength) + '...' : clean;
  };

  const getTagColor = (tag: string) => {
    const colors = [
      'bg-gold-500/20 text-gold-400 border-gold-500/30',
      'bg-gray-700/20 text-gray-400 border-gray-700/30',
      'bg-gold-400/20 text-gold-300 border-gold-400/30',
      'bg-gray-600/20 text-gray-500 border-gray-600/30',
      'bg-gold-500/20 text-gold-400 border-gold-500/30',
      'bg-gray-700/20 text-gray-400 border-gray-700/30',
    ];
    const index = tag.charCodeAt(0) % colors.length;
    return colors[index];
  };

  const getCharCount = (content: string) => content.length;
  const getWordCount = (content: string) => {
    const chineseChars = (content.match(/[\u4e00-\u9fff]/g) || []).length;
    const otherWords = content.replace(/[\u4e00-\u9fff]/g, ' ').split(/\s+/).filter(Boolean).length;
    return chineseChars + otherWords;
  };

  // Calculate statistics
  const totalChars = notes.reduce((sum, note) => sum + getCharCount(note.content), 0);
  const totalWords = notes.reduce((sum, note) => sum + getWordCount(note.content), 0);
  const totalVideos = new Set(notes.filter(n => n.videoTitle).map(n => n.videoTitle)).size;

  return (
    <div className="min-h-screen bg-black-main pb-8">
      {/* Top Bar */}
      <div className="h-1 bg-gold-500" />
      
      {/* Header */}
      <div className="relative">
        
        <div className="relative max-w-7xl mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gold-500/20 flex items-center justify-center border border-gold-500/30">
                <BookOpen className="w-7 h-7 text-gold-400" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-white">
                  我的<span className="text-gold-400">笔记</span>
                </h1>
                <p className="text-gray-400 text-sm mt-1">共 {notes.length} 条笔记，{totalVideos} 个关联视频</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  loadNotes();
                  loadTags();
                }}
                className="flex items-center gap-2 px-4 py-2.5 bg-black-card border border-gray-700 text-gray-300 rounded-xl hover:bg-gray-800 transition-all"
                title="刷新笔记"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
              <Link 
                to="/learning-cabin"
                className="flex items-center gap-2 px-5 py-2.5 bg-gold-500 text-white font-medium rounded-xl hover:opacity-90 transition-all"
              >
                <Plus className="w-4 h-4" />
                新建笔记
              </Link>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-black-card border border-gray-800 rounded-xl p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gold-500/20 flex items-center justify-center">
                <FileText className="w-5 h-5 text-gold-400" />
              </div>
              <div>
                <div className="text-xl font-bold text-white">{notes.length}</div>
                <div className="text-xs text-gray-500">笔记总数</div>
              </div>
            </div>
            <div className="bg-black-card border border-gray-800 rounded-xl p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gold-500/20 flex items-center justify-center">
                <Type className="w-5 h-5 text-gold-400" />
              </div>
              <div>
                <div className="text-xl font-bold text-white">{totalChars.toLocaleString()}</div>
                <div className="text-xs text-gray-500">总字符数</div>
              </div>
            </div>
            <div className="bg-black-card border border-gray-800 rounded-xl p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gold-500/20 flex items-center justify-center">
                <Hash className="w-5 h-5 text-gold-400" />
              </div>
              <div>
                <div className="text-xl font-bold text-white">{totalWords.toLocaleString()}</div>
                <div className="text-xs text-gray-500">总词数</div>
              </div>
            </div>
            <div className="bg-black-card border border-gray-800 rounded-xl p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gold-500/20 flex items-center justify-center">
                <Video className="w-5 h-5 text-gold-400" />
              </div>
              <div>
                <div className="text-xl font-bold text-white">{totalVideos}</div>
                <div className="text-xs text-gray-500">关联视频</div>
              </div>
            </div>
          </div>

          {/* Search & Filters */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="搜索笔记标题、内容或标签..."
                className="w-full bg-black-card border border-gray-800 rounded-xl pl-12 pr-4 py-3 text-gray-200 placeholder-gray-500 focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20 outline-none transition-all"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-4 py-3 rounded-xl border transition-all ${
                  showFilters || selectedTag 
                    ? 'bg-gold-500/20 border-gold-500/50 text-gold-400' 
                    : 'bg-black-card border-gray-800 text-gray-400 hover:text-gray-200'
                }`}
              >
                <Filter className="w-4 h-4" />
                筛选
                <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
              </button>

              <div className="flex items-center bg-black-card border border-gray-800 rounded-xl overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-3 transition-all ${viewMode === 'grid' ? 'bg-gold-500/20 text-gold-400' : 'text-gray-500 hover:text-gray-300'}`}
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 16 16">
                    <rect x="1" y="1" width="6" height="6" rx="1" />
                    <rect x="9" y="1" width="6" height="6" rx="1" />
                    <rect x="1" y="9" width="6" height="6" rx="1" />
                    <rect x="9" y="9" width="6" height="6" rx="1" />
                  </svg>
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-3 transition-all ${viewMode === 'list' ? 'bg-gold-500/20 text-gold-400' : 'text-gray-500 hover:text-gray-300'}`}
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 16 16">
                    <rect x="1" y="2" width="14" height="2" rx="0.5" />
                    <rect x="1" y="7" width="14" height="2" rx="0.5" />
                    <rect x="1" y="12" width="14" height="2" rx="0.5" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <div className="mt-4 p-5 bg-black-card border border-gray-800 rounded-xl animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-400">排序：</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="bg-black-light border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-300 outline-none focus:border-gold-500 cursor-pointer"
                  >
                    <option value="updated">最近更新</option>
                    <option value="created">创建时间</option>
                    <option value="title">标题</option>
                  </select>
                </div>

                {allTags.length > 0 && (
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm text-gray-400">标签：</span>
                    {selectedTag && (
                      <button
                        onClick={() => setSelectedTag(null)}
                        className="text-xs px-3 py-1.5 bg-gold-500/20 text-gold-400 rounded-full flex items-center gap-1 hover:bg-gold-500/30 transition-all"
                      >
                        清除
                        <X className="w-3 h-3" />
                      </button>
                    )}
                    <div className="flex flex-wrap gap-2">
                      {allTags.map(tag => (
                        <button
                          key={tag}
                          onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                          className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                            selectedTag === tag 
                              ? 'bg-gold-500/30 border-gold-500 text-gold-300' 
                              : 'bg-black-light border-gray-700 text-gray-400 hover:border-gray-600'
                          }`}
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="relative w-16 h-16 mx-auto mb-6">
                <div className="absolute inset-0 border-4 border-gold-500/20 rounded-full" />
                <div className="absolute inset-0 border-4 border-gold-500 border-t-transparent rounded-full animate-spin" />
              </div>
              <p className="text-gray-400">加载笔记中...</p>
            </div>
          </div>
        ) : filteredNotes.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-gray-800/50 to-gray-900/50 flex items-center justify-center mx-auto mb-6 border border-gray-800">
              <BookOpen className="w-12 h-12 text-gray-600" />
            </div>
            <h3 className="text-xl font-medium text-gray-300 mb-3">
              {searchQuery ? '没有找到相关笔记' : '还没有笔记'}
            </h3>
            <p className="text-gray-500 mb-8 max-w-md mx-auto">
              {searchQuery ? '尝试换个关键词搜索，或者清除筛选条件' : '在学习舱中观看视频时，可以随时记录笔记并保存到这里'}
            </p>
            {!searchQuery && (
              <Link 
                to="/learning-cabin"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gold-500 text-white font-medium rounded-xl hover:opacity-90 transition-all"
              >
                <Sparkles className="w-4 h-4" />
                开始学习并记录笔记
              </Link>
            )}
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
            {filteredNotes.map((note, index) => (
              <div 
                key={note.id} 
                className="group relative bg-black-card border border-gray-800 rounded-2xl overflow-hidden hover:border-gold-500/50 transition-all duration-300 hover:-translate-y-1"
                style={{ animationDelay: `${index * 50}ms` }}
              >

                <div className="relative p-5">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <Link to={`/notes/${note.id}`} className="block">
                        <h3 className="font-bold text-white text-lg leading-tight group-hover:text-gold-400 transition-colors line-clamp-2">
                          {note.title}
                        </h3>
                      </Link>
                    </div>
                    
                    <div className="relative ml-2">
                      <button
                        onClick={() => setMenuOpen(menuOpen === note.id ? null : note.id)}
                        className="p-2 text-gray-500 hover:text-gray-300 hover:bg-gray-800 rounded-lg transition-colors"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                      
                      {menuOpen === note.id && (
                        <div className="absolute right-0 top-full mt-1 w-40 bg-black-light border border-gray-700 rounded-xl shadow-xl z-10 py-2 animate-in fade-in zoom-in-95 duration-100">
                          <Link
                            to={`/notes/${note.id}`}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:bg-gray-800 transition-colors"
                          >
                            <Eye className="w-4 h-4 text-blue-400" />
                            查看详情
                          </Link>
                          <button
                            onClick={() => handleDelete(note.id)}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                            删除笔记
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Video Info */}
                  {note.videoTitle && (
                    <div className="flex items-center gap-2 mb-3 text-sm text-gray-400 bg-gray-800/50 rounded-lg px-3 py-2">
                      <Video className="w-4 h-4 text-gold-400 shrink-0" />
                      <span className="truncate">{note.videoTitle}</span>
                    </div>
                  )}

                  {/* Preview */}
                  <p className="text-gray-500 text-sm leading-relaxed line-clamp-3 mb-4">
                    {getPreviewContent(note.content)}
                  </p>

                  {/* Tags */}
                  {note.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {note.tags.slice(0, 3).map(tag => (
                        <span
                          key={tag}
                          className={`text-xs px-2.5 py-1 rounded-full border ${getTagColor(tag)}`}
                        >
                          {tag}
                        </span>
                      ))}
                      {note.tags.length > 3 && (
                        <span className="text-xs px-2 py-1 rounded-full bg-gray-800 text-gray-500">
                          +{note.tags.length - 3}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-800/50">
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDate(note.updatedAt)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Type className="w-3 h-3" />
                        {getCharCount(note.content)} 字
                      </span>
                    </div>
                    
                    <Link
                      to={`/notes/${note.id}`}
                      className="flex items-center gap-1 text-xs font-medium text-gold-400 hover:text-gold-300 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      查看全文
                      <ChevronDown className="w-3 h-3 -rotate-90" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-3 pt-4">
            {filteredNotes.map((note, index) => (
              <div 
                key={note.id}
                className="group bg-black-card border border-gray-800 rounded-xl p-5 hover:border-gold-500/50 transition-all flex items-center gap-5"
              >
                <div className="w-12 h-12 rounded-xl bg-gold-500/20 flex items-center justify-center shrink-0 border border-gold-500/20">
                  <BookOpen className="w-6 h-6 text-gold-400" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <Link to={`/notes/${note.id}`} className="font-semibold text-white text-lg hover:text-gold-400 transition-colors">
                      {note.title}
                    </Link>
                    {note.videoTitle && (
                      <span className="text-xs text-gray-500 flex items-center gap-1 bg-gray-800/50 px-2 py-1 rounded-full">
                        <Video className="w-3 h-3" />
                        {note.videoTitle}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 truncate">{getPreviewContent(note.content, 120)}</p>
                  
                  <div className="flex items-center gap-4 mt-2">
                    {note.tags.length > 0 && (
                      <div className="hidden sm:flex gap-1.5">
                        {note.tags.slice(0, 3).map(tag => (
                          <span key={tag} className={`text-xs px-2 py-0.5 rounded-full border ${getTagColor(tag)}`}>
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      <Type className="w-3 h-3" />
                      {getCharCount(note.content)} 字
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-sm text-gray-500 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatDate(note.updatedAt)}
                  </span>
                  
                  <Link
                    to={`/notes/${note.id}`}
                    className="p-2.5 text-gray-500 hover:text-gold-400 hover:bg-gold-500/10 rounded-xl transition-all"
                  >
                    <Eye className="w-4 h-4" />
                  </Link>
                  
                  <button
                    onClick={() => handleDelete(note.id)}
                    className="p-2.5 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotesPage;
