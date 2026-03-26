import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Briefcase, Building2, ClipboardList, FileText,
  GraduationCap, LayoutDashboard, LogOut, Menu, MessageCircle, Settings, Sparkles, User, Users, X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useAuth } from "../hooks/useAuth";
import { useUnreadCount } from "../hooks/useQueries";

const studentLinks = [
  { id: "dashboard",    label: "Dashboard",      icon: LayoutDashboard },
  { id: "profile",      label: "My Profile",      icon: User },
  { id: "browse",       label: "Browse Jobs",     icon: Briefcase },
  { id: "recommended",  label: "For You",         icon: Sparkles },
  { id: "applications", label: "My Applications", icon: FileText },
  { id: "chat",         label: "Messages",        icon: MessageCircle, badge: true },
];

const recruiterLinks = [
  { id: "dashboard",  label: "Dashboard",      icon: LayoutDashboard },
  { id: "profile",    label: "My Profile",      icon: Building2 },
  { id: "post",       label: "Post a Job",      icon: Briefcase },
  { id: "jobs",       label: "My Job Listings", icon: ClipboardList },
  { id: "applicants", label: "View Applicants", icon: Users },
  { id: "chat",       label: "Messages",        icon: MessageCircle, badge: true },
];

const adminLinks = [
  { id: "dashboard",    label: "Dashboard",        icon: LayoutDashboard },
  { id: "students",     label: "Students",         icon: GraduationCap },
  { id: "recruiters",   label: "Recruiters",       icon: Building2 },
  { id: "jobs",         label: "All Jobs",         icon: Briefcase },
  { id: "applications", label: "All Applications", icon: ClipboardList },
  { id: "roles",        label: "User Management",  icon: Settings },
];

const roleLabels = {
  student:   "Student Portal",
  recruiter: "Recruiter Portal",
  admin:     "Admin Dashboard",
};

function SidebarContent({ role, activeTab, onTabChange, onClose }) {
  const { logout, user } = useAuth();
  const { data: unread = 0 } = useUnreadCount();
  const links = role === "student" ? studentLinks : role === "recruiter" ? recruiterLinks : adminLinks;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-5 py-4 border-b border-sidebar-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center shrink-0">
              <GraduationCap className="h-4 w-4 text-white" />
            </div>
            <div>
              <p className="text-xs font-semibold text-sidebar-foreground leading-tight">Smart Placement</p>
              <p className="text-xs text-sidebar-foreground/35 leading-tight">& Internship Portal</p>
            </div>
          </div>
          {onClose && (
            <button type="button" onClick={onClose} className="text-sidebar-foreground/40 hover:text-sidebar-foreground md:hidden transition-colors">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Role label */}
      <div className="px-4 pt-4 pb-2">
        <div className="px-3 py-2 rounded-md bg-sidebar-accent/60">
          <p className="text-xs font-semibold text-sidebar-foreground/60 uppercase tracking-wider">{roleLabels[role]}</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-1 space-y-0.5 overflow-y-auto">
        {links.map((link, i) => {
          const Icon = link.icon;
          const isActive = activeTab === link.id;
          const showBadge = link.badge && unread > 0;
          return (
            <motion.button key={link.id} type="button"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04, duration: 0.25 }}
              onClick={() => { onTabChange(link.id); onClose?.(); }}
              data-ocid={`nav.${link.id}.link`}
              className={cn("sidebar-nav-item w-full text-left", isActive && "active")}>
              <Icon className="h-4 w-4 shrink-0" />
              <span className="flex-1 text-sm">{link.label}</span>
              {showBadge && (
                <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 400 }}
                  className="h-4.5 min-w-[18px] px-1 rounded-full bg-indigo-600 text-white text-[10px] flex items-center justify-center font-bold">
                  {unread > 9 ? "9+" : unread}
                </motion.span>
              )}
            </motion.button>
          );
        })}
      </nav>

      {/* User + logout */}
      <div className="px-3 pb-4 pt-3 border-t border-sidebar-border space-y-1">
        {user && (
          <div className="flex items-center gap-2.5 px-3 py-2 rounded-md mb-1">
            <div className="h-6 w-6 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
              {(user.first_name || user.username || "?")[0].toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-sidebar-foreground/70 truncate">
                {user.first_name ? `${user.first_name} ${user.last_name || ""}`.trim() : user.username}
              </p>
            </div>
          </div>
        )}
        <button type="button" onClick={logout} data-ocid="nav.logout.button"
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-xs font-medium text-sidebar-foreground/50 hover:text-red-400 hover:bg-red-500/10 transition-all">
          <LogOut className="h-3.5 w-3.5 shrink-0" />
          Sign Out
        </button>
      </div>
    </div>
  );
}

export function MobileMenuButton({ onClick }) {
  return (
    <button type="button" onClick={onClick}
      className="md:hidden p-2 rounded-md text-foreground hover:bg-accent transition-colors">
      <Menu className="h-5 w-5" />
    </button>
  );
}

export function Sidebar({ role, activeTab, onTabChange, mobileOpen, onMobileClose }) {
  return (
    <>
      <aside className="hidden md:flex w-60 h-screen flex-col bg-sidebar border-r border-sidebar-border sticky top-0 shrink-0 overflow-hidden">
        <SidebarContent role={role} activeTab={activeTab} onTabChange={onTabChange} />
      </aside>

      <AnimatePresence>
        {mobileOpen && (
          <div className="fixed inset-0 z-50 md:hidden">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50" onClick={onMobileClose} />
            <motion.aside
              initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 280, damping: 28 }}
              className="absolute left-0 top-0 h-full w-60 flex flex-col bg-sidebar border-r border-sidebar-border shadow-2xl overflow-hidden">
              <SidebarContent role={role} activeTab={activeTab} onTabChange={onTabChange} onClose={onMobileClose} />
            </motion.aside>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
