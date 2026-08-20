import { ADDR } from './config.js';

// IO Input Mapper ------------------------------------------------------------

const KEY_MAP = {
  // pad 1
  'ArrowLeft':      [ADDR.GAMEPAD, 7], 'ArrowUp':    [ADDR.GAMEPAD, 6],
  'ArrowDown':      [ADDR.GAMEPAD, 5], 'ArrowRight': [ADDR.GAMEPAD, 4],
  'KeyZ':           [ADDR.GAMEPAD, 1], 'KeyX':       [ADDR.GAMEPAD, 0],
  'NumpadMultiply': [ADDR.GAMEPAD, 1], 'NumpadSubtract': [ADDR.GAMEPAD, 0], // alternative buttons

  // pad 2
  'KeyA':           [ADDR.GAMEPAD + 1, 7], 'KeyW':   [ADDR.GAMEPAD + 1, 6],
  'KeyS':           [ADDR.GAMEPAD + 1, 5], 'KeyD':   [ADDR.GAMEPAD + 1, 4],
  'KeyK':           [ADDR.GAMEPAD + 1, 1], 'KeyL':   [ADDR.GAMEPAD + 1, 0]
};

export const InputMapper = {
  memory: null,
  controller: null,

  init(memory) {
    this.memory = memory;

    this.cleanup();
    this.controller = new AbortController();
    this.handleKeys();
    this.handleVirtualPad();
  },

  cleanup() {
    this.controller?.abort();
  },

  updateKey(code, isPressed) {
    const mapping = KEY_MAP[code];
    if (!mapping) return false;

    const [addr, bit] = mapping;
    if (isPressed) {
      this.memory[addr] |= (1 << bit);
    } else {
      this.memory[addr] &= ~(1 << bit);
    }

    return true;
  },

  reset() {
    this.memory[ADDR.GAMEPAD] = 0;
    this.memory[ADDR.GAMEPAD + 1] = 0;
  },

  handleKeys() {
    const { signal } = this.controller;

    document.addEventListener('keydown', (e) => {
      if (this.updateKey(e.code, true)) e.preventDefault();
    }, { signal });

    document.addEventListener('keyup', (e) => {
      if (this.updateKey(e.code, false)) e.preventDefault();
    }, { signal });
  },

  handleVirtualPad() {
    const { signal } = this.controller;

    document.querySelectorAll('[data-key]').forEach(btn => {
      const key = btn.dataset.key;

      ['mousedown', 'touchstart'].forEach(event => {
        btn.addEventListener(event, () => this.updateKey(key, true), { passive: true, signal });
      });

      ['mouseup', 'touchend', 'mouseleave', 'touchcancel'].forEach(event => {
        btn.addEventListener(event, () => this.updateKey(key, false), { passive: true, signal });
      });
    });
  }
};
