"use client";

import { useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";

interface CounterAnimationProps {
  value: number;
  label: string;
  color: string;
  prefix?: string;
  suffix?: string;
}

export function CounterAnimation({
  value,
  label,
  color,
  prefix = "",
  suffix = "",
}: CounterAnimationProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const valueRef = useRef<HTMLDivElement | null>(null);

  useLayoutEffect(() => {
    if (!rootRef.current || !valueRef.current) return;
    const counterState = { current: 0 };

    const ctx = gsap.context(() => {
      gsap.fromTo(
        rootRef.current,
        { y: 18, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.55,
          ease: "power2.out",
          stagger: 0.12,
        },
      );

      gsap.to(counterState, {
        current: value,
        duration: 1.2,
        ease: "power2.out",
        onUpdate: () => {
          if (!valueRef.current) return;
          valueRef.current.textContent = `${prefix}${Math.round(counterState.current)}${suffix}`;
        },
      });
    }, rootRef);

    return () => ctx.revert();
  }, [value, prefix, suffix]);

  return (
    <div
      ref={rootRef}
      className="rounded-xl border border-slate-700/60 bg-slate-900/50 p-4 backdrop-blur-sm"
    >
      <div ref={valueRef} className="text-3xl font-bold" style={{ color }}>
        {prefix}0{suffix}
      </div>
      <div className="mt-1 text-xs uppercase tracking-wide text-slate-400">{label}</div>
    </div>
  );
}
