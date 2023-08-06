import {describe, expect, it} from '@jest/globals';
import {isBoolean} from '../src';

describe('isBoolean', () => {
    it('works', () => {
        expect(isBoolean(false)).toBe(true);
        expect(isBoolean(true)).toBe(true);
        expect(isBoolean(Boolean(true))).toBe(true);
        expect(isBoolean(Boolean(false))).toBe(true);
        expect(isBoolean(Boolean('true'))).toBe(true);
        expect(isBoolean(Boolean('false'))).toBe(true);

        expect(isBoolean(undefined)).toBe(false);
        expect(isBoolean(null)).toBe(false);
        expect(isBoolean('')).toBe(false);
        expect(isBoolean('true')).toBe(false);
        expect(isBoolean('false')).toBe(false);
        expect(isBoolean([])).toBe(false);
        expect(isBoolean({})).toBe(false);
        expect(isBoolean(NaN)).toBe(false);
        expect(isBoolean(Infinity)).toBe(false);
    });
});
