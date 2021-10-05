import { HandleTransaction, TransactionEvent } from 'forta-agent'
import highCompDistributionAgent from './high.comp.distribution'
import dripInvokedAgent from './drip.invoked'

type Agent = {
  handleTransaction: HandleTransaction,
}

function provideHandleTransaction(
  highCompDistributionAgent: Agent,
  dripInvokedAgent: Agent,
): HandleTransaction {

  return async function handleTransaction(txEvent: TransactionEvent) {
    const findings = (await Promise.all([
      highCompDistributionAgent.handleTransaction(txEvent),
      dripInvokedAgent.handleTransaction(txEvent)
    ])).flat()

    return findings
  }
}

export default {
  handleTransaction: provideHandleTransaction(highCompDistributionAgent, dripInvokedAgent),
}