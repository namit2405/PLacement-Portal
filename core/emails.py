"""
Email notifications for the placement portal.
Triggered on: new application, application status update.
"""
from django.core.mail import send_mail
from django.conf import settings

FROM = "Smart Placement Portal <portalplacement42@gmail.com>"


def _send(subject, body, to_list):
    """Send a plain-text email, silently ignore failures."""
    recipients = [e for e in to_list if e]
    if not recipients:
        return
    try:
        send_mail(subject, body, FROM, recipients, fail_silently=True)
    except Exception:
        pass


def notify_new_application(application):
    """
    Sent when a student applies for a job.
    - Student gets a confirmation.
    - Recruiter gets a notification.
    """
    student = application.student
    job = application.job
    company = job.company

    student_email = student.user.email
    recruiter_email = company.user.email
    student_name = student.user.get_full_name() or student.user.username
    job_title = job.title
    company_name = company.name

    # ── To student ──────────────────────────────────────────────────────────
    _send(
        subject=f"Application Submitted – {job_title} at {company_name}",
        body=(
            f"Hi {student_name},\n\n"
            f"Your application for the position of {job_title} at {company_name} "
            f"has been successfully submitted.\n\n"
            f"We will notify you as soon as the recruiter reviews your application.\n\n"
            f"Best of luck!\n"
            f"Smart Placement Portal"
        ),
        to_list=[student_email],
    )

    # ── To recruiter ─────────────────────────────────────────────────────────
    _send(
        subject=f"New Application – {job_title}",
        body=(
            f"Hi {company.user.get_full_name() or company.user.username},\n\n"
            f"A new application has been received for your job posting: {job_title}.\n\n"
            f"Applicant: {student_name}\n"
            f"Enrollment No: {student.enrollment_no}\n"
            f"CGPA: {student.cgpa or 'N/A'}\n\n"
            f"Log in to the portal to review the application.\n\n"
            f"Smart Placement Portal"
        ),
        to_list=[recruiter_email],
    )


def notify_status_update(application):
    """
    Sent when a recruiter/admin updates the application status.
    - Student gets notified of the new status.
    - Recruiter gets a confirmation of the action.
    """
    student = application.student
    job = application.job
    company = job.company
    status = application.status

    student_name = student.user.get_full_name() or student.user.username
    student_email = student.user.email
    recruiter_email = company.user.email
    job_title = job.title
    company_name = company.name

    status_messages = {
        "APPLIED":     ("Application Under Review", "is currently under review"),
        "SHORTLISTED": ("Congratulations! You've Been Shortlisted", "has been shortlisted"),
        "SELECTED":    ("Congratulations! You've Been Selected!", "has been selected"),
        "REJECTED":    ("Application Update", "was not selected at this time"),
    }

    subject_suffix, status_text = status_messages.get(status, ("Status Update", f"status is now {status}"))

    # ── To student ──────────────────────────────────────────────────────────
    _send(
        subject=f"{subject_suffix} – {job_title} at {company_name}",
        body=(
            f"Hi {student_name},\n\n"
            f"Your application for {job_title} at {company_name} {status_text}.\n\n"
            + (
                "We wish you all the best in the next steps!\n"
                if status == "SELECTED" else
                "Keep applying — the right opportunity is just around the corner!\n"
                if status == "REJECTED" else
                "The recruiter will be in touch with further details.\n"
            ) +
            f"\nStatus: {status}\n\n"
            f"Smart Placement Portal"
        ),
        to_list=[student_email],
    )

    # ── To recruiter ─────────────────────────────────────────────────────────
    _send(
        subject=f"Status Updated – {student_name} for {job_title}",
        body=(
            f"Hi {company.user.get_full_name() or company.user.username},\n\n"
            f"You have updated the application status for {student_name} "
            f"({job_title}) to: {status}.\n\n"
            f"Smart Placement Portal"
        ),
        to_list=[recruiter_email],
    )
