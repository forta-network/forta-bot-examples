const BigNumber = require("bignumber.js");
const { Finding, FindingSeverity, FindingType } = require("forta-agent");
const { provideHandleTransaction } = require("./large.transfer.event");
const {
  USDT_ADDRESS,
  ERC20_TRANSFER_EVENT,
  USDT_DECIMALS,
} = require("./constants");

describe("large transfer event agent", () => {
  let handleTransaction;
  const mockAmountThreshold = "100";
  const mockTxEvent = {
    filterLog: jest.fn(),
  };

  beforeAll(() => {
    handleTransaction = provideHandleTransaction(mockAmountThreshold);
  });

  beforeEach(() => {
    mockTxEvent.filterLog.mockReset();
  });

  it("returns empty findings if there are no transfer events", async () => {
    mockTxEvent.filterLog.mockReturnValueOnce([]);

    const findings = await handleTransaction(mockTxEvent);

    expect(findings).toStrictEqual([]);
    expect(mockTxEvent.filterLog).toHaveBeenCalledTimes(1);
    expect(mockTxEvent.filterLog).toHaveBeenCalledWith(
      ERC20_TRANSFER_EVENT,
      USDT_ADDRESS
    );
  });

  it("returns findings if there are large transfer events", async () => {
    const amount = new BigNumber("101");
    const formattedAmount = amount.toFixed(2);
    const mockUsdtTransferEvent = {
      args: {
        from: "0x123",
        to: "0xabc",
        value: amount.multipliedBy(10 ** USDT_DECIMALS),
      },
    };
    mockTxEvent.filterLog.mockReturnValueOnce([mockUsdtTransferEvent]);

    const findings = await handleTransaction(mockTxEvent);

    expect(findings).toStrictEqual([
      Finding.fromObject({
        name: "Large Tether Transfer",
        description: `${formattedAmount} USDT transferred`,
        alertId: "FORTA-7",
        severity: FindingSeverity.Info,
        type: FindingType.Info,
        metadata: {
          from: mockUsdtTransferEvent.args.from,
          to: mockUsdtTransferEvent.args.to,
          amount: formattedAmount,
        },
      }),
    ]);
    expect(mockTxEvent.filterLog).toHaveBeenCalledTimes(1);
    expect(mockTxEvent.filterLog).toHaveBeenCalledWith(
      ERC20_TRANSFER_EVENT,
      USDT_ADDRESS
    );
  });
});
