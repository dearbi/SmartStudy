import { Router, Request, Response } from 'express';
import { readDb } from '../db/index.js';

const router = Router();

// GET /api/dashboard/mastery
router.get('/mastery', (req: Request, res: Response) => {
  res.json({
    overallScore: 78,
    dimensions: [
      { dimension: '知识点覆盖度', value: 85, fullMark: 100 },
      { dimension: '专注稳定性', value: 78, fullMark: 100 },
      { dimension: '测验准确率', value: 92, fullMark: 100 },
      { dimension: '复习频率', value: 68, fullMark: 100 },
    ]
  });
});

// GET /api/dashboard/activity
router.get('/activity', (req: Request, res: Response) => {
  const heatmapData = Array.from({ length: 365 }, (_, i) => ({
    date: new Date(Date.now() - (364 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    count: Math.floor(Math.random() * 10),
  }));
  res.json(heatmapData);
});

export default router;
