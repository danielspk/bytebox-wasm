#pragma once

/*
 * SPDX-License-Identifier: MIT
 * Copyright (c) 2025-2026 Contributors to the bytebox-wasm project
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
#define SCREEN_HEIGHT 120
#define MEMORY_SIZE (64 * 1024)
#define FRAMEBUFFER_SIZE (SCREEN_WIDTH * SCREEN_HEIGHT / 2)

// ----------------------------------------------------------------------------
// Memory Addresses Constants
// ----------------------------------------------------------------------------

#define SYSFLAGS_ADDR 0x0040
#define SEED_ADDR 0x0041
#define GAMENAME_ADDR 0x0048
#define WRAM_ADDR 0xD000
#define VIDEO_ADDR 0xD800
#define COLOR1_ADDR 0xFF00
#define COLOR2_ADDR 0xFF03
#define COLOR3_ADDR 0xFF06
#define COLOR4_ADDR 0xFF09
#define COLOR5_ADDR 0xFF0C
#define COLOR6_ADDR 0xFF0F
#define COLOR7_ADDR 0xFF12
#define COLOR8_ADDR 0xFF15
#define COLOR9_ADDR 0xFF18
#define COLOR10_ADDR 0xFF1B
#define COLOR11_ADDR 0xFF1E
#define COLOR12_ADDR 0xFF21
#define COLOR13_ADDR 0xFF24
#define COLOR14_ADDR 0xFF27
#define COLOR15_ADDR 0xFF2A
#define COLOR16_ADDR 0xFF2D
#define GAMEPAD1_ADDR 0xFF40
#define GAMEPAD2_ADDR 0xFF41
#define SOUND_STATUS_ADDR 0xFF5F
#define SFX_CH1_ADDR 0xFF60
#define SFX_CH2_ADDR 0xFF64
#define SFX_CH3_ADDR 0xFF68
#define SFX_CH4_ADDR 0xFF6C
#define MELODY_ATTR_ADDR 0xFF7F
#define MELODY_ADDR 0xFF80
#define MELODY_HEAD_ADDR 0xFFC0
#define MELODY_TAIL_ADDR 0xFFC1

// ----------------------------------------------------------------------------
// System Flags Bits Constants
// ----------------------------------------------------------------------------

#define HALT_FLAG 0x01
#define DUMP_WRAM_FLAG 0x02

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

/* Writes multiple bytes into memory */
BYTE_BOX_IMPORT("spoke")
void spoke(uint16_t start_addr, uint16_t length, const uint8_t *data);

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
