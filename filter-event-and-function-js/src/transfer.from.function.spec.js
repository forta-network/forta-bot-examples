const BigNumber = require("bignumber.js");
const { Finding, FindingSeverity, FindingType } = require("forta-agent");
const { provideHandleTransaction } = require("./transfer.from.function");
const {
  USDT_ADDRESS,
  ERC20_TRANSFER_FROM_FUNCTION,
  USDT_DECIMALS,
} = require("./constants");

describe("transferFrom function agent", () => {
  let handleTransaction;
  const mockTxEvent = {
    filterFunction: jest.fn(),
  };

  beforeAll(() => {
    handleTransaction = provideHandleTransaction();
  });

  beforeEach(() => {
    mockTxEvent.filterFunction.mockReset();
  });

  it("returns empty findings if there are no function calls", async () => {
    mockTxEvent.filterFunction.mockReturnValueOnce([]);

    const findings = await handleTransaction(mockTxEvent);

    expect(findings).toStrictEqual([]);
    expect(mockTxEvent.filterFunction).toHaveBeenCalledTimes(1);
    expect(mockTxEvent.filterFunction).toHaveBeenCalledWith(
      ERC20_TRANSFER_FROM_FUNCTION,
      USDT_ADDRESS
    );
  });

  it("returns findings if there are transerFrom function calls", async () => {
    const amount = new BigNumber("10");
    const formattedAmount = amount.toFixed(2);
    const mockUsdtTransferFromFunction = {
      args: {
        from: "0x123",
        to: "0xabc",
        value: amount.multipliedBy(10 ** USDT_DECIMALS),
      },
    };
    mockTxEvent.from = "0x456";
    mockTxEvent.filterFunction.mockReturnValueOnce([
      mockUsdtTransferFromFunction,
    ]);

    const findings = await handleTransaction(mockTxEvent);

    expect(findings).toStrictEqual([
      Finding.fromObject({
        name: "Tether Delegate Transfer",
        description: `${formattedAmount} USDT transferred`,
        alertId: "FORTA-8",
        severity: FindingSeverity.Info,
        type: FindingType.Info,
        metadata: {
          by: mockTxEvent.from,
          from: mockUsdtTransferFromFunction.args.from,
          to: mockUsdtTransferFromFunction.args.to,
          amount: formattedAmount,
        },
      }),
    ]);
    expect(mockTxEvent.filterFunction).toHaveBeenCalledTimes(1);
    expect(mockTxEvent.filterFunction).toHaveBeenCalledWith(
      ERC20_TRANSFER_FROM_FUNCTION,
      USDT_ADDRESS
    );
  });
});
