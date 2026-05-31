/*
 * SPDX-License-Identifier: MIT
 * Copyright (c) 2025-2026 Contributors to the bytebox-wasm project
 *
 * Part of the bytebox-wasm project - https://github.com/danielspk/bytebox-wasm
 * See LICENSE file for full license details.
 */

module game;

import bytebox;

__gshared ubyte player_x;
__gshared ubyte player_y;
__gshared ubyte[FRAMEBUFFER_SIZE] clear_buffer;

extern(C):

void clear_screen()
{
    spoke(cast(ushort)VIDEO_ADDR, cast(ushort)FRAMEBUFFER_SIZE, &clear_buffer[0]);
}

void update_player()
{
    ubyte pad = peek(cast(ushort)GAMEPAD1_ADDR);

    ubyte new_x = player_x;

    if (pad & BUTTON_LEFT) {
        new_x -= 2;
    }

    if (pad & BUTTON_RIGHT) {
        new_x += 2;
    }

    if (new_x < SCREEN_WIDTH) {
        player_x = new_x;
    }

    if (pad & BUTTON_1) {
        poke(cast(ushort)SFX_CH1_ADDR, 0x7D);
        poke(cast(ushort)(SFX_CH1_ADDR + 1), 0xC3);
        poke(cast(ushort)(SFX_CH1_ADDR + 2), 0x3C);
        poke(cast(ushort)(SFX_CH1_ADDR + 3), 0x87);
    }

    if (pad & BUTTON_2) {
        ushort address = cast(ushort)(COLOR4_ADDR + 2);
        ubyte new_blue = cast(ubyte)(peek(address) + 0x0A);

        poke(address, new_blue);
    }
}

void draw_player()
{
    for (int y = 0; y < 4; y++) {
        int address = VIDEO_ADDR + (((cast(int)player_y + y) * SCREEN_WIDTH) + cast(int)player_x) / 4;

        poke(cast(ushort)address, 0xFF);
    }
}

/// Initializes the game
export void init()
{
    player_x = cast(ubyte)(SCREEN_WIDTH / 2);
    player_y = cast(ubyte)(SCREEN_HEIGHT - 20);
}

/// Updates the game within the gameloop
export void update()
{
    clear_screen();
    update_player();
    draw_player();
}
