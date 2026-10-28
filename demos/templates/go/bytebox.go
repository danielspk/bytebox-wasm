/*
 * SPDX-License-Identifier: MIT
 * Copyright (c) 2025-2026 Contributors to the bytebox-wasm project
 *
 * Part of the bytebox-wasm project - https://github.com/danielspk/bytebox-wasm
 * See LICENSE file for full license details.
 */

package main

// ----------------------------------------------------------------------------
// Console Constants
// ----------------------------------------------------------------------------

const (
	SCREEN_WIDTH     = 160
	SCREEN_HEIGHT    = 120
	FRAMEBUFFER_SIZE = 160 * 120 / 2
)

// ----------------------------------------------------------------------------
// Memory Addresses Constants
// ----------------------------------------------------------------------------

const (
	SYSFLAGS_ADDR     uint32 = 0x0040
	SEED_ADDR         uint32 = 0x0041
	GAMENAME_ADDR     uint32 = 0x0048
	WRAM_ADDR         uint32 = 0xD000
	VIDEO_ADDR        uint32 = 0xD800
	COLOR1_ADDR       uint32 = 0xFF00
	COLOR2_ADDR       uint32 = 0xFF03
	COLOR3_ADDR       uint32 = 0xFF06
	COLOR4_ADDR       uint32 = 0xFF09
	COLOR5_ADDR       uint32 = 0xFF0C
	COLOR6_ADDR       uint32 = 0xFF0F
	COLOR7_ADDR       uint32 = 0xFF12
	COLOR8_ADDR       uint32 = 0xFF15
	COLOR9_ADDR       uint32 = 0xFF18
	COLOR10_ADDR      uint32 = 0xFF1B
	COLOR11_ADDR      uint32 = 0xFF1E
	COLOR12_ADDR      uint32 = 0xFF21
	COLOR13_ADDR      uint32 = 0xFF24
	COLOR14_ADDR      uint32 = 0xFF27
	COLOR15_ADDR      uint32 = 0xFF2A
	COLOR16_ADDR      uint32 = 0xFF2D
	GAMEPAD1_ADDR     uint32 = 0xFF40
	GAMEPAD2_ADDR     uint32 = 0xFF41
	SOUND_STATUS_ADDR uint32 = 0xFF5F
	SFX_CH1_ADDR      uint32 = 0xFF60
	SFX_CH2_ADDR      uint32 = 0xFF64
	SFX_CH3_ADDR      uint32 = 0xFF68
	SFX_CH4_ADDR      uint32 = 0xFF6C
	MELODY_ATTR_ADDR  uint32 = 0xFF7F
	MELODY_ADDR       uint32 = 0xFF80
	MELODY_HEAD_ADDR  uint32 = 0xFFC0
	MELODY_TAIL_ADDR  uint32 = 0xFFC1
)

// ----------------------------------------------------------------------------
// System Flags Bits Constants
// ----------------------------------------------------------------------------

const HALT_FLAG uint32 = 0x01
const DUMP_WRAM_FLAG uint32 = 0x02

// ----------------------------------------------------------------------------
// Gamepad Buttons Bits Constants
// ----------------------------------------------------------------------------

const (
	BUTTON_2     uint32 = 0x01
	BUTTON_1     uint32 = 0x02
	BUTTON_RIGHT uint32 = 0x10
	BUTTON_DOWN  uint32 = 0x20
	BUTTON_UP    uint32 = 0x40
	BUTTON_LEFT  uint32 = 0x80
)

// ----------------------------------------------------------------------------
// Imported functions
// ----------------------------------------------------------------------------

// Gets the value of a memory address
//
//go:wasmimport env peek
func peek(addr uint32) uint32

// Sets a value into a memory address
//
//go:wasmimport env poke
func poke(addr uint32, value uint32)

// Writes multiple bytes into memory
//
//go:wasmimport env spoke
func spoke(startAddr uint32, length uint32, dataPtr *byte)

// Puts trace information to the console
//
//go:wasmimport env trace
func trace(msg string)
