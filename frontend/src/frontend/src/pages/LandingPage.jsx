import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Briefcase, Building2, CheckCircle, GraduationCap, Loader2, Shield, Sparkles, TrendingUp, Users, Zap, ArrowRight } from "lucide-react";
import { AnimatePresence, motion, useMotionValue, useSpring, useTransform } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "../hooks/useAuth";

const SECURITY_QUESTIONS = [
  "What was the name of your first pet?",
  "What is your mother's maiden name?",
  "What city were you born in?",
  "What was the name of your primary school?",
  "What is the name of your childhood best friend?",
  "What was the make of your first car?",
  "What is your oldest sibling's middle name?",
  "What street did you grow up on?",
];

const features = [
  { icon: Briefcase,   text: "500+ Active Job & Internship Listings",  color: "#60a5fa", bg: "rgba(96,165,250,0.12)" },
  { icon: Users,       text: "2,000+ Students Placed Successfully",     color: "#c084fc", bg: "rgba(192,132,252,0.12)" },
  { icon: TrendingUp,  text: "95% Placement Rate for Top Performers",   color: "#34d399", bg: "rgba(52,211,153,0.12)" },
  { icon: CheckCircle, text: "Real-time Application Status Tracking",   color: "#fbbf24", bg: "rgba(251,191,36,0.12)" },
];

const stats = [
  { value: "500+", label: "Job Listings",       color: "#818cf8" },
  { value: "2K+",  label: "Students Placed",    color: "#c084fc" },
  { value: "95%",  label: "Placement Rate",     color: "#34d399" },
  { value: "50+",  label: "Companies",          color: "#fbbf24" },
];

// ── Floating particles ────────────────────────────────────────────────────────
function Particles() {
  const items = Array.from({ length: 25 }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    size: Math.random() * 4 + 2,
    duration: Math.random() * 10 + 8,
    delay: Math.random() * 8,
    opacity: Math.random() * 0.5 + 0.1,
  }));
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {items.map((p) => (
        <div key={p.id} className="particle"
          style={{
            left: p.left, bottom: "-10px",
            width: p.size, height: p.size,
            opacity: p.opacity,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
          }} />
      ))}
    </div>
  );
}

// ── Tilt card ─────────────────────────────────────────────────────────────────
function TiltCard({ children, className }) {
  const ref = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [6, -6]), { stiffness: 300, damping: 30 });
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-6, 6]), { stiffness: 300, damping: 30 });

  const handleMouse = (e) => {
    const rect = ref.current.getBoundingClientRect();
    x.set((e.clientX - rect.left) / rect.width - 0.5);
    y.set((e.clientY - rect.top) / rect.height - 0.5);
  };
  const reset = () => { x.set(0); y.set(0); };

  return (
    <motion.div ref={ref} onMouseMove={handleMouse} onMouseLeave={reset}
      style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      className={className}>
      {children}
    </motion.div>
  );
}

// ── Animated counter ──────────────────────────────────────────────────────────
function Counter({ value, delay }) {
  const [display, setDisplay] = useState("0");
  useEffect(() => {
    const timer = setTimeout(() => setDisplay(value), delay * 1000);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return (
    <AnimatePresence mode="wait">
      <motion.span key={display}
        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}>
        {display}
      </motion.span>
    </AnimatePresence>
  );
}

// ── Forgot Password ───────────────────────────────────────────────────────────
function ForgotPassword({ onBack }) {
  const { getSecurityQuestion, resetPassword } = useAuth();
  const [step, setStep] = useState(1);
  const [username, setUsername] = useState("");
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLookup = async (e) => {
    e.preventDefault(); setLoading(true);
    try { const q = await getSecurityQuestion(username); setQuestion(q); setStep(2); }
    catch { toast.error("Username not found."); }
    finally { setLoading(false); }
  };

  const handleReset = async (e) => {
    e.preventDefault(); setLoading(true);
    try {
      await resetPassword({ username, security_answer: answer, new_password: newPassword });
      toast.success("Password reset! You can now sign in."); onBack();
    } catch (err) {
      const d = err.response?.data;
      toast.error(typeof d === "object" ? Object.values(d).flat().join(" ") : "Incorrect answer.");
    } finally { setLoading(false); }
  };

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
      <div>
        <h2 className="text-lg font-bold">Reset Password</h2>
        <p className="text-sm text-muted-foreground">Answer your security question to continue.</p>
      </div>
      {step === 1 && (
        <form onSubmit={handleLookup} className="space-y-3">
          <div className="space-y-1.5">
            <Label>Username</Label>
            <Input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="your_username" required className="h-11" />
          </div>
          <Button type="submit" className="w-full h-11" disabled={loading}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null} Continue
          </Button>
        </form>
      )}
      {step === 2 && (
        <form onSubmit={handleReset} className="space-y-3">
          <div className="rounded-xl bg-primary/8 border border-primary/20 px-4 py-3 text-sm font-medium">{question}</div>
          <div className="space-y-1.5">
            <Label>Your Answer</Label>
            <Input value={answer} onChange={(e) => setAnswer(e.target.value)} placeholder="Case-insensitive" required className="h-11" />
          </div>
          <div className="space-y-1.5">
            <Label>New Password</Label>
            <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="••••••••" required minLength={6} className="h-11" />
          </div>
          <Button type="submit" className="w-full h-11" disabled={loading}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null} Reset Password
          </Button>
        </form>
      )}
      <button type="button" onClick={onBack} className="text-sm text-muted-foreground hover:text-primary underline w-full text-center transition-colors">
        ← Back to Sign In
      </button>
    </motion.div>
  );
}

// ── Main LandingPage ──────────────────────────────────────────────────────────
export function LandingPage({ onRoleSelected }) {
  const { login, register, isLoggingIn } = useAuth();
  const [tab, setTab] = useState("login");
  const [showForgot, setShowForgot] = useState(false);
  const [loginForm, setLoginForm] = useState({ username: "", password: "" });
  const [regForm, setRegForm] = useState({
    username: "", password: "", first_name: "", last_name: "",
    email: "", role: "STUDENT", enrollment_no: "", company_name: "",
    admin_secret: "", security_question: "", security_answer: "",
  });

  const handleLogin = async (e) => {
    e.preventDefault();
    try { await login(loginForm.username, loginForm.password); onRoleSelected?.(); }
    catch (err) { toast.error(err.message || "Login failed."); }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!regForm.security_question) { toast.error("Please select a security question."); return; }
    try { await register(regForm); toast.success("Account created! Welcome."); onRoleSelected?.(); }
    catch (err) {
      const d = err.response?.data;
      toast.error(typeof d === "object" ? Object.values(d).flat().join(" ") : err.message || "Registration failed.");
    }
  };

  return (
    <div className="min-h-screen flex overflow-hidden">

      {/* ══════════════ LEFT HERO PANEL ══════════════ */}
      <div className="hidden lg:flex flex-col justify-between w-[55%] p-12 hero-bg relative">
        <div className="dot-grid absolute inset-0 opacity-60" />
        <div className="orb orb-1" /><div className="orb orb-2" /><div className="orb orb-3" />
        <Particles />

        {/* Logo */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
          className="relative z-10 flex items-center gap-3">
          <motion.div whileHover={{ rotate: 10, scale: 1.1 }} transition={{ type: "spring", stiffness: 300 }}
            className="h-11 w-11 rounded-2xl glass flex items-center justify-center icon-ripple">
            <GraduationCap className="h-6 w-6 text-white" />
          </motion.div>
          <div>
            <p className="font-bold text-white text-base leading-tight">Smart Placement Portal</p>
            <p className="text-white/40 text-xs">Powered by AI Matching</p>
          </div>
        </motion.div>

        {/* Hero content */}
        <div className="relative z-10 space-y-8">
          <div>
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2, duration: 0.5 }}
              className="inline-flex items-center gap-2 glass rounded-full px-4 py-2 mb-6 border border-white/20">
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 3, repeat: Infinity, ease: "linear" }}>
                <Sparkles className="h-3.5 w-3.5 text-amber-300" />
              </motion.div>
              <span className="text-xs text-white/80 font-semibold tracking-wide">AI-Powered Smart Matching</span>
            </motion.div>

            <motion.h2 initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="text-6xl font-extrabold leading-[1.1] text-white mb-5">
              Your Career<br />
              <span className="gradient-text">Journey Starts</span><br />
              Here
            </motion.h2>

            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.6 }}
              className="text-white/55 text-lg leading-relaxed max-w-md">
              A centralized platform connecting students with top recruiters through intelligent skill matching.
            </motion.p>
          </div>

          {/* Feature cards */}
          <div className="space-y-3">
            {features.map((item, i) => (
              <motion.div key={item.text}
                initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + i * 0.12, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="feature-card glass rounded-2xl px-4 py-3.5 flex items-center gap-4 border border-white/10">
                <motion.div whileHover={{ scale: 1.2, rotate: 5 }} transition={{ type: "spring", stiffness: 400 }}
                  className="h-9 w-9 rounded-xl flex items-center justify-center shrink-0 flex-none"
                  style={{ background: item.bg }}>
                  <item.icon className="h-4 w-4" style={{ color: item.color }} />
                </motion.div>
                <span className="text-sm text-white/75 font-medium">{item.text}</span>
                <ArrowRight className="h-3.5 w-3.5 text-white/20 ml-auto shrink-0" />
              </motion.div>
            ))}
          </div>

          {/* Stats */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.1, duration: 0.6 }}
            className="glass-strong rounded-2xl p-5 grid grid-cols-4 gap-4 border border-white/15">
            {stats.map((s, i) => (
              <motion.div key={s.label} initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.2 + i * 0.1, type: "spring", stiffness: 200 }}
                className="text-center">
                <p className="text-2xl font-extrabold" style={{ color: s.color }}>
                  <Counter value={s.value} delay={1.3 + i * 0.1} />
                </p>
                <p className="text-xs text-white/40 mt-0.5 font-medium">{s.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>

        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }}
          className="relative z-10 text-white/25 text-xs">
          © {new Date().getFullYear()} Smart Placement Portal. All rights reserved.
        </motion.p>
      </div>

      {/* ══════════════ RIGHT AUTH PANEL ══════════════ */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10 auth-panel overflow-y-auto relative z-10">
        <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-md">

          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-6">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <GraduationCap className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-bold text-sm">Smart Placement Portal</span>
          </div>

          {/* Icon + heading */}
          <div className="text-center mb-8">
            <TiltCard className="inline-block mb-5">
              <motion.div
                animate={{ boxShadow: ["0 0 20px rgba(99,102,241,0.3)", "0 0 50px rgba(99,102,241,0.6)", "0 0 20px rgba(99,102,241,0.3)"] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                className="h-20 w-20 rounded-3xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center cursor-default mx-auto">
                <GraduationCap className="h-10 w-10 text-white" />
              </motion.div>
            </TiltCard>
            <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
              className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Welcome back
            </motion.h1>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
              className="text-muted-foreground mt-2 text-sm">
              Sign in or create your account to continue
            </motion.p>
          </div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35, duration: 0.5 }}>
            <Card className="shadow-2xl border-0 overflow-hidden"
              style={{ boxShadow: "0 20px 60px rgba(99,102,241,0.12), 0 4px 16px rgba(0,0,0,0.08)" }}>
              <CardContent className="pt-6 pb-7 px-7">
                <AnimatePresence mode="wait">
                  {showForgot ? (
                    <motion.div key="forgot" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                      <ForgotPassword onBack={() => setShowForgot(false)} />
                    </motion.div>
                  ) : (
                    <motion.div key="auth" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                      <Tabs value={tab} onValueChange={setTab}>
                        <TabsList className="w-full mb-6 h-11 bg-muted/60 rounded-xl p-1">
                          <TabsTrigger value="login" className="flex-1 rounded-lg text-sm font-semibold data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all">Sign In</TabsTrigger>
                          <TabsTrigger value="register" className="flex-1 rounded-lg text-sm font-semibold data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all">Register</TabsTrigger>
                        </TabsList>

                        <TabsContent value="login">
                          <motion.form onSubmit={handleLogin} className="space-y-4"
                            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                            <div className="space-y-1.5">
                              <Label className="text-sm font-semibold">Username</Label>
                              <Input value={loginForm.username}
                                onChange={(e) => setLoginForm((p) => ({ ...p, username: e.target.value }))}
                                placeholder="your_username" required className="h-11 rounded-xl border-border/60 bg-background/80" />
                            </div>
                            <div className="space-y-1.5">
                              <Label className="text-sm font-semibold">Password</Label>
                              <Input type="password" value={loginForm.password}
                                onChange={(e) => setLoginForm((p) => ({ ...p, password: e.target.value }))}
                                placeholder="••••••••" required className="h-11 rounded-xl border-border/60 bg-background/80" />
                            </div>
                            <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}>
                              <Button type="submit" className="w-full h-12 rounded-xl font-bold text-base bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 border-0 btn-glow" disabled={isLoggingIn}>
                                {isLoggingIn
                                  ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Signing In...</>
                                  : <><Zap className="mr-2 h-4 w-4" />Sign In</>}
                              </Button>
                            </motion.div>
                            <button type="button" onClick={() => setShowForgot(true)}
                              className="text-sm text-muted-foreground hover:text-primary underline w-full text-center transition-colors block">
                              Forgot password?
                            </button>
                          </motion.form>
                        </TabsContent>

                        <TabsContent value="register">
                          <motion.form onSubmit={handleRegister} className="space-y-3"
                            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                            <div className="grid grid-cols-2 gap-3">
                              <div className="space-y-1.5">
                                <Label className="text-xs font-semibold">First Name</Label>
                                <Input value={regForm.first_name} onChange={(e) => setRegForm((p) => ({ ...p, first_name: e.target.value }))} placeholder="Jane" required className="h-10 rounded-xl" />
                              </div>
                              <div className="space-y-1.5">
                                <Label className="text-xs font-semibold">Last Name</Label>
                                <Input value={regForm.last_name} onChange={(e) => setRegForm((p) => ({ ...p, last_name: e.target.value }))} placeholder="Smith" required className="h-10 rounded-xl" />
                              </div>
                            </div>
                            <div className="space-y-1.5">
                              <Label className="text-xs font-semibold">Username</Label>
                              <Input value={regForm.username} onChange={(e) => setRegForm((p) => ({ ...p, username: e.target.value }))} placeholder="jane_smith" required className="h-10 rounded-xl" />
                            </div>
                            <div className="space-y-1.5">
                              <Label className="text-xs font-semibold">Email</Label>
                              <Input type="email" value={regForm.email} onChange={(e) => setRegForm((p) => ({ ...p, email: e.target.value }))} placeholder="jane@university.edu" required className="h-10 rounded-xl" />
                            </div>
                            <div className="space-y-1.5">
                              <Label className="text-xs font-semibold">Password</Label>
                              <Input type="password" value={regForm.password} onChange={(e) => setRegForm((p) => ({ ...p, password: e.target.value }))} placeholder="••••••••" required minLength={6} className="h-10 rounded-xl" />
                            </div>

                            {/* Role selector */}
                            <div className="grid grid-cols-3 gap-2 pt-1">
                              {[
                                { role: "STUDENT", emoji: "🎓", label: "Student",   active: "from-blue-500 to-indigo-600",   ring: "ring-blue-400" },
                                { role: "COMPANY", emoji: "🏢", label: "Recruiter", active: "from-purple-500 to-violet-600", ring: "ring-purple-400" },
                                { role: "ADMIN",   emoji: "🛡️", label: "Admin",     active: "from-emerald-500 to-teal-600",  ring: "ring-emerald-400" },
                              ].map(({ role: r, emoji, label, active, ring }) => (
                                <motion.button key={r} type="button"
                                  whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.96 }}
                                  onClick={() => setRegForm((p) => ({ ...p, role: r }))}
                                  className={`rounded-xl border-2 p-3 text-xs font-bold transition-all duration-200 ${
                                    regForm.role === r
                                      ? `bg-gradient-to-br ${active} text-white border-transparent shadow-lg ring-2 ${ring} ring-offset-1`
                                      : "border-border/60 hover:border-primary/40 text-muted-foreground bg-background/60"
                                  }`}>
                                  <span className="text-lg block mb-1">{emoji}</span>{label}
                                </motion.button>
                              ))}
                            </div>

                            <AnimatePresence mode="wait">
                              {regForm.role === "STUDENT" && (
                                <motion.div key="enroll" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden space-y-1.5">
                                  <Label className="text-xs font-semibold">Enrollment No.</Label>
                                  <Input value={regForm.enrollment_no} onChange={(e) => setRegForm((p) => ({ ...p, enrollment_no: e.target.value }))} placeholder="2021CS001" required className="h-10 rounded-xl" />
                                </motion.div>
                              )}
                              {regForm.role === "COMPANY" && (
                                <motion.div key="company" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden space-y-1.5">
                                  <Label className="text-xs font-semibold">Company Name</Label>
                                  <Input value={regForm.company_name} onChange={(e) => setRegForm((p) => ({ ...p, company_name: e.target.value }))} placeholder="TechCorp Inc." className="h-10 rounded-xl" />
                                </motion.div>
                              )}
                              {regForm.role === "ADMIN" && (
                                <motion.div key="admin" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden space-y-1.5">
                                  <Label className="text-xs font-semibold">Admin Secret Key</Label>
                                  <Input type="password" value={regForm.admin_secret} onChange={(e) => setRegForm((p) => ({ ...p, admin_secret: e.target.value }))} placeholder="Enter secret key" required className="h-10 rounded-xl" />
                                  <p className="text-xs text-muted-foreground">Contact your system administrator for the secret key.</p>
                                </motion.div>
                              )}
                            </AnimatePresence>

                            <div className="border-t pt-3 space-y-3">
                              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                                <Shield className="h-3 w-3" /> Security Question
                              </p>
                              <Select value={regForm.security_question} onValueChange={(v) => setRegForm((p) => ({ ...p, security_question: v }))}>
                                <SelectTrigger className="h-10 rounded-xl"><SelectValue placeholder="Choose a security question..." /></SelectTrigger>
                                <SelectContent>
                                  {SECURITY_QUESTIONS.map((q) => <SelectItem key={q} value={q}>{q}</SelectItem>)}
                                </SelectContent>
                              </Select>
                              <Input value={regForm.security_answer} onChange={(e) => setRegForm((p) => ({ ...p, security_answer: e.target.value }))} placeholder="Your answer (case-insensitive)" required className="h-10 rounded-xl" />
                            </div>

                            <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}>
                              <Button type="submit" className="w-full h-12 rounded-xl font-bold text-base bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 border-0" disabled={isLoggingIn}>
                                {isLoggingIn ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Creating...</> : "Create Account →"}
                              </Button>
                            </motion.div>
                          </motion.form>
                        </TabsContent>
                      </Tabs>
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>
          </motion.div>

          {/* Role badges */}
          {!showForgot && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
              className="grid grid-cols-3 gap-3 mt-4">
              {[
                { icon: GraduationCap, label: "Students",  from: "from-blue-50",    to: "to-indigo-50",   text: "text-indigo-600",  border: "border-indigo-100" },
                { icon: Building2,    label: "Recruiters", from: "from-purple-50",  to: "to-violet-50",   text: "text-purple-600",  border: "border-purple-100" },
                { icon: Shield,       label: "Admins",     from: "from-emerald-50", to: "to-teal-50",     text: "text-emerald-600", border: "border-emerald-100" },
              ].map((role, i) => (
                <motion.div key={role.label}
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 + i * 0.1, duration: 0.2 }}
                  whileHover={{ y: -3, scale: 1.03 }}
                  className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border bg-gradient-to-br ${role.from} ${role.to} ${role.border} cursor-default`}>
                  <role.icon className={`h-4 w-4 ${role.text}`} />
                  <span className={`text-xs font-semibold ${role.text}`}>{role.label}</span>
                </motion.div>
              ))}
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
