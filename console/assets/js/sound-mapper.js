import { ADDR } from './config.js';
import { AudioBus } from './audio-bus.js';

// IO Sound Mapper ------------------------------------------------------------

const TIMBRES = ['sine', 'sawtooth', 'square', 'triangle'];

const CONST = {
  CHANNELS: 4,
  REG_SIZE: 4,
  FREQ_MIN: 20,
  FREQ_STEP: 3.84,
  DUR_STEP: 0.032,
  MASTER_VOL: 0.5
};

export const SoundMapper = {
  memory: null,
  audioChannels: [],

  init(memory) {
    this.memory = memory;

    for (let i = 0; i < CONST.CHANNELS; i++) {
      this.audioChannels[i] = {
        oscillator: null,
        gainNode: null,
        isPlaying: false
      };
    }
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
        waveType:  TIMBRES[(reg3 >> 1) & 0x03]
      };

      this.trigger(chan, sfx);
      this.memory[addr + 3] &= 0xFE;
    }
  },

  trigger(chan, sfx) {
    const channel = this.audioChannels[chan];
    if (!AudioBus.audioContext || channel.isPlaying) return;

    const ctx = AudioBus.audioContext;
    const now = ctx.currentTime;

    channel.oscillator = ctx.createOscillator();
    channel.gainNode = ctx.createGain();

    channel.oscillator.type = sfx.waveType;
    channel.oscillator.frequency.setValueAtTime(sfx.freqStart, now);
    channel.oscillator.frequency.exponentialRampToValueAtTime(Math.max(1, sfx.freqEnd), now + sfx.duration);

    if (sfx.vibrato > 0) {
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();

      lfo.type = 'sine';
      lfo.frequency.value = 8 + (sfx.vibrato * 2);
      lfoGain.gain.value = 10 + (sfx.vibrato * 15);

      lfo.connect(lfoGain).connect(channel.oscillator.frequency);
      lfo.start(now);
      lfo.stop(now + sfx.duration);
    }

    channel.gainNode.gain.setValueAtTime(sfx.volume, now);
    channel.gainNode.gain.exponentialRampToValueAtTime(0.001, now + sfx.duration);

    channel.oscillator.connect(channel.gainNode).connect(AudioBus.masterGain);
    channel.oscillator.start(now);
    channel.oscillator.stop(now + sfx.duration);

    channel.isPlaying = true;
    this.memory[ADDR.SOUND_STATUS] |= (1 << chan);

    channel.oscillator.onended = () => {
      channel.oscillator = null;
      channel.gainNode = null;
      channel.isPlaying = false;

      this.memory[ADDR.SOUND_STATUS] &= ~(1 << chan);
    };
  }
};
