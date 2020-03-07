import is from "@sindresorhus/is";

/**
 * Returns `true` when value is a non-blank string and `false` otherwise.
 *
 * @param {*} value A value to check.
 * @returns {boolean}
 */
export function isNonBlankString(value) {
  return is.string(value) && !is.emptyStringOrWhitespace(value);
}

/**
 * Returns `true` when subject looks like TestCafe selector and `false`
 * otherwise.
 *
 * @param {*} subject A subject to test.
 * @returns {boolean}
 */
export function isTestCafeSelector(subject) {
  return is.object(subject) && is.function_(subject.withExactText);
}

/**
 * Returns string with value's type and value itself separated by space.
 *
 * @param {*} subject A subject which type and value must be returned.
 * @returns {string}
 */
export function typeAndValue(subject) {
  return `${is(subject)} ${subject}`;
}
