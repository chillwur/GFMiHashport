# Hashport

**Chat. Build. Pay. On Stellar.**

Send, receive, swap, deploy contracts and more — all on Stellar, all inside WhatsApp.

Hashport turns a WhatsApp conversation into a Stellar wallet and developer console. Message the bot `send 5 XLM to +234…` and it happens on-chain; message `deploy` and a Soroban contract ships to testnet. No app install, no seed phrase to start.

## How it works

```
WhatsApp user ──▶ Meta WhatsApp Cloud API ──▶ apps/backend (Fastify webhook)
                                                   │
                                    parses chat commands, manages wallets
                                                   │
                                                   ▼
                              Stellar (Horizon + Soroban RPC)
                                                   │
                                                   ▼
                          contracts/hashport-account (per-user smart account)
```

The `apps/frontend` web app is the public landing page and (soon) the dashboard for viewing balances, transaction history, and exporting your account to self-custody.

## Monorepo layout

| Path | What it is | Stack |
| --- | --- | --- |
| `apps/frontend` | Landing page & dashboard (`@hashport/frontend`) | Next.js (App Router), TypeScript, Tailwind CSS |
| `apps/backend` | WhatsApp webhook + Stellar service (`@hashport/backend`) | Node.js, Fastify, `@stellar/stellar-sdk`, Postgres, Redis |
| `contracts/hashport-account` | Per-user Soroban smart account | Rust, `soroban-sdk` |
| `docs/` | Architecture and design docs | — |

Everything installs and runs from the root via [pnpm workspaces](https://pnpm.io/workspaces).

## Prerequisites

- **Node.js ≥ 22** and **pnpm ≥ 10** (`corepack enable`)
- **Rust (stable)** with the `wasm32v1-none` target — only for contract work
- **[stellar CLI](https://developers.stellar.org/docs/tools/cli)** — only for building/deploying contracts
- Postgres & Redis (local or Docker) — only for full backend flows

## Quick start

```bash
pnpm install

# environment
cp apps/frontend/.env.example apps/frontend/.env.local
cp apps/backend/.env.example  apps/backend/.env
# (the root .env.example documents which var belongs to which workspace)

# run everything
pnpm dev                # frontend on :3000, backend on :4000
pnpm dev:backend        # or just one workspace
pnpm dev:frontend
```

The backend boots without WhatsApp/Stellar credentials — replies are logged to the console instead of sent, so you can develop the command flow locally by POSTing to `http://localhost:4000/webhooks/whatsapp`.

## Common tasks (from the root)

| Command | What it does |
| --- | --- |
| `pnpm dev` | Run frontend + backend in watch mode |
| `pnpm build` | Build all app workspaces |
| `pnpm lint` | ESLint across app workspaces |
| `pnpm test` | Vitest (backend) + frontend tests |
| `pnpm typecheck` | TypeScript checks across app workspaces |
| `pnpm contracts:build` | Build the Soroban contract to wasm |
| `pnpm contracts:test` | Run the contract's Rust tests |

## Deploying the contract (testnet)

```bash
stellar keys generate deployer --network testnet --fund
pnpm contracts:build
stellar contract deploy \
  --wasm contracts/hashport-account/target/wasm32v1-none/release/hashport_account.wasm \
  --source deployer --network testnet \
  -- --owner <OWNER_ADDRESS>
```

Put the resulting contract ID in `apps/backend/.env` (`HASHPORT_CONTRACT_ID`) and `apps/frontend/.env.local` (`NEXT_PUBLIC_HASHPORT_CONTRACT_ID`).

## Documentation

- [Architecture](docs/ARCHITECTURE.md) — components, message flow, custody model
- [Contributing](CONTRIBUTING.md) — dev setup, conventions, PR process

## License

[MIT](LICENSE)
