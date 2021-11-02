from forta_agent import Finding, FindingType, FindingSeverity

MEDIUM_GAS_THRESHOLD = 1000000
HIGH_GAS_THRESHOLD = 3000000
CRITICAL_GAS_THRESHOLD = 7000000

findings_count = 0


def handle_transaction(transaction_event):
    # limiting this agent to emit only 5 findings so that the alert feed is not spammed
    global findings_count
    if findings_count >= 5:
        return []

    findings = []

    gas_used = int(transaction_event.gas_used)
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


def get_severity(gas_used):
    if gas_used > CRITICAL_GAS_THRESHOLD:
        return FindingSeverity.Critical
    elif gas_used > HIGH_GAS_THRESHOLD:
        return FindingSeverity.High
    else:
        return FindingSeverity.Medium
