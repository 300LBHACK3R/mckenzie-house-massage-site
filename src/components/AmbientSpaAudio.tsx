"use client";

import { useEffect, useRef, useState } from "react";

const AUDIO_SRC = "/audio/spa-ambience.mp3";
const STORAGE_KEY = "mhm-ambient-audio-v2-enabled";
const DISMISSED_KEY = "mhm-ambient-audio-v2-dismissed";

export function AmbientSpaAudio() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [ready, setReady] = useState(false);
  const [enabled, setEnabled] = useState(true);
  const [started, setStarted] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [audioMissing, setAudioMissing] = useState(false);

  useEffect(() => {
    const audio = new Audio(AUDIO_SRC);

    audio.loop = true;
    audio.preload = "auto";
    audio.volume = 0.16;

    audio.addEventListener("play", () => setStarted(true));
    audio.addEventListener("pause", () => setStarted(false));
    audio.addEventListener("error", () => setAudioMissing(true));

    audioRef.current = audio;

    const savedPreference = window.localStorage.getItem(STORAGE_KEY);
    const savedDismissed = window.localStorage.getItem(DISMISSED_KEY);

    setEnabled(savedPreference !== "off");
    setDismissed(savedDismissed === "true");
    setReady(true);

    return () => {
      audio.pause();
      audio.src = "";
      audioRef.current = null;
    };
  }, []);

  const startAudio = async () => {
    const audio = audioRef.current;

    if (!audio || !enabled || audioMissing) {
      return;
    }

    try {
      audio.volume = 0.16;
      await audio.play();

      setStarted(true);
      setDismissed(true);
      window.localStorage.setItem(STORAGE_KEY, "on");
      window.localStorage.setItem(DISMISSED_KEY, "true");
    } catch {
      setStarted(false);
    }
  };

  useEffect(() => {
    if (!ready || !enabled || started || audioMissing) {
      return;
    }

    const handleFirstInteraction = () => {
      void startAudio();

      window.removeEventListener("pointerdown", handleFirstInteraction);
      window.removeEventListener("keydown", handleFirstInteraction);
      window.removeEventListener("touchstart", handleFirstInteraction);
    };

    window.addEventListener("pointerdown", handleFirstInteraction, {
      passive: true,
    });
    window.addEventListener("keydown", handleFirstInteraction);
    window.addEventListener("touchstart", handleFirstInteraction, {
      passive: true,
    });

    return () => {
      window.removeEventListener("pointerdown", handleFirstInteraction);
      window.removeEventListener("keydown", handleFirstInteraction);
      window.removeEventListener("touchstart", handleFirstInteraction);
    };
  }, [ready, enabled, started, audioMissing]);

  const turnOn = async () => {
    setEnabled(true);
    window.localStorage.setItem(STORAGE_KEY, "on");
    await startAudio();
  };

  const turnOff = () => {
    const audio = audioRef.current;

    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }

    setEnabled(false);
    setStarted(false);
    setDismissed(true);

    window.localStorage.setItem(STORAGE_KEY, "off");
    window.localStorage.setItem(DISMISSED_KEY, "true");
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
