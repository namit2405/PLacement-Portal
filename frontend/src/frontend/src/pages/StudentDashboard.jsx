import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { AlertCircle, Briefcase, Building2, Calendar, CheckCircle2, DollarSign, Globe, Loader2, Mail, MapPin, MessageCircle, Search, Sparkles, XCircle } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { ChatPage } from "../components/ChatPanel";
import { JobTypeBadge } from "../components/JobTypeBadge";
import { StatusBadge } from "../components/StatusBadge";
import { calcSkillMatch, useAllJobs, useApplyToJob, useCallerProfile, useMyApplications, useSaveProfile } from "../hooks/useQueries";

export function StudentDashboard({ activeTab, onTabChange }) {
  return (
    <main className="flex-1 p-3 sm:p-6 overflow-auto">
      <Tabs value={activeTab} onValueChange={onTabChange}>
        <TabsList className="mb-6 w-full sm:w-auto">
          <TabsTrigger value="profile" className="flex-1 sm:flex-none">My Profile</TabsTrigger>
          <TabsTrigger value="browse" className="flex-1 sm:flex-none">Browse Jobs</TabsTrigger>
          <TabsTrigger value="recommended" className="flex-1 sm:flex-none">
            <Sparkles className="h-3.5 w-3.5 mr-1" />For You
          </TabsTrigger>
          <TabsTrigger value="applications" className="flex-1 sm:flex-none">My Applications</TabsTrigger>
          <TabsTrigger value="chat" className="flex-1 sm:flex-none">
            <MessageCircle className="h-3.5 w-3.5 mr-1" />Messages
          </TabsTrigger>
        </TabsList>
        <TabsContent value="profile"><ProfileTab /></TabsContent>
        <TabsContent value="browse"><BrowseJobsTab /></TabsContent>
        <TabsContent value="recommended"><RecommendedTab /></TabsContent>
        <TabsContent value="applications"><ApplicationsTab /></TabsContent>
        <TabsContent value="chat"><ChatPage /></TabsContent>
      </Tabs>
    </main>
  );
}

function RecruiterProfileModal({ company, open, onClose }) {
  if (!company) return null;
  const u = company.user ?? {};
  const initials = (company.name || u.username || "?")[0].toUpperCase();
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm shrink-0">
              {initials}
            </div>
            <div>
              <p className="text-base font-semibold">{company.name}</p>
              <p className="text-xs text-muted-foreground font-normal">Recruiter Profile</p>
            </div>
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3 pt-1">
          {(u.first_name || u.last_name) && (
            <div className="flex items-center gap-2 text-sm">
              <Building2 className="h-4 w-4 text-muted-foreground shrink-0" />
              <span>{`${u.first_name} ${u.last_name}`.trim()}</span>
              <span className="text-xs text-muted-foreground">(@{u.username})</span>
            </div>
          )}
          {u.email && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Mail className="h-4 w-4 shrink-0" />{u.email}
            </div>
          )}
          {(company.website || company.address || company.description) && <Separator />}
          {company.website && (
            <a href={company.website} target="_blank" rel="noreferrer"
              className="flex items-center gap-2 text-sm text-primary hover:underline">
              <Globe className="h-4 w-4 shrink-0" />{company.website}
            </a>
          )}
          {company.address && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4 shrink-0" />{company.address}
            </div>
          )}
          {company.description && (
            <p className="text-sm text-muted-foreground leading-relaxed">{company.description}</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function SkillMatchBadge({ score, matched, missing }) {
  const color = score >= 70 ? "bg-green-100 text-green-700" : score >= 40 ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700";
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full cursor-default ${color}`}>
            {score}% match
          </span>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs space-y-1 text-xs">
          {matched.length > 0 && <p className="text-green-600">✓ {matched.join(", ")}</p>}
          {missing.length > 0 && <p className="text-red-500">✗ Missing: {missing.join(", ")}</p>}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

function JobCard({ job, isApplied, onApply, isPending, studentProfile, onCompanyClick }) {
  const [expanded, setExpanded] = useState(false);
  const isDeadlinePassed = job.last_date_to_apply && new Date(job.last_date_to_apply) < new Date();
  const meetsEligibility = !job.eligibility_cgpa || !studentProfile?.gpa || Number(studentProfile.gpa) >= Number(job.eligibility_cgpa);
  const canApply = !isApplied && !isDeadlinePassed && meetsEligibility;
  const match = studentProfile
    ? calcSkillMatch(studentProfile.skills, job.skills_required ?? job.requirements?.join(", ") ?? "")
    : null;

  return (
    <Card className="shadow-card">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h3 className="font-semibold">{job.title}</h3>
              <JobTypeBadge type={job.jobType} />
              {match && <SkillMatchBadge {...match} />}
            </div>
            <p className="text-sm text-primary font-medium">
              {onCompanyClick ? (
                <button type="button" onClick={() => onCompanyClick(job.company)}
                  className="hover:underline text-left">
                  {job.company?.name}
                </button>
              ) : job.company?.name}
            </p>
            <p className={`text-sm text-muted-foreground mt-1 ${expanded ? "" : "line-clamp-2"}`}>{job.description}</p>
            {job.description?.length > 120 && (
              <button type="button" onClick={() => setExpanded(e => !e)} className="text-xs text-primary mt-0.5 hover:underline">
                {expanded ? "Show less" : "Show more"}
              </button>
            )}
            <div className="flex items-center gap-4 mt-3 flex-wrap">
              {job.location && <span className="flex items-center gap-1 text-xs text-muted-foreground"><MapPin className="h-3 w-3" />{job.location}</span>}
              {job.stipendOrSalary && <span className="flex items-center gap-1 text-xs text-muted-foreground"><DollarSign className="h-3 w-3" />{job.stipendOrSalary}</span>}
              {job.last_date_to_apply && (
                <span className={`flex items-center gap-1 text-xs ${isDeadlinePassed ? "text-red-500 font-medium" : "text-muted-foreground"}`}>
                  <Calendar className="h-3 w-3" />
                  {isDeadlinePassed ? "Deadline passed" : `Deadline: ${new Date(job.last_date_to_apply).toLocaleDateString()}`}
                </span>
              )}
              {job.eligibility_cgpa && (
                <span className={`flex items-center gap-1 text-xs ${meetsEligibility ? "text-green-600" : "text-red-500"}`}>
                  {meetsEligibility ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                  Min CGPA: {job.eligibility_cgpa}
                </span>
              )}
            </div>
            {job.requirements?.length > 0 && (
              <div className="flex gap-1.5 flex-wrap mt-2">
                {job.requirements.slice(0, 4).map((req) => (
                  <Badge key={req} variant="secondary" className="text-xs">{req}</Badge>
                ))}
                {job.requirements.length > 4 && <Badge variant="secondary" className="text-xs">+{job.requirements.length - 4}</Badge>}
              </div>
            )}
            {!meetsEligibility && studentProfile?.gpa && (
              <p className="text-xs text-red-500 mt-2 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                Your CGPA ({Number(studentProfile.gpa).toFixed(2)}) is below the minimum requirement.
              </p>
            )}
          </div>
          <div className="shrink-0">
            {isApplied ? (
              <Badge variant="secondary" className="text-xs">Applied</Badge>
            ) : isDeadlinePassed ? (
              <Badge variant="outline" className="text-xs text-muted-foreground">Closed</Badge>
            ) : (
              <Button size="sm" disabled={!canApply || isPending} onClick={onApply}>
                {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Apply"}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ProfileTab() {
  const { data: profile, isLoading } = useCallerProfile();
  const saveProfile = useSaveProfile();
  const [form, setForm] = useState({
    name: "", email: "", gpa: "", graduationYear: "", skills: "",
    enrollment_no: "", phone: "", branch: "", linkedin: "", github: "", address: "",
  });
  const [resumeFile, setResumeFile] = useState(null);
  const [initialized, setInitialized] = useState(false);

  if (profile && !initialized) {
    setInitialized(true);
    setForm({
      name: profile.name || "",
      email: profile.email || "",
      gpa: profile.gpa ? String(profile.gpa) : "",
      graduationYear: profile.graduationYear ? String(profile.graduationYear) : "",
      skills: Array.isArray(profile.skills) ? profile.skills.join(", ") : (profile.skills || ""),
      enrollment_no: profile.enrollment_no || "",
      phone: profile.phone || "",
      branch: profile.branch || "",
      linkedin: profile.linkedin || "",
      github: profile.github || "",
      address: profile.address || "",
    });
  }

  const set = (key) => (e) => setForm((p) => ({ ...p, [key]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    saveProfile.mutate({
      name: form.name,
      gpa: parseFloat(form.gpa) || 0,
      graduationYear: parseInt(form.graduationYear) || new Date().getFullYear(),
      skills: form.skills,
      resumeFile,
      enrollment_no: form.enrollment_no,
      phone: form.phone,
      branch: form.branch,
      linkedin: form.linkedin,
      github: form.github,
      address: form.address,
    }, {
      onSuccess: () => toast.success("Profile saved!"),
      onError: () => toast.error("Failed to save profile."),
    });
  };

  if (isLoading) return (
    <div className="max-w-2xl space-y-3">
      {[1,2,3,4].map(i => <Skeleton key={i} className="h-10 rounded-xl" />)}
    </div>
  );

  const skills = form.skills ? form.skills.split(",").map(s => s.trim()).filter(Boolean) : [];
  const completeness = [profile?.name, profile?.gpa, profile?.year, profile?.skills, profile?.resumeUrl, profile?.phone, profile?.branch].filter(Boolean).length;
  const pct = Math.round((completeness / 7) * 100);

  return (
    <PageTransition className="space-y-4 max-w-2xl">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Basic info */}
        <div className="rounded-xl border border-border bg-card p-5 space-y-4">
          <p className="text-sm font-semibold text-foreground">Basic Information</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Full Name</Label>
              <Input value={form.name} onChange={set("name")} placeholder="Jane Smith" className="h-10" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Email Address</Label>
              <Input value={form.email} disabled className="h-10 opacity-50" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Enrollment No.</Label>
              <Input value={form.enrollment_no} onChange={set("enrollment_no")} placeholder="2021CS001" className="h-10" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium flex items-center gap-1.5"><Phone className="h-3 w-3" />Phone</Label>
              <Input value={form.phone} onChange={set("phone")} placeholder="+91 98765 43210" className="h-10" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Branch / Department</Label>
              <Input value={form.branch} onChange={set("branch")} placeholder="Computer Science" className="h-10" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Graduation Year</Label>
              <Input type="number" value={form.graduationYear} onChange={set("graduationYear")} placeholder="2025" className="h-10" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">CGPA</Label>
              <Input type="number" step="0.01" min="0" max="10" value={form.gpa} onChange={set("gpa")} placeholder="8.5" className="h-10" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Address</Label>
            <Textarea value={form.address} onChange={set("address")} placeholder="City, State, Country" rows={2} />
          </div>
        </div>

        {/* Online presence */}
        <div className="rounded-xl border border-border bg-card p-5 space-y-4">
          <p className="text-sm font-semibold text-foreground">Online Presence</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium flex items-center gap-1.5"><Linkedin className="h-3 w-3" />LinkedIn</Label>
              <Input value={form.linkedin} onChange={set("linkedin")} placeholder="https://linkedin.com/in/username" className="h-10" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium flex items-center gap-1.5"><Github className="h-3 w-3" />GitHub</Label>
              <Input value={form.github} onChange={set("github")} placeholder="https://github.com/username" className="h-10" />
            </div>
          </div>
        </div>

        {/* Skills */}
        <div className="rounded-xl border border-border bg-card p-5 space-y-3">
          <p className="text-sm font-semibold text-foreground">Skills</p>
          <Textarea value={form.skills} onChange={set("skills")} placeholder="React, Python, Machine Learning" rows={2} />
          {skills.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {skills.map(s => <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>)}
            </div>
          )}
        </div>

        {/* Resume */}
        <div className="rounded-xl border border-border bg-card p-5 space-y-3">
          <p className="text-sm font-semibold text-foreground">Resume</p>
          <Input type="file" accept=".pdf,.doc,.docx" onChange={e => setResumeFile(e.target.files?.[0] || null)} className="h-10" />
          {profile?.resumeUrl && !resumeFile && (
            <p className="text-xs text-muted-foreground">Current: <a href={profile.resumeUrl} target="_blank" rel="noreferrer" className="text-indigo-600 underline">View uploaded resume</a></p>
          )}
          {resumeFile && <p className="text-xs text-muted-foreground">Selected: {resumeFile.name}</p>}
        </div>

        <motion.div whileHover={{ scale:1.01 }} whileTap={{ scale:0.99 }}>
          <Button type="submit" disabled={saveProfile.isPending} className="w-full h-10 bg-indigo-600 hover:bg-indigo-700 border-0">
            {saveProfile.isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</> : "Save Profile"}
          </Button>
        </motion.div>
      </form>

      {/* Completeness */}
      <div className="rounded-xl border border-border bg-card p-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-medium">Profile Completeness</p>
          <span className="text-sm font-semibold text-indigo-600">{pct}%</span>
        </div>
        <div className="h-1.5 rounded-full bg-muted overflow-hidden">
          <motion.div initial={{ width:0 }} animate={{ width: pct + "%" }} transition={{ duration:0.7, ease:"easeOut" }}
            className="h-full rounded-full bg-indigo-600" />
        </div>
        {pct < 100 && <p className="text-xs text-muted-foreground mt-2">Add phone, branch, LinkedIn and GitHub to reach 100%.</p>}
      </div>
    </PageTransition>
  );
}

function BrowseJobsTab() {
  const { data: jobs = [], isLoading } = useAllJobs();
  const { data: myApps = [] } = useMyApplications();
  const { data: profile } = useCallerProfile();
  const applyToJob = useApplyToJob();
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [viewCompany, setViewCompany] = useState(null);

  const appliedJobIds = new Set(myApps.map((a) => String(a.jobId)));
  const filtered = jobs.filter((job) => {
    const matchType = filter === "all" || job.jobType === filter;
    const matchSearch = !search ||
      job.title.toLowerCase().includes(search.toLowerCase()) ||
      (job.company?.name || "").toLowerCase().includes(search.toLowerCase());
    return matchType && matchSearch;
  });

  if (isLoading) return (
    <div className="space-y-4">{[1,2,3].map(i => <Card key={i} className="shadow-card"><CardContent className="p-5 space-y-3"><Skeleton className="h-5 w-48" /><Skeleton className="h-4 w-32" /><Skeleton className="h-12" /></CardContent></Card>)}</div>
  );

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      <RecruiterProfileModal company={viewCompany} open={!!viewCompany} onClose={() => setViewCompany(null)} />
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search jobs or companies..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="job">Jobs Only</SelectItem>
            <SelectItem value="internship">Internships Only</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {filtered.length === 0 ? (
        <Card className="shadow-card"><CardContent className="py-12 text-center"><Briefcase className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" /><p className="text-muted-foreground">No jobs found.</p></CardContent></Card>
      ) : (
        <div className="grid gap-4">
          {filtered.map((job, i) => (
            <JobCard key={job.id || i} job={job} isApplied={appliedJobIds.has(String(job.id))}
              isPending={applyToJob.isPending} studentProfile={profile}
              onCompanyClick={setViewCompany}
              onApply={() => applyToJob.mutate(job.id, {
                onSuccess: () => toast.success(`Applied to ${job.title}!`),
                onError: () => toast.error("Failed to apply."),
              })} />
          ))}
        </div>
      )}
    </motion.div>
  );
}

function RecommendedTab() {
  const { data: jobs = [], isLoading: jobsLoading } = useAllJobs();
  const { data: profile, isLoading: profileLoading } = useCallerProfile();
  const { data: myApps = [] } = useMyApplications();
  const applyToJob = useApplyToJob();
  const [viewCompany, setViewCompany] = useState(null);
  const appliedJobIds = new Set(myApps.map((a) => String(a.jobId)));
  const isLoading = jobsLoading || profileLoading;

  const recommended = !profile?.skills ? [] : jobs
    .filter(j => {
      const notExpired = !j.last_date_to_apply || new Date(j.last_date_to_apply) >= new Date();
      const meetsGpa = !j.eligibility_cgpa || !profile.gpa || Number(profile.gpa) >= Number(j.eligibility_cgpa);
      return notExpired && meetsGpa;
    })
    .map(j => ({ ...j, _match: calcSkillMatch(profile.skills, j.skills_required ?? j.requirements?.join(", ") ?? "") }))
    .sort((a, b) => b._match.score - a._match.score)
    .slice(0, 8);

  if (isLoading) return (
    <div className="space-y-4">{[1,2,3].map(i => <Card key={i} className="shadow-card"><CardContent className="p-5 space-y-3"><Skeleton className="h-5 w-48" /><Skeleton className="h-4 w-32" /><Skeleton className="h-12" /></CardContent></Card>)}</div>
  );

  if (!profile?.skills) return (
    <Card className="shadow-card"><CardContent className="py-12 text-center">
      <Sparkles className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
      <p className="font-medium text-muted-foreground">Add skills to your profile</p>
      <p className="text-sm text-muted-foreground/60 mt-1">We'll recommend the best-matching jobs for you.</p>
    </CardContent></Card>
  );

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      <RecruiterProfileModal company={viewCompany} open={!!viewCompany} onClose={() => setViewCompany(null)} />
      <p className="text-sm text-muted-foreground">Top matches based on your skills and eligibility.</p>
      {recommended.length === 0 ? (
        <Card className="shadow-card"><CardContent className="py-12 text-center"><p className="text-muted-foreground">No matching jobs found right now.</p></CardContent></Card>
      ) : (
        <div className="grid gap-4">
          {recommended.map((job, i) => (
            <JobCard key={job.id || i} job={job} isApplied={appliedJobIds.has(String(job.id))}
              isPending={applyToJob.isPending} studentProfile={profile}
              onCompanyClick={setViewCompany}
              onApply={() => applyToJob.mutate(job.id, {
                onSuccess: () => toast.success(`Applied to ${job.title}!`),
                onError: () => toast.error("Failed to apply."),
              })} />
          ))}
        </div>
      )}
    </motion.div>
  );
}

function ApplicationsTab() {
  const { data: applications = [], isLoading } = useMyApplications();

  if (isLoading) return (
    <div className="space-y-4">{[1,2].map(i => <Card key={i} className="shadow-card"><CardContent className="p-5 space-y-3"><Skeleton className="h-5 w-48" /><Skeleton className="h-4 w-32" /></CardContent></Card>)}</div>
  );

  const counts = applications.reduce((acc, a) => { acc[a.status] = (acc[a.status] || 0) + 1; return acc; }, {});

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      {applications.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Applied", key: "APPLIED", color: "bg-blue-50 text-blue-700" },
            { label: "Shortlisted", key: "SHORTLISTED", color: "bg-amber-50 text-amber-700" },
            { label: "Selected", key: "SELECTED", color: "bg-green-50 text-green-700" },
            { label: "Rejected", key: "REJECTED", color: "bg-red-50 text-red-700" },
          ].map(({ label, key, color }) => (
            <div key={key} className={`rounded-lg px-4 py-3 ${color}`}>
              <p className="text-2xl font-bold">{counts[key] || 0}</p>
              <p className="text-xs font-medium">{label}</p>
            </div>
          ))}
        </div>
      )}
      {applications.length === 0 ? (
        <Card className="shadow-card"><CardContent className="py-12 text-center">
          <Briefcase className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
          <p className="font-medium text-muted-foreground">No applications yet</p>
          <p className="text-sm text-muted-foreground/60 mt-1">Browse jobs and apply to get started</p>
        </CardContent></Card>
      ) : (
        <div className="grid gap-4">
          {applications.map((app, i) => (
            <Card key={app.id || i} className="shadow-card">
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div>
                    <p className="font-semibold">{app.job?.title ?? `Job #${app.jobId}`}</p>
                    <p className="text-sm text-primary">{app.job?.company?.name ?? ""}</p>
                    <p className="text-xs text-muted-foreground mt-1">Applied: {new Date(app.applied_at).toLocaleDateString()}</p>
                    {app.notes && <p className="text-xs text-muted-foreground mt-1 italic">Note: {app.notes}</p>}
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    {app.job && <JobTypeBadge type={app.job.jobType} />}
                    <StatusBadge status={app.status} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </motion.div>
  );
}
