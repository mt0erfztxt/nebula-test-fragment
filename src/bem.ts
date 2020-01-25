import is from "@sindresorhus/is";

/**
 * Returns `true` when `value` is a BEM name, otherwise returns `false`.
 *
 * BEM name -- a non-empty alpha-numeric-dashed string that starts and ends with
 * a letter, and doesn't contain sibling dashes.
 */
export function isBemName(value: unknown): boolean {
  if (is.string(value)) {
    return (
      /^[a-zA-Z](:?[a-zA-Z0-9-]*[a-zA-Z0-9])$/.test(value) &&
      !/-{2,}/.test(value)
    );
  } else {
    return false;
  }
}

/**
 * Returns `true` when `value` is a BEM value, otherwise returns `false`.
 *
 * BEM value -- a non-empty alpha-numeric-dashed string that starts and ends
 * with a letter or a digit and doesn't contain sibling dashes.
 */
export function isBemValue(value: unknown): boolean {
  if (is.string(value)) {
    return (
      /^(:?[a-zA-Z0-9]|[a-zA-Z0-9](:?[a-zA-Z0-9-]*[a-zA-Z0-9]))$/.test(value) &&
      !/-{2,}/.test(value)
    );
  } else {
    return false;
  }
}

/**
 * Returns `true` when `value` is a BEM block, otherwise returns `false`.
 *
 * BEM block -- just a BEM name.
 */
export function isBemBlock(value: unknown) {
  return isBemName(value);
}

/**
 * Returns `true` when `value` is a BEM element, otherwise returns `false`.
 *
 * BEM element -- just a BEM name.
 */
export function isBemElement(value: unknown) {
  return isBemName(value);
}

/**
 * Returns `true` when `value` is a BEM modifier, otherwise returns `false`.
 *
 * BEM modifier -- an array of required BEM modifier name and optional BEM
 * modifier value.
 */
export function isBemModifier(value: unknown) {
  return (
    is.array(value) &&
    isBemModifierName(value[0]) &&
    (is.nullOrUndefined(value[1]) || isBemModifierValue(value[1]))
  );
}

/**
 * Returns `true` when `value` is a BEM modifier name, otherwise returns
 * `false`.
 *
 * BEM modifier name -- just a BEM name.
 */
export function isBemModifierName(value: unknown) {
  return isBemName(value);
}

/**
 * Returns `true` when `value` is a BEM modifier value, otherwise returns
 * `false`.
 *
 * BEM modifier value -- just a BEM value.
 */
export function isBemModifierValue(value: unknown) {
  return isBemValue(value);
}
