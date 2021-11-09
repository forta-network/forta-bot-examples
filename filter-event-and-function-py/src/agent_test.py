from unittest.mock import Mock
from forta_agent import create_transaction_event
from .agent import provide_handle_transaction

mock_handle_large_transfer_event = Mock()
mock_handle_transfer_from_function = Mock()
handle_transaction = provide_handle_transaction(
    mock_handle_large_transfer_event, mock_handle_transfer_from_function)
mock_tx_event = create_transaction_event({})


class TestTetherTransferAgent:
    def test_returns_findings_from_large_transfer_event_agent_and_transfer_from_function_agent(self):
        mock_finding = {'some': 'finding'}
        mock_handle_large_transfer_event.return_value = [mock_finding]
        mock_handle_transfer_from_function.return_value = [mock_finding]

        findings = handle_transaction(mock_tx_event)

        assert len(findings) == 2
        assert findings[0] == mock_finding
        assert findings[1] == mock_finding
        mock_handle_large_transfer_event.assert_called_once_with(mock_tx_event)
        mock_handle_transfer_from_function.assert_called_once_with(
            mock_tx_event)
