from rest_framework.permissions import BasePermission


MANAGEMENT_ROLES = ('tt_coordinator', 'hod', 'principal')
ALL_ROLES = ('tt_coordinator', 'faculty', 'student', 'exam_incharge', 'hod', 'principal')


def user_has_role(user, allowed_roles):
    return bool(
        user
        and user.is_authenticated
        and getattr(user, 'role', None) in allowed_roles
    )


class RoleBasedAccessPermission(BasePermission):
    """
    Reusable role-based permission class.

    Works with either:
    - `allowed_roles` on the view/viewset (applies to all actions)
    - `allowed_roles_by_action` on a viewset (action-specific overrides)
    """

    message = 'You do not have permission to perform this action.'

    def has_permission(self, request, view):
        allowed_roles = getattr(view, 'allowed_roles', None)

        action_roles_map = getattr(view, 'allowed_roles_by_action', {})
        action_name = getattr(view, 'action', None)
        if action_name in action_roles_map:
            allowed_roles = action_roles_map[action_name]

        # If no role rules are configured, allow (auth is enforced elsewhere).
        if not allowed_roles:
            return True

        return user_has_role(request.user, allowed_roles)
