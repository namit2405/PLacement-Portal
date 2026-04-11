"""
Management command: python manage.py seed_demo
Seeds the database with ~50 rows each for students, recruiters, jobs, and applications.
Safe to run multiple times (skips existing usernames).
"""
import random
from datetime import date, timedelta
from django.core.management.base import BaseCommand
from django.contrib.auth.hashers import make_password
from core.models import User, StudentProfile, Company, Job, Application

SKILLS_POOL = [
    "Python", "Django", "React", "JavaScript", "TypeScript", "Node.js",
    "Java", "Spring Boot", "C++", "C", "SQL", "PostgreSQL", "MongoDB",
    "Docker", "Kubernetes", "AWS", "Git", "Linux", "Machine Learning",
    "Deep Learning", "TensorFlow", "PyTorch", "Data Analysis", "Pandas",
    "NumPy", "Flutter", "Dart", "Swift", "Kotlin", "Android", "iOS",
    "HTML", "CSS", "Tailwind", "Vue.js", "Angular", "GraphQL", "REST API",
    "Redis", "Elasticsearch", "Figma", "UI/UX", "Agile", "Scrum",
]

COMPANIES = [
    ("TechCorp India", "https://techcorp.in", "Bangalore, India", "Leading software product company building enterprise SaaS solutions."),
    ("Infosys", "https://infosys.com", "Pune, India", "Global IT services and consulting company."),
    ("Wipro Technologies", "https://wipro.com", "Hyderabad, India", "Multinational IT, consulting and business process services company."),
    ("Razorpay", "https://razorpay.com", "Bangalore, India", "India's leading payments and banking platform for businesses."),
    ("Zepto", "https://zepto.com", "Mumbai, India", "Fast-growing quick commerce startup delivering groceries in 10 minutes."),
    ("CRED", "https://cred.club", "Bangalore, India", "Fintech platform rewarding creditworthy individuals."),
    ("Meesho", "https://meesho.com", "Bangalore, India", "Social commerce platform empowering small businesses."),
    ("PhonePe", "https://phonepe.com", "Bangalore, India", "Digital payments platform with 400M+ users."),
    ("Swiggy", "https://swiggy.com", "Bangalore, India", "Online food ordering and delivery platform."),
    ("Ola Electric", "https://olaelectric.com", "Bangalore, India", "Electric vehicle manufacturer and mobility company."),
]

JOB_TITLES = [
    ("Software Engineer", False, "5-8 LPA"),
    ("Backend Developer", False, "6-10 LPA"),
    ("Frontend Developer", False, "5-9 LPA"),
    ("Full Stack Developer", False, "7-12 LPA"),
    ("Data Scientist", False, "8-14 LPA"),
    ("ML Engineer", False, "9-15 LPA"),
    ("DevOps Engineer", False, "7-12 LPA"),
    ("Android Developer", False, "6-10 LPA"),
    ("iOS Developer", False, "6-10 LPA"),
    ("Product Manager", False, "10-18 LPA"),
    ("SDE Intern", True, "25-40k/month"),
    ("Data Analyst Intern", True, "20-35k/month"),
    ("Frontend Intern", True, "15-25k/month"),
    ("Backend Intern", True, "20-35k/month"),
    ("ML Research Intern", True, "25-40k/month"),
]

FIRST_NAMES = [
    "Aarav", "Vivaan", "Aditya", "Vihaan", "Arjun", "Sai", "Reyansh", "Ayaan",
    "Krishna", "Ishaan", "Ananya", "Diya", "Priya", "Riya", "Sneha", "Pooja",
    "Kavya", "Neha", "Shreya", "Divya", "Rahul", "Rohit", "Amit", "Suresh",
    "Vikram", "Nikhil", "Karan", "Rohan", "Manish", "Deepak",
]

LAST_NAMES = [
    "Sharma", "Verma", "Singh", "Kumar", "Gupta", "Patel", "Shah", "Mehta",
    "Joshi", "Nair", "Reddy", "Rao", "Iyer", "Pillai", "Menon", "Bose",
    "Das", "Chatterjee", "Mukherjee", "Banerjee",
]

SECURITY_Q = "What city were you born in?"
SECURITY_A_HASH = "5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8"  # sha256("password")


class Command(BaseCommand):
    help = "Seed database with demo data (~50 rows each)"

    def handle(self, *args, **options):
        self.stdout.write("Seeding demo data...")
        self._seed_recruiters()
        self._seed_jobs()
        self._seed_students()
        self._seed_applications()
        self.stdout.write(self.style.SUCCESS("Done! Demo data seeded successfully."))

    def _seed_recruiters(self):
        created = 0
        for i, (name, website, address, desc) in enumerate(COMPANIES):
            username = f"recruiter_{i+1}"
            if User.objects.filter(username=username).exists():
                continue
            user = User.objects.create(
                username=username,
                email=f"{username}@demo.com",
                first_name=random.choice(FIRST_NAMES),
                last_name=random.choice(LAST_NAMES),
                role=User.Roles.COMPANY,
                password=make_password("Demo@1234"),
                security_question=SECURITY_Q,
                security_answer_hash=SECURITY_A_HASH,
            )
            Company.objects.create(
                user=user, name=name, website=website,
                address=address, description=desc,
            )
            created += 1
        self.stdout.write(f"  Recruiters: {created} created ({Company.objects.count()} total)")

    def _seed_jobs(self):
        companies = list(Company.objects.all())
        if not companies:
            self.stdout.write("  No companies found, skipping jobs.")
            return
        created = 0
        for i in range(50):
            company = companies[i % len(companies)]
            title, is_intern, salary = random.choice(JOB_TITLES)
            skills = random.sample(SKILLS_POOL, random.randint(3, 6))
            deadline = date.today() + timedelta(days=random.randint(-10, 60))
            Job.objects.create(
                company=company,
                title=title,
                description=f"We are looking for a talented {title} to join our team at {company.name}. "
                            f"You will work on cutting-edge projects and collaborate with a world-class team. "
                            f"Strong problem-solving skills and passion for technology required.",
                location=company.address.split(",")[0] if company.address else "Bangalore",
                stipend_or_ctc=salary,
                skills_required=", ".join(skills),
                is_internship=is_intern,
                last_date_to_apply=deadline,
                eligibility_cgpa=round(random.choice([0, 6.0, 6.5, 7.0, 7.5, 8.0]), 1) or None,
                is_active=True,
            )
            created += 1
        self.stdout.write(f"  Jobs: {created} created ({Job.objects.count()} total)")

    def _seed_students(self):
        created = 0
        for i in range(50):
            username = f"student_{i+1}"
            if User.objects.filter(username=username).exists():
                continue
            first = random.choice(FIRST_NAMES)
            last = random.choice(LAST_NAMES)
            user = User.objects.create(
                username=username,
                email=f"{username}@demo.com",
                first_name=first,
                last_name=last,
                role=User.Roles.STUDENT,
                password=make_password("Demo@1234"),
                security_question=SECURITY_Q,
                security_answer_hash=SECURITY_A_HASH,
            )
            skills = random.sample(SKILLS_POOL, random.randint(2, 7))
            cgpa = round(random.uniform(5.5, 9.8), 2)
            year = random.choice([2025, 2026, 2027])
            StudentProfile.objects.create(
                user=user,
                enrollment_no=f"2021CS{str(i+1).zfill(3)}",
                name=f"{first} {last}",
                cgpa=cgpa,
                year=year,
                skills=", ".join(skills),
            )
            created += 1
        self.stdout.write(f"  Students: {created} created ({StudentProfile.objects.count()} total)")

    def _seed_applications(self):
        students = list(StudentProfile.objects.all())
        jobs = list(Job.objects.all())
        if not students or not jobs:
            self.stdout.write("  No students/jobs found, skipping applications.")
            return
        statuses = ["APPLIED", "APPLIED", "APPLIED", "SHORTLISTED", "SHORTLISTED", "SELECTED", "REJECTED"]
        created = 0
        seen = set(Application.objects.values_list("job_id", "student_id"))
        attempts = 0
        while created < 50 and attempts < 500:
            attempts += 1
            student = random.choice(students)
            job = random.choice(jobs)
            if (job.id, student.id) in seen:
                continue
            seen.add((job.id, student.id))
            Application.objects.create(
                job=job,
                student=student,
                status=random.choice(statuses),
                applied_at=date.today() - timedelta(days=random.randint(0, 30)),
            )
            created += 1
        self.stdout.write(f"  Applications: {created} created ({Application.objects.count()} total)")
