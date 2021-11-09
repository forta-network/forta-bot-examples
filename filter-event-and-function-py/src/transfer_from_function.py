from forta_agent import Finding, FindingType, FindingSeverity
from .constants import USDT_ADDRESS, USDT_DECIMALS, ERC_20_TRANSFER_FROM_FUNCTION_ABI


def provide_handle_transaction():
    def handle_transaction(transaction_event):
        findings = []

        # filter the transaction input for USDT transferFrom function calls
        usdt_transfer_from_invocations = transaction_event.filter_function(
            ERC_20_TRANSFER_FROM_FUNCTION_ABI, USDT_ADDRESS)

        # fire alerts for each function call
        for invocation in usdt_transfer_from_invocations:
            args = invocation[1]
            # shift decimal places of transfer amount
            amount = args['value'] / 10**USDT_DECIMALS

            findings.append(Finding({
                'name': 'Tether Delegate Transfer',
                'description': f'{amount} USDT transferred',
                'alert_id': 'FORTA-8',
                'type': FindingType.Info,
                'severity': FindingSeverity.Info,
                'metadata': {
                    'by': transaction_event.from_,
                    'from': args['from'],
                    'to': args['to'],
                    'amount': amount
                }
            }))
        return findings

    return handle_transaction


real_handle_transaction = provide_handle_transaction()


def handle_transaction(transaction_event):
    return real_handle_transaction(transaction_event)
