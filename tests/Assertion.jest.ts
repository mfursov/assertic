import {describe, expect, it} from '@jest/globals';
import {
    $a,
    arrayAssertion,
    assertArray,
    assertBoolean,
    assertNumber,
    assertObject,
    assertString,
    assertTruthy,
    CheckFn,
    isUuid,
    nullOr,
    ObjectAssertion,
    truthy,
    undefinedOr
} from '../src';

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
        expect(() => assertTruthy(false, () => 'Error string')).toThrowError('Error string');
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

interface CheckedType {
    requiredStringField: string;
    optionalNumberField?: number;

    requiredObjectField: CheckedSubType;
    optionalObjectField?: CheckedSubType;

    optionalObjectArray?: Array<CheckedSubType>;
    optionalStringArray?: string[];
}

interface CheckedSubType {
    requiredNumberSubField: number;
    optionalBooleanSubField?: boolean;
}

const subTypeAssertion: ObjectAssertion<CheckedSubType> = {
    requiredNumberSubField: assertNumber,
    optionalBooleanSubField: undefinedOr(assertBoolean),
};

const typeAssertion: ObjectAssertion<CheckedType> = {
    requiredStringField: assertString,
    optionalNumberField: undefinedOr(assertNumber),
    requiredObjectField: subTypeAssertion,
    optionalObjectField: undefinedOr(subTypeAssertion),
    optionalObjectArray: undefinedOr(arrayAssertion(subTypeAssertion)),
    optionalStringArray: undefinedOr(arrayAssertion(assertString))
};

describe('assertObject', () => {
    it('returns with no error if everything is OK', () => {
        const value: CheckedType = {requiredStringField: '', requiredObjectField: {requiredNumberSubField: 10}};
        expect(() => assertObject(value, typeAssertion)).not.toThrow();
    });

    it('finds primitive fields with invalid value', () => {
        // eslint-disable-next-line
        const value: CheckedType = {requiredStringField: 22 as any, requiredObjectField: {requiredNumberSubField: 10}};
        expect(() => assertObject(value, typeAssertion)).toThrowError('.requiredStringField: Not a string <number:22>');
    });

    it('finds object fields with invalid value', () => {
        // eslint-disable-next-line
        const value: CheckedType = {requiredStringField: '', requiredObjectField: 10 as any};
        expect(() => assertObject(value, typeAssertion)).toThrowError('.requiredObjectField is not an object: number');
    });

    it('finds missed fields', () => {
        // eslint-disable-next-line
        const value: CheckedType = {requiredObjectField: {requiredSubField: 10}} as any;
        expect(() => assertObject(value, typeAssertion)).toThrowError('.requiredStringField: Not a string <undefined>');
    });

    it('checks fields in subtypes', () => {
        // eslint-disable-next-line
        const value: CheckedType = {requiredStringField: '', requiredObjectField: {requiredNumberSubField: ''} as any};
        expect(() => assertObject(value, typeAssertion)).toThrowError('.requiredObjectField.requiredNumberSubField: Not a number <string:>');
    });

    it('finds missed fields in subtypes', () => {
        // eslint-disable-next-line
        const value: CheckedType = {requiredStringField: '', requiredObjectField: {} as any};
        expect(() => assertObject(value, typeAssertion)).toThrowError('.requiredObjectField.requiredNumberSubField: Not a number <undefined>');
    });

    it('checks primitive array fields, positive check', () => {
        const value: CheckedType = {
            requiredStringField: '',
            requiredObjectField: {requiredNumberSubField: 10},
            optionalStringArray: ['a', 'b', 'c']
        };
        expect(() => assertObject(value, typeAssertion)).not.toThrow();
    });

    it('checks primitive array fields, throws error', () => {
        const value: CheckedType = {
            requiredStringField: '',
            requiredObjectField: {requiredNumberSubField: 10},
            optionalStringArray: ['a', 'b', 1] as string[]
        };
        expect(() => assertObject(value, typeAssertion)).toThrowError('.optionalStringArray[2]: Not a string <number:1>');
    });

    it('allows empty assertion for an empty type', () => {
        expect(() => assertObject({}, {})).not.toThrow();
        expect(() => assertObject({}, {}, undefined, {failOnUnknownFields: true})).not.toThrow();
    });

    it('allows properties with no assertions by default', () => {
        expect(() => assertObject({a: 1, b: ''}, {b: assertString}, undefined)).not.toThrow();
    });

    it('finds fields with no assertions', () => {
        expect(() => assertObject({a: 1, b: ''}, {b: assertString}, undefined, {failOnUnknownFields: true}))
            .toThrowError(`property can't be checked: a`);
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
        const value: CheckedType = {requiredStringField: '', requiredObjectField: {requiredNumberSubField: 10}};
        assertArray([value, null, value], nullOr(typeAssertion)); // No error thrown.
    });

    it('does not accept bad object array elements', () => {
        expect(() => assertArray([null], typeAssertion)).toThrowError('[0] is null');

        const goodValue: CheckedType = {requiredStringField: '', requiredObjectField: {requiredNumberSubField: 10}};
        const badValue = {} as unknown as CheckedType;
        expect(() => assertArray([goodValue, badValue], typeAssertion)).toThrowError('[1].requiredStringField: Not a string <undefined>');
    });

    it('checks min array length', () => {
        expect(() => assertArray([1, 2, 3], assertNumber, {minLength: 0})); // No error
        expect(() => assertArray([1, 2, 3], assertNumber, {minLength: 1})); // No error
        expect(() => assertArray([1, 2, 3], assertNumber, {minLength: 3})); // No error
        expect(() => assertArray([1, 2, 3], assertNumber, {minLength: 4})).toThrowError('array length < minLength. Array length: 3, minLength: 4');
    });

    it('checks max array length', () => {
        expect(() => assertArray([1, 2, 3], assertNumber, {maxLength: Infinity})); // No error
        expect(() => assertArray([1, 2, 3], assertNumber, {maxLength: 4})); // No error
        expect(() => assertArray([1, 2, 3], assertNumber, {maxLength: 3})); // No error
        expect(() => assertArray([1, 2, 3], assertNumber, {maxLength: 2})).toThrowError('array length > maxLength. Array length: 3, maxLength: 2');
    });

    it('checks uniqueByIdentity', () => {
        expect(() => assertArray(['', '1', '2'], assertString, {uniqueByIdentity: v => v})); // No error
        expect(() => assertArray(['1', '1'], assertString, {uniqueByIdentity: v => v})).toThrowError('array contains non-unique elements');
    });
});

describe('$o assertion', () => {
    it('is not called if individual field check is failed', () => {
        // eslint-disable-next-line
        const value: CheckedType = {requiredStringField: ''} as any; // requiredObjectField is missed.
        const assertionWith$O: ObjectAssertion<CheckedType> = {
            ...typeAssertion,
            $o: () => assertTruthy(false, () => 'Must not be called'),
        };
        expect(() => assertObject(value, assertionWith$O)).toThrowError('.requiredObjectField is not an object: undefined');
    });

    it('is called for an object passed individual field check', () => {
        const value: CheckedType = {
            requiredStringField: '',
            requiredObjectField: {requiredNumberSubField: 1, optionalBooleanSubField: true},
        };
        const assertionWith$O: ObjectAssertion<CheckedType> = {
            ...typeAssertion,
            $o: o => assertTruthy(o.requiredStringField === 'a' || o.requiredObjectField.requiredNumberSubField === 0, () => 'whole object check failed!'),
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
        expect(() => $a(isUuid)('f7fdd562-34800-1ee-be56-0242ac120002')).toThrowError(`Check is failed: 'f7fdd562-34800-1ee-be56-0242ac120002'`);
        expect(() => $a(isUuid)('14425ef5-cf12-44bb-8137-x0f34566676a', 'Context')).toThrowError(`Context: '14425ef5-cf12-44bb-8137-x0f34566676a'`);
    });
});
