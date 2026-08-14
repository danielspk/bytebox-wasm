;; SPDX-License-Identifier: MIT
;; Copyright (c) 2025-2026 Contributors to the bytebox-wasm project
;;
;; Part of the bytebox-wasm project - https://github.com/danielspk/bytebox-wasm
;; See LICENSE file for full license details.

(module
  ;; --------------------------------------------------------------------------
  ;; Imported functions
  ;; --------------------------------------------------------------------------

  ;; Gets the value of a memory address
  (import "env" "peek" (func $peek (param i32) (result i32)))

  ;; Sets a value into a memory address
  (import "env" "poke" (func $poke (param i32 i32)))

  ;; Writes multiple bytes into memory
  (import "env" "spoke" (func $spoke (param i32 i32 i32)))

  ;; Puts trace information to the console
  (import "env" "trace" (func $trace (param i32 i32)))

  ;; --------------------------------------------------------------------------
  ;; Linear memory
  ;; --------------------------------------------------------------------------

  (memory (export "memory") 1)

  (global $CLEAR_BUF i32 (i32.const 0))

  ;; --------------------------------------------------------------------------
  ;; Console Constants
  ;; --------------------------------------------------------------------------

  (global $SCREEN_WIDTH     i32 (i32.const 160))
  (global $SCREEN_HEIGHT    i32 (i32.const 120))
  (global $MEMORY_SIZE      i32 (i32.const 0x10000))
  (global $FRAMEBUFFER_SIZE i32 (i32.const 4800))

  ;; --------------------------------------------------------------------------
  ;; Memory Addresses Constants
  ;; --------------------------------------------------------------------------

  (global $SYSFLAGS_ADDR    i32 (i32.const 0x0040))
  (global $SEED_ADDR        i32 (i32.const 0x0041))
  (global $GAMENAME_ADDR    i32 (i32.const 0x0044))
  (global $WRAM_ADDR        i32 (i32.const 0xE100))
  (global $VIDEO_ADDR       i32 (i32.const 0xE900))
  (global $COLOR1_ADDR      i32 (i32.const 0xFF84))
  (global $COLOR2_ADDR      i32 (i32.const 0xFF87))
  (global $COLOR3_ADDR      i32 (i32.const 0xFF8A))
  (global $COLOR4_ADDR      i32 (i32.const 0xFF8D))
  (global $GAMEPAD1_ADDR    i32 (i32.const 0xFF94))
  (global $GAMEPAD2_ADDR    i32 (i32.const 0xFF95))
  (global $SFX_CH1_ADDR     i32 (i32.const 0xFF98))
  (global $SFX_CH2_ADDR     i32 (i32.const 0xFF9C))
  (global $SFX_CH3_ADDR     i32 (i32.const 0xFFA0))
  (global $SFX_CH4_ADDR     i32 (i32.const 0xFFA4))
  (global $MELODY_ATTR_ADDR i32 (i32.const 0xFFA8))
  (global $MELODY_ADDR      i32 (i32.const 0xFFA9))
  (global $MELODY_HEAD_ADDR i32 (i32.const 0xFFE9))
  (global $MELODY_TAIL_ADDR i32 (i32.const 0xFFEA))

  ;; --------------------------------------------------------------------------
  ;; System Flags Bits Constants
  ;; --------------------------------------------------------------------------

  (global $HALT_FLAG      i32 (i32.const 0x01))
  (global $DUMP_WRAM_FLAG i32 (i32.const 0x02))

  ;; --------------------------------------------------------------------------
  ;; Gamepad Buttons Bits Constants
  ;; --------------------------------------------------------------------------

  (global $BUTTON_2     i32 (i32.const 0x01))
  (global $BUTTON_1     i32 (i32.const 0x02))
  (global $BUTTON_RIGHT i32 (i32.const 0x10))
  (global $BUTTON_DOWN  i32 (i32.const 0x20))
  (global $BUTTON_UP    i32 (i32.const 0x40))
  (global $BUTTON_LEFT  i32 (i32.const 0x80))

  ;; --------------------------------------------------------------------------
  ;; Game Logic
  ;; --------------------------------------------------------------------------

  (global $player_x (mut i32) (i32.const 0))
  (global $player_y (mut i32) (i32.const 0))

  (func $clear_screen
    (call $spoke
      (global.get $VIDEO_ADDR)
      (global.get $FRAMEBUFFER_SIZE)
      (global.get $CLEAR_BUF)))

  (func $update_player
    (local $pad i32)
    (local $new_x i32)
    (local $address i32)

    (local.set $pad (call $peek (global.get $GAMEPAD1_ADDR)))
    (local.set $new_x (global.get $player_x))

    (if (i32.and (local.get $pad) (global.get $BUTTON_LEFT))
      (then (local.set $new_x (i32.sub (local.get $new_x) (i32.const 2)))))

    (if (i32.and (local.get $pad) (global.get $BUTTON_RIGHT))
      (then (local.set $new_x (i32.add (local.get $new_x) (i32.const 2)))))

    (local.set $new_x (i32.and (local.get $new_x) (i32.const 0xFF)))

    (if (i32.lt_u (local.get $new_x) (global.get $SCREEN_WIDTH))
      (then (global.set $player_x (local.get $new_x))))

    (if (i32.and (local.get $pad) (global.get $BUTTON_1))
      (then
        (call $poke (global.get $SFX_CH1_ADDR) (i32.const 0x7D))
        (call $poke (i32.add (global.get $SFX_CH1_ADDR) (i32.const 1)) (i32.const 0xC3))
        (call $poke (i32.add (global.get $SFX_CH1_ADDR) (i32.const 2)) (i32.const 0x3C))
        (call $poke (i32.add (global.get $SFX_CH1_ADDR) (i32.const 3)) (i32.const 0x07))))

    (if (i32.and (local.get $pad) (global.get $BUTTON_2))
      (then
        (local.set $address (i32.add (global.get $COLOR4_ADDR) (i32.const 2)))
        (call $poke
          (local.get $address)
          (i32.and
            (i32.add (call $peek (local.get $address)) (i32.const 0x0A))
            (i32.const 0xFF))))))

  (func $draw_player
    (local $y i32)
    (local $address i32)
    (local.set $y (i32.const 0))
    (block $break
      (loop $loop
        (br_if $break (i32.ge_u (local.get $y) (i32.const 4)))
        (local.set $address
          (i32.add
            (global.get $VIDEO_ADDR)
            (i32.div_u
              (i32.add
                (i32.mul
                  (i32.add (global.get $player_y) (local.get $y))
                  (global.get $SCREEN_WIDTH))
                (global.get $player_x))
              (i32.const 4))))
        (call $poke (local.get $address) (i32.const 0xFF))
        (local.set $y (i32.add (local.get $y) (i32.const 1)))
        (br $loop))))

  (func (export "init")
    (global.set $player_x (i32.div_u (global.get $SCREEN_WIDTH) (i32.const 2)))
    (global.set $player_y (i32.sub (global.get $SCREEN_HEIGHT) (i32.const 20))))

  (func (export "update")
    (call $clear_screen)
    (call $update_player)
    (call $draw_player))
)
