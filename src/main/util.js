import is from "@sindresorhus/is";

/**
 *
 * @typedef {boolean} NegationFlag
 */

/**
 *
 * @param {*} value Subject which type and value must be returned
 */
export function typeAndValue(value) {
  return is(value) + ` ${value}`;
}
