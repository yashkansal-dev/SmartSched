from django.contrib.auth import get_user_model
from django.test import TestCase, override_settings
from rest_framework.test import APIClient

User = get_user_model()


@override_settings(TESTING=True)
class AuthAndRbacTests(TestCase):
    def setUp(self):
        self.client = APIClient()

        self.coordinator = User.objects.create_user(
            username='coordinator_demo',
            email='coordinator@smartsched.edu',
            password='demo123',
            first_name='Sarah',
            last_name='Johnson',
            role='tt_coordinator',
            department='Computer Science',
            phone='+1-555-0101',
        )

        self.student = User.objects.create_user(
            username='student_demo',
            email='student@smartsched.edu',
            password='demo123',
            first_name='John',
            last_name='Smith',
            role='student',
            department='Computer Science',
            phone='+1-555-0103',
        )

    def _login(self, email: str, password: str = 'demo123'):
        return self.client.post(
            '/api/auth/login/',
            {'email': email, 'password': password},
            format='json',
        )

    def test_login_returns_tokens_and_user_profile(self):
        response = self._login('coordinator@smartsched.edu')

        self.assertEqual(response.status_code, 200)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)
        self.assertEqual(response.data['user']['role'], 'tt_coordinator')
        self.assertEqual(response.data['user']['email'], 'coordinator@smartsched.edu')

    def test_me_endpoint_returns_current_user(self):
        login_response = self._login('student@smartsched.edu')
        token = login_response.data['access']

        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        response = self.client.get('/api/auth/users/me/')

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['email'], 'student@smartsched.edu')
        self.assertEqual(response.data['role'], 'student')

    def test_connection_status_requires_management_role(self):
        login_response = self._login('student@smartsched.edu')
        token = login_response.data['access']

        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        response = self.client.get('/api/auth/connection-status/')

        self.assertEqual(response.status_code, 403)

    def test_connection_status_allows_management_role(self):
        login_response = self._login('coordinator@smartsched.edu')
        token = login_response.data['access']

        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        response = self.client.get('/api/auth/connection-status/')

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['database'], 'connected')
        self.assertGreaterEqual(response.data['auth_users_total'], 2)

    def test_user_list_requires_management_role(self):
        login_response = self._login('student@smartsched.edu')
        token = login_response.data['access']

        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        response = self.client.get('/api/auth/users/')

        self.assertEqual(response.status_code, 403)

    def test_user_list_allows_management_role(self):
        login_response = self._login('coordinator@smartsched.edu')
        token = login_response.data['access']

        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        response = self.client.get('/api/auth/users/')

        self.assertEqual(response.status_code, 200)
        self.assertGreaterEqual(len(response.data.get('results', response.data)), 2)
