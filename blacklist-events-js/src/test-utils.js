const BigNumber = require('bignumber.js');
const { ethers } = require('forta-agent');
const utils = require('./utils');

const defaultTypeMap = {
  uint256: 0,
  'uint256[]': [0],
  address: ethers.constants.AddressZero,
  'address[]': [ethers.constants.AddressZero],
  bytes: '0xff',
  'bytes[]': ['0xff'],
  bytes32: 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF,
  'bytes32[]': [0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF],
  string: 'test',
  'string[]': ['test'],
};

function getObjectsFromAbi(abi, objectType) {
  const contractObjects = {};
  abi.forEach((entry) => {
    if (entry.type === objectType) {
      contractObjects[entry.name] = entry;
    }
  });
  return contractObjects;
}

function getEventFromConfig(abi, events) {
  let eventInConfig;
  let eventNotInConfig;
  let findingType;
  let findingSeverity;

  const eventsInConfig = Object.keys(events);
  const eventObjects = getObjectsFromAbi(abi, 'event');
  Object.keys(eventObjects).forEach((name) => {
    if ((eventNotInConfig !== undefined) && (eventInConfig !== undefined)) {
      return;
    }

    if ((eventsInConfig.indexOf(name) === -1) && (eventNotInConfig === undefined)) {
      eventNotInConfig = eventObjects[name];
    }

    if ((eventsInConfig.indexOf(name) !== -1) && (eventInConfig === undefined)) {
      eventInConfig = eventObjects[name];
      findingType = events[name].type;
      findingSeverity = events[name].severity;
    }
  });
  return {
    eventInConfig, eventNotInConfig, findingType, findingSeverity,
  };
}

function getExpressionOperand(operator, value, expectedResult) {
  // given a value, an operator, and a corresponding expected result, return a value that
  // meets the expected result
  let leftOperand;
  /* eslint-disable no-case-declarations */
  if (BigNumber.isBigNumber(value)) {
    switch (operator) {
      case '>=':
        if (expectedResult) {
          leftOperand = value.toString();
        } else {
          leftOperand = value.minus(1).toString();
        }
        break;
      case '<=':
        if (expectedResult) {
          leftOperand = value.toString();
        } else {
          leftOperand = value.plus(1).toString();
        }
        break;
      case '===':
        if (expectedResult) {
          leftOperand = value.toString();
        } else {
          leftOperand = value.minus(1).toString();
        }
        break;
      case '>':
      case '!==':
        if (expectedResult) {
          leftOperand = value.plus(1).toString();
        } else {
          leftOperand = value.toString();
        }
        break;
      case '<':
        if (expectedResult) {
          leftOperand = value.minus(1).toString();
        } else {
          leftOperand = value.toString();
        }
        break;
      default:
        throw new Error(`Unknown operator: ${operator}`);
    }
  } else if (utils.isAddress(value)) {
    switch (operator) {
      case '===':
        if (expectedResult) {
          leftOperand = value;
        } else {
          let temp = ethers.BigNumber.from(value);
          if (temp.eq(0)) {
            temp = temp.add(1);
          } else {
            temp = temp.sub(1);
          }
          leftOperand = ethers.utils.getAddress(ethers.utils.hexZeroPad(temp.toHexString(), 20));
        }
        break;
      case '!==':
        if (expectedResult) {
          let temp = ethers.BigNumber.from(value);
          if (temp.eq(0)) {
            temp = temp.add(1);
          } else {
            temp = temp.sub(1);
          }
          leftOperand = ethers.utils.getAddress(ethers.utils.hexZeroPad(temp.toHexString(), 20));
        } else {
          leftOperand = value;
        }
        break;
      default:
        throw new Error(`Unsupported operator ${operator} for address comparison`);
    }
  } else {
    throw new Error(`Unsupported variable type ${typeof (value)} for comparison`);
  }

  /* eslint-enable no-case-declarations */
  return leftOperand;
}

function createMockEventLogs(eventObject, iface, override = undefined) {
  const mockArgs = [];
  const mockTopics = [];
  const eventTypes = [];
  const defaultData = [];
  const abiCoder = ethers.utils.defaultAbiCoder;

  // push the topic hash of the event to mockTopics - this is the first item in a topics array
  const fragment = iface.getEvent(eventObject.name);
  mockTopics.push(iface.getEventTopic(fragment));

  eventObject.inputs.forEach((entry) => {
    let value;

    // check to make sure type is supported
    if (defaultTypeMap[entry.type] === undefined) {
      throw new Error(`Type ${entry.type} is not supported`);
    }

    // check to make sure any array types are not indexed
    if ((entry.type in ['uint256[]', 'address[]', 'bytes[]', 'bytes32[]', 'string[]'])
      && entry.indexed) {
      throw new Error(`Indexed type ${entry.type} is not supported`);
    }

    // determine whether to take the default value for the type, or if an override is given, take
    // that value
    if (override && entry.name === override.name) {
      ({ value } = override);
    } else {
      value = defaultTypeMap[entry.type];
    }

    // push the values into the correct array, indexed arguments go into topics, otherwise they go
    // into data
    if (entry.indexed) {
      mockTopics.push(value);
    } else {
      eventTypes.push(entry.type);
      defaultData.push(value);
    }

    // do not overwrite reserved JS words!
    if (mockArgs[entry.name] == null) {
      mockArgs[entry.name] = value;
    }
  });

  // encode the data array given the types array
  const data = abiCoder.encode(eventTypes, defaultData);
  return { mockArgs, mockTopics, data };
}

module.exports = {
  getObjectsFromAbi,
  getEventFromConfig,
  getExpressionOperand,
  createMockEventLogs,
};
