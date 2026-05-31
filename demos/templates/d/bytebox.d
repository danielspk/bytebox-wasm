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

enum SCREEN_WIDTH = 160;
enum SCREEN_HEIGHT = 120;
enum MEMORY_SIZE = 64 * 1024;
enum FRAMEBUFFER_SIZE = SCREEN_WIDTH * SCREEN_HEIGHT / 4;

// ----------------------------------------------------------------------------
// Memory Addresses Constants
// ----------------------------------------------------------------------------

enum SYSFLAGS_ADDR = 0x0040;
enum SEED_ADDR = 0x0041;
enum GAMENAME_ADDR = 0x0044;
enum WRAM_ADDR = 0xE100;
enum VIDEO_ADDR = 0xE900;
enum COLOR1_ADDR = 0xFF84;
enum COLOR2_ADDR = 0xFF87;
enum COLOR3_ADDR = 0xFF8A;
enum COLOR4_ADDR = 0xFF8D;
enum GAMEPAD1_ADDR = 0xFF94;
enum GAMEPAD2_ADDR = 0xFF95;
enum SFX_CH1_ADDR = 0xFF98;
enum SFX_CH2_ADDR = 0xFF9C;
enum SFX_CH3_ADDR = 0xFFA0;
enum SFX_CH4_ADDR = 0xFFA4;
enum MELODY_ATTR_ADDR = 0xFFA8;
enum MELODY_ADDR = 0xFFA9;
enum MELODY_HEAD_ADDR = 0xFFE9;
enum MELODY_TAIL_ADDR = 0xFFEA;

// ----------------------------------------------------------------------------
// System Flags Bits Constants
// ----------------------------------------------------------------------------

enum HALT_FLAG = 0x01;
enum DUMP_WRAM_FLAG = 0x02;

// ----------------------------------------------------------------------------
// Gamepad Buttons Bits Constants
// ----------------------------------------------------------------------------

enum BUTTON_2 = 0x01;
enum BUTTON_1 = 0x02;
enum BUTTON_RIGHT = 0x10;
enum BUTTON_DOWN = 0x20;
enum BUTTON_UP = 0x40;
enum BUTTON_LEFT = 0x80;

// ----------------------------------------------------------------------------
// Imported functions
// ----------------------------------------------------------------------------

extern(C):

/// Gets the value of a memory address
ubyte peek(ushort addr);

/// Sets a value into a memory address
void poke(ushort addr, ubyte value);

/// Writes multiple bytes into memory
void spoke(ushort start_addr, ushort length, in ubyte* data);

/// Puts trace information to the console
void trace(in char* str, int len);
