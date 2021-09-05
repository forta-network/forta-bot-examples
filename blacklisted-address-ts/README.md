# Blacklisted Address Agent

## Description

This agent detects transactions that involve blacklisted addresses

## Supported Chains

- Ethereum

## Alerts

- FORTA-3
  - Fired when a transaction or subtransaction involves one of the blacklisted addresses
  - Severity is always set to "high"
  - Type is always set to "suspicious"
  - Metadata "address" field specifies which blacklisted address was detected

## Test Data

The agent behaviour can be verified with the following transactions:

- 0xfe7daf440544ad670494804cc663583a7129bbe21c9ae33f0dd6e72b05c08c8d (involves 0x02788b3452849601e63ca70ce7db72c30c3cfd18)
- 0xb95304758e5c04386f120342af637a4c86ece379d569c5c88e8e9b6a77eeb78b (involves 0x499875b33e55c36a80d544e7ba3ca96cb52b1361)
