import { 
  Finding,
  FindingSeverity,
  FindingType,
  HandleTransaction,
  createTransactionEvent
} from "forta-agent"
import agent from "./agent"

describe("blacklisted address agent", () => {
  let handleTransaction: HandleTransaction;

  const createTxEventWithAddresses = (addresses: {[addr: string]: boolean}) => createTransactionEvent({
    transaction: {} as any,
    receipt: {} as any,
    block: {} as any,
    addresses
  })

  beforeAll(() => {
    handleTransaction = agent.handleTransaction
  })

  describe("handleTransaction", () => {
    it("returns empty findings if no blacklisted address is involved", async () => {
      const txEvent = createTxEventWithAddresses({})

      const findings = await handleTransaction(txEvent)

      expect(findings).toStrictEqual([])
    })

    it("returns a finding if a blacklisted address is involved", async () => {
      const address = "0x02788b3452849601e63ca70ce7db72c30c3cfd18";
      const txEvent = createTxEventWithAddresses({ [address]: true })

      const findings = await handleTransaction(txEvent)

      expect(findings).toStrictEqual([
        Finding.fromObject({
          name: "Blacklisted Address",
          description: `Transaction involving a blacklisted address: ${address}`,
          alertId: "FORTA-3",
          type: FindingType.Suspicious,
          severity: FindingSeverity.High,
          metadata: {
            address
          }
        })
      ])
    })
  })
})