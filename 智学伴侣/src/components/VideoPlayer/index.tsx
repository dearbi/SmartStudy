import React, { useState, useRef, useEffect, useCallback } from 'react';
import ReactPlayer from 'react-player';
import { Play, Pause, Volume2, Maximize, Lock } from 'lucide-react';
import { VideoPlayerProps } from '../../types';

const VideoPlayer: React.FC<VideoPlayerProps> = ({ src, isFocusMode: externalFocusMode = false, onFocusChange }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const [prevSrc, setPrevSrc] = useState(src);
  const isFocusMode = externalFocusMode;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const playerRef = useRef<any>(null);
  const nativeVideoRef = useRef<HTMLVideoElement>(null);

  // 关键修复：当 src 改变时，立即重置播放状态
  useEffect(() => {
    if (src !== prevSrc) {
      console.log("[VideoPlayer] Source changed, resetting state...");
      setPrevSrc(src);
      setIsPlaying(false);
      setIsReady(false);
      setCurrentTime(0);
      setDuration(0);
    }
  }, [src, prevSrc]);

  // 针对本地视频 (blob:) 的播放控制
  useEffect(() => {
    const video = nativeVideoRef.current;
    if (src?.startsWith('blob:') && video) {
        if (isPlaying) {
            const playPromise = video.play();
            if (playPromise !== undefined) {
                playPromise.catch(err => {
                    if (err.name !== 'AbortError' && err.name !== 'NotAllowedError') {
                        console.error("Native play error:", err);
                    }
                });
            }
        } else {
            video.pause();
        }
    }
  }, [isPlaying, src]);

  // Check if Bilibili URL
  const isBilibili = (url: string) => {
      return url && url.includes('bilibili.com');
  };

  const getBilibiliId = (url: string) => {
      const match = url.match(/BV\w+/);
      return match ? match[0] : null;
  };

  const bilibiliId = isBilibili(src) ? getBilibiliId(src) : null;

  const togglePlay = useCallback(() => {
    if (!src) return;
    setIsPlaying(prev => !prev);
  }, [src]);

  const handleProgress = (state: { played: number; playedSeconds: number; loaded: number; loadedSeconds: number }) => {
    setCurrentTime(state.playedSeconds);
    
    if (playerRef.current) {
        const d = playerRef.current.getDuration();
        if (d && !isNaN(d) && Math.abs(d - duration) > 1) {
             setDuration(d);
        }
    }
  };
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleReactPlayerProgress = (state: any) => {
    handleProgress(state);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
  };

  const handleFocusToggle = () => {
    if (onFocusChange) {
      onFocusChange(!isFocusMode);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const isLocalVideo = src?.startsWith('blob:');

  return (
    <div className={`bg-black shadow-lg relative group flex flex-col ${isFocusMode ? 'fixed inset-0 z-[9999] w-screen h-screen' : 'h-full rounded-lg overflow-hidden'}`}>
      {bilibiliId ? (
        <div className="relative w-full h-full">
            <iframe 
                src={`//player.bilibili.com/player.html?bvid=${bilibiliId}&page=1&high_quality=1&danmaku=0&controls=1&autoplay=0`} 
                scrolling="no" 
                frameBorder="0" 
                className="w-full h-full"
                allowFullScreen={true}
                allow="autoplay; encrypted-media; fullscreen"
            ></iframe>
            <button 
              onClick={handleFocusToggle} 
              className={`absolute top-4 right-4 z-[10000] flex items-center space-x-2 px-4 py-2 rounded-lg backdrop-blur-sm border transition-all shadow-lg cursor-pointer ${
                isFocusMode 
                  ? 'bg-green-500/80 hover:bg-green-500 border-green-400 text-white'
                  : 'bg-black/70 hover:bg-black/90 border-white/20 text-white opacity-80 hover:opacity-100'
              }`}
            >
              <Lock size={16} />
              <span>{isFocusMode ? '退出专注模式' : '开启专注模式'}</span>
            </button>
        </div>
      ) : (
        <>
          <button 
            onClick={handleFocusToggle} 
            className={`absolute top-4 right-4 z-[10000] flex items-center space-x-2 px-4 py-2 rounded-lg backdrop-blur-sm border transition-all shadow-lg ${
              isFocusMode 
                ? 'bg-green-500/80 hover:bg-green-500 border-green-400 text-white'
                : 'bg-black/70 hover:bg-black/90 border-white/20 text-white opacity-80 hover:opacity-100'
            }`}
          >
            <Lock size={16} />
            <span>{isFocusMode ? '退出专注模式' : '开启专注模式'}</span>
          </button>

          <div className="w-full h-full relative flex items-center justify-center">
              {isLocalVideo ? (
                <video 
                  ref={(el) => {
                    (nativeVideoRef as any).current = el;
                    if (el) {
                      (playerRef as any).current = {
                        getDuration: () => el.duration,
                        seekTo: (p: number) => el.currentTime = p * (el.duration || 0),
                        getInternalPlayer: () => el
                      };
                    }
                  }}
                  src={src}
                  className="w-full h-full object-contain outline-none"
                  preload="auto"
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                  onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
                  onLoadedMetadata={(e) => {
                    setDuration(e.currentTarget.duration);
                    setIsReady(true);
                  }}
                  onClick={togglePlay}
                />
              ) : (
                <div className="w-full h-full">
                  <ReactPlayer
                    {...{
                      ref: playerRef,
                      url: src,
                      playing: isPlaying,
                      volume: volume,
                      width: "100%",
                      height: "100%",
                      controls: false,
                      onProgress: handleReactPlayerProgress,
                      onReady: () => {
                        setIsReady(true);
                        if (playerRef.current) {
                          const d = playerRef.current.getDuration();
                          if (d && !isNaN(d)) setDuration(d);
                        }
                      },
                      onError: () => setIsReady(false)
                    }}
                  />
                </div>
              )}
          </div>
          
          {/* Controls Overlay */}
          <div className={`absolute bg-gradient-to-t from-black/80 to-transparent p-4 z-10 transition-opacity ${isFocusMode ? 'bottom-0 left-0 right-0 opacity-100' : 'bottom-0 left-0 right-0 opacity-0 group-hover:opacity-100'}`}>
            {/* Progress Bar */}
            <div className="mb-4 space-y-1">
              <div className="flex justify-between text-[10px] text-gray-400 mb-1">
                <span>专注时长</span>
                <span>{Math.floor((currentTime / (duration || 1)) * 100) || 0}%</span>
              </div>
              <div className="h-1.5 bg-gray-600 rounded-full overflow-hidden cursor-pointer" onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const percent = (e.clientX - rect.left) / rect.width;
                  playerRef.current?.seekTo(percent);
              }}>
                 <div 
                   className="h-full bg-success-green transition-all duration-300 ease-out" 
                   style={{ width: `${(currentTime / (duration || 1)) * 100}%` }}
                 />
              </div>
            </div>

            <div className="flex items-center justify-between text-white">
              <div className="flex items-center space-x-4">
                <button onClick={togglePlay} className="hover:text-primary transition-colors">
                  {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                </button>
                <div className="flex items-center space-x-2 group/vol">
                  <Volume2 size={20} />
                  <input 
                    type="range" 
                    min="0" 
                    max="1" 
                    step="0.1" 
                    value={volume}
                    onChange={handleVolumeChange}
                    className="w-20 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                </div>
                <span className="text-sm font-mono">{formatTime(currentTime)} / {formatTime(duration)}</span>
              </div>

              <div className="flex items-center space-x-4">
                {!isFocusMode && (
                  <button 
                    onClick={handleFocusToggle} 
                    className="flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium transition-colors border bg-white/10 hover:bg-white/20 border-white/10"
                  >
                    <Lock size={14} />
                    <span>开启专注</span>
                  </button>
                )}
                <button className="hover:text-primary transition-colors">
                  <Maximize size={20} />
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default React.memo(VideoPlayer);
