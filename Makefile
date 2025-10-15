PORT ?= 3000
WASM_TARGET = console/assets/wasm/game.wasm

help: ## Show help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-14s\033[0m %s\n", $$1, $$2}'

run: check-docker ## Run the console
	docker run --rm -p $(PORT):80 -v $(CURDIR)/console:/usr/share/nginx/html nginx:alpine

build-c: check-docker clean ## Build game (in C)
	docker run --rm -v $(CURDIR):/src -w /src ghcr.io/webassembly/wasi-sdk /opt/wasi-sdk/bin/clang \
		-std=c23 -pedantic -W -Wall -Wextra -Werror --target=wasm32-wasi -Oz -Wl,--no-entry \
		-Wl,--strip-all -Wl,--export-dynamic -nostartfiles -o $(WASM_TARGET) src/*.c

build-go: check-docker clean ## Build game (in Go)
	docker run --rm -v $(CURDIR):/workspace -w /workspace/src tinygo/tinygo tinygo build \
		-target=wasm-unknown -panic=trap -opt=z -scheduler=none -gc=leaking -no-debug -o ../$(WASM_TARGET) .

build-rust: check-docker clean ## Build game (in Rust)
	docker run --rm -v $(CURDIR):/workspace -w /workspace/src rust:1.75 sh -c " \
		rustup target add wasm32-unknown-unknown && \
		RUSTFLAGS='-C opt-level=z -C lto=fat -C embed-bitcode=yes -C codegen-units=1 -C strip=symbols' \
		cargo build --target wasm32-unknown-unknown --release && \
		command -v wasm-opt > /dev/null && wasm-opt -Oz ../$(WASM_TARGET) -o ../$(WASM_TARGET).tmp && mv ../$(WASM_TARGET).tmp ../$(WASM_TARGET) || true && \
		cp target/wasm32-unknown-unknown/release/game.wasm ../$(WASM_TARGET)"

build-zig: check-docker clean ## Build game (in Zig)
	docker run --rm -v $(CURDIR):/workspace -w /workspace/src kassany/alpine-ziglang:0.13.0 zig build-exe \
		-target wasm32-freestanding -fno-entry -rdynamic -O ReleaseSmall -fstrip --name game game.zig && \
	mv $(CURDIR)/src/game.wasm $(WASM_TARGET)

check-docker: ## Check Docker installation
	@command -v docker > /dev/null || (echo "❌ Docker not found" && exit 1)

clean: ## Clean game file
	rm -f $(WASM_TARGET)

.PHONY: help run build-c build-go build-rust check-docker clean
