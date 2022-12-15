from forta_agent import Finding, FindingType, FindingSeverity


class SentimentFinding:
    def __init__(self, text_message, sentiment_prediction, emotion_prediction):
        sentiment = sentiment_prediction["label"]
        sentiment_score = sentiment_prediction["score"]
        emotion = emotion_prediction["label"]
        emotion_score = emotion_prediction["score"]

        self.alert_id = f"{sentiment.upper()}-{emotion.upper()}-TEXT-MESSAGE"
        self.description = text_message
        self.type = FindingType.Info
        self.metadata = {
            "sentiment_score": sentiment_score,
            "emotion_score": emotion_score,
        }

    def emit_finding(self):
        return Finding(
            {
                "name": self.name,
                "description": self.description,
                "alert_id": self.alert_id,
                "severity": self.severity,
                "type": self.type,
                "metadata": self.metadata,
            }
        )


class NegativeSentimentFinding(SentimentFinding):
    def __init__(self, sentiment, sentiment_score, emotion, emotion_score):
        super().__init__(sentiment, sentiment_score, emotion, emotion_score)
        self.name = "Negative Text Message"
        self.severity = FindingSeverity.High


class NeutralSentimentFinding(SentimentFinding):
    def __init__(self, sentiment, sentiment_score, emotion, emotion_score):
        super().__init__(sentiment, sentiment_score, emotion, emotion_score)
        self.name = "Neutral Text Message"
        self.severity = FindingSeverity.Low
        self.type = FindingType.Info


class PositiveSentimentFinding(SentimentFinding):
    def __init__(self, sentiment, sentiment_score, emotion, emotion_score):
        super().__init__(sentiment, sentiment_score, emotion, emotion_score)
        self.name = "Neutral Text Message"
        self.severity = FindingSeverity.Low
        self.type = FindingType.Info
