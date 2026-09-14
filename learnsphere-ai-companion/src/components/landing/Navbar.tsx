import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Menu, X, ArrowRight, Sparkles } from "lucide-react";

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
    { key: "product", label: "Product" },
    { key: "ai-tutor", label: "AI Tutor" },
    { key: "learning", label: "Learning" },
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
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#0b1530] text-white border-b border-blue-900/60 shadow-xl py-3.5 transition-all">
      <div className="w-full max-w-[1800px] mx-auto px-6 md:px-12 lg:px-16 flex items-center justify-between">
        
        {/* Brand Logo & Wordmark (Links to Home) */}
        <Link
          to="/"
          onClick={() => handleSelect("home")}
          className="flex items-center gap-3 group cursor-pointer"
        >
          <img
            src="/Gyaansetu AI logo.png"
            alt="GyaanSetu-AI Logo"
            className="h-9 w-9 object-contain rounded-xl bg-white p-0.5 shadow-sm border border-blue-400/30 transition-transform group-hover:scale-105"
          />
          <div className="flex flex-col">
            <div className="font-display font-extrabold text-lg text-white tracking-tight leading-none group-hover:text-blue-300 transition-colors">
              GyaanSetu-AI
            </div>
            <div className="text-[10px] text-blue-300 font-medium tracking-wide">
              Bridging Knowledge Through Personalised Learning
            </div>
          </div>
        </Link>

        {/* Desktop Section Selector Buttons */}
        <nav className="hidden lg:flex items-center gap-2 bg-slate-900/80 p-1.5 rounded-2xl border border-blue-900/50">
          {navItems.map((item) => {
            const isSelected = activeSection === item.key;
            return (
              <button
                key={item.key}
                onClick={() => handleSelect(item.key)}
                className={`px-4 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                  isSelected
                    ? "bg-blue-600 text-white shadow-md font-bold scale-[1.02]"
                    : "text-slate-200 hover:text-white hover:bg-blue-950/60"
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Desktop Auth Buttons */}
        <div className="hidden sm:flex items-center gap-4">
          <Link
            to="/auth"
            search={{ mode: "login" }}
            className="text-xs sm:text-sm font-semibold text-slate-200 hover:text-white px-4 py-2 rounded-xl transition-colors"
          >
            Sign In
          </Link>
          <Link
            to="/auth"
            search={{ mode: "register" }}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm font-semibold px-5 py-2.5 rounded-xl shadow-md hover:shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            Get Started <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex lg:hidden items-center gap-2">
          <Link
            to="/auth"
            search={{ mode: "register" }}
            className="sm:hidden inline-flex items-center gap-1 bg-blue-600 text-white text-xs font-semibold px-3 py-1.5 rounded-lg"
          >
            Get Started
          </Link>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-slate-200 hover:text-white rounded-lg hover:bg-blue-900/60 transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#0b1530] border-b border-blue-900 px-6 py-6 shadow-2xl space-y-4">
          <div className="text-xs font-mono text-blue-300 font-bold uppercase tracking-wider">
            Navigate to:
          </div>
          <div className="flex flex-col gap-2 text-sm font-medium text-slate-200">
            {navItems.map((item) => (
              <button
                key={item.key}
                onClick={() => handleSelect(item.key)}
                className={`text-left px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors flex items-center justify-between ${
                  activeSection === item.key
                    ? "bg-blue-600 text-white font-bold"
                    : "hover:bg-blue-900/60 text-slate-200"
                }`}
              >
                <span>{item.label}</span>
                {activeSection === item.key && <Sparkles className="w-4 h-4 text-blue-200" />}
              </button>
            ))}
          </div>

          <div className="pt-4 border-t border-blue-900/80 flex flex-col gap-2.5">
            <Link
              to="/auth"
              search={{ mode: "login" }}
              className="w-full text-center py-2.5 rounded-xl border border-blue-800 font-semibold text-xs text-slate-200 hover:bg-blue-950"
            >
              Sign In
            </Link>
            <Link
              to="/auth"
              search={{ mode: "register" }}
              className="w-full text-center py-2.5 rounded-xl bg-blue-600 font-semibold text-xs text-white hover:bg-blue-500 shadow-sm"
            >
              Get Started
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
