import is from "@sindresorhus/is";

import { ValidationResult } from "./utils";

/**
 * Represents BEM name.
 *
 * Valid BEM name is a non-empty alpha-numeric-dashed string that starts and
 * ends with a letter, and doesn't contain sibling dashes.
 */
export type BemName = string;

/**
 * Represents BEM value.
 *
 * Valid BEM value is a non-empty alpha-numeric-dashed string that starts and
 * ends with a letter or a digit and doesn't contain sibling dashes.
 */
export type BemValue = string;

/**
 * Represents BEM block.
 *
 * Valid BEM block is a valid BEM name.
 */
export type BemBlock = BemName;

/**
 * Represents BEM element.
 *
 * Valid BEM element is a valid BEM name.
 */
export type BemElement = BemName;

/**
 * Represents BEM modifier.
 *
 * Valid BEM modifier is a two-elements tuple where first element is a required
 * BEM modifier name and second is an optional BEM modifier value.
 */
export type BemModifier = [BemModifierName, BemModifierValue?];

/**
 * Represents BEM modifier name.
 *
 * Valid BEM modifier name is a valid BEM name.
 */
export type BemModifierName = BemName;

/**
 * Represents BEM modifier value.
 *
 * Valid BEM modifier value is a valid BEM value.
 */
export type BemModifierValue = BemValue;

/**
 * Represents BEM object.
 */
export type BemObject = { blk: BemBlock; elt?: BemElement; mod?: BemModifier };

/**
 * Represents BEM string.
 */
export type BemString = string;

/**
 * Represents BEM vector.
 */
export type BemVector = [BemBlock, BemElement?, BemModifier?];

/**
 * Represents BEM structure.
 */
export type BemStructure = BemObject | BemString | BemVector;

export function validateBemName(value: BemName): ValidationResult {
  if (
    /^[a-zA-Z](:?[a-zA-Z0-9-]*[a-zA-Z0-9])$/.test(value) &&
    !/-{2,}/.test(value)
  ) {
    return null;
  }

  return `BEM name does not conform constraints`;
}

export function validateBemValue(value: BemValue): ValidationResult {
  if (
    /^(:?[a-zA-Z0-9]|[a-zA-Z0-9](:?[a-zA-Z0-9-]*[a-zA-Z0-9]))$/.test(value) &&
    !/-{2,}/.test(value)
  ) {
    return null;
  }

  return `BEM value does not conform constraints`;
}

export function validateBemBlock(value: BemBlock): ValidationResult {
  return validateBemName(value)
    ? `BEM block does not conform constraints`
    : null;
}

export function validateBemElement(value: BemElement): ValidationResult {
  return validateBemName(value)
    ? `BEM element does not conform constraints`
    : null;
}

export function validateBemModifierName(value: BemName): ValidationResult {
  return validateBemName(value)
    ? `BEM modifier name does not conform constraints`
    : null;
}

export function validateBemModifierValue(value: BemValue): ValidationResult {
  return validateBemValue(value)
    ? `BEM modifier value does not conform constraints`
    : null;
}

export function validateBemModifier(value: BemModifier): ValidationResult {
  if (!is.array(value)) {
    return (
      "BEM modifier must be a tuple of required BEM modifier name and " +
      "optional BEM modifier value"
    );
  }

  const [modifierName, modifierValue] = value;

  if (validateBemModifierName(modifierName)) {
    return "BEM modifier name must be valid BEM name";
  }

  if (
    !(
      is.undefined(modifierValue) ||
      validateBemModifierValue(modifierValue) === null
    )
  ) {
    return "BEM modifier value is optional but must be valid BEM value when provided";
  }

  return null;
}

export function validateBemObject(value: BemObject): ValidationResult {
  const { blk, elt, mod } = value;

  const blkError = validateBemBlock(blk);
  if (blkError) {
    return `BEM object - ${blkError}`;
  }

  if (elt) {
    const eltError = validateBemElement(elt);
    if (eltError) {
      return `BEM object - ${eltError}`;
    }
  }

  if (mod) {
    const modError = validateBemModifier(mod);
    if (modError) {
      return `BEM object - ${modError}`;
    }
  }

  return null;
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
    if (validateBemName(modName)) {
      return `BEM modifier name must be a valid BEM name but it is '${modName}'`;
    }

    // BEM modifier value is optional or must be valid BEM name.
    if (modNameValuePartsLength === 2) {
      if (validateBemValue(modValue)) {
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
    if (validateBemName(elt)) {
      return `BEM element must be a BEM value but it is '${elt}'`;
    }
  }

  // 3. Block part
  const blk = parts[0];
  if (validateBemName(blk)) {
    return `BEM block must be a BEM name but it is '${blk}'`;
  }

  return null;
}

export function validateBemVector(value: BemVector): ValidationResult {
  const [blk, elt, mod] = value;

  const blkError = validateBemBlock(blk);
  if (blkError) {
    return `BEM vector - ${blkError}`;
  }

  if (elt) {
    const eltError = validateBemElement(elt);
    if (eltError) {
      return `BEM vector - ${eltError}`;
    }
  }

  if (mod) {
    const modError = validateBemModifier(mod);
    if (modError) {
      return `BEM vector - ${modError}`;
    }
  }

  return null;
}

export function validateBemStructure(value: BemStructure): ValidationResult {
  if (is.string(value)) {
    return validateBemString(value);
  } else if (is.array(value)) {
    return validateBemVector(value);
  } else if (is.plainObject(value)) {
    return validateBemObject(value);
  } else {
    return (
      "value must be a BEM object, string or vector but it is " +
      `'${is(value)}'`
    );
  }
}

export function toBemObject(value: BemStructure): BemObject {
  const validationResult = validateBemStructure(value);
  if (validationResult) {
    throw new Error(validationResult);
  }

  if (is.string(value)) {
    const [blkAndEltPart, modPart] = value.split("--");
    const [blk, elt] = blkAndEltPart.split("__");

    return {
      blk,
      elt,
      mod: modPart
        ? (modPart.split("_").filter(is.nonEmptyString) as BemModifier)
        : undefined
    };
  } else if (is.array(value)) {
    const [blk, elt, mod] = value;
    return { blk, elt, mod };
  } else if (is.plainObject(value)) {
    return value;
  } else {
    throw new Error("That must not happen!");
  }
}
