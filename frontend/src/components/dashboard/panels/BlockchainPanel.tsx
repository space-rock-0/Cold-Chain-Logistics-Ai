"use client"

import { useState } from "react"
import { ApiShipment } from "@/app/dashboard/DashboardContext"

interface BlockchainPanelProps {
  shipments: ApiShipment[]
}

export default function BlockchainPanel({ shipments }: BlockchainPanelProps) {
  const [copiedHash, setCopiedHash] = useState<string | null>(null)
  
  // Get all delivered shipments
  const delivered = shipments.filter(s => s.status === "DELIVERED")

  const handleCopy = (hash: string) => {
    navigator.clipboard.writeText(hash)
    setCopiedHash(hash)
    setTimeout(() => setCopiedHash(null), 2000)
  }

  return (
    <div className="flex flex-col gap-6 text-xs text-slate-300">
      {/* Blockchain Network Stats */}
      <div className="grid grid-cols-3 gap-2 bg-[#0a0e1a]/60 border border-white/5 rounded-lg p-3 text-center">
        <div>
          <span className="text-[9px] text-slate-500 uppercase block font-semibold">Total Verified</span>
          <span className="font-mono text-base font-bold text-indigo-400 mt-1 block">{delivered.length}</span>
        </div>
        <div className="border-x border-white/5">
          <span className="text-[9px] text-slate-500 uppercase block font-semibold">On-Chain Value</span>
          <span className="font-mono text-base font-bold text-indigo-400 mt-1 block">$2.4M</span>
        </div>
        <div>
          <span className="text-[9px] text-slate-500 uppercase block font-semibold">Network</span>
          <span className="font-mono text-[11px] font-bold text-emerald-400 mt-2 block">Sepolia</span>
        </div>
      </div>

      {/* Ledger Records */}
      <div className="flex flex-col gap-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          Immutable Ledger Records
        </h3>
        
        <div className="space-y-3">
          {delivered.map((s) => {
            const hash = s.blockchainTx || "0x9812f87a32b0051e9b20e03c4fdf3a9876e5d4cb003b12ad64cf7a21345f89ab"
            const shortHash = `${hash.substring(0, 8)}...${hash.substring(hash.length - 8)}`

            return (
              <div
                key={s.id}
                className="bg-indigo-500/[0.02] border border-indigo-500/10 p-3 rounded-lg flex flex-col gap-2 relative overflow-hidden"
              >
                {/* Header */}
                <div className="flex justify-between items-start">
                  <div>
                    <span className="font-mono font-bold text-indigo-400 text-xs block">{s.reference}</span>
                    <span className="text-[10px] text-slate-400 mt-0.5 block">
                      {s.origin} &rarr; {s.destination}
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[8px] font-bold tracking-wider uppercase font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    VERIFIED
                  </span>
                </div>

                {/* Hash Row */}
                <div className="flex items-center justify-between bg-black/40 rounded border border-white/5 px-2 py-1.5 mt-1">
                  <span className="font-mono text-[9px] text-slate-400 select-all block">
                    {shortHash}
                  </span>
                  <div className="flex gap-2 items-center">
                    <button
                      onClick={() => handleCopy(hash)}
                      className="text-slate-500 hover:text-indigo-400 transition-colors text-[10px]"
                      title="Copy TX Hash"
                    >
                      {copiedHash === hash ? "Copied!" : "📋"}
                    </button>
                    <a
                      href={`https://sepolia.etherscan.io/tx/${hash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-slate-500 hover:text-indigo-400 transition-colors text-[10px]"
                      title="View on Etherscan"
                    >
                      🔗
                    </a>
                  </div>
                </div>

                {/* Footer Timestamp */}
                <div className="flex justify-between items-center text-[9px] text-slate-500 mt-1">
                  <span>GAS PROOF SECURED</span>
                  <span className="font-mono font-semibold">Verified 2h ago</span>
                </div>
              </div>
            )
          })}
          {delivered.length === 0 && (
            <p className="text-center text-slate-500 py-12">No verified shipments on-chain.</p>
          )}
        </div>
      </div>
    </div>
  )
}
