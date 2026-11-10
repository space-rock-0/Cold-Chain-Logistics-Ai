from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Shipment
from django.core.management import call_command
import threading


_seed_lock = threading.Lock()


def ensure_sample_shipments():
    if Shipment.objects.exists():
        return
    with _seed_lock:
        if not Shipment.objects.exists():
            call_command("seed_shipments", verbosity=0)


class ShipmentListView(APIView):
    def get(self, request):
        ensure_sample_shipments()
        shipments = Shipment.objects.all().order_by('-created_at')
        data = [{
            "id": str(s.id),
            "reference": s.reference,
            "origin": s.origin,
            "destination": s.destination,
            "status": s.status,
            "eta": s.eta,
            "progress": s.progress,
            "temperature": s.temperature,
            "humidity": s.humidity,
            "location": s.location,
            "riskScore": s.risk_score,
            "alertReason": s.alert_reason,
            "blockchainTx": s.blockchain_tx,
            "mlSpoilageRisk": s.ml_spoilage_risk,
            "mlAnomalyFlag": s.ml_anomaly_flag,
            "createdAt": s.created_at.isoformat(),
        } for s in shipments]
        return Response({"shipments": data, "total": len(data)})


class ShipmentStatsView(APIView):
    def get(self, request):
        ensure_sample_shipments()
        return Response({
            "total": Shipment.objects.count(),
            "pending": Shipment.objects.filter(status="PENDING").count(),
            "in_transit": Shipment.objects.filter(status="IN_TRANSIT").count(),
            "alerts": Shipment.objects.filter(status="ALERT").count(),
            "delivered": Shipment.objects.filter(status="DELIVERED").count(),
        })


class HealthView(APIView):
    def get(self, request):
        return Response({"status": "ok"})


from django.views import View
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
import json

@method_decorator(csrf_exempt, name='dispatch')  
class ShipmentUpdateView(View):
  def post(self, request):
    try:
      body = json.loads(request.body)
      reference = body.get('reference', '')
      new_status = body.get('status', '')
      
      valid_statuses = ['PENDING','IN_TRANSIT','ALERT','DELIVERED']
      if new_status not in valid_statuses:
        return JsonResponse({'error': 'Invalid status'}, status=400)
      
      shipment = Shipment.objects.filter(
        reference=reference
      ).first()
      
      if not shipment:
        return JsonResponse({'error': 'Shipment not found'}, status=404)
      
      shipment.status = new_status
      if new_status == 'DELIVERED':
        shipment.progress = 100
        shipment.eta = 'Delivered'
      elif new_status == 'IN_TRANSIT':
        shipment.progress = max(shipment.progress, 20)
      shipment.save()
      
      return JsonResponse({
        'success': True,
        'reference': shipment.reference,
        'status': shipment.status,
        'progress': shipment.progress
      })
    except Exception as e:
      return JsonResponse({'error': str(e)}, status=500)


@method_decorator(csrf_exempt, name='dispatch')
class ShipmentCreateView(View):
  def post(self, request):
    try:
      body = json.loads(request.body)
      
      # Determine temp and calculate risk based on it
      temp = float(body.get('temperature', 4.0))
      
      # Spoilage risk calculation (deterministic)
      # Since we don't have reference ID yet, we'll generate one
      next_ref_id = Shipment.objects.count() + 100086
      ref_str = f"LOG-{next_ref_id}"
      
      digits = next_ref_id
      seed = (digits % 100) / 100
      
      if temp > 15:
        spoilageRiskVal = 70 + seed * 20
      elif temp > 8:
        spoilageRiskVal = 30 + seed * 30
      elif temp < 2:
        spoilageRiskVal = 20 + seed * 20
      else:
        spoilageRiskVal = 5 + seed * 15
      
      # Create shipment
      shipment = Shipment.objects.create(
        reference=ref_str,
        origin=body.get('origin', ''),
        destination=body.get('destination', ''),
        status=body.get('status', 'PENDING'),
        eta=body.get('eta', '3d'),
        progress=int(body.get('progress', 0)),
        temperature=temp,
        humidity=float(body.get('humidity', 65.0)),
        location=body.get('location', body.get('origin', '')),
        risk_score=int(body.get('riskScore', int(20 + seed * 15))),
        ml_spoilage_risk=float(spoilageRiskVal) / 100.0,
      )
      return JsonResponse({
        'id': str(shipment.id),
        'reference': shipment.reference,
        'status': shipment.status,
        'success': True
      })
    except Exception as e:
      return JsonResponse({'error': str(e)}, status=500)


@method_decorator(csrf_exempt, name='dispatch')
class ShipmentEditView(View):
  def patch(self, request, pk):
    try:
      body = json.loads(request.body)
      shipment = Shipment.objects.get(id=pk)
      
      allowed = ['origin','destination','status','eta',
                 'progress','temperature','location',
                 'risk_score','alert_reason','humidity']
      for field in allowed:
        if field in body:
          setattr(shipment, field, body[field])
      
      # Support riskScore camelCase
      if 'riskScore' in body:
        shipment.risk_score = body['riskScore']
        
      # If temperature changed, update ML spoilage risk
      if 'temperature' in body or 'temp' in body:
        temp = float(body.get('temperature', shipment.temperature))
        digits = int(''.join(c for c in shipment.reference if c.isdigit()) or '0')
        seed = (digits % 100) / 100
        if temp > 15:
          spoilageRiskVal = 70 + seed * 20
        elif temp > 8:
          spoilageRiskVal = 30 + seed * 30
        elif temp < 2:
          spoilageRiskVal = 20 + seed * 20
        else:
          spoilageRiskVal = 5 + seed * 15
        shipment.ml_spoilage_risk = float(spoilageRiskVal) / 100.0
      
      # Auto-set alert details if status changes to ALERT and reason is not set
      if body.get('status') == 'ALERT' and not shipment.alert_reason:
        shipment.alert_reason = "Manual override: Temperature deviation alert triggered."
      
      # Set location to destination or origin based on progress/status changes
      if 'progress' in body:
        prog = int(body['progress'])
        if prog >= 100:
          shipment.location = shipment.destination
          shipment.status = 'DELIVERED'
          if not shipment.blockchain_tx:
            # Generate a mock blockchain transaction hash if none exists
            import hashlib
            shipment.blockchain_tx = "0x" + hashlib.sha256(shipment.reference.encode()).hexdigest()
        elif prog > 0 and shipment.status == 'PENDING':
          shipment.status = 'IN_TRANSIT'
          
      shipment.save()
      
      return JsonResponse({'success': True, 
                          'reference': shipment.reference})
    except Exception as e:
      return JsonResponse({'error': str(e)}, status=500)


@method_decorator(csrf_exempt, name='dispatch')
class ShipmentDeleteView(View):
  def delete(self, request, pk):
    try:
      shipment = Shipment.objects.get(id=pk)
      ref = shipment.reference
      shipment.delete()
      return JsonResponse({'success': True, 
                          'deleted': ref})
    except Exception as e:
      return JsonResponse({'error': str(e)}, status=500)
