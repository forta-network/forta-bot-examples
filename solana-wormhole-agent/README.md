# High Gas Agent

## Description

This agent detects Solana transactions that interact with the Wormhole bridge and result in token balances that are unusually high

## Supported Chains

- Solana

## Alerts

Describe each of the type of alerts fired by this agent

- WORM-1
  - Fired when a transaction interacts with Wormhole bridge and has unusually high postTokenBalances
  - Severity is always set to "info"
  - Type is always set to "suspicious"
  - Metadata
    - `token` - the address of the token with the unusual balance
    - `owner` - owner of the token balance
    - `preBalance` - owner balance of token before this transaction
    - `postBalance` - owner balance of token after this transaction
    - `increaseRatio` - multiple of increase between pre and post balance

## Testing

The agent behaviour can be verified with the following command: `node wormhole.exploit.tx.js`
