/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { WeeklyReview, ProductivityHistoryLog } from '../types';
import { 
  Award, 
  TrendingUp, 
  Clock, 
  Sparkles, 
  HelpCircle, 
  BookOpen, 
  ChevronRight, 
  Zap, 
  Activity,
  AlertTriangle
} from 'lucide-react';

interface ReviewsTabProps {
  reviews: WeeklyReview[];
  historyLogs: ProductivityHistoryLog[];
  onTriggerReview: () => Promise<void>;
}

export default function ReviewsTab({
  reviews,
  historyLogs,
  onTriggerReview
}: ReviewsTabProps) {
  
  const [isGenerating, setIsGenerating] = useState(false);
  const activeReview = reviews[0]; // Take most recent review

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      await onTriggerReview();
    } finally {
      setIsGenerating(false);
    }
  };

  // SVG Chart Dimensions & Computations
  const width = 500;
  const height = 180;
  const padding = 30;
  
  // Safe default logs if empty
  const logs = historyLogs.length > 0 ? historyLogs : [
    { date: 'Mon', score: 65, tasksCompleted: 2, tasksMissed: 0, habitsCompleted: 1 },
    { date: 'Tue', score: 72, tasksCompleted: 3, tasksMissed: 1, habitsCompleted: 1 },
    { date: 'Wed', score: 85, tasksCompleted: 4, tasksMissed: 0, habitsCompleted: 2 },
    { date: 'Thu', score: 78, tasksCompleted: 3, tasksMissed: 0, habitsCompleted: 1 },
    { date: 'Fri', score: 90, tasksCompleted: 5, tasksMissed: 0, habitsCompleted: 2 }
  ];

  const maxScore = 100;
  const minScore = 0;

  // Convert logs into SVG coordinate points
  const points = logs.map((log, index) => {
    const x = padding + (index * (width - padding * 2)) / (logs.length - 1);
    const y = height - padding - (log.score * (height - padding * 2)) / 100;
    return { x, y, score: log.score, label: log.date.substring(5) || log.date };
  });

  const pathD = points.length > 0 
    ? `M ${points[0].x} ${points[0].y} ` + points.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ') 
    : '';

  const areaD = points.length > 0
    ? `${pathD} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`
    : '';

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="reviews-tab">
      
      {/* Historical Performance custom SVG Chart */}
      <div className="lg:col-span-1 space-y-6">
        
        {/* Dynamic score dashboard */}
        <div className="bg-white dark:bg-zinc-950 p-5 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-sm space-y-4">
          <div>
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Productivity Analytics</h3>
            <p className="text-xs text-zinc-400">Your daily progress score</p>
          </div>

          {/* Render customized high-contrast SVG Chart */}
          <div className="relative pt-2">
            <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible">
              
              {/* Horizontal grid lines */}
              {[25, 50, 75, 100].map(val => {
                const y = height - padding - (val * (height - padding * 2)) / 100;
                return (
                  <g key={val}>
                    <line 
                      x1={padding} 
                      y1={y} 
                      x2={width - padding} 
                      y2={y} 
                      stroke="rgba(120,120,120,0.06)" 
                      strokeDasharray="4 4"
                    />
                    <text 
                      x={padding - 10} 
                      y={y + 3} 
                      fontSize="9" 
                      className="fill-zinc-400 font-medium text-right"
                      textAnchor="end"
                    >
                      {val}%
                    </text>
                  </g>
                );
              })}

              {/* Shaded Area fill under graph */}
              <path 
                d={areaD} 
                className="fill-indigo-50/20 dark:fill-indigo-950/10 transition-all duration-500"
              />

              {/* Core Line path */}
              <path 
                d={pathD} 
                fill="none" 
                stroke="#6366f1" 
                strokeWidth="3" 
                strokeLinecap="round" 
                className="transition-all duration-500"
              />

              {/* Score nodes */}
              {points.map((p, idx) => (
                <g key={idx} className="group cursor-pointer">
                  <circle 
                    cx={p.x} 
                    cy={p.y} 
                    r="4.5" 
                    className="fill-indigo-600 stroke-white dark:stroke-zinc-950 stroke-2 hover:r-6 transition-all"
                  />
                  {/* Tooltip on node hover */}
                  <text 
                    x={p.x} 
                    y={p.y - 12} 
                    fontSize="9" 
                    fontWeight="bold"
                    className="fill-indigo-600 text-center opacity-0 group-hover:opacity-100 transition-opacity bg-zinc-900"
                    textAnchor="middle"
                  >
                    {p.score}
                  </text>
                  <text 
                    x={p.x} 
                    y={height - padding + 15} 
                    fontSize="9" 
                    className="fill-zinc-400 font-medium"
                    textAnchor="middle"
                  >
                    {p.label}
                  </text>
                </g>
              ))}
            </svg>
          </div>

          <div className="flex justify-between items-center text-[10px] bg-zinc-50 dark:bg-zinc-900/40 p-3 rounded-2xl border border-zinc-100 dark:border-zinc-900 mt-2">
            <span className="text-zinc-500 flex items-center gap-1">
              <Activity className="w-3.5 h-3.5 text-emerald-500" /> Complete score history synced
            </span>
            <span className="font-bold text-indigo-600 dark:text-indigo-400 uppercase">Interactive Log</span>
          </div>
        </div>

        {/* Generate review trigger card */}
        <div className="bg-white dark:bg-zinc-950 p-5 border border-zinc-200 dark:border-zinc-800 rounded-3xl space-y-4 shadow-sm">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-indigo-500" />
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Weekly AI Insights</h3>
          </div>
          
          <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
            Our AI studies your task history to see when you work best, what causes delays, and how to build consistent focus habits.
          </p>

          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="w-full py-2.5 px-4 bg-zinc-950 dark:bg-zinc-100 text-white dark:text-zinc-900 font-bold text-xs rounded-xl hover:opacity-95 transition-all cursor-pointer flex items-center justify-center gap-1.5"
          >
            {isGenerating ? (
              <div className="w-3.5 h-3.5 border-2 border-zinc-500 border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-emerald-400" /> Generate Weekly Review
              </>
            )}
          </button>
        </div>

      </div>

      {/* Weekly review dossier (2/3 size) */}
      <div className="lg:col-span-2 space-y-4">
        <div className="bg-white dark:bg-zinc-950 p-5 md:p-6 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-sm min-h-[450px] space-y-5">
          
          {activeReview ? (
            <div className="space-y-6">
              
              {/* Review metrics header bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-100 dark:border-zinc-900 pb-4">
                <div className="space-y-0.5">
                  <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                    <Award className="w-5 h-5 text-indigo-500" /> My Weekly AI Review
                  </h2>
                  <p className="text-xs text-zinc-400">Week of {new Date(activeReview.weekStartDate).toLocaleDateString()}</p>
                </div>

                <div className="flex items-center gap-4 bg-zinc-50 dark:bg-zinc-900/30 px-4 py-2.5 rounded-2xl border border-zinc-100 dark:border-zinc-900">
                  <div className="text-center border-r border-zinc-200 dark:border-zinc-800 pr-4">
                    <span className="block text-[9px] text-zinc-400 font-bold uppercase tracking-wider">Completed</span>
                    <span className="text-sm font-bold text-emerald-500">{activeReview.completedCount}</span>
                  </div>
                  <div className="text-center pr-4 border-r border-zinc-200 dark:border-zinc-800">
                    <span className="block text-[9px] text-zinc-400 font-bold uppercase tracking-wider">Missed</span>
                    <span className="text-sm font-bold text-rose-500">{activeReview.missedCount}</span>
                  </div>
                  <div className="text-center">
                    <span className="block text-[9px] text-zinc-400 font-bold uppercase tracking-wider">Score</span>
                    <span className="text-sm font-bold text-indigo-500">{activeReview.productivityScore}%</span>
                  </div>
                </div>
              </div>

              {/* Detailed Narrative analysis */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block">Weekly Summary & Insights</span>
                <p className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed font-normal bg-zinc-50/30 dark:bg-zinc-900/5 p-4 rounded-2xl border border-zinc-100 dark:border-zinc-900">
                  {activeReview.detailedAnalysis}
                </p>
              </div>

              {/* Triggers & Procrastination Mapping */}
              <div className="space-y-3.5">
                <span className="text-[10px] font-bold text-rose-500 bg-rose-50 dark:bg-rose-950/20 px-2 py-0.5 rounded-md uppercase tracking-wider inline-block">Focus Obstacles & Procrastination Triggers</span>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {activeReview.procrastinationTriggers.map((trig, idx) => (
                    <div key={idx} className="p-3 bg-rose-50/10 dark:bg-rose-950/5 border border-rose-100/50 dark:border-rose-950/20 rounded-xl flex items-start gap-2 text-xs">
                      <AlertTriangle className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" />
                      <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">{trig}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actionable recommendations */}
              <div className="space-y-3">
                <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider block flex items-center gap-1">
                  <Sparkles className="w-4 h-4 text-indigo-500 animate-pulse" /> AI Action Recommendations
                </span>
                
                <div className="space-y-2.5">
                  {activeReview.recommendations.map((rec, idx) => (
                    <div key={idx} className="p-3 bg-indigo-50/20 dark:bg-indigo-950/10 border border-indigo-100/30 dark:border-indigo-950/40 rounded-xl flex items-start gap-2 text-xs">
                      <Zap className="w-4 h-4 text-indigo-500 flex-shrink-0 mt-0.5 fill-current" />
                      <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed font-medium">{rec}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Productivity Stats Summary */}
              <div className="grid grid-cols-2 gap-4 border-t border-zinc-100 dark:border-zinc-900 pt-4 text-xs">
                <div>
                  <span className="text-zinc-400 block mb-0.5">Your Peak Focus Time:</span>
                  <span className="font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-emerald-500" /> {activeReview.peakProductiveHours}
                  </span>
                </div>
                <div>
                  <span className="text-zinc-400 block mb-0.5">Most Active Category:</span>
                  <span className="font-bold text-zinc-800 dark:text-zinc-200">
                    {activeReview.topCategory}
                  </span>
                </div>
              </div>

            </div>
          ) : (
            <div className="text-center py-24 space-y-4">
              <Award className="w-16 h-16 text-zinc-300 mx-auto" />
              <div className="space-y-1">
                <p className="text-sm font-semibold text-zinc-500 dark:text-zinc-400">No Weekly Review Generated Yet</p>
                <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                  Click "Generate Weekly Review" to analyze your progress, find focus blocks, and get personalized recommendations.
                </p>
              </div>
            </div>
          )}

        </div>
      </div>

    </div>
  );
}
