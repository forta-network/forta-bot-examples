import BigNumber from 'bignumber.js'
import Web3 from "web3"
import { 
  Finding, 
  HandleTransaction, 
  TransactionEvent, 
  FindingSeverity, 
  FindingType 
} from 'forta-agent'

const HIGH_GAS_THRESHOLD = "7000000"
const AAVE_V2_ADDRESS = "0x7d2768de32b0b80b7a3454c06bdac94a69ddc7a9"
const FLASH_LOAN_EVENT_SIGNATURE = "FlashLoan(address,address,address,uint256,uint256,uint16)"
const INTERESTING_PROTOCOLS = ["0xacd43e627e64355f1861cec6d3a6688b31a6f952"]// Yearn Dai vault
const BALANCE_DIFF_THRESHOLD = "200000000000000000000"// 200 eth
const JSON_RPC_URL = process.env.JSON_RPC_HOST ? 
  `http://${process.env.JSON_RPC_HOST}:${process.env.JSON_RPC_PORT}` :// provided by Forta Scanner in production
  `https://mainnet.infura.io/v3/YOUR_INFURA_PROJECT_ID`
const web3 = new Web3(JSON_RPC_URL)

// report finding if detected a flash loan attack on Yearn Dai vault
const handleTransaction: HandleTransaction = async (txEvent: TransactionEvent) => {
  const findings: Finding[] = []
  
  // if gas too low
  if (new BigNumber(txEvent.gasUsed).isLessThan(HIGH_GAS_THRESHOLD)) return findings

  // if aave not involved
  if (!txEvent.addresses[AAVE_V2_ADDRESS]) return findings

  // if no flash loan events found
  if (!txEvent.hasEvent(FLASH_LOAN_EVENT_SIGNATURE)) return findings

  // if does not involve a protocol we are interested in
  const protocolAddress = INTERESTING_PROTOCOLS.find((address) => txEvent.addresses[address])
  if (!protocolAddress) return findings

  // if balance of affected contract address has not changed by threshold
  const { number: blockNumber } = txEvent.block
  const currentBalance = new BigNumber(await web3.eth.getBalance(protocolAddress, blockNumber))
  const previousBalance = new BigNumber(await web3.eth.getBalance(protocolAddress, blockNumber-1))
  const balanceDiff = previousBalance.minus(currentBalance)
  if (balanceDiff.isLessThan(BALANCE_DIFF_THRESHOLD)) return findings

  const flashLoanEvents = txEvent.receipt.logs.filter(
    (log) => log.topics.length && log.topics[0] === web3.utils.keccak256(FLASH_LOAN_EVENT_SIGNATURE)
  );
  findings.push(
    Finding.fromObject({
      name: "Flash Loan with Loss",
      description: `Flash Loan with loss of ${balanceDiff.toString()} detected for ${protocolAddress}`,
      alertId: "FORTA-5",
      protocol: "aave",
      type: FindingType.Suspicious,
      severity: FindingSeverity.High,
      metadata: {
        protocolAddress,
        balanceDiff: balanceDiff.toString(),
        loans: JSON.stringify(flashLoanEvents)
      },
    }
  ))
  return findings
}

export default {
  handleTransaction
}