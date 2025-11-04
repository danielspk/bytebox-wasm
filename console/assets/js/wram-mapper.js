import { ADDR } from './config.js';

// WRAM Mapper ----------------------------------------------------------------

const WRAM_LENGTH = 1024;

export const WRAMMapper = {
  memory: null,
  gameID: null,

  init(memory) {
    this.memory = memory;
  },

  sync(gameID) {
    this.gameID = `bytebox_${gameID}`;

    if (!localStorage.hasOwnProperty(this.gameID)) return;

    try {
      const wramArray = JSON.parse(localStorage.getItem(this.gameID));
      this.memory.set(wramArray.slice(0, WRAM_LENGTH), ADDR.WRAM);
    } catch (err) {
      console.error("❌ error on sync WRAM", err);
    }
  },

  store() {
    if (!((this.memory[ADDR.SYSFLAGS] >> 1) & 1)) return;

    this.memory[ADDR.SYSFLAGS] = this.memory[ADDR.SYSFLAGS] & ~0x02; // auto clear bit 1

    try {
      const wramArray = Array.from(this.memory.slice(ADDR.WRAM, ADDR.WRAM + WRAM_LENGTH));
      localStorage.setItem(this.gameID, JSON.stringify(wramArray));
    } catch (err) {
      console.error("❌ error on store WRAM", err);
    }
  },
};
