from forta_agent import Finding, FindingType, FindingSeverity
from .constants import USDT_ADDRESS, USDT_DECIMALS, ERC_20_TRANSFER_EVENT_ABI

AMOUNT_THRESHOLD = 1000000


def provide_handle_transaction(amount_threshold):
    def handle_transaction(transaction_event):
        findings = []

        # filter the transaction logs for USDT Transfer events
        usdt_transfer_events = transaction_event.filter_log(
            ERC_20_TRANSFER_EVENT_ABI, USDT_ADDRESS)

        # fire alerts for transfers of large amounts
        for event in usdt_transfer_events:
            # shift decimal places of transfer amount
            amount = event['args']['value'] / 10**USDT_DECIMALS

            if (amount < amount_threshold):
                continue

            findings.append(Finding({
                'name': 'Large Tether Transfer',
                'description': f'{amount} USDT transferred',
                'alert_id': 'FORTA-7',
                'type': FindingType.Info,
                'severity': FindingSeverity.Info,
                'metadata': {
                    'from': event['args']['from'],
                    'to': event['args']['to'],
                    'amount': amount
                }
            }))
        return findings

    return handle_transaction


real_handle_transaction = provide_handle_transaction(AMOUNT_THRESHOLD)


def handle_transaction(transaction_event):
    return real_handle_transaction(transaction_event)
