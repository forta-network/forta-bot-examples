# Text Message Sentiment And Emotion Analysis

## Description

This bot analyzes sentiment and emotion of transaction text message sent between EOAs.
The bot uses 2 pretrained deep learning models:

* [Twitter-roBERTa-base for Sentiment Analysis - UPDATED (2021)](https://huggingface.co/cardiffnlp/twitter-roberta-base-sentiment-latest)
* [Emotion English DistilRoBERTa-base](https://huggingface.co/j-hartmann/emotion-english-distilroberta-base?text=Oh+wow.+I+didn%27t+know+that.)

## Supported Chains

- Ethereum
- BSC
- Polygon
- Optimism
- Arbitrum
- Avalanche
- Fantom

## Alerts

Sentiment: POSITIVE, NEUTRAL, NEGATIVE
Emotions:

* anger 🤬
* disgust 🤢
* fear 😨
* joy 😀
* neutral 😐
* sadness 😭
* surprise 😲


- NEGATIVE-<EMOTION>-TEXT-MESSAGE
  - Fired when a transaction contains a negative text message
  - Severity is always set to "High"
  - Type is always set to "info"
  - Metadata includes model confidence scores for both sentiment and emotion models.

- <POSITIVE|NEUTRAL>-<EMOTION>-TEXT-MESSAGE
  - Fired when a transaction contains a positive or neutral text message
  - Severity is always set to "Low"
  - Type is always set to "info"
  - Metadata includes model confidence scores for both sentiment and emotion models.

## Test Data

The agent behaviour can be verified with the following transactions:

- Transaction hash `0x4989fa9d76a0f1a54236e6fb59823827ce98e063047b909308ed7552a739fef0` has input data with text message = "you are such a looser for making scam contracts lmao hope you burn in hell one day jeet"

```bash
$ npm run tx 0x4989fa9d76a0f1a54236e6fb59823827ce98e063047b909308ed7552a739fef0
...
1 findings for transaction 0x4989fa9d76a0f1a54236e6fb59823827ce98e063047b909308ed7552a739fef0 {
  "name": "Negative Text Message",
  "description": "you are such a looser for making scam contracts lmao hope you burn in hell one day jeet",
  "alertId": "NEGATIVE-ANGER-TEXT-MESSAGE",
  "protocol": "ethereum",
  "severity": "High",
  "type": "Info",
  "metadata": {
    "sentiment_score": 0.9601391553878784,
    "emotion_score": 0.8896471858024597,
    "anomaly_score": 0.0001
  },
  "addresses": [],
  "labels": []
}
```
