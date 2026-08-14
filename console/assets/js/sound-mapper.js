import { ADDR } from './config.js';
import { AudioBus } from './audio-bus.js';

// IO Sound Mapper ------------------------------------------------------------

const TIMBRES = ['sine', 'sawtooth', 'square', 'triangle', 'noise'];

const CONST = {
  CHANNELS: 4,
  REG_SIZE: 4,
  FREQ_MIN: 20,
  FREQ_STEP: 3.84,
  FREQ_NOISE: 1000,
  DUR_STEP: 0.032,
  MASTER_VOL: 0.5,
};

export const SoundMapper = {
  memory: null,
  noiseBuffer: null,
  audioChannels: [],

  init(memory) {
    this.memory = memory;
    this.cleanup();

    for (let i = 0; i < CONST.CHANNELS; i++) {
      this.audioChannels[i] = {
        src: null,
        gainNode: null,
        isPlaying: false
      };
    }
  },

  cleanup() {
    this.audioChannels.forEach(c => c.src?.stop());
  },

  play() {
    for (let chan = 0; chan < CONST.CHANNELS; chan++) {
      const addr = ADDR.SOUND_SFX + (chan * CONST.REG_SIZE);
      const reg3 = this.memory[addr + 3];

      if (!(reg3 & 0x01)) continue;

      const reg2 = this.memory[addr + 2];
      const sfx = {
        freqStart: CONST.FREQ_MIN + (this.memory[addr] * CONST.FREQ_STEP),
        freqEnd:   CONST.FREQ_MIN + (this.memory[addr + 1] * CONST.FREQ_STEP),
        duration:  ((reg2 >> 3) & 0x1F) * CONST.DUR_STEP,
        volume:    (reg2 & 0x07) / 7 * CONST.MASTER_VOL,
        vibrato:   (reg3 >> 4) & 0x07,
        waveType:  TIMBRES[(reg3 >> 1) & 0x07]
      };

      this.trigger(chan, sfx);
      this.memory[addr + 3] &= 0xFE;
    }
  },

  trigger(chan, sfx) {
    const channel = this.audioChannels[chan];
    if (!AudioBus.audioContext || channel.isPlaying || !sfx.waveType) return;

    const ctx = AudioBus.audioContext;
    const now = ctx.currentTime;
    const isNoise = sfx.waveType === 'noise';

    let freq;
    let scale = 1;

    if (isNoise) {
      if (!this.noiseBuffer) {
        const bufSize = ctx.sampleRate * 2;
        this.noiseBuffer = ctx.createBuffer(1, bufSize, ctx.sampleRate);
        const data = this.noiseBuffer.getChannelData(0);
        for (let i = 0; i < bufSize; i++) data[i] = Math.random() * 2 - 1;
      }

      channel.src = ctx.createBufferSource();
      channel.src.buffer = this.noiseBuffer;
      channel.src.loop = true;

      freq = channel.src.playbackRate;
      scale = 1 / CONST.FREQ_NOISE;
    } else {
      channel.src = ctx.createOscillator();
      channel.src.type = sfx.waveType;

      freq = channel.src.frequency;
    }

    freq.setValueAtTime(sfx.freqStart * scale, now);
    freq.exponentialRampToValueAtTime(Math.max(1, sfx.freqEnd) * scale, now + sfx.duration);

    if (sfx.vibrato > 0) {
      const lfoGain = ctx.createGain();
      lfoGain.gain.value = (10 + (sfx.vibrato * 15)) * scale;

      const lfo = ctx.createOscillator();
      lfo.type = 'sine';
      lfo.frequency.value = 8 + (sfx.vibrato * 2);

      lfo.connect(lfoGain).connect(freq);
      lfo.start(now);
      lfo.stop(now + sfx.duration);
    }

    channel.gainNode = ctx.createGain();
    channel.gainNode.gain.setValueAtTime(sfx.volume, now);
    channel.gainNode.gain.exponentialRampToValueAtTime(0.001, now + sfx.duration);

    channel.src.connect(channel.gainNode).connect(AudioBus.masterGain);
    channel.src.start(now);
    channel.src.stop(now + sfx.duration);

    channel.isPlaying = true;
    this.memory[ADDR.SOUND_STATUS] |= (1 << chan);

    channel.src.onended = () => {
      channel.src = null;
      channel.gainNode = null;
      channel.isPlaying = false;

      this.memory[ADDR.SOUND_STATUS] &= ~(1 << chan);
    };
  }
};
