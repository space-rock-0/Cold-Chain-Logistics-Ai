import uuid

from django.db import models


class Shipment(models.Model):
    class Status(models.TextChoices):
        PENDING = "PENDING", "Pending"
        IN_TRANSIT = "IN_TRANSIT", "In Transit"
        ALERT = "ALERT", "Alert"
        DELIVERED = "DELIVERED", "Delivered"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    reference = models.CharField(max_length=120)
    origin = models.CharField(max_length=120)
    destination = models.CharField(max_length=120)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    eta = models.CharField(max_length=120)
    progress = models.IntegerField()
    temperature = models.FloatField()
    humidity = models.FloatField()
    location = models.CharField(max_length=255)
    risk_score = models.IntegerField(null=True, blank=True)
    alert_reason = models.CharField(max_length=255, null=True, blank=True)
    blockchain_tx = models.CharField(max_length=255, null=True, blank=True)
    ml_spoilage_risk = models.FloatField(null=True, blank=True)
    ml_eta_prediction = models.CharField(max_length=120, null=True, blank=True)
    ml_anomaly_flag = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self) -> str:
        return f"{self.reference} ({self.status})"
