# Smart Placement & Internship Portal

## Current State
New project with no existing application files.

## Requested Changes (Diff)

### Add
- Role-based authentication: Student, Recruiter (Company), Admin (Placement Officer)
- Student features: create profile, view jobs/internships, apply to positions, track application status
- Recruiter features: post job/internship openings, view applicants, shortlist candidates
- Admin features: manage users, view all applications, monitor placement activity, dashboard with stats
- Job/Internship listings with filters (role, location, stipend, skills)
- Application management system
- Student profiles with skills, GPA, resume link
- Dashboard for each role with relevant stats and actions

### Modify
- N/A (new project)

### Remove
- N/A (new project)

## Implementation Plan
1. Backend: Authorization component for role-based access; Motoko actor with types for User, StudentProfile, Job, Application; CRUD operations for jobs and applications
2. Frontend: Login/Register page with role selection; Student dashboard (browse jobs, apply, track); Recruiter dashboard (post jobs, view applicants); Admin dashboard (stats, user list, all applications)
3. Navigation with role-aware routing
4. Sample data seeded for demo
