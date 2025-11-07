import { ADDR, DOM } from './config.js';
import { InputMapper } from './input-mapper.js';
import { SoundMapper } from './sound-mapper.js';
import { VideoMapper } from './video-mapper.js';
import { WRAMMapper } from './wram-mapper.js';

// ByteBox Console ------------------------------------------------------------

const CONST = {
  MEMORY_SIZE: 64 * 1024,   // 64KB
  ROM_SIZE: 56 * 1024,      // 56KB
  GAME_INTERVAL: 1000 / 60, // game loop speed - 60 fps
  SPLASH_TIME: 1500,        // in milliseconds
};

export const ByteBox = {
  memory: null,
  wasmModule: null,
  isReady: false,
  frames: 0,
  lastUpdateFPS: 0,
  animationId: null,

  async init(wasmUrl) {
    this.setup();
    await this.load(wasmUrl);
    this.start();

    window.memoryMap = this.memory;
  },

  setup() {
    this.memory = new Uint8Array(CONST.MEMORY_SIZE);
    this.memory.fill(0);
    this.wasmModule = null;
    this.isReady = false;
    this.frames = 0;
    this.lastUpdateFPS = 0;
    this.animationId = null;

    VideoMapper.init(this.memory);
    InputMapper.init(this.memory);
    SoundMapper.init(this.memory);
    WRAMMapper.init(this.memory);
  },

  async load(wasmUrl) {
    const response = await fetch(wasmUrl, {
      cache: 'no-store',
      headers: { 'Cache-Control': 'no-cache' }
    });

    if (!response.ok) {
      return this.error('❌ url no found', null);
    }

    const wasmBytes = new Uint8Array(await response.arrayBuffer());

    try {
      const wasmModule = await WebAssembly.instantiate(wasmBytes, {
        env: {
          peek: this.peek.bind(this),
          poke: this.poke.bind(this),
          trace: this.trace.bind(this)
        }
      });

      this.wasmModule = wasmModule.instance;

      if (!this.wasmModule.exports.update) {
        return this.error('🧩 missing export update function', null);
      }

      const gameID = btoa(String.fromCharCode(...wasmBytes)).substring(0, 16);
      WRAMMapper.sync(gameID);

      this.memory[ADDR.SEED] = Date.now() & 0xFF;
      this.wasmModule.exports.init?.();
      this.isReady = true;

      const name = this.memory.slice(ADDR.GAME_NAME, ADDR.GAME_NAME + 24);
      DOM.InfoName.innerHTML = String.fromCharCode(...name);
      DOM.InfoSize.textContent = (wasmBytes.length / 1024).toFixed(1);

      if (wasmBytes.length > CONST.ROM_SIZE) {
        DOM.InfoSize.style = "color: #fc0c0c";
      } else {
        // emulate "game ROM" - this really has no effect
        this.memory.set(wasmBytes, ADDR.ROM);
      }

      console.log('🎮 ByteBox game is running');
    } catch (err) {
      return this.error('❌ wasm no found', err);
    }
  },

  async restart(wasmUrl) {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }

    await this.init(wasmUrl);
  },

  start() {
    const skipSplash = new URLSearchParams(window.location.search).has('nosplash') ;    
    if (skipSplash) {
      this.run();
      return;
    }

    this.splash();
    setTimeout(() => { this.run(); }, CONST.SPLASH_TIME);
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
  },

  run() {
    if (!this.isReady) return;

    let accumulator = 0;
    let lastTime = performance.now();

    const gameLoop = (currentTime) => {
      accumulator += currentTime - lastTime;
      lastTime = currentTime;

      if (accumulator > 200) {
        console.warn('⚠️ performance degradation detected');
      }

      while (accumulator >= CONST.GAME_INTERVAL) {
        if (!(this.memory[ADDR.SYSFLAGS] & 0x01)) {
          this.wasmModule.exports.update();
          WRAMMapper.store();
          SoundMapper.play();
        }

        accumulator -= CONST.GAME_INTERVAL;
      }

      VideoMapper.render();
      this.updateFPS();
      this.animationId = requestAnimationFrame(gameLoop);
    };

    this.animationId = requestAnimationFrame(gameLoop);
  },

  pause() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
      
      console.warn('⏸️ game paused');
    }
  },

  resume() {
    if (!this.animationId && this.isReady) {
      this.run();

      console.warn('▶️ game resumed');
    }
  },

  updateFPS() {
    const now = performance.now();

    this.frames++;

    if (now - this.lastUpdateFPS >= 1000) {
      DOM.InfoFPS.textContent = this.frames;

      this.frames = 0;
      this.lastUpdateFPS = now;
    }
  },

  error(msg, err) {
    this.memory.set([255, 0, 0], ADDR.PALETTE);

    console.error(msg, err);
  },

  peek(addr) {
    if (addr < 0 || addr >= CONST.MEMORY_SIZE) {
      console.warn(`⚠️ address ${ addr } is out of range`);
      return;
    }

    return this.memory[addr];
  },

  poke(addr, value) {
    if (addr < 0 || addr >= CONST.MEMORY_SIZE) {
      console.warn(`⚠️ address ${ addr } is out of range`);
      return;
    }
    if (value < 0 || value > 255) {
      console.warn(`⚠️ value ${ value } is out of range`);
      return;
    }

    this.memory[addr] = value;
  },

  trace(ptr, len) {
    const bytes = new Uint8Array(this.wasmModule.exports.memory.buffer, ptr, len);
    const str = new TextDecoder().decode(bytes);

    console.log('🔵 WASM TRACE:', str);
  }
}

// Initialization -------------------------------------------------------------

document.addEventListener('DOMContentLoaded', () => {
  ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(event => {
    document.addEventListener(event, (e) => {
      e.preventDefault();
      e.stopPropagation();
    });
  });

  document.addEventListener('drop', async (e) => {
    ByteBox.restart(URL.createObjectURL(e.dataTransfer.files[0]));
  });

  document.addEventListener('visibilitychange', () => {
    document.hidden ? ByteBox.pause() : ByteBox.resume();
  });

  ByteBox.init(`assets/wasm/game.wasm?t=${Date.now()}`);
});
