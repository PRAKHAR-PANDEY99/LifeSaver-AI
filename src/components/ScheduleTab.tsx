/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { DailySchedule, EnergyLevel, Task } from '../types';
import { 
  Clock, 
  Zap, 
  Sparkles, 
  RefreshCw, 
  AlertOctagon, 
  HelpCircle, 
  CheckCircle, 
  TrendingUp, 
  Volume2, 
  Flame,
  Activity
} from 'lucide-react';

interface ScheduleTabProps {
  schedule: DailySchedule | null;
  tasks: Task[];
  onGenerateSchedule: (energy: EnergyLevel) => Promise<void>;
  onReplanSchedule: () => Promise<void>;
  onTriggerEmergencyMode: (query: string) => Promise<void>;
  onToggleTask: (id: string, completed: boolean) => Promise<void>;
}

export default function ScheduleTab({
  schedule,
  tasks,
  onGenerateSchedule,
  onReplanSchedule,
  onTriggerEmergencyMode,
  onToggleTask
}: ScheduleTabProps) {
  
  const [selectedEnergy, setSelectedEnergy] = useState<EnergyLevel>('High');
  const [emergencyQuery, setEmergencyQuery] = useState('');
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [isReplanning, setIsReplanning] = useState(false);
  const [isEmergencyLoading, setIsEmergencyLoading] = useState(false);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      await onGenerateSchedule(selectedEnergy);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleReplan = async () => {
    setIsReplanning(true);
    try {
      await onReplanSchedule();
    } finally {
      setIsReplanning(false);
    }
  };

  const handleEmergency = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emergencyQuery.trim()) return;
    setIsEmergencyLoading(true);
    try {
      await onTriggerEmergencyMode(emergencyQuery);
      setEmergencyQuery('');
    } finally {
      setIsEmergencyLoading(false);
    }
  };

  // Check if today has overdue items
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];
  const hasOverdueTasks = tasks.some(t => {
    const isOverdue = new Date(t.deadline).getTime() < now.getTime();
    return t.status === 'Pending' && isOverdue;
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="schedule-tab">
      
      {/* Schedule Configuration / AI Tools */}
      <div className="space-y-6">
        
        {/* Focus-Based Schedule Generator */}
        <div className="bg-white dark:bg-zinc-950 p-5 border border-zinc-200 dark:border-zinc-800 rounded-3xl space-y-4 shadow-sm">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Focus-Based Scheduling</h3>
          </div>
          
          <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
            AI coordinates tasks based on your current energy level. Demanding tasks will be placed during your high-focus times, leaving easier tasks for low-energy periods.
          </p>

          <div className="space-y-2">
            <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block">Set Current Energy Level</span>
            <div className="grid grid-cols-3 gap-2">
              {(['High', 'Medium', 'Low'] as const).map(level => (
                <button
                  key={level}
                  onClick={() => setSelectedEnergy(level)}
                  className={`p-3 text-center border rounded-2xl cursor-pointer transition-all ${
                    selectedEnergy === level
                      ? 'border-indigo-500 bg-indigo-50/40 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 font-bold'
                      : 'border-zinc-100 dark:border-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-900 text-zinc-600 dark:text-zinc-400'
                  }`}
                >
                  <Zap className={`w-4 h-4 mx-auto mb-1 ${
                    selectedEnergy === level 
                      ? 'text-indigo-500 fill-current' 
                      : 'text-zinc-400'
                  }`} />
                  <span className="text-xs block">{level}</span>
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="w-full py-2.5 px-4 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-bold text-xs rounded-xl hover:opacity-90 transition-opacity cursor-pointer flex items-center justify-center gap-1.5"
          >
            {isGenerating ? (
              <div className="w-3.5 h-3.5 border-2 border-zinc-500 border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-emerald-400" /> Generate Daily Schedule
              </>
            )}
          </button>
        </div>

        {/* AI Auto-Replanning Panel */}
        <div className="bg-white dark:bg-zinc-950 p-5 border border-zinc-200 dark:border-zinc-800 rounded-3xl space-y-4 shadow-sm">
          <div className="flex items-center gap-2">
            <RefreshCw className="w-5 h-5 text-amber-500" />
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Smart Rescheduling Assistant</h3>
          </div>
          
          <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
            Missed or overdue tasks? Let our AI reschedule the remainder of your day automatically, pushing less critical items out.
          </p>

          {hasOverdueTasks && (
            <div className="p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/50 rounded-2xl flex items-start gap-2">
              <AlertOctagon className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
              <div className="space-y-0.5 text-[11px] text-amber-800 dark:text-amber-300 font-medium">
                <span>Overdue tasks detected</span>
                <p className="text-[10px] text-zinc-500 dark:text-zinc-400 font-normal leading-relaxed">
                  You have past-due tasks on your list. Trigger rescheduling to optimize your timeline.
                </p>
              </div>
            </div>
          )}

          <button
            onClick={handleReplan}
            disabled={isReplanning || !schedule}
            className="w-full py-2.5 px-4 bg-amber-500 hover:bg-amber-600 disabled:opacity-45 text-zinc-900 font-extrabold text-xs rounded-xl cursor-pointer transition-colors flex items-center justify-center gap-1.5"
          >
            {isReplanning ? (
              <div className="w-3.5 h-3.5 border-2 border-zinc-900 border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <RefreshCw className="w-4 h-4" /> Reschedule My Day
              </>
            )}
          </button>
        </div>

        {/* Emergency Study Planner Mode Panel */}
        <div className="bg-rose-50/50 dark:bg-rose-950/10 border border-rose-100 dark:border-rose-950/30 p-5 rounded-3xl space-y-4">
          <div className="flex items-center gap-2">
            <AlertOctagon className="w-5 h-5 text-rose-500 animate-pulse" />
            <h3 className="text-sm font-bold text-rose-900 dark:text-rose-100">Emergency Study Planner</h3>
          </div>
          
          <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
            Faced with a sudden deadline conflict or a last-minute exam? Describe the situation below, and the AI will spin up an hour-by-hour emergency cram schedule for you.
          </p>

          <form onSubmit={handleEmergency} className="space-y-3">
            <textarea
              required
              value={emergencyQuery}
              onChange={(e) => setEmergencyQuery(e.target.value)}
              placeholder="e.g. I have a major history exam tomorrow morning and need to study the French Revolution tonight!"
              className="w-full px-3 py-2 border border-rose-200 dark:border-rose-900/50 bg-white dark:bg-zinc-900 rounded-xl text-xs outline-none h-20 text-zinc-800 dark:text-zinc-200 focus:border-rose-400"
            />
            <button
              type="submit"
              disabled={isEmergencyLoading || !emergencyQuery.trim()}
              className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 disabled:opacity-40 text-white font-extrabold text-xs rounded-xl cursor-pointer transition-colors flex items-center justify-center gap-1.5 shadow-sm shadow-rose-600/10"
            >
              {isEmergencyLoading ? (
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <AlertOctagon className="w-4 h-4" /> Generate Emergency Plan
                </>
              )}
            </button>
          </form>
        </div>

      </div>

      {/* Hour-by-Hour Timeline Grid (2/3 size) */}
      <div className="lg:col-span-2 space-y-4">
        <div className="bg-white dark:bg-zinc-950 p-5 md:p-6 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-sm min-h-[500px] space-y-5">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-zinc-100 dark:border-zinc-900 pb-4 gap-4">
            <div>
              <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <span>My Daily Schedule</span>
                {schedule?.isEmergencyMode && (
                  <span className="text-[10px] bg-rose-500 text-white font-bold uppercase tracking-wider px-2 py-0.5 rounded-full animate-pulse flex items-center gap-0.5">
                    🚨 Emergency Active
                  </span>
                )}
              </h2>
              <p className="text-xs text-zinc-400">Date: {schedule ? schedule.date : todayStr} | Energy State: {schedule ? schedule.energyLevel : 'Not Configured'}</p>
            </div>

            <div className="text-right">
              <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block">Completed Blocks</span>
              <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                {schedule?.blocks.filter(b => b.status === 'Completed').length || 0} / {schedule?.blocks.length || 0} blocks
              </span>
            </div>
          </div>

          {/* AI Schedule Overview Banner */}
          {schedule && schedule.aiOverview && (
            <div className="p-4 rounded-2xl bg-indigo-50/30 dark:bg-indigo-950/10 border border-indigo-100 dark:border-indigo-950/50 flex items-start gap-3">
              <Sparkles className="w-4.5 h-4.5 text-indigo-500 flex-shrink-0 mt-0.5 animate-pulse" />
              <div className="space-y-0.5">
                <span className="block text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">AI Strategy Insights</span>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">{schedule.aiOverview}</p>
              </div>
            </div>
          )}

          {/* Timeline Blocks */}
          {schedule && schedule.blocks && schedule.blocks.length > 0 ? (
            <div className="relative pl-6 border-l border-zinc-100 dark:border-zinc-900 space-y-6 py-2">
              {schedule.blocks.map((block, idx) => {
                const isBreak = !block.taskId;
                
                return (
                  <div key={block.id || block.time || idx} className="relative group">
                    
                    {/* Circle Node Indicator */}
                    <div className={`absolute -left-10 top-1.5 w-8 h-8 rounded-full border bg-white dark:bg-zinc-950 flex items-center justify-center transition-colors z-10 ${
                      block.status === 'Completed' ? 'border-emerald-500 text-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20' :
                      block.status === 'Missed' ? 'border-rose-500 text-rose-500 bg-rose-50/50' :
                      isBreak ? 'border-zinc-300 dark:border-zinc-700 text-zinc-400' :
                      'border-zinc-400 dark:border-zinc-600 text-zinc-600'
                    }`}>
                      {block.status === 'Completed' ? (
                        <CheckCircle className="w-4 h-4" />
                      ) : (
                        <Clock className="w-4 h-4" />
                      )}
                    </div>

                    <div className={`p-4 rounded-2xl border transition-all ${
                      block.status === 'Completed' ? 'border-emerald-100 dark:border-emerald-950 bg-emerald-50/10' :
                      block.status === 'Missed' ? 'border-rose-100 dark:border-rose-950 bg-rose-50/10' :
                      isExpanded => 'border-zinc-100 dark:border-zinc-900 bg-zinc-50/20'
                    }`}>
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-tight bg-zinc-100 dark:bg-zinc-900 px-2 py-0.5 rounded">
                              {block.time} ({block.durationMinutes}m)
                            </span>
                            {block.category && (
                              <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-medium">
                                {block.category}
                              </span>
                            )}
                          </div>
                          
                          <h4 className={`text-xs font-bold leading-tight ${
                            block.status === 'Completed' ? 'line-through text-zinc-400' : 'text-zinc-800 dark:text-zinc-200'
                          }`}>
                            {block.taskTitle}
                          </h4>
                          
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`text-[10px] font-bold flex items-center gap-0.5 ${
                              block.energyLevelRequired === 'High' ? 'text-rose-500' :
                              block.energyLevelRequired === 'Medium' ? 'text-amber-500' :
                              'text-emerald-500'
                            }`}>
                              <Zap className="w-2.5 h-2.5 fill-current" /> {block.energyLevelRequired} Focus Required
                            </span>
                          </div>
                        </div>

                        {block.taskId && (
                          <button
                            onClick={() => onToggleTask(block.taskId!, block.status !== 'Completed')}
                            className={`p-1.5 rounded-full border transition-colors cursor-pointer ${
                              block.status === 'Completed'
                                ? 'border-emerald-200 dark:border-emerald-950 bg-emerald-50/50 text-emerald-500'
                                : 'border-zinc-200 dark:border-zinc-800 text-zinc-400 hover:text-emerald-500 hover:bg-emerald-50/50'
                            }`}
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-20 space-y-4">
              <Clock className="w-14 h-14 text-zinc-300 mx-auto" />
              <div className="space-y-1">
                <p className="text-sm font-semibold text-zinc-500 dark:text-zinc-400">Your Daily Schedule is Empty</p>
                <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                  Set your current focus level and click "Generate Daily Schedule" to generate a tailored, hour-by-hour task roadmap.
                </p>
              </div>
            </div>
          )}

        </div>
      </div>

    </div>
  );
}
