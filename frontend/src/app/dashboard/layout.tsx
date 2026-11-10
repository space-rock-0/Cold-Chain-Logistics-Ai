"use client";

import { ReactNode, useState, useEffect, Suspense } from "react";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { DashboardProvider, useDashboard } from "./DashboardContext";
import CursorTrail from "@/components/effects/CursorTrail";
import KeyboardShortcuts from "@/components/effects/KeyboardShortcuts";
import CinematicIntro from "@/components/effects/CinematicIntro";
import ReportGenerator from "@/components/effects/ReportGenerator";
import TemperatureAlertsPanel from "@/components/dashboard/panels/TemperatureAlertsPanel";
import VoiceCommands from "@/components/effects/VoiceCommands";

const SIDEBAR_ITEMS = [
  { label: "Dashboard", desc: "Overview & KPIs", icon: "🏠", route: "/dashboard" },
  { label: "Map View", desc: "Global Network", icon: "🗺️", route: "/dashboard/map" },
  { label: "ML Insights", desc: "AI Predictions", icon: "🤖", route: "/dashboard/ml" },
  { label: "Analytics", desc: "Performance Data", icon: "📊", route: "/dashboard/analytics" },
  { label: "Blockchain", desc: "Ledger Verification", icon: "⛓️", route: "/dashboard/blockchain" },
  { label: "Settings", desc: "Configuration", icon: "⚙️", route: "/dashboard/settings" },
] as const;

type SidebarNavItem = typeof SIDEBAR_ITEMS[number]["label"];

const NAV_ROUTES: Record<SidebarNavItem, string> = {
  "Dashboard": "/dashboard",
  "Map View": "/dashboard/map",
  "ML Insights": "/dashboard/ml",
  "Analytics": "/dashboard/analytics",
  "Blockchain": "/dashboard/blockchain",
  "Settings": "/dashboard/settings",
};

function DashboardLayoutContent({ children }: { children: ReactNode }) {
  const {
    user,
    stats,
    shipments,
    apiError,
    warRoom,
    setWarRoom,
    liveClock,
    refreshCountdown,
    explosions,
    addExplosion,
    removeExplosion,
    triggerRefresh,
    voiceActive,
    setVoiceActive,
    voiceState,
    setVoiceState,
    wsConnected,
    wsLastUpdate,
    setActivePanel,
  } = useDashboard();

  const pathname = usePathname();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const getActiveNav = (): SidebarNavItem => {
    if (pathname === "/dashboard") return "Dashboard";
    if (pathname.startsWith("/dashboard/map")) return "Map View";
    if (pathname.startsWith("/dashboard/ml")) return "ML Insights";
    if (pathname.startsWith("/dashboard/analytics")) return "Analytics";
    if (pathname.startsWith("/dashboard/blockchain")) return "Blockchain";
    if (pathname.startsWith("/dashboard/settings")) return "Settings";
    return "Dashboard";
  };

  const activeNav = getActiveNav();
  const alertPct = stats.alerts / Math.max(stats.total, 1);

  const getBreadcrumbs = () => {
    const section = pathname.split("/").filter(Boolean);
    if (section.length <= 1) return "LOGISTICS CONTROL / DASHBOARD";
    const sub = section[1].replace("-", " ").toUpperCase();
    return `LOGISTICS CONTROL / ${sub}`;
  };

  if (!mounted) {
    return <div className="min-h-screen bg-[#0a0e1a]" />;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8, ease: "easeInOut" }}
      className="min-h-screen bg-[#0a0e1a] text-slate-100 flex w-full custom-crosshair hud-flicker"
    >
      {/* Fixed Scanline Overlay */}
      <div 
        className="fixed inset-0 pointer-events-none z-[1000] opacity-[0.02]"
        style={{
          background: "linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(14, 165, 233, 0.2) 50%)",
          backgroundSize: "100% 4px",
        }}
      />
      
      {/* CRT Vignette Overlay */}
      <div 
        className="fixed inset-0 pointer-events-none z-[999] opacity-[0.8]"
        style={{
          background: "radial-gradient(circle, transparent 50%, rgba(5, 7, 15, 0.95) 100%)",
        }}
      />

      {/* Screen Glowing Effects */}
      <div
        className="pointer-events-none fixed inset-0 transition-all duration-[3000ms]"
        style={{
          background:
            alertPct > 0.3
              ? "radial-gradient(ellipse at 20% 50%, rgba(239,68,68,0.06) 0%, transparent 60%)"
              : alertPct > 0.1
              ? "radial-gradient(ellipse at 20% 50%, rgba(245,158,11,0.04) 0%, transparent 60%)"
              : "radial-gradient(ellipse at 20% 50%, rgba(14,165,233,0.03) 0%, transparent 60%)",
        }}
      />

      <CursorTrail />
      <KeyboardShortcuts
        onNavigate={(action) => {
          if (action === "Refresh") {
            triggerRefresh();
          } else {
            const route = NAV_ROUTES[action as SidebarNavItem];
            if (route) {
              router.push(route);
            }
          }
        }}
        onCloseAll={() => {
          setWarRoom(false);
          if (document.fullscreenElement) {
            document.exitFullscreen?.().catch(() => {});
          }
        }}
      />

      {/* Main Layout Grid */}
      <div className="flex flex-1 min-h-screen relative">
        {/* ── Sidebar (260px) ── */}
        <aside
          className={`fixed top-0 bottom-0 left-0 z-30 flex w-[260px] flex-col border-r border-[#0ea5e9]/15 bg-[#0f1629] p-4 backdrop-blur-xl transition-all duration-300 ${
            warRoom ? "-translate-x-full hidden" : "translate-x-0"
          }`}
        >
          <div className="absolute -left-20 top-20 h-60 w-60 rounded-full bg-sky-500/5 blur-3xl pointer-events-none" />

          {/* Secure connection status */}
          <div className="flex items-center gap-1.5 mb-3 select-none">
            <span className="h-1 w-1 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-mono text-[8px] text-emerald-400 tracking-[0.15em] font-semibold uppercase">
              CONTROL NODE SECURED
            </span>
          </div>

          {/* Circular Gauge Fleet Health Score */}
          <div className="mb-5 flex items-center gap-3 bg-[#0a0e1a]/60 border border-[#0ea5e9]/15 rounded-lg p-2.5">
            <div className="relative h-12 w-12 flex-shrink-0">
              <svg width="48" height="48" viewBox="0 0 36 36">
                <circle
                  cx="18"
                  cy="18"
                  r="15.915"
                  fill="none"
                  stroke="rgba(148, 163, 184, 0.1)"
                  strokeWidth="3.5"
                />
                <circle
                  cx="18"
                  cy="18"
                  r="15.915"
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="3.5"
                  strokeDasharray="87 100"
                  strokeDashoffset="25"
                  strokeLinecap="round"
                  className="transition-all duration-1000"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="font-mono text-xs font-bold text-[#f1f5f9]">87%</span>
              </div>
            </div>
            <div className="min-w-0">
              <div className="text-[9px] font-bold text-slate-400 tracking-wider uppercase">FLEET HEALTH</div>
              <div className="text-[10px] text-[#10b981] font-bold font-mono">NOMINAL OPERATIONAL</div>
            </div>
          </div>

          {/* Nav */}
          <nav className="space-y-1">
            {SIDEBAR_ITEMS.map((item) => {
              const isActive = activeNav === item.label;
              return (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => router.push(item.route)}
                  className={`group w-full rounded px-2.5 py-1.5 text-left transition-all duration-300 flex items-start gap-2.5 border border-transparent relative overflow-hidden ${
                    isActive
                      ? "bg-[#0ea5e9]/10 text-white border-l-2 border-l-[#0ea5e9] shadow-[inset_3px_0_8px_rgba(14,165,233,0.1)]"
                      : "text-slate-400 hover:bg-[#0ea5e9]/5 hover:text-white hover:border-l-2 hover:border-l-[#0ea5e9]/50"
                  }`}
                >
                  <span className="text-sm mt-0.5">{item.icon}</span>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-semibold tracking-wide">{item.label}</div>
                    <div className="text-[9px] text-slate-500 group-hover:text-slate-400 transition-colors font-medium">
                      {item.desc}
                    </div>
                  </div>
                  <span className={`text-[8px] font-mono text-[#0ea5e9] self-center transition-opacity ${isActive ? "opacity-100" : "opacity-0 group-hover:opacity-40"}`}>
                    &gt;
                  </span>
                </button>
              );
            })}
          </nav>

          {/* Middle Section: Quick Stats (Compact) */}
          <div className="my-5 space-y-1.5">
            <div className="text-[8px] font-bold text-slate-500 tracking-widest uppercase mb-1">FLEET COUNTERS</div>
            {[
              { label: "Total", value: stats.total, color: "border-l-[3px] border-l-[#0ea5e9]" },
              { label: "Pending", value: stats.pending, color: "border-l-[3px] border-l-slate-400" },
              { label: "In Transit", value: stats.inTransit, color: "border-l-[3px] border-l-sky-500" },
              { label: "Alerts", value: stats.alerts, color: "border-l-[3px] border-l-[#ef4444]" },
              { label: "Delivered", value: stats.delivered, color: "border-l-[3px] border-l-[#10b981]" },
            ].map((item) => (
              <div
                key={item.label}
                className={`flex justify-between items-center bg-[#0a0e1a]/60 px-2 py-1.5 rounded-r border border-[#0ea5e9]/10 ${item.color}`}
              >
                <span className="text-[10px] text-slate-400">{item.label}</span>
                <span className="font-mono text-xs font-bold text-slate-200">{item.value}</span>
              </div>
            ))}
          </div>

          {/* Bottom Section */}
          <div className="mt-auto space-y-3.5 pt-3 border-t border-[#0ea5e9]/10">
            {/* Temperature Threshold Indicator */}
            <div className="bg-[#0a0e1a]/80 border border-[#0ea5e9]/15 rounded p-2.5 space-y-2">
              <div className="text-[8px] font-bold text-slate-400 tracking-wider">COLD CHAIN THRESHOLD</div>
              <div className="flex justify-between text-[9px] font-mono font-bold text-sky-400">
                <span>2.0°C</span>
                <span className="text-slate-500 text-[8px]">TARGET COMPLIANCE</span>
                <span>8.0°C</span>
              </div>
              <div className="relative h-1.5 w-full bg-slate-800/80 rounded-full overflow-hidden border border-slate-700/50">
                <div className="absolute left-[20%] right-[20%] h-full bg-[#10b981]/25" />
                <div className="absolute left-[48%] top-0 bottom-0 w-0.5 bg-[#0ea5e9] shadow-[0_0_4px_#0ea5e9]" />
              </div>
            </div>

            {/* ML Engine status */}
            <div className="space-y-1">
              <div className="text-[8px] font-bold text-slate-500 tracking-wider uppercase">AI Core Models</div>
              <div className="flex flex-wrap gap-1">
                <span className="text-[8px] font-mono font-bold px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20">
                  Groq
                </span>
                <span className="text-[8px] font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  GPT-OSS
                </span>
                <span className="text-[8px] font-mono font-bold px-1.5 py-0.5 rounded bg-orange-500/10 text-orange-400 border border-orange-500/20">
                  LangChain
                </span>
              </div>
            </div>

            {/* User Info + Sign Out */}
            <div className="flex items-center justify-between gap-2 bg-[#0a0e1a]/50 p-2 rounded border border-[#0ea5e9]/10">
              <div className="flex items-center gap-2 min-w-0">
                <div className="h-7 w-7 rounded-full bg-[#0ea5e9]/10 border border-[#0ea5e9]/20 text-[#0ea5e9] flex items-center justify-center font-bold font-mono text-xs">
                  {user ? user.name.substring(0, 2).toUpperCase() : "AD"}
                </div>
                <div className="min-w-0">
                  <div className="text-[10px] font-bold text-slate-200 truncate leading-none">{user?.name ?? "Admin User"}</div>
                  <div className="text-[8px] text-slate-500 truncate mt-0.5">{user?.email ?? "admin@coldchain.com"}</div>
                </div>
              </div>
              <button
                onClick={async () => {
                  await fetch("/api/auth/logout", { method: "POST" });
                  router.push("/login");
                }}
                className="text-slate-400 hover:text-[#ef4444] transition-colors p-1"
                title="Sign Out"
              >
                <span className="text-xs">🚪</span>
              </button>
            </div>
          </div>
        </aside>

        {/* ── Main Content Wrapper ── */}
        <section
          className={`flex min-w-0 flex-1 flex-col transition-all duration-300 ${
            warRoom ? "ml-0" : "ml-[260px]"
          }`}
        >
          {/* Warnings Banner */}
          {apiError && (
            <div className="flex items-center justify-between gap-3 bg-red-500/10 border-b border-red-500/20 px-6 py-1.5 z-50">
              <div className="flex items-center gap-2">
                <span className="text-red-400 text-xs">⚠</span>
                <span className="text-[10px] text-red-400 font-mono uppercase tracking-wider">
                  OFFLINE METRIC DATALINK: USING LOCAL DEVIATION CACHE
                </span>
              </div>
            </div>
          )}

          {/* Header (64px) */}
          <header className="h-16 flex items-center justify-between border-b border-[#0ea5e9]/15 bg-gradient-to-r from-[#0a0e1a] via-[#0f1629] to-[#0a0e1a] px-6 relative z-10 select-none">
            {/* Left: Logo Area */}
            <div className="flex items-center gap-2">
              <span className="text-lg text-sky-400 animate-pulse">❄️</span>
              <div className="flex flex-col">
                <span className="font-bold text-sm tracking-widest text-[#f1f5f9] leading-none">COLD CHAIN AI</span>
                <span className="font-bold text-[9px] text-[#0ea5e9] tracking-[0.12em] mt-0.5">v2.0 ENTERPRISE</span>
              </div>
            </div>

            {/* Center: Breadcrumbs */}
            <div className="hidden md:block">
              <div className="text-[10px] font-mono font-semibold text-[#0ea5e9] tracking-widest bg-[#0ea5e9]/5 border border-[#0ea5e9]/10 rounded px-3 py-1">
                {getBreadcrumbs()}
              </div>
            </div>

            {/* Right: Actions and Status */}
            <div className="flex items-center gap-3">
              {/* Temperature Alert Count Indicator */}
              <div className="flex items-center gap-1.5 bg-[#ef4444]/10 border border-[#ef4444]/20 rounded px-2.5 py-1 text-[#ef4444]">
                <span className="text-xs">⚠️</span>
                <span className="font-mono text-[10px] font-bold">{stats.alerts} EXCURSIONS</span>
              </div>

              {/* Live clock */}
              <div className="hidden sm:block font-mono text-xs text-slate-300 bg-[#0a0e1a]/80 border border-[#0ea5e9]/10 px-2.5 py-1 rounded">
                {liveClock}
              </div>

              {/* Refresh countdown */}
              <div className="hidden lg:block text-[10px] font-mono text-slate-400">
                REFRESH:{" "}
                <span className={`font-bold ${refreshCountdown < 10 ? "text-[#ef4444] animate-pulse" : "text-sky-400"}`}>
                  {refreshCountdown}S
                </span>
              </div>

              {/* WebSocket Status Badge */}
              {wsConnected ? (
                <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[10px] font-mono text-emerald-400">LIVE // WS</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  <span className="text-[10px] font-mono text-amber-400">POLLING</span>
                </div>
              )}

              {pathname === "/dashboard" && (
                <button
                  onClick={() => {
                    setWarRoom(!warRoom);
                    if (!warRoom) {
                      document.documentElement.requestFullscreen?.().catch(() => {});
                    } else {
                      if (document.fullscreenElement) {
                        document.exitFullscreen?.().catch(() => {});
                      }
                    }
                  }}
                  className={`px-2.5 py-1 rounded text-[10px] font-bold transition-all duration-300 cursor-pointer ${
                    warRoom
                      ? "bg-[#ef4444]/20 border border-[#ef4444] text-[#ef4444] animate-pulse"
                      : "bg-[#0ea5e9]/10 border border-[#0ea5e9]/30 text-sky-400 hover:border-[#ef4444] hover:text-[#ef4444]"
                  }`}
                >
                  {warRoom ? "🚨 WAR ROOM ACTIVE" : "🎯 WAR ROOM"}
                </button>
              )}

              {/* Voice Command mic toggle */}
              <VoiceCommands 
                onOpenPanel={(panel) => setActivePanel(panel)}
                onWarRoom={() => setWarRoom(!warRoom)}
                dashboardData={{
                  totalShipments: stats?.total || 85,
                  alerts: stats?.alerts || 31,
                  pending: stats?.pending || 20,
                  inTransit: stats?.inTransit || 14,
                  delivered: stats?.delivered || 20,
                }}
              />

              {/* PDF report export */}
              <ReportGenerator shipments={shipments} stats={stats} />

              {/* User Avatar */}
              <div className="h-7 w-7 rounded-full bg-slate-700 border border-slate-600 flex items-center justify-center text-slate-100 font-bold font-mono text-xs select-none">
                {user ? user.name.charAt(0).toUpperCase() : "A"}
              </div>
            </div>
          </header>

          {/* Render Page Contents */}
          <div className="flex-1 flex overflow-hidden">
            <div className="flex-1 overflow-auto bg-[#0a0e1a]/20">
              <Suspense fallback={<div className="p-8 font-mono text-xs text-sky-400 animate-pulse">ESTABLISHING DATA-STREAM SYNC...</div>}>
                {children}
              </Suspense>
            </div>
            {warRoom && (
              <aside className="w-[400px] flex-shrink-0 border-l border-[#ef4444]/20 bg-[#0f1629] p-5 overflow-y-auto hidden md:flex flex-col z-20">
                <div className="flex justify-between items-center border-b border-white/5 pb-3 mb-4 flex-shrink-0">
                  <div>
                    <h2 className="text-xs font-bold text-red-500 uppercase tracking-widest flex items-center gap-1.5">
                      <span className="animate-pulse h-2 w-2 rounded-full bg-red-500" />
                      CRITICAL ALERTS
                    </h2>
                    <p className="text-[10px] text-slate-400 mt-0.5">War Room Incident Command</p>
                  </div>
                </div>
                <TemperatureAlertsPanel shipments={shipments} />
              </aside>
            )}
          </div>
        </section>
      </div>
    </motion.div>
  );
}

export default function DashboardLayout({ 
  children 
}: { 
  children: React.ReactNode 
}) {
  const [showIntro, setShowIntro] = useState(false)
  const [introComplete, setIntroComplete] = useState(false)

  useEffect(() => {
    setShowIntro(true)
  }, [])

  if (showIntro && !introComplete) {
    return (
      <CinematicIntro onComplete={() => {
        setIntroComplete(true)
        setShowIntro(false)
      }} />
    )
  }

  return (
    <DashboardProvider>
      <DashboardLayoutContent>{children}</DashboardLayoutContent>
    </DashboardProvider>
  );
}
