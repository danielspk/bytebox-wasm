// SPDX-License-Identifier: MIT
// Copyright (c) 2025-2026 Contributors to the bytebox-wasm project
//
// Part of the bytebox-wasm project - https://github.com/danielspk/bytebox-wasm
// See LICENSE file for full license details.

package main

// ----------------------------------------------------------------------------
// Console Constants
// ----------------------------------------------------------------------------

SCREEN_WIDTH     :: u32(160)
SCREEN_HEIGHT    :: u32(120)
MEMORY_SIZE      :: u32(64 * 1024)
FRAMEBUFFER_SIZE :: u32((SCREEN_WIDTH * SCREEN_HEIGHT) / 4)

// ----------------------------------------------------------------------------
// Memory Addresses Constants
// ----------------------------------------------------------------------------

SYSFLAGS_ADDR    :: u32(0x0040)
SEED_ADDR        :: u32(0x0041)
GAMENAME_ADDR    :: u32(0x0044)
WRAM_ADDR        :: u32(0xE100)
VIDEO_ADDR       :: u32(0xE900)
COLOR1_ADDR      :: u32(0xFF84)
COLOR2_ADDR      :: u32(0xFF87)
COLOR3_ADDR      :: u32(0xFF8A)
COLOR4_ADDR      :: u32(0xFF8D)
GAMEPAD1_ADDR    :: u32(0xFF94)
GAMEPAD2_ADDR    :: u32(0xFF95)
SFX_CH1_ADDR     :: u32(0xFF98)
SFX_CH2_ADDR     :: u32(0xFF9C)
SFX_CH3_ADDR     :: u32(0xFFA0)
SFX_CH4_ADDR     :: u32(0xFFA4)
MELODY_ATTR_ADDR :: u32(0xFFA8)
MELODY_ADDR      :: u32(0xFFA9)
MELODY_HEAD_ADDR :: u32(0xFFE9)
MELODY_TAIL_ADDR :: u32(0xFFEA)

// ----------------------------------------------------------------------------
// System Flags Bits Constants
// ----------------------------------------------------------------------------

HALT_FLAG      :: u8(0x01)
DUMP_WRAM_FLAG :: u8(0x02)

// ----------------------------------------------------------------------------
// Gamepad Buttons Bits Constants
// ----------------------------------------------------------------------------

BUTTON_2     :: u8(0x01)
BUTTON_1     :: u8(0x02)
BUTTON_RIGHT :: u8(0x10)
BUTTON_DOWN  :: u8(0x20)
BUTTON_UP    :: u8(0x40)
BUTTON_LEFT  :: u8(0x80)

// ----------------------------------------------------------------------------
// Imported functions
// ----------------------------------------------------------------------------

foreign import env "env"

@(default_calling_convention = "c")
foreign env {
    /// Gets the value of a memory address
    @(link_name = "peek")  peek  :: proc(addr: u32) -> u32 ---

    /// Sets a value into a memory address
    @(link_name = "poke")  poke  :: proc(addr: u32, value: u32) ---

    /// Writes multiple bytes into memory
    @(link_name = "spoke") spoke :: proc(addr: u32, length: u32, data: [^]u8) ---

    /// Puts trace information to the console
    @(link_name = "trace") trace :: proc(str: [^]u8, len: i32) ---
}
