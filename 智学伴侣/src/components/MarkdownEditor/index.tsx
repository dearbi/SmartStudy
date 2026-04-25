import React, { useRef } from 'react';
import MDEditor from '@uiw/react-md-editor';
import { Image, Sparkles, Upload } from 'lucide-react';
import { MarkdownEditorProps } from '../../types';

const MarkdownEditor: React.FC<MarkdownEditorProps> = ({ 
  value, 
  onChange, 
  onInsertScreenshot, 
  onAITransform 
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onChange) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result;
        if (base64 && typeof base64 === 'string') {
          const imageMarkdown = `\n\n![Uploaded Image ${new Date().toLocaleTimeString()}](${base64})`;
          onChange(value + imageMarkdown);
        }
      };
      reader.readAsDataURL(file);
      // Reset input so the same file can be uploaded again if needed
      e.target.value = '';
    }
  };

  return (
    <div className="flex flex-col h-full bg-black-card rounded-lg shadow-sm border border-gray-800 overflow-hidden">
      {/* Hidden File Input */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        accept="image/*" 
        className="hidden" 
      />

      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-800 bg-black-light">
        <span className="font-medium text-gray-200">学习笔记</span>
        <div className="flex items-center space-x-2">
          <button 
            onClick={onInsertScreenshot}
            className="flex items-center space-x-1 px-3 py-1.5 text-xs font-medium text-gray-300 bg-gray-800 border border-gray-700 rounded hover:bg-gray-700 hover:text-gold-400 transition-colors"
            title="一键插入视频帧截图"
          >
            <Image size={14} />
            <span>视频截图</span>
          </button>
          <button 
            onClick={handleUploadClick}
            className="flex items-center space-x-1 px-3 py-1.5 text-xs font-medium text-gray-300 bg-gray-800 border border-gray-700 rounded hover:bg-gray-700 hover:text-gold-400 transition-colors"
            title="手动上传本地图片"
          >
            <Upload size={14} />
            <span>上传图片</span>
          </button>
          <button 
            onClick={onAITransform}
            className="flex items-center space-x-1 px-3 py-1.5 text-xs font-medium text-purple-400 bg-purple-900/20 border border-purple-900/50 rounded hover:bg-purple-900/40 transition-colors"
            title="AI 转化标题层级"
          >
            <Sparkles size={14} />
            <span>AI 整理</span>
          </button>
        </div>
      </div>
      
      {/* Editor */}
      <div className="flex-1 overflow-hidden" data-color-mode="dark">
        <MDEditor
          value={value}
          onChange={onChange}
          height="100%"
          visibleDragbar={false}
          preview="live"
          style={{ height: '100%', border: 'none', boxShadow: 'none', backgroundColor: '#050505' }}
        />
      </div>
    </div>
  );
};

export default MarkdownEditor;
