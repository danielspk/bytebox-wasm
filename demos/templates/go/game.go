/*
 * SPDX-License-Identifier: MIT
 * Copyright (c) 2025-2026 Contributors to the bytebox-wasm project
 *
 * Part of the bytebox-wasm project - https://github.com/danielspk/bytebox-wasm
 * See LICENSE file for full license details.
 */

package main

var (
	playerX      uint8
	playerY      uint8
	clearBuffer  [FRAMEBUFFER_SIZE]byte
)

func clearScreen() {
	spoke(VIDEO_ADDR, FRAMEBUFFER_SIZE, &clearBuffer[0])
}

func updatePlayer() {
	pad := peek(GAMEPAD1_ADDR)
	newX := playerX

	if pad&BUTTON_LEFT != 0 {
		newX -= 2
	}

	if pad&BUTTON_RIGHT != 0 {
		newX += 2
	}

	if newX < SCREEN_WIDTH {
		playerX = newX
	}

	if pad&BUTTON_1 != 0 {
		poke(SFX_CH1_ADDR, 0x7D)
		poke(SFX_CH1_ADDR+1, 0xC3)
		poke(SFX_CH1_ADDR+2, 0x3C)
		poke(SFX_CH1_ADDR+3, 0x07)
	}

	if pad&BUTTON_2 != 0 {
		address := COLOR4_ADDR + 2
		newBlue := (peek(address) + 0x0A) & 0xFF

		poke(address, newBlue)
	}
}

func drawPlayer() {
	for y := uint32(0); y < 4; y++ {
		address := VIDEO_ADDR + ((uint32(playerY)+y)*uint32(SCREEN_WIDTH)+uint32(playerX))/4

		poke(address, 0xFF)
	}
}

//export init
func init() {
	playerX = SCREEN_WIDTH / 2
	playerY = SCREEN_HEIGHT - 20
}

//export update
func update() {
	clearScreen()
	updatePlayer()
	drawPlayer()
}

// required by TinyGo
func main() {}
