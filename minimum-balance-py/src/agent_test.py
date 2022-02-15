from unittest.mock import Mock
from web3 import Web3
from forta_agent import FindingSeverity, FindingType, create_block_event
from agent_core import provide_handle_block, ACCOUNT, MIN_BALANCE

mock_web3 = Mock(eth=Mock(get_balance=Mock()))
handle_block = provide_handle_block(mock_web3)
block_event = create_block_event(
    {'block': {'hash': '0xa', 'number': 1}})


class TestMinBalanceAgent:
    def test_returns_empty_findings_if_balance_above_threshold(self):
        mock_web3.eth.get_balance.return_value = '500000000000000001'

        findings = handle_block(block_event)

        assert len(findings) == 0
        mock_web3.eth.get_balance.assert_called_once_with(
            Web3.toChecksumAddress(ACCOUNT), int(block_event.block_number))

    def test_returns_finding_if_balance_below_threshold(self):
        mock_web3.eth.get_balance.reset_mock()
        balance = '1'
        mock_web3.eth.get_balance.return_value = balance

        findings = handle_block(block_event)

        assert len(findings) == 1
        mock_web3.eth.get_balance.assert_called_once_with(
            Web3.toChecksumAddress(ACCOUNT), int(block_event.block_number))
        finding = findings[0]
        assert finding.name == "Minimum Account Balance"
        assert finding.description == f'Account balance ({balance}) below threshold ({MIN_BALANCE})'
        assert finding.alert_id == "FORTA-6"
        assert finding.severity == FindingSeverity.Info
        assert finding.type == FindingType.Suspicious
        assert finding.metadata['account'] == ACCOUNT
        assert finding.metadata['balance'] == int(balance)
