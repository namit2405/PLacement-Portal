import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowRight, Briefcase, Building2, CheckCircle, GraduationCap, Loader2, Shield, Sparkles, TrendingUp, Users, Zap } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
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
  { icon: Briefcase,   text: "500+ Active Job & Internship Listings" },
  { icon: Users,       text: "2,000+ Students Placed Successfully" },
  { icon: TrendingUp,  text: "95% Placement Rate for Top Performers" },
  { icon: CheckCircle, text: "Real-time Application Status Tracking" },
];

const stats = [
  { value: "500+", label: "Listings" },
  { value: "2K+",  label: "Placed" },
  { value: "95%",  label: "Rate" },
  { value: "50+",  label: "Companies" },
];

function Particles() {
  const items = Array.from({ length: 12 }, (_, i) => ({
    id: i, left: `${8 + i * 7.5}%`,
    size: Math.random() * 3 + 1.5,
    duration: Math.random() * 12 + 10,
    delay: Math.random() * 8,
  }));
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {items.map((p) => (
        <div key={p.id} className="particle"
          style={{ left: p.left, bottom: 0, width: p.size, height: p.size,
            animationDuration: `${p.duration}s`, animationDelay: `${p.delay}s` }} />
      ))}
    </div>
  );
}

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
      toast.success("Password reset successfully."); onBack();
    } catch (err) {
      const d = err.response?.data;
      toast.error(typeof d === "object" ? Object.values(d).flat().join(" ") : "Incorrect answer.");
    } finally { setLoading(false); }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      <div>
        <h2 className="text-base font-semibold text-foreground">Reset Password</h2>
        <p className="text-sm text-muted-foreground mt-0.5">Answer your security question to continue.</p>
      </div>
      {step === 1 && (
        <form onSubmit={handleLookup} className="space-y-3">
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Username</Label>
            <Input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="your_username" required className="h-10" />
          </div>
          <Button type="submit" className="w-full h-10" disabled={loading}>
            {loading ? <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" /> : null} Continue
          </Button>
        </form>
      )}
      {step === 2 && (
        <form onSubmit={handleReset} className="space-y-3">
          <div className="rounded-lg bg-muted px-3 py-2.5 text-sm text-foreground border">{question}</div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Your Answer</Label>
            <Input value={answer} onChange={(e) => setAnswer(e.target.value)} placeholder="Case-insensitive" required className="h-10" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">New Password</Label>
            <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="••••••••" required minLength={6} className="h-10" />
          </div>
          <Button type="submit" className="w-full h-10" disabled={loading}>
            {loading ? <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" /> : null} Reset Password
          </Button>
        </form>
      )}
      <button type="button" onClick={onBack} className="text-xs text-muted-foreground hover:text-foreground w-full text-center transition-colors block">
        ← Back to Sign In
      </button>
    </motion.div>
  );
}

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
    try { await register(regForm); toast.success("Account created!"); onRoleSelected?.(); }
    catch (err) {
      const d = err.response?.data;
      toast.error(typeof d === "object" ? Object.values(d).flat().join(" ") : err.message || "Registration failed.");
    }
  };

  return (
    <div className="min-h-screen flex">

      {/* ── Left: dark hero ── */}
      <div className="hidden lg:flex flex-col justify-between w-[52%] p-12 hero-bg relative">
        <div className="dot-grid absolute inset-0" />
        <Particles />

        {/* Logo */}
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          className="relative z-10 flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-indigo-600 flex items-center justify-center">
            <GraduationCap className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white leading-tight">Smart Placement Portal</p>
            <p className="text-xs text-white/40 leading-tight">Placement & Internship Management</p>
          </div>
        </motion.div>

        {/* Hero text */}
        <div className="relative z-10 space-y-8">
          <div>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.15, duration: 0.4 }}
              className="inline-flex items-center gap-2 glass rounded-full px-3 py-1.5 mb-5">
              <Sparkles className="h-3 w-3 text-indigo-400" />
              <span className="text-xs text-white/70 font-medium">AI-Powered Smart Matching</span>
            </motion.div>

            <motion.h2 initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="text-5xl font-bold leading-[1.15] text-white mb-4 tracking-tight">
              Your Career<br />
              <span className="text-indigo-400">Journey</span><br />
              Starts Here
            </motion.h2>

            <motion.p initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35, duration: 0.5 }}
              className="text-white/50 text-base leading-relaxed max-w-sm">
              Connecting students with top recruiters through intelligent skill matching and real-time tracking.
            </motion.p>
          </div>

          {/* Features */}
          <div className="space-y-2.5">
            {features.map((item, i) => (
              <motion.div key={item.text}
                initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.45 + i * 0.08, duration: 0.4 }}
                className="flex items-center gap-3 glass rounded-lg px-4 py-3 border border-white/5">
                <item.icon className="h-4 w-4 text-indigo-400 shrink-0" />
                <span className="text-sm text-white/65">{item.text}</span>
              </motion.div>
            ))}
          </div>

          {/* Stats */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.85 }}
            className="grid grid-cols-4 gap-3 glass rounded-xl p-4 border border-white/8">
            {stats.map((s, i) => (
              <motion.div key={s.label} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 + i * 0.07 }}
                className="text-center">
                <p className="text-xl font-bold text-white">{s.value}</p>
                <p className="text-xs text-white/40 mt-0.5">{s.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>

        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.1 }}
          className="relative z-10 text-white/20 text-xs">
          © {new Date().getFullYear()} Smart Placement Portal
        </motion.p>
      </div>

      {/* ── Right: auth panel ── */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10 auth-panel overflow-y-auto">
        <motion.div initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-sm">

          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center">
              <GraduationCap className="h-4 w-4 text-white" />
            </div>
            <span className="font-semibold text-sm">Smart Placement Portal</span>
          </div>

          {/* Heading */}
          <div className="mb-7">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}
              className="h-12 w-12 rounded-xl bg-indigo-600 flex items-center justify-center mb-4 shadow-lg shadow-indigo-500/20">
              <GraduationCap className="h-6 w-6 text-white" />
            </motion.div>
            <motion.h1 initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
              className="text-2xl font-bold text-foreground tracking-tight">Welcome back</motion.h1>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
              className="text-sm text-muted-foreground mt-1">Sign in or create your account</motion.p>
          </div>

          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
            <Card className="border border-border/60 shadow-sm">
              <CardContent className="p-6">
                <AnimatePresence mode="wait">
                  {showForgot ? (
                    <motion.div key="forgot" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }}>
                      <ForgotPassword onBack={() => setShowForgot(false)} />
                    </motion.div>
                  ) : (
                    <motion.div key="auth" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                      <Tabs value={tab} onValueChange={setTab}>
                        <TabsList className="w-full mb-5 h-9 bg-muted/50">
                          <TabsTrigger value="login" className="flex-1 text-xs font-semibold">Sign In</TabsTrigger>
                          <TabsTrigger value="register" className="flex-1 text-xs font-semibold">Register</TabsTrigger>
                        </TabsList>

                        <TabsContent value="login">
                          <motion.form onSubmit={handleLogin} className="space-y-4"
                            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
                            <div className="space-y-1.5">
                              <Label className="text-xs font-medium">Username</Label>
                              <Input value={loginForm.username}
                                onChange={(e) => setLoginForm((p) => ({ ...p, username: e.target.value }))}
                                placeholder="your_username" required className="h-10 text-sm" />
                            </div>
                            <div className="space-y-1.5">
                              <Label className="text-xs font-medium">Password</Label>
                              <Input type="password" value={loginForm.password}
                                onChange={(e) => setLoginForm((p) => ({ ...p, password: e.target.value }))}
                                placeholder="••••••••" required className="h-10 text-sm" />
                            </div>
                            <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                              <Button type="submit" className="w-full h-10 text-sm font-semibold btn-shimmer bg-indigo-600 hover:bg-indigo-700 border-0" disabled={isLoggingIn}>
                                {isLoggingIn ? <><Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />Signing in...</> : <>Sign In <ArrowRight className="ml-2 h-3.5 w-3.5" /></>}
                              </Button>
                            </motion.div>
                            <button type="button" onClick={() => setShowForgot(true)}
                              className="text-xs text-muted-foreground hover:text-foreground w-full text-center transition-colors block">
                              Forgot password?
                            </button>
                          </motion.form>
                        </TabsContent>

                        <TabsContent value="register">
                          <motion.form onSubmit={handleRegister} className="space-y-3"
                            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
                            <div className="grid grid-cols-2 gap-2.5">
                              <div className="space-y-1.5">
                                <Label className="text-xs font-medium">First Name</Label>
                                <Input value={regForm.first_name} onChange={(e) => setRegForm((p) => ({ ...p, first_name: e.target.value }))} placeholder="Jane" required className="h-9 text-sm" />
                              </div>
                              <div className="space-y-1.5">
                                <Label className="text-xs font-medium">Last Name</Label>
                                <Input value={regForm.last_name} onChange={(e) => setRegForm((p) => ({ ...p, last_name: e.target.value }))} placeholder="Smith" required className="h-9 text-sm" />
                              </div>
                            </div>
                            <div className="space-y-1.5">
                              <Label className="text-xs font-medium">Username</Label>
                              <Input value={regForm.username} onChange={(e) => setRegForm((p) => ({ ...p, username: e.target.value }))} placeholder="jane_smith" required className="h-9 text-sm" />
                            </div>
                            <div className="space-y-1.5">
                              <Label className="text-xs font-medium">Email</Label>
                              <Input type="email" value={regForm.email} onChange={(e) => setRegForm((p) => ({ ...p, email: e.target.value }))} placeholder="jane@university.edu" required className="h-9 text-sm" />
                            </div>
                            <div className="space-y-1.5">
                              <Label className="text-xs font-medium">Password</Label>
                              <Input type="password" value={regForm.password} onChange={(e) => setRegForm((p) => ({ ...p, password: e.target.value }))} placeholder="••••••••" required minLength={6} className="h-9 text-sm" />
                            </div>

                            {/* Role selector */}
                            <div className="grid grid-cols-3 gap-2 pt-0.5">
                              {[
                                { role: "STUDENT", label: "Student",   icon: "🎓" },
                                { role: "COMPANY", label: "Recruiter", icon: "🏢" },
                                { role: "ADMIN",   label: "Admin",     icon: "🛡️" },
                              ].map(({ role: r, label, icon }) => (
                                <motion.button key={r} type="button" whileTap={{ scale: 0.97 }}
                                  onClick={() => setRegForm((p) => ({ ...p, role: r }))}
                                  className={`rounded-lg border py-2.5 text-xs font-semibold transition-all ${
                                    regForm.role === r
                                      ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                                      : "border-border text-muted-foreground hover:border-indigo-300 hover:text-foreground"
                                  }`}>
                                  <span className="block text-base mb-0.5">{icon}</span>{label}
                                </motion.button>
                              ))}
                            </div>

                            <AnimatePresence mode="wait">
                              {regForm.role === "STUDENT" && (
                                <motion.div key="enroll" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden space-y-1.5">
                                  <Label className="text-xs font-medium">Enrollment No.</Label>
                                  <Input value={regForm.enrollment_no} onChange={(e) => setRegForm((p) => ({ ...p, enrollment_no: e.target.value }))} placeholder="2021CS001" required className="h-9 text-sm" />
                                </motion.div>
                              )}
                              {regForm.role === "COMPANY" && (
                                <motion.div key="company" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden space-y-1.5">
                                  <Label className="text-xs font-medium">Company Name</Label>
                                  <Input value={regForm.company_name} onChange={(e) => setRegForm((p) => ({ ...p, company_name: e.target.value }))} placeholder="TechCorp Inc." className="h-9 text-sm" />
                                </motion.div>
                              )}
                              {regForm.role === "ADMIN" && (
                                <motion.div key="admin" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden space-y-1.5">
                                  <Label className="text-xs font-medium">Admin Secret Key</Label>
                                  <Input type="password" value={regForm.admin_secret} onChange={(e) => setRegForm((p) => ({ ...p, admin_secret: e.target.value }))} placeholder="Enter secret key" required className="h-9 text-sm" />
                                  <p className="text-xs text-muted-foreground">Contact your system administrator.</p>
                                </motion.div>
                              )}
                            </AnimatePresence>

                            <div className="border-t pt-3 space-y-2.5">
                              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Security Question</p>
                              <Select value={regForm.security_question} onValueChange={(v) => setRegForm((p) => ({ ...p, security_question: v }))}>
                                <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Choose a question..." /></SelectTrigger>
                                <SelectContent>
                                  {SECURITY_QUESTIONS.map((q) => <SelectItem key={q} value={q} className="text-sm">{q}</SelectItem>)}
                                </SelectContent>
                              </Select>
                              <Input value={regForm.security_answer} onChange={(e) => setRegForm((p) => ({ ...p, security_answer: e.target.value }))} placeholder="Your answer (case-insensitive)" required className="h-9 text-sm" />
                            </div>

                            <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                              <Button type="submit" className="w-full h-10 text-sm font-semibold btn-shimmer bg-indigo-600 hover:bg-indigo-700 border-0" disabled={isLoggingIn}>
                                {isLoggingIn ? <><Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />Creating...</> : "Create Account"}
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

          {/* Role indicators */}
          {!showForgot && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
              className="grid grid-cols-3 gap-2 mt-4">
              {[
                { icon: GraduationCap, label: "Students" },
                { icon: Building2,    label: "Recruiters" },
                { icon: Shield,       label: "Admins" },
              ].map((r) => (
                <motion.div key={r.label} whileHover={{ y: -2 }} transition={{ duration: 0.15 }}
                  className="flex flex-col items-center gap-1.5 p-2.5 rounded-lg border border-border/60 bg-muted/30 cursor-default">
                  <r.icon className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground font-medium">{r.label}</span>
                </motion.div>
              ))}
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
