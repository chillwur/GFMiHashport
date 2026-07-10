.PHONY: build test fmt fmt-check clean

# Prefer the stellar CLI (optimizes + post-processes the wasm); fall back to
# plain cargo so `pnpm contracts:build` works with only a Rust toolchain.
build:
	@if command -v stellar >/dev/null 2>&1; then \
		stellar contract build; \
	else \
		cargo build --target wasm32v1-none --release; \
	fi

test:
	cargo test

fmt:
	cargo fmt --all

fmt-check:
	cargo fmt --all -- --check

clean:
	cargo clean
