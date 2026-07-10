# Hashport architecture

Hashport is a Stellar wallet and developer console that lives entirely inside WhatsApp. This document describes the moving parts and the path a message takes from a chat bubble to the ledger.

## Components

### `apps/backend` — the brain

A Fastify service that is the only component talking to both Meta and Stellar.

- **`routes/webhook.ts`** — receives WhatsApp Cloud API webhooks. Verifies the `X-Hub-Signature-256` HMAC (`lib/signature.ts`), extracts text messages, and always ACKs with 200 quickly (Meta disables slow webhooks).
- **`lib/commands.ts`** — the chat grammar. Turns free text (`send 5 XLM to +234…`, `swap 10 XLM to USDC`, `balance`, `deploy`) into typed `Command` values. This is deliberately a pure function so it's trivially testable.
- **`services/router.ts`** — maps a `Command` + sender phone number to an action and a reply string.
- **`services/stellar.ts`** — wallet management and chain access via `@stellar/stellar-sdk` (Horizon for classic ops, Soroban RPC for contract calls). Currently an in-memory wallet store; the target state is Postgres rows with keys encrypted under `WALLET_ENCRYPTION_KEY`.
- **`services/whatsapp.ts`** — outbound messages via the Graph API. No-ops with a console log when credentials are absent so local dev needs no Meta app.

**State**: Postgres (users, wallets, tx history) and Redis (multi-step conversation state, e.g. "reply YES to confirm sending 5 XLM").

### `contracts/hashport-account` — the custody layer

One Soroban smart account per user. The user's WhatsApp identity maps to a contract instance; the contract's `owner` address authorizes outbound transfers.

- Day one, the owner key is custodied by the backend (encrypted at rest) — zero-friction onboarding.
- `set_owner` lets a user rotate control to a self-custodied wallet ("export"), at which point Hashport can no longer move their funds.
- Deposits need no authorization; anyone can pay a Hashport user.

### `apps/frontend` — the front door

Next.js app serving the landing page with the `wa.me` deep link into the bot, and — next — a read-only dashboard (balances, history, export flow) backed by the backend API.

## Message flow: `send 5 XLM to +2348000000000`

1. Meta POSTs the message to `POST /webhooks/whatsapp`.
2. Signature verified; message parsed to `{ kind: "send", amount: "5", asset: "XLM", recipient: "+234…" }`.
3. Router resolves the sender's wallet, resolves the recipient (existing Hashport user → their contract; G-address → direct payment).
4. A confirmation is held in Redis; user replies to approve.
5. Backend signs (custodial key) and submits — either a classic payment via Horizon or a `hashport-account.transfer` invocation via Soroban RPC.
6. Result (hash, explorer link) is sent back as a WhatsApp message.

## Trust & security notes

- Webhook authenticity: HMAC check against `WHATSAPP_APP_SECRET`; requests failing it get 401.
- Custodial keys are the biggest liability: encrypted at rest, never logged, and the export flow (`set_owner`) is the designed escape hatch.
- The relayer account (`SIGNER_SECRET_KEY`) only pays fees / sponsors reserves; user funds live in per-user accounts.
- Testnet is the default everywhere; mainnet requires explicitly flipping `STELLAR_NETWORK`.

## Environments

| | Network | Horizon | RPC |
| --- | --- | --- | --- |
| dev / CI | testnet | horizon-testnet.stellar.org | soroban-testnet.stellar.org |
| production | mainnet | horizon.stellar.org | (provider of choice) |
