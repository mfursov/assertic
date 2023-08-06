## Assertions and Validations for TypeScript

The `assertic` library provides a set of utilities to build type-safe and compile-time verified assertions in TypeScript.

The library has no external dependencies and is designed to be a lightweight drop-in for any existing project.

### Terminology

The library provides `checks`, `assertions`, and `assertion factories`.

#### Checks

A check is a function that accepts some `unknown` value and returns `true` or `false` as the result of the check: `<T>(value: unknown) => value is T;`

Examples of check functions: `isString`, `isEmail`, `isUuid`.

#### Assertions

An assertion checks that its parameter satisfies some rules and throws an error if the check fails.
Examples of assertions: `assertTruthy`, `assertString`, `assertEmail`.

#### Assertion Factories

An assertion factory is used to build a new custom assertion function.

Examples of assertion factories: `objectAssertion`, `arrayAssertion`, `stringAssertion`.

### Usage:

```typescript
import {assertTruthy} from './Assertion';

// Asserts that *value* is truthy.
const value: string | undefined = getStringOrUndefined();
assertTruthy(value, 'Expected value is not set!');
// Now *value* is 'string'. The assertion removed the 'undefined' type.

```

```typescript
import {truthy} from './Assertion';

// Asserts that *value* is truthy.
const value: string = truthy(getStringOrUndefined());
// Now *value* is 'string'. The assertion removed the 'undefined' type.
```

Asserting (validating) unknown JSON:

```typescript
import {assertObject} from './Assertion';
import {assertNumber, assertString} from './AssertionsLib';

interface ExpectedType {
    name: string;
    count: number;
}

const someObject: unknown = {}; // Some data with unknown type. For example, passed as JSON input to an HTTP endpoint.
assertObject<ExpectedType>(someObject, {name: assertString, count: assertNumber});
// *someObject* has ExpectedType here.
const {name, count} = someObject;
```

And for arrays too:

```typescript
import {assertArray} from './Assertion';
import {assertNumber} from './AssertionsLib';

type ExpectedElementType = number;
const someArray: unknown = []; // Some data with unknown type. For example, passed as JSON input to an HTTP endpoint.

assertArray<ExpectedElementType>(someObject, assertNumber, {minLength: 1});
// *someArray* has Array<ExpectedElementType> here.
const {name, count} = someObject;
```

Check [unit tests](https://github.com/mfursov/assertic/tree/master/tests) for more examples.
