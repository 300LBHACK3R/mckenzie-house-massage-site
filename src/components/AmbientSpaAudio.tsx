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
            Ã—
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
        <span aria-hidden="true">â™ª</span>
        <strong>{enabled && started ? "Sound On" : "Enable Sound"}</strong>
      </button>
    </>
  );
}