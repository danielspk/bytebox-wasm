PORT ?= 3000
WASM_TARGET = console/assets/wasm/game.wasm
ZIP_TARGET = game.zip

help: ## Show help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-14s\033[0m %s\n", $$1, $$2}'

run: check-docker ## Run the console
	docker run --rm -p $(PORT):80 -v $(CURDIR)/console:/usr/share/nginx/html nginx:alpine

build-assemblyscript: check-docker clean ## Build game (in AssemblyScript)
	docker run --rm -v $(CURDIR):/workspace -w /workspace/src node:22-alpine sh -c " \
		npm install --silent && \
		npx asc game.ts --outFile ../$(WASM_TARGET) --runtime stub --noAssert --optimize --initialMemory 2"

build-c: check-docker clean ## Build game (in C)
	docker run --rm -v $(CURDIR):/src -w /src ghcr.io/webassembly/wasi-sdk:wasi-sdk-33 /opt/wasi-sdk/bin/clang \
		-std=c23 -pedantic -W -Wall -Wextra -Werror --target=wasm32-unknown-unknown -Oz \
		-Wl,--no-entry -Wl,--strip-all -Wl,--export-dynamic -nostdlib -nodefaultlibs -nostartfiles \
		-ffreestanding -o $(WASM_TARGET) src/*.c

build-c3: check-docker clean ## Build game (in C3)
	@docker image inspect bytebox-c3:latest > /dev/null 2>&1 || \
		docker build -t bytebox-c3:latest $(CURDIR)/demos/templates/c3
	docker run --rm -v $(CURDIR):/workspace -w /workspace/src bytebox-c3:latest \
		sh -c "c3c compile *.c3 --target wasm32 --use-stdlib=no --link-libc=no \
		--memory-env=none --no-entry -Oz -o ../$(WASM_TARGET)"

build-d: check-docker clean ## Build game (in D)
	@docker image inspect bytebox-d:latest > /dev/null 2>&1 || \
		docker build -t bytebox-d:latest $(CURDIR)/demos/templates/d
	docker run --rm -v $(CURDIR):/src -w /src bytebox-d:latest ldc2 \
		-betterC -mtriple=wasm32-unknown-unknown -Oz --fvisibility=hidden \
		-of=$(WASM_TARGET) -L--allow-undefined -L--no-entry -L--strip-all \
		src/*.d

build-go: check-docker clean ## Build game (in Go)
	docker run --rm -v $(CURDIR):/workspace -w /workspace/src tinygo/tinygo:0.41.1 tinygo build \
		-target=wasm-unknown -panic=trap -opt=z -scheduler=none -gc=none -no-debug -o ../$(WASM_TARGET) .

build-nelua: check-docker clean ## Build game (in Nelua)
	@docker image inspect bytebox-nelua:latest > /dev/null 2>&1 || \
		docker build -t bytebox-nelua:latest $(CURDIR)/demos/templates/nelua
	docker run --rm -v $(CURDIR):/workspace -w /workspace/src bytebox-nelua:latest \
		nelua --cc="/opt/wasi-sdk/bin/clang" \
		--cflags="--target=wasm32-unknown-unknown -Oz -ffreestanding -nostdlib" \
		--ldflags="-Wl,--no-entry -Wl,--strip-all -Wl,--export-dynamic -Wl,--allow-undefined -nostdlib" \
		--release --no-cache game.nelua --output ../$(WASM_TARGET)

build-odin: check-docker clean ## Build game (in Odin)
	@docker image inspect bytebox-odin:latest > /dev/null 2>&1 || \
		docker build -t bytebox-odin:latest $(CURDIR)/demos/templates/odin
	docker run --rm -v $(CURDIR):/workspace -w /workspace/src bytebox-odin:latest odin build . \
		-target:freestanding_wasm32 -no-entry-point -o:size -out:../$(WASM_TARGET)

build-rust: check-docker clean ## Build game (in Rust)
	docker run --rm -v $(CURDIR):/workspace -w /workspace/src rust:1.96 sh -c " \
		rustup target add wasm32-unknown-unknown && \
		apt-get update -qq && apt-get install -y -qq binaryen && \
		RUSTFLAGS='-C opt-level=z -C lto=fat -C embed-bitcode=yes -C codegen-units=1 -C strip=symbols' \
		cargo build --target wasm32-unknown-unknown --release && \
		cp target/wasm32-unknown-unknown/release/game.wasm ../$(WASM_TARGET) && \
		wasm-opt -Oz -all ../$(WASM_TARGET) -o ../$(WASM_TARGET).tmp && mv ../$(WASM_TARGET).tmp ../$(WASM_TARGET)"

build-wat: check-docker clean ## Build game (in WebAssembly Text)
	@docker image inspect bytebox-wat:latest > /dev/null 2>&1 || \
		docker build -t bytebox-wat:latest $(CURDIR)/demos/templates/wat
	docker run --rm -v $(CURDIR):/workspace -w /workspace/src bytebox-wat:latest \
		wat2wasm game.wat -o ../$(WASM_TARGET)

build-zig: check-docker clean ## Build game (in Zig)
	@docker image inspect bytebox-zig:latest > /dev/null 2>&1 || \
		docker build -t bytebox-zig:latest $(CURDIR)/demos/templates/zig
	docker run --rm -v $(CURDIR):/workspace -w /workspace/src bytebox-zig:latest zig build-exe \
		-target wasm32-freestanding -fno-entry -rdynamic -O ReleaseSmall -fstrip --name game game.zig && \
	mv $(CURDIR)/src/game.wasm $(WASM_TARGET)

package: ## Package game (zip)
	cd console && zip -r ../$(ZIP_TARGET) . -x "*.gitkeep"

check-docker: ## Check Docker installation
	@command -v docker > /dev/null || (echo "Docker not found" && exit 1)

clean: ## Clean game file
	rm -f $(WASM_TARGET) $(ZIP_TARGET)

.PHONY: help run build-assemblyscript build-c build-c3 build-d build-go build-nelua build-odin build-rust build-wat build-zig package check-docker clean
