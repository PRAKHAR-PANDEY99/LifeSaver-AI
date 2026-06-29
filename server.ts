/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { db, connectDatabase } from './src/lib/db';
import { 
  analyzeDeadlineRisk, 
  breakDownTask, 
  generateDailySchedule, 
  autoReplanSchedules, 
  generateEmergencyPlan, 
  generateWeeklyReview,
  parseVoiceCommand 
} from './src/lib/gemini';

// Load environment variables with override enabled to prioritize .env file updates
dotenv.config({ override: true });

const isProduction = process.env.NODE_ENV === 'production';
const PORT = 3000;

async function startServer() {
  const app = express();
  app.use(express.json());

  // Establish database connection (MongoDB Atlas vs Local Fallback)
  try {
    await connectDatabase();
  } catch (err) {
    console.error('⚠️ MongoDB Atlas connection error on server start:', err);
    console.log('💡 Running server with database connection in offline/reconnecting state.');
  }

  // ----------------- API ROUTES -----------------

  // 0. DB Status Indicator
  app.get('/api/db-status', (req, res) => {
    res.json({
      mode: db.getMode(),
      isMongo: db.getMode() === 'MongoDB',
      hasGeminiKey: !!process.env.GEMINI_API_KEY
    });
  });

  // 1. User Authentication Routes
  // Simple Mock Secure User Auth (Storable in DB)
  app.post('/api/auth/register', async (req, res) => {
    try {
      const { email, name, password } = req.body;
      if (!email) {
        res.status(400).json({ error: 'Email is required.' });
        return;
      }
      const existing = await db.getUserByEmail(email);
      if (existing) {
        res.status(400).json({ error: 'User with this email already exists.' });
        return;
      }
      
      const user = await db.saveUser({
        email,
        name: name || email.split('@')[0]
      });
      res.status(201).json({ user });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/auth/login', async (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email) {
        res.status(400).json({ error: 'Email is required.' });
        return;
      }
      const user = await db.getUserByEmail(email);
      if (!user) {
        res.status(404).json({ error: 'No user found with this email.' });
        return;
      }
      // Since it is a developer prototype, we allow passwordless or any password
      res.json({ user });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/auth/me', async (req, res) => {
    try {
      // Return default demo profile if no email specified, or lookup
      const email = (req.query.email as string) || 'demo@lifesaver.ai';
      let user = await db.getUserByEmail(email);
      if (!user && email === 'demo@lifesaver.ai') {
        user = await db.saveUser({
          email: 'demo@lifesaver.ai',
          name: 'Alex Mercer'
        });
      }
      res.json({ user });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.put('/api/auth/preferences', async (req, res) => {
    try {
      const { email, preferences } = req.body;
      const user = await db.getUserByEmail(email || 'demo@lifesaver.ai');
      if (!user) {
        res.status(404).json({ error: 'User not found.' });
        return;
      }
      user.preferences = preferences;
      const updated = await db.saveUser(user);
      res.json({ user: updated });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // 2. Task Management Routes
  app.get('/api/tasks', async (req, res) => {
    try {
      const userId = (req.query.userId as string) || 'default_user';
      const tasks = await db.getTasks(userId);
      res.json({ tasks });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/tasks', async (req, res) => {
    try {
      const { title, description, category, deadline, priority, energyRequired, durationMinutes, subtasks, userId } = req.body;
      
      if (!title || !deadline) {
        res.status(400).json({ error: 'Title and deadline are required.' });
        return;
      }

      const newTask: Omit<any, 'id'> = {
        userId: userId || 'default_user',
        title,
        description: description || '',
        category: category || 'Personal',
        deadline,
        priority: priority || 'Medium',
        status: 'Pending',
        energyRequired: energyRequired || 'Medium',
        durationMinutes: Number(durationMinutes) || 45,
        subtasks: subtasks || [],
        overdueReplanned: false
      };

      // Auto-trigger Gemini API breakdown and risk check on save if available
      const siblingTasks = await db.getTasks(newTask.userId);
      
      // Attempt dynamic breakdown if subtasks are empty
      if (!newTask.subtasks || newTask.subtasks.length === 0) {
        try {
          const generatedSubtasks = await breakDownTask(title, description || '');
          newTask.subtasks = generatedSubtasks.map((s, idx) => ({
            id: `sub_${Date.now()}_${idx}`,
            title: s.title,
            completed: false,
            durationMinutes: s.durationMinutes
          }));
        } catch (e) {
          console.error('Auto breakdown on create failed:', e);
        }
      }

      // Run risk assessment
      try {
        const risk = await analyzeDeadlineRisk(newTask as any, siblingTasks);
        newTask.riskLevel = risk.riskLevel;
        newTask.riskReason = risk.riskReason;
        newTask.suggestedAction = risk.suggestedAction;
        newTask.energyRequired = risk.energyRequired;
      } catch (e) {
        console.error('Auto risk prediction failed:', e);
      }

      const task = await db.saveTask(newTask as any);
      res.status(201).json({ task });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.put('/api/tasks/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const currentTask = await db.getTaskById(id);
      if (!currentTask) {
        res.status(404).json({ error: 'Task not found.' });
        return;
      }

      const updates = req.body;
      const mergedTask = { ...currentTask, ...updates };

      // Log status changes (e.g. CompletedAt)
      if (updates.status === 'Completed' && currentTask.status !== 'Completed') {
        mergedTask.completedAt = new Date().toISOString();
        
        // Log in productivity history
        const todayStr = new Date().toISOString().split('T')[0];
        const allLogs = await db.getHistoryLogs(mergedTask.userId);
        const logMatch = allLogs.find(l => l.date === todayStr);
        const newLog = {
          date: todayStr,
          score: logMatch ? Math.min(100, logMatch.score + 10) : 75,
          tasksCompleted: (logMatch?.tasksCompleted || 0) + 1,
          tasksMissed: logMatch?.tasksMissed || 0,
          habitsCompleted: logMatch?.habitsCompleted || 0
        };
        await db.saveHistoryLog(newLog);
      }

      const task = await db.saveTask(mergedTask);
      res.json({ task });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.delete('/api/tasks/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const success = await db.deleteTask(id);
      res.json({ success });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/tasks/:id/breakdown', async (req, res) => {
    try {
      const { id } = req.params;
      const task = await db.getTaskById(id);
      if (!task) {
        res.status(404).json({ error: 'Task not found.' });
        return;
      }

      const generatedSubtasks = await breakDownTask(task.title, task.description);
      task.subtasks = generatedSubtasks.map((s, idx) => ({
        id: `sub_${Date.now()}_${idx}`,
        title: s.title,
        completed: false,
        durationMinutes: s.durationMinutes
      }));

      const updated = await db.saveTask(task);
      res.json({ task: updated });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/tasks/:id/risk', async (req, res) => {
    try {
      const { id } = req.params;
      const task = await db.getTaskById(id);
      if (!task) {
        res.status(404).json({ error: 'Task not found.' });
        return;
      }

      const siblingTasks = await db.getTasks(task.userId);
      const filteredSiblings = siblingTasks.filter(t => t.id !== id && t.status === 'Pending');
      const risk = await analyzeDeadlineRisk(task, filteredSiblings);
      
      task.riskLevel = risk.riskLevel;
      task.riskReason = risk.riskReason;
      task.suggestedAction = risk.suggestedAction;
      task.energyRequired = risk.energyRequired;

      const updated = await db.saveTask(task);
      res.json({ task: updated });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // 3. Goal and Habit Tracking Routes
  app.get('/api/habits', async (req, res) => {
    try {
      const userId = (req.query.userId as string) || 'default_user';
      const habits = await db.getHabits(userId);
      res.json({ habits });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/habits', async (req, res) => {
    try {
      const { title, description, frequency, userId } = req.body;
      if (!title) {
        res.status(400).json({ error: 'Habit title is required.' });
        return;
      }

      const newHabit: Omit<any, 'id'> = {
        userId: userId || 'default_user',
        title,
        description: description || '',
        frequency: frequency || 'daily',
        streak: 0,
        maxStreak: 0,
        history: [],
        createdAt: new Date().toISOString(),
        aiSuggestion: 'Track daily to build a streak and clear psychological weight.'
      };

      const habit = await db.saveHabit(newHabit as any);
      res.status(201).json({ habit });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.put('/api/habits/:id/toggle', async (req, res) => {
    try {
      const { id } = req.params;
      const { date } = req.body; // YYYY-MM-DD
      const targetDate = date || new Date().toISOString().split('T')[0];

      const habit = await db.getHabits('default_user'); // lookup
      const target = habit.find(h => h.id === id);
      if (!target) {
        res.status(404).json({ error: 'Habit not found.' });
        return;
      }

      const existingIndex = target.history.findIndex(h => h.date === targetDate);
      let isCompletedNow = true;

      if (existingIndex !== -1) {
        // Toggle off
        isCompletedNow = !target.history[existingIndex].completed;
        target.history[existingIndex].completed = isCompletedNow;
      } else {
        // Add completion
        target.history.push({ date: targetDate, completed: true });
      }

      // Re-calculate streaks
      let streak = 0;
      const sortedHistory = [...target.history].sort((a,b) => b.date.localeCompare(a.date));
      const todayStr = new Date().toISOString().split('T')[0];
      
      // Simple streak algorithm
      let checkDate = new Date(todayStr);
      let breakStreak = false;

      while (!breakStreak) {
        const checkStr = checkDate.toISOString().split('T')[0];
        const match = target.history.find(h => h.date === checkStr);
        if (match && match.completed) {
          streak++;
          checkDate.setDate(checkDate.getDate() - 1);
        } else {
          // Allow yesterday to keep streak active if checking today and today isn't completed yet
          if (checkStr === todayStr) {
            checkDate.setDate(checkDate.getDate() - 1);
            continue;
          }
          breakStreak = true;
        }
      }

      target.streak = streak;
      if (streak > target.maxStreak) {
        target.maxStreak = streak;
      }

      // Trigger AI progress feedback suggestions occasionally or on toggle
      if (isCompletedNow) {
        target.aiSuggestion = `Superb job! You've maintained a streak of ${streak} for "${target.title}". Completing this in morning focus windows stabilizes cortisol by up to 15%.`;
        
        // Log in history logs
        const todayStr = new Date().toISOString().split('T')[0];
        const allLogs = await db.getHistoryLogs(target.userId);
        const logMatch = allLogs.find(l => l.date === todayStr);
        const newLog = {
          date: todayStr,
          score: logMatch ? Math.min(100, logMatch.score + 5) : 70,
          tasksCompleted: logMatch?.tasksCompleted || 0,
          tasksMissed: logMatch?.tasksMissed || 0,
          habitsCompleted: (logMatch?.habitsCompleted || 0) + 1
        };
        await db.saveHistoryLog(newLog);
      } else {
        target.aiSuggestion = `Keep pushing! Don't let your streak slip. Reaching a 5-day streak trains your mind for habitual concentration.`;
      }

      const updated = await db.saveHabit(target);
      res.json({ habit: updated });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.delete('/api/habits/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const success = await db.deleteHabit(id);
      res.json({ success });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // 4. Energy-Based Scheduling & Replanning
  app.get('/api/schedule', async (req, res) => {
    try {
      const userId = (req.query.userId as string) || 'default_user';
      const date = (req.query.date as string) || new Date().toISOString().split('T')[0];
      const schedule = await db.getScheduleForDate(userId, date);
      res.json({ schedule });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/schedule/generate', async (req, res) => {
    try {
      const { userId, date, energyLevel } = req.body;
      const uid = userId || 'default_user';
      const d = date || new Date().toISOString().split('T')[0];
      const energy = energyLevel || 'Medium';

      const tasks = await db.getTasks(uid);
      const pendingTasks = tasks.filter(t => t.status === 'Pending');

      const result = await generateDailySchedule(pendingTasks, energy, d);
      
      const newSchedule = {
        userId: uid,
        date: d,
        energyLevel: energy,
        blocks: result.blocks.map((b, i) => ({ ...b, id: `block_${Date.now()}_${i}` })),
        aiOverview: result.aiOverview,
        isEmergencyMode: false
      };

      const schedule = await db.saveSchedule(newSchedule as any);
      res.status(201).json({ schedule });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // AI Auto-Replanning API
  app.post('/api/schedule/replan', async (req, res) => {
    try {
      const { userId, date } = req.body;
      const uid = userId || 'default_user';
      const d = date || new Date().toISOString().split('T')[0];

      const currentSchedule = await db.getScheduleForDate(uid, d);
      if (!currentSchedule) {
        res.status(404).json({ error: 'No schedule found for today. Generate one first.' });
        return;
      }

      const tasks = await db.getTasks(uid);
      
      // Auto-detect missed tasks: Pending tasks whose deadlines have elapsed, or blocks scheduled before current time which are pending
      const now = new Date();
      const missedTasks = tasks.filter(t => {
        const isPastDeadline = new Date(t.deadline).getTime() < now.getTime();
        return t.status === 'Pending' && isPastDeadline;
      });

      const remainingTasks = tasks.filter(t => t.status === 'Pending' && !missedTasks.some(m => m.id === t.id));

      // Invoke auto replanning service
      const replanned = await autoReplanSchedules(missedTasks, remainingTasks, currentSchedule);
      
      // Update missed tasks in database to show they are replanned
      for (const t of missedTasks) {
        t.overdueReplanned = true;
        await db.saveTask(t);
      }

      currentSchedule.blocks = replanned.updatedBlocks;
      currentSchedule.aiOverview = replanned.aiOverview;

      const schedule = await db.saveSchedule(currentSchedule);
      res.json({ schedule });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Emergency Mode API
  app.post('/api/schedule/emergency', async (req, res) => {
    try {
      const { userId, query, date } = req.body;
      const uid = userId || 'default_user';
      const d = date || new Date().toISOString().split('T')[0];

      if (!query) {
        res.status(400).json({ error: 'An explanation of the emergency is required.' });
        return;
      }

      const tasks = await db.getTasks(uid);
      const pendingTasks = tasks.filter(t => t.status === 'Pending');

      const result = await generateEmergencyPlan(query, pendingTasks);

      const emergencySchedule = {
        userId: uid,
        date: d,
        energyLevel: 'High' as const, // Force High for emergency adrenaline
        blocks: result.blocks.map((b, i) => ({ ...b, id: `block_em_${Date.now()}_${i}` })),
        aiOverview: result.aiOverview,
        isEmergencyMode: true
      };

      const schedule = await db.saveSchedule(emergencySchedule as any);
      res.status(201).json({ schedule });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // 5. Weekly Reviews & Analytics
  app.get('/api/weekly-reviews', async (req, res) => {
    try {
      const userId = (req.query.userId as string) || 'default_user';
      const reviews = await db.getWeeklyReviews(userId);
      res.json({ reviews });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/weekly-reviews/generate', async (req, res) => {
    try {
      const { userId, weekStartDate } = req.body;
      const uid = userId || 'default_user';
      const d = weekStartDate || new Date(Date.now() - 1000 * 60 * 60 * 168).toISOString().split('T')[0]; // last week

      const tasks = await db.getTasks(uid);
      const completedTasks = tasks.filter(t => t.status === 'Completed');
      const missedTasks = tasks.filter(t => t.status === 'Missed');
      const logs = await db.getHistoryLogs(uid);

      const reviewData = await generateWeeklyReview(completedTasks, missedTasks, logs, d);
      const review = await db.saveWeeklyReview(reviewData as any);
      res.status(201).json({ review });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Productivity history analytics
  app.get('/api/productivity-history', async (req, res) => {
    try {
      const userId = (req.query.userId as string) || 'default_user';
      const logs = await db.getHistoryLogs(userId);
      res.json({ logs });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // 6. Voice Assistant Route
  app.post('/api/voice-command', async (req, res) => {
    try {
      const { text, userId } = req.body;
      if (!text) {
        res.status(400).json({ error: 'Text command is required.' });
        return;
      }

      // Parse text utilizing Gemini
      const parsedTask = await parseVoiceCommand(text);
      res.json({ parsedTask });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });


  // ----------------- CLIENT SERVING & DEVELOPMENT SETUP -----------------

  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 LifeSaver AI full-stack server running on http://localhost:${PORT}`);
  });
}

startServer();
