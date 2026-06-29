/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Task, Habit, DailySchedule, AIRecommendation } from '../types';
import { 
  CheckCircle, 
  Clock, 
  Flame, 
  TrendingUp, 
  AlertTriangle, 
  ChevronRight, 
  Activity, 
  Zap, 
  ShieldAlert,
  Sparkles,
  Award
} from 'lucide-react';

interface DashboardTabProps {
  tasks: Task[];
  habits: Habit[];
  schedule: DailySchedule | null;
  onNavigate: (tab: string) => void;
  onToggleTask: (id: string, completed: boolean) => void;
  user: any;
}

export default function DashboardTab({ 
  tasks, 
  habits, 
  schedule, 
  onNavigate, 
  onToggleTask,
  user
}: DashboardTabProps) {
  
  // Calculate analytics
  const todayStr = new Date().toISOString().split('T')[0];
  const pendingTasks = tasks.filter(t => t.status === 'Pending');
  const completedToday = tasks.filter(t => t.status === 'Completed' && t.completedAt?.startsWith(todayStr)).length;
  const totalToday = tasks.filter(t => {
    const isToday = t.deadline.startsWith(todayStr) || (t.scheduledTime && t.scheduledTime.startsWith(todayStr));
    return isToday;
  }).length;

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'Completed').length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Max streak among habits
  const currentMaxStreak = habits.reduce((max, h) => Math.max(max, h.streak), 0);

  // High Risk Tasks
  const highRiskTasks = tasks.filter(t => t.status === 'Pending' && t.riskLevel === 'High');

  // Next active task
  const nextTask = tasks
    .filter(t => t.status === 'Pending')
    .sort((a,b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())[0];

  // Dynamic Productivity Score computation
  const baseScore = completionRate * 0.7 + (currentMaxStreak * 3) + (completedToday * 5);
  const productivityScore = Math.min(100, Math.max(10, Math.round(baseScore)));

  // Generate dynamic recommendations based on workspace factors
  const recommendations: AIRecommendation[] = [];
  if (highRiskTasks.length > 0) {
    recommendations.push({
      id: 'rec_1',
      type: 'risk',
      title: 'Action Needed: High Deadline Risk',
      message: `"${highRiskTasks[0].title}" might clash with other deadlines. ${highRiskTasks[0].riskReason || ''}`,
      actionLabel: 'Adjust Task Details'
    });
  }
  if (pendingTasks.some(t => new Date(t.deadline).getTime() < Date.now())) {
    recommendations.push({
      id: 'rec_2',
      type: 'replan',
      title: 'Overdue Tasks Detected',
      message: 'You have past-due tasks. Let our AI reschedule them around your current energy levels.',
      actionLabel: 'Reschedule Now'
    });
  }
  if (habits.some(h => h.streak === 0)) {
    const brokenHabit = habits.find(h => h.streak === 0);
    recommendations.push({
      id: 'rec_3',
      type: 'goal',
      title: 'Streak Recovery Opportunity',
      message: `Keep up your momentum! Tap to log progress for your habit "${brokenHabit?.title || 'Habit'}" today.`,
      actionLabel: 'Check Off Habit'
    });
  }
  if (recommendations.length === 0) {
    recommendations.push({
      id: 'rec_4',
      type: 'general',
      title: 'All Caught Up!',
      message: 'Excellent pacing! No overdue tasks or impending deadline risks detected. Keep up the great work.',
      actionLabel: 'View Daily Schedule'
    });
  }

  return (
    <div className="space-y-6" id="dashboard-tab">
      {/* Upper greeting card */}
      <div className="bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-950 text-white rounded-3xl p-6 md:p-8 relative overflow-hidden shadow-md">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <span className="text-xs font-bold tracking-widest text-emerald-400 uppercase">Welcome back, {user?.name || 'Explorer'}</span>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Stay On Top of Your Day</h1>
            <p className="text-xs md:text-sm text-zinc-300 max-w-xl">
              LifeSaver AI helps you manage your tasks, schedules them based on your focus levels, and alerts you about potential deadline risks.
            </p>
          </div>
          <div className="flex-shrink-0 flex items-center gap-4 bg-white/10 backdrop-blur-md px-5 py-4 rounded-2xl border border-white/10">
            <div className="relative w-14 h-14 flex items-center justify-center">
              {/* SVG Ring for productivity score */}
              <svg className="absolute w-full h-full transform -rotate-90">
                <circle cx="28" cy="28" r="24" stroke="rgba(255,255,255,0.1)" strokeWidth="4" fill="transparent" />
                <circle 
                  cx="28" 
                  cy="28" 
                  r="24" 
                  stroke="#10b981" 
                  strokeWidth="4" 
                  fill="transparent" 
                  strokeDasharray={`${2 * Math.PI * 24}`}
                  strokeDashoffset={`${2 * Math.PI * 24 * (1 - productivityScore / 100)}`}
                  className="transition-all duration-500"
                />
              </svg>
              <span className="text-sm font-bold">{productivityScore}</span>
            </div>
            <div>
              <span className="block text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Productivity Score</span>
              <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5" /> Focusing Great!
              </span>
            </div>
          </div>
        </div>

        {/* Decorative subtle background waves */}
        <div className="absolute -right-12 -bottom-12 w-64 h-64 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -left-12 -top-12 w-64 h-64 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-zinc-950 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 flex items-center gap-4 shadow-sm">
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 rounded-xl text-emerald-500">
            <CheckCircle className="w-5 h-5" />
          </div>
          <div>
            <span className="block text-xs text-zinc-500 dark:text-zinc-400 font-medium">Task Completion</span>
            <span className="text-lg font-bold text-zinc-900 dark:text-zinc-100">{completionRate}%</span>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-950 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 flex items-center gap-4 shadow-sm">
          <div className="p-3 bg-amber-50 dark:bg-amber-950/20 rounded-xl text-amber-500">
            <Flame className="w-5 h-5" />
          </div>
          <div>
            <span className="block text-xs text-zinc-500 dark:text-zinc-400 font-medium">Active Streak</span>
            <span className="text-lg font-bold text-zinc-900 dark:text-zinc-100">{currentMaxStreak} Days</span>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-950 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 flex items-center gap-4 shadow-sm">
          <div className="p-3 bg-rose-50 dark:bg-rose-950/20 rounded-xl text-rose-500">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <span className="block text-xs text-zinc-500 dark:text-zinc-400 font-medium">Deadline Risks</span>
            <span className="text-lg font-bold text-zinc-900 dark:text-zinc-100">{highRiskTasks.length} High</span>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-950 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 flex items-center gap-4 shadow-sm">
          <div className="p-3 bg-indigo-50 dark:bg-indigo-950/20 rounded-xl text-indigo-500">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <span className="block text-xs text-zinc-500 dark:text-zinc-400 font-medium">Today Completed</span>
            <span className="text-lg font-bold text-zinc-900 dark:text-zinc-100">{completedToday} / {totalToday || totalTasks}</span>
          </div>
        </div>
      </div>

      {/* Main Column & Side Column Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (2/3 size): Today's task timeline & AI Recommendations */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* AI Advisor Card */}
          <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-5 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-xs uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-indigo-500 animate-pulse" />
              <span>Smart AI Recommendations</span>
            </div>

            <div className="space-y-3">
              {recommendations.map((rec) => (
                <div key={rec.id} className="p-4 rounded-2xl border border-zinc-100 dark:border-zinc-900 bg-zinc-50/50 dark:bg-zinc-900/10 flex items-start gap-3.5">
                  <div className={`p-2 rounded-xl mt-0.5 ${
                    rec.type === 'risk' ? 'bg-rose-50 dark:bg-rose-950/30 text-rose-500' :
                    rec.type === 'replan' ? 'bg-amber-50 dark:bg-amber-950/30 text-amber-500' :
                    rec.type === 'goal' ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-500' :
                    'bg-indigo-50 dark:bg-indigo-950/30 text-indigo-500'
                  }`}>
                    {rec.type === 'risk' ? <ShieldAlert className="w-4 h-4" /> :
                     rec.type === 'replan' ? <Clock className="w-4 h-4" /> :
                     rec.type === 'goal' ? <Flame className="w-4 h-4" /> :
                     <Zap className="w-4 h-4" />}
                  </div>
                  <div className="flex-grow min-w-0 space-y-1">
                    <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">{rec.title}</h4>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">{rec.message}</p>
                    <button
                      onClick={() => {
                        if (rec.type === 'risk') onNavigate('tasks');
                        else if (rec.type === 'replan') onNavigate('schedule');
                        else if (rec.type === 'goal') onNavigate('habits');
                        else onNavigate('schedule');
                      }}
                      className="text-xs text-indigo-600 dark:text-indigo-400 font-bold hover:underline flex items-center gap-0.5 pt-1 cursor-pointer"
                    >
                      {rec.actionLabel} <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Today's schedule preview */}
          <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Today's Schedule</h3>
              <button
                onClick={() => onNavigate('schedule')}
                className="text-xs text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 font-bold flex items-center gap-0.5 cursor-pointer"
              >
                Full Schedule <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {schedule && schedule.blocks && schedule.blocks.length > 0 ? (
              <div className="space-y-3">
                {schedule.blocks.slice(0, 3).map((block, idx) => (
                  <div key={block.id || block.time || idx} className="flex items-center justify-between p-3.5 rounded-2xl border border-zinc-100 dark:border-zinc-900 bg-white dark:bg-zinc-950 hover:bg-zinc-50/50 dark:hover:bg-zinc-900/10 transition-colors">
                    <div className="flex items-center gap-3.5">
                      <div className="text-xs font-bold tracking-tight text-zinc-400 bg-zinc-100 dark:bg-zinc-900 px-2 py-1.5 rounded-lg w-12 text-center">
                        {block.time}
                      </div>
                      <div>
                        <span className="block text-xs font-bold text-zinc-800 dark:text-zinc-200 leading-tight">{block.taskTitle}</span>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-900 text-zinc-500 font-medium">
                            {block.category}
                          </span>
                          <span className={`text-[10px] font-bold flex items-center gap-0.5 ${
                            block.energyLevelRequired === 'High' ? 'text-rose-500' :
                            block.energyLevelRequired === 'Medium' ? 'text-amber-500' :
                            'text-emerald-500'
                          }`}>
                            <Zap className="w-2.5 h-2.5 fill-current" /> {block.energyLevelRequired} Focus
                          </span>
                        </div>
                      </div>
                    </div>
                    {block.taskId && (
                      <button
                        onClick={() => onToggleTask(block.taskId!, true)}
                        className="p-1.5 rounded-full border border-zinc-200 dark:border-zinc-800 text-zinc-400 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950/25 transition-colors cursor-pointer"
                        title="Mark Completed"
                      >
                        <CheckCircle className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 bg-zinc-50/50 dark:bg-zinc-900/10 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl space-y-2">
                <Clock className="w-8 h-8 text-zinc-400 mx-auto" />
                <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Your schedule is empty for today.</p>
                <button
                  onClick={() => onNavigate('schedule')}
                  className="mt-1 text-xs px-3 py-1.5 bg-zinc-950 dark:bg-zinc-100 text-white dark:text-zinc-950 font-semibold rounded-lg hover:opacity-90 transition-opacity cursor-pointer"
                >
                  Create Daily Schedule
                </button>
              </div>
            )}
          </div>

        </div>

        {/* Right Column (1/3 size): Impending Deadlines, Procrastination alert */}
        <div className="space-y-6">
          
          {/* High Priority Upcoming Task */}
          <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Next Important Task</h3>
            
            {nextTask ? (
              <div className="space-y-3.5">
                <div className="p-4 bg-zinc-50 dark:bg-zinc-900/30 rounded-2xl border border-zinc-100 dark:border-zinc-900 space-y-3">
                  <div>
                    <span className="text-[10px] font-bold text-rose-500 bg-rose-50 dark:bg-rose-950/20 px-2 py-0.5 rounded-md uppercase tracking-wider">{nextTask.priority} Priority</span>
                    <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 mt-1.5">{nextTask.title}</h4>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 line-clamp-2">{nextTask.description}</p>
                  </div>

                  <div className="flex items-center justify-between text-[11px] border-t border-zinc-100 dark:border-zinc-900 pt-3">
                    <span className="text-zinc-400">Deadline:</span>
                    <span className="font-semibold text-zinc-700 dark:text-zinc-300">
                      {new Date(nextTask.deadline).toLocaleDateString()} at {new Date(nextTask.deadline).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => onNavigate('tasks')}
                  className="w-full py-2.5 text-center bg-zinc-950 dark:bg-zinc-100 text-white dark:text-zinc-950 font-bold rounded-xl text-xs hover:opacity-90 transition-opacity cursor-pointer flex items-center justify-center gap-1"
                >
                  View All Tasks <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="text-center py-6 bg-zinc-50/50 dark:bg-zinc-900/10 rounded-2xl">
                <Award className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">All caught up on tasks!</p>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1">Your task list is completely clear.</p>
              </div>
            )}
          </div>

          {/* Explainable AI Risk prediction banner */}
          {highRiskTasks.length > 0 && (
            <div className="bg-rose-50/40 dark:bg-rose-950/10 border border-rose-100 dark:border-rose-950 rounded-3xl p-5 space-y-3">
              <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-bold text-xs">
                <AlertTriangle className="w-4 h-4" />
                <span>AI Deadline Risk Alert</span>
              </div>
              <p className="text-xs text-rose-900 dark:text-rose-200 leading-relaxed font-medium">
                "{highRiskTasks[0].title}" is in danger of slipping!
              </p>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed">
                <strong>Why:</strong> {highRiskTasks[0].riskReason}
              </p>
              <div className="p-3 bg-white dark:bg-zinc-900 border border-rose-100 dark:border-rose-950 rounded-xl">
                <span className="block text-[10px] text-rose-500 font-bold uppercase tracking-wider mb-1">AI Suggested Plan:</span>
                <p className="text-xs text-zinc-800 dark:text-zinc-300 leading-relaxed">{highRiskTasks[0].suggestedAction}</p>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
