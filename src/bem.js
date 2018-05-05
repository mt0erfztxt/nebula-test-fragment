import _ from 'lodash';
import typeOf from 'typeof--';

import utils from "./utils";

/**
 * BEM name - a non-empty alpha-numeric-dashed string that starts and ends with
 * a letter, and doesn't contain sibling dashes.
 *
 * @typedef {string} BemName
 */

/**
 * Returns `true` when `value` is a BEM name, otherwise returns `false`.
 *
 * @param {*} value - Subject that must be tested
 * @return {boolean}
 */
function isBemName(value) {
  if (_.isString(value)) {
    return (/^[a-zA-Z](:?[a-zA-Z0-9-]*[a-zA-Z0-9])$/.test(value) && !/-{2,}/.test(value));
  }
  else {
    return false;
  }
}

/**
 * BEM value - a non-empty alpha-numeric-dashed string that starts and ends
 * with a letter or a digit and doesn't contain sibling dashes.
 *
 * @typedef {string} BemValue
 */

/**
 * Returns `true` when `value` is a BEM value, otherwise returns `false`.
 *
 * @param {*} value - Subject that must be tested
 * @return {boolean}
 */
function isBemValue(value) {
  if (_.isString(value)) {
    return (/^(:?[a-zA-Z0-9]|[a-zA-Z0-9](:?[a-zA-Z0-9-]*[a-zA-Z0-9]))$/.test(value) && !/-{2,}/.test(value));
  }
  else {
    return false;
  }
}

/**
 * BEM block - just a BEM name.
 *
 * @typedef {BemName} BemBlock
 */

/**
 * Returns `true` when `value` is a BEM block, otherwise returns `false`.
 *
 * @param {*} value - Subject that must be tested
 * @return {boolean}
 */
function isBemBlock(value) {
  return bem.isBemName(value);
}

/**
 * BEM element - just a BEM name.
 *
 * @typedef {BemName} BemElement
 */

/**
 * Returns `true` when `value` is a BEM element, otherwise returns `false`.
 *
 * @param {*} value - Subject that must be tested
 * @return {boolean}
 */
function isBemElement(value) {
  return bem.isBemName(value);
}

/**
 * BEM modifier - an array of required BEM name and optional BEM value.
 *
 * @typedef {array} BemModifier
 */

/**
 * Returns `true` when `value` is a BEM modifier, otherwise returns `false`.
 *
 * @param {*} value - Subject that must be tested
 * @return {boolean}
 */
function isBemModifier(value) {
  return _.isArray(value) &&
    bem.isBemModifierName(value[0]) &&
    (_.isNil(value[1]) || bem.isBemModifierValue(value[1]));
}

/**
 * BEM modifier name - just a BEM name.
 *
 * @typedef {BemName} BemModifierName
 */

/**
 * Returns `true` when `value` is a BEM modifier name, otherwise returns
 * `false`.
 *
 * @param {*} value - Subject that must be tested
 * @return {boolean}
 */
function isBemModifierName(value) {
  return bem.isBemName(value);
}

/**
 * BEM modifier value - just a BEM value.
 *
 * @typedef {string} BemModifierValue
 */

/**
 * Returns `true` when `value` is a BEM modifier value, otherwise returns
 * `false`.
 *
 * @param {*} value - Subject that must be tested
 * @return {boolean}
 */
function isBemModifierValue(value) {
  return bem.isBemValue(value);
}

/**
 * BEM object.
 *
 * @typedef {object} BemObject
 * @property {BemBlock} blk - BEM block
 * @property {BemElement} [elt] - BEM element
 * @property {BemModifier} [mod] - BEM modifier
 */

/**
 * Checks that passed in `value` is a BEM object.
 *
 * @param {*} value - Subject that must be tested
 * @return {BemObject} Passed in `value`.
 * @throws {TypeError} When `value` argument is not a BEM object.
 */
function checkIsBemObject(value) {
  if (!_.isPlainObject(value)) {
    throw new TypeError(
      `'value' argument must be a plain object but it is ${typeOf(value)} (${value})`
    );
  }

  if (_.isEmpty(value)) {
    throw new TypeError(
      `BEM object can not be empty`
    );
  }

  const {blk, elt, mod} = value;

  // BEM block is required and must be valid BEM name.
  if (!isBemName(blk)) {
    throw new TypeError(
      `Required 'blk' attribute of BEM object must be a valid BEM name but it is ${typeOf(blk)} (${blk})`
    );
  }

  // BEM element is optional or name must be valid BEM name.
  if (!(_.isNil(elt) || isBemName(elt))) {
    throw new TypeError(
      `Optional 'elt' attribute of BEM object must be a valid BEM name but it is ${typeOf(elt)} (${elt})`
    );
  }

  // BEM modifier is optional or must be an array of required modifier name
  // and optional modifier value. Both name and value must be valid BEM names.
  if (!_.isNil(mod)) {
    if (!_.isArray(mod)) {
      throw new TypeError(
        "Optional 'mod' attribute of BEM object must be an array of required valid BEM name and optional BEM value " +
        `but it is ${typeOf(mod)} (${mod})`
      );
    }

    const [modName, modValue] = mod;

    if (!isBemName(modName)) {
      throw new TypeError(
        "Required name element of 'mod' attribute array of BEM object must be a BEM name but it is " +
        `${typeOf(modName)} (${modName})`
      );
    }

    if (!_.isNil(modValue)) {
      if (!isBemValue(modValue)) {
        throw new TypeError(
          "Optional value element of 'mod' attribute array of BEM object must be a BEM value but it is " +
          `${typeOf(modValue)} (${modValue})`
        );
      }
    }
  }

  return value;
}

/**
 * Returns `true` when passed in value is a BEM object, otherwise returns
 * `false`.
 *
 * @param {*} value - Subject that must be tested
 * @return {boolean}
 */
function isBemObject(value) {
  try {
    return !!checkIsBemObject(value);
  }
  catch (e) {
    return false;
  }
}

/**
 * BEM string.
 *
 * @typedef {string} BemString
 */

/**
 * Checks that passed in `value` is a BEM string.
 *
 * @param {*} value - Subject that must be tested
 * @return {BemString} Passed in `value`.
 * @throws {TypeError} When `value` argument is not a BEM string.
 */
function checkIsBemString(value) {
  if (!_.isString(value)) {
    throw new TypeError(
      `BEM string must be a string but it is ${typeOf(value)} (${value})`
    );
  }

  if (_.isEmpty(value)) {
    throw new TypeError(
      `BEM string can't be empty`
    );
  }

  // Advancing from end `value` BEM in following steps:
  // 1. Modifier part,
  // 2. Element part,
  // 3. Block part.

  let parts;

  // 1.
  parts = value.split('--');

  const modParts = parts.slice(1);
  const modPartsLength = modParts.length;

  // BEM string can have at most one modifier part...
  if (modPartsLength > 1) {
    throw new TypeError(
      `BEM string can have only one modifier but it has ${modPartsLength} of them (${modParts.join(', ')})`
    );
  }

  // ...and that part is optional.
  if (modPartsLength) {
    const mod = modParts[0];
    const modNameValueParts = _.chain(mod).split('_').reject(_.isEmpty).value();
    const modNameValuePartsLength = modNameValueParts.length;

    if (modNameValuePartsLength > 2) {
      throw new TypeError(
        `BEM modifier can have only one value but it has ${modNameValuePartsLength - 1} of them ` +
        `(${modNameValueParts.slice(1).join(', ')})`
      );
    }

    const [modName, modValue] = modNameValueParts;

    // BEM modifier name must be valid BEM name.
    if (!isBemName(modName)) {
      throw new TypeError(
        `BEM modifier name must be a valid BEM name but it is ${typeOf(modName)} (${modName})`
      );
    }

    // BEM modifier value is optional or must be valid BEM name.
    if (modNameValuePartsLength === 2) {
      if (!isBemValue(modValue)) {
        throw new TypeError(
          "BEM modifier value is optional or must be a BEM value but it is " +
          `${typeOf(modValue)} (${modValue})`
        );
      }
    }
  }

  // 2.
  parts = parts[0].split('__');

  const eltParts = parts.slice(1);
  const eltPartsLength = eltParts.length;

  // BEM string can have at most one element part...
  if (eltPartsLength > 1) {
    throw new TypeError(
      `BEM string can have only one element but it has ${eltPartsLength} of them (${eltParts.join(', ')})`
    );
  }

  // ...and that part is optional.
  if (eltPartsLength) {
    const elt = eltParts[0];

    // BEM element name must be valid BEM name.
    if (!isBemName(elt)) {
      throw new TypeError(
        `BEM element must be a BEM value but it is ${typeOf(elt)} (${elt})`
      );
    }
  }

  // 3.
  const blk = parts[0];

  // BEM string must have block part that must be valid BEM name.
  if (!isBemName(blk)) {
    throw new TypeError(
      `BEM block must be a BEM name but it is ${typeOf(blk)} (${blk})`
    );
  }

  return value;
}

/**
 * Returns `true` when passed in value is a BEM string, otherwise returns
 * `false`.
 *
 * @param {*} value - Subject that must be tested
 * @return {boolean}
 */
function isBemString(value) {
  try {
    checkIsBemString(value);
    return true;
  }
  catch (e) {
    return false;
  }
}

/**
 * BEM vector.
 *
 * @typedef {array} BemVector - First element is required and it's a BemBlock. Second element is optional and it's a BemElement. Third element is optional and it's a BemModifier
 */

/**
 * Checks that passed in `value` is valid BEM vector.
 *
 * @param {*} value - Subject that must be tested
 * @return {BemVector} Passed in `value`.
 * @throws {TypeError} When `value` argument is not valid BEM vector.
 */
function checkIsBemVector(value) {
  if (!_.isArray(value)) {
    throw new TypeError(
      `BEM vector must be an array but it is ${typeOf(value)} (${value})`
    );
  }

  if (_.isEmpty(value)) {
    throw new TypeError(
      `BEM vector can't be empty`
    );
  }

  const [blk, elt, mod] = value;

  // BEM block is required and must be valid BEM name.
  if (!isBemName(blk)) {
    throw new TypeError(
      `Required first element (block) of BEM vector must be a valid BEM name but it is ${typeOf(blk)} (${blk})`
    );
  }

  // BEM element is optional or name must be valid BEM name.
  if (!(_.isNil(elt) || isBemName(elt))) {
    throw new TypeError(
      `Optional second element (element) of BEM vector must be a valid BEM name but it is ${typeOf(elt)} (${elt})`
    );
  }

  // BEM modifier is optional or must be an array of required modifier name
  // and optional modifier value. Both name and value must be valid BEM
  // names.
  if (!_.isNil(mod)) {
    if (!_.isArray(mod)) {
      throw new TypeError(
        "Optional third element (modifier) of BEM vector must be an array with required modifier name and optional " +
        `value but it is ${typeOf(mod)} (${mod})`
      );
    }

    const [modName, modValue] = mod;

    if (!isBemName(modName)) {
      throw new TypeError(
        "Required first (name) element of optional third element (modifier) of BEM vector must be a BEM name but " +
        `it is ${typeOf(modName)} (${modName})`
      );
    }

    if (!(_.isNil(modValue) || (_.isString(modValue) && _.isEmpty(modValue)))) {
      if (!isBemValue(modValue)) {
        throw new TypeError(
          "Optional second (value) element of optional third element (modifier) of BEM vector must be a BEM value " +
          `but it is ${typeOf(modValue)} (${modValue})`
        );
      }
    }
  }

  return value;
}

/**
 * Returns `true` when passed in value is a BEM vector, otherwise returns
 * `false`.
 *
 * @param {*} value - Subject that must be tested
 * @return {boolean}
 */
function isBemVector(value) {
  try {
    checkIsBemVector(value);
    return true;
  }
  catch (e) {
    return false;
  }
}

/**
 * Checks that `value` is a BEM base, object, string or vector and returns it as-is
 * on success, otherwise throws error.
 *
 * @param {*} value - Subject that must be tested
 * @return {BemBase|BemString|BemObject|BemVector} Passed in value.
 * @throws {TypeError} When `value` argument is not a BEM object, string or vector.
 */
function checkIsBemStructure(value) {
  if (value instanceof BemBase) {
    return value;
  }
  else if (_.isPlainObject(value)) {
    return checkIsBemObject(value);
  }
  else if (_.isString(value)) {
    return checkIsBemString(value);
  }
  else if (_.isArray(value)) {
    return checkIsBemVector(value);
  }
  else {
    throw new TypeError(
      `'value' argument must be a BEM base, object, string or vector but it is ${typeOf(value)} (${value})`
    );
  }
}

/**
 * Converts passed in `value` to BEM object.
 *
 * @param {*} value
 * @return {BemObject}
 * @throws {TypeError} When argument can't be converted to BEM object.
 */
function toBemObject(value) {
  checkIsBemStructure(value);

  let obj;

  if (value instanceof BemBase) {
    obj = value.toBemObject();
  }
  else if (_.isPlainObject(value)) {
    obj = value;
  }
  else if (_.isString(value)) {
    let cur, nxt;

    obj = {};

    [nxt, cur] = value.split('--');

    if (cur) {
      obj.mod = _.chain(cur).split('_').reject(_.isEmpty).value();
    }

    [nxt, cur] = nxt.split('__');

    if (cur) {
      obj.elt = cur;
    }

    obj.blk = nxt;
  }
  else if (_.isArray(value)) {
    const [blk, elt, mod] = value;
    obj = {blk, elt, mod};
  }
  // This part is not reachable because `checkIsBemStructure()` doesn't allow invalid
  // value to pass through.
  // else {
  //   throw new TypeError(
  //     `'value' argument must be a valid BEM object/string/vector but it is ${typeOf(value)} (${value})`
  //   );
  // }

  return obj;
}

/**
 * Converts passed in `value` to BEM string.
 *
 * @param {*} value
 * @return {BemString}
 * @throws {TypeError} When argument can't be converted to BEM string.
 */
function toBemString(value) {
  checkIsBemStructure(value);

  if (_.isArray(value)) {
    const [blk, elt, mod] = value;
    value = {blk, elt, mod};
  }

  let str;

  if (value instanceof BemBase) {
    str = value.toString();
  }
  else if (_.isString(value)) {
    str = value;
  }
  else if (_.isPlainObject(value)) {
    const {blk, elt, mod} = value;

    str = blk;

    // With element?
    if (elt) {
      str += `__${elt}`;
    }

    // With modifier?
    if (!_.isEmpty(mod)) {
      let [modName, modValue] = mod;

      str += `--${modName}`;

      if (!_.isEmpty(modValue)) {
        str += `_${modValue}`;
      }
    }
  }
  // This part is not reachable because `checkIsBemStructure()` doesn't allow invalid
  // value to pass through.
  // else {
  //   throw new TypeError(
  //     `'value' argument must be a valid BEM object/string/vector but it is ${typeOf(value)} (${value})`
  //   );
  // }

  return str;
}

/**
 * Converts passed in `value` to BEM vector.
 *
 * @param {*} value
 * @return {BemVector}
 * @throws {TypeError} When argument can't be converted to BEM vector.
 */
function toBemVector(value) {
  checkIsBemStructure(value);

  let vec;

  if (value instanceof BemBase) {
    vec = value.toBemVector();
  }
  else if (_.isArray(value)) {
    vec = value;
  }
  else if (_.isString(value) || _.isPlainObject(value)) {
    const {blk, elt, mod} = toBemObject(value);
    vec = [blk, elt, mod];
  }
  // This part is not reachable because `checkIsBemStructure()` doesn't allow invalid
  // value to pass through.
  // else {
  //   throw new TypeError(
  //     `'value' argument must be a valid BEM object/string/vector but it is ${typeOf(value)} (${value})`
  //   );
  // }

  return vec;
}

/**
 * Class that represents BEM base.
 */
class BemBase {

  /**
   * Creates BEM base.
   *
   * @param {*} initializer - Used to initialize new BEM base
   * @param {?Options} [options] - Options
   * @param {boolean} [options.isFinal] - When truthy newly created BEM base can't be changed in any way - frozen forever
   * @param {boolean} [options.isFrozen] - When truthy newly created BEM base would be frozen and can't be changed
   */
  constructor(initializer, options) {
    const opts = utils.initializeOptions(options, {defaults: {isFinal: false, isFrozen: false}});
    const {blk, elt, mod} = toBemObject(initializer);

    opts['isFinal'] = !!opts.isFinal;
    opts['isFrozen'] = !!opts.isFrozen;

    if (opts.isFinal) {
      opts.isFrozen = true;
    }

    /**
     * @private
     * @property {BemBlock}
     */
    this._blk = blk || null;

    /**
     * @private
     * @property {BemElement}
     */
    this._elt = elt || null;

    /**
     * @private
     * @property {BemModifier}
     */
    this._mod = mod || null;

    /**
     * Whether BEM base is frozen forever or not.
     *
     * @private
     * @type {boolean}
     */
    this._isFinal = opts.isFinal;

    /**
     * Whether BEM base is frozen or not.
     *
     * @private
     * @type {boolean}
     */
    this._isFrozen = opts.isFrozen;
  }

  /**
   * BEM block.
   *
   * @return {BemBlock}
   */
  get blk() {
    return this._blk;
  }

  /**
   * Sets BEM base's block to specified value.
   *
   * @param {*} value
   */
  set blk(value) {
    this._blk = checkIsBemObject({
      blk: value,
      elt: this.elt,
      mod: this.mod
    }).blk;
  }

  /**
   * BEM element.
   *
   * @return {BemElement}
   */
  get elt() {
    return this._elt;
  }

  /**
   * Sets BEM base's element to specified value.
   *
   * @param {*} value
   */
  set elt(value) {
    if (_.isNil(value)) {
      this._elt = null;
    }
    else {
      this._elt = checkIsBemObject({
        blk: this.blk,
        elt: value,
        mod: this.mod
      }).elt;
    }
  }

  /**
   * Whether BEM base is frozen forever or not.
   *
   * @return {boolean}
   */
  get isFinal() {
    return this._isFinal;
  }

  /**
   * Whether BEM base is frozen or not.
   *
   * @return {boolean}
   */
  get isFrozen() {
    return this._isFrozen;
  }

  /**
   * BEM element.
   *
   * @return {BemModifier}
   */
  get mod() {
    return this._mod;
  }

  /**
   * Sets BEM base's modifier to specified value.
   *
   * @param {*} value
   */
  set mod(value) {
    if (_.isNil(value)) {
      this._mod = null;
    }
    else {
      this._mod = checkIsBemObject({
        blk: this.blk,
        elt: this.elt,
        mod: _.isArray(value) ? value : [value]
      }).mod;
    }
  }

  /**
   * Throws error when instance is final.
   *
   * @private
   * @param {string} [message="Instance is final and can't be changed"] - Custom message for error
   * @return {BemBase}
   * @throws {TypeError}
   *
   */
  _throwWhenIsFinal(message) {
    if (this.isFinal) {
      const msg = message || "Instance is final and can't be changed";
      throw new TypeError(msg);
    }

    return this;
  }

  /**
   * Throws error when instance is frozen.
   *
   * @private
   * @param {string} [message="Instance is frozen and can't be changed"] - Custom message for error
   * @return {BemBase}
   * @throws {TypeError}
   *
   */
  _throwWhenIsFrozen(message) {
    if (this.isFrozen) {
      const msg = message || "Instance is frozen and can not be changed";
      throw new TypeError(msg);
    }

    return this;
  }

  /**
   * Freezes BEM base so it can't be changed anymore.
   *
   * @return {BemBase}
   */
  freeze() {
    this._isFrozen = true;
    return this;
  }

  /**
   * Freezes BEM base so it can be changed again.
   *
   * @return {BemBase}
   */
  unfreeze() {
    this._throwWhenIsFinal("Instance is frozen and that can not be undone because it is also final");
    this._isFrozen = false;
    return this;
  }

  /**
   * Sets block of BEM base. Pass truthy value to `options.fresh` when you
   * don't want to change block of this instance but rather of its copy.
   *
   * @param {*} value - Sets block of BEM base to new value
   * @param {?Options} [options] - Options
   * @param {boolean} [options.fresh=false] - Allows to set block of copy of this BEM base
   * @return {BemBase}
   */
  setBlk(value, options) {
    const opts = utils.initializeOptions(options);
    const {fresh} = opts;

    if (!fresh) {
      this._throwWhenIsFrozen();
    }

    if (fresh) {
      const inst = new BemBase(this.toBemObject());
      inst.blk = value;
      return inst;
    }
    else {
      this.blk = value;
      return this;
    }
  }

  /**
   * Sets element of BEM base. Pass truthy value to `options.fresh` when you
   * don't want to change element of this instance but rather of its copy.
   *
   * @param {*} value - Sets element of BEM base to new value
   * @param {?Options} [options] - Options
   * @param {boolean} [options.fresh=false] - Allows to set element of copy of this BEM base
   * @return {BemBase}
   */
  setElt(value, options) {
    const opts = utils.initializeOptions(options);
    const {fresh} = opts;

    if (!fresh) {
      this._throwWhenIsFrozen();
    }

    if (fresh) {
      const inst = new BemBase(this.toBemObject());
      inst.elt = value;
      return inst;
    }
    else {
      this.elt = value;
      return this;
    }
  }

  /**
   * Sets modifier of BEM base. Pass truthy value to `options.fresh` when you
   * don't want to change modifier of this instance but rather of its copy.
   *
   * @param {*} value - Sets modifier of BEM base to new value
   * @param {?Options} [options] - Options
   * @param {boolean} [options.fresh=false] - Allows to set modifier of copy of this BEM base
   * @return {BemBase}
   */
  setMod(value, options) {
    const opts = utils.initializeOptions(options);
    const {fresh} = opts;

    if (!fresh) {
      this._throwWhenIsFrozen();
    }

    if (fresh) {
      const inst = new BemBase(this.toBemObject());
      inst.mod = value;
      return inst;
    }
    else {
      this.mod = value;
      return this;
    }
  }

  /**
   * Converts instance to BEM object.
   *
   * @return {BemObject}
   */
  toBemObject() {
    return {blk: this.blk, elt: this.elt, mod: this.mod};
  }

  /**
   * Converts instance to BEM string.
   *
   * @return {BemString}
   */
  toBemString() {
    return toBemString(this.toBemObject());
  }

  /**
   * Converts instance to BEM vector.
   *
   * @return {BemVector}
   */
  toBemVector() {
    return toBemVector(this.toBemObject());
  }

  /**
   * Just an alias for `toBemString()`.
   *
   * @return {BemString}
   */
  toString() {
    return this.toBemString();
  }
}

/**
 * Extracts modifier.
 *
 * @param {*} css - Class (CSS) string
 * @return {string|undefined}
 */
function extractModifierFromCss(css, modifier) {
  if (!utils.isString(css)) {
    throw new TypeError(
      `'css' argument must be a string but it is ${typeOf(css)} (${css})`
    );
  }

  const isValidModifier = _.isArray(modifier) && isBemName(modifier[0]) &&
    (_.isNil(modifier[1]) || isBemValue(modifier[1]));

  if (!isValidModifier) {
    throw new TypeError(
      `'modifier' argument must be a BEM modifier but it is ${typeOf(modifier)} (${modifier})`
    );
  }

  if (_.isString(css)) {
    css = _.split(css, ' ');
  }

  if (!_.isArray(css)) {
    throw new TypeError(
      `'classNames' argument must be a string or an array but it is ${typeOf(css)} (${css})`
    );
  }

  const [modNam, modVal] = this.mod;
  const isFullMatch = (utils.isNonEmptyString(modVal) || _.isFinite(modVal) || _.isBoolean(modVal));

  // We must to reed of empty strings as they are not valid BEM bases but may
  // occur during string splitting.
  _.remove(css, utils.isEmptyString);

  const extractor = (item) => {
    const bem = new this.constructor(item);
    const [itemModNam, itemModVal] = bem.mod;

    if (modNam === itemModNam) {
      return !!(isFullMatch && ((modVal + '') === (itemModVal + '')));
    }
    else {
      return false;
    }
  };

  return _.find(css, extractor);
}

const bem = {
  BemBase,
  checkIsBemObject,
  checkIsBemString,
  checkIsBemStructure,
  checkIsBemVector,
  isBemBlock,
  isBemElement,
  isBemModifier,
  isBemModifierName,
  isBemModifierValue,
  isBemName,
  isBemObject,
  isBemString,
  isBemValue,
  isBemVector,
  toBemObject,
  toBemString,
  toBemVector
};

export default bem;
