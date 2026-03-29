# Fhenix CoFHE Contracts Workspace

This workspace contains the encrypted voting contract and Hardhat test/deploy flow.

## Setup

1. Copy env values:

```bash
cp .env.example .env
```

2. Fill at minimum:

- `PRIVATE_KEY`
- `ARBITRUM_SEPOLIA_RPC_URL`

## Commands

```bash
pnpm build
pnpm test
pnpm deploy:arb-sepolia
```

Deployment writes addresses to `contracts/deployments/<network>.json`.
