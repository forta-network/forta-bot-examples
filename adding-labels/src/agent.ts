import {
  Finding,
  HandleTransaction,
  TransactionEvent,
  FindingSeverity,
  FindingType,
  EntityType,
} from "forta-agent";

import {
  ERC20_TRANSFER_EVENT,
  TETHER_ADDRESS,
  TETHER_DECIMALS,
} from "./constants";
let findingsCount = 0;

const handleTransaction: HandleTransaction = async (
  txEvent: TransactionEvent
) => {
  const findings: Finding[] = [];

  // limiting this agent to emit only 5 findings so that the alert feed is not spammed
  if (findingsCount >= 5) return findings;

  // filter the transaction logs for Tether transfer events
  const tetherTransferEvents = txEvent.filterLog(
    ERC20_TRANSFER_EVENT,
    TETHER_ADDRESS
  );

  tetherTransferEvents.forEach((transferEvent) => {
    // extract transfer event arguments
    const { to, from, value } = transferEvent.args;
    // shift decimals of transfer value
    const normalizedValue = value.div(10 ** TETHER_DECIMALS);

    // if more than 10,000 Tether were transferred, report it
    if (normalizedValue.gt(10000)) {
      findings.push(
        Finding.fromObject({
          name: "High Tether Transfer",
          description: `High amount of USDT transferred: ${normalizedValue}`,
          alertId: "FORTA-1",
          severity: FindingSeverity.High,
          type: FindingType.Suspicious,
          metadata: {
            from,
            to,
          },
          labels: [
            {
              entity: from,
              entityType: EntityType.Address,
              label: "attacker",
              confidence: 0.6,
              metadata: {},
              remove: false,
            },
          ],
        })
      );
      findingsCount++;
    }
  });

  return findings;
};

export default {
  handleTransaction,
};
