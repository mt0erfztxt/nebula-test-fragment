import is from "@sindresorhus/is";
import { typeAndValue } from "./util";

/**
 * Type representing BEM name.
 *
 * Valid BEM name is a non-empty alpha-numeric-dashed string that starts and
 * ends with a letter, and doesn't contain sibling dashes.
 *
 * @typedef {string} BemName
 */

/**
 * Type representing BEM value.
 *
 * Valid BEM value is a non-empty alpha-numeric-dashed string that starts and
 * ends with a letter or a digit and doesn't contain sibling dashes.
 *
 * @typedef {string} BemValue
 */

/**
 * Type representing BEM block.
 *
 * Valid BEM block is a valid BEM name.
 *
 * @typedef {BemName} BemBlock
 */

/**
 * Type representing BEM element.
 *
 * Valid BEM element is a valid BEM name.
 *
 * @typedef {BemName} BemElement
 */

/**
 * Type representing BEM modifier name.
 *
 * Valid BEM modifier name is a valid BEM name.
 *
 * @typedef {BemName} BemModifierName
 */

/**
 * Type representing BEM modifier's value.
 *
 * Valid BEM modifier's value is a valid BEM value.
 *
 * @typedef {BemValue} BemModifierValue
 */

/**
 * Type representing BEM modifier.
 *
 * Valid BEM modifier is a two-elements tuple where first element is a required
 * BEM modifier's name and second is an optional BEM modifier's value.
 *
 * @typedef {[BemModifierName, BemModifierValue]} BemModifier
 */

/**
 * Type representing BEM modifier requirement.
 *
 * @typedef {[BemModifierName, BemModifierValue, NegationFlag]} BemModifierRequirement
 */

/**
 * Type representing BEM object.
 *
 * @typedef BemObject
 * @type {Object}
 * @property {BemBlock} blk
 * @property {BemElement} [elt]
 * @property {BemModifier} [mod]
 */

/**
 * Type representing BEM string.
 *
 * @typedef {string} BemString
 */

/**
 * Type representing BEM vector.
 *
 * @typedef {[BemBlock, BemElement, BemModifier]} BemVector
 */

/**
 * Type representing BEM structure.
 *
 * @typedef {(BemObject|BemString|BemVector)} BemStructure
 */

/**
 * Returns `true` when argument is a BEM object, otherwise returns `false`.
 *
 * Note: any plain object is a BEM object, for validation use
 * {@link validateBemObject}.
 *
 * @param {BemStructure} bemStructure
 * @returns {boolean}
 */
export function isBemObject(bemStructure) {
  return is.plainObject(bemStructure);
}

/**
 * Returns `true` when argument is a BEM string, otherwise returns `false`.
 *
 * Note: any string is a BEM string, for validation use
 * {@link validateBemString}.
 *
 * @param {BemStructure} bemStructure
 * @returns {boolean}
 */
export function isBemString(bemStructure) {
  return is.string(bemStructure);
}

/**
 * Returns `true` when argument is a BEM vector, otherwise returns `false`.
 *
 * Note: any array is a BEM vector, for validation use
 * {@link validateBemVector}.
 *
 * @param {BemStructure} bemStructure
 * @returns {boolean}
 */
export function isBemVector(bemStructure) {
  return is.array(bemStructure);
}

/**
 * Validates that argument is valid BEM name.
 *
 * @param {BemName} bemName
 * @returns {{error: string, value: BemName}|{value: BemName}} Returns validation result.
 */
export function validateBemName(bemName) {
  const result = { value: bemName };
  const errorMessage = msg =>
    `BEM name: @ but it doesn't -- ${typeAndValue(bemName)}`.replace("@", msg);

  if (!is.string(bemName)) {
    result.error = errorMessage("must be a string");
  } else if (
    !(
      /^[a-zA-Z](:?[a-zA-Z0-9-]*[a-zA-Z0-9])$/.test(bemName) &&
      !/-{2,}/.test(bemName)
    )
  ) {
    result.error = errorMessage("must conform constraints");
  }

  return result;
}

/**
 * Validates that argument is valid BEM value.
 *
 * @param {BemValue} bemValue
 * @returns {{error: string, value: BemValue}|{value: BemValue}} Returns validation result.
 */
export function validateBemValue(bemValue) {
  const result = { value: bemValue };
  const errorMessage = msg =>
    `BEM value: @ but it doesn't -- ${typeAndValue(bemValue)}`.replace(
      "@",
      msg
    );

  if (!is.string(bemValue)) {
    result.error = errorMessage("must be a string");
  } else if (
    !(
      /^(:?[a-zA-Z0-9]|[a-zA-Z0-9](:?[a-zA-Z0-9-]*[a-zA-Z0-9]))$/.test(
        bemValue
      ) && !/-{2,}/.test(bemValue)
    )
  ) {
    result.error = errorMessage("must conform constraints");
  }

  return result;
}

/**
 * Validates that argument is valid BEM block.
 *
 * @param {BemBlock} bemBlock
 * @returns {{error: string, value: BemBlock}|{value: BemBlock}} Returns validation result.
 */
export function validateBemBlock(bemBlock) {
  const { error, value } = validateBemName(bemBlock);
  if (is.undefined(error)) {
    return { value };
  } else {
    return {
      error: `BEM block: ${error}`,
      value: bemBlock
    };
  }
}

/**
 * Validates that argument is valid BEM element.
 *
 * @param {BemElement} bemElement
 * @returns {{error: string, value: BemElement}|{value: BemElement}} Returns validation result.
 */
export function validateBemElement(bemElement) {
  const { error, value } = validateBemName(bemElement);
  if (is.undefined(error)) {
    return { value };
  } else {
    return {
      error: `BEM element: ${error}`,
      value: bemElement
    };
  }
}

/**
 * Validates that argument is valid BEM modifier's name.
 *
 * @param {BemModifierName} bemModifierName
 * @returns {{error: string, value: BemModifierName}|{value: BemModifierName}} Returns validation result.
 */
export function validateBemModifierName(bemModifierName) {
  const { error, value } = validateBemName(bemModifierName);
  if (is.undefined(error)) {
    return { value };
  } else {
    return {
      error: `BEM modifier's name: ${error}`,
      value: bemModifierName
    };
  }
}

/**
 * Validates that argument is valid BEM modifier's value.
 *
 * @param {BemModifierValue} bemModifierValue
 * @returns {{error: string, value: BemModifierValue}|{value: BemModifierValue}} Returns validation result.
 */
export function validateBemModifierValue(bemModifierValue) {
  const { error, value } = validateBemValue(bemModifierValue);
  if (is.undefined(error)) {
    return { value };
  } else {
    return {
      error: `BEM modifier's value: ${error}`,
      value: bemModifierValue
    };
  }
}

/**
 * Validates that argument is valid BEM modifier.
 *
 * @param {BemModifier} bemModifier
 * @returns {{error: string, value: BemModifier}|{value: BemModifier}} Returns validation result.
 */
export function validateBemModifier(bemModifier) {
  const result = { value: bemModifier };

  if (!is.array(bemModifier)) {
    result.error =
      "BEM modifier: must be an array but it doesn't -- " +
      typeAndValue(bemModifier);
    return result;
  }

  const bemModifierLength = bemModifier.length;
  if (bemModifierLength > 2) {
    result.error =
      `BEM modifier: can have only one BEM modifier value but it ` +
      `doesn't -- ${bemModifier[0]} ${bemModifier.slice(1).join(", ")}`;
    return result;
  }

  const [modName, modValue] = bemModifier;
  const value = [];

  const { error, value: n } = validateBemModifierName(modName);
  if (error) {
    result.error = `BEM modifier: ${error}`;
    return result;
  } else {
    value.push(n);
  }

  if (!is.undefined(modValue)) {
    const { error, value: v } = validateBemModifierValue(modValue);
    if (error) {
      result.error = `BEM modifier: optional ${error}`;
      return result;
    } else {
      value.push(v);
    }
  }

  return { value };
}

/**
 * Validates that argument is valid BEM modifier requirement.
 *
 * @param bemModifierRequirement
 * @returns {{error: string, value: BemModifierRequirement}|{value: BemModifierRequirement}} Returns validation result.
 */
export function validateBemModifierRequirement(bemModifierRequirement) {
  const result = { value: bemModifierRequirement };

  if (!is.array(bemModifierRequirement) || bemModifierRequirement.length > 3) {
    result.error =
      `BEM modifier requirement: must be an array of one, two or three ` +
      `elements but it doesn't -- ${typeAndValue(bemModifierRequirement)}`;
    return result;
  }

  const [modName, modValue, isNot = false] = bemModifierRequirement;
  const {
    error,
    value: [n, v]
  } = validateBemModifier([modName, modValue]);
  if (error) {
    result.error = `BEM modifier requirement: ${error}`;
    return result;
  }

  return { value: [n, v, isNot] };
}

/**
 * Just a common code used in BEM object and vector validation.
 *
 * @param {BemBlock} blk
 * @param {BemElement|undefined} elt
 * @param {BemModifier|undefined} mod
 * @param {boolean} isVector
 * @returns {string|undefined} Returns error on validation failure and `undefined` on validation success.
 */
function validateBemParts(blk, elt, mod, isVector) {
  const { error } = validateBemBlock(blk);
  if (error) {
    return error;
  }

  if (elt) {
    const { error } = validateBemElement(elt);
    if (error) {
      return error;
    }
  }

  if (mod) {
    const { error } = validateBemModifier(mod);
    if (error) {
      return error;
    }
  }
}

/**
 * Validates that argument is valid BEM object.
 *
 * @param {BemObject} bemObject
 * @returns {{error: string, value: BemObject}|{value: BemObject}} Returns validation result.
 */
export function validateBemObject(bemObject) {
  const result = { value: bemObject };

  if (!isBemObject(bemObject)) {
    result.error =
      "BEM object: must be a plain object but it doesn't -- " +
      typeAndValue(bemObject);
    return result;
  }

  const { blk, elt, mod } = bemObject;
  const error = validateBemParts(blk, elt, mod, false);
  if (error) {
    result.error = `BEM object: ${error}`;
  }

  return result;
}

/**
 * Validates that argument is valid BEM vector.
 *
 * @param {BemVector} bemVector
 * @returns {{error: string, value: BemVector}|{value: BemVector}} Returns validation result.
 */
export function validateBemVector(bemVector) {
  const result = { value: bemVector };

  if (!isBemVector(bemVector) || bemVector.length > 3) {
    result.error =
      `BEM vector: must be an array of one, two or three elements but it ` +
      `doesn't -- ${typeAndValue(bemVector)}`;
    return result;
  }

  const [blk, elt, mod] = bemVector;
  const error = validateBemParts(blk, elt, mod, false);
  if (error) {
    result.error = `BEM vector: ${error}`;
  }

  return result;
}

/**
 * Validates that argument is valid BEM string.
 *
 * @param bemString
 * @returns {{error: string, value: BemString}|{value: BemString}} Returns validation result.
 */
export function validateBemString(bemString) {
  /**
   *
   * @param error
   * @returns {{error: string, value: BemString}}
   */
  const f = error => ({
    error: `BEM string: ${error}`,
    value: bemString
  });

  if (!isBemString(bemString)) {
    return f(`must be a string but it doesn't -- ${typeAndValue(bemString)}`);
  }

  if (is.emptyStringOrWhitespace(bemString)) {
    return f(validateBemBlock(bemString).error);
  }

  // Advancing from end of `value` in following steps:
  // 1. Modifier part
  // 2. Element part
  // 3. Block part

  let parts;

  // 1. BEM modifier part
  parts = bemString.split("--");

  const modParts = parts.slice(1);
  const modPartsLength = modParts.length;

  // BEM string can have at most one BEM modifier...
  if (modPartsLength > 1) {
    return f(
      `can have only one BEM modifier but ${modPartsLength} of them found -- ` +
        modParts.join(", ")
    );
  }

  // ...and it is optional.
  if (modPartsLength) {
    const { error } = validateBemModifier(modParts[0].split("_"));
    if (error) {
      return f(error);
    }
  }

  // 2. BEM element part
  parts = parts[0].split("__");

  const eltParts = parts.slice(1);
  const eltPartsLength = eltParts.length;

  // BEM string can have at most one BEM element...
  if (eltPartsLength > 1) {
    return f(
      `can have only one BEM element but ${eltPartsLength} of them found -- ` +
        eltParts.join(", ")
    );
  }

  // ...and it is optional.
  if (eltPartsLength) {
    const { error } = validateBemElement(eltParts[0]);
    if (error) {
      return f(error);
    }
  }

  // 3. BEM block.
  const { error } = validateBemBlock(parts[0]);
  if (error) {
    return f(error);
  }

  return { value: bemString };
}

/**
 * Validates that argument is valid BEM structure.
 *
 *
 * @param {BemStructure} bemStructure
 * @returns {{error: string, value: BemStructure}|{value: BemStructure}} Returns validation result.
 */
export function validateBemStructure(bemStructure) {
  const f = result => {
    const { error, value } = result;
    if (error) {
      return {
        error: `BEM structure: ${error}`,
        value
      };
    } else {
      return { value };
    }
  };

  if (isBemString(bemStructure)) {
    return f(validateBemString(/** @type {BemString} */ (bemStructure)));
  } else if (isBemVector(bemStructure)) {
    return f(validateBemVector(/** @type {BemVector} */ (bemStructure)));
  } else if (isBemObject(bemStructure)) {
    return f(validateBemObject(/** @type {BemObject} */ (bemStructure)));
  } else {
    return f({
      error: `must be a BEM object|string|vector but it doesn't -- ${typeAndValue(
        bemStructure
      )}`,
      value: bemStructure
    });
  }
}

/**
 * Converts argument to BEM object.
 *
 * Note:
 * - in case argument already a BEM object it is returned as-is and BEM
 *   modifier is a subject to shallow copying
 *
 * @param {BemStructure} bemStructure
 * @returns {BemObject}
 * @throws {Error} Throws on invalid input.
 */
export function toBemObject(bemStructure) {
  const { error } = validateBemStructure(bemStructure);
  if (error) {
    throw new Error(error);
  }

  if (isBemObject(bemStructure)) {
    return /** @type {BemObject} */ (bemStructure);
  }

  if (isBemString(bemStructure)) {
    const [blkAndEltPart, modPart] = bemStructure.split("--");
    const [blk, elt] = blkAndEltPart.split("__");

    const bemObj = { blk };

    if (elt) {
      bemObj.elt = elt;
    }

    if (modPart) {
      bemObj.mod = modPart.split("_");
    }

    return bemObj;
  }

  // From BEM vector.
  return {
    blk: bemStructure[0],
    elt: bemStructure[1],
    mod: bemStructure[2]
  };
}

/**
 * Converts argument to BEM string.
 *
 * Note:
 * - in case argument already a BEM string it is returned as-is
 *
 * @param {BemStructure} bemStructure
 * @returns {BemString}
 * @throws {Error} Throws on invalid input.
 */
export function toBemString(bemStructure) {
  const { error } = validateBemStructure(bemStructure);
  if (error) {
    throw new Error(error);
  }

  if (isBemString(bemStructure)) {
    return bemStructure;
  }

  const { blk, elt, mod } = isBemVector(bemStructure)
    ? { blk: bemStructure[0], elt: bemStructure[1], mod: bemStructure[2] }
    : bemStructure;

  let bemStr = blk;

  if (elt) {
    bemStr += `__${elt}`;
  }

  if (mod) {
    const [modName, modValue] = mod;

    bemStr += `--${modName}`;

    if (modValue) {
      bemStr += `_${modValue}`;
    }
  }

  return bemStr;
}

/**
 * Converts argument to BEM vector.
 *
 * Note:
 * - in case argument already a BEM vector it is returned as-is and BEM
 *   modifier is a subject to shallow copying
 *
 * @param {BemStructure} bemStructure
 * @returns {BemVector}
 * @throws {Error} Throws on invalid input.
 */
export function toBemVector(bemStructure) {
  const { error } = validateBemStructure(bemStructure);
  if (error) {
    throw new Error(error);
  }

  if (isBemVector(bemStructure)) {
    return bemStructure;
  }

  const { blk, elt, mod } = toBemObject(bemStructure);
  return /** @type {BemVector} */ ([blk, elt, mod]);
}

/**
 * Class representing BEM base.
 */
export class BemBase {
  /**
   * A BEM block -- BEM base always must have valid BEM block.
   *
   * @type {BemBlock}
   */
  #blk;

  /**
   * A BEM element -- BEM base allowed to not to have BEM element.
   *
   * @type {BemElement|undefined}
   */
  #elt;

  /**
   * A BEM modifier -- BEM base allowed to not to have BEM modifier.
   *
   * @type {BemModifier|undefined}
   */
  #mod;

  /**
   * Whether instance allowed to be changed or not.
   *
   * @type {boolean}
   */
  #frozen = false;

  /**
   * Creates BEM base.
   *
   * @param {BemStructure} initializer Any BEM structure can be used to initialize BEM base.
   * @param {Object} [options] Options.
   * @param {boolean} [options.frozen=false] Frozen instance would throw if change requested.
   */
  constructor(initializer, options) {
    const { blk, elt, mod } = toBemObject(initializer);
    this.#blk = blk;
    this.#elt = elt;
    this.#mod = mod;

    const { frozen = false } = options || {};
    this.#frozen = frozen;
  }

  /**
   * Utility used to throw error if change requested on frozen instance.
   *
   * @param {string} errorMessage
   * @throws {Error}
   */
  #throwIfFrozen(errorMessage) {
    if (this.#frozen) {
      throw new Error(
        "Instance is frozen and can not be changed" +
          (errorMessage ? ` -- ${errorMessage}` : "")
      );
    }
  }

  /**
   * Returns BEM block of BEM base.
   *
   * @returns {BemBlock}
   */
  get blk() {
    return this.#blk;
  }

  /**
   * Sets BEM block of BEM base.
   *
   * @param {BemBlock} bemBlock
   * @throws {Error} Throws on invalid input or if instance is frozen.
   */
  set blk(bemBlock) {
    this.#throwIfFrozen("failed to set block part");

    const { error, value } = validateBemObject({
      blk: bemBlock,
      elt: this.#elt,
      mod: this.#mod
    });

    if (error) {
      throw new Error(error);
    }

    this.#blk = value.blk;
  }

  /**
   * Sets BEM block of BEM base.
   *
   * @param {BemBlock} bemBlock
   * @returns {BemBase}
   */
  setBlk(bemBlock) {
    this.#blk = bemBlock;
    return this;
  }

  /**
   * Returns BEM element of BEM base.
   *
   * @returns {BemElement|undefined}
   */
  get elt() {
    return this.#elt;
  }

  /**
   * Sets BEM element of BEM base.
   *
   * @param {BemElement|undefined} bemElement
   * @throws {Error} Throws on invalid input or if instance is frozen.
   */
  set elt(bemElement) {
    this.#throwIfFrozen("failed to set element part");

    const { error, value } = validateBemObject({
      blk: this.#blk,
      elt: bemElement,
      mod: this.#mod
    });

    if (error) {
      throw new Error(error);
    }

    this.#elt = value.elt;
  }

  /**
   * Sets BEM element of BEM base.
   *
   * @param {BemElement} [bemElement]
   * @returns {BemBase}
   */
  setElt(bemElement) {
    this.#elt = bemElement;
    return this;
  }

  /**
   * Returns BEM modifier of BEM base.
   *
   * @returns {BemModifier|undefined}
   */
  get mod() {
    return this.#mod;
  }

  /**
   * Sets BEM modifier of BEM base.
   *
   * @param {BemModifier|undefined} bemModifier
   * @throws {Error} Throws on invalid input or if instance is frozen.
   */
  set mod(bemModifier) {
    this.#throwIfFrozen("failed to set modifier part");

    const { error, value } = validateBemObject({
      blk: this.#blk,
      elt: this.#elt,
      mod: bemModifier
    });

    if (error) {
      throw new Error(error);
    }

    this.#mod = value.mod;
  }

  /**
   * Sets BEM modifier of BEM base.
   *
   * @param {BemModifier} [bemModifier]
   * @returns {BemBase}
   */
  setMod(bemModifier) {
    this.#mod = bemModifier;
    return this;
  }

  /**
   * Returns whether BEM base is frozen or not.
   *
   * @returns {boolean}
   */
  get frozen() {
    return this.#frozen;
  }

  /**
   * Freezes BEM base to prevent any changes.
   *
   * Note:
   * - there is no way to unfreeze instance, but it can be [cloned]{@link BemBase#clone}
   *
   * @returns {BemBase}
   */
  freeze() {
    this.#frozen = true;
    return this;
  }

  /**
   * Clones instance.
   *
   * Note:
   * - cloned instance is not frozen even if callee is
   *
   * @returns {BemBase}
   */
  clone() {
    const bemObj = { blk: this.#blk };

    if (this.#elt) {
      bemObj.elt = this.#elt;
    }

    // Don't shallow copy BEM modifier of callee!
    if (this.#mod) {
      const [n, v] = this.#mod;
      const mod = [n];
      if (v) {
        mod.push(v);
      }

      bemObj.mod = mod;
    }

    return new BemBase(bemObj);
  }

  /**
   * Returns BEM object representation of instance.
   *
   * @returns {BemObject}
   */
  toBemObject() {
    return { blk: this.blk, elt: this.elt, mod: this.mod };
  }

  /**
   * Returns BEM string representation of instance.
   *
   * @returns {BemString}
   */
  toBemString() {
    return toBemString(this.toBemObject());
  }

  /**
   * Returns BEM vector representation of instance.
   *
   * @returns {BemVector}
   */
  toBemVector() {
    return toBemVector(this.toBemObject());
  }

  /**
   * Same as {@link BemBase#toBemString}.
   *
   * @returns {BemString}
   */
  toString() {
    return this.toBemString();
  }

  /**
   * Returns BEM string representation of BEM base with '.' prepended for
   * convenient usage when CSS class selector needed.
   *
   * @returns {string}
   */
  toQuerySelector() {
    return `.${this.toString()}`;
  }
}
