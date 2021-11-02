import BigNumber from 'bignumber.js'
import { Finding, TransactionEvent, FindingSeverity, FindingType, getEthersProvider, ethers } from 'forta-agent'
import { 
  COMPOUND_TOKEN_ADDRESS, 
  COMPOUND_COMPTROLLER_ADDRESS, 
  COMPTROLLER_ABI, 
  DISTRIBUTED_SUPPLIER_COMP_EVENT, 
  DISTRIBUTED_BORROWER_COMP_EVENT, 
  ERC20_TRANSFER_EVENT 
} from './constants'

const ethersProvider = getEthersProvider()
const compoundComptrollerContract = new ethers.Contract(COMPOUND_COMPTROLLER_ADDRESS, COMPTROLLER_ABI, ethersProvider)

async function handleTransaction(txEvent: TransactionEvent) {
  const findings: Finding[] = []

  // if not calling compound comptroller, return
  if (txEvent.to !== COMPOUND_COMPTROLLER_ADDRESS) return findings

  // if no events found for distributing COMP, return
  const compDistributedEvents = txEvent.filterLog(
    [ DISTRIBUTED_SUPPLIER_COMP_EVENT, DISTRIBUTED_BORROWER_COMP_EVENT ], 
    COMPOUND_COMPTROLLER_ADDRESS
  )
  if (!compDistributedEvents.length) return findings

  // determine how much COMP distributed using Transfer event
  const [transferCompEvent] = txEvent.filterLog(ERC20_TRANSFER_EVENT, COMPOUND_TOKEN_ADDRESS)
  const amountCompDistributed = new BigNumber(transferCompEvent.args.value.toString())

  // determine Comptroller.compAccrued() in previous block
  const blockNumber = txEvent.blockNumber
  const prevBlockCompAccrued = await compoundComptrollerContract.compAccrued(txEvent.from, { blockTag: blockNumber-1 })

  // calculate ratio of accrued to distributed COMP
  const accruedToDistributedRatio = amountCompDistributed.dividedBy(prevBlockCompAccrued.toString())
  if (accruedToDistributedRatio.isGreaterThan(2)) {
    findings.push(Finding.fromObject({
      name: "Unusual COMP Distribution",
      description: `Distributed ${accruedToDistributedRatio.toFixed(0)}x more COMP to ${txEvent.from} than expected`,
      alertId: "COMP-1",
      protocol: "compound",
      severity: FindingSeverity.High,
      type: FindingType.Suspicious,
      metadata: {
        compDistributed: amountCompDistributed.toString(),
        compAccrued: prevBlockCompAccrued.toString(),
        receiver: txEvent.from
      }
    }))
  }

  return findings
}

export default {
  handleTransaction,
}