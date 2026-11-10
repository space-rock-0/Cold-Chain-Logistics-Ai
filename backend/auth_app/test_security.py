from django.test import TestCase
from django.contrib.auth import get_user_model

class ApiSecurityTests(TestCase):
    def setUp(self):
        self.viewer = get_user_model().objects.create_user(username='security-viewer', email='security@example.com', password='test-password', role='VIEWER')

    def test_anonymous_shipments_are_denied(self):
        self.assertEqual(self.client.get('/api/shipments/').status_code, 401)

    def test_forged_token_is_denied(self):
        self.assertEqual(self.client.get('/api/shipments/', HTTP_AUTHORIZATION='Bearer fake').status_code, 401)

    def test_viewer_can_read_but_cannot_write(self):
        from rest_framework_simplejwt.tokens import RefreshToken
        headers = {'HTTP_AUTHORIZATION': f'Bearer {RefreshToken.for_user(self.viewer).access_token}'}
        self.assertEqual(self.client.get('/api/shipments/', **headers).status_code, 200)
        self.assertEqual(self.client.post('/api/shipments/create/', data={'origin': 'test'}, content_type='application/json', **headers).status_code, 403)

    def test_invalid_password_denied(self):
        self.assertEqual(self.client.post('/api/auth/login/', data={'username': 'security-viewer', 'password': 'wrong'}, content_type='application/json').status_code, 401)
