"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import { useDashboard, ApiShipment } from "./DashboardContext";
import DetailPanel from "@/components/dashboard/DetailPanel";
import ShipmentPDFButton from "@/components/dashboard/ShipmentPDF";
import TotalShipmentsPanel from "@/components/dashboard/panels/TotalShipmentsPanel";
import ColdChainPanel from "@/components/dashboard/panels/ColdChainPanel";
import TemperatureAlertsPanel from "@/components/dashboard/panels/TemperatureAlertsPanel";
import BlockchainPanel from "@/components/dashboard/panels/BlockchainPanel";
import AIRiskPanel from "@/components/dashboard/panels/AIRiskPanel";

const ShipmentGlobe = dynamic(
  () => import("@/components/three/ShipmentGlobe"),
  { 
    ssr: false, 
    loading: () => (
      <div className="h-full flex items-center justify-center bg-[#0a0e1a]/60">
        <p className="text-sky-400 text-xs p-4 animate-pulse uppercase tracking-wider">
          Initializing Tactical Globe...
        </p>
      </div>
    )
  }
);

type MainTab = "Overview" | "Shipments";

const STATUS_BADGE: Record<"PENDING" | "IN_TRANSIT" | "ALERT" | "DELIVERED", string> = {
  IN_TRANSIT: "bg-sky-500/10 text-sky-400 border border-sky-500/20",
  PENDING: "bg-slate-500/10 text-slate-400 border border-slate-500/20",
  ALERT: "bg-red-500/10 text-red-400 border border-red-500/30 animate-pulse",
  DELIVERED: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
};

const STATUS_LABEL: Record<"PENDING" | "IN_TRANSIT" | "ALERT" | "DELIVERED", string> = {
  IN_TRANSIT: "In Transit",
  PENDING: "Pending",
  ALERT: "Alert",
  DELIVERED: "Delivered",
};

function GlitchNumber({ value }: { value: number | string }) {
  const [displayValue, setDisplayValue] = useState<number | string>(0);

  useEffect(() => {
    if (typeof value === "string") {
      setDisplayValue(value);
      return;
    }
    let count = 0;
    const interval = setInterval(() => {
      setDisplayValue(Math.floor(Math.random() * 100));
      count++;
      if (count > 10) {
        clearInterval(interval);
        setDisplayValue(value);
      }
    }, 70);

    return () => clearInterval(interval);
  }, [value]);

  return <span className="font-mono">{displayValue}</span>;
}

export default function DashboardPage() {
  const [selectedMainTab, setSelectedMainTab] = useState<MainTab>("Overview");
  const [activePanel, setActivePanel] = useState<string|null>(null);
  const {
    stats,
    shipments,
    loading,
    warRoom,
    setWarRoom,
    addExplosion,
    wsLiveMessage,
    triggerRefresh,
  } = useDashboard();

  const [shipmentFilter, setShipmentFilter] = useState<string>("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const [selectedShipment, setSelectedShipment] = useState<ApiShipment | null>(null);
  const [wsToast, setWsToast] = useState<string | null>(null);

  // CRUD States
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingShipment, setEditingShipment] = useState<ApiShipment | null>(null);
  const [deletingShipment, setDeletingShipment] = useState<ApiShipment | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const HUB_NAMES = [
    "Port of Singapore",
    "Rotterdam Gateway",
    "FedEx Memphis",
    "Dubai World Central",
    "Shanghai Yangshan",
    "Los Angeles",
    "Frankfurt Airport",
    "Tokyo Narita",
    "New York JFK",
    "London Heathrow",
    "Mumbai JNPT",
    "Sydney Airport",
    "Amsterdam Schiphol",
    "Hong Kong Cargo",
    "Istanbul Airport"
  ];

  const [addFormVal, setAddFormVal] = useState({
    origin: 'Port of Singapore',
    destination: 'Rotterdam Gateway',
    status: 'PENDING',
    temperature: 4.0,
    humidity: 65.0,
    eta: '3d',
    progress: 0,
  });

  const [editFormVal, setEditFormVal] = useState({
    origin: '',
    destination: '',
    status: '',
    temperature: 4.0,
    humidity: 65.0,
    eta: '',
    progress: 0,
  });

  useEffect(() => {
    if (editingShipment) {
      setEditFormVal({
        origin: editingShipment.origin,
        destination: editingShipment.destination,
        status: editingShipment.status,
        temperature: editingShipment.temperature,
        humidity: editingShipment.humidity ?? 65.0,
        eta: editingShipment.eta,
        progress: editingShipment.progress,
      });
    }
  }, [editingShipment]);

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/shipments/create/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...addFormVal,
          location: addFormVal.origin,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Shipment ${data.reference} created successfully!`, 'success');
        setShowAddForm(false);
        triggerRefresh();
        setAddFormVal({
          origin: 'Port of Singapore',
          destination: 'Rotterdam Gateway',
          status: 'PENDING',
          temperature: 4.0,
          humidity: 65.0,
          eta: '3d',
          progress: 0,
        });
      } else {
        showToast(data.error || 'Failed to create shipment', 'error');
      }
    } catch (err) {
      showToast('Error creating shipment', 'error');
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingShipment) return;
    try {
      const res = await fetch(`/api/shipments/${editingShipment.id}/edit/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editFormVal),
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Shipment ${data.reference} updated successfully!`, 'success');
        setEditingShipment(null);
        triggerRefresh();
      } else {
        showToast(data.error || 'Failed to update shipment', 'error');
      }
    } catch (err) {
      showToast('Error updating shipment', 'error');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingShipment) return;
    try {
      const res = await fetch(`/api/shipments/${deletingShipment.id}/delete/`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Shipment ${data.deleted} deleted successfully!`, 'success');
        setDeletingShipment(null);
        triggerRefresh();
      } else {
        showToast(data.error || 'Failed to delete shipment', 'error');
      }
    } catch (err) {
      showToast('Error deleting shipment', 'error');
    }
  };

  useEffect(() => {
    if (wsLiveMessage) {
      setWsToast(wsLiveMessage);
      const timer = setTimeout(() => setWsToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [wsLiveMessage]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSelectedShipment(null);
        setShowAddForm(false);
        setEditingShipment(null);
        setDeletingShipment(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Filters for Shipments Table
  const filteredTableShipments = shipments.filter((s) => {
    const matchesStatus = shipmentFilter === "ALL" || s.status === shipmentFilter;
    const matchesSearch = 
      s.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.origin.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.destination.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // Pagination Math
  const totalPages = Math.ceil(filteredTableShipments.length / itemsPerPage);
  const paginatedShipments = filteredTableShipments.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleExportCSV = () => {
    const headers = ["Reference", "Status", "Origin", "Destination", "Temperature", "Humidity", "Progress", "Risk Score", "ETA", "Blockchain TX", "ML Spoilage Risk"];
    const rows = shipments.map((s) => [
      s.reference,
      s.status,
      s.origin,
      s.destination,
      s.temperature,
      s.humidity,
      s.progress,
      s.riskScore ?? s.mlSpoilageRisk ?? "N/A",
      s.eta,
      s.blockchainTx ?? "N/A",
      s.mlSpoilageRisk ?? "N/A"
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(","), ...rows.map(e => e.map(val => `"${val}"`).join(","))].join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `cold_chain_shipments_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Dynamic values
  const activeExcursions = shipments.filter(s => s.status === "ALERT");
  const compliantCount = shipments.filter(s => (s.status === "PENDING" || s.status === "IN_TRANSIT") && s.temperature >= 2 && s.temperature <= 8).length || 65;
  const compliantPct = stats.total > 0 ? ((compliantCount / stats.total) * 100).toFixed(1) : "76.5";

  // Recent activity logs
  const activityLogs = [
    { type: "DELIVERED", ref: "LOG-100085", text: "delivered to Zurich", time: "2m ago" },
    { type: "ALERT", ref: "LOG-100046", text: "temp excursion 32.2°C", time: "5m ago" },
    { type: "VERIFIED", ref: "TX-VERIFIED", text: "Blockchain ledger state synced", time: "8m ago" },
    { type: "IN_TRANSIT", ref: "LOG-100021", text: "departed Rotterdam Gateway", time: "12m ago" },
    { type: "ALERT", ref: "LOG-100053", text: "cold chain breach alert", time: "18m ago" },
    { type: "PENDING", ref: "LOG-100002", text: "queued for custom compliance", time: "25m ago" },
    { type: "DELIVERED", ref: "LOG-100067", text: "delivered to Delhi Hub", time: "32m ago" },
    { type: "IN_TRANSIT", ref: "LOG-100030", text: "transit en route to Chicago", time: "45m ago" }
  ];

  return (
    <div className="flex-1 p-6 space-y-6 relative min-h-full bg-[#0a0e1a]/20">
      
      {/* Background logo hologram watermarks */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden z-0 opacity-[0.015] select-none">
        <span className="font-sans font-black text-[12vw] tracking-[0.5em] uppercase">
          SECURED
        </span>
      </div>

      {/* Tabs */}
      <div className="flex items-center justify-between border-b border-[#0ea5e9]/15 pb-2 relative z-10">
        <div className="flex gap-2">
          {(["Overview", "Shipments"] as MainTab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setSelectedMainTab(tab);
                setShipmentFilter("ALL");
              }}
              className={`text-xs uppercase font-bold tracking-wider px-4 py-2 border transition-all duration-300 rounded ${
                selectedMainTab === tab
                  ? "bg-[#0ea5e9]/15 text-[#0ea5e9] border-[#0ea5e9] shadow-[0_0_10px_rgba(14,165,233,0.15)]"
                  : "bg-[#0f1629] text-slate-400 border-[#0ea5e9]/10 hover:text-[#0ea5e9] hover:border-[#0ea5e9]/30"
              }`}
            >
              {tab === "Overview" ? "📊 COMMAND DASHBOARD" : "📦 SHIPMENTS LOGISTICS"}
            </button>
          ))}
        </div>

        {selectedMainTab === "Shipments" && (
          <button
            onClick={handleExportCSV}
            className="bg-[#0ea5e9]/10 border border-[#0ea5e9]/30 hover:bg-[#0ea5e9]/20 hover:border-[#0ea5e9]/50 text-sky-400 text-xs font-bold px-3 py-1.5 rounded transition-all cursor-pointer"
          >
            📥 EXPORT CSV
          </button>
        )}
      </div>

      {/* OVERVIEW TAB CONTENT */}
      {selectedMainTab === "Overview" && (
        <div className="space-y-6 relative z-10">
          
          {/* ROW 1: Bloomberg style cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            
            {/* Card 1: Total Shipments */}
            <div 
              onClick={() => setActivePanel('total')}
              className="bg-[#0f1629] border-l-[4px] border-l-[#0ea5e9] border border-[#0ea5e9]/15 rounded p-4 flex flex-col justify-between shadow-card hover:shadow-card-hover hover:border-sky-500/40 transition-all duration-300 cursor-pointer"
            >
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Shipments</p>
                <h3 className="text-3xl font-bold font-mono text-slate-100 mt-1">
                  <GlitchNumber value={stats.total} />
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">Active in network</p>
              </div>
              <div className="mt-4">
                <svg className="w-full h-8 text-[#0ea5e9]/35" viewBox="0 0 100 30">
                  <path d="M0,25 Q15,5 30,20 T60,10 T90,22 T100,5" fill="none" stroke="currentColor" strokeWidth="1.5" />
                </svg>
              </div>
            </div>

            {/* Card 2: Compliant */}
            <div 
              onClick={() => setActivePanel('coldchain')}
              className="bg-[#0f1629] border-l-[4px] border-l-[#10b981] border border-[#0ea5e9]/15 rounded p-4 flex flex-col justify-between shadow-card hover:shadow-card-hover hover:border-sky-500/40 transition-all duration-300 cursor-pointer"
            >
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Cold Chain Compliant</p>
                <h3 className="text-3xl font-bold font-mono text-[#10b981] mt-1">
                  <GlitchNumber value={compliantCount} />
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">Within 2°C - 8°C</p>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-[10px] font-bold bg-[#10b981]/15 text-[#10b981] px-1.5 py-0.5 rounded font-mono">
                  {compliantPct}% COMPLIANT
                </span>
                <svg className="w-24 h-8 text-[#10b981]/35" viewBox="0 0 100 30">
                  <path d="M0,15 Q20,25 40,15 T70,5 T90,12 T100,8" fill="none" stroke="currentColor" strokeWidth="1.5" />
                </svg>
              </div>
            </div>

            {/* Card 3: Alerts */}
            <div 
              onClick={() => setActivePanel('temperature')}
              className="bg-[#0f1629] border-l-[4px] border-l-[#ef4444] border border-[#0ea5e9]/15 rounded p-4 flex flex-col justify-between shadow-card hover:shadow-card-hover hover:border-sky-500/40 shadow-[0_0_8px_rgba(239,68,68,0.05)] transition-all duration-300 cursor-pointer"
            >
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Temperature Alerts</p>
                <h3 className="text-3xl font-bold font-mono text-[#ef4444] mt-1">
                  <GlitchNumber value={stats.alerts} />
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">Excursions detected</p>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-[9px] font-bold bg-[#ef4444]/15 border border-[#ef4444]/30 text-[#ef4444] px-1.5 py-0.5 rounded animate-pulse">
                  REQUIRES ATTENTION
                </span>
                <svg className="w-20 h-8 text-[#ef4444]/35" viewBox="0 0 100 30">
                  <path d="M0,5 Q10,28 30,12 T60,25 T90,8 T100,20" fill="none" stroke="currentColor" strokeWidth="1.5" />
                </svg>
              </div>
            </div>

            {/* Card 4: Blockchain Proof */}
            <div 
              onClick={() => setActivePanel('blockchain')}
              className="bg-[#0f1629] border-l-[4px] border-l-indigo-500 border border-[#0ea5e9]/15 rounded p-4 flex flex-col justify-between shadow-card hover:shadow-card-hover hover:border-sky-500/40 transition-all duration-300 cursor-pointer"
            >
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Blockchain Verified</p>
                <h3 className="text-3xl font-bold font-mono text-indigo-400 mt-1">
                  <GlitchNumber value={stats.delivered} />
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">On-chain proof of delivery</p>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-[9px] font-bold bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 px-1.5 py-0.5 rounded">
                  SEPOLIA TESTNET
                </span>
                <svg className="w-20 h-8 text-indigo-400/35" viewBox="0 0 100 30">
                  <path d="M0,20 Q15,10 30,25 T60,8 T90,18 T100,12" fill="none" stroke="currentColor" strokeWidth="1.5" />
                </svg>
              </div>
            </div>

            {/* Card 5: AI Fleet Risk */}
            <div 
              onClick={() => setActivePanel('risk')}
              className="bg-[#0f1629] border-l-[4px] border-l-[#f59e0b] border border-[#0ea5e9]/15 rounded p-4 flex flex-col justify-between shadow-card hover:shadow-card-hover hover:border-sky-500/40 transition-all duration-300 cursor-pointer"
            >
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">AI Risk Index</p>
                <h3 className="text-3xl font-bold font-mono text-[#f59e0b] mt-1">
                  <span className="font-mono">73</span><span className="text-sm font-sans text-slate-400">/100</span>
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">Fleet risk index</p>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-[9px] font-bold bg-[#f59e0b]/10 border border-[#f59e0b]/30 text-[#f59e0b] px-1.5 py-0.5 rounded">
                  MODERATE RISK
                </span>
                <svg className="w-20 h-8 text-[#f59e0b]/35" viewBox="0 0 100 30">
                  <path d="M0,15 Q25,25 50,8 T80,22 T100,10" fill="none" stroke="currentColor" strokeWidth="1.5" />
                </svg>
              </div>
            </div>

          </div>

          {/* ROW 2: Globe + Excursions Feed */}
          <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
            
            {/* Globe Panel (60%) */}
            <div className="lg:col-span-6 bg-[#0f1629] border border-[#0ea5e9]/15 rounded-lg p-5 flex flex-col relative overflow-hidden">
              <div className="flex flex-col">
                <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">GLOBAL SHIPMENT NETWORK</h4>
                <p className="text-[10px] text-slate-400 mt-0.5">Real-time tracking across 15 logistics hubs</p>
              </div>
              
              <div className="h-80 border border-[#0ea5e9]/10 bg-[#0a0e1a]/60 rounded mt-4 overflow-hidden relative">
                <ShipmentGlobe />
              </div>

              <div className="flex justify-around items-center border-t border-[#0ea5e9]/10 pt-3 mt-4 text-center font-mono">
                <div>
                  <div className="text-xs font-bold text-slate-200">15</div>
                  <div className="text-[8px] text-slate-500 uppercase tracking-wider mt-0.5">Active Hubs</div>
                </div>
                <div className="h-6 w-[1px] bg-[#0ea5e9]/10" />
                <div>
                  <div className="text-xs font-bold text-slate-200">6</div>
                  <div className="text-[8px] text-slate-500 uppercase tracking-wider mt-0.5">Continents</div>
                </div>
                <div className="h-6 w-[1px] bg-[#0ea5e9]/10" />
                <div>
                  <div className="text-xs font-bold text-slate-200">85</div>
                  <div className="text-[8px] text-slate-500 uppercase tracking-wider mt-0.5">Shipments</div>
                </div>
              </div>
            </div>

            {/* Temperature Excursions Feed (40%) */}
            <div className="lg:col-span-4 bg-[#0f1629] border border-[#0ea5e9]/15 rounded-lg p-5 flex flex-col justify-between">
              <div>
                <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">⚠️ TEMPERATURE EXCURSIONS</h4>
                <p className="text-[10px] text-slate-400 mt-0.5">Live cold chain monitoring</p>
                
                <div className="space-y-2 mt-4 max-h-[330px] overflow-auto pr-1">
                  {activeExcursions.slice(0, 5).map((s) => (
                    <div 
                      key={s.id} 
                      onClick={() => setSelectedShipment(s)}
                      className="bg-red-500/[0.03] hover:bg-red-500/[0.07] border border-red-500/20 hover:border-red-500/50 p-2.5 rounded transition-all duration-300 cursor-pointer flex justify-between items-start gap-2"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-red-400">{s.reference}</span>
                          <span className="text-[8px] font-bold bg-[#ef4444]/15 text-[#ef4444] px-1 rounded">CRITICAL</span>
                        </div>
                        <div className="text-[10px] text-slate-300 mt-1 truncate">
                          {s.origin} &rarr; {s.destination}
                        </div>
                        <p className="text-[9px] text-slate-500 mt-1.5 italic line-clamp-1">
                          {s.alertReason || "Cold chain breached"}
                        </p>
                      </div>
                      <div className="text-right font-mono flex-shrink-0">
                        <span className="text-red-400 font-bold text-xs flex items-center justify-end gap-0.5">
                          {s.temperature.toFixed(1)}°C ↑
                        </span>
                        <span className="text-[8px] text-slate-500 block mt-1">{s.humidity.toFixed(0)}% RH</span>
                      </div>
                    </div>
                  ))}
                  {activeExcursions.length === 0 && (
                    <div className="text-center py-16 text-slate-500 text-xs font-mono">
                      NO DEVIATION ALERTS DETECTED.
                    </div>
                  )}
                </div>
              </div>
            </div>

          </div>

          {/* ROW 3: Activity Feed + Compliance Chart + ML Engine Output */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            
            {/* Left: Activity Feed */}
            <div className="bg-[#0f1629] border border-[#0ea5e9]/15 rounded-lg p-5">
              <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-3">ACTIVITY LOG</h4>
              <div className="space-y-2 max-h-[260px] overflow-auto pr-1">
                {activityLogs.map((evt, idx) => {
                  let dotColor = "text-[#0ea5e9]";
                  if (evt.type === "ALERT") dotColor = "text-[#ef4444]";
                  if (evt.type === "DELIVERED") dotColor = "text-[#10b981]";
                  if (evt.type === "VERIFIED") dotColor = "text-indigo-400";
                  
                  return (
                    <div key={idx} className="flex justify-between items-center text-[11px] border-b border-[#0ea5e9]/5 pb-1.5">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className={`${dotColor} text-[8px] select-none`}>●</span>
                        <span className="font-mono text-[10px] text-sky-400 font-bold flex-shrink-0">{evt.ref}</span>
                        <span className="text-slate-300 truncate">{evt.text}</span>
                      </div>
                      <span className="font-mono text-[9px] text-slate-500 flex-shrink-0 ml-2">{evt.time}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Middle: Compliance Chart */}
            <div className="bg-[#0f1629] border border-[#0ea5e9]/15 rounded-lg p-5 flex flex-col justify-between">
              <div>
                <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-2">TEMPERATURE COMPLIANCE</h4>
                <p className="text-[10px] text-slate-400 mb-4">Core fleet storage integrity status</p>
                
                {/* Horizontal Compliance Stacked Bar */}
                <div className="space-y-4 my-2">
                  <div className="h-4 w-full bg-slate-800/80 rounded-full overflow-hidden flex p-[1px] border border-slate-700/50">
                    <div style={{ width: "76.5%" }} className="h-full bg-gradient-to-r from-emerald-600 to-[#10b981] rounded-l-full" title="Compliant: 65" />
                    <div style={{ width: "9.4%" }} className="h-full bg-gradient-to-r from-amber-600 to-[#f59e0b]" title="Warning: 8" />
                    <div style={{ width: "14.1%" }} className="h-full bg-gradient-to-r from-red-600 to-[#ef4444] rounded-r-full" title="Critical: 12" />
                  </div>
                  
                  {/* Legend Grid */}
                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[#0ea5e9]/5">
                    <div className="flex flex-col items-center p-1 bg-[#0a0e1a]/60 border border-[#0ea5e9]/5 rounded">
                      <div className="flex items-center gap-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-[#10b981]" />
                        <span className="text-[9px] font-bold text-[#10b981]">COMPLIANT</span>
                      </div>
                      <span className="font-mono text-xs font-bold text-slate-200 mt-1">65</span>
                    </div>
                    
                    <div className="flex flex-col items-center p-1 bg-[#0a0e1a]/60 border border-[#0ea5e9]/5 rounded">
                      <div className="flex items-center gap-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-[#f59e0b]" />
                        <span className="text-[9px] font-bold text-[#f59e0b]">WARNING</span>
                      </div>
                      <span className="font-mono text-xs font-bold text-slate-200 mt-1">8</span>
                    </div>

                    <div className="flex flex-col items-center p-1 bg-[#0a0e1a]/60 border border-[#0ea5e9]/5 rounded">
                      <div className="flex items-center gap-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-[#ef4444]" />
                        <span className="text-[9px] font-bold text-[#ef4444]">CRITICAL</span>
                      </div>
                      <span className="font-mono text-xs font-bold text-slate-200 mt-1">12</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: ML Engine Summary */}
            <div className="bg-[#0f1629] border border-[#0ea5e9]/15 rounded-lg p-5 flex flex-col justify-between">
              <div>
                <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-2">ML ENGINE OUTPUT</h4>
                <p className="text-[10px] text-slate-400 mb-4">Artificial Intelligence telemetry inference</p>
                
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between items-center bg-[#0a0e1a]/60 p-2 border border-[#0ea5e9]/5 rounded">
                    <span className="text-slate-400">Spoilage Risk</span>
                    <span className="text-[10px] font-bold bg-[#ef4444]/15 border border-[#ef4444]/30 text-[#ef4444] px-2 py-0.5 rounded">
                      HIGH for 12 shipments
                    </span>
                  </div>
                  <div className="flex justify-between items-center bg-[#0a0e1a]/60 p-2 border border-[#0ea5e9]/5 rounded">
                    <span className="text-slate-400">ETA Accuracy Index</span>
                    <span className="text-[10px] font-bold bg-[#0ea5e9]/15 border border-[#0ea5e9]/30 text-sky-400 px-2 py-0.5 rounded font-mono">
                      87.3%
                    </span>
                  </div>
                  <div className="flex justify-between items-center bg-[#0a0e1a]/60 p-2 border border-[#0ea5e9]/5 rounded">
                    <span className="text-slate-400">Anomalies Detected</span>
                    <span className="text-[10px] font-bold bg-[#f59e0b]/15 border border-[#f59e0b]/30 text-[#f59e0b] px-2 py-0.5 rounded font-mono">
                      7 ACTIVE
                    </span>
                  </div>
                  <div className="flex justify-between items-center bg-[#0a0e1a]/60 p-2 border border-[#0ea5e9]/5 rounded">
                    <span className="text-slate-400">Optimized Routing Keys</span>
                    <span className="text-[10px] font-bold bg-[#10b981]/15 border border-[#10b981]/30 text-[#10b981] px-2 py-0.5 rounded font-mono">
                      5 SECURED
                    </span>
                  </div>
                  <div className="flex justify-between items-center bg-[#0a0e1a]/60 p-2 border border-[#0ea5e9]/5 rounded font-mono">
                    <span className="text-slate-400 font-sans">Demand Forecast</span>
                    <span className="text-[10px] font-bold text-[#10b981]">
                      &uarr; 15% NEXT WEEK
                    </span>
                  </div>
                </div>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* SHIPMENTS TAB CONTENT (Data table) */}
      {selectedMainTab === "Shipments" && (
        <div className="bg-[#0f1629] border border-[#0ea5e9]/15 rounded-lg p-5 space-y-4 relative z-10">
          
          {/* Controls: Search + Filter Pills */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#0ea5e9]/10 pb-4">
            
            {/* Search Input */}
            <div className="relative w-full md:w-80">
              <input
                type="text"
                placeholder="Search reference, origin, destination..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full bg-[#0a0e1a] border border-[#0ea5e9]/20 hover:border-[#0ea5e9]/40 focus:border-[#0ea5e9] text-xs px-3.5 py-2.5 rounded text-slate-200 placeholder-slate-500 focus:outline-none transition-colors"
              />
              <span className="absolute right-3.5 top-2.5 text-slate-500 text-sm">🔍</span>
            </div>

            {/* Filter Pills & Add Shipment Button */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex flex-wrap gap-1.5">
                {["ALL", "PENDING", "IN_TRANSIT", "ALERT", "DELIVERED"].map((f) => (
                  <button
                    key={f}
                    onClick={() => {
                      setShipmentFilter(f);
                      setCurrentPage(1);
                    }}
                    className={`text-[10px] font-bold px-3 py-1.5 border rounded transition-all ${
                      shipmentFilter === f
                        ? "bg-[#0ea5e9]/15 text-sky-400 border-[#0ea5e9]/50 shadow-[0_0_6px_rgba(14,165,233,0.1)]"
                        : "bg-[#0a0e1a]/60 text-slate-400 border-[#0ea5e9]/10 hover:text-sky-400 hover:border-[#0ea5e9]/30"
                    }`}
                  >
                    {f.replace("_", " ")}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setShowAddForm(true)}
                className="bg-sky-500/10 border border-sky-500/30 hover:bg-sky-500/20 text-sky-400 text-[10px] font-bold px-3.5 py-1.5 rounded transition-all cursor-pointer font-mono"
              >
                ➕ Add Shipment
              </button>
            </div>

          </div>

          {/* Table container */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#0ea5e9]/10 text-slate-400 font-bold uppercase tracking-wider bg-[#0a0e1a]/30">
                  <th className="py-3 px-4">REFERENCE</th>
                  <th className="py-3 px-4">STATUS</th>
                  <th className="py-3 px-4">ROUTE</th>
                  <th className="py-3 px-4 text-center">TEMPERATURE</th>
                  <th className="py-3 px-4">PROGRESS</th>
                  <th className="py-3 px-4 text-center">RISK</th>
                  <th className="py-3 px-4">ETA</th>
                  <th className="py-3 px-4 text-right">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#0ea5e9]/5">
                {paginatedShipments.map((s) => {
                  // Temperature colors
                  let tempClass = "text-[#10b981]";
                  let tempBadge = "";
                  if (s.temperature > 8.0) {
                    tempClass = "text-[#ef4444] font-bold";
                    tempBadge = "bg-[#ef4444]/15 px-1.5 py-0.5 rounded border border-[#ef4444]/20";
                  } else if (s.temperature < 2.0) {
                    tempClass = "text-sky-400 font-bold";
                    tempBadge = "bg-sky-500/10 px-1.5 py-0.5 rounded border border-sky-500/20";
                  }

                  // Risk color
                  let riskLabel = "Low";
                  let riskBadge = "bg-[#10b981]/15 text-[#10b981] border border-[#10b981]/20";
                  const riskScore = s.riskScore ?? (s.mlSpoilageRisk ? Math.floor(s.mlSpoilageRisk * 100) : 15);
                  if (riskScore >= 70) {
                    riskLabel = "High";
                    riskBadge = "bg-[#ef4444]/15 text-[#ef4444] border border-[#ef4444]/20";
                  } else if (riskScore >= 35) {
                    riskLabel = "Medium";
                    riskBadge = "bg-[#f59e0b]/10 text-[#f59e0b] border border-[#f59e0b]/20";
                  }

                  return (
                    <tr 
                      key={s.id} 
                      onClick={() => setSelectedShipment(s)}
                      style={{ cursor: "pointer" }}
                      className="hover:bg-white/5 transition-all duration-200 group"
                    >
                      {/* Reference */}
                      <td className="py-3 px-4 font-mono font-bold text-sky-400 select-all">
                        <div className="flex items-center gap-1.5">
                          <span>{s.reference}</span>
                          <span className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] select-none">
                            📋
                          </span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${STATUS_BADGE[s.status]}`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${
                            s.status === "ALERT" ? "bg-red-400 animate-ping" : 
                            s.status === "DELIVERED" ? "bg-emerald-400" :
                            s.status === "IN_TRANSIT" ? "bg-sky-400" : "bg-slate-400"
                          }`} />
                          {STATUS_LABEL[s.status]}
                        </span>
                      </td>

                      {/* Route */}
                      <td className="py-3 px-4 truncate max-w-xs text-slate-300 font-medium">
                        {s.origin} &rarr; {s.destination}
                      </td>

                      {/* Temperature */}
                      <td className="py-3 px-4 text-center">
                        <span className={`${tempClass} ${tempBadge} font-mono font-bold text-xs`}>
                          {s.temperature.toFixed(1)}°C {s.temperature > 8.0 ? "↑" : s.temperature < 2.0 ? "↓" : ""}
                        </span>
                      </td>

                      {/* Progress */}
                      <td className="py-3 px-4 min-w-[120px]">
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 flex-1 bg-[#0a0e1a] rounded overflow-hidden p-[0.5px] border border-slate-700/30">
                            <div 
                              style={{ width: `${s.progress}%` }} 
                              className={`h-full rounded-sm ${
                                s.status === "ALERT" ? "bg-[#ef4444]" :
                                s.status === "DELIVERED" ? "bg-[#10b981]" : "bg-[#0ea5e9]"
                              }`}
                            />
                          </div>
                          <span className="font-mono text-[10px] text-slate-400 w-8 text-right">{s.progress}%</span>
                        </div>
                      </td>

                      {/* Risk */}
                      <td className="py-3 px-4 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${riskBadge}`}>
                          {riskLabel}
                        </span>
                      </td>

                      {/* ETA */}
                      <td className="py-3 px-4 font-mono text-slate-300 text-xs">
                        {s.eta}
                      </td>

                      {/* Action */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedShipment(s);
                            }}
                            className="bg-[#0ea5e9]/10 border border-[#0ea5e9]/30 hover:bg-[#0ea5e9]/20 hover:border-[#0ea5e9]/50 text-sky-400 text-[10px] font-bold px-2.5 py-1 rounded transition-colors cursor-pointer"
                          >
                            View Details
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingShipment(s);
                            }}
                            className="p-1 hover:bg-white/10 rounded text-xs transition-colors cursor-pointer select-none"
                            title="Edit Shipment"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeletingShipment(s);
                            }}
                            className="p-1 hover:bg-red-500/20 rounded text-xs text-red-400 transition-colors cursor-pointer select-none"
                            title="Delete Shipment"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-[#0ea5e9]/10 pt-4 mt-2">
              <span className="text-[10px] text-slate-500 font-mono">
                SHOWING {paginatedShipments.length} OF {filteredTableShipments.length} SHIPMENTS
              </span>
              
              <div className="flex items-center gap-1 select-none">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="px-2.5 py-1 rounded border border-[#0ea5e9]/10 bg-[#0a0e1a] text-slate-400 disabled:opacity-40 hover:text-sky-400 hover:border-[#0ea5e9]/30 text-xs"
                >
                  PREV
                </button>
                
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-2.5 py-1 rounded border text-xs font-mono ${
                      currentPage === page
                        ? "bg-[#0ea5e9]/15 text-sky-400 border-[#0ea5e9]/40"
                        : "bg-[#0a0e1a] text-slate-500 border-[#0ea5e9]/10 hover:text-sky-400 hover:border-[#0ea5e9]/30"
                    }`}
                  >
                    {page}
                  </button>
                ))}

                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className="px-2.5 py-1 rounded border border-[#0ea5e9]/10 bg-[#0a0e1a] text-slate-400 disabled:opacity-40 hover:text-sky-400 hover:border-[#0ea5e9]/30 text-xs"
                >
                  NEXT
                </button>
              </div>
            </div>
          )}

          {filteredTableShipments.length === 0 && (
            <div className="text-center py-12 text-slate-500 text-xs font-mono">
              NO NODE MATCHES DETECTED.
            </div>
          )}

        </div>
      )}



      {/* DETAIL MODAL OVERLAY */}
      <AnimatePresence>
        {selectedShipment && (
          <div 
            className="fixed inset-0 z-[10001] flex items-center justify-center bg-black/85 backdrop-blur-sm p-4"
            onClick={() => setSelectedShipment(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#0f1629] border border-[#0ea5e9]/30 rounded-lg max-w-2xl w-full p-6 shadow-2xl relative"
            >
              {/* Corner brackets */}
              <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-[#0ea5e9]" />
              <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-[#0ea5e9]" />
              <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-[#0ea5e9]" />
              <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-[#0ea5e9]" />

              {/* Close Button */}
              <button 
                onClick={() => setSelectedShipment(null)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white text-lg font-bold"
              >
                &times;
              </button>

              <h3 className="text-xs font-mono font-bold text-[#0ea5e9] uppercase tracking-wider mb-2 select-none">
                TACTICAL NODE TELEMETRY RECORD
              </h3>
              
              <div className="flex flex-wrap items-center gap-3 border-b border-[#0ea5e9]/10 pb-3 mb-4">
                <h2 className="text-xl font-bold font-mono text-slate-100 select-all">
                  {selectedShipment.reference}
                </h2>
                <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${STATUS_BADGE[selectedShipment.status]}`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${
                    selectedShipment.status === "ALERT" ? "bg-red-400 animate-ping" : 
                    selectedShipment.status === "DELIVERED" ? "bg-emerald-400" :
                    selectedShipment.status === "IN_TRANSIT" ? "bg-sky-400" : "bg-slate-400"
                  }`} />
                  {STATUS_LABEL[selectedShipment.status]}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                
                <div>
                  <span className="text-slate-500 block uppercase text-[10px] font-bold">Logistics Hub Route</span>
                  <span className="text-slate-200 font-semibold">{selectedShipment.origin} &rarr; {selectedShipment.destination}</span>
                </div>
                
                <div>
                  <span className="text-slate-500 block uppercase text-[10px] font-bold">Current Node Position</span>
                  <span className="text-slate-200 font-semibold truncate block">{selectedShipment.location || "En Route"}</span>
                </div>

                <div>
                  <span className="text-slate-500 block uppercase text-[10px] font-bold">Telemetry Core Temp</span>
                  <span className={`text-sm font-bold font-mono ${selectedShipment.temperature > 8 ? "text-[#ef4444]" : selectedShipment.temperature < 2 ? "text-sky-400" : "text-[#10b981]"}`}>
                    {selectedShipment.temperature.toFixed(1)} °C
                  </span>
                </div>

                <div>
                  <span className="text-slate-500 block uppercase text-[10px] font-bold">Relative Humidity</span>
                  <span className="text-slate-200 font-mono font-bold text-sm">
                    {selectedShipment.humidity !== null && selectedShipment.humidity !== undefined ? selectedShipment.humidity.toFixed(1) : '65'}% RH
                  </span>
                </div>

                <div>
                  <span className="text-slate-500 block uppercase text-[10px] font-bold">ETA Timeline</span>
                  <span className="text-slate-200 font-mono font-bold">{selectedShipment.eta}</span>
                </div>

                <div>
                  <span className="text-slate-500 block uppercase text-[10px] font-bold">Route Completion</span>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="h-1.5 flex-1 bg-[#0a0e1a] rounded overflow-hidden p-[0.5px] border border-slate-700/30">
                      <div 
                        style={{ width: `${selectedShipment.progress}%` }} 
                        className={`h-full rounded-sm ${
                          selectedShipment.status === "ALERT" ? "bg-[#ef4444]" :
                          selectedShipment.status === "DELIVERED" ? "bg-[#10b981]" : "bg-[#0ea5e9]"
                        }`}
                      />
                    </div>
                    <span className="font-mono text-[10px] text-slate-400 w-8 text-right">{selectedShipment.progress}%</span>
                  </div>
                </div>

                <div>
                  <span className="text-slate-500 block uppercase text-[10px] font-bold">AI Risk Assessment</span>
                  {(() => {
                    const rScore = selectedShipment.riskScore ?? (selectedShipment.mlSpoilageRisk ? Math.round(selectedShipment.mlSpoilageRisk * 100) : 15);
                    const rClass = rScore > 70 ? "text-[#ef4444]" : rScore > 40 ? "text-[#f59e0b]" : "text-[#10b981]";
                    const rText = rScore > 70 ? "HIGH" : rScore > 40 ? "MODERATE" : "LOW";
                    return (
                      <span className={`font-mono font-bold text-sm ${rClass}`}>
                        {rScore}% ({rText})
                      </span>
                    );
                  })()}
                </div>

                <div>
                  <span className="text-slate-500 block uppercase text-[10px] font-bold">Machine Learning Spoilage Probability</span>
                  {(() => {
                    const digits = parseInt(selectedShipment.reference.replace(/\D/g, ""), 10) || 0;
                    const seed = (digits % 100) / 100;
                    const sRisk = selectedShipment.temperature > 15 
                      ? Math.floor(70 + seed * 20)
                      : selectedShipment.temperature > 8 
                      ? Math.floor(30 + seed * 30)
                      : selectedShipment.temperature < 2
                      ? Math.floor(20 + seed * 20)
                      : Math.floor(5 + seed * 15);
                    const sColor = sRisk > 60 ? "text-[#ef4444]" : sRisk > 30 ? "text-[#f59e0b]" : "text-[#10b981]";
                    return (
                      <span className={`font-bold font-mono text-sm ${sColor}`}>
                        {sRisk}% Risk
                      </span>
                    );
                  })()}
                </div>

                {(selectedShipment.status === "ALERT" || selectedShipment.alertReason) && (
                  <div className="sm:col-span-2 bg-[#ef4444]/5 border border-[#ef4444]/20 p-2.5 rounded">
                    <span className="text-[#ef4444] block uppercase text-[9px] font-bold">Cold Chain Violation Incident</span>
                    <span className="text-slate-200 italic">{selectedShipment.alertReason || "Temperature excursion detected"}</span>
                  </div>
                )}

                {selectedShipment.status === "DELIVERED" && selectedShipment.blockchainTx && (
                  <div className="sm:col-span-2 bg-indigo-500/[0.03] border border-indigo-500/20 p-2.5 rounded font-mono">
                    <span className="text-indigo-400 block uppercase text-[9px] font-bold">Immutable Ledger Transaction</span>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mt-1">
                      <span className="text-slate-300 text-[10px] break-all select-all flex-1">{selectedShipment.blockchainTx}</span>
                      <a 
                        href={`https://sepolia.etherscan.io/tx/${selectedShipment.blockchainTx}`} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-indigo-400 hover:underline text-[10px] whitespace-nowrap flex-shrink-0"
                      >
                        [Etherscan ↗]
                      </a>
                    </div>
                  </div>
                )}

              </div>

              <div className="mt-6 flex justify-end gap-3">
                <ShipmentPDFButton shipment={selectedShipment} />
                <button
                  onClick={() => setSelectedShipment(null)}
                  className="bg-[#0ea5e9]/10 border border-[#0ea5e9]/30 hover:bg-[#0ea5e9]/20 hover:border-[#0ea5e9]/50 text-sky-400 text-xs font-bold px-4 py-2 rounded transition-colors cursor-pointer"
                >
                  DISMISS NODE DATA
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Real-time WebSocket Telemetry Toast */}
      <AnimatePresence>
        {wsToast && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-24 right-6 z-50 max-w-xs px-4 py-3 rounded-xl text-sm"
            style={{
              background: '#0f1629',
              border: '1px solid rgba(14,165,233,0.3)',
              boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
            }}
          >
            <div className="flex items-center gap-2 mb-1">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] font-mono text-emerald-400 font-bold">
                LIVE UPDATE
              </span>
            </div>
            <p className="text-slate-300 text-xs">{wsToast}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* KPI Detail Panels */}
      <DetailPanel
        isOpen={activePanel === "total"}
        onClose={() => setActivePanel(null)}
        title="Total Shipments Telemetry"
        subtitle="Network tracking and current status breakdown"
        accentColor="#0ea5e9"
      >
        <TotalShipmentsPanel 
          shipments={shipments} 
          onViewAll={() => {
            setSelectedMainTab("Shipments");
            setActivePanel(null);
          }} 
        />
      </DetailPanel>

      <DetailPanel
        isOpen={activePanel === "coldchain"}
        onClose={() => setActivePanel(null)}
        title="Cold Chain Compliance"
        subtitle="Operational standards and SLA compliance index"
        accentColor="#10b981"
      >
        <ColdChainPanel shipments={shipments} />
      </DetailPanel>

      <DetailPanel
        isOpen={activePanel === "temperature"}
        onClose={() => setActivePanel(null)}
        title="Temperature Excursions"
        subtitle="Active cold chain breaches requiring intervention"
        accentColor="#ef4444"
      >
        <TemperatureAlertsPanel shipments={shipments} />
      </DetailPanel>

      <DetailPanel
        isOpen={activePanel === "blockchain"}
        onClose={() => setActivePanel(null)}
        title="Blockchain Ledger Proof"
        subtitle="On-chain receipts and immutable delivery records"
        accentColor="#6366f1"
      >
        <BlockchainPanel shipments={shipments} />
      </DetailPanel>

      <DetailPanel
        isOpen={activePanel === "risk"}
        onClose={() => setActivePanel(null)}
        title="AI Fleet Risk Assessment"
        subtitle="Predictive analysis and vulnerability forecasting"
        accentColor="#f59e0b"
      >
        <AIRiskPanel shipments={shipments} />
      </DetailPanel>

      {/* Toast Notification */}
      {toast && (
        <div style={{
          position: 'fixed',
          top: '80px',
          right: '16px',
          zIndex: 99999,
          padding: '12px 20px',
          background: toast.type === 'success' 
            ? 'rgba(16,185,129,0.15)' 
            : 'rgba(239,68,68,0.15)',
          border: `1px solid ${toast.type === 'success' 
            ? 'rgba(16,185,129,0.4)' 
            : 'rgba(239,68,68,0.4)'}`,
          borderRadius: '10px',
          color: '#f1f5f9',
          fontSize: '13px',
          fontFamily: 'monospace',
          backdropFilter: 'blur(4px)',
          boxShadow: '0 4px 24px rgba(0,0,0,0.5)'
        }}>
          {toast.type === 'success' ? '✓' : '✗'} {toast.message}
        </div>
      )}

      {/* ADD SHIPMENT MODAL */}
      <AnimatePresence>
        {showAddForm && (
          <div 
            className="fixed inset-0 z-[10001] flex items-center justify-center bg-black/85 backdrop-blur-sm p-4"
            onClick={() => setShowAddForm(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#0f1629] border border-[#0ea5e9]/30 rounded-lg max-w-lg w-full p-6 shadow-2xl relative"
            >
              {/* Corner brackets */}
              <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-[#0ea5e9]" />
              <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-[#0ea5e9]" />
              <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-[#0ea5e9]" />
              <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-[#0ea5e9]" />

              {/* Close Button */}
              <button 
                onClick={() => setShowAddForm(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white text-lg font-bold"
              >
                &times;
              </button>

              <h3 className="text-xs font-mono font-bold text-[#0ea5e9] uppercase tracking-wider mb-2 select-none">
                TACTICAL NODE CREATION REQUEST
              </h3>
              <h2 className="text-xl font-bold font-mono text-slate-100 border-b border-[#0ea5e9]/10 pb-3 mb-4 select-none">
                Create New Shipment
              </h2>

              <form onSubmit={handleAddSubmit} className="space-y-4 text-xs">
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-slate-500 block uppercase text-[10px] font-bold mb-1">Origin Logistics Hub</label>
                    <select
                      value={addFormVal.origin}
                      onChange={(e) => setAddFormVal({ ...addFormVal, origin: e.target.value })}
                      className="w-full bg-[#0a0e1a] border border-[#0ea5e9]/20 focus:border-[#0ea5e9] text-xs px-3 py-2 rounded text-slate-200 focus:outline-none"
                    >
                      {HUB_NAMES.map(h => (
                        <option key={h} value={h} className="bg-[#0f1629]">{h}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="text-slate-500 block uppercase text-[10px] font-bold mb-1">Destination Logistics Hub</label>
                    <select
                      value={addFormVal.destination}
                      onChange={(e) => setAddFormVal({ ...addFormVal, destination: e.target.value })}
                      className="w-full bg-[#0a0e1a] border border-[#0ea5e9]/20 focus:border-[#0ea5e9] text-xs px-3 py-2 rounded text-slate-200 focus:outline-none"
                    >
                      {HUB_NAMES.map(h => (
                        <option key={h} value={h} className="bg-[#0f1629]">{h}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-slate-500 block uppercase text-[10px] font-bold mb-1">Status Code</label>
                    <select
                      value={addFormVal.status}
                      onChange={(e) => setAddFormVal({ ...addFormVal, status: e.target.value })}
                      className="w-full bg-[#0a0e1a] border border-[#0ea5e9]/20 focus:border-[#0ea5e9] text-xs px-3 py-2 rounded text-slate-200 focus:outline-none"
                    >
                      <option value="PENDING" className="bg-[#0f1629]">Pending</option>
                      <option value="IN_TRANSIT" className="bg-[#0f1629]">In Transit</option>
                      <option value="ALERT" className="bg-[#0f1629]">Alert</option>
                      <option value="DELIVERED" className="bg-[#0f1629]">Delivered</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-slate-500 block uppercase text-[10px] font-bold mb-1">Core Temp (°C)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={addFormVal.temperature}
                      onChange={(e) => setAddFormVal({ ...addFormVal, temperature: parseFloat(e.target.value) || 0 })}
                      className="w-full bg-[#0a0e1a] border border-[#0ea5e9]/20 focus:border-[#0ea5e9] text-xs px-3 py-2 rounded text-slate-200 focus:outline-none font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-slate-500 block uppercase text-[10px] font-bold mb-1">ETA Timeline</label>
                    <input
                      type="text"
                      placeholder="e.g. 3d"
                      value={addFormVal.eta}
                      onChange={(e) => setAddFormVal({ ...addFormVal, eta: e.target.value })}
                      className="w-full bg-[#0a0e1a] border border-[#0ea5e9]/20 focus:border-[#0ea5e9] text-xs px-3 py-2 rounded text-slate-200 focus:outline-none font-mono"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-slate-500 uppercase text-[10px] font-bold">Transit Progress</label>
                    <span className="text-slate-300 font-mono font-bold">{addFormVal.progress}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={addFormVal.progress}
                    onChange={(e) => setAddFormVal({ ...addFormVal, progress: parseInt(e.target.value) || 0 })}
                    className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-500"
                  />
                </div>

                <div className="mt-6 flex justify-end gap-3 pt-3 border-t border-[#0ea5e9]/10">
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="bg-slate-800 border border-slate-700 hover:bg-slate-700 text-slate-300 text-xs font-bold px-4 py-2 rounded transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-[#0ea5e9]/15 border border-[#0ea5e9]/40 hover:bg-[#0ea5e9]/25 text-sky-400 text-xs font-bold px-4 py-2 rounded transition-colors cursor-pointer"
                  >
                    Create Shipment
                  </button>
                </div>

              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* EDIT SHIPMENT MODAL */}
      <AnimatePresence>
        {editingShipment && (
          <div 
            className="fixed inset-0 z-[10001] flex items-center justify-center bg-black/85 backdrop-blur-sm p-4"
            onClick={() => setEditingShipment(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#0f1629] border border-[#0ea5e9]/30 rounded-lg max-w-lg w-full p-6 shadow-2xl relative"
            >
              {/* Corner brackets */}
              <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-[#0ea5e9]" />
              <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-[#0ea5e9]" />
              <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-[#0ea5e9]" />
              <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-[#0ea5e9]" />

              {/* Close Button */}
              <button 
                onClick={() => setEditingShipment(null)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white text-lg font-bold"
              >
                &times;
              </button>

              <h3 className="text-xs font-mono font-bold text-[#0ea5e9] uppercase tracking-wider mb-2 select-none">
                TACTICAL NODE MODIFICATION REQUEST
              </h3>
              <h2 className="text-xl font-bold font-mono text-slate-100 border-b border-[#0ea5e9]/10 pb-3 mb-4 select-none">
                Edit Shipment {editingShipment.reference}
              </h2>

              <form onSubmit={handleEditSubmit} className="space-y-4 text-xs">
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-slate-500 block uppercase text-[10px] font-bold mb-1">Origin Logistics Hub</label>
                    <select
                      value={editFormVal.origin}
                      onChange={(e) => setEditFormVal({ ...editFormVal, origin: e.target.value })}
                      className="w-full bg-[#0a0e1a] border border-[#0ea5e9]/20 focus:border-[#0ea5e9] text-xs px-3 py-2 rounded text-slate-200 focus:outline-none"
                    >
                      {HUB_NAMES.map(h => (
                        <option key={h} value={h} className="bg-[#0f1629]">{h}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="text-slate-500 block uppercase text-[10px] font-bold mb-1">Destination Logistics Hub</label>
                    <select
                      value={editFormVal.destination}
                      onChange={(e) => setEditFormVal({ ...editFormVal, destination: e.target.value })}
                      className="w-full bg-[#0a0e1a] border border-[#0ea5e9]/20 focus:border-[#0ea5e9] text-xs px-3 py-2 rounded text-slate-200 focus:outline-none"
                    >
                      {HUB_NAMES.map(h => (
                        <option key={h} value={h} className="bg-[#0f1629]">{h}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-slate-500 block uppercase text-[10px] font-bold mb-1">Status Code</label>
                    <select
                      value={editFormVal.status}
                      onChange={(e) => setEditFormVal({ ...editFormVal, status: e.target.value })}
                      className="w-full bg-[#0a0e1a] border border-[#0ea5e9]/20 focus:border-[#0ea5e9] text-xs px-3 py-2 rounded text-slate-200 focus:outline-none"
                    >
                      <option value="PENDING" className="bg-[#0f1629]">Pending</option>
                      <option value="IN_TRANSIT" className="bg-[#0f1629]">In Transit</option>
                      <option value="ALERT" className="bg-[#0f1629]">Alert</option>
                      <option value="DELIVERED" className="bg-[#0f1629]">Delivered</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-slate-500 block uppercase text-[10px] font-bold mb-1">Core Temp (°C)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={editFormVal.temperature}
                      onChange={(e) => setEditFormVal({ ...editFormVal, temperature: parseFloat(e.target.value) || 0 })}
                      className="w-full bg-[#0a0e1a] border border-[#0ea5e9]/20 focus:border-[#0ea5e9] text-xs px-3 py-2 rounded text-slate-200 focus:outline-none font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-slate-500 block uppercase text-[10px] font-bold mb-1">ETA Timeline</label>
                    <input
                      type="text"
                      value={editFormVal.eta}
                      onChange={(e) => setEditFormVal({ ...editFormVal, eta: e.target.value })}
                      className="w-full bg-[#0a0e1a] border border-[#0ea5e9]/20 focus:border-[#0ea5e9] text-xs px-3 py-2 rounded text-slate-200 focus:outline-none font-mono"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-slate-500 uppercase text-[10px] font-bold">Transit Progress</label>
                    <span className="text-slate-300 font-mono font-bold">{editFormVal.progress}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={editFormVal.progress}
                    onChange={(e) => setEditFormVal({ ...editFormVal, progress: parseInt(e.target.value) || 0 })}
                    className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-500"
                  />
                </div>

                <div className="mt-6 flex justify-end gap-3 pt-3 border-t border-[#0ea5e9]/10">
                  <button
                    type="button"
                    onClick={() => setEditingShipment(null)}
                    className="bg-slate-800 border border-slate-700 hover:bg-slate-700 text-slate-300 text-xs font-bold px-4 py-2 rounded transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-[#0ea5e9]/15 border border-[#0ea5e9]/40 hover:bg-[#0ea5e9]/25 text-sky-400 text-xs font-bold px-4 py-2 rounded transition-colors cursor-pointer"
                  >
                    Update Shipment
                  </button>
                </div>

              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DELETE CONFIRMATION MODAL */}
      <AnimatePresence>
        {deletingShipment && (
          <div 
            className="fixed inset-0 z-[10001] flex items-center justify-center bg-black/85 backdrop-blur-sm p-4"
            onClick={() => setDeletingShipment(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#0f1629] border border-red-500/30 rounded-lg max-w-sm w-full p-6 shadow-2xl relative"
            >
              {/* Corner brackets */}
              <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-red-500" />
              <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-red-500" />
              <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-red-500" />
              <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-red-500" />

              <h3 className="text-xs font-mono font-bold text-red-500 uppercase tracking-wider mb-2 select-none">
                🚨 TACTICAL NODE PURGE REQUEST
              </h3>
              <h2 className="text-base font-bold font-mono text-slate-100 mb-4 select-none">
                Delete {deletingShipment.reference}?
              </h2>
              
              <p className="text-slate-400 text-xs leading-relaxed mb-6">
                Are you sure you want to delete shipment <strong className="text-slate-200">{deletingShipment.reference}</strong>? This cannot be undone and will permanently erase this telemetry record.
              </p>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setDeletingShipment(null)}
                  className="bg-slate-800 border border-slate-700 hover:bg-slate-700 text-slate-300 text-xs font-bold px-4 py-2 rounded transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  className="bg-red-500/15 border border-red-500/40 hover:bg-red-500/25 text-red-400 text-xs font-bold px-4 py-2 rounded transition-colors cursor-pointer"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
