import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Briefcase, Building2, CheckCircle, GraduationCap, Loader2, Shield, TrendingUp, Users } from "lucide-react";
import { motion } from "motion/react";
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
  { icon: Briefcase, text: "500+ Active Job & Internship Listings" },
  { icon: Users, text: "2,000+ Students Placed Successfully" },
  { icon: TrendingUp, text: "95% Placement Rate for Top Performers" },
  { icon: CheckCircle, text: "Real-time Application Status Tracking" },
];

const roleCards = [
  { icon: GraduationCap, label: "Students", color: "bg-blue-50 text-blue-600" },
  { icon: Building2, label: "Recruiters", color: "bg-purple-50 text-purple-600" },
  { icon: Shield, label: "Admins", color: "bg-green-50 text-green-600" },
];

// ── Forgot Password flow ──────────────────────────────────────────────────────
function ForgotPassword({ onBack }) {
  const { getSecurityQuestion, resetPassword } = useAuth();
  const [step, setStep] = useState(1); // 1=username, 2=answer+newpw
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
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Reset Password</h2>
        <p className="text-sm text-muted-foreground">Answer your security question to reset your password.</p>
      </div>

      {step === 1 && (
        <form onSubmit={handleLookup} className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="fp-username">Username</Label>
            <Input id="fp-username" value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="your_username" required />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Continue
          </Button>
        </form>
      )}

      {step === 2 && (
        <form onSubmit={handleReset} className="space-y-3">
          <div className="rounded-md bg-muted px-4 py-3 text-sm text-foreground">
            {question}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="fp-answer">Your Answer</Label>
            <Input id="fp-answer" value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Answer is case-insensitive" required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="fp-newpw">New Password</Label>
            <Input id="fp-newpw" type="password" value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••" required minLength={6} />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Reset Password
          </Button>
        </form>
      )}

      <button type="button" onClick={onBack}
        className="text-sm text-muted-foreground hover:text-foreground underline w-full text-center">
        Back to Sign In
      </button>
    </div>
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
    if (!regForm.security_question) {
      toast.error("Please select a security question.");
      return;
    }
    try {
      await register(regForm);
      toast.success("Account created! Welcome.");
      onRoleSelected?.();
    } catch (err) {
      const detail = err.response?.data;
      const msg = typeof detail === "object"
        ? Object.values(detail).flat().join(" ")
        : err.message || "Registration failed.";
      toast.error(msg);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sidebar to-sidebar/80 flex">
      {/* Left panel */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 p-12 text-white">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center">
            <GraduationCap className="h-6 w-6" />
          </div>
          <span className="font-bold text-lg">Smart Placement Portal</span>
        </div>
        <div>
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
            <h2 className="text-4xl font-bold leading-tight mb-4">Your Career Journey<br />Starts Here</h2>
            <p className="text-white/70 text-lg mb-8">A centralized platform connecting students with top recruiters.</p>
          </motion.div>
          <div className="space-y-4">
            {features.map((item) => (
              <div key={item.text} className="flex items-center gap-3 text-white/80">
                <item.icon className="h-5 w-5 text-white/50" />
                <span className="text-sm">{item.text}</span>
              </div>
            ))}
          </div>
        </div>
        <p className="text-white/40 text-sm">© {new Date().getFullYear()} Smart Placement Portal.</p>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
          <div className="text-center mb-6">
            <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary mb-4">
              <GraduationCap className="h-8 w-8 text-primary-foreground" />
            </div>
            <h1 className="text-3xl font-bold text-foreground">Welcome</h1>
            <p className="text-muted-foreground mt-1">Sign in or create an account</p>
          </div>

          <Card className="shadow-card">
            <CardContent className="pt-4">
              {showForgot ? (
                <ForgotPassword onBack={() => setShowForgot(false)} />
              ) : (
                <Tabs value={tab} onValueChange={setTab}>
                  <TabsList className="w-full mb-4">
                    <TabsTrigger value="login" className="flex-1">Sign In</TabsTrigger>
                    <TabsTrigger value="register" className="flex-1">Register</TabsTrigger>
                  </TabsList>

                  <TabsContent value="login">
                    <form onSubmit={handleLogin} className="space-y-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="login-username">Username</Label>
                        <Input id="login-username" value={loginForm.username}
                          onChange={(e) => setLoginForm((p) => ({ ...p, username: e.target.value }))}
                          placeholder="your_username" required />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="login-password">Password</Label>
                        <Input id="login-password" type="password" value={loginForm.password}
                          onChange={(e) => setLoginForm((p) => ({ ...p, password: e.target.value }))}
                          placeholder="••••••••" required />
                      </div>
                      <Button type="submit" className="w-full" disabled={isLoggingIn}>
                        {isLoggingIn ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Signing In...</> : "Sign In"}
                      </Button>
                      <button type="button" onClick={() => setShowForgot(true)}
                        className="text-sm text-muted-foreground hover:text-foreground underline w-full text-center">
                        Forgot password?
                      </button>
                    </form>
                  </TabsContent>

                  <TabsContent value="register">
                    <form onSubmit={handleRegister} className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <Label htmlFor="reg-first">First Name</Label>
                          <Input id="reg-first" value={regForm.first_name}
                            onChange={(e) => setRegForm((p) => ({ ...p, first_name: e.target.value }))}
                            placeholder="Jane" required />
                        </div>
                        <div className="space-y-1.5">
                          <Label htmlFor="reg-last">Last Name</Label>
                          <Input id="reg-last" value={regForm.last_name}
                            onChange={(e) => setRegForm((p) => ({ ...p, last_name: e.target.value }))}
                            placeholder="Smith" required />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="reg-username">Username</Label>
                        <Input id="reg-username" value={regForm.username}
                          onChange={(e) => setRegForm((p) => ({ ...p, username: e.target.value }))}
                          placeholder="jane_smith" required />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="reg-email">Email</Label>
                        <Input id="reg-email" type="email" value={regForm.email}
                          onChange={(e) => setRegForm((p) => ({ ...p, email: e.target.value }))}
                          placeholder="jane@university.edu" required />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="reg-password">Password</Label>
                        <Input id="reg-password" type="password" value={regForm.password}
                          onChange={(e) => setRegForm((p) => ({ ...p, password: e.target.value }))}
                          placeholder="••••••••" required minLength={6} />
                      </div>

                      <div className="grid grid-cols-3 gap-2 pt-1">
                        {[
                          { role: "STUDENT", emoji: "🎓", label: "Student" },
                          { role: "COMPANY", emoji: "🏢", label: "Recruiter" },
                          { role: "ADMIN",   emoji: "🛡️", label: "Admin" },
                        ].map(({ role: r, emoji, label }) => (
                          <button key={r} type="button"
                            onClick={() => setRegForm((p) => ({ ...p, role: r }))}
                            className={`rounded-lg border-2 p-3 text-sm font-medium transition-all ${regForm.role === r ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"}`}>
                            {emoji} {label}
                          </button>
                        ))}
                      </div>

                      {regForm.role === "STUDENT" && (
                        <div className="space-y-1.5">
                          <Label htmlFor="reg-enroll">Enrollment No.</Label>
                          <Input id="reg-enroll" value={regForm.enrollment_no}
                            onChange={(e) => setRegForm((p) => ({ ...p, enrollment_no: e.target.value }))}
                            placeholder="2021CS001" required />
                        </div>
                      )}
                      {regForm.role === "COMPANY" && (
                        <div className="space-y-1.5">
                          <Label htmlFor="reg-company">Company Name</Label>
                          <Input id="reg-company" value={regForm.company_name}
                            onChange={(e) => setRegForm((p) => ({ ...p, company_name: e.target.value }))}
                            placeholder="TechCorp Inc." />
                        </div>
                      )}
                      {regForm.role === "ADMIN" && (
                        <div className="space-y-1.5">
                          <Label htmlFor="reg-secret">Admin Secret Key</Label>
                          <Input id="reg-secret" type="password" value={regForm.admin_secret}
                            onChange={(e) => setRegForm((p) => ({ ...p, admin_secret: e.target.value }))}
                            placeholder="Enter secret key" required />
                          <p className="text-xs text-muted-foreground">Contact your system administrator for the secret key.</p>
                        </div>
                      )}

                      {/* Security question — always shown */}
                      <div className="border-t border-border pt-3 space-y-3">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Security Question</p>
                        <div className="space-y-1.5">
                          <Label htmlFor="reg-sq">Question</Label>
                          <Select value={regForm.security_question}
                            onValueChange={(v) => setRegForm((p) => ({ ...p, security_question: v }))}>
                            <SelectTrigger id="reg-sq">
                              <SelectValue placeholder="Choose a security question..." />
                            </SelectTrigger>
                            <SelectContent>
                              {SECURITY_QUESTIONS.map((q) => (
                                <SelectItem key={q} value={q}>{q}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-1.5">
                          <Label htmlFor="reg-sa">Answer</Label>
                          <Input id="reg-sa" value={regForm.security_answer}
                            onChange={(e) => setRegForm((p) => ({ ...p, security_answer: e.target.value }))}
                            placeholder="Your answer (case-insensitive)" required />
                        </div>
                      </div>

                      <Button type="submit" className="w-full" disabled={isLoggingIn}>
                        {isLoggingIn ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Creating Account...</> : "Create Account"}
                      </Button>
                    </form>
                  </TabsContent>
                </Tabs>
              )}
            </CardContent>
          </Card>

          {!showForgot && (
            <div className="grid grid-cols-3 gap-3 mt-4">
              {roleCards.map((role) => (
                <div key={role.label} className="flex flex-col items-center gap-1.5 p-3 rounded-lg bg-muted">
                  <div className={`h-8 w-8 rounded-full ${role.color} flex items-center justify-center`}>
                    <role.icon className="h-4 w-4" />
                  </div>
                  <span className="text-xs text-muted-foreground">{role.label}</span>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
