from forta_agent import Finding, FindingType, FindingSeverity, EntityType

from src.utils import get_anomaly_score


class SentimentFinding:
    def __init__(
        self, text_message, sentiment_prediction, emotion_prediction, msg_receiver
    ):
        sentiment = sentiment_prediction["label"]
        emotion = emotion_prediction["label"]

        self.alert_id = f"{sentiment.upper()}-{emotion.upper()}-TEXT-MESSAGE"
        self.description = text_message
        self.type = FindingType.Info
        self.metadata = {
            "sentiment_score": sentiment_prediction["score"],
            "sentiment_time_secs": sentiment_prediction["response_time"],
            "emotion_score": emotion_prediction["score"],
            "emotion_time_secs": emotion_prediction["response_time"],
            "anomaly_score": get_anomaly_score(),
        }
        self.labels = None

    def emit_finding(self):
        finding = {
            "name": self.name,
            "description": self.description,
            "alert_id": self.alert_id,
            "severity": self.severity,
            "type": self.type,
            "metadata": self.metadata,
        }

        if self.labels is not None:
            finding["labels"] = self.labels
        return Finding(finding)


class NegativeSentimentFinding(SentimentFinding):
    def __init__(
        self, text_message, sentiment_prediction, emotion_prediction, msg_receiver
    ):
        super().__init__(
            text_message, sentiment_prediction, emotion_prediction, msg_receiver
        )
        self.name = "Negative Text Message"
        self.severity = FindingSeverity.High
        self.labels = [
            {
                "entity": msg_receiver,
                "entity_type": EntityType.Address,
                "label": "attacker",
                "confidence": self.metadata["sentiment_score"],
            }
        ]


class NeutralSentimentFinding(SentimentFinding):
    def __init__(
        self, text_message, sentiment_prediction, emotion_prediction, msg_receiver
    ):
        super().__init__(
            text_message, sentiment_prediction, emotion_prediction, msg_receiver
        )
        self.name = "Neutral Text Message"
        self.severity = FindingSeverity.Low
        self.type = FindingType.Info


class PositiveSentimentFinding(SentimentFinding):
    def __init__(
        self, text_message, sentiment_prediction, emotion_prediction, msg_receiver
    ):
        super().__init__(
            text_message, sentiment_prediction, emotion_prediction, msg_receiver
        )
        self.name = "Positive Text Message"
        self.severity = FindingSeverity.Low
        self.type = FindingType.Info
