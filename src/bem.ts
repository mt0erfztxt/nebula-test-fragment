import is from "@sindresorhus/is";

import {
  failedValidationResult,
  successfulValidationResult,
  validationResult,
  ValidationResult
} from "./utils";

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

export function isBemObject(value: BemStructure): value is BemObject {
  return is.plainObject(value) && !isBemVector(value);
}

/**
 * Represents BEM string.
 */
export type BemString = string;

export function isBemString(value: BemStructure): value is BemString {
  return is.string(value);
}

/**
 * Represents BEM vector.
 */
export type BemVector = [BemBlock, BemElement?, BemModifier?];

export function isBemVector(value: BemStructure): value is BemVector {
  return is.array(value);
}

/**
 * Represents BEM structure.
 */
export type BemStructure = BemObject | BemString | BemVector;

export function validateBemName(value: BemName): ValidationResult {
  return validationResult(
    /^[a-zA-Z](:?[a-zA-Z0-9-]*[a-zA-Z0-9])$/.test(value) &&
      !/-{2,}/.test(value),
    "BEM name does not conform constraints"
  );
}

export function validateBemValue(value: BemValue): ValidationResult {
  return validationResult(
    /^(:?[a-zA-Z0-9]|[a-zA-Z0-9](:?[a-zA-Z0-9-]*[a-zA-Z0-9]))$/.test(value) &&
      !/-{2,}/.test(value),
    "BEM value does not conform constraints`"
  );
}

export function validateBemBlock(value: BemBlock): ValidationResult {
  return validationResult(
    validateBemName(value),
    "BEM block does not conform constraints"
  );
}

export function validateBemElement(value: BemElement): ValidationResult {
  return validationResult(
    validateBemName(value),
    "BEM element does not conform constraints"
  );
}

export function validateBemModifierName(value: BemName): ValidationResult {
  return validationResult(
    validateBemName(value),
    "BEM modifier's name does not conform constraints"
  );
}

export function validateBemModifierValue(value: BemValue): ValidationResult {
  return validationResult(
    validateBemValue(value),
    "BEM modifier's value does not conform constraints"
  );
}

export function validateBemModifier(value: BemModifier): ValidationResult {
  if (!is.array(value)) {
    return failedValidationResult(
      "BEM modifier must be a tuple of required BEM modifier name and " +
        "optional BEM modifier value"
    );
  }

  if (!validateBemModifierName(value[0]).valid) {
    return failedValidationResult("BEM modifier's name must be valid BEM name");
  }

  const modifierValue = value[1];
  if (
    !(
      is.undefined(modifierValue) ||
      validateBemModifierValue(modifierValue).valid
    )
  ) {
    return failedValidationResult(
      "BEM modifier's value is optional but must be valid BEM value when provided"
    );
  }

  return successfulValidationResult();
}

function validateBemObjectOrVector(
  value: BemObject | BemVector
): ValidationResult {
  let blk, elt, mod, structure: string;

  if (isBemVector(value)) {
    structure = "vector";
    [blk, elt, mod] = value;
  } else {
    structure = "object";
    blk = value.blk;
    elt = value.elt;
    mod = value.mod;
  }

  const fvr = (err?: string) =>
    failedValidationResult(`BEM ${structure} -- ${err}`);

  const { valid, error } = validateBemBlock(blk);
  if (!valid) {
    return fvr(error);
  }

  if (elt) {
    const { valid, error } = validateBemElement(elt);
    if (!valid) {
      return fvr(error);
    }
  }

  if (mod) {
    const { valid, error } = validateBemModifier(mod);
    if (!valid) {
      return fvr(error);
    }
  }

  return successfulValidationResult();
}

export function validateBemObject(value: BemObject): ValidationResult {
  return validateBemObjectOrVector(value);
}

export function validateBemVector(value: BemVector): ValidationResult {
  return validateBemObjectOrVector(value);
}

export function validateBemString(value: BemString): ValidationResult {
  const fvr = (err?: string) => failedValidationResult(`BEM string -- ${err}`);

  if (is.emptyString(value) || value.trim().length === 0) {
    return fvr("must have at least block part");
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
    return fvr(
      `can have only one modifier but ${modPartsLength} of them found -- ` +
        modParts.join(", ")
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
      return fvr(
        "modifier can have only one value but " +
          `${modNameValuePartsLength - 1} of them found -- ` +
          modNameValueParts.slice(1).join(", ")
      );
    }

    const [modName, modValue] = modNameValueParts;

    // BEM modifier name must be valid BEM name.
    if (!validateBemName(modName).valid) {
      return fvr(`modifier's name must be a valid BEM name -- ${modName}`);
    }

    // BEM modifier value is optional or must be valid BEM name.
    if (modNameValuePartsLength === 2) {
      if (!validateBemValue(modValue).valid) {
        return fvr(
          "modifier's value is optional but must be valid " +
            `BEM value when provided -- ${modValue}`
        );
      }
    }
  }

  // 2. Element part
  parts = parts[0].split("__");

  const eltParts = parts.slice(1);
  const eltPartsLength = eltParts.length;

  // BEM string can have at most one element part...
  if (eltPartsLength > 1) {
    return fvr(
      `only one element allowed but ${eltPartsLength} of them found -- ` +
        eltParts.join(", ")
    );
  }

  // ...and that part is optional.
  if (eltPartsLength) {
    const elt = eltParts[0];
    if (!validateBemName(elt).valid) {
      return validationResult(
        false,
        `element must be valid BEM name -- ${elt}`
      );
    }
  }

  // 3. Block part
  const blk = parts[0];
  if (!validateBemName(blk).valid) {
    return validationResult(false, `block must be valid BEM name -- ${blk}`);
  }

  return validationResult(true);
}

export function validateBemStructure(value: BemStructure): ValidationResult {
  if (isBemString(value)) {
    return validateBemString(value);
  } else if (isBemVector(value)) {
    return validateBemVector(value);
  } else if (isBemObject(value)) {
    return validateBemObject(value);
  } else {
    return failedValidationResult(
      `Value must be a BEM object|string|vector -- ${value}`
    );
  }
}

export function toBemObject(value: BemStructure): BemObject {
  const { error } = validateBemStructure(value);
  if (error) {
    throw new Error(error);
  }

  if (isBemObject(value)) {
    return value;
  }

  if (isBemString(value)) {
    const [blkAndEltPart, modPart] = value.split("--");
    const [blk, elt] = blkAndEltPart.split("__");

    const bemObj: BemObject = { blk, elt };
    if (modPart) {
      bemObj.mod = modPart.split("_").filter(is.nonEmptyString) as BemModifier;
    }

    return bemObj;
  }

  return { blk: value[0], elt: value[1], mod: value[2] };
}

export function toBemString(value: BemStructure): BemString {
  const { error } = validateBemStructure(value);
  if (error) {
    throw new Error(error);
  }

  if (isBemString(value)) {
    return value;
  }

  const { blk, elt, mod } = isBemVector(value)
    ? { blk: value[0], elt: value[1], mod: value[2] }
    : value;

  let bemStr = blk;

  if (elt) {
    bemStr += `__${elt}`;
  }

  if (mod) {
    let [modName, modValue] = mod;

    bemStr += `--${modName}`;

    if (modValue) {
      bemStr += `_${modValue}`;
    }
  }

  return bemStr;
}

export function toBemVector(value: BemStructure): BemVector {
  const { error } = validateBemStructure(value);
  if (error) {
    throw new Error(error);
  }

  if (isBemVector(value)) {
    return value;
  }

  const { blk, elt, mod } = toBemObject(value);
  return [blk, elt, mod];
}
