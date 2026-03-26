import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Briefcase, Building2, CheckCircle, GraduationCap, Loader2, Shield, Sparkles, TrendingUp, Users, Zap } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
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
  { icon: Briefcase,    text: "500+ Active Job & Internship Listings",    color: "text-blue-400" },
  { icon: Users,        text: "2,000+ Students Placed Successfully",       color: "text-purple-400" },
  { icon: TrendingUp,   text: "95% Placement Rate for Top Performers",     color: "text-emerald-400" },
  { icon: CheckCircle,  text: "Real-time Application Status Tracking",     color: "text-amber-400" },
];

const stats = [
  { value: "500+", label: "Job Listings" },
  { value: "2K+",  label: "Students Placed" },
  { value: "95%",  label: "Placement Rate" },
  { value: "50+",  label: "Partner Companies" },
];

// ── Floating particles ────────────────────────────────────────────────────────
function Particles() {
  const particles = Array.from({ length: 18 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 3 + 1,
    duration: Math.random() * 8 + 6,
    delay: Math.random() * 4,
  }));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-white/20"
          style={{ left: `${p.x}%`, top: `${p.y}%`, width: p.size, height: p.size }}
          animate={{ y: [-20, 20, -20], opacity: [0.2, 0.6, 0.2] }}
          transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
}

// ── Animated counter ──────────────────────────────────────────────────────────
function AnimatedStat({ value, label, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      className="text-center"
    >
      <p className="text-2xl font-bold text-white">{value}</p>
      <p className="text-xs text-white/50 mt-0.5">{label}</p>
    </motion.div>
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
    e.preventDefault();
    setLoading(true);
    try {
      const q = await getSecurityQuestion(username);
      setQuestion(q);
      setStep(2);
    } catch {
      toast.error("Username not found.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await resetPassword({ username, security_answer: answer, new_password: newPassword });
      toast.success("Password reset successfully. You can now sign in.");
      onBack();
    } catch (err) {
      const detail = err.response?.data;
      const msg = typeof detail === "object"
        ? Object.values(detail).flat().join(" ")
        : "Incorrect answer or error resetting password.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold">Reset Password</h2>
        <p className="text-sm text-muted-foreground">Answer your security question to reset your password.</p>
      </div>
      {step === 1 && (
        <form onSubmit={handleLookup} className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="fp-username">Username</Label>
            <Input id="fp-username" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="your_username" required />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null} Continue
          </Button>
        </form>
      )}
      {step === 2 && (
        <form onSubmit={handleReset} className="space-y-3">
          <div className="rounded-lg bg-primary/5 border border-primary/20 px-4 py-3 text-sm">{question}</div>
          <div className="space-y-1.5">
            <Label htmlFor="fp-answer">Your Answer</Label>
            <Input id="fp-answer" value={answer} onChange={(e) => setAnswer(e.target.value)} placeholder="Case-insensitive" required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="fp-newpw">New Password</Label>
            <Input id="fp-newpw" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="••••••••" required minLength={6} />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null} Reset Password
          </Button>
        </form>
      )}
      <button type="button" onClick={onBack} className="text-sm text-muted-foreground hover:text-foreground underline w-full text-center transition-colors">
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
    try {
      await login(loginForm.username, loginForm.password);
      onRoleSelected?.();
    } catch (err) {
      toast.error(err.message || "Login failed.");
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!regForm.security_question) { toast.error("Please select a security question."); return; }
    try {
      await register(regForm);
      toast.success("Account created! Welcome.");
      onRoleSelected?.();
    } catch (err) {
      const detail = err.response?.data;
      const msg = typeof detail === "object" ? Object.values(detail).flat().join(" ") : err.message || "Registration failed.";
      toast.error(msg);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* ── Left hero panel ── */}
      <div className="hidden lg:flex flex-col justify-between w-[52%] p-12 relative overflow-hidden animated-gradient">
        <Particles />
        <div className="dot-grid absolute inset-0 opacity-40" />

        {/* Logo */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          className="relative flex items-center gap-3 z-10">
          <div className="h-10 w-10 rounded-xl glass flex items-center justify-center glow-sm">
            <GraduationCap className="h-5 w-5 text-white" />
          </div>
          <span className="font-bold text-white text-lg tracking-tight">Smart Placement Portal</span>
        </motion.div>

        {/* Hero text */}
        <div className="relative z-10 space-y-8">
          <div>
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.7 }}>
              <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-1.5 mb-5">
                <Sparkles className="h-3.5 w-3.5 text-amber-300" />
                <span className="text-xs text-white/80 font-medium">AI-Powered Job Matching</span>
              </div>
              <h2 className="text-5xl font-extrabold leading-tight text-white mb-4">
                Your Career<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-purple-300 to-pink-300">
                  Journey Starts
                </span><br />
                Here
              </h2>
              <p className="text-white/60 text-lg leading-relaxed">
                A centralized platform connecting students with top recruiters through smart skill matching.
              </p>
            </motion.div>
          </div>

          {/* Feature list */}
          <div className="space-y-3">
            {features.map((item, i) => (
              <motion.div key={item.text}
                initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + i * 0.1, duration: 0.5 }}
                className="flex items-center gap-3 glass rounded-xl px-4 py-3">
                <item.icon className={`h-4 w-4 shrink-0 ${item.color}`} />
                <span className="text-sm text-white/80">{item.text}</span>
              </motion.div>
            ))}
          </div>

          {/* Stats row */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }}
            className="grid grid-cols-4 gap-4 glass rounded-2xl p-4">
            {stats.map((s, i) => <AnimatedStat key={s.label} value={s.value} label={s.label} delay={1 + i * 0.1} />)}
          </motion.div>
        </div>

        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }}
          className="relative z-10 text-white/30 text-xs">
          © {new Date().getFullYear()} Smart Placement Portal. All rights reserved.
        </motion.p>
      </div>

      {/* ── Right auth panel ── */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10 bg-background overflow-y-auto">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          className="w-full max-w-md">

          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-6">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <GraduationCap className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-bold text-sm">Smart Placement Portal</span>
          </div>

          {/* Header */}
          <div className="text-center mb-7">
            <motion.div whileHover={{ scale: 1.05 }} className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary mb-4 glow-primary cursor-default">
              <GraduationCap className="h-9 w-9 text-primary-foreground" />
            </motion.div>
            <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Welcome back</h1>
            <p className="text-muted-foreground mt-1.5 text-sm">Sign in or create your account to continue</p>
          </div>

          <Card className="shadow-card border-border/60">
            <CardContent className="pt-5 pb-6 px-6">
              <AnimatePresence mode="wait">
                {showForgot ? (
                  <motion.div key="forgot" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                    <ForgotPassword onBack={() => setShowForgot(false)} />
                  </motion.div>
                ) : (
                  <motion.div key="auth" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                    <Tabs value={tab} onValueChange={setTab}>
                      <TabsList className="w-full mb-5 h-10">
                        <TabsTrigger value="login" className="flex-1 text-sm">Sign In</TabsTrigger>
                        <TabsTrigger value="register" className="flex-1 text-sm">Register</TabsTrigger>
                      </TabsList>

                      <TabsContent value="login">
                        <motion.form onSubmit={handleLogin} className="space-y-4"
                          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
                          <div className="space-y-1.5">
                            <Label htmlFor="login-username">Username</Label>
                            <Input id="login-username" value={loginForm.username}
                              onChange={(e) => setLoginForm((p) => ({ ...p, username: e.target.value }))}
                              placeholder="your_username" required className="h-10" />
                          </div>
                          <div className="space-y-1.5">
                            <Label htmlFor="login-password">Password</Label>
                            <Input id="login-password" type="password" value={loginForm.password}
                              onChange={(e) => setLoginForm((p) => ({ ...p, password: e.target.value }))}
                              placeholder="••••••••" required className="h-10" />
                          </div>
                          <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                            <Button type="submit" className="w-full h-10 font-semibold" disabled={isLoggingIn}>
                              {isLoggingIn
                                ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Signing In...</>
                                : <><Zap className="mr-2 h-4 w-4" />Sign In</>}
                            </Button>
                          </motion.div>
                          <button type="button" onClick={() => setShowForgot(true)}
                            className="text-sm text-muted-foreground hover:text-primary underline w-full text-center transition-colors">
                            Forgot password?
                          </button>
                        </motion.form>
                      </TabsContent>

                      <TabsContent value="register">
                        <motion.form onSubmit={handleRegister} className="space-y-3"
                          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                              <Label htmlFor="reg-first">First Name</Label>
                              <Input id="reg-first" value={regForm.first_name}
                                onChange={(e) => setRegForm((p) => ({ ...p, first_name: e.target.value }))}
                                placeholder="Jane" required className="h-9" />
                            </div>
                            <div className="space-y-1.5">
                              <Label htmlFor="reg-last">Last Name</Label>
                              <Input id="reg-last" value={regForm.last_name}
                                onChange={(e) => setRegForm((p) => ({ ...p, last_name: e.target.value }))}
                                placeholder="Smith" required className="h-9" />
                            </div>
                          </div>
                          <div className="space-y-1.5">
                            <Label htmlFor="reg-username">Username</Label>
                            <Input id="reg-username" value={regForm.username}
                              onChange={(e) => setRegForm((p) => ({ ...p, username: e.target.value }))}
                              placeholder="jane_smith" required className="h-9" />
                          </div>
                          <div className="space-y-1.5">
                            <Label htmlFor="reg-email">Email</Label>
                            <Input id="reg-email" type="email" value={regForm.email}
                              onChange={(e) => setRegForm((p) => ({ ...p, email: e.target.value }))}
                              placeholder="jane@university.edu" required className="h-9" />
                          </div>
                          <div className="space-y-1.5">
                            <Label htmlFor="reg-password">Password</Label>
                            <Input id="reg-password" type="password" value={regForm.password}
                              onChange={(e) => setRegForm((p) => ({ ...p, password: e.target.value }))}
                              placeholder="••••••••" required minLength={6} className="h-9" />
                          </div>

                          {/* Role selector */}
                          <div className="grid grid-cols-3 gap-2 pt-1">
                            {[
                              { role: "STUDENT", emoji: "🎓", label: "Student",   color: "border-blue-400 bg-blue-50 text-blue-700" },
                              { role: "COMPANY", emoji: "🏢", label: "Recruiter", color: "border-purple-400 bg-purple-50 text-purple-700" },
                              { role: "ADMIN",   emoji: "🛡️", label: "Admin",     color: "border-emerald-400 bg-emerald-50 text-emerald-700" },
                            ].map(({ role: r, emoji, label, color }) => (
                              <motion.button key={r} type="button" whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                                onClick={() => setRegForm((p) => ({ ...p, role: r }))}
                                className={`rounded-xl border-2 p-2.5 text-xs font-semibold transition-all ${regForm.role === r ? color + " shadow-sm" : "border-border hover:border-primary/40 text-muted-foreground"}`}>
                                <span className="text-base block mb-0.5">{emoji}</span>{label}
                              </motion.button>
                            ))}
                          </div>

                          <AnimatePresence mode="wait">
                            {regForm.role === "STUDENT" && (
                              <motion.div key="enroll" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="space-y-1.5 overflow-hidden">
                                <Label htmlFor="reg-enroll">Enrollment No.</Label>
                                <Input id="reg-enroll" value={regForm.enrollment_no}
                                  onChange={(e) => setRegForm((p) => ({ ...p, enrollment_no: e.target.value }))}
                                  placeholder="2021CS001" required className="h-9" />
                              </motion.div>
                            )}
                            {regForm.role === "COMPANY" && (
                              <motion.div key="company" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="space-y-1.5 overflow-hidden">
                                <Label htmlFor="reg-company">Company Name</Label>
                                <Input id="reg-company" value={regForm.company_name}
                                  onChange={(e) => setRegForm((p) => ({ ...p, company_name: e.target.value }))}
                                  placeholder="TechCorp Inc." className="h-9" />
                              </motion.div>
                            )}
                            {regForm.role === "ADMIN" && (
                              <motion.div key="admin" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="space-y-1.5 overflow-hidden">
                                <Label htmlFor="reg-secret">Admin Secret Key</Label>
                                <Input id="reg-secret" type="password" value={regForm.admin_secret}
                                  onChange={(e) => setRegForm((p) => ({ ...p, admin_secret: e.target.value }))}
                                  placeholder="Enter secret key" required className="h-9" />
                                <p className="text-xs text-muted-foreground">Contact your system administrator for the secret key.</p>
                              </motion.div>
                            )}
                          </AnimatePresence>

                          <div className="border-t border-border pt-3 space-y-3">
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                              <Shield className="h-3 w-3" /> Security Question
                            </p>
                            <div className="space-y-1.5">
                              <Label htmlFor="reg-sq">Question</Label>
                              <Select value={regForm.security_question} onValueChange={(v) => setRegForm((p) => ({ ...p, security_question: v }))}>
                                <SelectTrigger id="reg-sq" className="h-9"><SelectValue placeholder="Choose a security question..." /></SelectTrigger>
                                <SelectContent>
                                  {SECURITY_QUESTIONS.map((q) => <SelectItem key={q} value={q}>{q}</SelectItem>)}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-1.5">
                              <Label htmlFor="reg-sa">Answer</Label>
                              <Input id="reg-sa" value={regForm.security_answer}
                                onChange={(e) => setRegForm((p) => ({ ...p, security_answer: e.target.value }))}
                                placeholder="Your answer (case-insensitive)" required className="h-9" />
                            </div>
                          </div>

                          <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                            <Button type="submit" className="w-full h-10 font-semibold" disabled={isLoggingIn}>
                              {isLoggingIn
                                ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Creating Account...</>
                                : "Create Account →"}
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

          {/* Bottom role badges */}
          {!showForgot && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
              className="grid grid-cols-3 gap-3 mt-4">
              {[
                { icon: GraduationCap, label: "Students",   color: "bg-blue-50 text-blue-600 border-blue-100" },
                { icon: Building2,    label: "Recruiters",  color: "bg-purple-50 text-purple-600 border-purple-100" },
                { icon: Shield,       label: "Admins",      color: "bg-emerald-50 text-emerald-600 border-emerald-100" },
              ].map((role, i) => (
                <motion.div key={role.label} whileHover={{ y: -2 }} transition={{ duration: 0.2 }}
                  className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border ${role.color}`}>
                  <role.icon className="h-4 w-4" />
                  <span className="text-xs font-medium">{role.label}</span>
                </motion.div>
              ))}
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
