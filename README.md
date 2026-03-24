# Smart Placement & Internship Portal - Backend

This is a **Django REST Framework** backend for the *Smart Placement & Internship Portal*.

## Tech Stack
- **Backend**: Django, Django REST Framework
- **Auth**: JWT (via `djangorestframework-simplejwt`) with role-based permissions (Student / Company / Admin)
- **Database**: SQLite (development) / PostgreSQL (production-ready via `psycopg2-binary`)

## Core Features
- User accounts with roles (Student, Company, Admin / Placement Officer)
- Student profile management (resume, skills, academic info)
- Company management and job postings
- Job applications linking students and jobs
- JWT authentication endpoints (login, token refresh)
- Role-based protected APIs for students, companies, and admin

## Setup (summary)
1. Create virtual environment and install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
2. Run migrations:
   ```bash
   python manage.py migrate
   ```
3. Create a superuser (acts as Admin/Placement Officer):
   ```bash
   python manage.py createsuperuser
   ```
4. Start development server:
   ```bash
   python manage.py runserver
   ```

React frontend can consume these REST APIs via standard JSON over HTTP (e.g. with Axios).

