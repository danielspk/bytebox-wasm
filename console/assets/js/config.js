// Addresses ------------------------------------------------------------------

export const ADDR = {
  SYSFLAGS: 0x0040,     // system flags address - length 1 byte
  SEED: 0x0041,         // seed for random number address - length 1 byte
  GAME_NAME: 0x0044,    // start game name address - length 24 bytes
  ROM: 0x0100,          // start rom address - length 57344 bytes
  WRAM: 0xE100,         // start write ram address - length 1024 bytes
  VIDEO: 0xE900,        // start video address - length 4800 bytes
  PALETTE: 0xFF84,      // start color palettes - length 12 bytes
  GAMEPAD: 0xFF94,      // start gamepads address - length 2 bytes
  SOUND_STATUS: 0xFF97, // sfx channel status - length 1 byte
  SOUND_SFX: 0xFF98,    // start sfx channels address - length 16 bytes
  MELODY_ATTR: 0xFFA8,  // melody attributes - length 1 byte
  MELODY: 0xFFA9,       // melody ring buffer - length 64 bytes
  MELODY_HEAD: 0xFFE9,  // melody ring buffer head - length 1 byte
  MELODY_TAIL: 0xFFEA,  // melody ring buffer tail - length 1 byte
};

// DOM Elements References ----------------------------------------------------

export const DOM = {
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
