import { Router, Request, Response } from 'express';

const router = Router();

// POST /api/learning/ai/summary
router.post('/summary', (req: Request, res: Response) => {
  const { frames } = req.body;
  res.json({
    title: '视频内容摘要',
    points: ['核心概念理解', '实践应用技巧', '常见误区规避'],
    summary: '根据视频内容分析，本课程主要介绍了核心概念和关键知识点。建议重点关注以下几个方面：1. 理论基础 2. 实践应用 3. 常见误区。',
  });
});

// POST /api/learning/ai/markdown/transform
router.post('/markdown/transform', (req: Request, res: Response) => {
  const { content } = req.body;
  const transformed = `# AI 优化笔记\n\n${content}\n\n---\n\n> 📝 由 AI 自动整理\n`;
  res.json({ content: transformed });
});

// POST /api/learning/ai/analyze-screenshot
router.post('/analyze-screenshot', (req: Request, res: Response) => {
  const { imageData, context } = req.body;
  res.json({
    analysis: '截图内容分析结果：检测到文本信息和图表数据。',
    extractedText: '示例提取的文本内容...',
    suggestions: ['建议记录关键数据', '可以创建相关笔记'],
  });
});

export default router;
