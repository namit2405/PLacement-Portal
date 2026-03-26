import { motion } from "motion/react";

// Page-level fade+slide entrance with staggered children
export function PageTransition({ children, className = "" }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className={className}>
      {children}
    </motion.div>
  );
}

// Staggered list container
export function StaggerList({ children, className = "", stagger = 0.06 }) {
  return (
    <motion.div className={className}
      initial="hidden" animate="visible"
      variants={{ visible: { transition: { staggerChildren: stagger } } }}>
      {children}
    </motion.div>
  );
}

// Each item in a StaggerList
export function StaggerItem({ children, className = "" }) {
  return (
    <motion.div className={className}
      variants={{
        hidden:  { opacity: 0, y: 14, scale: 0.98 },
        visible: { opacity: 1, y: 0,  scale: 1, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] } },
      }}>
      {children}
    </motion.div>
  );
}

// Animated stat card — professional, single accent
export function AnimatedStatCard({ label, value, accent = "text-foreground", delay = 0, icon: Icon }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.35 }}
      whileHover={{ y: -2, boxShadow: "0 4px 16px rgba(99,102,241,0.08)" }}
      className="rounded-xl border border-border bg-card p-4 cursor-default transition-shadow">
      {Icon && <Icon className={`h-4 w-4 mb-2 opacity-60 ${accent}`} />}
      <motion.p className={`text-2xl font-bold ${accent}`}
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: delay + 0.1 }}>
        {value}
      </motion.p>
      <p className="text-xs text-muted-foreground font-medium mt-0.5">{label}</p>
    </motion.div>
  );
}

// Hover-lift card wrapper
export function HoverCard({ children, className = "" }) {
  return (
    <motion.div
      whileHover={{ y: -2, boxShadow: "0 4px 16px rgba(99,102,241,0.08)" }}
      transition={{ duration: 0.18 }}
      className={className}>
      {children}
    </motion.div>
  );
}

// Section header with optional action link
export function SectionHeader({ title, action, actionLabel, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.3 }}
      className="flex items-center justify-between mb-2">
      <p className="text-sm font-semibold text-foreground">{title}</p>
      {action && (
        <button type="button" onClick={action}
          className="text-xs text-indigo-600 hover:text-indigo-700 font-medium transition-colors">
          {actionLabel} →
        </button>
      )}
    </motion.div>
  );
}
