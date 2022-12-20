from datetime import datetime
import forta_agent
from forta_agent import get_json_rpc_url
from hexbytes import HexBytes
import logging

from transformers import pipeline

from web3 import Web3

from src.findings import (
    NegativeSentimentFinding,
    NeutralSentimentFinding,
    PositiveSentimentFinding,
)
from src.logger import logger
from src.utils import (
    update_eoa_text_msg_counter,
    update_alert_counter,
)

# Set transformer pkg's logging level to critical to prevent logs raising exceptions in the initialize function.
logging.getLogger("transformers").setLevel(logging.CRITICAL)
logging.getLogger("torch").setLevel(logging.CRITICAL)

web3 = Web3(Web3.HTTPProvider(get_json_rpc_url()))

SENTIMENT_MODEL = "cardiffnlp/twitter-roberta-base-sentiment-latest"
# Jochen Hartmann, "Emotion English DistilRoBERTa-base". https://huggingface.co/j-hartmann/emotion-english-distilroberta-base/, 2022.
EMOTIONS_MODEL = "j-hartmann/emotion-english-distilroberta-base"
SENTIMENT_TASK = None
EMOTION_TASK = None
MIN_TOKEN_COUNT = 3


def initialize():
    """
    This function loads the deep learning models for sentiment analysis
    """
    global SENTIMENT_TASK, EMOTION_TASK
    logger.info("Start loading sentiment model")
    try:
        SENTIMENT_TASK = pipeline(
            "sentiment-analysis", model=SENTIMENT_MODEL, tokenizer=SENTIMENT_MODEL
        )
    except Exception as err:
        logger.info(f"Error loading sentiment model: {err}")

    logger.info("Complete loading sentiment model")
    logger.info("Start loading emotion model")
    try:
        EMOTION_TASK = pipeline("text-classification", model=EMOTIONS_MODEL)
    except Exception as err:
        logger.info(f"Error loading emotion model: {err}")
    logger.info("Complete loading emotion model")


def is_eoa(w3: Web3, address: str) -> bool:
    """
    This function determines whether address is an EOA
    """
    if address is None:
        return False
    code = w3.eth.get_code(Web3.toChecksumAddress(address))
    return code == HexBytes("0x")


def tx_data_to_text(w3, data: str):
    try:
        text = w3.toText(data).strip()
        text_count = text.split(" ")
        if len(text_count) >= MIN_TOKEN_COUNT:
            return text
    except Exception as err:
        logger.warning(f"Failed parsing tx data: {err}")
        return None


def get_sentiment(text_message: str):
    return SENTIMENT_TASK(text_message)[0]


def get_emotion(text_message: str):
    return EMOTION_TASK(text_message)[0]


def sentiment_analysis(w3, transaction_event):
    findings = []

    from_address = transaction_event.from_
    to_address = transaction_event.to
    is_eoa_transaction = is_eoa(w3, from_address) and is_eoa(w3, to_address)

    # skip if not a transaction between EOAs
    if not is_eoa_transaction:
        return findings

    date_time = datetime.now()
    date_hour = date_time.strftime("%d/%m/%Y %H:00:00")
    update_eoa_text_msg_counter(date_hour)
    # empty data
    input_data = transaction_event.transaction.data
    if input_data is None:
        return findings

    text_message = tx_data_to_text(w3, input_data)

    if text_message is None:
        return findings

    update_alert_counter(date_hour)
    sentiment_prediction = get_sentiment(text_message)
    sentiment_label = sentiment_prediction["label"]
    emotion_prediction = get_emotion(text_message)
    finding = None

    if sentiment_label == "negative":
        finding = NegativeSentimentFinding(
            text_message, sentiment_prediction, emotion_prediction
        )
    elif sentiment_label == "nositive":
        finding = PositiveSentimentFinding(
            text_message, sentiment_prediction, emotion_prediction
        )
    else:  # Neutral
        finding = NeutralSentimentFinding(
            text_message, sentiment_prediction, emotion_prediction
        )

    findings.append(finding.emit_finding())
    return findings


def provide_handle_transaction(w3):
    def handle_transaction(
        transaction_event: forta_agent.transaction_event.TransactionEvent,
    ) -> list:
        return sentiment_analysis(w3, transaction_event)

    return handle_transaction


real_handle_transaction = provide_handle_transaction(web3)


def handle_transaction(
    transaction_event: forta_agent.transaction_event.TransactionEvent,
):
    return real_handle_transaction(transaction_event)
