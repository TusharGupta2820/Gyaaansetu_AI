import { Link, useRouterState } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, Bot, User, Compass, Home, HeartPulse, BookOpen, Search,
  Smile, TrendingUp, FolderKanban, FileQuestion, Radar, Swords, GraduationCap,
  Calendar, Network, Mic, LogOut, Menu, X, Award
} from "lucide-react";
import { useState, useEffect } from "react";

const nav = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/avatar", label: "Avatar", icon: User },
  { to: "/career", label: "Career Path", icon: Compass },
  { to: "/vault", label: "Certificate Vault", icon: Award },
  { to: "/tutor", label: "Doubt Solver", icon: Bot },
  { to: "/focus", label: "Focus Room", icon: Home },
  { to: "/health", label: "Health Monitor", icon: HeartPulse },
  { to: "/learning", label: "Learning Path", icon: BookOpen },
  { to: "/mistakes", label: "Mistake Analyzer", icon: Search },
  { to: "/mood", label: "Mood Assistant", icon: Smile },
  { to: "/performance", label: "Performance", icon: TrendingUp },
  { to: "/projects", label: "Project Helper", icon: FolderKanban },
  { to: "/quiz", label: "Quiz Maker", icon: FileQuestion },
  { to: "/skills", label: "Skill Radar", icon: Radar },
  { to: "/wars", label: "Study Wars", icon: Swords },
  { to: "/teach", label: "Teach Back", icon: GraduationCap },
  { to: "/timetable", label: "Time Table", icon: Calendar },
  { to: "/visualizer", label: "Visualizer", icon: Network },
  { to: "/voice", label: "Voice Notes", icon: Mic },
];

interface SidebarProps {
  open?: boolean;
  onClose?: () => void;
}

export function Sidebar({ open: mobileOpen = false, onClose }: SidebarProps) {
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  const [userName, setUserName] = useState("Student");
  const [streakDays, setStreakDays] = useState(0);
  const [level, setLevel] = useState(1);
  const [xp, setXp] = useState(0);

  useEffect(() => {
    const userStr = localStorage.getItem("gyaansetu_user");
    if (userStr) {
      try {
        const userObj = JSON.parse(userStr);
        if (userObj.name) setUserName(userObj.name);
      } catch (e) {
        // ignore
      }
    }

    const statsStr = localStorage.getItem("gyaansetu_stats");
    if (statsStr) {
      try {
        const statsObj = JSON.parse(statsStr);
        if (statsObj.streakDays !== undefined) setStreakDays(statsObj.streakDays);
        const studyHours = statsObj.studyHours || 0;
        const computedXp = Math.floor(studyHours * 100);
        setXp(computedXp);
        setLevel(Math.floor(computedXp / 1000) + 1);
      } catch (e) {
        // ignore
      }
    }
  }, []);

  return (
    <>
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="lg:hidden fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
            onClick={() => onClose?.()}
          />
        )}
      </AnimatePresence>

      <aside
        className={`fixed lg:sticky top-0 left-0 z-50 h-screen w-64 flex flex-col bg-[#0b1530] border-r border-blue-500/20 transition-transform duration-300 shadow-2xl ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
          }`}
      >
        {/* Logo / Brand */}
        <div className="flex items-center justify-between px-5 py-5 border-b border-blue-500/20">
          <Link to="/" className="flex items-center gap-3" onClick={() => onClose?.()}>
            <img
              src="/Gyaansetu AI logo.png"
              alt="GyaanSetu AI"
              className="h-9 w-9 rounded-xl object-contain bg-white p-0.5 shadow-md shrink-0"
            />
            <div>
              <div className="font-display font-bold text-sm leading-none text-white tracking-wide">
                GyaanSetu AI
              </div>
              <div className="text-[8px] text-blue-300/60 mt-1 uppercase font-mono tracking-widest">
                Personalized Learning
              </div>
            </div>
          </Link>
          <button onClick={() => onClose?.()} className="lg:hidden p-1 text-blue-300 hover:text-white transition">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Nav items */}
        <nav className="flex-1 overflow-y-auto scrollbar-thin px-3 py-4 space-y-0.5">
          {nav.map((item) => {
            const active = pathname === item.to;
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => onClose?.()}
                className={`group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all duration-200 ${active
                    ? "bg-[#3b82f6]/10 border border-[#3b82f6]/25 text-white font-semibold shadow-[0_0_12px_rgba(59,130,246,0.08)]"
                    : "text-blue-200/60 hover:text-white hover:bg-white/5 border border-transparent"
                  }`}
              >
                {/* Active indicator bar */}
                {active && (
                  <motion.div
                    layoutId="sidebar-active"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-full bg-[#3b82f6]"
                  />
                )}
                <Icon
                  className={`h-4 w-4 shrink-0 transition-colors ${active ? "text-[#3b82f6]" : "text-blue-300/50 group-hover:text-blue-200"
                    }`}
                />
                <span className="font-medium truncate">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User card */}
        <div className="p-3 border-t border-blue-500/20">
          <div className="bg-[#050d1f] border border-blue-500/20 rounded-2xl p-3.5">
            <div className="flex items-center gap-3">
              <div className="relative shrink-0">
                <div className="h-9 w-9 rounded-full bg-gradient-to-br from-[#3b82f6] to-[#6366f1] flex items-center justify-center font-bold text-sm text-[#050816] shadow-md">
                  {userName.charAt(0).toUpperCase()}
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-[#22C55E] border-2 border-[#0b1530]" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-semibold truncate text-white">{userName}</div>
                <div className="text-[10px] text-blue-300/60 flex items-center gap-1 mt-0.5">
                  <span className="text-amber-400">🔥</span>
                  <span>{streakDays} day streak</span>
                </div>
              </div>
              <button
                onClick={() => {
                  localStorage.removeItem("gyaansetu_user");
                  localStorage.removeItem("gyaansetu_stats");
                  document.cookie = "gyaansetu_user_id=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
                  window.location.href = "/";
                }}
                className="text-blue-300/40 hover:text-red-400 transition"
                aria-label="Logout"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>

            {/* XP Progress Bar */}
            <div className="mt-3 flex items-center justify-between text-[10px] mb-1.5">
              <span className="text-blue-300/50 font-mono">Level {level}</span>
              <span className="text-[#3b82f6] font-mono font-bold">{xp.toLocaleString()} XP</span>
            </div>
            <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(xp % 1000) / 10}%` }}
                transition={{ duration: 1.2, ease: "easeOut" }}
                className="h-full rounded-full bg-gradient-to-r from-[#3b82f6] to-[#6366f1]"
              />
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
