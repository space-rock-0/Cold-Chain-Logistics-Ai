"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useShipmentWebSocket } from "@/hooks/useWebSocket";

// --- Types ---
export interface AuthUser {
  name: string;
  email: string;
  role: "ADMIN" | "VIEWER";
}

export interface ApiShipment {
  id: string;
  reference: string;
  origin: string;
  destination: string;
  status: "PENDING" | "IN_TRANSIT" | "ALERT" | "DELIVERED";
  eta: string;
  progress: number;
  temperature: number;
  humidity: number;
  location: string;
  riskScore: number | null;
  alertReason: string | null;
  blockchainTx: string | null;
  mlSpoilageRisk: number | null;
  mlAnomalyFlag: boolean;
  createdAt: string;
}

export interface Stats {
  total: number;
  pending: number;
  inTransit: number;
  alerts: number;
  delivered: number;
}

export interface Explosion {
  id: number;
  x: number;
  y: number;
}

interface DashboardContextType {
  user: AuthUser | null;
  stats: Stats;
  shipments: ApiShipment[];
  loading: boolean;
  apiError: boolean;
  warRoom: boolean;
  setWarRoom: (val: boolean) => void;
  liveClock: string;
  refreshCountdown: number;
  setRefreshCountdown: React.Dispatch<React.SetStateAction<number>>;
  explosions: Explosion[];
  addExplosion: (x: number, y: number) => void;
  removeExplosion: (id: number) => void;
  triggerRefresh: () => void;
  voiceActive: boolean;
  setVoiceActive: (val: boolean) => void;
  voiceState: "INACTIVE" | "LISTENING" | "PROCESSING" | "SPEAKING";
  setVoiceState: (val: "INACTIVE" | "LISTENING" | "PROCESSING" | "SPEAKING") => void;
  activePanel: string | null;
  setActivePanel: (val: string | null) => void;
  wsConnected: boolean;
  wsLastUpdate: string;
  wsLiveMessage: string;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export function DashboardProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const { connected: wsConnected, lastUpdate: wsLastUpdate, liveMessage: wsLiveMessage } = useShipmentWebSocket();
  const [stats, setStats] = useState<Stats>({
    total: 85,
    pending: 20,
    inTransit: 25,
    alerts: 20,
    delivered: 20,
  });
  const [shipments, setShipments] = useState<ApiShipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState(false);
  const [warRoom, setWarRoom] = useState(false);
  const [liveClock, setLiveClock] = useState("");
  const [refreshCountdown, setRefreshCountdown] = useState(30);
  const [explosions, setExplosions] = useState<Explosion[]>([]);
  const [voiceActive, setVoiceActive] = useState(false);
  const [voiceState, setVoiceState] = useState<"INACTIVE" | "LISTENING" | "PROCESSING" | "SPEAKING">("INACTIVE");
  const [activePanel, setActivePanel] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    setLiveClock(new Date().toLocaleTimeString());
  }, []);

  // Fetch current user from auth cookie
  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => setUser(data.user ?? null))
      .catch(() => null);
  }, []);

  // Live clock
  useEffect(() => {
    const timer = setInterval(() => {
      setLiveClock(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchData = () => {
    const statsReq = fetch("/api/shipments/stats/")
      .then((r) => r.json())
      .then((data) => {
        setStats({
          total: data.total,
          pending: data.pending,
          inTransit: data.in_transit,
          alerts: data.alerts,
          delivered: data.delivered,
        });
        setApiError(false);
      })
      .catch(() => {
        console.log("Stats fetch failed — using cached stats");
        setApiError(true);
      });

    const shipmentsReq = fetch("/api/shipments/")
      .then((r) => r.json())
      .then((data) => setShipments(data.shipments || []))
      .catch(() => {
        console.log("Shipments fetch failed — using cached shipments");
        setApiError(true);
      });

    Promise.allSettled([statsReq, shipmentsReq]).then(() => setLoading(false));
  };

  // Initial fetch
  useEffect(() => {
    fetchData();
  }, []);

  // Refetch when a new WebSocket message arrives
  useEffect(() => {
    if (wsLastUpdate) {
      fetchData();
    }
  }, [wsLastUpdate]);

  // Refresh countdown
  useEffect(() => {
    const countdown = setInterval(() => {
      setRefreshCountdown((prev) => {
        if (prev <= 1) {
          fetchData();
          setTimeout(() => router.refresh(), 0);
          return 30;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(countdown);
  }, [router]);

  const addExplosion = (x: number, y: number) => {
    setExplosions((prev) => [...prev, { id: Date.now() + Math.random(), x, y }]);
  };

  const removeExplosion = (id: number) => {
    setExplosions((prev) => prev.filter((exp) => exp.id !== id));
  };

  const triggerRefresh = () => {
    fetchData();
    router.refresh();
    setRefreshCountdown(30);
  };

  return (
    <DashboardContext.Provider
      value={{
        user,
        stats,
        shipments,
        loading,
        apiError,
        warRoom,
        setWarRoom,
        liveClock,
        refreshCountdown,
        setRefreshCountdown,
        explosions,
        addExplosion,
        removeExplosion,
        triggerRefresh,
        voiceActive,
        setVoiceActive,
        voiceState,
        setVoiceState,
        activePanel,
        setActivePanel,
        wsConnected,
        wsLastUpdate,
        wsLiveMessage,
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (context === undefined) {
    throw new Error("useDashboard must be used within a DashboardProvider");
  }
  return context;
}
