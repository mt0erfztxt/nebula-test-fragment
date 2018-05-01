/**
 * @module support/page-objects/fragment
 */

import _ from 'lodash';
import { detailedDiff } from 'deep-object-diff';
import escapeStringRegexp from 'escape-string-regexp';
import { pascalCase, ucFirst } from 'change-case';
import Promise from 'pinkie-promise';
import { Selector, t } from 'testcafe';
import typeOf from 'typeof--';
import Url from 'url-parse';

import BEM from '../bem';
import utils from '../utils';

/**
 * Class that represents a page fragment.
 */
class Fragment {

  /**
   * Creates fragment.
   *
   * @param {?object} [spec] - Object that contains specs used to initialize TestCafe `Selector` used in fragment. `opts.bemBase` scoped into default `parent` spec would be used when `nil` spec passed in
   * @param {string} [spec.cid] - Component id. Would be scoped into `parent` spec. Respects `cns` spec (if any)
   * @param {string} [spec.cns] - Component ns. Would be scoped into `parent` spec. Can be used in conjunction with `cid` or `idx` spec
   * @param {function} [spec.custom] - Some custom spec. Likewise `cid` and `idx` spec and in contrast to `handler` spec it respects `parent` and `cns` specs. Accepts current selector and BEM base as arguments, where current selector already scoped into `parent` and/or `cns` specs
   * @param {function} [spec.handler] - Used to implement cases when selector for fragment can't be obtained using other specs. Accepts `spec` object and BEM base as parameters. You must handle `cns` and `parent` specs (if any) yourself! So, when posible, use `custom` spec as it handles `cns` and `parent` specs for you
   * @param {number} [spec.idx] - Component index. Would be scoped into `parent` spec. Respects `cns` spec (if any). Must be an integer greater or equal zero
   * @param {*} [spec.parent='body'] - Parent scope for fragment's selector. Can be anything that TestCafe `Selector` accepts
   * @param {*} [spec.selector] - Anything that TestCafe `Selector` accepts. When posible, use `custom` spec as it handles `cns` and `parent` specs for you
   * @param {object} [opts] - Optional, options object
   * @param {string} [opts.bemBase=null] - BEM base of component, may be omitted when `handler` or `selector` spec is used
   * @throws {TypeError} When constructor arguments are not valid.
   */
  constructor(spec, opts) {
    if (!(_.isNil(spec) || _.isPlainObject(spec))) {
      throw new TypeError('`Fragment.constructor()`: Optional `spec` argument must be a plain object, but ' + `${spec} is given`);
    }

    // Report when spec value is not of supported type:
    // * `cid` - can be omitted, otherwise it must be non-empty string.
    if (spec && spec.cid && !utils.isNonEmptyString(spec.cid)) {
      throw new TypeError('`Fragment.constructor()`: When `cid` spec is set it must be a non-empty string, but ' + `${typeOf(spec.cid)} (${spec.cid}) is given`);
    }

    let parentSelector = null;
    let selectorInitializer = null;

    // Set parent scope for fragment's selector.
    if (spec && spec.parent instanceof Fragment) {
      parentSelector = spec.parent.selector;
    }
    else {
      parentSelector = Selector((spec && spec.parent) || 'body');
    }

    if (!(_.isNil(opts) || _.isPlainObject(opts))) {
      throw new TypeError('`Fragment.constructor()`: Optional `opts` argument must be a plain object');
    }

    // Defaults.
    opts = _.defaults(opts, { bemBase: this.constructor.bemBase });
    const { bemBase } = opts;

    /**
     * `opts` argument that was used to create this instance of fragment. All
     * default values would be in place.
     *
     * @member {object} _opts
     * @memberof module:support/page-objects/fragment~Fragment#
     * @protected
     */
    this._opts = opts;

    /**
     * `spec` argument that was used to create this instance of fragment.
     *
     * @member {object} _spec
     * @memberof module:support/page-objects/fragment~Fragment#
     * @protected
     */
    this._spec = spec;

    if (_.isNil(spec)) {
      if (!utils.isNonEmptyString(bemBase)) {
        throw new TypeError('`Fragment.constructor()`: `nil` spec can not be used without valid `opts.bemBase`');
      }

      selectorInitializer = parentSelector
        .find(`.${bemBase}`);
    }
    // Here an below `spec` is the POJO.
    else if (spec.selector) {
      selectorInitializer = Selector(spec.selector);
    }
    else if (_.isFunction(spec.handler)) {
      selectorInitializer = spec.handler(
        _.omit(spec, 'handler'),
        bemBase
      );
    }
    else {
      if (!utils.isNonEmptyString(bemBase)) {
        throw new TypeError('`Fragment.constructor()`: `opts.bemBase` can be omitted only for `selector` or `handler` spec');
      }

      // Set modification (ns) of component.
      if (utils.isNonEmptyString(spec.cns)) {
        selectorInitializer = parentSelector
          .find(`.${bemBase}--cns_${spec.cns}`);
      }

      if (_.isFunction(spec.custom)) {
        if (utils.isNonEmptyString(spec.cns)) {
          selectorInitializer = spec.custom.call(this, selectorInitializer, spec, opts);
        }
        else {
          selectorInitializer = spec.custom.call(this, parentSelector, spec, opts);
        }
      }
      else if (utils.isNonEmptyString(spec.cid)) {
        if (utils.isNonEmptyString(spec.cns)) {
          selectorInitializer = selectorInitializer
            .filter(`.${bemBase}--cid_${spec.cid}`);
        }
        else {
          selectorInitializer = parentSelector
            .find(`.${bemBase}--cid_${spec.cid}`);
        }
      }
      else if (_.has(spec, 'idx')) {
        if (!(_.isInteger(spec.idx) && spec.idx >= 0)) {
          throw new TypeError('`Fragment.constructor()`: `idx` spec must be an integer greater or equal 0, but ' + `${spec.idx} is given`);
        }

        if (utils.isNonEmptyString(spec.cns)) {
          selectorInitializer = selectorInitializer
            .nth(spec.idx);
        }
        else {
          selectorInitializer = parentSelector
            .find(`.${bemBase}`)
            .nth(spec.idx);
        }
      }
      else {
        const unknownSpecs = _.remove(
          _.keys(spec),
          it => { return !_.includes(['cns', 'parent'], it); }
        );

        if (!_.isEmpty(unknownSpecs)) {
          throw new TypeError(`'${this.displayName}.constructor()': Not supported specs found in given 'spec' - ${unknownSpecs}`);
        }

        if (!utils.isNonEmptyString(spec.cns)) {
          selectorInitializer = parentSelector
            .find(`.${bemBase}`);
        }
      }
    }

    /**
     * BEM base for fragment's DOM element.
     *
     * @member {object} _bemBase
     * @memberof module:support/page-objects/fragment~Fragment#
     * @private
     */
    // this._bemBase = bemBase;

    // TODO Deprecated infavor of `displayName`.
    /**
     * Name of fragment's class (just to be sure we'll get right value). Please,
     * set it to proper value in derived classes.
     *
     * @member {object} _fragment
     * @memberof module:support/page-objects/fragment~Fragment#
     * @protected
     */
    this._fragment = 'Fragment';

    /**
     * Store for persisted states.
     *
     * @member {object} _persistedStates
     * @memberof module:support/page-objects/fragment~Fragment#
     * @private
     */
    this._persistedStates = {};

    /**
     * TestCafe selector for fragment's DOM element.
     *
     * @member {object} selector
     * @memberof module:support/page-objects/fragment~Fragment#
     */
    this.selector = Selector(selectorInitializer).addCustomMethods({
      scrollTo: (node, position = 'top') => {
        if (position === 'top') {
          document.body.scrollTop = document.documentElement.scrollTop = 0;
        }
      }
    });

    // TODO Maybe would be better to move `selectorCustomizer` into `opts`?!
    // if (spec && _.isFunction(spec.selectorCustomizer)) {
    //   this.selector = spec.selectorCustomizer(this.selector, spec, opts);
    // }
    if (opts && _.isFunction(opts.selectorCustomizer)) {
      this.selector = opts.selectorCustomizer(this.selector, spec, opts);
    }
  }

  // ///////////////////////////////////////////////////////////////////////////
  //
  // STATIC METHODS
  //
  // ///////////////////////////////////////////////////////////////////////////

  /**
   * Builds URL string using passed in `path`.
   *
   * @param {string} path - Path that would be used to build URL
   * @param {object} [options] - Optional, options object
   * @param {object|string} [options.baseUrl] - Optional, base for URL, see [url-parse]{@link https://github.com/unshiftio/url-parse} for info
   * @param {object|string} [options.qs] - Optional, query string for URL. When it's a string it doesn't matter whether it starts with '?' or not
   * @returns {string} Returns built URL.
   * @throws {TypeError} When arguments aren't valid.
   */
  static buildUrl(path, options) {
    if (!_.isString(path)) {
      throw new TypeError(`'path' must be a string but it is ${typeOf(path)} (${path})`);
    }

    if (options && !_.isPlainObject(options)) {
      throw new TypeError(`Optional 'options' must be a plain object but it is ${typeOf(options)} (${options})`);
    }

    options = options || {};
    const { baseUrl, qs } = options;

    if (_.isString(qs)) {
      const qsNormalized = _.startsWith(qs, '?') ? qs : `?${qs}`;
      path += qsNormalized;
    }
    else if (_.isPlainObject(qs)) {
      path += Url.qs.stringify(qs, true);
    }
    else if (!_.isNil(qs)) {
      throw new TypeError(`Optional 'options.qs' must be a string or a plain object but it is ${typeOf(qs)} (${qs})`);
    }

    return new Url(path, baseUrl, true).toString();
  }

  // TODO Rename to something like `normalizeSpecAndOpts`.
  /**
   * Checks that `spec` and `opts` arguments passed in to fragment's constructor
   * are valid.
   *
   * @param {string} fragmentDisplayName - Human readable name of fragment class
   * @param {*} spec - `spec` argument passed in to fragment's constructor. See `Fragment`'s constructor
   * @param {*} opts - `opts` argument passed in to fragment's constructor. See `Fragment`'s constructor
   * @param {object} [defaults] - Optional, defaults for `spec` and `opts`
   * @param {object} [defaults.opts] - Optional, object of default values for attributes of `opts` argument. Default value would be used when `opts` attribute value is `null`, `undefined` or `NaN`
   * @param {object} [defaults.spec] - Optional, object of default values for attributes of `spec` argument. Default value would be used when `spec` attribute value is `null`, `undefined` or `NaN`
   * @returns {object} Returns object that have `spec` and `opts` attributes that contains `spec` and `opts` that ready to be used to construct fragment
   * @throws {TypeError} When passed in arguments aren't valid.
   */
  static checkFragmentSpecAndOpts(fragmentDisplayName, spec, opts, defaults) {
    if (!(_.isString(fragmentDisplayName) && fragmentDisplayName.length)) {
      throw new TypeError('`checkFragmentSpecAndOpts()`: `fragmentDisplayName` argument must be a non-empty string');
    }

    if (spec instanceof Fragment) {
      throw new TypeError(`\`${fragmentDisplayName}.constructor()\`: \`spec\` can not be instance of fragment other than \`${fragmentDisplayName}\``);
    }

    if (!(_.isNil(opts) || _.isPlainObject(opts))) {
      throw new TypeError(`\`${fragmentDisplayName}.constructor()\`: Optional \`opts\` argument must be a plain object`);
    }

    spec = spec || {};
    opts = opts || {};

    if (!(_.isNil(defaults) || _.isPlainObject(defaults))) {
      throw new TypeError('`checkFragmentSpecAndOpts()`: Optional `defaults` argument must be a plain object');
    }

    if (defaults) {
      if (!(_.isNil(defaults.spec) || _.isPlainObject(defaults.spec))) {
        throw new TypeError('`checkFragmentSpecAndOpts()`: Optional `defaults.spec` attribute must be a plain object');
      }

      if (!(_.isNil(defaults.opts) || _.isPlainObject(defaults.opts))) {
        throw new TypeError('`checkFragmentSpecAndOpts()`: Optional `defaults.opts` attribute must be a plain object');
      }

      if (!_.isEmpty(defaults.spec)) {
        _.forOwn(defaults.spec, (v, k) => { spec[k] = _.defaultTo(spec[k], v); });
      }

      if (!_.isEmpty(defaults.opts)) {
        _.forOwn(defaults.opts, (v, k) => { opts[k] = _.defaultTo(opts[k], v); });
      }
    }

    // TODO Does we need it here? Maybe check that we already have in `Fragment`'s constructor is enough?'
    const { bemBase } = opts;
    if (!(_.isNil(bemBase) || (_.isString(bemBase) && bemBase.length))) {
      throw new TypeError(`\`${fragmentDisplayName}.constructor()\`: \`opts.bemBase\` must be \`null\`, \`undefined\` or non-empty string, but ${bemBase} is given`);
    }

    return { spec, opts };
  }

  /**
   * Used as simple check that class is a `Fragment` or its descendant.
   *
   * @member {boolean} _isFragmentClass
   * @memberof module:support/page-objects/fragment~Fragment.
   * @protected
   * @static
   */
  static get isFragmentClass() {
    return true;
  }

  // TODO Return `undefined` from `setState` and `setXyzPartOfState` methods
  //      instead of boolean `false` because `false` can be returned as value of
  //      some part of state.
  // TODO Rename. The 'was' part of current name says that it always return
  //      boolean, but that's not true.
  /**
   * Recursively walks through `setStateResult` and returns it when any of its
   * attribute or attribute of its (grand-)children exists and is not boolean
   * `false`, or `false` otherwise.
   *
   * @param {*} setStateResult - State to check
   * @returns {*}
   * @static
   */
  static stateWasSet(setStateResult) {
    if (_.isNil(setStateResult)) {
      return false;
    }

    if (_.isPlainObject(setStateResult)) {
      let wasset = false;

      _.forOwn(
        setStateResult,
        (v, k) => {
          if (_.isPlainObject(v)) {
            wasset = Fragment.stateWasSet(v);
          }
          else if (!_.isNil(v) && v !== false) {
            wasset = true;
          }

          // Stop walking through state on first positive.
          return wasset ? false : void 0;
        }
      );

      return wasset ? setStateResult : false;
    }
    else {
      return setStateResult !== false ? setStateResult : false;
    }
  }

  // TODO Support for not BEM based cases of boolean attributes, for example,
  //      'data-xyz' atributes.
  /**
   * Returns class that is a descendant of `BaseFragmentClass` and,
   * additionally, have methods for part of state that can be described in terms
   * of existance of BEM modifier in fragment's DOM element CSS class.
   *
   * @param {class} BaseFragmentClass - Class to extend from
   * @param {string|array} name - Name of state part. When it's a string then it would be used as state part name and also as name of attribute/BEM modifier. When names differ, for example a case of data attribute, an array of two strings - a state part name and attribute/BEM modifier name, can be passed.
   * @param {object} [options] - Optional, options object
   * @param {string} [options.antonym] - Optional, name of other side of state part, for example, for 'Disabled' part of state other side would be 'Enabled'. Used to generate additional assertion methods, but only when `options.isBoolean` is truthy and `options.isBooleanHas` is falsey. For example, when `options.antonym` is 'Enabled' `expextIsEnabled` and `expextIsNotEnabled` methods would be generated
   * @param {boolean} [options.isBoolean=true] - Optional, when truthy additional assertion methods would be generated. For example, when name is 'Disabled' and `options.isBoolean` is truthy `expectIsDisabled` and `expectIsNotDisabled` methods would be generated
   * @param {boolean} [options.isBooleanHas=false] - Optional, when truthy then assertion methods would be named with 'Has' instead of 'Is'
   * @param {string} [options.src='bemModifier'] - Optional, where state part holds it's value. Must be one of 'attribute', or 'bemModifier'
   * @param {boolean|string} [options.waitTil] - Optional, same as `options.waitUntil` but reversed - allows to wait til attribut/BEM modifier exists (boolean) or have specified value
   * @param {boolean|string} [options.waitUntil] - Optional, when truthy and `options.isBoolean` also truthy fragment's class would have `waitUntil[NameOfStatePart]` method that is a convenience alias for `expectIs[NameOfStatePart]` method
   * @returns {class}
   * @static
   */
  static withPartOfStateMixin(BaseFragmentClass, name, options) {
    if (!BaseFragmentClass.isFragmentClass) {
      throw new TypeError(`'Fragment.withPartOfStateMixin()': 'BaseFragmentClass' argument must be a 'Fragment' class or its descendant`);
    }

    let _partName = name,
      _attrName;

    if (_.isArray(name)) {
      [_partName, _attrName] = name;
    }

    if (!utils.isNonEmptyString(_partName)) {
      throw new TypeError(`'Fragment.withPartOfStateMixin()': 'name' argument must be a non-empty string or array but it is ${typeOf(_partName)} (${_partName})`);
    }
    else if (_attrName && !utils.isNonEmptyString(_attrName)) {
      throw new TypeError(`'Fragment.withPartOfStateMixin()': Optional second item of 'name' array argument must be a non-empty string but it is ${typeOf(_attrName)} (${_attrName})`);
    }

    if (!(_.isNil(options) || _.isPlainObject(options))) {
      throw new TypeError(`'Fragment.withPartOfStateMixin()': Optional 'options' argument must be a plain object but it is ${typeOf(options)} (${options})`);
    }

    options = options || {};
    const { antonym, isBoolean = true, isBooleanHas = false, src = 'bemModifier', waitTil, waitUntil } = options;

    const attrName = _attrName || _partName;
    const partName = pascalCase(_partName);

    const MixedClass = class extends BaseFragmentClass {

      /**
       * Obtains value of state's part and returns it.
       *
       * @param {object} [options] - Optional, options object
       * @returns {*} Returns value of state's part.
       */
      async [`get${partName}PartOfState`](options) {
        if (src === 'bemModifier') {
          if (isBoolean) {
            const modifier = this.buildBemModifier(attrName);
            return this.selector.hasClass(modifier);
          }
          else {
            const modifiers = await this.getBemModifiers(attrName);

            if (_.isEmpty(modifiers)) {
              return void 0;
            }

            // TODO See todos for attribute case (below) and adjust returned value accordingly!
            return this.extractBemModifierValue(modifiers[0]) || '';
          }
        }
        else if (src === 'attribute') {
          if (isBoolean) {
            return this.selector.hasAttribute(attrName);
          }
          else {
            // TODO What `getAttribute()` returns when element has no specified attribute?
            // TODO What `getAttribute()` returns when element's attribute has no value?
            return this.selector.getAttribute(attrName);
          }
        }
        else {
          throw new TypeError(`'Fragment.withPartOfStateMixin()': Optional 'options.src' option must be one of 'attribute' or 'bemModifier' but it is ${src}`);
        }
      }

      /**
       * Does nothing because this part of state is read only.
       *
       * @param {*} value - Doesn't matter
       * @param {object} [options] - Optional, options object
       * @returns {*} Current value of part of fragment's state after set state operation is done.
       */
      async [`set${partName}PartOfState`](value, options) {
        return this[`get${partName}PartOfState`](options);
      }

      /**
       * Asserts that fragment's state part is equal boolean `value`.
       *
       * @param {boolean} value - Part of state must match that value to pass assertion
       * @param {boolean} [isNot] - When truthy assertion would be inverted
       * @throws {TypeError} When `value` argument is not boolean `true` or `false`.
       */
      async [`expect${partName}PartOfStateIs`](value, isNot) {
        value = isBoolean ? null : value;

        if (src === 'bemModifier') {
          await this.expectSelectorConformsRequirements(this.selector, {
            bemModifiers: [
              [attrName, value, isNot]
            ]
          });
        }
        else if (src === 'attribute') {
          await this.expectSelectorConformsRequirements(this.selector, {
            attributes: [
              [attrName, value, isNot]
            ]
          });
        }
        else {
          throw new TypeError(`'Fragment.withPartOfStateMixin()': Optional 'options.src' option must be one of 'attribute' or 'bemModifier' but it is ${src}`);
        }
      }
    };

    if (isBoolean) {

      // Boolean part of states have methods named like `expectIsDisabled` and
      // `expectIsNotDisabled`. That methods accepts zero arguments and asserts
      // on boolean `true` and `false` accordingly.
      Object.defineProperties(MixedClass.prototype, {
        [`expect${isBooleanHas ? 'Has' : 'Is'}${partName}`]: {
          configurable: true,
          enumerable: false,
          writable: true,
          /**
           * Asserts that fragment's state part value equal boolean `true`.
           *
           * @return {Promise<void>}
           */
          value: async function() {
            await this[`expect${partName}PartOfStateIs`](null, false);
          }
        },
        [`expect${isBooleanHas ? 'HasNo' : 'IsNot'}${partName}`]: {
          configurable: true,
          enumerable: false,
          writable: true,
          /**
           * Asserts that fragment's state part value equal boolean `false`.
           *
           * @return {Promise<void>}
           */
          value: async function() {
            await this[`expect${partName}PartOfStateIs`](null, true);
          }
        }
      });

      // Handle `options.antonym`.
      if (!(_.isNil(antonym) || utils.isNonEmptyString(antonym))) {
        throw new TypeError(`'Fragment.withPartOfStateMixin()': Optional 'options.antonym' option must be a non-empty string but it is ${typeOf(antonym)} (${antonym})`);
      }

      if (antonym && !isBooleanHas) {
        const antonymPartName = pascalCase(antonym);

        Object.defineProperties(MixedClass.prototype, {
          [`expectIs${antonymPartName}`]: {
            configurable: true,
            enumerable: false,
            writable: true,
            value: async function() {
              await this[`expectIsNot${partName}`]();
            }
          },
          [`expectIsNot${antonymPartName}`]: {
            configurable: true,
            enumerable: false,
            writable: true,
            value: async function() {
              await this[`expectIs${partName}`]();
            }
          }
        });
      }

      // Handle `options.waitTil`.
      if (!(_.isNil(waitUntil) || _.isBoolean(waitUntil) || utils.isNonEmptyString(waitUntil))) {
        throw new TypeError(`'Fragment.withPartOfStateMixin()': Optional 'options.waitUntil' option must be a boolean or non-empty string but it is ${typeOf(waitUntil)} (${waitUntil})`);
      }

      let waitTilPartName = null;

      if (waitTil === true) {
        waitTilPartName = partName;
      }
      else if (_.isString(waitTil)) {
        waitTilPartName = pascalCase(waitTil);
      }

      if (waitTilPartName) {
        Object.defineProperty(MixedClass.prototype, `waitTil${waitTilPartName}`, {
          configurable: true,
          enumerable: false,
          writable: true,
          /**
           * Allows to wait Til fragment's element has BEM modifier used to
           * specify state part.
           *
           * @param {object} [options] - Options
           * @param {number} [options.wait] - Number of milliseconds to wait before assertion
           * @return {Promise<void>}
           */
          value: async function(options) {
            const {wait} = utils.prepareOptions(options);

            if (wait) {
              await t.wait(wait);
            }

            await this[`expect${partName}PartOfStateIs`](null, true);
          }
        });
      }

      // Handle `options.waitUntil`.
      if (!(_.isNil(waitUntil) || _.isBoolean(waitUntil) || utils.isNonEmptyString(waitUntil))) {
        throw new TypeError(`'Fragment.withPartOfStateMixin()': Optional 'options.waitUntil' option must be a boolean or non-empty string but it is ${typeOf(waitUntil)} (${waitUntil})`);
      }

      let waitUntilPartName = null;

      if (waitUntil === true) {
        waitUntilPartName = partName;
      }
      else if (_.isString(waitUntil)) {
        waitUntilPartName = pascalCase(waitUntil);
      }

      if (waitUntilPartName) {
        Object.defineProperty(MixedClass.prototype, `waitUntil${waitUntilPartName}`, {
          configurable: true,
          enumerable: false,
          writable: true,
          /**
           * Allows to wait until fragment's element has BEM modifier used to
           * specify state part.
           *
           * @param {object} [options] - Options
           * @param {number} [options.wait] - Number of milliseconds to wait before assertion execution
           * @return {Promise<void>}
           */
          value: async function(options) {
            const {wait} = utils.prepareOptions(options);

            if (wait) {
              await t.wait(wait);
            }

            await this[`expectIs${partName}`]();
          }
        });
      }
    }
    else {

      // Non-boolean part of states have methods named like `expectWidgetIs` and
      // `expectWidgetIsNot`. That methods accepts single argument and asserts
      // on it.
      Object.defineProperties(MixedClass.prototype, {
        [`expect${partName}Is`]: {
          configurable: true,
          enumerable: false,
          writable: true,
          /**
           * Asserts that fragment's state part value is equal to `value`.
           */
          value: async function(value) {
            await this[`expect${partName}PartOfStateIs`](value, false);
          }
        },
        [`expectIsNot${partName}`]: {
          configurable: true,
          enumerable: false,
          writable: true,
          /**
           * Asserts that fragment's state part value is not equal to `value`.
           */
          value: async function(value) {
            await this[`expect${partName}PartOfStateIs`](value, true);
          }
        }
      });

    }

    return MixedClass;
  }

  // ///////////////////////////////////////////////////////////////////////////
  //
  // INSTANCE METHODS
  //
  // ///////////////////////////////////////////////////////////////////////////

  // ---------------------------------------------------------------------------
  // BEM Methods
  // ---------------------------------------------------------------------------

  /**
   * Returns BEM element for BEM base used in fragment's selector.
   *
   * @param {string} name - Name for BEM element
   * @returns {string}
   * @throws {TypeError} When fragment selector's BEM base already a BEM element.
   */
  buildBemElement(name) {
    const bemBase = this.getBemBase();

    if (_.includes(bemBase, '__')) {
      throw new TypeError(
        '`Fragment.buildBemElement()`: `bemBase` already a BEM element ' +
        bemBase
      );
    }

    return `${bemBase}__${name}`;
  }


  /**
   * Accepts BEM specification and returns string. It has same functionality as
   * `utils.bemSpecToString`, doesn't allow to pass `string` as `spec` argument
   * and `spec.base` always set to fragment's BEM base.
   *
   * @param {object|array} spec - BEM specification
   * @param {object} [options] - Optional, options object
   * @returns {string} Returns string representation of passed in BEM specification.
   * @throws {TypeError} When arguments aren't valid.
   */
  buildBem(spec, options) {
    const base = this.getBemBase();

    if (_.isArray(spec)) {
      spec = _.concat([base], spec);
    }
    else if (_.isPlainObject(spec)) {
      spec.base = base;
    }
    else {
      throw new TypeError(`\`${this._fragment}#buildBem()\`: \`spec\` argument must be a plain object or an \`Array\`, but ${typeOf(spec)} (${spec}) is given`);
    }

    return utils.bemSpecToString(spec, options);
  }

  /**
   * Convenience method - returns same result as `buildBemElement` but prepened
   * with '.' to save some typings.
   *
   * @param {string} name - Name for BEM element
   * @returns {string}
   */
  buildBemElementClassName(name) {
    const bemElement = this.buildBemElement(name);
    return `.${bemElement}`;
  }

  /**
   * Returns BEM modifier for BEM base used in fragment's selector.
   *
   * @param {string} name - Name for BEM modifier
   * @param {string} [value=null] - Value for BEM modifier
   * @returns {string}
   */
  buildBemModifier(name, value = null) {
    const bemBase = this.getBemBase();

    if (value || value === 0 || value == false) {
      return `${bemBase}--${name}_${value}`;
    }
    else {
      return `${bemBase}--${name}`;
    }
  }

  /**
   * Convenience method - returns same result as `buildBemModifier` but prepened
   * with '.' to save some typings.
   *
   * @param {string} name - Name for BEM element
   * @returns {string}
   */
  buildBemModifierClassName(name, value = null) {
    const bemModifier = this.buildBemModifier(name, value);
    return `.${bemModifier}`;
  }

  // TODO Return empty string when modifier has no value? `/^.*--[^_]+_{0,1}/`.
  /**
   * Extracts value from BEM modifier.
   *
   * @param {string} modifier - A mofdifier which value must be extracted
   * @returns {string|null} Modifier value or `null` for simple modifiers.
   */
  extractBemModifierValue(modifier) {
    const value = _.replace(modifier, /^.*--[^_]+_/, '');
    return value ? value : null;
  }

  // TODO Deprecated in favor of `bemBase` getter.
  /**
   * Returns BEM base used in fragment's selector.
   *
   * @returns {string}
   * @throws {TypeError} When BEM base isn't set.
   */
  getBemBase() {
    return this.bemBase;
  }

  /**
   * Creates new instance of `BEM` class using fragment's `bemBase` as its
   * initializer.
   *
   * @returns {object} Instance of `BEM` class.
   */
  get bem() {
    return new BEM(this.bemBase);
  }

  /**
   * Fragment's block BEM base.
   *
   * @returns {string}
   * @throws {TypeError} When fragment was created without BEM base.
   */
  get bemBase() {
    if (this._bemBase) {
      return this._bemBase;
    }

    this._bemBase = this._opts.bemBase || this.constructor.bemBase || super.bemBase;

    if (!utils.isNonEmptyString(this._bemBase) || this._bemBase === 'BASE_FRAGMENT') {
      throw new TypeError(`Fragment instance was created without BEM base`);
    }

    return this._bemBase;
  }

  get displayName() {
    return (this.constructor.displayName || super.displayName);
  }

  // XXX Legacy - now fragment's display name must be set on fragment's
  //     constructor.
  /**
   * Fragment's display name.
   *
   * @returns {string} Returns fragment's display name.
   */
  get fragmentDisplayName() {
    return this.constructor.displayName;
  }

  getSomethingFragment(name, RootFragmentOfSomething) {
    const propName = ucFirst(name) + 'Fragment'; // e.g. 'TextInputFragment'

    const FromInst = this._opts[propName];
    const FromClass = this.constructor[propName];
    const FromParent = (this instanceof RootFragmentOfSomething && this.constructor !== RootFragmentOfSomething && super[propName]);

    const SomethingFragment = FromInst || FromClass || FromParent;

    if (!_.isFunction(SomethingFragment)) {
      throw new TypeError(`${this.constructor.displayName}.${propName} must be a function but ${typeOf(SomethingFragment)} (${SomethingFragment}) is given`);
    }

    return SomethingFragment;
  }

  /**
   * Builds modifier for BEM base used in fragment's selector using passed in
   * `name` and, optionally, `value`, and returns it if it found in fragment's
   * selector DOM element class names or `null` otherwise. Please note, that it
   * doesn't have auto wait feature like TestCafe assertions and so fragment
   * must be in stable state at time modifier is queried.
   *
   * @param {string} name - A name for BEM modifier
   * @param {string} [value=null] - A value for BEM modifier
   * @returns {string|null}
   */
  async getBemModifier(name, value = null) {
    const bemBase = this.getBemBase();
    const bemBasePlusName = `${bemBase}--${name}`;

    const classNames = await this.selector.classNames;
    const classNamesMatchedModifier = _.filter(
      classNames,
      it => _.startsWith(it, bemBasePlusName)
    );

    if (_.isEmpty(classNamesMatchedModifier)) {
      return null;
    }

    if (value || value === 0 || value === false) {
      return _.find(
        classNamesMatchedModifier,
        it => it === `${bemBasePlusName}_${value}`
      );
    }

    return _.find(
      classNamesMatchedModifier,
      it => it === `${bemBasePlusName}`
    );
  }

  /**
   * Builds BEM modifier for BEM base used in fragment's selector and composes
   * `Array` of BEM modifiers with passed in `name` and any value. When `name`
   * is `null` resulting `Array` would contain all fragment's selector DOM
   * element class names that matches fragment's selector BEM base.
   *
   * @param {string} [name=null] - Optional, name for BEN modifier
   * @returns {Array<string>}
   */
  async getBemModifiers(name = null) {
    const bemBase = this.getBemBase();
    const classNames = await this.selector.classNames;

    let bemBasePlusName = `${bemBase}--`;
    if (name) {
      bemBasePlusName = bemBasePlusName + name;
    }

    return _.filter(
      classNames,
      it => _.startsWith(it, bemBasePlusName)
    );
  }

  // ---------------------------------------------------------------------------
  // State Methods
  // ---------------------------------------------------------------------------

  /**
   * Must return list of state part names that fragment supports. When
   * `onlyWritable` is truthy only part names that can be set using
   * `Fragment.setState()` must be returned.
   *
   * @param {boolean} [onlyWritable=false] - Whether only writable state part names must be returned or not
   * @return {Array} List of part names of fragment's state.
   */
  getStateParts(onlyWritable = false) {
    return [];
  }

  // TODO Perhaps, we can safely use `Promise.all()` here to compose state from parts.
  /**
   * Obtains fragment's state (all parts).
   *
   * @param {object} [options] - Optional, options object
   * @param {string[]} [options.omitParts] - Optional, when it's an `Array` then only parts of state that not found in that list would be in returned state. Applied after `options.onlyParts`
   * @param {string[]} [options.onlyParts] - Optional, when it's an `Array` then only parts of state that found in that list would be in returned state. Applied before `options.omitParts`
   * @return {Promise<{}>} Fragment's state (all parts).
   * @throws {TypeError} When arguments aren't valid.
   */
  async getState(options) {
    if (!(_.isNil(options) || _.isPlainObject(options))) {
      throw new TypeError(`\`${this._fragment}.getState()\`: Optional \`options\` argument must be a plain object, but ${typeOf(options)} (${options}) is given`);
    }

    let statePartList = this.getStateParts();

    if (!_.isArray(statePartList)) {
      throw new Error(`\`${this._fragment}.getStateParts()\` must return \`Array\` of state part names`);
    }
    else {
      statePartList = _.uniq(statePartList);
    }

    options = options || {};
    let { omitParts, onlyParts } = options;

    if (options.waitBefore) {
      await t.wait(options.waitBefore);
    }

    if (!(_.isNil(omitParts) || _.isArray(omitParts))) {
      throw new TypeError(`\`${this._fragment}.getState()\`: Optional \`options.omitParts\` option must be an \`Array\`, but ${typeOf(omitParts)} (${omitParts}) is given`);
    }

    if (!(_.isNil(onlyParts) || _.isArray(onlyParts))) {
      throw new TypeError(`\`${this._fragment}.getState()\`: Optional \`options.onlyParts\` option must be an \`Array\`, but ${typeOf(onlyParts)} (${onlyParts}) is given`);
    }

    const state = {};

    if (statePartList.length) {
      const partNames = [];
      const partGetStatePromises = [];

      for (const k of statePartList) {
        let include = true;
        include = _.includes(onlyParts, k);
        include = !_.includes(omitParts, k);

        if (include) {
          const partName = pascalCase(k);
          partNames.push(k);
          try {
            partGetStatePromises.push(this[`get${partName}PartOfState`](options));
          }
          catch (err) {
            throw new TypeError(`'${this.displayName}.get${partName}PartOfState' is not callable`);
          }
        }
      }

      const partStateList = await Promise.all(partGetStatePromises);
      const partStateListLength = partStateList.length;

      for (let i = 0; i < partStateListLength; i++) {
        state[partNames[i]] = partStateList[i];
      }
    }

    return state;
  }

  /**
   * Sets state of fragment to `newState`.
   *
   * @param {object} newState - New state for fragment
   * @param {object} [options] - Optional, options object
   * @return {Promise<*>} Value of fragment's state after set state operation is done.
   * @throws {TypeError} When arguments aren't valid.
   */
  async setState(newState, options) {
    if (_.isUndefined(newState)) {
      return this.getState(options);
    }

    if (!_.isPlainObject(newState)) {
      throw new TypeError(`\`${this._fragment}.setState()\`: Optional \`newState\` argument must be a plain object, but ${typeOf(newState)} (${newState}) is given`);
    }

    if (!(_.isNil(options) || _.isPlainObject(options))) {
      throw new TypeError(`\`${this._fragment}.setState()\`: Optional \`options\` argument must be a plain object, but ${typeOf(options)} (${options}) is given`);
    }

    let statePartList = this.getStateParts(true);

    if (!_.isArray(statePartList)) {
      throw new Error(`\`${this._fragment}.setStateParts()\` must return an \`Array\` of state part names, but ${typeOf(statePartList)} (${statePartList}) is returned`);
    }
    else {
      statePartList = _.uniq(statePartList);
    }

    const state = {};

    for (let k of statePartList) {
      const partName = pascalCase(k);
      state[k] = await this[`set${partName}PartOfState`](newState[k], options);
    }

    // TODO `stateWasSet` not used anymore?
    // return Fragment.stateWasSet(state);
    return state;
  }

  /**
   * Persists fragment's state under specified `id` and returns it. When
   * optional `state` argument is `nil` then fragment's current state would be
   * persisted.
   *
   * @param {string} id - Id that would be used to identify persisted state
   * @param {object} [state] - Optional, state that must be persisted. Pass `nil` to persist fragment's current state
   * @param {object} [options] - Optional, options object
   * @returns {object} State that was persisted.
   * @throws {TypeError} When arguments aren't valid.
   */
  async persistState(id, state, options) {
    if (!utils.isNonEmptyString(id)) {
      throw new TypeError(`\`${this._fragment}.persistState()\`: \`id\` argument must be a non-empty string, but ${typeOf(id)} (${id}) is given`);
    }

    if (_.isNil(state)) {
      state = await this.getState(options);
    }
    else if (!_.isPlainObject(state)) {
      throw new TypeError(`\`${this._fragment}.persistState()\`: Optional \`state\` argument must be a plain object, but ${state} is given`);
    }

    return this._persistedStates[id] = state;
  }

  /**
   * Sets fragment's state to one that was persisted earlier and identified by
   * passed `id`. Returns boolean `false` when fragment's state wasn't changed
   * by applying persisted state or object with changes otherwise.
   *
   * @param {string} id - Id of state that was persisted earlier
   * @returns {*} Boolean `false` when state wasn't changed or object with changes otherwise
   * @throws {TypeError} When arguments aren't valid.
   */
  async restoreState(id) {
    if (!utils.isNonEmptyString(id)) {
      throw new TypeError(`\`${this._fragment}.restoreState()\`: \`id\` argument must be a non-empty string, but ${typeOf(id)} (${id}) is given`);
    }

    const state = this._persistedStates && this._persistedStates[id];

    if (!_.isPlainObject(state)) {
      throw new TypeError(`\`${this._fragment}.restoreState()\`: Persisted state with id equal '${id}' does not exist`);
    }

    return this.setState(state);
  }

  /**
   * Obtains fragment's state that was persisted earlier under specified `id`
   * and returns it.
   *
   * @param {string} id - Id of state that was persisted earlier
   * @returns {object} Persisted state.
   * @throws {TypeError} When argument isn't valid or persisted state identified by `id` not exists.
   */
  getPersistedState(id) {
    let state;

    if (utils.isNonEmptyString(id)) {
      state = this._persistedStates && this._persistedStates[id];

      if (_.isUndefined(state)) {
        throw new TypeError(`\`${this._fragment}.restoreState()\`: Persisted state with id equal '${id}' does not exist`);
      }
    }
    else {
      throw new TypeError(`\`${this._fragment}.getPersistedState()\`: \`id\` argument must be a non-empty string, but ${typeOf(id)} (${id}) is given`);
    }

    return state;
  }

  /**
   * Asserts that specified by `stateOrId` is equal fragment's current state.
   *
   * @param {object|string} stateOrId - Fragment's current state must be equal that value to pass assertion. When it's a string then persisted state with id equal that value wmust be equal fragment's current state to pass assertion
   * @param {object} [options] - Optional, options object. Same as in `Fragment#getState`
   * @throws {TypeError} When arguments aren't valid.
   */
  async expectStateIs(stateOrId, options) {
    if (!(_.isPlainObject(stateOrId) || utils.isNonEmptyString(stateOrId))) {
      throw new TypeError(`\`${this._fragment}.expectStateIs()\`: \`stateOrId\` argument must be a plain object or non-empty string, but ${typeOf(stateOrId)} (${stateOrId}) is given`);
    }

    options = utils.prepareOptions(options);
    const { debug = false } = options;

    const currentState = await this.getState(options);
    const stateToMatch = _.isPlainObject(stateOrId) ? stateOrId : this.getPersistedState(stateOrId);

    if (debug) {
      console.log('// ----------------------------- Current State --------------------------------');
      console.log(JSON.stringify(currentState, null, '\t'));
      console.log('// ----------------------------------------------------------------------------');
      console.log();
      console.log('// ------------------------------Expected State--------------------------------');
      console.log(JSON.stringify(stateToMatch, null, '\t'));
      console.log('// ----------------------------------------------------------------------------');
    }

    await t
      .expect(currentState)
      .eql(
        stateToMatch,
        `Current state doesn't match expected\n${JSON.stringify(detailedDiff(stateToMatch, currentState), null, '\t')}\n`
      );
  }

  // ---------------------------------------------------------------------------
  // Assertions
  // ---------------------------------------------------------------------------

  /**
   * Run assertions on fragment's selector. Currently it only asserts that
   * selector must (not) exist and returns `false` in case selector must not
   * exist.
   *
   * @param {object} options - Optional, options object
   * @returns {*} Returns boolean `false` when following assertions are meaningless otherwise return value can be anything.
   * @throws {TypeError} When `options` argument is not valid.
   */
  async expect(options) {
    if (!(_.isNil(options) || _.isPlainObject(options))) {
      throw new TypeError(`Optional 'cfg' argument must be a plain object but it is ${typeOf(options)} (${options})`);
    }

    let result;

    options = options || {};
    const { exists } = options;

    // Handling fragment existance only when it must not be skipped.
    if (exists !== 'skip') {
      await this.expectExists(exists);

      // We stop here when fragment must not exist because other assertions have
      // meaning only when fragment exists!
      if (exists === false || (exists && exists.isNot)) {
        result = false;
      }
    }

    return result;
  }

  /**
   * Asserts that fragment's selector exists.
   *
   * @param {boolean|object} [options] - Optional, options object. Passing boolean `false` is same as passing object with `isNot` property set to boolean `false`
   * @param {boolean} [options.allowMultiple=false] - When falsey then selector must return only one DOM element to pass assertion
   * @param {boolean} [options.isNot=false] - When truthy selector must not exist (return zero DOM elements) to pass assertion
   * @param {string} [options.message] - Optional, allows to print custom message on fail
   */
  async expectExists(options) {

    // Handling case of short 'Not exists' case.
    if (options === false) {
      options = { isNot: true };
    }

    await utils.testCafe.expectExists(this.selector, options);
  }

  /**
   * Asserts that fragment's selector returns DOM elements. By default it also
   * asserts that fragment's selector returns only one DOM element and that
   * behavior can be change by using optional `allowMultiple` argument.
   *
   * @param {boolean} [allowMultiple=false] - Allows fragment's selector to return more than one DOM element
   * @param {object} [options] - Optional, options object
   * @param {string} [options.message] - Optional, error message
   */
  async expectIsExist(allowMultiple = false, options) {
    options = options || {};
    let { message } = options;

    if (!utils.isNonEmptyString(message)) {
      message = 'Selector must return one ';
      message += allowMultiple ? 'or more DOM elements ' : 'DOM element ';
      message += `but it doesn't`;
    }


    if (allowMultiple) {
      await t.expect(this.selector.exists).ok(message);
    }
    else {
      await t.expect(this.selector.count).eql(1, message);
    }
  }

  /**
   * Asserts that fragment's selector doesn't returns DOM element.
   */
  async expectIsNotExist() {
    await t.expect(this.selector.exists).notOk();
  }

  /**
   * Asserts that fragment's selector has specified BEM modifier.
   *
   * @param {string} name - A name of modifier
   * @param {string} [value=null] - A value of modifier
   */
  async expectHasBemModifier(name, value = null) {
    // We can't use `getBemModifier()` here as page may not have DOM element or
    // element may not have modifier right now, for example, remote operation is
    // not completed. Instead we use TestCafe auto waiting feature.
    const modifier = this.buildBemModifier(name, value);
    await t
      .expect(this.selector.hasClass(modifier))
      .ok(`'${this.displayName}' fragment must have BEM modifier '${modifier}'`);
  }

  /**
   * Asserts that fragment's selector has no specified BEM modifier.
   *
   * @param {string} name - A name of modifier
   * @param {string} [value=null] - A value of modifier
   */
  async expectHasNoBemModifier(name, value = null) {
    // We can't use `getBemModifier()` here as page may not have DOM element or
    // element may not have modifier right now, for example, remote operation is
    // not completed. Instead we use TestCafe auto waiting feature.
    const modifier = this.buildBemModifier(name, value);
    await t
      .expect(this.selector.hasClass(modifier))
      .notOk(`Fragment must not have BEM modifier '${modifier}'`);
  }

  // TODO Signature is not consistent with `Fragment`'s constructor! We must
  //      also pass `opts` argument.
  /**
   * Asserts that `this` instance of fragment has other fragment, named
   * `Something`, in it and that other fragment must be obtained using passed in
   * `spec` and, optionally, asserts that other fragment found at position
   * specified by `idx`.
   *
   * It requires that `this` fragment has `get[Something]()` method.
   *
   * @param {string} Something - Name of something, for example, in `Dialog` it's an 'Action'
   * @param {*} spec - See `spec` parameter of `Something` constructor
   * @param {number} [idx] - Position at which something must be found to pass assertion. Must be an integer greater than or equal zero
   * @return {Promise<void>}
   * @throws {TypeError} When requirements failed.
   */
  async expectHasSomething(Something, spec, idx) {
    const getterName = `get${Something}`;

    if (!_.isFunction(this[getterName])) {
      const base = this.getBemBase();
      throw new TypeError(`${this.fragmentDisplayName}.expectHasSomething(${Something}): This fragment ('${base}') has no required ${getterName} method`);
    }

    const something = this[getterName](spec);
    await something.expectIsExist();

    if (_.isInteger(idx)) {
      await something.expectIndexInParentIs(idx, this.selector);
    }
  }

  // TODO Signature is not consistent with `Fragment`'s constructor! We must
  //      also pass `opts` argument. Maybe `specList` must be an array of
  //      arrays where first element is a spec and second is an opts?
  /**
   * Asserts that `this` instance of fragment has list of other fragments, named
   * `Something`, in it and that other fragments must be obtained using list of
   * specs passed in as `specList`. Optionally, asserts that `this` fragment has
   * only specified other fragments, and, also optionally, asserts that other
   * fragments found in `this` fragment in same order as in `specList`.
   *
   * It requires that `this` fragment has `expect[Something]sCountIs()` method
   * implemented.
   *
   * @param {string} Something - Name of something, for example, in `Dialog` it's an 'Action'
   * @param {*} specList - See `spec` parameter of `Something` constructor
   * @param {boolean} [only=false] - Optional, `this` fragment must have only specified other fragments to pass assertion
   * @param {boolean} [sameOrder=false] - Optional, other fragments must be found in `this` fragment in same order as in `specList` to pass assertion. Work only in conjunction with `only` parameter
   * @throws {TypeError} When requirements failed.
   */
  async expectHasSomethings(Something, specList, only = false, sameOrder = false) {
    const len = specList.length;

    if (only === true) {
      const counterName = `expect${Something}sCountIs`;

      if (!_.isFunction(this[counterName])) {
        const base = this.bemBase;
        throw new TypeError(`${this.fragmentDisplayName}.expectHasSomethings(${Something}): This fragment ('${base}') has no required ${counterName} method`);
      }

      await this[counterName](len);
    }

    for (let i = 0; i < len; i++) {
      const idx = (only === true && sameOrder === true && i);
      await this.expectHasSomething(Something, specList[i], idx);
    }
  }

  /**
   * Asserts that `this` instance of fragment is exist and found in `parent` at
   * index specified by `idx`.
   *
   * @param {number} idx - Position in which `this` instance must be found in `parent` to pass assertion. Must be an integer greater or equal zero
   * @param {*} parent - Anything that can be pased to `Fragment` constructor `spec.parent`, e.g. `Toolbar.ToolbarGroup#selector`
   */
  async expectIndexInParentIs(idx, parent) {
    await this.expectIsExist();

    const bemBase = this.bemBase;
    const instAtIndex = new this.constructor({ idx, parent }, { bemBase });
    await instAtIndex.expectIsExist(t);

    const srcTextContent = await this.selector.textContent;
    const trgTextContent = await instAtIndex.selector.textContent;
    await t.expect(srcTextContent).eql(trgTextContent);
  };

  // TODO Update docs.
  /**
   * Asserts that `this` instance of fragment is a child of parent fragment
   * defined by `ClassOfParent` and `bemBaseOfParent`. Optionally, asserts that
   * child found in parent at position specified by `idx`.
   *
   * @param {function} ClassOfParent - Class of parent, must be descendant of `Fragment` class
   * @param {string} bemBaseOfParent - See `bemBase` parameter of `ClassOfParent` constructor
   * @param {*} selectorOfParent - Selector for `this` fragment's parent. Anything that can be used as initializer for TestCafe `Selector`
   * @param {*} spec - See `spec` parameter of `ClassOfParent` fragment constructor
   * @param {integer} [idx] - Optional, position under which `this` fragment instance must be found in parent fragment to pass assertion
   */
  async expectIsInParent(FragmentOfParent, specOfParent, optsOfParent, selectorOfParent, idx) {
    const base = this.getBemBase();

    if (!_.isFunction(FragmentOfParent)) {
      throw new TypeError(`\`${this.fragmentDisplayName}.expectIsInParent()\`: \`FragmentOfParent\` argument must be a function, but ${typeOf(FragmentOfParent)} (${FragmentOfParent}) is given`);
    }

    const instOfParent = new FragmentOfParent(specOfParent, optsOfParent);

    if (!instOfParent instanceof Fragment) {
      throw new TypeError(`\`${this.fragmentDisplayName}.expectIsInParent()\`: \`FragmentOfParent\` argument must be a function that return fragment`);
    }

    const textContent = await instOfParent.selector.textContent;
    await t.expect(Selector(selectorOfParent).textContent).eql(textContent);

    if (_.isInteger(idx)) {
      await this.expectIndexInParentIs(idx, instOfParent.selector);
    }
  }

  // TODO Move to `static` method and here just pass `this.selector` as first argument?!
  /**
   * Asserts that passed in TestCafe `selector` conforms requirements passed
   * in `reqs`.
   *
   * @param {*} selector - Anything that can be used as initializer for TestCafe `Selector`
   * @param {object} [reqs] - Optional, requirements for `selector`
   * @param {array|object} [reqs.attributes] - Optional, allows to assert that `selector` have or have no specified attribute(-s). Can be provided in two forms - as POJO or `Array`. For case of POJO it can have 'neg' and/or 'pos' keys that specifies assertion condition (see `req.attributes.neg` and `reqs.attributes.pos`). For case of `Array` the default condition for assertion is 'pos' and requirement must be in following form:
     - First element of `Array` is an attibute name which is a string. `RegExp` attribute name is not supported.
     - Second is an attribute value and when it's a `nil` then assertion would be just for presence of attribute with specified name, when it's a `RegExp` then value of attribute must match that value to pass assertion, otherwise attribute value must be equal stringified version of that value to pass assertion.
     - Third element can be used to specify that assertion condition must be negated, for example, `['value', 123]` requirement can be used to assert that `selector` has 'value' attribute equal '123' and `['value', 123, true]` requirement can be used to assert that `selector` has no 'value' attribute with value equal '123'.
     As in case of `Array` second and third elements are optional we can pass just attribute name to assert that `selector` has that attribute, for example, `['disabled']` can be simplified to just `'disabled'`
   * @param {array} [reqs.attributes.neg] - Optional, allows to assert that `selector` have no specified attribute(-s). Each item must be a string or regular expression - attribute name, or an array with two elements - attribute name and attribute value each of which is a string and/or regular expression
   * @param {array} [reqs.attributes.pos] - Optional, allows to assert that `selector` have specified attribute(-s). Each item must be a string or regular expression - attribute name, or an array with two elements - attribute name and attribute value each of which is a string and/or regular expression
   * @param {object} [reqs.bemModifiers] - Optional, allows to assert that `selector` have or have no specified BEM modifier(-s). Same as for `reqs.attributes` but instead of attibute name and value pass BEM modifier name and value
   * @param {array} [reqs.bemModifiers.neg] - Optional, allows to assert that `selector` have no specified BEM modifier(-s). Each item must be a string - modifier name, or an array with two elements - modifier name and value each of which is a string
   * @param {array} [reqs.bemModifiers.pos] - Optional, allows to assert that `selector` have specified BEM modifier(-s). Each item must be a string - modifier name, or an array with two elements - modifier name and value each of which is a string
   * @param {string} [reqs.tagName] - Optional, allows to assert that `selector` rendered using specified tag
   * @param {string|RegExp} [reqs.text] - Optional, allows to assert that `selector`'s text equal or matches specified value. Condition of assertion can be reversing by passing `Array` where first element is a text and second is a flag that specifies whether condition must be negated or not, for example, `'Qwerty'` can be used to assert that text of `selector` is equal 'Qwerty' and `['Qwerty', true]'` can be used to assert that text of `selector` isn't equal 'Querty'
   * @param {*} [reqs.textContent] - Optional, allows to assert that `selector`'s text content equal or matches specified value. When value is not regular expression it would be coerced to string as `value + ''`. To negate assertion condition pass `Array` with text content and boolean flag, `requirements.text` for examples
   */
  async expectSelectorConformsRequirements(selector, reqs) {
    selector = Selector(selector);

    // `selector` must exist.
    await t.expect(selector.count).eql(1);

    if (_.isPlainObject(reqs)) {

      // Attributes asserted by one at a time!
      if (_.isArray(reqs.attributes)) {
        for (const item of reqs.attributes) {
          let attrName = null,
            attrValue = null,
            isNot = null;

          if (_.isArray(item)) {
            [attrName, attrValue, isNot] = item;
          }
          else {
            attrName = item;
          }

          const count = isNot ? 0 : 1;
          const cond = isNot ? 'not ' : '';
          const sel = utils.testCafe.filterSelectorByAttribute(selector, attrName, attrValue);

          let errorMessage = 'Expected selector to ';

          if (isNot) {
            errorMessage += 'not ';
          }

          errorMessage += `return DOM element with attribute '${attrName}'`;

          if (!_.isNil(attrValue)) {
            errorMessage += ` valued '${attrValue}'`;
          }

          await t.expect(sel.count).eql(count, errorMessage);
        }
      }
      else if (_.isPlainObject(reqs.attributes)) {
        if (_.isArray(reqs.attributes.neg)) {
          for (const item of reqs.attributes.neg) {
            let attrName, attrValue;

            if (_.isArray(item)) {
              [attrName, attrValue] = item;
            }
            else {
              attrName = item;
            }

            // TestCafe's `withAttribute` always matches using `RegExp`.
            // await t
            //   .expect(selector.withAttribute(name, value).exists)
            await t
              // .expect(utils.testCafe.filterSelectorByAttribute(selector, attrName, attrValue).exists)
              // .notOk(`Expected selector to not have attribute '${attrName}' with value '${attrValue}'`);
              .expect(utils.testCafe.filterSelectorByAttribute(selector, attrName, attrValue).count)
              .eql(0, `Expected selector to not return DOM elements with attribute '${attrName}' valued '${attrValue}'`);
          }
        }

        if (_.isArray(reqs.attributes.pos)) {
          for (const item of reqs.attributes.pos) {
            let attrName, attrValue;

            if (_.isArray(item)) {
              [attrName, attrValue] = item;
            }
            else {
              attrName = item;
            }

            // TestCafe's `withAttribute` always matches using `RegExp`.
            // await t
            //   .expect(selector.withAttribute(name, value).exists)
            await t
              // .expect(utils.testCafe.filterSelectorByAttribute(selector, attrName, attrValue).exists)
              // .ok(`Expected selector to have attribute '${attrName}' with value '${attrValue}'`);
              .expect(utils.testCafe.filterSelectorByAttribute(selector, attrName, attrValue).count)
              .eql(1, `Expected selector to return single DOM element with attribute '${attrName}' valued '${attrValue}'`);
          }
        }
      }

      // Modifiers asserted by one at a time!
      if (_.isArray(reqs.bemModifiers)) {
        for (const item of reqs.bemModifiers) {
          let modName = null,
            modValue = null,
            isNot = null;

          if (_.isArray(item)) {
            [modName, modValue, isNot] = item;
          }
          else {
            modName = item;
          }

          const assertion = isNot ? 'expectHasNoBemModifier' : 'expectHasBemModifier';
          await this[assertion](modName, modValue);
        }
      }
      else if (_.isPlainObject(reqs.bemModifiers)) {
        if (_.isArray(reqs.bemModifiers.neg)) {
          for (const item of reqs.bemModifiers.neg) {
            let modName = null,
              modValue = null;

            if (_.isArray(item)) {
              [modName, modValue] = item;
            }
            else {
              modName = item;
            }

            await this.expectHasNoBemModifier(modName, modValue);
          }
        }

        if (_.isArray(reqs.bemModifiers.pos)) {
          for (const item of reqs.bemModifiers.pos) {
            let modName = null,
              modValue = null;

            if (_.isArray(item)) {
              [modName, modValue] = item;
            }
            else {
              modName = item;
            }

            await this.expectHasBemModifier(modName, modValue);
          }
        }
      }

      if (reqs.tagName) {
        await t.expect(selector.tagName).eql(reqs.tagName);
      }

      if (_.has(reqs, 'text')) {
        let expectedValue = reqs.text;
        let isNot = false;

        if (_.isArray(reqs.text)) {
          expectedValue = reqs.text[0];
          isNot = !!reqs.text[1];
        }

        // XXX TestCafe, currently, always converts `withText`'s' argument to
        // `RegExp` and so we must use workaround to use string equality.
        // await t.expect(selector.withText(reqs.text).count).eql(1);
        const expectedValueAsRegExp = _.isRegExp(expectedValue) ?
          expectedValue : new RegExp(`^${escapeStringRegexp(expectedValue)}$`);

        await t
          .expect(selector.withText(expectedValueAsRegExp).count)
          .eql(isNot ? 0 : 1, `Selector text must match ${expectedValueAsRegExp}`);
      }

      if (_.has(reqs, 'textContent')) {
        let expectedValue = reqs.textContent;
        let isNot = false;

        if (_.isArray(reqs.textContent)) {
          expectedValue = reqs.textContent[0];
          isNot = !!reqs.textContent[1];
        }

        if (_.isRegExp(reqs.textContent)) {
          const assertion = isNot ? 'notMatch' : 'match';
          await t.expect(selector.textContent)[assertion](expectedValue);
        }
        else {
          const assertion = isNot ? 'notEql' : 'eql';
          await t.expect(selector.textContent)[assertion](expectedValue + '');
        }
      }
    }
  }

  /**
   * Asserts that `selector` exists and, optionally, asserts that its text equal
   * or matches `text`.
   *
   * @param {*} selector - Anything that can be used as initializer for TestCafe `Selector`
   * @param {string|RegExp|null} [text=null] - String or regular expression to which selector's text must be equal or match to pass assertion
   */
  async expectSelectorIsExistAndMaybeHaveText(selector, text = null) {
    const reqs = {};

    if (text !== null) {
      reqs.text = text;
    }

    await this.expectSelectorConformsRequirements(selector, reqs);
  }

  /**
   * Asserts that `selector`'s text content equal or matches `textContent`.
   *
   * @param {*} selector - Anything that can be used as initializer for TestCafe `Selector`
   * @param {string|RegExp} textContent - String or regular expression to which selector's text content must be equal or match to pass assertion. When you want to assert not equality or not match pass `Array` with two elements - first is an expected value and second is any truthy value (signals that assertion must be negated)
   */
  async expectSelectorTextContentIs(selector, textContent) {
    await this.expectSelectorConformsRequirements(selector, { textContent });
  }

  /**
   * Asserts that `selector`'s text equal or matches `text`.
   *
   * @param {*} selector - Anything that can be used as initializer for TestCafe `Selector`
   * @param {string|RegExp} text - String or regular expression to which selector's text must be equal or match to pass assertion. When you want to assert not equality or not match pass `Array` with two elements - first is an expected value and second is any truthy value (signals that assertion must be negated)
   */
  async expectSelectorTextIs(selector, text) {
    await this.expectSelectorConformsRequirements(selector, { text });
  }

  /**
   * Asserts that selector returns single DOM element that is rendered as
   * `<BUTTON>` tag and, optionally, asserts that it has specified text.
   *
   * @param {object} selector - TestCafe selector, subject under test(-s)
   * @param {string|RegExp|null} [text=null] - Optional, text of element returned by selector must be equal or match that value to pass assertion
   */
  async expectSelectorIsButton(selector, text = null) {
    const reqs = { tagName: 'button' };

    if (text !== null) {
      reqs.text = text;
    }

    await this.expectSelectorConformsRequirements(selector, reqs);
  }

  /**
   * Asserts that selector returns single DOM element that is rendered as `<A>`
   * tag and, optionally, asserts that its `href` attribute specified value,
   * and, also optionally, asserts that it has specified text.
   *
   * @param {object} selector - TestCafe selector, subject under test(-s)
   * @param {string|RegExp|null} [href=null] - Optional, `href` attribute of element returned by selector must be equal or match that value to pass assertion
   * @param {string|RegExp|null} [text=null] - Optional, text of element returned by selector must be equal or match that value to pass assertion
   */
  async expectSelectorIsLink(selector, href = null, text = null) {
    const reqs = { tagName: 'a' };

    if (href !== null) {
      reqs.attributes = {
        pos: [
          ['href', href]
        ]
      };
    }

    if (text !== null) {
      reqs.text = text;
    }

    await this.expectSelectorConformsRequirements(selector, reqs);
  }

  // TODO Signature is not consistent with `Fragment`'s constructor! We must
  //      also pass `opts` argument. Also better make `idx` last parameter.
  /**
   * Do the same as `expectIndexInParentIs()` but from other side - asserts that
   * other fragment, named `Something`, found in `this` fragment at specified
   * index.
   *
   * It requires that `this` fragment has `get[Something]()` method.
   *
   * @param {string} Something - Name of something, for example, in `Dialog` it's an 'Action'
   * @param {number} idx - Position at which something must be found to pass assertion. Must be an integer greate or equal zero
   * @param {object} spec - See `spec` parameter of `Something` constructor
   * @throws {TypeError} When requirements failed.
   */
  async expectSomethingIndexIs(Something, idx, spec) {
    const getterName = `get${Something}`;

    if (!_.isFunction(this[getterName])) {
      const base = this.getBemBase();
      throw new TypeError(
        `\`expectSomethingIndexIs(${Something})\`: This fragment ('${base}') ` +
        `has no required \`${getterName}\` method`
      );
    }

    const something = this[getterName](spec);
    await something.expectIndexInParentIs(idx, this.selector);
  }

  // ---------------------------------------------------------------------------
  // Other Methods
  // ---------------------------------------------------------------------------

  // TODO Case when `spec` is an instance of `FragmentOfSomething` isn't handled.
  /**
   * Returns instance of `FragmentOfSomething` that matches `spec`. Optional BEM
   * base for `FragmentOfSomething` can be provided as `optsOfSomething` when
   * needed.
   *
   * @param {class|function} FragmentOfSomething - Fragment class of something, must be descendant of `Fragment` class
   * @param {object} [specOfSomething] - See `spec` parameter of `FragmentOfSomething` constructor
   * @param {object} [optsOfSomething] - See `opts` parameter of `FragmentOfSomething` constructor
   * @returns {object}
   */
  getSomething(FragmentOfSomething, specOfSomething, optsOfSomething) {
    if (!_.isFunction(FragmentOfSomething)) {
      throw new TypeError(`\`${this._fragment}#getSomething()\`: \`FragmentOfSomething\` argument must be a function, but ${typeOf(FragmentOfSomething)} (${FragmentOfSomething}) is given`);
    }

    const somethingSpec = _.assign({}, { parent: this.selector }, specOfSomething);
    const something = new FragmentOfSomething(somethingSpec, optsOfSomething);

    if (!(something instanceof Fragment)) {
      throw new TypeError(`\`${this._fragment}#getSomething()\`: \`FragmentOfSomething\` argument must be a function that returns an instance of fragment`);
    }

    return something;
  }

  /**
   * Scrolls fragments selector to `position`. Currently it always scrolls page
   * to top and `position` is ignored.
   *
   * @param {*} [position='top'] - Optional, position to scroll to
   */
  async scrollTo(position) {
    await this.selector.scrollTo(position);
  }
}

Object.defineProperties(Fragment, {
  bemBase: {
    value: 'BASE_FRAGMENT'
  },
  displayName: {
    value: 'Fragment'
  }
});

export default Fragment;
