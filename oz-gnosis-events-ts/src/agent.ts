import {
  Finding,
  HandleTransaction,
  TransactionEvent,
  FindingSeverity,
  FindingType,
  Initialize,
  ethers,
  getEthersProvider,
  Log,
  keccak256,
} from "forta-agent";
import { getAllAbis } from "./utils";

let chainId = -1;
let maxDuration = 0;
let maxDurationFindings = 0;
let totalDuration = 0;
let totalFilterDuration = 0;
let totalProcessingDuration = 0;
let totalTxs = 0;
let totalFindings = 0;
let totalLogs = 0;
let greaterThan500ms = 0;
let greaterThan1000ms = 0;
let detailedMetrics: any[] = [];
let lastPrintTimestamp = Date.now();
const PRINT_METRICS_FREQUENCY_MS = 5 * 60 * 1000;

let EVENT_TOPIC_TO_FRAGMENT: { [topic: string]: ethers.utils.EventFragment[] } =
  {};
type InputsMetadata = {
  indexed: Array<ethers.utils.ParamType>;
  nonIndexed: Array<ethers.utils.ParamType>;
  dynamic: Array<boolean>;
};
let FRAGMENT_TO_INPUTS_METADATA = new Map<
  ethers.utils.Fragment,
  InputsMetadata
>();
let abiCoder = new ethers.utils.AbiCoder();

const initialize: Initialize = async () => {
  const eventMap: { [signature: string]: boolean } = {};
  try {
    // chainId = (await getEthersProvider().getNetwork()).chainId;
    const abis = getAllAbis();
    for (const abi of abis) {
      const eventSignatureToFragmentMap = abi.events;
      for (const signature of Object.keys(eventSignatureToFragmentMap)) {
        // de-dupe events using signature
        const fragment = eventSignatureToFragmentMap[signature];
        const topic = keccak256(signature);
        if (!eventMap[signature]) {
          eventMap[signature] = true;
          EVENT_TOPIC_TO_FRAGMENT[topic] = [fragment];
          processInputsMetadata(fragment);
        } else {
          // handle the case where event signature is same, but its a valid different event (only required for Transfer and Approval events)
          // i.e. ERC-20 Transfer vs ERC-721 Transfer have same signature but the last argument is indexed only for ERC-721
          const originalFragment = EVENT_TOPIC_TO_FRAGMENT[topic][0];
          let sameArgsIndexed = true;
          fragment.inputs.forEach((input, index) => {
            if (originalFragment.inputs[index].indexed != input.indexed) {
              sameArgsIndexed = false;
            }
          });
          if (!sameArgsIndexed) {
            // erc-721 events have all arguments indexed
            const isErc721Event = fragment.inputs.every(
              (input) => input.indexed
            );
            // keep erc20 fragments at position 0 as perf optimization
            if (isErc721Event) {
              EVENT_TOPIC_TO_FRAGMENT[topic].push(fragment);
            } else {
              EVENT_TOPIC_TO_FRAGMENT[topic][0] = fragment;
              EVENT_TOPIC_TO_FRAGMENT[topic][1] = originalFragment;
            }
            processInputsMetadata(fragment);
          }
        }
      }
    }
  } catch (e: any) {
    console.log("error during initialization:", e.message);
    console.log("exiting process...");
    process.exit();
  }
};

const handleTransaction: HandleTransaction = async (
  txEvent: TransactionEvent
) => {
  const findings: Finding[] = [];

  try {
    // const start = Date.now();

    // filter the transaction logs for events of interest
    const events = filterLog(txEvent.logs);
    // const filterStop = Date.now();

    events.forEach((event) => {
      const metadata: { [key: string]: string } = {
        contractAddress: event.address,
      };
      Object.keys(event.args).forEach((key) => {
        // only add string keys from event.args
        metadata[key] = event.args[key].toString();
      });
      // special case where we want to decode event parameter and include it in metadata
      if (event.name === "SafeMultiSigTransaction") {
        const data = metadata["additionalInfo"];
        const nonce = ethers.utils.defaultAbiCoder
          .decode(["uint256", "address", "uint256"], data)[0]
          .toString();
        metadata["nonce"] = nonce;
      }
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

    // collectMetrics(start, filterStop, findings.length, txEvent.logs.length);
  } catch (e: any) {
    console.log(`error processing tx ${txEvent.hash}:`, e.message);
  }

  return findings;
};

function collectMetrics(
  startTime: number,
  filterStop: number,
  findingsLength: number,
  logsLength: number
) {
  const now = Date.now();
  const duration = now - startTime;
  const filterDuration = filterStop - startTime;
  const processingDuration = now - filterStop;
  if (duration > maxDuration) {
    maxDuration = duration;
    maxDurationFindings = findingsLength;
  }
  if (duration > 1000) {
    greaterThan1000ms += 1;
  } else if (duration > 500) {
    greaterThan500ms += 1;
  }
  totalDuration += duration;
  totalFilterDuration += filterDuration;
  totalProcessingDuration += processingDuration;
  totalTxs += 1;
  totalFindings += findingsLength;
  totalLogs += logsLength;

  if (duration > 500) {
    detailedMetrics.push({
      duration,
      filterDuration,
      processingDuration,
      findingsLength,
      logsLength,
    });
  }

  if (now - lastPrintTimestamp > PRINT_METRICS_FREQUENCY_MS) {
    printMetrics();
    lastPrintTimestamp = now;
  }
}

function printMetrics() {
  console.log("**************************");
  console.log("chainId=", chainId);
  console.log("maxDuration=", maxDuration);
  console.log("maxDurationFindings=", maxDurationFindings);
  console.log("avgDuration=", totalDuration / totalTxs);
  console.log("avgFilterDuration=", totalFilterDuration / totalTxs);
  console.log("avgProcessingDuration=", totalProcessingDuration / totalTxs);
  console.log("avgFindings=", totalFindings / totalTxs);
  console.log("avgLogs=", totalLogs / totalTxs);
  console.log("totalTxs=", totalTxs);
  console.log("greaterThan500ms=", greaterThan500ms);
  console.log("greaterThan1000ms=", greaterThan1000ms);
  console.log("detailedMetrics=", JSON.stringify(detailedMetrics));
  console.log("**************************");

  // reset counters
  maxDuration = 0;
  maxDurationFindings = 0;
  totalDuration = 0;
  totalFilterDuration = 0;
  totalTxs = 0;
  totalFindings = 0;
  totalLogs = 0;
  greaterThan500ms = 0;
  greaterThan1000ms = 0;
  detailedMetrics = [];
}

function filterLog(logs: Log[]) {
  const results: any[] = [];
  for (const log of logs) {
    const fragments = EVENT_TOPIC_TO_FRAGMENT[log.topics[0]];
    if (!fragments) continue;

    try {
      // if more than one fragment, figure out if event is erc20 vs erc721 (erc721 will have 4 topics for Transfer/Approval)
      let fragment = fragments[0];
      if (fragments.length > 1 && log.topics.length === 4) {
        fragment = fragments[1];
      }

      results.push({
        name: fragment.name,
        address: log.address,
        args: decodeEventLog(fragment, log.data, log.topics),
      });
    } catch (e) {
      console.log("error decoding log", e);
    }
  }
  return results;
}

function processInputsMetadata(eventFragment: ethers.utils.EventFragment) {
  let indexed: Array<ethers.utils.ParamType> = [];
  let nonIndexed: Array<ethers.utils.ParamType> = [];
  let dynamic: Array<boolean> = [];

  eventFragment.inputs.forEach((param, index) => {
    if (param.indexed) {
      if (
        param.type === "string" ||
        param.type === "bytes" ||
        param.baseType === "tuple" ||
        param.baseType === "array"
      ) {
        indexed.push(
          ethers.utils.ParamType.fromObject({
            type: "bytes32",
            name: param.name,
          })
        );
        dynamic.push(true);
      } else {
        indexed.push(param);
        dynamic.push(false);
      }
    } else {
      nonIndexed.push(param);
      dynamic.push(false);
    }
  });

  FRAGMENT_TO_INPUTS_METADATA.set(eventFragment, {
    indexed,
    nonIndexed,
    dynamic,
  });
}

function decodeEventLog(
  eventFragment: ethers.utils.EventFragment,
  data: ethers.utils.BytesLike,
  topics: ReadonlyArray<string>
): ethers.utils.Result {
  // if (typeof(eventFragment) === "string") {
  //     eventFragment = this.getEvent(eventFragment);
  // }

  // if (topics != null) {
  // && !eventFragment.anonymous) {
  // let topicHash = this.getEventTopic(eventFragment);
  // if (!isHexString(topics[0], 32) || topics[0].toLowerCase() !== topicHash) {
  //     logger.throwError("fragment/topic mismatch", Logger.errors.INVALID_ARGUMENT, { argument: "topics[0]", expected: topicHash, value: topics[0] });
  // }
  topics = topics.slice(1);
  // }

  // let indexed: Array<ethers.utils.ParamType> = [];
  // let nonIndexed: Array<ethers.utils.ParamType> = [];
  // let dynamic: Array<boolean> = [];

  // eventFragment.inputs.forEach((param, index) => {
  //   if (param.indexed) {
  //     if (
  //       param.type === "string" ||
  //       param.type === "bytes" ||
  //       param.baseType === "tuple" ||
  //       param.baseType === "array"
  //     ) {
  //       indexed.push(
  //         ethers.utils.ParamType.fromObject({
  //           type: "bytes32",
  //           name: param.name,
  //         })
  //       );
  //       dynamic.push(true);
  //     } else {
  //       indexed.push(param);
  //       dynamic.push(false);
  //     }
  //   } else {
  //     nonIndexed.push(param);
  //     dynamic.push(false);
  //   }
  // });

  let { indexed, nonIndexed, dynamic } =
    FRAGMENT_TO_INPUTS_METADATA.get(eventFragment)!;

  let resultIndexed =
    topics != null
      ? abiCoder.decode(indexed, ethers.utils.concat(topics))
      : null;
  let resultNonIndexed = abiCoder.decode(nonIndexed, data, true);

  let result: Array<any> & { [key: string]: any } = [];
  let namedResult: Array<any> & { [key: string]: any } = [];
  let nonIndexedIndex = 0,
    indexedIndex = 0;
  eventFragment.inputs.forEach((param, index) => {
    if (param.indexed) {
      if (resultIndexed == null) {
        result[index] = new ethers.utils.Indexed({
          _isIndexed: true,
          hash: "",
        });
      } else if (dynamic[index]) {
        result[index] = new ethers.utils.Indexed({
          _isIndexed: true,
          hash: resultIndexed[indexedIndex++],
        });
      } else {
        try {
          result[index] = resultIndexed[indexedIndex++];
        } catch (error) {
          result[index] = error;
        }
      }
    } else {
      try {
        result[index] = resultNonIndexed[nonIndexedIndex++];
      } catch (error) {
        result[index] = error;
      }
    }

    // Add the keyword argument if named and safe
    if (param.name && result[param.name] == null) {
      const value = result[index];

      // Make error named values throw on access
      if (!(value instanceof Error)) {
        // Object.defineProperty(result, param.name, {
        //   enumerable: true,
        //   get: () => {
        //     throw wrapAccessError(
        //       `property ${JSON.stringify(param.name)}`,
        //       value
        //     );
        //   },
        // });
        // } else {
        namedResult[param.name] = value;
      }
    }
  });

  // Make all error indexed values throw on access
  // for (let i = 0; i < result.length; i++) {
  //   const value = result[i];
  //   if (value instanceof Error) {
  // Object.defineProperty(result, i, {
  //   enumerable: true,
  //   get: () => {
  //     throw wrapAccessError(`index ${i}`, value);
  //   },
  // });
  //   }
  // }

  return namedResult; //Object.freeze(result);
}

// process.on("SIGINT", (code) => {
// printMetrics()
//   process.exit();
// });

export default {
  initialize,
  handleTransaction,
};
