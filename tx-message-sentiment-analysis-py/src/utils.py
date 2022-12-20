from expiring_dict import ExpiringDict


GLOBAL_TOTAL_TEXT_MSG_COUNTER = ExpiringDict(ttl=86_400)
GLOBAL_TOTAL_ALERT_COUNTER = ExpiringDict(ttl=86_400)


def update_eoa_text_msg_counter(date_hour: str):
    # Total number of eoa transaction with text message in the last 24 hrs
    global GLOBAL_TOTAL_TEXT_MSG_COUNTER
    GLOBAL_TOTAL_TEXT_MSG_COUNTER[date_hour] = (
        GLOBAL_TOTAL_TEXT_MSG_COUNTER.get(date_hour, 0) + 1
    )


def update_alert_counter(date_hour: str):
    # Total number of negative text messages in the last 24 hrs
    global GLOBAL_TOTAL_ALERT_COUNTER
    GLOBAL_TOTAL_ALERT_COUNTER[date_hour] = (
        GLOBAL_TOTAL_ALERT_COUNTER.get(date_hour, 0) + 1
    )


def get_anomaly_score():
    total_alerts = sum(GLOBAL_TOTAL_ALERT_COUNTER.values())
    total_eoa_text_messages = sum(GLOBAL_TOTAL_TEXT_MSG_COUNTER.values())
    return total_alerts / total_eoa_text_messages
