import { describe, expect, it } from '@jest/globals';
import { stringAssertion } from '../src';

describe('stringAssertion', () => {
  const f = stringAssertion;

  it('to throw or not to throw', () => {
    expect(() => f({ minLength: 0 })('')).not.toThrow();
    expect(() => f({ minLength: 1 })('1')).not.toThrow();
    expect(() => f({ minLength: 0 })('1234')).not.toThrow();

    expect(() => f({ minLength: 1 })('')).toThrow();
    expect(() => f({ minLength: 10 })('5')).toThrow();

    expect(() => f({ maxLength: 10 })('')).not.toThrow();
    expect(() => f({ maxLength: 1 })('1')).not.toThrow();

    expect(() => f({ maxLength: 1 })('12')).toThrow();

    expect(() => f({ minLength: 1, maxLength: 2 })('1')).not.toThrow();
    expect(() => f({ minLength: 1, maxLength: 2 })('12')).not.toThrow();
    expect(() => f({ minLength: 1, maxLength: 2 })('123')).toThrow();

    expect(() => f({ minLength: 2, maxLength: 1 })('')).toThrow();
    expect(() => f({ minLength: 2, maxLength: 1 })('1')).toThrow();
    expect(() => f({ minLength: 2, maxLength: 1 })('12')).toThrow();
    expect(() => f({ minLength: 2, maxLength: 1 })('123')).toThrow();
  });
});
