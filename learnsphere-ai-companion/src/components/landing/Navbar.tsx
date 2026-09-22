import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Menu, X, ArrowRight, Sparkles, UserCheck } from "lucide-react";
import { AnnouncementBar } from "./AnnouncementBar";

export type SectionKey =
  | "home"
  | "product"
  | "ai-tutor"
  | "learning"
  | "students"
  | "educators"
  | "resources";

interface NavbarProps {
  activeSection: SectionKey;
  setActiveSection: (section: SectionKey) => void;
}

export function Navbar({ activeSection, setActiveSection }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems: { key: SectionKey; label: string }[] = [
    { key: "home", label: "Home" },
    { key: "product", label: "Features" },
    { key: "ai-tutor", label: "AI Tutor" },
    { key: "learning", label: "Adaptive Paths" },
    { key: "students", label: "For Students" },
    { key: "educators", label: "For Educators" },
    { key: "resources", label: "Resources" }
  ];

  const handleSelect = (key: SectionKey) => {
    setActiveSection(key);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 transition-all font-sans bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      
      {/* 01. Modern SaaS Announcement Banner */}
      <AnnouncementBar />

      {/* 02. Main Clean SaaS Navigation Header */}
      <div className="py-3.5 px-6 md:px-12 lg:px-16">
        <div className="w-full max-w-[1800px] mx-auto flex items-center justify-between">
          
          {/* Brand Logo & Wordmark */}
          <Link
            to="/"
            onClick={() => handleSelect("home")}
            className="flex items-center gap-3 group cursor-pointer"
          >
            <img
              src="/Gyaansetu AI logo.png"
              alt="GyaanSetu-AI Logo"
              className="h-10 w-10 object-contain rounded-2xl bg-white p-0.5 shadow-md border border-slate-200 group-hover:scale-105 transition-transform"
            />

            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-display font-extrabold text-xl text-slate-900 tracking-tight leading-none group-hover:text-blue-600 transition-colors">
                  GyaanSetu<span className="text-blue-600">.AI</span>
                </span>
                <span className="text-[10px] font-bold text-blue-600 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">
                  PRO
                </span>
              </div>
              <div className="text-[11px] text-slate-500 font-medium tracking-wide mt-0.5">
                The Personalised AI Learning Companion
              </div>
            </div>
          </Link>

          {/* Desktop Section Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 bg-slate-100/80 p-1.5 rounded-2xl border border-slate-200">
            {navItems.map((item) => {
              const isSelected = activeSection === item.key;
              return (
                <button
                  key={item.key}
                  onClick={() => handleSelect(item.key)}
                  className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    isSelected
                      ? "bg-white text-blue-600 shadow-sm font-bold scale-[1.02]"
                      : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Desktop SaaS Auth CTAs */}
          <div className="hidden sm:flex items-center gap-4">
            <Link
              to="/auth"
              search={{ mode: "login" }}
              className="text-xs sm:text-sm font-semibold text-slate-700 hover:text-blue-600 px-3 py-2 rounded-xl transition-colors"
            >
              Sign In
            </Link>
            <Link
              to="/auth"
              search={{ mode: "register" }}
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm px-5 py-2.5 rounded-xl shadow-md shadow-blue-600/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>Get Started Free</span> <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Mobile Hamburger Button */}
          <div className="flex lg:hidden items-center gap-2">
            <Link
              to="/auth"
              search={{ mode: "register" }}
              className="sm:hidden inline-flex items-center gap-1 bg-blue-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg"
            >
              Get Started
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-700 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white border-b border-slate-200 px-6 py-6 shadow-2xl space-y-4 mt-3 rounded-2xl">
            <div className="text-xs font-mono text-slate-400 font-bold uppercase tracking-wider">
              Navigation:
            </div>
            <div className="flex flex-col gap-2 text-sm font-medium text-slate-700">
              {navItems.map((item) => (
                <button
                  key={item.key}
                  onClick={() => handleSelect(item.key)}
                  className={`text-left px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors flex items-center justify-between ${
                    activeSection === item.key
                      ? "bg-blue-50 text-blue-600 font-bold"
                      : "hover:bg-slate-50 text-slate-700"
                  }`}
                >
                  <span>{item.label}</span>
                  {activeSection === item.key && <Sparkles className="w-4 h-4 text-blue-600" />}
                </button>
              ))}
            </div>

            <div className="pt-4 border-t border-slate-200 flex flex-col gap-2.5">
              <Link
                to="/auth"
                search={{ mode: "login" }}
                className="w-full text-center py-2.5 rounded-xl border border-slate-300 font-semibold text-xs text-slate-700 hover:bg-slate-50"
              >
                Sign In to Account
              </Link>
              <Link
                to="/auth"
                search={{ mode: "register" }}
                className="w-full text-center py-2.5 rounded-xl bg-blue-600 font-bold text-xs text-white hover:bg-blue-700 shadow-sm"
              >
                Create Free Account
              </Link>
            </div>
          </div>
        )}
      </div>

    </header>
  );
}
