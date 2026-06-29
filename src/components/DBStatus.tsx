/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { Database, Cpu, HelpCircle, CheckCircle, AlertTriangle } from 'lucide-react';

interface DBStatusData {
  mode: 'MongoDB' | 'LocalDB';
  isMongo: boolean;
  hasGeminiKey: boolean;
}

export default function DBStatus() {
  const [status, setStatus] = useState<DBStatusData>({
    mode: 'LocalDB',
    isMongo: false,
    hasGeminiKey: false
  });
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    async function fetchStatus() {
      try {
        const res = await fetch('/api/db-status');
        if (res.ok) {
          const data = await res.json();
          setStatus(data);
        }
      } catch (e) {
        console.error('Failed to load DB status', e);
      }
    }
    fetchStatus();
    const interval = setInterval(fetchStatus, 15000); // Poll every 15s
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative inline-block z-40">
      <button
        onClick={() => setShowTooltip(!showTooltip)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all duration-200 bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-zinc-50 shadow-sm cursor-pointer"
        id="db-status-badge"
      >
        <span className="relative flex h-2 w-2 mr-0.5">
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${status.isMongo ? 'bg-emerald-400' : 'bg-amber-400'}`}></span>
          <span className={`relative inline-flex rounded-full h-2 w-2 ${status.isMongo ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
        </span>
        <span>{status.isMongo ? 'Cloud Synced' : 'Local Storage'}</span>
        <HelpCircle className="w-3.5 h-3.5 ml-0.5 opacity-60 text-zinc-400" />
      </button>

      {showTooltip && (
        <div className="absolute right-0 mt-2 p-4.5 w-80 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-800 dark:text-zinc-200 shadow-xl transition-all duration-200 z-50" id="db-status-tooltip">
          <h4 className="text-sm font-bold mb-2.5 flex items-center gap-1.5 border-b border-zinc-100 dark:border-zinc-900 pb-2">
            System & AI Status
          </h4>
          
          <div className="space-y-3.5 text-xs leading-relaxed">
            <div>
              <div className="flex items-center gap-1.5 font-bold mb-1">
                {status.isMongo ? (
                  <CheckCircle className="w-4 h-4 text-emerald-500" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                )}
                <span>Data Storage: {status.isMongo ? 'Secure Cloud Sync' : 'Local Sandbox Mode'}</span>
              </div>
              <p className="text-zinc-500 dark:text-zinc-400 text-[11px]">
                {status.isMongo 
                  ? 'Your progress is automatically saved to your cloud profile and accessible from any device.' 
                  : 'Your tasks and habits are saved locally in your current browser session. To sync to a database, add your database credentials.'}
              </p>
            </div>

            <div>
              <div className="flex items-center gap-1.5 font-bold mb-1">
                {status.hasGeminiKey ? (
                  <CheckCircle className="w-4 h-4 text-emerald-500" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                )}
                <span>AI Smart Features: {status.hasGeminiKey ? 'Gemini AI Active' : 'Offline Smart Assist'}</span>
              </div>
              <p className="text-zinc-500 dark:text-zinc-400 text-[11px]">
                {status.hasGeminiKey 
                  ? 'Gemini AI is actively helping you plan your day, analyze deadline risks, and structure tasks.' 
                  : 'Using offline rule-engines. For deeper AI-generated recommendations and active voice parsing, set up your Gemini API Key.'}
              </p>
            </div>
          </div>
          
          <button 
            onClick={() => setShowTooltip(false)}
            className="mt-3.5 w-full py-2 text-center font-bold bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-xl text-xs cursor-pointer transition-colors text-zinc-800 dark:text-zinc-200"
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
}
