import { Toaster } from "@/components/ui/sonner";
import { GraduationCap, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { MobileMenuButton, Sidebar } from "./components/Sidebar";
import { AuthProvider, useAuth } from "./hooks/useAuth";
import { useMyRole } from "./hooks/useQueries";
import { AdminDashboard } from "./pages/AdminDashboard";
import { LandingPage } from "./pages/LandingPage";
import { RecruiterDashboard } from "./pages/RecruiterDashboard";
import { StudentDashboard } from "./pages/StudentDashboard";

function AppInner() {
  const { user, isInitializing } = useAuth();
  const { isLoading: roleLoading } = useMyRole();
  const [mobileOpen, setMobileOpen] = useState(false);

  const appRole =
    user?.role === "ADMIN" ? "admin"
    : user?.role === "COMPANY" ? "recruiter"
    : "student";

  const [activeTab, setActiveTab] = useState("dashboard");

  useEffect(() => {
    if (user) {
      setActiveTab("dashboard");
    }
  }, [user?.role]);

  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="h-14 w-14 rounded-2xl bg-primary flex items-center justify-center">
            <GraduationCap className="h-8 w-8 text-primary-foreground" />
          </div>
          <p className="text-muted-foreground text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <>
        <LandingPage />
        <Toaster />
      </>
    );
  }

  if (roleLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background items-start">
      <Sidebar
        role={appRole}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile menu button — only visible on small screens */}
        <div className="md:hidden flex items-center px-4 py-3 border-b border-border bg-card/80">
          <MobileMenuButton onClick={() => setMobileOpen(true)} />
          <p className="ml-3 text-sm font-semibold text-foreground">
            {appRole === "student" && "Student Portal"}
            {appRole === "recruiter" && "Recruiter Portal"}
            {appRole === "admin" && "Admin Dashboard"}
          </p>
        </div>

        {appRole === "student" && (
          <StudentDashboard activeTab={activeTab} onTabChange={setActiveTab} />
        )}
        {appRole === "recruiter" && (
          <RecruiterDashboard activeTab={activeTab} onTabChange={setActiveTab} />
        )}
        {appRole === "admin" && (
          <AdminDashboard activeTab={activeTab} onTabChange={setActiveTab} />
        )}
      </div>

      <Toaster />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppInner />
    </AuthProvider>
  );
}
