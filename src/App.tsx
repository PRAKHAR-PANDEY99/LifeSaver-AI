/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Task, Habit, DailySchedule, WeeklyReview, ProductivityHistoryLog, User } from './types';

// Tab Components
import DBStatus from './components/DBStatus';
import VoiceInput from './components/VoiceInput';
import DashboardTab from './components/DashboardTab';
import TasksTab from './components/TasksTab';
import ScheduleTab from './components/ScheduleTab';
import HabitsTab from './components/HabitsTab';
import ReviewsTab from './components/ReviewsTab';

// Icons
import { 
  Zap, 
  Layers, 
  Clock, 
  Flame, 
  Award, 
  Sparkles, 
  LogOut, 
  UserPlus, 
  LogIn, 
  Bell,
  Cpu,
  HelpCircle,
  Database
} from 'lucide-react';

export default function App() {
  // Navigation & Auth State
  const [activeTab, setActiveTab] = useState('dashboard');
  const [user, setUser] = useState<User | null>(null);
  const [authMode, setAuthMode] = useState<'authenticated' | 'login' | 'register'>('authenticated');
  const [authEmail, setAuthEmail] = useState('');
  const [authName, setAuthName] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);

  // Business Data States
  const [tasks, setTasks] = useState<Task[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [schedule, setSchedule] = useState<DailySchedule | null>(null);
  const [weeklyReviews, setWeeklyReviews] = useState<WeeklyReview[]>([]);
  const [historyLogs, setHistoryLogs] = useState<ProductivityHistoryLog[]>([]);

  // System Loading Indicators
  const [isLoading, setIsLoading] = useState(true);
  const [notification, setNotification] = useState<string | null>(null);

  // 1. Load User & Workspace Session on Mount
  useEffect(() => {
    async function loadWorkspace() {
      setIsLoading(true);
      try {
        // Fetch User profile (default demo profile or logged-in)
        const userEmail = localStorage.getItem('lifesaver_auth_email') || 'demo@lifesaver.ai';
        const userRes = await fetch(`/api/auth/me?email=${encodeURIComponent(userEmail)}`);
        
        if (userRes.ok) {
          const { user: userData } = await userRes.json();
          setUser(userData);
          
          // Load User Workspace assets
          await fetchWorkspaceData(userData.id);
        } else {
          // Force login view
          setAuthMode('login');
        }
      } catch (err) {
        console.error('Failed to boot LifeSaver AI session', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadWorkspace();
  }, []);

  const fetchWorkspaceData = async (userId: string) => {
    try {
      // 1. Tasks
      const tasksRes = await fetch(`/api/tasks?userId=${userId}`);
      if (tasksRes.ok) {
        const { tasks: tasksData } = await tasksRes.json();
        setTasks(tasksData);
      }

      // 2. Habits
      const habitsRes = await fetch(`/api/habits?userId=${userId}`);
      if (habitsRes.ok) {
        const { habits: habitsData } = await habitsRes.json();
        setHabits(habitsData);
      }

      // 3. Today's Schedule
      const todayStr = new Date().toISOString().split('T')[0];
      const schedRes = await fetch(`/api/schedule?userId=${userId}&date=${todayStr}`);
      if (schedRes.ok) {
        const { schedule: schedData } = await schedRes.json();
        setSchedule(schedData);
      }

      // 4. Weekly Reviews
      const reviewsRes = await fetch(`/api/weekly-reviews?userId=${userId}`);
      if (reviewsRes.ok) {
        const { reviews: reviewsData } = await reviewsRes.json();
        setWeeklyReviews(reviewsData);
      }

      // 5. Productivity History Logs
      const historyRes = await fetch(`/api/productivity-history?userId=${userId}`);
      if (historyRes.ok) {
        const { logs } = await historyRes.json();
        setHistoryLogs(logs);
      }

    } catch (err) {
      console.error('Failed syncing workspace data layers', err);
    }
  };

  // Helper trigger for notifications
  const triggerNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 5000);
  };

  // 2. Auth Actions
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authEmail) return;
    setAuthError(null);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: authEmail, name: authName })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed registration.');
      }

      const { user: newUser } = await res.json();
      localStorage.setItem('lifesaver_auth_email', newUser.email);
      setUser(newUser);
      setAuthMode('authenticated');
      await fetchWorkspaceData(newUser.id);
      triggerNotification('Welcome to LifeSaver AI! Onboarding profile activated.');
    } catch (err: any) {
      setAuthError(err.message);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authEmail) return;
    setAuthError(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: authEmail })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'No profile matched.');
      }

      const { user: matchedUser } = await res.json();
      localStorage.setItem('lifesaver_auth_email', matchedUser.email);
      setUser(matchedUser);
      setAuthMode('authenticated');
      await fetchWorkspaceData(matchedUser.id);
      triggerNotification(`Welcome back, ${matchedUser.name || matchedUser.email}!`);
    } catch (err: any) {
      setAuthError(err.message);
    }
  };

  const handleSignOut = () => {
    localStorage.removeItem('lifesaver_auth_email');
    setUser(null);
    setAuthMode('login');
    setAuthEmail('');
    setAuthName('');
    setTasks([]);
    setHabits([]);
    setSchedule(null);
    setWeeklyReviews([]);
  };

  // 3. Task Management Operations
  const handleAddTask = async (taskData: any) => {
    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...taskData, userId: user?.id })
      });

      if (res.ok) {
        const { task } = await res.json();
        setTasks(prev => [task, ...prev]);
        triggerNotification('New Commitment saved! AI deconstructed sub-tasks and calculated risk.');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdateTask = async (id: string, updates: any) => {
    try {
      const res = await fetch(`/api/tasks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });

      if (res.ok) {
        const { task } = await res.json();
        setTasks(prev => prev.map(t => t.id === id ? task : t));
        
        // Re-fetch today's schedule and metrics if status changed to completed
        if (updates.status && user) {
          await fetchWorkspaceData(user.id);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteTask = async (id: string) => {
    try {
      const res = await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setTasks(prev => prev.filter(t => t.id !== id));
        triggerNotification('Commitment removed from dossier.');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleTriggerBreakdown = async (id: string) => {
    try {
      const res = await fetch(`/api/tasks/${id}/breakdown`, { method: 'POST' });
      if (res.ok) {
        const { task } = await res.json();
        setTasks(prev => prev.map(t => t.id === id ? task : t));
        triggerNotification('Task deconstructed sequentially using AI.');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleTriggerRiskCheck = async (id: string) => {
    try {
      const res = await fetch(`/api/tasks/${id}/risk`, { method: 'POST' });
      if (res.ok) {
        const { task } = await res.json();
        setTasks(prev => prev.map(t => t.id === id ? task : t));
        triggerNotification('AI calculated deadline collision metrics.');
      }
    } catch (e) {
      console.error(e);
    }
  };

  // 4. Energy scheduling operations
  const handleGenerateSchedule = async (energyLevel: 'Low' | 'Medium' | 'High') => {
    try {
      const res = await fetch('/api/schedule/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id,
          date: new Date().toISOString().split('T')[0],
          energyLevel
        })
      });

      if (res.ok) {
        const { schedule: newSched } = await res.json();
        setSchedule(newSched);
        triggerNotification('Focus timeline generated! Tasks mapped based on energy peaks.');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleReplanSchedule = async () => {
    try {
      const res = await fetch('/api/schedule/replan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id,
          date: new Date().toISOString().split('T')[0]
        })
      });

      if (res.ok) {
        const { schedule: updatedSched } = await res.json();
        setSchedule(updatedSched);
        
        // Sync tasks too since statuses might have updated
        if (user) await fetchWorkspaceData(user.id);
        
        triggerNotification('AI Auto-Replanning completed! Timeline adapted to save slipped tasks.');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleTriggerEmergencyMode = async (query: string) => {
    try {
      const res = await fetch('/api/schedule/emergency', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id,
          date: new Date().toISOString().split('T')[0],
          query
        })
      });

      if (res.ok) {
        const { schedule: emSched } = await res.json();
        setSchedule(emSched);
        triggerNotification('Emergency Cram Session Active! Timeline forced to maximum adrenalin.');
      }
    } catch (e) {
      console.error(e);
    }
  };

  // 5. Habits tracking operations
  const handleAddHabit = async (habitData: any) => {
    try {
      const res = await fetch('/api/habits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...habitData, userId: user?.id })
      });

      if (res.ok) {
        const { habit } = await res.json();
        setHabits(prev => [habit, ...prev]);
        triggerNotification('Habit routine activated.');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleToggleHabit = async (id: string) => {
    try {
      const todayStr = new Date().toISOString().split('T')[0];
      const res = await fetch(`/api/habits/${id}/toggle`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: todayStr })
      });

      if (res.ok) {
        const { habit } = await res.json();
        setHabits(prev => prev.map(h => h.id === id ? habit : h));
        
        // Sync history score too
        if (user) await fetchWorkspaceData(user.id);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteHabit = async (id: string) => {
    try {
      const res = await fetch(`/api/habits/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setHabits(prev => prev.filter(h => h.id !== id));
        triggerNotification('Habit routine removed.');
      }
    } catch (e) {
      console.error(e);
    }
  };

  // 6. Analytics triggers
  const handleTriggerReview = async () => {
    try {
      const res = await fetch('/api/weekly-reviews/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id,
          weekStartDate: new Date(Date.now() - 1000 * 60 * 60 * 168).toISOString().split('T')[0]
        })
      });

      if (res.ok) {
        const { review } = await res.json();
        setWeeklyReviews(prev => [review, ...prev]);
        triggerNotification('Weekly analysis compiled. Performance trends processed.');
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Voice parsed callback
  const handleVoiceTaskParsed = async (parsedTask: any) => {
    await handleAddTask(parsedTask);
  };


  // LOADING GUEST SHELL
  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col items-center justify-center font-sans">
        <div className="space-y-4 text-center">
          <div className="relative w-16 h-16 mx-auto">
            <div className="absolute inset-0 border-4 border-indigo-500/20 rounded-full" />
            <div className="absolute inset-0 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            <Zap className="w-6 h-6 text-indigo-500 absolute inset-0 m-auto animate-pulse" />
          </div>
          <div>
            <h1 className="text-base font-bold text-zinc-800 dark:text-zinc-200">LifeSaver AI Companion</h1>
            <p className="text-xs text-zinc-400">Booting environment and loading data models...</p>
          </div>
        </div>
      </div>
    );
  }

  // LOGIN / REGISTER VIEWS
  if (authMode !== 'authenticated' || !user) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center p-4 font-sans">
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 md:p-8 w-full max-w-md shadow-lg space-y-6">
          <div className="text-center space-y-2">
            <div className="p-3 bg-indigo-50 dark:bg-indigo-950/30 rounded-2xl text-indigo-500 w-fit mx-auto">
              <Zap className="w-6 h-6 fill-current animate-pulse" />
            </div>
            <h2 className="text-xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100">LifeSaver AI Companion</h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">Secure registration and passwordless demo sign-in</p>
          </div>

          <form onSubmit={authMode === 'login' ? handleLogin : handleRegister} className="space-y-4 text-xs">
            {authMode === 'register' && (
              <div>
                <label className="block text-zinc-500 dark:text-zinc-400 mb-1 font-medium">Your Name</label>
                <input
                  type="text"
                  required
                  value={authName}
                  onChange={(e) => setAuthName(e.target.value)}
                  placeholder="Alex Mercer"
                  className="w-full px-3.5 py-2.5 border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 rounded-xl outline-none text-zinc-800 dark:text-zinc-200"
                />
              </div>
            )}

            <div>
              <label className="block text-zinc-500 dark:text-zinc-400 mb-1 font-medium">Email Address</label>
              <input
                type="email"
                required
                value={authEmail}
                onChange={(e) => setAuthEmail(e.target.value)}
                placeholder="demo@lifesaver.ai"
                className="w-full px-3.5 py-2.5 border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 rounded-xl outline-none text-zinc-800 dark:text-zinc-200"
              />
            </div>

            {authError && (
              <p className="text-[11px] text-rose-500 bg-rose-50 dark:bg-rose-950/20 px-3 py-2 rounded-xl font-medium">
                {authError}
              </p>
            )}

            <button
              type="submit"
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-colors cursor-pointer"
            >
              {authMode === 'login' ? 'Sign In / Sandbox Enter' : 'Register Profile'}
            </button>
          </form>

          <div className="flex items-center justify-between text-xs pt-2">
            <button
              onClick={() => {
                setAuthMode(authMode === 'login' ? 'register' : 'login');
                setAuthError(null);
              }}
              className="text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer flex items-center gap-1 font-semibold"
            >
              {authMode === 'login' ? (
                <><UserPlus className="w-4 h-4" /> Create custom profile</>
              ) : (
                <><LogIn className="w-4 h-4" /> Go back to sign-in</>
              )}
            </button>
            <button
              onClick={() => {
                setAuthEmail('demo@lifesaver.ai');
                setAuthMode('login');
                // Trigger quick enter
                setTimeout(() => {
                  const fakeEvent = { preventDefault: () => {} };
                  handleLogin(fakeEvent as any);
                }, 100);
              }}
              className="text-zinc-500 hover:underline cursor-pointer font-medium"
            >
              Quick Guest Demo
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-zinc-950 font-sans pb-16" id="app-root">
      
      {/* Dynamic Action Notification */}
      {notification && (
        <div className="fixed top-4 right-4 bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 px-4 py-3 rounded-2xl shadow-xl z-50 text-xs font-semibold flex items-center gap-2 animate-bounce border border-zinc-800 dark:border-zinc-100" id="global-notification">
          <Bell className="w-4 h-4 text-indigo-500 animate-swing" />
          <span>{notification}</span>
        </div>
      )}

      {/* Primary Header Area */}
      <header className="sticky top-0 z-30 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-900">
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between gap-4">
          
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-600 rounded-xl text-white">
              <Zap className="w-4 h-4 fill-current" />
            </div>
            <div>
              <span className="text-sm font-black text-zinc-900 dark:text-zinc-100 tracking-tight leading-none block">LifeSaver AI</span>
              <span className="text-[10px] text-zinc-400 font-semibold tracking-wide">Productivity Guardian</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* System Status Display (MongoDB + Gemini status) */}
            <DBStatus />

            {/* Profile Sign-out dropdown */}
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex flex-col text-right">
                <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 leading-tight">{user.name}</span>
                <span className="text-[10px] text-zinc-400 font-medium">{user.email}</span>
              </div>
              <img 
                src={user.avatarUrl || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(user.email)}`} 
                alt="Avatar" 
                className="w-8 h-8 rounded-full border border-zinc-200 dark:border-zinc-800 bg-zinc-50"
              />
              <button
                onClick={handleSignOut}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-500 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors cursor-pointer"
                title="Log Out Session"
              >
                <LogOut className="w-4.5 h-4.5" />
              </button>
            </div>
          </div>

        </div>
      </header>

      {/* Navigation Sub-Header Bar */}
      <nav className="border-b border-zinc-200 dark:border-zinc-900 bg-white dark:bg-zinc-950 py-2 sticky top-16 z-20">
        <div className="max-w-7xl mx-auto px-4 md:px-6 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: Zap },
            { id: 'tasks', label: 'Tasks', icon: Layers },
            { id: 'schedule', label: 'Daily Schedule', icon: Clock },
            { id: 'habits', label: 'Habit Tracker', icon: Flame },
            { id: 'reviews', label: 'Weekly Review', icon: Award },
          ].map(tab => {
            const Icon = tab.icon;
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold tracking-tight whitespace-nowrap cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950'
                    : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-900/30'
                }`}
              >
                <Icon className={`w-4 h-4 ${isSelected ? 'stroke-indigo-500 fill-current' : 'opacity-70'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Main Container Content */}
      <main className="max-w-7xl mx-auto px-4 md:px-6 mt-6 space-y-6">
        
        {/* Onboarding Assistant Alert if Gemini key or MongoDB is missing */}
        {(!schedule || tasks.length <= 1) && (
          <div className="p-4 bg-indigo-50/40 dark:bg-indigo-950/10 border border-indigo-100 dark:border-indigo-950/30 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-3 text-xs leading-relaxed">
              <Sparkles className="w-5 h-5 text-indigo-500 flex-shrink-0 mt-0.5 animate-pulse" />
              <div>
                <span className="font-bold text-indigo-900 dark:text-indigo-200">Welcome! Let's get started:</span>
                <p className="text-zinc-500 dark:text-zinc-400 mt-0.5">
                  Try speaking to the Voice Assistant or type a task scenario below (e.g. <span className="italic">"I have a math test tomorrow"</span>) to automatically create a custom schedule with actionable steps and deadlines!
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                // Focus voice input card
                const el = document.getElementById('voice-assistant');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="text-xs bg-indigo-600 hover:bg-indigo-700 font-bold px-4 py-2 text-white rounded-xl cursor-pointer self-start md:self-auto flex-shrink-0"
            >
              Launch Assistant Panel
            </button>
          </div>
        )}

        {/* Tab rendering */}
        {activeTab === 'dashboard' && (
          <DashboardTab 
            tasks={tasks}
            habits={habits}
            schedule={schedule}
            onNavigate={(t) => setActiveTab(t)}
            onToggleTask={handleUpdateTask}
            user={user}
          />
        )}

        {activeTab === 'tasks' && (
          <TasksTab 
            tasks={tasks}
            onAddTask={handleAddTask}
            onUpdateTask={handleUpdateTask}
            onDeleteTask={handleDeleteTask}
            onTriggerBreakdown={handleTriggerBreakdown}
            onTriggerRiskCheck={handleTriggerRiskCheck}
          />
        )}

        {activeTab === 'schedule' && (
          <ScheduleTab 
            schedule={schedule}
            tasks={tasks}
            onGenerateSchedule={handleGenerateSchedule}
            onReplanSchedule={handleReplanSchedule}
            onTriggerEmergencyMode={handleTriggerEmergencyMode}
            onToggleTask={handleUpdateTask}
          />
        )}

        {activeTab === 'habits' && (
          <HabitsTab 
            habits={habits}
            onAddHabit={handleAddHabit}
            onToggleHabit={handleToggleHabit}
            onDeleteHabit={handleDeleteHabit}
          />
        )}

        {activeTab === 'reviews' && (
          <ReviewsTab 
            reviews={weeklyReviews}
            historyLogs={historyLogs}
            onTriggerReview={handleTriggerReview}
          />
        )}

        {/* Floating / Embedded Voice Assistant Bar */}
        <VoiceInput 
          onParsedTask={handleVoiceTaskParsed} 
          userId={user.id} 
        />

      </main>
    </div>
  );
}
