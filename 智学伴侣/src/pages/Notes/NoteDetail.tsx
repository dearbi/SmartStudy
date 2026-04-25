import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Edit3, 
  Trash2, 
  Clock, 
  Video, 
  Tag, 
  Share2, 
  Copy, 
  Check,
  Calendar,
  Sparkles,
  BookOpen,
  Download,
  Plus,
  X,
  FileText,
  Type,
  AlignLeft,
  Hash,
  ClockIcon,
  BarChart2,
  Eye,
  Link2,
  Twitter,
  Linkedin,
  Copy as CopyIcon,
  CheckCircle2,
  ChevronRight,
  Layers,
  RefreshCw,
  Wand2,
  Sparkle,
  Brain,
  Lightbulb,
  TrendingUp
} from 'lucide-react';
import { getNoteById, deleteNoteById, updateNoteById } from '../../services/api';
import MDEditor from '@uiw/react-md-editor';

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

interface NoteStats {
  characters: number;
  words: number;
  lines: number;
  paragraphs: number;
  readingTime: number;
  uniqueWords: number;
}

const NoteDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [note, setNote] = useState<Note | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editTags, setEditTags] = useState<string[]>([]);
  const [editVideoSrc, setEditVideoSrc] = useState('');
  const [newTag, setNewTag] = useState('');
  const [copied, setCopied] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [aiProcessing, setAiProcessing] = useState(false);
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  useEffect(() => {
    if (id) {
      loadNote(id);
    }
  }, [id]);

  const loadNote = async (noteId: string) => {
    try {
      setLoading(true);
      const data = await getNoteById(noteId);
      setNote(data);
      setEditTitle(data.title);
      setEditContent(data.content);
      setEditTags(data.tags || []);
      setEditVideoSrc(data.videoSrc || '');
    } catch (error) {
      console.error('Failed to load note:', error);
      alert('加载笔记失败');
      navigate('/notes');
    } finally {
      setLoading(false);
    }
  };

  // Calculate note statistics
  const stats: NoteStats = useMemo(() => {
    if (!note) return { characters: 0, words: 0, lines: 0, paragraphs: 0, readingTime: 0, uniqueWords: 0 };
    
    const content = note.content;
    const characters = content.length;
    const lines = content.split('\n').length;
    const paragraphs = content.split(/\n\n+/).filter(p => p.trim()).length;
    
    // Chinese word count estimation (more accurate for mixed content)
    const chineseChars = (content.match(/[\u4e00-\u9fff]/g) || []).length;
    const otherWords = content.replace(/[\u4e00-\u9fff]/g, ' ').split(/\s+/).filter(Boolean).length;
    const words = chineseChars + otherWords;
    
    // Estimate reading time (average 400 Chinese chars/min or 200 words/min)
    const readingTime = Math.max(1, Math.ceil(words / 200));
    
    // Unique words
    const allWords = content.toLowerCase().replace(/[\u4e00-\u9fff]/g, ' ').split(/\s+/).filter(Boolean);
    const uniqueWords = new Set(allWords).size;
    
    return { characters, words, lines, paragraphs, readingTime, uniqueWords };
  }, [note]);

  // Generate outline from markdown
  const outline = useMemo(() => {
    if (!note) return [];
    const lines = note.content.split('\n');
    const headings: { level: number; text: string; line: number }[] = [];
    
    lines.forEach((line, index) => {
      // 标准格式: ## 标题 (有空格)
      let match = line.match(/^(#{1,6})\s+(.+)$/);
      if (match) {
        headings.push({
          level: match[1].length,
          text: match[2].replace(/[*_`]/g, '').trim(),
          line: index
        });
        return;
      }
      // 紧凑格式: ##标题 (无空格)
      match = line.match(/^(#{1,6})(.+)$/);
      if (match && match[2].trim()) {
        headings.push({
          level: match[1].length,
          text: match[2].replace(/[*_`]/g, '').trim(),
          line: index
        });
      }
    });
    
    return headings;
  }, [note]);

  const handleSave = async () => {
    if (!id) return;
    setSaveStatus('saving');
    try {
      await updateNoteById(id, {
        title: editTitle,
        content: editContent,
        tags: editTags,
        videoSrc: editVideoSrc || undefined
      });
      setNote(prev => prev ? {
        ...prev,
        title: editTitle,
        content: editContent,
        tags: editTags,
        videoSrc: editVideoSrc || undefined
      } : null);
      setIsEditing(false);
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (error) {
      console.error('Save failed:', error);
      alert('保存失败');
      setSaveStatus('idle');
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    try {
      await deleteNoteById(id);
      navigate('/notes');
    } catch (error) {
      console.error('Delete failed:', error);
      alert('删除失败');
    }
  };

  const handleCopyContent = async () => {
    try {
      await navigator.clipboard.writeText(note?.content || '');
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Copy failed:', error);
    }
  };

  const handleAddTag = () => {
    const tag = newTag.trim();
    if (tag && !editTags.includes(tag)) {
      setEditTags([...editTags, tag]);
    }
    setNewTag('');
  };

  const handleRemoveTag = (tag: string) => {
    setEditTags(editTags.filter(t => t !== tag));
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getRelativeTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return '刚刚';
    if (minutes < 60) return `${minutes}分钟前`;
    if (hours < 24) return `${hours}小时前`;
    if (days < 7) return `${days}天前`;
    return formatDate(dateStr);
  };

  const getTagColor = (tag: string) => {
    const colors = [
      'bg-blue-500/20 text-blue-400 border-blue-500/30',
      'bg-green-500/20 text-green-400 border-green-500/30',
      'bg-purple-500/20 text-purple-400 border-purple-500/30',
      'bg-orange-500/20 text-orange-400 border-orange-500/30',
      'bg-pink-500/20 text-pink-400 border-pink-500/30',
      'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
    ];
    const index = tag.charCodeAt(0) % colors.length;
    return colors[index];
  };

  const handleAiSummarize = async () => {
    if (!note) return;
    setAiProcessing(true);
    try {
      // Simulated AI summary
      await new Promise(resolve => setTimeout(resolve, 1500));
      const summary = `📝 **AI 摘要**\n\n这份笔记包含 ${stats.characters} 个字符，${stats.paragraphs} 个段落。主要涉及 ${note.tags.join('、') || '未分类'} 主题。预计阅读时间约 ${stats.readingTime} 分钟。`;
      setAiSummary(summary);
    } catch (error) {
      console.error('AI summary failed:', error);
    } finally {
      setAiProcessing(false);
    }
  };

  const handleExportMarkdown = () => {
    if (!note) return;
    const blob = new Blob([note.content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${note.title}.md`;
    a.click();
    URL.revokeObjectURL(url);
    setShowExportMenu(false);
  };

  const handleExportPlainText = () => {
    if (!note) return;
    const plainText = note.content.replace(/[#*`\[\]()]/g, '');
    const blob = new Blob([plainText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${note.title}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    setShowExportMenu(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black-main flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-6">
            <div className="absolute inset-0 border-4 border-purple-500/20 rounded-full" />
            <div className="absolute inset-0 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
            <div className="absolute inset-2 border-2 border-blue-500/30 border-b-transparent rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
          </div>
          <p className="text-gray-400 animate-pulse">加载笔记中...</p>
        </div>
      </div>
    );
  }

  if (!note) {
    return (
      <div className="min-h-screen bg-black-main flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 rounded-2xl bg-gray-800/50 flex items-center justify-center mx-auto mb-6">
            <FileText className="w-10 h-10 text-gray-600" />
          </div>
          <h2 className="text-xl font-medium text-gray-300 mb-3">笔记不存在</h2>
          <p className="text-gray-500 mb-6">该笔记可能已被删除或链接无效</p>
          <Link 
            to="/notes" 
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white font-medium rounded-xl hover:opacity-90 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            返回笔记列表
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black-main">
      {/* Top Gradient Bar */}
      <div className="h-1 bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-500" />
      
      {/* Header */}
      <div className="sticky top-0 z-50 bg-black-main/95 backdrop-blur-xl border-b border-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/notes')}
                className="p-2.5 text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-xl transition-all"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              
              {!isEditing && (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center border border-purple-500/30">
                    <BookOpen className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <h1 className="font-bold text-white text-lg leading-tight line-clamp-1">{note.title}</h1>
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {getRelativeTime(note.updatedAt)}
                      </span>
                      <span className="text-gray-700">•</span>
                      <span className="flex items-center gap-1">
                        <Type className="w-3 h-3" />
                        {stats.characters} 字
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              {isEditing ? (
                <>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-xl transition-all"
                  >
                    取消
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saveStatus === 'saving'}
                    className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white font-medium rounded-xl hover:opacity-90 transition-all disabled:opacity-50"
                  >
                    {saveStatus === 'saving' ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        保存中...
                      </>
                    ) : saveStatus === 'saved' ? (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        已保存
                      </>
                    ) : (
                      '保存'
                    )}
                  </button>
                </>
              ) : (
                <>
                  {/* Copy Button */}
                  <button
                    onClick={handleCopyContent}
                    className="p-2.5 text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-xl transition-all"
                    title="复制内容"
                  >
                    {copied ? <Check className="w-5 h-5 text-green-400" /> : <Copy className="w-5 h-5" />}
                  </button>
                  
                  {/* Export Button */}
                  <div className="relative">
                    <button
                      onClick={() => setShowExportMenu(!showExportMenu)}
                      className="p-2.5 text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-xl transition-all"
                      title="导出"
                    >
                      <Download className="w-5 h-5" />
                    </button>
                    {showExportMenu && (
                      <div className="absolute right-0 top-full mt-2 w-48 bg-black-light border border-gray-700 rounded-xl shadow-xl z-10 py-2 animate-in fade-in zoom-in-95 duration-100">
                        <button
                          onClick={handleExportMarkdown}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:bg-gray-800 transition-colors"
                        >
                          <FileText className="w-4 h-4 text-purple-400" />
                          导出为 Markdown
                        </button>
                        <button
                          onClick={handleExportPlainText}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:bg-gray-800 transition-colors"
                        >
                          <FileText className="w-4 h-4 text-blue-400" />
                          导出为纯文本
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Share Button */}
                  <div className="relative">
                    <button
                      onClick={() => setShowShareMenu(!showShareMenu)}
                      className="p-2.5 text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-xl transition-all"
                      title="分享"
                    >
                      <Share2 className="w-5 h-5" />
                    </button>
                    {showShareMenu && (
                      <div className="absolute right-0 top-full mt-2 w-48 bg-black-light border border-gray-700 rounded-xl shadow-xl z-10 py-2 animate-in fade-in zoom-in-95 duration-100">
                        <button
                          onClick={handleCopyContent}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:bg-gray-800 transition-colors"
                        >
                          <CopyIcon className="w-4 h-4 text-gray-400" />
                          复制链接
                        </button>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(note.content);
                            setShowShareMenu(false);
                          }}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:bg-gray-800 transition-colors"
                        >
                          <Link2 className="w-4 h-4 text-green-400" />
                          复制内容
                        </button>
                      </div>
                    )}
                  </div>

                  {/* AI Summarize */}
                  <button
                    onClick={handleAiSummarize}
                    disabled={aiProcessing}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-500/30 text-purple-400 rounded-xl hover:from-purple-500/30 hover:to-blue-500/30 transition-all disabled:opacity-50"
                    title="AI 摘要"
                  >
                    <Sparkles className={`w-4 h-4 ${aiProcessing ? 'animate-pulse' : ''}`} />
                    <span className="hidden sm:inline">{aiProcessing ? '生成中...' : 'AI 摘要'}</span>
                  </button>

                  {/* Edit Button */}
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white font-medium rounded-xl hover:opacity-90 transition-all"
                  >
                    <Edit3 className="w-4 h-4" />
                    <span className="hidden sm:inline">编辑</span>
                  </button>

                  {/* Delete Button */}
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="p-2.5 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all"
                    title="删除"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar - Quick Actions & Outline */}
          <div className="lg:col-span-1 order-2 lg:order-1">
            <div className="sticky top-24 space-y-4">
              {/* Quick Actions Card */}
              <div className="bg-black-card border border-gray-800 rounded-2xl p-5">
                <h3 className="font-semibold text-white mb-4">快速操作</h3>
                <div className="space-y-2">
                  <button
                    onClick={handleAiSummarize}
                    disabled={aiProcessing}
                    className="w-full flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-500/30 text-purple-400 rounded-xl hover:from-purple-500/30 hover:to-blue-500/30 transition-all disabled:opacity-50"
                  >
                    <Sparkles className={`w-5 h-5 ${aiProcessing ? 'animate-pulse' : ''}`} />
                    <span>{aiProcessing ? '生成中...' : 'AI 智能摘要'}</span>
                  </button>
                  <button
                    onClick={handleCopyContent}
                    className="w-full flex items-center gap-3 px-4 py-3 bg-gray-800/50 border border-gray-700 text-gray-300 rounded-xl hover:bg-gray-800 transition-all"
                  >
                    {copied ? <Check className="w-5 h-5 text-green-400" /> : <Copy className="w-5 h-5" />}
                    <span>{copied ? '已复制!' : '复制内容'}</span>
                  </button>
                  <button
                    onClick={handleExportMarkdown}
                    className="w-full flex items-center gap-3 px-4 py-3 bg-gray-800/50 border border-gray-700 text-gray-300 rounded-xl hover:bg-gray-800 transition-all"
                  >
                    <Download className="w-5 h-5" />
                    <span>导出 Markdown</span>
                  </button>
                </div>
              </div>

              {/* Document Outline Card */}
              <div className="bg-black-card border border-gray-800 rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Layers className="w-5 h-5 text-purple-400" />
                  <h3 className="font-semibold text-white">文档大纲</h3>
                </div>
                {outline.length > 0 ? (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {outline.map((heading, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 text-gray-400 hover:text-purple-400 transition-colors cursor-pointer py-1"
                        style={{ paddingLeft: `${(heading.level - 1) * 12}px` }}
                      >
                        <ChevronRight className="w-3 h-3 text-gray-600 shrink-0" />
                        <span className={`text-sm truncate ${heading.level === 1 ? 'font-medium text-gray-200' : ''}`}>
                          {heading.text}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <Layers className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">暂无标题</p>
                    <p className="text-xs text-gray-600 mt-1">添加 ## 标题 以生成大纲</p>
                  </div>
                )}
              </div>

              {/* AI Summary Card */}
              {aiSummary && (
                <div className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-purple-500/30 rounded-2xl p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="w-5 h-5 text-purple-400" />
                    <h3 className="font-semibold text-white">AI 摘要</h3>
                  </div>
                  <div className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">
                    {aiSummary}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3 order-1 lg:order-2">
            {isEditing ? (
              <div className="space-y-4">
                {/* Edit Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">标题</label>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full bg-black-card border border-gray-800 rounded-xl px-4 py-3 text-white text-xl font-semibold focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all"
                    placeholder="笔记标题"
                  />
                </div>

                {/* Edit Tags */}
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">标签</label>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {editTags.map(tag => (
                      <span
                        key={tag}
                        className={`inline-flex items-center gap-1 text-sm px-3 py-1.5 rounded-full border ${getTagColor(tag)}`}
                      >
                        {tag}
                        <button onClick={() => handleRemoveTag(tag)} className="hover:text-white ml-1">
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
                      placeholder="添加标签，按回车确认..."
                      className="flex-1 bg-black-card border border-gray-800 rounded-xl px-4 py-2.5 text-gray-300 text-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all"
                    />
                    <button
                      onClick={handleAddTag}
                      className="px-5 py-2.5 bg-purple-500/20 text-purple-400 rounded-xl hover:bg-purple-500/30 transition-all border border-purple-500/30"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Edit Video Link */}
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">相关视频链接</label>
                  <div className="relative">
                    <Video className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input
                      type="url"
                      value={editVideoSrc}
                      onChange={(e) => setEditVideoSrc(e.target.value)}
                      placeholder="粘贴视频链接，如 https://..."
                      className="w-full bg-black-card border border-gray-800 rounded-xl pl-12 pr-4 py-3 text-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all"
                    />
                    {editVideoSrc && (
                      <button
                        onClick={() => setEditVideoSrc('')}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <p className="text-xs text-gray-600 mt-1">支持任意视频网站链接</p>
                </div>

                {/* Edit Content */}
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">内容</label>
                  <div data-color-mode="dark" className="border border-gray-800 rounded-xl overflow-hidden">
                    <MDEditor
                      value={editContent}
                      onChange={(val) => setEditContent(val || '')}
                      height={500}
                      preview="edit"
                      style={{ backgroundColor: '#121212' }}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Related Video */}
                {note.videoSrc && (
                  <div className="bg-black-card border border-gray-800 rounded-2xl p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <Video className="w-5 h-5 text-purple-400" />
                      <h3 className="font-semibold text-white">相关视频</h3>
                    </div>
                    <a 
                      href={note.videoSrc} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-4 bg-purple-500/10 border border-purple-500/20 rounded-xl hover:bg-purple-500/20 transition-all group"
                    >
                      <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center shrink-0">
                        <Video className="w-5 h-5 text-purple-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-400">点击观看视频</p>
                        <p className="text-sm font-medium text-white truncate group-hover:text-purple-400 transition-colors">{note.videoSrc}</p>
                      </div>
                      <Eye className="w-5 h-5 text-gray-500 group-hover:text-purple-400 transition-colors shrink-0" />
                    </a>
                  </div>
                )}

                {/* Note Content */}
                <div className="bg-black-card border border-gray-800 rounded-2xl overflow-hidden">
                  <div className="p-6">
                    <div className="prose prose-invert max-w-none">
                      <div data-color-mode="dark">
                        <MDEditor
                          value={note.content}
                          onChange={() => {}}
                          height={Math.max(400, note.content.split('\n').length * 25)}
                          preview="preview"
                          style={{ backgroundColor: 'transparent', border: 'none' }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-black-card border border-gray-800 rounded-2xl p-6 max-w-md w-full animate-in fade-in zoom-in duration-200">
            <div className="text-center mb-6">
              <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-8 h-8 text-red-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">确认删除</h3>
              <p className="text-gray-400">确定要删除「{note.title}」吗？此操作无法撤销。</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-3 border border-gray-700 text-gray-300 rounded-xl hover:bg-gray-800 transition-all"
              >
                取消
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:opacity-90 transition-all"
              >
                确认删除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NoteDetailPage;
