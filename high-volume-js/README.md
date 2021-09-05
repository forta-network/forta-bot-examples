# High Volume Agent

## Description

This agent detects a high volume of transactions from any address over the last 5 minutes

## Supported Chains

- Ethereum

## Alerts

- FORTA-4
  - Fired when an address sends more than 10 transactions in a 5 minute interval
  - Severity is set to "medium" if volume above 10, "high" if above 30, "critical" if above 50
  - Type is always set to "suspicious"
  - Metadata fields:
    - "from" - the address which is sending a high volume of transactions
    - "transactions" - list of transaction hashes detected

## Test Data

The agent behaviour can be verified with the following block:

- 13167778 (11 transactions sent from 0xc7807e24338b41a34d849492920f2b9d0e4de2cd)
