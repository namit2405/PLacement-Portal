import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../api";
import { useAuth } from "./useAuth";

// ── Helpers ───────────────────────────────────────────────────────────────────

function mapJob(j) {
  return {
    ...j,
    stipendOrSalary: j.stipend_or_ctc,
    deadline: j.last_date_to_apply ? new Date(j.last_date_to_apply).getTime() * 1_000_000 : 0,
    requirements: j.skills_required ? j.skills_required.split(",").map((s) => s.trim()).filter(Boolean) : [],
    jobType: j.is_internship ? "internship" : "job",
    company_name: j.company?.name ?? "",
  };
}

function mapApplication(a) {
  return {
    ...a,
    appliedAt: new Date(a.applied_at).getTime() * 1_000_000,
    jobId: a.job?.id ?? a.job_id,
  };
}

function mapStudent(s) {
  return {
    ...s,
    gpa: s.cgpa ? Number(s.cgpa) : 0,
    graduationYear: s.year ?? new Date().getFullYear(),
    email: s.user?.email ?? "",
    resumeUrl: s.resume_url ?? "",
  };
}

function mapStats(s) {
  return {
    ...s,
    totalStudents: s.total_students,
    totalJobs: s.total_jobs,
    totalApplications: s.total_applications,
    placements: s.applications_by_status?.SELECTED ?? 0,
  };
}

// ── Role ──────────────────────────────────────────────────────────────────────

export function useMyRole() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["myRole", user?.id],
    queryFn: () => user?.role ?? null,
    enabled: !!user,
    staleTime: 30_000,
  });
}

// ── Jobs ──────────────────────────────────────────────────────────────────────

export function useAllJobs() {
  return useQuery({
    queryKey: ["allJobs"],
    queryFn: async () => {
      const { data } = await api.get("/jobs/?page_size=100");
      const results = data.results ?? data;
      return results.map(mapJob);
    },
  });
}

export function usePostJob() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (job) => {
      // Update company name if provided
      if (job.company) {
        try { await api.patch("/company/me/", { name: job.company }); } catch {}
      }
      const payload = {
        title: job.title,
        description: job.description,
        location: job.location,
        stipend_or_ctc: job.stipendOrSalary,
        skills_required: job.requirements.join(", "),
        is_internship: job.jobType === "internship",
        last_date_to_apply: job.deadline
          ? new Date(job.deadline).toISOString().split("T")[0]
          : null,
        is_active: true,
      };
      const { data } = await api.post("/jobs/", payload);
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["allJobs"] }),
  });
}

export function useUpdateJob() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ jobId, job }) => {
      const payload = {
        title: job.title,
        description: job.description,
        location: job.location,
        stipend_or_ctc: job.stipendOrSalary,
        skills_required: job.requirements?.join(", "),
        is_internship: job.jobType === "internship",
        last_date_to_apply: job.deadline
          ? new Date(Number(job.deadline)).toISOString().split("T")[0]
          : null,
        eligibility_cgpa: job.eligibility_cgpa || null,
      };
      const { data } = await api.patch(`/jobs/${jobId}/`, payload);
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["allJobs"] }),
  });
}

export function useDeleteJob() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (jobId) => {
      await api.delete(`/jobs/${jobId}/`);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["allJobs"] }),
  });
}

// ── Applications ──────────────────────────────────────────────────────────────

export function useMyApplications() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["myApplications"],
    queryFn: async () => {
      const { data } = await api.get("/applications/");
      const results = data.results ?? data;
      return results.map(mapApplication);
    },
    enabled: !!user,
  });
}

export function useAllApplications() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["allApplications"],
    queryFn: async () => {
      const { data } = await api.get("/applications/");
      const results = data.results ?? data;
      return results.map(mapApplication);
    },
    enabled: !!user,
  });
}

export function useApplicationsForJob(jobId) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["applicationsForJob", String(jobId)],
    queryFn: async () => {
      const { data } = await api.get(`/applications/?job=${jobId}`);
      const results = data.results ?? data;
      return results.map(mapApplication);
    },
    enabled: !!user && jobId !== null,
  });
}

export function useApplyToJob() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (jobId) => {
      const { data } = await api.post("/applications/", { job_id: Number(jobId) });
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["myApplications"] }),
  });
}

export function useUpdateApplicationStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ applicationId, status, notes }) => {
      const statusMap = {
        pending: "APPLIED", shortlisted: "SHORTLISTED",
        selected: "SELECTED", rejected: "REJECTED",
        APPLIED: "APPLIED", SHORTLISTED: "SHORTLISTED",
        SELECTED: "SELECTED", REJECTED: "REJECTED",
      };
      const payload = { status: statusMap[status] ?? status };
      if (notes !== undefined) payload.notes = notes;
      const { data } = await api.patch(`/applications/${applicationId}/`, payload);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["allApplications"] });
      qc.invalidateQueries({ queryKey: ["applicationsForJob"] });
    },
  });
}

// ── Student Profile ───────────────────────────────────────────────────────────

export function useCallerProfile() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["callerProfile"],
    queryFn: async () => {
      const { data } = await api.get("/student/profile/me/");
      return mapStudent(data);
    },
    enabled: !!user && user.role === "STUDENT",
  });
}

export function useSaveProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (profile) => {
      const formData = new FormData();
      if (profile.name !== undefined) formData.append("name", profile.name);
      if (profile.gpa !== undefined) formData.append("cgpa", profile.gpa ?? profile.cgpa ?? "");
      if (profile.graduationYear !== undefined) formData.append("year", profile.graduationYear ?? profile.year ?? "");
      if (profile.skills !== undefined) {
        formData.append("skills", Array.isArray(profile.skills) ? profile.skills.join(", ") : profile.skills);
      }
      if (profile.enrollment_no !== undefined) formData.append("enrollment_no", profile.enrollment_no);
      if (profile.phone !== undefined) formData.append("phone", profile.phone || "");
      if (profile.branch !== undefined) formData.append("branch", profile.branch || "");
      if (profile.linkedin !== undefined) formData.append("linkedin", profile.linkedin || "");
      if (profile.github !== undefined) formData.append("github", profile.github || "");
      if (profile.address !== undefined) formData.append("address", profile.address || "");
      // Only append resume if it's an actual File object
      if (profile.resumeFile instanceof File) {
        formData.append("resume", profile.resumeFile);
      }
      const { data } = await api.patch("/student/profile/me/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["callerProfile"] }),
  });
}

// ── Admin ─────────────────────────────────────────────────────────────────────

export function useStats() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["stats"],
    queryFn: async () => {
      const { data } = await api.get("/admin/dashboard/");
      return mapStats(data);
    },
    enabled: !!user && user.role === "ADMIN",
  });
}

export function useAllStudents() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["allStudents"],
    queryFn: async () => {
      const { data } = await api.get("/student/profile/?page_size=200");
      const results = data.results ?? data;
      return results.map(mapStudent);
    },
    enabled: !!user && user.role === "ADMIN",
  });
}

export function useAssignRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ username, role }) => {
      const { data } = await api.post("/admin/assign-role/", { username, role });
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["allStudents"] }),
  });
}

export function useUpdateStudent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...fields }) => {
      const { data } = await api.patch(`/admin/students/${id}/`, fields);
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["allStudents"] }),
  });
}

export function useDeleteStudent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id) => { await api.delete(`/admin/students/${id}/`); },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["allStudents"] }),
  });
}

export function useAllRecruiters() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["allRecruiters"],
    queryFn: async () => {
      const { data } = await api.get("/admin/recruiters/");
      return data;
    },
    enabled: !!user && user.role === "ADMIN",
  });
}

export function useUpdateRecruiter() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...fields }) => {
      const { data } = await api.patch(`/admin/recruiters/${id}/`, fields);
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["allRecruiters"] }),
  });
}

export function useDeleteRecruiter() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id) => { await api.delete(`/admin/recruiters/${id}/`); },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["allRecruiters"] }),
  });
}

export function useSeedData() {
  return useMutation({
    mutationFn: async () => {
      throw new Error("Seed data is not available in the Django backend.");
    },
  });
}

// ── Skill Match ───────────────────────────────────────────────────────────────

/**
 * Returns a 0-100 match score between student skills and job required skills.
 * Also returns matched and missing skill arrays.
 */
export function calcSkillMatch(studentSkills = "", jobSkills = "") {
  const normalize = (s) => s.toLowerCase().trim();
  const studentSet = new Set(
    String(studentSkills).split(",").map(normalize).filter(Boolean)
  );
  const required = String(jobSkills).split(",").map(normalize).filter(Boolean);
  if (!required.length) return { score: 100, matched: [], missing: [] };
  const matched = required.filter((s) => studentSet.has(s));
  const missing = required.filter((s) => !studentSet.has(s));
  return {
    score: Math.round((matched.length / required.length) * 100),
    matched,
    missing,
  };
}

// ── Company Profile ───────────────────────────────────────────────────────────

export function useCompanyProfile() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["companyProfile"],
    queryFn: async () => {
      const { data } = await api.get("/company/me/");
      return data;
    },
    enabled: !!user && user.role === "COMPANY",
  });
}

export function useSaveCompanyProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (fields) => {
      const { data } = await api.patch("/company/me/", fields);
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["companyProfile"] }),
  });
}

// ── Messaging ─────────────────────────────────────────────────────────────────

export function useConversations() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["conversations"],
    queryFn: async () => { const { data } = await api.get("/messages/"); return data; },
    enabled: !!user,
    refetchInterval: 5000,
  });
}

export function useMessages(partnerId) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["messages", String(partnerId)],
    queryFn: async () => { const { data } = await api.get(`/messages/${partnerId}/`); return data; },
    enabled: !!user && !!partnerId,
    refetchInterval: 3000,
  });
}

export function useSendMessage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ partnerId, body, jobId }) => {
      const payload = { body };
      if (jobId) payload.job_id = jobId;
      const { data } = await api.post(`/messages/${partnerId}/`, payload);
      return data;
    },
    onSuccess: (_, { partnerId }) => {
      qc.invalidateQueries({ queryKey: ["messages", String(partnerId)] });
      qc.invalidateQueries({ queryKey: ["conversations"] });
    },
  });
}

export function useUnreadCount() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["unreadCount"],
    queryFn: async () => { const { data } = await api.get("/messages/unread/"); return data.unread; },
    enabled: !!user,
    refetchInterval: 5000,
  });
}
