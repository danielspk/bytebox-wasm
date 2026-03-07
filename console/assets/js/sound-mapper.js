import { ADDR } from './config.js';
import { AudioBus } from './audio-bus.js';

// IO Sound Mapper ------------------------------------------------------------

const TIMBRES = ['sine', 'sawtooth', 'square', 'triangle'];

const CONST = {
  NUM_CHANNELS: 4,
  CHANNEL_SIZE: 4,
};

export const SoundMapper = {
  memory: null,
  audioChannels: [],

  init(memory) {
    this.memory = memory;

    for (let i = 0; i < CONST.NUM_CHANNELS; i++) {
      this.audioChannels[i] = {
        oscillator: null,
        gainNode: null,
        isPlaying: false
      };
    }
  },

  play() {
    for (let chan = 0; chan < CONST.NUM_CHANNELS; chan++) {
      let addr = ADDR.SOUND_SFX + (chan * CONST.CHANNEL_SIZE);

      // check trigger
      if ((this.memory[addr + 3] & 0x01) === 0) continue;

      const freqStart = 20 + (this.memory[addr] * 3.84);
      const freqEnd = 20 + (this.memory[addr + 1] * 3.84);
      const duration = ((this.memory[addr + 2] >> 3) & 0x1F) * 0.032;
      const volume = (this.memory[addr + 2] & 0x07) / 7 * 0.5;
      const vibrato = (this.memory[addr + 3] >> 4) & 0x07;
      const waveType = (this.memory[addr + 3] >> 1) & 0x03;

      this.effect(freqStart, freqEnd, duration, volume, vibrato, waveType, chan);

      // clear trigger
      this.memory[addr + 3] = this.memory[addr + 3] & 0xFE;
    }
  },

  effect(freqStart, freqEnd, duration, volume, vibrato, waveType, channel) {
    if (!AudioBus.audioContext) return;
    if (this.audioChannels[channel].isPlaying) return;

    const audioChannel = this.audioChannels[channel];
    const now = AudioBus.audioContext.currentTime;

    audioChannel.oscillator = AudioBus.audioContext.createOscillator();
    audioChannel.gainNode = AudioBus.audioContext.createGain();

    audioChannel.oscillator.type = TIMBRES[waveType];
    audioChannel.oscillator.frequency.setValueAtTime(freqStart, now);
    audioChannel.oscillator.frequency.exponentialRampToValueAtTime(Math.max(20, freqEnd), now + duration);

    if (vibrato > 0) {
      const lfo = AudioBus.audioContext.createOscillator();
      const lfoGain = AudioBus.audioContext.createGain();

      lfo.type = 'sine';
      lfo.frequency.value = 8 + (vibrato * 2);
      lfoGain.gain.value = 10 + (vibrato * 15);
      lfo.connect(lfoGain);
      lfoGain.connect(audioChannel.oscillator.frequency);
      lfo.start(now);
      lfo.stop(now + duration);
    }

    audioChannel.gainNode.gain.setValueAtTime(volume, now);
    audioChannel.gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration);

    audioChannel.oscillator.connect(audioChannel.gainNode);
    audioChannel.gainNode.connect(AudioBus.masterGain);
    audioChannel.oscillator.start(now);
    audioChannel.oscillator.stop(now + duration);
    audioChannel.isPlaying = true;

    this.memory[ADDR.SOUND_STATUS] |= (1 << channel);

    audioChannel.oscillator.onended = () => {
      audioChannel.oscillator = null;
      audioChannel.gainNode = null;
      audioChannel.isPlaying = false;

      this.memory[ADDR.SOUND_STATUS] &= ~(1 << channel);
    };
  }
};
