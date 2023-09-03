# Advanced Testing Agent

## Description

This agent detects transactions with Tether transfers above a certain threshold. This project demonstrates how to use a forked Ganache chain to run simulated transactions against your agent locally. Read the full walkthrough [here](https://docs.forta.network/en/latest/advanced-testing/)

## Supported Chains

- Ethereum

## Alerts

- TETH-1
  - Fired when a transaction involves a Tether transfer of value more than 50
  - Severity is always set to "medium"
  - Type is always set to "info"
  - Metadata "value" field specifies the amount transferred

## Test Data

The agent behaviour can be verified with the following transactions:

- [0x082c77512548ceaa065a9f92ab90761fe94429df58e6df771432279844323ea2](https://etherscan.io/tx/0x082c77512548ceaa065a9f92ab90761fe94429df58e6df771432279844323ea2)