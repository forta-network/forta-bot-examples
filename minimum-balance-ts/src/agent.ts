import BigNumber from 'bignumber.js'
import Web3 from 'web3'
import { 
  BlockEvent, 
  Finding, 
  HandleBlock, 
  FindingSeverity, 
  FindingType,
  getJsonRpcUrl
} from 'forta-agent'

export const ACCOUNT = "0x6efef34e81fd201edf18c7902948168e9ebb88ae"
export const MIN_BALANCE = "500000000000000000" // 0.5 eth

const web3 = new Web3(getJsonRpcUrl())

function provideHandleBlock(web3: Web3): HandleBlock {
  return async function handleBlock(blockEvent: BlockEvent) {
    // report finding if specified account balance falls below threshold
    const findings: Finding[] = []

    const accountBalance = new BigNumber(await web3.eth.getBalance(ACCOUNT, blockEvent.blockNumber))
    if (accountBalance.isGreaterThanOrEqualTo(MIN_BALANCE)) return findings

    findings.push(
      Finding.fromObject({
        name: "Minimum Account Balance",
        description: `Account balance (${accountBalance.toString()}) below threshold (${MIN_BALANCE})`,
        alertId: "FORTA-6",
        severity: FindingSeverity.Info,
        type: FindingType.Suspicious,
        metadata: {
          balance: accountBalance.toString()
        }
      }
    ))

    return findings
  }
}


export default {
  provideHandleBlock,
  handleBlock: provideHandleBlock(web3)
}