import { ADDR, DOM } from './config.js';
import { AudioBus } from './audio-bus.js';
import { InputMapper } from './input-mapper.js';
import { MelodyMapper } from './melody-mapper.js';
import { SoundMapper } from './sound-mapper.js';
import { VideoMapper } from './video-mapper.js';
import { WRAMMapper } from './wram-mapper.js';

// ByteBox Console ------------------------------------------------------------

const CONST = {
  MEMORY_SIZE: 64 * 1024,   // 64KB
  ROM_SIZE: 50 * 1024,      // 50KB
  GAME_INTERVAL: 1000 / 60, // game loop speed - 60 fps
  SPLASH_TIME: 1500,        // in milliseconds
  CHIME_DELAY: 700,         // in milliseconds
  GUARD_THRESHOLD: 200,     // spiral of death guard - max frame time in milliseconds
};

const STATE = {
  LOADING: 0,
  READY: 1,
  RUNNING: 2,
  CRASHED: 3,
};

const TEXT_DECODER = new TextDecoder();
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

export const ByteBox = {
  memory: null,
  wasmModule: null,
  gameSize: 0,
  frames: 0,
  lastUpdateFPS: 0,
  animationId: null,
  state: STATE.LOADING,

  async init(wasmUrl) {
    this.setup();

    await this.load(wasmUrl);

    const skipSplash = new URLSearchParams(window.location.search).has('nosplash');
    if (!skipSplash) {
      await this.splash();
    }

    this.start();
  },

  getMemory() {
    return this.memory;
  },

  applyFrameColor() {
    const color = new URLSearchParams(window.location.search).get('color');
    if (!color || !/^[0-9a-fA-F]{6}$/.test(color)) return;

    document.documentElement.style.setProperty('--frame-bg', `#${color}`);
  },

  setup() {
    this.state = STATE.LOADING;
    this.memory = new Uint8Array(CONST.MEMORY_SIZE);
    this.wasmModule = null;
    this.gameSize = 0;
    this.frames = 0;
    this.lastUpdateFPS = 0;
    this.animationId = null;

    AudioBus.init();
    VideoMapper.init(this.memory);
    InputMapper.init(this.memory);
    SoundMapper.init(this.memory);
    MelodyMapper.init(this.memory);
    WRAMMapper.init(this.memory);

    this.memory[ADDR.SEED] = (Math.random() * 256) | 0;

    DOM.InfoName.textContent = '';
    DOM.InfoSize.textContent = '0';
    DOM.InfoSize.style.color = '';
  },

  async load(wasmUrl) {
    try {
      const response = await fetch(wasmUrl, { cache: 'no-store' });

      if (!response.ok) {
        return this.error('❌ url not found', null);
      }

      const wasmBytes = new Uint8Array(await response.arrayBuffer());

      const wasmModule = await WebAssembly.instantiate(wasmBytes, {
        env: {
          peek: this.peek.bind(this),
          poke: this.poke.bind(this),
          spoke: this.spoke.bind(this),
          trace: this.trace.bind(this)
        }
      });

      this.wasmModule = wasmModule.instance;

      if (!this.wasmModule.exports.update) {
        return this.error('🧩 missing update export', null);
      }

      if (!this.wasmModule.exports.memory) {
        return this.error('🧩 missing memory export', null);
      }

      this.gameSize = wasmBytes.length;

      const gameID = wasmBytes.reduce((hash, byte) => Math.imul(hash ^ byte, 0x01000193), 0x811C9DC5).toString(36); // FNV-1a hash
      WRAMMapper.sync(gameID);

      if (this.gameSize <= CONST.ROM_SIZE) {
        // emulate "game ROM" - this really has no effect
        this.memory.set(wasmBytes, ADDR.ROM);
      }
    } catch (err) {
      return this.error('❌ failed to load wasm', err);
    }
  },

  async restart(wasmUrl) {
    if (this.state === STATE.LOADING) return;

    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }

    await this.init(wasmUrl);
  },

  start() {
    if (this.state !== STATE.LOADING) return;

    try {
      this.wasmModule.exports.init?.();
    } catch (err) {
      return this.error('💥 game crashed in init()', err);
    }

    this.state = STATE.READY;

    const name = this.memory.slice(ADDR.GAME_NAME, ADDR.GAME_NAME + 24).filter(byte => byte !== 0);

    DOM.InfoName.textContent = String.fromCharCode(...name) || '';
    DOM.InfoSize.textContent = (this.gameSize / 1024).toFixed(1);
    DOM.InfoSize.style.color = this.gameSize > CONST.ROM_SIZE ? '#fc0c0c' : '';

    console.log('🎮 ByteBox game is running');

    this.run();
  },

  async splash() {
    if (this.state !== STATE.LOADING) return;

    const logo = [
      [4500, 0x66], [4501, 0x66], [4502, 0x66], [4503, 0x60], [4506, 0x66], [4509, 0x66], [4512, 0x66], [4513, 0x66],
      [4514, 0x66], [4515, 0x66], [4518, 0x66], [4519, 0x66], [4520, 0x66], [4521, 0x66], [4524, 0x66], [4525, 0x66],
      [4526, 0x66], [4527, 0x60], [4531, 0x66], [4532, 0x66], [4536, 0x66], [4539, 0x66], [4580, 0x66], [4583, 0x66],
      [4586, 0x66], [4589, 0x66], [4593, 0x06], [4594, 0x60], [4598, 0x66], [4604, 0x66], [4607, 0x66], [4610, 0x06],
      [4611, 0x60], [4612, 0x06], [4613, 0x60], [4616, 0x06], [4617, 0x60], [4618, 0x06], [4619, 0x60], [4660, 0x66],
      [4663, 0x66], [4666, 0x06], [4667, 0x60], [4668, 0x06], [4669, 0x60], [4673, 0x06], [4674, 0x60], [4678, 0x66],
      [4684, 0x66], [4687, 0x66], [4690, 0x66], [4693, 0x66], [4697, 0x66], [4698, 0x66], [4740, 0x66], [4741, 0x66],
      [4742, 0x66], [4743, 0x60], [4747, 0x66], [4748, 0x66], [4753, 0x06], [4754, 0x60], [4758, 0x66], [4759, 0x66],
      [4760, 0x66], [4761, 0x60], [4764, 0x66], [4765, 0x66], [4766, 0x66], [4767, 0x60], [4770, 0x66], [4773, 0x66],
      [4777, 0x06], [4778, 0x60], [4820, 0x66], [4823, 0x66], [4827, 0x06], [4828, 0x60], [4833, 0x06], [4834, 0x60],
      [4838, 0x66], [4844, 0x66], [4847, 0x66], [4850, 0x66], [4853, 0x66], [4857, 0x66], [4858, 0x66], [4900, 0x66],
      [4903, 0x66], [4907, 0x06], [4908, 0x60], [4913, 0x06], [4914, 0x60], [4918, 0x66], [4924, 0x66], [4927, 0x66],
      [4930, 0x06], [4931, 0x60], [4932, 0x06], [4933, 0x60], [4936, 0x06], [4937, 0x60], [4938, 0x06], [4939, 0x60],
      [4980, 0x66], [4981, 0x66], [4982, 0x66], [4983, 0x60], [4987, 0x06], [4988, 0x60], [4993, 0x06], [4994, 0x60],
      [4998, 0x66], [4999, 0x66], [5000, 0x66], [5001, 0x66], [5004, 0x66], [5005, 0x66], [5006, 0x66], [5007, 0x60],
      [5011, 0x66], [5012, 0x66], [5016, 0x66], [5019, 0x66]
    ];

    for (let i = 0; i < logo.length; i++) {
      this.memory[ADDR.VIDEO + logo[i][0]] = logo[i][1];
    }

    VideoMapper.render();

    await delay(CONST.CHIME_DELAY);
    this.chime();
    await delay(CONST.SPLASH_TIME - CONST.CHIME_DELAY);

    VideoMapper.clear();
    VideoMapper.render();
  },

  chime() {
    const notes = [[109, 53, 0], [71, 133, 250]];

    notes.forEach(([freq, dur, delay]) => {
      setTimeout(() => {
        this.memory[ADDR.SOUND_SFX + 0] = freq;
        this.memory[ADDR.SOUND_SFX + 1] = freq;
        this.memory[ADDR.SOUND_SFX + 2] = dur;
        this.memory[ADDR.SOUND_SFX + 3] = 5;
        SoundMapper.play();
      }, delay);
    });
  },

  run() {
    if (this.state !== STATE.READY) return;

    this.state = STATE.RUNNING;

    let accumulator = 0;
    let lastTime = performance.now();
    let degraded = false;
    this.lastUpdateFPS = lastTime;

    const gameLoop = (currentTime) => {
      accumulator += currentTime - lastTime;
      lastTime = currentTime;

      if (accumulator > CONST.GUARD_THRESHOLD) {
        accumulator = CONST.GAME_INTERVAL;

        if (!degraded) {
          console.warn('⚠️ performance degradation detected');
          degraded = true;
        }
      } else {
        degraded = false;
      }

      if (!document.hasFocus()) {
        InputMapper.reset();
      }

      while (accumulator >= CONST.GAME_INTERVAL) {
        if (!(this.memory[ADDR.SYSFLAGS] & 0x01)) {
          try {
            this.wasmModule.exports.update();
          } catch (err) {
            return this.error('💥 game crashed in update()', err);
          }

          WRAMMapper.store();
          SoundMapper.play();

          this.frames++;
        }

        accumulator -= CONST.GAME_INTERVAL;
      }

      VideoMapper.render();
      MelodyMapper.tick();

      this.updateFPS(currentTime);
      this.animationId = requestAnimationFrame(gameLoop);
    };

    this.animationId = requestAnimationFrame(gameLoop);
  },

  pause() {
    if (this.state !== STATE.RUNNING) return;

    cancelAnimationFrame(this.animationId);
    this.animationId = null;
    this.state = STATE.READY;

    AudioBus.suspend();

    console.log('⏸️ game paused');
  },

  resume() {
    if (this.state !== STATE.READY) return;

    AudioBus.resume();
    this.run();

    console.log('▶️ game resumed');
  },

  updateFPS(now) {
    const elapsed = now - this.lastUpdateFPS;

    if (elapsed >= 1000) {
      DOM.InfoFPS.textContent = Math.round(this.frames * 1000 / elapsed);

      this.frames = 0;
      this.lastUpdateFPS = now;
    }
  },

  error(msg, err) {
    this.state = STATE.CRASHED;
    this.memory.set([255, 0, 0], ADDR.PALETTE);
    DOM.InfoName.textContent = 'CRASH ERROR';

    VideoMapper.clear();
    VideoMapper.render();

    SoundMapper.cleanup();
    MelodyMapper.cleanup();

    console.error(msg, err);
  },

  peek(addr) {
    if (addr < 0 || addr >= CONST.MEMORY_SIZE) {
      console.warn(`⚠️ address ${addr} is out of range`);
      return 0;
    }

    return this.memory[addr];
  },

  poke(addr, value) {
    if (addr < 0 || addr >= CONST.MEMORY_SIZE) {
      console.warn(`⚠️ address ${addr} is out of range`);
      return;
    }
    if (value < 0 || value > 255) {
      console.warn(`⚠️ value ${value} is out of range`);
      return;
    }

    this.memory[addr] = value;
  },

  spoke(startAddr, len, ptr) {
    try {
      const bytes = new Uint8Array(this.wasmModule.exports.memory.buffer, ptr, len);
      this.memory.set(bytes, startAddr);
    } catch {
      console.warn(`⚠️ spoke(${startAddr}, ${len}, ${ptr}) is out of range`);
    }
  },

  trace(ptr, len) {
    try {
      const bytes = new Uint8Array(this.wasmModule.exports.memory.buffer, ptr, len);

      console.log('🔵 WASM TRACE:', TEXT_DECODER.decode(bytes));
    } catch {
      console.warn(`⚠️ trace(${ptr}, ${len}) is out of range`);
    }
  }
};

// Initialization -------------------------------------------------------------

ByteBox.applyFrameColor();

['dragenter', 'dragover', 'dragleave', 'drop'].forEach(event => {
  document.addEventListener(event, (e) => {
    e.preventDefault();
    e.stopPropagation();
  });
});

document.addEventListener('drop', async (e) => {
  if (!e.dataTransfer.files.length) return;

  const url = URL.createObjectURL(e.dataTransfer.files[0]);
  await ByteBox.restart(url);

  URL.revokeObjectURL(url);
});

document.addEventListener('visibilitychange', () => {
  document.hidden ? ByteBox.pause() : ByteBox.resume();
});

DOM.Power.addEventListener('click', () => {
  DOM.Power.remove();

  ByteBox.init(`assets/wasm/game.wasm?t=${Date.now()}`);
}, { once: true });
