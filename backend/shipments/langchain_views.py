import os
import json
from django.http import JsonResponse
from django.views import View
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from .models import Shipment

@method_decorator(csrf_exempt, name='dispatch')
class LangChainAnalysisView(View):
    def post(self, request):
        try:
            from langchain_groq import ChatGroq
            from langchain_core.messages import HumanMessage, SystemMessage
            
            body = json.loads(request.body)
            query = body.get('query', '')
            
            # Get real shipment data
            total = Shipment.objects.count()
            alerts = Shipment.objects.filter(status='ALERT').count()
            in_transit = Shipment.objects.filter(status='IN_TRANSIT').count()
            delivered = Shipment.objects.filter(status='DELIVERED').count()
            pending = Shipment.objects.filter(status='PENDING').count()
            
            # Get top alert shipments
            alert_shipments = list(
                Shipment.objects.filter(status='ALERT')
                .values('reference', 'temperature', 'alert_reason', 
                        'origin', 'destination', 'risk_score')[:5]
            )
            
            groq_key = os.environ.get('GROQ_API_KEY', '')
            if not groq_key or groq_key == 'your_groq_api_key_here':
                # Graceful fallback in case key is missing
                return JsonResponse({
                    'analysis': f"The query was: '{query}'. However, Groq Llama 3.3 requires a valid GROQ_API_KEY. Please configure your key in settings to unlock the AI analytics module. Fallback simulated analysis shows fleet status: {total} total shipments, {alerts} active excursions.",
                    'model': 'simulated-fallback',
                    'data': {
                        'total': total,
                        'alerts': alerts,
                        'in_transit': in_transit,
                        'delivered': delivered,
                        'pending': pending
                    }
                })
            
            model = ChatGroq(
                api_key=groq_key,
                model=os.getenv('GROQ_MODEL', 'openai/gpt-oss-20b'),
                temperature=0.3,
                max_tokens=500
            )
            
            system = f"""You are a logistics analyst AI for Cold Chain AI v2.0.
            
Current Fleet Status:
- Total: {total} shipments
- Alerts: {alerts} temperature excursions
- In Transit: {in_transit}
- Delivered: {delivered}  
- Pending: {pending}

Top Alert Shipments:
{json.dumps(alert_shipments, indent=2)}

Provide data-driven insights. Be concise and actionable."""
            
            messages = [
                SystemMessage(content=system),
                HumanMessage(content=query)
            ]
            
            response = model.invoke(messages)
            
            return JsonResponse({
                'analysis': response.content,
                'model': os.getenv('GROQ_MODEL', 'openai/gpt-oss-20b'),
                'data': {
                    'total': total,
                    'alerts': alerts,
                    'in_transit': in_transit,
                    'delivered': delivered,
                    'pending': pending
                }
            })
            
        except Exception as e:
            return JsonResponse({
                'error': str(e),
                'analysis': 'Analysis unavailable due to an internal error.'
            }, status=500)
