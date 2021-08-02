import { BlockEvent, EventType, Finding, FindingSeverity, FindingType, HandleBlock, Network } from "forta-agent"
import agent, { ACCOUNT, MIN_BALANCE } from "."

describe("minimum balance agent", () => {
  let handleBlock: HandleBlock;
  const mockWeb3 = {
    eth : {
      getBalance: jest.fn()
    }
  } as any

  beforeAll(() => {
    handleBlock = agent.provideHandleBlock(mockWeb3)
  })

  describe("handleBlock", () => {
    const blockEvent = new BlockEvent(EventType.BLOCK, Network.MAINNET, "0xa", 1)

    it("returns empty findings if balance is above threshold", async () => {
      mockWeb3.eth.getBalance.mockReturnValueOnce("500000000000000001")

      const findings = await handleBlock(blockEvent)

      expect(mockWeb3.eth.getBalance).toHaveBeenCalledTimes(1)
      expect(mockWeb3.eth.getBalance).toHaveBeenCalledWith(ACCOUNT)
      expect(findings).toStrictEqual([])
    })

    it("returns a finding if balance is below threshold", async () => {
      const balance = "400000000000000000"
      mockWeb3.eth.getBalance.mockReset()
      mockWeb3.eth.getBalance.mockReturnValueOnce(balance)

      const findings = await handleBlock(blockEvent)

      expect(mockWeb3.eth.getBalance).toHaveBeenCalledTimes(1)
      expect(mockWeb3.eth.getBalance).toHaveBeenCalledWith(ACCOUNT)
      expect(findings).toStrictEqual([
        Finding.fromObject({
          name: "Minimum Account Balance",
          description: `Account balance (${balance}) below threshold (${MIN_BALANCE})`,
          alertId: "FORTA-6",
          severity: FindingSeverity.Info,
          type: FindingType.Suspicious,
          metadata: {
            balance
          }
        })
      ])
    })
  })
})