import { describe, expect, it } from '@jest/globals';
import { assertNumber, assertString, tryCatch, validateArray, validateObject, validateRecord } from '../src';
import { subTypeAssertion } from './Shared';

describe('Validations', () => {
  describe('tryCatch', () => {
    it('returns error message when error is thrown', () => {
      expect(
        tryCatch(() => {
          throw new Error('aaa');
        }),
      ).toBe('aaa');
    });

    it('returns undefined when error is not thrown', () => {
      expect(tryCatch(() => 10)).toBe(undefined);
    });

    it(`returns a defined value when can't parse Error.message`, () => {
      expect(
        tryCatch(() => {
          throw new Error(undefined);
        }),
      ).toBeDefined();
    });

    it(`returns a defined value when a non-error object is thrown`, () => {
      expect(
        tryCatch(() => {
          throw 'aaa';
        }),
      ).toBe('aaa');
    });
  });

  describe('validateObject', () => {
    it('returns error when validation fails', () => {
      const error = validateObject({ requiredNumberSubField: '2' }, subTypeAssertion);
      expect(error).toBe('.requiredNumberSubField: Not a number <string:2>');
    });

    it('returns undefined when validation succeeds', () => {
      const error = validateObject({ requiredNumberSubField: 1 }, subTypeAssertion);
      expect(error).toBe(undefined);
    });
  });

  describe('validateArray', () => {
    it('returns error when validation fails', () => {
      const error = validateArray([1, 2, 3], assertString);
      expect(error).toBe('[0]: Not a string <number:1>');
    });

    it('returns undefined when validation succeeds', () => {
      const error = validateArray([1, 2, 3], assertNumber);
      expect(error).toBe(undefined);
    });
  });

  describe('validateRecord', () => {
    it('returns error when validation fails', () => {
      const error = validateRecord({ a: {}, b: 2 }, assertNumber);
      expect(error).toBe(`['a']: Not a number <object:[object Object]>`);
    });

    it('returns undefined when validation succeeds', () => {
      const error = validateRecord({ a: '1', b: '2' }, assertString);
      expect(error).toBe(undefined);
    });
  });
});
