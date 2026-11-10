"use client";

export default function SettingsPage() {
  return (
    <div className="p-8">
      <div className="rounded-xl bg-white/5 p-6 backdrop-blur border border-white/10 max-w-2xl shadow-2xl">
        <h3 className="text-lg font-semibold text-slate-100 mb-2">System Preferences</h3>
        <p className="text-sm text-slate-400 mb-4">
          Adjust cold chain alert thresholds, configure API keys, and manage machine learning endpoint mappings.
        </p>
        <div className="space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-white/5">
            <span className="text-sm text-slate-300">Compliance Limit (Max Temp)</span>
            <span className="text-sm text-cyan-400 font-semibold font-mono">8.0 °C</span>
          </div>
          <div className="flex justify-between items-center pb-2 border-b border-white/5">
            <span className="text-sm text-slate-300">API Sync Interval</span>
            <span className="text-sm text-cyan-400 font-semibold font-mono">30 seconds</span>
          </div>
          <div className="flex justify-between items-center pb-2 border-b border-white/5">
            <span className="text-sm text-slate-300">ML Backend Endpoint</span>
            <span className="text-xs text-cyan-400 font-mono">http://localhost:5000</span>
          </div>
        </div>
      </div>
    </div>
  );
}
