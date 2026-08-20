// Shared Audio Context -------------------------------------------------------

export const AudioBus = {
  audioContext: null,
  masterGain: null,

  init() {
    if (this.audioContext) return;

    this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    this.masterGain = this.audioContext.createGain();
    this.masterGain.gain.value = 0.3;
    this.masterGain.connect(this.audioContext.destination);
  },

  suspend() {
    this.audioContext?.suspend()?.catch(err => console.warn('⚠️ audio suspend failed', err));
  },

  resume() {
    this.audioContext?.resume()?.catch(err => console.warn('⚠️ audio resume failed', err));
  }
};
