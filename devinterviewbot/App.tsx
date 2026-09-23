import React, { useRef, useEffect, useState } from 'react';
import CodeEditor, { type CodeEditorHandle } from '@/components/CodeEditor';
import ChatPanel from '@/components/ChatPanel';
import LiveControls from '@/components/LiveControls';
import AvatarInterviewer, { type AvatarInterviewerHandle } from '@/components/AvatarInterviewer';
import ProblemBankModal from '@/components/ProblemBankModal';
import { useTheme } from '@/hooks/useTheme';
import { useLiveInterview } from '@/hooks/useLiveInterview';
import { useInterviewSession } from '@/hooks/useInterviewSession';
import { RefreshCw, Terminal, BookOpen } from 'lucide-react';
import type { InterviewProblem } from '@/types';

const API_KEY = (import.meta as any).env.VITE_API_KEY || '';

/**
 * Root application component.
 * Composes the code editor, chat transcript, and live interview controls
 * into a single-page interview workspace.
 */
const App: React.FC = () => {
  const editorRef = useRef<CodeEditorHandle>(null);
  const avatarRef = useRef<AvatarInterviewerHandle>(null);
  const { theme, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState<'workspace' | 'chat'>('workspace');
  const [isProblemModalOpen, setIsProblemModalOpen] = useState(false);

  const session = useInterviewSession({ apiKey: API_KEY });

  const live = useLiveInterview({
    apiKey: API_KEY,
    currentProblem: session.currentProblem,
    language: session.language,
    code: session.code,
    editorRef,
    avatarRef,
    setMessages: session.setMessages,
    onUpdateContext: (lang, title, desc, code) => {
      session.setDynamicProblem(lang, title, desc, code);
    },
    onTypeCode: (newCode) => {
      session.typeCodeEffect(newCode);
    }
  });

  // Wire live refs into session for message routing (effect, not render-phase)
  useEffect(() => {
    session.setLiveRefs(live.isLiveConnected, live.liveServiceRef);
  }, [live.isLiveConnected, live.liveServiceRef, session.setLiveRefs]);

  return (
    <div className="h-screen w-full flex flex-col bg-app text-primary font-sans overflow-hidden transition-colors duration-300">
      <Header
        currentProblem={session.currentProblem}
        onRandomProblem={session.handleRandomProblem}
        onOpenProblemBank={() => setIsProblemModalOpen(true)}
        live={live}
      />

      {/* LeetCode Problem Bank Selector Modal */}
      <ProblemBankModal
        isOpen={isProblemModalOpen}
        onClose={() => setIsProblemModalOpen(false)}
        onSelectProblem={session.handleSelectProblem}
      />

      {/* Mobile Tab Switcher */}
      <div className="md:hidden flex border-b border-subtle bg-panel">
        <button
          onClick={() => setActiveTab('workspace')}
          className={`flex-1 py-3 text-xs font-semibold text-center border-b-2 transition-colors ${
            activeTab === 'workspace' ? 'border-primary text-primary' : 'border-transparent text-secondary hover:text-primary'
          }`}
        >
          Workspace
        </button>
        <button
          onClick={() => setActiveTab('chat')}
          className={`flex-1 py-3 text-xs font-semibold text-center border-b-2 transition-colors ${
            activeTab === 'chat' ? 'border-primary text-primary' : 'border-transparent text-secondary hover:text-primary'
          }`}
        >
          Chat Transcript
        </button>
      </div>

      <main className="flex-1 flex overflow-hidden">
        <div className={`flex-1 flex flex-col relative min-w-0 ${activeTab === 'workspace' ? 'flex' : 'hidden md:flex'}`}>
          <AvatarInterviewer
            ref={avatarRef}
            speechLevel={live.speechLevel}
            isLiveConnected={live.isLiveConnected}
            subtitles={live.subtitles}
            agentState={live.agentState}
          />
          <DescriptionBanner description={session.currentProblem.description} />
          <div className="flex-1 relative">
            <CodeEditor
              ref={editorRef}
              code={session.code}
              onChange={session.setCode}
              language={session.language}
              onLanguageChange={session.handleLanguageChange}
              theme={theme}
              onThemeToggle={toggleTheme}
              onRunCode={session.handleRunCode}
              isExecuting={session.isExecuting}
              executionResult={session.executionResult}
              isTerminalOpen={session.isTerminalOpen}
              setIsTerminalOpen={session.setIsTerminalOpen}
            />
          </div>
        </div>

        <div className={`w-full md:w-[400px] xl:w-[450px] flex-shrink-0 flex flex-col border-t md:border-t-0 md:border-l border-subtle bg-panel z-10 shadow-2xl shadow-black/5 transition-colors duration-300 ${activeTab === 'chat' ? 'flex' : 'hidden md:flex'}`}>
          <ChatPanel
            messages={session.messages}
            onSendMessage={session.handleSendMessage}
            isLoading={session.isLoadingChat}
          />
        </div>
      </main>
    </div>
  );
};

export default App;

// --- Sub-components extracted from the layout ---

interface HeaderProps {
  currentProblem: { title: string; difficulty: 'Easy' | 'Medium' | 'Hard' };
  onRandomProblem: () => void;
  onOpenProblemBank: () => void;
  live: {
    isLiveConnected: boolean;
    isConnectingLive: boolean;
    volume: number;
    isMicMuted: boolean;
    isCameraEnabled: boolean;
    sessionTokens: { prompt: number; candidates: number; total: number };
    toggleMic: () => void;
    toggleCamera: () => void;
    handleConnectLive: () => void;
    handleDisconnectLive: () => void;
  };
}

function Header({ currentProblem, onRandomProblem, onOpenProblemBank, live }: HeaderProps) {
  const difficultyClass =
    currentProblem.difficulty === 'Easy'
      ? 'bg-sky-100 text-sky-800 border-sky-300'
      : currentProblem.difficulty === 'Medium'
        ? 'bg-sky-200 text-sky-900 border-sky-400'
        : 'bg-sky-300 text-sky-950 border-sky-500';

  return (
    <header className="relative h-16 border-b border-sky-200 bg-sky-100/90 backdrop-blur-md flex items-center justify-between px-4 sm:px-6 shrink-0 z-50">
      <div className="flex items-center gap-3">
        <div className="hidden sm:flex items-center gap-2 text-sky-950 font-extrabold">
          <Terminal className="w-5 h-5 text-sky-600" />
          <span className="font-extrabold tracking-tight text-base text-sky-950">DevInterview AI</span>
        </div>
        <div className="hidden sm:block h-5 w-px bg-sky-300 mx-1" />
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Problem Bank Picker Button */}
          <button
            onClick={onOpenProblemBank}
            className="flex items-center gap-1.5 px-3 py-1 bg-sky-600 hover:bg-sky-700 active:bg-sky-800 text-white font-bold text-xs rounded-md shadow-md transition-all border border-sky-500"
            title="Open LeetCode 1000+ Problem Bank"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Problem Bank (1000+)</span>
          </button>

          <span className="text-xs sm:text-sm font-bold text-sky-950 truncate max-w-[120px] sm:max-w-none">{currentProblem.title}</span>
          <span className={`text-[10px] px-2.5 py-0.5 rounded-full border font-bold ${difficultyClass} uppercase tracking-wider`}>
            {currentProblem.difficulty}
          </span>
          <button 
            onClick={onRandomProblem} 
            className="flex items-center gap-1.5 px-2.5 py-1 bg-white hover:bg-sky-50 text-sky-900 border border-sky-300 rounded-md text-xs font-semibold shadow-sm transition-all"
            title="Next Random LeetCode Problem"
          >
            <RefreshCw className="w-3.5 h-3.5 text-sky-600" />
            <span className="hidden md:inline">Next Problem</span>
          </button>
        </div>
      </div>

      <div className="md:absolute md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2">
        <LiveControls 
          isConnected={live.isLiveConnected}
          isConnecting={live.isConnectingLive}
          onConnect={live.handleConnectLive}
          onDisconnect={live.handleDisconnectLive}
          volume={live.volume}
          isMicMuted={live.isMicMuted}
          onToggleMic={live.toggleMic}
          isCameraEnabled={live.isCameraEnabled}
          onToggleCamera={live.toggleCamera}
          sessionTokens={live.sessionTokens}
        />
      </div>
    </header>
  );
}

function DescriptionBanner({ description }: { description: string }) {
  return (
    <div className="px-8 py-4 border-b border-sky-200 bg-sky-50/70 transition-colors duration-300">
      <p className="text-xs sm:text-sm text-sky-900 font-medium leading-relaxed max-w-4xl">{description}</p>
    </div>
  );
}
