# AGENTS.md — ByteBox WASM

## Build & Run

All builds require Docker only — no local toolchain needed.

```sh
make run                  # Start console on local webserver (default port 3000)
PORT=8080 make run        # Run on a custom port
make build-assemblyscript # Compile game in src/ (AssemblyScript)
make build-c              # Compile game in src/ (C)
make build-d              # Compile game in src/ (D)
make build-go             # Compile game in src/ (Go/TinyGo)
make build-odin           # Compile game in src/ (Odin)
make build-rust           # Compile game in src/ (Rust)
make build-zig            # Compile game in src/ (Zig)
make package              # Package game as zip
make clean                # Remove game.wasm and game.zip
```

Compiled output is always `console/assets/wasm/game.wasm`. Game source must live in `src/`.

## No Test / Lint / Typecheck

There is no test suite, linter, formatter, or typechecker. There is no `package.json` — the runtime is vanilla JS with no bundler.

## Architecture

- **Runtime** (`console/assets/js/`): 9 ES6 modules loaded directly in the browser. No build step. Entry point is `console.js`.
- **WASM contract**: Games must compile to pure WASM — no WASI, no runtime dependencies. `update()` export is mandatory; `init()` is optional. Imports `peek`, `poke`, `spoke`, `trace` from the `env` namespace.
- **Game templates** (`demos/templates/`): Reference implementations per language. Keep in sync with runtime API when modifying.
- **Max game size**: 56KB. Exceeding it shows a red indicator but game still runs.

## Key Memory Addresses

Games interact with hardware through memory-mapped I/O via `peek`/`poke`. Critical addresses:

| Address | Purpose |
|---|---|
| `0x0040` | SYSFLAGS (bit 0: halt, bit 1: dump WRAM) |
| `0x0041` | Seed (set by runtime to `Date.now() & 0xFF`) |
| `0x0044–0x005B` | Game name (ASCII, 24 bytes) |
| `0x0100–0xE0FF` | ROM (56KB, game code) |
| `0xE100–0xE4FF` | WRAM (1KB, persisted to localStorage) |
| `0xE900–0xFBBF` | Video framebuffer (160×120, 2bpp, MSB-first) |
| `0xFF84–0xFF8F` | Color palette (4×RGB) |
| `0xFF94–0xFF95` | Controller pads (read-only) |
| `0xFF97` | SOUND_STATUS (SFX channel bit flags) |
| `0xFF98–0xFFA7` | SFX channels (4×4 bytes) |
| `0xFFA8` | MELODY_ATTR (volume/attributes, low nibble) |
| `0xFFA9–0xFFE8` | Melody ring buffer (FAB-4 protocol) |
| `0xFFE9–0xFFEA` | Melody head/tail pointers |

## Deep Technical Reference

Full memory map detail, audio/video subsystem specs, and runtime initialization flow are in `.agents/skills/bytebox-wasm/SKILL.md`.
