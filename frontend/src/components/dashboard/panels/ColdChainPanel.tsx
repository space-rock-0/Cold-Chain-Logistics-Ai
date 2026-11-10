"use client"

import { ApiShipment } from "@/app/dashboard/DashboardContext"

interface ColdChainPanelProps {
  shipments: ApiShipment[]
}

export default function ColdChainPanel({ shipments }: ColdChainPanelProps) {
  const total = shipments.length || 1
  
  // Safe (2-8°C)
  const safeCount = shipments.filter(s => s.temperature >= 2.0 && s.temperature <= 8.0).length
  // Warning (8-15°C)
  const warningCount = shipments.filter(s => s.temperature > 8.0 && s.temperature <= 15.0).length
  // Critical (>15°C)
  const criticalCount = shipments.filter(s => s.temperature > 15.0).length
  // Too Cold (<2°C)
  const tooColdCount = shipments.filter(s => s.temperature < 2.0).length

  // Compliance % is safeCount / total
  const compliancePct = ((safeCount / total) * 100).toFixed(1)

  // Top 5 most critical temp excursions
  const top5Excursions = [...shipments]
    .filter(s => s.status === "ALERT")
    .sort((a, b) => b.temperature - a.temperature)
    .slice(0, 5)

  // SVG Gauge constants
  const radius = 50
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (parseFloat(compliancePct) / 100) * circumference

  return (
    <div className="flex flex-col gap-6 text-xs text-slate-300">
      {/* Big Circular Compliance Gauge */}
      <div className="bg-[#0a0e1a]/60 border border-white/5 rounded-lg p-5 flex flex-col items-center">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 self-start mb-4">
          Compliance Gauge
        </h3>
        
        <div className="relative h-32 w-32 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
            {/* Background circle */}
            <circle
              cx="60"
              cy="60"
              r={radius}
              fill="none"
              stroke="rgba(255,255,255,0.05)"
              strokeWidth="10"
            />
            {/* Foreground circle */}
            <circle
              cx="60"
              cy="60"
              r={radius}
              fill="none"
              stroke="#10b981"
              strokeWidth="10"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-1000"
            />
          </svg>
          {/* Centered label */}
          <div className="absolute flex flex-col items-center justify-center">
            <span className="font-mono text-2xl font-bold text-slate-100">{compliancePct}%</span>
            <span className="text-[9px] text-slate-500 uppercase font-semibold mt-0.5">Compliant</span>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-1.5 text-[10px] text-slate-500 uppercase font-bold tracking-widest bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
          SLA Target: 95% compliance
        </div>
      </div>

      {/* Temperature Distribution Bars */}
      <div className="bg-[#0a0e1a]/60 border border-white/5 rounded-lg p-4 space-y-4">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          Temperature Distribution
        </h3>
        
        <div className="space-y-3">
          {/* Safe */}
          <div>
            <div className="flex justify-between text-[10px] font-semibold text-slate-400 mb-1">
              <span>Safe (2 - 8°C)</span>
              <span className="font-mono text-slate-200">{safeCount} ({((safeCount/total)*100).toFixed(0)}%)</span>
            </div>
            <div className="h-2 w-full bg-slate-800/80 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500" style={{ width: `${(safeCount/total)*100}%` }} />
            </div>
          </div>

          {/* Warning */}
          <div>
            <div className="flex justify-between text-[10px] font-semibold text-slate-400 mb-1">
              <span>Warning (8 - 15°C)</span>
              <span className="font-mono text-slate-200">{warningCount} ({((warningCount/total)*100).toFixed(0)}%)</span>
            </div>
            <div className="h-2 w-full bg-slate-800/80 rounded-full overflow-hidden">
              <div className="h-full bg-amber-500" style={{ width: `${(warningCount/total)*100}%` }} />
            </div>
          </div>

          {/* Critical */}
          <div>
            <div className="flex justify-between text-[10px] font-semibold text-slate-400 mb-1">
              <span>Critical (&gt; 15°C)</span>
              <span className="font-mono text-slate-200">{criticalCount} ({((criticalCount/total)*100).toFixed(0)}%)</span>
            </div>
            <div className="h-2 w-full bg-slate-800/80 rounded-full overflow-hidden">
              <div className="h-full bg-red-500" style={{ width: `${(criticalCount/total)*100}%` }} />
            </div>
          </div>

          {/* Too Cold */}
          <div>
            <div className="flex justify-between text-[10px] font-semibold text-slate-400 mb-1">
              <span>Too Cold (&lt; 2°C)</span>
              <span className="font-mono text-slate-200">{tooColdCount} ({((tooColdCount/total)*100).toFixed(0)}%)</span>
            </div>
            <div className="h-2 w-full bg-slate-800/80 rounded-full overflow-hidden">
              <div className="h-full bg-sky-500" style={{ width: `${(tooColdCount/total)*100}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* Top 5 Critical Excursions */}
      <div className="bg-[#0a0e1a]/60 border border-white/5 rounded-lg p-4">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
          Top Critical Excursions
        </h3>
        <div className="space-y-2">
          {top5Excursions.map((s) => (
            <div key={s.id} className="bg-red-500/[0.02] border border-red-500/10 p-2.5 rounded flex justify-between items-center">
              <div>
                <span className="font-mono font-bold text-red-400 block">{s.reference}</span>
                <span className="text-[10px] text-slate-400 truncate max-w-[200px] block mt-0.5">
                  {s.origin} &rarr; {s.destination}
                </span>
              </div>
              <div className="text-right">
                <span className="font-mono font-bold text-red-400 text-xs">{s.temperature.toFixed(1)}°C ↑</span>
                <span className="text-[9px] text-slate-500 block mt-0.5">Risk: {s.riskScore ?? 80}%</span>
              </div>
            </div>
          ))}
          {top5Excursions.length === 0 && (
            <p className="text-center text-slate-500 py-6">No active excursions detected.</p>
          )}
        </div>
      </div>
    </div>
  )
}
