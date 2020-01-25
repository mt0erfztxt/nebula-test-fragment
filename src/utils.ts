import { lcFirst } from "change-case";

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
