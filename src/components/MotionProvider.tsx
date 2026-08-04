"use client";

import { useEffect } from "react";

const REVEAL_SELECTOR = ".scroll-reveal";
const REVEAL_ITEM_SELECTOR = "[data-reveal-item]";

const VISIBLE_CLASS_NAME = "is-visible";
const PREPARED_CLASS_NAME = "is-reveal-prepared";

const REDUCED_MOTION_QUERY =
  "(prefers-reduced-motion: reduce)";

const DEFAULT_THRESHOLD = 0.12;
const DEFAULT_ROOT_MARGIN = "0px 0px -72px 0px";

const DEFAULT_STAGGER_MS = 70;
const DEFAULT_NEAR_VIEWPORT_FAILSAFE_MS = 2_500;

const MAX_DELAY_MS = 1_500;
const MAX_STAGGER_MS = 400;
const MAX_FAILSAFE_MS = 10_000;

type RevealConfiguration = {
  threshold: number;
  rootMargin: string;
  once: boolean;
  delayMs: number;
  staggerMs: number;
  failsafeMs: number;
};

type LegacyMediaQueryList = MediaQueryList & {
  addListener?: (
    listener: (event: MediaQueryListEvent) => void,
  ) => void;

  removeListener?: (
    listener: (event: MediaQueryListEvent) => void,
  ) => void;
};

function clamp(
  value: number,
  minimum: number,
  maximum: number,
): number {
  return Math.min(
    Math.max(value, minimum),
    maximum,
  );
}

function parseNumericDatasetValue(
  value: string | undefined,
  fallback: number,
  minimum: number,
  maximum: number,
): number {
  if (!value) {
    return fallback;
  }

  const parsedValue = Number(value);

  if (!Number.isFinite(parsedValue)) {
    return fallback;
  }

  return clamp(
    parsedValue,
    minimum,
    maximum,
  );
}

function normalizeRootMargin(
  value: string | undefined,
): string {
  if (!value) {
    return DEFAULT_ROOT_MARGIN;
  }

  const normalizedValue = value
    .trim()
    .replace(/\s+/g, " ");

  const marginParts = normalizedValue.split(" ");

  const isValid =
    marginParts.length >= 1 &&
    marginParts.length <= 4 &&
    marginParts.every((part) =>
      /^-?\d+(?:\.\d+)?(?:px|%)$/.test(part),
    );

  return isValid
    ? normalizedValue
    : DEFAULT_ROOT_MARGIN;
}

function getRevealConfiguration(
  element: HTMLElement,
): RevealConfiguration {
  return {
    threshold: parseNumericDatasetValue(
      element.dataset.revealThreshold,
      DEFAULT_THRESHOLD,
      0,
      1,
    ),

    rootMargin: normalizeRootMargin(
      element.dataset.revealMargin,
    ),

    once:
      element.dataset.revealOnce?.toLowerCase() !==
      "false",

    delayMs: parseNumericDatasetValue(
      element.dataset.revealDelay,
      0,
      0,
      MAX_DELAY_MS,
    ),

    staggerMs: parseNumericDatasetValue(
      element.dataset.revealStagger,
      DEFAULT_STAGGER_MS,
      0,
      MAX_STAGGER_MS,
    ),

    failsafeMs: parseNumericDatasetValue(
      element.dataset.revealFailsafe,
      DEFAULT_NEAR_VIEWPORT_FAILSAFE_MS,
      0,
      MAX_FAILSAFE_MS,
    ),
  };
}

function getRevealTargets(
  root: ParentNode,
): HTMLElement[] {
  const targets: HTMLElement[] = [];

  if (
    root instanceof HTMLElement &&
    root.matches(REVEAL_SELECTOR)
  ) {
    targets.push(root);
  }

  targets.push(
    ...Array.from(
      root.querySelectorAll<HTMLElement>(
        REVEAL_SELECTOR,
      ),
    ),
  );

  return targets;
}

function getRevealTargetsFromNode(
  node: Node,
): HTMLElement[] {
  if (
    node instanceof HTMLElement ||
    node instanceof DocumentFragment
  ) {
    return getRevealTargets(node);
  }

  return [];
}

function isNearViewport(
  element: HTMLElement,
): boolean {
  const rectangle =
    element.getBoundingClientRect();

  const viewportHeight =
    window.innerHeight ||
    document.documentElement.clientHeight;

  return (
    rectangle.top <
      viewportHeight * 1.5 &&
    rectangle.bottom >
      viewportHeight * -0.5
  );
}

function createObserverKey(
  configuration: RevealConfiguration,
): string {
  return [
    configuration.threshold,
    configuration.rootMargin,
  ].join("|");
}

function addMediaQueryListener(
  mediaQuery: LegacyMediaQueryList,
  listener: (
    event: MediaQueryListEvent,
  ) => void,
): void {
  if (
    typeof mediaQuery.addEventListener ===
    "function"
  ) {
    mediaQuery.addEventListener(
      "change",
      listener,
    );

    return;
  }

  mediaQuery.addListener?.(listener);
}

function removeMediaQueryListener(
  mediaQuery: LegacyMediaQueryList,
  listener: (
    event: MediaQueryListEvent,
  ) => void,
): void {
  if (
    typeof mediaQuery.removeEventListener ===
    "function"
  ) {
    mediaQuery.removeEventListener(
      "change",
      listener,
    );

    return;
  }

  mediaQuery.removeListener?.(listener);
}

export function MotionProvider() {
  useEffect(() => {
    const mediaQuery = window.matchMedia(
      REDUCED_MOTION_QUERY,
    ) as LegacyMediaQueryList;

    const supportsIntersectionObserver =
      "IntersectionObserver" in window;

    const observerGroups = new Map<
      string,
      IntersectionObserver
    >();

    const configurationByElement =
      new WeakMap<
        HTMLElement,
        RevealConfiguration
      >();

    const observerKeyByElement =
      new WeakMap<HTMLElement, string>();

    const failsafeTimers =
      new Map<HTMLElement, number>();

    const originalTransitionDelays =
      new Map<HTMLElement, string>();

    const pendingAddedElements =
      new Set<HTMLElement>();

    const pendingRemovedElements =
      new Set<HTMLElement>();

    let mutationFrameId: number | null = null;

    function rememberTransitionDelay(
      element: HTMLElement,
    ): void {
      if (
        originalTransitionDelays.has(element)
      ) {
        return;
      }

      originalTransitionDelays.set(
        element,
        element.style.transitionDelay,
      );
    }

    function setTransitionDelay(
      element: HTMLElement,
      delayMs: number,
    ): void {
      rememberTransitionDelay(element);

      element.style.transitionDelay =
        `${delayMs}ms`;

      element.style.setProperty(
        "--reveal-delay",
        `${delayMs}ms`,
      );
    }

    function prepareStaggeredItems(
      container: HTMLElement,
      configuration: RevealConfiguration,
    ): void {
      const revealItems = Array.from(
        container.querySelectorAll<HTMLElement>(
          REVEAL_ITEM_SELECTOR,
        ),
      );

      revealItems.forEach(
        (item, index) => {
          const itemDelay = clamp(
            configuration.delayMs +
              index *
                configuration.staggerMs,
            0,
            MAX_DELAY_MS,
          );

          setTransitionDelay(
            item,
            itemDelay,
          );
        },
      );
    }

    function prepareElement(
      element: HTMLElement,
      configuration: RevealConfiguration,
    ): void {
      element.classList.add(
        PREPARED_CLASS_NAME,
      );

      if (configuration.delayMs > 0) {
        setTransitionDelay(
          element,
          configuration.delayMs,
        );
      }

      prepareStaggeredItems(
        element,
        configuration,
      );
    }

    function clearFailsafe(
      element: HTMLElement,
    ): void {
      const timerId =
        failsafeTimers.get(element);

      if (timerId === undefined) {
        return;
      }

      window.clearTimeout(timerId);
      failsafeTimers.delete(element);
    }

    function unobserveElement(
      element: HTMLElement,
    ): void {
      const observerKey =
        observerKeyByElement.get(element);

      if (observerKey) {
        observerGroups
          .get(observerKey)
          ?.unobserve(element);

        observerKeyByElement.delete(element);
      }

      clearFailsafe(element);
    }

    function revealElement(
      element: HTMLElement,
    ): void {
      element.classList.add(
        VISIBLE_CLASS_NAME,
      );

      clearFailsafe(element);
    }

    function hideElement(
      element: HTMLElement,
    ): void {
      if (mediaQuery.matches) {
        return;
      }

      element.classList.remove(
        VISIBLE_CLASS_NAME,
      );
    }

    function revealAndStopObserving(
      element: HTMLElement,
    ): void {
      revealElement(element);
      unobserveElement(element);
    }

    function revealAllElements(): void {
      getRevealTargets(document).forEach(
        revealAndStopObserving,
      );
    }

    function scheduleFailsafe(
      element: HTMLElement,
      configuration: RevealConfiguration,
    ): void {
      clearFailsafe(element);

      if (
        configuration.failsafeMs <= 0 ||
        !isNearViewport(element)
      ) {
        return;
      }

      const timerId = window.setTimeout(
        () => {
          revealAndStopObserving(element);
        },
        configuration.failsafeMs,
      );

      failsafeTimers.set(
        element,
        timerId,
      );
    }

    function getOrCreateObserver(
      configuration: RevealConfiguration,
    ): IntersectionObserver {
      const observerKey =
        createObserverKey(configuration);

      const existingObserver =
        observerGroups.get(observerKey);

      if (existingObserver) {
        return existingObserver;
      }

      const observer =
        new IntersectionObserver(
          (entries, currentObserver) => {
            entries.forEach((entry) => {
              const element =
                entry.target as HTMLElement;

              const elementConfiguration =
                configurationByElement.get(
                  element,
                );

              if (!elementConfiguration) {
                currentObserver.unobserve(
                  element,
                );

                return;
              }

              if (entry.isIntersecting) {
                revealElement(element);

                if (
                  elementConfiguration.once
                ) {
                  currentObserver.unobserve(
                    element,
                  );

                  observerKeyByElement.delete(
                    element,
                  );
                }

                return;
              }

              if (
                !elementConfiguration.once
              ) {
                hideElement(element);
              }
            });
          },
          {
            threshold:
              configuration.threshold,

            rootMargin:
              configuration.rootMargin,
          },
        );

      observerGroups.set(
        observerKey,
        observer,
      );

      return observer;
    }

    function observeElement(
      element: HTMLElement,
    ): void {
      const configuration =
        getRevealConfiguration(element);

      configurationByElement.set(
        element,
        configuration,
      );

      prepareElement(
        element,
        configuration,
      );

      if (
        mediaQuery.matches ||
        !supportsIntersectionObserver
      ) {
        revealAndStopObserving(element);
        return;
      }

      if (
        configuration.once &&
        element.classList.contains(
          VISIBLE_CLASS_NAME,
        )
      ) {
        return;
      }

      unobserveElement(element);

      const observer =
        getOrCreateObserver(configuration);

      const observerKey =
        createObserverKey(configuration);

      observerKeyByElement.set(
        element,
        observerKey,
      );

      observer.observe(element);

      scheduleFailsafe(
        element,
        configuration,
      );
    }

    function removeElement(
      element: HTMLElement,
    ): void {
      unobserveElement(element);

      pendingAddedElements.delete(element);
      pendingRemovedElements.delete(element);
    }

    function flushMutationQueue(): void {
      mutationFrameId = null;

      pendingRemovedElements.forEach(
        removeElement,
      );

      pendingRemovedElements.clear();

      pendingAddedElements.forEach(
        (element) => {
          if (!element.isConnected) {
            return;
          }

          observeElement(element);
        },
      );

      pendingAddedElements.clear();
    }

    function scheduleMutationFlush(): void {
      if (mutationFrameId !== null) {
        return;
      }

      mutationFrameId =
        window.requestAnimationFrame(
          flushMutationQueue,
        );
    }

    function queueAddedNode(
      node: Node,
    ): void {
      getRevealTargetsFromNode(node).forEach(
        (element) => {
          pendingAddedElements.add(element);
        },
      );

      scheduleMutationFlush();
    }

    function queueRemovedNode(
      node: Node,
    ): void {
      getRevealTargetsFromNode(node).forEach(
        (element) => {
          pendingRemovedElements.add(
            element,
          );
        },
      );

      scheduleMutationFlush();
    }

    function disconnectObservers(): void {
      observerGroups.forEach(
        (observer) => {
          observer.disconnect();
        },
      );

      observerGroups.clear();

      failsafeTimers.forEach(
        (timerId) => {
          window.clearTimeout(timerId);
        },
      );

      failsafeTimers.clear();
    }

    function observeCurrentDocument(): void {
      getRevealTargets(document).forEach(
        observeElement,
      );
    }

    function handleMotionPreferenceChange(
      event: MediaQueryListEvent,
    ): void {
      if (event.matches) {
        disconnectObservers();
        revealAllElements();
        return;
      }

      observeCurrentDocument();
    }

    function handlePageShow(
      event: PageTransitionEvent,
    ): void {
      if (!event.persisted) {
        return;
      }

      if (
        mediaQuery.matches ||
        !supportsIntersectionObserver
      ) {
        revealAllElements();
        return;
      }

      observeCurrentDocument();
    }

    if (
      mediaQuery.matches ||
      !supportsIntersectionObserver
    ) {
      revealAllElements();
    } else {
      observeCurrentDocument();
    }

    const mutationObserver =
      new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          mutation.addedNodes.forEach(
            queueAddedNode,
          );

          mutation.removedNodes.forEach(
            queueRemovedNode,
          );
        });
      });

    mutationObserver.observe(
      document.body,
      {
        childList: true,
        subtree: true,
      },
    );

    addMediaQueryListener(
      mediaQuery,
      handleMotionPreferenceChange,
    );

    window.addEventListener(
      "pageshow",
      handlePageShow,
    );

    return () => {
      mutationObserver.disconnect();

      removeMediaQueryListener(
        mediaQuery,
        handleMotionPreferenceChange,
      );

      window.removeEventListener(
        "pageshow",
        handlePageShow,
      );

      if (mutationFrameId !== null) {
        window.cancelAnimationFrame(
          mutationFrameId,
        );
      }

      disconnectObservers();

      originalTransitionDelays.forEach(
        (originalDelay, element) => {
          if (originalDelay) {
            element.style.transitionDelay =
              originalDelay;
          } else {
            element.style.removeProperty(
              "transition-delay",
            );
          }

          element.style.removeProperty(
            "--reveal-delay",
          );
        },
      );

      originalTransitionDelays.clear();
      pendingAddedElements.clear();
      pendingRemovedElements.clear();
    };
  }, []);

  return null;
}