import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { readDb, writeDb } from '../db/index.js';

interface Task {
  id: string;
  title: string;
  description?: string;
  category: string;
  priority: string;
  status?: 'todo' | 'done';
  isAIRecommended?: boolean;
  deadline?: string;
  userId: string;
  createdAt: string;
}

const router = Router();

function getUserId(req: Request): string | null {
  // Simplified: from token stored in auth header
  const auth = req.headers.authorization;
  if (!auth) return null;
  try {
    const payload = JSON.parse(Buffer.from(auth.split('.')[1], 'base64url').toString());
    return payload.id;
  } catch {
    return null;
  }
}

// GET /api/tasks
router.get('/', (req: Request, res: Response) => {
  const userId = getUserId(req);
  const allTasks = readDb<Task[]>('tasks');
  const tasks = userId ? allTasks.filter(t => t.userId === userId) : [];
  res.json(tasks);
});

// POST /api/tasks
router.post('/', (req: Request, res: Response) => {
  const userId = getUserId(req);
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  const { title, description, category, priority, deadline } = req.body;
  const newTask: Task = {
    id: uuidv4(),
    title,
    description,
    category: category || '中考',
    priority: priority || 'medium',
    status: 'todo',
    userId,
    createdAt: new Date().toISOString(),
    deadline,
  };

  const allTasks = readDb<Task[]>('tasks');
  allTasks.push(newTask);
  writeDb('tasks', allTasks);
  res.json(newTask);
});

// PATCH /api/tasks/:id
router.patch('/:id', (req: Request, res: Response) => {
  const userId = getUserId(req);
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  const allTasks = readDb<Task[]>('tasks');
  const idx = allTasks.findIndex(t => t.id === req.params.id && t.userId === userId);
  if (idx === -1) return res.status(404).json({ error: 'Task not found' });

  allTasks[idx] = { ...allTasks[idx], ...req.body };
  writeDb('tasks', allTasks);
  res.json(allTasks[idx]);
});

// DELETE /api/tasks/:id
router.delete('/:id', (req: Request, res: Response) => {
  const userId = getUserId(req);
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  let allTasks = readDb<Task[]>('tasks');
  const idx = allTasks.findIndex(t => t.id === req.params.id && t.userId === userId);
  if (idx === -1) return res.status(404).json({ error: 'Task not found' });

  allTasks.splice(idx, 1);
  writeDb('tasks', allTasks);
  res.json({ success: true });
});

// POST /api/tasks/ai-recommendation
router.post('/ai-recommendation', (req: Request, res: Response) => {
  const { tasks } = req.body;
  // Return mock AI recommendation
  res.json({
    recommendation: '根据您的学习数据，建议优先完成数学基础复习，并安排英语单词背诵。',
    suggestedTasks: [
      { title: '数学函数专项训练', category: '中考', priority: 'high' },
      { title: '英语语法复习', category: '中考', priority: 'medium' },
    ]
  });
});

// GET /api/tasks/recommendations
router.get('/recommendations', (req: Request, res: Response) => {
  res.json([
    { id: 'rec-1', title: '数学函数专项训练', category: '中考', priority: 'high', isAIRecommended: true },
    { id: 'rec-2', title: '英语语法复习', category: '中考', priority: 'medium', isAIRecommended: true },
  ]);
});

// POST /api/tasks/:id/ai-plan-adjustment
router.post('/:id/ai-plan-adjustment', (req: Request, res: Response) => {
  res.json({
    adjustment: '建议将任务优先级调整至high，并设置截止日期为下周。',
    suggestedDeadline: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
  });
});

export default router;
