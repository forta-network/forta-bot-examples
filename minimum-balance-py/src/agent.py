from web3 import Web3
from forta_agent import Finding, FindingType, FindingSeverity, get_json_rpc_url

ACCOUNT = "0x6efef34e81fd201edf18c7902948168e9ebb88ae"
MIN_BALANCE = int("500000000000000000")  # 0.5 eth

w3 = Web3(Web3.HTTPProvider(get_json_rpc_url()))


def handle_block(block_event):
    findings = []

    balance = int(w3.eth.get_balance(
        Web3.toChecksumAddress(ACCOUNT), int(block_event.block_number)))
    if (balance >= MIN_BALANCE):
        return findings

    findings.append(Finding({
        'name': "Minimum Account Balance",
        'description': f'Account balance ({balance}) below threshold ({MIN_BALANCE})',
        'alert_id': "FORTA-6",
        'severity': FindingSeverity.Info,
        'type': FindingType.Suspicious,
        'metadata': {
            'account': ACCOUNT,
            'balance': balance
        }
    }))
    return findings
