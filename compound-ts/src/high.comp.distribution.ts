import BigNumber from 'bignumber.js'
import Web3 from 'web3'
import { AbiItem } from 'web3-utils';
import { Finding, TransactionEvent, FindingSeverity, FindingType, getJsonRpcUrl } from 'forta-agent'
import { COMPOUND_TOKEN_ADDRESS, COMPOUND_COMPTROLLER_ADDRESS, COMPTROLLER_ABI, DISTRIBUTED_SUPPLIER_COMP_EVENT_SIG, DISTRIBUTED_BORROWER_COMP_EVENT_SIG, ERC20_TRANSFER_EVENT_SIG } from './constants'

const web3 = new Web3(getJsonRpcUrl())
const compoundComptrollerContract = new web3.eth.Contract(COMPTROLLER_ABI as AbiItem[], COMPOUND_COMPTROLLER_ADDRESS)

async function handleTransaction(txEvent: TransactionEvent) {
  const findings: Finding[] = []

  // if not calling compound comptroller, return
  if (txEvent.to !== COMPOUND_COMPTROLLER_ADDRESS) return findings

  // if no events found for distributing COMP, return
  const compDistributedEvents = txEvent.filterEvent(DISTRIBUTED_SUPPLIER_COMP_EVENT_SIG, COMPOUND_COMPTROLLER_ADDRESS)
                                .concat(txEvent.filterEvent(DISTRIBUTED_BORROWER_COMP_EVENT_SIG, COMPOUND_COMPTROLLER_ADDRESS))
  if (!compDistributedEvents.length) return findings

  // determine how much COMP distributed using Transfer event
  const [transferCompEvent] = txEvent.filterEvent(ERC20_TRANSFER_EVENT_SIG, COMPOUND_TOKEN_ADDRESS)
  const amountCompDistributed = new BigNumber(transferCompEvent.data)

  // determine Comptroller.compAccrued() in previous block
  const blockNumber = txEvent.blockNumber
  const prevBlockCompAccrued = await compoundComptrollerContract.methods.compAccrued(txEvent.from).call({}, blockNumber-1)

  // calculate ratio of accrued to distributed COMP
  const accruedToDistributedRatio = amountCompDistributed.dividedBy(prevBlockCompAccrued)
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