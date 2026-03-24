// Types aligned with Django REST backend

export interface User {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  role: "STUDENT" | "COMPANY" | "ADMIN";
}

export interface StudentProfile {
  id: number;
  user: User;
  enrollment_no: string;
  name: string;
  year: number | null;
  cgpa: number | null;
  skills: string;
  resume: string | null;
  // Mapped fields used by UI
  gpa: number;
  graduationYear: number;
  email: string;
  resumeUrl: string;
}

export interface Company {
  id: number;
  user: User;
  name: string;
  website: string;
  address: string;
  description: string;
}

export interface JobPosting {
  id: number;
  company: Company;
  title: string;
  description: string;
  location: string;
  stipend_or_ctc: string;
  eligibility_cgpa: number | null;
  skills_required: string;
  is_internship: boolean;
  created_at: string;
  last_date_to_apply: string | null;
  is_active: boolean;
  // Mapped fields used by UI
  stipendOrSalary: string;
  deadline: number;
  requirements: string[];
  jobType: "job" | "internship";
  company_name: string;
}

export interface JobApplication {
  id: number;
  job: JobPosting;
  student: StudentProfile;
  applied_at: string;
  status: "APPLIED" | "SHORTLISTED" | "REJECTED" | "SELECTED";
  notes: string;
  // Mapped fields used by UI
  appliedAt: number;
  jobId: number;
}

export interface Stats {
  total_students: number;
  total_companies: number;
  total_jobs: number;
  active_jobs: number;
  total_internships: number;
  total_applications: number;
  applications_by_status: Record<string, number>;
  // Mapped fields used by UI
  totalStudents: number;
  totalJobs: number;
  totalApplications: number;
  placements: number;
}

export enum AppRole {
  admin = "ADMIN",
  student = "STUDENT",
  recruiter = "COMPANY",
}

export enum ApplicationStatus {
  pending = "APPLIED",
  rejected = "REJECTED",
  selected = "SELECTED",
  shortlisted = "SHORTLISTED",
}

export enum Variant_job_internship {
  job = "job",
  internship = "internship",
}
