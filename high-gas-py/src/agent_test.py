from unittest.mock import Mock
from forta_agent import FindingSeverity, FindingType, create_transaction_event
from agent import provide_handle_transaction

mock_get_transaction_receipt = Mock()
handle_transaction = provide_handle_transaction(mock_get_transaction_receipt)


class TestHighGasAgent:
    def test_returns_empty_findings_if_gas_below_threshold(self):
        mock_get_transaction_receipt.return_value = Mock(gas_used='1')
        tx_event = create_transaction_event({})

        findings = handle_transaction(tx_event)

        assert len(findings) == 0

    def test_returns_finding_if_gas_above_threshold(self):
        mock_gas_used = '1000001'
        mock_get_transaction_receipt.return_value = Mock(
            gas_used=mock_gas_used)
        tx_event = create_transaction_event({})

        findings = handle_transaction(tx_event)

        assert len(findings) == 1
        finding = findings[0]
        assert finding.name == "High Gas Used"
        assert finding.description == f'Gas Used: {mock_gas_used}'
        assert finding.alert_id == 'FORTA-1'
        assert finding.type == FindingType.Suspicious
        assert finding.severity == FindingSeverity.Medium
        assert finding.metadata['gas_used'] == int(mock_gas_used)
