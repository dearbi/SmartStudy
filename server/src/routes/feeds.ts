import { Router, Request, Response } from 'express';

const router = Router();

const feedData = [
  {
    id: '1',
    title: '2024年高考数学命题趋势分析',
    summary: '专家解读最新高考数学命题方向，重点关注函数与导数综合应用...',
    category: '高考',
    publishTime: '2024-01-20T10:30:00Z',
    source: '教育部考试中心',
  },
  {
    id: '2',
    title: '考研英语阅读理解技巧分享',
    summary: '提高阅读速度和准确率的方法，包含真题解析和答题技巧...',
    category: '考研',
    publishTime: '2024-01-19T14:20:00Z',
    source: '考研辅导专家',
  },
  {
    id: '3',
    title: '中考数学压轴题精讲',
    summary: '典型压轴题解题思路分析，帮助考生突破高分瓶颈...',
    category: '中考',
    publishTime: '2024-01-18T09:00:00Z',
    source: '中考教研组',
  },
  {
    id: '4',
    title: '行测数量关系速解技巧',
    summary: '掌握快速解题技巧，提高行测做题效率...',
    category: '考公',
    publishTime: '2024-01-17T16:00:00Z',
    source: '公务员考试网',
  },
];

// GET /api/feeds?category=xxx
router.get('/', (req: Request, res: Response) => {
  const { category } = req.query;
  if (category && category !== '全部') {
    return res.json(feedData.filter(f => f.category === category));
  }
  res.json(feedData);
});

export default router;
