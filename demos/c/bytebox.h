#pragma once

/*
 * SPDX-License-Identifier: MIT
 * Copyright (c) 2025 Contributors to the bytebox-wasm project
 *
 * Part of the bytebox-wasm project - https://github.com/danielspk/bytebox-wasm
 * See LICENSE file for full license details.
 */

#include <stdint.h>

// ----------------------------------------------------------------------------
// Macros
// ----------------------------------------------------------------------------

#define BYTE_BOX_IMPORT(name) __attribute__((import_name(name)))
#define BYTE_BOX_EXPORT(name) __attribute__((export_name(name)))

// ----------------------------------------------------------------------------
// Console Constants
// ----------------------------------------------------------------------------

#define SCREEN_WIDTH 160
#define SCREEN_HEIGHT 144
#define MEMORY_SIZE (64 * 1024)
#define FRAMEBUFFER_SIZE (SCREEN_WIDTH * SCREEN_HEIGHT / 4)

// ----------------------------------------------------------------------------
// Memory Addresses Constants
// ----------------------------------------------------------------------------

#define SYSFLAGS_ADDR 0x0040
#define SEED_ADDR 0x0041
#define GAMENAME_ADDR 0x0044
#define VIDEO_ADDR 0xE900
#define COLOR1_ADDR 0xFF84
#define COLOR2_ADDR 0xFF87
#define COLOR3_ADDR 0xFF8A
#define COLOR4_ADDR 0xFF8D
#define GAMEPAD1_ADDR 0xFF94
#define GAMEPAD2_ADDR 0xFF95
#define SFX_CH1_ADDR 0xFF98
#define SFX_CH2_ADDR 0xFF9C
#define SFX_CH3_ADDR 0xFFA0
#define SFX_CH4_ADDR 0xFFA4

// ----------------------------------------------------------------------------
// System Flags Bits Constants
// ----------------------------------------------------------------------------

#define HALT_FLAG 0x01

// ----------------------------------------------------------------------------
// Gamepad Buttons Bits Constants
// ----------------------------------------------------------------------------

#define BUTTON_2 0x01
#define BUTTON_1 0x02
#define BUTTON_RIGHT 0x10
#define BUTTON_DOWN 0x20
#define BUTTON_UP 0x40
#define BUTTON_LEFT 0x80

// ----------------------------------------------------------------------------
// Imported functions
// ----------------------------------------------------------------------------

/* Gets the value of a memory address */
BYTE_BOX_IMPORT("peek")
uint8_t peek(uint16_t addr);

/* Sets a value into a memory address */
BYTE_BOX_IMPORT("poke")
void poke(uint16_t addr, uint8_t value);

/* Puts trace information to the console */
BYTE_BOX_IMPORT("trace")
void trace(const char *str, int len);

// ----------------------------------------------------------------------------
// Exported functions
// ----------------------------------------------------------------------------

/* Initializes the game */
BYTE_BOX_EXPORT("init")
void init(void);

/* Updates the game within the gameloop */
BYTE_BOX_EXPORT("update")
void update(void);
