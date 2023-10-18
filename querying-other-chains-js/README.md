# High Gas Agent

## Description

This agent detects transactions on Goerli with high gas consumption. **Requires setting `GOERLI_RPC_URL` in agent.js**. Read the full walkthrough [here](https://docs.forta.network/en/latest/querying-chains/)

## Supported Chains

- Ethereum
- List any other chains this agent can support e.g. BSC

## Alerts

Describe each of the type of alerts fired by this agent

- FORTA-1
  - Fired when a transaction consumes more gas than 1,000,000 gas
  - Severity is always set to "medium" (mention any conditions where it could be something else)
  - Type is always set to "suspicious" (mention any conditions where it could be something else)
  - Mention any other type of metadata fields included with this alert

## Test Data

The agent behaviour can be verified by running:

- npm run block
