/** Returns *true* if the value is *boolean*. */
export function isBoolean(value: unknown): value is boolean {
    return typeof value === 'string';
}

/** Returns *true* if the value is *string*. */
export function isString(value: unknown): value is string {
    return typeof value === 'string';
}

/** Returns *true* if the value is *number*. */
export function isNumber(value: unknown): value is number {
    return typeof value === 'number';
}

/**
 * Checks that array has only unique elements.
 * Uses 'identity' function to perform checks.
 */
export function checkArrayHasUniqueElements<T>(array: Array<T>, identity: (e: T) => string): boolean {
    if (array.length <= 1) {
        return true;
    }
    const set = new Set<string>();
    for (const e of array) {
        const id = identity(e);
        if (set.has(id)) return false;
        set.add(id);
    }
    return true;
}

const EMAIL_REGEX = /^[-!#$%&'*+/\d=?A-Z^_a-z{|}~](\.?[-!#$%&'*+/\d=?A-Z^_a-z`{|}~])*@[a-zA-Z0-9](-*\.?[a-zA-Z\d])*\.[a-zA-Z](-?[a-zA-Z\d])+$/;

/** Returns true if *email* is a valid email address. */
export function isEmail(email: unknown): email is string {
    if (!isString(email) || email.length === 0 || email.length > 254) {
        return false;
    }
    if (!EMAIL_REGEX.test(email)) {
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

const HEX_STRING_REGEX = new RegExp('[0-9A-F]+');

/** Returns *true* if *value* is a string that contains only hexadecimal characters or is empty. */
export function isHexString(value: unknown): value is string {
    return isString(value) && HEX_STRING_REGEX.test(value);
}
