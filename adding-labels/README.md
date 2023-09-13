# Large Tether Transfer Agent

## Description

This agent detects transactions with Tether transfers above a certain threshold. This project demonstrates how to use labels to add more contextual data to findings. Read the full walkthrough [here](https://docs.forta.network/en/latest/labels/)

## Supported Chains

- Ethereum

## Alerts

- FORTA-1
  - Fired when a transaction contains a Tether transfer over 10,000 USDT
  - Severity is always set to "high"
  - Type is always set to "suspicious"
  - Metadata:
    - "from" field specifices the sender address
    - "to" field specifies the receiver address

## Test Data

The agent behaviour can be verified with the following transactions:

- 0x3a0f757030beec55c22cbc545dd8a844cbbb2e6019461769e1bc3f3a95d10826 (15,000 USDT)
