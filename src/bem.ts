import is from "@sindresorhus/is";

export type BemName = string;
export type BemValue = string;

export type BemBlock = BemName;
export type BemElement = BemName;
export type BemModifier = [BemName, BemValue?];

export type BemObject = { blk: BemBlock; elt?: BemElement; mod?: BemModifier };
export type BemString = string;
export type BemVector = [BemBlock, BemElement?, BemModifier?];

/**
 * Returns `true` when `value` is valid BEM name -- a non-empty
 * alpha-numeric-dashed string that starts and ends with a letter, and doesn't
 * contain sibling dashes, otherwise returns `false`.
 */
export function isValidBemName(value: BemName): boolean {
  return (
    /^[a-zA-Z](:?[a-zA-Z0-9-]*[a-zA-Z0-9])$/.test(value) && !/-{2,}/.test(value)
  );
}

/**
 * Returns `true` when `value` is valid BEM value -- a non-empty
 * alpha-numeric-dashed string that starts and ends with a letter or a digit
 * and doesn't contain sibling dashes, otherwise returns `false`.
 */
export function isValidBemValue(value: BemValue): boolean {
  return (
    /^(:?[a-zA-Z0-9]|[a-zA-Z0-9](:?[a-zA-Z0-9-]*[a-zA-Z0-9]))$/.test(value) &&
    !/-{2,}/.test(value)
  );
}

/**
 * Returns `true` when `value` is valid BEM block -- just a BEM name, otherwise
 * returns `false`.
 */
export function isValidBemBlock(value: BemBlock): boolean {
  return isValidBemName(value);
}

/**
 * Returns `true` when `value` is valid BEM element -- just a BEM name,
 * otherwise returns `false`.
 */
export function isValidBemElement(value: BemElement): boolean {
  return isValidBemName(value);
}

/**
 * Returns `true` when `value` is valid BEM modifier -- an array of required
 * BEM modifier name and optional BEM modifier value, otherwise returns `false`.
 */
export function isValidBemModifier(value: BemModifier): boolean {
  return (
    is.array(value) &&
    isValidBemModifierName(value[0]) &&
    (is.nullOrUndefined(value[1]) || isValidBemModifierValue(value[1]))
  );
}

/**
 * Returns `true` when `value` is valid BEM modifier name -- just a BEM name,
 * otherwise returns `false`.
 */
export function isValidBemModifierName(value: BemName): boolean {
  return isValidBemName(value);
}

/**
 * Returns `true` when `value` is valid BEM modifier value -- just a BEM value,
 * otherwise returns `false`.
 */
export function isValidBemModifierValue(value: BemValue): boolean {
  return isValidBemValue(value);
}

/**
 * Returns `true` when `value` is valid BEM object, otherwise returns `false`.
 */
export function isValidBemObject(value: BemObject): boolean {
  const { blk, elt, mod } = value;
  return (
    isValidBemBlock(blk) &&
    (is.nullOrUndefined(elt) || isValidBemElement(elt)) &&
    (is.nullOrUndefined(mod) || isValidBemModifier(mod))
  );
}
