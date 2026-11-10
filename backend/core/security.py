from django.http import JsonResponse
from django.conf import settings
from rest_framework_simplejwt.authentication import JWTAuthentication

class ApiAuthenticationMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        public = ('/api/health/', '/api/auth/login/', '/api/auth/refresh/')
        if request.path.startswith('/api/') and request.path not in public:
            try:
                result = JWTAuthentication().authenticate(request)
            except Exception:
                result = None
            if not result:
                return JsonResponse({'error': 'Authentication required'}, status=401)
            request.user, request.auth = result
            if request.method not in ('GET', 'HEAD', 'OPTIONS') and request.path.startswith('/api/shipments/') and request.user.role != 'ADMIN':
                return JsonResponse({'error': 'Admin access required'}, status=403)
        return self.get_response(request)
