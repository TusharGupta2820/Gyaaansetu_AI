import { type ReactNode, useEffect, useState } from "react";
import { Sidebar } from "./Sidebar";
import { Bell, Search, Command, Menu } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";

export function AppLayout({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const [authorized, setAuthorized] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const user = localStorage.getItem("gyaansetu_user");
    if (!user) {
      navigate({ to: "/auth" });
    } else {
      setAuthorized(true);
    }
  }, [navigate]);

  if (!authorized) {
    return (
      <div className="flex min-h-screen w-full bg-[#050816] items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-t-transparent border-[#00f5ff] rounded-full" />
      </div>
    );
  }
  return (
    <div className="flex min-h-screen w-full bg-slate-50">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 min-w-0 flex flex-col">
        <header className="sticky top-0 z-30 h-16 flex items-center gap-3 px-4 lg:px-8 border-b border-slate-200/80 bg-white/80 backdrop-blur-xl">
          {/* Mobile menu trigger */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden bg-slate-100 hover:bg-slate-200/85 text-slate-600 rounded-lg p-2 transition mr-1"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          
          <div className="hidden lg:flex items-center gap-2 flex-1 max-w-md ml-0">
            <div className="bg-slate-100/80 border border-slate-200/40 flex-1 flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-800">
              <Search className="h-4 w-4 text-slate-400" />
              <input
                placeholder="Search anything…"
                className="flex-1 bg-transparent outline-none placeholder:text-slate-400 text-slate-800"
              />
              <kbd className="hidden md:inline-flex items-center gap-1 text-[10px] text-slate-500 bg-slate-200/60 rounded px-1.5 py-0.5">
                <Command className="h-3 w-3" /> K
              </kbd>
            </div>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <button className="bg-slate-100 text-slate-600 hover:bg-slate-200/85 relative rounded-lg p-2 transition">
              <Bell className="h-4 w-4" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-[#FF00AA]" />
            </button>
            <div className="bg-slate-100 text-slate-700 rounded-lg px-3 py-1.5 text-xs font-mono">
              <span className="text-emerald-500">●</span> Online
            </div>
          </div>
        </header>
        <main className="flex-1 px-4 lg:px-8 py-6 lg:py-8">{children}</main>
      </div>
    </div>
  );
}

