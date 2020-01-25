import { lcFirst, ucFirst } from "change-case";
import { t } from "testcafe";
import is from "@sindresorhus/is";

/**
 * Represents result of validation.
 */
export type ValidationResult<T> = { error?: string; value: T };

export function valid<T>(validationResult: ValidationResult<T>): boolean {
  return is.undefined(validationResult.error);
}

/**
 * When `value` is an array it returned as-is, otherwise it returned wrapped
 * in an array.
 *
 * @todo Unused and not work as type guard. Remove?
 */
export function asArray<T>(value: T | T[]): T[] {
  return is.array(value) ? value : [value];
}

// /**
//  * Enum of TestCafe assertions.
//  */
// export enum TestCafeAssertion {
//   Eql,
//   NotEql,
//   Ok,
//   NotOk,
//   Contains,
//   NotContains,
//   TypeOf,
//   NotTypeOf,
//   Gt,
//   Gte,
//   Lt,
//   Lte,
//   Within,
//   NotWithin,
//   Match,
//   NotMatch
// }

// /**
//  * Returns name of TestCafe assertion depending on passed in options:
//  * - `isNot` -- when `true` assertion is negated, e.g., equal -> not equal
//  */
// export function toTestCafeAssertion(
//   assertion: TestCafeAssertion,
//   options: { isNot: boolean } = { isNot: false }
// ): string {
//   return lcFirst(
//     TestCafeAssertion[
//       options.isNot ? assertion + (assertion % 2 === 0 ? 1 : -1) : assertion
//     ]
//   );
// }

export type TestCafeAssertion = keyof ReturnType<typeof t.expect>;

export function testCafeAssertion(
  assertion: TestCafeAssertion,
  options: { isNot: boolean } = { isNot: false }
): TestCafeAssertion {
  if (options.isNot) {
    if (assertion === "gt") {
      return "lte";
    } else if (assertion === "gte") {
      return "lt";
    } else if (assertion === "lt") {
      return "gte";
    } else if (assertion === "lte") {
      return "gt";
    } else if (assertion.startsWith("not")) {
      return lcFirst(assertion.substr(3)) as TestCafeAssertion;
    } else {
      return `not${ucFirst(assertion)}` as TestCafeAssertion;
    }
  }

  return assertion;
}
