## What

<!-- What does this PR change, and why? Link the issue if there is one. -->

## Workspace(s) touched

- [ ] `apps/frontend`
- [ ] `apps/backend`
- [ ] `contracts/hashport-account`
- [ ] repo root / tooling / docs

## Checklist

- [ ] `pnpm lint && pnpm typecheck && pnpm test && pnpm build` pass locally
- [ ] `pnpm contracts:test` passes (if the contract changed)
- [ ] New env vars documented in the workspace `.env.example` **and** the root `.env.example`
- [ ] New chat commands covered in `apps/backend/test/commands.test.ts` and added to `HELP_TEXT`
- [ ] No secrets, tokens, or real phone numbers in code, tests, or fixtures
