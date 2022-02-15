from forta_agent import Finding, FindingType, FindingSeverity, get_web3_provider, Web3

ACCOUNT = "0x6efef34e81fd201edf18c7902948168e9ebb88ae"
MIN_BALANCE = int("500000000000000000")  # 0.5 eth


def provide_handle_block(w3):
    def handle_block(block_event):
        findings = []

        print(f'block_number={block_event.block_number}')
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

    return handle_block


w3 = get_web3_provider()
real_handle_block = provide_handle_block(w3)