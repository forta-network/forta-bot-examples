import BigNumber from 'bignumber.js'
import { Finding, FindingSeverity, FindingType, TransactionEvent } from "forta-agent";
import { COMPOUND_TOKEN_ADDRESS, COMPOUND_RESERVOIR_ADDRESS, DRIP_METHOD_ID, ERC20_TRANSFER_EVENT_SIG } from './constants'

async function handleTransaction(txEvent: TransactionEvent) {
  const findings: Finding[] = []

  // if not calling compound reservoir, return
  if (txEvent.to !== COMPOUND_RESERVOIR_ADDRESS) return findings

  // if not calling drip() method, return
  if (txEvent.transaction.data !== DRIP_METHOD_ID) return findings

  // determine how much COMP dripped using Transfer event
  const [transferCompEvent] = txEvent.filterEvent(ERC20_TRANSFER_EVENT_SIG, COMPOUND_TOKEN_ADDRESS)
  const amountCompDripped = new BigNumber(transferCompEvent.data)

  findings.push(Finding.fromObject({
    name: "Compound Reservoir Dripped",
    description: `drip() was invoked by ${txEvent.from}`,
    alertId: "COMP-2",
    protocol: "compound",
    severity: FindingSeverity.Medium,
    type: FindingType.Suspicious,
    metadata: {
      from: txEvent.from,
      dripAmount: amountCompDripped.toString()
    }
  }))

  return findings
}

export default {
  handleTransaction
}