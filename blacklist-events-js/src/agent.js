const {
  Finding, FindingSeverity, FindingType, ethers,
} = require('forta-agent');

const {
  getAbi,
  extractEventArgs,
  parseExpression,
  checkLogAgainstExpression,
} = require('./utils');

// load any bot configuration parameters
const config = require('../bot-config.json');

// set up a variable to hold initialization data used in the handler
const initializeData = {};

// get the Array of events for a given contract
function getEvents(contractEventConfig, currentContract, contractEvents, contracts) {
  const proxyName = contractEventConfig.proxy;
  let { events } = contractEventConfig;
  const eventInfo = [];

  let eventNames = [];
  if (events === undefined) {
    if (proxyName === undefined) {
      return {}; // no events for this contract
    }
  } else {
    eventNames = Object.keys(events);
  }

  if (proxyName) {
    // contract is a proxy, look up the events (if any) for the contract the proxy is pointing to
    const proxyEvents = contractEvents[proxyName].events;
    if (proxyEvents) {
      if (events === undefined) {
        events = { ...proxyEvents };
      } else {
        events = { ...events, ...proxyEvents };
      }

      // find the abi for the contract the proxy is pointing to and get the event signatures
      const [proxiedContract] = contracts.filter((contract) => proxyName === contract.name);
      Object.keys(proxyEvents).forEach((eventName) => {
        const eventObject = {
          name: eventName,
          // eslint-disable-next-line max-len
          signature: proxiedContract.iface.getEvent(eventName).format(ethers.utils.FormatTypes.full),
          type: proxyEvents[eventName].type,
          severity: proxyEvents[eventName].severity,
        };

        const { expression } = proxyEvents[eventName];
        if (expression !== undefined) {
          eventObject.expression = expression;
          eventObject.expressionObject = parseExpression(expression);
        }

        eventInfo.push(eventObject);
      });
    }
  }

  eventNames.forEach((eventName) => {
    const eventObject = {
      name: eventName,
      signature: currentContract.iface.getEvent(eventName).format(ethers.utils.FormatTypes.full),
      type: events[eventName].type,
      severity: events[eventName].severity,
    };

    const { expression } = events[eventName];
    if (expression !== undefined) {
      eventObject.expression = expression;
      eventObject.expressionObject = parseExpression(expression);
    }
    eventInfo.push(eventObject);
  });

  return { eventInfo };
}

// helper function to create alerts
function createAlert(
  eventName,
  contractName,
  contractAddress,
  eventType,
  eventSeverity,
  args,
  protocolName,
  protocolAbbreviation,
  developerAbbreviation,
  expression,
) {
  const eventArgs = extractEventArgs(args);
  const finding = Finding.fromObject({
    name: `${protocolName} Blacklist Event`,
    description: `The ${eventName} event was emitted by the ${contractName} contract`,
    alertId: `${developerAbbreviation}-${protocolAbbreviation}-BLACKLIST-EVENT`,
    type: FindingType[eventType],
    severity: FindingSeverity[eventSeverity],
    protocol: protocolName,
    metadata: {
      contractName,
      contractAddress,
      eventName,
      ...eventArgs,
    },
  });

  if (expression !== undefined) {
    finding.description += ` with condition met: ${expression}`;
  }

  return Finding.fromObject(finding);
}

function provideInitialize(data) {
  return async function initialize() {
    /* eslint-disable no-param-reassign */
    // assign configurable fields
    data.contractEvents = config.contracts;
    data.protocolName = config.protocolName;
    data.protocolAbbreviation = config.protocolAbbreviation;
    data.developerAbbreviation = config.developerAbbreviation;

    // load the contract addresses, abis, and ethers interfaces
    data.contracts = Object.entries(data.contractEvents).map(([name, entry]) => {
      if (entry.address === undefined) {
        throw new Error(`No address found in configuration file for '${name}'`);
      }

      if (entry.abiFile === undefined) {
        throw new Error(`No ABI file found in configuration file for '${name}'`);
      }

      const abi = getAbi(entry.abiFile);
      const iface = new ethers.utils.Interface(abi);

      const contract = {
        name,
        address: entry.address,
        iface,
      };

      return contract;
    });

    data.contracts.forEach((contract) => {
      const entry = data.contractEvents[contract.name];
      const { eventInfo } = getEvents(entry, contract, data.contractEvents, data.contracts);
      contract.eventInfo = eventInfo;
    });

    /* eslint-enable no-param-reassign */
  };
}

function provideHandleTransaction(data) {
  return async function handleTransaction(txEvent) {
    const {
      contracts, protocolName, protocolAbbreviation, developerAbbreviation,
    } = data;
    if (!contracts) throw new Error('handleTransaction called before initialization');

    const findings = [];

    // iterate over each contract name to get the address and events
    contracts.forEach((contract) => {
      // for each contract look up the events of interest
      const { eventInfo } = contract;

      // iterate over all events in a give contract's eventInfo field
      eventInfo.forEach((event) => {
        const {
          name,
          signature,
          expression,
          expressionObject,
          type,
          severity,
        } = event;

        // filter down to only the events we want to alert on
        const parsedLogs = txEvent.filterLog(signature, contract.address);

        // iterate over each item in parsedLogs and evaluate expressions (if any) given in the
        // configuration file for each Event log, respectively
        parsedLogs.forEach((parsedLog) => {
          // if there is an expression to check, verify the condition before creating an alert
          if (expression !== undefined) {
            if (!checkLogAgainstExpression(expressionObject, parsedLog)) {
              return;
            }
          }

          findings.push(createAlert(
            name,
            contract.name,
            contract.address,
            type,
            severity,
            parsedLog.args,
            protocolName,
            protocolAbbreviation,
            developerAbbreviation,
            expression,
          ));
        });
      });
    });

    return findings;
  };
}

module.exports = {
  provideInitialize,
  initialize: provideInitialize(initializeData),
  provideHandleTransaction,
  handleTransaction: provideHandleTransaction(initializeData),
  createAlert,
};
