"use client"

import { ApiShipment } from "@/app/dashboard/DashboardContext"

interface AIRiskPanelProps {
  shipments: ApiShipment[]
}

export default function AIRiskPanel({ shipments }: AIRiskPanelProps) {
  // Sort by risk score (use riskScore, or default to some calculated score based on spoilage risk)
  const top5Risk = [...shipments]
    .sort((a, b) => {
      const rA = a.riskScore ?? (a.mlSpoilageRisk ? Math.floor(a.mlSpoilageRisk * 100) : 15)
      const rB = b.riskScore ?? (b.mlSpoilageRisk ? Math.floor(b.mlSpoilageRisk * 100) : 15)
      return rB - rA
    })
    .slice(0, 5)

  const getRiskColor = (score: number) => {
    if (score >= 70) return "bg-red-500"
    if (score >= 35) return "bg-amber-500"
    return "bg-emerald-500"
  }

  const getRiskBadge = (score: number) => {
    if (score >= 70) return "bg-red-500/10 text-red-400 border border-red-500/20"
    if (score >= 35) return "bg-amber-500/10 text-amber-400 border border-amber-500/20"
    return "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
  }

  const lastUpdatedTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })

  return (
    <div className="flex flex-col gap-6 text-xs text-slate-300">
      {/* Overall Risk Score */}
      <div className="bg-[#0a0e1a]/60 border border-white/5 rounded-lg p-4 flex flex-col items-center">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 self-start mb-4">
          Overall Risk Index
        </h3>
        
        <div className="relative h-28 w-full flex flex-col items-center justify-center bg-black/30 rounded border border-white/5 py-4">
          <span className="font-mono text-4xl font-black text-amber-500">73<span className="text-lg font-normal text-slate-500">/100</span></span>
          <span className="text-[9px] text-amber-500 font-bold uppercase tracking-widest mt-1">MODERATE RISK TELEMETRY</span>
        </div>

        <div className="w-full flex justify-between items-center mt-3 text-[10px] text-slate-500 font-mono">
          <span>ML ENGINE ACCURACY: 87.3%</span>
          <span>SYNC: {lastUpdatedTime}</span>
        </div>
      </div>

      {/* Risk Breakdown by Category */}
      <div className="bg-[#0a0e1a]/60 border border-white/5 rounded-lg p-4 space-y-4">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          Risk Factors Breakdown
        </h3>
        
        <div className="space-y-3">
          {/* Temperature Risk */}
          <div>
            <div className="flex justify-between text-[10px] font-semibold text-slate-400 mb-1">
              <span>Temperature Excursion Risk</span>
              <span className="font-mono text-red-400 font-bold">85/100</span>
            </div>
            <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-red-500" style={{ width: "85%" }} />
            </div>
          </div>

          {/* Route Risk */}
          <div>
            <div className="flex justify-between text-[10px] font-semibold text-slate-400 mb-1">
              <span>Route Deviation Risk</span>
              <span className="font-mono text-amber-400 font-bold">45/100</span>
            </div>
            <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-amber-500" style={{ width: "45%" }} />
            </div>
          </div>

          {/* Customs Risk */}
          <div>
            <div className="flex justify-between text-[10px] font-semibold text-slate-400 mb-1">
              <span>Customs Delay Risk</span>
              <span className="font-mono text-emerald-400 font-bold">38/100</span>
            </div>
            <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500" style={{ width: "38%" }} />
            </div>
          </div>

          {/* Carrier Risk */}
          <div>
            <div className="flex justify-between text-[10px] font-semibold text-slate-400 mb-1">
              <span>Carrier Handling Risk</span>
              <span className="font-mono text-amber-400 font-bold">52/100</span>
            </div>
            <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-amber-500" style={{ width: "52%" }} />
            </div>
          </div>

          {/* Weather Risk */}
          <div>
            <div className="flex justify-between text-[10px] font-semibold text-slate-400 mb-1">
              <span>Severe Weather Risk</span>
              <span className="font-mono text-emerald-400 font-bold">29/100</span>
            </div>
            <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500" style={{ width: "29%" }} />
            </div>
          </div>
        </div>
      </div>

      {/* Top 5 Highest Risk Shipments */}
      <div className="bg-[#0a0e1a]/60 border border-white/5 rounded-lg p-4">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
          Highest Risk Shipments
        </h3>
        <div className="space-y-2">
          {top5Risk.map((s) => {
            const score = s.riskScore ?? (s.mlSpoilageRisk ? Math.floor(s.mlSpoilageRisk * 100) : 15)
            return (
              <div key={s.id} className="bg-[#0f1629] border border-white/5 p-2.5 rounded flex justify-between items-center">
                <div>
                  <span className="font-mono font-bold text-sky-400 block">{s.reference}</span>
                  <span className="text-[10px] text-slate-400 mt-0.5 block truncate max-w-[200px]">
                    {s.origin} &rarr; {s.destination}
                  </span>
                </div>
                <span className={`px-2 py-0.5 rounded text-[9px] font-bold tracking-wider font-mono ${getRiskBadge(score)}`}>
                  {score}%
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
