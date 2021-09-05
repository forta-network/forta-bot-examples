# Minimum Balance Agent

## Description

This agent detects when a specified account balance is below 0.5 ETH

## Supported Chains

- Ethereum

## Alerts

- FORTA-6
  - Fired when a specified account balance is below 0.5 ETH
  - Severity is awlays set to "info"
  - Type is always set to "suspicious"
  - Metadata "balance" field contains amount of wei in account

## Test Data

The agent behaviour can be verified with the following block:

- 9580963 (account balance is 0.22 eth)
