/*
 * SPDX-License-Identifier: MIT
 * Copyright (c) 2025-2026 Contributors to the bytebox-wasm project
 *
 * Part of the bytebox-wasm project - https://github.com/danielspk/bytebox-wasm
 * See LICENSE file for full license details.
 */

import bytebox;

char player_x;
char player_y;

fn void clear_screen()
{
    char[bytebox::FRAMEBUFFER_SIZE] clear_buffer = {};

    bytebox::spoke(bytebox::VIDEO_ADDR, bytebox::FRAMEBUFFER_SIZE, &clear_buffer);
}

fn void update_player()
{
    char pad = bytebox::peek(bytebox::GAMEPAD1_ADDR);

    char new_x = player_x;

    if ((pad & bytebox::BUTTON_LEFT) != 0)
    {
        new_x -= 2;
    }

    if ((pad & bytebox::BUTTON_RIGHT) != 0)
    {
        new_x += 2;
    }

    if (new_x < bytebox::SCREEN_WIDTH)
    {
        player_x = new_x;
    }

    if ((pad & bytebox::BUTTON_1) != 0)
    {
        bytebox::poke(bytebox::SFX_CH1_ADDR, 0x7D);
        bytebox::poke(bytebox::SFX_CH1_ADDR + 1, 0xC3);
        bytebox::poke(bytebox::SFX_CH1_ADDR + 2, 0x3C);
        bytebox::poke(bytebox::SFX_CH1_ADDR + 3, 0x07);
    }

    if ((pad & bytebox::BUTTON_2) != 0)
    {
        ushort address = bytebox::COLOR4_ADDR + 2;
        char new_blue = bytebox::peek(address) + 0x0A;

        bytebox::poke(address, new_blue);
    }
}

fn void draw_player()
{
    for (ushort y = 0; y < 4; y++)
    {
        ushort address = (ushort)(bytebox::VIDEO_ADDR + (((player_y + y) * bytebox::SCREEN_WIDTH + player_x) / 4));

        bytebox::poke(address, 0xFF);
    }
}

fn void init() @export("init")
{
    player_x = bytebox::SCREEN_WIDTH / 2;
    player_y = bytebox::SCREEN_HEIGHT - 20;
}

fn void update() @export("update")
{
    clear_screen();
    update_player();
    draw_player();
}
