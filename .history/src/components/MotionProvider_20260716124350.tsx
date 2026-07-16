"use client";

import { useEffect } from "react";

const revealSelector = ".scroll-reveal";
const visibleClassName = "is-visible";

function revealElements(elements: Iterable<HTMLElement>) {
  Array.from(elements).forEach((element) => {
    element.classList.add(visibleClassName);
  });
}

function getRevealTargets(root: ParentNode = document) {
  return Array.from(root.querySelectorAll<HTMLElement>(revealSelector));
}

export function MotionProvider() {
  useEffect(() => {
    const initialTargets = getRevealTargets();

    if (initialTargets.length === 0) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (prefersReducedMotion || !("IntersectionObserver" in window)) {
      revealElements(initialTargets);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          entry.target.classList.add(visibleClassName);
          observer.unobserve(entry.target);
        });
      },
      {
        threshold: 0.12,
        rootMargin: "0px 0px -72px 0px",
      },
    );

    const observeElement = (element: HTMLElement) => {
      if (element.classList.contains(visibleClassName)) return;
      observer.observe(element);
    };

    initialTargets.forEach(observeElement);

    const mutationObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (!(node instanceof HTMLElement)) return;

          if (node.matches(revealSelector)) {
            observeElement(node);
          }

          getRevealTargets(node).forEach(observeElement);
        });
      });
    });

    mutationObserver.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => {
      observer.disconnect();
      mutationObserver.disconnect();
    };
  }, []);

  return null;
}