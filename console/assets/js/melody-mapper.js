import { ADDR } from './config.js';
import { AudioBus } from './audio-bus.js';

// IO Melody Mapper -----------------------------------------------------------

const TIMBRES = ['square', 'square', 'sawtooth', 'triangle', 'triangle', 'triangle', 'sine', 'noise'];

export const MelodyMapper = {
  memory: null,
  melodyGain: null,
  noiseBuffer: null,
  activeVoices: new Map(),
  nextEventTime: 0,

  init(memory) {
    this.memory = memory;
    this.cleanup();
  },

  cleanup() {
    this.activeVoices.forEach(v => v.src.stop());
    this.activeVoices.clear();
  },

  tick() {
    if (!AudioBus.audioContext) return;

    const audioCtx = AudioBus.audioContext;

    if (!this.melodyGain) {
      this.melodyGain = audioCtx.createGain();
      this.melodyGain.connect(AudioBus.masterGain);
      this.nextEventTime = audioCtx.currentTime;

      const bufSize = audioCtx.sampleRate * 2;
      this.noiseBuffer = audioCtx.createBuffer(1, bufSize, audioCtx.sampleRate);
      const data = this.noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufSize; i++) data[i] = Math.random() * 2 - 1;
    }

    this.melodyGain.gain.value = (this.memory[ADDR.MELODY_ATTR] & 0x0F) / 15;

    if (this.nextEventTime < audioCtx.currentTime) {
      this.nextEventTime = audioCtx.currentTime;
    }

    const head = this.memory[ADDR.MELODY_HEAD];
    let tail   = this.memory[ADDR.MELODY_TAIL];

    // max 16 entries (64-byte buffer / 4 bytes each)
    let maxIter = 16;

    while (tail !== head && maxIter-- > 0) {
      if (this.nextEventTime > audioCtx.currentTime + 0.25) break;

      const dHi  = this.memory[ADDR.MELODY + tail];
      const dLo  = this.memory[ADDR.MELODY + (tail + 1) % 64];
      const note = this.memory[ADDR.MELODY + (tail + 2) % 64];
      const ctrl = this.memory[ADDR.MELODY + (tail + 3) % 64];

      tail = (tail + 4) % 64;

      this.memory[ADDR.MELODY_TAIL] = tail;
      this.nextEventTime += ((dHi << 8) | dLo) / 1000;

      const isOn = (ctrl >> 7) & 1;
      const ch   = (ctrl >> 4) & 0x07;
      const vol  = (ctrl & 0x0F) / 15;

      this.processSignal(note, isOn, ch, vol, this.nextEventTime);
    }
  },

  processSignal(note, isOn, ch, vol, time) {
    const audioCtx = AudioBus.audioContext;
    const voiceId = (ch << 8) | note;

    if (!isOn) {
      if (this.activeVoices.has(voiceId)) {
        const v = this.activeVoices.get(voiceId);

        v.gain.gain.setTargetAtTime(0, time, 0.015);
        v.src.stop(time + 0.05);
        this.activeVoices.delete(voiceId);
      }

      return;
    }

    if (this.activeVoices.has(voiceId)) {
      const v = this.activeVoices.get(voiceId);

      v.gain.gain.setTargetAtTime(0, time, 0.005);
      v.src.stop(time + 0.02);
      this.activeVoices.delete(voiceId);
    }

    const g = audioCtx.createGain();

    g.gain.setValueAtTime(0, time);
    g.connect(this.melodyGain);

    let src;

    // CH7: noise (percussion) — percussive envelope by note range
    if (ch === 7) {
      const filterFreq = note < 40 ? 120  : note < 60 ? 800  : 6000;
      const filterQ    = note < 40 ? 0.5  : note < 60 ? 1.2  : 3.0;
      const decayTime  = note < 40 ? 0.08 : note < 60 ? 0.05 : 0.02;

      const filter = audioCtx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = filterFreq;
      filter.Q.value = filterQ;

      src = audioCtx.createBufferSource();
      src.buffer = this.noiseBuffer;
      src.loop = true;
      src.connect(filter).connect(g);

      g.gain.linearRampToValueAtTime(vol * 0.09, time + 0.001);
      g.gain.exponentialRampToValueAtTime(0.0001, time + decayTime);

    // CH0-CH6: oscillators with normal envelope
    } else {
      src = audioCtx.createOscillator();
      src.type = TIMBRES[ch];
      src.frequency.setValueAtTime(440 * Math.pow(2, (note - 69) / 12), time);
      src.connect(g);

      g.gain.linearRampToValueAtTime(vol * 0.12, time + 0.005);
      g.gain.setTargetAtTime(vol * 0.09, time + 0.005, 0.05);
    }

    src.start(time);

    this.activeVoices.set(voiceId, { src, gain: g });
  }
};
