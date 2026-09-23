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
    <div className="flex flex-col h-full bg-white border-l border-sky-200 transition-colors duration-300">
      
      {/* Header */}
      <div className="h-14 px-5 flex items-center justify-between border-b border-sky-200 bg-sky-100/90 transition-colors duration-300">
        <span className="text-xs font-extrabold text-sky-950 uppercase tracking-wider">Interview Transcript</span>
        
        {/* High-contrast Reasoning Toggle Button */}
        <button
          onClick={() => setUseThinking(!useThinking)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all border shadow-sm ${
            useThinking
              ? 'bg-sky-600 text-white border-sky-500 shadow-sky-600/20'
              : 'bg-white hover:bg-sky-50 text-sky-900 border-sky-300'
          }`}
          title={useThinking ? "Reasoning mode is ON (DeepSeek-R1)" : "Click to enable Reasoning mode"}
        >
          {useThinking ? (
            <BrainCircuit className="w-3.5 h-3.5 text-white animate-pulse" />
          ) : (
            <Sparkles className="w-3.5 h-3.5 text-sky-600" />
          )}
          <span>Reasoning {useThinking ? 'ON' : 'OFF'}</span>
        </button>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-white transition-colors duration-300">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-sky-700">
            <div className="w-12 h-12 rounded-2xl bg-sky-50 flex items-center justify-center mb-4 border border-sky-200">
                <GripHorizontal className="w-5 h-5 text-sky-500 opacity-60" />
            </div>
            <p className="text-sm font-semibold">Ready to start interview session.</p>
          </div>
        )}
        
        {messages.map((msg) => (
          <div key={msg.id} className={`flex flex-col gap-1.5 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
            <div className={`text-[11px] font-extrabold tracking-wider uppercase ${msg.role === 'user' ? 'text-sky-700' : 'text-sky-600'}`}>
                {msg.role === 'user' ? 'Candidate' : 'Interviewer'}
            </div>
            <div
              className={`max-w-[92%] text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'text-white bg-sky-600 px-4 py-3 rounded-2xl rounded-tr-none border border-sky-500 shadow-sm font-medium'
                  : 'text-sky-950 bg-sky-50 px-4 py-3 rounded-2xl rounded-tl-none border border-sky-200 shadow-sm font-medium'
              }`}
            >
              {msg.isThinking && msg.role === 'model' && (
                <div className="flex items-center gap-1.5 text-xs text-sky-800 mb-2 font-mono font-bold">
                    <BrainCircuit className="w-3.5 h-3.5 text-sky-600" />
                    <span>Deep Reasoner Output</span>
                </div>
              )}
              <div className="whitespace-pre-wrap">{msg.text}</div>
            </div>
          </div>
        ))}
        
        {isLoading && (
           <div className="flex flex-col items-start gap-1.5">
             <div className="text-[11px] font-extrabold tracking-wider uppercase text-sky-600">Interviewer</div>
             <div className="flex items-center gap-2 px-3 py-2 bg-sky-50 rounded-xl border border-sky-200">
                 <span className="w-2 h-2 bg-sky-600 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                 <span className="w-2 h-2 bg-sky-600 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                 <span className="w-2 h-2 bg-sky-600 rounded-full animate-bounce"></span>
                 <span className="text-xs text-sky-800 font-bold ml-1">Thinking...</span>
             </div>
           </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-sky-200 transition-colors duration-300">
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your response to the interviewer..."
            className="flex-1 bg-sky-50 border border-sky-300 text-sky-950 rounded-xl px-4 py-3 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all text-sm placeholder-sky-400 shadow-sm font-medium"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="flex items-center gap-2 px-4 py-3 bg-sky-600 hover:bg-sky-700 active:bg-sky-800 disabled:opacity-40 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md shrink-0 border border-sky-500"
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