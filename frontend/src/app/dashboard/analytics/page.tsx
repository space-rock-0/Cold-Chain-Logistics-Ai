"use client";

import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  ComposedChart,
  ReferenceLine,
} from "recharts";

// --- Static and Generated Data ---
const sparklineOnTime = [
  { val: 85.0 },
  { val: 86.2 },
  { val: 85.9 },
  { val: 87.3 },
];

const sparklineTemp = [
  { val: 6.8 },
  { val: 6.5 },
  { val: 6.3 },
  { val: 6.2 },
];

const sparklineUtil = [
  { val: 91.2 },
  { val: 92.8 },
  { val: 93.1 },
  { val: 94.1 },
];

const sparklineResolution = [
  { val: 3.1 },
  { val: 2.8 },
  { val: 2.6 },
  { val: 2.4 },
];

const volumeData = [
  { day: "Mon", shipments: 12, alerts: 2 },
  { day: "Tue", shipments: 18, alerts: 4 },
  { day: "Wed", shipments: 15, alerts: 1 },
  { day: "Thu", shipments: 22, alerts: 5 },
  { day: "Fri", shipments: 19, alerts: 3 },
  { day: "Sat", shipments: 8, alerts: 1 },
  { day: "Sun", shipments: 11, alerts: 2 },
];

const statusData = [
  { name: "Pending", value: 20 },
  { name: "In Transit", value: 25 },
  { name: "Alert", value: 20 },
  { name: "Delivered", value: 20 },
];

const STATUS_COLORS = ["#64748b", "#38bdf8", "#f43f5e", "#10b981"];

// Generate 24 hourly temp readings
const tempData = Array.from({ length: 24 }, (_, i) => {
  const sinVal = Math.sin(i * 0.4) * 2;
  const randVal = (Math.random() - 0.5) * 1.2;
  const tempVal = 4 + sinVal + randVal;
  const roundedTemp = parseFloat(tempVal.toFixed(1));
  return {
    hour: `${i}:00`,
    temp: roundedTemp,
    threshold: 8,
    // Base the red fill area at 8; only fill if temp > 8
    tempAbove: roundedTemp > 8 ? roundedTemp : 8,
  };
});

const routeData = [
  { route: "SIN→NYC", volume: 12, risk: 2.1 },
  { route: "RTM→DXB", volume: 9, risk: 3.4 },
  { route: "MEM→NRT", volume: 8, risk: 1.8 },
  { route: "LHR→SYD", volume: 7, risk: 4.2 },
  { route: "HKG→LAX", volume: 6, risk: 2.9 },
];

const radarData = [
  { metric: "Temperature", score: 88 },
  { metric: "On-Time", score: 87 },
  { metric: "Security", score: 95 },
  { metric: "Capacity", score: 76 },
  { metric: "Route Opt", score: 82 },
  { metric: "AI Score", score: 91 },
];

// Custom tooltip for PieChart
interface CustomPieTooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    payload: { name: string; value: number };
  }>;
}

const CustomPieTooltip = ({ active, payload }: CustomPieTooltipProps) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const total = statusData.reduce((acc, curr) => acc + curr.value, 0);
    const pct = ((data.value / total) * 100).toFixed(1);
    return (
      <div className="bg-[#0f172a] border border-[#22d3ee] p-3 rounded-lg shadow-xl text-xs">
        <p className="font-semibold text-slate-100">{data.name}</p>
        <p className="text-cyan-400 mt-0.5">
          Count: <span className="font-bold">{data.value}</span> ({pct}%)
        </p>
      </div>
    );
  };
  return null;
};

export default function AnalyticsPage() {
  return (
    <div className="p-8 space-y-6">
      {/* Row 1: KPI cards with Sparklines */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* KPI 1 */}
        <div className="rounded-xl bg-white/5 p-4 backdrop-blur border border-white/10 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wider text-slate-400">On-Time Delivery Rate</p>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-2xl font-bold text-cyan-400">87.3%</span>
              <span className="text-emerald-400 text-xs font-semibold">↑</span>
            </div>
          </div>
          <div className="w-20 h-10">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={sparklineOnTime}>
                <Line type="monotone" dataKey="val" stroke="#22d3ee" strokeWidth={1.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="rounded-xl bg-white/5 p-4 backdrop-blur border border-white/10 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wider text-slate-400">Average Temperature</p>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-2xl font-bold text-cyan-400">6.2°C</span>
              <span className="text-emerald-400 text-xs font-semibold">↓</span>
            </div>
          </div>
          <div className="w-20 h-10">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={sparklineTemp}>
                <Line type="monotone" dataKey="val" stroke="#10b981" strokeWidth={1.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* KPI 3 */}
        <div className="rounded-xl bg-white/5 p-4 backdrop-blur border border-white/10 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wider text-slate-400">Fleet Utilization</p>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-2xl font-bold text-cyan-400">94.1%</span>
              <span className="text-emerald-400 text-xs font-semibold">↑</span>
            </div>
          </div>
          <div className="w-20 h-10">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={sparklineUtil}>
                <Line type="monotone" dataKey="val" stroke="#38bdf8" strokeWidth={1.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* KPI 4 */}
        <div className="rounded-xl bg-white/5 p-4 backdrop-blur border border-white/10 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wider text-slate-400">Alert Resolution Time</p>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-2xl font-bold text-cyan-400">2.4h</span>
              <span className="text-emerald-400 text-xs font-semibold">↓</span>
            </div>
          </div>
          <div className="w-20 h-10">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={sparklineResolution}>
                <Line type="monotone" dataKey="val" stroke="#f43f5e" strokeWidth={1.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 2: AreaChart and PieChart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: AreaChart */}
        <div className="rounded-xl bg-white/5 p-6 backdrop-blur border border-white/10">
          <h3 className="text-sm font-semibold text-slate-200 mb-4 uppercase tracking-wider">
            Shipment Volume (Last 7 Days)
          </h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={volumeData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorShipments" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#22d3ee" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorAlerts" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="day" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#0f172a", borderColor: "#22d3ee", color: "#f1f5f9" }}
                  itemStyle={{ fontSize: "12px" }}
                  labelStyle={{ fontWeight: "bold", fontSize: "12px", marginBottom: "4px" }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: "11px", paddingTop: "10px" }} />
                <Area
                  type="monotone"
                  dataKey="shipments"
                  stroke="#22d3ee"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorShipments)"
                  name="Shipments"
                />
                <Area
                  type="monotone"
                  dataKey="alerts"
                  stroke="#f43f5e"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorAlerts)"
                  name="Alerts"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right: PieChart */}
        <div className="rounded-xl bg-white/5 p-6 backdrop-blur border border-white/10">
          <h3 className="text-sm font-semibold text-slate-200 mb-4 uppercase tracking-wider">
            Shipment Status Distribution
          </h3>
          <div className="h-[300px] flex flex-col justify-between">
            <div className="flex-1">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="45%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={STATUS_COLORS[index % STATUS_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomPieTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            {/* Custom Legend */}
            <div className="flex justify-center gap-4 text-xs pt-2">
              {statusData.map((item, index) => (
                <div key={item.name} className="flex items-center gap-1.5">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: STATUS_COLORS[index] }}
                  />
                  <span className="text-slate-400">{item.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Row 3: Full Width Temperature Monitoring */}
      <div className="rounded-xl bg-white/5 p-6 backdrop-blur border border-white/10">
        <h3 className="text-sm font-semibold text-slate-200 mb-4 uppercase tracking-wider">
          Temperature Monitoring (24h)
        </h3>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={tempData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="tempGlow" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="hour" stroke="#94a3b8" fontSize={11} tickLine={false} />
              <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} unit="°C" domain={[0, 11]} />
              <Tooltip
                contentStyle={{ backgroundColor: "#0f172a", borderColor: "#22d3ee", color: "#f1f5f9" }}
                itemStyle={{ fontSize: "12px" }}
                labelStyle={{ fontWeight: "bold", fontSize: "12px", marginBottom: "4px" }}
              />
              {/* Threshold line */}
              <ReferenceLine
                y={8}
                stroke="#f43f5e"
                strokeDasharray="4 4"
                label={{ value: "SLA Threshold (8°C)", fill: "#f43f5e", position: "top", fontSize: 10 }}
              />
              {/* Background fill for whole temp */}
              <Area
                type="monotone"
                dataKey="temp"
                stroke="#38bdf8"
                strokeWidth={2}
                fill="url(#tempGlow)"
                name="Temperature"
              />
              {/* Critical area overlay (red fill when temp > 8) */}
              <Area
                type="monotone"
                dataKey="tempAbove"
                baseValue={8}
                stroke="none"
                fill="#f43f5e"
                fillOpacity={0.35}
                name="SLA Violation Area"
                legendType="none"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Row 4: Route Volume and Radar Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: BarChart with Line overlay */}
        <div className="rounded-xl bg-white/5 p-6 backdrop-blur border border-white/10">
          <h3 className="text-sm font-semibold text-slate-200 mb-4 uppercase tracking-wider">
            Top 5 Routes by Volume
          </h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={routeData} margin={{ top: 10, right: -10, left: -20, bottom: 0 }}>
                <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="route" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis yAxisId="left" stroke="#94a3b8" fontSize={11} tickLine={false} label={{ value: "Volume", angle: -90, position: "insideLeft", fill: "#94a3b8", fontSize: 10 }} />
                <YAxis yAxisId="right" orientation="right" stroke="#94a3b8" fontSize={11} tickLine={false} label={{ value: "Risk Score", angle: 90, position: "insideRight", fill: "#94a3b8", fontSize: 10 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#0f172a", borderColor: "#22d3ee", color: "#f1f5f9" }}
                  itemStyle={{ fontSize: "12px" }}
                  labelStyle={{ fontWeight: "bold", fontSize: "12px", marginBottom: "4px" }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: "11px", paddingTop: "10px" }} />
                <Bar yAxisId="left" dataKey="volume" fill="#22d3ee" radius={[4, 4, 0, 0]} name="Volume" barSize={30} />
                <Line yAxisId="right" type="monotone" dataKey="risk" stroke="#f43f5e" strokeWidth={2} name="Risk Score" dot={{ r: 4 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right: RadarChart */}
        <div className="rounded-xl bg-white/5 p-6 backdrop-blur border border-white/10">
          <h3 className="text-sm font-semibold text-slate-200 mb-4 uppercase tracking-wider">
            Fleet Health Score
          </h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                <PolarGrid stroke="rgba(255,255,255,0.08)" />
                <PolarAngleAxis dataKey="metric" stroke="#94a3b8" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#0f172a", borderColor: "#22d3ee", color: "#f1f5f9" }}
                  itemStyle={{ fontSize: "12px" }}
                />
                <Radar
                  name="Health Score"
                  dataKey="score"
                  stroke="#22d3ee"
                  fill="#22d3ee"
                  fillOpacity={0.25}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
