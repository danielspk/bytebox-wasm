# AGENTS.md — ByteBox WASM

## Build & Run

All builds require Docker only — no local toolchain needed.

```sh
make run                  # Start console on local webserver (default port 3000)
PORT=8080 make run        # Run on a custom port
make build-assemblyscript # Compile game in src/ (AssemblyScript)
make build-c              # Compile game in src/ (C)
make build-c3             # Compile game in src/ (C3)
make build-d              # Compile game in src/ (D)
make build-go             # Compile game in src/ (Go/TinyGo)
make build-nelua          # Compile game in src/ (Nelua)
make build-odin           # Compile game in src/ (Odin)
make build-rust           # Compile game in src/ (Rust)
make build-wat            # Compile game in src/ (WebAssembly Text)
make build-zig            # Compile game in src/ (Zig)
make package              # Package game as zip
make clean                # Remove game.wasm and game.zip
```

Compiled output is always `console/assets/wasm/game.wasm`. Game source must live in `src/`.

## No Test / Lint / Typecheck

There is no test suite, linter, formatter, or typechecker. There is no `package.json` — the runtime is vanilla JS with no bundler.

## Architecture

- **Runtime** (`console/assets/js/`): 9 ES6 modules loaded directly in the browser. No build step. Entry point is `console.js`.
- **WASM contract**: Games must compile to pure WASM — no WASI, no runtime dependencies. `update()` and `memory` exports are mandatory; `init()` is optional. Imports `peek`, `poke`, `spoke`, `trace` from the `env` namespace.
- **Game templates** (`demos/templates/`): Reference implementations per language. Keep in sync with runtime API when modifying.

## Key Memory Addresses

Games interact with hardware through memory-mapped I/O via `peek`/`poke`. Critical addresses:

| Address | Purpose |
|---|---|
| `0x0040` | SYSFLAGS (bit 0: halt, bit 1: dump WRAM) |
| `0x0041` | Seed (0~255) |
| `0x0048–0x005F` | Game name (ASCII, 24 bytes) |
| `0x0200–0xC9FF` | ROM (50KB, game code) |
| `0xD000–0xD3FF` | WRAM (1KB, persisted to localStorage) |
| `0xD800–0xFD7F` | Video framebuffer (160×120, 4bpp, MSB-first) |
| `0xFF00–0xFF2F` | Color palette (16×RGB) |
| `0xFF40–0xFF41` | Controller pads (read-only) |
| `0xFF5F` | SOUND_STATUS (SFX channel bit flags) |
| `0xFF60–0xFF6F` | SFX channels (4×4 bytes) |
| `0xFF7F` | MELODY_ATTR (volume/attributes, low nibble) |
| `0xFF80–0xFFBF` | Melody ring buffer (FAB-4 protocol) |
| `0xFFC0–0xFFC1` | Melody head/tail pointers |

## Deep Technical Reference

Full memory map detail, audio/video subsystem specs, and runtime initialization flow are in `.agents/skills/bytebox-wasm/SKILL.md`.
