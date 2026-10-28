// SPDX-License-Identifier: MIT
// Copyright (c) 2025-2026 Contributors to the bytebox-wasm project
//
// Part of the bytebox-wasm project - https://github.com/danielspk/bytebox-wasm
// See LICENSE file for full license details.

const bb = @import("bytebox.zig");

var player_x: u8 = undefined;
var player_y: u8 = undefined;
var clear_buffer: [bb.FRAMEBUFFER_SIZE]u8 = [_]u8{0} ** bb.FRAMEBUFFER_SIZE;

fn clearScreen() void {
    bb.spoke(bb.VIDEO_ADDR, bb.FRAMEBUFFER_SIZE, &clear_buffer);
}

fn updatePlayer() void {
    const pad = bb.peek(bb.GAMEPAD1_ADDR);
    
    var new_x = player_x;
    
    if (pad & bb.BUTTON_LEFT != 0) {
        new_x -%= 2;
    }
    
    if (pad & bb.BUTTON_RIGHT != 0) {
        new_x +%= 2;
    }
    
    if (new_x < bb.SCREEN_WIDTH - 2) {
        player_x = new_x;
    }
    
    if (pad & bb.BUTTON_1 != 0) {
        bb.poke(bb.SFX_CH1_ADDR, 0x7D);
        bb.poke(bb.SFX_CH1_ADDR + 1, 0xC3);
        bb.poke(bb.SFX_CH1_ADDR + 2, 0x3C);
        bb.poke(bb.SFX_CH1_ADDR + 3, 0x07);
    }
    
    if (pad & bb.BUTTON_2 != 0) {
        const address = bb.COLOR7_ADDR + 1;
        const new_color = bb.peek(address) +% 0x0A;
        bb.poke(address, new_color);
    }
}

fn drawPlayer() void {
    var y: u8 = 0;
    while (y < 4) : (y += 1) {
        const address = bb.VIDEO_ADDR + (((@as(u16, player_y) + @as(u16, y)) * bb.SCREEN_WIDTH) + @as(u16, player_x)) / 2;
        bb.poke(address, 0x66);
        bb.poke(address + 1, 0x66);
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