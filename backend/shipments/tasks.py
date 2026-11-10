import time
import random
import logging
import datetime
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync

logger = logging.getLogger(__name__)

def broadcast_temperature_update():
    channel_layer = get_channel_layer()
    if channel_layer is None:
        logger.warning("Channel layer not configured or unavailable")
        return

    # Simulate temperature fluctuation in DB
    try:
        from shipments.models import Shipment
        active_shipments = list(Shipment.objects.filter(status__in=['IN_TRANSIT', 'ALERT']))
        if active_shipments:
            for shipment in random.sample(active_shipments, min(len(active_shipments), 3)):
                change = round(random.uniform(-1.0, 1.0), 1)
                new_temp = round(shipment.temperature + change, 1)
                shipment.temperature = max(-5.0, min(35.0, new_temp))
                
                # Check threshold to trigger or resolve ALERT
                if shipment.temperature > 8.0 or shipment.temperature < 2.0:
                    shipment.status = "ALERT"
                    shipment.alert_reason = "Critical temperature breach detected"
                    shipment.risk_score = min(99, (shipment.risk_score or 50) + random.randint(5, 15))
                else:
                    shipment.status = "IN_TRANSIT"
                    shipment.alert_reason = None
                    shipment.risk_score = max(10, (shipment.risk_score or 30) - random.randint(5, 10))
                
                shipment.save()
                logger.info(f"Task: updated {shipment.reference} temperature to {shipment.temperature}°C, status: {shipment.status}")
    except Exception as e:
        logger.error(f"Error fluctuating DB temperatures: {e}")

    update = {
        'type': 'shipment_update',
        'update_type': 'temperature_change',
        'message': 'Temperature fluctuation detected on active routes',
        'timestamp': str(datetime.datetime.now()),
    }
    
    try:
        async_to_sync(channel_layer.group_send)('shipments', update)
        logger.info("Broadcasted temperature update via WebSocket channel layer")
    except Exception as e:
        logger.error(f"Failed to broadcast temperature update: {e}")

def broadcast_temperature_loop():
    logger.info("Initializing background temperature broadcast loop (10s intervals)...")
    # Wait for app start to settle down
    time.sleep(5)
    while True:
        try:
            broadcast_temperature_update()
        except Exception as e:
            logger.error(f"Error in temperature broadcast loop: {e}")
        time.sleep(10)
