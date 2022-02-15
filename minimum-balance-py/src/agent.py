from forta_agent import Finding, FindingType, FindingSeverity, get_web3_provider, Web3
from agent_core import provide_handle_block

w3 = get_web3_provider()
real_handle_block = provide_handle_block(w3)


def handle_block(block_event):
    return real_handle_block(block_event)
