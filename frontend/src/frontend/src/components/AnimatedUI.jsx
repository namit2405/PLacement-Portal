import { motion } from "motion/react";

// Wraps any tab content with a smooth fade+slide entrance
export function PageTransition({ children, className = "" }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className={className}>
      {children}
    </motion.div>
  );
}

// Staggered list — wraps a list container, children animate in one by one
export function StaggerList({ children, className = "", stagger = 0.07 }) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      animate="visible"
      variants={{ visible: { transition: { staggerChildren: stagger } } }}>
      {children}
    </motion.div>
  );
}

// Each item inside StaggerList
export function StaggerItem({ children, className = "" }) {
  return (
    <motion.div
      className={className}
      variants={{
        hidden: { opacity: 0, y: 20, scale: 0.97 },
        visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
      }}>
      {children}
    </motion.div>
  );
}

// Animated stat card with number count-up feel
export function AnimatedStatCard({ label, value, color = "text-primary", bg = "bg-primary/8", border = "border-primary/20", icon: Icon, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.85, y: 16 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay, duration: 0.45, type: "spring", stiffness: 200 }}
      whileHover={{ scale: 1.03, y: -2 }}
      className={`rounded-2xl border ${border} ${bg} p-4 text-center relative overflow-hidden cursor-default`}>
      {/* Shimmer sweep */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12"
        initial={{ x: "-100%" }}
        animate={{ x: "200%" }}
        transition={{ delay: delay + 0.5, duration: 0.8, ease: "easeInOut" }} />
      {Icon && <Icon className={`h-5 w-5 mx-auto mb-2 ${color} opacity-70`} />}
      <motion.p
        className={`text-2xl font-extrabold ${color}`}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: delay + 0.2, duration: 0.4 }}>
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
      whileHover={{ y: -3, boxShadow: "0 12px 32px rgba(99,102,241,0.12), 0 4px 12px rgba(0,0,0,0.06)" }}
      transition={{ duration: 0.2 }}
      className={className}>
      {children}
    </motion.div>
  );
}

// Animated section header
export function SectionHeader({ title, action, actionLabel, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="flex items-center justify-between mb-3">
      <p className="text-sm font-bold text-foreground">{title}</p>
      {action && (
        <motion.button type="button" onClick={action} whileHover={{ x: 2 }}
          className="text-xs text-primary hover:underline font-medium transition-colors">
          {actionLabel} →
        </motion.button>
      )}
    </motion.div>
  );
}
