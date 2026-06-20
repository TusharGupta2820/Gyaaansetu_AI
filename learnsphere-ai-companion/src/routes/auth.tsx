import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { Sparkles, Mail, Lock, User, ArrowRight, Eye, EyeOff, ShieldCheck, Chrome, Github } from "lucide-react";
import { loginUser, registerUser } from "@/lib/api/auth.functions";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Authenticate — GyaanSetu AI" },
      { name: "description", content: "Access your GyaanSetu AI personalized dashboard." }
    ]
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  // Form States
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
 
   // UI States
   const [error, setError] = useState("");
   const [success, setSuccess] = useState("");
   const [loading, setLoading] = useState(false);
 
   // Redirect if already logged in
   useEffect(() => {
     const user = localStorage.getItem("gyaansetu_user");
     if (user) {
       navigate({ to: "/dashboard" });
     }
   }, [navigate]);
 
   const handleDemoLogin = () => {
     setEmail("student@gyaansetu.ai");
     setPassword("password123");
     setName("Aarav Sharma");
     setIsLogin(true);
     setError("");
     setSuccess("");
   };
 
   const handleSubmit = async (e: React.FormEvent) => {
     e.preventDefault();
     setError("");
     setSuccess("");
 
     if (!email || !password) {
       setError("Please fill in all fields.");
       return;
     }
 
     if (!isLogin && !name) {
       setError("Please enter your name.");
       return;
     }
 
     setLoading(true);
 
     try {
       if (isLogin) {
         // Real Login against DB
         const user = await loginUser({ data: { email, password } });
         localStorage.setItem("gyaansetu_user", JSON.stringify(user));
         document.cookie = `gyaansetu_user_id=${user.id}; path=/; max-age=31536000`;
         navigate({ to: "/dashboard" });
       } else {
         // Real Registration -> redirect to login page instead of auto-login
         await registerUser({ data: { email, name, password } });
         setPassword("");
         setIsLogin(true);
         setSuccess("Account created successfully! Please sign in using your password.");
       }
     } catch (err: any) {
       setError(err?.message || "An authentication error occurred.");
     } finally {
       setLoading(false);
     }
   };
 
   const handleSocialLogin = async (platform: string) => {
     setLoading(true);
     setError("");
     setSuccess("");
     const dummyEmail = `${platform.toLowerCase()}user@gmail.com`;
     const dummyPassword = "password123";
     const dummyName = `${platform} Learner`;
 
     try {
       // First try to login, if fails try to register
       let user;
       try {
         user = await loginUser({ data: { email: dummyEmail, password: dummyPassword } });
       } catch (e) {
         user = await registerUser({ data: { email: dummyEmail, name: dummyName, password: dummyPassword } });
       }
       localStorage.setItem("gyaansetu_user", JSON.stringify(user));
       document.cookie = `gyaansetu_user_id=${user.id}; path=/; max-age=31536000`;
       navigate({ to: "/dashboard" });
     } catch (err: any) {
       setError(err?.message || "Social login failed.");
     } finally {
       setLoading(false);
     }
   };
 
   return (
     <div className="bg-[#050816] text-[#dde2f8] min-h-screen font-sans selection:bg-[#00f5ff]/20 selection:text-[#e9feff] flex items-center justify-center p-6 relative overflow-hidden">
 
       {/* Background Decorative Glows */}
       <div className="absolute inset-0 pointer-events-none overflow-hidden">
         <div className="absolute top-[-10%] left-[-10%] w-[400px] h-[400px] rounded-full bg-[#00f5ff]/10 blur-[100px]" />
         <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] rounded-full bg-[#3626ce]/15 blur-[120px]" />
       </div>
 
       <motion.div
         initial={{ opacity: 0, y: 20 }}
         animate={{ opacity: 1, y: 0 }}
         transition={{ duration: 0.5 }}
         className="w-full max-w-md relative z-10"
       >
         {/* Top Branding Logo */}
         <div className="flex flex-col items-center mb-8">
           <img
             src="/Gyaansetu AI logo.png"
             alt="GyaanSetu AI"
             className="h-20 w-20 object-contain mb-3 drop-shadow-[0_0_20px_rgba(0,245,255,0.35)]"
           />
           <h2 className="font-display font-extrabold text-2xl text-[#e9feff]">GyaanSetu AI</h2>
           <p className="text-xs text-muted-foreground mt-1">Bridging Knowledge Through Personalized Learning</p>
         </div>
 
         {/* Auth Card */}
         <div className="glass rounded-[28px] p-8 border border-white/10 shadow-2xl relative overflow-hidden bg-[#0d1322]/40">
 
           {/* Header tabs */}
           <div className="flex border-b border-white/5 pb-4 mb-6">
             <button
               onClick={() => { setIsLogin(true); setError(""); setSuccess(""); }}
               className={`flex-1 text-center py-2 text-sm font-semibold transition-all relative ${isLogin ? "text-[#e9feff]" : "text-muted-foreground hover:text-white"
                 }`}
             >
               Sign In
               {isLogin && (
                 <motion.div
                   layoutId="auth-tab-bar"
                   className="absolute bottom-[-1px] left-0 right-0 h-[2px] bg-gradient-to-r from-[#00f5ff] to-[#3626ce]"
                 />
               )}
             </button>
             <button
               onClick={() => { setIsLogin(false); setError(""); setSuccess(""); }}
               className={`flex-1 text-center py-2 text-sm font-semibold transition-all relative ${!isLogin ? "text-[#e9feff]" : "text-muted-foreground hover:text-white"
                 }`}
             >
               Register
               {!isLogin && (
                 <motion.div
                   layoutId="auth-tab-bar"
                   className="absolute bottom-[-1px] left-0 right-0 h-[2px] bg-gradient-to-r from-[#00f5ff] to-[#3626ce]"
                 />
               )}
             </button>
           </div>
 
           <form onSubmit={handleSubmit} className="space-y-4">
 
             {/* Error Message */}
             <AnimatePresence>
               {error && (
                 <motion.div
                   initial={{ opacity: 0, height: 0 }}
                   animate={{ opacity: 1, height: "auto" }}
                   exit={{ opacity: 0, height: 0 }}
                   className="bg-red-500/10 border border-red-500/20 text-red-200 text-xs p-3.5 rounded-xl flex items-center gap-2"
                 >
                   <span className="h-1.5 w-1.5 rounded-full bg-red-400 shrink-0" />
                   {error}
                 </motion.div>
               )}
             </AnimatePresence>
 
             {/* Success Message */}
             <AnimatePresence>
               {success && (
                 <motion.div
                   initial={{ opacity: 0, height: 0 }}
                   animate={{ opacity: 1, height: "auto" }}
                   exit={{ opacity: 0, height: 0 }}
                   className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-200 text-xs p-3.5 rounded-xl flex items-center gap-2"
                 >
                   <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shrink-0" />
                   {success}
                 </motion.div>
               )}
             </AnimatePresence>

            {/* Name Input (Register Only) */}
            {!isLogin && (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Full Name</label>
                <div className="glass rounded-xl flex items-center px-3.5 py-3 border-white/5 focus-within:border-[#00f5ff]/40 transition-colors">
                  <User className="h-4.5 w-4.5 text-muted-foreground mr-3" />
                  <input
                    type="text"
                    placeholder="Enter your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="bg-transparent flex-1 text-sm outline-none placeholder:text-muted-foreground/60 text-white"
                  />
                </div>
              </div>
            )}

            {/* Email Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Email Address</label>
              <div className="glass rounded-xl flex items-center px-3.5 py-3 border-white/5 focus-within:border-[#00f5ff]/40 transition-colors">
                <Mail className="h-4.5 w-4.5 text-muted-foreground mr-3" />
                <input
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-transparent flex-1 text-sm outline-none placeholder:text-muted-foreground/60 text-white"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-xs font-semibold text-muted-foreground">Password</label>
                {isLogin && (
                  <button type="button" className="text-[10px] text-[#00f5ff] hover:underline font-semibold">
                    Forgot?
                  </button>
                )}
              </div>
              <div className="glass rounded-xl flex items-center px-3.5 py-3 border-white/5 focus-within:border-[#00f5ff]/40 transition-colors">
                <Lock className="h-4.5 w-4.5 text-muted-foreground mr-3" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-transparent flex-1 text-sm outline-none placeholder:text-muted-foreground/60 text-white"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-muted-foreground hover:text-white transition"
                >
                  {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                </button>
              </div>
            </div>

            {/* Terms checkbox for Register */}
            {!isLogin && (
              <label className="flex items-start gap-2.5 pt-1 cursor-pointer">
                <input
                  type="checkbox"
                  required
                  className="rounded border-white/10 bg-white/5 text-[#00f5ff] focus:ring-0 mt-0.5"
                />
                <span className="text-[10px] text-muted-foreground leading-snug">
                  I agree to the <span className="text-[#00f5ff] hover:underline">Terms of Service</span> and <span className="text-[#00f5ff] hover:underline">Privacy Policy</span>.
                </span>
              </label>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full relative inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#00f5ff] to-[#3626ce] py-3.5 text-sm font-bold text-[#050816] transition-all hover:shadow-[0_0_20px_rgba(0,245,255,0.4)] disabled:opacity-75 disabled:pointer-events-none cursor-pointer"
            >
              {loading ? (
                <span className="animate-spin h-4 w-4 border-2 border-t-transparent border-[#050816] rounded-full" />
              ) : (
                <>
                  {isLogin ? "Sign In" : "Create Account"} <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {/* Social Logins */}
          <div className="relative my-6 flex items-center justify-center">
            <div className="absolute inset-x-0 h-[1px] bg-white/5" />
            <span className="relative z-10 px-3 bg-[#0c1322] text-[10px] uppercase tracking-wider text-muted-foreground font-mono">
              Or Connect With
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => handleSocialLogin("Google")}
              className="glass rounded-xl py-2.5 text-xs font-semibold hover:bg-white/5 flex items-center justify-center gap-2 border-white/5 transition"
            >
              <Chrome className="h-4 w-4 text-[#00f5ff]" /> Google
            </button>
            <button
              onClick={() => handleSocialLogin("GitHub")}
              className="glass rounded-xl py-2.5 text-xs font-semibold hover:bg-white/5 flex items-center justify-center gap-2 border-white/5 transition"
            >
              <Github className="h-4 w-4 text-[#ffafd2]" /> GitHub
            </button>
          </div>

          {/* Fast Demo Login Panel */}
          <div className="mt-6 border-t border-white/5 pt-4">
            <button
              onClick={handleDemoLogin}
              type="button"
              className="w-full py-2.5 rounded-xl border border-dashed border-[#00f5ff]/30 text-xs font-semibold text-[#00f5ff] hover:bg-[#00f5ff]/5 hover:border-[#00f5ff]/50 transition flex items-center justify-center gap-1.5"
            >
              <ShieldCheck className="h-4 w-4" /> Auto-fill Demo Credentials
            </button>
          </div>

        </div>

        {/* Back Link */}
        <div className="text-center mt-6">
          <Link to="/" className="text-xs text-muted-foreground hover:text-white transition">
            ← Back to Home
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
