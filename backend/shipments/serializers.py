from rest_framework import serializers

from .models import Shipment


class ShipmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Shipment
        fields = [
            "id",
            "reference",
            "origin",
            "destination",
            "status",
            "eta",
            "progress",
            "temperature",
            "humidity",
            "location",
            "risk_score",
            "alert_reason",
            "blockchain_tx",
            "ml_spoilage_risk",
            "ml_eta_prediction",
            "ml_anomaly_flag",
            "created_at",
        ]


class ShipmentStatusUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Shipment
        fields = ["status"]


class ShipmentStatsSerializer(serializers.Serializer):
    total = serializers.IntegerField()
    pending = serializers.IntegerField()
    in_transit = serializers.IntegerField()
    alert = serializers.IntegerField()
    delivered = serializers.IntegerField()
    avg_temperature = serializers.FloatField(allow_null=True)
    avg_humidity = serializers.FloatField(allow_null=True)
    avg_progress = serializers.FloatField(allow_null=True)
