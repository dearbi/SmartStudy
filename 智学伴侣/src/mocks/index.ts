import { RadarData, HeatmapData, Task, FeedItem } from '../types';

// Radar Chart Data
export const radarMockData: RadarData[] = [
  { dimension: '知识点覆盖度', value: 85, fullMark: 100 },
  { dimension: '专注稳定性', value: 78, fullMark: 100 },
  { dimension: '测验准确率', value: 92, fullMark: 100 },
  { dimension: '复习频率', value: 68, fullMark: 100 }
];

// Heatmap Data (Last 365 days)
export const heatmapMockData: HeatmapData[] = Array.from({ length: 365 }, (_, i) => ({
  date: new Date(Date.now() - (364 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  count: Math.floor(Math.random() * 10) // 0-9 activity level
}));

// Task Data
export const taskMockData: Record<string, Task[]> = {
  '中考': [
    { id: '1', title: '数学基础复习', category: '中考', priority: 'high', isAIRecommended: true, deadline: '2024-06-15' },
    { id: '2', title: '英语单词背诵', category: '中考', priority: 'medium', deadline: '2024-06-20' }
  ],
  '高考': [
    { id: '3', title: '物理实验题训练', category: '高考', priority: 'high', isAIRecommended: true, deadline: '2024-06-10' },
    { id: '4', title: '化学方程式记忆', category: '高考', priority: 'low' }
  ],
  '考研': [
    { id: '5', title: '政治理论复习', category: '考研', priority: 'high', deadline: '2024-12-25' },
    { id: '6', title: '英语阅读理解', category: '考研', priority: 'medium', isAIRecommended: true }
  ],
  '考公': [
    { id: '7', title: '行测数量关系', category: '考公', priority: 'high', deadline: '2024-11-30' },
    { id: '8', title: '申论写作训练', category: '考公', priority: 'medium' }
  ]
};

// Feed Data
export const feedMockData: FeedItem[] = [
  {
    id: '1',
    title: '2024年高考数学命题趋势分析',
    summary: '专家解读最新高考数学命题方向，重点关注函数与导数综合应用...',
    category: '高考',
    publishTime: '2024-01-20T10:30:00Z',
    source: '教育部考试中心'
  },
  {
    id: '2', 
    title: '考研英语阅读理解技巧分享',
    summary: '提高阅读速度和准确率的方法，包含真题解析和答题技巧...',
    category: '考研',
    publishTime: '2024-01-19T14:20:00Z',
    source: '考研辅导专家'
  }
];
