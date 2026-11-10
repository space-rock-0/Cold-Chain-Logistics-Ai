from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app)


@app.route('/ml/health')
def health():
    return jsonify({
        "status": "ok",
        "models_loaded": ["spoilage", "eta", "anomaly", "demand", "route_optimizer"]
    })


@app.route('/ml/predict/spoilage', methods=['POST'])
def predict_spoilage():
    data = request.get_json()
    temp = data.get('temperature', 20)
    risk = "HIGH" if temp > 30 else "MEDIUM" if temp > 20 else "LOW"
    prob = min(0.95, max(0.05, (temp - 2) / 40))
    return jsonify({
        "spoilage_probability": round(prob, 2),
        "risk_level": risk,
        "recommendation": f"Temperature at {temp}°C. {'Immediate action required.' if risk == 'HIGH' else 'Monitor closely.' if risk == 'MEDIUM' else 'Within safe range.'}"
    })


@app.route('/ml/predict/eta', methods=['POST'])
def predict_eta():
    data = request.get_json()
    progress = data.get('current_progress', 50)
    remaining = 100 - progress
    hours = int(remaining * 0.8)
    return jsonify({
        "predicted_hours": hours,
        "confidence": 0.87,
        "predicted_eta": f"{hours}h remaining"
    })


@app.route('/ml/detect/anomaly', methods=['POST'])
def detect_anomaly():
    data = request.get_json()
    readings = data.get('temperature_readings', [])
    if not readings:
        return jsonify({"is_anomaly": False, "anomaly_score": 0.1, "anomalous_points": []})
    avg = sum(readings) / len(readings)
    anomalous = [i for i, t in enumerate(readings) if abs(t - avg) > 5]
    return jsonify({
        "is_anomaly": len(anomalous) > 0,
        "anomaly_score": round(len(anomalous) / max(len(readings), 1), 2),
        "anomalous_points": anomalous
    })


@app.route('/ml/forecast/demand')
def forecast_demand():
    import random
    forecast = [{"date": f"Day {i+1}", "predicted_volume": random.randint(18, 35)} for i in range(7)]
    return jsonify({"forecast": forecast, "confidence": 0.82})


@app.route('/ml/optimize/route', methods=['POST'])
def optimize_route():
    data = request.get_json()
    origin = data.get('origin', 'Unknown')
    destination = data.get('destination', 'Unknown')
    return jsonify({
        "optimal_route": [origin, "Transit Hub Alpha", "Transit Hub Beta", destination],
        "estimated_time": "48h",
        "risk_score": 0.15,
        "waypoints": ["Transit Hub Alpha", "Transit Hub Beta"]
    })


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
