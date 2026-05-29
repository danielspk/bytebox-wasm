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
  keydownHandler: null,
  keyupHandler: null,
  virtualPadHandlers: [],

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
    this.keydownHandler = (e) => {
      if (this.updateKey(e.code, true)) e.preventDefault();
    };

    this.keyupHandler = (e) => {
      if (this.updateKey(e.code, false)) e.preventDefault();
    };

    document.addEventListener('keydown', this.keydownHandler);
    document.addEventListener('keyup', this.keyupHandler);
  },

  handleVirtualPad() {
    document.querySelectorAll('[data-key]').forEach(btn => {
      const key = btn.dataset.key;

      ['mousedown', 'touchstart'].forEach(event => {
        const handler = () => {
          this.updateKey(key, true);
        };

        btn.addEventListener(event, handler, { passive: true });
        this.virtualPadHandlers.push({ element: btn, event, handler });
      });

      ['mouseup', 'touchend', 'mouseleave', 'touchcancel'].forEach(event => {
        const handler = () => {
          this.updateKey(key, false);
        };

        btn.addEventListener(event, handler, { passive: true });
        this.virtualPadHandlers.push({ element: btn, event, handler });
      });
    });
  }
};
