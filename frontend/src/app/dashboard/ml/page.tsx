"use client";

import { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
  Cell,
} from "recharts";

// --- Configuration ---
const ML_URL = "/api/predictions";

// --- Static Data ---
const spoilageData = [
  { level: "Low Risk (0-30%)", count: 45, fill: "#10b981" },
  { level: "Medium Risk (31-60%)", count: 28, fill: "#f59e0b" },
  { level: "High Risk (61-100%)", count: 12, fill: "#f43f5e" },
];

const etaData = [
  { shipment: "LOG-001", predicted: 24, actual: 22 },
  { shipment: "LOG-002", predicted: 48, actual: 51 },
  { shipment: "LOG-003", predicted: 36, actual: 35 },
  { shipment: "LOG-004", predicted: 72, actual: 68 },
  { shipment: "LOG-005", predicted: 18, actual: 20 },
];

const anomaliesList = [
  {
    time: "2026-05-24 14:32:00",
    shipment: "LOG-024",
    type: "Temperature Spike",
    severity: "HIGH",
    color: "bg-rose-500/20 text-rose-400 border-rose-500/30",
  },
  {
    time: "2026-05-24 12:15:00",
    shipment: "LOG-009",
    type: "Route Deviation",
    severity: "MEDIUM",
    color: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  },
  {
    time: "2026-05-24 09:44:00",
    shipment: "LOG-081",
    type: "Humidity Drop",
    severity: "LOW",
    color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  },
  {
    time: "2026-05-24 06:12:00",
    shipment: "LOG-015",
    type: "Extended Idle Time",
    severity: "MEDIUM",
    color: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  },
  {
    time: "2026-05-23 21:05:00",
    shipment: "LOG-043",
    type: "Sensor Disconnection",
    severity: "HIGH",
    color: "bg-rose-500/20 text-rose-400 border-rose-500/30",
  },
  {
    time: "2026-05-23 18:30:00",
    shipment: "LOG-005",
    type: "Door Open Alert",
    severity: "HIGH",
    color: "bg-rose-500/20 text-rose-400 border-rose-500/30",
  },
  {
    time: "2026-05-23 14:22:00",
    shipment: "LOG-072",
    type: "Unscheduled Stop",
    severity: "MEDIUM",
    color: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  },
  {
    time: "2026-05-23 10:50:00",
    shipment: "LOG-019",
    type: "Low Battery",
    severity: "LOW",
    color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  },
  {
    time: "2026-05-23 08:15:00",
    shipment: "LOG-057",
    type: "Temperature Drop",
    severity: "LOW",
    color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  },
  {
    time: "2026-05-22 23:40:00",
    shipment: "LOG-033",
    type: "Geofence Exit",
    severity: "MEDIUM",
    color: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  },
];

const optimizationRoutes = [
  {
    current: "SIN→NYC (Stopover)",
    optimized: "SIN→NYC (Direct)",
    saved: "12 hours",
    risk: "28% Reduction",
  },
  {
    current: "RTM→DXB (Sea-Freight)",
    optimized: "RTM→DXB (Rail-Link)",
    saved: "16 days",
    risk: "42% Reduction",
  },
  {
    current: "MEM→NRT (North Route)",
    optimized: "MEM→NRT (Pacific Route)",
    saved: "5 hours",
    risk: "12% Reduction",
  },
  {
    current: "LHR→SYD (Via HKG)",
    optimized: "LHR→SYD (Via DXB)",
    saved: "8 hours",
    risk: "19% Reduction",
  },
  {
    current: "HKG→LAX (Legacy Terminal)",
    optimized: "HKG→LAX (Smart Port)",
    saved: "14 hours",
    risk: "25% Reduction",
  },
];

interface PredictionResult {
  spoilage_probability: number;
  risk_level: string;
  recommendation: string;
  source: "API" | "SIMULATED";
}

export default function MLInsightsPage() {
  const [temperature, setTemperature] = useState<number>(4);
  const [duration, setDuration] = useState<number>(48);
  const [productType, setProductType] = useState<string>("Vaccines");
  const [predicting, setPredicting] = useState<boolean>(false);
  const [result, setResult] = useState<PredictionResult | null>(null);

  // ARIA LangChain Analytics States
  const [ariaQuery, setAriaQuery] = useState("");
  const [ariaResponse, setAriaResponse] = useState("");
  const [ariaLoading, setAriaLoading] = useState(false);

  const handleAskAria = async () => {
    if (!ariaQuery.trim()) return;
    setAriaLoading(true);
    setAriaResponse("");
    try {
      const res = await fetch("/api/ai/langchain", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query: ariaQuery }),
      });
      const data = await res.json();
      setAriaResponse(data.analysis || "No analysis details returned.");
    } catch (err) {
      console.error(err);
      setAriaResponse("Failed to reach ARIA service.");
    } finally {
      setAriaLoading(false);
    }
  };

  const runPrediction = async () => {
    setPredicting(true);
    setResult(null);

    const payload = {
      temperature,
      duration,
      product_type: productType,
    };

    try {
      const res = await fetch(`${ML_URL}/ml/predict/spoilage`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Flask server response was not ok");

      const data = await res.json();
      setResult({
        spoilage_probability: data.spoilage_probability,
        risk_level: data.risk_level,
        recommendation: data.recommendation,
        source: "API",
      });
    } catch {
      // Offline fallback: Simulate Flask service logic so the UI functions cleanly
      console.log("ML service offline — running browser simulation");
      const simulatedProb = Math.min(0.95, Math.max(0.05, (temperature + 10) / 50 + duration / 500));
      const simulatedRisk =
        simulatedProb > 0.6 ? "HIGH" : simulatedProb > 0.3 ? "MEDIUM" : "LOW";
      const simulatedRec =
        simulatedRisk === "HIGH"
          ? `High risk warning. Temperature is ${temperature}°C. Spoilage risk is elevated over a ${duration}h duration.`
          : simulatedRisk === "MEDIUM"
          ? `Moderate alert. Monitor vaccines closely. Current temp at ${temperature}°C.`
          : `Optimal conditions. Stable shelf environment.`;

      // Set timeout to mimic network latency for micro-animation WOW factor
      await new Promise((resolve) => setTimeout(resolve, 800));

      setResult({
        spoilage_probability: parseFloat(simulatedProb.toFixed(2)),
        risk_level: simulatedRisk,
        recommendation: simulatedRec,
        source: "SIMULATED",
      });
    } finally {
      setPredicting(false);
    }
  };

  const getRiskColor = (level: string) => {
    if (level === "HIGH") return "text-rose-400 bg-rose-500/10 border-rose-500/25";
    if (level === "MEDIUM") return "text-amber-400 bg-amber-500/10 border-amber-500/25";
    return "text-emerald-400 bg-emerald-500/10 border-emerald-500/25";
  };

  const getRiskBarColor = (level: string) => {
    if (level === "HIGH") return "bg-gradient-to-r from-rose-500 to-red-600";
    if (level === "MEDIUM") return "bg-gradient-to-r from-amber-400 to-amber-500";
    return "bg-gradient-to-r from-emerald-400 to-teal-500";
  };

  return (
    <div className="p-8 space-y-6">
      {/* ARIA Fleet Analysis Panel */}
      <div className="rounded-xl bg-gradient-to-r from-slate-900/80 via-slate-800/80 to-slate-900/80 p-6 backdrop-blur border border-white/10 relative overflow-hidden">
        {/* Glow effect */}
        <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-cyan-500/5 blur-3xl pointer-events-none" />
        
        <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-3 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="text-lg">🤖</span>
            <div>
              <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
                ARIA FLEET ANALYSIS
              </h3>
              <p className="text-[10px] text-slate-400 mt-0.5">
                On-demand intelligence & routing optimization summaries
              </p>
            </div>
          </div>
          <span className="text-[10px] font-bold bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 px-2.5 py-0.5 rounded font-mono">
            Powered by Groq · Llama 3.3 70B
          </span>
        </div>

        <div className="space-y-4">
          <div className="flex flex-col gap-2">
            <textarea
              value={ariaQuery}
              onChange={(e) => setAriaQuery(e.target.value)}
              placeholder="Ask ARIA a fleet question... e.g. Which shipments have the highest spoilage risk?"
              className="w-full min-h-[80px] rounded-lg bg-black/60 border border-white/15 px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-400 transition"
            />
            {/* suggestions */}
            <div className="flex flex-wrap items-center gap-1.5 mt-1">
              <span className="text-[9px] text-slate-500 uppercase tracking-widest font-bold mr-1">Suggestions:</span>
              {[
                "Which shipments have the highest spoilage risk?",
                "What routes are most problematic this week?",
                "Give me a summary of fleet performance"
              ].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setAriaQuery(s)}
                  className="text-[9px] bg-white/5 border border-white/10 hover:border-cyan-400/40 text-slate-300 rounded px-2 py-0.5 transition-colors cursor-pointer"
                >
                  "{s}"
                </button>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={handleAskAria}
            disabled={ariaLoading || !ariaQuery.trim()}
            className="rounded-lg bg-cyan-500/20 border border-cyan-500/40 px-4 py-2 text-xs font-bold text-cyan-300 hover:bg-cyan-500/30 hover:border-cyan-400 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center gap-2 cursor-pointer"
          >
            {ariaLoading ? (
              <>
                <span className="h-3 w-3 rounded-full border border-cyan-450 border-t-transparent animate-spin" />
                Querying Groq Engine...
              </>
            ) : (
              <>
                <span>⚡</span> Ask ARIA (Llama 3.3)
              </>
            )}
          </button>

          {/* Response area */}
          {(ariaLoading || ariaResponse) && (
            <div className="mt-4 border-t border-white/5 pt-4">
              {ariaLoading ? (
                <div className="flex items-center gap-2 text-slate-400 text-xs py-3 animate-pulse">
                  <span>🛰️</span> Analyzing current Postgres fleet data with Llama-3.3-70b-versatile...
                </div>
              ) : (
                <div className="bg-[#0a0e1a]/60 border border-white/10 rounded-lg p-4 max-h-60 overflow-y-auto">
                  <div className="font-mono text-xs leading-relaxed text-slate-200 whitespace-pre-wrap">
                    {ariaResponse}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Row 1: Charts Side-By-Side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Spoilage Risk Distribution */}
        <div className="rounded-xl bg-white/5 p-6 backdrop-blur border border-white/10">
          <h3 className="text-sm font-semibold text-slate-200 mb-4 uppercase tracking-wider">
            Spoilage Risk Distribution
          </h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={spoilageData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="level" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#0f172a", borderColor: "#22d3ee", color: "#f1f5f9" }}
                  itemStyle={{ fontSize: "12px" }}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]} name="Shipments" barSize={40}>
                  {spoilageData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ETA Prediction Accuracy */}
        <div className="rounded-xl bg-white/5 p-6 backdrop-blur border border-white/10">
          <h3 className="text-sm font-semibold text-slate-200 mb-4 uppercase tracking-wider">
            ETA Prediction Accuracy (Hours)
          </h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={etaData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="shipment" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} unit="h" />
                <Tooltip
                  contentStyle={{ backgroundColor: "#0f172a", borderColor: "#22d3ee", color: "#f1f5f9" }}
                  itemStyle={{ fontSize: "12px" }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: "11px", paddingTop: "10px" }} />
                <Line
                  type="monotone"
                  dataKey="predicted"
                  stroke="#22d3ee"
                  strokeWidth={2}
                  name="Predicted ETA"
                  dot={{ r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="actual"
                  stroke="#10b981"
                  strokeWidth={2}
                  name="Actual Transit Time"
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 2: Live ML Prediction Panel & Route Optimization */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Live ML Prediction */}
        <div className="rounded-xl bg-white/5 p-6 backdrop-blur border border-white/10 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider">
              Live Spoilage ML Prediction
            </h3>
            <p className="text-xs text-slate-400 mt-1 mb-4">
              Simulate microservice prediction model inference.
            </p>

            <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
              {/* Temp Slider */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <label className="text-slate-300 font-medium">Temperature</label>
                  <span className="font-mono text-cyan-300 font-bold">{temperature}°C</span>
                </div>
                <input
                  type="range"
                  min="-10"
                  max="40"
                  value={temperature}
                  onChange={(e) => setTemperature(parseInt(e.target.value))}
                  className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                />
              </div>

              {/* Duration Slider */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <label className="text-slate-300 font-medium">Transit Duration</label>
                  <span className="font-mono text-cyan-300 font-bold">{duration} hours</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="168"
                  value={duration}
                  onChange={(e) => setDuration(parseInt(e.target.value))}
                  className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                />
              </div>

              {/* Product dropdown */}
              <div className="space-y-1.5">
                <label className="text-xs text-slate-300 font-medium">Product Category</label>
                <select
                  value={productType}
                  onChange={(e) => setProductType(e.target.value)}
                  className="w-full rounded-lg bg-black/60 border border-white/15 px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-cyan-400 transition"
                >
                  <option value="Vaccines">Vaccines (2°C - 8°C)</option>
                  <option value="Pharmaceuticals">Pharmaceuticals (15°C - 25°C)</option>
                  <option value="Fresh Produce">Fresh Produce (4°C - 10°C)</option>
                  <option value="Frozen Seafood">Frozen Seafood (-18°C - -25°C)</option>
                  <option value="Dairy Products">Dairy Products (2°C - 4°C)</option>
                </select>
              </div>

              <button
                type="button"
                onClick={runPrediction}
                disabled={predicting}
                className="w-full rounded-lg bg-cyan-500/20 border border-cyan-500/40 py-2.5 text-sm font-semibold text-cyan-300 hover:bg-cyan-500/30 hover:border-cyan-400 active:scale-[0.98] transition-all disabled:opacity-50"
              >
                {predicting ? "Running Inference..." : "Run ML Spoilage Model"}
              </button>
            </form>
          </div>

          {/* Results Output */}
          <div className="mt-6 border-t border-white/5 pt-5 min-h-[120px] flex items-center justify-center">
            {predicting && (
              <div className="flex flex-col items-center gap-2">
                <span className="h-5 w-5 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin" />
                <span className="text-slate-400 text-xs font-medium">Inference in progress...</span>
              </div>
            )}

            {!predicting && !result && (
              <p className="text-slate-500 text-xs italic text-center">
                Configure parameters and run the spoilage model above to check predictions.
              </p>
            )}

            {!predicting && result && (
              <div className="w-full space-y-3">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400">Risk Level:</span>
                    <span
                      className={`text-[10px] font-bold border px-2 py-0.5 rounded-full ${getRiskColor(
                        result.risk_level
                      )}`}
                    >
                      {result.risk_level}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">
                    Mode: {result.source === "API" ? "Flask Live" : "Simulated"}
                  </span>
                </div>

                {/* Animated Spoilage Prob Bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-300">Spoilage Probability</span>
                    <span className="font-mono text-cyan-300 font-bold">
                      {(result.spoilage_probability * 100).toFixed(0)}%
                    </span>
                  </div>
                  <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-1000 ease-out ${getRiskBarColor(
                        result.risk_level
                      )}`}
                      style={{ width: `${result.spoilage_probability * 100}%` }}
                    />
                  </div>
                </div>

                <p className="text-xs text-slate-300 bg-white/5 border border-white/5 rounded-lg p-2.5 italic">
                  {result.recommendation}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Route Optimization */}
        <div className="rounded-xl bg-white/5 p-6 backdrop-blur border border-white/10">
          <h3 className="text-sm font-semibold text-slate-200 mb-4 uppercase tracking-wider">
            AI Route Optimization Suggestions
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-white/15">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wider text-slate-400">
                  <th className="py-2.5 pb-3">Current Route</th>
                  <th className="py-2.5 pb-3">Optimized Suggestion</th>
                  <th className="py-2.5 pb-3 text-center">Time Saved</th>
                  <th className="py-2.5 pb-3 text-right">Risk Reduction</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {optimizationRoutes.map((route) => (
                  <tr key={route.current} className="text-xs text-slate-300">
                    <td className="py-3 text-slate-450">{route.current}</td>
                    <td className="py-3 text-cyan-300 font-medium">➡️ {route.optimized}</td>
                    <td className="py-3 text-center text-emerald-450 font-bold">{route.saved}</td>
                    <td className="py-3 text-right text-emerald-400 font-semibold">{route.risk}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Row 3: Anomaly Timeline */}
      <div className="rounded-xl bg-white/5 p-6 backdrop-blur border border-white/10">
        <h3 className="text-sm font-semibold text-slate-200 mb-6 uppercase tracking-wider">
          Anomaly Detection Timeline (Last 10 Events)
        </h3>
        <div className="relative border-l border-white/10 pl-6 ml-2.5 space-y-5">
          {anomaliesList.map((event, idx) => (
            <div key={idx} className="relative group">
              {/* Timeline dot */}
              <span className="absolute -left-[31px] top-1 h-2.5 w-2.5 rounded-full border border-[#050505] bg-cyan-400 group-hover:scale-125 transition-transform" />

              <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 p-3.5 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl transition duration-200">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs text-slate-500">{event.time}</span>
                  <div className="h-3 w-[1px] bg-white/10 hidden md:block" />
                  <span className="font-mono text-xs text-cyan-300 font-semibold">{event.shipment}</span>
                  <span className="text-xs text-slate-200 font-medium">{event.type}</span>
                </div>
                <div>
                  <span
                    className={`text-[9px] font-bold border px-2 py-0.5 rounded-full ${event.color}`}
                  >
                    {event.severity}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
