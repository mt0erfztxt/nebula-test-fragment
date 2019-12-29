import is from "@sindresorhus/is";
import { NegationFlag } from "./selector";
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
 * Represents BEM modifier requirement.
 */
export type BemModifierRequirement = [
  BemModifierName,
  BemModifierValue?,
  NegationFlag?
];

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

export function validateBemName(bemName: BemName): ValidationResult<BemName> {
  if (
    /^[a-zA-Z](:?[a-zA-Z0-9-]*[a-zA-Z0-9])$/.test(bemName) &&
    !/-{2,}/.test(bemName)
  ) {
    return { value: bemName };
  } else {
    return { error: "BEM name does not conform constraints", value: bemName };
  }
}

export function validateBemValue(
  bemValue: BemValue
): ValidationResult<BemValue> {
  if (
    /^(:?[a-zA-Z0-9]|[a-zA-Z0-9](:?[a-zA-Z0-9-]*[a-zA-Z0-9]))$/.test(
      bemValue
    ) &&
    !/-{2,}/.test(bemValue)
  ) {
    return { value: bemValue };
  } else {
    return {
      error: "BEM value does not conform constraints",
      value: bemValue
    };
  }
}

export function validateBemBlock(
  bemBlock: BemBlock
): ValidationResult<BemBlock> {
  const { error, value } = validateBemName(bemBlock);
  if (is.undefined(error)) {
    return { value };
  } else {
    return { error: "BEM block does not conform constraints", value: bemBlock };
  }
}

export function validateBemElement(
  bemElement: BemElement
): ValidationResult<BemElement> {
  const { error, value } = validateBemName(bemElement);
  if (is.undefined(error)) {
    return { value };
  } else {
    return {
      error: "BEM element does not conform constraints",
      value: bemElement
    };
  }
}

export function validateBemModifierName(
  bemModifierName: BemModifierName
): ValidationResult<BemModifierName> {
  const { error, value } = validateBemName(bemModifierName);
  if (is.undefined(error)) {
    return { value };
  } else {
    return {
      error: "BEM modifier's name does not conform constraints",
      value: bemModifierName
    };
  }
}

export function validateBemModifierValue(
  bemModifierValue: BemModifierValue
): ValidationResult<BemModifierValue> {
  const { error, value } = validateBemValue(bemModifierValue);
  if (is.undefined(error)) {
    return { value };
  } else {
    return {
      error: "BEM modifier's value does not conform constraints",
      value: bemModifierValue
    };
  }
}

export function validateBemModifier(
  bemModifier: BemModifier
): ValidationResult<BemModifier> {
  const [modName, modValue] = bemModifier;
  const result: ValidationResult<BemModifier> = { value: bemModifier };

  const { error } = validateBemModifierName(modName);
  if (error) {
    result.error = "BEM modifier's name must be valid BEM name";
    return result;
  }

  if (!is.undefined(modValue)) {
    const { error } = validateBemModifierValue(modValue);
    if (error) {
      result.error =
        "BEM modifier's value is optional but must be valid BEM " +
        "value when provided";
      return result;
    }
  }

  return result;
}

export function validateBemModifierRequirement(
  bemModifierRequirement: BemModifierRequirement
): ValidationResult<BemModifierRequirement> {
  const [modName, modValue, isNot = false] = bemModifierRequirement;

  const { error } = validateBemModifier([modName, modValue]);
  if (error) {
    return { error, value: bemModifierRequirement };
  }

  return { value: [modName, modValue, isNot] };
}

function validateBemObjectOrVector(
  bemObjectOrVector: BemObject | BemVector
): ValidationResult<BemObject | BemVector> {
  let blk, elt, mod, structure: string;

  if (isBemVector(bemObjectOrVector)) {
    structure = "vector";
    [blk, elt, mod] = bemObjectOrVector;
  } else {
    structure = "object";
    blk = bemObjectOrVector.blk;
    elt = bemObjectOrVector.elt;
    mod = bemObjectOrVector.mod;
  }

  const { error } = validateBemBlock(blk);
  if (error) {
    return { error: `BEM ${structure} -- ${error}`, value: bemObjectOrVector };
  }

  if (elt) {
    const { error } = validateBemElement(elt);
    if (error) {
      return {
        error: `BEM ${structure} -- ${error}`,
        value: bemObjectOrVector
      };
    }
  }

  if (mod) {
    const { error } = validateBemModifier(mod);
    if (error) {
      return {
        error: `BEM ${structure} -- ${error}`,
        value: bemObjectOrVector
      };
    }
  }

  return { value: bemObjectOrVector };
}

export function validateBemObject(
  bemObject: BemObject
): ValidationResult<BemObject> {
  return validateBemObjectOrVector(bemObject) as ValidationResult<BemObject>;
}

export function validateBemVector(
  bemVector: BemVector
): ValidationResult<BemVector> {
  return validateBemObjectOrVector(bemVector) as ValidationResult<BemVector>;
}

export function validateBemString(
  bemString: BemString
): ValidationResult<BemString> {
  const f = (error: string) => ({
    error: `BEM string -- ${error}`,
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
      `can have only one modifier but '${modPartsLength}' of them found -- ` +
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
          `'${modNameValuePartsLength - 1}' of them found -- ` +
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

export function validateBemStructure(
  bemStructure: BemStructure
): ValidationResult<BemStructure> {
  if (isBemString(bemStructure)) {
    return validateBemString(bemStructure);
  } else if (isBemVector(bemStructure)) {
    return validateBemVector(bemStructure);
  } else if (isBemObject(bemStructure)) {
    return validateBemObject(bemStructure);
  } else {
    return {
      error: `Value must be a BEM object|string|vector -- ${bemStructure}`,
      value: bemStructure
    };
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

export class BemBase {
  private _blk: BemBlock;
  private _elt?: BemElement;
  private _mod?: BemModifier;

  private _frozen: boolean = false;

  constructor(
    initializer: BemStructure,
    options: { frozen: boolean } = { frozen: false }
  ) {
    const { blk, elt, mod } = toBemObject(initializer);

    this._blk = blk;
    this._elt = elt;
    this._mod = mod;

    this._frozen = options.frozen;
  }

  private _throwIfFrozen(errorMessage?: string): void {
    if (this._frozen) {
      throw new Error(
        "Instance is frozen and can not be changed" +
          (errorMessage ? ` -- ${errorMessage}` : "")
      );
    }
  }

  get blk(): BemBlock {
    return this._blk;
  }

  set blk(bemBlock: BemBlock) {
    this._throwIfFrozen("failed to set block part");

    const { error, value } = validateBemObject({
      blk: bemBlock,
      elt: this.elt,
      mod: this.mod
    });

    if (error) {
      throw new Error(error);
    }

    this._blk = value.blk;
  }

  setBlk(bemBlock: BemBlock): this {
    this.blk = bemBlock;
    return this;
  }

  get elt() {
    return this._elt;
  }

  set elt(bemElement: BemElement | undefined) {
    this._throwIfFrozen();

    const { error, value } = validateBemObject({
      blk: this._blk,
      elt: bemElement,
      mod: this.mod
    });

    if (error) {
      throw new Error(error);
    }

    this._elt = value.elt;
  }

  setElt(bemElement?: BemElement): this {
    this.elt = bemElement;
    return this;
  }

  get mod() {
    return this._mod;
  }

  set mod(bemModifier: BemModifier | undefined) {
    this._throwIfFrozen();

    const { error, value } = validateBemObject({
      blk: this._blk,
      elt: this.elt,
      mod: bemModifier
    });

    if (error) {
      throw new Error(error);
    }

    this._mod = value.mod;
  }

  setMod(bemModifier?: BemModifier): this {
    this.mod = bemModifier;
    return this;
  }

  get frozen() {
    return this._frozen;
  }

  freeze(): this {
    this._frozen = true;
    return this;
  }

  toBemObject(): BemObject {
    return { blk: this.blk, elt: this.elt, mod: this.mod };
  }

  toBemString(): BemString {
    return toBemString(this.toBemObject());
  }

  toBemVector(): BemVector {
    return toBemVector(this.toBemObject());
  }

  clone(): BemBase {
    return new BemBase({ blk: this.blk, elt: this.elt, mod: this.mod });
  }

  toString(): BemString {
    return this.toBemString();
  }

  toQuerySelector(): string {
    return `.${this.toString()}`;
  }
}
