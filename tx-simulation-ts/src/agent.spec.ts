import { Finding, FindingSeverity, FindingType, HandleBlock } from "forta-agent"
import { provideHandleBlock, USER_ADDRESS, USER2_ADDRESS } from "./agent"

describe("Transaction simulation agent", () => {
  let handleBlock: HandleBlock
  const mockGetEthersForkProvider = jest.fn()
  const mockGetTetherContract = jest.fn()
  const mockBlock = {
    blockNumber: 1234
  } as any
  const mockEthersForkProvider = {}
  const mockTetherContract = {
    balanceOf: jest.fn(),
    transfer: jest.fn()
  }
  const mockUserBalance = 10
  const mockTransferTx = {
    wait: jest.fn()
  }

  const resetMocks = () => {
    mockGetEthersForkProvider.mockReset()
    mockGetTetherContract.mockReset()
    mockTetherContract.balanceOf.mockReset()
    mockTetherContract.transfer.mockReset()
  }

  beforeEach(() => {
    resetMocks()
    mockGetEthersForkProvider.mockReturnValue(mockEthersForkProvider)
    mockGetTetherContract.mockReturnValue(mockTetherContract)
    mockTetherContract.balanceOf.mockReturnValue(mockUserBalance)
    mockTetherContract.transfer.mockReturnValue(mockTransferTx)
  })

  beforeAll(() => {
    handleBlock = provideHandleBlock(mockGetEthersForkProvider, mockGetTetherContract)
  })

  it("returns empty findings if transaction succeeds", async () => {
    const findings = await handleBlock(mockBlock)

    expect(findings).toEqual([])
  })

  it("returns a finding if transaction fails", async () => {
    mockTransferTx.wait.mockRejectedValue(undefined)

    const findings = await handleBlock(mockBlock)

    expect(findings).toStrictEqual([Finding.fromObject({
      name: "Failed transfer",
      description: "Failed to make ERC-20 transfer",
      alertId: "FORTA-9",
      severity: FindingSeverity.Info,
      type: FindingType.Info,
      metadata: {
        from: USER_ADDRESS,
        to: USER2_ADDRESS,
        amount: mockUserBalance.toString(),
      },
    })])
  })
})