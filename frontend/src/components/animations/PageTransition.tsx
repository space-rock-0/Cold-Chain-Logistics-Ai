"use client";

import { useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";

interface PageTransitionProps {
  children: React.ReactNode;
}

export function PageTransition({ children }: PageTransitionProps) {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const progressRef = useRef<HTMLDivElement | null>(null);

  useLayoutEffect(() => {
    if (!wrapperRef.current || !progressRef.current) return;

    const ctx = gsap.context(() => {
      gsap.set(wrapperRef.current, {
        clipPath: "inset(0 100% 0 0)",
        opacity: 1,
      });
      gsap.set(progressRef.current, { xPercent: -100, opacity: 1 });

      const tl = gsap.timeline();
      tl.to(wrapperRef.current, {
        clipPath: "inset(0 0% 0 0)",
        duration: 0.6,
        ease: "power3.out",
      }).to(
        progressRef.current,
        {
          xPercent: 100,
          duration: 0.6,
          ease: "power3.out",
        },
        0,
      );
    }, wrapperRef);

    return () => {
      gsap.to(wrapperRef.current, {
        opacity: 0,
        duration: 0.3,
        ease: "power1.out",
      });
      ctx.revert();
    };
  }, []);

  return (
    <div ref={wrapperRef} className="relative min-h-screen overflow-hidden">
      <div
        ref={progressRef}
        className="pointer-events-none absolute left-0 top-0 z-50 h-[2px] w-full bg-cyan-400"
      />
      {children}
    </div>
  );
}
