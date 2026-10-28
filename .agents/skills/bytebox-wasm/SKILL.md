---
name: bytebox-wasm
description: Use when writing ByteBox games or templates — the memory map, WASM contract, video/audio/input formats (FAB-4), and how to build, run, and debug a game on this web host.
---

# ByteBox Console — Technical Reference

ByteBox is a fantasy console. Games compile to pure WebAssembly (no WASI) and interact with the console exclusively through four imported functions that read/write a shared 64KB memory array.

This document has two parts:

- **Part 1 — The ByteBox Specification**: the contract every game and every host implements. Host-independent — this is what you program against.
- **Part 2 — Using This Host**: how to build, run, and debug your game on the `console/` web runtime.

This skill is for writing ByteBox games. How the web runtime is implemented internally is not covered here — read the code in `console/assets/js/` for that.

---

# Part 1 — The ByteBox Specification

> This part is the data sheet of the imaginary hardware. It only changes when the console itself changes — a change here affects ALL hosts and ALL games.

## WASM Game Contract

Games must be pure WASM — no WASI, no runtime dependencies.

### Exports (game → console)

| Export | Required | Description |
|---|---|---|
| `update()` | **Yes** | Called 60× per second. |
| `memory` | **Yes** | WASM linear memory; the console reads it to service `spoke`/`trace`. |
| `init()` | No | Called once after load, before the first `update()`. Initialize game state here. |

### Imports (console → game, namespace `env`)

| Function | Signature | Description |
|---|---|---|
| `peek` | `(addr: i32) → i32` | Read one byte from console memory |
| `poke` | `(addr: i32, value: i32)` | Write one byte to console memory |
| `spoke` | `(startAddr: i32, len: i32, ptr: i32)` | Bulk-write `len` bytes from WASM linear memory at `ptr` to console memory at `startAddr` |
| `trace` | `(ptr: i32, len: i32)` | Log a debug string of `len` bytes from WASM linear memory at `ptr` |

Bounds semantics: out-of-range `peek` warns and returns 0; out-of-range `poke`/`spoke` warns and does nothing.

## Execution Model

- `update()` runs at a fixed 60 Hz timestep, deterministically — independent of display refresh rate.
- `init()` (if exported) runs once after the WRAM has been restored and the seed set, before the first `update()`.
- **SEED** (`0x0041`) is set to a random byte at load — the game's entropy source.
- **HALT** (SYSFLAGS bit 0 = 1): `update()` stops being called; rendering and melody playback continue.
- **DUMP WRAM** (SYSFLAGS bit 1 = 1): the console persists the 1KB WRAM region, then auto-clears the bit.
- A game that traps inside `update()` is fatally broken; the console stops it permanently.
- Cartridges should fit in the 50KB ROM region.
- The 50KB limit is about the compiled `.wasm`, not the memory the game uses at runtime: that memory is RAM on the cartridge, outside the console's 64KB map, unlimited and not tracked.

## Memory Map (64KB, little-endian, 8-bit)

| Address | Size | Name | Notes |
|---|---|---|---|
| `0x0000–0x003F` | 64 B | Reserved | Future interrupt vectors (Z80/8080) |
| `0x0040` | 1 B | SYSFLAGS | Bit 0: HALT/RESUME; Bit 1: DUMP WRAM |
| `0x0041` | 1 B | SEED | Set to a random byte at load |
| `0x0042–0x0047` | 6 B | Reserved | Future use |
| `0x0048–0x005F` | 24 B | GAME_NAME | ASCII, read by the host to display the game name |
| `0x0060–0x00FF` | 160 B | Reserved | Future use |
| `0x0100–0x01FF` | 256 B | Reserved | Future Stack (6502/Z80/8080) |
| `0x0200–0xC9FF` | 51,200 B | ROM | Game WASM bytes copied here (if ≤50KB) |
| `0xCA00–0xCFFF` | 1,536 B | Reserved | Future use |
| `0xD000–0xD3FF` | 1,024 B | WRAM | Persistent save area |
| `0xD400–0xD7FF` | 1,024 B | Reserved | Future RAM (6502/Z80/8080) |
| `0xD800–0xFD7F` | 9,600 B | VIDEO | Linear framebuffer, 4bpp, 160×120 |
| `0xFD80–0xFEFF` | 384 B | Reserved | Future use |
| `0xFF00–0xFF2F` | 48 B | PALETTE | 16 × RGB (3 bytes each) |
| `0xFF30–0xFF3F` | 16 B | Reserved | Future use |
| `0xFF40–0xFF41` | 2 B | GAMEPAD | Pad 1 (0xFF40), Pad 2 (0xFF41) |
| `0xFF42–0xFF5E` | 29 B | Reserved | Future use |
| `0xFF5F` | 1 B | SOUND_STATUS | Read-only: bits 0–3 = SFX channel playing |
| `0xFF60–0xFF6F` | 16 B | SOUND_SFX | 4 channels × 4 bytes |
| `0xFF70–0xFF7E` | 15 B | Reserved | Future use |
| `0xFF7F` | 1 B | MELODY_ATTR | Bits 0–3: melody master volume (0–15) |
| `0xFF80–0xFFBF` | 64 B | MELODY | FAB-4 ring buffer (16 entries × 4 bytes) |
| `0xFFC0` | 1 B | MELODY_HEAD | Producer pointer (game writes) |
| `0xFFC1` | 1 B | MELODY_TAIL | Consumer pointer (console advances, read-only) |
| `0xFFC2–0xFFF7` | 54 B | Reserved | Future use |
| `0xFFF8–0xFFFF` | 8 B | Reserved | Future interrupt vectors (6502) |

### SYSFLAGS (0x0040)

```
Bit 7 6 5 4 3 2 1 0
                │ └── HALT: 1=stop update() (rendering continues)
                └──── DUMP WRAM: 1=persist WRAM (auto-cleared by the console)
```

## Video

- **Framebuffer:** `0xD800–0xFD7F`, 9600 bytes
- **Resolution:** 160×120 pixels, 4 bits per pixel → 2 pixels per byte
- **Bit order within each byte (MSB first):**
  ```
  Bits 7-4: pixel 1 (leftmost)
  Bits 3-0: pixel 2 (rightmost)
  ```
- **Palette:** `0xFF00–0xFF2F`, 16 colors × 3 bytes RGB, re-read every frame. Default:
  - Color 0: `#0F0F1B`
  - Color 1: `#8C8FAE`
  - Color 2: `#584563`
  - Color 3: `#3E2137`
  - Color 4: `#9A6348`
  - Color 5: `#D79B7D`
  - Color 6: `#F5EDBA`
  - Color 7: `#C0C741`
  - Color 8: `#647D34`
  - Color 9: `#E4943A`
  - Color 10: `#9D303B`
  - Color 11: `#D26471`
  - Color 12: `#70377F`
  - Color 13: `#7EC4C1`
  - Color 14: `#34859D`
  - Color 15: `#17434B`

## Audio — SFX

**4 independent channels.** Each channel = 4 bytes at `0xFF60 + (channel × 4)`.

**Channel register layout:**

```
Byte 0: FREQ_START  (0–255 → 20–1000 Hz, step = 3.84 Hz)
Byte 1: FREQ_END    (same scale, for frequency sweep)
Byte 2: bits 7-3 = DURATION (0–31 → 0–0.99s, step = 0.032s)
        bits 2-0 = VOLUME   (0–7, scaled to 0.0–0.5 master vol)
Byte 3: bit  7   = unused
        bits 6-4 = VIBRATO  (0–7; LFO freq = 8 + vibrato×2 Hz, depth = 10 + vibrato×15 Hz)
        bits 3-1 = WAVEFORM (0=sine, 1=sawtooth, 2=square, 3=triangle, 4=noise, 5-7=unused)
        bit  0   = TRIGGER  (write 1 to start; console auto-clears after reading)
```

**Channel status (`0xFF5F`):** Bit N = 1 while channel N is playing. Cannot re-trigger a playing channel.

## Audio — Melody (FAB-4 protocol)

Music uses the **FAB-4 protocol**: a 64-byte ring buffer at `0xFF80` holding up to 16 entries of 4 bytes each. Producer-consumer pattern: the game writes entries and advances HEAD (`0xFFC0`); the console consumes entries and advances TAIL (`0xFFC1`), scheduling a short window (~250ms) ahead.

**Entry format (4 bytes):**

```
Byte 0: DELTA_HI  (high byte of delta time in ms)
Byte 1: DELTA_LO  (low byte of delta time in ms)
         → combined: (DELTA_HI << 8) | DELTA_LO milliseconds until this event
Byte 2: bit  7   = unused
        bits 6-0 = NOTE (MIDI note number 0–127)
Byte 3: bit  7   = STATUS (1=note ON, 0=note OFF)
        bits 6-4 = CHANNEL (0–7)
        bits 3-0 = VOLUME  (0–15, scaled 0.0–1.0)
```

**Master volume:** low nibble of MELODY_ATTR (`0xFF7F`), 0–15.

**Note frequency formula:** `440 × 2^((note - 69) / 12)` (standard MIDI pitch).

**Channels and timbres:**

| Channel | Timbre |
|---|---|
| 0 | square |
| 1 | square |
| 2 | sawtooth |
| 3 | triangle |
| 4 | triangle |
| 5 | triangle |
| 6 | sine |
| 7 | noise (percussion) |

**Noise channel (CH7)** is percussive; the note value selects the instrument:
- Note < 40: bass drum (low, 80ms decay)
- Note 40–59: snare (mid, 50ms decay)
- Note ≥ 60: hi-hat (high, 20ms decay)

## Input

Two gamepads at `0xFF40` (pad 1) and `0xFF41` (pad 2). Each byte is bit-mapped:

```
Bit 7: LEFT
Bit 6: UP
Bit 5: DOWN
Bit 4: RIGHT
Bit 3: unused
Bit 2: unused
Bit 1: BUTTON A
Bit 0: BUTTON B
```

## Persistence — WRAM

- **WRAM region:** `0xD000–0xD3FF` (1024 bytes), keyed per game.
- **Load:** restored by the console at game load, before `init()`.
- **Save trigger:** the game sets bit 1 of SYSFLAGS; the console persists the 1024 bytes, then auto-clears the bit.

---

# Part 2 — Using This Host

> This part is operational: how to build, run, and debug a game on the `console/` web runtime. It is specific to this host — another host loads and runs the same game differently.

## Building Your Game

Games are compiled with **Docker — no local toolchain required**. Source lives in `src/`; the build output is always `console/assets/wasm/game.wasm`. Each language has its own `make build-<language>` target (all in the `Makefile`):

| Language | Target | Key constraint |
|---|---|---|
| AssemblyScript | `asc` → wasm | `--runtime stub`, `--noAssert`, initial memory 2 pages |
| C | `wasm32-unknown-unknown` | C23, no stdlib, no WASI |
| C3 | `wasm32` | No stdlib, no libc, no entry, `--memory-env=none` |
| D | `wasm32-unknown-unknown` | `-betterC` (no D runtime) |
| Go | TinyGo `wasm-unknown` | `gc=none`, `scheduler=none`, `panic=trap` |
| Nelua | `wasm32-unknown-unknown` | Compiled via wasi-sdk clang, freestanding, no stdlib |
| Odin | `freestanding_wasm32` | No entry point |
| Rust | `wasm32-unknown-unknown` | cdylib, no_std, post-processed with `wasm-opt -Oz` |
| WAT | `wat2wasm` | Hand-written WebAssembly Text, no toolchain constraints |
| Zig | `wasm32-freestanding` | No entry, ReleaseSmall |

A game over 50KB shows a red size indicator in the UI but still runs. `make package` zips the game for distribution.

## Running & Loading

`make run` serves the console (default port 3000; `PORT=8080 make run` to change it). The console opens with a **power button** — press it to boot. The click is what unlocks the browser's audio, so the game starts with sound already available. On boot it loads `assets/wasm/game.wasm`.

You can also **drag and drop** a `.wasm` file onto the window to load it on the fly — useful for trying a build without copying it into `src/`. Drops are ignored while the console is booting or showing the splash.

`trace` output appears in the browser console as `🔵 WASM TRACE: <string>`.

Two URL parameters tweak startup:

| Parameter | Example | Effect |
|---|---|---|
| `color` | `?color=e74c3c` | Custom frame color (6-digit hex, no `#`) |
| `nosplash` | `?nosplash` | Skip the 1500ms splash screen |

## Controls

Part 1 defines the two gamepad bytes; this host drives them from the keyboard (and from on-screen buttons via touch or mouse):

| Key | Pad | Action |
|---|---|---|
| Arrow Left/Up/Down/Right | 1 | Directions |
| Z or Numpad * | 1 | Button A |
| X or Numpad - | 1 | Button B |
| A/W/S/D | 2 | Directions |
| K | 2 | Button A |
| L | 2 | Button B |

## Debugging

| Key | Action |
|---|---|
| F8 | Toggle the memory viewer |
| F9 | Capture a screenshot |

The **memory viewer** (F8) shows 256 bytes at a time as a hex grid, starting at any address you type (4 hex digits). Click a byte and type a new hex value + Enter to write it live. Shortcut buttons jump to key regions (Flags, WRAM, Video, I/O), a **Halt** toggle flips bit 0 of SYSFLAGS, and **Step** advances a single frame while halted. Use it to watch your framebuffer, inspect WRAM, or poke values while the game runs.

## What Happens When a Game Fails

A failed load or a crash at runtime shows a **terminal red screen** and logs the cause; the only way out is to drag-and-drop a new `.wasm`. Out-of-range memory access does not crash — it is just ignored.

| Condition | What happens |
|---|---|
| WASM not found / network failure | Red screen + error log |
| Invalid WASM binary | Red screen + error log |
| `update` or `memory` export missing | Red screen + error log |
| Game throws inside `init()` | Red screen + error log |
| Game throws inside `update()` | Red screen + error log (permanent) |
| `peek` out of range | Warns, returns 0 |
| `poke` / `spoke` / `trace` out of range | Warns, does nothing |
| WRAM `localStorage` unavailable | Logged; the game keeps running |
