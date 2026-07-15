"use client";

import { useEffect } from "react";

export function MotionProvider() {
  useEffect(() => {
    const revealTargets = Array.from(
      document.querySelectorAll<HTMLElement>(".scroll-reveal"),
    );

    if (revealTargets.length === 0) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (prefersReducedMotion || !("IntersectionObserver" in window)) {
      revealTargets.forEach((target) => target.classList.add("is-visible"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      {
        threshold: 0.12,
        rootMargin: "0px 0px -72px 0px",
      },
    );

    revealTargets.forEach((target) => observer.observe(target));

    return () => observer.disconnect();
  }, []);

  return null;
}