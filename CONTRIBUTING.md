# Contributing to Hashport

Thanks for helping build the Stellar wallet that lives in WhatsApp.

## Setup

```bash
git clone https://github.com/chillwur/GFMiHashport.git
cd GFMiHashport
pnpm install
cp apps/frontend/.env.example apps/frontend/.env.local
cp apps/backend/.env.example  apps/backend/.env
pnpm dev
```

For contract work you additionally need Rust (stable) with the `wasm32v1-none` target and, ideally, the [stellar CLI](https://developers.stellar.org/docs/tools/cli):

```bash
rustup target add wasm32v1-none
cargo install --locked stellar-cli
```

## Where things live

- `apps/frontend` — Next.js landing page/dashboard
- `apps/backend` — Fastify WhatsApp webhook + Stellar services; the chat grammar is `src/lib/commands.ts`, chain access is `src/services/stellar.ts`
- `contracts/hashport-account` — Soroban smart account (Rust)

## Before you open a PR

Run the same checks CI runs:

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
# if you touched the contract:
pnpm contracts:test
pnpm contracts:build
```

## Conventions

- **Branches**: `feat/<topic>`, `fix/<topic>`, `docs/<topic>`.
- **Commits**: [Conventional Commits](https://www.conventionalcommits.org/) (`feat:`, `fix:`, `chore:`, `docs:`, `test:`).
- **New chat commands** need: parser case in `lib/commands.ts`, handler in `services/router.ts`, tests in `test/commands.test.ts`, and a line in `HELP_TEXT`.
- **Never commit secrets.** `.env` files are gitignored; only `.env.example` files belong in the repo. If a change adds an env var, document it in the workspace's `.env.example` _and_ the root `.env.example` map.
- Default to **testnet** in all examples, tests, and defaults.

## Reporting issues

Use the issue templates. For anything security-sensitive (key handling, webhook auth, contract auth), do **not** open a public issue — email the maintainers instead.
