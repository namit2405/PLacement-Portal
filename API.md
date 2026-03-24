# Smart Placement Portal – API Reference

Base URL: `http://localhost:8000/api/`

All protected routes require: `Authorization: Bearer <access_token>`

---

## Auth

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `auth/register/student/` | No | Register student |
| POST | `auth/register/company/` | No | Register company |
| POST | `auth/token/` | No | Login → returns access + refresh tokens |
| POST | `auth/token/refresh/` | No | Refresh access token |
| POST | `auth/logout/` | Yes | Blacklist refresh token |
| GET  | `auth/me/` | Yes | Get current user info |

### Register Student
```json
{ "username": "", "password": "", "first_name": "", "last_name": "", "email": "", "enrollment_no": "" }
```

### Register Company
```json
{ "username": "", "password": "", "first_name": "", "last_name": "", "email": "", "company_name": "" }
```

### Login
```json
{ "username": "", "password": "" }
```
Response: `{ "access": "...", "refresh": "..." }`

---

## Student Profile

| Method | Endpoint | Auth | Role |
|--------|----------|------|------|
| GET | `student/profile/me/` | Yes | Student |
| PUT/PATCH | `student/profile/me/` | Yes | Student |

Fields: `enrollment_no`, `name`, `year`, `cgpa`, `skills`, `resume` (file upload)

---

## Company Profile

| Method | Endpoint | Auth | Role |
|--------|----------|------|------|
| GET | `company/me/` | Yes | Company |
| PUT/PATCH | `company/me/` | Yes | Company |

Fields: `name`, `website`, `address`, `description`

---

## Jobs

| Method | Endpoint | Auth | Role |
|--------|----------|------|------|
| GET | `jobs/` | No | Anyone |
| GET | `jobs/{id}/` | No | Anyone |
| POST | `jobs/` | Yes | Company/Admin |
| PUT/PATCH | `jobs/{id}/` | Yes | Company/Admin |
| DELETE | `jobs/{id}/` | Yes | Company/Admin |
| GET | `jobs/my-jobs/` | Yes | Company |

### Query Filters for GET /jobs/
- `?is_internship=true/false`
- `?is_active=true/false`
- `?location=pune`
- `?min_cgpa=7.5` (returns jobs where eligibility_cgpa <= 7.5)
- `?search=python` (searches title, description, skills, company name)
- `?ordering=-created_at`

---

## Applications

| Method | Endpoint | Auth | Role |
|--------|----------|------|------|
| GET | `applications/` | Yes | Student (own) / Company (their jobs) / Admin (all) |
| POST | `applications/` | Yes | Student |
| PATCH | `applications/{id}/` | Yes | Company/Admin |

### Apply to Job
```json
{ "job_id": 1 }
```

### Update Application Status (Company/Admin)
```json
{ "status": "SHORTLISTED", "notes": "Good profile" }
```
Status values: `APPLIED`, `SHORTLISTED`, `REJECTED`, `SELECTED`

---

## Admin Dashboard

| Method | Endpoint | Auth | Role |
|--------|----------|------|------|
| GET | `admin/dashboard/` | Yes | Admin |

Response:
```json
{
  "total_students": 0,
  "total_companies": 0,
  "total_jobs": 0,
  "active_jobs": 0,
  "total_internships": 0,
  "total_applications": 0,
  "applications_by_status": { "APPLIED": 0, "SHORTLISTED": 0, "REJECTED": 0, "SELECTED": 0 }
}
```

---

## Media Files
Resume uploads are served at: `http://localhost:8000/media/resume/<filename>`
