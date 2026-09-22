import React, { useRef, useEffect, useState } from 'react';
import CodeEditor, { type CodeEditorHandle } from '@/components/CodeEditor';
import ChatPanel from '@/components/ChatPanel';
import LiveControls from '@/components/LiveControls';
import AvatarInterviewer, { type AvatarInterviewerHandle } from '@/components/AvatarInterviewer';
import { useTheme } from '@/hooks/useTheme';
import { useLiveInterview } from '@/hooks/useLiveInterview';
import { useInterviewSession } from '@/hooks/useInterviewSession';
import { RefreshCw, Terminal } from 'lucide-react';
import { PROBLEMS } from '@/constants';

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
        live={live}
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

function Header({ currentProblem, onRandomProblem, live }: HeaderProps) {
  const difficultyClass =
    currentProblem.difficulty === 'Easy'
      ? 'border-emerald-900/50 text-emerald-500'
      : currentProblem.difficulty === 'Medium'
        ? 'border-amber-900/50 text-amber-500'
        : 'border-rose-900/50 text-rose-500';

  return (
    <header className="relative h-16 border-b border-subtle bg-app flex items-center justify-between px-4 sm:px-6 shrink-0 z-50">
      <div className="flex items-center gap-2 sm:gap-4">
        <div className="hidden sm:flex items-center gap-2 text-primary">
          <Terminal className="w-5 h-5 text-secondary" />
          <span className="font-medium tracking-tight text-sm">DevInterview</span>
        </div>
        <div className="hidden sm:block h-4 w-px bg-subtle mx-2" />
        <div className="flex items-center gap-1.5 sm:gap-3">
          <span className="text-xs sm:text-sm font-medium text-primary truncate max-w-[120px] sm:max-w-none">{currentProblem.title}</span>
          <span className={`text-[9px] sm:text-[10px] px-1.5 py-0.5 rounded border ${difficultyClass} uppercase tracking-wider`}>
            {currentProblem.difficulty}
          </span>
          <button onClick={onRandomProblem} className="p-1.5 text-secondary hover:text-primary transition-colors" title="Next Problem">
            <RefreshCw className="w-3.5 h-3.5" />
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
    <div className="px-8 py-6 border-b border-subtle bg-app transition-colors duration-300">
      <p className="text-sm text-secondary leading-relaxed max-w-3xl">{description}</p>
    </div>
  );
}

