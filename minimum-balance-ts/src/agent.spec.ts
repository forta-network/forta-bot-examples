import { Finding, FindingSeverity, FindingType, HandleBlock, createBlockEvent } from "forta-agent"
import agent, { ACCOUNT, MIN_BALANCE } from "./agent"

describe("minimum balance agent", () => {
  let handleBlock: HandleBlock;
  const mockEthersProvider = {
    getBalance: jest.fn()
  } as any

  const blockEvent = createBlockEvent({
    block: { hash: "0xa", number: 1} as any
  })

  beforeAll(() => {
    handleBlock = agent.provideHandleBlock(mockEthersProvider)
  })

  describe("handleBlock", () => {
    it("returns empty findings if balance is above threshold", async () => {
      mockEthersProvider.getBalance.mockReturnValueOnce("500000000000000001")

      const findings = await handleBlock(blockEvent)

      expect(mockEthersProvider.getBalance).toHaveBeenCalledTimes(1)
      expect(mockEthersProvider.getBalance).toHaveBeenCalledWith(ACCOUNT, blockEvent.blockNumber)
      expect(findings).toStrictEqual([])
    })

    it("returns a finding if balance is below threshold", async () => {
      const balance = "400000000000000000"
      mockEthersProvider.getBalance.mockReset()
      mockEthersProvider.getBalance.mockReturnValueOnce(balance)

      const findings = await handleBlock(blockEvent)

      expect(mockEthersProvider.getBalance).toHaveBeenCalledTimes(1)
      expect(mockEthersProvider.getBalance).toHaveBeenCalledWith(ACCOUNT, blockEvent.blockNumber)
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