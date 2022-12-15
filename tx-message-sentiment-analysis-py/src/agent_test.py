from unittest.mock import Mock
from forta_agent import FindingSeverity, FindingType, create_transaction_event
from agent import handle_transaction


class TestSentimentAnalysisBot:
    def test_returns_empty_findings_if_logs_not_empty(self):
        tx_event = create_transaction_event(
            {
                "transaction": {
                    "from": "0x4242111111111111111111111111111111114242",
                    "to": "0x1111111111111111111111111111111111111234",
                    "data": None,
                }
            }
        )

        findings = handle_transaction(tx_event)
        assert len(findings) == 0

    # TODO: add more tests
