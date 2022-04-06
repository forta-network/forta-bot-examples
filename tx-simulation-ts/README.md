# Transaction Simulator Agent

## Description

This agent simulates transactions using a Ganache fork. Read the full walkthrough [here](https://docs.forta.network/en/latest/tx-simulation/)

## Supported Chains

- Ethereum

## Alerts

- FORTA-9
  - Fired when a simulated ERC-20 transfer transaction fails
  - Severity is always set to "info"
  - Type is always set to "info"
  - Metadata includes the to, from and value of the transfer
