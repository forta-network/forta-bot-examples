# USDT and USDC Blacklist Related Events

## Description

This bot emits an alert when an address gets added to or removed from the USDT/USDC Token Contracts' blacklists."

This bot was created with Arbritrary Execution's [Admininstrative/Governance Events Detection Bot Template](https://github.com/arbitraryexecution/forta-bot-templates/blob/main/admin-events/SETUP.md)

## Supported Chains

- Ethereum

## Alerts

Describe each of the type of alerts fired by this bot

- FORTA-USDC-USDT-ADMIN-EVENT
  - Fired when a transaction contains any USDT or USDC blacklist related events
  - For blacklisted events, severity is always set to "critical", and type is always set to "suspicious"
  - For unblacklisted events, severity is always set to "low", and type is always set to "info"
  - Metadata includes `contractAddress` of where it was fired from as well as all event arguments

## Test Data

The bot behaviour can be verified with the following transactions:

### USDT Example

`0x60c30bb4bb08c5905bd5d1dfd64766f069755bbe57536de76c7ba428153a0bed` (AddedBlackList event)

```bash
$ npm run tx 0x60c30bb4bb08c5905bd5d1dfd64766f069755bbe57536de76c7ba428153a0bed

1 findings for transaction 0x60c30bb4bb08c5905bd5d1dfd64766f069755bbe57536de76c7ba428153a0bed {
  "name": "Centre/Tether Blacklist Event",
  "description": "The AddedBlackList event was emitted by the USDT Token contract",
  "alertId": "FORTA-USDC-USDT-BLACKLIST-EVENT",
  "protocol": "Centre/Tether",
  "severity": "Critical",
  "type": "Suspicious",
  "metadata": {
    "contractName": "USDT Token",
    "contractAddress": "0xdAC17F958D2ee523a2206206994597C13D831ec7",
    "eventName": "AddedBlackList",
    "_user": "0xfB0A60806cDcD2047517B777398BBEa734c727e3"
  }
}
```

### USDC Example

`0x0a8a4eacb0eef53680bc299eb54e97bb64ba43baf7a5629d7f10768f531a619a` (Blacklisted event)

```bash
$ npm run tx 0x0a8a4eacb0eef53680bc299eb54e97bb64ba43baf7a5629d7f10768f531a619a

1 findings for transaction 0x0a8a4eacb0eef53680bc299eb54e97bb64ba43baf7a5629d7f10768f531a619a {
  "name": "Centre/Tether Blacklist Event",
  "description": "The Blacklisted event was emitted by the USDC Token Proxy contract",
  "alertId": "FORTA-USDC-USDT-BLACKLIST-EVENT",
  "protocol": "Centre/Tether",
  "severity": "Critical",
  "type": "Suspicious",
  "metadata": {
    "contractName": "USDC Token Proxy",
    "contractAddress": "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
    "eventName": "Blacklisted",
    "_account": "0x7FF9cFad3877F21d41Da833E2F775dB0569eE3D9"
  }
}
```
