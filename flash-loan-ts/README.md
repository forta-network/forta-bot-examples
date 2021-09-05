# Flash Loan Attack Agent

## Description

This agent detects transactions with Aave flash loans with losses of at least 200 eth for interested protocols

## Requires Trace Data?

Yes

## Supported Chains

- Ethereum

## Alerts

- FORTA-5
  - Fired when a transaction has a flash loan involving a loss for an interested protocol
  - Severity is always set to "high"
  - Type is always set to "suspicious"
  - Metadata fields
    - "protocolAddress": the address of the affected protocol
    - "balanceDiff": the resulting loss in wei
    - "loans": list of flash loan events in the transaction

## Test Data

The agent behaviour can be verified with the following transactions:

- 0x59faab5a1911618064f1ffa1e4649d85c99cfd9f0d64dcebbc1af7d7630da98b (Yearn Dai exploit: https://github.com/yearn/yearn-security/blob/master/disclosures/2021-02-04.md)
