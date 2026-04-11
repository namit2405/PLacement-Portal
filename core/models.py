from django.contrib.auth.models import AbstractUser
from django.db import models
import os

def resume_storage():
    if os.environ.get("CLOUDINARY_CLOUD_NAME"):
        from cloudinary_storage.storage import RawMediaCloudinaryStorage
        return RawMediaCloudinaryStorage()
    from django.core.files.storage import FileSystemStorage
    return FileSystemStorage()


class User(AbstractUser):
    class Roles(models.TextChoices):
        STUDENT = "STUDENT", "Student"
        COMPANY = "COMPANY", "Company"
        ADMIN = "ADMIN", "Admin / Placement Officer"

    role = models.CharField(
        max_length=20,
        choices=Roles.choices,
        default=Roles.STUDENT,
    )
    security_question = models.CharField(max_length=255, blank=True)
    security_answer_hash = models.CharField(max_length=255, blank=True)  # stored as bcrypt hash


class StudentProfile(models.Model):
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name="student_profile",
        limit_choices_to={"role": User.Roles.STUDENT},
    )
    enrollment_no = models.CharField(max_length=50, unique=True)
    name = models.CharField(max_length=100, blank=True)
    year = models.IntegerField(null=True, blank=True)
    cgpa = models.DecimalField(max_digits=4, decimal_places=2, null=True, blank=True)
    skills = models.TextField(blank=True)
    resume = models.FileField(upload_to="resumes/", storage=resume_storage, null=True, blank=True)
    # Extended profile fields
    phone = models.CharField(max_length=20, blank=True)
    branch = models.CharField(max_length=100, blank=True)
    linkedin = models.URLField(blank=True)
    github = models.URLField(blank=True)
    address = models.TextField(blank=True)

    def __str__(self) -> str:
        return f"{self.user.get_full_name()} ({self.enrollment_no})"


class Company(models.Model):
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name="company_profile",
        limit_choices_to={"role": User.Roles.COMPANY},
    )
    name = models.CharField(max_length=255)
    website = models.URLField(blank=True)
    address = models.TextField(blank=True)
    description = models.TextField(blank=True)
    # Extended profile fields
    industry = models.CharField(max_length=100, blank=True)
    company_size = models.CharField(max_length=50, blank=True)
    founded_year = models.IntegerField(null=True, blank=True)
    linkedin = models.URLField(blank=True)

    def __str__(self) -> str:
        return self.name


class Job(models.Model):
    company = models.ForeignKey(
        Company,
        on_delete=models.CASCADE,
        related_name="jobs",
    )
    title = models.CharField(max_length=255)
    description = models.TextField()
    location = models.CharField(max_length=255, blank=True)
    stipend_or_ctc = models.CharField(max_length=100, blank=True)
    eligibility_cgpa = models.DecimalField(
        max_digits=4, decimal_places=2, null=True, blank=True
    )
    skills_required = models.TextField(blank=True)
    is_internship = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    last_date_to_apply = models.DateField(null=True, blank=True)
    is_active = models.BooleanField(default=True)

    def __str__(self) -> str:
        return f"{self.title} - {self.company.name}"


class Application(models.Model):
    class Status(models.TextChoices):
        APPLIED = "APPLIED", "Applied"
        SHORTLISTED = "SHORTLISTED", "Shortlisted"
        REJECTED = "REJECTED", "Rejected"
        SELECTED = "SELECTED", "Selected"

    job = models.ForeignKey(
        Job,
        on_delete=models.CASCADE,
        related_name="applications",
    )
    student = models.ForeignKey(
        StudentProfile,
        on_delete=models.CASCADE,
        related_name="applications",
    )
    applied_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.APPLIED,
    )
    notes = models.TextField(blank=True)

    class Meta:
        unique_together = ("job", "student")

    def __str__(self) -> str:
        return f"{self.student} -> {self.job} ({self.status})"


class Message(models.Model):
    sender = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="sent_messages"
    )
    recipient = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="received_messages"
    )
    # Optional job context — groups messages into a conversation thread
    job = models.ForeignKey(
        Job, on_delete=models.SET_NULL, null=True, blank=True, related_name="messages"
    )
    body = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)

    class Meta:
        ordering = ["created_at"]

    def __str__(self) -> str:
        return f"{self.sender} -> {self.recipient}: {self.body[:40]}"

