from unittest.mock import Mock
from forta_agent import FindingSeverity, FindingType, create_transaction_event
from .transfer_from_function import provide_handle_transaction
from .constants import USDT_ADDRESS, USDT_DECIMALS, ERC_20_TRANSFER_FROM_FUNCTION_ABI

handle_transaction = provide_handle_transaction()
mock_tx_event = create_transaction_event({'transaction': {'from': '0x456'}})
mock_tx_event.filter_function = Mock()


class TestTransferFromFunctionAgent:
    def test_returns_empty_findings_if_no_function_calls(self):
        mock_tx_event.filter_function.return_value = []

        findings = handle_transaction(mock_tx_event)

        assert len(findings) == 0
        mock_tx_event.filter_function.assert_called_once_with(
            ERC_20_TRANSFER_FROM_FUNCTION_ABI, USDT_ADDRESS)

    def test_returns_finding_if_large_transfers_exist(self):
        mock_tx_event.filter_function.reset_mock()
        amount = 5
        mock_args = {'value': amount * 10**USDT_DECIMALS,
                     'from': '0x123', 'to': '0xabc'}
        mock_transfer_from_invocation = ({}, mock_args)
        mock_tx_event.filter_function.return_value = [
            mock_transfer_from_invocation]

        findings = handle_transaction(mock_tx_event)

        assert len(findings) == 1
        mock_tx_event.filter_function.assert_called_once_with(
            ERC_20_TRANSFER_FROM_FUNCTION_ABI, USDT_ADDRESS)
        finding = findings[0]
        formatted_amount = mock_args['value'] / 10**USDT_DECIMALS
        assert finding.name == "Tether Delegate Transfer"
        assert finding.description == f'{formatted_amount} USDT transferred'
        assert finding.alert_id == "FORTA-8"
        assert finding.severity == FindingSeverity.Info
        assert finding.type == FindingType.Info
        assert finding.metadata['by'] == mock_tx_event.from_
        assert finding.metadata['from'] == mock_args['from']
        assert finding.metadata['to'] == mock_args['to']
        assert finding.metadata['amount'] == formatted_amount
