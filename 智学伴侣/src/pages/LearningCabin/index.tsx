import React, { useState, useEffect, useRef, useCallback } from 'react';
import VideoPlayer from '../../components/VideoPlayer';
import MarkdownEditor from '../../components/MarkdownEditor';
import { 
  createSession, 
  endSession, 
  saveNote, 
  getNote, 
  getAISummary, 
  transformNote, 
  analyzeScreenshot 
} from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  Loader2, 
  Brain, 
  Zap, 
  Target, 
  ChevronRight,
  Monitor,
  Clock,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  MessageSquare,
  Send,
  Minimize2,
  Maximize2,
  Save,
  CheckCircle,
  Video,
  BookOpen,
  X
} from 'lucide-react';

const FocusTimer: React.FC<{ isActive: boolean; onComplete: () => void }> = ({ isActive, onComplete }) => {
  const [seconds, setSeconds] = useState(0);
  const [isPaused, setIsPaused] = useState(!isActive);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isActive && !isPaused) {
      intervalRef.current = setInterval(() => {
        setSeconds(s => s + 1);
      }, 1000);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isActive, isPaused]);

  const formatTime = (s: number) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  const handleReset = () => {
    setSeconds(0);
    setIsPaused(true);
  };

  return (
    <div className="bg-black-card/80 backdrop-blur-sm rounded-lg p-3 border border-gray-800/50">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className={`w-4 h-4 ${isActive && !isPaused ? 'text-green-400 animate-pulse' : 'text-gray-500'}`} />
          <span className="text-xs text-gray-400">专注计时</span>
        </div>
        <div className="text-xl font-mono text-white">{formatTime(seconds)}</div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsPaused(!isPaused)}
            className={`p-1.5 rounded transition-colors ${isPaused ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30' : 'bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30'}`}
          >
            {isPaused ? <Play className="w-3 h-3" /> : <Pause className="w-3 h-3" />}
          </button>
          <button onClick={handleReset} className="p-1.5 rounded bg-gray-800 text-gray-400 hover:bg-gray-700 transition-colors">
            <RotateCcw className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
};

const AIChat: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState<{ role: 'user' | 'ai'; content: string }[]>([
    { role: 'ai', content: '您好！我是您的AI学习助手。有什么学习上的问题我可以帮您解答吗？' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const userMessage = { role: 'user' as const, content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    setTimeout(() => {
      setMessages(prev => [...prev, {
        role: 'ai',
        content: '感谢您的提问！作为您的AI学习助手，我会根据您的问题提供个性化的学习建议。请继续学习，我会持续为您提供支持。'
      }]);
      setIsTyping(false);
    }, 1500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-4 right-4 w-96 h-[500px] bg-black-card border border-gray-800 rounded-xl shadow-2xl flex flex-col overflow-hidden z-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-900/50 to-blue-900/50 p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="text-sm font-bold text-white">AI 学习助手</div>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-xs text-gray-300">在线</span>
            </div>
          </div>
        </div>
        <button onClick={onClose} className="p-2 text-gray-400 hover:text-white transition-colors">
          <Minimize2 className="w-4 h-4" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] rounded-2xl p-3 ${
              msg.role === 'user' 
                ? 'bg-gold-500/20 text-gold-300 rounded-br-sm' 
                : 'bg-purple-500/20 text-gray-200 rounded-bl-sm'
            }`}>
              <p className="text-sm leading-relaxed">{msg.content}</p>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-purple-500/20 rounded-2xl rounded-bl-sm p-3">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-800/50">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="输入您的问题..."
            className="flex-1 bg-black-light/50 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-200 focus:border-purple-500 outline-none transition-colors"
          />
          <button
            onClick={handleSend}
            className="p-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

const LearningCabin: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [currentVideoSrc, setCurrentVideoSrc] = useState('https://sf1-cdn-tos.huoshanstatic.com/obj/media-fe/xgplayer_doc_video/mp4/xgplayer-demo-360p.mp4');
  const [videoUrlInput, setVideoUrlInput] = useState('');
  const [videoTitle, setVideoTitle] = useState<string>('');
  const [noteContent, setNoteContent] = useState('');
  const [noteTitle, setNoteTitle] = useState<string>('');
  const [videoLink, setVideoLink] = useState<string>('');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sessionInitialized, setSessionInitialized] = useState(false);
  const [aiSummary, setAiSummary] = useState<{ title: string; points: string[] } | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [isAIChatOpen, setIsAIChatOpen] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);
  const [isNotePanelOpen, setIsNotePanelOpen] = useState(false);
  const [panelPosition, setPanelPosition] = useState({ x: 0, y: 0 });
  const [panelSize, setPanelSize] = useState({ width: 800, height: 500 });
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeDirection, setResizeDirection] = useState<'bottom-right' | 'bottom' | 'right' | null>(null);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 800, height: 500 });
  const panelRef = useRef<HTMLDivElement>(null);

  const blobUrlsRef = useRef<string[]>([]);

  // 提取视频标题
  const extractVideoTitle = (src: string): string => {
    if (src.startsWith('blob:')) return '本地视频';
    if (src.includes('bilibili.com')) {
      const match = src.match(/BV\w+/);
      if (match) return `B站视频: ${match[0]}`;
    }
    // 从URL中提取文件名
    try {
      const url = new URL(src);
      const pathname = url.pathname;
      const filename = pathname.split('/').pop() || '';
      if (filename) {
        return decodeURIComponent(filename.replace(/\.[^/.]+$/, '')).substring(0, 50);
      }
    } catch (e) {}
    return '未命名视频';
  };

  // 保存笔记
  const handleSaveNote = useCallback(async () => {
    console.log('[LearningCabin] handleSaveNote called');
    console.log('[LearningCabin] sessionId:', sessionId);
    console.log('[LearningCabin] sessionInitialized:', sessionInitialized);
    console.log('[LearningCabin] noteContent length:', noteContent?.length || 0);
    
    if (!sessionInitialized || !sessionId) {
      alert('学习会话未初始化，请稍候...');
      return;
    }
    
    if (!noteContent || !noteContent.trim()) {
      alert('请先输入笔记内容');
      return;
    }
    
    setIsSaving(true);
    setSaveSuccess(false);
    
    try {
      const title = noteTitle || videoTitle || `笔记 ${new Date().toLocaleString('zh-CN')}`;
      console.log('[LearningCabin] Saving note...');
      
      const result = await saveNote({
        sessionId,
        content: noteContent,
        title,
        videoSrc: videoLink || currentVideoSrc,
        videoTitle: videoLink ? '' : videoTitle,
        tags: [user?.prepTarget || '通用']
      });
      
      console.log('[LearningCabin] Save result:', result);
      setSaveSuccess(true);
      setHasUnsavedChanges(false);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error: any) {
      console.error('[LearningCabin] Save failed:', error);
      alert(`保存失败: ${error?.message || '请检查网络连接'}`);
    } finally {
      setIsSaving(false);
    }
  }, [sessionId, sessionInitialized, noteContent, noteTitle, videoTitle, currentVideoSrc, user]);

  // 初始化学习会话
  useEffect(() => {
    const initSession = async () => {
      console.log('[LearningCabin] Starting session initialization...');
      setInitError(null);
      
      try {
        // 如果已有 session，先结束它
        if (sessionId) {
          try {
            await endSession(sessionId);
          } catch (e) {
            console.warn('[LearningCabin] Could not end previous session:', e);
          }
        }

        // 提取视频标题
        const title = extractVideoTitle(currentVideoSrc);
        setVideoTitle(title);
        
        // 创建新 session
        console.log('[LearningCabin] Creating session for:', currentVideoSrc);
        const session = await createSession(currentVideoSrc, title);
        
        if (!session || !session.id) {
          throw new Error('Session创建失败：返回数据格式错误');
        }
        
        console.log('[LearningCabin] Session created:', session.id);
        setSessionId(session.id);
        setSessionInitialized(true);
        
        // 尝试获取已有笔记
        try {
          const note = await getNote(session.id);
          if (note && note.content) {
            setNoteContent(note.content);
            if (note.title) setNoteTitle(note.title);
          }
        } catch (e) {
          console.warn('[LearningCabin] Could not load existing note:', e);
        }

        // 尝试获取AI摘要（可选功能，失败不影响主功能）
        setAiSummary(null);
        if (currentVideoSrc.includes('xgplayer-demo') || currentVideoSrc.startsWith('blob:')) {
          // 延迟启动AI摘要，避免影响主功能加载
          setTimeout(() => {
            // 模拟视频帧捕获和AI摘要分析
            console.log('[LearningCabin] Starting AI summary analysis...');
            setIsSummarizing(true);
            
            // 模拟视频帧（实际应用中应该从视频中捕获帧）
            const mockFrames = [
              'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='
            ];
            
            // 调用AI摘要API
            getAISummary(mockFrames)
              .then(summary => {
                console.log('[LearningCabin] AI summary received:', summary);
                setAiSummary(summary);
                setIsSummarizing(false);
                setAiError(null);
              })
              .catch(error => {
                console.error('[LearningCabin] AI summary failed:', error);
                setAiError('AI 摘要分析失败，请稍后重试');
                setIsSummarizing(false);
              });
          }, 5000);
        }
        
      } catch (error: any) {
        console.error('[LearningCabin] Session init failed:', error);
        setInitError(error?.message || '会话初始化失败');
        setSessionInitialized(false);
      }
    };

    initSession();

    // 组件卸载时清理
    return () => {
      // 延迟结束session，避免与新session冲突
      setTimeout(() => {
        if (sessionId) {
          endSession(sessionId).catch(e => console.warn('[LearningCabin] Cleanup session failed:', e));
        }
      }, 1000);
    };
  }, []);

  // 自动保存笔记内容变化
  useEffect(() => {
    if (!sessionId || !noteContent) return;
    const timer = setTimeout(() => {
      if (noteContent.trim()) {
        setHasUnsavedChanges(true);
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [noteContent, sessionId]);

  // 当视频源变化时，重新分析视频
  useEffect(() => {
    if (currentVideoSrc) {
      console.log('[LearningCabin] Video source changed, starting AI analysis...');
      setAiSummary(null);
      setAiError(null);
      
      // 延迟启动AI摘要，避免影响主功能加载
      const timer = setTimeout(() => {
        console.log('[LearningCabin] Starting AI summary analysis...');
        setIsSummarizing(true);
        
        // 模拟视频帧（实际应用中应该从视频中捕获帧）
        const mockFrames = [
          'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='
        ];
        
        // 调用AI摘要API
        getAISummary(mockFrames)
          .then(summary => {
            console.log('[LearningCabin] AI summary received:', summary);
            setAiSummary(summary);
            setIsSummarizing(false);
            setAiError(null);
          })
          .catch(error => {
            console.error('[LearningCabin] AI summary failed:', error);
            setAiError('AI 摘要分析失败，请稍后重试');
            setIsSummarizing(false);
          });
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [currentVideoSrc]);

  useEffect(() => {
    return () => {
      blobUrlsRef.current.forEach(url => URL.revokeObjectURL(url));
    };
  }, []);

  const handleLoadVideo = useCallback(() => {
    if (videoUrlInput && videoUrlInput !== currentVideoSrc) {
        setCurrentVideoSrc(videoUrlInput);
    }
  }, [videoUrlInput, currentVideoSrc]);

  const handleLocalVideoUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      blobUrlsRef.current.push(url);
      setCurrentVideoSrc(url);
      setVideoTitle(file.name.replace(/\.[^/.]+$/, ''));
      setVideoUrlInput(`本地文件: ${file.name}`);
      e.target.value = '';
    }
  }, []);

  const handleInsertScreenshot = useCallback(async () => {
    if (isCapturing) return;
    
    console.log('[LearningCabin] Screenshot button clicked');
    
    const video = document.querySelector('video') as HTMLVideoElement | null;
    if (!video) {
        console.error('[LearningCabin] No video element found');
        alert('请先加载视频');
        return;
    }
    
    if (video.readyState < 2) {
        console.error('[LearningCabin] Video not ready:', video.readyState);
        alert('视频正在加载中，请稍等');
        return;
    }
    
    if (!video.videoWidth || !video.videoHeight) {
        console.error('[LearningCabin] Video dimensions not available');
        alert('无法获取视频尺寸，请确保视频已完全加载');
        return;
    }

    setIsCapturing(true);
    
    try {
        const MAX_WIDTH = 800; 
        let targetWidth = video.videoWidth;
        let targetHeight = video.videoHeight;

        if (targetWidth > MAX_WIDTH) {
            const ratio = MAX_WIDTH / targetWidth;
            targetWidth = MAX_WIDTH;
            targetHeight = Math.round(video.videoHeight * ratio);
        }

        const canvas = document.createElement('canvas');
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
            throw new Error('Canvas context not available');
        }

        ctx.drawImage(video, 0, 0, targetWidth, targetHeight);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.6);
        
        const timestamp = new Date().toLocaleTimeString();
        setNoteContent(prev => prev + `\n\n![截图 ${timestamp}](${dataUrl})`);

        // 调用 AI 分析
        try {
            console.log('[LearningCabin] Calling AI to analyze screenshot');
            const res = await analyzeScreenshot(dataUrl, `视频: ${currentVideoSrc}`);
            if (res.analysis) {
                setNoteContent(prev => prev + `\n\n> **AI 截图分析**:\n> ${res.analysis}\n`);
            }
        } catch (aiError) {
            console.error('[LearningCabin] AI screenshot analysis failed:', aiError);
            setNoteContent(prev => prev + `\n\n> *AI 分析暂时不可用*\n`);
        }
        
    } catch (e) {
        console.error("Screenshot failed:", e);
        alert('截图失败，请重试');
    } finally {
        setIsCapturing(false);
    }
  }, [isCapturing, currentVideoSrc]);

  const handleAITransform = useCallback(async () => {
    if (!noteContent) return;
    try {
        const res = await transformNote(noteContent);
        if (res.content) {
            setNoteContent(res.content);
        }
    } catch (e) {
        console.error("AI transform failed", e);
    }
  }, [noteContent]);

  const handleFocusChange = (focused: boolean) => {
    setIsFocusMode(focused);
    if (focused) setIsTimerActive(true);
  };



  // 使用全局鼠标事件监听器来确保调整大小操作不会被中断
  useEffect(() => {
    if (isResizing) {
      const handleGlobalMouseMove = (e: MouseEvent) => {
        if (isResizing && resizeDirection) {
          const deltaX = e.clientX - resizeStart.x;
          const deltaY = e.clientY - resizeStart.y;
          
          // 最小尺寸限制
          const minWidth = 400;
          const minHeight = 300;
          
          let newWidth = resizeStart.width;
          let newHeight = resizeStart.height;
          
          switch (resizeDirection) {
            case 'bottom-right':
              newWidth = Math.max(minWidth, resizeStart.width + deltaX);
              newHeight = Math.max(minHeight, resizeStart.height + deltaY);
              break;
            case 'bottom':
              newHeight = Math.max(minHeight, resizeStart.height + deltaY);
              break;
            case 'right':
              newWidth = Math.max(minWidth, resizeStart.width + deltaX);
              break;
          }
          
          setPanelSize({ width: newWidth, height: newHeight });
        }
      };

      const handleGlobalMouseUp = () => {
        setIsDragging(false);
        setIsResizing(false);
        setResizeDirection(null);
      };

      // 添加全局事件监听器
      document.addEventListener('mousemove', handleGlobalMouseMove);
      document.addEventListener('mouseup', handleGlobalMouseUp);

      // 清理事件监听器
      return () => {
        document.removeEventListener('mousemove', handleGlobalMouseMove);
        document.removeEventListener('mouseup', handleGlobalMouseUp);
      };
    }
  }, [isResizing, resizeDirection, resizeStart]);

  const handleMouseDown = (e: React.MouseEvent) => {
    // 检查是否是调整大小的区域
    const target = e.target as HTMLElement;
    if (target.classList.contains('resize-handle')) {
      // 阻止事件冒泡，防止被编辑器捕获
      e.stopPropagation();
      e.preventDefault();
      
      const direction = target.dataset.direction as 'bottom-right' | 'bottom' | 'right';
      setIsResizing(true);
      setResizeDirection(direction);
      setResizeStart({
        x: e.clientX,
        y: e.clientY,
        width: panelSize.width,
        height: panelSize.height
      });
    } else {
      // 否则是拖拽整个窗口
      setIsDragging(true);
      setDragStart({
        x: e.clientX - panelPosition.x,
        y: e.clientY - panelPosition.y
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPanelPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // 点击按钮时，将面板定位到视频下方
  const toggleNotePanel = () => {
    if (!isNotePanelOpen) {
      // 计算视频元素的位置和大小
      const videoElement = document.querySelector('.aspect-video') as HTMLElement;
      if (videoElement) {
        const rect = videoElement.getBoundingClientRect();
        setPanelPosition({
          x: rect.left,
          y: rect.bottom + 16 // 16px 间距
        });
      }
    }
    setIsNotePanelOpen(!isNotePanelOpen);
  };

  return (
    <div className={`mx-auto h-screen md:h-[calc(100vh-80px)] flex flex-col space-y-4 overflow-y-auto md:overflow-hidden bg-black-main transition-all duration-500 ${isFocusMode ? 'fixed inset-0 z-50' : ''}`}>
      {/* Header & Controls */}
      <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all duration-500 shrink-0 ${isFocusMode ? 'opacity-0 h-0 overflow-hidden' : 'opacity-100'}`}>
        <div className="flex items-center space-x-3">
          <div className="bg-gradient-to-br from-purple-500/20 to-blue-500/20 p-2 rounded-lg shrink-0 border border-purple-500/30">
            <Monitor className="text-purple-400 w-5 h-5 md:w-6 md:h-6" />
          </div>
          <div className="min-w-0">
            <h1 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2">
              沉浸式<span className="bg-clip-text text-transparent bg-gold-gradient">学习舱</span>
              <span className="px-2 py-0.5 bg-purple-500/20 rounded text-[10px] text-purple-400 font-bold hidden sm:inline">AI</span>
            </h1>
            <p className="text-xs md:text-sm text-gray-400 flex items-center">
              <Target size={14} className="mr-1 text-success-green shrink-0" />
              <span className="truncate">当前目标: {user?.prepTarget || '考研'}</span>
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <FocusTimer isActive={isTimerActive} onComplete={() => {}} />
          
          <input 
            type="text" 
            placeholder="粘贴视频链接..." 
            className="flex-1 sm:w-48 md:w-64 bg-black-card border border-gray-800 rounded-lg px-3 py-1.5 text-xs md:text-sm focus:border-purple-500/50 outline-none transition-all"
            value={videoUrlInput}
            onChange={(e) => setVideoUrlInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleLoadVideo()}
          />
          <button 
            onClick={handleLoadVideo}
            className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-bold px-3 py-1.5 rounded-lg text-xs md:text-sm transition-all shadow-lg shadow-purple-500/20"
          >
            加载
          </button>
          <div className="hidden sm:block w-px h-6 bg-gray-800 mx-1" />
          <label className="cursor-pointer bg-gray-800 hover:bg-gray-700 text-gray-200 px-3 py-1.5 rounded-lg text-xs md:text-sm transition-colors flex items-center gap-2">
            <Zap size={14} className="text-gold-400 shrink-0" />
            <span className="hidden xs:inline">上传本地</span>
            <input type="file" className="hidden" accept="video/*" onChange={handleLocalVideoUpload} />
          </label>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col space-y-4 min-h-0">
        {/* Top Row: Video & AI Assistant */}
        {isFocusMode ? (
          <div className="flex-1">
            <VideoPlayer 
              src={currentVideoSrc} 
              isFocusMode={isFocusMode}
              onFocusChange={handleFocusChange}
            />
          </div>
        ) : (
          <div className="flex flex-col lg:grid lg:grid-cols-12 gap-4 transition-all duration-500 lg:h-[55%]">
            {/* Video Column */}
            <div className="w-full lg:col-span-8 transition-all duration-500 ease-in-out relative bg-black rounded-xl overflow-hidden shadow-2xl border border-gray-800 aspect-video lg:aspect-auto">
              <VideoPlayer 
                src={currentVideoSrc} 
                isFocusMode={isFocusMode}
                onFocusChange={handleFocusChange}
              />
              {/* 学习笔记按钮 */}
              <button
                onClick={toggleNotePanel}
                className="absolute bottom-4 right-4 z-10 flex items-center gap-2 px-4 py-2 bg-gold-500 text-white font-medium rounded-lg hover:opacity-90 transition-all"
              >
                <BookOpen className="w-4 h-4" />
                {isNotePanelOpen ? '关闭笔记' : '学习笔记'}
              </button>
            </div>

            {/* AI Assistant Column */}
            <div className="w-full lg:col-span-4 flex flex-col transition-all duration-500 h-[300px] lg:h-auto">
                  <div className="bg-black-card border border-gray-800/50 rounded-xl p-4 flex flex-col h-full overflow-hidden shadow-lg relative">
                    <div className="flex items-center justify-between mb-3 shrink-0">
                      <div className="flex items-center space-x-2">
                        <div className="p-1.5 bg-purple-500/20 rounded-lg">
                          <Brain className="text-purple-400 w-4 h-4" />
                        </div>
                        <h2 className="font-bold text-gray-100 text-xs">AI 学习助手</h2>
                        <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                      </div>
                      <button
                        onClick={() => setIsAIChatOpen(true)}
                        className="p-1.5 text-gray-400 hover:text-purple-400 hover:bg-purple-500/10 rounded transition-colors"
                        title="打开AI对话"
                      >
                        <MessageSquare className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/2" />

                    <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar space-y-4 relative z-10">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center">
                            <ChevronRight size={12} className="text-purple-400 mr-1" />
                            本节摘要
                          </h3>
                          {isSummarizing && <Loader2 size={10} className="animate-spin text-purple-400" />}
                          {aiError && !isSummarizing && (
                            <button 
                              onClick={() => {
                                setAiError(null);
                                setAiSummary(null);
                                setIsSummarizing(true);
                              }}
                              className="text-[10px] text-purple-400 hover:text-purple-300 flex items-center gap-1"
                            >
                              <RotateCcw size={10} />
                              重试
                            </button>
                          )}
                        </div>
                        
                        {aiSummary ? (
                          <div className="bg-gradient-to-br from-purple-900/20 to-purple-900/5 border border-purple-500/20 rounded-lg p-3 space-y-2 animate-in fade-in slide-in-from-right-4 duration-500">
                            <h4 className="font-bold text-gold-400 text-xs leading-relaxed flex items-center gap-1">
                              <Sparkles className="w-3 h-3" />
                              {aiSummary.title || '视频内容摘要'}
                            </h4>
                            <ul className="space-y-1.5">
                              {(aiSummary.points || []).map((point, idx) => (
                                <li key={idx} className="text-[10px] text-gray-300 flex items-start leading-relaxed">
                                  <span className="text-purple-400 mr-2 mt-1">•</span>
                                  <span>{point}</span>
                                </li>
                              ))}
                            </ul>
                            {aiError && (
                              <div className="mt-2 pt-2 border-t border-purple-500/20">
                                <p className="text-[9px] text-red-400">{aiError}</p>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="bg-black-light/30 border border-dashed border-gray-800/50 rounded-lg p-5 text-center">
                            <Loader2 className="w-5 h-5 text-gray-600 animate-spin mx-auto mb-2" />
                            <p className="text-xs text-gray-500">
                              {isSummarizing ? 'AI 正在分析视频内容...' : '等待视频加载...'}
                            </p>
                            {!isSummarizing && !aiSummary && (
                              <p className="text-[10px] text-gray-600 mt-1">加载视频后会自动分析</p>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="p-3 bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20 rounded-lg space-y-1">
                        <h4 className="text-[9px] font-bold text-purple-400 flex items-center">
                          <Zap size={10} className="mr-1" /> 
                          学习建议
                        </h4>
                        <p className="text-[9px] text-gray-500 leading-relaxed">
                          点击"学习笔记"按钮，打开笔记编辑区记录学习内容。
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
          </div>
        )}

      </div>

        {/* 浮动学习笔记面板 */}
        {isNotePanelOpen && !isFocusMode && (
          <div 
            className="fixed z-40" 
            style={{
              left: `${panelPosition.x}px`,
              top: `${panelPosition.y}px`,
              cursor: isDragging ? 'grabbing' : isResizing ? 'resizing' : 'grab'
            }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            <div 
              className="bg-black-card rounded-lg border border-gray-800 overflow-hidden flex flex-col shadow-2xl"
              style={{
                width: `${panelSize.width}px`,
                height: `${panelSize.height}px`,
                maxWidth: '90vw',
                maxHeight: '80vh'
              }}
            >
              {/* Editor Header */}
              <div className="flex items-center justify-between px-4 py-2 border-b border-gray-800 bg-black-light cursor-move">
                <div className="flex items-center gap-3 flex-1">
                  <BookOpen className="w-4 h-4 text-amber-400" />
                  <input
                    type="text"
                    value={noteTitle}
                    onChange={(e) => {
                      setNoteTitle(e.target.value);
                      setHasUnsavedChanges(true);
                    }}
                    placeholder="为笔记添加标题..."
                    className="flex-1 bg-transparent text-sm text-gray-200 placeholder-gray-600 outline-none"
                  />
                  <div className="hidden md:flex items-center gap-1 bg-black px-2 py-1 rounded border border-gray-700">
                    <Video className="w-3 h-3 text-purple-400" />
                    <input
                      type="text"
                      value={videoLink}
                      onChange={(e) => {
                        setVideoLink(e.target.value);
                        setHasUnsavedChanges(true);
                      }}
                      placeholder="粘贴视频链接..."
                      className="w-32 bg-transparent text-xs text-gray-400 placeholder-gray-600 outline-none"
                    />
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {hasUnsavedChanges && (
                    <span className="text-xs text-yellow-500 flex items-center gap-1">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
                      未保存
                    </span>
                  )}
                  
                  <button
                    onClick={handleSaveNote}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      saveSuccess
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-amber-500/20 text-amber-400 hover:bg-amber-500/30'
                    }`}
                  >
                    {isSaving ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : saveSuccess ? (
                      <CheckCircle className="w-3 h-3" />
                    ) : (
                      <Save className="w-3 h-3" />
                    )}
                    {saveSuccess ? '已保存' : '保存笔记'}
                  </button>
                  
                  <button
                    onClick={toggleNotePanel}
                    className="p-1.5 text-gray-400 hover:text-white transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              {/* Editor Content */}
              <div className="flex-1 overflow-auto" onClick={(e) => e.stopPropagation()}>
                <MarkdownEditor 
                  value={noteContent} 
                  onChange={(val) => {
                    setNoteContent(val || '');
                    setHasUnsavedChanges(true);
                  }} 
                  onInsertScreenshot={handleInsertScreenshot}
                  onAITransform={handleAITransform}
                />
              </div>
              
              {/* 调整大小的手柄 */}
              <div className="absolute bottom-0 right-0 w-4 h-4 bg-gray-600 rounded-tl cursor-se-resize resize-handle hover:bg-gray-500 transition-colors" data-direction="bottom-right" />
              <div className="absolute bottom-0 left-0 right-0 h-2 bg-gray-700 cursor-s-resize resize-handle hover:bg-gray-600 transition-colors" data-direction="bottom" />
              <div className="absolute top-0 bottom-0 right-0 w-2 bg-gray-700 cursor-e-resize resize-handle hover:bg-gray-600 transition-colors" data-direction="right" />
            </div>
          </div>
        )}

      {/* AI Chat Button */}
      <button
        onClick={() => setIsAIChatOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full shadow-lg shadow-purple-500/30 flex items-center justify-center hover:scale-110 transition-transform z-40"
        title="AI 学习助手"
      >
        <Brain className="w-6 h-6 text-white" />
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-black-main animate-pulse" />
      </button>

      {/* AI Chat Panel */}
      <AIChat isOpen={isAIChatOpen} onClose={() => setIsAIChatOpen(false)} />
    </div>
  );
};

export default LearningCabin;
