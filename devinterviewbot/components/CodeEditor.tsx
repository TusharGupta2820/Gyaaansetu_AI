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
    <div className={`relative w-full h-full flex flex-col bg-app transition-colors duration-300 ${className}`}>
      {/* Hidden canvas for AI vision */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Main Editor Area */}
      <div className="flex-1 flex overflow-hidden relative">
        
        {/* Line Numbers Column */}
        <div 
            ref={lineNumbersRef}
            className="w-12 pt-4 pb-4 text-right pr-3 bg-app border-r border-subtle text-secondary font-mono text-sm leading-6 select-none overflow-hidden"
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
          className="flex-1 w-full h-full bg-transparent text-primary font-mono text-sm leading-6 p-4 resize-none focus:outline-none placeholder-secondary/50 selection:bg-subtle selection:text-primary whitespace-pre transition-colors duration-300"
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
        <div className="h-48 border-t border-subtle bg-slate-950 text-slate-100 flex flex-col shadow-2xl transition-all duration-300">
          {/* Terminal Header */}
          <div className="h-9 px-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-xs select-none">
            <div className="flex items-center gap-2">
              <Terminal className="w-3.5 h-3.5 text-emerald-400" />
              <span className="font-semibold text-slate-200">Execution Terminal</span>
              
              {isExecuting ? (
                <span className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 text-[10px] font-medium border border-blue-500/30">
                  <Loader2 className="w-3 h-3 animate-spin" /> Compiling & Running...
                </span>
              ) : executionResult ? (
                <span className={`flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-medium border ${
                  executionResult.status === 'success' 
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                    : 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                }`}>
                  {executionResult.status === 'success' ? (
                    <CheckCircle2 className="w-3 h-3" />
                  ) : (
                    <AlertTriangle className="w-3 h-3" />
                  )}
                  {executionResult.status === 'success' ? 'Success' : executionResult.status.toUpperCase()}
                  <span className="opacity-75 flex items-center gap-1 ml-1 border-l border-current pl-1.5">
                    <Clock className="w-2.5 h-2.5" /> {executionResult.execution_time_ms}ms
                  </span>
                </span>
              ) : null}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsTerminalOpen?.(false)}
                className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-slate-200 transition-colors"
                title="Close Output Terminal"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Terminal Body */}
          <div className="flex-1 p-4 font-mono text-xs leading-relaxed overflow-y-auto bg-slate-950/90 select-text">
            {isExecuting ? (
              <div className="flex items-center gap-2 text-slate-400 italic">
                <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
                Executing {language} program...
              </div>
            ) : executionResult ? (
              <div className="space-y-2">
                {executionResult.output && (
                  <div className="whitespace-pre-wrap text-emerald-300 font-mono">
                    {executionResult.output}
                  </div>
                )}
                {executionResult.error && (
                  <div className="whitespace-pre-wrap text-rose-400 font-mono bg-rose-950/30 p-2.5 rounded border border-rose-900/50">
                    {executionResult.error}
                  </div>
                )}
                {!executionResult.output && !executionResult.error && (
                  <div className="text-slate-500 italic">Program exited with code 0 (No stdout output).</div>
                )}
              </div>
            ) : (
              <div className="text-slate-500 italic">Press "Run Code" or Ctrl+Enter to compile and run your solution.</div>
            )}
          </div>
        </div>
      )}

      {/* Status Bar & Controls */}
      <div className="h-11 border-t border-subtle bg-app flex items-center justify-between px-4 sm:px-6 text-[11px] font-medium text-secondary select-none transition-colors duration-300 shrink-0">
        
        {/* Left: Stats & Terminal Toggle */}
        <div className="flex items-center gap-4 tracking-wide">
          <span>UTF-8</span>
          <span>{code.length} chars</span>
          
          <button
            onClick={() => setIsTerminalOpen?.(!isTerminalOpen)}
            className={`flex items-center gap-1.5 px-2 py-1 rounded text-xs transition-colors border ${
              isTerminalOpen
                ? 'bg-subtle/50 text-primary border-subtle'
                : 'text-secondary border-transparent hover:text-primary hover:bg-subtle/30'
            }`}
          >
            <Terminal className="w-3.5 h-3.5 text-emerald-500" />
            <span>Terminal</span>
          </button>
        </div>

        {/* Right: Controls & Multi-Language Selector */}
        <div className="flex items-center gap-3">
          {/* Run Code Button */}
          {onRunCode && (
            <button
              onClick={onRunCode}
              disabled={isExecuting}
              className="flex items-center gap-1.5 px-3 py-1 rounded bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-semibold text-xs transition-all shadow-md disabled:opacity-50"
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

          {/* Theme Toggle Button */}
          <button
            onClick={onThemeToggle}
            className="p-1.5 text-secondary hover:text-primary transition-colors rounded hover:bg-subtle/30"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {theme === 'dark' ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
          </button>

          <div className="w-px h-4 bg-subtle"></div>

          {/* Multi-Language Dropdown Selector */}
          <div className="flex items-center gap-1.5 bg-panel border border-subtle px-2 py-0.5 rounded shadow-sm">
            <span className="text-[10px] text-secondary font-semibold uppercase">Lang:</span>
            <select
              value={language}
              onChange={(e) => onLanguageChange(e.target.value as InterviewLanguage)}
              className="bg-transparent text-primary text-xs font-semibold focus:outline-none cursor-pointer py-0.5"
            >
              {LANGUAGE_OPTIONS.map((opt) => (
                <option key={opt.id} value={opt.id} className="bg-slate-900 text-slate-100">
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