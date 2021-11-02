import BigNumber from 'bignumber.js'
import { 
  Finding, 
  HandleTransaction, 
  TransactionEvent, 
  FindingSeverity, 
  FindingType,
  getEthersProvider,
  ethers
} from 'forta-agent'

const HIGH_GAS_THRESHOLD = "7000000"
const AAVE_V2_ADDRESS = "0x7d2768de32b0b80b7a3454c06bdac94a69ddc7a9"
const FLASH_LOAN_EVENT = "event FlashLoan(address indexed target, address indexed initiator, address indexed asset, uint256 amount, uint256 premium, uint16 referralCode)"
const INTERESTING_PROTOCOLS = ["0xacd43e627e64355f1861cec6d3a6688b31a6f952"]// Yearn Dai vault
const BALANCE_DIFF_THRESHOLD = "200000000000000000000"// 200 eth

const ethersProvider = getEthersProvider()

function provideHandleTransaction(
  ethersProvider: ethers.providers.JsonRpcProvider
): HandleTransaction {
  return async function handleTransaction(txEvent: TransactionEvent) {
    // report finding if detected a flash loan attack on Yearn Dai vault
    const findings: Finding[] = []
    
    // if gas too low
    if (new BigNumber(txEvent.gasUsed).isLessThan(HIGH_GAS_THRESHOLD)) return findings
  
    // if aave not involved
    if (!txEvent.addresses[AAVE_V2_ADDRESS]) return findings
  
    // if no flash loan events found
    const flashLoanEvents = txEvent.filterLog(FLASH_LOAN_EVENT)
    if (!flashLoanEvents.length) return findings
  
    // if does not involve a protocol we are interested in
    const protocolAddress = INTERESTING_PROTOCOLS.find((address) => txEvent.addresses[address])
    if (!protocolAddress) return findings
  
    // if balance of affected contract address has not changed by threshold
    const blockNumber = txEvent.blockNumber
    const currentBalance = new BigNumber((await ethersProvider.getBalance(protocolAddress, blockNumber)).toString())
    const previousBalance = new BigNumber((await ethersProvider.getBalance(protocolAddress, blockNumber-1)).toString())
    const balanceDiff = previousBalance.minus(currentBalance)
    if (balanceDiff.isLessThan(BALANCE_DIFF_THRESHOLD)) return findings
  
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
}

export default {
  provideHandleTransaction,
  handleTransaction: provideHandleTransaction(ethersProvider)
}