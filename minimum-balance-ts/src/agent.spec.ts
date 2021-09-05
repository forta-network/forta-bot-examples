import { Finding, FindingSeverity, FindingType, HandleBlock, createBlockEvent } from "forta-agent"
import agent, { ACCOUNT, MIN_BALANCE } from "./agent"

describe("minimum balance agent", () => {
  let handleBlock: HandleBlock;
  const mockWeb3 = {
    eth : {
      getBalance: jest.fn()
    }
  } as any

  const blockEvent = createBlockEvent({
    blockHash: "0xa",
    blockNumber: 1,
    block: {} as any
  })

  beforeAll(() => {
    handleBlock = agent.provideHandleBlock(mockWeb3)
  })

  describe("handleBlock", () => {
    it("returns empty findings if balance is above threshold", async () => {
      mockWeb3.eth.getBalance.mockReturnValueOnce("500000000000000001")

      const findings = await handleBlock(blockEvent)

      expect(mockWeb3.eth.getBalance).toHaveBeenCalledTimes(1)
      expect(mockWeb3.eth.getBalance).toHaveBeenCalledWith(ACCOUNT, blockEvent.blockNumber)
      expect(findings).toStrictEqual([])
    })

    it("returns a finding if balance is below threshold", async () => {
      const balance = "400000000000000000"
      mockWeb3.eth.getBalance.mockReset()
      mockWeb3.eth.getBalance.mockReturnValueOnce(balance)

      const findings = await handleBlock(blockEvent)

      expect(mockWeb3.eth.getBalance).toHaveBeenCalledTimes(1)
      expect(mockWeb3.eth.getBalance).toHaveBeenCalledWith(ACCOUNT, blockEvent.blockNumber)
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