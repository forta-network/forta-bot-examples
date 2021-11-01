# Tether Transfer Agent

## Description

This agent detects Tether transactions with large transfers or transferFrom function calls

## Supported Chains

- Ethereum

## Alerts

- FORTA-7
  - Fired when a transaction contains a Transfer event of over 1,000,000 USDT
  - Severity is always set to "info"
  - Type is always set to "info"
  - Metadata
    - from: sender of USDT
    - to: receiver of USDT
    - amount: how many USDT were sent
- FORTA-8
  - Fired when a transaction contains a USDT transferFrom function call
  - Severity is always set to "info"
  - Type is always set to "info"
  - Metadata
    - by: sender of transaction
    - from: sender of USDT
    - to: receiver of USDT
    - amount: how many USDT were sent

## Test Data

The agent behaviour can be verified with the following transactions:

- 0x37aa14898c5fcaff2e79171936b2ded253399d7cb765b88928269f102fda2bb1 (large transfer, fires FORTA-7)
- 0xed3af5261d87e30ea3ecd406b605350c6ac2e4fe0c3f39045149b53d8710ed13 (transferFrom called, fires FORTA-8)
