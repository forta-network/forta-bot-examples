const {
  isNumeric,
  isAddress,
  addressComparison,
  booleanComparison,
  bigNumberComparison,
  parseExpression,
  checkLogAgainstExpression,
} = require('./utils');

describe('check parsing', () => {
  describe('check address parsing', () => {
    it('returns true when the value passed-in is a valid address with all numbers', () => {
      expect(isAddress('0x0000000000000000000000000000000000000000')).toBe(true);
    });
    it('returns true when the value passed-in is a valid address with all lowercase letters from a-f', () => {
      expect(isAddress('0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa')).toBe(true);
    });
    it('returns true when the value passed-in is a valid address with all uppercase letters from A-F', () => {
      expect(isAddress('0xAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA')).toBe(true);
    });
    it('returns true when the value passed-in is a valid address with a mix of uppercase and lowercase letters from A-F', () => {
      expect(isAddress('0xaaaaaaaaaaaBBBBBaaaaaaaaaFFFFFaaaaaaaaaa')).toBe(true);
    });
    it('returns true when the value passed-in is a valid address with a mix of uppercase/lowercase letters and numbers', () => {
      expect(isAddress('0x000aaaaa00000000000BBBBB000000fffff00000')).toBe(true);
    });
    it('returns false when the value passed-in is an object', () => {
      expect(isAddress({})).toBe(false);
    });
    it('returns false when the value passed-in is a boolean', () => {
      expect(isAddress(true)).toBe(false);
    });
    it('returns false when the value passed-in is a number', () => {
      expect(isAddress(111)).toBe(false);
    });
    it('returns false when the value passed-in is undefined', () => {
      expect(isAddress(undefined)).toBe(false);
    });
    it('returns false when the value passed-in is a hexadecimal string but the length is too short', () => {
      expect(isAddress('0x0')).toBe(false);
    });
    it('returns false when the value passed-in is a hexadecimal string but the length is too long', () => {
      expect(isAddress('0x0000000000000000000000000000000000000000000000000000000000')).toBe(false);
    });
    it('returns false when the value passed-in is a string that contains letter outside the range a-f', () => {
      expect(isAddress('0xaaaaaaaaaaaaaaaaaaaaaaaaagaaaaaaaaaaaaaa')).toBe(false);
    });
    it('returns false when the value passed-in is a string that contains letter outside the range A-F', () => {
      expect(isAddress('0xAAAAAAAAAAAAAAAAAAAAGAAAAAAAAAAAAAAAAAAA')).toBe(false);
    });
    it('returns false when the value passed-in is a string that is not prefixed with 0x', () => {
      expect(isAddress('aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa')).toBe(false);
    });
  });

  describe('check number parsing', () => {
    it('returns true when the value passed-in is a numerical string', () => {
      expect(isNumeric('123')).toBe(true);
    });
    it('returns true when the value passed-in is a numerical string with two decimals', () => {
      expect(isNumeric('123.11')).toBe(true);
    });
    it('returns true when the value passed-in is a numerical string with leading decimals', () => {
      expect(isNumeric('123.00001')).toBe(true);
    });
    it('returns true when the value passed-in is a numerical string with no leading values before decimals', () => {
      expect(isNumeric('.123')).toBe(true);
    });
    it('returns true when the value passed-in is a hexidecimal address', () => {
      expect(isNumeric('0x00')).toBe(true);
    });
    it('returns false when the value passed-in is an object', () => {
      expect(isNumeric({})).toBe(false);
    });
    it('returns false when the value passed-in is a boolean', () => {
      expect(isNumeric(true)).toBe(false);
    });
    it('returns false when the value passed-in is undefined', () => {
      expect(isNumeric(undefined)).toBe(false);
    });
  });

  describe('check parseExpression', () => {
    it('throws an error if the number of terms supplied is less than 3', () => {
      expect(() => {
        parseExpression('');
      }).toThrow('Expression must contain three terms: variable operator value');
    });

    it('throws an error if the number of terms supplied is greater than 3', () => {
      expect(() => {
        parseExpression('123 < x < 456');
      }).toThrow('Expression must contain three terms: variable operator value');
    });

    it('returns an object containing the addressComparison function if the expression supplied is an address condition', () => {
      const { comparisonFunction } = parseExpression(
        'address === 0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
      );
      expect(comparisonFunction).toBe(addressComparison);
    });

    it('returns an object containing the booleanComparison function if the expression supplied is a boolean condition', () => {
      const { comparisonFunction } = parseExpression('value === true');
      expect(comparisonFunction).toBe(booleanComparison);
    });

    it('returns an object containing the bigNumberComparison function if the expression supplied is a number condition', () => {
      const { comparisonFunction } = parseExpression('x >= 123456');
      expect(comparisonFunction).toBe(bigNumberComparison);
    });

    it('throws an error if an invalid operator is passed for an address condition', () => {
      expect(() => {
        parseExpression('address >= 0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa');
      }).toThrow('Unsupported address operator ">=": must be "===" or "!=="');
    });

    it('throws an error if an invalid operator is passed for a boolean condition', () => {
      expect(() => {
        parseExpression('true > false');
      }).toThrow('Unsupported Boolean operator ">": must be "===" or "!=="');
    });

    it('throws an error if an invalid operator is passed for a number condition', () => {
      expect(() => {
        parseExpression('123 + 456');
      }).toThrow('Unsupported BN operator "+": must be <, <=, ===, !==, >=, or >');
    });

    it('throws an error if an invalid value is present in the supplied expression', () => {
      expect(() => {
        parseExpression('123 < ~~~');
      }).toThrow('Unsupported string specifying value: ~~~');
    });
  });

  describe('check checkLogAgainstExpression', () => {
    it('throws an error if the argument name supplied is not present in the supplied logs', () => {
      const expressionObject = {
        variableName: 'incorrectArg',
        operator: '!==',
        comparisonFunction: undefined,
        value: true,
      };
      const log = [];
      log.name = 'Test Event';
      log.args = { result: true };

      expect(() => {
        checkLogAgainstExpression(expressionObject, log);
      }).toThrow(
        'Argument name incorrectArg does not match any of the arguments found in an Test Event log: result',
      );
    });
  });
});
