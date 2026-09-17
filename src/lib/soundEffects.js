import nootAudioUrl from '../noot noot.mp3';

let audioCtx = null;
let activeSirenOsc1 = null;
let activeSirenOsc2 = null;
let activeSirenInterval = null;
let nootAudioElement = null;

export function playNootNoot() {
  try {
    if (!nootAudioElement) {
      nootAudioElement = new Audio(nootAudioUrl || '/noot noot.mp3');
    }
    nootAudioElement.currentTime = 0;
    const playPromise = nootAudioElement.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {
        const fallback = new Audio('/noot noot.mp3');
        fallback.play().catch(() => {});
      });
    }
  } catch (err) {
    console.warn('Could not play noot noot sound:', err);
  }
}

function getAudioContext() {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

// Gentle bubbly click/pop sound
export function playPop() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(450, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(750, ctx.currentTime + 0.08);

    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.08);
  } catch {
    // Ignore audio errors if browser blocks autoplay
  }
}

// Celebratory fanfare arpeggio
export function playSuccessFanfare() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51]; // C5, E5, G5, C6, E6
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const startTime = ctx.currentTime + idx * 0.09;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0.25, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + 0.35);
    });
  } catch {
    // Graceful fallback
  }
}

// Tick sound for roulette spin
export function playTick() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(800, ctx.currentTime);

    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.04);
  } catch {
    // Ignore
  }
}

// Dramatic Intruder Warning Siren
export function startIntruderSiren() {
  stopIntruderSiren();
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    activeSirenOsc1 = ctx.createOscillator();
    const gainNode = ctx.createGain();

    activeSirenOsc1.type = 'sawtooth';
    gainNode.gain.setValueAtTime(0.12, ctx.currentTime);

    activeSirenOsc1.connect(gainNode);
    gainNode.connect(ctx.destination);

    let high = false;
    activeSirenOsc1.frequency.setValueAtTime(600, ctx.currentTime);
    activeSirenOsc1.start();

    activeSirenInterval = setInterval(() => {
      if (!activeSirenOsc1 || !ctx) return;
      const targetFreq = high ? 600 : 950;
      activeSirenOsc1.frequency.exponentialRampToValueAtTime(targetFreq, ctx.currentTime + 0.25);
      high = !high;
    }, 300);
  } catch {
    // Ignore
  }
}

export function stopIntruderSiren() {
  if (activeSirenInterval) {
    clearInterval(activeSirenInterval);
    activeSirenInterval = null;
  }
  if (activeSirenOsc1) {
    try {
      activeSirenOsc1.stop();
      activeSirenOsc1.disconnect();
    } catch {
      // Ignore
    }
    activeSirenOsc1 = null;
  }
}
