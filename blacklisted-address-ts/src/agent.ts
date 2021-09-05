import { 
  Finding, 
  HandleTransaction, 
  TransactionEvent, 
  FindingSeverity, 
  FindingType 
} from 'forta-agent'

const BLACKLIST: { [address: string] : boolean } = {
  "0x02788b3452849601e63ca70ce7db72c30c3cfd18": true,
  "0x499875b33e55c36a80d544e7ba3ca96cb52b1361": true,
  "0x2f0830b9cc296e5baef35381a78e77f42a1fe4ad": true
}

// report finding if any addresses involved in transaction are blacklisted
const handleTransaction: HandleTransaction = async (txEvent: TransactionEvent) => {
  const findings: Finding[] = []

  const blacklistedAddress = Object.keys(txEvent.addresses).find(address => BLACKLIST[address])
  if (!blacklistedAddress) return findings

  findings.push(
    Finding.fromObject({
      name: "Blacklisted Address",
      description: `Transaction involving a blacklisted address: ${blacklistedAddress}`,
      alertId: "FORTA-3",
      type: FindingType.Suspicious,
      severity: FindingSeverity.High,
      metadata: {
        address: blacklistedAddress
      }
    }
  ))
  return findings
}

export default {
  handleTransaction
}