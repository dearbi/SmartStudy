// Common Interfaces

export interface VideoPlayerProps {
  src: string;
  isFocusMode?: boolean;
  onFocusChange?: (focus: boolean) => void;
  onProgress?: (progress: number) => void;
}

export interface MarkdownEditorProps {
  value: string;
  onChange?: (value: string) => void;
  onInsertScreenshot?: () => void;
  onAITransform?: () => void;
}

export interface RadarData {
  dimension: string;
  value: number;
  fullMark: number;
}

export interface RadarChartProps {
  data: RadarData[];
  width?: number;
  height?: number;
}

export interface HeatmapData {
  date: string;
  count: number;
}

export interface HeatmapChartProps {
  data: HeatmapData[];
}

export type TaskCategory = '中考' | '高考' | '考研' | '考公';
export type TaskPriority = 'high' | 'medium' | 'low';

export interface Task {
  id: string;
  title: string;
  description?: string;
  category: TaskCategory;
  priority: TaskPriority;
  status?: 'todo' | 'done';
  isAIRecommended?: boolean;
  deadline?: string;
}

export interface TaskCardProps {
  task: any;
  onComplete?: (id: string) => void;
  onUncomplete?: (id: string) => void;
  onDelete?: (id: string) => void;
  onPriorityChange?: (id: string, priority: TaskPriority) => void;
  onDeadlineChange?: (id: string, deadline: string) => void;
}

export interface FeedItem {
  id: string;
  title: string;
  summary: string;
  category: TaskCategory;
  publishTime: string;
  source: string;
  link?: string;
}

export interface FeedListProps {
  items: FeedItem[];
}

export interface User {
  id: string;
  username: string;
  prepTarget?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

