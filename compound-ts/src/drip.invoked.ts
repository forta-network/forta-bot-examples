import BigNumber from 'bignumber.js'
import { Finding, FindingSeverity, FindingType, TransactionEvent } from "forta-agent";
import { COMPOUND_TOKEN_ADDRESS, COMPOUND_RESERVOIR_ADDRESS, ERC20_TRANSFER_EVENT } from './constants'

async function handleTransaction(txEvent: TransactionEvent) {
  const findings: Finding[] = []

  // if not calling drip() function on Compound Reservoir contract, return
  const dripFunctionCalls = txEvent.filterFunction("function drip()", COMPOUND_RESERVOIR_ADDRESS)
  if (!dripFunctionCalls.length) return findings

  // determine how much COMP dripped using Transfer event
  const [transferCompEvent] = txEvent.filterLog(ERC20_TRANSFER_EVENT, COMPOUND_TOKEN_ADDRESS)
  const amountCompDripped = new BigNumber(transferCompEvent.args.value.toString())

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