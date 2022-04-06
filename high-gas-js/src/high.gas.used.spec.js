const {
  FindingType,
  FindingSeverity,
  Finding,
  createTransactionEvent,
} = require("forta-agent");
const { handleTransaction } = require("./high.gas.used");

describe("high gas used agent", () => {
  describe("handleTransaction", () => {
    it("returns empty findings if gas used is below threshold", async () => {
      const txEvent = createTransactionEvent({})

      const findings = await handleTransaction(txEvent, "1");

      expect(findings).toStrictEqual([]);
    });

    it("returns a finding if gas used is above threshold", async () => {
      const mockGasUsed = "1000001"
      const txEvent = createTransactionEvent({})

      const findings = await handleTransaction(txEvent, mockGasUsed);

      expect(findings).toStrictEqual([
        Finding.fromObject({
          name: "High Gas Used",
          description: `Gas Used: ${mockGasUsed}`,
          alertId: "FORTA-1",
          type: FindingType.Suspicious,
          severity: FindingSeverity.Medium,
          metadata: {
            gasUsed: mockGasUsed,
          },
        }),
      ]);
    });
  });
});
