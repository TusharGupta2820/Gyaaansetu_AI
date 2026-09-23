import React, { useState, useEffect } from 'react';
import { Search, X, Sparkles, BookOpen, Shuffle, Loader2, ArrowRight, Layers, Tag } from 'lucide-react';
import { fetchLeetCodeProblemList, fetchRandomLeetCodeProblem, generateAiLeetCodeProblem } from '@/services/openSourceService';
import type { InterviewProblem, InterviewLanguage } from '@/types';

interface ProblemBankModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectProblem: (problem: InterviewProblem) => void;
}

export const ProblemBankModal: React.FC<ProblemBankModalProps> = ({
  isOpen,
  onClose,
  onSelectProblem,
}) => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');
  const [problems, setProblems] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>(['All']);
  const [isLoading, setIsLoading] = useState(false);

  // AI Custom Problem Generation state
  const [aiTopic, setAiTopic] = useState('');
  const [aiDifficulty, setAiDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Medium');
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadProblems();
    }
  }, [isOpen, search, selectedCategory, selectedDifficulty]);

  const loadProblems = async () => {
    setIsLoading(true);
    try {
      const data = await fetchLeetCodeProblemList(search, selectedCategory, selectedDifficulty);
      setProblems(data.problems || []);
      setCategories(data.categories || ['All']);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRandomSelect = async () => {
    setIsLoading(true);
    try {
      const randomProb = await fetchRandomLeetCodeProblem(
        selectedDifficulty !== 'All' ? selectedDifficulty : undefined,
        selectedCategory !== 'All' ? selectedCategory : undefined
      );
      if (randomProb) {
        onSelectProblem({
          id: randomProb.id,
          title: randomProb.title,
          description: randomProb.description,
          difficulty: randomProb.difficulty as 'Easy' | 'Medium' | 'Hard',
          starters: randomProb.starters
        });
        onClose();
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateAi = async () => {
    if (!aiTopic.trim()) return;
    setIsGeneratingAi(true);
    try {
      const generated = await generateAiLeetCodeProblem(aiTopic, aiDifficulty);
      if (generated) {
        onSelectProblem({
          id: generated.id,
          title: generated.title,
          description: generated.description,
          difficulty: generated.difficulty as 'Easy' | 'Medium' | 'Hard',
          starters: generated.starters
        });
        setAiTopic('');
        onClose();
      }
    } finally {
      setIsGeneratingAi(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-sky-950/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-white border border-sky-300 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-sky-950">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-sky-200 bg-sky-100/90 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-sky-200 border border-sky-300 text-sky-700">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-sky-950 flex items-center gap-2">
                LeetCode Practice Bank <span className="text-xs px-2 py-0.5 rounded-full bg-sky-200 text-sky-900 border border-sky-300 font-bold">1000+ Problems</span>
              </h2>
              <p className="text-xs text-sky-700 font-medium">Search, filter, or randomly pick coding interview questions.</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleRandomSelect}
              disabled={isLoading}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-700 active:bg-sky-800 text-white font-bold text-xs shadow-md border border-sky-500 transition-all disabled:opacity-50"
              title="Pick a random practice question"
            >
              <Shuffle className="w-3.5 h-3.5" />
              <span>Random Problem</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-sky-700 hover:text-sky-950 hover:bg-sky-200/60 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Search & Filters Toolbar */}
        <div className="p-5 border-b border-sky-200 bg-sky-50/70 space-y-4 shrink-0">
          {/* Search bar & AI generator row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="md:col-span-2 relative">
              <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-sky-500" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search LeetCode problems (e.g., Two Sum, DP, Graphs, SQL)..."
                className="w-full bg-white border border-sky-300 rounded-xl pl-10 pr-4 py-2.5 text-xs text-sky-950 placeholder-sky-400 focus:outline-none focus:border-sky-500 font-semibold shadow-sm"
              />
            </div>

            {/* AI Generator trigger */}
            <div className="flex items-center gap-2 bg-white border border-sky-300 rounded-xl p-1.5 shadow-sm">
              <input
                type="text"
                value={aiTopic}
                onChange={(e) => setAiTopic(e.target.value)}
                placeholder="AI Topic (e.g. Trie)..."
                className="flex-1 bg-transparent text-xs text-sky-950 placeholder-sky-400 px-2 focus:outline-none font-medium"
              />
              <button
                onClick={handleGenerateAi}
                disabled={isGeneratingAi || !aiTopic.trim()}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white font-bold text-[11px] rounded-lg transition-all shadow-sm border border-sky-500 disabled:opacity-40 shrink-0"
              >
                {isGeneratingAi ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3 text-sky-200" />}
                <span>AI Generate</span>
              </button>
            </div>
          </div>

          {/* Category & Difficulty Filter Pills */}
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
            {/* Category Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full no-scrollbar">
              <span className="text-[10px] uppercase font-bold text-sky-800 flex items-center gap-1 mr-1">
                <Layers className="w-3 h-3" /> Category:
              </span>
              {categories.slice(0, 8).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1 rounded-full text-[11px] font-bold whitespace-nowrap transition-all border ${
                    selectedCategory === cat
                      ? 'bg-sky-600 text-white border-sky-500 shadow-sm'
                      : 'bg-white text-sky-900 border-sky-300 hover:bg-sky-100'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Difficulty Pills */}
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="text-[10px] uppercase font-bold text-sky-800 flex items-center gap-1 mr-1">
                <Tag className="w-3 h-3" /> Difficulty:
              </span>
              {['All', 'Easy', 'Medium', 'Hard'].map((diff) => (
                <button
                  key={diff}
                  onClick={() => setSelectedDifficulty(diff)}
                  className={`px-3 py-1 rounded-full text-[11px] font-bold transition-all border ${
                    selectedDifficulty === diff
                      ? 'bg-sky-600 text-white border-sky-500 shadow-sm'
                      : 'bg-white text-sky-900 border-sky-300 hover:bg-sky-100'
                  }`}
                >
                  {diff}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Problem List Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3 bg-sky-50/50">
          {isLoading ? (
            <div className="py-12 flex flex-col items-center justify-center text-sky-700 gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-sky-600" />
              <p className="text-xs font-bold">Loading LeetCode problems catalog...</p>
            </div>
          ) : problems.length === 0 ? (
            <div className="py-12 flex flex-col items-center justify-center text-sky-700 text-center space-y-2">
              <p className="text-sm font-bold text-sky-950">No problems found matching your filters.</p>
              <p className="text-xs text-sky-700">Try adjusting your search query or selecting a different category.</p>
            </div>
          ) : (
            problems.map((p) => {
              const diffColor =
                p.difficulty === 'Easy'
                  ? 'bg-sky-100 text-sky-800 border-sky-300'
                  : p.difficulty === 'Medium'
                    ? 'bg-sky-200 text-sky-900 border-sky-400'
                    : 'bg-sky-300 text-sky-950 border-sky-500';

              return (
                <div
                  key={p.id}
                  className="group p-4 bg-white border border-sky-200 hover:border-sky-400 rounded-xl transition-all shadow-sm hover:shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5 max-w-2xl">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm font-extrabold text-sky-950 group-hover:text-sky-700 transition-colors">
                        {p.title}
                      </h3>
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${diffColor} uppercase tracking-wider`}>
                        {p.difficulty}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 border border-sky-300">
                        {p.category}
                      </span>
                    </div>
                    <p className="text-xs text-sky-800 line-clamp-2 leading-relaxed font-medium">
                      {p.description}
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      const starters = p.starters || {};
                      onSelectProblem({
                        id: p.id,
                        title: p.title,
                        description: p.description,
                        difficulty: p.difficulty,
                        starters: starters
                      });
                      onClose();
                    }}
                    className="flex items-center justify-center gap-1.5 px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl border border-sky-500 transition-all shrink-0 shadow-sm"
                  >
                    <span>Solve Problem</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Footer info */}
        <div className="px-6 py-3 border-t border-sky-200 bg-sky-100 text-[11px] text-sky-800 font-bold flex items-center justify-between shrink-0">
          <span>Showing <strong>{problems.length}</strong> practice problems</span>
          <span>Press <kbd className="px-1.5 py-0.5 bg-white rounded border border-sky-300 font-mono text-[10px] text-sky-950 font-bold">Esc</kbd> to close</span>
        </div>

      </div>
    </div>
  );
};

export default ProblemBankModal;
