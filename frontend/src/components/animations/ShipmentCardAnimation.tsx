"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { gsap } from "gsap";
import Lottie from "lottie-react";

interface ShipmentCardAnimationProps {
  id: string;
  origin: string;
  destination: string;
  status: string;
  onOpenDetails: (id: string) => void;
  className?: string;
}

const SUCCESS_LOTTIE_URL = "https://assets4.lottiefiles.com/packages/lf20_jbrw3hcz.json";

export function ShipmentCardAnimation({
  id,
  origin,
  destination,
  status,
  onOpenDetails,
  className = "",
}: ShipmentCardAnimationProps) {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const [successAnimation, setSuccessAnimation] = useState<object | null>(null);

  useEffect(() => {
    if (status !== "DELIVERED") return;
    let mounted = true;
    fetch(SUCCESS_LOTTIE_URL)
      .then((res) => res.json() as Promise<object>)
      .then((json) => {
        if (mounted) setSuccessAnimation(json);
      })
      .catch(() => setSuccessAnimation(null));
    return () => {
      mounted = false;
    };
  }, [status]);

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = event.clientX - rect.left - rect.width / 2;
    const y = event.clientY - rect.top - rect.height / 2;

    gsap.to(cardRef.current, {
      x: x * 0.06,
      y: y * 0.06,
      rotateY: x * 0.03,
      rotateX: -y * 0.03,
      duration: 0.25,
      ease: "power2.out",
    });
  };

  const handleMouseLeave = () => {
    if (!cardRef.current) return;
    gsap.to(cardRef.current, {
      x: 0,
      y: 0,
      rotateX: 0,
      rotateY: 0,
      duration: 0.4,
      ease: "power3.out",
    });
  };

  const handleClick = () => {
    if (!cardRef.current) {
      onOpenDetails(id);
      return;
    }

    gsap
      .timeline()
      .to(cardRef.current, { scale: 0.95, duration: 0.08, ease: "power2.inOut" })
      .to(cardRef.current, {
        scale: 1,
        duration: 0.35,
        ease: "elastic.out(1, 0.5)",
        onComplete: () => onOpenDetails(id),
      });
  };

  return (
    <motion.div
      layout
      transition={{ type: "spring", stiffness: 260, damping: 22 }}
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      className={`relative cursor-pointer rounded-xl border border-cyan-500/20 bg-slate-900/70 p-4 shadow-lg ${className}`}
      style={{ transformStyle: "preserve-3d" }}
    >
      <div className="text-sm text-slate-300">{id}</div>
      <div className="mt-2 text-base font-semibold text-cyan-100">
        {origin} <span className="text-slate-400">{"->"}</span> {destination}
      </div>
      <div className="mt-1 text-xs font-medium text-slate-400">Status: {status}</div>

      {status === "DELIVERED" && successAnimation ? (
        <div className="pointer-events-none absolute right-2 top-2 h-14 w-14 opacity-90">
          <Lottie animationData={successAnimation} loop={false} />
        </div>
      ) : null}
    </motion.div>
  );
}
