/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Play, Send, Sparkles, Volume2, HelpCircle } from 'lucide-react';

interface VoiceInputProps {
  onParsedTask: (task: {
    title: string;
    description: string;
    category: string;
    priority: string;
    durationMinutes: number;
    energyRequired: string;
  }) => void;
  userId?: string;
}

const PRESET_COMMANDS = [
  "I have an exam tomorrow morning",
  "Pay the electricity bill and complete Algorithms assignment",
  "Prepare presentation slide deck for project showcase before 5 PM",
  "Review dynamic programming flashcards for 20 minutes tonight"
];

export default function VoiceInput({ onParsedTask, userId }: VoiceInputProps) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [supportSpeech, setSupportSpeech] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Check Web Speech API support
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      setSupportSpeech(true);
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = 'en-US';

      rec.onstart = () => {
        setIsListening(true);
        setError(null);
      };

      rec.onresult = (event: any) => {
        const text = event.results[0][0].transcript;
        setTranscript(text);
      };

      rec.onerror = (event: any) => {
        console.error('Speech recognition error', event.error);
        if (event.error === 'not-allowed') {
          setError('Microphone permission blocked in iframe. Use presets or type below!');
        } else {
          setError(`Speech Error: ${event.error}`);
        }
        setIsListening(false);
      };

      rec.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = rec;
    }
  }, []);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      setTranscript('');
      setError(null);
      try {
        recognitionRef.current?.start();
      } catch (e) {
        setError('Could not access microphone. Try preset commands below!');
      }
    }
  };

  const processText = async (textToProcess: string) => {
    if (!textToProcess.trim()) return;
    setIsProcessing(true);
    setError(null);

    try {
      const res = await fetch('/api/voice-command', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: textToProcess, userId: userId || 'default_user' })
      });

      if (!res.ok) throw new Error('Failed to parse command.');

      const data = await res.json();
      if (data.parsedTask) {
        onParsedTask(data.parsedTask);
        setTranscript('');
      }
    } catch (e: any) {
      setError(e.message || 'Error processing AI command.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm" id="voice-assistant">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-rose-50 dark:bg-rose-950/30 rounded-lg text-rose-500">
            <Volume2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Voice & Smart Task Creator</h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">Speak or select a command below. Our AI will automatically extract a structured task.</p>
          </div>
        </div>
        <span className="flex items-center gap-1 text-[10px] bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 font-medium px-2 py-0.5 rounded-full">
          <Sparkles className="w-2.5 h-2.5" /> Gemini Powered
        </span>
      </div>

      <div className="flex flex-col gap-3">
        {/* Visualizer & Mic Area */}
        <div className="flex items-center gap-4 bg-zinc-50 dark:bg-zinc-900/40 p-3 rounded-xl border border-zinc-100 dark:border-zinc-900">
          <button
            onClick={toggleListening}
            className={`p-3.5 rounded-full flex-shrink-0 cursor-pointer transition-all duration-300 ${
              isListening
                ? 'bg-rose-500 text-white animate-pulse shadow-md shadow-rose-500/20'
                : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-300 dark:hover:bg-zinc-700'
            }`}
            title={supportSpeech ? 'Speak Command' : 'Microphone Not Supported'}
          >
            {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          <div className="flex-grow min-w-0">
            {isListening ? (
              <div className="flex flex-col">
                <span className="text-xs font-medium text-rose-500 animate-pulse">Listening to your voice...</span>
                <div className="flex items-center gap-1.5 mt-1.5">
                  <span className="w-1 h-3 bg-rose-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
                  <span className="w-1 h-5 bg-rose-500 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }} />
                  <span className="w-1 h-4 bg-rose-500 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }} />
                  <span className="w-1 h-2 bg-rose-500 rounded-full animate-bounce" style={{ animationDelay: '0.45s' }} />
                </div>
              </div>
            ) : (
              <input
                type="text"
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                placeholder={supportSpeech ? "Microphone active. Or type command here..." : "Type a verbal command here..."}
                className="w-full bg-transparent text-xs text-zinc-800 dark:text-zinc-200 outline-none"
                onKeyDown={(e) => e.key === 'Enter' && processText(transcript)}
              />
            )}
          </div>

          <button
            disabled={isProcessing || !transcript.trim()}
            onClick={() => processText(transcript)}
            className="p-2.5 bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 disabled:opacity-40 rounded-xl cursor-pointer transition-colors"
          >
            {isProcessing ? (
              <div className="w-4 h-4 border-2 border-zinc-500 border-t-transparent rounded-full animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </div>

        {error && (
          <p className="text-[11px] text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/20 px-3 py-1.5 rounded-lg font-medium">
            {error}
          </p>
        )}

        {/* Preset commands */}
        <div>
          <span className="text-[10px] font-bold tracking-wider text-zinc-400 dark:text-zinc-500 uppercase flex items-center gap-1 mb-2">
            Try Suggested Commands <HelpCircle className="w-3 h-3 opacity-60" />
          </span>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {PRESET_COMMANDS.map((cmd, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setTranscript(cmd);
                  processText(cmd);
                }}
                disabled={isProcessing}
                className="text-left text-xs p-2.5 bg-zinc-50 hover:bg-indigo-50/50 dark:bg-zinc-900/20 dark:hover:bg-zinc-900/60 text-zinc-600 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 border border-zinc-100 dark:border-zinc-900 rounded-xl cursor-pointer transition-all duration-200 flex items-start gap-2 group"
              >
                <Play className="w-3 h-3 mt-0.5 text-zinc-400 group-hover:text-indigo-500 flex-shrink-0" />
                <span className="line-clamp-2">{cmd}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
