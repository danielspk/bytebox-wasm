// SPDX-License-Identifier: MIT
// Copyright (c) 2025 Contributors to the bytebox-wasm project
//
// Part of the bytebox-wasm project - https://github.com/danielspk/bytebox-wasm
// See LICENSE file for full license details.

const bb = @import("bytebox.zig");

var player_x: u8 = undefined;
var player_y: u8 = undefined;

fn clearScreen() void {
    const clear_buffer = [_]u8{0} ** bb.FRAMEBUFFER_SIZE;

    bb.spoke(bb.VIDEO_ADDR, bb.FRAMEBUFFER_SIZE, &clear_buffer);
}

fn updatePlayer() void {
    const pad = bb.peek(bb.GAMEPAD1_ADDR);
    
    var new_x: i16 = player_x;
    
    if (pad & bb.BUTTON_LEFT != 0) {
        new_x -= 2;
    }
    
    if (pad & bb.BUTTON_RIGHT != 0) {
        new_x += 2;
    }
    
    if (new_x >= 0 and new_x < bb.SCREEN_WIDTH) {
        player_x = @intCast(new_x);
    }
    
    if (pad & bb.BUTTON_1 != 0) {
        bb.poke(bb.SFX_CH1_ADDR, 0x7D);
        bb.poke(bb.SFX_CH1_ADDR + 1, 0xC3);
        bb.poke(bb.SFX_CH1_ADDR + 2, 0x3C);
        bb.poke(bb.SFX_CH1_ADDR + 3, 0x87);
    }
    
    if (pad & bb.BUTTON_2 != 0) {
        const address = bb.COLOR4_ADDR + 2;
        const new_blue = bb.peek(address) +% 0x0A;
        bb.poke(address, new_blue);
    }
}

fn drawPlayer() void {
    var y: u8 = 0;
    while (y < 4) : (y += 1) {
        const address = bb.VIDEO_ADDR + ((@as(u16, player_y + y) * bb.SCREEN_WIDTH) + player_x) / 4;
        bb.poke(address, 0xFF);
    }
}

export fn init() void {
    player_x = bb.SCREEN_WIDTH / 2;
    player_y = bb.SCREEN_HEIGHT - 20;
}

export fn update() void {
    clearScreen();
    updatePlayer();
    drawPlayer();
}
