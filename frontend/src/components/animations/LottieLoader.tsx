"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import Lottie from "lottie-react";
import { gsap } from "gsap";

interface LottieLoaderProps {
  message: string;
  size?: number;
}

const TRUCK_LOTTIE_URL = "https://assets.lottiefiles.com/packages/lf20_szlepvdh.json";

export function LottieLoader({ message, size = 180 }: LottieLoaderProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [animationData, setAnimationData] = useState<object | null>(null);

  useEffect(() => {
    let isMounted = true;
    const loadAnimation = async () => {
      const response = await fetch(TRUCK_LOTTIE_URL);
      const json = (await response.json()) as object;
      if (isMounted) setAnimationData(json);
    };
    loadAnimation().catch(() => setAnimationData(null));
    return () => {
      isMounted = false;
    };
  }, []);

  useLayoutEffect(() => {
    if (!containerRef.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        containerRef.current,
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.35, ease: "power2.out" },
      );
    }, containerRef);

    return () => {
      gsap.to(containerRef.current, { opacity: 0, duration: 0.25, ease: "power1.out" });
      ctx.revert();
    };
  }, []);

  return (
    <div ref={containerRef} className="flex w-full flex-col items-center justify-center gap-3 py-8">
      <div style={{ width: size, height: size }}>
        {animationData ? (
          <Lottie animationData={animationData} loop />
        ) : (
          <div className="h-full w-full animate-pulse rounded-full bg-cyan-500/20" />
        )}
      </div>
      <p className="text-sm text-slate-300">{message}</p>
    </div>
  );
}
