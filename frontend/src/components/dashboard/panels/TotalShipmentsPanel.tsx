"use client"

import { ApiShipment } from "@/app/dashboard/DashboardContext"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"

interface TotalShipmentsPanelProps {
  shipments: ApiShipment[]
  onViewAll?: () => void
}

export default function TotalShipmentsPanel({ shipments, onViewAll }: TotalShipmentsPanelProps) {
  const pendingCount = shipments.filter(s => s.status === "PENDING").length
  const inTransitCount = shipments.filter(s => s.status === "IN_TRANSIT").length
  const alertCount = shipments.filter(s => s.status === "ALERT").length
  const deliveredCount = shipments.filter(s => s.status === "DELIVERED").length

  const chartData = [
    { name: "Pending", value: pendingCount, color: "#64748b" },
    { name: "In Transit", value: inTransitCount, color: "#0ea5e9" },
    { name: "Alert", value: alertCount, color: "#ef4444" },
    { name: "Delivered", value: deliveredCount, color: "#10b981" },
  ]

  // Get last 10 shipments
  const last10 = [...shipments]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 10)

  const STATUS_BADGE: Record<string, string> = {
    PENDING: "bg-slate-500/10 text-slate-400 border border-slate-500/20",
    IN_TRANSIT: "bg-sky-500/10 text-sky-400 border border-sky-500/20",
    ALERT: "bg-red-500/10 text-red-400 border border-red-500/20 animate-pulse",
    DELIVERED: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
  }

  return (
    <div className="flex flex-col gap-6 text-xs text-slate-300">
      {/* Donut Chart */}
      <div className="bg-[#0a0e1a]/60 border border-white/5 rounded-lg p-4">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-4">
          Status Breakdown
        </h3>
        <div className="h-44 w-full flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={75}
                paddingAngle={3}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ background: "#0f1629", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "6px" }}
                itemStyle={{ color: "#f1f5f9" }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Legend Grid */}
        <div className="grid grid-cols-2 gap-2 mt-4 text-[10px]">
          {chartData.map((item, idx) => (
            <div key={idx} className="flex justify-between items-center p-2 bg-[#0f1629] rounded border border-white/5">
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="font-semibold text-slate-400">{item.name}</span>
              </div>
              <span className="font-mono font-bold text-slate-200">{item.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Last 10 Shipments List */}
      <div className="bg-[#0a0e1a]/60 border border-white/5 rounded-lg p-4">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
          Latest Transmissions
        </h3>
        <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
          {last10.map((s) => (
            <div key={s.id} className="flex justify-between items-center py-2 border-b border-white/5 last:border-0">
              <div className="min-w-0">
                <span className="font-mono font-bold text-sky-400 block">{s.reference}</span>
                <span className="text-[10px] text-slate-400 block truncate mt-0.5">
                  {s.origin} &rarr; {s.destination}
                </span>
              </div>
              <span className={`px-2 py-0.5 rounded text-[8px] font-bold tracking-wider uppercase font-mono ${STATUS_BADGE[s.status]}`}>
                {s.status}
              </span>
            </div>
          ))}
          {last10.length === 0 && (
            <p className="text-center text-slate-500 py-6">No shipments recorded.</p>
          )}
        </div>
      </div>

      {/* View All Button */}
      {onViewAll && (
        <button
          onClick={onViewAll}
          className="w-full py-2.5 rounded bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/30 hover:border-sky-500/50 text-sky-400 font-bold transition-all text-center tracking-wide uppercase cursor-pointer"
        >
          View All Shipments Log
        </button>
      )}
    </div>
  )
}
