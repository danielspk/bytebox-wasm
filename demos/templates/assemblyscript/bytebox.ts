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
export const FRAMEBUFFER_SIZE: u32 = <u32>SCREEN_WIDTH * <u32>SCREEN_HEIGHT / 4;

// ----------------------------------------------------------------------------
// Memory Addresses Constants
// ----------------------------------------------------------------------------

export const SYSFLAGS_ADDR: u16 = 0x0040;
export const SEED_ADDR: u16 = 0x0041;
export const GAMENAME_ADDR: u16 = 0x0044;
export const WRAM_ADDR: u16 = 0xE100;
export const VIDEO_ADDR: u16 = 0xE900;
export const COLOR1_ADDR: u16 = 0xFF84;
export const COLOR2_ADDR: u16 = 0xFF87;
export const COLOR3_ADDR: u16 = 0xFF8A;
export const COLOR4_ADDR: u16 = 0xFF8D;
export const GAMEPAD1_ADDR: u16 = 0xFF94;
export const GAMEPAD2_ADDR: u16 = 0xFF95;
export const SFX_CH1_ADDR: u16 = 0xFF98;
export const SFX_CH2_ADDR: u16 = 0xFF9C;
export const SFX_CH3_ADDR: u16 = 0xFFA0;
export const SFX_CH4_ADDR: u16 = 0xFFA4;
export const MELODY_ATTR_ADDR: u16 = 0xFFA8;
export const MELODY_ADDR: u16 = 0xFFA9;
export const MELODY_HEAD_ADDR: u16 = 0xFFE9;
export const MELODY_TAIL_ADDR: u16 = 0xFFEA;

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