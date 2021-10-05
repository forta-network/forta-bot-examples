# Compound Agent

## Description

This agent monitors the Compound protocol and alerts when:

- the `drip()` method is called on the Reservoir contract, or
- an unusual distribution of COMP tokens occurs when calling `claimComp()` on the Comptroller contract

## Supported Chains

- Ethereum

## Alerts

- COMP-1

  - Fired when a COMP distribution occurs that is at least twice as much as accrued
  - Severity is always set to "High"
  - Type is always set to "Suspicious"
  - Metadata fields included:
    - `receiver` - the address that received the COMP tokens
    - `compDistributed` - the amount of COMP distributed to receiver
    - `compAccrued` - the amount of COMP accrued by receiver in the previous block

- COMP-2
  - Fired when the `drip()` method is called on the Reservoir contract
  - Severity is always set to "Medium"
  - Type is always set to "Suspicious"
  - Metadata fields included:
    - `from` - the address that invoked the method
    - `dripAmount` - the amount of COMP dripped from Reservoir

## Test Data

The agent behaviour can be verified with the following transactions:

- 0xf4bfef1655f2092cf062c008153a5be66069b2b1fedcacbf4037c1f3cc8a9f45 (fires COMP-1 alert)
- 0xbc246c878326f2c128462d08a0b74048b1dbee733adde8863f569c949c06422a (fires COMP-1 alert)
- 0x02ba168f4d4fc313d095e9f0711447e8b96b26421539bd40be58243cd80a73cd (fires COMP-2 alert)
