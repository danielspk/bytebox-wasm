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
FRAMEBUFFER_SIZE :: u32((SCREEN_WIDTH * SCREEN_HEIGHT) / 2)

// ----------------------------------------------------------------------------
// Memory Addresses Constants
// ----------------------------------------------------------------------------

SYSFLAGS_ADDR     :: u32(0x0040)
SEED_ADDR         :: u32(0x0041)
GAMENAME_ADDR     :: u32(0x0048)
WRAM_ADDR         :: u32(0xD000)
VIDEO_ADDR        :: u32(0xD800)
COLOR1_ADDR       :: u32(0xFF00)
COLOR2_ADDR       :: u32(0xFF03)
COLOR3_ADDR       :: u32(0xFF06)
COLOR4_ADDR       :: u32(0xFF09)
COLOR5_ADDR       :: u32(0xFF0C)
COLOR6_ADDR       :: u32(0xFF0F)
COLOR7_ADDR       :: u32(0xFF12)
COLOR8_ADDR       :: u32(0xFF15)
COLOR9_ADDR       :: u32(0xFF18)
COLOR10_ADDR      :: u32(0xFF1B)
COLOR11_ADDR      :: u32(0xFF1E)
COLOR12_ADDR      :: u32(0xFF21)
COLOR13_ADDR      :: u32(0xFF24)
COLOR14_ADDR      :: u32(0xFF27)
COLOR15_ADDR      :: u32(0xFF2A)
COLOR16_ADDR      :: u32(0xFF2D)
GAMEPAD1_ADDR     :: u32(0xFF40)
GAMEPAD2_ADDR     :: u32(0xFF41)
SOUND_STATUS_ADDR :: u32(0xFF5F)
SFX_CH1_ADDR      :: u32(0xFF60)
SFX_CH2_ADDR      :: u32(0xFF64)
SFX_CH3_ADDR      :: u32(0xFF68)
SFX_CH4_ADDR      :: u32(0xFF6C)
MELODY_ATTR_ADDR  :: u32(0xFF7F)
MELODY_ADDR       :: u32(0xFF80)
MELODY_HEAD_ADDR  :: u32(0xFFC0)
MELODY_TAIL_ADDR  :: u32(0xFFC1)

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
