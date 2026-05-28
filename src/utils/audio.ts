/**
 * Synthesizes a clean, modern warning chime using the Web Audio API.
 * This runs locally in the user's browser, eliminating the need for external .mp3/.wav assets.
 */
export function playAlertChime() {
  if (typeof window === 'undefined') return;

  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();

    const playChime = (freq: number, startTime: number, duration: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      // Use triangle wave for a softer, more rounded chime tone
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, startTime);

      // Volume envelope to prevent popping/clicking and simulate a ringing bell
      gain.gain.setValueAtTime(0.12, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration - 0.02);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + duration);
    };

    // Synthesize a double-note alert chime
    // First chime: 520Hz (C5) at t = 0
    playChime(520, ctx.currentTime, 0.35);
    // Second chime: 650Hz (E5) at t = 0.15s
    playChime(650, ctx.currentTime + 0.15, 0.45);
  } catch (e) {
    console.error('[CrisisSwarm Audio] Failed to play alert chime:', e);
  }
}
