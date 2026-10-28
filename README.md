# ByteBox

![logo](console/assets/images/bytebox.png)

**English** | [Español](README.es.md) | [Português](README.pt.md)

[![License: MIT](https://img.shields.io/github/license/danielspk/bytebox-wasm?style=flat)](LICENSE)
[![Version](https://img.shields.io/github/v/tag/danielspk/bytebox-wasm?sort=semver&style=flat&label=version)](https://github.com/danielspk/bytebox-wasm/tags)
[![Games langs](https://img.shields.io/badge/games-C_%7C_Go_%7C_Odin_%7C_Zig_%7C_Rust_%7C_...-blue?style=flat)](https://github.com/danielspk/bytebox-wasm/tree/main/demos/templates)
[![Runtime: WebAssembly](https://img.shields.io/badge/runtime-WebAssembly-654FF0?style=flat&logo=webassembly&logoColor=white)](https://webassembly.org/)

**ByteBox** is a project based on the idea of a fantasy console designed for creating "old school" video games.

The project aims to inspire creativity by interacting with "hardware" _(virtualized)_ through memory-mapped communication.

## Directories

- **console**: contains the WASM runtime. It's the "console" that runs in a web browser.
- **demos**: contains example games and templates from different languages to compile to **WASM**.
- **src**: optionally contains a game's source code.

## Getting Started

To try the console for the first time you don't need to compile anything: copy the `game.wasm` from one of the example games in `demos/games/` into the `console/assets/wasm/` folder, or drag and drop a game onto the browser window to load it instantly.

## Platform

The idea behind using **WASM** as the target architecture is that it allows using different programming languages to achieve a common goal: _programming and having fun_.

Developers can create games using languages that are over 50 years old like _C_, or more modern ones like _Rust_.

> Compilation must use pure **WASM** without **WASI** dependencies.

### Runtime

The runtime uses vanilla _JavaScript_ in less than 1000 lines of code. The goal is not extensibility or modularity, but rather a simple, minimalist implementation without overhead.

An equally simple memory viewer is also available. Users can access it using the `F8` key.

### Examples

#### Games

Along with the project, some simple prototype games already compiled are supplied.

#### Templates

Also, the project provides several simple template examples in different programming languages. Additionally, developers can use any language that compiles to standard wasm _(without runtimes)_.

To run any of these examples, copy the template example's content into the `src/` folder and execute the compilation command corresponding to the programming language used _(see Useful Commands)_.

## Features/Limitations

- 8-bit architecture - _little endian_.
- 64KB of memory.
- 160x120 pixel display.
- 16-color RGB palette.
- Linear framebuffer (4 bits per pixel).
- 2 controller pads with 6 buttons each.
- 4 SFX channels + 8 melody channels.
- Compiled games should not exceed 50KB.
- No predefined functions for playing sounds or drawing sprites. Only memory read/write operations are available.
- No reset button.

### Notes on Design Decisions

> About the game size limitation: 50KB might seem small, but these constraints enable significant creativity. The limitation is not blocking since young developers might benefit from enabling debugging options that quickly exceed the desired limit. However, games exceeding this size display a red indicator on the screen 🫣.

> About the cartridge RAM: the 50KB limit is about the compiled `.wasm`, not the memory the game uses at runtime. That memory lives outside the console's 64KB map, has no limit, and the console does not track it.

> About the absence of graphics functions: implementing custom sprite movement, gravity, parallax procedures, and similar features provides an excellent learning opportunity 🧠.

> About screen resolution and colors: we are looking for a resolution with a classic 4:3 aspect ratio and measurements similar to those of the Game Boy. Likewise, 16 customizable colors can be represented and the console uses a framebuffer instead of a classic system of tiles and attributes.

> About the controller pads: having only two main buttons is one of the most important and deliberate limitations. Some doubts remain about this decision, but fortunately 2 bits are available in case reconsideration becomes necessary in the future.

> About reserving space for RAM and Stack responds to a possible dual use with assembler _(MOS 6502, Zilog 80, etc)_.

## Functions

The **WASM** interaction _API_ is minimal and consists of 2 exportable functions and 4 importable functions.

### Exportable

- `init()`: Executes once when the game starts. This function typically initializes game values and configurations. This function has no input arguments or return values. Its use is optional and implementation/export is not mandatory.
- `update()`: Executes 60 times per second within the game loop. This function has no input arguments or return values. Its implementation and export is mandatory.

### Importable

- `peek(addr) -> value`: Retrieves the value from a memory address.
- `poke(addr, value)`: Sets a value at a memory address.
- `spoke(start_addr, length, data)`: _super poke_ writes multiple bytes to memory in a single call.
- `trace(str, len)`: Outputs a log message. Since WASM shares memory to work with complex data types _(like strings)_, the message length must be specified.

## Memory Map

**ByteBox**'s memory map consists of a linear 64KB memory. It operates on an 8-bit architecture so each memory address can store one byte. Memory addressing is 16-bit (0x0000 to 0xFFFF).

### Detail

| Range | Size | Description |
|-------|------|-------------|
| `0x0000-0x003F` | 64 bytes | Reserved for Z80/8080 interrupt vectors (future use) |
| `0x0040` | 1 byte | System flags |
| `0x0041` | 1 byte | Seed for random numbers |
| `0x0042-0x0047` | 6 bytes | Reserved (future use) |
| `0x0048-0x005F` | 24 bytes | Game name |
| `0x0060-0x00FF` | 160 bytes | Reserved (future use) |
| `0x0100-0x01FF` | 256 bytes | Reserved for Stack (future use) |
| `0x0200-0xC9FF` | 51,200 bytes | Game ROM |
| `0xCA00-0xCFFF` | 1,536 bytes | Reserved (future use) |
| `0xD000-0xD3FF` | 1,024 bytes | Write RAM |
| `0xD400-0xD7FF` | 1,024 bytes | Reserved for RAM (future use) |
| `0xD800-0xFD7F` | 9,600 bytes | Video framebuffer |
| `0xFD80-0xFEFF` | 384 bytes | Reserved (future use) |
| `0xFF00-0xFF2F` | 48 bytes | Color palette |
| `0xFF30-0xFF3F` | 16 bytes | Reserved (future use) |
| `0xFF40-0xFF41` | 2 bytes | Controller pads |
| `0xFF42-0xFF5E` | 29 bytes | Reserved (future use) |
| `0xFF5F` | 1 byte | SFX channel status |
| `0xFF60-0xFF6F` | 16 bytes | SFX channels |
| `0xFF70-0xFF7E` | 15 bytes | Reserved (future use) |
| `0xFF7F` | 1 byte | Melody attributes |
| `0xFF80-0xFFBF` | 64 bytes | Melody ring buffer |
| `0xFFC0-0xFFC1` | 2 bytes | Melody pointers |
| `0xFFC2-0xFFF7` | 54 bytes | Reserved (future use) |
| `0xFFF8-0xFFFF` | 8 bytes | Reserved for 6502 interrupt vectors (future use) |

> The design deliberately avoids direct memory sharing with **WASM** in favor of peek/poke functions. This abstraction layer provides better encapsulation, allows for memory access logging and validation, prevents potential buffer overflows, and gives the runtime more flexibility in memory management without exposing low-level implementation details to the game code.

> That said, as in any low-level system, using memory correctly is the programmer's responsibility: the console checks that addresses fall within the 64KB range, but it does **not** prevent access to a read-only address in any way. Writing to read-only regions _(pads, SFX status, melody tail, ROM, etc.)_ is allowed and may cause unexpected behavior.

### System Flags

Address `0x0040` _(1 byte)_ sets system flags. Bit representation:

```txt
7 6 5 4 3 2 1 0
│ │ │ │ │ │ │ │
│ │ │ │ │ │ │ └ HALT/RESUME
│ │ │ │ │ │ └── DUMP WRAM
└─└─└─└─└─└──── unused
```

- **Halt/Resume**: when the bit is set to 1, game loop execution stops _(rendering continues)_. When the bit value is 0, the game loop continues executing.
- **Dump WRAM**: when the bit is set to 1, WRAM is dumping into the cartridge _(local storage is actually used)_. When the dump is finished, the bit is automatically set to 0.

### Seed

Address `0x0041` _(1 byte)_ sets a pseudo-random value. This is useful for generating random numbers.

### Game Name

Addresses from `0x0048` to `0x005F` _(24 bytes)_ store the ASCII game name.

### ROM Game

Addresses from `0x0200` to `0xC9FF` _(51200 bytes)_ stores the read-only ROM game.

### WRAM

Addresses from `0xD000` to `0xD3FF` _(1024 bytes)_ stores writable RAM.

This memory can be dumped into the game cartridge _(see system flags)_. The console automatically reloads it when you start the game.

### Video Framebuffer

Addresses from `0xD800` to `0xFD7F` _(9600 bytes)_ stores the linear video framebuffer. Screen resolution is 160px by 120px and each framebuffer byte represents 2 pixels _(4 bits per pixel)_.

Within each byte, pixels are stored in **MSB first** order:

```txt
7 6 5 4 3 2 1 0
│ │ │ │ │ │ │ │
│ │ │ │ └─└─└─└ PIXEL 2
└─└─└─└──────── PIXEL 1
```

### Color Palette

Addresses from `0xFF00` to `0xFF2F` _(48 bytes)_ set the RGB values of the color palette. Each color uses 3 bytes to represent the _red_, _green_ and _blue_ values.

The default color palette is:

- **Color 1**: RGB(15, 15, 27)
- **Color 2**: RGB(140, 143, 174)
- **Color 3**: RGB(88, 69, 99)
- **Color 4**: RGB(62, 33, 55)
- **Color 5**: RGB(154, 99, 72)
- **Color 6**: RGB(215, 155, 125)
- **Color 7**: RGB(245, 237, 186)
- **Color 8**: RGB(192, 199, 65)
- **Color 9**: RGB(100, 125, 52)
- **Color 10**: RGB(228, 148, 58)
- **Color 11**: RGB(157, 48, 59)
- **Color 12**: RGB(210, 100, 113)
- **Color 13**: RGB(112, 55, 127)
- **Color 14**: RGB(126, 196, 193)
- **Color 15**: RGB(52, 133, 157)
- **Color 16**: RGB(23, 67, 75)

### Controller Pads

Addresses `0xFF40` and `0xFF41` _(2 bytes)_ provide read-only access to controller pads _(joystick)_ 1 and 2 respectively. Bit representation:

```txt
7 6 5 4 3 2 1 0
│ │ │ │ │ │ │ │
│ │ │ │ │ │ │ └ BUTTON B
│ │ │ │ │ │ └── BUTTON A
│ │ │ │ └─└──── unused
│ │ │ └──────── RIGHT
│ │ └────────── DOWN
│ └──────────── UP
└────────────── LEFT
```

Controller keys:

- **Pad 1**:
  - Direction: `arrow` keys.
  - Button A: `Z` key. Alternatively, the `multiply` key on the numeric pad can be used.
  - Button B: `X` key. Alternatively, the `subtract` key on the numeric pad can be used.
- **Pad 2**:
  - Direction: `A`, `W`, `D`, `S` keys.
  - Button A: `K` key.
  - Button B: `L` key.

### Sound Effects Channel Status

Address `0xFF5F` _(1 byte)_ provides read-only status of all sound channels. Bit representation:

```txt
7 6 5 4 3 2 1 0
│ │ │ │ │ │ │ │
│ │ │ │ │ │ │ └ SFX CHANNEL 0
│ │ │ │ │ │ └── SFX CHANNEL 1
│ │ │ │ │ └──── SFX CHANNEL 2
│ │ │ │ └────── SFX CHANNEL 3
└─└─└─└──────── unused
```

Bit 1 = channel playing, bit 0 = channel free.

### Sound Effects Channels

Addresses from `0xFF60` to `0xFF6F` _(16 bytes)_ handle the 4 available sound effects channels. Each channel uses 4 bytes for sound effect generation.

#### Data Structure

Each 4-byte sound effect is structured as follows:

- **Byte 0**:

```txt
7 6 5 4 3 2 1 0
│ │ │ │ │ │ │ │
└─└─└─└─└─└─└─└ INITIAL FREQUENCY: (0-255 -> 20-1000 Hz)
```

- **Byte 1**:

```txt
7 6 5 4 3 2 1 0
│ │ │ │ │ │ │ │
└─└─└─└─└─└─└─└ ENDING FREQUENCY: (0-255 -> 20-1000 Hz)
```

- **Byte 2**:

```txt
7 6 5 4 3 2 1 0
│ │ │ │ │ │ │ │ 
│ │ │ │ │ └─└─└ VOLUME: (0-7)
└─└─└─└─└────── DURATION: (0-31 -> 0-0.99s)
```

- **Byte 3**:

```txt
7 6 5 4 3 2 1 0
│ │ │ │ │ │ │ │
│ │ │ │ │ │ │ └ TRIGGER: set 1 to start play
│ │ │ │ └─└─└── WAVEFORM: (0-4)
│ └─└─└──────── VIBRATO: (0-7)
└────────────── unused
```

**Important**: The runtime automatically clears the `trigger` bit after reading it.
To play the same sound again, you must set the trigger bit to 1 again.
A channel cannot play a new sound while a previous sound is still playing on that channel.

##### Waveforms

5 available waveforms _(3 bits)_:

- **0**: sine.
- **1**: sawtooth.
- **2**: square.
- **3**: triangle.
- **4**: noise.

### Melody Attributes

Address `0xFF7F` _(1 byte)_ sets the master volume for the melody audio. Bit representation:

```txt
7 6 5 4 3 2 1 0
│ │ │ │ │ │ │ │
│ │ │ │ └─└─└─└ VOLUME: (0-15)
└─└─└─└──────── unused
```

### Melody Buffer

Addresses from `0xFF80` to `0xFFBF` _(64 bytes)_ store the melody audio ring buffer.

#### FAB-4 Protocol

Each 4-byte entry represents a note event:

- **Byte 0**:

```txt
7 6 5 4 3 2 1 0
│ │ │ │ │ │ │ │
└─└─└─└─└─└─└─└ DELTA_HI: (ms)
```

- **Byte 1**:

```txt
7 6 5 4 3 2 1 0
│ │ │ │ │ │ │ │
└─└─└─└─└─└─└─└ DELTA_LO: (ms)
```

- **Byte 2**:

```txt
7 6 5 4 3 2 1 0
│ │ │ │ │ │ │ │
│ └─└─└─└─└─└─└ NOTE (0-127)
└────────────── unused
```

- **Byte 3**:

```txt
7 6 5 4 3 2 1 0
│ │ │ │ │ │ │ │
│ │ │ │ └─└─└─└ VOLUME: (0-15)
│ └─└─└──────── CHANNEL: (0-7)
└────────────── STATUS: (1: ON, 0: OFF)
```

### Melody Pointers

Address `0xFFC0` _(1 byte)_ sets the head _(producer)_ of the melody audio ring buffer.

Address `0xFFC1` _(1 byte)_ provides read-only access to the tail _(consumer)_ of the melody audio ring buffer.

Both addresses implement a _producer-consumer_ pattern: write to `0xFFC0` to queue new melody entries; the APU advances `0xFFC1` as it consumes them.

## URL Parameters

The console supports optional query parameters:

| Parameter | Example | Description |
|-----------|---------|-------------|
| `color` | `?color=e74c3c` | Custom frame color (6-digit hex, without `#`) |
| `nosplash` | `?nosplash` | Skip the splash screen on startup |

Usage: `http://localhost:3000?color=3498db&nosplash`

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| F8 | Toggle the memory viewer |
| F9 | Capture a screenshot |

## Useful Commands

Only **Docker** and **make** need to be installed to run any command.

### Compile a Game

Game source files must be located inside `src/` folder.

To compile a game written in _AssemblyScript_, run:

```sh
make build-assemblyscript
```

To compile a game written in _C_, run:

```sh
make build-c
```

To compile a game written in _C3_, run:

```sh
make build-c3
```

To compile a game written in _D_, run:

```sh
make build-d
```

To compile a game written in _Go_, run:

```sh
make build-go
```

To compile a game written in _Nelua_, run:

```sh
make build-nelua
```

To compile a game written in _Odin_, run:

```sh
make build-odin
```

To compile a game written in _Rust_, run:

```sh
make build-rust
```

To compile a game written in _Zig_, run:

```sh
make build-zig
```

To compile a game written in _WebAssembly Text_, run:

```sh
make build-wat
```

### Run the Console on a Local Web Server

```sh
make run
```

This starts a local webserver on port `3000`. To start on a different port, set an environment variable as follows:

```sh
PORT=8080 make run
```

### Package a Game for Distribution

Once your game is compiled, bundle the whole console into a single distributable `zip`:

```sh
make build-<lang>
make package
```

`game.zip` is a self-contained HTML5 build: it has `index.html` at its root, the runtime, and your compiled `game.wasm`.

This format also makes it easy to distribute games on platforms like itch.io.

## Inspiration

**ByteBox** is far from being a complete fantasy console as that's not the goal. If you're looking for mature and recognized projects, we recommend:

- [PICO-8](https://www.lexaloffle.com/pico-8.php)
- [TIC-80](https://tic80.com/)
- [WASM4](https://wasm4.org/)

## Next Steps / Ideas

The decision for the memory map layout and reserving certain addresses for future use considers compatibility with 3 classic processors from the _70s/80s_: the **MOS 6502**, **Intel 8080**, and **Zilog Z80**. Eventually in the future, the runtime could also process assembly code for any of these processors.

## License

This project is distributed under the following [license](LICENSE).
