from forta_agent import FindingSeverity, FindingType, create_transaction_event
from agent import handle_transaction


class TestHighGasAgent:
    def test_returns_empty_findings_if_gas_below_threshold(self):
        tx_event = create_transaction_event(
            {'receipt': {'gas_used': '1'}})

        findings = handle_transaction(tx_event)

        assert len(findings) == 0

    def test_returns_finding_if_gas_above_threshold(self):
        tx_event = create_transaction_event({
            'receipt': {'gas_used': '1000001'}
        })

        findings = handle_transaction(tx_event)

        assert len(findings) == 1
        finding = findings[0]
        assert finding.name == "High Gas Used"
        assert finding.description == f'Gas Used: {tx_event.gas_used}'
        assert finding.alert_id == 'FORTA-1'
        assert finding.type == FindingType.Suspicious
        assert finding.severity == FindingSeverity.Medium
        assert finding.metadata['gas_used'] == tx_event.gas_used
