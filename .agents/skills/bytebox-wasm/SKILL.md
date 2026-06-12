---
name: bytebox-wasm
description: Use when writing ByteBox games or templates (memory map, WASM contract, video/audio/input formats) or when developing this repo's web runtime (JS modules, state machine, memory viewer).
---

# ByteBox Console — Technical Reference

ByteBox is a fantasy console. Games compile to pure WebAssembly (no WASI) and interact with the console exclusively through four imported functions that read/write a shared 64KB memory array.

This document has two parts with a hard boundary:

- **Part 1 — The ByteBox Specification**: the contract every game and every host implements. Host-independent.
- **Part 2 — This Host**: how the web runtime in `console/` (vanilla JS, WebGL, Web Audio) implements that contract, plus its tooling.

Boundary test for any fact: *would a game ported to another host need to know this?* Yes → Part 1. No → Part 2.

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
        bit  3   = unused
        bits 2-1 = WAVEFORM (0=sine, 1=sawtooth, 2=square, 3=triangle)
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
Byte 2: NOTE (full byte, MIDI note number 0–255; standard range 0–127)
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

# Part 2 — This Host: Web Runtime (`console/`)

> This part documents ONE implementation of the contract — ~1000 lines of vanilla JavaScript using WebGL for video and the Web Audio API for sound. It changes freely along with the code; no game should depend on anything in it.

## Architecture: Nine ES6 Modules

All runtime code lives in `console/assets/js/`. Each module owns one concern:

| Module | File | Responsibility |
|---|---|---|
| Console | `console.js` | WASM instantiation, 60 FPS game loop, memory array, imports (`peek`/`poke`/`spoke`/`trace`) |
| Config | `config.js` | Memory address constants (`ADDR`) and DOM element references (`DOM`) |
| VideoMapper | `video-mapper.js` | WebGL pixel rendering; decodes 2-bit-per-pixel framebuffer to screen |
| InputMapper | `input-mapper.js` | Keyboard + touch/virtual pad input mapped to two gamepad bytes |
| SoundMapper | `sound-mapper.js` | 4 SFX channels using Web Audio oscillators |
| MelodyMapper | `melody-mapper.js` | Music playback via FAB-4 ring buffer protocol |
| AudioBus | `audio-bus.js` | Shared `AudioContext` and master gain node |
| WRAMMapper | `wram-mapper.js` | Persists 1KB WRAM to `localStorage`, keyed by game ID |
| MemoryViewer | `memory-viewer.js` | Hex memory viewer (toggle with F8), reads/writes memory via `ByteBox.getMemory()` |

### Initialization order (DOMContentLoaded)

```
ByteBox.applyFrameColor()
ByteBox.init(wasmUrl)
  └── ByteBox.setup()                ← state: LOADING
        ├── new Uint8Array(65536)  ← the single shared memory
        ├── AudioBus.setup()
        ├── VideoMapper.init(memory)
        ├── InputMapper.init(memory)
        ├── SoundMapper.init(memory)
        ├── MelodyMapper.init(memory)
        └── WRAMMapper.init(memory)
  └── ByteBox.load(wasmUrl)
        ├── fetch + WebAssembly.instantiate({ env: { peek, poke, spoke, trace } })
        ├── validate exports.update / exports.memory exist
        ├── WRAMMapper.sync(gameID)   ← restore saved state
        ├── memory[0x0041] = (Math.random() * 256) | 0  ← seed
        └── exports.init?.()
  └── ByteBox.start()
        ├── splash screen (1500ms) unless ?nosplash
        └── state: READY → ByteBox.run() → state: RUNNING (requestAnimationFrame game loop)
```

The runtime is a 4-state machine: `LOADING` (boot, load and splash — drops ignored), `READY` (loaded, loop stopped — also reached on pause), `RUNNING` (game loop live) and `CRASHED` (terminal red screen — only exited by dropping a new `.wasm`).

### Game loop (run)

Uses a fixed-timestep accumulator at 16.67ms (60 FPS):

```
requestAnimationFrame(gameLoop)
  accumulator += delta
  while (accumulator >= 16.67ms):
    if !(memory[0x0040] & 0x01):   ← HALT bit
      exports.update()
      WRAMMapper.store()           ← only writes if DUMP bit set
      SoundMapper.play()           ← checks SFX trigger bits
    accumulator -= 16.67ms
  VideoMapper.render()             ← always, even when halted
  MelodyMapper.tick()              ← always
  updateFPS()
```

A warning logs if the accumulator exceeds 200ms (spiral-of-death guard).

## Video Implementation

**Rendering pipeline** (`video-mapper.js`):
1. Read palette from `0xFF84`
2. Iterate 4800 framebuffer bytes; extract 4 × 2-bit color indices per byte
3. Map each index to RGBA via palette
4. Upload 160×120 RGBA texture to WebGL via `texSubImage2D`
5. Draw as `TRIANGLE_STRIP` with nearest-neighbor filtering (no interpolation)

**Scaling:** Computed on every resize event. Two modes:
- **Portrait / desktop:** `scale = min(floor(innerWidth×0.9 / 160), floor(innerHeight×0.65 / 120), 3)`, minimum 1
- **Landscape mobile** (`innerWidth > innerHeight && innerHeight < 550`): `scale = max(1, floor(innerHeight / 120))`

Canvas size = `160 × scale` × `120 × scale`. Visibility is set to `inherit` after first resize.

## Audio Implementation

**AudioBus** (`audio-bus.js`): holds the shared `AudioContext` and a `masterGain` node. Created lazily on first user interaction (browser autoplay policy). All audio nodes connect through `masterGain`.

**SFX playback** (`sound-mapper.js`): each trigger creates a new `OscillatorNode` + `GainNode`. Frequency sweeps via `exponentialRampToValueAtTime`. Vibrato adds an LFO oscillator (`sine`) modulating the main frequency. Gain fades to 0.001 at end of duration. `onended` clears the status bit.

**Melody playback** (`melody-mapper.js`): `tick()` is called every animation frame; it reads up to 16 entries from the ring buffer, scheduling events up to 250ms ahead on the `AudioContext` timeline. The noise channel uses a pre-generated white noise buffer (2s, looped) through a bandpass filter whose frequency/Q/decay are selected by note range (120 Hz / 800 Hz / 6000 Hz).

## Input Implementation

**Physical key mapping** (`input-mapper.js`):

| Key | Pad | Action |
|---|---|---|
| Arrow Left/Up/Down/Right | 1 | Directions |
| Z or Numpad * | 1 | Button A |
| X or Numpad - | 1 | Button B |
| A/W/S/D | 2 | Directions |
| K | 2 | Button A |
| L | 2 | Button B |

Virtual pad buttons use `data-key` HTML attributes, handled via `mousedown`/`touchstart` and `mouseup`/`touchend`/`mouseleave`/`touchcancel`.

## Persistence Implementation

WRAM is stored in `localStorage` under the key `bytebox_<gameID>`. Game identity is derived from the first 16 bytes of the WASM binary + total byte length, base64-encoded:

```js
const gameID = btoa(String.fromCharCode(...wasmBytes.slice(0, 16))) + wasmBytes.length;
WRAMMapper.sync(gameID);
```

JSON parse / localStorage errors are caught and logged.

## Memory Viewer (`memory-viewer.js`)

Toggle with **F8**. Displays 16 rows × 16 columns = 256 bytes starting at a configurable base address (default: `0xE900` = video framebuffer).

**Features:**
- Navigate to any address by typing a 4-digit hex value
- Click any byte to select it for editing
- Type a hex value + Enter to write it directly to memory via `ByteBox.getMemory()`
- Shortcut buttons for quick navigation to key memory regions
- Resume/Halt toggle (XOR bit 0 of `0x0040`)
- Updates every 4 animation frames (~15 FPS)
- Changed bytes highlighted; zero bytes dimmed

## URL Parameters

| Parameter | Example | Effect |
|---|---|---|
| `color` | `?color=e74c3c` | Custom frame color (6-digit hex, no `#`) |
| `nosplash` | `?nosplash` | Skip 1500ms splash screen at startup |

## Keyboard Shortcuts

| Key | Action |
|---|---|
| F8 | Toggle memory viewer |
| F9 | Capture screenshot |

## Loading a Game

The console loads `assets/wasm/game.wasm` by default (with cache-busting `?t=<timestamp>`). Games can also be loaded by **drag-and-drop**: dropping a `.wasm` file onto the browser window calls `ByteBox.restart(objectURL)`, which cancels the current animation frame and re-runs the full init sequence. Drops are ignored while the console is in `LOADING` state (a load or the splash is in progress), and drops carrying no file (text, links) are discarded.

`trace` output goes to the browser console as `🔵 WASM TRACE: <string>`.

## Error Conditions

All load and runtime failures converge on `error()`: palette[0] set to red `[255,0,0]`, framebuffer cleared and rendered, error logged, state set to `CRASHED` (terminal — only a drag-and-drop recovers).

| Condition | Runtime behavior |
|---|---|
| WASM URL not found / network failure | Red screen + error log |
| Invalid WASM binary | Red screen + error log |
| `update` export missing | Red screen + error log |
| `memory` export missing | Red screen + error log |
| Game throws inside `update()` | Red screen + error log; crash is persistent |
| `peek`/`poke` out of range | Warn + return 0 / no-op |
| `spoke` out of bounds | Warn + no-op |
| WRAM localStorage error | Error log, game continues |
| Performance degradation (accumulator > 200ms) | `console.warn` |

## Toolchain (Overview)

Games are compiled with Docker — no local toolchain required. Supported languages and their compile targets:

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

All commands are in `Makefile`. The output is always `console/assets/wasm/game.wasm`. Games exceeding 56KB show a red size indicator in the UI but still run.
