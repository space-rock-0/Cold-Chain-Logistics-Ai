from datetime import date, timedelta
from pathlib import Path

import joblib
import numpy as np
from flask import Blueprint, jsonify, request
from sklearn.preprocessing import MinMaxScaler

demand_bp = Blueprint("demand", __name__)

MODEL_DIR = Path(__file__).resolve().parent.parent / "models"
META_PATH = MODEL_DIR / "demand_lstm_meta.joblib"
MODEL_PATH = MODEL_DIR / "demand_lstm.keras"

_model = None
_meta = {}


def _make_historical_series(length: int = 420):
    rng = np.random.default_rng(45)
    trend = np.linspace(65, 110, length)
    seasonal = 10 * np.sin(np.arange(length) * 2 * np.pi / 14)
    noise = rng.normal(0, 2.2, length)
    return np.maximum(20, trend + seasonal + noise)


def init_model():
    global _model, _meta
    MODEL_DIR.mkdir(parents=True, exist_ok=True)
    import tensorflow as tf

    tf.random.set_seed(42)
    look_back = 14

    if META_PATH.exists() and MODEL_PATH.exists():
        _meta = joblib.load(META_PATH)
        _model = tf.keras.models.load_model(MODEL_PATH)
        return "demand_lstm"

    series = _make_historical_series()
    scaler = MinMaxScaler()
    scaled = scaler.fit_transform(series.reshape(-1, 1)).flatten()

    x_train, y_train = [], []
    for idx in range(len(scaled) - look_back):
        x_train.append(scaled[idx : idx + look_back])
        y_train.append(scaled[idx + look_back])
    x_train = np.array(x_train).reshape(-1, look_back, 1)
    y_train = np.array(y_train)

    model = tf.keras.Sequential(
        [
            tf.keras.layers.Input(shape=(look_back, 1)),
            tf.keras.layers.LSTM(16),
            tf.keras.layers.Dense(1),
        ]
    )
    model.compile(optimizer="adam", loss="mse")
    model.fit(x_train, y_train, epochs=10, batch_size=16, verbose=0)

    model.save(MODEL_PATH)
    _meta = {
        "look_back": look_back,
        "scaler": scaler,
        "recent_series": series.tolist(),
    }
    joblib.dump(_meta, META_PATH)
    _model = model
    return "demand_lstm"


@demand_bp.get("/ml/forecast/demand")
def forecast_demand():
    global _model, _meta
    if _model is None:
        init_model()

    days_ahead = int(request.args.get("days_ahead", 7))
    days_ahead = max(1, min(30, days_ahead))
    route = request.args.get("route", "DEFAULT")

    look_back = int(_meta["look_back"])
    scaler = _meta["scaler"]
    history = list(_meta["recent_series"])

    window = scaler.transform(np.array(history[-look_back:]).reshape(-1, 1)).flatten()
    predictions = []

    for _ in range(days_ahead):
        x_next = np.array(window).reshape(1, look_back, 1)
        y_scaled = float(_model.predict(x_next, verbose=0)[0][0])
        y_value = float(scaler.inverse_transform(np.array([[y_scaled]])).flatten()[0])
        predictions.append(max(0, int(round(y_value))))
        window = np.append(window[1:], y_scaled)

    start = date.today() + timedelta(days=1)
    forecast = [
        {
            "date": (start + timedelta(days=idx)).isoformat(),
            "predicted_volume": value,
        }
        for idx, value in enumerate(predictions)
    ]

    route_factor = 0.96 if route.upper().startswith("COLD") else 0.92
    confidence = round(max(0.6, min(0.98, route_factor - days_ahead * 0.006)), 3)
    return jsonify({"forecast": forecast, "confidence": confidence})
