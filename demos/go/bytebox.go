/*
 * SPDX-License-Identifier: MIT
 * Copyright (c) 2025 Contributors to the bytebox-wasm project
 *
 * Part of the bytebox-wasm project - https://github.com/danielspk/bytebox-wasm
 * See LICENSE file for full license details.
 */

package main

// ----------------------------------------------------------------------------
// Console Constants
// ----------------------------------------------------------------------------

const (
	SCREEN_WIDTH     uint32 = 160
	SCREEN_HEIGHT    uint32 = 144
	FRAMEBUFFER_SIZE uint32 = (SCREEN_WIDTH * SCREEN_HEIGHT / 4)
)

// ----------------------------------------------------------------------------
// Memory Addresses Constants
// ----------------------------------------------------------------------------

const (
	SYSFLAGS_ADDR  uint32 = 0x0040
	SEED_ADDR	   uint32 = 0x0041
	GAMENAME_ADDR  uint32 = 0x0044
	VIDEO_ADDR     uint32 = 0xE900
	COLOR1_ADDR    uint32 = 0xFF84
	COLOR2_ADDR    uint32 = 0xFF87
	COLOR3_ADDR    uint32 = 0xFF8A
	COLOR4_ADDR    uint32 = 0xFF8D
	GAMEPAD1_ADDR  uint32 = 0xFF94
	GAMEPAD2_ADDR  uint32 = 0xFF95
	SFX_CH1_ADDR   uint32 = 0xFF98
	SFX_CH2_ADDR   uint32 = 0xFF9C
	SFX_CH3_ADDR   uint32 = 0xFFA0
	SFX_CH4_ADDR   uint32 = 0xFFA4
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

// Puts trace information to the console
//
//go:wasmimport env trace
func trace(msg string, len uint32)
