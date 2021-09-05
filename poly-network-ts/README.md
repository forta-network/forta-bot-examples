# Poly Network Agent

## Description

This agent detects when the Poly Network bookkeeper changes, or when a Poly asset balance drops by more than 50%

## Supported Chains

- Ethereum

## Alerts

- POLY-1
  - Fired when the Poly Network consensus bookkeepers public keys change
  - Severity is always set to "high"
  - Type is always set to "suspicious"
  - Metadata fields:
    - "oldPkBytes" - the previous public keys in encoded bytes
    - "newPkBytes" - the updated public keys in encoded bytes
- POLY-2
  - Fired when any of the Poly assets balance falls by more than 50%
  - Severity if set to "high" if dropped by more than 50%, "critical" if more than 90%
  - Type is always set to "exploit"
  - Metadata fields:
    - "currentBalance" - the current block's asset balance in wei
    - "previousBalance" - the previous block's asset balance in wei

## Test Data

The agent behaviour can be verified with the following block range:

- 12996658..12996844 (Poly Network hack: https://slowmist.medium.com/the-root-cause-of-poly-network-being-hacked-ec2ee1b0c68f)
