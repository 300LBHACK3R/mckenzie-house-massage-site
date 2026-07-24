"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

function isModifiedClick(event: MouseEvent) {
  return (
    event.metaKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.altKey ||
    event.button !== 0
  );
}

function getAnchorFromEvent(event: MouseEvent) {
  const target = event.target;

  if (!(target instanceof Element)) {
    return null;
  }

  return target.closest<HTMLAnchorElement>("a[href]");
}

function isUnsupportedProtocol(href: string) {
  const normalizedHref = href.trim().toLowerCase();

  return (
    normalizedHref.startsWith("mailto:") ||
    normalizedHref.startsWith("tel:") ||
    normalizedHref.startsWith("sms:") ||
    normalizedHref.startsWith("javascript:") ||
    normalizedHref.startsWith("data:")
  );
}

function scrollToHash(hash: string) {
  const rawId = hash.replace(/^#/, "");

  if (!rawId) {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });

    return;
  }

  let decodedId = rawId;

  try {
    decodedId = decodeURIComponent(rawId);
  } catch {
    decodedId = rawId;
  }

  const element =
    document.getElementById(decodedId) ||
    document.querySelector<HTMLElement>(
      `[name="${CSS.escape(decodedId)}"]`,
    );

  if (!element) {
    return;
  }

  element.scrollIntoView({
    behavior: "smooth",
    block: "start",
  });

  if (element instanceof HTMLElement && element.tabIndex >= 0) {
    element.focus({
      preventScroll: true,
    });
  }
}

export function PersistentSiteNavigation() {
  const router = useRouter();

  useEffect(() => {
    const handleInternalNavigation = (event: MouseEvent) => {
      if (event.defaultPrevented || isModifiedClick(event)) {
        return;
      }

      const anchor = getAnchorFromEvent(event);

      if (!anchor) {
        return;
      }

      const rawHref = anchor.getAttribute("href");

      if (!rawHref || isUnsupportedProtocol(rawHref)) {
        return;
      }

      if (
        anchor.hasAttribute("download") ||
        anchor.target === "_blank" ||
        anchor.target === "_parent" ||
        anchor.target === "_top"
      ) {
        return;
      }

      let destination: URL;

      try {
        destination = new URL(anchor.href, window.location.href);
      } catch {
        return;
      }

      if (destination.origin !== window.location.origin) {
        return;
      }

      const currentUrl = new URL(window.location.href);
      const sameDocument =
        destination.pathname === currentUrl.pathname &&
        destination.search === currentUrl.search;

      if (sameDocument && destination.hash) {
        event.preventDefault();

        const nextUrl = `${destination.pathname}${destination.search}${destination.hash}`;
        window.history.pushState(null, "", nextUrl);
        scrollToHash(destination.hash);

        return;
      }

      if (sameDocument && !destination.hash) {
        return;
      }

      event.preventDefault();

      const nextRoute = `${destination.pathname}${destination.search}${destination.hash}`;
      router.push(nextRoute);
    };

    document.addEventListener("click", handleInternalNavigation);

    return () => {
      document.removeEventListener("click", handleInternalNavigation);
    };
  }, [router]);

  return null;
}