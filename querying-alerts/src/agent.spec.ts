import {
  HandleAlert,
  createAlertEvent,
  Alert,
  AlertEvent,
  Finding,
  FindingType,
  FindingSeverity,
} from "forta-agent";
import agent from "./agent";
import { BOT_ID, TARGET_CONTRACT } from "./constants";

describe("Assets drained bot", () => {
  let handleAlert: HandleAlert;

  beforeAll(() => {
    handleAlert = agent.handleAlert;
  });

  it("returns empty findings if there're no alerts", async () => {
    const mockAlertEvent: AlertEvent = createAlertEvent({
      alert: Alert.fromObject({}),
    });

    const findings: Finding[] = await handleAlert(mockAlertEvent);
    expect(findings).toStrictEqual([]);
  });

  it("returns empty findings if there are alerts other than ASSET-DRAINED from the target bot", async () => {
    const mockAlertEvent: AlertEvent = createAlertEvent({
      alert: Alert.fromObject({
        source: {
          bot: {
            id: BOT_ID,
          },
        },
        alertId: "OTHER-ALERT",
      }),
    });

    const findings: Finding[] = await handleAlert(mockAlertEvent);
    expect(findings).toStrictEqual([]);
  });

  it("returns finding if there is an ASSET-DRAINED alert from the target bot", async () => {
    const mockAlertEvent: AlertEvent = createAlertEvent({
      alert: Alert.fromObject({
        source: {
          bot: {
            id: BOT_ID,
          },
        },
        alertId: "ASSET-DRAINED",
        metadata: {
          contract: TARGET_CONTRACT,
          blockNumber: "1",
        },
      }),
    });

    const findings: Finding[] = await handleAlert(mockAlertEvent);
    expect(findings).toStrictEqual([
      Finding.fromObject({
        name: "Assets drained",
        description: `Assets drained for contract ${TARGET_CONTRACT}`,
        alertId: "ASSET-DRAINED-1",
        severity: FindingSeverity.High,
        type: FindingType.Suspicious,
        metadata: {
          block: mockAlertEvent.alert.metadata.blockNumber,
        },
      }),
    ]);
  });
});
