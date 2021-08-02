const {
  TransactionEvent,
  FindingType,
  FindingSeverity,
  Finding,
} = require("forta-agent");
const { handleTransaction } = require("./high.gas.used");

describe("high gas agent", () => {
  const createTxEvent = ({ gasUsed }) => {
    const receipt = {
      gasUsed,
    };
    return new TransactionEvent(null, null, null, receipt, [], {}, null);
  };

  describe("handleTransaction", () => {
    it("returns empty findings if gas used is below threshold", async () => {
      const txEvent = createTxEvent({
        gasUsed: "1",
      });

      const findings = await handleTransaction(txEvent);

      expect(findings).toStrictEqual([]);
    });

    it("returns a finding if gas used is above threshold", async () => {
      const txEvent = createTxEvent({
        gasUsed: "1000001",
      });

      const findings = await handleTransaction(txEvent);

      expect(findings).toStrictEqual([
        Finding.fromObject({
          name: "High Gas Used",
          description: `Gas Used: ${txEvent.gasUsed}`,
          alertId: "FORTA-1",
          type: FindingType.Suspicious,
          severity: FindingSeverity.Medium,
          metadata: {
            gasUsed: txEvent.gasUsed,
          },
        }),
      ]);
    });
  });
});
