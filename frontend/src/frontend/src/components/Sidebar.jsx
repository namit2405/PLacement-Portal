import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Briefcase, Building2, ClipboardList, FileText,
  GraduationCap, LayoutDashboard, LogOut, Menu, MessageCircle, Settings, Sparkles, User, Users, X,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { useUnreadCount } from "../hooks/useQueries";

const studentLinks = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "profile", label: "My Profile", icon: User },
  { id: "browse", label: "Browse Jobs", icon: Briefcase },
  { id: "recommended", label: "For You", icon: Sparkles },
  { id: "applications", label: "My Applications", icon: FileText },
  { id: "chat", label: "Messages", icon: MessageCircle, badge: true },
];

const recruiterLinks = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "profile", label: "My Profile", icon: Building2 },
  { id: "post", label: "Post a Job", icon: Briefcase },
  { id: "jobs", label: "My Job Listings", icon: ClipboardList },
  { id: "applicants", label: "View Applicants", icon: Users },
  { id: "chat", label: "Messages", icon: MessageCircle, badge: true },
];

const adminLinks = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "students", label: "Students", icon: GraduationCap },
  { id: "recruiters", label: "Recruiters", icon: Building2 },
  { id: "jobs", label: "All Jobs", icon: Briefcase },
  { id: "applications", label: "All Applications", icon: ClipboardList },
  { id: "roles", label: "User Management", icon: Settings },
];

const roleLabels = { student: "Student", recruiter: "Recruiter", admin: "Admin" };
const roleIcons = {
  student: <GraduationCap className="h-5 w-5" />,
  recruiter: <Building2 className="h-5 w-5" />,
  admin: <Settings className="h-5 w-5" />,
};

function SidebarContent({ role, activeTab, onTabChange, onClose }) {
  const { logout } = useAuth();
  const { data: unread = 0 } = useUnreadCount();
  const links =
    role === "student" ? studentLinks
    : role === "recruiter" ? recruiterLinks
    : adminLinks;

  return (
    <div className="flex flex-col h-full">
      <div className="px-6 py-5 border-b border-sidebar-border flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-primary flex items-center justify-center shrink-0">
            <GraduationCap className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <p className="text-xs font-semibold text-sidebar-foreground leading-tight">Smart Placement</p>
            <p className="text-xs text-sidebar-foreground/50 leading-tight">&amp; Internship Portal</p>
          </div>
        </div>
        {onClose && (
          <button type="button" onClick={onClose} className="text-sidebar-foreground/60 hover:text-sidebar-foreground md:hidden">
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      <div className="px-4 pt-4 pb-2">
        <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-sidebar-accent">
          <span className="text-white">{roleIcons[role]}</span>
          <span className="text-xs font-semibold text-sidebar-accent-foreground">
            {roleLabels[role]} Portal
          </span>
        </div>
      </div>

      <nav className="flex-1 px-3 py-2 space-y-0.5 overflow-y-auto">
        {links.map((link) => {
          const Icon = link.icon;
          const showBadge = link.badge && unread > 0;
          return (
            <button key={link.id} type="button"
              onClick={() => { onTabChange(link.id); onClose?.(); }}
              data-ocid={`nav.${link.id}.link`}
              className={cn("sidebar-nav-item w-full text-left", activeTab === link.id && "active")}>
              <Icon className="h-4 w-4 shrink-0" />
              <span className="flex-1">{link.label}</span>
              {showBadge && (
                <span className="h-5 min-w-5 px-1 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-bold">
                  {unread > 9 ? "9+" : unread}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="px-3 pb-4 border-t border-sidebar-border pt-3">
        <Button variant="ghost" size="sm" onClick={logout} data-ocid="nav.logout.button"
          className="w-full justify-start gap-3 text-sidebar-foreground hover:text-destructive hover:bg-destructive/10">
          <LogOut className="h-4 w-4" />
          Sign Out
        </Button>
      </div>
    </div>
  );
}

export function MobileMenuButton({ onClick }) {
  return (
    <button type="button" onClick={onClick}
      className="md:hidden p-2 rounded-md text-foreground hover:bg-accent">
      <Menu className="h-5 w-5" />
    </button>
  );
}

export function Sidebar({ role, activeTab, onTabChange, mobileOpen, onMobileClose }) {
  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-64 h-screen flex-col bg-sidebar border-r border-sidebar-border sticky top-0 shrink-0 overflow-hidden">
        <SidebarContent role={role} activeTab={activeTab} onTabChange={onTabChange} />
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={onMobileClose} />
          <aside className="absolute left-0 top-0 h-full w-64 flex flex-col bg-sidebar border-r border-sidebar-border overflow-hidden">
            <SidebarContent role={role} activeTab={activeTab} onTabChange={onTabChange} onClose={onMobileClose} />
          </aside>
        </div>
      )}
    </>
  );
}
