from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from .views import (
    StudentRegisterView, CompanyRegisterView, AdminRegisterView,
    LogoutView, MeView, SecurityQuestionsListView, GetSecurityQuestionView, ResetPasswordView,
    StudentProfileViewSet, CompanyViewSet, JobViewSet, ApplicationViewSet,
    AdminDashboardView, AdminAssignRoleView,
    AdminStudentDetailView, AdminRecruitersView, AdminRecruiterDetailView,
    ConversationsView, MessagesView, UnreadCountView,
    AdminUsersListView, AdminUserDetailView,
)

router = DefaultRouter()
router.register("student/profile", StudentProfileViewSet, basename="student-profile")
router.register("company", CompanyViewSet, basename="company")
router.register("jobs", JobViewSet, basename="jobs")
router.register("applications", ApplicationViewSet, basename="applications")

urlpatterns = [
    # Auth
    path("auth/register/student/", StudentRegisterView.as_view(), name="register-student"),
    path("auth/register/company/", CompanyRegisterView.as_view(), name="register-company"),
    path("auth/register/admin/", AdminRegisterView.as_view(), name="register-admin"),
    path("auth/token/", TokenObtainPairView.as_view(), name="token-obtain"),
    path("auth/token/refresh/", TokenRefreshView.as_view(), name="token-refresh"),
    path("auth/logout/", LogoutView.as_view(), name="logout"),
    path("auth/me/", MeView.as_view(), name="me"),
    path("auth/security-questions/", SecurityQuestionsListView.as_view(), name="security-questions"),
    path("auth/get-security-question/", GetSecurityQuestionView.as_view(), name="get-security-question"),
    path("auth/reset-password/", ResetPasswordView.as_view(), name="reset-password"),
    # Admin
    path("admin/dashboard/", AdminDashboardView.as_view(), name="admin-dashboard"),
    path("admin/assign-role/", AdminAssignRoleView.as_view(), name="admin-assign-role"),
    path("admin/students/<int:pk>/", AdminStudentDetailView.as_view(), name="admin-student-detail"),
    path("admin/recruiters/", AdminRecruitersView.as_view(), name="admin-recruiters"),
    path("admin/recruiters/<int:pk>/", AdminRecruiterDetailView.as_view(), name="admin-recruiter-detail"),
    # Messaging
    path("messages/", ConversationsView.as_view(), name="conversations"),
    path("messages/<int:partner_id>/", MessagesView.as_view(), name="messages"),
    path("messages/unread/", UnreadCountView.as_view(), name="unread-count"),
    # User management
    path("admin/users/", AdminUsersListView.as_view(), name="admin-users"),
    path("admin/users/<int:pk>/", AdminUserDetailView.as_view(), name="admin-user-detail"),
    # Resources
    path("", include(router.urls)),
]
