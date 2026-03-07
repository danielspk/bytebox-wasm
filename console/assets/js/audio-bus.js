// Shared Audio Context -------------------------------------------------------

export const AudioBus = {
  audioContext: null,
  masterGain: null,

  setup() {
    const init = () => {
      if (this.audioContext) return;

      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      this.masterGain = this.audioContext.createGain();
      this.masterGain.gain.value = 0.3;
      this.masterGain.connect(this.audioContext.destination);
    };

    ['click', 'keydown', 'mousedown', 'touchstart'].forEach(e => {
      document.addEventListener(e, init, { once: true });
    });
  }
};
