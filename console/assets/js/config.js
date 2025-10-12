// Addresses ------------------------------------------------------------------

export const ADDR = {
  SYSFLAGS: 0x0040,     // system flags address - length 1 byte
  SEED: 0x0041,         // seed for random number address - length 1 byte
  GAME_NAME: 0x0044,    // start game name address - length 24 bytes
  RAM: 0x0100,          // start ram address - length 59392 bytes
  VIDEO: 0xE900,        // start video address - length 5760 bytes
  PALETTE: 0xFF84,      // start color palettes - length 12 bytes
  GAMEPAD: 0xFF94,      // start gamepads address - length 2 bytes
  SOUND_STATUS: 0xFF97, // sfx channel status - length 1 byte
  SOUND_SFX: 0xFF98,    // start sfx channels address - length 16 bytes
};

// DOM Elements References ----------------------------------------------------

export const DOM = {
  Console: document.getElementById('console'),
  InfoFPS: document.getElementById('i-fps'),
  InfoName: document.getElementById('i-name'),
  InfoSize: document.getElementById('i-size'),
  ScreenCanvas: document.getElementById('screen-canvas'),
  Debugger: document.getElementById('debugger'),
  MemoryInput: document.getElementById('memory-input'),
  MemoryDisplay: document.getElementById('memory-display')
};
