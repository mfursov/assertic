import {describe, expect, it} from '@jest/globals';
import {assertBoolean, assertNonNullable} from '../src';

describe('assertBoolean', () => {

    it('does not throw error for good values', () => {
        expect(() => assertBoolean(false)).not.toThrowError();
        expect(() => assertBoolean(true)).not.toThrowError();
        expect(() => assertBoolean(Boolean(true))).not.toThrowError();
        expect(() => assertBoolean(Boolean(false))).not.toThrowError();
        expect(() => assertBoolean(Boolean('true'))).not.toThrowError();
        expect(() => assertBoolean(Boolean('false'))).not.toThrowError();
    });

    it('throws error for bad values', () => {
        expect(() => assertBoolean(undefined)).toThrowError();
        expect(() => assertBoolean(null)).toThrowError();
        expect(() => assertBoolean('')).toThrowError();
        expect(() => assertBoolean('true')).toThrowError();
        expect(() => assertBoolean('false')).toThrowError();
        expect(() => assertBoolean([])).toThrowError();
        expect(() => assertBoolean({})).toThrowError();
        expect(() => assertBoolean(NaN)).toThrowError();
        expect(() => assertBoolean(Infinity)).toThrowError();
    });
});

describe('assertNonNullable', () => {
    it('does not throw error for good values', () => {
        expect(() => assertNonNullable(false)).not.toThrowError();
        expect(() => assertNonNullable(true)).not.toThrowError();
        expect(() => assertNonNullable(1)).not.toThrowError();
        expect(() => assertNonNullable('')).not.toThrowError();
        expect(() => assertNonNullable(NaN)).not.toThrowError();
        expect(() => assertNonNullable(BigInt(0))).not.toThrowError();
    });

    it('throws error for bad values', () => {
        expect(() => assertNonNullable(undefined)).toThrowError();
        expect(() => assertNonNullable(null)).toThrowError();
    });
});
