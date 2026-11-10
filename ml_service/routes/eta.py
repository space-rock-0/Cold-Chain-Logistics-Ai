from datetime import datetime, timedelta, timezone
from pathlib import Path

import joblib
import numpy as np
from flask import Blueprint, jsonify, request
from sklearn.ensemble import GradientBoostingRegressor

eta_bp = Blueprint("eta", __name__)

MODEL_DIR = Path(__file__).resolve().parent.parent / "models"
MODEL_PATH = MODEL_DIR / "eta_gbr.joblib"
STATUS_MAP = {"PENDING": 0, "IN_TRANSIT": 1, "ALERT": 2, "DELIVERED": 3}
CITY_MAP = {
    "MUMBAI": 0,
    "DELHI": 1,
    "BENGALURU": 2,
    "HYDERABAD": 3,
    "CHENNAI": 4,
    "KOLKATA": 5,
    "PUNE": 6,
}

_model = None


def _encode_city(city: str) -> int:
    return CITY_MAP.get(city.upper(), len(CITY_MAP))


def _generate_synthetic_data(n_samples: int = 2200):
    rng = np.random.default_rng(43)
    origin_idx = rng.integers(0, len(CITY_MAP), n_samples)
    destination_idx = rng.integers(0, len(CITY_MAP), n_samples)
    progress = rng.integers(0, 101, n_samples)
    status_idx = rng.integers(0, len(STATUS_MAP), n_samples)
    distance = 120 + np.abs(origin_idx - destination_idx) * 180 + rng.normal(0, 35, n_samples)

    remaining_factor = (100 - progress) / 100.0
    status_penalty = np.where(status_idx == STATUS_MAP["ALERT"], 1.4, 1.0)
    base_hours = np.clip(distance / 55.0, 2, 38)
    y_train = np.clip(base_hours * remaining_factor * status_penalty + rng.normal(0, 1.3, n_samples), 1, 96)

    x_train = np.column_stack([distance, progress, status_idx, origin_idx, destination_idx])
    return x_train, y_train


def init_model():
    global _model
    MODEL_DIR.mkdir(parents=True, exist_ok=True)
    if MODEL_PATH.exists():
        _model = joblib.load(MODEL_PATH)
        return "eta_gbr"

    x_train, y_train = _generate_synthetic_data()
    _model = GradientBoostingRegressor(random_state=42, n_estimators=180)
    _model.fit(x_train, y_train)
    joblib.dump(_model, MODEL_PATH)
    return "eta_gbr"


@eta_bp.post("/ml/predict/eta")
def predict_eta():
    global _model
    if _model is None:
        init_model()

    payload = request.get_json(silent=True) or {}
    origin = str(payload.get("origin", "Mumbai"))
    destination = str(payload.get("destination", "Delhi"))
    progress = int(payload.get("current_progress", 0))
    status = str(payload.get("status", "PENDING")).upper()

    origin_idx = _encode_city(origin)
    destination_idx = _encode_city(destination)
    distance = 120 + abs(origin_idx - destination_idx) * 180
    status_idx = STATUS_MAP.get(status, 0)

    features = np.array([[distance, progress, status_idx, origin_idx, destination_idx]], dtype=float)
    predicted_hours = int(max(1, round(float(_model.predict(features)[0]))))
    confidence = round(max(0.5, min(0.97, 1 - (predicted_hours / 130))), 3)
    predicted_eta = (datetime.now(timezone.utc) + timedelta(hours=predicted_hours)).isoformat()

    return jsonify(
        {
            "predicted_hours": predicted_hours,
            "confidence": confidence,
            "predicted_eta": predicted_eta,
        }
    )
