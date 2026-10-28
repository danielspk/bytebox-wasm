// SPDX-License-Identifier: MIT
// Copyright (c) 2025-2026 Contributors to the bytebox-wasm project
//
// Part of the bytebox-wasm project - https://github.com/danielspk/bytebox-wasm
// See LICENSE file for full license details.

// ----------------------------------------------------------------------------
// Console Constants
// ----------------------------------------------------------------------------

export const SCREEN_WIDTH: u16 = 160;
export const SCREEN_HEIGHT: u16 = 120;
export const FRAMEBUFFER_SIZE: u32 = <u32>SCREEN_WIDTH * <u32>SCREEN_HEIGHT / 2;

// ----------------------------------------------------------------------------
// Memory Addresses Constants
// ----------------------------------------------------------------------------

export const SYSFLAGS_ADDR: u16 = 0x0040;
export const SEED_ADDR: u16 = 0x0041;
export const GAMENAME_ADDR: u16 = 0x0048;
export const WRAM_ADDR: u16 = 0xD000;
export const VIDEO_ADDR: u16 = 0xD800;
export const COLOR1_ADDR: u16 = 0xFF00;
export const COLOR2_ADDR: u16 = 0xFF03;
export const COLOR3_ADDR: u16 = 0xFF06;
export const COLOR4_ADDR: u16 = 0xFF09;
export const COLOR5_ADDR: u16 = 0xFF0C;
export const COLOR6_ADDR: u16 = 0xFF0F;
export const COLOR7_ADDR: u16 = 0xFF12;
export const COLOR8_ADDR: u16 = 0xFF15;
export const COLOR9_ADDR: u16 = 0xFF18;
export const COLOR10_ADDR: u16 = 0xFF1B;
export const COLOR11_ADDR: u16 = 0xFF1E;
export const COLOR12_ADDR: u16 = 0xFF21;
export const COLOR13_ADDR: u16 = 0xFF24;
export const COLOR14_ADDR: u16 = 0xFF27;
export const COLOR15_ADDR: u16 = 0xFF2A;
export const COLOR16_ADDR: u16 = 0xFF2D;
export const GAMEPAD1_ADDR: u16 = 0xFF40;
export const GAMEPAD2_ADDR: u16 = 0xFF41;
export const SOUND_STATUS_ADDR: u16 = 0xFF5F;
export const SFX_CH1_ADDR: u16 = 0xFF60;
export const SFX_CH2_ADDR: u16 = 0xFF64;
export const SFX_CH3_ADDR: u16 = 0xFF68;
export const SFX_CH4_ADDR: u16 = 0xFF6C;
export const MELODY_ATTR_ADDR: u16 = 0xFF7F;
export const MELODY_ADDR: u16 = 0xFF80;
export const MELODY_HEAD_ADDR: u16 = 0xFFC0;
export const MELODY_TAIL_ADDR: u16 = 0xFFC1;

// ----------------------------------------------------------------------------
// System Flags Bits Constants
// ----------------------------------------------------------------------------

export const HALT_FLAG: u8 = 0x01;
export const DUMP_WRAM_FLAG: u8 = 0x02;

// ----------------------------------------------------------------------------
// Gamepad Buttons Bits Constants
// ----------------------------------------------------------------------------

export const BUTTON_2: u8 = 0x01;
export const BUTTON_1: u8 = 0x02;
export const BUTTON_RIGHT: u8 = 0x10;
export const BUTTON_DOWN: u8 = 0x20;
export const BUTTON_UP: u8 = 0x40;
export const BUTTON_LEFT: u8 = 0x80;

// ----------------------------------------------------------------------------
// Imported functions
// ----------------------------------------------------------------------------

@external("env", "peek")
export declare function peek(addr: u16): u8;

@external("env", "poke")
export declare function poke(addr: u16, value: u8): void;

@external("env", "spoke")
export declare function spoke(start_addr: u16, length: u16, data_ptr: usize): void;

@external("env", "trace")
export declare function trace(str_ptr: usize, len: i32): void;