/**
 * Web Audio API audio generator for timer completion
 * Plays a crisp triple beep sound without external audio files
 */
export function playTripleBeep() {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    
    const ctx = new AudioContext();
    const now = ctx.currentTime;
    
    const playBeep = (time, freq, duration) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, time);
      
      gain.gain.setValueAtTime(0.3, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + duration);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start(time);
      osc.stop(time + duration);
    };
    
    // Triple beep pattern: 880Hz (A5), short pauses
    playBeep(now, 880, 0.15);
    playBeep(now + 0.22, 880, 0.15);
    playBeep(now + 0.44, 1174.66, 0.35); // D6 finish note
  } catch (err) {
    console.warn('AudioContext playback failed or restricted:', err);
  }
}
