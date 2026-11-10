"use client"

import { useState } from "react"
import { ApiShipment } from "@/app/dashboard/DashboardContext"

interface TemperatureAlertsPanelProps {
  shipments: ApiShipment[]
}

type SortKey = "temperature" | "riskScore" | "reference"

export default function TemperatureAlertsPanel({ shipments }: TemperatureAlertsPanelProps) {
  const [sortBy, setSortBy] = useState<SortKey>("temperature")
  const [resolvedIds, setResolvedIds] = useState<Set<string>>(new Set())

  // Get alert shipments (excluding resolved ones in UI state)
  const alerts = shipments.filter(s => s.status === "ALERT" && !resolvedIds.has(s.id))

  // Calculate Stats
  const temps = alerts.map(s => s.temperature)
  const avgTemp = temps.length > 0 ? (temps.reduce((a, b) => a + b, 0) / temps.length).toFixed(1) : "0.0"
  const maxTemp = temps.length > 0 ? Math.max(...temps).toFixed(1) : "0.0"

  // Sort Alerts
  const sortedAlerts = [...alerts].sort((a, b) => {
    if (sortBy === "temperature") {
      return b.temperature - a.temperature
    } else if (sortBy === "riskScore") {
      const rA = a.riskScore ?? 80
      const rB = b.riskScore ?? 80
      return rB - rA
    } else {
      return a.reference.localeCompare(b.reference)
    }
  })

  const handleResolve = (id: string) => {
    setResolvedIds(prev => {
      const next = new Set(prev)
      next.add(id)
      return next
    })
  }

  const getRiskBadge = (score: number | null) => {
    const val = score ?? 80
    if (val >= 70) return "bg-red-500/10 text-red-400 border border-red-500/20"
    if (val >= 35) return "bg-amber-500/10 text-amber-400 border border-amber-500/20"
    return "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
  }

  return (
    <div className="flex flex-col gap-6 text-xs text-slate-300">
      {/* Excursion Stats Block */}
      <div className="grid grid-cols-3 gap-2 bg-[#0a0e1a]/60 border border-white/5 rounded-lg p-3 text-center">
        <div>
          <span className="text-[9px] text-slate-500 uppercase block font-semibold">Avg Excursion</span>
          <span className="font-mono text-base font-bold text-red-400 mt-1 block">{avgTemp}°C</span>
        </div>
        <div className="border-x border-white/5">
          <span className="text-[9px] text-slate-500 uppercase block font-semibold">Max Temp</span>
          <span className="font-mono text-base font-bold text-red-400 mt-1 block">{maxTemp}°C</span>
        </div>
        <div>
          <span className="text-[9px] text-slate-500 uppercase block font-semibold">First Alert</span>
          <span className="font-mono text-[11px] font-bold text-amber-400 mt-2.5 block">18m ago</span>
        </div>
      </div>

      {/* Sorting Control */}
      <div className="flex justify-between items-center bg-[#0a0e1a]/40 border border-white/5 px-3 py-2 rounded-lg">
        <span className="text-slate-400 font-semibold text-[10px] uppercase">Sort Alerts</span>
        <div className="flex gap-1">
          {(["temperature", "riskScore", "reference"] as SortKey[]).map((key) => (
            <button
              key={key}
              onClick={() => setSortBy(key)}
              className={`text-[9px] font-bold px-2 py-1 border rounded uppercase transition-all cursor-pointer ${
                sortBy === key
                  ? "bg-red-500/15 text-red-400 border-red-500/40"
                  : "bg-transparent text-slate-400 border-white/5 hover:text-slate-200"
              }`}
            >
              {key === "riskScore" ? "Risk" : key === "reference" ? "Ref" : "Temp"}
            </button>
          ))}
        </div>
      </div>

      {/* Alerts List */}
      <div className="flex flex-col gap-3">
        {sortedAlerts.map((s) => (
          <div
            key={s.id}
            className="bg-red-500/[0.02] border border-red-500/10 p-3 rounded-lg flex flex-col gap-2 relative overflow-hidden"
          >
            <div className="flex justify-between items-start">
              <div>
                <span className="font-mono font-bold text-red-500 text-xs block">{s.reference}</span>
                <span className="text-[10px] text-slate-400 mt-0.5 block">
                  {s.origin} &rarr; {s.destination}
                </span>
              </div>
              <span className="font-mono font-bold text-red-400 text-sm flex items-center gap-0.5">
                {s.temperature.toFixed(1)}°C ↑
              </span>
            </div>

            <div className="text-[10px] text-slate-300 italic border-l border-red-500/30 pl-2 py-0.5">
              {s.alertReason || "Cold chain breached"}
            </div>

            <div className="flex justify-between items-center mt-1 pt-2 border-t border-white/5">
              <span className={`px-2 py-0.5 rounded text-[8px] font-bold tracking-wider uppercase font-mono ${getRiskBadge(s.riskScore)}`}>
                Risk: {s.riskScore ?? 80}%
              </span>
              <button
                onClick={() => handleResolve(s.id)}
                className="bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 hover:border-red-500/50 text-red-400 text-[9px] font-bold px-2.5 py-1 rounded transition-colors cursor-pointer uppercase"
              >
                Resolve Alert
              </button>
            </div>
          </div>
        ))}
        {sortedAlerts.length === 0 && (
          <div className="text-center py-16 text-slate-500 border border-dashed border-white/5 rounded-lg font-mono">
            ALL ALERTS RESOLVED
          </div>
        )}
      </div>
    </div>
  )
}
