const {
  FindingType,
  FindingSeverity,
  Finding,
  createTransactionEvent,
} = require("forta-agent");
const { provideHandleTransaction } = require("./agent");

describe("high gas agent", () => {
  let handleTransaction;
  const mockTxHash = "0x123";
  const mockGetTransactionReceipt = jest.fn();

  beforeAll(() => {
    handleTransaction = provideHandleTransaction(mockGetTransactionReceipt);
  });

  describe("handleTransaction", () => {
    it("returns empty findings if gas used is below threshold", async () => {
      const txEvent = createTransactionEvent({
        transaction: { hash: mockTxHash },
      });
      mockGetTransactionReceipt.mockReturnValueOnce({ gasUsed: "1" });

      const findings = await handleTransaction(txEvent);

      expect(findings).toStrictEqual([]);
    });

    it("returns a finding if gas used is above threshold", async () => {
      const txEvent = createTransactionEvent({
        transaction: { hash: mockTxHash },
      });
      mockGetTransactionReceipt.mockReturnValueOnce({ gasUsed: "1000001" });

      const findings = await handleTransaction(txEvent);

      expect(findings).toStrictEqual([
        Finding.fromObject({
          name: "High Gas Used",
          description: `Gas Used: 1000001`,
          alertId: "FORTA-1",
          type: FindingType.Suspicious,
          severity: FindingSeverity.Medium,
        }),
      ]);
    });
  });
});
