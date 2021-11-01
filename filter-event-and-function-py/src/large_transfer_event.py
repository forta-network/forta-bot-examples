from forta_agent import Finding, FindingType, FindingSeverity

USDT_ADDRESS = "0xdac17f958d2ee523a2206206994597c13d831ec7"
USDT_DECIMALS = 6
AMOUNT_THRESHOLD = 1000000
ERC_20_TRANSFER_EVENT_ABI = '{"name":"Transfer","type":"event","anonymous":false,"inputs":[{"indexed":true,"name":"from","type":"address"},{"indexed":true,"name":"to","type":"address"},{"indexed":false,"name":"value","type":"uint256"}]}'


def handle_transaction(transaction_event):
    findings = []

    # filter the transaction logs for USDT Transfer events
    usdt_transfer_events = transaction_event.filter_log(
        ERC_20_TRANSFER_EVENT_ABI, USDT_ADDRESS)

    # fire alerts for transfers of large amounts
    for event in usdt_transfer_events:
        # shift decimal places of transfer amount
        amount = event['args']['value'] / 10**USDT_DECIMALS

        if (amount < AMOUNT_THRESHOLD):
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
