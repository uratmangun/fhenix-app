# Fhenix App Contract Guide

This repository contains a private Product Hunt–style voting flow built around two Solidity contracts in `contracts/contracts/`:

- `EncryptedVoting.sol` — the real encrypted Fhenix/CoFHE contract for Arbitrum Sepolia
- `EncryptedVotingMock.sol` — the local development mock contract for localhost testing

## Contract files

- `contracts/contracts/EncryptedVoting.sol`
- `contracts/contracts/EncryptedVotingMock.sol`
- `contracts/test/EncryptedVoting.test.ts`
- `contracts/scripts/deploy.ts`
- `contracts/scripts/deploy-mock-local.ts`
- `contracts/hardhat.config.ts`

## Current deployed contract

Arbitrum Sepolia:

- `EncryptedVoting`: `0xa28f103de761fbf88CE69Ac813A5F906F83c75f3`

Saved in:

- `contracts/deployments/arb-sepolia.json`

## How it works

### `EncryptedVoting.sol`

`contracts/contracts/EncryptedVoting.sol` is the real encrypted voting contract.

It supports:

- `submitProduct(name, url, tagline)`
- `setEncryptedVoteState(productId, encryptedVoteState)`
- `getEncryptedVoteCount(productId)`
- `getPublicVoteCount(productId)`
- `getProductSummary(productId)`
- `productCount()`
- `hasVotedForProduct(productId, voter)`

Behavior:

- each product has public metadata: name, URL, tagline, owner
- votes are stored as encrypted aggregate state
- product owners cannot vote for their own product
- a wallet has one active vote state per product
- the encrypted vote tally is kept in `encryptedVotes`
- `getPublicVoteCount` returns the decrypted aggregate count

Key contract flow:

1. submit a product
2. another wallet encrypts a vote client-side
3. `setEncryptedVoteState(...)` toggles that wallet’s vote state
4. aggregate encrypted count updates internally
5. public clients can read the decrypted total with `getPublicVoteCount(...)`

### `EncryptedVotingMock.sol`

`contracts/contracts/EncryptedVotingMock.sol` is only for local development.

It supports:

- `submitProduct()`
- `setVoteState(productId, voted)`
- `getPublicVoteCount(productId)`
- `getProductSummary(productId)`
- `productCount()`
- `hasVotedForProduct(productId, voter)`

Behavior:

- no encryption
- same owner-cannot-vote rule
- same vote toggle model
- intended for localhost app testing only

## Test strategy

This repo uses two different workflows:

### 1. Real encrypted contract test workflow

Use this for `EncryptedVoting.sol`.

Test file:

- `contracts/test/EncryptedVoting.test.ts`

This uses:

- `cofhe-hardhat-plugin`
- `cofhejs/node`
- plugin mock helpers via `hre.cofhe.*`

The test covers:

- submitting a product
- reading product summary metadata
- preventing owner self-votes
- allowing another wallet to vote
- asserting encrypted tally plaintext with plugin mocks
- reverting on invalid product reads

### 2. Local mock app workflow

Use this for frontend/local app flows.

Deploy:

- `EncryptedVotingMock.sol` to localhost

Use it to test:

- product submission UI
- leaderboard UI
- product detail page
- vote/unvote UX

## How to compile contracts

From the contract project:

```bash
cd contracts
pnpm install
pnpm build
```

What this does:

- compiles Solidity with Hardhat
- generates updated artifacts
- updates TypeChain output when needed

Build script source:

- `contracts/package.json`

## How to run contract tests

From the contract project:

```bash
cd contracts
pnpm install
pnpm test
```

This runs:

- `hardhat test`

Primary encrypted contract test file:

- `contracts/test/EncryptedVoting.test.ts`

## How to deploy the mock contract locally

Start a local Hardhat node first in one terminal:

```bash
cd contracts
pnpm hardhat node
```

Then deploy the mock in another terminal:

```bash
cd contracts
pnpm deploy:mock:local
```

This runs:

- `contracts/scripts/deploy-mock-local.ts`

It writes deployment outputs to:

- `contracts/deployments/localhost.json`
- `lib/cloudflare/local-contract-registry.json`

## How to deploy the real encrypted contract to Arbitrum Sepolia

Required environment variables:

- `ARBITRUM_SEPOLIA_RPC_URL`
- `PRIVATE_KEY`
- optional: `ARBISCAN_API_KEY`

Network config is defined in:

- `contracts/hardhat.config.ts`

Deploy command:

```bash
cd contracts
pnpm deploy:arb-sepolia
```

This runs:

- `contracts/scripts/deploy.ts`

What happens:

1. Hardhat loads the Arbitrum Sepolia RPC URL and deployer private key
2. `EncryptedVoting.sol` is deployed
3. deployed address is printed
4. address is saved to `contracts/deployments/arb-sepolia.json`

Current network settings:

- network name: `arb-sepolia`
- chain id: `421614`
- fallback RPC in config: `https://sepolia-rollup.arbitrum.io/rpc`

## Important workflow rules

### Use `EncryptedVoting.sol` for:

- encrypted contract testing
- Arbitrum Sepolia deployment
- real app/testnet contract interactions

### Use `EncryptedVotingMock.sol` for:

- localhost development
- local frontend testing
- fast non-encrypted debug flows

### Do not use `EncryptedVoting.sol` for localhost app deployment

In this repo, local app usage should stay on the mock contract, while the real encrypted contract is validated through plugin-based tests and deployed to Arbitrum Sepolia.

## Relevant files

### Contracts

- `contracts/contracts/EncryptedVoting.sol`
- `contracts/contracts/EncryptedVotingMock.sol`

### Tests

- `contracts/test/EncryptedVoting.test.ts`

### Deploy scripts

- `contracts/scripts/deploy.ts`
- `contracts/scripts/deploy-mock-local.ts`

### Config

- `contracts/hardhat.config.ts`
- `contracts/package.json`

### Deployment record

- `contracts/deployments/arb-sepolia.json`

## Quick commands

Compile:

```bash
cd contracts
pnpm build
```

Test:

```bash
cd contracts
pnpm test
```

Deploy mock locally:

```bash
cd contracts
pnpm deploy:mock:local
```

Deploy real contract to Arbitrum Sepolia:

```bash
cd contracts
pnpm deploy:arb-sepolia
```
