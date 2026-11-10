"""
URL configuration for core project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import include, path
from shipments.views import HealthView, ShipmentUpdateView, ShipmentCreateView, ShipmentEditView, ShipmentDeleteView
from shipments.langchain_views import LangChainAnalysisView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('shipments.urls')),
    path('api/auth/', include('auth_app.urls')),
    path('api/health/', HealthView.as_view(), name='health'),
    path('api/ai/langchain/', LangChainAnalysisView.as_view(), name='langchain'),
    path('api/shipments/update/', ShipmentUpdateView.as_view()),
    path('api/shipments/create/', ShipmentCreateView.as_view()),
    path('api/shipments/<str:pk>/edit/', ShipmentEditView.as_view()),
    path('api/shipments/<str:pk>/delete/', ShipmentDeleteView.as_view()),
]
