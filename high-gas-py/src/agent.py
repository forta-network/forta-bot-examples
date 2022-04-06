from forta_agent import Finding, FindingType, FindingSeverity, get_transaction_receipt

MEDIUM_GAS_THRESHOLD = 1000000
HIGH_GAS_THRESHOLD = 3000000
CRITICAL_GAS_THRESHOLD = 7000000

findings_count = 0


def provide_handle_transaction(get_transaction_receipt):
    def handle_transaction(transaction_event):
        # limiting this agent to emit only 5 findings so that the alert feed is not spammed
        global findings_count
        if findings_count >= 5:
            return []

        findings = []

        receipt = get_transaction_receipt(transaction_event.hash)
        gas_used = int(receipt.gas_used)
        if gas_used < MEDIUM_GAS_THRESHOLD:
            return findings

        findings.append(Finding({
            'name': 'High Gas Used',
            'description': f'Gas Used: {gas_used}',
            'alert_id': 'FORTA-1',
            'type': FindingType.Suspicious,
            'severity': get_severity(gas_used),
            'metadata': {
                'gas_used': gas_used
            }
        }))
        findings_count += len(findings)
        return findings

    return handle_transaction


def get_severity(gas_used):
    if gas_used > CRITICAL_GAS_THRESHOLD:
        return FindingSeverity.Critical
    elif gas_used > HIGH_GAS_THRESHOLD:
        return FindingSeverity.High
    else:
        return FindingSeverity.Medium


real_handle_transaction = provide_handle_transaction(get_transaction_receipt)


def handle_transaction(transaction_event):
    return real_handle_transaction(transaction_event)
