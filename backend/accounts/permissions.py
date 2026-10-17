from rest_framework import permissions


class IsHospitalUser(permissions.BasePermission):
    """Allows access only to authenticated hospital users."""

    def has_permission(self, request, view):
        return bool(
            request.user and
            request.user.is_authenticated and
            request.user.role == 'hospital'
        )


class IsPatientUser(permissions.BasePermission):
    """Allows access only to authenticated patient users."""

    def has_permission(self, request, view):
        return bool(
            request.user and
            request.user.is_authenticated and
            request.user.role == 'patient'
        )


class IsRecordOwnerOrAuthorizedHospital(permissions.BasePermission):
    """
    Object-level permission to allow patients to manage their own records,
    and hospitals to access authorized records matching their registration/profile.
    """

    def has_object_permission(self, request, view, obj):
        if not request.user or not request.user.is_authenticated:
            return False

        # Patient access: only the owner patient
        if request.user.role == 'patient':
            return obj.patient == request.user

        # Hospital access: matching hospital profile or registration number
        if request.user.role == 'hospital':
            hospital_profile = getattr(request.user, 'hospital_profile', None)
            if not hospital_profile:
                return False

            if obj.hospital_profile == hospital_profile:
                return True

            if obj.registration_number.strip().upper() == hospital_profile.registration_number.strip().upper():
                return True

        return False
