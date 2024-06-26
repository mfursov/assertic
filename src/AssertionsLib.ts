import { AssertionErrorProvider, assertTruthy, getAssertionErrorFromProvider, ValueAssertion } from './Assertion';
import { isBoolean, isEmail, isHexString, isNonNullable, isNumber, isString, isUuid } from './ChecksLib';
import { formatValue } from './Formatter';

export function formatError(contextProvider: AssertionErrorProvider | undefined, message: string, value: unknown): string {
  const context = getAssertionErrorFromProvider(contextProvider);
  if (typeof context === 'object') {
    throw context;
  }
  const renderedValue = formatValue(value);
  return `${context ? `${context}: ` : ''}${message} ${renderedValue}`;
}

/*** Asserts that *value* is a *string*.  */
export const assertString: ValueAssertion<string> = (value: unknown, context = undefined): asserts value is string => {
  assertTruthy(isString(value), () => formatError(context, 'Not a string', value));
};

export const assertNumber: ValueAssertion<number> = (value: unknown, context = undefined): asserts value is number => {
  assertTruthy(isNumber(value), () => formatError(context, 'Not a number', value));
};

export const assertBoolean: ValueAssertion<boolean> = (value: unknown, context = undefined): asserts value is boolean => {
  assertTruthy(isBoolean(value), () => formatError(context, 'Not a boolean', value));
};

export const assertUuid: ValueAssertion<string> = (value: unknown, context = undefined): asserts value is string => {
  assertTruthy(isUuid(value), () => formatError(context, 'Invalid uuid', value));
};

export const assertHexString: ValueAssertion<string> = (value: unknown, context = undefined): asserts value is string => {
  assertTruthy(isHexString(value), () => formatError(context, 'Invalid hex string', value));
};

export const assertEmail: ValueAssertion<string> = (value: unknown, context = undefined): asserts value is string => {
  assertTruthy(isEmail(value), () => formatError(context, 'Invalid email', value));
};

/** Asserts that the `value` type is a `Date` object. */
export const assertDate: ValueAssertion<Date> = (value: unknown, context = undefined): asserts value is Date => {
  assertTruthy(value instanceof Date, () => formatError(context, 'Invalid Date', value));
};

export function assertNonNullable<T = unknown>(value: T, context?: AssertionErrorProvider): asserts value {
  assertTruthy(isNonNullable(value), () => formatError(context, `Value is ${value === undefined ? 'undefined' : 'null'}`, value));
}
