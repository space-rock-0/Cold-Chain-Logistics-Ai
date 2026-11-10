import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from .models import Shipment

class ShipmentConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        protocols = self.scope.get('subprotocols', [])
        if len(protocols) != 2 or protocols[0] != 'bearer' or not await self.valid_token(protocols[1]):
            await self.close(code=4401)
            return
        await self.channel_layer.group_add(
            'shipments', self.channel_name
        )
        await self.accept(subprotocol='bearer')
        # Send initial data on connect
        shipments = await self.get_shipments()
        await self.send(json.dumps({
            'type': 'initial_data',
            'shipments': shipments
        }))
    
    async def disconnect(self, code):
        await self.channel_layer.group_discard(
            'shipments', self.channel_name
        )
    
    async def shipment_update(self, event):
        await self.send(json.dumps(event))
    
    @database_sync_to_async
    def valid_token(self, token):
        from rest_framework_simplejwt.authentication import JWTAuthentication
        try:
            auth = JWTAuthentication()
            auth.get_user(auth.get_validated_token(token))
            return True
        except Exception:
            return False

    @database_sync_to_async
    def get_shipments(self):
        shipments = Shipment.objects.values(
            'id', 'reference', 'status', 'temperature',
            'location', 'progress', 'risk_score'
        )
        # Convert UUID to string representation to ensure JSON serialization succeeds
        return [{
            **s,
            'id': str(s['id'])
        } for s in shipments]
