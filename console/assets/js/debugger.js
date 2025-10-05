import { ADDR, DOM } from './config.js';

// Memory viewer Debugger -----------------------------------------------------

export const MemoryViewer = {
  baseAddr: ADDR.VIDEO,
  lastMemory: new Uint8Array(256),
  isRunning: false,
  animationId: null,

  update() {
    if (!this.isRunning || !window.memoryMap) return;

    let html = '';

    for (let row = 0; row < 16; row++) {
      const addr = this.baseAddr + (row * 16);
      
      if (addr > 0xFFFF) break;

      let hexBytes = '';

      for (let col = 0; col < 16; col++) {
        const byteAddr = addr + col;
        
        if (byteAddr > 0xFFFF) break;

        const value = window.memoryMap[byteAddr] || 0;
        const oldValue = this.lastMemory[row * 16 + col] || 0;

        const hexStr = value.toString(16).toUpperCase().padStart(2, '0');
        let classes = 'memory-byte';

        if (value !== oldValue) {
          classes += ' changed-byte';
        }
        if (value === 0) {
          classes += ' zero-byte';
        }

        hexBytes += `<span class="${classes}">${hexStr}</span>`;
        this.lastMemory[row * 16 + col] = value;
      }

      html += `
        <div class="memory-row">
          <div class="memory-addr">${addr.toString(16).toUpperCase().padStart(4, '0')}</div>
          <div class="memory-hex">${hexBytes}</div>
        </div>
      `;
    }

    DOM.MemoryDisplay.innerHTML = html;
  },

  inputMemoryAddr(hexAddr) {
    const hex = hexAddr.replace(/[^0-9A-Fa-f]/g, '');
    if (hex.length === 4) {
      this.baseAddr = parseInt(hex || '0', 16);
      this.update();
    }
  },

  setMemoryAddr(hexAddr) {
    DOM.MemoryInput.value = hexAddr;

    this.baseAddr = parseInt(hexAddr, 16);
    this.update();
  },

  resumeHalt() {
    window.memoryMap[0x0040] ^= 0x01;
  },

  showMemory() {
    if (!window.memoryMap) return;

    this.isRunning = true;
    DOM.Debugger.style.display = 'block';

    const debugLoop = () => {
      this.update();
      this.animationId = requestAnimationFrame(debugLoop);
    };

    this.animationId = requestAnimationFrame(debugLoop);
  },

  hideMemory() {
    this.isRunning = false;
    DOM.Debugger.style.display = 'none';

    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }
};

// Initialization -------------------------------------------------------------

document.addEventListener('DOMContentLoaded', () => {
  DOM.MemoryInput.addEventListener('input', (e) => MemoryViewer.inputMemoryAddr(e.target.value));

  document.querySelectorAll('[data-addr]').forEach(btn => {
    btn.addEventListener('click', () => MemoryViewer.setMemoryAddr(btn.dataset.addr));
  });

  document.querySelectorAll('[data-action="resume"]').forEach(btn => {
    btn.addEventListener('click', () => MemoryViewer.resumeHalt());
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'F8' && window.memoryMap) {
      if (!MemoryViewer.isRunning) {
        MemoryViewer.showMemory();
      } else {
        MemoryViewer.hideMemory();
      }

      e.preventDefault();
    }
  });
});
