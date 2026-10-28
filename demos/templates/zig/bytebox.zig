// SPDX-License-Identifier: MIT
// Copyright (c) 2025-2026 Contributors to the bytebox-wasm project
//
// Part of the bytebox-wasm project - https://github.com/danielspk/bytebox-wasm
// See LICENSE file for full license details.

// ----------------------------------------------------------------------------
// Console Constants
// ----------------------------------------------------------------------------

pub const SCREEN_WIDTH: u16 = 160;
pub const SCREEN_HEIGHT: u16 = 120;
pub const MEMORY_SIZE: u32 = 64 * 1024;
pub const FRAMEBUFFER_SIZE: u16 = (SCREEN_WIDTH * SCREEN_HEIGHT) / 2;

// ----------------------------------------------------------------------------
// Memory Addresses Constants
// ----------------------------------------------------------------------------

pub const SYSFLAGS_ADDR: u16 = 0x0040;
pub const SEED_ADDR: u16 = 0x0041;
pub const GAMENAME_ADDR: u16 = 0x0048;
pub const WRAM_ADDR: u16 = 0xD000;
pub const VIDEO_ADDR: u16 = 0xD800;
pub const COLOR1_ADDR: u16 = 0xFF00;
pub const COLOR2_ADDR: u16 = 0xFF03;
pub const COLOR3_ADDR: u16 = 0xFF06;
pub const COLOR4_ADDR: u16 = 0xFF09;
pub const COLOR5_ADDR: u16 = 0xFF0C;
pub const COLOR6_ADDR: u16 = 0xFF0F;
pub const COLOR7_ADDR: u16 = 0xFF12;
pub const COLOR8_ADDR: u16 = 0xFF15;
pub const COLOR9_ADDR: u16 = 0xFF18;
pub const COLOR10_ADDR: u16 = 0xFF1B;
pub const COLOR11_ADDR: u16 = 0xFF1E;
pub const COLOR12_ADDR: u16 = 0xFF21;
pub const COLOR13_ADDR: u16 = 0xFF24;
pub const COLOR14_ADDR: u16 = 0xFF27;
pub const COLOR15_ADDR: u16 = 0xFF2A;
pub const COLOR16_ADDR: u16 = 0xFF2D;
pub const GAMEPAD1_ADDR: u16 = 0xFF40;
pub const GAMEPAD2_ADDR: u16 = 0xFF41;
pub const SOUND_STATUS_ADDR: u16 = 0xFF5F;
pub const SFX_CH1_ADDR: u16 = 0xFF60;
pub const SFX_CH2_ADDR: u16 = 0xFF64;
pub const SFX_CH3_ADDR: u16 = 0xFF68;
pub const SFX_CH4_ADDR: u16 = 0xFF6C;
pub const MELODY_ATTR_ADDR: u16 = 0xFF7F;
pub const MELODY_ADDR: u16 = 0xFF80;
pub const MELODY_HEAD_ADDR: u16 = 0xFFC0;
pub const MELODY_TAIL_ADDR: u16 = 0xFFC1;

// ----------------------------------------------------------------------------
// System Flags Bits Constants
// ----------------------------------------------------------------------------

pub const HALT_FLAG: u8 = 0x01;
pub const DUMP_WRAM_FLAG: u8 = 0x02;

// ----------------------------------------------------------------------------
// Gamepad Buttons Bits Constants
// ----------------------------------------------------------------------------

pub const BUTTON_2: u8 = 0x01;
pub const BUTTON_1: u8 = 0x02;
pub const BUTTON_RIGHT: u8 = 0x10;
pub const BUTTON_DOWN: u8 = 0x20;
pub const BUTTON_UP: u8 = 0x40;
pub const BUTTON_LEFT: u8 = 0x80;

// ----------------------------------------------------------------------------
// Imported functions
// ----------------------------------------------------------------------------

/// Gets the value of a memory address
pub extern "env" fn peek(addr: u16) u8;

/// Sets a value into a memory address
pub extern "env" fn poke(addr: u16, value: u8) void;

/// Writes multiple bytes into memory
pub extern "env" fn spoke(start_addr: u16, length: u16, data: [*]const u8) void;

/// Puts trace information to the console
pub extern "env" fn trace(str: [*]const u8, len: i32) void;
