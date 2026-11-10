import heapq
from pathlib import Path

import joblib
import numpy as np
from flask import Blueprint, jsonify, request
from sklearn.ensemble import RandomForestRegressor

route_optimizer_bp = Blueprint("route_optimizer", __name__)

MODEL_DIR = Path(__file__).resolve().parent.parent / "models"
MODEL_PATH = MODEL_DIR / "route_risk_rf.joblib"

_model = None

GRAPH = {
    "MUMBAI": {"PUNE": 3.0, "HYDERABAD": 11.0},
    "PUNE": {"MUMBAI": 3.0, "BENGALURU": 14.0, "HYDERABAD": 10.0},
    "HYDERABAD": {"MUMBAI": 11.0, "PUNE": 10.0, "BENGALURU": 8.0, "CHENNAI": 12.0},
    "BENGALURU": {"PUNE": 14.0, "HYDERABAD": 8.0, "CHENNAI": 6.0},
    "CHENNAI": {"HYDERABAD": 12.0, "BENGALURU": 6.0, "KOLKATA": 24.0},
    "DELHI": {"KOLKATA": 18.0},
    "KOLKATA": {"DELHI": 18.0, "CHENNAI": 24.0},
}

PRIORITY_MAP = {"LOW": 0, "MEDIUM": 1, "HIGH": 2}


def _generate_synthetic_data(n_samples: int = 2500):
    rng = np.random.default_rng(46)
    base_hours = rng.uniform(2, 30, n_samples)
    max_temp = rng.uniform(-5, 15, n_samples)
    priority = rng.integers(0, 3, n_samples)
    hops = rng.integers(2, 7, n_samples)

    risk = (
        np.clip((max_temp - 4) / 10, 0, 1.3)
        + np.clip(base_hours / 40, 0, 1.2)
        + hops * 0.06
        - priority * 0.08
        + rng.normal(0, 0.09, n_samples)
    )
    y_train = np.clip(risk, 0.02, 1.0)
    x_train = np.column_stack([base_hours, max_temp, priority, hops])
    return x_train, y_train


def init_model():
    global _model
    MODEL_DIR.mkdir(parents=True, exist_ok=True)
    if MODEL_PATH.exists():
        _model = joblib.load(MODEL_PATH)
        return "route_risk_rf"

    x_train, y_train = _generate_synthetic_data()
    _model = RandomForestRegressor(n_estimators=220, random_state=42)
    _model.fit(x_train, y_train)
    joblib.dump(_model, MODEL_PATH)
    return "route_risk_rf"


def _dijkstra(origin: str, destination: str):
    queue = [(0.0, origin, [origin])]
    visited = {}
    while queue:
        cost, node, path = heapq.heappop(queue)
        if node == destination:
            return path, cost
        if node in visited and visited[node] <= cost:
            continue
        visited[node] = cost
        for neighbor, weight in GRAPH.get(node, {}).items():
            heapq.heappush(queue, (cost + weight, neighbor, path + [neighbor]))
    return [origin, destination], 20.0


@route_optimizer_bp.post("/ml/optimize/route")
def optimize_route():
    global _model
    if _model is None:
        init_model()

    payload = request.get_json(silent=True) or {}
    origin = str(payload.get("origin", "Mumbai")).upper()
    destination = str(payload.get("destination", "Delhi")).upper()
    constraints = payload.get("constraints", {}) or {}
    max_temp = float(constraints.get("max_temp", 5.0))
    priority = str(constraints.get("priority", "MEDIUM")).upper()

    route, base_hours = _dijkstra(origin, destination)
    hops = len(route)
    priority_idx = PRIORITY_MAP.get(priority, 1)

    features = np.array([[base_hours, max_temp, priority_idx, hops]], dtype=float)
    risk_score = float(np.clip(_model.predict(features)[0], 0.0, 1.0))

    est_hours = max(1, int(round(base_hours)))
    estimated_time = f"{est_hours}h {int((base_hours - est_hours) * 60) % 60}m"

    return jsonify(
        {
            "optimal_route": route,
            "estimated_time": estimated_time,
            "risk_score": round(risk_score, 4),
            "waypoints": route[1:-1],
        }
    )
