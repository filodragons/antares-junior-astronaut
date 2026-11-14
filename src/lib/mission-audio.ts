let context: AudioContext | undefined;

export function prepareMissionAudio() {
  try {
    context ??= new AudioContext();
    void context.resume().catch(() => {});
  } catch {
    // Gameplay remains available when audio is unsupported or blocked.
  }
}

export function playMissionSound(kind: "warning" | "win" | "fail") {
  prepareMissionAudio();
  if (!context) return;
  const audio = context;
  const notes = kind === "warning" ? [660, 440, 660] : kind === "win" ? [523, 659, 784, 1047, 1319] : [220, 165, 110, 55];
  const duration = kind === "warning" ? 0.16 : kind === "win" ? 0.24 : 0.45;
  notes.forEach((frequency, index) => {
    const oscillator = audio.createOscillator();
    const gain = audio.createGain();
    const start = audio.currentTime + index * duration;
    oscillator.type = kind === "fail" ? "triangle" : "sine";
    oscillator.frequency.setValueAtTime(frequency, start);
    if (kind === "fail") oscillator.frequency.exponentialRampToValueAtTime(frequency / 2, start + duration);
    gain.gain.setValueAtTime(0.001, start);
    gain.gain.exponentialRampToValueAtTime(0.06, start + 0.025);
    gain.gain.exponentialRampToValueAtTime(0.001, start + duration);
    oscillator.connect(gain);
    gain.connect(audio.destination);
    oscillator.start(start);
    oscillator.stop(start + duration + 0.02);
    oscillator.onended = () => { oscillator.disconnect(); gain.disconnect(); };
  });
}