import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { readDb, writeDb } from '../db/index.js';

const router = Router();

// In-memory sessions
const sessions: Record<string, any> = {};

// POST /api/learning/sessions
router.post('/sessions', (req: Request, res: Response) => {
  const { videoSrc, videoTitle } = req.body;
  const id = uuidv4();
  sessions[id] = { id, videoSrc, videoTitle, startTime: new Date().toISOString(), focusTime: 0, pauseTime: 0 };
  res.json(sessions[id]);
});

// POST /api/learning/sessions/:id/events
router.post('/sessions/:id/events', (req: Request, res: Response) => {
  const session = sessions[req.params.id];
  if (!session) return res.status(404).json({ error: 'Session not found' });

  const { focusDelta, pauseDelta } = req.body;
  if (focusDelta) session.focusTime += focusDelta;
  if (pauseDelta) session.pauseTime += pauseDelta;

  res.json(session);
});

// POST /api/learning/sessions/:id/end
router.post('/sessions/:id/end', (req: Request, res: Response) => {
  const session = sessions[req.params.id];
  if (!session) return res.status(404).json({ error: 'Session not found' });

  session.endTime = new Date().toISOString();

  // Log activity via the existing service
  try {
    const { logActivity } = require('../services/activity.service.js');
    if (typeof logActivity === 'function') {
      logActivity('default-user', Math.round(session.focusTime / 60));
    }
  } catch {}

  res.json(session);
  delete sessions[req.params.id];
});

// POST /api/learning/notes
router.post('/notes', (req: Request, res: Response) => {
  const { sessionId, content, title, videoSrc, videoTitle, tags } = req.body;
  const notes = readDb<any[]>('notes');
  const note = { id: uuidv4(), sessionId, content, title, videoSrc, videoTitle, tags: tags || [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
  notes.push(note);
  writeDb('notes', notes);
  res.json(note);
});

// GET /api/learning/notes?sessionId=xxx
router.get('/notes', (req: Request, res: Response) => {
  const { sessionId } = req.query;
  const notes = readDb<any[]>('notes');
  if (sessionId) {
    return res.json(notes.filter(n => n.sessionId === sessionId));
  }
  res.json(notes);
});

// GET /api/learning/notes/all
router.get('/notes/all', (req: Request, res: Response) => {
  const notes = readDb<any[]>('notes');
  res.json(notes.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
});

// GET /api/learning/notes/:id
router.get('/notes/:id', (req: Request, res: Response) => {
  const notes = readDb<any[]>('notes');
  const note = notes.find(n => n.id === req.params.id);
  if (!note) return res.status(404).json({ error: 'Note not found' });
  res.json(note);
});

// DELETE /api/learning/notes/:id
router.delete('/notes/:id', (req: Request, res: Response) => {
  let notes = readDb<any[]>('notes');
  const idx = notes.findIndex(n => n.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Note not found' });
  notes.splice(idx, 1);
  writeDb('notes', notes);
  res.json({ success: true });
});

// PATCH /api/learning/notes/:id
router.patch('/notes/:id', (req: Request, res: Response) => {
  const notes = readDb<any[]>('notes');
  const idx = notes.findIndex(n => n.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Note not found' });
  notes[idx] = { ...notes[idx], ...req.body, updatedAt: new Date().toISOString() };
  writeDb('notes', notes);
  res.json(notes[idx]);
});

// GET /api/learning/notes/search?keyword=xxx
router.get('/notes/search', (req: Request, res: Response) => {
  const { keyword } = req.query;
  const notes = readDb<any[]>('notes');
  if (!keyword) return res.json([]);
  const kw = String(keyword).toLowerCase();
  res.json(notes.filter(n => (n.title || '').toLowerCase().includes(kw) || (n.content || '').toLowerCase().includes(kw)));
});

// GET /api/learning/tags
router.get('/tags', (req: Request, res: Response) => {
  const notes = readDb<any[]>('notes');
  const tagSet = new Set<string>();
  notes.forEach(n => (n.tags || []).forEach((t: string) => tagSet.add(t)));
  res.json(Array.from(tagSet));
});

export default router;
