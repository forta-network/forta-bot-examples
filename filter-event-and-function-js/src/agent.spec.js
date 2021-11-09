const { provideHandleTransaction } = require("./agent");

describe("Tether transfer agent", () => {
  let handleTransaction;
  const mockLargeTransferEventAgent = {
    handleTransaction: jest.fn(),
  };
  const mockTransferFromFunctionAgent = {
    handleTransaction: jest.fn(),
  };
  const mockTxEvent = {
    some: "event",
  };

  beforeAll(() => {
    handleTransaction = provideHandleTransaction(
      mockLargeTransferEventAgent,
      mockTransferFromFunctionAgent
    );
  });

  it("invokes largeTransferEventAgent and transferFromFunctionAgent and returns their findings", async () => {
    const mockFinding = { some: "finding" };
    mockLargeTransferEventAgent.handleTransaction.mockReturnValueOnce([
      mockFinding,
    ]);
    mockTransferFromFunctionAgent.handleTransaction.mockReturnValueOnce([
      mockFinding,
    ]);

    const findings = await handleTransaction(mockTxEvent);

    expect(findings).toStrictEqual([mockFinding, mockFinding]);
    expect(mockLargeTransferEventAgent.handleTransaction).toHaveBeenCalledTimes(
      1
    );
    expect(mockLargeTransferEventAgent.handleTransaction).toHaveBeenCalledWith(
      mockTxEvent
    );
    expect(
      mockTransferFromFunctionAgent.handleTransaction
    ).toHaveBeenCalledTimes(1);
    expect(
      mockTransferFromFunctionAgent.handleTransaction
    ).toHaveBeenCalledWith(mockTxEvent);
  });
});
