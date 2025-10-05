/*
 * SPDX-License-Identifier: MIT
 * Copyright (c) 2025 Contributors to the bytebox-wasm project
 *
 * Part of the bytebox-wasm project - https://github.com/danielspk/bytebox-wasm
 * See LICENSE file for full license details.
 */

#![no_std]

mod bytebox;
mod game;

// Re-export the public API
pub use game::{init, update};

// Panic handler (required for no_std)
#[panic_handler]
fn panic(_info: &core::panic::PanicInfo) -> ! {
    loop {}
}
