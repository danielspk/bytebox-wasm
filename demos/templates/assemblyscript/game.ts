// SPDX-License-Identifier: MIT
// Copyright (c) 2025-2026 Contributors to the bytebox-wasm project
//
// Part of the bytebox-wasm project - https://github.com/danielspk/bytebox-wasm
// See LICENSE file for full license details.

import { SCREEN_WIDTH, SCREEN_HEIGHT, FRAMEBUFFER_SIZE, VIDEO_ADDR, GAMEPAD1_ADDR, SFX_CH1_ADDR, COLOR4_ADDR, BUTTON_1, BUTTON_2, BUTTON_LEFT, BUTTON_RIGHT, peek, poke, spoke } from "./bytebox";

var playerX: u8 = 0;
var playerY: u8 = 0;
var clearBuffer: StaticArray<u8> = new StaticArray<u8>(<i32>FRAMEBUFFER_SIZE);

function clearScreen(): void {
    spoke(VIDEO_ADDR, <u16>FRAMEBUFFER_SIZE, changetype<usize>(clearBuffer));
}

function updatePlayer(): void {
    const pad = peek(GAMEPAD1_ADDR);
    let newX: u8 = playerX;

    if (pad & BUTTON_LEFT) {
        newX = <u8>(newX - 2);
    }

    if (pad & BUTTON_RIGHT) {
        newX = <u8>(newX + 2);
    }

    if (newX < SCREEN_WIDTH) {
        playerX = newX;
    }

    if (pad & BUTTON_1) {
        poke(SFX_CH1_ADDR, 0x7D);
        poke(SFX_CH1_ADDR + 1, 0xC3);
        poke(SFX_CH1_ADDR + 2, 0x3C);
        poke(SFX_CH1_ADDR + 3, 0x87);
    }

    if (pad & BUTTON_2) {
        const address = COLOR4_ADDR + 2;
        const newBlue = <u8>((peek(address) + 0x0A) & 0xFF);
        poke(address, newBlue);
    }
}

function drawPlayer(): void {
    for (let y: u16 = 0; y < 4; y++) {
        const address = VIDEO_ADDR + ((<u16>playerY + y) * <u16>SCREEN_WIDTH + <u16>playerX) / 4;
        poke(address, 0xFF);
    }
}

export function init(): void {
    playerX = <u8>(SCREEN_WIDTH / 2);
    playerY = <u8>(SCREEN_HEIGHT - 20);
}

export function update(): void {
    clearScreen();
    updatePlayer();
    drawPlayer();
}