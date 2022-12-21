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
  - Metadata includes model confidence scores, response times for both sentiment and emotion models.

- <POSITIVE|NEUTRAL>-<EMOTION>-TEXT-MESSAGE
  - Fired when a transaction contains a positive or neutral text message
  - Severity is always set to "Low"
  - Type is always set to "info"
  - Metadata includes model confidence scores, response times for both sentiment and emotion models.

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
    "sentiment_time_secs": 0.29741870800000036,
    "emotion_score": 0.8896471858024597,
    "emotion_time_secs": 0.06408987499999874,
    "anomaly_score": 0.0001
  },
  "addresses": [],
  "labels": []
}
```

- Transaction hash `0x45144fb8d59debc6665682c649aebb7dcfbb206191835ba57478108c3cd5060a` has input data with text message = "i am poor people. please gift me some money. thanks"

```bash
$ npm run tx 0x45144fb8d59debc6665682c649aebb7dcfbb206191835ba57478108c3cd5060a

> text-message-sentiment-analysis@1.0.0 tx
> forta-agent run --tx 0x45144fb8d59debc6665682c649aebb7dcfbb206191835ba57478108c3cd5060a

initializing agent...
2022-12-21 10:17:33,919 - root - INFO - Start loading sentiment model
2022-12-21 10:17:40,037 - root - INFO - Complete loading sentiment model
2022-12-21 10:17:40,037 - root - INFO - Start loading emotion model
2022-12-21 10:17:51,255 - root - INFO - Complete loading emotion model
1 findings for transaction 0x45144fb8d59debc6665682c649aebb7dcfbb206191835ba57478108c3cd5060a {
  "name": "Negative Text Message",
  "description": "i am poor people. please gift me some money. thanks",
  "alertId": "NEGATIVE-SADNESS-TEXT-MESSAGE",
  "protocol": "ethereum",
  "severity": "High",
  "type": "Info",
  "metadata": {
    "sentiment_score": 0.6648902893066406,
    "sentiment_time_secs": 0.11572491699999965,
    "emotion_score": 0.984155535697937,
    "emotion_time_secs": 0.06156608299999888,
    "anomaly_score": 0.0001
  },
  "addresses": [],
  "labels": []
}
```