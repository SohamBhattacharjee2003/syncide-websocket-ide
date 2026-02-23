import { useState, useEffect, useRef, useCallback } from "react";

/**
 * useAudioLevel — detects audio levels from a MediaStream to determine who is speaking.
 *
 * Uses Web Audio API (AudioContext + AnalyserNode) to compute RMS volume.
 * Returns `isSpeaking` boolean and `audioLevel` (0-1) for visual indicators.
 *
 * @param {MediaStream|null} stream - the audio stream to monitor
 * @param {Object} options
 * @param {number} options.threshold - volume threshold to consider "speaking" (0-1, default 0.015)
 * @param {number} options.interval  - polling interval in ms (default 100)
 */
export default function useAudioLevel(stream, { threshold = 0.015, interval = 100 } = {}) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const sourceRef = useRef(null);
  const rafRef = useRef(null);

  useEffect(() => {
    if (!stream) {
      setIsSpeaking(false);
      setAudioLevel(0);
      return;
    }

    const audioTracks = stream.getAudioTracks();
    if (audioTracks.length === 0) {
      setIsSpeaking(false);
      setAudioLevel(0);
      return;
    }

    // Create audio context and analyser
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 256;
    analyser.smoothingTimeConstant = 0.5;

    const source = audioContext.createMediaStreamSource(stream);
    source.connect(analyser);
    // Don't connect to destination — we don't want to play our own audio

    audioContextRef.current = audioContext;
    analyserRef.current = analyser;
    sourceRef.current = source;

    const dataArray = new Uint8Array(analyser.frequencyBinCount);

    // Poll audio level
    const checkLevel = () => {
      analyser.getByteFrequencyData(dataArray);

      // Calculate RMS
      let sum = 0;
      for (let i = 0; i < dataArray.length; i++) {
        const normalized = dataArray[i] / 255;
        sum += normalized * normalized;
      }
      const rms = Math.sqrt(sum / dataArray.length);

      setAudioLevel(Math.min(rms * 3, 1)); // Scale up for visibility
      setIsSpeaking(rms > threshold);

      rafRef.current = setTimeout(checkLevel, interval);
    };

    checkLevel();

    return () => {
      if (rafRef.current) clearTimeout(rafRef.current);
      source.disconnect();
      analyser.disconnect();
      audioContext.close().catch(() => {});
      audioContextRef.current = null;
      analyserRef.current = null;
      sourceRef.current = null;
    };
  }, [stream, threshold, interval]);

  return { isSpeaking, audioLevel };
}
