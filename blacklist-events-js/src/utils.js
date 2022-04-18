const BigNumber = require('bignumber.js');
const { ethers } = require('forta-agent');

function getAbi(abiName) {
  // eslint-disable-next-line global-require,import/no-dynamic-require
  const { abi } = require(`../abi/${abiName}`);
  return abi;
}

// helper function that identifies key strings in the args array obtained from log parsing
// these key-value pairs will be added to the metadata as event args
// all values are converted to strings so that BigNumbers are readable
function extractEventArgs(args) {
  const eventArgs = {};
  Object.keys(args).forEach((key) => {
    if (Number.isNaN(Number(key))) {
      eventArgs[key] = args[key].toString();
    }
  });
  return eventArgs;
}

function isNumeric(valueString) {
  const result = new BigNumber(valueString);
  return !(result.isNaN());
}

function isAddress(valueString) {
  return ethers.utils.isHexString(valueString, 20);
}

function addressComparison(variable, operator, operand) {
  switch (operator) {
    case '===':
      return variable === operand;
    case '!==':
      return variable !== operand;
    default:
      throw new Error(`Address operator ${operator} not supported`);
  }
}

function booleanComparison(variable, operator, operand) {
  switch (operator) {
    case '===':
      return variable === operand;
    case '!==':
      return variable !== operand;
    default:
      throw new Error(`Boolean operator ${operator} not supported`);
  }
}

function bigNumberComparison(variable, operator, operand) {
  switch (operator) {
    case '===':
      return variable.eq(operand);
    case '!==':
      return !(variable.eq(operand));
    case '>=':
      return variable.gte(operand);
    case '>':
      return variable.gt(operand);
    case '<=':
      return variable.lte(operand);
    case '<':
      return variable.lt(operand);
    default:
      throw new Error(`BigNumber operator ${operator} not supported`);
  }
}

function parseExpression(expression) {
  // Split the expression on spaces, discarding extra spaces
  const parts = expression.split(/(\s+)/).filter((str) => str.trim().length > 0);

  // Only support variable, operator, comparisonValue
  if (parts.length !== 3) {
    throw new Error('Expression must contain three terms: variable operator value');
  }

  const [variableName, operator, value] = parts;

  // Address
  if (isAddress(value)) {
    // Check the operator
    if (['===', '!=='].indexOf(operator) === -1) {
      throw new Error(`Unsupported address operator "${operator}": must be "===" or "!=="`);
    }
    return {
      variableName,
      operator,
      comparisonFunction: addressComparison,
      value,
    };
  }

  // Boolean
  if ((value.toLowerCase() === 'true') || (value.toLowerCase() === 'false')) {
    // Check the operator
    if (['===', '!=='].indexOf(operator) === -1) {
      throw new Error(`Unsupported Boolean operator "${operator}": must be "===" or "!=="`);
    }
    return {
      variableName,
      operator,
      comparisonFunction: booleanComparison,
      value: value.toLowerCase() === 'true',
    };
  }

  // Number
  if (isNumeric(value)) {
    // Check the operator
    if (['<', '<=', '===', '!==', '>=', '>'].indexOf(operator) === -1) {
      throw new Error(`Unsupported BN operator "${operator}": must be <, <=, ===, !==, >=, or >`);
    }
    return {
      variableName,
      operator,
      comparisonFunction: bigNumberComparison,
      value: new BigNumber(value),
    };
  }

  // Unhandled
  throw new Error(`Unsupported string specifying value: ${value}`);
}

function checkLogAgainstExpression(expressionObject, log) {
  const {
    variableName: argName, operator, comparisonFunction, value: operand,
  } = expressionObject;

  if (log.args[argName] === undefined) {
    // passed-in argument name from config file was not found in the log, which means that the
    // user's argument name does not coincide with the names of the event ABI
    const logArgNames = Object.keys(log.args);
    throw new Error(`Argument name ${argName} does not match any of the arguments found in an ${log.name} log: ${logArgNames}`);
  }

  // convert the value of argName and the operand value into their corresponding types
  // we assume that any value prefixed with '0x' is an address as a hex string, otherwise it will
  // be interpreted as an ethers BigNumber
  let argValue = log.args[argName];

  // Check if the operand type is BigNumber
  if (BigNumber.isBigNumber(operand)) {
    argValue = new BigNumber(argValue.toString());
  }

  return comparisonFunction(argValue, operator, operand);
}

module.exports = {
  getAbi,
  extractEventArgs,
  isNumeric,
  isAddress,
  addressComparison,
  booleanComparison,
  bigNumberComparison,
  parseExpression,
  checkLogAgainstExpression,
};
