import { 
  EventType,
  Finding,
  FindingSeverity,
  FindingType,
  HandleTransaction,
  Network,
  TransactionEvent 
} from "forta-agent"
import agent from "."

describe("blacklisted address agent", () => {
  let handleTransaction: HandleTransaction;
  const createTxEvent = ({ addresses }: any) => {
    const tx = { } as any
    const receipt = { } as any
    const block = {} as any
    const addressez = { ...addresses } as any
    return new TransactionEvent(EventType.BLOCK, Network.MAINNET, tx, receipt, [], addressez, block)
  };

  beforeAll(() => {
    handleTransaction = agent.handleTransaction
  })

  describe("handleTransaction", () => {
    it("returns empty findings if no blacklisted address is involved", async () => {
      const txEvent = createTxEvent({ addresses: {} })

      const findings = await handleTransaction(txEvent)

      expect(findings).toStrictEqual([])
    })

    it("returns a finding if a blacklisted address is involved", async () => {
      const address = "0x02788b3452849601e63ca70ce7db72c30c3cfd18";
      const txEvent = createTxEvent({ addresses: { [address]: true }})

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