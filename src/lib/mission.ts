export const SOL_SECONDS = 60;
export const MISSION_SOLS = 7;

export function missionClock(elapsedSeconds: number) {
  const elapsed = Math.min(Math.max(0, Math.floor(elapsedSeconds)), SOL_SECONDS * MISSION_SOLS);
  const completed = Math.floor(elapsed / SOL_SECONDS);
  return {
    completed,
    currentSol: Math.min(completed + 1, MISSION_SOLS),
    remaining: completed === MISSION_SOLS ? 0 : SOL_SECONDS - elapsed % SOL_SECONDS,
    finished: completed === MISSION_SOLS,
  };
}

export function playMissionTap() {
  try {
    const audio = new AudioContext();
    const oscillator = audio.createOscillator();
    const gain = audio.createGain();
    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(880, audio.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(440, audio.currentTime + 0.14);
    gain.gain.setValueAtTime(0.055, audio.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audio.currentTime + 0.18);
    oscillator.connect(gain);
    gain.connect(audio.destination);
    oscillator.start();
    oscillator.stop(audio.currentTime + 0.2);
    oscillator.onended = () => { void audio.close(); };
  } catch {
    // Audio is optional on devices without Web Audio support.
  }
}