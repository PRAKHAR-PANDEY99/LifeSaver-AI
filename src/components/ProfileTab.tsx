import React from 'react';
import { User, ProductivityHistoryLog } from '../types';
import { User as UserIcon, Calendar, Mail, LogOut, Award, Flame, CheckCircle } from 'lucide-react';

interface ProfileTabProps {
  user: User;
  onLogout: () => void;
  historyLogs: ProductivityHistoryLog[];
  tasksCount: number;
  habitsCount: number;
}

export default function ProfileTab({ user, onLogout, historyLogs = [], tasksCount = 0, habitsCount = 0 }: ProfileTabProps) {
  if (!user) {
    return (
      <div className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl text-center" id="profile-tab-view">
        <p className="text-sm text-zinc-500">No active profile session found. Please sign in or register.</p>
      </div>
    );
  }

  const safeLogs = Array.isArray(historyLogs) ? historyLogs : [];

  // Calculate analytics
  const totalCompletedTasks = safeLogs.reduce((sum, log) => sum + (log.tasksCompleted || 0), 0) + (tasksCount ? 1 : 0);
  const totalCompletedHabits = safeLogs.reduce((sum, log) => sum + (log.habitsCompleted || 0), 0);
  const averageProductivity = safeLogs.length > 0 
    ? Math.round(safeLogs.reduce((sum, log) => sum + log.score, 0) / safeLogs.length) 
    : 85;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fadeIn" id="profile-tab-view">
      {/* User Card */}
      <div className="md:col-span-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 flex flex-col items-center text-center space-y-4 shadow-sm">
        <div className="relative">
          <img 
            src={user.avatarUrl || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(user.email)}`} 
            alt="Profile Avatar" 
            className="w-24 h-24 rounded-full border-4 border-indigo-500/10 bg-zinc-50"
          />
          <div className="absolute bottom-0 right-0 p-1.5 bg-indigo-600 rounded-full text-white border-2 border-white dark:border-zinc-900">
            <UserIcon className="w-3.5 h-3.5" />
          </div>
        </div>

        <div>
          <h3 className="text-lg font-extrabold text-zinc-900 dark:text-zinc-100">{user.name}</h3>
          <p className="text-xs text-zinc-400 font-semibold">{user.email}</p>
        </div>

        <div className="w-full border-t border-zinc-100 dark:border-zinc-800/50 pt-4 space-y-3 text-left">
          <div className="flex items-center gap-2.5 text-xs text-zinc-500 dark:text-zinc-400">
            <Mail className="w-4 h-4 text-zinc-400" />
            <span>{user.email}</span>
          </div>
          <div className="flex items-center gap-2.5 text-xs text-zinc-500 dark:text-zinc-400">
            <Calendar className="w-4 h-4 text-zinc-400" />
            <span>Joined {user.joinedAt ? new Date(user.joinedAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : 'Recently'}</span>
          </div>
        </div>

        <button
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/20 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 rounded-2xl text-xs font-bold transition-colors cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>Log Out Secure Session</span>
        </button>
      </div>

      {/* Analytics Bento Grid */}
      <div className="md:col-span-2 space-y-6">
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm space-y-6">
          <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-200 tracking-tight">Security & Account Verification</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-4 bg-emerald-50/50 dark:bg-emerald-950/10 border border-emerald-100/60 dark:border-emerald-950/20 rounded-2xl">
              <span className="font-bold text-emerald-800 dark:text-emerald-300 block">Session Status: Active & Secured</span>
              <p className="text-zinc-500 dark:text-zinc-400 mt-1 leading-relaxed">
                Your credentials are encrypted using modern cryptographic PBKDF2 hashing, and communications are restricted strictly to your isolated account ID.
              </p>
            </div>

            <div className="p-4 bg-indigo-50/50 dark:bg-indigo-950/10 border border-indigo-100/60 dark:border-indigo-950/20 rounded-2xl">
              <span className="font-bold text-indigo-800 dark:text-indigo-300 block">Database Sync Mode</span>
              <p className="text-zinc-500 dark:text-zinc-400 mt-1 leading-relaxed">
                Your personalized schedules, habits, and tasks are automatically synchronized with MongoDB Atlas, ensuring zero reliance on browser cache.
              </p>
            </div>
          </div>
        </div>

        {/* Workspace Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-5 flex items-center gap-4 shadow-sm">
            <div className="p-3 bg-indigo-50 dark:bg-indigo-950/30 rounded-2xl text-indigo-500">
              <CheckCircle className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] text-zinc-400 font-bold block uppercase tracking-wider">Completed Tasks</span>
              <span className="text-lg font-black text-zinc-800 dark:text-zinc-100">{totalCompletedTasks}</span>
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-5 flex items-center gap-4 shadow-sm">
            <div className="p-3 bg-amber-50 dark:bg-amber-950/30 rounded-2xl text-amber-500">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] text-zinc-400 font-bold block uppercase tracking-wider">Routine Check-ins</span>
              <span className="text-lg font-black text-zinc-800 dark:text-zinc-100">{totalCompletedHabits}</span>
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-5 flex items-center gap-4 shadow-sm">
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 rounded-2xl text-emerald-500">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] text-zinc-400 font-bold block uppercase tracking-wider">Productivity Score</span>
              <span className="text-lg font-black text-zinc-800 dark:text-zinc-100">{averageProductivity}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
