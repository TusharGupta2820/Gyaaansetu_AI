import { type ReactNode, useEffect, useState } from "react";
import { Sidebar } from "./Sidebar";
import { Bell, Search, Command, Menu, Sun, Moon } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";

export function AppLayout({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const [authorized, setAuthorized] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [theme, setTheme] = useState<"dark" | "light">("light");

  useEffect(() => {
    const user = localStorage.getItem("gyaansetu_user");
    if (!user) {
      navigate({ to: "/auth" });
    } else {
      setAuthorized(true);
    }

    const savedTheme = (localStorage.getItem("gyaansetu_theme") as "dark" | "light") || "light";
    setTheme(savedTheme);
    if (savedTheme === "light") {
      document.documentElement.classList.remove("dark");
      document.documentElement.classList.add("light");
    } else {
      document.documentElement.classList.remove("light");
      document.documentElement.classList.add("dark");
    }
  }, [navigate]);

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    localStorage.setItem("gyaansetu_theme", nextTheme);
    if (nextTheme === "light") {
      document.documentElement.classList.remove("dark");
      document.documentElement.classList.add("light");
    } else {
      document.documentElement.classList.remove("light");
      document.documentElement.classList.add("dark");
    }
  };

  if (!authorized) {
    return (
      <div className="flex min-h-screen w-full bg-[#050816] items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-t-transparent border-[#3b82f6] rounded-full" />
      </div>
    );
  }

  const isLight = theme === "light";

  return (
    <div className={`flex min-h-screen w-full transition-colors duration-300 ${
      isLight
        ? "bg-[#f0f9ff] text-slate-900 selection:bg-sky-200 selection:text-sky-900"
        : "bg-[#050816] text-[#dde2f8] selection:bg-[#3b82f6]/20 selection:text-white"
    }`}>
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} theme={theme} />
      <div className={`flex-1 min-w-0 flex flex-col ${isLight ? "bg-[#f0f9ff]" : "bg-[#050816]"}`}>
        <header className={`sticky top-0 z-40 h-16 flex items-center gap-3 px-4 lg:px-8 border-b backdrop-blur-xl transition-colors duration-300 ${
          isLight
            ? "bg-white/90 border-sky-200/80 text-slate-800 shadow-xs"
            : "bg-[#0b1530]/90 border-blue-500/20 text-white"
        }`}>
          {/* Mobile menu trigger */}
          <button
            onClick={() => setSidebarOpen(true)}
            className={`lg:hidden rounded-xl p-2 transition mr-1 ${
              isLight ? "bg-sky-100 hover:bg-sky-200 text-sky-800" : "bg-white/5 hover:bg-white/10 text-blue-200"
            }`}
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          
          <div className="hidden lg:flex items-center gap-2 flex-1 max-w-md ml-0">
            <div className={`flex-1 flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm transition-colors ${
              isLight
                ? "bg-sky-50 border border-sky-200 text-slate-800 focus-within:border-sky-500"
                : "bg-[#050816]/60 border border-blue-500/20 text-white focus-within:border-[#3b82f6]/50"
            }`}>
              <Search className={`h-4 w-4 ${isLight ? "text-sky-500" : "text-blue-400/60"}`} />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tools, topics, notes…"
                className={`flex-1 bg-transparent outline-none text-sm ${
                  isLight ? "placeholder:text-slate-400 text-slate-800" : "placeholder:text-blue-300/40 text-white"
                }`}
              />
              <kbd className={`hidden md:inline-flex items-center gap-1 text-[10px] rounded px-1.5 py-0.5 font-mono ${
                isLight
                  ? "text-sky-700 bg-sky-100 border border-sky-200"
                  : "text-blue-300/60 bg-white/5 border border-white/10"
              }`}>
                <Command className="h-3 w-3" /> K
              </kbd>
            </div>
          </div>

          <div className="ml-auto flex items-center gap-2.5">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className={`px-3 py-2 rounded-xl border text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                isLight
                  ? "bg-white border-sky-300 text-sky-800 hover:bg-sky-50 shadow-xs"
                  : "bg-white/5 border-white/10 text-amber-400 hover:bg-white/10"
              }`}
              title={isLight ? "Switch to Deep Navy Dark Mode" : "Switch to Sky Blue Light Mode"}
            >
              {isLight ? (
                <>
                  <Sun className="h-4 w-4 text-amber-500 animate-spin-slow" />
                  <span className="hidden sm:inline font-bold">Sky Light</span>
                </>
              ) : (
                <>
                  <Moon className="h-4 w-4 text-sky-400" />
                  <span className="hidden sm:inline font-bold">Navy Dark</span>
                </>
              )}
            </button>

            {/* Notifications button */}
            <div className="relative">
              <button 
                onClick={() => setNotificationsOpen(prev => !prev)}
                className={`relative rounded-xl p-2.5 border transition ${
                  isLight
                    ? "bg-white border-sky-200 text-slate-700 hover:bg-sky-50"
                    : "bg-white/5 border-white/10 text-blue-200 hover:bg-white/10"
                }`}
                aria-label="Notifications"
              >
                <Bell className="h-4 w-4" />
                <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-sky-500 animate-pulse" />
              </button>

              {notificationsOpen && (
                <div className={`absolute right-0 mt-2 w-80 rounded-2xl p-4 shadow-2xl z-50 border ${
                  isLight ? "bg-white border-sky-200 text-slate-800" : "bg-[#0b1530] border-blue-500/30 text-white"
                }`}>
                  <div className={`flex items-center justify-between pb-2 mb-3 border-b ${
                    isLight ? "border-sky-100" : "border-white/10"
                  }`}>
                    <span className={`font-bold text-xs ${isLight ? "text-slate-900" : "text-white"}`}>Notifications</span>
                    <span className="text-[10px] text-sky-600 font-mono font-bold">3 New</span>
                  </div>
                  <div className="space-y-2.5 text-xs">
                    <div className={`p-2.5 rounded-xl border ${
                      isLight ? "bg-sky-50/80 border-sky-100 text-slate-800" : "bg-white/5 border-white/5 text-white"
                    }`}>
                      <div className="font-semibold">🔥 3 Day Streak Achieved!</div>
                      <div className={`text-[10px] mt-0.5 ${isLight ? "text-slate-500" : "text-blue-300/60"}`}>Keep up your daily study sessions.</div>
                    </div>
                    <div className={`p-2.5 rounded-xl border ${
                      isLight ? "bg-sky-50/80 border-sky-100 text-slate-800" : "bg-white/5 border-white/5 text-white"
                    }`}>
                      <div className="font-semibold">📚 Learning Path Updated</div>
                      <div className={`text-[10px] mt-0.5 ${isLight ? "text-slate-500" : "text-blue-300/60"}`}>AI tailored 2 new exercises for Computer Science.</div>
                    </div>
                    <div className={`p-2.5 rounded-xl border ${
                      isLight ? "bg-sky-50/80 border-sky-100 text-slate-800" : "bg-white/5 border-white/5 text-white"
                    }`}>
                      <div className="font-semibold">🏆 Badge Unlocked</div>
                      <div className={`text-[10px] mt-0.5 ${isLight ? "text-slate-500" : "text-blue-300/60"}`}>Pomodoro Knight completed.</div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className={`rounded-xl px-3 py-1.5 text-xs font-mono flex items-center gap-2 border ${
              isLight
                ? "bg-white border-sky-200 text-sky-800 font-bold shadow-2xs"
                : "bg-[#050816] border-blue-500/20 text-blue-200"
            }`}>
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" /> Online
            </div>
          </div>
        </header>
        <main className={`flex-1 px-4 lg:px-8 py-6 lg:py-8 transition-colors ${
          isLight ? "bg-[#f0f9ff]" : "bg-[#050816]"
        }`}>{children}</main>
      </div>
    </div>
  );
}

