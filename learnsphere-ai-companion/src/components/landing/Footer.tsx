import { Link } from "@tanstack/react-router";

export function Footer() {
  return (
    <footer className="bg-white border-t border-slate-200/80 py-16 px-6 md:px-12 lg:px-16 text-slate-600 text-xs sm:text-sm font-normal">
      <div className="w-full max-w-[1800px] mx-auto grid grid-cols-2 md:grid-cols-5 gap-10">
        
        {/* Brand Column */}
        <div className="col-span-2 space-y-4">
          <Link to="/" className="flex items-center gap-3">
            <img
              src="/Gyaansetu AI logo.png"
              alt="GyaanSetu-AI Logo"
              className="h-9 w-9 object-contain rounded-xl bg-white p-0.5 shadow-sm border border-slate-200"
            />
            <div className="flex flex-col">
              <span className="font-display font-extrabold text-lg text-slate-900 leading-none">
                GyaanSetu-AI
              </span>
              <span className="text-[10px] text-slate-500 font-medium tracking-wide">
                Bridging Knowledge Through Personalised Learning
              </span>
            </div>
          </Link>
          <p className="text-slate-500 text-xs sm:text-sm leading-relaxed max-w-md">
            AI-powered personalised learning for students, professionals, educators, and institutions.
          </p>
        </div>

        {/* Product Links */}
        <div className="space-y-3">
          <div className="font-bold text-slate-900 uppercase text-xs tracking-wider font-mono">Product</div>
          <div className="flex flex-col gap-2.5 font-medium">
            <a href="#ai-tutor" className="hover:text-blue-600 transition-colors">AI Tutor</a>
            <a href="#product-pillars" className="hover:text-blue-600 transition-colors">Personalised Learning</a>
            <a href="#learning-path" className="hover:text-blue-600 transition-colors">Learning Paths</a>
            <a href="#product-pillars" className="hover:text-blue-600 transition-colors">Skill Analytics</a>
            <a href="#career-guidance" className="hover:text-blue-600 transition-colors">Career Guidance</a>
          </div>
        </div>

        {/* Solutions */}
        <div className="space-y-3">
          <div className="font-bold text-slate-900 uppercase text-xs tracking-wider font-mono">Solutions</div>
          <div className="flex flex-col gap-2.5 font-medium">
            <a href="#audiences" className="hover:text-blue-600 transition-colors">Students</a>
            <a href="#audiences" className="hover:text-blue-600 transition-colors">Professionals</a>
            <a href="#audiences" className="hover:text-blue-600 transition-colors">Educators</a>
            <a href="#audiences" className="hover:text-blue-600 transition-colors">Institutions</a>
          </div>
        </div>

        {/* Resources & Company */}
        <div className="space-y-3">
          <div className="font-bold text-slate-900 uppercase text-xs tracking-wider font-mono">Resources</div>
          <div className="flex flex-col gap-2.5 font-medium">
            <a href="#offline-technology" className="hover:text-blue-600 transition-colors">Documentation</a>
            <a href="#offline-technology" className="hover:text-blue-600 transition-colors">Community</a>
            <a href="#offline-technology" className="hover:text-blue-600 transition-colors">Support</a>
            <a href="#offline-technology" className="hover:text-blue-600 transition-colors">Company</a>
          </div>
        </div>

      </div>

      {/* Bottom Legal & Copyright Bar */}
      <div className="w-full max-w-[1800px] mx-auto flex flex-col sm:flex-row justify-between items-center gap-4 mt-12 pt-8 border-t border-slate-100 text-xs text-slate-500">
        <div>
          © 2026 GyaanSetu-AI. All rights reserved.
        </div>
        <div className="flex gap-6 font-medium">
          <a href="#" className="hover:text-blue-600 transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-blue-600 transition-colors">Terms of Service</a>
        </div>
      </div>
    </footer>
  );
}
