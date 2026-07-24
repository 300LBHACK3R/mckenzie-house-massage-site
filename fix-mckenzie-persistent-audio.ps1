$ErrorActionPreference = "Stop"

$ProjectRoot = "C:\Users\techn\heather-massage-site"

if (-not (Test-Path $ProjectRoot)) {
    throw "Project folder not found: $ProjectRoot"
}

Set-Location $ProjectRoot

function Write-Utf8NoBom {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Path,

        [Parameter(Mandatory = $true)]
        [string]$Content
    )

    $directory = Split-Path -Parent $Path

    if ($directory -and -not (Test-Path $directory)) {
        New-Item -ItemType Directory -Path $directory -Force | Out-Null
    }

    $utf8NoBom = New-Object System.Text.UTF8Encoding($false)
    [System.IO.File]::WriteAllText($Path, $Content, $utf8NoBom)
}

Write-Host ""
Write-Host "Installing persistent site-wide ambient audio..." -ForegroundColor Cyan
Write-Host ""

# ---------------------------------------------------------------------------
# 1. CLIENT-SIDE INTERNAL NAVIGATION
#
# The site currently uses normal anchor tags for many internal links. Those
# anchors perform a full document reload, which destroys and recreates the
# root-layout audio player. This component upgrades same-origin links to
# Next.js client-side navigation while leaving external, telephone, email,
# SMS, downloads, new-tab links, and modified clicks untouched.
# ---------------------------------------------------------------------------

$persistentNavigation = @'
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
'@

Write-Utf8NoBom `
    -Path "src/components/PersistentSiteNavigation.tsx" `
    -Content $persistentNavigation

# ---------------------------------------------------------------------------
# 2. PERSISTENT AMBIENT AUDIO PLAYER
#
# Client-side routing keeps this component mounted continuously. Session
# storage also remembers playback position as a fallback for browser refreshes
# and accidental full reloads.
# ---------------------------------------------------------------------------

$ambientAudio = @'
"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const AUDIO_SRC = "/audio/spa-ambience.mp3";
const STORAGE_KEY = "mhm-ambient-audio-v3-enabled";
const DISMISSED_KEY = "mhm-ambient-audio-v3-dismissed";
const POSITION_KEY = "mhm-ambient-audio-v3-position";
const PLAYING_KEY = "mhm-ambient-audio-v3-was-playing";

const DEFAULT_VOLUME = 0.16;
const POSITION_SAVE_INTERVAL_MS = 1500;

function readSavedPosition() {
  const savedPosition = window.sessionStorage.getItem(POSITION_KEY);
  const parsedPosition = Number(savedPosition);

  if (!Number.isFinite(parsedPosition) || parsedPosition < 0) {
    return 0;
  }

  return parsedPosition;
}

function savePlaybackPosition(audio: HTMLAudioElement) {
  if (!Number.isFinite(audio.currentTime) || audio.currentTime < 0) {
    return;
  }

  window.sessionStorage.setItem(
    POSITION_KEY,
    String(audio.currentTime),
  );
}

export function AmbientSpaAudio() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const positionTimerRef = useRef<number | null>(null);

  const [ready, setReady] = useState(false);
  const [enabled, setEnabled] = useState(true);
  const [started, setStarted] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [audioMissing, setAudioMissing] = useState(false);

  const stopPositionTimer = useCallback(() => {
    if (positionTimerRef.current === null) {
      return;
    }

    window.clearInterval(positionTimerRef.current);
    positionTimerRef.current = null;
  }, []);

  const startPositionTimer = useCallback(() => {
    stopPositionTimer();

    positionTimerRef.current = window.setInterval(() => {
      const audio = audioRef.current;

      if (!audio || audio.paused) {
        return;
      }

      savePlaybackPosition(audio);
    }, POSITION_SAVE_INTERVAL_MS);
  }, [stopPositionTimer]);

  useEffect(() => {
    const audio = new Audio(AUDIO_SRC);
    const savedPreference = window.localStorage.getItem(STORAGE_KEY);
    const savedDismissed = window.localStorage.getItem(DISMISSED_KEY);
    const savedPosition = readSavedPosition();

    audio.loop = true;
    audio.preload = "auto";
    audio.volume = DEFAULT_VOLUME;

    const restorePosition = () => {
      if (
        savedPosition > 0 &&
        Number.isFinite(audio.duration) &&
        audio.duration > 0
      ) {
        audio.currentTime = savedPosition % audio.duration;
      }
    };

    const handlePlay = () => {
      setStarted(true);
      window.sessionStorage.setItem(PLAYING_KEY, "true");
      startPositionTimer();
    };

    const handlePause = () => {
      setStarted(false);
      savePlaybackPosition(audio);
      stopPositionTimer();
    };

    const handleError = () => {
      setAudioMissing(true);
      stopPositionTimer();
    };

    const handleBeforeUnload = () => {
      savePlaybackPosition(audio);
      window.sessionStorage.setItem(
        PLAYING_KEY,
        audio.paused ? "false" : "true",
      );
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        savePlaybackPosition(audio);
      }
    };

    audio.addEventListener("loadedmetadata", restorePosition);
    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);
    audio.addEventListener("error", handleError);

    window.addEventListener("beforeunload", handleBeforeUnload);
    document.addEventListener(
      "visibilitychange",
      handleVisibilityChange,
    );

    audioRef.current = audio;

    setEnabled(savedPreference !== "off");
    setDismissed(savedDismissed === "true");
    setReady(true);

    return () => {
      savePlaybackPosition(audio);
      stopPositionTimer();

      audio.removeEventListener("loadedmetadata", restorePosition);
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handlePause);
      audio.removeEventListener("error", handleError);

      window.removeEventListener("beforeunload", handleBeforeUnload);
      document.removeEventListener(
        "visibilitychange",
        handleVisibilityChange,
      );

      audio.pause();
      audio.src = "";
      audioRef.current = null;
    };
  }, [startPositionTimer, stopPositionTimer]);

  const startAudio = useCallback(async () => {
    const audio = audioRef.current;

    if (!audio || !enabled || audioMissing) {
      return;
    }

    try {
      audio.volume = DEFAULT_VOLUME;
      await audio.play();

      setStarted(true);
      setDismissed(true);

      window.localStorage.setItem(STORAGE_KEY, "on");
      window.localStorage.setItem(DISMISSED_KEY, "true");
      window.sessionStorage.setItem(PLAYING_KEY, "true");
    } catch {
      setStarted(false);
    }
  }, [audioMissing, enabled]);

  useEffect(() => {
    if (!ready || !enabled || started || audioMissing) {
      return;
    }

    const wasPlaying =
      window.sessionStorage.getItem(PLAYING_KEY) === "true";

    if (wasPlaying) {
      void startAudio();
    }

    const handleFirstInteraction = () => {
      void startAudio();

      window.removeEventListener(
        "pointerdown",
        handleFirstInteraction,
      );
      window.removeEventListener("keydown", handleFirstInteraction);
      window.removeEventListener(
        "touchstart",
        handleFirstInteraction,
      );
    };

    window.addEventListener("pointerdown", handleFirstInteraction, {
      passive: true,
    });
    window.addEventListener("keydown", handleFirstInteraction);
    window.addEventListener("touchstart", handleFirstInteraction, {
      passive: true,
    });

    return () => {
      window.removeEventListener(
        "pointerdown",
        handleFirstInteraction,
      );
      window.removeEventListener("keydown", handleFirstInteraction);
      window.removeEventListener(
        "touchstart",
        handleFirstInteraction,
      );
    };
  }, [
    ready,
    enabled,
    started,
    audioMissing,
    startAudio,
  ]);

  const turnOn = async () => {
    setEnabled(true);
    window.localStorage.setItem(STORAGE_KEY, "on");

    const audio = audioRef.current;

    if (audio) {
      const savedPosition = readSavedPosition();

      if (
        savedPosition > 0 &&
        Number.isFinite(audio.duration) &&
        audio.duration > 0
      ) {
        audio.currentTime = savedPosition % audio.duration;
      }
    }

    await startAudio();
  };

  const turnOff = () => {
    const audio = audioRef.current;

    if (audio) {
      savePlaybackPosition(audio);
      audio.pause();
    }

    stopPositionTimer();

    setEnabled(false);
    setStarted(false);
    setDismissed(true);

    window.localStorage.setItem(STORAGE_KEY, "off");
    window.localStorage.setItem(DISMISSED_KEY, "true");
    window.sessionStorage.setItem(PLAYING_KEY, "false");
  };

  const dismissPrompt = () => {
    setDismissed(true);
    window.localStorage.setItem(DISMISSED_KEY, "true");
  };

  if (!ready) {
    return null;
  }

  return (
    <>
      {enabled && !started && !dismissed ? (
        <aside
          className="ambient-audio-invite"
          aria-label="Enable calming background ambience"
        >
          <button
            className="ambient-audio-invite__close"
            type="button"
            onClick={dismissPrompt}
            aria-label="Dismiss ambience prompt"
          >
            ×
          </button>

          <span className="ambient-audio-invite__eyebrow">
            Optional Spa Ambience
          </span>

          <strong>Tap to add calming background sound.</strong>

          <p>
            A soft, subtle ambience can make the visit feel more peaceful while
            you explore the site.
          </p>

          <button
            className="ambient-audio-invite__button"
            type="button"
            onClick={() => {
              void turnOn();
            }}
          >
            Enable Ambience
          </button>

          {audioMissing ? (
            <small className="ambient-audio-invite__warning">
              Add spa-ambience.mp3 to public/audio to enable sound.
            </small>
          ) : null}
        </aside>
      ) : null}

      <button
        className="ambient-audio-toggle"
        type="button"
        onClick={() => {
          if (enabled && started) {
            turnOff();
            return;
          }

          void turnOn();
        }}
        aria-pressed={enabled && started}
        aria-label={
          enabled && started
            ? "Turn ambient sound off"
            : "Turn ambient sound on"
        }
      >
        <span aria-hidden="true">♪</span>
        <strong>{enabled && started ? "Sound On" : "Enable Sound"}</strong>
      </button>
    </>
  );
}
'@

Write-Utf8NoBom `
    -Path "src/components/AmbientSpaAudio.tsx" `
    -Content $ambientAudio

# ---------------------------------------------------------------------------
# 3. ROOT LAYOUT
#
# Both persistent components live outside page content so App Router route
# changes replace only {children}; the audio element remains alive.
# ---------------------------------------------------------------------------

$layout = @'
import type { Metadata, Viewport } from "next";
import { AmbientSpaAudio } from "@/components/AmbientSpaAudio";
import { PersistentSiteNavigation } from "@/components/PersistentSiteNavigation";
import "./globals.css";
import { siteConfig } from "@/lib/site";

const siteUrl = siteConfig.domain;
const pageTitle = `${siteConfig.businessName} | Massage Therapy in Okotoks`;
const pageDescription =
  "Personalized massage therapy in Okotoks and Calgary with calm, professional care, clear communication, and convenient online booking through ClinicSense.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  applicationName: siteConfig.businessName,
  title: {
    default: pageTitle,
    template: `%s | ${siteConfig.businessName}`,
  },
  description: pageDescription,
  keywords: [
    "McKenzie House Massage",
    "Okotoks massage",
    "massage therapy Okotoks",
    "therapeutic massage Okotoks",
    "relaxation massage Okotoks",
    "deep tissue massage Okotoks",
    "Calgary massage therapy",
    "Heather Knorr massage",
    "ClinicSense booking",
  ],
  authors: [{ name: siteConfig.legalName }],
  creator: siteConfig.legalName,
  publisher: siteConfig.businessName,
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  openGraph: {
    title: pageTitle,
    description: pageDescription,
    url: "/",
    siteName: siteConfig.businessName,
    type: "website",
    locale: "en_CA",
  },
  twitter: {
    card: "summary_large_image",
    title: pageTitle,
    description: pageDescription,
  },
  category: "Health and wellness",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#fbf7ef",
  colorScheme: "light",
};

const structuredData = {
  "@context": "https://schema.org",
  "@type": "HealthAndBeautyBusiness",
  name: siteConfig.businessName,
  alternateName: siteConfig.currentName,
  description: pageDescription,
  url: siteUrl,
  areaServed: [
    {
      "@type": "City",
      name: "Okotoks",
      addressRegion: "Alberta",
      addressCountry: "CA",
    },
    {
      "@type": "City",
      name: "Calgary",
      addressRegion: "Alberta",
      addressCountry: "CA",
    },
  ],
  founder: {
    "@type": "Person",
    name: siteConfig.legalName,
  },
  knowsAbout: [
    "Massage therapy",
    "Therapeutic massage",
    "Relaxation massage",
    "Deep tissue massage",
    "Scalp, neck and shoulder massage",
  ],
  potentialAction: {
    "@type": "ReserveAction",
    target: siteConfig.bookingUrl,
    name: "Book a massage therapy appointment",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-CA">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData).replace(
              /</g,
              "\\u003c",
            ),
          }}
        />
      </head>

      <body>
        <PersistentSiteNavigation />
        {children}
        <AmbientSpaAudio />
      </body>
    </html>
  );
}
'@

Write-Utf8NoBom `
    -Path "src/app/layout.tsx" `
    -Content $layout

# ---------------------------------------------------------------------------
# 4. VERIFY
# ---------------------------------------------------------------------------

Write-Host "Persistent routing and audio recovery installed." -ForegroundColor Green
Write-Host ""
Write-Host "Running TypeScript validation..." -ForegroundColor Cyan

npm run typecheck

Write-Host ""
Write-Host "TypeScript passed. Running production build..." -ForegroundColor Cyan

npm run build

Write-Host ""
Write-Host "Persistent ambient audio upgrade completed." -ForegroundColor Green
Write-Host ""
Write-Host "Start or restart the development server:" -ForegroundColor Yellow
Write-Host "  npm run dev"
Write-Host ""
Write-Host "Test this exact sequence:" -ForegroundColor Yellow
Write-Host "  1. Enable the music"
Write-Host "  2. Open Reviews"
Write-Host "  3. Open Contact"
Write-Host "  4. Open a service page"
Write-Host "  5. Return Home"
Write-Host ""
Write-Host "The music should continue without restarting between pages." -ForegroundColor Green
Write-Host ""
Write-Host "Current Git changes:" -ForegroundColor Cyan

git status --short
