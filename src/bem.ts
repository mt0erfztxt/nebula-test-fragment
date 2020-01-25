import is from "@sindresorhus/is";

import { ValidationResult } from "./utils";

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

export function validateBemString(value: BemString): ValidationResult {
  if (is.emptyString(value) || value.trim().length === 0) {
    return "BEM string must have at least block part";
  }

  // Advancing from end of `value` in following steps:
  // 1. Modifier part
  // 2. Element part
  // 3. Block part

  let parts;

  // 1. Modifier part
  parts = value.split("--");

  const modParts = parts.slice(1);
  const modPartsLength = modParts.length;

  // BEM string can have at most one modifier part...
  if (modPartsLength > 1) {
    return (
      `BEM string can have only one modifier but it has ${modPartsLength} of them '` +
      modParts.join(", ") +
      "'"
    );
  }

  // ...and that part is optional.
  if (modPartsLength) {
    const mod = modParts[0];
    const modNameValueParts = mod
      .split("_")
      .filter(s => !is.emptyStringOrWhitespace(s));
    const modNameValuePartsLength = modNameValueParts.length;

    if (modNameValuePartsLength > 2) {
      return `BEM modifier can have only one value but it has ${modNameValuePartsLength -
        1} of them (${modNameValueParts.slice(1).join(", ")})`;
    }

    const [modName, modValue] = modNameValueParts;

    // BEM modifier name must be valid BEM name.
    if (!isValidBemName(modName)) {
      return `BEM modifier name must be a valid BEM name but it is '${modName}'`;
    }

    // BEM modifier value is optional or must be valid BEM name.
    if (modNameValuePartsLength === 2) {
      if (!isValidBemValue(modValue)) {
        return `BEM modifier value is optional or must be a BEM value but it is ${modValue}`;
      }
    }
  }

  // 2. Element part
  parts = parts[0].split("__");

  const eltParts = parts.slice(1);
  const eltPartsLength = eltParts.length;

  // BEM string can have at most one element part...
  if (eltPartsLength > 1) {
    return (
      `BEM string can have only one element but it has ${eltPartsLength} of them ` +
      eltParts.join(", ")
    );
  }

  // ...and that part is optional.
  if (eltPartsLength) {
    const elt = eltParts[0];
    if (!isValidBemName(elt)) {
      return `BEM element must be a BEM value but it is '${elt}'`;
    }
  }

  // 3. Block part
  const blk = parts[0];
  if (!isValidBemName(blk)) {
    return `BEM block must be a BEM name but it is '${blk}'`;
  }

  return null;
}

export function isValidBemString(value: BemString): boolean {
  return validateBemString(value) === null;
}
