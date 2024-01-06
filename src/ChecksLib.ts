/** Returns `true` if the value is `boolean`. */
export function isBoolean(value: unknown): value is boolean {
  return typeof value === 'boolean';
}

/** Returns `true` if the value is `string`. */
export function isString(value: unknown): value is string {
  return typeof value === 'string';
}

/** Returns `true` if the value is `number`. */
export function isNumber(value: unknown): value is number {
  return typeof value === 'number';
}

/** Returns `true` if the value is `Date` object. */
export function isDate(value: unknown): value is Date {
  return value instanceof Date;
}

/**
 * Checks that array has only unique elements.
 * Uses `identity` function to perform checks.
 */
export function checkArrayHasUniqueElements<T>(array: Array<T>, identity: (e: T) => string): boolean {
  if (array.length <= 1) {
    return true;
  }
  const set = new Set<string>();
  for (const e of array) {
    const id = identity(e);
    if (set.has(id)) {
      return false;
    }
    set.add(id);
  }
  return true;
}

/**
 * Checks if two arrays have equal elements.
 * Compares elements with by reference.
 * See `checkArraysHasEqualElementsByComparator` if you need to use a custom comparator.
 */
export function checkArraysHaveEqualElements<T>(array1: Array<T> | undefined, array2: Array<T> | undefined | null): boolean {
  return checkArraysHasEqualElementsByComparator(array1, array2, (e1, e2) => e1 === e2);
}

/**
 * Checks that two arrays have equal elements.
 * Returns `true` if all elements and their indexes are equal or false otherwise.
 * Uses `comparator` to compare the elements.
 */
export function checkArraysHasEqualElementsByComparator<T>(
  array1: Array<T> | undefined | null,
  array2: Array<T> | undefined | null,
  comparator: (e1: T, e2: T) => boolean,
): boolean {
  if (array1 === array2) {
    return true;
  }
  if (!array1 || !array2) {
    return false;
  }
  if (array1.length !== array2.length) {
    return false;
  }
  for (let i = 0; i < array1.length; i++) {
    if (!comparator(array1[i], array2[i])) {
      return false;
    }
  }
  return true;
}

const EMAIL_REGEX_REGULAR =
  /^[-!#$%&'*+/\d=?A-Z^_a-z{|}~](\.?[-!#$%&'*+/\d=?A-Z^_a-z`{|}~])*@[a-zA-Z0-9](-*\.?[a-zA-Z\d])*\.[a-zA-Z](-?[a-zA-Z\d])+$/;
// eslint-disable-next-line no-misleading-character-class
const EMAIL_REGEX_INTERNATIONAL =
  /^(?!\.)((?!.*\.{2})[a-zA-Z0-9\u0080-\u00FF\u0100-\u017F\u0180-\u024F\u0250-\u02AF\u0300-\u036F\u0370-\u03FF\u0400-\u04FF\u0500-\u052F\u0530-\u058F\u0590-\u05FF\u0600-\u06FF\u0700-\u074F\u0750-\u077F\u0780-\u07BF\u07C0-\u07FF\u0900-\u097F\u0980-\u09FF\u0A00-\u0A7F\u0A80-\u0AFF\u0B00-\u0B7F\u0B80-\u0BFF\u0C00-\u0C7F\u0C80-\u0CFF\u0D00-\u0D7F\u0D80-\u0DFF\u0E00-\u0E7F\u0E80-\u0EFF\u0F00-\u0FFF\u1000-\u109F\u10A0-\u10FF\u1100-\u11FF\u1200-\u137F\u1380-\u139F\u13A0-\u13FF\u1400-\u167F\u1680-\u169F\u16A0-\u16FF\u1700-\u171F\u1720-\u173F\u1740-\u175F\u1760-\u177F\u1780-\u17FF\u1800-\u18AF\u1900-\u194F\u1950-\u197F\u1980-\u19DF\u19E0-\u19FF\u1A00-\u1A1F\u1B00-\u1B7F\u1D00-\u1D7F\u1D80-\u1DBF\u1DC0-\u1DFF\u1E00-\u1EFF\u1F00-\u1FFF\u20D0-\u20FF\u2100-\u214F\u2C00-\u2C5F\u2C60-\u2C7F\u2C80-\u2CFF\u2D00-\u2D2F\u2D30-\u2D7F\u2D80-\u2DDF\u2F00-\u2FDF\u2FF0-\u2FFF\u3040-\u309F\u30A0-\u30FF\u3100-\u312F\u3130-\u318F\u3190-\u319F\u31C0-\u31EF\u31F0-\u31FF\u3200-\u32FF\u3300-\u33FF\u3400-\u4DBF\u4DC0-\u4DFF\u4E00-\u9FFF\uA000-\uA48F\uA490-\uA4CF\uA700-\uA71F\uA800-\uA82F\uA840-\uA87F\uAC00-\uD7AF\uF900-\uFAFF.!#$%&'*+-/=?^_`{|}~\-\d]+)@(?!\.)([a-zA-Z0-9\u0080-\u00FF\u0100-\u017F\u0180-\u024F\u0250-\u02AF\u0300-\u036F\u0370-\u03FF\u0400-\u04FF\u0500-\u052F\u0530-\u058F\u0590-\u05FF\u0600-\u06FF\u0700-\u074F\u0750-\u077F\u0780-\u07BF\u07C0-\u07FF\u0900-\u097F\u0980-\u09FF\u0A00-\u0A7F\u0A80-\u0AFF\u0B00-\u0B7F\u0B80-\u0BFF\u0C00-\u0C7F\u0C80-\u0CFF\u0D00-\u0D7F\u0D80-\u0DFF\u0E00-\u0E7F\u0E80-\u0EFF\u0F00-\u0FFF\u1000-\u109F\u10A0-\u10FF\u1100-\u11FF\u1200-\u137F\u1380-\u139F\u13A0-\u13FF\u1400-\u167F\u1680-\u169F\u16A0-\u16FF\u1700-\u171F\u1720-\u173F\u1740-\u175F\u1760-\u177F\u1780-\u17FF\u1800-\u18AF\u1900-\u194F\u1950-\u197F\u1980-\u19DF\u19E0-\u19FF\u1A00-\u1A1F\u1B00-\u1B7F\u1D00-\u1D7F\u1D80-\u1DBF\u1DC0-\u1DFF\u1E00-\u1EFF\u1F00-\u1FFF\u20D0-\u20FF\u2100-\u214F\u2C00-\u2C5F\u2C60-\u2C7F\u2C80-\u2CFF\u2D00-\u2D2F\u2D30-\u2D7F\u2D80-\u2DDF\u2F00-\u2FDF\u2FF0-\u2FFF\u3040-\u309F\u30A0-\u30FF\u3100-\u312F\u3130-\u318F\u3190-\u319F\u31C0-\u31EF\u31F0-\u31FF\u3200-\u32FF\u3300-\u33FF\u3400-\u4DBF\u4DC0-\u4DFF\u4E00-\u9FFF\uA000-\uA48F\uA490-\uA4CF\uA700-\uA71F\uA800-\uA82F\uA840-\uA87F\uAC00-\uD7AF\uF900-\uFAFF\-.\d]+)((\.([a-zA-Z\u0080-\u00FF\u0100-\u017F\u0180-\u024F\u0250-\u02AF\u0300-\u036F\u0370-\u03FF\u0400-\u04FF\u0500-\u052F\u0530-\u058F\u0590-\u05FF\u0600-\u06FF\u0700-\u074F\u0750-\u077F\u0780-\u07BF\u07C0-\u07FF\u0900-\u097F\u0980-\u09FF\u0A00-\u0A7F\u0A80-\u0AFF\u0B00-\u0B7F\u0B80-\u0BFF\u0C00-\u0C7F\u0C80-\u0CFF\u0D00-\u0D7F\u0D80-\u0DFF\u0E00-\u0E7F\u0E80-\u0EFF\u0F00-\u0FFF\u1000-\u109F\u10A0-\u10FF\u1100-\u11FF\u1200-\u137F\u1380-\u139F\u13A0-\u13FF\u1400-\u167F\u1680-\u169F\u16A0-\u16FF\u1700-\u171F\u1720-\u173F\u1740-\u175F\u1760-\u177F\u1780-\u17FF\u1800-\u18AF\u1900-\u194F\u1950-\u197F\u1980-\u19DF\u19E0-\u19FF\u1A00-\u1A1F\u1B00-\u1B7F\u1D00-\u1D7F\u1D80-\u1DBF\u1DC0-\u1DFF\u1E00-\u1EFF\u1F00-\u1FFF\u20D0-\u20FF\u2100-\u214F\u2C00-\u2C5F\u2C60-\u2C7F\u2C80-\u2CFF\u2D00-\u2D2F\u2D30-\u2D7F\u2D80-\u2DDF\u2F00-\u2FDF\u2FF0-\u2FFF\u3040-\u309F\u30A0-\u30FF\u3100-\u312F\u3130-\u318F\u3190-\u319F\u31C0-\u31EF\u31F0-\u31FF\u3200-\u32FF\u3300-\u33FF\u3400-\u4DBF\u4DC0-\u4DFF\u4E00-\u9FFF\uA000-\uA48F\uA490-\uA4CF\uA700-\uA71F\uA800-\uA82F\uA840-\uA87F\uAC00-\uD7AF\uF900-\uFAFF]){2,63})+)$/i;

export interface EmailConstraints {
  allowInternationalDomains: boolean;
}

/** Returns true if *email* is a valid email address. */
export function isEmail(email: unknown, constraints: EmailConstraints = { allowInternationalDomains: false }): email is string {
  if (!isString(email) || email.length === 0 || email.length > 254) {
    return false;
  }
  const regex = constraints.allowInternationalDomains ? EMAIL_REGEX_INTERNATIONAL : EMAIL_REGEX_REGULAR;
  if (!regex.test(email)) {
    return false;
  }
  // Validate each part.
  const parts = email.split('@');
  if (parts[0].length > 64) {
    return false;
  }
  const domainParts = parts[1].split('.');
  return !domainParts.some(part => part.length > 63);
}

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/** Returns *true* if *value* is a valid 'uuid' (v1..v5) string. */
export function isUuid(value: unknown): value is string {
  return isString(value) && UUID_REGEX.test(value);
}

const HEX_STRING_REGEX = /^[0-9a-fA-F]*$/;

/** Returns *true* if *value* is a string that contains only hexadecimal characters or is empty. */
export function isHexString(value: unknown): value is string {
  return isString(value) && HEX_STRING_REGEX.test(value);
}

/** Returns true if value is not 'null' and not 'undefined'. */
export function isNonNullable<T = unknown>(value: T | undefined | null): value is NonNullable<T> {
  return value !== null && value !== undefined;
}
