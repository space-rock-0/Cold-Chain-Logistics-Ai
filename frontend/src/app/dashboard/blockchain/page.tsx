"use client";

export default function BlockchainPage() {
  return (
    <div className="p-8">
      <div className="rounded-xl bg-white/5 p-6 backdrop-blur border border-white/10 max-w-2xl shadow-2xl">
        <h3 className="text-lg font-semibold text-slate-100 mb-2">Cryptographic Ledger Ledger</h3>
        <p className="text-sm text-slate-400 mb-4">
          Integrity verification logs and immutable blockchain hashes are audited automatically. 
          Smart contracts ensure full custody audit logs for temperature compliance.
        </p>
        <div className="space-y-3 font-mono text-xs">
          <div className="bg-black/40 border border-white/5 rounded-lg p-3 flex justify-between items-center text-slate-300">
            <span>TX Hash: 0x9f4a...e122</span>
            <span className="text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
              VERIFIED
            </span>
          </div>
          <div className="bg-black/40 border border-white/5 rounded-lg p-3 flex justify-between items-center text-slate-300">
            <span>TX Hash: 0x3d02...a5c3</span>
            <span className="text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
              VERIFIED
            </span>
          </div>
          <div className="bg-black/40 border border-white/5 rounded-lg p-3 flex justify-between items-center text-slate-300">
            <span>TX Hash: 0xe84a...29b8</span>
            <span className="text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
              VERIFIED
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
