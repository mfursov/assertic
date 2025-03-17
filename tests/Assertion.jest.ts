import { beforeEach, describe, expect, it } from '@jest/globals';
import {
  $a,
  $u,
  arrayAssertion,
  assertArray,
  assertEmail,
  assertNumber,
  assertObject,
  assertRecord,
  assertString,
  assertTruthy,
  CheckFn,
  fail,
  isUuid,
  nullOr,
  ObjectAssertion,
  setDefaultAssertionErrorFactory,
  truthy,
} from '../src';
import { CheckedType, typeAssertion } from './Shared';

describe('Assertion', () => {
  beforeEach(() => {
    setDefaultAssertionErrorFactory();
  });
  describe('assertTruthy', () => {
    it('throws a default error for falsy values', () => {
      expect(() => assertTruthy(false)).toThrowError('Assertion error');
      expect(() => assertTruthy(undefined)).toThrowError('Assertion error');
      expect(() => assertTruthy(null)).toThrowError('Assertion error');
      expect(() => assertTruthy('')).toThrowError('Assertion error');
    });

    it('throws an error for truthy values', () => {
      expect(() => assertTruthy(true)).not.toThrow();
      expect(() => assertTruthy(1)).not.toThrow();
      expect(() => assertTruthy({})).not.toThrow();
      expect(() => assertTruthy([])).not.toThrow();
      expect(() => assertTruthy(() => false)).not.toThrow();
    });

    it('throws a correct error object', () => {
      expect(() => assertTruthy(false)).toThrowError('Assertion error');
      expect(() => assertTruthy(false, 'My error message')).toThrowError('My error message');
      expect(() => assertTruthy(false, () => 'My lazily evaluated error message')).toThrowError('My lazily evaluated error message');
    });
  });

  describe('truthy', () => {
    it('throws a default error for falsy values', () => {
      expect(() => truthy(false)).toThrowError('Assertion error');
      expect(() => truthy(undefined)).toThrowError('Assertion error');
      expect(() => truthy(null)).toThrowError('Assertion error');
      expect(() => truthy('')).toThrowError('Assertion error');
    });

    it('returns a non-null value for truthy values', () => {
      expect(truthy(true)).toBe(true);
      expect(truthy(1)).toBe(1);

      const object = {};
      expect(truthy(object)).toBe(object);

      const array: unknown[] = [];
      expect(truthy(array as unknown)).toBe(array);

      const func = (): boolean => false;
      expect(truthy(func)).toBe(func);
    });
  });

  describe('fail', () => {
    it('throws an error with the correct text', () => {
      let thrownError: unknown;
      try {
        fail('error1');
      } catch (e) {
        thrownError = e;
      }
      expect((thrownError as Error)?.message).toBe('error1');
    });

    it('throws an error with the correct text', () => {
      let thrownError: unknown;
      try {
        fail(() => 'error2');
      } catch (e) {
        thrownError = e;
      }
      expect((thrownError as Error)?.message).toBe('error2');
    });

    it('throws an original error object when provided', () => {
      const error = new Error('My error');
      let thrownError: unknown;
      try {
        fail(() => error);
      } catch (e) {
        thrownError = e;
      }
      expect(thrownError).toBe(error);
    });
  });

  describe('assertObject', () => {
    it('returns with no error if everything is OK', () => {
      const value: CheckedType = {
        requiredStringField: '',
        requiredObjectField: { requiredNumberSubField: 10 },
      };
      expect(() => assertObject(value, typeAssertion)).not.toThrow();
    });

    it('finds primitive fields with invalid value', () => {
      const value: CheckedType = {
        // eslint-disable-next-line
        requiredStringField: 22 as any,
        requiredObjectField: { requiredNumberSubField: 10 },
      };
      expect(() => assertObject(value, typeAssertion)).toThrowError('.requiredStringField: Not a string <number:22>');
    });

    it('finds object fields with invalid value', () => {
      const value: CheckedType = {
        requiredStringField: '',
        requiredObjectField: 10 as any, // eslint-disable-line @typescript-eslint/no-explicit-any
      };
      expect(() => assertObject(value, typeAssertion)).toThrowError('.requiredObjectField is not an object: number');
    });

    it('finds missed fields', () => {
      const value: CheckedType = {
        requiredObjectField: { requiredSubField: 10 },
      } as any; // eslint-disable-line @typescript-eslint/no-explicit-any
      expect(() => assertObject(value, typeAssertion)).toThrowError('.requiredStringField: Not a string <undefined>');
    });

    it('checks fields in subtypes', () => {
      const value: CheckedType = {
        requiredStringField: '',
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        requiredObjectField: { requiredNumberSubField: '' } as any,
      };
      expect(() => assertObject(value, typeAssertion)).toThrowError(
        '.requiredObjectField.requiredNumberSubField: Not a number <string:>',
      );
    });

    it('finds missed fields in subtypes', () => {
      const value: CheckedType = {
        requiredStringField: '',
        requiredObjectField: {} as any, // eslint-disable-line @typescript-eslint/no-explicit-any
      };
      expect(() => assertObject(value, typeAssertion)).toThrowError(
        '.requiredObjectField.requiredNumberSubField: Not a number <undefined>',
      );
    });

    it('checks primitive array fields, positive check', () => {
      const value: CheckedType = {
        requiredStringField: '',
        requiredObjectField: { requiredNumberSubField: 10 },
        optionalStringArray: ['a', 'b', 'c'],
      };
      expect(() => assertObject(value, typeAssertion)).not.toThrow();
    });

    it('checks primitive array fields, throws error', () => {
      const value: CheckedType = {
        requiredStringField: '',
        requiredObjectField: { requiredNumberSubField: 10 },
        optionalStringArray: ['a', 'b', 1] as string[],
      };
      expect(() => assertObject(value, typeAssertion)).toThrowError('.optionalStringArray[2]: Not a string <number:1>');
    });

    it('checks record fields, positive check', () => {
      const value: CheckedType = {
        requiredStringField: '',
        requiredObjectField: { requiredNumberSubField: 10 },
        optionalRecordOfStrings: { a: 'a' },
      };
      expect(() => assertObject(value, typeAssertion)).not.toThrow();
    });

    it('checks record fields, throw error', () => {
      const value: CheckedType = {
        requiredStringField: '',
        requiredObjectField: { requiredNumberSubField: 10 },
        optionalRecordOfStrings: { a: 1 } as any, // eslint-disable-line @typescript-eslint/no-explicit-any
      };
      expect(() => assertObject(value, typeAssertion)).toThrow(".optionalRecordOfStrings['a']: Not a string <number:1>");
    });

    it('checks date fields, allows it to be optional', () => {
      const value: CheckedType = {
        requiredStringField: '',
        requiredObjectField: { requiredNumberSubField: 10 },
        optionalDateField: undefined,
      };
      expect(() => assertObject(value, typeAssertion)).not.toThrow();
    });

    it('checks date fields, throw error', () => {
      const value: CheckedType = {
        requiredStringField: '',
        requiredObjectField: { requiredNumberSubField: 10 },
        optionalDateField: null as any, // eslint-disable-line @typescript-eslint/no-explicit-any
      };
      expect(() => assertObject(value, typeAssertion)).toThrow('.optionalDateField: Invalid Date <null>');
    });

    it('allows empty assertion for an empty type', () => {
      expect(() => assertObject({}, {})).not.toThrow();
      expect(() => assertObject({}, {}, undefined, { failOnUnknownFields: true })).not.toThrow();
    });

    it('allows properties with no assertions by default', () => {
      expect(() => assertObject({ a: 1, b: '' }, { b: assertString }, undefined)).not.toThrow();
    });

    it('finds fields with no assertions', () => {
      expect(() =>
        assertObject({ a: 1, b: '' }, { b: assertString }, undefined, {
          failOnUnknownFields: true,
        }),
      ).toThrowError(`property can't be checked: a`);
    });

    it('uses allowedUnknownFieldNames correctly', () => {
      expect(() =>
        assertObject({ a: 1, b: '' }, { b: assertString }, undefined, {
          failOnUnknownFields: true,
          allowedUnknownFieldNames: ['a'],
        }),
      ).not.toThrow();
    });
  });

  describe('assertArray', () => {
    it('returns with no error if everything is OK', () => {
      expect(() => assertArray(['a', 'b', 'c'], assertString)).not.toThrow();
    });

    it('finds elements with invalid primitive type values', () => {
      expect(() => assertArray([1, 8, true], assertNumber)).toThrowError('[2]: Not a number <boolean:true>');
    });

    it('handles undefined elements', () => {
      expect(() => assertArray([1, undefined, 3], assertNumber)).toThrowError('[1]: Not a number <undefined>');
    });

    it('handles null elements', () => {
      expect(() => assertArray([null, 2, 3], assertNumber)).toThrowError('[0]: Not a number <null>');
    });

    it('accepts good object array elements ', () => {
      const value: CheckedType = {
        requiredStringField: '',
        requiredObjectField: { requiredNumberSubField: 10 },
      };
      assertArray([value, null, value], nullOr(typeAssertion)); // No error thrown.
    });

    it('does not accept bad object array elements', () => {
      expect(() => assertArray([null], typeAssertion)).toThrowError('[0] is null');

      const goodValue: CheckedType = {
        requiredStringField: '',
        requiredObjectField: { requiredNumberSubField: 10 },
      };
      const badValue = {} as unknown as CheckedType;
      expect(() => assertArray([goodValue, badValue], typeAssertion)).toThrowError(
        '[1].requiredStringField: Not a string <undefined>',
      );
    });

    it('checks min array length', () => {
      expect(() => assertArray([1, 2, 3], assertNumber, { minLength: 0 })); // No error
      expect(() => assertArray([1, 2, 3], assertNumber, { minLength: 1 })); // No error
      expect(() => assertArray([1, 2, 3], assertNumber, { minLength: 3 })); // No error
      expect(() => assertArray([1, 2, 3], assertNumber, { minLength: 4 })).toThrowError(
        'array length < minLength. Array length: 3, minLength: 4',
      );
    });

    it('checks max array length', () => {
      expect(() => assertArray([1, 2, 3], assertNumber, { maxLength: Infinity })); // No error
      expect(() => assertArray([1, 2, 3], assertNumber, { maxLength: 4 })); // No error
      expect(() => assertArray([1, 2, 3], assertNumber, { maxLength: 3 })); // No error
      expect(() => assertArray([1, 2, 3], assertNumber, { maxLength: 2 })).toThrowError(
        'array length > maxLength. Array length: 3, maxLength: 2',
      );
    });

    it('checks uniqueByIdentity', () => {
      expect(() => assertArray(['', '1', '2'], assertString, { uniqueByIdentity: v => v })); // No error
      expect(() => assertArray(['1', '1'], assertString, { uniqueByIdentity: v => v })).toThrowError(
        'array contains non-unique elements',
      );
    });
  });

  describe('assertRecord', () => {
    const goodValue: CheckedType = {
      requiredStringField: '',
      requiredObjectField: { requiredNumberSubField: 10 },
    };
    const badValue = {} as unknown as CheckedType;

    it('returns with no error if record is empty', () => {
      expect(() => assertRecord({}, assertNumber)).not.toThrow();
    });

    it('returns with no error for a record with a valid numeric values', () => {
      expect(() => assertRecord({ a: 1, b: 2 }, assertNumber)).not.toThrow();
    });

    it('returns with no error for a record with a valid string values', () => {
      expect(() => assertRecord({ a: '1', b: '2' }, assertString)).not.toThrow();
    });

    it('returns with no error for a record with a valid object values', () => {
      expect(() => assertRecord({ a: goodValue }, typeAssertion)).not.toThrow();
    });

    it('returns with no error for a record with a valid array values', () => {
      expect(() => assertRecord({ a: [goodValue] }, arrayAssertion(typeAssertion))).not.toThrow();
    });

    it('throws error when a bad object value is used', () => {
      expect(() => assertRecord({ a: badValue }, typeAssertion)).toThrowError("['a'].requiredStringField: Not a string <undefined>");
    });

    it('throws error when a bad primitive value is used', () => {
      expect(() => assertRecord({ a: '1' }, assertNumber)).toThrowError("['a']: Not a number <string:1>");
    });

    it('throws error when a numeric value is passed instead of a record', () => {
      expect(() =>
        assertRecord(
          1,
          $u(() => true),
        ),
      ).toThrow('value is not an object: <number:1>');
    });

    it('throws error when a string value is passed instead of a record', () => {
      expect(() =>
        assertRecord(
          '',
          $u(() => true),
        ),
      ).toThrow('value is not an object: <string:>');
    });

    it('throws error when an undefined value is passed instead of a record', () => {
      expect(() =>
        assertRecord(
          undefined,
          $u(() => true),
        ),
      ).toThrow('value is not an object: <undefined>');
    });

    it('throws error when an null value is passed instead of a record', () => {
      expect(() =>
        assertRecord(
          null,
          $u(() => true),
        ),
      ).toThrow('value is null');
    });

    it('throws error when an array value is passed instead of a record', () => {
      expect(() =>
        assertRecord(
          [],
          $u(() => true),
        ),
      ).toThrow('the value is not a record, but is an array');
    });

    it('throws error when a function value is passed instead of a record', () => {
      expect(() =>
        assertRecord(
          () => 123,
          $u(() => true),
        ),
      ).toThrow('value is not an object: <function:() => 123>');
    });

    it('throws error when a symbol value is passed instead of a record', () => {
      expect(() =>
        assertRecord(
          Symbol('a'),
          $u(() => true),
        ),
      ).toThrow('value is not an object: Symbol(a)');
    });
    it('throws error when a bigint value is passed instead of a record', () => {
      expect(() =>
        assertRecord(
          BigInt(10),
          $u(() => true),
        ),
      ).toThrowError('value is not an object: <bigint:10>');
    });

    it('checks constraints.keyAssertion, success case', () => {
      let keyAssertionArg: unknown;
      const keyAssertion = $u(key => {
        expect(keyAssertionArg).toBe(undefined);
        expect(key).toBe('a');
        keyAssertionArg = key;
        return true;
      });
      expect(() => assertRecord({ a: 1 }, assertNumber, { keyAssertion })).not.toThrow();
      expect(keyAssertionArg).toBe('a');
    });

    it('checks constraints.keyAssertion, error case', () => {
      expect(() => assertRecord({ a: 1 }, assertNumber, { keyAssertion: assertEmail })).toThrow(
        "['a'], key assertion failed:: Invalid email <string:a>",
      );
    });

    it('checks constraints.keyField, success case', () => {
      expect(() =>
        assertRecord(
          { a: { id: 'a' } },
          $u(() => true),
          { keyField: 'id' },
        ),
      ).not.toThrow();
    });

    it('checks constraints.keyField, missed field', () => {
      expect(() =>
        assertRecord(
          { a: { id: 'a' } },
          $u(() => true),
          { keyField: 'id2' },
        ),
      ).toThrow("['a'] key value does not match object field 'id2' value: <undefined>");
    });

    it('checks constraints.keyField, wrong field value', () => {
      expect(() =>
        assertRecord(
          { a: { id: 'b' } },
          $u(() => true),
          { keyField: 'id' },
        ),
      ).toThrow("['a'] key value does not match object field 'id' value: <string:b>");
    });

    it('checks constraints.keyField, not an object', () => {
      expect(() =>
        assertRecord(
          { a: 1 },
          $u(() => true),
          { keyField: 'id' },
        ),
      ).toThrow("['a'] is not an object: <number:1>");
    });

    it('calls $o', () => {
      const checkValue = { a: 1 };
      let $oValue: unknown;
      expect(() =>
        assertRecord(
          checkValue,
          $u(() => true),
          {
            $o: $u(v => {
              expect($oValue).toBeUndefined();
              $oValue = v;
              return true;
            }),
          },
        ),
      ).not.toThrow();
      expect($oValue).toBe(checkValue);
    });

    it('fails if $o fails', () => {
      expect(() =>
        assertRecord(
          { a: 1 },
          $u(() => true),
          {
            $o: assertNumber,
          },
        ),
      ).toThrow('Not a number <object:[object Object]>');
    });
  });

  describe('$o assertion', () => {
    it('is not called if individual field check is failed', () => {
      // eslint-disable-next-line
      const value: CheckedType = { requiredStringField: '' } as any; // requiredObjectField is missed.
      const assertionWith$O: ObjectAssertion<CheckedType> = {
        ...typeAssertion,
        $o: () => assertTruthy(false, () => 'Must not be called'),
      };
      expect(() => assertObject(value, assertionWith$O)).toThrowError('.requiredObjectField is not an object: undefined');
    });

    it('is called for an object passed individual field check', () => {
      const value: CheckedType = {
        requiredStringField: '',
        requiredObjectField: {
          requiredNumberSubField: 1,
          optionalBooleanSubField: true,
        },
      };
      const assertionWith$O: ObjectAssertion<CheckedType> = {
        ...typeAssertion,
        $o: o =>
          assertTruthy(
            o.requiredStringField === 'a' || o.requiredObjectField.requiredNumberSubField === 0,
            () => 'whole object check failed!',
          ),
      };
      expect(() => assertObject(value, assertionWith$O)).toThrowError('whole object check failed!');
    });
  });

  describe('$a assertion factory', () => {
    it('returns true for good values', () => {
      expect(() => $a((v: unknown) => v === 'a')('a')).not.toThrow();
      expect(() => $a(isUuid)('e713d8a0-3480-11ee-be56-0242ac120002')).not.toThrow();
      expect(() => $a(isUuid)('14425ef5-cf12-44bb-8137-10f34566676a')).not.toThrow();
    });

    it('throws Error when gets bad values', () => {
      expect(() => $a((v: unknown) => v === '1')('a')).toThrowError(`Check is failed: 'a'`);
      expect(() => $a(isUuid, () => 'ERR!')('bee076c1-3f83-4637-95b1-ad5a0a825b7')).toThrowError('Check is failed: ERR!');
      expect(() => $a(isNaN as CheckFn<number>, 'Not NAN')(123)).toThrowError('Check is failed: Not NAN');
      expect(() => $a(isNaN as CheckFn<number>)(123)).toThrowError(`Check is failed: '123'`);
      expect(() => $a(isUuid)('f7fdd562-34800-1ee-be56-0242ac120002')).toThrowError(
        `Check is failed: 'f7fdd562-34800-1ee-be56-0242ac120002'`,
      );
      expect(() => $a(isUuid)('14425ef5-cf12-44bb-8137-x0f34566676a', 'Context')).toThrowError(
        `Context: '14425ef5-cf12-44bb-8137-x0f34566676a'`,
      );
    });
  });

  describe('$u assertion factory', () => {
    it('returns true for good values', () => {
      expect(() => $u(v => v === 'a')('a')).not.toThrow();
      expect(() => $u(v => v instanceof Date)(new Date())).not.toThrow();
    });

    it('throws Error when gets bad values', () => {
      expect(() => $u(v => v === '1')('a')).toThrowError(`Check is failed: 'a'`);
      expect(() => $u(v => v instanceof Date)(1)).toThrowError(`Check is failed: '1'`);
    });
  });

  describe('assertion error factory', () => {
    it('uses the factory', () => {
      setDefaultAssertionErrorFactory(message => new Error(`abc:${message}`));
      expect(() => truthy(Date.now() === 0, 'def')).toThrowError(`abc:def`);

      setDefaultAssertionErrorFactory(message => new Error(`abc:${message}`));
      expect(() => truthy(Date.now() === 0, 'def')).toThrowError(`def`);
    });

    it('uses additional data', () => {
      setDefaultAssertionErrorFactory((message, a1, a2) => new Error(`abc:${message}:${a1}:${a2}`));
      expect(() => truthy(Date.now() === 0, 'def', 1, 2)).toThrowError(`abc:def:1:2`);
    });
  });
});
