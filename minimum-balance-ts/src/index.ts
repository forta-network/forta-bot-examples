import BigNumber from 'bignumber.js'
import Web3 from 'web3'
import { 
  BlockEvent, 
  Finding, 
  HandleBlock, 
  FindingSeverity, 
  FindingType 
} from 'forta-agent'

const ACCOUNT = "0x6efef34e81fd201edf18c7902948168e9ebb88ae"
const MIN_BALANCE = "500000000000000000" // 0.5 eth
const JSON_RPC_URL = process.env.JSON_RPC_HOST ? 
  `http://${process.env.JSON_RPC_HOST}:${process.env.JSON_RPC_PORT}` :// provided by Forta Scanner in production
  `https://mainnet.infura.io/v3/YOUR_INFURA_PROJECT_ID`
const web3 = new Web3(JSON_RPC_URL)

// report finding if specified account balance falls below threshold
const handleBlock: HandleBlock = async (blockEvent: BlockEvent) => {
  const findings: Finding[] = []

  const accountBalance = new BigNumber(await web3.eth.getBalance(ACCOUNT))
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

export default {
  handleBlock
}