from .large_transfer_event import handle_transaction as handle_large_transfer_event
from .transfer_from_function import handle_transaction as handle_transfer_from_function

findings_count = 0


def provide_handle_transaction(handle_large_transfer_event, handle_transer_from_function):
    def handle_transaction(transaction_event):
        # limiting this agent to emit only 5 findings so that the alert feed is not spammed
        global findings_count
        if findings_count >= 5:
            return []

        findings = handle_large_transfer_event(
            transaction_event) + handle_transer_from_function(transaction_event)

        findings_count += len(findings)
        return findings

    return handle_transaction


real_handle_transaction = provide_handle_transaction(
    handle_large_transfer_event, handle_transfer_from_function)


def handle_transaction(transaction_event):
    return real_handle_transaction(transaction_event)
