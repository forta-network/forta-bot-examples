const {
  Finding, FindingType, FindingSeverity, createTransactionEvent, ethers,
} = require('forta-agent');

const { provideHandleTransaction, provideInitialize } = require('./agent');
const {
  getObjectsFromAbi,
  getEventFromConfig,
  createMockEventLogs,
} = require('./test-utils');

const utils = require('./utils');

const config = require('../bot-config.json');

// check the configuration file to verify the values
describe('check bot configuration file', () => {
  it('procotolName key required', () => {
    const { protocolName } = config;
    expect(typeof (protocolName)).toBe('string');
    expect(protocolName).not.toBe('');
  });

  it('protocolAbbreviation key required', () => {
    const { protocolAbbreviation } = config;
    expect(typeof (protocolAbbreviation)).toBe('string');
    expect(protocolAbbreviation).not.toBe('');
  });

  it('developerAbbreviation key required', () => {
    const { developerAbbreviation } = config;
    expect(typeof (developerAbbreviation)).toBe('string');
    expect(developerAbbreviation).not.toBe('');
  });

  it('contracts key required', () => {
    const { contracts } = config;
    expect(typeof (contracts)).toBe('object');
    expect(contracts).not.toBe({});
  });

  it('contracts key values must be valid', () => {
    const { contracts } = config;
    Object.keys(contracts).forEach((key) => {
      const { address, abiFile, events } = contracts[key];

      // check that the address is a valid address
      expect(utils.isAddress(address)).toBe(true);

      // load the ABI from the specified file
      // the call to getAbi will fail if the file does not exist
      const abi = utils.getAbi(abiFile);

      const eventObjects = getObjectsFromAbi(abi, 'event');

      // for all of the events specified, verify that they exist in the ABI
      Object.keys(events).forEach((eventName) => {
        expect(Object.keys(eventObjects).indexOf(eventName)).not.toBe(-1);

        const entry = events[eventName];
        const { expression, type, severity } = entry;

        // the expression key can be left out, but if it's present, verify the expression
        if (expression !== undefined) {
          // if the expression is not valid, the call to parseExpression will fail
          const expressionObject = utils.parseExpression(expression);

          // check the event definition to verify the argument name
          const { inputs } = eventObjects[eventName];
          const argumentNames = inputs.map((inputEntry) => inputEntry.name);

          // verify that the argument name is present in the event Object
          expect(argumentNames.indexOf(expressionObject.variableName)).not.toBe(-1);
        }

        // check type, this will fail if 'type' is not valid
        expect(Object.prototype.hasOwnProperty.call(FindingType, type)).toBe(true);

        // check severity, this will fail if 'severity' is not valid
        expect(Object.prototype.hasOwnProperty.call(FindingSeverity, severity)).toBe(true);
      });
    });
  });
});

// tests
describe('monitor emitted events', () => {
  describe('handleTransaction', () => {
    let initializeData;
    let developerAbbreviation;
    let protocolAbbreviation;
    let protocolName;
    let contractName;
    let handleTransaction;
    let mockTxEvent;
    let iface;
    let abi;
    let eventInConfig;
    let eventNotInConfig;
    let validContractAddress;
    let findingType;
    let findingSeverity;

    beforeEach(async () => {
      initializeData = {};

      // initialize the handler
      await (provideInitialize(initializeData))();
      handleTransaction = provideHandleTransaction(initializeData);

      // grab the first entry from the 'contracts' key in the configuration file
      const { contracts: configContracts } = config;
      protocolName = config.protocolName;
      protocolAbbreviation = config.protocolAbbreviation;
      developerAbbreviation = config.developerAbbreviation;

      [contractName] = Object.keys(configContracts);
      const { abiFile, events } = configContracts[contractName];
      validContractAddress = configContracts[contractName].address;

      abi = utils.getAbi(abiFile);

      const results = getEventFromConfig(abi, events);
      eventInConfig = results.eventInConfig;
      eventNotInConfig = results.eventNotInConfig;
      findingType = results.findingType;
      findingSeverity = results.findingSeverity;

      if (eventInConfig === undefined) {
        throw new Error('Could not extract valid event from configuration file');
      }

      if (eventNotInConfig === undefined) {
        // if no other events were present in the ABI, generate a default event so the tests can
        // be run
        eventNotInConfig = {
          anonymous: false,
          inputs: [
            {
              indexed: false,
              internalType: 'uint256',
              name: 'testValue',
              type: 'uint256',
            },
          ],
          name: 'TESTMockEvent',
          type: 'event',
        };

        // push fake event to abi before creating the interface
        abi.push(eventNotInConfig);
      }

      iface = new ethers.utils.Interface(abi);

      // initialize mock transaction event with default values
      mockTxEvent = createTransactionEvent({
        logs: [
          {
            name: '',
            address: '',
            signature: '',
            topics: [],
            data: `0x${'0'.repeat(1000)}`,
            args: [],
          },
        ],
      });
    });

    it('returns empty findings if no monitored events were emitted in the transaction', async () => {
      const findings = await handleTransaction(mockTxEvent);
      expect(findings).toStrictEqual([]);
    });

    it('returns empty findings if contract address does not match', async () => {
      // encode event data
      // valid event name with valid name, signature, topic, and args
      const { mockArgs, mockTopics, data } = createMockEventLogs(eventInConfig, iface);

      // update mock transaction event
      const [defaultLog] = mockTxEvent.logs;
      defaultLog.name = contractName;
      defaultLog.address = ethers.constants.AddressZero;
      defaultLog.topics = mockTopics;
      defaultLog.args = mockArgs;
      defaultLog.data = data;
      defaultLog.signature = iface
        .getEvent(eventInConfig.name)
        .format(ethers.utils.FormatTypes.minimal)
        .substring(6);

      const findings = await handleTransaction(mockTxEvent);

      expect(findings).toStrictEqual([]);
    });

    it('returns empty findings if contract address matches but no monitored function was invoked', async () => {
      // encode event data - valid event with valid arguments
      const { mockArgs, mockTopics, data } = createMockEventLogs(eventNotInConfig, iface);

      // update mock transaction event
      const [defaultLog] = mockTxEvent.logs;
      defaultLog.name = contractName;
      defaultLog.address = validContractAddress;
      defaultLog.topics = mockTopics;
      defaultLog.args = mockArgs;
      defaultLog.data = data;
      defaultLog.signature = iface
        .getEvent(eventNotInConfig.name)
        .format(ethers.utils.FormatTypes.minimal)
        .substring(6);

      const findings = await handleTransaction(mockTxEvent);

      expect(findings).toStrictEqual([]);
    });

    it('returns a finding if a target contract invokes a monitored function with no expression', async () => {
      // encode event data - valid event with valid arguments
      const { mockArgs, mockTopics, data } = createMockEventLogs(eventInConfig, iface);

      // update mock transaction event
      const [defaultLog] = mockTxEvent.logs;
      defaultLog.name = contractName;
      defaultLog.address = validContractAddress;
      defaultLog.topics = mockTopics;
      defaultLog.args = mockArgs;
      defaultLog.data = data;
      defaultLog.signature = iface
        .getEvent(eventInConfig.name)
        .format(ethers.utils.FormatTypes.minimal)
        .substring(6);

      // eliminate any expression
      const { eventInfo } = initializeData.contracts[0];
      delete eventInfo[0].expression;
      delete eventInfo[0].expressionObject;

      let expectedMetaData = {};
      Object.keys(mockArgs).forEach((name) => {
        expectedMetaData[name] = mockArgs[name];
      });
      expectedMetaData = utils.extractEventArgs(expectedMetaData);

      const findings = await handleTransaction(mockTxEvent);

      // create the expected finding
      const testFindings = [Finding.fromObject({
        alertId: `${developerAbbreviation}-${protocolAbbreviation}-BLACKLIST-EVENT`,
        description: `The ${eventInConfig.name} event was emitted by the ${contractName} contract`,
        name: `${protocolName} Blacklist Event`,
        protocol: protocolName,
        severity: FindingSeverity[findingSeverity],
        type: FindingType[findingType],
        metadata: {
          contractAddress: validContractAddress,
          contractName,
          eventName: eventInConfig.name,
          ...expectedMetaData,
        },
      })];

      expect(findings).toStrictEqual(testFindings);
    });
  });
});
