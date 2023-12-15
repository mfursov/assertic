import {describe, expect, it} from '@jest/globals';
import {
    checkArrayHasUniqueElements,
    checkArraysHasEqualElementsByComparator,
    EmailConstraints,
    isBoolean,
    isEmail,
    isHexString,
    isNonNullable,
    isNumber,
    isString
} from '../src';

describe("ChecksLib", () => {
    describe('isBoolean', () => {
        it('returns true for a boolean values', () => {
            expect(isBoolean(false)).toBe(true);
            expect(isBoolean(true)).toBe(true);
            expect(isBoolean(Boolean(true))).toBe(true);
            expect(isBoolean(Boolean(false))).toBe(true);
            expect(isBoolean(Boolean('true'))).toBe(true);
            expect(isBoolean(Boolean('false'))).toBe(true);
        });

        it('returns false for non-boolean values', () => {
            expect(isBoolean(undefined)).toBe(false);
            expect(isBoolean(null)).toBe(false);
            expect(isBoolean('')).toBe(false);
            expect(isBoolean('true')).toBe(false);
            expect(isBoolean('false')).toBe(false);
            expect(isBoolean([])).toBe(false);
            expect(isBoolean({})).toBe(false);
            expect(isBoolean(NaN)).toBe(false);
            expect(isBoolean(Infinity)).toBe(false);
            expect(isBoolean(function () {})).toBe(false);
            expect(isBoolean(Symbol())).toBe(false);
        });
    });

    describe('isString', () => {
        it('returns true for a string value', () => {
            expect(isString('Hello')).toBe(true);
            expect(isString('')).toBe(true);
        });

        it('returns false for non-string values', () => {
            expect(isString(42)).toBe(false);
            expect(isString(null)).toBe(false);
            expect(isString(undefined)).toBe(false);
            expect(isString(true)).toBe(false);
            expect(isString({})).toBe(false);
            expect(isString([])).toBe(false);
            expect(isString(function () {})).toBe(false);
            expect(isString(Symbol())).toBe(false);
        });
    });


    describe('isNumber', () => {
        it('returns true for a number value', () => {
            expect(isNumber(42)).toBe(true);
            expect(isNumber(0)).toBe(true);
            expect(isNumber(-123.45)).toBe(true);
            expect(isNumber(Infinity)).toBe(true);
            expect(isNumber(-Infinity)).toBe(true);
            expect(isNumber(-NaN)).toBe(true);
        });

        it('returns false for non-number values', () => {
            expect(isNumber('Hello')).toBe(false);
            expect(isNumber(null)).toBe(false);
            expect(isNumber(undefined)).toBe(false);
            expect(isNumber(true)).toBe(false);
            expect(isNumber({})).toBe(false);
            expect(isNumber([])).toBe(false);
            expect(isNumber(function () {})).toBe(false);
            expect(isNumber(Symbol())).toBe(false);
        });
    });

    describe('checkArrayHasUniqueElements', () => {
        it('returns true for an array with unique elements based on identity', () => {
            const array: Array<{ id: string; }> = [{id: '1'}, {id: '2'}, {id: '3'}];
            expect(checkArrayHasUniqueElements(array, e => e.id)).toBe(true);
        });

        it('returns false for an array with duplicate elements based on identity', () => {
            const array = [1, 2, 3];
            expect(checkArrayHasUniqueElements(array, () => '')).toBe(false);
        });

        it('return true for an empty array', () => {
            const array: Array<{ id: string; }> = [];
            expect(checkArrayHasUniqueElements(array, e => e.id)).toBe(true);
        });

        it('handles non-object elements and different identity mapping', () => {
            const array = [1, 2, 3];
            expect(checkArrayHasUniqueElements(array, e => String(e))).toBe(true);
        });
    });


    describe('isEmail', () => {
        it('returns true for valid email addresses', () => {
            expect(isEmail('test@example.com')).toBe(true);
            expect(isEmail('user123@gmail.com')).toBe(true);
            expect(isEmail('info@website.co')).toBe(true);
        });

        it('returns false for invalid email addresses', () => {
            expect(isEmail('not_an_email')).toBe(false);
            expect(isEmail('invalid.email@')).toBe(false);
            expect(isEmail('@missing_username.com')).toBe(false);
            expect(isEmail('spaces @ in.email')).toBe(false);
        });

        it('returns false for non-string inputs', () => {
            expect(isEmail(123)).toBe(false);
            expect(isEmail(null)).toBe(false);
            expect(isEmail(undefined)).toBe(false);
            expect(isEmail({email: 'test@example.com'})).toBe(false);
        });

        it('returns true for valid email addresses with long domain names', () => {
            expect(isEmail('user@example.' + 'a'.repeat(63))).toBe(true);
            expect(isEmail('info@' + 'domain.'.repeat(20) + 'com')).toBe(true);
        });

        it('returns false for invalid email addresses with long domain names', () => {
            expect(isEmail('invalid@' + 'domain.'.repeat(64) + 'com')).toBe(false);
            expect(isEmail('long@' + 'domain.'.repeat(100) + 'org')).toBe(false);
        });

        const i18n: EmailConstraints = {allowInternationalDomains: true};
        it('returns true for valid email addresses with international domains', () => {
            // Cyrillic.
            expect(isEmail('user@example.рф')).toBe(false);
            expect(isEmail('user@example.рф', i18n)).toBe(true);
            expect(isEmail('медведь@с-балалайкой.рф', i18n)).toBe(true);

            // Arabic.
            expect(isEmail('info@مثال.إختبار')).toBe(false);
            expect(isEmail('info@مثال.إختبار', i18n)).toBe(true);

            // Chinese.
            expect(isEmail('contact@示例.测试')).toBe(false);
            expect(isEmail('contact@示例.测试', i18n)).toBe(true);
            expect(isEmail('我買@屋企.香港', i18n)).toBe(true);

            // Latin.
            expect(isEmail('Pelé@example.com')).toBe(false);
            expect(isEmail('Pelé@example.com', i18n)).toBe(true);

            // Greek.
            expect(isEmail('δοκιμή@παράδειγμα.δοκιμή')).toBe(false);
            expect(isEmail('δοκιμή@παράδειγμα.δοκιμή', i18n)).toBe(true);

            // Japanese.
            expect(isEmail('二ノ宮@黒川.日本')).toBe(false);
            expect(isEmail('二ノ宮@黒川.日本', i18n)).toBe(true);

            // Devanagari.
            expect(isEmail('संपर्क@डाटामेल.भारत')).toBe(false);
            expect(isEmail('संपर्क@डाटामेल.भारत', i18n)).toBe(true);
        });

        it('returns false for invalid email addresses with international domains', () => {
            expect(isEmail('invalid@示例', i18n)).toBe(false); // Invalid email format
            expect(isEmail('wrong@.рф', i18n)).toBe(false); // Invalid domain
            expect(isEmail('hello@مثال', i18n)).toBe(false); // Missing top-level domain
        });
    });

    function isUuid(value: unknown): value is string {
        if (typeof value !== 'string') {
            return false;
        }

        // A basic UUID regex pattern (matches UUID in the form "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx")
        const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
        return uuidRegex.test(value);
    }

    describe('isUuid', () => {
        it('returns true for valid UUID strings', () => {
            expect(isUuid('123e4567-e89b-12d3-a456-426655440000')).toBe(true);
            expect(isUuid('00000000-0000-0000-0000-000000000000')).toBe(true);
            expect(isUuid('abcdef12-abcd-abcd-abcd-abcdef123456')).toBe(true);
        });

        it('returns false for invalid UUID strings', () => {
            expect(isUuid('not-a-uuid')).toBe(false);
            expect(isUuid('123e4567-e89b-12d3-a456-42665544')).toBe(false);
            expect(isUuid('abcdef12-abcd-abcd-abcd-abcdef12345')).toBe(false);
            expect(isUuid(123)).toBe(false);
            expect(isUuid(null)).toBe(false);
            expect(isUuid(undefined)).toBe(false);
            expect(isUuid({uuid: '123e4567-e89b-12d3-a456-426655440000'})).toBe(false);
        });
    });

    describe('isHexString', () => {
        it('should return true for valid hexadecimal strings', () => {
            expect(isHexString('')).toBe(true);
            expect(isHexString('123456')).toBe(true);
            expect(isHexString('abcdef')).toBe(true);
            expect(isHexString('ABCDEF')).toBe(true);
        });

        it('should return false for non-hexadecimal strings', () => {
            expect(isHexString('not-a-hex-string')).toBe(false);
            expect(isHexString('1234567G')).toBe(false);
            expect(isHexString('0xabcdef')).toBe(false);
            expect(isHexString(123)).toBe(false);
            expect(isHexString(null)).toBe(false);
            expect(isHexString(undefined)).toBe(false);
            expect(isHexString({hex: 'abcdef'})).toBe(false);
        });
    });

    describe('isNonNullable', () => {
        it('should return false for undefined or null', () => {
            expect(isNonNullable(null)).toBe(false);
            expect(isNonNullable(undefined)).toBe(false);
        });
        it('should return true for non-undefined and non-null', () => {
            expect(isNonNullable({})).toBe(true);
            expect(isNonNullable(false)).toBe(true);
            expect(isNonNullable(0)).toBe(true);
            expect(isNonNullable(NaN)).toBe(true);
            expect(isNonNullable(Infinity)).toBe(true);
            expect(isNonNullable(() => 1)).toBe(true);
            expect(isNonNullable([])).toBe(true);
            expect(isNonNullable('')).toBe(true);
            expect(isNonNullable(true)).toBe(true);
            expect(isNonNullable(BigInt(0))).toBe(true);
        });
    });

    describe('checkArraysHasEqualElementsByComparator', () => {
        const comparator = <T>(e1: T, e2: T): boolean => e1 === e2;

        it('should return true for two identical arrays', () => {
            expect(checkArraysHasEqualElementsByComparator([1, 2, 3], [1, 2, 3], comparator)).toBe(true);
        });

        it('should return false for arrays with different elements', () => {
            expect(checkArraysHasEqualElementsByComparator([1, 2, 3], [3, 2, 1], comparator)).toBe(false);
        });

        it('should return false for arrays of different lengths', () => {
            expect(checkArraysHasEqualElementsByComparator([1, 2, 3], [1, 2], comparator)).toBe(false);
        });

        it('should return false for one null array and one non-null array', () => {
            expect(checkArraysHasEqualElementsByComparator(null, [1, 2, 3], comparator)).toBe(false);
        });

        it('should return true for two null arrays', () => {
            expect(checkArraysHasEqualElementsByComparator(null, null, comparator)).toBe(true);
        });

        it('should return true for two undefined arrays', () => {
            expect(checkArraysHasEqualElementsByComparator(undefined, undefined, comparator)).toBe(true);
        });

        it('should return false for one undefined array and one non-undefined array', () => {
            expect(checkArraysHasEqualElementsByComparator(undefined, [1, 2, 3], comparator)).toBe(false);
        });

        // Test with a custom comparator.
        const customComparator = (e1: number, e2: number): boolean => e1 % 2 === e2 % 2;
        it('should work with a custom comparator', () => {
            expect(checkArraysHasEqualElementsByComparator([2, 4, 6], [8, 10, 12], customComparator)).toBe(true);
        });
    });

});
