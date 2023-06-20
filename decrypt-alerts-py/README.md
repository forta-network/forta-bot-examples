# Decryption example bot

## Description

This bot subscribes to the encryption bot (0xf403400c4bd908e81853e8219c9e3980447760808d84c1f9fb724bce24540f07) which encrypts alerts. It decrypts them and emits an decrypted alert. 

This is a patterns that may be utilized by bots that are in the generic feed and premium feed category, but one still wants to have a modular bot setup. 

In a production version of the bot, one would secure the private key. This is just for demonstration purposes.

## Supported Chains

- Ethereum

## Alerts

- FORTA-1
  - Fired when receiving an encrypted alert

## Test Data

The agent behaviour can be verified with the following alert:

- 0x8a1975136efa094a51f00ff0406ed4abff2bfb24c25e4a0d4e47e86fc200e8e6
