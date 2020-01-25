import is from "@sindresorhus/is";
import { lcFirst, ucFirst } from "change-case";
import { t } from "testcafe";

/**
 * Represents result of validation.
 */
export type ValidationResult<T> = { error?: string; value: T };

/**
 * Represents TestCafe's assertion.
 */
export type TestCafeAssertion = keyof ReturnType<typeof t.expect>;

/**
 * Returns name of TestCafe's assertion.
 *
 * @param assertion TestCafe's assertion
 * @param [options] Options
 * @param [options.isNot] If `true` assertion is negated
 *
 * @example
 * testCafeAssertion("ok") // "ok"
 * testCafeAssertion("ok", { isNot: true }) // "notOk"
 * testCafeAssertion("gte", { isNot: true }) // "lt"
 */
export function testCafeAssertion(
  assertion: TestCafeAssertion,
  options?: { isNot?: boolean }
): TestCafeAssertion {
  options = options || {};
  if (is.undefined(options.isNot)) {
    options.isNot = false;
  }

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
