import { Sparkles, ArrowRight } from "lucide-react";
import { Link } from "@tanstack/react-router";

export function AnnouncementBar() {
  return (
    <div className="bg-slate-900 text-white border-b border-slate-800 py-2 px-4 sm:px-8 text-xs font-sans relative z-40">
      <div className="w-full max-w-[1800px] mx-auto flex items-center justify-between gap-3">
        
        <div className="flex items-center gap-2.5 mx-auto sm:mx-0">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-bold text-[10px] uppercase tracking-wider border border-blue-500/30">
            <Sparkles className="w-3 h-3 text-blue-400" />
            <span>New Feature</span>
          </span>
          <span className="text-slate-200 font-medium text-xs sm:text-sm">
            GyaanSetu v2.5 is live — Experience 22+ regional languages & instant Voice AI tutoring!
          </span>
          <Link
            to="/auth"
            search={{ mode: "register" }}
            className="hidden sm:inline-flex items-center gap-1 font-semibold text-blue-400 hover:text-blue-300 text-xs ml-1 transition-colors"
          >
            <span>Try it free</span> <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="hidden md:flex items-center gap-4 text-xs text-slate-400">
          <span className="font-medium text-emerald-400">⚡ 100k+ Active Learners</span>
          <span>•</span>
          <span className="text-slate-300">4.9 ★★★★★ Rating</span>
        </div>

      </div>
    </div>
  );
}
