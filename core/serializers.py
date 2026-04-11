import hashlib

from django.contrib.auth import get_user_model
from rest_framework import serializers

from .models import StudentProfile, Company, Job, Application, Message

User = get_user_model()

SECURITY_QUESTIONS = [
    "What was the name of your first pet?",
    "What is your mother's maiden name?",
    "What city were you born in?",
    "What was the name of your primary school?",
    "What is the name of your childhood best friend?",
    "What was the make of your first car?",
    "What is your oldest sibling's middle name?",
    "What street did you grow up on?",
]


def hash_answer(answer: str) -> str:
    """Lowercase + strip, then SHA-256. Simple and dependency-free."""
    return hashlib.sha256(answer.strip().lower().encode()).hexdigest()


def verify_answer(answer: str, stored_hash: str) -> bool:
    return hash_answer(answer) == stored_hash


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "first_name", "last_name", "email", "role"]
        read_only_fields = ["id", "role"]


class SecurityQuestionMixin:
    """Adds security_question + security_answer to any register serializer."""

    def get_security_fields(self):
        return {
            "security_question": serializers.ChoiceField(choices=SECURITY_QUESTIONS, write_only=True),
            "security_answer": serializers.CharField(write_only=True, min_length=2),
        }

    def save_security(self, user, validated_data):
        user.security_question = validated_data.pop("security_question")
        user.security_answer_hash = hash_answer(validated_data.pop("security_answer"))
        user.save()


class RegisterStudentSerializer(SecurityQuestionMixin, serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)
    enrollment_no = serializers.CharField(write_only=True)
    security_question = serializers.ChoiceField(choices=SECURITY_QUESTIONS, write_only=True)
    security_answer = serializers.CharField(write_only=True, min_length=2)

    class Meta:
        model = User
        fields = ["id", "username", "password", "first_name", "last_name", "email",
                  "enrollment_no", "security_question", "security_answer"]

    def create(self, validated_data):
        enrollment_no = validated_data.pop("enrollment_no")
        password = validated_data.pop("password")
        sq = validated_data.pop("security_question")
        sa = validated_data.pop("security_answer")
        user = User.objects.create_user(**validated_data, role=User.Roles.STUDENT)
        user.set_password(password)
        user.security_question = sq
        user.security_answer_hash = hash_answer(sa)
        user.save()
        StudentProfile.objects.create(user=user, enrollment_no=enrollment_no)
        return user


class RegisterCompanySerializer(SecurityQuestionMixin, serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)
    company_name = serializers.CharField(write_only=True, required=False, allow_blank=True)
    security_question = serializers.ChoiceField(choices=SECURITY_QUESTIONS, write_only=True)
    security_answer = serializers.CharField(write_only=True, min_length=2)

    class Meta:
        model = User
        fields = ["id", "username", "password", "first_name", "last_name", "email",
                  "company_name", "security_question", "security_answer"]

    def create(self, validated_data):
        company_name = validated_data.pop("company_name", "")
        password = validated_data.pop("password")
        sq = validated_data.pop("security_question")
        sa = validated_data.pop("security_answer")
        user = User.objects.create_user(**validated_data, role=User.Roles.COMPANY)
        user.set_password(password)
        user.security_question = sq
        user.security_answer_hash = hash_answer(sa)
        user.save()
        Company.objects.create(user=user, name=company_name or user.first_name or user.username)
        return user


class RegisterAdminSerializer(SecurityQuestionMixin, serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)
    admin_secret = serializers.CharField(write_only=True)
    security_question = serializers.ChoiceField(choices=SECURITY_QUESTIONS, write_only=True)
    security_answer = serializers.CharField(write_only=True, min_length=2)

    class Meta:
        model = User
        fields = ["id", "username", "password", "first_name", "last_name", "email",
                  "admin_secret", "security_question", "security_answer"]

    def validate_admin_secret(self, value):
        import os
        expected = os.environ.get("ADMIN_REGISTER_SECRET", "smartplacement_admin_2024")
        if value != expected:
            raise serializers.ValidationError("Invalid admin secret key.")
        return value

    def create(self, validated_data):
        validated_data.pop("admin_secret")
        password = validated_data.pop("password")
        sq = validated_data.pop("security_question")
        sa = validated_data.pop("security_answer")
        user = User.objects.create_user(**validated_data, role=User.Roles.ADMIN)
        user.set_password(password)
        user.security_question = sq
        user.security_answer_hash = hash_answer(sa)
        user.save()
        return user


class GetSecurityQuestionSerializer(serializers.Serializer):
    username = serializers.CharField()


class ResetPasswordSerializer(serializers.Serializer):
    username = serializers.CharField()
    security_answer = serializers.CharField()
    new_password = serializers.CharField(min_length=6)

    def validate(self, data):
        try:
            user = User.objects.get(username=data["username"])
        except User.DoesNotExist:
            raise serializers.ValidationError("Invalid username.")
        if not user.security_answer_hash:
            raise serializers.ValidationError("No security question set for this account.")
        if not verify_answer(data["security_answer"], user.security_answer_hash):
            raise serializers.ValidationError("Incorrect security answer.")
        data["user"] = user
        return data


class StudentProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    resume_url = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = StudentProfile
        fields = [
            "id", "user", "enrollment_no", "name", "year", "cgpa", "skills",
            "resume", "resume_url",
            "phone", "branch", "linkedin", "github", "address",
        ]
        extra_kwargs = {"resume": {"write_only": True, "required": False}}

    def get_resume_url(self, obj):
        if not obj.resume:
            return None
        request = self.context.get("request")
        if request:
            return request.build_absolute_uri(obj.resume.url)
        return obj.resume.url


class CompanySerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = Company
        fields = ["id", "user", "name", "website", "address", "description",
                  "industry", "company_size", "founded_year", "linkedin"]


class JobSerializer(serializers.ModelSerializer):
    company = CompanySerializer(read_only=True)

    class Meta:
        model = Job
        fields = [
            "id", "company", "title", "description", "location",
            "stipend_or_ctc", "eligibility_cgpa", "skills_required",
            "is_internship", "created_at", "last_date_to_apply", "is_active",
        ]
        read_only_fields = ["id", "created_at", "company"]


class ApplicationSerializer(serializers.ModelSerializer):
    student = StudentProfileSerializer(read_only=True)
    job = JobSerializer(read_only=True)
    job_id = serializers.PrimaryKeyRelatedField(
        queryset=Job.objects.filter(is_active=True),
        write_only=True,
        source="job",
    )

    class Meta:
        model = Application
        fields = ["id", "job", "job_id", "student", "applied_at", "status", "notes"]
        read_only_fields = ["id", "applied_at", "student", "status"]


class ApplicationStatusSerializer(serializers.ModelSerializer):
    """Used by company/admin to update application status."""
    class Meta:
        model = Application
        fields = ["id", "status", "notes"]


class AdminAssignRoleSerializer(serializers.Serializer):
    username = serializers.CharField()
    role = serializers.ChoiceField(choices=["STUDENT", "COMPANY", "ADMIN"])


class AdminStudentUpdateSerializer(serializers.ModelSerializer):
    """Admin can edit student profile fields."""
    class Meta:
        model = StudentProfile
        fields = ["name", "enrollment_no", "year", "cgpa", "skills", "phone", "branch", "linkedin", "github", "address"]


class AdminUserUpdateSerializer(serializers.ModelSerializer):
    """Admin can edit basic user fields."""
    class Meta:
        model = User
        fields = ["first_name", "last_name", "email"]


class MessageSerializer(serializers.ModelSerializer):
    sender = UserSerializer(read_only=True)
    recipient_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(), write_only=True, source="recipient"
    )
    recipient = UserSerializer(read_only=True)
    job_id = serializers.PrimaryKeyRelatedField(
        queryset=Job.objects.all(), write_only=True, source="job", required=False, allow_null=True
    )
    job_title = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Message
        fields = ["id", "sender", "recipient", "recipient_id", "job", "job_id", "job_title", "body", "created_at", "is_read"]
        read_only_fields = ["id", "sender", "created_at", "is_read"]

    def get_job_title(self, obj):
        return obj.job.title if obj.job else None
