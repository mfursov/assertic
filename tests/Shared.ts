import { arrayAssertion, assertBoolean, assertNumber, assertString, ObjectAssertion, recordAssertion, undefinedOr } from '../src';

export interface CheckedType {
  requiredStringField: string;
  optionalNumberField?: number;

  requiredObjectField: CheckedSubType;
  optionalObjectField?: CheckedSubType;

  optionalObjectArray?: Array<CheckedSubType>;
  optionalStringArray?: string[];
  optionalRecordOfStrings?: Record<string, string>;
}

export const subTypeAssertion: ObjectAssertion<CheckedSubType> = {
  requiredNumberSubField: assertNumber,
  optionalBooleanSubField: undefinedOr(assertBoolean),
};

export const typeAssertion: ObjectAssertion<CheckedType> = {
  requiredStringField: assertString,
  optionalNumberField: undefinedOr(assertNumber),
  requiredObjectField: subTypeAssertion,
  optionalObjectField: undefinedOr(subTypeAssertion),
  optionalObjectArray: undefinedOr(arrayAssertion(subTypeAssertion)),
  optionalStringArray: undefinedOr(arrayAssertion(assertString)),
  optionalRecordOfStrings: undefinedOr(recordAssertion(assertString)),
};

export interface CheckedSubType {
  requiredNumberSubField: number;
  optionalBooleanSubField?: boolean;
}
