import { Link } from "@tanstack/react-router";
import { Mail, Sparkles } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-slate-950 text-slate-400 pt-16 pb-12 px-6 md:px-12 lg:px-16 text-xs sm:text-sm font-sans border-t border-slate-800">
      <div className="w-full max-w-[1800px] mx-auto space-y-12">
        
        {/* Top Callout Card - Pure White Card on Dark BG */}
        <div className="bg-white text-sky-950 border border-sky-200 rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="space-y-2 text-center md:text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-100 text-sky-900 font-extrabold text-xs border border-sky-300">
              <Sparkles className="w-3.5 h-3.5 text-sky-700" />
              <span>Ready to transform your learning?</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-display font-extrabold text-sky-950">
              Start learning with GyaanSetu AI today.
            </h3>
            <p className="text-sky-800 text-xs sm:text-sm font-medium">
              Free to get started. No credit card required.
            </p>
          </div>

          <Link
            to="/auth"
            search={{ mode: "register" }}
            className="bg-sky-600 hover:bg-sky-500 text-white font-extrabold text-sm px-8 py-3.5 rounded-2xl shadow-lg shadow-sky-600/20 transition-all shrink-0 hover:scale-105"
          >
            Create Free Account
          </Link>
        </div>

        {/* Main Footer Links Directory Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-10 pt-4">
          
          {/* Brand Column */}
          <div className="col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-3">
              <img
                src="/Gyaansetu AI logo.png"
                alt="GyaanSetu-AI Logo"
                className="h-9 w-9 object-contain rounded-xl bg-white p-0.5 shadow-sm border border-slate-700"
              />
              <span className="font-display font-extrabold text-xl text-white leading-none">
                GyaanSetu<span className="text-blue-500">.AI</span>
              </span>
            </Link>
            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed max-w-md font-normal">
              The next-generation AI learning companion bringing 1-on-1 tutoring, adaptive mastery roadmaps, and 22+ regional languages to students and professionals worldwide.
            </p>
          </div>

          {/* Product Links */}
          <div className="space-y-3">
            <div className="font-bold text-white uppercase text-xs tracking-wider font-mono">Product</div>
            <div className="flex flex-col gap-2.5 font-medium text-slate-400">
              <Link to="/auth" search={{ mode: "login" }} className="hover:text-blue-400 transition-colors">AI Tutor Assistant</Link>
              <a href="#features" className="hover:text-blue-400 transition-colors">Adaptive Skill Radar</a>
              <a href="#features" className="hover:text-blue-400 transition-colors">Multilingual Engine</a>
              <a href="#features" className="hover:text-blue-400 transition-colors">Practice Vault</a>
              <a href="#features" className="hover:text-blue-400 transition-colors">Career Skill Analytics</a>
            </div>
          </div>

          {/* Solutions Links */}
          <div className="space-y-3">
            <div className="font-bold text-white uppercase text-xs tracking-wider font-mono">Solutions</div>
            <div className="flex flex-col gap-2.5 font-medium text-slate-400">
              <Link to="/auth" search={{ mode: "register" }} className="hover:text-blue-400 transition-colors">For Students</Link>
              <Link to="/auth" search={{ mode: "login" }} className="hover:text-blue-400 transition-colors">For Educators & Universities</Link>
              <a href="#features" className="hover:text-blue-400 transition-colors">For Developers</a>
              <a href="#features" className="hover:text-blue-400 transition-colors">For Teams</a>
            </div>
          </div>

          {/* Company & Legal */}
          <div className="space-y-3">
            <div className="font-bold text-white uppercase text-xs tracking-wider font-mono">Company & Legal</div>
            <div className="flex flex-col gap-2.5 font-medium text-slate-400">
              <a href="#" className="hover:text-blue-400 transition-colors">About Us</a>
              <a href="#" className="hover:text-blue-400 transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-blue-400 transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-blue-400 transition-colors">Security Overview</a>
              <a href="mailto:contact@gyaansetu.ai" className="hover:text-blue-400 transition-colors flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5" />
                <span>Contact Us</span>
              </a>
            </div>
          </div>

        </div>

        {/* Bottom Metadata */}
        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-500">
          <div>
            © 2026 GyaanSetu-AI Inc. All rights reserved.
          </div>
          <div className="font-medium text-slate-400">
            Built for curious minds everywhere.
          </div>
        </div>

      </div>
    </footer>
  );
}
