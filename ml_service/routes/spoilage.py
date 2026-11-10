from pathlib import Path

import joblib
import numpy as np
from flask import Blueprint, jsonify, request
from sklearn.ensemble import RandomForestClassifier

spoilage_bp = Blueprint("spoilage", __name__)

MODEL_DIR = Path(__file__).resolve().parent.parent / "models"
MODEL_PATH = MODEL_DIR / "spoilage_rf.joblib"
PRODUCT_TYPES = ["VACCINE", "DAIRY", "PRODUCE", "MEAT", "SEAFOOD"]

_model = None


def _generate_synthetic_data(n_samples: int = 2400):
    rng = np.random.default_rng(42)
    temperatures = rng.uniform(-5, 18, n_samples)
    humidity = rng.uniform(30, 95, n_samples)
    duration = rng.integers(2, 144, n_samples)
    product_idx = rng.integers(0, len(PRODUCT_TYPES), n_samples)

    base_risk = (
        np.clip((temperatures - 6) / 10, 0, 2.5)
        + np.clip((humidity - 65) / 25, 0, 2)
        + np.clip(duration / 72, 0, 2)
        + product_idx * 0.08
        + rng.normal(0, 0.15, n_samples)
    )
    labels = np.where(base_risk < 0.9, 0, np.where(base_risk < 1.6, 1, 2))
    features = np.column_stack([temperatures, humidity, duration, product_idx])
    return features, labels


def init_model():
    global _model
    MODEL_DIR.mkdir(parents=True, exist_ok=True)
    if MODEL_PATH.exists():
        _model = joblib.load(MODEL_PATH)
        return "spoilage_rf"

    x_train, y_train = _generate_synthetic_data()
    _model = RandomForestClassifier(n_estimators=180, random_state=42)
    _model.fit(x_train, y_train)
    joblib.dump(_model, MODEL_PATH)
    return "spoilage_rf"


def _risk_to_response(probability: float):
    if probability < 0.35:
        return "LOW", "Maintain current route and monitoring cadence."
    if probability < 0.7:
        return "MEDIUM", "Increase cooling checks and shorten checkpoint intervals."
    return "HIGH", "Trigger intervention: reroute, inspect container, and alert ops."


@spoilage_bp.post("/ml/predict/spoilage")
def predict_spoilage():
    global _model
    if _model is None:
        init_model()

    payload = request.get_json(silent=True) or {}
    product_type = str(payload.get("product_type", "PRODUCE")).upper()
    product_idx = PRODUCT_TYPES.index(product_type) if product_type in PRODUCT_TYPES else 2

    temperature = float(payload.get("temperature", 5.0))
    humidity = float(payload.get("humidity", 60.0))
    duration_hours = int(payload.get("duration_hours", 24))

    features = np.array([[temperature, humidity, duration_hours, product_idx]], dtype=float)
    probabilities = _model.predict_proba(features)[0]
    spoilage_probability = float(probabilities[1] * 0.45 + probabilities[2] * 0.9)
    risk_level, recommendation = _risk_to_response(spoilage_probability)

    return jsonify(
        {
            "spoilage_probability": round(max(0.0, min(1.0, spoilage_probability)), 4),
            "risk_level": risk_level,
            "recommendation": recommendation,
        }
    )
