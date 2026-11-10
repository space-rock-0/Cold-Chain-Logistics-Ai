"use client";

import { useState } from "react";
import jsPDF from "jspdf";

export default function ReportGenerator({
  shipments,
  stats,
}: {
  shipments: any[];
  stats: any;
}) {
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState(0);

  const generateReport = async () => {
    setGenerating(true);
    setProgress(0);

    const doc = new jsPDF("p", "mm", "a4");
    const pageWidth = doc.internal.pageSize.getWidth();

    // BLACK BACKGROUND
    doc.setFillColor(5, 5, 5);
    doc.rect(0, 0, pageWidth, 297, "F");

    setProgress(20);

    // HEADER
    doc.setTextColor(34, 211, 238); // cyan
    doc.setFontSize(24);
    doc.setFont("helvetica", "bold");
    doc.text("COLD CHAIN AI v2.0", pageWidth / 2, 25, { align: "center" });

    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139); // slate
    doc.text("LOGISTICS INTELLIGENCE REPORT", pageWidth / 2, 33, { align: "center" });
    doc.text(`Generated: ${new Date().toLocaleString()}`, pageWidth / 2, 39, { align: "center" });
    doc.text("CLASSIFIED — AUTHORIZED PERSONNEL ONLY", pageWidth / 2, 45, { align: "center" });

    // Cyan divider line
    doc.setDrawColor(34, 211, 238);
    doc.setLineWidth(0.5);
    doc.line(20, 50, pageWidth - 20, 50);

    setProgress(40);

    // FLEET SUMMARY
    doc.setTextColor(34, 211, 238);
    doc.setFontSize(14)
    doc.text("FLEET STATUS SUMMARY", 20, 62);

    const summaryData = [
      ["Total Shipments", String(stats.total || 85)],
      ["Pending", String(stats.pending || 20)],
      ["In Transit", String(stats.inTransit || 25)],
      ["Critical Alerts", String(stats.alerts || 20)],
      ["Delivered", String(stats.delivered || 20)],
      ["On-Time Rate", "87.3%"],
      ["Avg Temperature", "6.2°C"],
      ["Fleet Utilization", "94.1%"],
    ];

    let y = 72;
    summaryData.forEach(([label, value]) => {
      doc.setTextColor(148, 163, 184);
      doc.setFontSize(9);
      doc.text(label, 25, y);
      doc.setTextColor(34, 211, 238);
      doc.setFont("helvetica", "bold");
      doc.text(value, 100, y);
      doc.setFont("helvetica", "normal");
      y += 8;
    });

    setProgress(60);

    // ALERT SHIPMENTS
    doc.setDrawColor(34, 211, 238);
    doc.line(20, y + 5, pageWidth - 20, y + 5);
    y += 15;

    doc.setTextColor(239, 68, 68); // rose
    doc.setFontSize(14);
    doc.text("CRITICAL ALERTS REQUIRING ATTENTION", 20, y);
    y += 12;

    const alertShipments = shipments
      .filter((s) => s.status === "ALERT")
      .slice(0, 8);

    alertShipments.forEach((s) => {
      doc.setTextColor(239, 68, 68);
      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      doc.text(s.reference || "N/A", 25, y);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(148, 163, 184);
      doc.text(`${s.origin || ""} → ${s.destination || ""}`, 55, y);
      doc.setTextColor(239, 68, 68);
      doc.text(`${s.temperature || 0}°C`, 155, y);
      y += 7;
      if (s.alertReason) {
        doc.setTextColor(100, 116, 139);
        doc.setFontSize(8);
        doc.text(`  ↳ ${s.alertReason}`, 25, y);
        y += 6;
      }
    });

    setProgress(80);

    // IN TRANSIT
    doc.setDrawColor(34, 211, 238);
    doc.line(20, y + 5, pageWidth - 20, y + 5);
    y += 15;

    if (y > 250) {
      doc.addPage();
      y = 20;
    }

    doc.setFillColor(5, 5, 5);
    doc.rect(0, 0, pageWidth, 297, "F");

    doc.setTextColor(56, 189, 248); // sky
    doc.setFontSize(14);
    doc.text("ACTIVE IN-TRANSIT SHIPMENTS", 20, y);
    y += 12;

    const transitShipments = shipments
      .filter((s) => s.status === "IN_TRANSIT")
      .slice(0, 10);

    transitShipments.forEach((s) => {
      doc.setTextColor(56, 189, 248);
      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      doc.text(s.reference || "N/A", 25, y);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(148, 163, 184);
      doc.text(`${s.origin || ""} → ${s.destination || ""}`, 55, y);
      doc.setTextColor(34, 211, 238);
      doc.text(`${s.progress || 0}%`, 160, y);
      y += 7;
    });

    setProgress(90);

    // FOOTER
    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFillColor(5, 5, 5);
      doc.rect(0, 280, pageWidth, 17, "F");
      doc.setDrawColor(34, 211, 238);
      doc.line(20, 282, pageWidth - 20, 282);
      doc.setTextColor(100, 116, 139);
      doc.setFontSize(7);
      doc.text(
        "Cold Chain AI v2.0 — MCA Final Year Project — VIT Vellore — Sagi Siddhartha",
        pageWidth / 2,
        288,
        { align: "center" }
      );
      doc.text(`Page ${i} of ${totalPages}`, pageWidth / 2, 293, { align: "center" });
    }

    setProgress(100);

    // Save
    doc.save(`ColdChain-Report-${new Date().toISOString().split("T")[0]}.pdf`);

    setTimeout(() => {
      setGenerating(false);
      setProgress(0);
    }, 1000);
  };

  return (
    <div className="relative">
      <button
        onClick={generateReport}
        disabled={generating}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-mono transition-all cursor-pointer
          ${
            generating
              ? "bg-indigo-500/20 border border-indigo-500/50 text-indigo-300 cursor-wait animate-pulse"
              : "bg-white/5 border border-white/10 text-slate-400 hover:border-indigo-500/50 hover:text-indigo-300 hover:bg-indigo-950/20"
          }`}
      >
        {generating ? (
          <>
            <span className="inline-block w-3 h-3 border border-indigo-400 border-t-transparent rounded-full animate-spin" />
            GENERATING {progress}%
          </>
        ) : (
          <>📄 EXPORT REPORT</>
        )}
      </button>

      {generating && (
        <div className="absolute top-full mt-1 left-0 w-32 h-0.5 bg-white/5 rounded-full overflow-hidden">
          <div
            className="h-full bg-indigo-400 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  );
}
