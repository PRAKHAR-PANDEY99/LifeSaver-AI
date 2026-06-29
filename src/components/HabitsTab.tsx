/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Habit } from '../types';
import { 
  Plus, 
  Trash2, 
  Flame, 
  Sparkles, 
  Check, 
  Activity, 
  Calendar, 
  Lightbulb, 
  Award,
  BookOpen
} from 'lucide-react';

interface HabitsTabProps {
  habits: Habit[];
  onAddHabit: (habitData: any) => Promise<void>;
  onToggleHabit: (id: string) => Promise<void>;
  onDeleteHabit: (id: string) => Promise<void>;
}

export default function HabitsTab({
  habits,
  onAddHabit,
  onToggleHabit,
  onDeleteHabit
}: HabitsTabProps) {
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [frequency, setFrequency] = useState<'daily' | 'weekly'>('daily');

  const [isAdding, setIsAdding] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Generate date strings for last 5 days
  const today = new Date();
  const pastDays = Array.from({ length: 5 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    return d.toISOString().split('T')[0];
  }).reverse(); // Sort old to new (left-to-right)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;

    setIsSubmitting(true);
    try {
      await onAddHabit({
        title,
        description,
        frequency
      });
      setTitle('');
      setDescription('');
      setFrequency('daily');
      setIsAdding(false);
    } catch (err) {
      console.error('Failed to save habit', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="habits-tab">
      
      {/* Creation & Explanation Column */}
      <div className="space-y-6">
        
        {/* Psychological Habit Explanation */}
        <div className="bg-white dark:bg-zinc-950 p-5 border border-zinc-200 dark:border-zinc-800 rounded-3xl space-y-3 shadow-sm">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-500" />
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Why track habits?</h3>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
            Building tiny, daily routines is the easiest way to defeat procrastination. Track small, simple habits here to build focus and momentum for your core tasks.
          </p>
        </div>

        {/* Add Habit Form */}
        {!isAdding ? (
          <button
            onClick={() => setIsAdding(true)}
            className="w-full py-3 px-4 bg-zinc-900 dark:bg-zinc-100 hover:opacity-95 text-white dark:text-zinc-900 font-extrabold rounded-2xl cursor-pointer transition-all flex items-center justify-center gap-2 shadow-sm text-sm"
          >
            <Plus className="w-5 h-5" /> Add New Habit
          </button>
        ) : (
          <div className="bg-white dark:bg-zinc-950 p-5 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Create a Habit</h3>
            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-zinc-500 dark:text-zinc-400 mb-1 font-medium">Habit Name</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Study Flashcards, Drink Water"
                  className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 rounded-xl text-zinc-800 dark:text-zinc-200 outline-none"
                />
              </div>

              <div>
                <label className="block text-zinc-500 dark:text-zinc-400 mb-1 font-medium">Description / Cue</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. Do 5 minutes right after making coffee"
                  className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 rounded-xl text-zinc-800 dark:text-zinc-200 outline-none h-20"
                />
              </div>

              <div>
                <label className="block text-zinc-500 dark:text-zinc-400 mb-1 font-medium">Frequency</label>
                <div className="grid grid-cols-2 gap-2">
                  {(['daily', 'weekly'] as const).map(freq => (
                    <button
                      key={freq}
                      type="button"
                      onClick={() => setFrequency(freq)}
                      className={`py-2 text-center rounded-xl font-semibold border cursor-pointer transition-colors capitalize ${
                        frequency === freq
                          ? 'border-indigo-500 bg-indigo-50/40 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400'
                          : 'border-zinc-100 dark:border-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-900 text-zinc-600'
                      }`}
                    >
                      {freq}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="flex-1 py-2 text-center border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 font-semibold rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-2 text-center bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:opacity-90 font-semibold rounded-xl transition-opacity cursor-pointer flex justify-center items-center"
                >
                  {isSubmitting ? (
                    <div className="w-3.5 h-3.5 border-2 border-zinc-500 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    'Save Habit'
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* Habits List Panel (2/3 size) */}
      <div className="lg:col-span-2 space-y-4">
        <div className="bg-white dark:bg-zinc-950 p-5 md:p-6 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-sm min-h-[450px]">
          <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100 mb-4 flex items-center justify-between">
            <span>My Habits ({habits.length})</span>
            <span className="text-xs text-zinc-400 font-medium">Log completions for the past 5 days</span>
          </h2>

          {habits.length === 0 ? (
            <div className="text-center py-20 space-y-3">
              <Award className="w-12 h-12 text-zinc-300 mx-auto" />
              <p className="text-sm font-semibold text-zinc-500 dark:text-zinc-400">Zero active habits</p>
              <p className="text-xs text-zinc-400">Create your first habit above to start tracking your daily streaks!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {habits.map((habit) => {
                
                return (
                  <div key={habit.id} className="p-4 border border-zinc-100 dark:border-zinc-900 bg-zinc-50/10 dark:bg-zinc-900/5 rounded-2xl space-y-3">
                    
                    {/* Upper title bar of Habit Card */}
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <h4 className="text-xs font-bold text-zinc-800 dark:text-zinc-200 leading-tight">{habit.title}</h4>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">{habit.description}</p>
                      </div>

                      <div className="flex items-center gap-3 flex-shrink-0">
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 dark:bg-amber-950/20 text-amber-500 border border-amber-100 dark:border-amber-950">
                          <Flame className="w-4 h-4 fill-current" />
                          <span className="text-xs font-bold leading-none">{habit.streak} Streak</span>
                        </div>
                        <button
                          onClick={() => onDeleteHabit(habit.id)}
                          className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-500 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Progress log timeline */}
                    <div className="flex items-center justify-between bg-white dark:bg-zinc-950 p-3 rounded-2xl border border-zinc-100 dark:border-zinc-900/50">
                      <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                        <Calendar className="w-3.5 h-3.5" />
                        <span className="font-medium capitalize text-[10px]">{habit.frequency} tracking grid:</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {pastDays.map((dateStr) => {
                          const dateObj = new Date(dateStr);
                          const dayLetter = dateObj.toLocaleDateString('en-US', { weekday: 'narrow' });
                          const isToday = dateStr === today.toISOString().split('T')[0];
                          
                          // Check if checked in history
                          const matchLog = habit.history.find(l => l.date === dateStr);
                          const isChecked = matchLog ? matchLog.completed : false;

                          return (
                            <button
                              key={dateStr}
                              onClick={() => onToggleHabit(habit.id)}
                              className={`w-8 h-8 rounded-full border flex flex-col items-center justify-center cursor-pointer transition-all ${
                                isChecked
                                  ? 'bg-emerald-500 border-emerald-500 text-white shadow-sm shadow-emerald-500/10'
                                  : isToday
                                  ? 'border-indigo-500 text-indigo-500 font-bold bg-indigo-50/20 dark:bg-indigo-950/20'
                                  : 'border-zinc-200 dark:border-zinc-800 text-zinc-400 dark:text-zinc-600 hover:bg-zinc-50'
                              }`}
                              title={`${isChecked ? 'Logged' : 'Pending'} on ${dateStr}`}
                            >
                              <span className="text-[10px] font-bold block select-none leading-none mb-0.5">{dayLetter}</span>
                              {isChecked && <Check className="w-2.5 h-2.5 font-bold" />}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* AI Motivation block */}
                    {habit.aiSuggestion && (
                      <div className="p-3 bg-indigo-50/30 dark:bg-indigo-950/15 border border-indigo-100/50 dark:border-indigo-950 rounded-xl flex items-start gap-2 text-xs">
                        <Sparkles className="w-4 h-4 text-indigo-500 flex-shrink-0 mt-0.5 animate-pulse" />
                        <div className="space-y-0.5 leading-relaxed">
                          <span className="block text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">AI Coaching Tips</span>
                          <p className="text-zinc-600 dark:text-zinc-400 leading-normal text-[11px]">{habit.aiSuggestion}</p>
                        </div>
                      </div>
                    )}

                  </div>
                );
              })}
            </div>
          )}

        </div>
      </div>

    </div>
  );
}
