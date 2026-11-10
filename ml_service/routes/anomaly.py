from pathlib import Path

import joblib
import numpy as np
from flask import Blueprint, jsonify, request
from sklearn.ensemble import IsolationForest

anomaly_bp = Blueprint("anomaly", __name__)

MODEL_DIR = Path(__file__).resolve().parent.parent / "models"
MODEL_PATH = MODEL_DIR / "anomaly_iforest.joblib"

_model = None


def _generate_synthetic_data(n_samples: int = 3000):
    rng = np.random.default_rng(44)
    temperature = rng.normal(4.8, 1.2, n_samples)
    diff = rng.normal(0.0, 0.35, n_samples)
    rolling_avg = temperature + rng.normal(0, 0.22, n_samples)
    x_train = np.column_stack([temperature, diff, rolling_avg])
    return x_train


def init_model():
    global _model
    MODEL_DIR.mkdir(parents=True, exist_ok=True)
    if MODEL_PATH.exists():
        _model = joblib.load(MODEL_PATH)
        return "anomaly_iforest"

    x_train = _generate_synthetic_data()
    _model = IsolationForest(
        n_estimators=240,
        contamination=0.08,
        random_state=42,
    )
    _model.fit(x_train)
    joblib.dump(_model, MODEL_PATH)
    return "anomaly_iforest"


@anomaly_bp.post("/ml/detect/anomaly")
def detect_anomaly():
    global _model
    if _model is None:
        init_model()

    payload = request.get_json(silent=True) or {}
    readings = payload.get("temperature_readings", [])
    if not isinstance(readings, list) or not readings:
        return jsonify({"error": "temperature_readings must be a non-empty float array"}), 400

    values = np.array(readings, dtype=float)
    diffs = np.diff(values, prepend=values[0])
    rolling = np.convolve(values, np.ones(3) / 3, mode="same")
    features = np.column_stack([values, diffs, rolling])

    point_predictions = _model.predict(features)
    anomaly_scores = _model.decision_function(features)
    anomalous_indices = np.where(point_predictions == -1)[0].astype(int).tolist()
    is_anomaly = len(anomalous_indices) > 0

    score = 1.0 - float(np.clip(np.mean(anomaly_scores), -1.0, 1.0))
    return jsonify(
        {
            "is_anomaly": is_anomaly,
            "anomaly_score": round(max(0.0, min(1.0, score)), 4),
            "anomalous_points": anomalous_indices,
        }
    )
