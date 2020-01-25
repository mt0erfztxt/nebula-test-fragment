import { lcFirst } from "change-case";
import is from "@sindresorhus/is";

/**
 * Represents result of validation.
 */
export type ValidationResult = { valid: boolean; error?: string };

/**
 * Creates `ValidationResult`.
 * @param valid Determines whether validation was successful or not. When it's a `ValidationResult` its `valid` property is used.
 * @param error Overrides default error message, which is 'Validation error'
 */
export function validationResult(
  valid: boolean | ValidationResult,
  error?: string
): ValidationResult {
  const result: ValidationResult = {
    valid: is.boolean(valid) ? valid : valid.valid
  };

  if (!result.valid) {
    result.error = is.undefined(error) ? "Validation error" : error;
  }

  return result;
}

export function failedValidationResult(error?: string): ValidationResult {
  return validationResult(false, error);
}

export function successfulValidationResult(): ValidationResult {
  return validationResult(true);
}

/**
 * When `value` is an array it returned as-is, otherwise it returned wrapped
 * in an array.
 */
export function asArray<T>(value: T | T[]): T[] {
  return Array.isArray(value) ? value : [value];
}

/**
 * Enum of TestCafe assertions.
 */
export enum TestCafeAssertion {
  Eql,
  NotEql,
  Ok,
  NotOk,
  Contains,
  NotContains,
  TypeOf,
  NotTypeOf,
  Gt,
  Gte,
  Lt,
  Lte,
  Within,
  NotWithin,
  Match,
  NotMatch
}

/**
 * Returns name of TestCafe assertion depending on passed in options:
 * - `isNot` -- when `true` assertion is negated, e.g., equal -> not equal
 */
export function toTestCafeAssertionName(
  assertion: TestCafeAssertion,
  options: { isNot: boolean } = { isNot: false }
): string {
  return lcFirst(
    TestCafeAssertion[
      options.isNot ? assertion + (assertion % 2 === 0 ? 1 : -1) : assertion
    ]
  );
}
