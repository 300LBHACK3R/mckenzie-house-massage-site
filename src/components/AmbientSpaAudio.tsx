"use client";

import { useEffect, useRef, useState } from "react";

type AudioNodes = {
  context: AudioContext;
  master: GainNode;
  nodes: AudioNode[];
  timers: number[];
};

const STORAGE_KEY = "mhm-ambient-audio-enabled";
const DISMISSED_KEY = "mhm-ambient-audio-dismissed";

function createAmbientAudio(): AudioNodes | null {
  const AudioContextClass =
    window.AudioContext ||
    (window as typeof window & { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext;

  if (!AudioContextClass) {
    return null;
  }

  const context = new AudioContextClass();
  const master = context.createGain();

  master.gain.value = 0.018;
  master.connect(context.destination);

  const nodes: AudioNode[] = [];
  const timers: number[] = [];

  [174, 220, 261.63].forEach((frequency, index) => {
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    const filter = context.createBiquadFilter();

    oscillator.type = "sine";
    oscillator.frequency.value = frequency;

    filter.type = "lowpass";
    filter.frequency.value = 620 + index * 80;
    filter.Q.value = 0.55;

    gain.gain.value = 0.0045;

    oscillator.connect(filter);
    filter.connect(gain);
    gain.connect(master);

    oscillator.start();

    nodes.push(oscillator, filter, gain);
  });

  const noiseBuffer = context.createBuffer(
    1,
    context.sampleRate * 2,
    context.sampleRate,
  );

  const channel = noiseBuffer.getChannelData(0);

  for (let index = 0; index < channel.length; index += 1) {
    channel[index] = (Math.random() * 2 - 1) * 0.12;
  }

  const noise = context.createBufferSource();
  const noiseFilter = context.createBiquadFilter();
  const noiseGain = context.createGain();

  noise.buffer = noiseBuffer;
  noise.loop = true;

  noiseFilter.type = "lowpass";
  noiseFilter.frequency.value = 760;
  noiseFilter.Q.value = 0.45;

  noiseGain.gain.value = 0.0028;

  noise.connect(noiseFilter);
  noiseFilter.connect(noiseGain);
  noiseGain.connect(master);
  noise.start();

  nodes.push(noise, noiseFilter, noiseGain);

  const playSoftChime = () => {
    if (context.state === "closed") {
      return;
    }

    const now = context.currentTime;
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    const filter = context.createBiquadFilter();

    oscillator.type = "sine";
    oscillator.frequency.value = [523.25, 587.33, 659.25][
      Math.floor(Math.random() * 3)
    ];

    filter.type = "lowpass";
    filter.frequency.value = 2200;
    filter.Q.value = 0.3;

    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.006, now + 0.06);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.8);

    oscillator.connect(filter);
    filter.connect(gain);
    gain.connect(master);

    oscillator.start(now);
    oscillator.stop(now + 3);

    nodes.push(oscillator, filter, gain);
  };

  const chimeTimer = window.setInterval(playSoftChime, 14000);
  timers.push(chimeTimer);

  return {
    context,
    master,
    nodes,
    timers,
  };
}

function stopAmbientAudio(audio: AudioNodes | null) {
  if (!audio) {
    return;
  }

  audio.timers.forEach((timer) => window.clearInterval(timer));

  if (audio.context.state !== "closed") {
    void audio.context.close();
  }
}

export function AmbientSpaAudio() {
  const audioRef = useRef<AudioNodes | null>(null);
  const [enabled, setEnabled] = useState(true);
  const [started, setStarted] = useState(false);
  const [ready, setReady] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const savedPreference = window.localStorage.getItem(STORAGE_KEY);
    const savedDismissed = window.localStorage.getItem(DISMISSED_KEY);

    setEnabled(savedPreference !== "off");
    setDismissed(savedDismissed === "true");
    setReady(true);
  }, []);

  const startAudio = async () => {
    if (!enabled) {
      return;
    }

    if (!audioRef.current) {
      audioRef.current = createAmbientAudio();
    }

    const audio = audioRef.current;

    if (!audio) {
      return;
    }

    if (audio.context.state === "suspended") {
      await audio.context.resume();
    }

    setStarted(true);
    setDismissed(true);
    window.localStorage.setItem(STORAGE_KEY, "on");
    window.localStorage.setItem(DISMISSED_KEY, "true");
  };

  useEffect(() => {
    if (!ready || !enabled || started) {
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
  }, [ready, enabled, started]);

  useEffect(() => {
    if (enabled) {
      return;
    }

    stopAmbientAudio(audioRef.current);
    audioRef.current = null;
    setStarted(false);
  }, [enabled]);

  useEffect(() => {
    return () => {
      stopAmbientAudio(audioRef.current);
      audioRef.current = null;
    };
  }, []);

  const turnOn = async () => {
    setEnabled(true);
    window.localStorage.setItem(STORAGE_KEY, "on");
    await startAudio();
  };

  const turnOff = () => {
    setEnabled(false);
    setStarted(false);
    setDismissed(true);
    window.localStorage.setItem(STORAGE_KEY, "off");
    window.localStorage.setItem(DISMISSED_KEY, "true");

    stopAmbientAudio(audioRef.current);
    audioRef.current = null;
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
        <span aria-hidden="true">{enabled && started ? "♪" : "♪"}</span>
        <strong>{enabled && started ? "Sound On" : "Enable Sound"}</strong>
      </button>
    </>
  );
}
