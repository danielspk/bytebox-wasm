import { ADDR, DOM } from './config.js';
import { InputMapper } from './input-mapper.js';
import { SoundMapper } from './sound-mapper.js';
import { VideoMapper } from './video-mapper.js';

// ByteBox Console ------------------------------------------------------------

const CONST = {
  MEMORY_SIZE: 64 * 1024,   // 64KB
  RAM_SIZE: 58 * 1024,      // 58KB
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

      this.memory[ADDR.SEED] = Date.now() & 0xFF;

      this.wasmModule.exports.init?.();
      this.isReady = true;

      const name = this.memory.slice(ADDR.GAME_NAME, ADDR.GAME_NAME + 24);
      DOM.InfoName.innerHTML = String.fromCharCode(...name);
      DOM.InfoSize.textContent = (wasmBytes.length / 1024).toFixed(1);

      if (wasmBytes.length > CONST.RAM_SIZE) {
        DOM.InfoSize.style = "color: #fc0c0c";
      } else {
        // emulate "game in RAM" - this really has no effect
        this.memory.set(wasmBytes, ADDR.RAM);
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
      [2730, 0xFF], [2731, 0xFC], [2733, 0xF0], [2734, 0x0F], [2736, 0xFF], [2737, 0xFF], [2739, 0xFF], [2740, 0xFF],
      [2742, 0xFF], [2743, 0xFC], [2745, 0x0F], [2746, 0xF0], [2748, 0xF0], [2749, 0x0F], [2770, 0xF0], [2771, 0x0F],
      [2773, 0xF0], [2774, 0x0F], [2776, 0x03], [2777, 0xC0], [2779, 0xF0], [2782, 0xF0], [2783, 0x0F], [2785, 0x3C],
      [2786, 0x3C], [2788, 0x3C], [2789, 0x3C], [2810, 0xF0], [2811, 0x0F], [2813, 0x3C], [2814, 0x3C], [2816, 0x03],
      [2817, 0xC0], [2819, 0xF0], [2822, 0xF0], [2823, 0x0F], [2825, 0xF0], [2826, 0x0F], [2828, 0x0F], [2829, 0xF0],
      [2850, 0xFF], [2851, 0xFC], [2853, 0x0F], [2854, 0xF0], [2856, 0x03], [2857, 0xC0], [2859, 0xFF], [2860, 0xFC],
      [2862, 0xFF], [2863, 0xFC], [2865, 0xF0], [2866, 0x0F], [2868, 0x03], [2869, 0xC0], [2890, 0xF0], [2891, 0x0F],
      [2893, 0x03], [2894, 0xC0], [2896, 0x03], [2897, 0xC0], [2899, 0xF0], [2902, 0xF0], [2903, 0x0F], [2905, 0xF0],
      [2906, 0x0F], [2908, 0x0F], [2909, 0xF0], [2930, 0xF0], [2931, 0x0F], [2933, 0x03], [2934, 0xC0], [2936, 0x03],
      [2937, 0xC0], [2939, 0xF0], [2942, 0xF0], [2943, 0x0F], [2945, 0x3C], [2946, 0x3C], [2948, 0x3C], [2949, 0x3C],
      [2970, 0xFF], [2971, 0xFC], [2973, 0x03], [2974, 0xC0], [2976, 0x03], [2977, 0xC0], [2979, 0xFF], [2980, 0xFF],
      [2982, 0xFF], [2983, 0xFC], [2985, 0x0F], [2986, 0xF0], [2988, 0xF0], [2989, 0x0F]
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
