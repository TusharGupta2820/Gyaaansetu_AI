import { createFileRoute } from "@tanstack/react-router";
import { AppLayout } from "@/components/layout/AppLayout";
import { GlassCard, PageHeader, GradientCard } from "@/components/ui-kit/Card";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { 
  FileQuestion, Brain, Check, Play, RefreshCw, X, Award, 
  HelpCircle, ChevronRight, Zap, Trophy, Shield, HelpCircle as QuestionIcon,
  BookOpen, Code2, GraduationCap, ChevronLeft, ArrowRight, Sparkles
} from "lucide-react";
import { generateQuiz, gradeSubjective, gradeCoding } from "@/lib/api/ai.service";

export const Route = createFileRoute("/quiz")({
  head: () => ({ meta: [{ title: "Quiz Maker — GyaanSetu AI" }] }),
  component: QuizMakerPage,
});

const DOMAINS = [
  { id: "mcq", title: "MCQ Generator", desc: "Adaptive multiple-choice questions calibrated to your current level.", tag: "Adaptive" },
  { id: "subjective", title: "Subjective Evaluation", desc: "Open-ended questions with AI-graded answers and rubric feedback.", tag: "AI Rubric" },
  { id: "coding", title: "Coding Challenges", desc: "Live judge, hidden test cases, and complexity analysis for your solution.", tag: "Live Judge" },
  { id: "aptitude", title: "Aptitude Trainer", desc: "Quant, logical reasoning, and verbal ability — placement and exam ready.", tag: "Exam Prep" }
];

const LEADERBOARD_INITIAL = [
  { name: "Aarav Sharma", score: 96, subject: "DSA", rank: 1 },
  { name: "Meera Patel", score: 92, subject: "React Hooks", rank: 2 },
  { name: "Vikram Malhotra", score: 88, subject: "DBMS", rank: 3 },
  { name: "Neha Iyer", score: 79, subject: "Autonomic Nervous", rank: 4 },
  { name: "You (Student)", score: 0, subject: "None", rank: 5 }
];

function QuizMakerPage() {
  const [userId, setUserId] = useState("");
  const [step, setStep] = useState<'setup' | 'generating' | 'running' | 'results'>('setup');
  
  // Dashboard overall metrics (persisted in session)
  const [quizzesTaken, setQuizzesTaken] = useState(0);
  const [avgScore, setAvgScore] = useState(0);
  const [bestSubject, setBestSubject] = useState("None");
  const [timeSaved, setTimeSaved] = useState(0);

  // Quiz configuration
  const [topic, setTopic] = useState("");
  const [quizType, setQuizType] = useState("mcq"); // mcq, subjective, coding, aptitude
  const [difficulty, setDifficulty] = useState("Medium");
  const [adaptiveTuning, setAdaptiveTuning] = useState(true);

  // Active quiz execution states
  const [generatingProgress, setGeneratingProgress] = useState(0);
  const [currentQuizData, setCurrentQuizData] = useState<any>(null);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  
  // Subjective answers
  const [subjectiveAnswer, setSubjectiveAnswer] = useState("");
  const [subjectiveResult, setSubjectiveResult] = useState<any>(null);

  // Coding answers
  const [codingSolution, setCodingSolution] = useState("");
  const [codingResult, setCodingResult] = useState<any>(null);

  // Final scoring state
  const [quizScore, setQuizScore] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [leaderboard, setLeaderboard] = useState(LEADERBOARD_INITIAL);
  const [toast, setToast] = useState<{ message: string; icon: any } | null>(null);

  const showToast = (message: string, icon: any) => {
    setToast({ message, icon });
    setTimeout(() => setToast(null), 4000);
  };

  useEffect(() => {
    const userStr = localStorage.getItem("gyaansetu_user");
    if (userStr) {
      const user = JSON.parse(userStr);
      setUserId(user.id);
    }
  }, []);

  const handleStartGeneration = async () => {
    if (!topic.trim()) return;
    setStep('generating');
    setGeneratingProgress(10);

    const progressTimer = setInterval(() => {
      setGeneratingProgress((prev) => (prev < 90 ? prev + 12 : prev));
    }, 900);

    try {
      const data = await generateQuiz(topic, quizType, difficulty, userId);
      clearInterval(progressTimer);
      setGeneratingProgress(100);
      setCurrentQuizData(data);
      setCurrentQuestionIdx(0);
      setSelectedAnswers({});
      setSubjectiveAnswer("");
      setSubjectiveResult(null);
      setCodingSolution(data.starter_code || "");
      setCodingResult(null);
      
      // Determine question counts
      if (quizType === 'mcq' || quizType === 'aptitude') {
        setTotalQuestions(data.questions?.length || 3);
      } else {
        setTotalQuestions(1);
      }
      
      setTimeout(() => {
        setStep('running');
      }, 500);
    } catch (err) {
      clearInterval(progressTimer);
      showToast("Error generating quiz via DeepSeek-R1. Please try again.", X);
      setStep('setup');
    }
  };

  const handleOptionSelect = (qIdx: number, oIdx: number) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [qIdx]: oIdx
    }));
  };

  const submitMCQQuiz = () => {
    let score = 0;
    const questions = currentQuizData.questions || [];
    questions.forEach((q: any, idx: number) => {
      if (selectedAnswers[idx] === q.correct_idx) {
        score += 1;
      }
    });

    const percent = Math.round((score / questions.length) * 100);
    const newQuizzesTaken = quizzesTaken + 1;
    const newAvg = Math.round(((avgScore * quizzesTaken) + percent) / newQuizzesTaken);
    
    setQuizScore(score);
    setQuizzesTaken(newQuizzesTaken);
    setAvgScore(newAvg);
    if (percent > avgScore) {
      setBestSubject(topic);
    }
    setTimeSaved(prev => prev + 1.5);

    // Update leaderboard ranks
    const updatedLeaderboard = [...LEADERBOARD_INITIAL];
    updatedLeaderboard[4] = { name: "You (Student)", score: percent, subject: topic, rank: 5 };
    updatedLeaderboard.sort((a, b) => b.score - a.score);
    updatedLeaderboard.forEach((item, index) => {
      item.rank = index + 1;
    });
    setLeaderboard(updatedLeaderboard);

    showToast(`Quiz completed! You scored ${score}/${questions.length}`, Award);
    setStep('results');
  };

  const handleSubmitSubjective = async () => {
    if (!subjectiveAnswer.trim()) return;
    setGeneratingProgress(20);
    setStep('generating');
    
    const progressTimer = setInterval(() => {
      setGeneratingProgress((prev) => (prev < 90 ? prev + 15 : prev));
    }, 700);

    try {
      const result = await gradeSubjective(currentQuizData.question, subjectiveAnswer, userId);
      clearInterval(progressTimer);
      setGeneratingProgress(100);
      setSubjectiveResult(result);
      
      // Update statistics
      const percent = Math.round((result.score / result.max_score) * 100);
      const newQuizzesTaken = quizzesTaken + 1;
      const newAvg = Math.round(((avgScore * quizzesTaken) + percent) / newQuizzesTaken);
      setQuizzesTaken(newQuizzesTaken);
      setAvgScore(newAvg);
      setTimeSaved(prev => prev + 2);

      setTimeout(() => {
        setStep('running');
      }, 300);
    } catch (err) {
      clearInterval(progressTimer);
      showToast("Evaluation failure. Grade logged locally.", X);
      setStep('running');
    }
  };

  const handleSubmitCoding = async () => {
    if (!codingSolution.trim()) return;
    setGeneratingProgress(20);
    setStep('generating');

    const progressTimer = setInterval(() => {
      setGeneratingProgress((prev) => (prev < 90 ? prev + 15 : prev));
    }, 800);

    try {
      const result = await gradeCoding(currentQuizData.problem_statement, codingSolution, userId);
      clearInterval(progressTimer);
      setGeneratingProgress(100);
      setCodingResult(result);

      // Update statistics
      const percent = result.passed ? 100 : 40;
      const newQuizzesTaken = quizzesTaken + 1;
      const newAvg = Math.round(((avgScore * quizzesTaken) + percent) / newQuizzesTaken);
      setQuizzesTaken(newQuizzesTaken);
      setAvgScore(newAvg);
      setTimeSaved(prev => prev + 3);

      setTimeout(() => {
        setStep('running');
      }, 300);
    } catch (err) {
      clearInterval(progressTimer);
      showToast("Coding evaluation failure. Please check code syntax.", X);
      setStep('running');
    }
  };

  return (
    <AppLayout>
      <div className="bg-sky-50/40 -m-4 sm:-m-6 p-4 sm:p-6 rounded-3xl min-h-screen space-y-6">
        
        {/* Toast Notifier */}
        <AnimatePresence>
          {toast && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="fixed top-6 right-6 z-50 bg-white text-sky-600 border border-sky-300 px-4 py-3 rounded-xl flex items-center gap-2.5 shadow-xl text-xs font-mono font-semibold"
            >
              <span className="h-2 w-2 rounded-full bg-sky-500 animate-ping" />
              <span>{toast.message}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Dashboard Header Banner */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="bg-white border border-sky-200 rounded-3xl p-6 shadow-md shadow-sky-100/50">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <div className="inline-flex items-center gap-1.5 rounded-full bg-sky-100/80 px-3.5 py-1 text-[10px] font-mono font-bold text-sky-700 border border-sky-200">
                  <Sparkles className="h-3.5 w-3.5 text-sky-600" />
                  Powered by DeepSeek-R1 AI
                </div>
                <h1 className="mt-3 text-2xl lg:text-3xl font-display font-extrabold text-sky-950">Quiz Maker & Adaptive Assessment</h1>
                <p className="mt-2 text-sky-700/80 max-w-xl text-xs leading-relaxed">
                  Generate adaptive MCQs, subjective question rubrics, coding evaluations, and aptitude placement assessments customized by topic.
                </p>
              </div>
              <div>
                <a href="#setup-quiz" className="inline-flex items-center gap-2 rounded-2xl bg-sky-500 hover:bg-sky-600 text-white px-5 py-3.5 text-xs font-bold shadow-md shadow-sky-200 hover:shadow-sky-300 hover:scale-[1.02] transition">
                  <Play className="h-4 w-4 fill-white text-transparent" /> Start Quiz Generator
                </a>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white border border-sky-200/80 text-sky-950 shadow-sm p-5 rounded-3xl">
            <div className="text-[10px] text-sky-600 uppercase font-mono tracking-wider font-bold">Quizzes Taken</div>
            <div className="text-2xl font-extrabold text-sky-950 mt-1.5 leading-none">{quizzesTaken}</div>
            <div className="text-[9px] text-sky-500 mt-2 font-mono">Comprehensive syllabus tested</div>
          </div>
          
          <div className="bg-white border border-sky-200/80 text-sky-950 shadow-sm p-5 rounded-3xl">
            <div className="text-[10px] text-sky-600 uppercase font-mono tracking-wider font-bold">Avg Score</div>
            <div className="text-2xl font-extrabold text-sky-950 mt-1.5 leading-none">{avgScore}%</div>
            <div className="text-[9px] text-sky-500 mt-2 font-mono">Total score efficiency</div>
          </div>
          
          <div className="bg-white border border-sky-200/80 text-sky-950 shadow-sm p-5 rounded-3xl">
            <div className="text-[10px] text-sky-600 uppercase font-mono tracking-wider font-bold">Best Subject</div>
            <div className="text-2xl font-extrabold text-sky-600 mt-1.5 leading-none">{bestSubject}</div>
            <div className="text-[9px] text-sky-500 mt-2 font-mono">Optimal mastery subject</div>
          </div>
          
          <div className="bg-white border border-sky-200/80 text-sky-950 shadow-sm p-5 rounded-3xl">
            <div className="text-[10px] text-sky-600 uppercase font-mono tracking-wider font-bold">Time Saved</div>
            <div className="text-2xl font-extrabold text-sky-950 mt-1.5 leading-none">{timeSaved}h</div>
            <div className="text-[9px] text-sky-500 mt-2 font-mono">Automated test calibration</div>
          </div>
        </div>

        {/* Dynamic State Engine */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          
          {/* Main Action Console */}
          <div className="lg:col-span-8 flex flex-col">
            <div id="setup-quiz" className="bg-white border border-sky-200 rounded-3xl shadow-md shadow-sky-100/50 p-6 min-h-[420px] flex-1 flex flex-col justify-between">
              
              {/* SETUP STEP */}
              {step === 'setup' && (
                <div className="space-y-5 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-display font-extrabold text-base text-sky-950 flex items-center gap-2">
                      <Brain className="h-5 w-5 text-sky-600" /> Design Your DeepSeek-R1 Assessment
                    </h3>
                    <p className="text-[11px] text-sky-700/80 mt-0.5">Select a category on the right or explore modes below to construct blueprints.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] text-sky-700 font-mono font-semibold">QUIZ SYLLABUS / TOPIC</label>
                      <input
                        type="text"
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        placeholder="E.g. React Hooks, DSA Trees, Autonomic Nervous"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-sky-50/60 border border-sky-200 text-xs text-sky-950 placeholder-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-400/50 transition font-medium"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] text-sky-700 font-mono font-semibold">ASSESSMENT CATEGORY</label>
                      <select
                        value={quizType}
                        onChange={(e) => setQuizType(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-sky-50/60 border border-sky-200 text-xs text-sky-950 focus:outline-none focus:ring-2 focus:ring-sky-400/50 transition font-medium"
                      >
                        <option value="mcq">MCQ Generator</option>
                        <option value="subjective">Subjective Evaluation</option>
                        <option value="coding">Coding Challenge</option>
                        <option value="aptitude">Aptitude Practice</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] text-sky-700 font-mono font-semibold">DIFFICULTY TUNING</label>
                      <div className="flex gap-2">
                        {["Easy", "Medium", "Hard"].map((lvl) => (
                          <button
                            key={lvl}
                            onClick={() => setDifficulty(lvl)}
                            className={`flex-1 py-2 rounded-xl text-xs border font-bold transition ${
                              difficulty === lvl
                                ? "bg-sky-500 text-white border-sky-500 shadow-sm shadow-sky-200"
                                : "bg-sky-50/70 border-sky-200 text-sky-700 hover:bg-sky-100"
                            }`}
                          >
                            {lvl}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-1.5 flex flex-col justify-end">
                      <div className="flex items-center justify-between p-2.5 rounded-xl bg-sky-50 border border-sky-200">
                        <span className="text-[10px] text-sky-900 font-mono font-semibold">ADAPTIVE DIFFICULTY TUNING</span>
                        <input
                          type="checkbox"
                          checked={adaptiveTuning}
                          onChange={(e) => setAdaptiveTuning(e.target.checked)}
                          className="h-4 w-4 accent-sky-500"
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleStartGeneration}
                    disabled={!topic.trim()}
                    className="w-full mt-4 py-3.5 rounded-2xl bg-sky-500 hover:bg-sky-600 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-md shadow-sky-200 transition disabled:opacity-40"
                  >
                    <Zap className="h-4.5 w-4.5 fill-current" /> Construct Assessment using DeepSeek-R1
                  </button>
                </div>
              )}

              {/* GENERATING STEP */}
              {step === 'generating' && (
                <div className="flex-1 flex flex-col items-center justify-center space-y-4 py-12">
                  <RefreshCw className="h-10 w-10 text-sky-600 animate-spin" />
                  <div className="text-xs text-sky-700 font-mono text-center max-w-xs leading-relaxed font-medium">
                    {generatingProgress < 45 ? "thinking via deep reasoning traces..." : generatingProgress < 85 ? "structuring educational schemas..." : "loading test components..."}
                  </div>
                  <div className="w-48 bg-sky-100 h-2 rounded-full overflow-hidden">
                    <div className="h-full bg-sky-500 transition-all duration-300" style={{ width: `${generatingProgress}%` }} />
                  </div>
                </div>
              )}

              {/* RUNNING STEP */}
              {step === 'running' && currentQuizData && (
                <div className="flex-1 flex flex-col justify-between space-y-4">
                  
                  {/* RUNNING MCQ / APTITUDE */}
                  {(quizType === 'mcq' || quizType === 'aptitude') && (
                    <div className="space-y-4 flex-1 flex flex-col justify-between">
                      <div className="flex justify-between items-center pb-2 border-b border-sky-100">
                        <span className="text-[9px] font-mono font-bold text-sky-700 bg-sky-100 px-2.5 py-0.5 rounded border border-sky-200 uppercase">
                          Question {currentQuestionIdx + 1} of {totalQuestions}
                        </span>
                        <span className="text-[9px] font-mono text-sky-700 bg-sky-100 px-2 py-0.5 rounded font-semibold">
                          {difficulty} level
                        </span>
                      </div>

                      <div className="my-3 text-sm font-bold text-sky-950">
                        {currentQuizData.questions?.[currentQuestionIdx]?.question}
                      </div>

                      <div className="grid grid-cols-1 gap-2.5 my-2">
                        {currentQuizData.questions?.[currentQuestionIdx]?.options?.map((opt: string, idx: number) => {
                          const isSelected = selectedAnswers[currentQuestionIdx] === idx;
                          return (
                            <button
                              key={idx}
                              onClick={() => handleOptionSelect(currentQuestionIdx, idx)}
                              className={`w-full text-left p-3.5 rounded-2xl border transition text-xs font-semibold flex items-center justify-between ${
                                isSelected
                                  ? "bg-sky-500 text-white border-sky-500 shadow-sm shadow-sky-200"
                                  : "bg-sky-50/50 border-sky-200 text-sky-900 hover:bg-sky-100"
                              }`}
                            >
                              <span>{opt}</span>
                              {isSelected && <Check className="h-4.5 w-4.5 text-white" />}
                            </button>
                          );
                        })}
                      </div>

                      <div className="flex justify-between items-center pt-3 border-t border-sky-100">
                        <button
                          disabled={currentQuestionIdx === 0}
                          onClick={() => setCurrentQuestionIdx(prev => prev - 1)}
                          className="px-3.5 py-2 rounded-xl bg-sky-100 text-sky-700 hover:bg-sky-200 transition disabled:opacity-30 text-xs font-semibold flex items-center gap-1"
                        >
                          <ChevronLeft className="h-4 w-4" /> Previous
                        </button>
                        
                        {currentQuestionIdx < totalQuestions - 1 ? (
                          <button
                            onClick={() => setCurrentQuestionIdx(prev => prev + 1)}
                            className="px-3.5 py-2 rounded-xl bg-sky-500 text-white hover:bg-sky-600 transition text-xs font-semibold flex items-center gap-1"
                          >
                            Next <ChevronRight className="h-4 w-4" />
                          </button>
                        ) : (
                          <button
                            onClick={submitMCQQuiz}
                            className="px-4 py-2 rounded-xl bg-sky-600 text-white font-bold text-xs shadow-md shadow-sky-200 hover:bg-sky-700 transition"
                          >
                            Submit Assessment
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  {/* RUNNING SUBJECTIVE */}
                  {quizType === 'subjective' && (
                    <div className="space-y-4 flex-1 flex flex-col justify-between">
                      <div className="flex justify-between items-center pb-2 border-b border-sky-100">
                        <span className="text-[9px] font-mono font-bold text-sky-700 bg-sky-100 px-2.5 py-0.5 rounded border border-sky-200 uppercase">
                          Subjective Evaluation
                        </span>
                        <span className="text-[9px] font-mono text-sky-700 bg-sky-100 px-2 py-0.5 rounded font-semibold">
                          {difficulty} level
                        </span>
                      </div>

                      <div className="my-2 space-y-1.5">
                        <h4 className="text-xs font-mono text-sky-700 font-bold">QUESTION STATEMENT</h4>
                        <p className="text-sm font-bold text-sky-950 leading-relaxed">{currentQuizData.question}</p>
                      </div>

                      {subjectiveResult ? (
                        <div className="p-4 rounded-2xl bg-sky-50/80 border border-sky-200 space-y-3 max-h-[260px] overflow-y-auto pr-1">
                          <div className="flex justify-between items-center">
                            <span className="text-[10px] text-sky-700 font-mono font-bold">GRADING COMPLETE</span>
                            <span className="text-xs font-bold text-sky-950 bg-white border border-sky-300 px-2.5 py-0.5 rounded-lg">
                              Score: {subjectiveResult.score} / {subjectiveResult.max_score}
                            </span>
                          </div>
                          
                          <div className="space-y-1 text-xs">
                            <span className="font-mono text-[9px] text-sky-700 font-bold">STRENGTHS:</span>
                            <p className="text-sky-900 leading-relaxed font-medium">{subjectiveResult.strengths}</p>
                          </div>
                          <div className="space-y-1 text-xs">
                            <span className="font-mono text-[9px] text-sky-600 font-bold">IMPROVEMENTS:</span>
                            <p className="text-sky-900 leading-relaxed font-medium">{subjectiveResult.improvements}</p>
                          </div>
                          <div className="space-y-1 text-xs pt-1.5 border-t border-sky-200">
                            <span className="font-mono text-[9px] text-sky-700 font-bold">MODEL HIGH-SCORE ANSWER:</span>
                            <p className="text-sky-800 italic leading-relaxed font-medium">{subjectiveResult.ideal_answer}</p>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-1.5">
                          <label className="text-[10px] text-sky-700 font-mono font-semibold">WRITE YOUR DETAILED ANSWER</label>
                          <textarea
                            value={subjectiveAnswer}
                            onChange={(e) => setSubjectiveAnswer(e.target.value)}
                            placeholder="Type your explanation or solution here..."
                            className="w-full h-32 p-3 rounded-2xl bg-sky-50/60 border border-sky-200 text-xs text-sky-950 placeholder-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-400/50 transition resize-none font-medium"
                          />
                        </div>
                      )}

                      <div className="flex justify-between items-center pt-3 border-t border-sky-100">
                        <button
                          onClick={() => setStep('setup')}
                          className="px-3.5 py-2 rounded-xl bg-sky-100 text-sky-700 hover:bg-sky-200 transition text-xs font-semibold"
                        >
                          Cancel
                        </button>
                        
                        {subjectiveResult ? (
                          <button
                            onClick={() => setStep('setup')}
                            className="px-4 py-2 rounded-xl bg-sky-500 text-white font-bold text-xs hover:bg-sky-600"
                          >
                            Reset Wizard
                          </button>
                        ) : (
                          <button
                            onClick={handleSubmitSubjective}
                            disabled={!subjectiveAnswer.trim()}
                            className="px-4 py-2 rounded-xl bg-sky-500 text-white font-bold text-xs disabled:opacity-40 hover:bg-sky-600"
                          >
                            Submit for AI Grading
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  {/* RUNNING CODING */}
                  {quizType === 'coding' && (
                    <div className="space-y-4 flex-1 flex flex-col justify-between">
                      <div className="flex justify-between items-center pb-2 border-b border-sky-100">
                        <span className="text-[9px] font-mono font-bold text-sky-700 bg-sky-100 px-2.5 py-0.5 rounded border border-sky-200 uppercase">
                          Coding Challenge
                        </span>
                        <span className="text-[9px] font-mono text-sky-700 bg-sky-100 px-2 py-0.5 rounded font-semibold">
                          {difficulty} level
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
                        <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
                          <div>
                            <h4 className="text-[9px] font-mono text-sky-700 font-bold">PROBLEM STATEMENT</h4>
                            <p className="text-xs text-sky-950 leading-relaxed font-semibold">{currentQuizData.problem_statement}</p>
                          </div>
                          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-sky-100 text-[10px] font-mono">
                            <div>
                              <span className="text-sky-700 font-bold">SAMPLE INPUT:</span>
                              <pre className="bg-sky-50 p-1.5 rounded-lg mt-0.5 text-sky-900 border border-sky-200/60 truncate">{currentQuizData.sample_input}</pre>
                            </div>
                            <div>
                              <span className="text-sky-700 font-bold">SAMPLE OUTPUT:</span>
                              <pre className="bg-sky-50 p-1.5 rounded-lg mt-0.5 text-sky-900 border border-sky-200/60 truncate">{currentQuizData.sample_output}</pre>
                            </div>
                          </div>
                        </div>

                        {codingResult ? (
                          <div className="p-4 rounded-2xl bg-sky-50/80 border border-sky-200 space-y-2.5 max-h-[220px] overflow-y-auto text-xs">
                            <div className="flex justify-between items-center">
                              <span className={`font-mono text-[9px] font-extrabold px-2 py-0.5 rounded border ${
                                codingResult.passed 
                                  ? 'text-sky-700 bg-sky-100 border-sky-300' 
                                  : 'text-rose-600 bg-rose-50 border-rose-200'
                              }`}>
                                {codingResult.passed ? 'PASSED' : 'FAILED'}
                              </span>
                              <span className="font-mono text-[9px] text-sky-600 font-bold">{codingResult.complexity_analysis}</span>
                            </div>
                            <p className="text-sky-900 leading-relaxed font-medium">{codingResult.feedback}</p>
                            <div className="pt-2 border-t border-sky-200">
                              <span className="text-[9px] text-sky-700 font-mono font-bold">CORRECT SOLUTION:</span>
                              <pre className="bg-white p-2 rounded-xl mt-1 font-mono text-[10px] text-sky-900 border border-sky-200 overflow-x-auto">{codingResult.correct_version}</pre>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-1.5 flex flex-col">
                            <label className="text-[10px] text-sky-700 font-mono font-semibold">PYTHON 3 SOLUTION EDITOR</label>
                            <textarea
                              value={codingSolution}
                              onChange={(e) => setCodingSolution(e.target.value)}
                              className="w-full flex-1 min-h-[160px] p-3 rounded-2xl bg-sky-50/80 border border-sky-200 font-mono text-[11px] text-sky-950 focus:outline-none focus:ring-2 focus:ring-sky-400/50 transition resize-none"
                            />
                          </div>
                        )}
                      </div>

                      <div className="flex justify-between items-center pt-3 border-t border-sky-100">
                        <button
                          onClick={() => setStep('setup')}
                          className="px-3.5 py-2 rounded-xl bg-sky-100 text-sky-700 hover:bg-sky-200 transition text-xs font-semibold"
                        >
                          Cancel
                        </button>
                        
                        {codingResult ? (
                          <button
                            onClick={() => setStep('setup')}
                            className="px-4 py-2 rounded-xl bg-sky-500 text-white font-bold text-xs hover:bg-sky-600"
                          >
                            Reset Wizard
                          </button>
                        ) : (
                          <button
                            onClick={handleSubmitCoding}
                            disabled={!codingSolution.trim()}
                            className="px-4 py-2 rounded-xl bg-sky-500 text-white font-bold text-xs disabled:opacity-40 hover:bg-sky-600"
                          >
                            Submit Code to Judge
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                </div>
              )}

              {/* RESULTS STEP */}
              {step === 'results' && (
                <div className="space-y-5 text-center flex-1 flex flex-col justify-between py-4">
                  <div className="space-y-3">
                    <div className="h-14 w-14 rounded-full bg-sky-100 border border-sky-200 text-sky-600 flex items-center justify-center mx-auto shadow-md animate-bounce">
                      <Award className="h-8 w-8" />
                    </div>
                    <div>
                      <h3 className="font-display font-extrabold text-base text-sky-950">Assessment Complete!</h3>
                      <p className="text-[11px] text-sky-700/80 mt-0.5">Your responses have been processed by GyaanSetu AI evaluation engines.</p>
                    </div>

                    <div className="inline-block bg-sky-50 border border-sky-200 rounded-2xl p-4 mt-2">
                      <div className="text-[10px] text-sky-600 uppercase font-mono font-bold">Final Score</div>
                      <div className="text-3xl font-extrabold text-sky-600 mt-1">
                        {quizScore} <span className="text-sm text-sky-400 font-normal">/ {totalQuestions}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setStep('setup')}
                    className="w-full py-3 rounded-xl bg-sky-500 text-white font-bold text-xs hover:bg-sky-600 transition"
                  >
                    Start Another Assessment
                  </button>
                </div>
              )}

            </div>
          </div>

          {/* Right Column: Domains Grid & Leaderboard */}
          <div className="lg:col-span-4 space-y-6 flex flex-col justify-between">
            
            {/* Leaderboard Panel */}
            <div className="bg-white border border-sky-200 rounded-3xl shadow-md shadow-sky-100/50 p-6 space-y-4">
              <div>
                <h3 className="font-display font-extrabold text-base text-sky-950 flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-sky-500 fill-sky-100" /> Focus Leaderboard
                </h3>
                <p className="text-[11px] text-sky-700/80 mt-0.5 font-medium">Compete with friends and study groups globally</p>
              </div>

              <div className="space-y-2.5">
                {leaderboard.map((item, idx) => {
                  const isUser = item.name.includes("You");
                  return (
                    <div 
                      key={idx}
                      className={`flex items-center justify-between p-3 rounded-2xl border transition ${
                        isUser 
                          ? 'bg-sky-500 text-white border-sky-500 shadow-sm shadow-sky-200' 
                          : 'bg-sky-50/60 border-sky-200/80 text-sky-950 hover:bg-sky-100/60'
                      }`}
                    >
                      <div className="flex items-center gap-3 truncate">
                        <span className={`text-[10px] font-mono font-extrabold h-6 w-6 rounded-full flex items-center justify-center shrink-0 ${
                          isUser ? 'bg-white text-sky-600' :
                          item.rank === 1 ? 'bg-sky-500 text-white' :
                          item.rank === 2 ? 'bg-sky-400 text-white' :
                          item.rank === 3 ? 'bg-sky-300 text-sky-950' :
                          'bg-sky-100 text-sky-700'
                        }`}>
                          {item.rank}
                        </span>
                        <div className="truncate">
                          <div className={`text-xs font-bold truncate ${isUser ? 'text-white' : 'text-sky-950'}`}>{item.name}</div>
                          <span className={`text-[9px] font-mono ${isUser ? 'text-sky-100' : 'text-sky-600 font-semibold'}`}>{item.subject}</span>
                        </div>
                      </div>
                      <span className={`text-xs font-extrabold font-mono ${isUser ? 'text-white' : 'text-sky-600'}`}>{item.score}%</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Information / Domain Tags */}
            <div className="bg-white border border-sky-200 rounded-3xl shadow-md shadow-sky-100/50 p-6 space-y-3">
              <div>
                <h4 className="font-display font-extrabold text-xs text-sky-950">Active Assessment Domains</h4>
                <p className="text-[10px] text-sky-700/80 leading-normal font-medium mt-0.5">DeepSeek-R1 supports all 4 structured assessment domains below.</p>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                {DOMAINS.map((domain) => (
                  <div 
                    key={domain.id}
                    onClick={() => { if (step === 'setup') setQuizType(domain.id); }}
                    className={`p-3 rounded-2xl border text-left cursor-pointer transition ${
                      quizType === domain.id
                        ? 'bg-sky-500 border-sky-500 text-white shadow-sm shadow-sky-200'
                        : 'bg-sky-50/60 border-sky-200 text-sky-900 hover:bg-sky-100'
                    }`}
                  >
                    <div className="text-[10px] font-extrabold flex items-center justify-between">
                      <span className="truncate">{domain.title.split(" ")[0]}</span>
                      <span className={`text-[7px] font-mono border px-1 py-0.5 rounded uppercase tracking-wider font-bold ${
                        quizType === domain.id ? 'bg-white/20 text-white border-white/30' : 'bg-sky-100 text-sky-700 border-sky-200'
                      }`}>
                        {domain.tag.split(" ")[0]}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>

      </div>
    </AppLayout>
  );
}
