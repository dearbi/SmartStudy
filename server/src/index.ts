import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.js';
import taskRoutes from './routes/tasks.js';
import dashboardRoutes from './routes/dashboard.js';
import learningRoutes from './routes/learning.js';
import aiRoutes from './routes/ai.js';
import feedRoutes from './routes/feeds.js';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/learning', learningRoutes);
app.use('/api/learning/ai', aiRoutes);
app.use('/api/feeds', feedRoutes);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`[Server] SmartStudy backend running at http://localhost:${PORT}`);
  console.log(`[Server] API endpoints available at http://localhost:${PORT}/api`);
});
