import React, { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import type { InterviewLanguage } from '@/types';
import type { ExecutionResult } from '@/services/openSourceService';
import { Sun, Moon, Play, Terminal, X, Loader2, CheckCircle2, AlertTriangle, Clock } from 'lucide-react';

interface CodeEditorProps {
  code: string;
  onChange: (code: string) => void;
  language: InterviewLanguage;
  onLanguageChange: (lang: InterviewLanguage) => void;
  theme: 'light' | 'dark';
  onThemeToggle: () => void;
  onRunCode?: () => void;
  isExecuting?: boolean;
  executionResult?: ExecutionResult | null;
  isTerminalOpen?: boolean;
  setIsTerminalOpen?: (open: boolean) => void;
  className?: string;
}

export interface CodeEditorHandle {
  captureFrame: () => Promise<string | null>;
}

const LANGUAGE_OPTIONS: { id: InterviewLanguage; label: string; ext: string }[] = [
  { id: 'python', label: 'Python 3', ext: '.py' },
  { id: 'javascript', label: 'JavaScript (Node.js)', ext: '.js' },
  { id: 'typescript', label: 'TypeScript', ext: '.ts' },
  { id: 'cpp', label: 'C++ (g++)', ext: '.cpp' },
  { id: 'java', label: 'Java (JDK 21)', ext: '.java' },
  { id: 'csharp', label: 'C# (.NET 8)', ext: '.cs' },
  { id: 'go', label: 'Go (golang)', ext: '.go' },
  { id: 'rust', label: 'Rust (rustc)', ext: '.rs' },
  { id: 'sql', label: 'SQL (SQLite DB)', ext: '.sql' },
  { id: 'c', label: 'C (gcc)', ext: '.c' },
];

const CodeEditor = forwardRef<CodeEditorHandle, CodeEditorProps>(({ 
  code, 
  onChange, 
  language, 
  onLanguageChange,
  theme,
  onThemeToggle,
  onRunCode,
  isExecuting = false,
  executionResult = null,
  isTerminalOpen = false,
  setIsTerminalOpen,
  className 
}, ref) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Sync scrolling between textarea and line numbers
  const handleScroll = () => {
    if (textareaRef.current && lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  };

  // Keyboard shortcut Ctrl+Enter / Cmd+Enter to run code
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      if (onRunCode) onRunCode();
    }
  };

  // Expose a method to capture the editor as an image
  useImperativeHandle(ref, () => ({
    captureFrame: async () => {
      const canvas = canvasRef.current;
      if (!canvas) return null;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) return null;

      ctx.fillStyle = '#09090b'; 
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = '#e4e4e7';
      ctx.font = '14px "JetBrains Mono"';
      ctx.textBaseline = 'top';
      
      const lines = code.split('\n');
      const lineHeight = 24;
      let y = 20;

      lines.forEach((line, index) => {
        ctx.fillStyle = '#52525b';
        ctx.fillText((index + 1).toString(), 5, y);
        
        ctx.fillStyle = '#e4e4e7';
        const cleanLine = line.length > 80 ? line.substring(0, 77) + '...' : line;
        ctx.fillText(cleanLine, 40, y);
        y += lineHeight;
      });

      return canvas.toDataURL('image/jpeg', 0.8).split(',')[1];
    }
  }));

  useEffect(() => {
    if (canvasRef.current) {
        canvasRef.current.width = 800;
        canvasRef.current.height = 600;
    }
  }, []);

  const lineCount = code.split('\n').length;

  return (
    <div className={`relative w-full h-full flex flex-col bg-sky-50 transition-colors duration-300 ${className}`}>
      {/* Hidden canvas for AI vision */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Main Editor Area */}
      <div className="flex-1 flex overflow-hidden relative">
        
        {/* Line Numbers Column */}
        <div 
            ref={lineNumbersRef}
            className="w-12 pt-4 pb-4 text-right pr-3 bg-sky-100/70 border-r border-sky-200 text-sky-700 font-mono text-sm leading-6 select-none overflow-hidden"
            style={{ fontFamily: '"JetBrains Mono", monospace', lineHeight: '1.5rem' }}
        >
            {Array.from({ length: Math.max(lineCount, 1) }).map((_, i) => (
                <div key={i}>{i + 1}</div>
            ))}
        </div>

        {/* Code Textarea */}
        <textarea
          ref={textareaRef}
          value={code}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onScroll={handleScroll}
          className="flex-1 w-full h-full bg-white text-sky-950 font-mono text-sm leading-6 p-4 resize-none focus:outline-none placeholder-sky-400 selection:bg-sky-200 selection:text-sky-950 whitespace-pre transition-colors duration-300 font-medium"
          style={{ fontFamily: '"JetBrains Mono", monospace', lineHeight: '1.5rem', tabSize: 4 }}
          spellCheck={false}
          autoCapitalize="off"
          autoComplete="off"
          autoCorrect="off"
          placeholder={`// Write your ${language} solution here...\n// Press Ctrl+Enter to compile & run.`}
        />
      </div>

      {/* Output Terminal Pane */}
      {isTerminalOpen && (
        <div className="h-48 border-t border-sky-800 bg-sky-950 text-white flex flex-col shadow-2xl transition-all duration-300">
          {/* Terminal Header */}
          <div className="h-9 px-4 bg-sky-900 border-b border-sky-800 flex items-center justify-between text-xs select-none">
            <div className="flex items-center gap-2">
              <Terminal className="w-3.5 h-3.5 text-sky-400" />
              <span className="font-bold text-sky-100">Execution Terminal</span>
              
              {isExecuting ? (
                <span className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-sky-500/20 text-sky-200 text-[10px] font-bold border border-sky-400/40">
                  <Loader2 className="w-3 h-3 animate-spin text-sky-300" /> Compiling & Running...
                </span>
              ) : executionResult ? (
                <span className={`flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold border ${
                  executionResult.status === 'success' 
                    ? 'bg-sky-500/20 text-sky-200 border-sky-400/50'
                    : 'bg-sky-700/40 text-sky-100 border-sky-500/50'
                }`}>
                  {executionResult.status === 'success' ? (
                    <CheckCircle2 className="w-3 h-3 text-sky-300" />
                  ) : (
                    <AlertTriangle className="w-3 h-3 text-sky-300" />
                  )}
                  {executionResult.status === 'success' ? 'Success' : executionResult.status.toUpperCase()}
                  <span className="opacity-80 flex items-center gap-1 ml-1 border-l border-sky-400/30 pl-1.5">
                    <Clock className="w-2.5 h-2.5" /> {executionResult.execution_time_ms}ms
                  </span>
                </span>
              ) : null}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsTerminalOpen?.(false)}
                className="p-1 hover:bg-sky-800 rounded text-sky-300 hover:text-white transition-colors"
                title="Close Output Terminal"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Terminal Body */}
          <div className="flex-1 p-4 font-mono text-xs leading-relaxed overflow-y-auto bg-sky-950 select-text">
            {isExecuting ? (
              <div className="flex items-center gap-2 text-sky-300 italic">
                <Loader2 className="w-4 h-4 animate-spin text-sky-400" />
                Executing {language} program...
              </div>
            ) : executionResult ? (
              <div className="space-y-2">
                {executionResult.output && (
                  <div className="whitespace-pre-wrap text-sky-100 font-mono">
                    {executionResult.output}
                  </div>
                )}
                {executionResult.error && (
                  <div className="whitespace-pre-wrap text-sky-100 font-mono bg-sky-900/60 p-2.5 rounded border border-sky-700">
                    {executionResult.error}
                  </div>
                )}
                {!executionResult.output && !executionResult.error && (
                  <div className="text-sky-300 italic">Program exited cleanly (No stdout output).</div>
                )}
              </div>
            ) : (
              <div className="text-sky-300 italic">Press "Run Code" or Ctrl+Enter to compile and run your solution.</div>
            )}
          </div>
        </div>
      )}

      {/* Status Bar & Controls */}
      <div className="h-11 border-t border-sky-200 bg-sky-100/90 flex items-center justify-between px-4 sm:px-6 text-xs font-semibold text-sky-950 select-none transition-colors duration-300 shrink-0">
        
        {/* Left: Stats & Terminal Toggle */}
        <div className="flex items-center gap-4 tracking-wide">
          <span className="text-sky-700 text-xs font-bold">UTF-8</span>
          <span className="text-sky-700 text-xs font-bold">{code.length} chars</span>
          
          <button
            onClick={() => setIsTerminalOpen?.(!isTerminalOpen)}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold transition-all border shadow-sm ${
              isTerminalOpen
                ? 'bg-sky-600 text-white border-sky-500 shadow-sky-600/20'
                : 'bg-white hover:bg-sky-50 text-sky-900 border-sky-300'
            }`}
          >
            <Terminal className="w-3.5 h-3.5 text-current" />
            <span>Terminal {isTerminalOpen ? 'ON' : 'OFF'}</span>
          </button>
        </div>

        {/* Right: Controls & Multi-Language Selector */}
        <div className="flex items-center gap-3">
          {/* Run Code Button */}
          {onRunCode && (
            <button
              onClick={onRunCode}
              disabled={isExecuting}
              className="flex items-center gap-1.5 px-4 py-1 rounded-md bg-sky-600 hover:bg-sky-700 active:bg-sky-800 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md border border-sky-500 disabled:opacity-50"
              title="Run Code (Ctrl + Enter)"
            >
              {isExecuting ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Play className="w-3.5 h-3.5 fill-current" />
              )}
              <span>{isExecuting ? 'Compiling...' : 'Run Code'}</span>
            </button>
          )}

          {/* Multi-Language Dropdown Selector */}
          <div className="flex items-center gap-1.5 bg-white border border-sky-300 px-2.5 py-1 rounded-md shadow-sm">
            <span className="text-[10px] text-sky-700 font-extrabold uppercase tracking-wider">Language:</span>
            <select
              value={language}
              onChange={(e) => onLanguageChange(e.target.value as InterviewLanguage)}
              className="bg-transparent text-sky-950 text-xs font-bold focus:outline-none cursor-pointer"
            >
              {LANGUAGE_OPTIONS.map((opt) => (
                <option key={opt.id} value={opt.id} className="bg-white text-sky-950 font-semibold">
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
});

export default CodeEditor;