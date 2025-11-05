#![allow(dead_code)]

/*
 * SPDX-License-Identifier: MIT
 * Copyright (c) 2025 Contributors to the bytebox-wasm project
 *
 * Part of the bytebox-wasm project - https://github.com/danielspk/bytebox-wasm
 * See LICENSE file for full license details.
 */

use core::ffi::c_char;

// ----------------------------------------------------------------------------
// Console Constants
// ----------------------------------------------------------------------------

pub const SCREEN_WIDTH: u8 = 160;
pub const SCREEN_HEIGHT: u8 = 144;
pub const FRAMEBUFFER_SIZE: usize = (SCREEN_WIDTH as usize * SCREEN_HEIGHT as usize) / 4;

// ----------------------------------------------------------------------------
// Memory Addresses Constants
// ----------------------------------------------------------------------------

pub const SYSFLAGS_ADDR: u16 = 0x0040;
pub const SEED_ADDR: u16 = 0x0041;
pub const GAMENAME_ADDR: u16 = 0x0044;
pub const WRAM_ADDR: u16 0xE100;
pub const VIDEO_ADDR: u16 = 0xE900;
pub const COLOR1_ADDR: u16 = 0xFF84;
pub const COLOR2_ADDR: u16 = 0xFF87;
pub const COLOR3_ADDR: u16 = 0xFF8A;
pub const COLOR4_ADDR: u16 = 0xFF8D;
pub const GAMEPAD1_ADDR: u16 = 0xFF94;
pub const GAMEPAD2_ADDR: u16 = 0xFF95;
pub const SFX_CH1_ADDR: u16 = 0xFF98;
pub const SFX_CH2_ADDR: u16 = 0xFF9C;
pub const SFX_CH3_ADDR: u16 = 0xFFA0;
pub const SFX_CH4_ADDR: u16 = 0xFFA4;

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

extern "C" {
    /// Gets the value of a memory address
    #[link_name = "peek"]
    pub fn peek(addr: u16) -> u8;

    /// Sets a value into a memory address
    #[link_name = "poke"]
    pub fn poke(addr: u16, value: u8);

    /// Puts trace information to the console
    #[link_name = "trace"]
    pub fn trace(str_ptr: *const c_char, len: i32);
}
