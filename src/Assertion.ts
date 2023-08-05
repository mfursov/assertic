import {checkArrayHasUniqueElements} from './ChecksLib';

/** Lazy error message provider. */
export type AssertionErrorProvider = (() => string) | string;

/** Asserts that the *param* value is truthy using '!' operator or throws an Error.  */
export function assertTruthy(value: unknown, error?: AssertionErrorProvider): asserts value {
    if (!value) {
        fail(error);
    }
}

/**
 * Casts the 'value' to a non-nullable type or throws an error.
 * Uses 'assertTruthy' to make the check.
 */
export function truthy<T>(value: T, error?: AssertionErrorProvider): NonNullable<T> {
    assertTruthy(value, error);
    return value as NonNullable<T>;
}

export function fail(error?: AssertionErrorProvider): never {
    const errorMessage = getErrorMessage(error);
    throw new Error(errorMessage ?? 'Assertion error');
}

/** Returns validation context as a string. Calls contextProvider() if needed. */
export function getErrorMessage(errorProvider: AssertionErrorProvider | undefined): string {
    if (errorProvider === undefined) {
        return '';
    }
    return typeof errorProvider === 'string' ? errorProvider : errorProvider();
}


export type Assertion<T> = ValueAssertion<T> | ObjectAssertion<T>;

/**
 * Checks that the *value* type is correct and throws error if not.
 * The assertion uses optional *errorProvider* to get the error message.
 */
export type ValueAssertion<ValueType> =
    (value: unknown, errorContextProvider?: AssertionErrorProvider) => asserts value is ValueType;

/**
 * Compile-time checked set of assertions for every object field in the type.
 * If the optional '$o' field is provided, the $o() is called after all fields assertions are finished.
 */
export type ObjectAssertion<ObjectType> = {
    [key in keyof Required<ObjectType>]: Assertion<ObjectType[key]>;
} & { $o?: ObjectCrossFieldAssertion<ObjectType> };

/**
 * Dedicated assertion type for *$o* field in *ObjectAssertion*.
 * Accepts an object with all fields individually checked and checks cross-field rules.
 * Throws an error if the check fails.
 */
export type ObjectCrossFieldAssertion<ValueType> = (value: ValueType, errorProvider?: AssertionErrorProvider) => void;

export interface ObjectAssertionConstraints {
    /** Makes *assertObject()* function to fail if *value* has any properties not covered by the specified object type. */
    failOnMissedFields?: boolean;
}

/**
 * Asserts that the object satisfies the schema using individual field assertions.
 * Throws an error if not.
 * Works only with non-array objects: use 'assertArray' to check arrays.
 */
export function assertObject<ObjectType>(value: unknown,
                                         objectAssertion: ObjectAssertion<ObjectType>,
                                         errorContextProvider: AssertionErrorProvider | undefined = undefined,
                                         constraints: ObjectAssertionConstraints = {}
): asserts value is ObjectType {
    const ctx = (): string => { return getErrorMessage(errorContextProvider); };
    const errorWithContext = (message: string): string => {
        const context = ctx();
        return context.length === 0 ? message : `${context} ${message}`;
    };
    assertTruthy(typeof value === 'object', () => errorWithContext(`is not an object: ${typeof value}`));
    assertTruthy(value !== undefined, () => errorWithContext(`is not defined`));
    assertTruthy(value !== null, () => errorWithContext(`is null`));
    assertTruthy(!Array.isArray(value), () => errorWithContext(`is an array.`));
    const assertionEntries = Object.entries(objectAssertion);
    if (constraints.failOnMissedFields) {
        for (const objectFieldName in value) {
            assertTruthy(assertionEntries.some(([assertionFieldName]) => objectFieldName === assertionFieldName),
                errorWithContext(`property can't be checked: ${objectFieldName}`));
        }
    }
    let $o: ObjectCrossFieldAssertion<ObjectType> | undefined;
    for (const [fieldKey, fieldAssertion] of assertionEntries) {
        assertTruthy(typeof fieldAssertion === 'function' ||
            (typeof fieldAssertion === 'object' && fieldAssertion !== null),
            () => `${ctx()}.${fieldKey} assertion is not an object or a function: ${typeof fieldAssertion}`);

        const fieldValue: unknown = (value as Record<string, unknown>)[fieldKey];
        const fieldCtx: AssertionErrorProvider = () => `${ctx()}.${fieldKey}`;
        if (typeof fieldAssertion === 'object') {
            assertTruthy(!Array.isArray(fieldValue), () => `${ctx()}.${fieldCtx()} use createArrayAssertion() to create a ValueAssertion for an array`);
            assertObject(fieldValue, fieldAssertion, fieldCtx);
        } else {
            assertTruthy(typeof fieldAssertion === 'function', () => `${ctx()}.${fieldCtx()} assertion is not a function`);
            if (fieldKey === '$o') {
                $o = fieldAssertion; // Will be run last.
            } else {
                const checkResult = (fieldAssertion as ValueAssertion<unknown>)(fieldValue, fieldCtx);
                assertTruthy(checkResult === undefined, `Assertion function must assert (void) but it returns a value: ${checkResult}. Wrap with $v()?`);
            }
        }
    }
    if ($o) {
        $o(value as unknown as ObjectType, errorContextProvider);
    }
}

export interface ArrayConstraints<T = unknown> {
    /** Minimum array length. Inclusive. */
    minLength?: number;
    /** Maximum array length. Inclusive. */
    maxLength?: number;

    /**
     * If provided, the array is checked to have only unique elements.
     * This function must return the identity of the element. See checkArrayHasUniqueElements.
     */
    uniqueByIdentity?: (element: T) => string;
}

/**
 * Asserts that the *value* is an array and every element in the array satisfy to the *elementAssertion*.
 * Throws error if check fails.
 */
export function assertArray<T>(value: unknown,
                               elementAssertion: Assertion<T>,
                               constraints: ArrayConstraints<T> = {},
                               errorContextProvider: AssertionErrorProvider | undefined = undefined,
): asserts value is Array<T> {
    const ctx = (mode: 'with-space-separator' | 'no-space-separator' = 'with-space-separator'): string => {
        const text = getErrorMessage(errorContextProvider);
        return text ? `${text}${mode === 'with-space-separator' ? ' ' : ''}` : '';
    };
    assertTruthy(Array.isArray(value), () => `${ctx()}value is not an array: ${value}`);
    const minLength = constraints.minLength ?? 0;
    const maxLength = constraints.maxLength ?? Infinity;
    assertTruthy(value.length >= minLength, () => `${ctx()}array length < minLength. Array length: ${value.length}, minLength: ${minLength}`);
    assertTruthy(value.length <= maxLength, () => `${ctx()}array length > maxLength. Array length: ${value.length}, maxLength: ${maxLength}`);
    if (constraints.uniqueByIdentity) {
        assertTruthy(checkArrayHasUniqueElements(value, constraints.uniqueByIdentity), () => `${ctx()}array contains non-unique elements`);
    }
    let i = 0;
    const elementErrorProvider: AssertionErrorProvider = () => `${ctx('no-space-separator')}[${i}]`;
    for (; i < value.length; i++) {
        const element: unknown = value[i];
        if (typeof elementAssertion === 'object') {
            assertTruthy(!Array.isArray(element), () => `${elementErrorProvider}: use createArrayAssertion() to create a ValueAssertion for an array`);
            assertObject(element, elementAssertion, elementErrorProvider);
        } else {
            callValueAssertion(element, elementAssertion, elementErrorProvider);
        }
    }
}

/**
 * Calls the assertion.
 * Workaround for TS issue with assertion on genetic arrow function. See https://github.com/microsoft/TypeScript/issues/34523.
 */
export function callValueAssertion<T>(value: unknown,
                                      valueAssertion: ValueAssertion<T>,
                                      errorContextProvider: AssertionErrorProvider | undefined
): asserts value is T {
    valueAssertion(value, errorContextProvider);
}
