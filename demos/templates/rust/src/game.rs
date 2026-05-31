/*
 * SPDX-License-Identifier: MIT
 * Copyright (c) 2025-2026 Contributors to the bytebox-wasm project
 *
 * Part of the bytebox-wasm project - https://github.com/danielspk/bytebox-wasm
 * See LICENSE file for full license details.
 */

use crate::bytebox::*;

static mut PLAYER_X: u8 = 0;
static mut PLAYER_Y: u8 = 0;

fn clear_screen() {
    static mut CLEAR_BUFFER: [u8; FRAMEBUFFER_SIZE] = [0; FRAMEBUFFER_SIZE];

    unsafe {
        spoke(VIDEO_ADDR, FRAMEBUFFER_SIZE as u16, CLEAR_BUFFER.as_ptr());
    }
}

fn update_player() {
    let pad = peek(GAMEPAD1_ADDR);

    let mut new_x = unsafe { PLAYER_X };

    if pad & BUTTON_LEFT != 0 {
        new_x = new_x.wrapping_sub(2);
    }

    if pad & BUTTON_RIGHT != 0 {
        new_x = new_x.wrapping_add(2);
    }

    if (new_x as u16) < SCREEN_WIDTH {
        unsafe { PLAYER_X = new_x };
    }

    if pad & BUTTON_1 != 0 {
        poke(SFX_CH1_ADDR, 0x7D);
        poke(SFX_CH1_ADDR + 1, 0xC3);
        poke(SFX_CH1_ADDR + 2, 0x3C);
        poke(SFX_CH1_ADDR + 3, 0x87);
    }

    if pad & BUTTON_2 != 0 {
        let address = COLOR4_ADDR + 2;
        let new_blue = peek(address).wrapping_add(0x0A);
        
        poke(address, new_blue);
    }
}

fn draw_player() {
    let player_x = unsafe { PLAYER_X as u16 };
    let player_y = unsafe { PLAYER_Y as u16 };

    for y in 0..4u16 {
        let address = VIDEO_ADDR + ((player_y + y) * SCREEN_WIDTH + player_x) / 4;
        
        poke(address, 0xFF);
    }
}

/// Initializes the game
#[no_mangle]
pub extern "C" fn init() {
    unsafe {
        PLAYER_X = (SCREEN_WIDTH / 2) as u8;
        PLAYER_Y = (SCREEN_HEIGHT - 20) as u8;
    }
}

/// Updates the game within the gameloop
#[no_mangle]
pub extern "C" fn update() {
    clear_screen();
    update_player();
    draw_player();
}
