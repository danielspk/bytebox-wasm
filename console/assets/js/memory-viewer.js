import { ADDR, DOM } from './config.js';
import { ByteBox } from './console.js';

// Memory Viewer --------------------------------------------------------------

export const MemoryViewer = {
  baseAddr: ADDR.VIDEO,
  lastMemory: new Uint8Array(256),
  isRunning: false,
  animationId: null,
  dragOffsetX: 0,
  dragOffsetY: 0,

  isProtectedWrite(addr) {
    const ranges = [
      [0x0100, 0xE0FF], // ROM
      [0xFF94, 0xFF95], // gamepads
      [0xFF97, 0xFF97], // sound status
      [0xFFEA, 0xFFEA]  // melody tail
    ];

    return ranges.some(([start, end]) => addr >= start && addr <= end);
  },

  update() {
    const memory = ByteBox.getMemory();

    if (!this.isRunning || !memory) return;

    let html = '';

    for (let row = 0; row < 16; row++) {
      const addr = this.baseAddr + (row * 16);

      if (addr > 0xFFFF) break;

      const hexBytes = [];

      for (let col = 0; col < 16; col++) {
        const byteAddr = addr + col;

        if (byteAddr > 0xFFFF) break;

        const value = memory[byteAddr];
        const oldValue = this.lastMemory[row * 16 + col];

        const hexStr = value.toString(16).toUpperCase().padStart(2, '0');
        let classes = 'memory-byte';

        if (value !== oldValue) {
          classes += ' changed-byte';
        }
        if (value === 0) {
          classes += ' zero-byte';
        }

        hexBytes.push(`<span class="${classes}" data-addr="${byteAddr}">${hexStr}</span>`);
        this.lastMemory[row * 16 + col] = value;
      }

      html += `
        <div class="memory-row">
          <div class="memory-addr">${addr.toString(16).toUpperCase().padStart(4, '0')}</div>
          <div class="memory-hex">${hexBytes.join('')}</div>
        </div>
      `;
    }

    DOM.MemoryDisplay.innerHTML = html;
  },

  inputMemoryAddr(hexAddr) {
    const hex = hexAddr.replace(/[^0-9A-Fa-f]/g, '');

    if (hex.length === 4) {
      const memory = ByteBox.getMemory();

      this.baseAddr = parseInt(hex, 16);
      this.lastMemory.fill(0);
      this.lastMemory.set(memory.subarray(this.baseAddr, this.baseAddr + this.lastMemory.length));
      this.update();
    }
  },

  setMemoryAddr(hexAddr) {
    DOM.MemoryInput.value = hexAddr;

    this.inputMemoryAddr(hexAddr);
  },

  writeMemoryByte() {
    const memory = ByteBox.getMemory();

    if (!memory) return;

    const addr = parseInt(DOM.MemoryAddress.value, 16);
    const val = parseInt(DOM.MemoryValue.value, 16);

    if (isNaN(addr) || isNaN(val) || addr < 0 || addr > 0xFFFF) return;

    if (this.isProtectedWrite(addr)) {
      console.warn(`⚠️ cannot write to protected address 0x${addr.toString(16).toUpperCase()}`);
      return;
    }

    memory[addr] = val & 0xFF;
  },

  selectByte(addr) {
    const memory = ByteBox.getMemory();

    DOM.MemoryAddress.value = addr.toString(16).toUpperCase().padStart(4, '0');
    DOM.MemoryValue.value = memory[addr].toString(16).toUpperCase().padStart(2, '0');
    DOM.MemoryValue.focus();
    DOM.MemoryValue.select();
  },

  resumeHalt() {
    const memory = ByteBox.getMemory();

    if (!memory) return;

    memory[ADDR.SYSFLAGS] ^= 0x01;
  },

  showMemory() {
    const memory = ByteBox.getMemory();

    if (!memory) return;

    this.isRunning = true;
    DOM.MemoryViewer.style.display = 'block';

    let frameCount = 0;

    const memoryViewerLoop = () => {
      if (frameCount++ % 4 === 0) {
        this.update();
      }

      this.animationId = requestAnimationFrame(memoryViewerLoop);
    };

    this.animationId = requestAnimationFrame(memoryViewerLoop);
  },

  hideMemory() {
    this.isRunning = false;
    DOM.MemoryViewer.style.display = 'none';

    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  },

  grab(e) {
    const rect = DOM.MemoryViewer.getBoundingClientRect();
    this.dragOffsetX = e.clientX - rect.left;
    this.dragOffsetY = e.clientY - rect.top;

    DOM.MemoryHeader.setPointerCapture(e.pointerId);
  },

  drag(e) {
    if (!DOM.MemoryHeader.hasPointerCapture(e.pointerId)) return;

    DOM.MemoryViewer.style.left = `${e.clientX - this.dragOffsetX}px`;
    DOM.MemoryViewer.style.top = `${e.clientY - this.dragOffsetY}px`;
  }
};

// Initialization -------------------------------------------------------------

document.addEventListener('DOMContentLoaded', () => {
  DOM.MemoryInput.addEventListener('input', (e) => MemoryViewer.inputMemoryAddr(e.target.value));

  DOM.MemoryViewer.querySelectorAll('input').forEach(input => {
    const stop = (e) => { if (e.key.length === 1) e.stopPropagation(); };
    input.addEventListener('keydown', stop);
    input.addEventListener('keyup', stop);
  });

  DOM.MemoryHeader.addEventListener('pointerdown', (e) => MemoryViewer.grab(e));
  DOM.MemoryHeader.addEventListener('pointermove', (e) => MemoryViewer.drag(e));

  DOM.MemoryDisplay.addEventListener('mousedown', (e) => {
    const span = e.target.closest('.memory-byte');
    if (!span || !ByteBox.getMemory()) return;

    MemoryViewer.selectByte(Number(span.dataset.addr));
  });

  DOM.MemoryValue.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') MemoryViewer.writeMemoryByte();
  });

  document.querySelectorAll('.shortcut-btn[data-addr]').forEach(btn => {
    btn.addEventListener('click', () => MemoryViewer.setMemoryAddr(btn.dataset.addr));
  });

  document.querySelectorAll('[data-action="resume"]').forEach(btn => {
    btn.addEventListener('click', () => MemoryViewer.resumeHalt());
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'F8' && ByteBox.getMemory()) {
      if (!MemoryViewer.isRunning) {
        MemoryViewer.showMemory();
      } else {
        MemoryViewer.hideMemory();
      }

      e.preventDefault();
    }
  });
});
