from django.core.management.base import BaseCommand
from shipments.models import Shipment
import random
import uuid

ORIGINS = [
    "Port of Singapore", "Rotterdam Gateway", "FedEx Memphis Superhub",
    "Dubai World Central", "Shanghai Yangshan Port", "Los Angeles Long Beach",
    "Frankfurt Airport Cargo", "Tokyo Narita International",
    "New York JFK Cargo", "London Heathrow Cargo", "Mumbai JNPT Port",
    "Sydney Kingsford Smith", "Amsterdam Schiphol Cargo",
    "Hong Kong International Cargo", "Istanbul Airport Cargo"
]

DESTINATIONS = [
    "Bangkok Suvarnabhumi", "Chicago O'Hare Cargo", "Toronto Pearson Cargo",
    "São Paulo Guarulhos", "Seoul Incheon Cargo", "Paris CDG Cargo",
    "Madrid Barajas Cargo", "Cairo International Cargo",
    "Johannesburg OR Tambo", "Mexico City AICM Cargo",
    "Delhi IGI Cargo Hub", "Beijing Capital Cargo",
    "Brussels Airport Cargo", "Vienna International Cargo",
    "Zurich Airport Cargo"
]

ALERT_REASONS = [
    "Temperature excursion detected - cold chain breach at customs hold",
    "Route deviation - vessel rerouted due to Suez Canal congestion",
    "Customs clearance delay - documentation inspection required",
    "Security seal tampered - inspection required before final delivery",
    "Capacity overflow - destination warehouse at maximum storage capacity",
    "Carrier delay - mechanical issue with primary transport vehicle",
    "Weather disruption - typhoon warning affecting Pacific route",
    "Regulatory hold - new import restrictions at destination port"
]


class Command(BaseCommand):
    help = 'Seed 85 realistic shipments'

    def handle(self, *args, **kwargs):
        if Shipment.objects.exists():
            self.stdout.write('Shipments already exist; skipping sample seed')
            return
        Shipment.objects.all().delete()
        shipments = []

        # 20 PENDING
        for i in range(20):
            shipments.append(Shipment(
                reference=f"LOG-{100001 + i}",
                origin=random.choice(ORIGINS),
                destination=random.choice(DESTINATIONS),
                status="PENDING",
                eta=f"{random.randint(1, 5)}d {random.randint(1, 23)}h",
                progress=0,
                temperature=round(random.uniform(2.0, 8.0), 1),
                humidity=round(random.uniform(60, 80), 1),
                location=random.choice(ORIGINS),
                risk_score=random.randint(10, 30),
            ))

        # 25 IN_TRANSIT
        for i in range(25):
            shipments.append(Shipment(
                reference=f"LOG-{100021 + i}",
                origin=random.choice(ORIGINS),
                destination=random.choice(DESTINATIONS),
                status="IN_TRANSIT",
                eta=f"{random.randint(1, 3)}d {random.randint(1, 12)}h",
                progress=random.randint(20, 80),
                temperature=round(random.uniform(3.0, 7.5), 1),
                humidity=round(random.uniform(55, 75), 1),
                location="En Route - " + random.choice(ORIGINS),
                risk_score=random.randint(20, 50),
            ))

        # 20 ALERT
        for i in range(20):
            shipments.append(Shipment(
                reference=f"LOG-{100046 + i}",
                origin=random.choice(ORIGINS),
                destination=random.choice(DESTINATIONS),
                status="ALERT",
                eta=f"{random.randint(2, 5)}d {random.randint(1, 12)}h",
                progress=random.randint(30, 70),
                temperature=round(random.uniform(9.0, 35.0), 1),
                humidity=round(random.uniform(40, 90), 1),
                location="Alert Zone - " + random.choice(ORIGINS),
                risk_score=random.randint(60, 95),
                alert_reason=random.choice(ALERT_REASONS),
                ml_anomaly_flag=True,
                ml_spoilage_risk=round(random.uniform(0.6, 0.95), 2),
            ))

        # 20 DELIVERED
        for i in range(20):
            shipments.append(Shipment(
                reference=f"LOG-{100066 + i}",
                origin=random.choice(ORIGINS),
                destination=random.choice(DESTINATIONS),
                status="DELIVERED",
                eta="Delivered",
                progress=100,
                temperature=round(random.uniform(2.0, 8.0), 1),
                humidity=round(random.uniform(55, 75), 1),
                location=random.choice(DESTINATIONS),
                risk_score=random.randint(5, 25),
                blockchain_tx="0x" + uuid.uuid4().hex + uuid.uuid4().hex[:24],
            ))

        Shipment.objects.bulk_create(shipments)
        self.stdout.write(self.style.SUCCESS(
            f'Successfully seeded {len(shipments)} shipments'
        ))
