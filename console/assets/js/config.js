// Addresses ------------------------------------------------------------------

export const ADDR = {
  SYSFLAGS: 0x0040,     // system flags address - length 1 byte
  SEED: 0x0041,         // seed for random number address - length 1 byte
  GAME_NAME: 0x0048,    // start game name address - length 24 bytes
  ROM: 0x0200,          // start rom address - length 51200 bytes
  WRAM: 0xD000,         // start write ram address - length 1024 bytes
  VIDEO: 0xD800,        // start video address - length 9600 bytes
  PALETTE: 0xFF00,      // start color palettes - length 48 bytes
  GAMEPAD: 0xFF40,      // start gamepads address - length 2 bytes
  SOUND_STATUS: 0xFF5F, // sfx channel status - length 1 byte
  SOUND_SFX: 0xFF60,    // start sfx channels address - length 16 bytes
  MELODY_ATTR: 0xFF7F,  // melody attributes - length 1 byte
  MELODY: 0xFF80,       // melody ring buffer - length 64 bytes
  MELODY_HEAD: 0xFFC0,  // melody ring buffer head - length 1 byte
  MELODY_TAIL: 0xFFC1,  // melody ring buffer tail - length 1 byte
};

// DOM Elements References ----------------------------------------------------

export const DOM = {
  Power: document.getElementById('power'),
  Console: document.getElementById('console'),
  InfoFPS: document.getElementById('i-fps'),
  InfoName: document.getElementById('i-name'),
  InfoSize: document.getElementById('i-size'),
  ScreenCanvas: document.getElementById('screen-canvas'),
  MemoryViewer: document.getElementById('memory-viewer'),
  MemoryHeader: document.getElementById('memory-header'),
  MemoryInput: document.getElementById('memory-input'),
  MemoryDisplay: document.getElementById('memory-display'),
  MemoryAddress: document.getElementById('memory-address'),
  MemoryValue: document.getElementById('memory-value'),
};
