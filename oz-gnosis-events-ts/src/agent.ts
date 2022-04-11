import {
  Finding,
  HandleTransaction,
  TransactionEvent,
  FindingSeverity,
  FindingType,
  Initialize,
  ethers,
} from "forta-agent";
import {
  getFileContents,
  getSolidityFiles,
  parseEventsFromFile,
} from "./utils";
import config from "./config.json";

const EVENTS: string[] = [];

const initialize: Initialize = async () => {
  const eventMap: { [signature: string]: string } = {};
  // for each repository specified in config, extract event declarations from smart contracts
  for (const repository of config.repositories) {
    const solidityFiles = await getSolidityFiles(repository);
    const solidityFileContents = await Promise.all(
      solidityFiles.map((file) => getFileContents(repository, file))
    );
    solidityFileContents.forEach((fileContents) => {
      const events = parseEventsFromFile(fileContents);
      events.forEach((event) => {
        // de-dupe events using signature
        const signature = ethers.utils.Fragment.from(event).format();
        if (!eventMap[signature]) {
          eventMap[signature] = event;
        }
      });
    });
  }
  EVENTS.push(...Object.values(eventMap));
};

const handleTransaction: HandleTransaction = async (
  txEvent: TransactionEvent
) => {
  const findings: Finding[] = [];

  // filter the transaction logs for events of interest
  const events = txEvent.filterLog(EVENTS);

  events.forEach((event) => {
    const metadata: { [key: string]: string } = {
      contractAddress: event.address,
    };
    Object.keys(event.args).forEach((key) => {
      // only add string keys from event.args
      if (isNaN(parseInt(key))) {
        metadata[key] = event.args[key].toString();
      }
    });
    findings.push(
      Finding.fromObject({
        name: `${event.name} Event`,
        description: `Detected ${event.name} event`,
        alertId: "OZ-GNOSIS-EVENTS",
        severity: FindingSeverity.Info,
        type: FindingType.Info,
        metadata,
      })
    );
  });

  return findings;
};

export default {
  initialize,
  handleTransaction,
};
