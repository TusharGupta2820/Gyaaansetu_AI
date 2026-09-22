import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, BrainCircuit, GripHorizontal } from 'lucide-react';
import type { ChatMessage } from '@/types';

interface ChatPanelProps {
  messages: ChatMessage[];
  onSendMessage: (text: string, useThinking: boolean) => void;
  isLoading: boolean;
}

const ChatPanel: React.FC<ChatPanelProps> = ({ messages, onSendMessage, isLoading }) => {
  const [input, setInput] = useState('');
  const [useThinking, setUseThinking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    onSendMessage(input, useThinking);
    setInput('');
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex flex-col h-full bg-panel border-l border-subtle transition-colors duration-300">
      
      {/* Header */}
      <div className="h-14 px-5 flex items-center justify-between border-b border-subtle bg-panel-head transition-colors duration-300">
        <span className="text-xs font-bold text-primary uppercase tracking-wider">Interview Transcript</span>
        
        {/* High-contrast Reasoning Toggle Button */}
        <button
          onClick={() => setUseThinking(!useThinking)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-all border shadow-sm ${
            useThinking
              ? 'bg-emerald-600 text-white border-emerald-500 shadow-emerald-600/20'
              : 'bg-slate-800/80 hover:bg-slate-700 text-slate-100 border-slate-700'
          }`}
          title={useThinking ? "Reasoning mode is ON (DeepSeek-R1)" : "Click to enable Reasoning mode"}
        >
          {useThinking ? (
            <BrainCircuit className="w-3.5 h-3.5 text-white animate-pulse" />
          ) : (
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          )}
          <span>Reasoning {useThinking ? 'ON' : 'OFF'}</span>
        </button>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-panel transition-colors duration-300">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-secondary">
            <div className="w-12 h-12 rounded-2xl bg-app flex items-center justify-center mb-4 border border-subtle">
                <GripHorizontal className="w-5 h-5 opacity-50" />
            </div>
            <p className="text-sm font-medium">Ready to start interview session.</p>
          </div>
        )}
        
        {messages.map((msg) => (
          <div key={msg.id} className={`flex flex-col gap-1.5 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
            <div className={`text-[11px] font-bold tracking-wider uppercase ${msg.role === 'user' ? 'text-indigo-400' : 'text-emerald-400'}`}>
                {msg.role === 'user' ? 'Candidate' : 'Interviewer'}
            </div>
            <div
              className={`max-w-[92%] text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'text-primary bg-indigo-950/40 dark:bg-indigo-950/60 px-4 py-3 rounded-2xl rounded-tr-xs border border-indigo-500/30 shadow-sm'
                  : 'text-primary bg-slate-900/40 dark:bg-slate-900/70 px-4 py-3 rounded-2xl rounded-tl-xs border border-subtle shadow-sm'
              }`}
            >
              {msg.isThinking && msg.role === 'model' && (
                <div className="flex items-center gap-1.5 text-xs text-amber-400 mb-2 font-mono font-semibold">
                    <BrainCircuit className="w-3.5 h-3.5" />
                    <span>Deep Reasoner Output</span>
                </div>
              )}
              <div className="whitespace-pre-wrap">{msg.text}</div>
            </div>
          </div>
        ))}
        
        {isLoading && (
           <div className="flex flex-col items-start gap-1.5">
             <div className="text-[11px] font-bold tracking-wider uppercase text-emerald-400">Interviewer</div>
             <div className="flex items-center gap-2 px-3 py-2 bg-slate-900/50 rounded-xl border border-subtle">
                 <span className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                 <span className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                 <span className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce"></span>
                 <span className="text-xs text-slate-400 font-medium ml-1">Thinking...</span>
             </div>
           </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-panel border-t border-subtle transition-colors duration-300">
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your response to the interviewer..."
            className="flex-1 bg-app border border-subtle text-primary rounded-xl px-4 py-3 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-sm placeholder-secondary shadow-sm font-medium"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="flex items-center gap-2 px-4 py-3 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 disabled:opacity-40 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md shrink-0"
            title="Send Response"
          >
            <Send className="w-4 h-4 fill-current" />
            <span className="hidden sm:inline">Send</span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatPanel;