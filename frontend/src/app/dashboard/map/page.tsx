"use client";

import dynamic from "next/dynamic";

const LeafletMap = dynamic(
  () => import("@/components/map/LeafletMap"),
  {
    ssr: false,
    loading: () => (
      <div className="h-[70vh] bg-white/5 rounded-xl flex items-center justify-center">
        <p className="text-slate-400">Loading map...</p>
      </div>
    ),
  }
);

export default function MapPage() {
  return (
    <div className="p-8">
      <LeafletMap />
    </div>
  );
}
