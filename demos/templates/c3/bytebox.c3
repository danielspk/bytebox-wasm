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
const FRAMEBUFFER_SIZE = (SCREEN_WIDTH * SCREEN_HEIGHT) / 2;

// ----------------------------------------------------------------------------
// Memory Addresses Constants
// ----------------------------------------------------------------------------

const SYSFLAGS_ADDR     = 0x0040;
const SEED_ADDR         = 0x0041;
const GAMENAME_ADDR     = 0x0048;
const WRAM_ADDR         = 0xD000;
const VIDEO_ADDR        = 0xD800;
const COLOR1_ADDR       = 0xFF00;
const COLOR2_ADDR       = 0xFF03;
const COLOR3_ADDR       = 0xFF06;
const COLOR4_ADDR       = 0xFF09;
const COLOR5_ADDR       = 0xFF0C;
const COLOR6_ADDR       = 0xFF0F;
const COLOR7_ADDR       = 0xFF12;
const COLOR8_ADDR       = 0xFF15;
const COLOR9_ADDR       = 0xFF18;
const COLOR10_ADDR      = 0xFF1B;
const COLOR11_ADDR      = 0xFF1E;
const COLOR12_ADDR      = 0xFF21;
const COLOR13_ADDR      = 0xFF24;
const COLOR14_ADDR      = 0xFF27;
const COLOR15_ADDR      = 0xFF2A;
const COLOR16_ADDR      = 0xFF2D;
const GAMEPAD1_ADDR     = 0xFF40;
const GAMEPAD2_ADDR     = 0xFF41;
const SOUND_STATUS_ADDR = 0xFF5F;
const SFX_CH1_ADDR      = 0xFF60;
const SFX_CH2_ADDR      = 0xFF64;
const SFX_CH3_ADDR      = 0xFF68;
const SFX_CH4_ADDR      = 0xFF6C;
const MELODY_ATTR_ADDR  = 0xFF7F;
const MELODY_ADDR       = 0xFF80;
const MELODY_HEAD_ADDR  = 0xFFC0;
const MELODY_TAIL_ADDR  = 0xFFC1;

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
