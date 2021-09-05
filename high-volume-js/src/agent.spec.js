const {
  FindingType,
  FindingSeverity,
  Finding,
  createTransactionEvent,
} = require("forta-agent");
const { provideHandleTransaction } = require("./agent");

describe("high volume agent", () => {
  let handleTransaction;
  const mockTxCounter = {
    increment: jest.fn(),
    getTransactions: jest.fn(),
  };

  const createTxEvent = ({ from, hash, timestamp }) =>
    createTransactionEvent({
      transaction: { from, hash },
      block: { timestamp },
    });

  beforeAll(() => {
    handleTransaction = provideHandleTransaction(mockTxCounter);
  });

  describe("handleTransaction", () => {
    const txEvent = createTxEvent({ from: "0x1", hash: "0xa", timestamp: 100 });

    it("returns empty findings if volume is below threshold", async () => {
      mockTxCounter.increment.mockReturnValueOnce(1);

      const findings = await handleTransaction(txEvent);

      expect(mockTxCounter.increment).toHaveBeenCalledTimes(1);
      expect(mockTxCounter.increment).toHaveBeenCalledWith(
        txEvent.from,
        txEvent.hash,
        txEvent.timestamp
      );
      expect(findings).toStrictEqual([]);
    });

    it("returns a finding if volume is above threshold", async () => {
      mockTxCounter.increment.mockReset();
      mockTxCounter.increment.mockReturnValueOnce(11);
      const transactions = [
        { txHash: txEvent.hash, timestamp: txEvent.timestamp },
      ];
      mockTxCounter.getTransactions.mockReturnValueOnce(transactions);

      const findings = await handleTransaction(txEvent);

      expect(mockTxCounter.increment).toHaveBeenCalledTimes(1);
      expect(mockTxCounter.increment).toHaveBeenCalledWith(
        txEvent.from,
        txEvent.hash,
        txEvent.timestamp
      );
      expect(mockTxCounter.getTransactions).toHaveBeenCalledTimes(1);
      expect(mockTxCounter.getTransactions).toHaveBeenCalledWith(txEvent.from);
      expect(findings).toStrictEqual([
        Finding.fromObject({
          name: "High Transaction Volume",
          description: `High transaction volume (11) from ${txEvent.from}`,
          alertId: "FORTA-4",
          type: FindingType.Suspicious,
          severity: FindingSeverity.Medium,
          metadata: {
            from: txEvent.from,
            transactions: JSON.stringify(transactions),
          },
        }),
      ]);
    });
  });
});
