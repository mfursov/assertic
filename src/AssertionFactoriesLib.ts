import {
  ArrayConstraints,
  assertArray,
  Assertion,
  AssertionErrorProvider,
  assertObject,
  assertRecord,
  assertTruthy,
  callValueAssertion,
  getErrorMessage,
  ObjectAssertion,
  RecordConstraints,
  ValueAssertion,
} from './Assertion';
import { assertString } from './AssertionsLib';

/** Wraps an object assertion as a value assertion. */
export function objectAssertion<ObjectType>(
  objectTypeAssertion: ObjectAssertion<ObjectType>,
  errorContextProvider: AssertionErrorProvider | undefined = undefined,
): ValueAssertion<ObjectType> {
  return o => assertObject(o, objectTypeAssertion, errorContextProvider);
}

/**
 *  Creates an ValueAssertion for an array.
 *  The assertion check checks that array is defined,
 *  satisfies the `constraints` and every element of the array passes the `elementAssertion` check.
 */
export function arrayAssertion<T>(elementAssertion: Assertion<T>, constraints: ArrayConstraints<T> = {}): ValueAssertion<Array<T>> {
  const { minLength, maxLength } = constraints;
  assertTruthy(
    (minLength ?? 0) <= (maxLength ?? Infinity),
    `minLength must be < maxLength! minLength ${minLength}, maxLength: ${maxLength}`,
  );
  assertTruthy((minLength ?? 0) >= 0, `minLength must be a positive number: ${minLength}`);
  assertTruthy((maxLength ?? 0) >= 0, `maxLength must be a positive number: ${maxLength}`);
  return (array: unknown, errorContextProvider: AssertionErrorProvider | undefined = undefined): asserts array is Array<T> => {
    assertArray(array, elementAssertion, constraints, errorContextProvider);
  };
}

/** Creates a value assertion for the record of elements where each of the elements passes `valueAssertion` check. */
export function recordAssertion<RecordValueType>(
  valueAssertion: Assertion<RecordValueType>,
  constraints: RecordConstraints<RecordValueType> = {},
): ValueAssertion<Record<string, RecordValueType>> {
  return (
    value: unknown,
    errorContextProvider: AssertionErrorProvider | undefined = undefined,
  ): asserts value is Record<string, RecordValueType> => {
    assertRecord(value, valueAssertion, constraints, errorContextProvider);
  };
}

/** Type of the checking function for *$v*. */
export type CheckFn<T> = (v: T) => boolean;

/**
 * Creates a new value assertion using *check* function.
 * The assertion accepts the value as valid if 'check(value)' returns true or throws an error otherwise.
 */
export function $a<T>(check: CheckFn<T> | CheckFn<unknown>, errorMessageProvider?: AssertionErrorProvider): ValueAssertion<T> {
  assertTruthy(typeof check === 'function', `"check" is not a function: ${check}`);
  return (value: unknown, errorContextProvider: AssertionErrorProvider | undefined = undefined): asserts value is T =>
    assertTruthy(check(value as T), () => {
      let errorContext = getErrorMessage(errorContextProvider) || 'Check is failed';
      if (!errorContext.endsWith(':')) {
        errorContext += ':';
      }
      const errorMessage = getErrorMessage(errorMessageProvider);
      return `${errorContext} ${errorMessage || (typeof value === 'object' ? '[object]' : `'${value}'`)}`;
    });
}

/**
 * Creates a new value assertion using *check* function.
 * The assertion accepts the value as valid if 'check(value)' returns true or throws an error otherwise.
 *
 * Note: same as `$a` but forces processing of the check function argument as `unknown`.
 */
export function $u<T>(check: CheckFn<unknown>, errorMessageProvider?: AssertionErrorProvider): ValueAssertion<T> {
  return $a(check, errorMessageProvider);
}

/**
 *  Creates an assertion that makes comparison by reference with the *expectedValue* before calling *orAssertion*.
 *  If comparison with the *expectedValue* succeeds, does not call the *orAssertion*.
 */
export function valueOr<T>(expectedValue: T, orAssertion: Assertion<T>): Assertion<T> {
  return (value: unknown, errorContextProvider: AssertionErrorProvider | undefined = undefined): asserts value is T => {
    if (value === expectedValue) return;
    if (typeof orAssertion === 'object') {
      assertObject(value, orAssertion, errorContextProvider);
    } else {
      callValueAssertion(value, orAssertion, errorContextProvider);
    }
  };
}

/** Creates an assertion that succeeds if the value is *undefined* or calls  *orAssertion* if the value is not *undefined*. */
export function undefinedOr<T>(orAssertion: Assertion<T>): Assertion<T | undefined> {
  return valueOr<T | undefined>(undefined, orAssertion as Assertion<undefined>);
}

/** Creates an assertion that succeeds if the value is *null* or calls  *orAssertion* if the value is not *undefined*. */
export function nullOr<T>(orAssertion: Assertion<T>): Assertion<T | null> {
  return valueOr<T | null>(null, orAssertion as Assertion<undefined>);
}

export interface StringConstraints {
  /** Minimum length of the string. Inclusive. */
  minLength?: number;
  /** Maximum length of the string. Inclusive. */
  maxLength?: number;
}

export const stringAssertion =
  (constraints: StringConstraints): ValueAssertion<string> =>
  (value: unknown, context = undefined): asserts value is string => {
    assertString(value, context);
    assertTruthy(
      value.length >= (constraints.minLength ?? 0),
      `${getErrorMessage(context)} length is too small: ${value.length} < ${constraints.minLength}`,
    );
    assertTruthy(
      value.length <= (constraints.maxLength ?? Infinity),
      `${getErrorMessage(context)} length is too large ${value.length} > ${constraints.maxLength}`,
    );
  };
