"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

const AUDIO_SRC = "/audio/spa-ambience.mp3";

const STORAGE_KEY =
  "mhm-ambient-audio-v3-enabled";

const DISMISSED_KEY =
  "mhm-ambient-audio-v3-dismissed";

const POSITION_KEY =
  "mhm-ambient-audio-v3-position";

const PLAYING_KEY =
  "mhm-ambient-audio-v3-was-playing";

const DEFAULT_VOLUME = 0.16;
const POSITION_SAVE_INTERVAL_MS = 1_500;
const FADE_IN_DURATION_MS = 850;
const FADE_OUT_DURATION_MS = 550;

type StorageType = "local" | "session";

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

function getStorage(
  type: StorageType,
): Storage | null {
  try {
    return type === "local"
      ? window.localStorage
      : window.sessionStorage;
  } catch {
    return null;
  }
}

function readStorageValue(
  type: StorageType,
  key: string,
): string | null {
  try {
    return getStorage(type)?.getItem(key) ?? null;
  } catch {
    return null;
  }
}

function writeStorageValue(
  type: StorageType,
  key: string,
  value: string,
): void {
  try {
    getStorage(type)?.setItem(key, value);
  } catch {
    /*
     * Storage can be unavailable in restrictive privacy modes.
     * Audio should continue working for the current page session.
     */
  }
}

function readSavedPosition(): number {
  const savedPosition = readStorageValue(
    "session",
    POSITION_KEY,
  );

  const parsedPosition = Number(savedPosition);

  if (
    !Number.isFinite(parsedPosition) ||
    parsedPosition < 0
  ) {
    return 0;
  }

  return parsedPosition;
}

function savePlaybackPosition(
  audio: HTMLAudioElement,
): void {
  if (
    !Number.isFinite(audio.currentTime) ||
    audio.currentTime < 0
  ) {
    return;
  }

  writeStorageValue(
    "session",
    POSITION_KEY,
    String(audio.currentTime),
  );
}

function restorePlaybackPosition(
  audio: HTMLAudioElement,
): void {
  const savedPosition = readSavedPosition();

  if (
    savedPosition <= 0 ||
    !Number.isFinite(audio.duration) ||
    audio.duration <= 0
  ) {
    return;
  }

  try {
    audio.currentTime =
      savedPosition % audio.duration;
  } catch {
    /*
     * Some browsers reject currentTime changes before media metadata
     * is fully available. The loadedmetadata handler will retry.
     */
  }
}

function prefersReducedMotion(): boolean {
  return window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;
}

export function AmbientSpaAudio() {
  const audioRef =
    useRef<HTMLAudioElement | null>(null);

  const positionTimerRef =
    useRef<number | null>(null);

  const fadeFrameRef =
    useRef<number | null>(null);

  const fadeGenerationRef = useRef(0);

  const enabledRef = useRef(false);
  const audioMissingRef = useRef(false);

  const [ready, setReady] = useState(false);

  const [enabled, setEnabled] =
    useState(false);

  const [started, setStarted] =
    useState(false);

  const [dismissed, setDismissed] =
    useState(false);

  const [audioMissing, setAudioMissing] =
    useState(false);

  const stopPositionTimer = useCallback(() => {
    if (positionTimerRef.current === null) {
      return;
    }

    window.clearInterval(
      positionTimerRef.current,
    );

    positionTimerRef.current = null;
  }, []);

  const startPositionTimer = useCallback(() => {
    stopPositionTimer();

    positionTimerRef.current =
      window.setInterval(() => {
        const audio = audioRef.current;

        if (!audio || audio.paused) {
          return;
        }

        savePlaybackPosition(audio);
      }, POSITION_SAVE_INTERVAL_MS);
  }, [stopPositionTimer]);

  const cancelVolumeFade = useCallback(() => {
    fadeGenerationRef.current += 1;

    if (fadeFrameRef.current === null) {
      return;
    }

    window.cancelAnimationFrame(
      fadeFrameRef.current,
    );

    fadeFrameRef.current = null;
  }, []);

  const fadeToVolume = useCallback(
    (
      audio: HTMLAudioElement,
      targetVolume: number,
      durationMs: number,
      onComplete?: () => void,
    ) => {
      cancelVolumeFade();

      const normalizedTarget = clamp(
        targetVolume,
        0,
        1,
      );

      if (
        durationMs <= 0 ||
        prefersReducedMotion()
      ) {
        audio.volume = normalizedTarget;
        onComplete?.();
        return;
      }

      const fadeGeneration =
        fadeGenerationRef.current;

      const startingVolume = audio.volume;
      const volumeDifference =
        normalizedTarget - startingVolume;

      const startTime = performance.now();

      const updateVolume = (
        currentTime: number,
      ) => {
        if (
          fadeGeneration !==
          fadeGenerationRef.current
        ) {
          return;
        }

        const progress = clamp(
          (currentTime - startTime) /
            durationMs,
          0,
          1,
        );

        /*
         * Smooth ease-out curve. This sounds more natural than a
         * linear volume change, particularly at low volumes.
         */
        const easedProgress =
          1 - Math.pow(1 - progress, 3);

        audio.volume = clamp(
          startingVolume +
            volumeDifference *
              easedProgress,
          0,
          1,
        );

        if (progress >= 1) {
          fadeFrameRef.current = null;
          audio.volume = normalizedTarget;
          onComplete?.();
          return;
        }

        fadeFrameRef.current =
          window.requestAnimationFrame(
            updateVolume,
          );
      };

      fadeFrameRef.current =
        window.requestAnimationFrame(
          updateVolume,
        );
    },
    [cancelVolumeFade],
  );

  const startAudio = useCallback(
    async (
      userInitiated: boolean,
    ): Promise<boolean> => {
      const audio = audioRef.current;

      if (
        !audio ||
        audioMissingRef.current
      ) {
        return false;
      }

      if (
        !userInitiated &&
        !enabledRef.current
      ) {
        return false;
      }

      if (userInitiated) {
        enabledRef.current = true;
        setEnabled(true);

        writeStorageValue(
          "local",
          STORAGE_KEY,
          "on",
        );

        setDismissed(true);

        writeStorageValue(
          "local",
          DISMISSED_KEY,
          "true",
        );
      }

      audio.preload = "auto";

      if (
        audio.networkState ===
        HTMLMediaElement.NETWORK_EMPTY
      ) {
        audio.load();
      }

      if (
        audio.currentTime <= 0.25 &&
        audio.readyState >=
          HTMLMediaElement.HAVE_METADATA
      ) {
        restorePlaybackPosition(audio);
      }

      cancelVolumeFade();
      audio.volume = 0;

      try {
        await audio.play();

        fadeToVolume(
          audio,
          DEFAULT_VOLUME,
          FADE_IN_DURATION_MS,
        );

        return true;
      } catch {
        setStarted(false);

        /*
         * Browsers may reject autoplay after a reload. Because the
         * preference remains enabled, the next genuine interaction
         * will safely resume it.
         */
        return false;
      }
    },
    [
      cancelVolumeFade,
      fadeToVolume,
    ],
  );

  useEffect(() => {
    const savedPreference =
      readStorageValue(
        "local",
        STORAGE_KEY,
      );

    const savedDismissed =
      readStorageValue(
        "local",
        DISMISSED_KEY,
      );

    const preferenceEnabled =
      savedPreference === "on";

    const audio =
      document.createElement("audio");

    audio.src = AUDIO_SRC;
    audio.loop = true;
    audio.preload = preferenceEnabled
      ? "auto"
      : "metadata";
    audio.volume = 0;

    audioRef.current = audio;

    enabledRef.current =
      preferenceEnabled;

    setEnabled(preferenceEnabled);

    setDismissed(
      savedDismissed === "true",
    );

    const handleLoadedMetadata = () => {
      restorePlaybackPosition(audio);
    };

    const handlePlay = () => {
      setStarted(true);

      writeStorageValue(
        "session",
        PLAYING_KEY,
        "true",
      );

      startPositionTimer();
    };

    const handlePause = () => {
      setStarted(false);

      savePlaybackPosition(audio);
      stopPositionTimer();
    };

    const handleError = () => {
      audioMissingRef.current = true;

      setAudioMissing(true);
      setStarted(false);

      stopPositionTimer();
      cancelVolumeFade();
    };

    const saveLifecycleState = () => {
      savePlaybackPosition(audio);

      writeStorageValue(
        "session",
        PLAYING_KEY,
        enabledRef.current &&
          !audio.paused
          ? "true"
          : "false",
      );
    };

    const handleVisibilityChange = () => {
      if (
        document.visibilityState ===
        "hidden"
      ) {
        saveLifecycleState();
      }
    };

    const handleStorageChange = (
      event: StorageEvent,
    ) => {
      if (
        event.storageArea !==
          getStorage("local") ||
        event.key !== STORAGE_KEY
      ) {
        return;
      }

      if (event.newValue === "off") {
        enabledRef.current = false;
        setEnabled(false);
        setStarted(false);

        fadeToVolume(
          audio,
          0,
          FADE_OUT_DURATION_MS,
          () => {
            audio.pause();
          },
        );

        return;
      }

      if (event.newValue === "on") {
        enabledRef.current = true;
        setEnabled(true);
      }
    };

    audio.addEventListener(
      "loadedmetadata",
      handleLoadedMetadata,
    );

    audio.addEventListener(
      "play",
      handlePlay,
    );

    audio.addEventListener(
      "pause",
      handlePause,
    );

    audio.addEventListener(
      "error",
      handleError,
    );

    window.addEventListener(
      "pagehide",
      saveLifecycleState,
    );

    window.addEventListener(
      "beforeunload",
      saveLifecycleState,
    );

    window.addEventListener(
      "storage",
      handleStorageChange,
    );

    document.addEventListener(
      "visibilitychange",
      handleVisibilityChange,
    );

    setReady(true);

    return () => {
      const wasPlaying =
        enabledRef.current &&
        !audio.paused;

      savePlaybackPosition(audio);

      /*
       * Remove the pause listener before pausing. Otherwise cleanup
       * would incorrectly overwrite the saved playing state.
       */
      audio.removeEventListener(
        "loadedmetadata",
        handleLoadedMetadata,
      );

      audio.removeEventListener(
        "play",
        handlePlay,
      );

      audio.removeEventListener(
        "pause",
        handlePause,
      );

      audio.removeEventListener(
        "error",
        handleError,
      );

      window.removeEventListener(
        "pagehide",
        saveLifecycleState,
      );

      window.removeEventListener(
        "beforeunload",
        saveLifecycleState,
      );

      window.removeEventListener(
        "storage",
        handleStorageChange,
      );

      document.removeEventListener(
        "visibilitychange",
        handleVisibilityChange,
      );

      writeStorageValue(
        "session",
        PLAYING_KEY,
        wasPlaying ? "true" : "false",
      );

      stopPositionTimer();
      cancelVolumeFade();

      audio.pause();
      audio.removeAttribute("src");
      audio.load();

      audioRef.current = null;
    };
  }, [
    cancelVolumeFade,
    fadeToVolume,
    startPositionTimer,
    stopPositionTimer,
  ]);

  /*
   * Returning visitors who previously enabled the ambience are
   * allowed to resume automatically. If browser autoplay policy
   * blocks the first attempt, their next interaction resumes it.
   *
   * First-time visitors are never started by an unrelated click.
   * They must explicitly choose Enable Ambience.
   */
  useEffect(() => {
    if (
      !ready ||
      !enabled ||
      started ||
      audioMissing
    ) {
      return;
    }

    const wasPlaying =
      readStorageValue(
        "session",
        PLAYING_KEY,
      ) === "true";

    if (wasPlaying) {
      void startAudio(false);
    }

    const handleResumeInteraction = () => {
      void startAudio(false);
    };

    window.addEventListener(
      "pointerdown",
      handleResumeInteraction,
      {
        passive: true,
        once: true,
      },
    );

    window.addEventListener(
      "keydown",
      handleResumeInteraction,
      {
        once: true,
      },
    );

    window.addEventListener(
      "touchstart",
      handleResumeInteraction,
      {
        passive: true,
        once: true,
      },
    );

    return () => {
      window.removeEventListener(
        "pointerdown",
        handleResumeInteraction,
      );

      window.removeEventListener(
        "keydown",
        handleResumeInteraction,
      );

      window.removeEventListener(
        "touchstart",
        handleResumeInteraction,
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
    await startAudio(true);
  };

  const turnOff = () => {
    const audio = audioRef.current;

    enabledRef.current = false;

    setEnabled(false);
    setStarted(false);
    setDismissed(true);

    writeStorageValue(
      "local",
      STORAGE_KEY,
      "off",
    );

    writeStorageValue(
      "local",
      DISMISSED_KEY,
      "true",
    );

    writeStorageValue(
      "session",
      PLAYING_KEY,
      "false",
    );

    if (!audio) {
      return;
    }

    savePlaybackPosition(audio);

    fadeToVolume(
      audio,
      0,
      FADE_OUT_DURATION_MS,
      () => {
        if (!enabledRef.current) {
          audio.pause();
        }
      },
    );

    stopPositionTimer();
  };

  const dismissPrompt = () => {
    setDismissed(true);

    writeStorageValue(
      "local",
      DISMISSED_KEY,
      "true",
    );
  };

  if (!ready) {
    return null;
  }

  const showInvitation =
    !dismissed &&
    !started;

  const toggleLabel = audioMissing
    ? "Sound Unavailable"
    : enabled && started
      ? "Sound On"
      : enabled
        ? "Resume Sound"
        : "Enable Sound";

  return (
    <>
      {showInvitation ? (
        <aside
          className="ambient-audio-invite"
          aria-label="Optional calming background ambience"
          data-state={
            audioMissing
              ? "unavailable"
              : enabled
                ? "paused"
                : "available"
          }
        >
          <button
            className="ambient-audio-invite__close"
            type="button"
            onClick={dismissPrompt}
            aria-label="Dismiss ambience prompt"
          >
            <span aria-hidden="true">
              ×
            </span>
          </button>

          <span className="ambient-audio-invite__eyebrow">
            Optional Spa Ambience
          </span>

          <strong>
            Add a calming layer to your visit.
          </strong>

          <p>
            Soft background ambience creates a
            more peaceful experience while you
            explore the website. It remains
            completely optional and can be
            turned off at any time.
          </p>

          {!audioMissing ? (
            <button
              className="ambient-audio-invite__button"
              type="button"
              onClick={() => {
                void turnOn();
              }}
            >
              {enabled
                ? "Resume Ambience"
                : "Enable Ambience"}
            </button>
          ) : (
            <small className="ambient-audio-invite__warning">
              Background ambience is temporarily
              unavailable.
            </small>
          )}
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
        disabled={audioMissing}
        aria-pressed={
          enabled && started
        }
        aria-label={
          audioMissing
            ? "Ambient sound is unavailable"
            : enabled && started
              ? "Turn ambient sound off"
              : "Turn ambient sound on"
        }
        title={
          audioMissing
            ? "Ambient sound unavailable"
            : enabled && started
              ? "Turn ambient sound off"
              : "Turn ambient sound on"
        }
        data-state={
          audioMissing
            ? "unavailable"
            : enabled && started
              ? "playing"
              : enabled
                ? "paused"
                : "disabled"
        }
      >
        <span aria-hidden="true">
          ♪
        </span>

        <strong>{toggleLabel}</strong>
      </button>
    </>
  );
}