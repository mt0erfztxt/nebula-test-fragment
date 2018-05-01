import _ from 'lodash';
import typeOf from 'typeof--';

import utils from "./utils";

/**
 * A non-empty alpha-numeric-dashed string that starts and ends with letter,
 * and doesn't contain sibling dashes.
 *
 * @typedef {string} bemName
 */

/**
 * A BEM block.
 *
 * @typedef {~bemName} bemBlk
 */

/**
 * A BEM element.
 *
 * @typedef {~bemName} bemElt
 */

/**
 * A name part of BEM modifier.
 *
 * @typedef {~bemName} bemModNam
 */

/**
 * A value part of BEM modifier - a string, a finite number or a boolean.
 *
 * @typedef {undefined|null|string|number|boolean} bemModVal
 */

/**
 * A BEM modifier.
 *
 * @typedef {array} bemMod - First element is required and it's a ~bemModNam. Second element is optional and it's a ~bemModBal
 */

/**
 * BEM object.
 *
 * @typedef {object} bemObj
 * @property {~bemBlk} blk - BEM block
 * @property {~bemElt} [elt] - BEM element
 * @property {~bemMod} [mod] - BEM modifier
 */

/**
 * BEM string.
 *
 * @typedef {string} bemStr
 */

/**
 * BEM vector.
 *
 * @typedef {array} bemVec - First element is required and it's a ~bemBlk. Second element is optional and it's a ~bemElt. Third element is optional and it's a ~bemMod
 */

/**
 * Class that represents BEM base.
 */
class BemBase {

  /**
   * Creates BEM base.
   *
   * @param {*} initializer - Used to initialize new BEM base
   * @param {object} [options] - Options
   * @param {boolean} [options.isFrozen] - When truthy newly created BEM base would be frozen and can't be changed
   * @return {BemBase}
   */
  constructor(initializer, options) {
    const opts = utils.initializeOptions(options, {defaults: {isFrozen: false}});
    const {blk, elt, mod} = this.constructor.bemToObj(initializer);

    /**
     * @property {~bemBlk}
     * @private
     */
    this._blk = blk;

    /**
     * @property {~bemElt}
     * @private
     */
    this._elt = elt;

    /**
     * @property {~bemMod}
     * @private
     */
    this._mod = mod;

    /**
     * Whether BEM base is frozen or not.
     *
     * @type {boolean}
     * @private
     */
    this._isFrozen = (opts.isFrozen || false);
  }

  /**
   * BEM block.
   *
   * @return {~bemBlk}
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
    this._blk = this.constructor._checkBemObj({
      blk: value,
      elt: this.elt,
      mod: this.mod
    }).blk;
  }

  /**
   * BEM element.
   *
   * @return {~bemElt}
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
      delete this._elt;
    }
    else {
      this._elt = this.constructor._checkBemObj({
        blk: this.blk,
        elt: value,
        mod: this.mod
      }).elt;
    }
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
   * @return {~bemMod}
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
      delete this._mod;
    }
    else {
      this._mod = this.constructor._checkBemObj({
        blk: this.blk,
        elt: this.elt,
        mod: _.isArray(value) ? value : [value]
      }).mod;
    }
  }

  /**
   * Converts passed in value to BEM object.
   *
   * @param {*} value
   * @return {~bemObj}
   * @throws {TypeError} When argument can't be converted to valid BEM.
   */
  static bemToObj(value) {
    this.checkBem(value);

    let obj;

    if (_.isPlainObject(value)) {
      obj = value;
    }
    else if (_.isString(value)) {
      let cur, next, parts;

      obj = {};

      [next, cur] = parts = value.split('--');

      if (cur) {
        obj.mod = _.chain(cur).split('_').reject(_.isEmpty).value();
      }

      [next, cur] = parts = next.split('__');

      if (cur) {
        obj.elt = cur;
      }

      obj.blk = next;
    }
    else if (_.isArray(value)) {
      const [blk, elt, mod] = value;
      obj = {blk, elt, mod};
    }
    else {
      throw new TypeError(
        `Only plain object, string or array value can be converted to BEM object, but
         ${typeOf(value)} (${value}) is given`
      );
    }

    return obj;
  }

  /**
   * Converts passed in value to BEM string.
   *
   * @param {*} value
   * @return {~bemStr}
   * @throws {TypeError} When argument can't be converted to valid BEM.
   */
  static bemToStr(value) {
    this.checkBem(value);

    if (_.isArray(value)) {
      const [blk, elt, mod] = value;
      value = {blk, elt, mod};
    }

    let str;

    if (_.isString(value)) {
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
    else {
      throw new TypeError(
        `Only plain object, string or array value can be converted to BEM string, but
         ${typeOf(value)} (${value}) is given`
      );
    }

    return str;
  }

  /**
   * Converts passed in value to BEM vector.
   *
   * @param {*} value
   * @return {~bemVec}
   * @throws {TypeError} When argument can't be converted to valid BEM.
   */
  static bemToVec(value) {
    let vec;

    if (_.isArray(value)) {
      vec = this.checkBem(value);
    }
    else if (_.isString(value) || _.isPlainObject(value)) {
      const {blk, elt, mod} = this.bemToObj(value);
      vec = [blk, elt, mod];
    }
    else {
      throw new TypeError(
        `Only plain object, string or array value can be converted to BEM vector, but
         ${typeOf(value)} (${value}) is given`
      );
    }

    return vec;
  }

  /**
   * Checks that passed in value is valid BEM.
   *
   * @param {~bemStr|~bemObj|~bemVec} value - Test subject
   * @return {~bemStr|~bemObj|~bemVec} Passed in value.
   * @throws {TypeError} When argument is not valid.
   */
  static checkBem(value) {
    if (_.isPlainObject(value)) {
      return this._checkBemObj(value);
    }
    else if (_.isString(value)) {
      return this._checkBemStr(value);
    }
    else if (_.isArray(value)) {
      return this._checkBemVec(value);
    }
    else {
      throw new TypeError(`BEM value must be a plain object, a string or an array but it's a/an ${typeOf(value)} (${value})`);
    }
  }

  /**
   * Returns `true` when passed in value is a BEM object, otherwise returns
   * false`.
   *
   * @param {*} value
   * @return {boolean}
   */
  static isBemObj(value) {
    return !!(_.isPlainObject(value) && this.checkBem(value));
  }

  /**
   * Returns `true` when passed in value is a BEM string, otherwise returns
   * false`.
   *
   * @param {*} value
   * @return {boolean}
   */
  static isBemStr(value) {
    return !!(_.isString(value) && this.checkBem(value));
  }

  /**
   * Returns `true` when passed in value is a BEM vector, otherwise returns
   * false`.
   *
   * @param {*} value
   * @return {boolean}
   */
  static isBemVec(value) {
    return !!(_.isArray(value) && this.checkBem(value));
  }

  /**
   * Checks that passed in value is valid BEM object.
   *
   * @param {*} value - Test subject
   * @return {~bemObj} Passed in value.
   * @private
   * @throws {TypeError} When argument is not valid.
   */
  static _checkBemObj(value) {
    if (!_.isPlainObject(value)) {
      throw new TypeError(
        `BEM object must be a plain object, but ${typeOf(value)} (${value}) is given`
      );
    }

    if (_.isEmpty(value)) {
      throw new TypeError(
        `BEM object can't be empty`
      );
    }

    const {blk, elt, mod} = value;

    // BEM block is required and must be valid BEM name.
    if (!this._isValidBemName(blk)) {
      throw new TypeError(
        `Required 'blk' attribute of BEM object must be a valid BEM name, but ${typeOf(blk)} (${blk}) is given`
      );
    }

    // BEM element is optional or name must be valid BEM name.
    if (!(_.isNil(elt) || this._isValidBemName(elt))) {
      throw new TypeError(
        `Optional 'elt' attribute of BEM object must be a valid BEM name, but ${typeOf(elt)} (${elt}) is given`
      );
    }

    // BEM modifier is optional or must be an array of required modifier name
    // and optional modifier value. Both name and value must be valid BEM names.
    if (!_.isNil(mod)) {
      if (!_.isArray(mod)) {
        throw new TypeError(
          "Optional 'mod' attribute of BEM object must be an array of required valid BEM name and optional value, but" +
          ` ${typeOf(mod)} (${mod}) is given`
        );
      }

      const [modName, modValue] = mod;

      if (!this._isValidBemName(modName)) {
        throw new TypeError(
          "Required name element of 'mod' attribute array of BEM object must be a non-empty alpha-numeric-dashed" +
          ` string, but ${typeOf(modName)} (${modName}) is given`
        );
      }

      if (!_.isNil(modValue)) {
        if (!this._isValidBemName(modValue)) {
          throw new TypeError(
            "Optional value element of 'mod' attribute array of BEM object must be a non-empty alpha-numeric-dashed" +
            ` string, but ${typeOf(modValue)} (${modValue}) is given`
          );
        }
      }
    }

    return value;
  }

  /**
   * Checks that passed in value is valid BEM string.
   *
   * @param {*} value - Test subject
   * @return {~bemStr} Passed in value.
   * @private
   * @throws {TypeError} When argument is not valid.
   */
  static _checkBemStr(value) {
    if (!_.isString(value)) {
      throw new TypeError(
        `BEM string must be a string, but ${typeOf(value)} (${value}) is given`
      );
    }

    if (_.isEmpty(value)) {
      throw new TypeError(
        `BEM string can't be empty`
      );
    }

    // Advancing from end checkBem BEM in following steps:
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
        `BEM string can have only one modifier, but it has ${modPartsLength} of them (${modParts.join(', ')})`
      );
    }

    // ...and that part is optional.
    if (modPartsLength) {
      const mod = modParts[0];
      const modNameValueParts = _.chain(mod).split('_').reject(_.isEmpty).value();
      const modNameValuePartsLength = modNameValueParts.length;

      if (modNameValuePartsLength > 2) {
        throw new TypeError(
          `BEM modifier can have only one value, but it has ${modNameValuePartsLength - 1} of them ` +
          `(${modNameValueParts.slice(1).join(', ')})`
        );
      }

      const [modName, modValue] = modNameValueParts;

      // BEM modifier name must be valid BEM name.
      if (!this._isValidBemName(modName)) {
        throw new TypeError(
          "BEM modifier name must be a valid BEM name, but " + `${typeOf(modName)} (${modName}) is given`
        );
      }

      // BEM modifier value is optional or must be valid BEM name.
      if (modNameValuePartsLength === 2) {
        if (!this._isValidBemName(modValue)) {
          throw new TypeError(
            "BEM modifier value is optional or must be a non-empty alpha-numeric-dashed string, but " +
            `${typeOf(modValue)} (${modValue}) is given`
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
        `BEM string can have only one element, but it has ${eltPartsLength} of them (${eltParts.join(', ')})`
      );
    }

    // ...and that part is optional.
    if (eltPartsLength) {
      const elt = eltParts[0];

      // BEM element name must be valid BEM name.
      if (!this._isValidBemName(elt)) {
        throw new TypeError(
          `BEM element name must be a non-empty alpha-numeric-dashed string, but ${typeOf(elt)} (${elt}) is given`
        );
      }
    }

    // 3.

    const blk = parts[0];

    // BEM string must have block part that must be valid BEM name.
    if (!this._isValidBemName(blk)) {
      throw new TypeError(
        `BEM block name must be a non-empty alpha-numeric-dashed string, but ${typeOf(blk)} (${blk}) is given`
      );
    }

    return value;
  }

  /**
   * Checks that passed in value is valid BEM vector.
   *
   * @param {*} value - Test subject
   * @return {~bemVec} Passed in value.
   * @private
   * @throws {TypeError} When argument is not valid.
   */
  static _checkBemVec(value) {
    if (!_.isArray(value)) {
      throw new TypeError(
        `BEM vector must be an array, but ${typeOf(value)} (${value}) is given`
      );
    }

    if (_.isEmpty(value)) {
      throw new TypeError(
        `BEM vector can't be empty`
      );
    }

    const [blk, elt, mod] = value;

    // BEM block is required and must be valid BEM name.
    if (!this._isValidBemName(blk)) {
      throw new TypeError(
        `Required first element (block) of BEM vector must be a valid BEM name, but ${typeOf(blk)} (${blk}) is given`
      );
    }

    // BEM element is optional or name must be valid BEM name.
    if (!(_.isNil(elt) || this._isValidBemName(elt))) {
      throw new TypeError(
        `Optional second element (element) of BEM vector must be a valid BEM name, but ${typeOf(elt)} (${elt}) is given`
      );
    }

    // BEM modifier is optional or must be an array of required modifier name
    // and optional modifier value. Both name and value must be valid BEM names.
    if (!_.isNil(mod)) {
      if (!_.isArray(mod)) {
        throw new TypeError(
          "Optional third element (modifier) of BEM vector must be an array with required modifier name and optional " +
          `value, but ${typeOf(mod)} (${mod}) is given`
        );
      }

      const [modName, modValue] = mod;

      if (!this._isValidBemName(modName)) {
        throw new TypeError(
          `Required first (name) element of third element (modifier) of BEM vector must be a non-empty
         alpha-numeric-dashed string, but ${typeOf(modName)} (${modName}) is given`
        );
      }

      if (!(_.isNil(modValue) || (_.isString(modValue) && _.isEmpty(modValue)))) {
        if (!this._isValidBemName(modValue)) {
          throw new TypeError(
            `Optional second (value) element of third element (modifier) of BEM vector must be a non-empty
           alpha-numeric-dashed string, but ${typeOf(modValue)} (${modValue}) is given`
          );
        }
      }

    }

    return value;
  }

  /**
   * Checks that passed in name is a valid BEM name which is a non-empty
   * alpha-numeric-dashed string that starts and ends with letter and doesn't
   * contain sibling dashes.
   *
   * @param {*} name - Test subject
   * @return {boolean}
   * @private
   */
  static _isValidBemName(name) {
    if (_.isString(name)) {
      return (/^[a-zA-Z](:?[a-zA-Z0-9-]*[a-zA-Z0-9])$/.test(name) && !/-{2,}/.test(name));
    }
    else {
      return false;
    }
  }

  /**
   * Checks that passed in value is a valid BEM value which is a non-empty
   * alpha-numeric-dashed string that starts and ends with letter or digit and
   * doesn't contain sibling dashes.
   *
   * @param {*} value - Test subject
   * @return {boolean}
   * @private
   */
  static _isValidBemValue(value) {
    if (_.isString(value)) {
      return (/^(:?[a-zA-Z0-9]|[a-zA-Z0-9](:?[a-zA-Z0-9-]*[a-zA-Z0-9]))$/.test(value) && !/-{2,}/.test(value));
    }
    else {
      return false;
    }
  }

  /**
   * Throws error when BEM base is frozen.
   *
   * @return {BemBase}
   * @private
   * @throws {TypeError}
   *
   */
  _throwIfIsFrozen() {
    if (this.isFrozen) {
      throw new TypeError(
        "Bem base is frozen and can't be changed"
      );
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
    this._isFrozen = false;
    return this;
  }

  /**
   * Sets block of BEM base. Pass truthy value to `options.fresh` when you
   * don't want to change block of this instance but rather its copy.
   *
   * @param {*} value - Sets block of BEM base to new value
   * @param {object} [options] - Options
   * @param {boolean} [options.fresh=false] - Allows to set block of copy of this BEM base
   * @return {BemBase}
   */
  setBlk(value, options) {
    this._throwIfIsFrozen();

    if (options.fresh) {
      return new BemBase(this.toObj()).setBlk(value);
    }
    else {
      this.blk = value;
      return this;
    }
  }

  /**
   * Sets element of BEM base. Pass truthy value to `options.fresh` when you
   * don't want to element block of this instance but rather its copy.
   *
   * @param {*} value - Sets element of BEM base to new value
   * @param {object} [options] - Options
   * @param {boolean} [options.fresh=false] - Allows to set element of copy of this BEM base
   * @return {BemBase}
   */
  setElt(value, options) {
    this._throwIfIsFrozen();

    if (options.fresh) {
      return new BemBase(this.toObj()).setElt(value);
    }
    else {
      this.elt = value;
      return this;
    }
  }

  /**
   * Sets modifier of BEM base. Pass truthy value to `options.fresh` when you
   * don't want to modifier block of this instance but rather its copy.
   *
   * @param {*} value - Sets modifier of BEM base to new value
   * @param {object} [options] - Options
   * @param {boolean} [options.fresh=false] - Allows to set modifier of copy of this BEM base
   * @return {BemBase}
   */
  setMod(value, options) {
    this._throwIfIsFrozen();

    if (options.fresh) {
      return new BemBase(this.toObj()).setMod(value);
    }
    else {
      this.mod = value;
      return this;
    }
  }

  /**
   * Converts bem to BEM object.
   *
   * @return {~bemObj}
   */
  toObj() {
    return {blk: this.blk, elt: this.elt, mod: this.mod};
  }

  /**
   * Converts bem to BEM string.
   *
   * @return {~bemStr}
   */
  toStr() {
    return this.constructor.bemToStr(this.toObj());
  }

  /**
   * Converts bem to BEM vector.
   *
   * @return {~bemVec}
   */
  toVec() {
    return this.constructor.bemToVec(this.toObj());
  }

  /**
   * Just an alias for `toStr`.
   *
   * @return {~bemStr}
   */
  toString() {
    return this.toStr();
  }

  /**
   * Returns `true` when this instance is valid BEM base, otherwise returns
   * `false`.
   *
   * @return {boolean}
   */
  isValid() {
    try {
      return !!this.toStr();
    }
    catch (err) {
      return false;
    }
  }

  /**
   *
   * @param {string|array} classNames - A source for extraction. String of CSS classes separated by spaces or an array of BEM strings/vectors/objects
   * @return {array|undefined}
   */
  extractMod(classNames) {
    if (_.isEmpty(this.mod)) {
      throw new TypeError(
        `BEM modifier for extraction is not defined`
      );
    }

    if (_.isString(classNames)) {
      classNames = _.split(classNames, ' ');
    }

    if (!_.isArray(classNames)) {
      throw new TypeError(
        `'classNames' argument must be a string or an array, but ${typeOf(classNames)} (${classNames}) is given`
      );
    }

    const [modNam, modVal] = this.mod;
    const isFullMatch = (utils.isNonEmptyString(modVal) || _.isFinite(modVal) || _.isBoolean(modVal));

    // We must to reed of empty string as they are not valid BEM bases but may
    // occur during string splitting.
    _.remove(classNames, utils.isEmptyString);

    return _.find(
      classNames,
      (item) => {
        const bem = new this.constructor(item);
        const [itemModNam, itemModVal] = bem.mod;

        if (modNam === itemModNam) {
          return !!(isFullMatch && (modVal === ('' + itemModVal)));
        }
        else {
          return false;
        }
      }
    );
  }
}

export default BemBase;
