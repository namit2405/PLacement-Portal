import django_filters
from .models import Job


class JobFilter(django_filters.FilterSet):
    is_internship = django_filters.BooleanFilter()
    is_active = django_filters.BooleanFilter()
    min_cgpa = django_filters.NumberFilter(field_name="eligibility_cgpa", lookup_expr="lte")
    location = django_filters.CharFilter(field_name="location", lookup_expr="icontains")
    company = django_filters.NumberFilter(field_name="company__id")

    class Meta:
        model = Job
        fields = ["is_internship", "is_active", "location", "company"]
