import { ADDR } from './config.js';

// IO Input Mapper ------------------------------------------------------------

export const InputMapper = {
  memory: null,
  keydownHandler: null,
  keyupHandler: null,
  virtualPadHandlers: [],

  p1Pad: {
    'ArrowLeft': 7, 'ArrowUp': 6, 'ArrowDown': 5, 'ArrowRight': 4, 'KeyZ': 1, 'KeyX': 0,
    'NumpadMultiply': 1, 'NumpadSubtract': 0 // alternative buttons
  },
  p2Pad: {
    'KeyA': 7, 'KeyW': 6, 'KeyS': 5, 'KeyD': 4, 'KeyK': 1, 'KeyL': 0
  },

  init(memory) {
    this.memory = memory;

    this.cleanup();
    this.handleKeys();
    this.handleVirtualPad();
  },

  cleanup() {
    if (this.keydownHandler) {
      document.removeEventListener('keydown', this.keydownHandler);
    }

    if (this.keyupHandler) {
      document.removeEventListener('keyup', this.keyupHandler);
    }

    this.virtualPadHandlers.forEach(({ element, event, handler }) => {
      element.removeEventListener(event, handler);
    });

    this.keydownHandler = null;
    this.keyupHandler = null;
    this.virtualPadHandlers = [];
  },

  handleKeys() {
    this.keydownHandler = (e) => {
      const p1Bit = this.p1Pad[e.code];
      const p2Bit = this.p2Pad[e.code];

      if (p1Bit !== undefined) {
        this.memory[ADDR.GAMEPAD] |= (1 << p1Bit);
      }
      if (p2Bit !== undefined) {
        this.memory[ADDR.GAMEPAD + 1] |= (1 << p2Bit);
      }

      if (p1Bit !== undefined || p2Bit !== undefined) e.preventDefault();
    };

    this.keyupHandler = (e) => {
      const p1Bit = this.p1Pad[e.code];
      const p2Bit = this.p2Pad[e.code];

      if (p1Bit !== undefined) {
        this.memory[ADDR.GAMEPAD] &= ~(1 << p1Bit);
      }
      if (p2Bit !== undefined) {
        this.memory[ADDR.GAMEPAD + 1] &= ~(1 << p2Bit);
      }

      if (p1Bit !== undefined || p2Bit !== undefined) e.preventDefault();
    };

    document.addEventListener('keydown', this.keydownHandler);
    document.addEventListener('keyup', this.keyupHandler);
  },

  handleVirtualPad() {
    document.querySelectorAll('[data-key]').forEach(btn => {
      const padBit = this.p1Pad[btn.dataset.key];

      ['mousedown', 'touchstart'].forEach(event => {
        const handler = (e) => {
          this.memory[ADDR.GAMEPAD] |= (1 << padBit);
          e.preventDefault();
        };

        btn.addEventListener(event, handler, { passive: false });
        this.virtualPadHandlers.push({ element: btn, event, handler });
      });

      ['mouseup', 'touchend'].forEach(event => {
        const handler = (e) => {
          this.memory[ADDR.GAMEPAD] &= ~(1 << padBit);
          e.preventDefault();
        };

        btn.addEventListener(event, handler, { passive: false });
        this.virtualPadHandlers.push({ element: btn, event, handler });
      });
    });
  }
};
