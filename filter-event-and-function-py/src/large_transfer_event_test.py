from unittest.mock import Mock
from forta_agent import FindingSeverity, FindingType, create_transaction_event
from .large_transfer_event import provide_handle_transaction
from .constants import USDT_ADDRESS, USDT_DECIMALS, ERC_20_TRANSFER_EVENT_ABI

mock_amount_threshold = 100
handle_transaction = provide_handle_transaction(mock_amount_threshold)
mock_tx_event = create_transaction_event({})
mock_tx_event.filter_log = Mock()


class TestLargeTransferEventAgent:
    def test_returns_empty_findings_if_no_transfers(self):
        mock_tx_event.filter_log.return_value = []

        findings = handle_transaction(mock_tx_event)

        assert len(findings) == 0
        mock_tx_event.filter_log.assert_called_once_with(
            ERC_20_TRANSFER_EVENT_ABI, USDT_ADDRESS)

    def test_returns_finding_if_large_transfers_exist(self):
        mock_tx_event.filter_log.reset_mock()
        amount = 101
        mock_transfer_event = {
            'args': {'value': amount * 10**USDT_DECIMALS, 'from': '0x123', 'to': '0xabc'}}
        mock_tx_event.filter_log.return_value = [mock_transfer_event]

        findings = handle_transaction(mock_tx_event)

        assert len(findings) == 1
        mock_tx_event.filter_log.assert_called_once_with(
            ERC_20_TRANSFER_EVENT_ABI, USDT_ADDRESS)
        finding = findings[0]
        formatted_amount = mock_transfer_event['args']['value'] / \
            10**USDT_DECIMALS
        assert finding.name == "Large Tether Transfer"
        assert finding.description == f'{formatted_amount} USDT transferred'
        assert finding.alert_id == "FORTA-7"
        assert finding.severity == FindingSeverity.Info
        assert finding.type == FindingType.Info
        assert finding.metadata['from'] == mock_transfer_event['args']['from']
        assert finding.metadata['to'] == mock_transfer_event['args']['to']
        assert finding.metadata['amount'] == formatted_amount
