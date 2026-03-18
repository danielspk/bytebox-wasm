// SPDX-License-Identifier: MIT
// Copyright (c) 2025-2026 Contributors to the bytebox-wasm project
//
// Part of the bytebox-wasm project - https://github.com/danielspk/bytebox-wasm
// See LICENSE file for full license details.

package main

player_x: u32
player_y: u32

clear_screen :: proc "c" () {
    clear_buffer: [FRAMEBUFFER_SIZE]u8
    spoke(VIDEO_ADDR, FRAMEBUFFER_SIZE, &clear_buffer[0])
}

update_player :: proc "c" () {
    pad := peek(GAMEPAD1_ADDR)

    new_x := i32(player_x)

    if pad & u32(BUTTON_LEFT) != 0 {
        new_x -= 2
    }

    if pad & u32(BUTTON_RIGHT) != 0 {
        new_x += 2
    }

    if new_x >= 0 && u32(new_x) < SCREEN_WIDTH {
        player_x = u32(new_x)
    }

    if pad & u32(BUTTON_1) != 0 {
        poke(SFX_CH1_ADDR,     0x7D)
        poke(SFX_CH1_ADDR + 1, 0xC3)
        poke(SFX_CH1_ADDR + 2, 0x3C)
        poke(SFX_CH1_ADDR + 3, 0x87)
    }

    if pad & u32(BUTTON_2) != 0 {
        address  := COLOR4_ADDR + 2
        new_blue := (peek(address) + 0x0A) & 0xFF

        poke(address, new_blue)
    }
}

draw_player :: proc "c" () {
    for y := u32(0); y < 4; y += 1 {
        address := VIDEO_ADDR + ((player_y + y) * SCREEN_WIDTH + player_x) / 4

        poke(address, 0xFF)
    }
}

/// Initializes the game
@(export)
init :: proc "c" () {
    player_x = SCREEN_WIDTH / 2
    player_y = SCREEN_HEIGHT - 20
}

/// Updates the game within the gameloop
@(export)
update :: proc "c" () {
    clear_screen()
    update_player()
    draw_player()
}
