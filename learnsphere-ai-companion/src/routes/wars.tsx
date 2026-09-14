import { createFileRoute } from "@tanstack/react-router";
import { AppLayout } from "@/components/layout/AppLayout";
import { GlassCard, PageHeader, GradientCard } from "@/components/ui-kit/Card";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { Swords, Trophy, Users, Shield, Zap, Sparkles, RefreshCw, X, Play, Heart, Star, Check } from "lucide-react";

export const Route = createFileRoute("/wars")({
  head: () => ({ meta: [{ title: "Study Wars — GyaanSetu AI" }] }),
  component: StudyWarsDashboard,
});

const BATTLE_QUESTIONS = [
  {
    question: "What is the time complexity of searching a sorted array of size N using binary search?",
    options: ["O(N)", "O(log N)", "O(N log N)", "O(1)"],
    correctIdx: 1,
    points: 100
  },
  {
    question: "Which hook is used to cache the result of an expensive computation in React?",
    options: ["useCallback", "useMemo", "useRef", "useState"],
    correctIdx: 1,
    points: 100
  },
  {
    question: "Which of the following database isolation levels offers the highest level of concurrency protection?",
    options: ["Read Uncommitted", "Read Committed", "Repeatable Read", "Serializable"],
    correctIdx: 3,
    points: 100
  }
];

function StudyWarsDashboard() {
  const [userId, setUserId] = useState("");
  const [matchmaking, setMatchmaking] = useState(false);
  const [matchState, setMatchState] = useState<'lobby' | 'searching' | 'found' | 'battle' | 'victory' | 'defeat'>('lobby');
  const [opponentName, setOpponentName] = useState("");
  const [opponentScore, setOpponentScore] = useState(0);
  const [userScore, setUserScore] = useState(0);

  // Battle execution states
  const [currentQIdx, setCurrentQIdx] = useState(0);
  const [selectedOpt, setSelectedOpt] = useState<number | null>(null);
  const [battleTimer, setBattleTimer] = useState(15);

  // Overall ELO / Season stats
  const [elo, setElo] = useState(1420);
  const [wins, setWins] = useState(127);
  const [streak, setStreak] = useState(8);

  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    const userStr = localStorage.getItem("gyaansetu_user");
    if (userStr) {
      const user = JSON.parse(userStr);
      setUserId(user.id);
    }
  }, []);

  // Timer loop for matchmaking
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (matchState === 'searching') {
      timer = setTimeout(() => {
        setOpponentName("Aarav Sharma");
        setMatchState('found');
        showToast("Opponent Found! Preparing arena...");
        setTimeout(() => {
          setMatchState('battle');
          setCurrentQIdx(0);
          setUserScore(0);
          setOpponentScore(0);
          setSelectedOpt(null);
          setBattleTimer(15);
        }, 2000);
      }, 3000);
    }
    return () => clearTimeout(timer);
  }, [matchState]);

  // Battle timer countdown
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (matchState === 'battle' && battleTimer > 0) {
      interval = setInterval(() => {
        setBattleTimer((t) => t - 1);
      }, 1000);
    } else if (battleTimer === 0 && matchState === 'battle') {
      // Auto submit incorrect or progress
      handleAnswerSubmit(-1);
    }
    return () => clearInterval(interval);
  }, [matchState, battleTimer]);

  const handleAnswerSubmit = (optionIdx: number) => {
    const currentQ = BATTLE_QUESTIONS[currentQIdx];
    const isCorrect = optionIdx === currentQ.correctIdx;

    if (isCorrect) {
      setUserScore((prev) => prev + currentQ.points);
      showToast("Critical Hit! Correct answer!");
    } else {
      showToast("Shields damaged! Incorrect answer.");
    }

    // Opponent random score update (simulated behavior)
    const opponentCorrect = Math.random() > 0.35;
    if (opponentCorrect) {
      setOpponentScore((prev) => prev + currentQ.points);
    }

    // Move to next question or end
    setTimeout(() => {
      if (currentQIdx < BATTLE_QUESTIONS.length - 1) {
        setCurrentQIdx((prev) => prev + 1);
        setSelectedOpt(null);
        setBattleTimer(15);
      } else {
        // End game state calculation
        const uFinal = userScore + (isCorrect ? currentQ.points : 0);
        const oFinal = opponentScore + (opponentCorrect ? currentQ.points : 0);

        if (uFinal >= oFinal) {
          setMatchState('victory');
          setElo((prev) => prev + 25);
          setWins((prev) => prev + 1);
          setStreak((prev) => prev + 1);
          showToast("Victory! +25 ELO points.");
        } else {
          setMatchState('defeat');
          setElo((prev) => Math.max(1000, prev - 15));
          setStreak(0);
          showToast("Defeat! -15 ELO points.");
        }
      }
    }, 1200);
  };

  return (
    <AppLayout>
      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className="fixed top-20 right-6 z-50 px-5 py-3 rounded-xl border border-[#4f46e5]/30 shadow-2xl bg-white dark:bg-[#0d1322] text-xs text-slate-900 dark:text-white font-semibold"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      <PageHeader
        title="Study Wars"
        subtitle="1v1 Esports study duels — battle other learners, defeat boss prompts, and dominate leaderboards."
        icon={Swords}
      />

      {/* Top Banner */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <GradientCard className="overflow-hidden relative border border-pink-500/20 shadow-lg p-6">
          <div className="grid lg:grid-cols-[1fr_auto] gap-6 items-center">
            <div>
              <div className="inline-flex items-center gap-1.5 bg-[#4f46e5]/10 text-[#4f46e5] border border-[#4f46e5]/20 rounded-full px-3 py-1 text-xs font-semibold">
                <Sparkles className="h-3 w-3 text-[#4f46e5]" /> Season 4 Active
              </div>
              <h1 className="mt-3 text-2xl font-display font-bold text-slate-900 dark:text-white">Live Multiplayer Arena</h1>
              <p className="mt-2 text-slate-600 dark:text-blue-200/60 max-w-xl text-xs leading-relaxed">
                Test your skills in real-time. Matchmaking automatically matches you with online students at similar ELO thresholds.
              </p>
            </div>
            <div>
              {matchState === 'lobby' && (
                <button
                  onClick={() => setMatchState('searching')}
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#4f46e5] to-[#6366f1] px-6 py-3.5 text-xs font-bold text-slate-900 dark:text-white glow-pink hover:scale-[1.02] transition"
                >
                  <Play className="h-4 w-4 fill-current" /> Find a Match
                </button>
              )}
            </div>
          </div>
        </GradientCard>
      </motion.div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-[#0b1530] border border-sky-200/80 dark:border-blue-500/20 text-slate-900 dark:text-white p-5 rounded-3xl shadow-md text-left text-white">
          <div className="text-[10px] text-blue-300 uppercase font-mono tracking-wider font-semibold">ELO Rating</div>
          <div className="text-xl font-extrabold text-slate-900 dark:text-white mt-1.5 leading-none">{elo}</div>
          <div className="text-[9px] text-[#4f46e5] mt-2 font-mono">Diamond Tier II</div>
        </div>

        <div className="bg-white dark:bg-[#0b1530] border border-sky-200/80 dark:border-blue-500/20 text-slate-900 dark:text-white p-5 rounded-3xl shadow-md text-left text-white">
          <div className="text-[10px] text-blue-300 uppercase font-mono tracking-wider font-semibold">Total Battles</div>
          <div className="text-xl font-extrabold text-slate-900 dark:text-white mt-1.5 leading-none">{wins} Wins</div>
          <div className="text-[9px] text-[#6366f1] mt-2 font-mono">73% win rate</div>
        </div>

        <div className="bg-white dark:bg-[#0b1530] border border-sky-200/80 dark:border-blue-500/20 text-slate-900 dark:text-white p-5 rounded-3xl shadow-md text-left text-white">
          <div className="text-[10px] text-blue-300 uppercase font-mono tracking-wider font-semibold">Win Streak</div>
          <div className="text-xl font-extrabold text-slate-900 dark:text-white mt-1.5 leading-none">{streak} matches</div>
          <div className="text-[9px] text-emerald-400 mt-2 font-mono">Unstoppable bonus active</div>
        </div>

        <div className="bg-white dark:bg-[#0b1530] border border-sky-200/80 dark:border-blue-500/20 text-slate-900 dark:text-white p-5 rounded-3xl shadow-md text-left text-white">
          <div className="text-[10px] text-blue-300 uppercase font-mono tracking-wider font-semibold">Rank Reward</div>
          <div className="text-xl font-extrabold text-slate-900 dark:text-white mt-1.5 leading-none">Diamond Skin</div>
          <div className="text-[9px] text-amber-500 mt-2 font-mono">Unlocks at end of season</div>
        </div>
      </div>

      {/* Main Console Box */}
      <div className="grid lg:grid-cols-12 gap-6 items-stretch mb-6">
        {/* Battle Arena */}
        <div className="lg:col-span-8">
          <GlassCard className="shadow-lg p-6 min-h-[400px] flex flex-col justify-between">
            
            {/* LOBBY STATE */}
            {matchState === 'lobby' && (
              <div className="flex-1 flex flex-col items-center justify-center text-center py-12">
                <Swords className="h-12 w-12 text-[#4f46e5] mb-4 animate-bounce" />
                <h3 className="font-display font-extrabold text-sm text-slate-900 dark:text-white">Ready for Combat?</h3>
                <p className="text-[11px] text-slate-700 dark:text-slate-400 max-w-xs leading-relaxed mt-2">
                  Launch matchmaking to compete on live timed multi-choice syllabi. Answer faster to hit harder!
                </p>
                <button
                  onClick={() => setMatchState('searching')}
                  className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#4f46e5] to-[#6366f1] px-5 py-3 text-xs font-bold text-slate-900 dark:text-white glow-pink transition"
                >
                  <Play className="h-4 w-4 fill-current" /> Enter Matchmaking Queue
                </button>
              </div>
            )}

            {/* SEARCHING STATE */}
            {matchState === 'searching' && (
              <div className="flex-1 flex flex-col items-center justify-center text-center py-12 space-y-4">
                <RefreshCw className="h-10 w-10 text-[#4f46e5] animate-spin" />
                <h3 className="font-display font-bold text-sm text-slate-900 dark:text-white font-mono">Finding study warrior opponent...</h3>
                <p className="text-[10px] text-slate-600 dark:text-slate-500 font-mono">Average queue duration: 12 seconds</p>
                <button
                  onClick={() => setMatchState('lobby')}
                  className="px-4 py-2 rounded-xl bg-white/5 border border-sky-200/80 dark:border-white/10 text-xs hover:bg-white/10 transition"
                >
                  Cancel Queue
                </button>
              </div>
            )}

            {/* OPPONENT FOUND STATE */}
            {matchState === 'found' && (
              <div className="flex-1 flex items-center justify-center gap-8 py-12">
                <div className="text-center">
                  <div className="h-14 w-14 rounded-full bg-blue-500/10 border-2 border-[#3b82f6] flex items-center justify-center font-bold text-slate-900 dark:text-white mx-auto text-sm">
                    YOU
                  </div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white mt-2">Your ELO: {elo}</div>
                </div>

                <div className="text-lg font-bold text-[#4f46e5] font-mono animate-pulse">VS</div>

                <div className="text-center">
                  <div className="h-14 w-14 rounded-full bg-pink-500/10 border-2 border-[#4f46e5] flex items-center justify-center font-bold text-slate-900 dark:text-white mx-auto text-sm">
                    AA
                  </div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white mt-2">{opponentName} (1415)</div>
                </div>
              </div>
            )}

            {/* BATTLE STATE */}
            {matchState === 'battle' && (
              <div className="flex-1 flex flex-col justify-between space-y-4">
                {/* Battle Headers & Health Bars */}
                <div className="flex justify-between items-center pb-3 border-b border-sky-200/60 dark:border-white/5">
                  <div className="flex-1">
                    <span className="text-[9px] font-mono font-bold text-[#3b82f6]">YOU: {userScore} pts</span>
                    <div className="w-32 bg-white/5 h-1.5 rounded-full overflow-hidden mt-1">
                      <div className="h-full bg-gradient-to-r from-[#3b82f6] to-blue-500" style={{ width: `${(userScore / 300) * 100}%` }} />
                    </div>
                  </div>

                  <div className="px-3 py-1.5 rounded-xl bg-red-950/20 border border-red-500/20 text-xs font-mono font-bold text-red-400">
                    {battleTimer}s
                  </div>

                  <div className="flex-1 flex flex-col items-end">
                    <span className="text-[9px] font-mono font-bold text-[#4f46e5]">{opponentName.toUpperCase()}: {opponentScore} pts</span>
                    <div className="w-32 bg-white/5 h-1.5 rounded-full overflow-hidden mt-1">
                      <div className="h-full bg-gradient-to-r from-[#4f46e5] to-pink-500" style={{ width: `${(opponentScore / 300) * 100}%` }} />
                    </div>
                  </div>
                </div>

                {/* Question */}
                <div className="my-2 space-y-2">
                  <div className="text-[9px] font-mono text-slate-700 dark:text-slate-400 uppercase">Question {currentQIdx + 1} / {BATTLE_QUESTIONS.length}</div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white leading-relaxed">{BATTLE_QUESTIONS[currentQIdx].question}</div>
                </div>

                {/* Options */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                  {BATTLE_QUESTIONS[currentQIdx].options.map((opt, idx) => {
                    const isSelected = selectedOpt === idx;
                    return (
                      <button
                        key={idx}
                        onClick={() => {
                          setSelectedOpt(idx);
                          handleAnswerSubmit(idx);
                        }}
                        className={`w-full text-left p-3.5 rounded-xl border transition text-xs flex items-center justify-between ${
                          isSelected
                            ? "bg-[#4f46e5]/10 border-[#4f46e5]/40 text-slate-900 dark:text-white font-bold"
                            : "bg-slate-900/30 border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-800/60"
                        }`}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* VICTORY STATE */}
            {matchState === 'victory' && (
              <div className="flex-1 flex flex-col items-center justify-center text-center py-12 space-y-4">
                <div className="h-16 w-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shadow-lg">
                  <Trophy className="h-8 w-8" />
                </div>
                <h3 className="font-display font-extrabold text-base text-slate-900 dark:text-white">Match Won!</h3>
                <p className="text-[11px] text-slate-700 dark:text-slate-400 max-w-xs leading-relaxed">
                  Excellent reasoning speed! You correctly answered the complexity and Memo patterns.
                </p>
                <div className="text-xs font-mono font-bold text-[#3b82f6]">ELO updated: {elo} (+25)</div>
                <button
                  onClick={() => setMatchState('lobby')}
                  className="px-6 py-2.5 rounded-xl bg-slate-800 text-white text-xs font-bold border border-slate-700 hover:bg-slate-700 transition"
                >
                  Return to Lobby
                </button>
              </div>
            )}

            {/* DEFEAT STATE */}
            {matchState === 'defeat' && (
              <div className="flex-1 flex flex-col items-center justify-center text-center py-12 space-y-4">
                <div className="h-16 w-16 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center shadow-lg">
                  <Shield className="h-8 w-8" />
                </div>
                <h3 className="font-display font-extrabold text-base text-slate-900 dark:text-white">Defeat</h3>
                <p className="text-[11px] text-slate-700 dark:text-slate-400 max-w-xs leading-relaxed">
                  Your opponent answered the database isolation level faster. Study system indices to prepare for next battle.
                </p>
                <div className="text-xs font-mono font-bold text-red-400">ELO updated: {elo} (-15)</div>
                <button
                  onClick={() => setMatchState('lobby')}
                  className="px-6 py-2.5 rounded-xl bg-slate-800 text-white text-xs font-bold border border-slate-700 hover:bg-slate-700 transition"
                >
                  Return to Lobby
                </button>
              </div>
            )}

          </GlassCard>
        </div>

        {/* Side Panel: Leaderboard */}
        <div className="lg:col-span-4">
          <GlassCard className="shadow-lg p-6 h-full flex flex-col justify-between">
            <div className="space-y-4">
              <h3 className="font-display font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                <Trophy className="h-4.5 w-4.5 text-amber-400" /> Season Leaderboard
              </h3>
              <p className="text-[11px] text-slate-600 dark:text-blue-200/60 leading-relaxed">
                Rankings update automatically at midnight UTC:
              </p>

              <div className="space-y-2.5">
                {[
                  { name: "Aarav Sharma", score: 1650, tier: "Master" },
                  { name: "Vikram Patel", score: 1580, tier: "Master" },
                  { name: "You (Student)", score: elo, tier: "Diamond II" },
                  { name: "Meera Sen", score: 1390, tier: "Diamond I" }
                ].map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center p-2.5 rounded-xl bg-slate-900/35 border border-slate-800 text-xs">
                    <span className="font-semibold text-slate-200">{idx + 1}. {item.name}</span>
                    <span className="text-[#4f46e5] font-mono font-bold">{item.score} ELO</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 bg-[#4f46e5]/5 border border-[#4f46e5]/10 p-3 rounded-xl text-[10px] text-slate-700 dark:text-slate-300 leading-relaxed font-mono">
              Winning streaks grant +10 bonus XP rewards. Play 3 daily matches to claim.
            </div>
          </GlassCard>
        </div>
      </div>
    </AppLayout>
  );
}
