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
enum FRAMEBUFFER_SIZE = SCREEN_WIDTH * SCREEN_HEIGHT / 2;

// ----------------------------------------------------------------------------
// Memory Addresses Constants
// ----------------------------------------------------------------------------

enum SYSFLAGS_ADDR = 0x0040;
enum SEED_ADDR = 0x0041;
enum GAMENAME_ADDR = 0x0048;
enum WRAM_ADDR = 0xD000;
enum VIDEO_ADDR = 0xD800;
enum COLOR1_ADDR = 0xFF00;
enum COLOR2_ADDR = 0xFF03;
enum COLOR3_ADDR = 0xFF06;
enum COLOR4_ADDR = 0xFF09;
enum COLOR5_ADDR = 0xFF0C;
enum COLOR6_ADDR = 0xFF0F;
enum COLOR7_ADDR = 0xFF12;
enum COLOR8_ADDR = 0xFF15;
enum COLOR9_ADDR = 0xFF18;
enum COLOR10_ADDR = 0xFF1B;
enum COLOR11_ADDR = 0xFF1E;
enum COLOR12_ADDR = 0xFF21;
enum COLOR13_ADDR = 0xFF24;
enum COLOR14_ADDR = 0xFF27;
enum COLOR15_ADDR = 0xFF2A;
enum COLOR16_ADDR = 0xFF2D;
enum GAMEPAD1_ADDR = 0xFF40;
enum GAMEPAD2_ADDR = 0xFF41;
enum SOUND_STATUS_ADDR = 0xFF5F;
enum SFX_CH1_ADDR = 0xFF60;
enum SFX_CH2_ADDR = 0xFF64;
enum SFX_CH3_ADDR = 0xFF68;
enum SFX_CH4_ADDR = 0xFF6C;
enum MELODY_ATTR_ADDR = 0xFF7F;
enum MELODY_ADDR = 0xFF80;
enum MELODY_HEAD_ADDR = 0xFFC0;
enum MELODY_TAIL_ADDR = 0xFFC1;

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
void spoke(ushort start_addr, ushort length, const(ubyte)* data);

/// Puts trace information to the console
void trace(const(char)* str, int len);
