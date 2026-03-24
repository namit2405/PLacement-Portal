from django.contrib import admin
from django.contrib.auth import get_user_model

from .models import StudentProfile, Company, Job, Application

User = get_user_model()


@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ("username", "email", "role", "is_staff", "is_active")
    list_filter = ("role", "is_staff", "is_active")
    search_fields = ("username", "email", "first_name", "last_name")


@admin.register(StudentProfile)
class StudentProfileAdmin(admin.ModelAdmin):
    list_display = ("user", "enrollment_no", "name", "year", "cgpa")
    search_fields = ("enrollment_no", "user__username", "user__first_name", "user__last_name")


@admin.register(Company)
class CompanyAdmin(admin.ModelAdmin):
    list_display = ("name", "user", "website")
    search_fields = ("name", "user__username")


@admin.register(Job)
class JobAdmin(admin.ModelAdmin):
    list_display = ("title", "company", "is_internship", "is_active", "created_at")
    list_filter = ("is_internship", "is_active")
    search_fields = ("title", "company__name")


@admin.register(Application)
class ApplicationAdmin(admin.ModelAdmin):
    list_display = ("job", "student", "status", "applied_at")
    list_filter = ("status",)
    search_fields = ("job__title", "student__enrollment_no", "student__user__username")

