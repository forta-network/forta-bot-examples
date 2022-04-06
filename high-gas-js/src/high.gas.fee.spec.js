const BigNumber = require("bignumber.js");
const {
  FindingType,
  FindingSeverity,
  Finding,
  createTransactionEvent,
} = require("forta-agent");
const { provideHandleTransaction } = require("./high.gas.fee");

describe("high gas fee agent", () => {
  let handleTransaction;
  const mockCryptoPriceGetter = {
    getWeiPriceUsd: jest.fn(),
  };

  const createTxEvent = ({ gasPrice }) =>
    createTransactionEvent({
      transaction: { gasPrice },
    });

  beforeAll(() => {
    handleTransaction = provideHandleTransaction(mockCryptoPriceGetter);
  });

  describe("handleTransaction", () => {
    const mockGasUsed = "1"
    const mockGasPrice = "1"
    const txEvent = createTransactionEvent({
      transaction: { gasPrice: mockGasPrice },
    })

    it("returns empty findings if gas fee is below threshold", async () => {
      mockCryptoPriceGetter.getWeiPriceUsd.mockReturnValueOnce("1");

      const findings = await handleTransaction(txEvent, mockGasUsed);

      expect(mockCryptoPriceGetter.getWeiPriceUsd).toHaveBeenCalledTimes(1);
      expect(mockCryptoPriceGetter.getWeiPriceUsd).toHaveBeenCalledWith();
      expect(findings).toStrictEqual([]);
    });

    it("returns a finding if gas fee is above threshold", async () => {
      mockCryptoPriceGetter.getWeiPriceUsd.mockReset();
      const weiPriceUsd = new BigNumber("101");
      mockCryptoPriceGetter.getWeiPriceUsd.mockReturnValueOnce(
        weiPriceUsd.toString()
      );

      const findings = await handleTransaction(txEvent, mockGasUsed);

      expect(findings).toStrictEqual([
        Finding.fromObject({
          name: "High Gas Fee (USD)",
          description: `Gas Fee: $${weiPriceUsd.toFixed(2)}`,
          alertId: "FORTA-2",
          type: FindingType.Suspicious,
          severity: FindingSeverity.Medium,
          metadata: {
            fee: weiPriceUsd.toFixed(2),
          },
        }),
      ]);
    });
  });
});
