from django.contrib.auth import authenticate, get_user_model
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.tokens import RefreshToken

def profile(user):
    return {'email': user.email, 'name': user.get_full_name() or user.username, 'role': user.role}

class LoginView(APIView):
    def post(self, request):
        username = request.data.get('username', '')
        match = get_user_model().objects.filter(email__iexact=username).first()
        user = authenticate(username=match.username if match else username, password=request.data.get('password'))
        if not user:
            return Response({'error': 'Invalid credentials'}, status=401)
        return Response({'access': str(RefreshToken.for_user(user).access_token), 'user': profile(user)})

class MeView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]
    def get(self, request):
        return Response({'user': profile(request.user)})
