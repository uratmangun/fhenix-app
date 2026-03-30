# Contract-Specific Agent Rules

## Scope

These rules apply when working in this directory and its child files, especially:
- `EncryptedVoting.sol`
- `EncryptedVotingMock.sol`

## EncryptedVoting.sol

- Always test `EncryptedVoting.sol` using the official Fhenix/CoFHE Hardhat plugin workflow
- Prefer plugin-based tests with:
  - `hre.cofhe.createClientWithBatteries(...)`
  - plugin mock/plaintext helpers where appropriate
- Do **not** add localhost deployment flows for `EncryptedVoting.sol`
- Do **not** wire app pages to a localhost deployment of `EncryptedVoting.sol`
- Local verification for `EncryptedVoting.sol` means Hardhat test execution, not local app deployment
- Real application deployment target for `EncryptedVoting.sol` is Arbitrum testnet

## EncryptedVotingMock.sol

- `EncryptedVotingMock.sol` is the local development contract
- It may be deployed to localhost and used by app pages for local testing

## Documentation

- When unsure about encrypted behavior or testing patterns, check official Fhenix/CoFHE docs first
- Match the documented plugin testing style instead of inventing a custom local encryption workflow
