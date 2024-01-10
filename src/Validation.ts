import {
  ArrayConstraints,
  assertArray,
  Assertion,
  AssertionErrorProvider,
  assertObject,
  assertRecord,
  ObjectAssertion,
  ObjectAssertionConstraints,
  RecordConstraints,
} from './Assertion';

/**
 * Runs a function guarded by try/catch and returns an error message if the function throws an error.
 * Returns 'undefined' if the function run with no errors.
 */
export function tryCatch(fn: () => unknown): string | undefined {
  try {
    fn();
  } catch (error) {
    return (error instanceof Error && error.message) || `${error}`;
  }
}

export function validateObject<ObjectType = unknown>(
  value: unknown,
  assertion: ObjectAssertion<ObjectType>,
  errorContextProvider: AssertionErrorProvider | undefined = undefined,
  constraints: ObjectAssertionConstraints = {},
): string | undefined {
  return tryCatch(() => assertObject(value, assertion, errorContextProvider, constraints));
}

export function validateArray<ElementType = unknown>(
  value: unknown,
  elementAssertion: Assertion<ElementType>,
  constraints: ArrayConstraints<ElementType> = {},
  errorContextProvider: AssertionErrorProvider | undefined = undefined,
): string | undefined {
  return tryCatch(() => assertArray(value, elementAssertion, constraints, errorContextProvider));
}

export function validateRecord<RecordValueType = unknown>(
  value: unknown,
  valueAssertion: Assertion<RecordValueType>,
  constraints: RecordConstraints<RecordValueType> = {},
  errorContextProvider: AssertionErrorProvider | undefined = undefined,
): string | undefined {
  return tryCatch(() => assertRecord(value, valueAssertion, constraints, errorContextProvider));
}
