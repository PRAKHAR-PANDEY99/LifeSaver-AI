/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  joinedAt: string;
  preferences?: {
    dailyGoalCount: number;
    peakEnergyTime: 'morning' | 'afternoon' | 'evening';
  };
}

export interface SubTask {
  id: string;
  title: string;
  completed: boolean;
  durationMinutes: number;
}

export type Priority = 'High' | 'Medium' | 'Low';
export type TaskCategory = 'Work' | 'Study' | 'Personal' | 'Bills' | 'Commitments' | 'Emergency';
export type TaskStatus = 'Pending' | 'Completed' | 'Missed';
export type EnergyLevel = 'High' | 'Medium' | 'Low';
export type RiskLevel = 'Low' | 'Medium' | 'High';

export interface Task {
  id: string;
  userId: string;
  title: string;
  description: string;
  category: TaskCategory;
  deadline: string; // ISO String
  priority: Priority;
  status: TaskStatus;
  
  // AI Enhanced Fields
  riskLevel?: RiskLevel;
  riskReason?: string;
  suggestedAction?: string;
  
  energyRequired?: EnergyLevel;
  scheduledTime?: string; // ISO string of actual scheduled block
  durationMinutes?: number;
  whySuggested?: string;
  
  subtasks?: SubTask[];
  
  completedAt?: string;
  overdueReplanned?: boolean;
}

export interface HabitLog {
  date: string; // YYYY-MM-DD
  completed: boolean;
}

export interface Habit {
  id: string;
  userId: string;
  title: string;
  description: string;
  frequency: 'daily' | 'weekly';
  streak: number;
  maxStreak: number;
  history: HabitLog[];
  createdAt: string;
  aiSuggestion?: string;
}

export interface DailyScheduleBlock {
  id?: string;
  time: string; // e.g. "09:00"
  durationMinutes: number;
  taskTitle: string;
  taskId?: string;
  category: TaskCategory;
  energyLevelRequired: EnergyLevel;
  status: 'Pending' | 'Completed' | 'Missed';
}

export interface DailySchedule {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD
  energyLevel: EnergyLevel;
  blocks: DailyScheduleBlock[];
  aiOverview?: string;
  isEmergencyMode?: boolean;
}

export interface ProductivityHistoryLog {
  userId?: string;
  date: string; // YYYY-MM-DD
  score: number; // 0-100
  tasksCompleted: number;
  tasksMissed: number;
  habitsCompleted: number;
}

export interface WeeklyReview {
  id: string;
  userId: string;
  weekStartDate: string; // YYYY-MM-DD
  completedCount: number;
  missedCount: number;
  completionRate: number; // percentage
  topCategory: TaskCategory;
  productivityScore: number;
  procrastinationTriggers: string[];
  peakProductiveHours: string;
  recommendations: string[];
  detailedAnalysis: string;
}

export interface AIRecommendation {
  id: string;
  type: 'risk' | 'replan' | 'energy' | 'goal' | 'general';
  title: string;
  message: string;
  actionLabel?: string;
  actionPayload?: any; // For triggering specific UI state or action
}
