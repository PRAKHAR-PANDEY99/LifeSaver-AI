/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Task, TaskCategory, Priority, EnergyLevel } from '../types';
import { 
  Plus, 
  Trash2, 
  CheckSquare, 
  Square, 
  Sparkles, 
  AlertTriangle, 
  Clock, 
  Zap, 
  ChevronDown, 
  ChevronUp, 
  Lightbulb, 
  Tag, 
  Calendar,
  Layers,
  CheckCircle2
} from 'lucide-react';

interface TasksTabProps {
  tasks: Task[];
  onAddTask: (taskData: any) => Promise<void>;
  onUpdateTask: (id: string, updates: any) => Promise<void>;
  onDeleteTask: (id: string) => Promise<void>;
  onTriggerBreakdown: (id: string) => Promise<void>;
  onTriggerRiskCheck: (id: string) => Promise<void>;
}

const CATEGORIES: TaskCategory[] = ['Study', 'Work', 'Personal', 'Bills', 'Commitments'];

export default function TasksTab({
  tasks,
  onAddTask,
  onUpdateTask,
  onDeleteTask,
  onTriggerBreakdown,
  onTriggerRiskCheck
}: TasksTabProps) {
  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<TaskCategory>('Study');
  const [deadline, setDeadline] = useState('');
  const [priority, setPriority] = useState<Priority>('Medium');
  const [energyRequired, setEnergyRequired] = useState<EnergyLevel>('Medium');
  const [durationMinutes, setDurationMinutes] = useState(45);

  const [isAdding, setIsAdding] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filters
  const [activeFilter, setActiveFilter] = useState<'All' | 'Pending' | 'Completed' | 'Missed'>('All');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Expanded Task ID State
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);

  // Loadings
  const [loadingBreakdownId, setLoadingBreakdownId] = useState<string | null>(null);
  const [loadingRiskId, setLoadingRiskId] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !deadline) return;

    setIsSubmitting(true);
    try {
      await onAddTask({
        title,
        description,
        category,
        deadline: new Date(deadline).toISOString(),
        priority,
        energyRequired,
        durationMinutes: Number(durationMinutes),
        subtasks: []
      });
      // Reset
      setTitle('');
      setDescription('');
      setCategory('Study');
      setDeadline('');
      setPriority('Medium');
      setEnergyRequired('Medium');
      setDurationMinutes(45);
      setIsAdding(false);
    } catch (err) {
      console.error('Submit task failed', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleSubtask = async (taskId: string, subtaskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task || !task.subtasks) return;

    const updatedSubtasks = task.subtasks.map(s => 
      s.id === subtaskId ? { ...s, completed: !s.completed } : s
    );

    // If all subtasks completed, check if we should set task to completed
    const allCompleted = updatedSubtasks.every(s => s.completed);
    const newStatus = allCompleted ? 'Completed' : 'Pending';

    await onUpdateTask(taskId, {
      subtasks: updatedSubtasks,
      status: newStatus
    });
  };

  const handleRunBreakdown = async (id: string) => {
    setLoadingBreakdownId(id);
    try {
      await onTriggerBreakdown(id);
    } finally {
      setLoadingBreakdownId(null);
    }
  };

  const handleRunRisk = async (id: string) => {
    setLoadingRiskId(id);
    try {
      await onTriggerRiskCheck(id);
    } finally {
      setLoadingRiskId(null);
    }
  };

  // Filter logic
  const filteredTasks = tasks.filter(t => {
    const matchesFilter = 
      activeFilter === 'All' ? true :
      activeFilter === 'Pending' ? t.status === 'Pending' :
      activeFilter === 'Completed' ? t.status === 'Completed' :
      t.status === 'Missed';

    const matchesCategory = 
      selectedCategory === 'All' ? true :
      t.category === selectedCategory;

    return matchesFilter && matchesCategory;
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="tasks-tab">
      
      {/* Task Creation & Filters Panel */}
      <div className="space-y-6">
        
        {/* Quick Filters */}
        <div className="bg-white dark:bg-zinc-950 p-4 border border-zinc-200 dark:border-zinc-800 rounded-3xl space-y-3.5 shadow-sm">
          <div>
            <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block mb-1">Status Category</span>
            <div className="grid grid-cols-4 gap-1.5">
              {(['All', 'Pending', 'Completed', 'Missed'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setActiveFilter(f)}
                  className={`py-1.5 text-center text-xs font-semibold rounded-xl cursor-pointer transition-colors ${
                    activeFilter === f
                      ? 'bg-zinc-950 dark:bg-zinc-100 text-white dark:text-zinc-950'
                      : 'bg-zinc-50 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/60'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          <div>
            <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block mb-1">Subject / Category</span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full text-xs p-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 font-medium"
            >
              <option value="All">All Topics</option>
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Add Task Button or Form */}
        {!isAdding ? (
          <button
            onClick={() => setIsAdding(true)}
            className="w-full py-3 px-4 bg-zinc-900 dark:bg-zinc-100 hover:opacity-95 text-white dark:text-zinc-900 font-extrabold rounded-2xl cursor-pointer transition-all flex items-center justify-center gap-2 shadow-sm text-sm"
          >
            <Plus className="w-5 h-5" /> Add New Task
          </button>
        ) : (
          <div className="bg-white dark:bg-zinc-950 p-5 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Add New Task</h3>
            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-zinc-500 dark:text-zinc-400 mb-1 font-medium">Task Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Complete Dynamic Programming Lab"
                  className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 rounded-xl text-zinc-800 dark:text-zinc-200 outline-none"
                />
              </div>

              <div>
                <label className="block text-zinc-500 dark:text-zinc-400 mb-1 font-medium">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Review lecture materials and solve recursion exercises"
                  className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 rounded-xl text-zinc-800 dark:text-zinc-200 outline-none h-20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-500 dark:text-zinc-400 mb-1 font-medium">Topic Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as TaskCategory)}
                    className="w-full px-2.5 py-2 border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 rounded-xl text-zinc-800 dark:text-zinc-200"
                  >
                    {CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-zinc-500 dark:text-zinc-400 mb-1 font-medium">Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as Priority)}
                    className="w-full px-2.5 py-2 border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 rounded-xl text-zinc-800 dark:text-zinc-200"
                  >
                    <option value="High">High Priority</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-zinc-500 dark:text-zinc-400 mb-1 font-medium">Deadline Date & Time</label>
                <input
                  type="datetime-local"
                  required
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 rounded-xl text-zinc-800 dark:text-zinc-200 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-500 dark:text-zinc-400 mb-1 font-medium">Energy Needed</label>
                  <select
                    value={energyRequired}
                    onChange={(e) => setEnergyRequired(e.target.value as EnergyLevel)}
                    className="w-full px-2.5 py-2 border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 rounded-xl text-zinc-800 dark:text-zinc-200"
                  >
                    <option value="High">High Focus</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low Stress</option>
                  </select>
                </div>

                <div>
                  <label className="block text-zinc-500 dark:text-zinc-400 mb-1 font-medium">Duration (Mins)</label>
                  <input
                    type="number"
                    min="10"
                    max="480"
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(Number(e.target.value))}
                    className="w-full px-3 py-1.5 border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 rounded-xl text-zinc-800 dark:text-zinc-200 outline-none"
                  />
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
                    'Save Task'
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* Commitments List Workspace */}
      <div className="lg:col-span-2 space-y-4">
        <div className="bg-white dark:bg-zinc-950 p-5 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-sm min-h-[400px]">
          <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100 mb-4 flex items-center justify-between">
            <span>My Tasks ({filteredTasks.length})</span>
            <span className="text-xs text-zinc-400 font-medium">Filter: {activeFilter} ({selectedCategory})</span>
          </h2>

          {filteredTasks.length === 0 ? (
            <div className="text-center py-16 space-y-3">
              <Layers className="w-12 h-12 text-zinc-300 mx-auto" />
              <p className="text-sm font-semibold text-zinc-500 dark:text-zinc-400">No matching tasks found</p>
              <p className="text-xs text-zinc-400">Try adjusting your filters or create a new task.</p>
            </div>
          ) : (
            <div className="space-y-3.5">
              {filteredTasks.map((task) => {
                const isExpanded = expandedTaskId === task.id;
                
                // Calculate subtask progress
                const subCount = task.subtasks?.length || 0;
                const completedSubCount = task.subtasks?.filter(s => s.completed).length || 0;
                const subProgress = subCount > 0 ? Math.round((completedSubCount / subCount) * 100) : 0;

                return (
                  <div 
                    key={task.id} 
                    className={`border rounded-2xl transition-all duration-300 ${
                      isExpanded 
                        ? 'border-zinc-900 dark:border-zinc-100 bg-zinc-50/20 dark:bg-zinc-900/10' 
                        : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 hover:border-zinc-300 dark:hover:border-zinc-700'
                    }`}
                  >
                    
                    {/* Header bar of Task Card */}
                    <div 
                      className="p-4 flex items-start justify-between gap-4 cursor-pointer select-none"
                      onClick={() => setExpandedTaskId(isExpanded ? null : task.id)}
                    >
                      <div className="flex items-start gap-3">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onUpdateTask(task.id, { 
                              status: task.status === 'Completed' ? 'Pending' : 'Completed',
                              completedAt: task.status === 'Completed' ? undefined : new Date().toISOString()
                            });
                          }}
                          className="mt-0.5 text-zinc-400 hover:text-emerald-500 transition-colors cursor-pointer flex-shrink-0"
                        >
                          {task.status === 'Completed' ? (
                            <CheckSquare className="w-4.5 h-4.5 text-emerald-500" />
                          ) : (
                            <Square className="w-4.5 h-4.5" />
                          )}
                        </button>
                        
                        <div className="space-y-1 min-w-0">
                          <span className={`block font-bold text-xs ${task.status === 'Completed' ? 'line-through text-zinc-400 dark:text-zinc-600' : 'text-zinc-800 dark:text-zinc-200'}`}>
                            {task.title}
                          </span>
                          
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-[10px] px-2 py-0.5 font-bold rounded-md bg-zinc-100 dark:bg-zinc-900 text-zinc-500 flex items-center gap-1">
                              <Tag className="w-2.5 h-2.5" /> {task.category}
                            </span>
                            <span className={`text-[10px] px-2 py-0.5 font-bold rounded-md flex items-center gap-1 ${
                              task.priority === 'High' ? 'bg-rose-50 dark:bg-rose-950/20 text-rose-500' :
                              task.priority === 'Medium' ? 'bg-amber-50 dark:bg-amber-950/20 text-amber-500' :
                              'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-500'
                            }`}>
                              {task.priority} Priority
                            </span>
                            {subCount > 0 && (
                              <span className="text-[10px] font-medium text-zinc-400 dark:text-zinc-500">
                                {completedSubCount}/{subCount} subtasks ({subProgress}%)
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 flex-shrink-0">
                        <div className="text-right space-y-1">
                          <span className="text-[10px] text-zinc-400 dark:text-zinc-500 flex items-center gap-1 justify-end font-medium">
                            <Calendar className="w-3 h-3" /> Due {new Date(task.deadline).toLocaleDateString()}
                          </span>
                          {task.riskLevel && task.status === 'Pending' && (
                            <span className={`inline-block text-[9px] font-bold px-1.5 py-0.5 rounded-md ${
                              task.riskLevel === 'High' ? 'bg-rose-50 dark:bg-rose-950/20 text-rose-500 animate-pulse' :
                              task.riskLevel === 'Medium' ? 'bg-amber-50 dark:bg-amber-950/20 text-amber-500' :
                              'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-500'
                            }`}>
                              Risk: {task.riskLevel}
                            </span>
                          )}
                        </div>
                        {isExpanded ? <ChevronUp className="w-4 h-4 text-zinc-400" /> : <ChevronDown className="w-4 h-4 text-zinc-400" />}
                      </div>
                    </div>

                    {/* Expandable Workspace Area */}
                    {isExpanded && (
                      <div className="px-4 pb-4 border-t border-zinc-100 dark:border-zinc-900 pt-4 space-y-4 bg-zinc-50/20 dark:bg-zinc-900/10">
                        
                        {/* Task Description */}
                        {task.description && (
                          <div className="space-y-1">
                            <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block">Description</span>
                            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">{task.description}</p>
                          </div>
                        )}

                        {/* Explainable AI Risk Prediction */}
                        {task.status === 'Pending' && (
                          <div className="space-y-2">
                            <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider block flex items-center gap-1">
                              <Sparkles className="w-3.5 h-3.5 animate-pulse" /> AI Deadline Risk Check
                            </span>
                            {task.riskLevel ? (
                              <div className="p-3.5 rounded-2xl bg-indigo-50/30 dark:bg-indigo-950/10 border border-indigo-100 dark:border-indigo-950/50 space-y-2.5">
                                <div className="flex items-center gap-2">
                                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                                    task.riskLevel === 'High' ? 'bg-rose-500 text-white' :
                                    task.riskLevel === 'Medium' ? 'bg-amber-500 text-zinc-900' :
                                    'bg-emerald-500 text-white'
                                  }`}>
                                    {task.riskLevel} Risk
                                  </span>
                                  <span className="text-[10px] text-zinc-400 font-medium">Predicted likelihood of missing deadlines</span>
                                </div>
                                <p className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed">
                                  <strong>Why:</strong> {task.riskReason}
                                </p>
                                <div className="bg-white dark:bg-zinc-900 p-2.5 rounded-xl border border-indigo-100/50 dark:border-indigo-950 flex items-start gap-2">
                                  <Lightbulb className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                                  <div className="space-y-0.5">
                                    <span className="block text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">Suggested Recovery Action</span>
                                    <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">{task.suggestedAction}</p>
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <button
                                onClick={() => handleRunRisk(task.id)}
                                disabled={loadingRiskId === task.id}
                                className="w-full py-2 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/20 dark:hover:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 font-bold rounded-xl text-xs cursor-pointer transition-colors flex items-center justify-center gap-1"
                              >
                                {loadingRiskId === task.id ? (
                                  <div className="w-3.5 h-3.5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                                ) : (
                                  <>
                                    <Sparkles className="w-3.5 h-3.5" /> Check Deadline Risks with AI
                                  </>
                                )}
                              </button>
                            )}
                          </div>
                        )}

                        {/* Smart Task Breakdown Section */}
                        <div className="space-y-2.5">
                          <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block flex items-center gap-1 justify-between">
                            <span>AI Action Steps</span>
                            {subCount > 0 && <span className="text-[10px] text-emerald-500">{subProgress}% Complete</span>}
                          </span>
                          
                          {subCount > 0 ? (
                            <div className="space-y-1.5">
                              {task.subtasks?.map((sub) => (
                                <div 
                                  key={sub.id} 
                                  onClick={() => handleToggleSubtask(task.id, sub.id)}
                                  className="flex items-center justify-between p-2.5 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-900 rounded-xl hover:border-zinc-300 dark:hover:border-zinc-800 transition-colors cursor-pointer"
                                >
                                  <div className="flex items-center gap-2 min-w-0">
                                    <button className="text-zinc-400 hover:text-emerald-500 transition-colors cursor-pointer flex-shrink-0">
                                      {sub.completed ? (
                                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                      ) : (
                                        <div className="w-4 h-4 border border-zinc-300 dark:border-zinc-700 rounded-full" />
                                      )}
                                    </button>
                                    <span className={`text-xs min-w-0 truncate ${sub.completed ? 'line-through text-zinc-400 dark:text-zinc-600' : 'text-zinc-700 dark:text-zinc-300'}`}>
                                      {sub.title}
                                    </span>
                                  </div>
                                  <span className="text-[10px] font-semibold text-zinc-400 dark:text-zinc-500 flex items-center gap-0.5 flex-shrink-0 bg-zinc-50 dark:bg-zinc-900 px-2 py-0.5 rounded">
                                    <Clock className="w-2.5 h-2.5" /> {sub.durationMinutes}m
                                  </span>
                                </div>
                              ))}

                              {/* Trigger fresh breakdown trigger */}
                              <button
                                onClick={() => handleRunBreakdown(task.id)}
                                disabled={loadingBreakdownId === task.id}
                                className="w-full mt-2 py-1.5 text-center text-[11px] text-zinc-400 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl hover:border-zinc-400 cursor-pointer flex items-center justify-center gap-1.5"
                              >
                                {loadingBreakdownId === task.id ? (
                                  <div className="w-3.5 h-3.5 border-2 border-zinc-400 border-t-transparent rounded-full animate-spin" />
                                ) : (
                                  <>
                                    <Sparkles className="w-3 h-3 text-indigo-500 animate-pulse" /> Re-generate Action Steps with AI
                                  </>
                                )}
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => handleRunBreakdown(task.id)}
                              disabled={loadingBreakdownId === task.id}
                              className="w-full py-4 border border-dashed border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-2xl flex flex-col items-center justify-center gap-1 text-center cursor-pointer transition-colors hover:border-indigo-400/50"
                            >
                              {loadingBreakdownId === task.id ? (
                                <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mb-1" />
                              ) : (
                                <Sparkles className="w-5 h-5 text-indigo-500 mb-1 animate-pulse" />
                              )}
                              <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Generate AI Action Steps</span>
                              <span className="text-[10px] text-zinc-400">Break this task down into manageable, timed steps automatically</span>
                            </button>
                          )}
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center justify-between border-t border-zinc-100 dark:border-zinc-900 pt-3 text-[11px]">
                          <span className="text-zinc-400 flex items-center gap-1 font-medium">
                            <Zap className="w-3.5 h-3.5 text-amber-500" /> Focus level required: <strong>{task.energyRequired || 'Medium'}</strong>
                          </span>
                          <button
                            onClick={() => onDeleteTask(task.id)}
                            className="text-rose-600 hover:text-rose-500 font-semibold flex items-center gap-0.5 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Delete Task
                          </button>
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
