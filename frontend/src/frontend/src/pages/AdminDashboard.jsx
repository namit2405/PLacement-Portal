import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Briefcase, Edit, FileText, Loader2, RefreshCw, ShieldCheck, Trash2, TrendingUp, UserX, Users } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { JobTypeBadge } from "../components/JobTypeBadge";
import { SectionHeader } from "../components/AnimatedUI";
import { StatusBadge } from "../components/StatusBadge";
import { useAllApplications, useAllJobs, useAllRecruiters, useAllStudents, useAssignRole, useDeleteJob, useDeleteRecruiter, useDeleteStudent, useStats, useUpdateApplicationStatus, useUpdateJob, useUpdateRecruiter, useUpdateStudent } from "../hooks/useQueries";

export function AdminDashboard({ activeTab, onTabChange }) {
  return (
    <main className="flex-1 p-3 sm:p-6 overflow-auto">
      <Tabs value={activeTab} onValueChange={onTabChange}>
        <TabsContent value="dashboard"><DashboardTab /></TabsContent>
        <TabsContent value="students"><StudentsTab /></TabsContent>
        <TabsContent value="recruiters"><RecruitersTab /></TabsContent>
        <TabsContent value="jobs"><JobsTab /></TabsContent>
        <TabsContent value="applications"><ApplicationsTab /></TabsContent>
        <TabsContent value="roles"><RolesTab /></TabsContent>
      </Tabs>
    </main>
  );
}

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <Card className="shadow-card">
      <CardContent className="p-6">
        <div className="flex items-center gap-4">
          <div className={`h-12 w-12 rounded-xl ${color} flex items-center justify-center shrink-0`}>
            <Icon className="h-6 w-6" />
          </div>
          <div>
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-sm text-muted-foreground">{label}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function DashboardTab() {
  const { data: stats, isLoading, refetch } = useStats();
  const { data: applications = [] } = useAllApplications();
  const { data: jobs = [] } = useAllJobs();
  const pendingApps = applications.filter(a => a.status === "APPLIED").length;
  const expiredJobs = jobs.filter(j => j.last_date_to_apply && new Date(j.last_date_to_apply) < new Date()).length;
  const placementRate = stats?.totalApplications ? Math.round((stats.placements / stats.totalApplications) * 100) : 0;

  return (
    <div className="space-y-5">
      <motion.div initial={{ opacity:0, y:-12 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.4 }}
        className="rounded-xl border border-border bg-card p-5 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-semibold text-foreground">Admin Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Platform overview and management</p>
        </div>
        <motion.button whileHover={{ scale:1.03 }} whileTap={{ scale:0.97 }}
          onClick={() => { refetch(); toast.success("Stats refreshed."); }}
          className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border text-xs font-medium text-muted-foreground hover:text-foreground hover:border-indigo-300 transition-all">
          <RefreshCw className="h-3.5 w-3.5" /> Refresh
        </motion.button>
      </motion.div>

      {isLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[1,2,3,4].map(i => <Skeleton key={i} className="h-24 rounded-xl" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: "Students",     value: stats?.totalStudents ?? "'€”",     accent: "text-foreground" },
            { label: "Jobs",         value: stats?.totalJobs ?? "",         accent: "text-indigo-600" },
            { label: "Applications", value: stats?.totalApplications ?? "", accent: "text-foreground" },
            { label: "Placements",   value: stats?.placements ?? "",        accent: "text-emerald-600" },
          ].map((s, i) => (
            <motion.div key={s.label}
              initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }}
              transition={{ delay: 0.1 + i * 0.07 }}
              whileHover={{ y:-2, boxShadow:"0 4px 16px rgba(99,102,241,0.08)" }}
              className="rounded-xl border border-border bg-card p-4 cursor-default transition-shadow">
              <p className={`text-2xl font-bold ${s.accent}`}>{s.value}</p>
              <p className="text-xs text-muted-foreground font-medium mt-0.5">{s.label}</p>
            </motion.div>
          ))}
        </div>
      )}

      {!isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { label: "Pending Reviews",   value: pendingApps,         accent: "text-amber-600" },
            { label: "Expired Postings",  value: expiredJobs,         accent: "text-muted-foreground" },
            { label: "Placement Rate",    value: placementRate + "%", accent: "text-emerald-600" },
          ].map((s, i) => (
            <motion.div key={s.label}
              initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }}
              transition={{ delay: 0.4 + i * 0.07 }}
              whileHover={{ y:-1 }}
              className="rounded-xl border border-border bg-card p-4 flex items-center gap-3 cursor-default transition-all">
              <p className={`text-xl font-bold ${s.accent}`}>{s.value}</p>
              <p className="text-sm text-muted-foreground">{s.label}</p>
            </motion.div>
          ))}
        </div>
      )}

      <div>
        <SectionHeader title="Admin Actions" delay={0.55} />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {[
            { icon: ShieldCheck, title: "Manage User Roles",   desc: "Assign or change roles for any user.",                                       onClick: () => document.querySelector('[data-ocid="admin.roles.tab"]')?.click() },
            { icon: Users,       title: "View All Students",   desc: "Browse student profiles, CGPA, and skills.",                                onClick: () => document.querySelector('[data-ocid="admin.students.tab"]')?.click() },
            { icon: UserX,       title: "Review Applications", desc: `${pendingApps} application${pendingApps !== 1 ? "s" : ""} awaiting review.`, onClick: () => document.querySelector('[data-ocid="admin.applications.tab"]')?.click() },
            { icon: Briefcase,   title: "Manage Jobs",         desc: "View, edit, or remove job postings.",                                        onClick: () => document.querySelector('[data-ocid="admin.jobs.tab"]')?.click() },
          ].map((a, i) => {
            const Icon = a.icon;
            return (
              <motion.button key={a.title} type="button" onClick={a.onClick}
                initial={{ opacity:0, scale:0.97 }} animate={{ opacity:1, scale:1 }}
                transition={{ delay: 0.6 + i * 0.06 }}
                whileHover={{ scale:1.01, y:-1 }} whileTap={{ scale:0.99 }}
                className="text-left rounded-xl border border-border bg-card px-4 py-3.5 flex items-start gap-3.5 hover:border-indigo-200 hover:bg-indigo-50/40 transition-all">
                <div className="h-8 w-8 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0 mt-0.5">
                  <Icon className="h-4 w-4 text-indigo-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{a.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{a.desc}</p>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function ActionCard({ icon: Icon, title, description, onClick, variant = "outline" }) {
  return (
    <button type="button" onClick={onClick}
      className={`text-left rounded-lg border p-4 flex items-start gap-3 transition-colors hover:bg-accent
        ${variant === "default" ? "border-primary bg-primary/5" : "border-border bg-card"}`}>
      <div className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0
        ${variant === "default" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
        <Icon className="h-4 w-4" />
      </div>
      <div>
        <p className="text-sm font-semibold">{title}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
      </div>
    </button>
  );
}

function StudentsTab() {
  const { data: students = [], isLoading } = useAllStudents();
  const updateStudent = useUpdateStudent();
  const deleteStudent = useDeleteStudent();
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(null);

  const openEdit = (s) => {
    setEditing(s);
    setForm({
      first_name: s.user?.first_name ?? "",
      last_name: s.user?.last_name ?? "",
      email: s.user?.email ?? "",
      name: s.name ?? "",
      enrollment_no: s.enrollment_no ?? "",
      cgpa: s.cgpa ? String(s.cgpa) : "",
      year: s.graduationYear ? String(s.graduationYear) : "",
      skills: s.skills ?? "",
    });
  };

  if (isLoading) return <Skeleton className="h-64" />;

  return (
    <PageTransition className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">All Students ({students.length})</h2>
      </div>
      {students.length === 0 ? (
        <Card className="shadow-card"><CardContent className="py-12 text-center"><p className="text-muted-foreground">No students registered yet.</p></CardContent></Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {students.map((s, i) => {
            const name = s.user?.first_name ? `${s.user.first_name} ${s.user.last_name}`.trim() : s.name || s.user?.username;
            const skillList = String(s.skills || "").split(",").map(x => x.trim()).filter(Boolean);
            return (
              <Card key={s.id || i} className="shadow-card">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm shrink-0">
                        {(name || "?")[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-sm">{name}</p>
                        <p className="text-xs text-muted-foreground">{s.email}</p>
                      </div>
                    </div>
                    <div className="flex gap-1.5 shrink-0">
                      <Button size="sm" variant="outline" className="h-7 px-2" onClick={() => openEdit(s)}>
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button size="sm" variant="destructive" className="h-7 px-2"
                        disabled={deleteStudent.isPending}
                        onClick={() => {
                          if (confirm(`Delete student "${name}"? This cannot be undone.`))
                            deleteStudent.mutate(s.id, {
                              onSuccess: () => toast.success("Student deleted."),
                              onError: () => toast.error("Failed to delete."),
                            });
                        }}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="bg-muted rounded-md px-2 py-1.5">
                      <p className="text-muted-foreground">Enrollment</p>
                      <p className="font-medium truncate">{s.enrollment_no || "eƒÆ’e†'€™eƒ'€še‚'¢eƒÆ’e‚'¢eƒ'¢e¢'€š'¬e…'¡eƒ'€še‚'¬eƒÆ’e‚'¢eƒ'¢e¢'‚¬Å¡e‚'¬eƒ'€še‚'"}</p>
                    </div>
                    <div className="bg-muted rounded-md px-2 py-1.5">
                      <p className="text-muted-foreground">CGPA</p>
                      <p className={`font-semibold ${s.gpa >= 8 ? "text-green-600" : s.gpa >= 6 ? "text-amber-600" : "text-red-600"}`}>
                        {s.gpa ? Number(s.gpa).toFixed(2) : "eƒÆ’e†'€™eƒ'€še‚'¢eƒÆ’e‚'¢eƒ'¢e¢'€š'¬e…'¡eƒ'€še‚'¬eƒÆ’e‚'¢eƒ'¢e¢'‚¬Å¡e‚'¬eƒ'€še‚'"}
                      </p>
                    </div>
                    <div className="bg-muted rounded-md px-2 py-1.5">
                      <p className="text-muted-foreground">Grad Year</p>
                      <p className="font-medium">{s.graduationYear || "eƒÆ’e†'€™eƒ'€še‚'¢eƒÆ’e‚'¢eƒ'¢e¢'€š'¬e…'¡eƒ'€še‚'¬eƒÆ’e‚'¢eƒ'¢e¢'‚¬Å¡e‚'¬eƒ'€še‚'"}</p>
                    </div>
                  </div>
                  {skillList.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {skillList.slice(0, 4).map(sk => (
                        <span key={sk} className="text-xs bg-secondary px-2 py-0.5 rounded-full">{sk}</span>
                      ))}
                      {skillList.length > 4 && <span className="text-xs text-muted-foreground">+{skillList.length - 4}</span>}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Edit Student eƒÆ’e†'€™eƒ'€še‚'¢eƒÆ’e‚'¢eƒ'¢e¢'€š'¬e…'¡eƒ'€še‚'¬eƒÆ’e‚'¢eƒ'¢e¢'‚¬Å¡e‚'¬eƒ'€še‚' {editing?.user?.username}</DialogTitle></DialogHeader>
          {form && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>First Name</Label>
                  <Input value={form.first_name} onChange={e => setForm(p => ({ ...p, first_name: e.target.value }))} />
                </div>
                <div className="space-y-1.5">
                  <Label>Last Name</Label>
                  <Input value={form.last_name} onChange={e => setForm(p => ({ ...p, last_name: e.target.value }))} />
                </div>
                <div className="space-y-1.5">
                  <Label>Email</Label>
                  <Input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} />
                </div>
                <div className="space-y-1.5">
                  <Label>Enrollment No.</Label>
                  <Input value={form.enrollment_no} onChange={e => setForm(p => ({ ...p, enrollment_no: e.target.value }))} />
                </div>
                <div className="space-y-1.5">
                  <Label>CGPA</Label>
                  <Input type="number" step="0.01" min="0" max="10" value={form.cgpa}
                    onChange={e => setForm(p => ({ ...p, cgpa: e.target.value }))} />
                </div>
                <div className="space-y-1.5">
                  <Label>Graduation Year</Label>
                  <Input type="number" value={form.year} onChange={e => setForm(p => ({ ...p, year: e.target.value }))} />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Skills <span className="text-muted-foreground text-xs">(comma-separated)</span></Label>
                <Input value={form.skills} onChange={e => setForm(p => ({ ...p, skills: e.target.value }))} />
              </div>
              <div className="flex justify-end gap-2 pt-1">
                <Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
                <Button disabled={updateStudent.isPending}
                  onClick={() => updateStudent.mutate({ id: editing.id, ...form, cgpa: parseFloat(form.cgpa) || null, year: parseInt(form.year) || null }, {
                    onSuccess: () => { toast.success("Student updated."); setEditing(null); },
                    onError: () => toast.error("Failed to update."),
                  })}>
                  {updateStudent.isPending ? <><Loader2 className="h-4 w-4 animate-spin mr-1" />Saving...</> : "Save Changes"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </PageTransition>
  );
}

function RecruitersTab() {
  const { data: recruiters = [], isLoading } = useAllRecruiters();
  const updateRecruiter = useUpdateRecruiter();
  const deleteRecruiter = useDeleteRecruiter();
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(null);

  const openEdit = (r) => {
    setEditing(r);
    setForm({
      first_name: r.user?.first_name ?? "",
      last_name: r.user?.last_name ?? "",
      email: r.user?.email ?? "",
      name: r.name ?? "",
      website: r.website ?? "",
      address: r.address ?? "",
      description: r.description ?? "",
    });
  };

  if (isLoading) return <Skeleton className="h-64" />;

  return (
    <PageTransition className="space-y-3">
      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">All Recruiters ({recruiters.length})</h2>
      {recruiters.length === 0 ? (
        <Card className="shadow-card"><CardContent className="py-12 text-center"><p className="text-muted-foreground">No recruiters registered yet.</p></CardContent></Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {recruiters.map((r, i) => {
            const contact = r.user?.first_name ? `${r.user.first_name} ${r.user.last_name}`.trim() : r.user?.username;
            return (
              <Card key={r.id || i} className="shadow-card">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-sm shrink-0">
                        {(r.name || "?")[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-sm">{r.name}</p>
                        <p className="text-xs text-muted-foreground">{contact}</p>
                      </div>
                    </div>
                    <div className="flex gap-1.5 shrink-0">
                      <Button size="sm" variant="outline" className="h-7 px-2" onClick={() => openEdit(r)}>
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button size="sm" variant="destructive" className="h-7 px-2"
                        disabled={deleteRecruiter.isPending}
                        onClick={() => {
                          if (confirm(`Delete recruiter "${r.name}"? All their jobs will also be deleted.`))
                            deleteRecruiter.mutate(r.id, {
                              onSuccess: () => toast.success("Recruiter deleted."),
                              onError: () => toast.error("Failed to delete."),
                            });
                        }}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-1 text-xs text-muted-foreground">
                    {r.user?.email && <p className="flex items-center gap-1.5">eƒÆ’e†'€™eƒ'€še‚'°eƒÆ’e¢'‚¬'¦eƒ'€še‚'¸eƒÆ’e‚'¢eƒ'¢e¢'‚¬Å¡e‚'¬eƒ'€¦e¢'‚¬Å“eƒÆ’e¢'‚¬Å¡eƒ'€še‚'§ {r.user.email}</p>}
                    {r.website && <a href={r.website} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-primary hover:underline">eƒÆ’e†'€™eƒ'€še‚'°eƒÆ’e¢'‚¬'¦eƒ'€še‚'¸eƒÆ’e¢'‚¬'¦eƒ'¢e¢'€š'¬e¢'€ž'¢eƒÆ’e¢'‚¬Å¡eƒ'€še‚' {r.website}</a>}
                    {r.address && <p className="flex items-center gap-1.5">eƒÆ’e†'€™eƒ'€še‚'°eƒÆ’e¢'‚¬'¦eƒ'€še‚'¸eƒÆ’e‚'¢eƒ'¢e¢'‚¬Å¡e‚'¬eƒ'€¦e¢'‚¬Å“eƒÆ’e¢'‚¬Å¡eƒ'€še‚' {r.address}</p>}
                    {r.description && <p className="line-clamp-2 mt-1 text-muted-foreground/80">{r.description}</p>}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Edit Recruiter eƒÆ’e†'€™eƒ'€še‚'¢eƒÆ’e‚'¢eƒ'¢e¢'€š'¬e…'¡eƒ'€še‚'¬eƒÆ’e‚'¢eƒ'¢e¢'‚¬Å¡e‚'¬eƒ'€še‚' {editing?.name}</DialogTitle></DialogHeader>
          {form && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>First Name</Label>
                  <Input value={form.first_name} onChange={e => setForm(p => ({ ...p, first_name: e.target.value }))} />
                </div>
                <div className="space-y-1.5">
                  <Label>Last Name</Label>
                  <Input value={form.last_name} onChange={e => setForm(p => ({ ...p, last_name: e.target.value }))} />
                </div>
                <div className="space-y-1.5">
                  <Label>Email</Label>
                  <Input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} />
                </div>
                <div className="space-y-1.5">
                  <Label>Company Name</Label>
                  <Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
                </div>
                <div className="space-y-1.5 col-span-2">
                  <Label>Website</Label>
                  <Input value={form.website} onChange={e => setForm(p => ({ ...p, website: e.target.value }))} placeholder="https://..." />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Description</Label>
                <Textarea rows={2} value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
              </div>
              <div className="flex justify-end gap-2 pt-1">
                <Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
                <Button disabled={updateRecruiter.isPending}
                  onClick={() => updateRecruiter.mutate({ id: editing.id, ...form }, {
                    onSuccess: () => { toast.success("Recruiter updated."); setEditing(null); },
                    onError: () => toast.error("Failed to update."),
                  })}>
                  {updateRecruiter.isPending ? <><Loader2 className="h-4 w-4 animate-spin mr-1" />Saving...</> : "Save Changes"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </PageTransition>
  );
}

function JobsTab() {
  const { data: jobs = [], isLoading } = useAllJobs();
  const deleteJob = useDeleteJob();
  const updateJob = useUpdateJob();
  const [editingJob, setEditingJob] = useState(null);
  const [form, setForm] = useState(null);

  const openEdit = (job) => {
    setEditingJob(job);
    setForm({
      title: job.title,
      description: job.description,
      location: job.location,
      stipendOrSalary: job.stipendOrSalary || job.stipend_or_ctc || "",
      requirementsText: job.requirements?.join(", ") || job.skills_required || "",
      jobType: job.jobType,
      deadline: job.last_date_to_apply
        ? new Date(job.last_date_to_apply).toISOString().split("T")[0]
        : "",
      eligibility_cgpa: job.eligibility_cgpa || "",
    });
  };

  const handleSave = () => {
    updateJob.mutate({
      jobId: editingJob.id,
      job: {
        title: form.title,
        description: form.description,
        location: form.location,
        stipendOrSalary: form.stipendOrSalary,
        requirements: form.requirementsText.split(",").map(s => s.trim()).filter(Boolean),
        jobType: form.jobType,
        deadline: form.deadline ? new Date(form.deadline).getTime() : null,
        eligibility_cgpa: form.eligibility_cgpa || null,
      },
    }, {
      onSuccess: () => { toast.success("Job updated."); setEditingJob(null); },
      onError: () => toast.error("Failed to update job."),
    });
  };

  if (isLoading) return <Skeleton className="h-64" />;

  return (
    <PageTransition className="space-y-3">
      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">All Job Postings ({jobs.length})</h2>
      {jobs.length === 0 ? (
        <Card className="shadow-card"><CardContent className="py-12 text-center"><p className="text-muted-foreground">No jobs posted yet.</p></CardContent></Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {jobs.map((job, i) => {
            const expired = job.last_date_to_apply && new Date(job.last_date_to_apply) < new Date();
            return (
              <Card key={job.id || i} className="shadow-card">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-sm">{job.title}</p>
                        <JobTypeBadge type={job.jobType} />
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${expired ? "bg-red-100 text-red-600" : "bg-green-100 text-green-600"}`}>
                          {expired ? "Expired" : "Active"}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{job.company?.name ?? job.company_name}</p>
                    </div>
                    <div className="flex gap-1.5 shrink-0">
                      <Button size="sm" variant="outline" className="h-7 px-2" onClick={() => openEdit(job)}>
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button size="sm" variant="destructive" className="h-7 px-2"
                        disabled={deleteJob.isPending}
                        onClick={() => deleteJob.mutate(job.id, {
                          onSuccess: () => toast.success("Job deleted."),
                          onError: () => toast.error("Failed to delete."),
                        })}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-muted rounded-md px-2 py-1.5">
                      <p className="text-muted-foreground">Location</p>
                      <p className="font-medium truncate">{job.location || "eƒÆ’e†'€™eƒ'€še‚'¢eƒÆ’e‚'¢eƒ'¢e¢'€š'¬e…'¡eƒ'€še‚'¬eƒÆ’e‚'¢eƒ'¢e¢'‚¬Å¡e‚'¬eƒ'€še‚'"}</p>
                    </div>
                    <div className="bg-muted rounded-md px-2 py-1.5">
                      <p className="text-muted-foreground">Deadline</p>
                      <p className={`font-medium ${expired ? "text-red-500" : ""}`}>
                        {job.last_date_to_apply ? new Date(job.last_date_to_apply).toLocaleDateString() : "eƒÆ’e†'€™eƒ'€še‚'¢eƒÆ’e‚'¢eƒ'¢e¢'€š'¬e…'¡eƒ'€še‚'¬eƒÆ’e‚'¢eƒ'¢e¢'‚¬Å¡e‚'¬eƒ'€še‚'"}
                      </p>
                    </div>
                  </div>
                  {job.requirements?.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {job.requirements.slice(0, 4).map(r => (
                        <span key={r} className="text-xs bg-secondary px-2 py-0.5 rounded-full">{r}</span>
                      ))}
                      {job.requirements.length > 4 && <span className="text-xs text-muted-foreground">+{job.requirements.length - 4}</span>}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={!!editingJob} onOpenChange={(o) => !o && setEditingJob(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Edit Job eƒÆ’e†'€™eƒ'€še‚'¢eƒÆ’e‚'¢eƒ'¢e¢'€š'¬e…'¡eƒ'€še‚'¬eƒÆ’e‚'¢eƒ'¢e¢'‚¬Å¡e‚'¬eƒ'€še‚' {editingJob?.title}</DialogTitle></DialogHeader>
          {form && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Title</Label>
                  <Input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} />
                </div>
                <div className="space-y-1.5">
                  <Label>Location</Label>
                  <Input value={form.location} onChange={e => setForm(p => ({ ...p, location: e.target.value }))} />
                </div>
                <div className="space-y-1.5">
                  <Label>Stipend / Salary</Label>
                  <Input value={form.stipendOrSalary} onChange={e => setForm(p => ({ ...p, stipendOrSalary: e.target.value }))} />
                </div>
                <div className="space-y-1.5">
                  <Label>Type</Label>
                  <Select value={form.jobType} onValueChange={v => setForm(p => ({ ...p, jobType: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="job">Full-time Job</SelectItem>
                      <SelectItem value="internship">Internship</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Deadline</Label>
                  <Input type="date" value={form.deadline} onChange={e => setForm(p => ({ ...p, deadline: e.target.value }))} />
                </div>
                <div className="space-y-1.5">
                  <Label>Min CGPA</Label>
                  <Input type="number" step="0.1" min="0" max="10" value={form.eligibility_cgpa}
                    onChange={e => setForm(p => ({ ...p, eligibility_cgpa: e.target.value }))} placeholder="Optional" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Description</Label>
                <Textarea rows={3} value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label>Skills Required <span className="text-muted-foreground text-xs">(comma-separated)</span></Label>
                <Input value={form.requirementsText} onChange={e => setForm(p => ({ ...p, requirementsText: e.target.value }))} />
              </div>
              <div className="flex justify-end gap-2 pt-1">
                <Button variant="outline" onClick={() => setEditingJob(null)}>Cancel</Button>
                <Button onClick={handleSave} disabled={updateJob.isPending}>
                  {updateJob.isPending ? <><Loader2 className="h-4 w-4 animate-spin mr-1" />Saving...</> : "Save Changes"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </PageTransition>
  );
}

function ApplicationsTab() {
  const { data: applications = [], isLoading } = useAllApplications();
  const updateStatus = useUpdateApplicationStatus();
  const [notes, setNotes] = useState({});

  if (isLoading) return <Skeleton className="h-64" />;

  return (
    <PageTransition className="space-y-3">
      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">All Applications ({applications.length})</h2>
      {applications.length === 0 ? (
        <Card className="shadow-card"><CardContent className="py-12 text-center"><p className="text-muted-foreground">No applications yet.</p></CardContent></Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {applications.map((app, i) => {
            const studentName = app.student?.user?.first_name
              ? `${app.student.user.first_name} ${app.student.user.last_name}`.trim()
              : app.student?.user?.username ?? "eƒÆ’e†'€™eƒ'€še‚'¢eƒÆ’e‚'¢eƒ'¢e¢'€š'¬e…'¡eƒ'€še‚'¬eƒÆ’e‚'¢eƒ'¢e¢'‚¬Å¡e‚'¬eƒ'€še‚'";
            return (
              <Card key={app.id || i} className="shadow-card">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold text-sm">{app.job?.title ?? `Job #${app.jobId}`}</p>
                      <p className="text-xs text-muted-foreground">{app.job?.company?.name}</p>
                    </div>
                    <Select value={app.status} onValueChange={(v) =>
                      updateStatus.mutate({ applicationId: app.id, status: v }, {
                        onSuccess: () => toast.success("Status updated."),
                        onError: () => toast.error("Failed to update."),
                      })}>
                      <SelectTrigger className="w-32 h-7 text-xs shrink-0"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="APPLIED">Applied</SelectItem>
                        <SelectItem value="SHORTLISTED">Shortlisted</SelectItem>
                        <SelectItem value="SELECTED">Selected</SelectItem>
                        <SelectItem value="REJECTED">Rejected</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs shrink-0">
                      {studentName[0]?.toUpperCase()}
                    </div>
                    <span className="font-medium text-foreground">{studentName}</span>
                    <span>eƒÆ’e†'€™eƒ'¢e¢'€š'¬e…'¡eƒÆ’e¢'‚¬Å¡eƒ'€še‚'·</span>
                    <span>{new Date(app.applied_at).toLocaleDateString()}</span>
                  </div>
                  <Input
                    className="h-7 text-xs"
                    placeholder="Add note..."
                    value={notes[app.id] ?? app.notes ?? ""}
                    onChange={e => setNotes(n => ({ ...n, [app.id]: e.target.value }))}
                    onBlur={() => {
                      const note = notes[app.id];
                      if (note !== undefined && note !== (app.notes ?? "")) {
                        updateStatus.mutate({ applicationId: app.id, status: app.status, notes: note }, {
                          onSuccess: () => toast.success("Note saved."),
                          onError: () => toast.error("Failed to save note."),
                        });
                      }
                    }}
                  />
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </PageTransition>
  );
}

function RolesTab() {
  const assignRole = useAssignRole();
  const [usernameInput, setUsernameInput] = useState("");
  const [selectedRole, setSelectedRole] = useState("STUDENT");

  const handleAssign = (e) => {
    e.preventDefault();
    assignRole.mutate(
      { username: usernameInput.trim(), role: selectedRole },
      {
        onSuccess: () => {
          toast.success(`Role '${selectedRole}' assigned to ${usernameInput}.`);
          setUsernameInput("");
        },
        onError: (err) => toast.error(err.response?.data?.detail || err.message || "Failed to assign role."),
      }
    );
  };

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
      <Card className="max-w-lg shadow-card">
        <CardHeader><CardTitle>Assign User Role</CardTitle></CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Change a user's role directly. Use with caution.
          </p>
          <form onSubmit={handleAssign} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="username-input">Username</Label>
              <Input id="username-input" value={usernameInput}
                onChange={(e) => setUsernameInput(e.target.value)}
                placeholder="student_username" required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="role-select">Role</Label>
              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger id="role-select"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="STUDENT">Student</SelectItem>
                  <SelectItem value="COMPANY">Recruiter</SelectItem>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" disabled={assignRole.isPending}>
              {assignRole.isPending
                ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Assigning...</>
                : "Assign Role"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}
