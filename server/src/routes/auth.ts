import { Router, Request, Response } from 'express';
import { readDb, writeDb } from '../db/index.js';
import jwt from 'jsonwebtoken';

const JWT_SECRET = 'smartstudy-secret-key-2024';

interface User {
  id: string;
  username: string;
  password: string;
  prepTarget?: string;
}

const router = Router();

// POST /api/auth/register
router.post('/register', (req: Request, res: Response) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: '用户名和密码不能为空' });
  }

  const users = readDb<User[]>('users');
  if (users.find(u => u.username === username)) {
    return res.status(400).json({ error: '用户名已存在' });
  }

  const newUser: User = {
    id: String(Date.now()),
    username,
    password, // plain text for simplicity
  };

  users.push(newUser);
  writeDb('users', users);

  const token = jwt.sign({ id: newUser.id, username: newUser.username }, JWT_SECRET, { expiresIn: '7d' });

  res.json({
    user: { id: newUser.id, username: newUser.username },
    token
  });
});

// POST /api/auth/login
router.post('/login', (req: Request, res: Response) => {
  const { username, password } = req.body;
  const users = readDb<User[]>('users');
  const user = users.find(u => u.username === username);

  if (!user || user.password !== password) {
    return res.status(401).json({ error: '用户名或密码错误' });
  }

  const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '7d' });

  res.json({
    user: { id: user.id, username: user.username, prepTarget: user.prepTarget },
    token
  });
});

// GET /api/auth/me
router.get('/me', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const decoded = jwt.verify(authHeader.replace('Bearer ', ''), JWT_SECRET) as any;
    const users = readDb<User[]>('users');
    const user = users.find(u => u.id === decoded.id);
    if (!user) return res.status(401).json({ error: 'User not found' });

    res.json({ id: user.id, username: user.username, prepTarget: user.prepTarget });
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }
});

// PUT /api/auth/profile
router.put('/profile', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const decoded = jwt.verify(authHeader.replace('Bearer ', ''), JWT_SECRET) as any;
    const users = readDb<User[]>('users');
    const idx = users.findIndex(u => u.id === decoded.id);
    if (idx === -1) return res.status(401).json({ error: 'User not found' });

    if (req.body.prepTarget !== undefined) {
      users[idx].prepTarget = req.body.prepTarget;
    }
    if (req.body.username !== undefined) {
      users[idx].username = req.body.username;
    }
    writeDb('users', users);

    res.json({ id: users[idx].id, username: users[idx].username, prepTarget: users[idx].prepTarget });
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }
});

export default router;
