/*
 * SPDX-License-Identifier: MIT
 * Copyright (c) 2025-2026 Contributors to the bytebox-wasm project
 *
 * Part of the bytebox-wasm project - https://github.com/danielspk/bytebox-wasm
 * See LICENSE file for full license details.
 */

module bytebox;

// ----------------------------------------------------------------------------
// Console Constants
// ----------------------------------------------------------------------------

const SCREEN_WIDTH     = 160;
const SCREEN_HEIGHT    = 120;
const MEMORY_SIZE      = 64 * 1024;
const FRAMEBUFFER_SIZE = (SCREEN_WIDTH * SCREEN_HEIGHT) / 4;

// ----------------------------------------------------------------------------
// Memory Addresses Constants
// ----------------------------------------------------------------------------

const SYSFLAGS_ADDR    = 0x0040;
const SEED_ADDR        = 0x0041;
const GAMENAME_ADDR    = 0x0044;
const WRAM_ADDR        = 0xE100;
const VIDEO_ADDR       = 0xE900;
const COLOR1_ADDR      = 0xFF84;
const COLOR2_ADDR      = 0xFF87;
const COLOR3_ADDR      = 0xFF8A;
const COLOR4_ADDR      = 0xFF8D;
const GAMEPAD1_ADDR    = 0xFF94;
const GAMEPAD2_ADDR    = 0xFF95;
const SFX_CH1_ADDR     = 0xFF98;
const SFX_CH2_ADDR     = 0xFF9C;
const SFX_CH3_ADDR     = 0xFFA0;
const SFX_CH4_ADDR     = 0xFFA4;
const MELODY_ATTR_ADDR = 0xFFA8;
const MELODY_ADDR      = 0xFFA9;
const MELODY_HEAD_ADDR = 0xFFE9;
const MELODY_TAIL_ADDR = 0xFFEA;

// ----------------------------------------------------------------------------
// System Flags Bits Constants
// ----------------------------------------------------------------------------

const HALT_FLAG      = 0x01;
const DUMP_WRAM_FLAG = 0x02;

// ----------------------------------------------------------------------------
// Gamepad Buttons Bits Constants
// ----------------------------------------------------------------------------

const BUTTON_2     = 0x01;
const BUTTON_1     = 0x02;
const BUTTON_RIGHT = 0x10;
const BUTTON_DOWN  = 0x20;
const BUTTON_UP    = 0x40;
const BUTTON_LEFT  = 0x80;

// ----------------------------------------------------------------------------
// Imported functions
// ----------------------------------------------------------------------------

/* Gets the value of a memory address */
extern fn char peek(ushort addr) @wasm("env", "peek");

/* Sets a value into a memory address */
extern fn void poke(ushort addr, char value) @wasm("env", "poke");

/* Writes multiple bytes into memory */
extern fn void spoke(ushort start_addr, ushort length, char* data) @wasm("env", "spoke");

/* Puts trace information to the console */
extern fn void trace(char* str, int len) @wasm("env", "trace");
