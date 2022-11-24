# OpenZeppelin-Gnosis Safe Contract Events

## Description

This agent detects **ALL** events from smart contracts defined in the [`openzeppelin-contracts`](https://github.com/OpenZeppelin/openzeppelin-contracts) and [`gnosis-safe`](https://github.com/gnosis/safe-contracts) Github repositories

## Supported Chains

- Ethereum Mainnet, Polygon, Avalanche, Arbitrum, Optimism

## Alerts

Describe each of the type of alerts fired by this agent

- OZ-GNOSIS-EVENTS
  - Fired when a transaction contains any openzeppelin-contracts or gnosis-safe events
  - Severity is always set to "info"
  - Type is always set to "info"
  - Metadata includes `contractAddress` of where it was fired from as well as all event arguments

## Test Data

The agent behaviour can be verified with the following transactions:

- 0x9d51007298e990a656360b61c29cddce8b1e49b390823ed0516b32230b271b81 (Transfer and Approval events)
