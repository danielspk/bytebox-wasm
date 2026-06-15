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
  ROM_SIZE: 56 * 1024,      // 56KB
  GAME_INTERVAL: 1000 / 60, // game loop speed - 60 fps
  SPLASH_TIME: 1500,        // in milliseconds
  CHIME_DELAY: 800,         // in milliseconds
  GUARD_THRESHOLD: 200,     // spiral of death guard - max frame time in milliseconds
};

const STATE = {
  LOADING: 0,
  READY: 1,
  RUNNING: 2,
  CRASHED: 3,
};

const TEXT_DECODER = new TextDecoder();

export const ByteBox = {
  memory: null,
  wasmModule: null,
  frames: 0,
  lastUpdateFPS: 0,
  animationId: null,
  state: STATE.LOADING,

  async init(wasmUrl) {
    this.setup();
    await this.load(wasmUrl);
    this.start();
  },

  getMemory() {
    return this.memory;
  },

  applyFrameColor() {
    const color = new URLSearchParams(window.location.search).get('color');
    if (!color || !/^[0-9a-fA-F]{6}$/.test(color)) return;

    const r = parseInt(color.slice(0, 2), 16);
    const g = parseInt(color.slice(2, 4), 16);
    const b = parseInt(color.slice(4, 6), 16);
    const root = document.documentElement.style;

    root.setProperty('--frame-bg', `#${color}`);
    root.setProperty('--frame-border', `rgb(${r * 0.75}, ${g * 0.75}, ${b * 0.75})`);
    root.setProperty('--frame-shadow', `rgba(${r}, ${g}, ${b}, 0.5)`);
  },

  setup() {
    this.state = STATE.LOADING;
    this.memory = new Uint8Array(CONST.MEMORY_SIZE);
    this.memory.fill(0);
    this.wasmModule = null;
    this.frames = 0;
    this.lastUpdateFPS = 0;
    this.animationId = null;

    AudioBus.init();
    VideoMapper.init(this.memory);
    InputMapper.init(this.memory);
    SoundMapper.init(this.memory);
    MelodyMapper.init(this.memory);
    WRAMMapper.init(this.memory);
  },

  async load(wasmUrl) {
    try {
      const response = await fetch(wasmUrl, {
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache' }
      });

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

      this.memory[ADDR.SEED] = (Math.random() * 256) | 0;

      const gameID = btoa(String.fromCharCode(...wasmBytes.slice(0, 16))) + wasmBytes.length;
      WRAMMapper.sync(gameID);

      const name = this.memory.slice(ADDR.GAME_NAME, ADDR.GAME_NAME + 24).filter(byte => byte !== 0);
      DOM.InfoName.textContent = String.fromCharCode(...name) || '---';
      DOM.InfoSize.textContent = (wasmBytes.length / 1024).toFixed(1);

      if (wasmBytes.length > CONST.ROM_SIZE) {
        DOM.InfoSize.style.color = '#fc0c0c';
      } else {
        DOM.InfoSize.style.color = '';

        // emulate "game ROM" - this really has no effect
        this.memory.set(wasmBytes, ADDR.ROM);
      }

      try {
        this.wasmModule.exports.init?.();
      } catch (err) {
        return this.error('💥 game crashed in init()', err);
      }

      console.log('🎮 ByteBox game is running');
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

    const skipSplash = new URLSearchParams(window.location.search).has('nosplash');
    if (skipSplash) {
      this.state = STATE.READY;
      this.run();
      return;
    }

    this.splash();
    setTimeout(() => {
      this.state = STATE.READY;
      this.run();
    }, CONST.SPLASH_TIME);
  },

  splash() {
    const logo = [
      [2250, 0xFF], [2251, 0xFC], [2253, 0xF0], [2254, 0x0F], [2256, 0xFF], [2257, 0xFF], [2259, 0xFF], [2260, 0xFF],
      [2262, 0xFF], [2263, 0xFC], [2265, 0x0F], [2266, 0xF0], [2268, 0xF0], [2269, 0x0F], [2290, 0xF0], [2291, 0x0F],
      [2293, 0xF0], [2294, 0x0F], [2296, 0x03], [2297, 0xC0], [2299, 0xF0], [2302, 0xF0], [2303, 0x0F], [2305, 0x3C],
      [2306, 0x3C], [2308, 0x3C], [2309, 0x3C], [2330, 0xF0], [2331, 0x0F], [2333, 0x3C], [2334, 0x3C], [2336, 0x03],
      [2337, 0xC0], [2339, 0xF0], [2342, 0xF0], [2343, 0x0F], [2345, 0xF0], [2346, 0x0F], [2348, 0x0F], [2349, 0xF0],
      [2370, 0xFF], [2371, 0xFC], [2373, 0x0F], [2374, 0xF0], [2376, 0x03], [2377, 0xC0], [2379, 0xFF], [2380, 0xFC],
      [2382, 0xFF], [2383, 0xFC], [2385, 0xF0], [2386, 0x0F], [2388, 0x03], [2389, 0xC0], [2410, 0xF0], [2411, 0x0F],
      [2413, 0x03], [2414, 0xC0], [2416, 0x03], [2417, 0xC0], [2419, 0xF0], [2422, 0xF0], [2423, 0x0F], [2425, 0xF0],
      [2426, 0x0F], [2428, 0x0F], [2429, 0xF0], [2450, 0xF0], [2451, 0x0F], [2453, 0x03], [2454, 0xC0], [2456, 0x03],
      [2457, 0xC0], [2459, 0xF0], [2462, 0xF0], [2463, 0x0F], [2465, 0x3C], [2466, 0x3C], [2468, 0x3C], [2469, 0x3C],
      [2490, 0xFF], [2491, 0xFC], [2493, 0x03], [2494, 0xC0], [2496, 0x03], [2497, 0xC0], [2499, 0xFF], [2500, 0xFF],
      [2502, 0xFF], [2503, 0xFC], [2505, 0x0F], [2506, 0xF0], [2508, 0xF0], [2509, 0x0F]
    ];

    for (let i = 0; i < logo.length; i++) {
      this.memory[ADDR.VIDEO + logo[i][0]] = logo[i][1];
    }

    VideoMapper.render();
    setTimeout(() => this.chime(), CONST.CHIME_DELAY);
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
    this.lastUpdateFPS = lastTime;

    const gameLoop = (currentTime) => {
      accumulator += currentTime - lastTime;
      lastTime = currentTime;

      if (accumulator > CONST.GUARD_THRESHOLD) {
        accumulator = CONST.GAME_INTERVAL;
        console.warn('⚠️ performance degradation detected');
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

    this.frames++;

    if (elapsed >= 1000) {
      DOM.InfoFPS.textContent = Math.round(this.frames * 1000 / elapsed);

      this.frames = 0;
      this.lastUpdateFPS = now;
    }
  },

  error(msg, err) {
    this.state = STATE.CRASHED;
    this.memory.set([255, 0, 0], ADDR.PALETTE);

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
    if (startAddr < 0 || startAddr >= CONST.MEMORY_SIZE) {
      console.warn(`⚠️ start address ${startAddr} is out of range`);
      return;
    }
    if (startAddr + len > CONST.MEMORY_SIZE) {
      console.warn(`⚠️ start address ${startAddr} + ${len} exceeds memory bounds`);
      return;
    }

    const bytes = new Uint8Array(this.wasmModule.exports.memory.buffer, ptr, len);
    this.memory.set(bytes, startAddr);
  },

  trace(ptr, len) {
    const bytes = new Uint8Array(this.wasmModule.exports.memory.buffer, ptr, len);

    console.log('🔵 WASM TRACE:', TEXT_DECODER.decode(bytes));
  }
};

// Initialization -------------------------------------------------------------

document.addEventListener('DOMContentLoaded', () => {
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

  ByteBox.init(`assets/wasm/game.wasm?t=${Date.now()}`);
});
