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
  { id: "dashboard",    label: "Dashboard",       icon: LayoutDashboard },
  { id: "profile",      label: "My Profile",       icon: User },
  { id: "browse",       label: "Browse Jobs",      icon: Briefcase },
  { id: "recommended",  label: "For You",          icon: Sparkles },
  { id: "applications", label: "My Applications",  icon: FileText },
  { id: "chat",         label: "Messages",         icon: MessageCircle, badge: true },
];

const recruiterLinks = [
  { id: "dashboard",  label: "Dashboard",       icon: LayoutDashboard },
  { id: "profile",    label: "My Profile",       icon: Building2 },
  { id: "post",       label: "Post a Job",       icon: Briefcase },
  { id: "jobs",       label: "My Job Listings",  icon: ClipboardList },
  { id: "applicants", label: "View Applicants",  icon: Users },
  { id: "chat",       label: "Messages",         icon: MessageCircle, badge: true },
];

const adminLinks = [
  { id: "dashboard",    label: "Dashboard",         icon: LayoutDashboard },
  { id: "students",     label: "Students",          icon: GraduationCap },
  { id: "recruiters",   label: "Recruiters",        icon: Building2 },
  { id: "jobs",         label: "All Jobs",          icon: Briefcase },
  { id: "applications", label: "All Applications",  icon: ClipboardList },
  { id: "roles",        label: "User Management",   icon: Settings },
];

const roleConfig = {
  student:   { label: "Student Portal",   icon: GraduationCap, gradient: "from-blue-500 to-indigo-600" },
  recruiter: { label: "Recruiter Portal", icon: Building2,     gradient: "from-purple-500 to-violet-600" },
  admin:     { label: "Admin Dashboard",  icon: Settings,      gradient: "from-emerald-500 to-teal-600" },
};

function SidebarContent({ role, activeTab, onTabChange, onClose }) {
  const { logout, user } = useAuth();
  const { data: unread = 0 } = useUnreadCount();
  const links = role === "student" ? studentLinks : role === "recruiter" ? recruiterLinks : adminLinks;
  const cfg = roleConfig[role];
  const Icon = cfg.icon;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-5 py-4 border-b border-sidebar-border">
        <div className="flex items-center justify-between">
          <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4 }}
            className="flex items-center gap-3">
            <motion.div whileHover={{ rotate: 10, scale: 1.1 }} transition={{ type: "spring", stiffness: 300 }}
              className="h-9 w-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shrink-0 shadow-lg">
              <GraduationCap className="h-5 w-5 text-white" />
            </motion.div>
            <div>
              <p className="text-xs font-bold text-sidebar-foreground leading-tight">Smart Placement</p>
              <p className="text-xs text-sidebar-foreground/40 leading-tight">& Internship Portal</p>
            </div>
          </motion.div>
          {onClose && (
            <motion.button type="button" onClick={onClose} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
              className="text-sidebar-foreground/60 hover:text-sidebar-foreground md:hidden">
              <X className="h-5 w-5" />
            </motion.button>
          )}
        </div>
      </div>

      {/* Role badge */}
      <div className="px-4 pt-4 pb-2">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}
          className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-gradient-to-r ${cfg.gradient} shadow-md`}>
          <Icon className="h-4 w-4 text-white shrink-0" />
          <span className="text-xs font-bold text-white tracking-wide">{cfg.label}</span>
          <motion.div animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 2, repeat: Infinity }}
            className="ml-auto h-2 w-2 rounded-full bg-white/60" />
        </motion.div>
      </div>

      {/* Nav links */}
      <nav className="flex-1 px-3 py-2 space-y-0.5 overflow-y-auto">
        {links.map((link, i) => {
          const NavIcon = link.icon;
          const showBadge = link.badge && unread > 0;
          const isActive = activeTab === link.id;
          return (
            <motion.button key={link.id} type="button"
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.05 * i, duration: 0.3 }}
              onClick={() => { onTabChange(link.id); onClose?.(); }}
              data-ocid={`nav.${link.id}.link`}
              className={cn("sidebar-nav-item w-full text-left", isActive && "active")}>
              <motion.div whileHover={{ scale: 1.15, rotate: 5 }} transition={{ type: "spring", stiffness: 400 }}>
                <NavIcon className="h-4 w-4 shrink-0" />
              </motion.div>
              <span className="flex-1">{link.label}</span>
              {showBadge && (
                <motion.span
                  initial={{ scale: 0 }} animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 500 }}
                  className="h-5 min-w-5 px-1 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-xs flex items-center justify-center font-bold shadow-sm">
                  {unread > 9 ? "9+" : unread}
                </motion.span>
              )}
              {isActive && (
                <motion.div layoutId="activeIndicator"
                  className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-l-full bg-gradient-to-b from-indigo-400 to-purple-500"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }} />
              )}
            </motion.button>
          );
        })}
      </nav>

      {/* User + logout */}
      <div className="px-3 pb-4 border-t border-sidebar-border pt-3 space-y-2">
        {user && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
            className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-sidebar-accent/50">
            <div className="h-7 w-7 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
              {(user.first_name || user.username || "?")[0].toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-sidebar-foreground truncate">
                {user.first_name ? `${user.first_name} ${user.last_name || ""}`.trim() : user.username}
              </p>
              <p className="text-xs text-sidebar-foreground/40 truncate">{user.email}</p>
            </div>
          </motion.div>
        )}
        <motion.div whileHover={{ x: 2 }} transition={{ duration: 0.15 }}>
          <Button variant="ghost" size="sm" onClick={logout} data-ocid="nav.logout.button"
            className="w-full justify-start gap-3 text-sidebar-foreground/70 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all">
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </motion.div>
      </div>
    </div>
  );
}

export function MobileMenuButton({ onClick }) {
  return (
    <motion.button type="button" onClick={onClick} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
      className="md:hidden p-2 rounded-xl text-foreground hover:bg-accent transition-colors">
      <Menu className="h-5 w-5" />
    </motion.button>
  );
}

export function Sidebar({ role, activeTab, onTabChange, mobileOpen, onMobileClose }) {
  return (
    <>
      <aside className="hidden md:flex w-64 h-screen flex-col bg-sidebar border-r border-sidebar-border sticky top-0 shrink-0 overflow-hidden">
        <SidebarContent role={role} activeTab={activeTab} onTabChange={onTabChange} />
      </aside>

      <AnimatePresence>
        {mobileOpen && (
          <div className="fixed inset-0 z-50 md:hidden">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onMobileClose} />
            <motion.aside
              initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="absolute left-0 top-0 h-full w-64 flex flex-col bg-sidebar border-r border-sidebar-border overflow-hidden shadow-2xl">
              <SidebarContent role={role} activeTab={activeTab} onTabChange={onTabChange} onClose={onMobileClose} />
            </motion.aside>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
