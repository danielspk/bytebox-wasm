/*
 * SPDX-License-Identifier: MIT
 * Copyright (c) 2025 Contributors to the bytebox-wasm project
 *
 * Part of the bytebox-wasm project - https://github.com/danielspk/bytebox-wasm
 * See LICENSE file for full license details.
 */

#include <stdint.h>
#include "bytebox.h"

static uint8_t player_x;
static uint8_t player_y;

void clear_screen()
{
    for (int i = 0; i < FRAMEBUFFER_SIZE; i++) {
        poke(VIDEO_ADDR + i, 0x00);
    }
}

void update_player(void)
{
    const uint8_t pad = peek(GAMEPAD1_ADDR);

    uint8_t new_x = player_x;

    if (pad & BUTTON_LEFT) {
        new_x -= 2;
    }

    if (pad & BUTTON_RIGHT) {
        new_x += 2;
    }

    if (new_x >= 0 && new_x < SCREEN_WIDTH) {
        player_x = new_x;
    }

    if (pad & BUTTON_1) {
        poke(SFX_CH1_ADDR, 0x7D);
        poke(SFX_CH1_ADDR + 1, 0xC3);
        poke(SFX_CH1_ADDR + 2, 0x3C);
        poke(SFX_CH1_ADDR + 3, 0x87);
    }

    if (pad & BUTTON_2) {
        const uint16_t address = COLOR4_ADDR + 2;
        const uint8_t new_blue = peek(address) + 0x0A;

        poke(address, new_blue);
    }
}

void draw_player(void)
{
    for (int y = 0; y < 4; y++) {
        const int address = VIDEO_ADDR + (((player_y + y) * SCREEN_WIDTH) + player_x) / 4;
        
        poke(address, 0xFF);
    }
}

void init(void)
{
    player_x = SCREEN_WIDTH / 2;
    player_y = SCREEN_HEIGHT - 20;
}

void update(void)
{
    clear_screen();
    update_player();
    draw_player();
}
