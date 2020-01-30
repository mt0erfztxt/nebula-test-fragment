import is from "@sindresorhus/is";
import { typeAndValue } from "./util";

/**
 * Represents BEM name.
 *
 * Valid BEM name is a non-empty alpha-numeric-dashed string that starts and
 * ends with a letter, and doesn't contain sibling dashes.
 *
 * @typedef {string} BemName
 */

/**
 * Represents BEM value.
 *
 * Valid BEM value is a non-empty alpha-numeric-dashed string that starts and
 * ends with a letter or a digit and doesn't contain sibling dashes.
 *
 * @typedef {string} BemValue
 */

/**
 * Represents BEM block.
 *
 * Valid BEM block is a valid BEM name.
 *
 * @typedef {BemName} BemBlock
 */

/**
 * Represents BEM element.
 *
 * Valid BEM element is a valid BEM name.
 *
 * @typedef {BemName} BemElement
 */

/**
 * Represents BEM modifier name.
 *
 * Valid BEM modifier name is a valid BEM name.
 *
 * @typedef {BemName} BemModifierName
 */

/**
 * Represents BEM modifier value.
 *
 * Valid BEM modifier value is a valid BEM value.
 *
 * @typedef {BemValue} BemModifierValue
 */

/**
 * Represents BEM modifier.
 *
 * Valid BEM modifier is a two-elements tuple where first element is a required
 * BEM modifier name and second is an optional BEM modifier value.
 *
 * @typedef {[BemModifierName, BemModifierValue]} BemModifier
 */

/**
 * Represents BEM modifier requirement.
 *
 * @typedef {[BemModifierName, BemModifierValue, NegationFlag]} BemModifierRequirement
 */

/**
 * Represents BEM object.
 *
 * @typedef BemObject
 * @type {Object}
 * @property {BemBlock} blk
 * @property {BemElement} [elt]
 * @property {BemModifier} [mod]
 */

/**
 * Represents BEM string.
 *
 * @typedef {string} BemString
 */

/**
 * Represents BEM vector.
 *
 * @typedef {[BemBlock, BemElement, BemModifier]} BemVector
 */

/**
 * Represents BEM structure.
 *
 * @typedef {(BemObject|BemString|BemVector)} BemStructure
 */

/**
 *
 * @param {BemStructure} bemStructure
 * @returns {boolean}
 */
export function isBemObject(bemStructure) {
  return is.plainObject(bemStructure);
}

/**
 *
 * @param {BemStructure} bemStructure
 * @returns {boolean}
 */
export function isBemString(bemStructure) {
  return is.string(bemStructure);
}

/**
 *
 * @param {BemStructure} bemStructure
 * @returns {boolean}
 */
export function isBemVector(bemStructure) {
  return is.array(bemStructure);
}

/**
 *
 * @param {BemName} bemName
 * @returns {{error: string, value: BemName}|{value: BemName}}
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
 *
 * @param {BemValue} bemValue
 * @returns {{error: string, value: BemValue}|{value: BemValue}}
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
 *
 * @param {BemBlock} bemBlock
 * @returns {{error: string, value: BemBlock}|{value: BemBlock}}
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
 *
 * @param {BemElement} bemElement
 * @returns {{error: string, value: BemElement}|{value: BemElement}}
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
 *
 * @param {BemModifierName} bemModifierName
 * @returns {{error: string, value: BemModifierName}|{value: BemModifierName}}
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
 *
 * @param {BemModifierValue} bemModifierValue
 * @returns {{error: string, value: BemModifierValue}|{value: BemModifierValue}}
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
 *
 * @param {BemModifier} bemModifier
 * @returns {{error: string, value: BemModifier}|{value: BemModifier}}
 */
export function validateBemModifier(bemModifier) {
  if (!is.array(bemModifier)) {
    return {
      error: `BEM modifier: must be an array but it doesn't -- ${typeAndValue(
        bemModifier
      )}`,
      value: bemModifier
    };
  }

  const [modName, modValue] = bemModifier;
  const result = { value: bemModifier };
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
 *
 * @param bemModifierRequirement
 * @returns {{error: string, value: BemModifierRequirement}|{value: BemModifierRequirement}}
 */
export function validateBemModifierRequirement(bemModifierRequirement) {
  const [modName, modValue, isNot = false] = bemModifierRequirement;
  const { error } = validateBemModifier([modName, modValue]);
  if (error) {
    return { error, value: bemModifierRequirement };
  } else {
    return { value: [modName, modValue, isNot] };
  }
}

/**
 *
 * @param {BemBlock} blk
 * @param {BemElement|undefined} elt
 * @param {BemModifier|undefined} mod
 * @param {boolean} isVector
 * @returns {string|undefined}
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
 *
 * @param {BemObject} bemObject
 * @returns {{error: string, value: BemObject}|{value: BemObject}}
 */
export function validateBemObject(bemObject) {
  const { blk, elt, mod } = bemObject;
  const result = { value: bemObject };

  const error = validateBemParts(blk, elt, mod, false);
  if (error) {
    result.error = `BEM object: ${error}`;
  }

  return result;
}

/**
 *
 * @param {BemVector} bemVector
 * @returns {{error: string, value: BemVector}|{value: BemVector}}
 */
export function validateBemVector(bemVector) {
  const [blk, elt, mod] = bemVector;
  const result = { value: bemVector };

  const error = validateBemParts(blk, elt, mod, false);
  if (error) {
    result.error = `BEM vector: ${error}`;
  }

  return result;
}

/**
 *
 * @param bemString
 * @returns {{error: string, value: BemString}|{value: BemString}}
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

  if (is.emptyString(bemString) || bemString.trim().length === 0) {
    return f("must have at least block part");
  }

  // Advancing from end of `value` in following steps:
  // 1. Modifier part
  // 2. Element part
  // 3. Block part

  let parts;

  // 1. Modifier part
  parts = bemString.split("--");

  const modParts = parts.slice(1);
  const modPartsLength = modParts.length;

  // BEM string can have at most one modifier part...
  if (modPartsLength > 1) {
    return f(
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
      return f(
        `modifier can have only one value but ` +
          `${modNameValuePartsLength - 1} of them found -- ` +
          modNameValueParts.slice(1).join(", ")
      );
    }

    // BEM modifier name must be valid BEM name.
    const modName = modNameValueParts[0];
    if (validateBemName(modName).error) {
      return f(`modifier's name must be a valid BEM name -- ${modName}`);
    }

    // BEM modifier value is optional or must be valid BEM name.
    const modValue = modNameValueParts[1];
    if (modNameValuePartsLength === 2) {
      if (validateBemValue(modValue).error) {
        return f(
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
    return f(
      `only one element allowed but '${eltPartsLength}' of them found -- ` +
        eltParts.join(", ")
    );
  }

  // ...and that part is optional.
  if (eltPartsLength) {
    const elt = eltParts[0];
    if (validateBemName(elt).error) {
      return f(`element must be valid BEM name -- ${elt}`);
    }
  }

  // 3. Block part
  const blk = parts[0];
  if (validateBemName(blk).error) {
    return f(`block must be valid BEM name -- ${blk}`);
  }

  return { value: bemString };
}

/**
 *
 * @param {BemStructure} bemStructure
 * @returns {{error: string, value: BemStructure}|{value: BemStructure}}
 */
export function validateBemStructure(bemStructure) {
  if (isBemString(bemStructure)) {
    return validateBemString(/** @type {BemString} */ (bemStructure));
  } else if (isBemVector(bemStructure)) {
    return validateBemVector(/** @type {BemVector} */ (bemStructure));
  } else if (isBemObject(bemStructure)) {
    return validateBemObject(/** @type {BemObject} */ (bemStructure));
  } else {
    return {
      error: `Value must be a BEM object|string|vector -- ${bemStructure}`,
      value: bemStructure
    };
  }
}

/**
 *
 * @param {BemStructure} bemStructure
 * @returns {BemObject}
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

    const bemObj = { blk, elt };
    if (modPart) {
      bemObj.mod = modPart.split("_").filter(is.nonEmptyString);
    }

    return bemObj;
  }

  return { blk: bemStructure[0], elt: bemStructure[1], mod: bemStructure[2] };
}

/**
 *
 * @param {BemStructure} bemStructure
 * @returns {BemString}
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
    let [modName, modValue] = mod;

    bemStr += `--${modName}`;

    if (modValue) {
      bemStr += `_${modValue}`;
    }
  }

  return bemStr;
}

/**
 *
 * @param {BemStructure} bemStructure
 * @returns {BemVector}
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

export class BemBase {
  /**
   * @type {BemBlock}
   */
  #blk;

  /**
   * @type {undefined|BemElement}
   */
  #elt;

  /**
   * @type {undefined|BemModifier}
   */
  #mod;

  /**
   *
   * @type {boolean}
   */
  #frozen = false;

  /**
   *
   * @param {BemStructure} initializer
   * @param {Object} [options] Options
   * @param {boolean} [options.frozen=false] Changes not allowed when `true`
   */
  constructor(initializer, options) {
    const { frozen = false } = options || {};
    const { blk, elt, mod } = toBemObject(initializer);

    this.#blk = blk;
    this.#elt = elt;
    this.#mod = mod;

    this.#frozen = frozen;
  }

  /**
   *
   * @param {string} errorMessage
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
   *
   * @returns {BemBlock}
   */
  get blk() {
    return this.#blk;
  }

  /**
   *
   * @param {BemBlock} bemBlock
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
   *
   * @param {BemBlock} bemBlock
   * @returns {BemBase}
   */
  setBlk(bemBlock) {
    this.#blk = bemBlock;
    return this;
  }

  /**
   *
   * @returns {BemElement}
   */
  get elt() {
    return this.#elt;
  }

  /**
   *
   * @param {BemElement|undefined} bemElement
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
   *
   * @param {BemElement} [bemElement]
   * @returns {BemBase}
   */
  setElt(bemElement) {
    this.#elt = bemElement;
    return this;
  }

  /**
   *
   * @returns {BemModifier}
   */
  get mod() {
    return this.#mod;
  }

  /**
   *
   * @param {BemModifier|undefined} bemModifier
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
   *
   * @param {BemModifier} [bemModifier]
   * @returns {BemBase}
   */
  setMod(bemModifier) {
    this.#mod = bemModifier;
    return this;
  }

  /**
   *
   * @returns {boolean}
   */
  get frozen() {
    return this.#frozen;
  }

  /**
   *
   * @returns {BemBase}
   */
  freeze() {
    this.#frozen = true;
    return this;
  }

  /**
   *
   * @returns {BemObject}
   */
  toBemObject() {
    return { blk: this.blk, elt: this.elt, mod: this.mod };
  }

  /**
   *
   * @returns {BemString}
   */
  toBemString() {
    return toBemString(this.toBemObject());
  }

  /**
   *
   * @returns {BemVector}
   */
  toBemVector() {
    return toBemVector(this.toBemObject());
  }

  /**
   *
   * @returns {BemBase}
   */
  clone() {
    return new BemBase({ blk: this.blk, elt: this.elt, mod: this.mod });
  }

  /**
   *
   * @returns {BemString}
   */
  toString() {
    return this.toBemString();
  }

  /**
   *
   * @returns {string}
   */
  toQuerySelector() {
    return `.${this.toString()}`;
  }
}
