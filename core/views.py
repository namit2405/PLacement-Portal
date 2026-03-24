from django.contrib.auth import get_user_model
from rest_framework import generics, viewsets, mixins, status
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter

from .models import StudentProfile, Company, Job, Application, Message
from .serializers import (
    RegisterStudentSerializer,
    RegisterCompanySerializer,
    RegisterAdminSerializer,
    GetSecurityQuestionSerializer,
    ResetPasswordSerializer,
    StudentProfileSerializer,
    CompanySerializer,
    JobSerializer,
    ApplicationSerializer,
    ApplicationStatusSerializer,
    AdminAssignRoleSerializer,
    AdminStudentUpdateSerializer,
    AdminUserUpdateSerializer,
    MessageSerializer,
    UserSerializer,
    SECURITY_QUESTIONS,
)
from .permissions import IsStudent, IsCompany, IsAdmin, IsCompanyOrAdmin
from .filters import JobFilter

User = get_user_model()


# ── Auth ──────────────────────────────────────────────────────────────────────

class StudentRegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = [AllowAny]
    serializer_class = RegisterStudentSerializer


class CompanyRegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = [AllowAny]
    serializer_class = RegisterCompanySerializer


class AdminRegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = [AllowAny]
    serializer_class = RegisterAdminSerializer


class LogoutView(APIView):
    """Blacklist the refresh token on logout."""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data["refresh"]
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response({"detail": "Logged out successfully."}, status=status.HTTP_205_RESET_CONTENT)
        except Exception:
            return Response({"detail": "Invalid token."}, status=status.HTTP_400_BAD_REQUEST)


class MeView(APIView):
    """Returns the currently authenticated user's info."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(UserSerializer(request.user).data)


class SecurityQuestionsListView(APIView):
    """Returns the list of available security questions."""
    permission_classes = [AllowAny]

    def get(self, request):
        return Response(SECURITY_QUESTIONS)


class GetSecurityQuestionView(APIView):
    """Given a username, returns their security question (no auth needed)."""
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = GetSecurityQuestionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            user = User.objects.get(username=serializer.validated_data["username"])
        except User.DoesNotExist:
            return Response({"detail": "User not found."}, status=status.HTTP_404_NOT_FOUND)
        if not user.security_question:
            return Response({"detail": "No security question set."}, status=status.HTTP_400_BAD_REQUEST)
        return Response({"security_question": user.security_question})


class ResetPasswordView(APIView):
    """Verify security answer and reset password."""
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = ResetPasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data["user"]
        user.set_password(serializer.validated_data["new_password"])
        user.save()
        return Response({"detail": "Password reset successfully."})



# ── Student Profile ───────────────────────────────────────────────────────────

class StudentProfileViewSet(
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
    mixins.ListModelMixin,
    viewsets.GenericViewSet,
):
    queryset = StudentProfile.objects.select_related("user").all()
    serializer_class = StudentProfileSerializer

    def get_permissions(self):
        if self.action == "me":
            return [IsAuthenticated(), IsStudent()]
        return [IsAuthenticated(), IsAdmin()]

    @action(detail=False, methods=["get", "put", "patch"], url_path="me")
    def me(self, request):
        profile, _ = StudentProfile.objects.get_or_create(
            user=request.user,
            defaults={"enrollment_no": request.user.username},
        )
        if request.method == "GET":
            return Response(StudentProfileSerializer(profile, context={"request": request}).data)
        serializer = StudentProfileSerializer(profile, data=request.data, partial=True, context={"request": request})
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)


# ── Company ───────────────────────────────────────────────────────────────────

class CompanyViewSet(
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
    viewsets.GenericViewSet,
):
    queryset = Company.objects.select_related("user").all()
    serializer_class = CompanySerializer

    def get_permissions(self):
        if self.action == "me":
            return [IsAuthenticated()]
        return [IsAuthenticated(), IsCompanyOrAdmin()]

    @action(detail=False, methods=["get", "put", "patch"], url_path="me")
    def me(self, request):
        company, _ = Company.objects.get_or_create(
            user=request.user,
            defaults={"name": request.user.get_full_name() or request.user.username},
        )
        if request.method == "GET":
            return Response(CompanySerializer(company).data)
        serializer = CompanySerializer(company, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)


# ── Jobs ──────────────────────────────────────────────────────────────────────

class JobViewSet(viewsets.ModelViewSet):
    queryset = Job.objects.select_related("company").all()
    serializer_class = JobSerializer
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_class = JobFilter
    search_fields = ["title", "description", "skills_required", "company__name"]
    ordering_fields = ["created_at", "last_date_to_apply", "eligibility_cgpa"]
    ordering = ["-created_at"]

    def get_permissions(self):
        if self.action in ["list", "retrieve"]:
            return [AllowAny()]
        if self.action in ["create", "update", "partial_update", "destroy"]:
            return [IsAuthenticated(), IsCompanyOrAdmin()]
        return [IsAuthenticated()]

    def perform_create(self, serializer):
        try:
            company = Company.objects.get(user=self.request.user)
        except Company.DoesNotExist:
            company, _ = Company.objects.get_or_create(
                user=self.request.user,
                defaults={"name": self.request.user.get_full_name() or self.request.user.username},
            )
        serializer.save(company=company)

    @action(detail=False, methods=["get"], url_path="my-jobs", permission_classes=[IsAuthenticated, IsCompany])
    def my_jobs(self, request):
        """Returns jobs posted by the authenticated company."""
        try:
            company = Company.objects.get(user=request.user)
        except Company.DoesNotExist:
            return Response([])
        qs = self.get_queryset().filter(company=company)
        serializer = self.get_serializer(qs, many=True)
        return Response(serializer.data)


# ── Applications ──────────────────────────────────────────────────────────────

class ApplicationViewSet(viewsets.ModelViewSet):
    queryset = Application.objects.select_related("job__company", "student__user").all()
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = ["status", "job"]
    ordering_fields = ["applied_at"]
    ordering = ["-applied_at"]

    def get_serializer_class(self):
        if self.action in ["update", "partial_update"] and self.request.user.role in [
            User.Roles.COMPANY, User.Roles.ADMIN
        ]:
            return ApplicationStatusSerializer
        return ApplicationSerializer

    def get_permissions(self):
        if self.action == "create":
            return [IsAuthenticated(), IsStudent()]
        if self.action in ["update", "partial_update"]:
            return [IsAuthenticated(), IsCompanyOrAdmin()]
        if self.action == "destroy":
            return [IsAuthenticated(), IsAdmin()]
        return [IsAuthenticated()]

    def get_queryset(self):
        qs = super().get_queryset()
        user = self.request.user
        if not user.is_authenticated:
            return qs.none()
        if user.role == User.Roles.STUDENT:
            return qs.filter(student__user=user)
        if user.role == User.Roles.COMPANY:
            return qs.filter(job__company__user=user)
        return qs  # Admin sees all

    def perform_create(self, serializer):
        student_profile, _ = StudentProfile.objects.get_or_create(
            user=self.request.user,
            defaults={"enrollment_no": self.request.user.username},
        )
        serializer.save(student=student_profile)


# ── Admin Dashboard ───────────────────────────────────────────────────────────

class AdminDashboardView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request):
        data = {
            "total_students": User.objects.filter(role=User.Roles.STUDENT).count(),
            "total_companies": User.objects.filter(role=User.Roles.COMPANY).count(),
            "total_jobs": Job.objects.count(),
            "active_jobs": Job.objects.filter(is_active=True).count(),
            "total_internships": Job.objects.filter(is_internship=True).count(),
            "total_applications": Application.objects.count(),
            "applications_by_status": {
                s: Application.objects.filter(status=s).count()
                for s, _ in Application.Status.choices
            },
        }
        return Response(data)


class AdminAssignRoleView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def post(self, request):
        serializer = AdminAssignRoleSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        username = serializer.validated_data["username"]
        role = serializer.validated_data["role"]
        try:
            user = User.objects.get(username=username)
        except User.DoesNotExist:
            return Response({"detail": "User not found."}, status=status.HTTP_404_NOT_FOUND)
        user.role = role
        user.save()
        return Response({"detail": f"Role '{role}' assigned to '{username}'."})


class AdminStudentDetailView(APIView):
    """Admin: update or delete a student profile + user."""
    permission_classes = [IsAuthenticated, IsAdmin]

    def get_profile(self, pk):
        try:
            return StudentProfile.objects.select_related("user").get(pk=pk)
        except StudentProfile.DoesNotExist:
            return None

    def patch(self, request, pk):
        profile = self.get_profile(pk)
        if not profile:
            return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)
        # Update profile fields
        profile_ser = AdminStudentUpdateSerializer(profile, data=request.data, partial=True)
        profile_ser.is_valid(raise_exception=True)
        profile_ser.save()
        # Update user fields if provided
        user_ser = AdminUserUpdateSerializer(profile.user, data=request.data, partial=True)
        user_ser.is_valid(raise_exception=True)
        user_ser.save()
        return Response(StudentProfileSerializer(profile, context={"request": request}).data)

    def delete(self, request, pk):
        profile = self.get_profile(pk)
        if not profile:
            return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)
        user = profile.user
        profile.delete()
        user.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class AdminRecruitersView(APIView):
    """Admin: list all recruiters (Company users)."""
    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request):
        companies = Company.objects.select_related("user").all()
        return Response(CompanySerializer(companies, many=True).data)


class AdminRecruiterDetailView(APIView):
    """Admin: update or delete a recruiter (Company + User)."""
    permission_classes = [IsAuthenticated, IsAdmin]

    def get_company(self, pk):
        try:
            return Company.objects.select_related("user").get(pk=pk)
        except Company.DoesNotExist:
            return None

    def patch(self, request, pk):
        company = self.get_company(pk)
        if not company:
            return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)
        # Update company fields
        comp_ser = CompanySerializer(company, data=request.data, partial=True)
        comp_ser.is_valid(raise_exception=True)
        comp_ser.save()
        # Update user fields if provided
        user_ser = AdminUserUpdateSerializer(company.user, data=request.data, partial=True)
        user_ser.is_valid(raise_exception=True)
        user_ser.save()
        return Response(CompanySerializer(company).data)

    def delete(self, request, pk):
        company = self.get_company(pk)
        if not company:
            return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)
        user = company.user
        company.delete()
        user.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


# ── Messaging ─────────────────────────────────────────────────────────────────

class ConversationsView(APIView):
    """Returns a list of unique conversation partners with last message + unread count."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        from django.db.models import Q, Max
        user = request.user
        # All messages involving this user
        msgs = Message.objects.filter(Q(sender=user) | Q(recipient=user))
        # Find unique other-party user IDs
        partner_ids = set()
        for m in msgs:
            other = m.recipient_id if m.sender_id == user.id else m.sender_id
            partner_ids.add(other)

        conversations = []
        for pid in partner_ids:
            thread = msgs.filter(
                Q(sender_id=pid) | Q(recipient_id=pid)
            ).order_by("-created_at")
            last = thread.first()
            unread = thread.filter(recipient=user, is_read=False).count()
            partner = User.objects.get(pk=pid)
            conversations.append({
                "partner": UserSerializer(partner).data,
                "last_message": MessageSerializer(last).data if last else None,
                "unread_count": unread,
            })

        conversations.sort(key=lambda c: c["last_message"]["created_at"] if c["last_message"] else "", reverse=True)
        return Response(conversations)


class MessagesView(APIView):
    """GET messages with a specific user. POST to send a message."""
    permission_classes = [IsAuthenticated]

    def get(self, request, partner_id):
        from django.db.models import Q
        user = request.user
        try:
            partner = User.objects.get(pk=partner_id)
        except User.DoesNotExist:
            return Response({"detail": "User not found."}, status=status.HTTP_404_NOT_FOUND)

        messages = Message.objects.filter(
            Q(sender=user, recipient=partner) | Q(sender=partner, recipient=user)
        ).order_by("created_at")

        # Mark incoming as read
        messages.filter(recipient=user, is_read=False).update(is_read=True)

        job_id = request.query_params.get("job")
        if job_id:
            messages = messages.filter(job_id=job_id)

        return Response(MessageSerializer(messages, many=True).data)

    def post(self, request, partner_id):
        try:
            User.objects.get(pk=partner_id)
        except User.DoesNotExist:
            return Response({"detail": "User not found."}, status=status.HTTP_404_NOT_FOUND)

        data = {**request.data, "recipient_id": partner_id}
        serializer = MessageSerializer(data=data)
        serializer.is_valid(raise_exception=True)
        serializer.save(sender=request.user)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class UnreadCountView(APIView):
    """Returns total unread message count for the current user."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        count = Message.objects.filter(recipient=request.user, is_read=False).count()
        return Response({"unread": count})
