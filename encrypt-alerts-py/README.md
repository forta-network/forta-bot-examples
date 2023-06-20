# Encryption example bot

## Description

This bot randomly picks a tx and emits an encrypted alert according to https://docs.forta.network/en/latest/private-alerts/#encrypting-findings. This is done to create privacy around the alert between the bot and subscriber. 

## Supported Chains

- Ethereum

## Alerts

- FORTA-1
  - Fired randomly on a transaction
  - The alert is encrypted with the public key of this bot

