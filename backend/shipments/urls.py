from django.urls import path

from .views import (
    ShipmentListView,
    ShipmentStatsView,
)

urlpatterns = [
    path("shipments/", ShipmentListView.as_view(), name="shipment-list"),
    path("shipments/stats/", ShipmentStatsView.as_view(), name="shipment-stats"),
]
