/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import mongoose from 'mongoose';
import { Task, Habit, DailySchedule, WeeklyReview, ProductivityHistoryLog, User } from '../types';

// MongoDB Schemas using String _id for direct compatibility with existing frontend string IDs
const UserMongoSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  name: String,
  avatarUrl: String,
  joinedAt: String,
  preferences: {
    dailyGoalCount: Number,
    peakEnergyTime: String
  }
});

const TaskMongoSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  userId: String,
  title: String,
  description: String,
  category: String,
  deadline: String,
  priority: String,
  status: String,
  riskLevel: String,
  riskReason: String,
  suggestedAction: String,
  energyRequired: String,
  scheduledTime: String,
  durationMinutes: Number,
  whySuggested: String,
  subtasks: [{ id: String, title: String, completed: Boolean, durationMinutes: Number }],
  completedAt: String,
  overdueReplanned: Boolean
});

const HabitMongoSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  userId: String,
  title: String,
  description: String,
  frequency: String,
  streak: Number,
  maxStreak: Number,
  history: [{ date: String, completed: Boolean }],
  createdAt: String,
  aiSuggestion: String
});

const ScheduleMongoSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  userId: String,
  date: String,
  energyLevel: String,
  blocks: [{
    time: String,
    durationMinutes: Number,
    taskTitle: String,
    taskId: String,
    category: String,
    energyLevelRequired: String,
    status: String
  }],
  aiOverview: String,
  isEmergencyMode: Boolean
});

const WeeklyReviewMongoSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  userId: String,
  weekStartDate: String,
  completedCount: Number,
  missedCount: Number,
  completionRate: Number,
  topCategory: String,
  productivityScore: Number,
  procrastinationTriggers: [String],
  peakProductiveHours: String,
  recommendations: [String],
  detailedAnalysis: String
});

const HistoryLogMongoSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  date: String,
  score: Number,
  tasksCompleted: Number,
  tasksMissed: Number,
  habitsCompleted: Number
});

// Compile models safely and cast to any to bypass Mongoose version TypeScript conflicts
const UserModel = (mongoose.models.User || mongoose.model('User', UserMongoSchema)) as any;
const TaskModel = (mongoose.models.Task || mongoose.model('Task', TaskMongoSchema)) as any;
const HabitModel = (mongoose.models.Habit || mongoose.model('Habit', HabitMongoSchema)) as any;
const ScheduleModel = (mongoose.models.Schedule || mongoose.model('Schedule', ScheduleMongoSchema)) as any;
const WeeklyReviewModel = (mongoose.models.WeeklyReview || mongoose.model('WeeklyReview', WeeklyReviewMongoSchema)) as any;
const HistoryLogModel = (mongoose.models.HistoryLog || mongoose.model('HistoryLog', HistoryLogMongoSchema)) as any;

// Mappers to ensure exact types
const mapUser = (u: any): User => ({
  id: u._id,
  email: u.email,
  name: u.name,
  avatarUrl: u.avatarUrl,
  joinedAt: u.joinedAt,
  preferences: u.preferences
});

const mapTask = (t: any): Task => ({
  id: t._id,
  userId: t.userId,
  title: t.title,
  description: t.description || '',
  category: t.category,
  deadline: t.deadline,
  priority: t.priority,
  status: t.status,
  riskLevel: t.riskLevel,
  riskReason: t.riskReason,
  suggestedAction: t.suggestedAction,
  energyRequired: t.energyRequired,
  scheduledTime: t.scheduledTime,
  durationMinutes: t.durationMinutes,
  whySuggested: t.whySuggested,
  subtasks: t.subtasks || [],
  completedAt: t.completedAt,
  overdueReplanned: t.overdueReplanned
});

const mapHabit = (h: any): Habit => ({
  id: h._id,
  userId: h.userId,
  title: h.title,
  description: h.description || '',
  frequency: h.frequency,
  streak: h.streak || 0,
  maxStreak: h.maxStreak || 0,
  history: h.history || [],
  createdAt: h.createdAt,
  aiSuggestion: h.aiSuggestion
});

const mapSchedule = (s: any): DailySchedule => ({
  id: s._id,
  userId: s.userId,
  date: s.date,
  energyLevel: s.energyLevel,
  blocks: s.blocks || [],
  aiOverview: s.aiOverview,
  isEmergencyMode: s.isEmergencyMode
});

const mapWeeklyReview = (r: any): WeeklyReview => ({
  id: r._id,
  userId: r.userId,
  weekStartDate: r.weekStartDate,
  completedCount: r.completedCount || 0,
  missedCount: r.missedCount || 0,
  completionRate: r.completionRate || 0,
  topCategory: r.topCategory,
  productivityScore: r.productivityScore || 0,
  procrastinationTriggers: r.procrastinationTriggers || [],
  peakProductiveHours: r.peakProductiveHours || '',
  recommendations: r.recommendations || [],
  detailedAnalysis: r.detailedAnalysis || ''
});

let isConnected = false;

export async function connectDatabase() {
  const fallbackUri = 'mongodb://PrakharPandey:PakharPandey31@ac-w8e6jsd-shard-00-00.qjcbvbz.mongodb.net:27017,ac-w8e6jsd-shard-00-01.qjcbvbz.mongodb.net:27017,ac-w8e6jsd-shard-00-02.qjcbvbz.mongodb.net:27017/devTinder?ssl=true&replicaSet=atlas-kmdxnh-shard-0&authSource=admin&appName=SmartLifeManager/';
  let uri = process.env.MONGODB_URI || fallbackUri;
  
  if (uri) {
    // Trim and strip literal surrounding single/double quotes
    uri = uri.trim().replace(/^["']|["']$/g, '');
  }

  if (!uri) {
    console.error('❌ MONGODB_URI environment variable is missing.');
    isConnected = false;
    throw new Error('MONGODB_URI is required to connect to MongoDB Atlas');
  }

  // Generate a safe, password-redacted string for logging
  const safeLogUri = uri.replace(/mongodb:\/\/[^@]+@/, 'mongodb://***:***@');

  try {
    console.log(`🔄 Attempting to connect to MongoDB Atlas at: ${safeLogUri}`);
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });
    isConnected = true;
    console.log('✅ Successfully connected to MongoDB Atlas!');
    
    // Seed initial database demo data if the DB is completely empty
    await seedDatabase();
    
    return true;
  } catch (err) {
    console.error('❌ Failed to connect to MongoDB Atlas:', err);
    isConnected = false;
    throw err;
  }
}

// Automatic database seeder for a populated onboarding experience
async function seedDatabase() {
  try {
    const userCount = await UserModel.countDocuments();
    if (userCount === 0) {
      console.log('🌱 MongoDB is empty. Seeding initial default user and metrics...');

      // 1. Seed user
      await UserModel.create({
        _id: 'default_user',
        email: 'demo@lifesaver.ai',
        name: 'Alex Mercer',
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80',
        joinedAt: new Date().toISOString(),
        preferences: {
          dailyGoalCount: 4,
          peakEnergyTime: 'morning'
        }
      });

      // 2. Seed default tasks
      await TaskModel.create([
        {
          _id: 'task_1',
          userId: 'default_user',
          title: 'Analyze Algorithms Assignments',
          description: 'Review chapters 3 & 4. Complete exercises on dynamic programming and graph structures.',
          category: 'Study',
          deadline: new Date(Date.now() + 1000 * 60 * 60 * 36).toISOString(),
          priority: 'High',
          status: 'Pending',
          energyRequired: 'High',
          scheduledTime: new Date(Date.now() + 1000 * 60 * 60 * 20).toISOString(),
          durationMinutes: 90,
          subtasks: [
            { id: 'sub_1_1', title: 'Read Chapter 3 on Dynamic Programming', completed: false, durationMinutes: 30 },
            { id: 'sub_1_2', title: 'Solve Exercises 1 to 5', completed: false, durationMinutes: 40 },
            { id: 'sub_1_3', title: 'Upload solutions to LMS portal', completed: false, durationMinutes: 20 }
          ],
          riskLevel: 'High',
          riskReason: 'Dynamic programming topics traditionally take 40% longer for your profile, and you have two back-to-back meetings tomorrow morning.',
          suggestedAction: 'Break down the exercises and tackle the first sub-task tonight at 8:00 PM when your energy focus score is high.',
          whySuggested: 'Based on your energy-focus profile.'
        },
        {
          _id: 'task_2',
          userId: 'default_user',
          title: 'Submit Electric Utility Bill',
          description: 'Pay monthly electricity invoice to prevent late fees.',
          category: 'Bills',
          deadline: new Date(Date.now() + 1000 * 60 * 60 * 12).toISOString(),
          priority: 'High',
          status: 'Pending',
          energyRequired: 'Low',
          scheduledTime: new Date(Date.now() + 1000 * 60 * 60 * 2).toISOString(),
          durationMinutes: 15,
          subtasks: [],
          riskLevel: 'Medium',
          riskReason: 'Due in 12 hours. High danger of late-night procrastination.',
          suggestedAction: 'Pay immediately via mobile portal. Takes under 5 minutes.',
          whySuggested: 'Deadline is critical (today).'
        },
        {
          _id: 'task_3',
          userId: 'default_user',
          title: 'Prepare Slide Deck for Project Showcase',
          description: 'Draft 5 slides summarizing the architecture and value proposition.',
          category: 'Work',
          deadline: new Date(Date.now() + 1000 * 60 * 60 * 72).toISOString(),
          priority: 'Medium',
          status: 'Pending',
          energyRequired: 'Medium',
          scheduledTime: new Date(Date.now() + 1000 * 60 * 60 * 48).toISOString(),
          durationMinutes: 120,
          subtasks: [
            { id: 'sub_3_1', title: 'Outline slide structure', completed: true, durationMinutes: 30 },
            { id: 'sub_3_2', title: 'Write architecture breakdown section', completed: false, durationMinutes: 45 },
            { id: 'sub_3_3', title: 'Add high-quality mockup images', completed: false, durationMinutes: 45 }
          ],
          riskLevel: 'Low',
          riskReason: 'Comfortable buffer period remains. Pre-requisite task outline already complete.',
          suggestedAction: 'Schedule for a dedicated slot on Sunday afternoon.',
          whySuggested: 'Optimized for normal working pace.'
        }
      ]);

      // 3. Seed default habits
      await HabitModel.create([
        {
          _id: 'habit_1',
          userId: 'default_user',
          title: 'Diaphragmatic Deep Breathing',
          description: '5 minutes of slow breathing exercises to reset cortisol levels and clear cognitive load.',
          frequency: 'daily',
          streak: 5,
          maxStreak: 12,
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 240).toISOString(),
          history: [
            { date: new Date(Date.now() - 1000 * 60 * 60 * 96).toISOString().split('T')[0], completed: true },
            { date: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString().split('T')[0], completed: true },
            { date: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString().split('T')[0], completed: true },
            { date: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString().split('T')[0], completed: true },
            { date: new Date().toISOString().split('T')[0], completed: true }
          ],
          aiSuggestion: 'You have a 100% completion rate for breathing exercises on high-stress days. Keep doing it at 3:00 PM to combat afternoon fatigue.'
        },
        {
          _id: 'habit_2',
          userId: 'default_user',
          title: 'Algorithms Revision',
          description: 'Spend 20 minutes reviewing code structures or algorithms flashcards.',
          frequency: 'daily',
          streak: 0,
          maxStreak: 4,
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 240).toISOString(),
          history: [
            { date: new Date(Date.now() - 1000 * 60 * 60 * 96).toISOString().split('T')[0], completed: true },
            { date: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString().split('T')[0], completed: false },
            { date: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString().split('T')[0], completed: false },
            { date: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString().split('T')[0], completed: false },
            { date: new Date().toISOString().split('T')[0], completed: false }
          ],
          aiSuggestion: 'Often missed during low-energy evenings. Try moving algorithms review to your peak morning hour (9:00 AM) right after coffee.'
        }
      ]);

      // 4. Seed default weekly reviews
      await WeeklyReviewModel.create([
        {
          _id: 'review_1',
          userId: 'default_user',
          weekStartDate: new Date(Date.now() - 1000 * 60 * 60 * 168).toISOString().split('T')[0],
          completedCount: 14,
          missedCount: 3,
          completionRate: 82,
          topCategory: 'Study',
          productivityScore: 85,
          procrastinationTriggers: [
            'Late evening complex assignments (delayed by average of 4.2 hours)',
            'Low-priority administrative work on Friday afternoons'
          ],
          peakProductiveHours: '08:30 AM - 11:30 AM',
          recommendations: [
            'Shift high-energy study blocks to mornings, reserving evenings purely for admin tasks or relaxation.',
            'Apply the 5-Minute Rule to bills and simple responses—do them immediately instead of scheduling them.',
            'Use LifeSaver Emergency Mode only when exam schedules overlap by more than 2 critical blocks.'
          ],
          detailedAnalysis: 'Your productivity was excellent this week, peaking at 85/100. However, the data indicates a classic procrastination dip between 4 PM and 7 PM. Tasks scheduled during this time have a 45% risk of being pushed to the next day. By proactively scheduling demanding workloads in your high-energy morning slots, you can easily reach a 95% completion rate.'
        }
      ]);

      // 5. Seed default history logs
      await HistoryLogModel.create([
        { _id: 'log_1', date: new Date(Date.now() - 1000 * 60 * 60 * 96).toISOString().split('T')[0], score: 82, tasksCompleted: 3, tasksMissed: 0, habitsCompleted: 1 },
        { _id: 'log_2', date: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString().split('T')[0], score: 70, tasksCompleted: 2, tasksMissed: 1, habitsCompleted: 2 },
        { _id: 'log_3', date: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString().split('T')[0], score: 88, tasksCompleted: 4, tasksMissed: 0, habitsCompleted: 1 },
        { _id: 'log_4', date: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString().split('T')[0], score: 90, tasksCompleted: 4, tasksMissed: 0, habitsCompleted: 2 },
        { _id: 'log_5', date: new Date().toISOString().split('T')[0], score: 65, tasksCompleted: 1, tasksMissed: 1, habitsCompleted: 1 }
      ]);

      console.log('✅ Demo database seeded successfully into MongoDB Atlas!');
    }
  } catch (err) {
    console.error('⚠️ Seeding database failed:', err);
  }
}

export const db = {
  getMode(): 'MongoDB' | 'LocalDB' {
    return isConnected ? 'MongoDB' : 'LocalDB';
  },

  // USERS
  async getUsers(): Promise<User[]> {
    const users = await UserModel.find({});
    return users.map(mapUser);
  },

  async getUserByEmail(email: string): Promise<User | null> {
    const u = await UserModel.findOne({ email });
    return u ? mapUser(u) : null;
  },

  async saveUser(user: Partial<User> & { email: string }): Promise<User> {
    const id = user.id || 'default_user';
    
    // Find by ID first, then by email
    let u = await UserModel.findOne({ $or: [{ _id: id }, { email: user.email }] });
    if (u) {
      if (user.name) u.name = user.name;
      if (user.avatarUrl) u.avatarUrl = user.avatarUrl;
      if (user.preferences) u.preferences = user.preferences;
      await u.save();
    } else {
      u = new UserModel({
        _id: id,
        email: user.email,
        name: user.name || user.email.split('@')[0],
        avatarUrl: user.avatarUrl || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(user.email)}`,
        joinedAt: user.joinedAt || new Date().toISOString(),
        preferences: user.preferences || { dailyGoalCount: 4, peakEnergyTime: 'morning' }
      });
      await u.save();
    }
    return mapUser(u);
  },

  // TASKS
  async getTasks(userId: string): Promise<Task[]> {
    const tasks = await TaskModel.find({ userId });
    return tasks.map(mapTask);
  },

  async getTaskById(id: string): Promise<Task | null> {
    const t = await TaskModel.findById(id);
    return t ? mapTask(t) : null;
  },

  async saveTask(task: Omit<Task, 'id'> & { id?: string }): Promise<Task> {
    const id = task.id || new mongoose.Types.ObjectId().toString();
    const cleanTask = { ...task };
    delete cleanTask.id;

    const saved = await TaskModel.findByIdAndUpdate(
      id,
      { ...cleanTask, _id: id },
      { new: true, upsert: true }
    );
    return mapTask(saved);
  },

  async deleteTask(id: string): Promise<boolean> {
    const res = await TaskModel.findByIdAndDelete(id);
    return !!res;
  },

  // HABITS
  async getHabits(userId: string): Promise<Habit[]> {
    const habits = await HabitModel.find({ userId });
    return habits.map(mapHabit);
  },

  async saveHabit(habit: Omit<Habit, 'id'> & { id?: string }): Promise<Habit> {
    const id = habit.id || new mongoose.Types.ObjectId().toString();
    const cleanHabit = { ...habit };
    delete cleanHabit.id;

    const saved = await HabitModel.findByIdAndUpdate(
      id,
      { ...cleanHabit, _id: id },
      { new: true, upsert: true }
    );
    return mapHabit(saved);
  },

  async deleteHabit(id: string): Promise<boolean> {
    const res = await HabitModel.findByIdAndDelete(id);
    return !!res;
  },

  // SCHEDULES
  async getScheduleForDate(userId: string, date: string): Promise<DailySchedule | null> {
    const sched = await ScheduleModel.findOne({ userId, date });
    return sched ? mapSchedule(sched) : null;
  },

  async saveSchedule(schedule: Omit<DailySchedule, 'id'> & { id?: string }): Promise<DailySchedule> {
    const id = schedule.id || new mongoose.Types.ObjectId().toString();
    const cleanSched = { ...schedule };
    delete cleanSched.id;

    const saved = await ScheduleModel.findOneAndUpdate(
      { userId: schedule.userId, date: schedule.date },
      { ...cleanSched, _id: id },
      { new: true, upsert: true }
    );
    return mapSchedule(saved);
  },

  // WEEKLY REVIEWS
  async getWeeklyReviews(userId: string): Promise<WeeklyReview[]> {
    const reviews = await WeeklyReviewModel.find({ userId }).sort({ weekStartDate: -1 });
    return reviews.map(mapWeeklyReview);
  },

  async saveWeeklyReview(review: Omit<WeeklyReview, 'id'> & { id?: string }): Promise<WeeklyReview> {
    const id = review.id || new mongoose.Types.ObjectId().toString();
    const cleanReview = { ...review };
    delete cleanReview.id;

    const saved = await WeeklyReviewModel.findOneAndUpdate(
      { userId: review.userId, weekStartDate: review.weekStartDate },
      { ...cleanReview, _id: id },
      { new: true, upsert: true }
    );
    return mapWeeklyReview(saved);
  },

  // HISTORY LOGS
  async getHistoryLogs(userId: string): Promise<ProductivityHistoryLog[]> {
    const logs = await HistoryLogModel.find({}).sort({ date: 1 });
    return logs.map((l: any) => ({
      date: l.date,
      score: l.score,
      tasksCompleted: l.tasksCompleted,
      tasksMissed: l.tasksMissed,
      habitsCompleted: l.habitsCompleted
    }));
  },

  async saveHistoryLog(log: ProductivityHistoryLog): Promise<ProductivityHistoryLog> {
    const dateId = `log_${log.date}`;
    const saved = await HistoryLogModel.findOneAndUpdate(
      { date: log.date },
      { ...log, _id: dateId },
      { new: true, upsert: true }
    ) as any;
    return {
      date: saved.date,
      score: saved.score,
      tasksCompleted: saved.tasksCompleted,
      tasksMissed: saved.tasksMissed,
      habitsCompleted: saved.habitsCompleted
    };
  }
};
