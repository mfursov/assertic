import {describe, expect, it} from '@jest/globals';
import {assertBoolean} from '../src';

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
