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
import { AlertCircle, Briefcase, Building2, Calendar, CheckCircle2, DollarSign, Globe, Loader2, Mail, MapPin, MessageCircle, Search, Sparkles, User, XCircle } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { ChatPage } from "../components/ChatPanel";
import { JobTypeBadge } from "../components/JobTypeBadge";
import { StatusBadge } from "../components/StatusBadge";
import { calcSkillMatch, useAllJobs, useApplyToJob, useCallerProfile, useMyApplications, useSaveProfile } from "../hooks/useQueries";
import { AnimatedStatCard, HoverCard, PageTransition, SectionHeader, StaggerItem, StaggerList } from "../components/AnimatedUI";

export function StudentDashboard({ activeTab, onTabChange }) {
  return (
    <main className="flex-1 p-3 sm:p-6 overflow-auto">
      <Tabs value={activeTab} onValueChange={onTabChange}>
        <TabsContent value="dashboard"><StudentHomeTab onTabChange={onTabChange} /></TabsContent>
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
              <span>{(u.first_name + " " + u.last_name).trim()}</span>
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
          {!company.website && !company.address && !company.description && (
            <p className="text-xs text-muted-foreground italic">No additional company info available.</p>
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
          <span className={"inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full cursor-default " + color}>
            {score}% match
          </span>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs space-y-1 text-xs">
          {matched.length > 0 && <p className="text-green-600">matched: {matched.join(", ")}</p>}
          {missing.length > 0 && <p className="text-red-500">missing: {missing.join(", ")}</p>}
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
    ? calcSkillMatch(studentProfile.skills, job.skills_required ?? (job.requirements ? job.requirements.join(", ") : ""))
    : null;

  return (
    <Card className="shadow-card">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h3 className="font-semibold">{job.title}</h3>
              <JobTypeBadge type={job.jobType} />
              {match && <SkillMatchBadge score={match.score} matched={match.matched} missing={match.missing} />}
            </div>
            <button
              type="button"
              onClick={() => onCompanyClick && onCompanyClick(job.company)}
              className="text-sm text-primary font-medium hover:underline text-left cursor-pointer"
            >
              {job.company?.name}
            </button>
            <p className={"text-sm text-muted-foreground mt-1 " + (expanded ? "" : "line-clamp-2")}>{job.description}</p>
            {job.description && job.description.length > 120 && (
              <button type="button" onClick={() => setExpanded(function(e) { return !e; })} className="text-xs text-primary mt-0.5 hover:underline">
                {expanded ? "Show less" : "Show more"}
              </button>
            )}
            <div className="flex items-center gap-4 mt-3 flex-wrap">
              {job.location && <span className="flex items-center gap-1 text-xs text-muted-foreground"><MapPin className="h-3 w-3" />{job.location}</span>}
              {job.stipendOrSalary && <span className="flex items-center gap-1 text-xs text-muted-foreground"><DollarSign className="h-3 w-3" />{job.stipendOrSalary}</span>}
              {job.last_date_to_apply && (
                <span className={"flex items-center gap-1 text-xs " + (isDeadlinePassed ? "text-red-500 font-medium" : "text-muted-foreground")}>
                  <Calendar className="h-3 w-3" />
                  {isDeadlinePassed ? "Deadline passed" : "Deadline: " + new Date(job.last_date_to_apply).toLocaleDateString()}
                </span>
              )}
              {job.eligibility_cgpa && (
                <span className={"flex items-center gap-1 text-xs " + (meetsEligibility ? "text-green-600" : "text-red-500")}>
                  {meetsEligibility ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                  Min CGPA: {job.eligibility_cgpa}
                </span>
              )}
            </div>
            {job.requirements && job.requirements.length > 0 && (
              <div className="flex gap-1.5 flex-wrap mt-2">
                {job.requirements.slice(0, 4).map(function(req) {
                  return <Badge key={req} variant="secondary" className="text-xs">{req}</Badge>;
                })}
                {job.requirements.length > 4 && <Badge variant="secondary" className="text-xs">+{job.requirements.length - 4}</Badge>}
              </div>
            )}
            {!meetsEligibility && studentProfile && studentProfile.gpa && (
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
  const [form, setForm] = useState({ name: "", email: "", gpa: "", graduationYear: "", skills: "" });
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
    });
  }

  const handleSubmit = function(e) {
    e.preventDefault();
    saveProfile.mutate({
      name: form.name, gpa: parseFloat(form.gpa) || 0,
      graduationYear: parseInt(form.graduationYear) || new Date().getFullYear(),
      skills: form.skills, resumeFile: resumeFile,
    }, {
      onSuccess: function() { toast.success("Profile saved successfully!"); },
      onError: function() { toast.error("Failed to save profile."); },
    });
  };

  if (isLoading) return (
    <Card className="max-w-2xl shadow-card"><CardContent className="p-6 space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Skeleton className="h-10" /><Skeleton className="h-10" /><Skeleton className="h-10" /><Skeleton className="h-10" />
      </div>
      <Skeleton className="h-20" /><Skeleton className="h-10" />
    </CardContent></Card>
  );

  const skills = form.skills ? form.skills.split(",").map(function(s) { return s.trim(); }).filter(Boolean) : [];
  const completeness = [profile && profile.name, profile && profile.gpa, profile && profile.year, profile && profile.skills, profile && profile.resumeUrl].filter(Boolean).length;
  const pct = Math.round((completeness / 5) * 100);

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 max-w-2xl">
      <Card className="shadow-card">
        <CardHeader><CardTitle>Student Profile</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" value={form.name} onChange={function(e) { setForm(function(p) { return Object.assign({}, p, { name: e.target.value }); }); }} placeholder="Jane Smith" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" type="email" value={form.email} disabled className="opacity-60" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="gpa">CGPA</Label>
                <Input id="gpa" type="number" step="0.01" min="0" max="10" value={form.gpa} onChange={function(e) { setForm(function(p) { return Object.assign({}, p, { gpa: e.target.value }); }); }} placeholder="8.5" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="year">Graduation Year</Label>
                <Input id="year" type="number" value={form.graduationYear} onChange={function(e) { setForm(function(p) { return Object.assign({}, p, { graduationYear: e.target.value }); }); }} placeholder="2025" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="skills">Skills <span className="text-muted-foreground text-xs">(comma-separated)</span></Label>
              <Textarea id="skills" value={form.skills} onChange={function(e) { setForm(function(p) { return Object.assign({}, p, { skills: e.target.value }); }); }} placeholder="React, Python, Machine Learning" />
              {skills.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {skills.map(function(s) { return <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>; })}
                </div>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="resume">Resume (PDF)</Label>
              <Input id="resume" type="file" accept=".pdf,.doc,.docx" onChange={function(e) { setResumeFile(e.target.files && e.target.files[0] ? e.target.files[0] : null); }} />
              {profile && profile.resumeUrl && !resumeFile && (
                <p className="text-xs text-muted-foreground">Current: <a href={profile.resumeUrl} target="_blank" rel="noreferrer" className="text-primary underline">View uploaded resume</a></p>
              )}
              {resumeFile && <p className="text-xs text-muted-foreground">Selected: {resumeFile.name}</p>}
            </div>
            <Button type="submit" disabled={saveProfile.isPending}>
              {saveProfile.isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</> : "Save Profile"}
            </Button>
          </form>
        </CardContent>
      </Card>
      <Card className="shadow-card">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium">Profile Completeness</p>
            <span className="text-sm font-semibold text-primary">{pct}%</span>
          </div>
          <Progress value={pct} className="h-2" />
          {pct < 100 && <p className="text-xs text-muted-foreground mt-2">Complete your profile to improve job match scores.</p>}
        </CardContent>
      </Card>
    </motion.div>
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

  const appliedJobIds = new Set(myApps.map(function(a) { return String(a.jobId); }));
  const filtered = jobs.filter(function(job) {
    const matchType = filter === "all" || job.jobType === filter;
    const matchSearch = !search ||
      job.title.toLowerCase().includes(search.toLowerCase()) ||
      (job.company && job.company.name ? job.company.name.toLowerCase().includes(search.toLowerCase()) : false);
    return matchType && matchSearch;
  });

  if (isLoading) return (
    <div className="space-y-4">{[1,2,3].map(function(i) { return <Card key={i} className="shadow-card"><CardContent className="p-5 space-y-3"><Skeleton className="h-5 w-48" /><Skeleton className="h-4 w-32" /><Skeleton className="h-12" /></CardContent></Card>; })}</div>
  );

  return (
    <PageTransition className="space-y-4">
      <RecruiterProfileModal company={viewCompany} open={!!viewCompany} onClose={function() { setViewCompany(null); }} />
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search jobs or companies..." value={search} onChange={function(e) { setSearch(e.target.value); }} className="pl-9" />
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
          {filtered.map(function(job, i) {
            return <JobCard key={job.id || i} job={job} isApplied={appliedJobIds.has(String(job.id))}
              isPending={applyToJob.isPending} studentProfile={profile}
              onCompanyClick={setViewCompany}
              onApply={function() { applyToJob.mutate(job.id, {
                onSuccess: function() { toast.success("Applied to " + job.title + "!"); },
                onError: function() { toast.error("Failed to apply."); },
              }); }} />;
          })}
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
  const appliedJobIds = new Set(myApps.map(function(a) { return String(a.jobId); }));
  const isLoading = jobsLoading || profileLoading;

  const recommended = !profile || !profile.skills ? [] : jobs
    .filter(function(j) {
      const notExpired = !j.last_date_to_apply || new Date(j.last_date_to_apply) >= new Date();
      const meetsGpa = !j.eligibility_cgpa || !profile.gpa || Number(profile.gpa) >= Number(j.eligibility_cgpa);
      return notExpired && meetsGpa;
    })
    .map(function(j) { return Object.assign({}, j, { _match: calcSkillMatch(profile.skills, j.skills_required || (j.requirements ? j.requirements.join(", ") : "")) }); })
    .sort(function(a, b) { return b._match.score - a._match.score; })
    .slice(0, 8);

  if (isLoading) return (
    <div className="space-y-4">{[1,2,3].map(function(i) { return <Card key={i} className="shadow-card"><CardContent className="p-5 space-y-3"><Skeleton className="h-5 w-48" /><Skeleton className="h-4 w-32" /><Skeleton className="h-12" /></CardContent></Card>; })}</div>
  );

  if (!profile || !profile.skills) return (
    <Card className="shadow-card"><CardContent className="py-12 text-center">
      <Sparkles className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
      <p className="font-medium text-muted-foreground">Add skills to your profile</p>
      <p className="text-sm text-muted-foreground/60 mt-1">We will recommend the best-matching jobs for you.</p>
    </CardContent></Card>
  );

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      <RecruiterProfileModal company={viewCompany} open={!!viewCompany} onClose={function() { setViewCompany(null); }} />
      <p className="text-sm text-muted-foreground">Top matches based on your skills and eligibility.</p>
      {recommended.length === 0 ? (
        <Card className="shadow-card"><CardContent className="py-12 text-center"><p className="text-muted-foreground">No matching jobs found right now.</p></CardContent></Card>
      ) : (
        <div className="grid gap-4">
          {recommended.map(function(job, i) {
            return <JobCard key={job.id || i} job={job} isApplied={appliedJobIds.has(String(job.id))}
              isPending={applyToJob.isPending} studentProfile={profile}
              onCompanyClick={setViewCompany}
              onApply={function() { applyToJob.mutate(job.id, {
                onSuccess: function() { toast.success("Applied to " + job.title + "!"); },
                onError: function() { toast.error("Failed to apply."); },
              }); }} />;
          })}
        </div>
      )}
    </motion.div>
  );
}

function ApplicationsTab() {
  const { data: applications = [], isLoading } = useMyApplications();
  const [viewCompany, setViewCompany] = useState(null);

  if (isLoading) return (
    <div className="space-y-4">{[1,2].map(function(i) { return <Card key={i} className="shadow-card"><CardContent className="p-5 space-y-3"><Skeleton className="h-5 w-48" /><Skeleton className="h-4 w-32" /></CardContent></Card>; })}</div>
  );

  const counts = applications.reduce(function(acc, a) { acc[a.status] = (acc[a.status] || 0) + 1; return acc; }, {});

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      <RecruiterProfileModal company={viewCompany} open={!!viewCompany} onClose={function() { setViewCompany(null); }} />
      {applications.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Applied", key: "APPLIED", color: "bg-blue-50 text-blue-700" },
            { label: "Shortlisted", key: "SHORTLISTED", color: "bg-amber-50 text-amber-700" },
            { label: "Selected", key: "SELECTED", color: "bg-green-50 text-green-700" },
            { label: "Rejected", key: "REJECTED", color: "bg-red-50 text-red-700" },
          ].map(function(item) {
            return (
              <div key={item.key} className={"rounded-lg px-4 py-3 " + item.color}>
                <p className="text-2xl font-bold">{counts[item.key] || 0}</p>
                <p className="text-xs font-medium">{item.label}</p>
              </div>
            );
          })}
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
          {applications.map(function(app, i) {
            return (
              <Card key={app.id || i} className="shadow-card">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div>
                      <p className="font-semibold">{app.job ? app.job.title : ("Job #" + app.jobId)}</p>
                      {app.job && app.job.company ? (
                        <button type="button"
                          onClick={function() { setViewCompany(app.job.company); }}
                          className="text-sm text-primary hover:underline text-left">
                          {app.job.company.name}
                        </button>
                      ) : null}
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
            );
          })}
        </div>
      )}
    </motion.div>
  );
}
function StudentHomeTab({ onTabChange }) {
  const { data: profile, isLoading: profileLoading } = useCallerProfile();
  const { data: jobs = [], isLoading: jobsLoading } = useAllJobs();
  const { data: myApps = [] } = useMyApplications();

  const appliedCount = myApps.length;
  const shortlistedCount = myApps.filter(function(a) { return a.status === "SHORTLISTED"; }).length;
  const selectedCount = myApps.filter(function(a) { return a.status === "SELECTED"; }).length;

  const recommended = !profile || !profile.skills ? [] : jobs
    .filter(function(j) { return !j.last_date_to_apply || new Date(j.last_date_to_apply) >= new Date(); })
    .map(function(j) { return Object.assign({}, j, { _score: calcSkillMatch(profile.skills, j.skills_required || "").score }); })
    .sort(function(a, b) { return b._score - a._score; })
    .slice(0, 3);

  const recentApps = myApps.slice(0, 3);

  const completeness = [profile && profile.name, profile && profile.gpa, profile && profile.year, profile && profile.skills, profile && profile.resumeUrl].filter(Boolean).length;
  const pct = Math.round((completeness / 5) * 100);

  return (
    <PageTransition className="space-y-5">
      {/* Welcome banner */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 p-6 text-white shadow-lg">
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)", backgroundSize: "30px 30px" }} />
        <motion.div animate={{ x: [0, 10, 0], opacity: [0.3, 0.6, 0.3] }} transition={{ duration: 4, repeat: Infinity }}
          className="absolute right-6 top-4 h-24 w-24 rounded-full bg-white/10 blur-xl" />
        <div className="relative flex items-center gap-4">
          <motion.div whileHover={{ scale: 1.1, rotate: 5 }} transition={{ type: "spring", stiffness: 300 }}
            className="h-14 w-14 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center text-white font-extrabold text-xl shrink-0 shadow-lg border border-white/30">
            {(profile && (profile.name || profile.email) ? (profile.name || profile.email)[0] : "?").toUpperCase()}
          </motion.div>
          <div>
            <motion.h1 initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
              className="text-xl font-extrabold leading-tight">
              Welcome back{profile && profile.name ? ", " + profile.name.split(" ")[0] : ""}! 
            </motion.h1>
            <p className="text-white/70 text-sm mt-0.5">Here is your placement overview.</p>
          </div>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Applied",     value: appliedCount,     color: "text-blue-600",   bg: "bg-blue-50",   border: "border-blue-100",   delay: 0.1 },
          { label: "Shortlisted", value: shortlistedCount, color: "text-amber-600",  bg: "bg-amber-50",  border: "border-amber-100",  delay: 0.2 },
          { label: "Selected",    value: selectedCount,    color: "text-green-600",  bg: "bg-green-50",  border: "border-green-100",  delay: 0.3 },
          { label: "Rejected",    value: rejectedCount,    color: "text-red-500",    bg: "bg-red-50",    border: "border-red-100",    delay: 0.4 },
        ].map(function(s) {
          return (
            <AnimatedStatCard key={s.label} label={s.label} value={s.value}
              color={s.color} bg={s.bg} border={s.border} delay={s.delay} />
          );
        })}
      </div>

      {/* Profile completeness */}
      {pct < 100 && (
        <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.5 }}
          className="rounded-2xl border border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 p-4 space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold text-amber-800">Profile {pct}% complete</p>
            <button type="button" onClick={function() { onTabChange("profile"); }}
              className="text-xs text-amber-700 hover:text-amber-900 font-semibold underline transition-colors">
              Complete now 
            </button>
          </div>
          <div className="h-2 rounded-full bg-amber-100 overflow-hidden">
            <motion.div initial={{ width: 0 }} animate={{ width: pct + "%" }} transition={{ delay: 0.7, duration: 0.8, ease: "easeOut" }}
              className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-500" />
          </div>
          <p className="text-xs text-amber-600">A complete profile improves your job match score.</p>
        </motion.div>
      )}

      {/* Top recommended jobs */}
      {recommended.length > 0 && (
        <div className="space-y-2">
          <SectionHeader title=" Top Matches For You" action={function() { onTabChange("recommended"); }} actionLabel="See all" delay={0.4} />
          <StaggerList className="space-y-2">
            {recommended.map(function(job, i) {
              return (
                <StaggerItem key={job.id || i}>
                  <motion.div whileHover={{ x: 4 }} transition={{ duration: 0.2 }}
                    className="rounded-xl border border-border/60 bg-card p-3 flex items-center justify-between gap-3 shadow-sm hover:shadow-md hover:border-primary/30 transition-all cursor-default">
                    <div className="min-w-0">
                      <p className="font-semibold text-sm truncate">{job.title}</p>
                      <p className="text-xs text-muted-foreground">{job.company && job.company.name}  {job.location}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={"text-xs font-bold px-2.5 py-1 rounded-full " + (job._score >= 70 ? "bg-green-100 text-green-700" : job._score >= 40 ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-600")}>
                        {job._score}%
                      </span>
                      <button type="button" onClick={function() { onTabChange("browse"); }}
                        className="text-xs text-primary hover:underline font-medium">View</button>
                    </div>
                  </motion.div>
                </StaggerItem>
              );
            })}
          </StaggerList>
        </div>
      )}

      {/* Recent applications */}
      {recentApps.length > 0 && (
        <div className="space-y-2">
          <SectionHeader title="Recent Applications" action={function() { onTabChange("applications"); }} actionLabel="See all" delay={0.5} />
          <StaggerList className="space-y-2">
            {recentApps.map(function(app, i) {
              const statusColor = { APPLIED: "bg-blue-100 text-blue-700", SHORTLISTED: "bg-amber-100 text-amber-700", SELECTED: "bg-green-100 text-green-700", REJECTED: "bg-red-100 text-red-600" };
              return (
                <StaggerItem key={app.id || i}>
                  <motion.div whileHover={{ x: 4 }} transition={{ duration: 0.2 }}
                    className="rounded-xl border border-border/60 bg-card p-3 flex items-center justify-between gap-3 shadow-sm hover:shadow-md transition-all">
                    <div className="min-w-0">
                      <p className="font-semibold text-sm truncate">{app.job ? app.job.title : ("Job #" + app.jobId)}</p>
                      <p className="text-xs text-muted-foreground">{app.job && app.job.company && app.job.company.name}</p>
                    </div>
                    <span className={"text-xs font-bold px-2.5 py-1 rounded-full shrink-0 " + (statusColor[app.status] || "bg-muted text-muted-foreground")}>
                      {app.status}
                    </span>
                  </motion.div>
                </StaggerItem>
              );
            })}
          </StaggerList>
        </div>
      )}

      {/* Quick actions */}
      <div>
        <SectionHeader title="Quick Actions" delay={0.6} />
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "Browse Jobs",  icon: Briefcase,     tab: "browse",       gradient: "from-blue-500 to-indigo-600" },
            { label: "For You",      icon: Sparkles,      tab: "recommended",  gradient: "from-purple-500 to-violet-600" },
            { label: "My Profile",   icon: User,          tab: "profile",      gradient: "from-emerald-500 to-teal-600" },
            { label: "Messages",     icon: MessageCircle, tab: "chat",         gradient: "from-amber-500 to-orange-600" },
          ].map(function(item, i) {
            var Icon = item.icon;
            return (
              <motion.button key={item.tab} type="button"
                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.65 + i * 0.08 }}
                whileHover={{ scale: 1.03, y: -2 }} whileTap={{ scale: 0.97 }}
                onClick={function() { onTabChange(item.tab); }}
                className={"rounded-2xl p-4 flex items-center gap-3 text-white shadow-md hover:shadow-lg transition-all bg-gradient-to-br " + item.gradient}>
                <Icon className="h-5 w-5 shrink-0" />
                <span className="text-sm font-bold">{item.label}</span>
              </motion.button>
            );
          })}
        </div>
      </div>
    </PageTransition>
  );
}