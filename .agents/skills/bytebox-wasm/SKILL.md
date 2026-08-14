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
- Cartridges should fit in the 56KB ROM region.

## Memory Map (64KB, little-endian, 8-bit)

| Address | Size | Name | Notes |
|---|---|---|---|
| `0x0000–0x003F` | 64 B | Reserved | Future use |
| `0x0040` | 1 B | SYSFLAGS | Bit 0: HALT/RESUME; Bit 1: DUMP WRAM |
| `0x0041` | 1 B | SEED | Set to a random byte at load |
| `0x0042–0x0043` | 2 B | Reserved | Future use |
| `0x0044–0x005B` | 24 B | GAME_NAME | ASCII, read by the host to display the game name |
| `0x005C–0x00FF` | 164 B | Reserved | Future use |
| `0x0100–0xE0FF` | 57,344 B | ROM | Game WASM bytes copied here (if ≤56KB) |
| `0xE100–0xE4FF` | 1,024 B | WRAM | Persistent save area |
| `0xE500–0xE8FF` | 1,024 B | Reserved | Future RAM + Stack (6502/Z80/8080) |
| `0xE900–0xFBBF` | 4,800 B | VIDEO | Linear framebuffer, 2bpp, 160×120 |
| `0xFBC0–0xFF83` | 964 B | Reserved | Future use |
| `0xFF84–0xFF8F` | 12 B | PALETTE | 4 × RGB (3 bytes each) |
| `0xFF90–0xFF93` | 4 B | Reserved | Future use |
| `0xFF94–0xFF95` | 2 B | GAMEPAD | Pad 1 (0xFF94), Pad 2 (0xFF95) |
| `0xFF96` | 1 B | Reserved | Future use |
| `0xFF97` | 1 B | SOUND_STATUS | Read-only: bits 0–3 = SFX channel playing |
| `0xFF98–0xFFA7` | 16 B | SOUND_SFX | 4 channels × 4 bytes |
| `0xFFA8` | 1 B | MELODY_ATTR | Bits 0–3: melody master volume (0–15) |
| `0xFFA9–0xFFE8` | 64 B | MELODY | FAB-4 ring buffer (16 entries × 4 bytes) |
| `0xFFE9` | 1 B | MELODY_HEAD | Producer pointer (game writes) |
| `0xFFEA` | 1 B | MELODY_TAIL | Consumer pointer (console advances, read-only) |
| `0xFFEB–0xFFFF` | 21 B | Reserved | Future use |

### SYSFLAGS (0x0040)

```
Bit 7 6 5 4 3 2 1 0
                │ └── HALT: 1=stop update() (rendering continues)
                └──── DUMP WRAM: 1=persist WRAM (auto-cleared by the console)
```

## Video

- **Framebuffer:** `0xE900–0xFBBF`, 4800 bytes
- **Resolution:** 160×120 pixels, 2 bits per pixel → 4 pixels per byte
- **Bit order within each byte (MSB first):**
  ```
  Bits 7-6: pixel 1 (leftmost)
  Bits 5-4: pixel 2
  Bits 3-2: pixel 3
  Bits 1-0: pixel 4 (rightmost)
  ```
- **Palette:** `0xFF84–0xFF8F`, 4 colors × 3 bytes RGB, re-read every frame. Default:
  - Color 0: `#0F0F1B` (chinese black)
  - Color 1: `#565A75` (black coral)
  - Color 2: `#C6B7BE` (pale silver)
  - Color 3: `#FAFBF6` (milk)

## Audio — SFX

**4 independent channels.** Each channel = 4 bytes at `0xFF98 + (channel × 4)`.

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

**Channel status (`0xFF97`):** Bit N = 1 while channel N is playing. Cannot re-trigger a playing channel.

## Audio — Melody (FAB-4 protocol)

Music uses the **FAB-4 protocol**: a 64-byte ring buffer at `0xFFA9` holding up to 16 entries of 4 bytes each. Producer-consumer pattern: the game writes entries and advances HEAD (`0xFFE9`); the console consumes entries and advances TAIL (`0xFFEA`), scheduling a short window (~250ms) ahead.

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

**Master volume:** low nibble of MELODY_ATTR (`0xFFA8`), 0–15.

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

Two gamepads at `0xFF94` (pad 1) and `0xFF95` (pad 2). Each byte is bit-mapped:

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

- **WRAM region:** `0xE100–0xE4FF` (1024 bytes), keyed per game.
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

A game over 56KB shows a red size indicator in the UI but still runs. `make package` zips the game for distribution.

## Running & Loading

`make run` serves the console (default port 3000; `PORT=8080 make run` to change it). On start it loads `assets/wasm/game.wasm`.

You can also **drag and drop** a `.wasm` file onto the window to load it on the fly — useful for trying a build without copying it into `src/`. Drops are ignored while the console is booting or showing the splash, and non-`.wasm` drops are discarded.

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

The **memory viewer** (F8) shows 256 bytes at a time as a hex grid, starting at any address you type (4 hex digits). Click a byte and type a new hex value + Enter to write it live. Shortcut buttons jump to key regions, and a Resume/Halt toggle flips bit 0 of SYSFLAGS. Use it to watch your framebuffer, inspect WRAM, or poke values while the game runs.

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
| `poke` / `spoke` out of range | Warns, does nothing |
| WRAM `localStorage` unavailable | Logged; the game keeps running |
