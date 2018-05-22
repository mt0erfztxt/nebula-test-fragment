import _ from 'lodash';
import {detailedDiff} from 'deep-object-diff';
import escapeStringRegexp from 'escape-string-regexp';
import {pascalCase, ucFirst} from 'change-case';
import {Selector, t} from 'testcafe';
import typeOf from 'typeof--'

import bem from "./bem";
import selector from "./selector";
import utils from './utils';

/**
 * Allows to customize fragment's selector.
 *
 * @typedef {function} selectorCustomizerFn
 * @param {Selector} selector - Fragment's selector
 * @param {?object} [spec] - `spec` argument passed to fragment's constructor
 * @param {?Options} [opts] - `opts` argument passed to fragment's constructor
 * @return {Selector} New selector for fragment.
 */

/**
 * Class that represent fragment.
 */
class Fragment {
  // TODO Update docs!
  /**
   * Creates fragment.
   *
   * @param {?object} [spec] - Object that contains specs used to initialize TestCafe `Selector` used in fragment. `opts.bemBase` scoped into default `parent` spec would be used when `nil` passed in
   * @param {string} [spec.cid] - Component id. Would be scoped into `parent` spec. Respects `cns` spec (if any)
   * @param {string} [spec.cns] - Component ns. Would be scoped into `parent` spec. Can be used in conjunction with `cid` or `idx` spec
   * @param {function} [spec.custom] - Some custom spec. Likewise `cid` and `idx` spec and in contrast to `handler` spec it respects `parent` and `cns` specs. Accepts current selector and BEM base as arguments, where current selector already scoped into `parent` and/or `cns` specs
   * @param {number} [spec.idx] - Component index. Would be scoped into `parent` spec. Respects `cns` spec (if any). Must be an integer greater or equal zero
   * @param {*} [spec.parent='body'] - Parent scope for fragment's selector. Can be anything that TestCafe `Selector` accepts
   * @param {?Options} [opts] - Options
   * @param {string} [opts.bemBase] - BEM base of component, may be omitted when `handler` or `selector` spec is used
   * @throws {TypeError} When constructor arguments are not valid.
   */
  constructor(spec, opts) {

    // Ensure that `opts` argument is valid.
    if (!(_.isNil(opts) || utils.isOptions(opts))) {
      throw new TypeError(
        `${this.displayName}.constructor(): 'opts' argument must be a nil or of type Options but it is ` +
        `${typeOf(opts)} (${opts})`
      );
    }

    // Ensure that `spec` argument is valid.
    if (!(_.isNil(spec) || _.isPlainObject(spec))) {
      throw new TypeError(
        `${this.displayName}.constructor(): 'spec' argument must be a nil or a plain object but it is ` +
        `${typeOf(spec)} (${spec})`
      );
    }

    /**
     * Reference to `opts` object passed to fragment's constructor.
     *
     * @private
     */
    this._originalOpts = opts;

    /**
     * Reference to `spec` object passed to fragment's constructor.
     *
     * @private
     */
    this._originalSpec = spec;

    // We allow BEM base for new fragment to be set explicitly as
    // `opts.bemBase` or implicitly as `bemBase` property of fragment's class,
    // otherwise it would be populated using parent fragment's BEM base.
    const _opts = this._originalOpts || {};
    const chosenBemBase = (_opts.bemBase || this.constructor.bemBase || super.bemBase);
    const chosenBemBaseAsStr = chosenBemBase + '';

    // Ensure that BEM base for fragment is available.
    if (!utils.isNonEmptyString(chosenBemBaseAsStr) || chosenBemBaseAsStr === 'BASE_FRAGMENT') {
      throw new TypeError(
        `'${this.displayName}' fragment was created without BEM base`
      );
    }

    /**
     * `opts` argument that was used to create this fragment, all default
     * values are already in place.
     *
     * @private
     */
    this._opts = _.assign({}, _opts, {bemBase: new bem.BemBase(chosenBemBase, {isFinal: true})});

    /**
     * `spec` argument that was used to create this instance of fragment.
     * Currently it's just a reference to original `spec` argument.
     *
     * @private
     */
    this._spec = _.assign({}, this._originalSpec);

    const {bemBase} = this._opts;

    /**
     * Fragment's BEM base.
     *
     * @private
     * @type {BemBase}
     */
    this._bemBase = bemBase;

    /**
     * Store for persisted states.
     *
     * @private
     */
    this._persistedStates = {};

    /**
     * TestCafe's selector for fragment.
     *
     * @private
     * @type {Selector}
     */
    this._selector = null;

    // Fragment's selector scoped into parent selector and we choose it here:
    // 1. Parent is specified and it's a fragment - we use that fragment's
    // selector as parent selector.
    // 2. Parent is specified and it isn't a fragment - we use it as
    // initializer to create parent selector.
    // 3. No parent specified - we use 'body' as initializer to create parent
    // selector.
    if (this._spec.parent instanceof Fragment) {
      this._selector = this._spec.parent.selector;
    }
    else {
      this._selector = Selector((this._spec.parent) || 'body');
    }

    // Narrow down fragment's selector to select only elements with fragment's
    // BEM base.
    this._selector = this._selector.find(`.${bemBase}`);

    // New fragment's selector is build using provided `specs` and `opts`, and
    // so we must handle all possible cases:
    // 1. When 'nil' spec (`spec` is `null` or is `undefined`) is provided we
    // suppose that new fragment's selector must be created using only provided
    // BEM base. This means new fragment's selector would see all fragments
    // that have specified BEM base and found in specified parent. In that case
    // 'parent' spec is respected.
    // 2. We have number of specs that are built-in into base fragment class
    // and all of them respects 'parent' spec.
    if (!_.isEmpty(this._spec)) {
      const cidSpec = this._spec.cid;
      const cnsSpec = this._spec.cns;
      const customSpec = this._spec.custom;
      const idxSpec = this._spec.idx;

      // 2.1 'cns' (component namespace) often used to build one widget on top
      // of other widget that provides generic functionality and that spec is
      // for such cases. It respects 'parent' spec.
      if (cnsSpec) {
        if (!utils.isNonEmptyString(cnsSpec)) {
          throw new TypeError(
            `${this.displayName}.constructor(): Built-in 'cns' spec must be a non-empty string but it is ` +
            `${typeOf(cnsSpec)} (${cnsSpec})`
          );
        }

        this._selector = this._selector.filter(`.${bemBase.setMod(['cns', cnsSpec], {fresh: true})}`);
      }

      // Following spec aren't composable with each other!

      // 2.2 'cid' (component id) often used to get specific fragment. It
      // respects 'cns' and 'parent' specs.
      if (cidSpec) {
        if (!utils.isNonEmptyString(cidSpec)) {
          throw new TypeError(
            `${this.displayName}.constructor(): Built-in 'cid' spec must be a non-empty string but it is ` +
            `${typeOf(cidSpec)} (${cidSpec})`
          );
        }

        this._selector = this._selector.filter(`.${bemBase.setMod(['cid', cidSpec], {fresh: true})}`);
      }
      // 2.3 'idx' often used to get specific fragment by its index in parent.
      // It respects 'cns' and 'parent' specs.
      else if (_.has(this._spec, 'idx')) {
        if (!(_.isInteger(idxSpec))) {
          throw new TypeError(
            `${this.displayName}.constructor(): Built-in 'idx' spec must be an integer greater than or equal zero ` +
            `but it is ${typeOf(idxSpec)} (${idxSpec})`
          );
        }

        this._selector = this._selector.nth(idxSpec);
      }
      // 2.4 'custom' spec is used to allow derived fragments to have their own
      // built-in specs. It respects 'cns' and 'parent' specs.
      else if (customSpec) {
        if (!_.isFunction(customSpec)) {
          throw new TypeError(
            `${this.displayName}.constructor(): Built-in 'custom' spec must be a function but it is ` +
            `${typeOf(customSpec)} (${customSpec})`
          );
        }

        this._selector = customSpec(this._selector, this._spec, this._opts);
      }
      // To simplify debugging we throw error when unsupported spec found. Note
      // that 'cns' and 'parent' specs were added earlier and must be excluded
      // explicitly.
      else {
        const unknownSpecs = _
          .chain(this._spec)
          .keys()
          .remove((s) => !_.includes(['cns', 'parent'], s))
          .value();

        if (!_.isEmpty(unknownSpecs)) {
          throw new TypeError(
            `${this.displayName}.constructor(): Not supported spec(-s) given: ${_.join(unknownSpecs, ', ')}`
          );
        }
      }
    }
  }

  /**
   * Just a simple check that class is a Fragment or its descendant.
   *
   * @return {boolean}
   */
  static get isFragment() {
    return true;
  }

  /**
   * Fragment's block BEM base.
   *
   * @returns {BemBase}
   */
  get bemBase() {
    return this._bemBase;
  }

  /**
   * Display name of fragment.
   *
   * @return {string}
   */
  get displayName() {
    return (this.constructor.displayName || super.displayName);
  }

  /**
   * Initialized fragment options.
   *
   * @return {Options}
   */
  get opts() {
    return this._opts;
  }

  /**
   * TestCafe's selector for fragment.
   *
   * @return {Selector}
   */
  get selector() {
    return this._selector;
  }

  /**
   * Initialized fragment specification.
   *
   * @return {Options}
   */
  get spec() {
    return this._spec;
  }

  /**
   * Asserts that count of somethings in fragment equal value specified in
   * `count`.
   *
   * @param {*} somethingSelector - TestCafe selector for something
   * @param {array|number} count - Fragment must have that number of somethings to pass assertion. When you need more flexibility than just equality pass an `Array` with TestCafe assertion name (default to 'eql') as first element and expected value for assertion as second, for example, `['gte', 3]`
   * @param {Options} [options] - Options
   * @param {boolean} [options.isNot=false] - When `true` assertion would be negated
   * @return {Promise<void>}
   */
  static async expectSomethingsCountIs(somethingSelector, count, options) {
    let assertionName = 'eql';
    const opts = utils.initializeOptions(options, {defaults: {isNot: false}});

    if (_.isArray(count)) {
      [assertionName, count] = count;
    }

    assertionName = utils.buildTestCafeAssertionName(assertionName, opts);
    await t.expect(somethingSelector.count)[assertionName](count);
  }

  /**
   * Initializes passed in `spec` and `opts` so they can be conveniently passed
   * to fragment's constructor.
   *
   * @static
   * @param {?object} spec - `spec` argument passed in to fragment's constructor. See `Fragment`'s constructor
   * @param {?Options} opts - `opts` argument passed in to fragment's constructor. See `Fragment`'s constructor
   * @param {?object} [defaults] - Defaults for `spec` and `opts`
   * @param {?object} [defaults.opts] - Object of default values for attributes of `opts` argument. Default value would be used when `opts` attribute value is `null`, `undefined` or `NaN`
   * @param {?object} [defaults.spec] - Object of default values for attributes of `spec` argument. Default value would be used when `spec` attribute value is `null`, `undefined` or `NaN`
   * @returns {object} Returns plain object with `isInstance` attribute set to `true` when `spec` argument is already an instance of non-base fragment, or plain object that have `spec` and `opts` attributes that contains `spec` and `opts` populated with defaults when `spec` is a specification object or nil.
   * @throws {TypeError} When passed in arguments aren't valid.
   */
  static initializeFragmentSpecAndOpts(spec, opts, defaults) {
    if (spec instanceof this) {
      return {isInstance: true};
    }

    if (spec instanceof Fragment) {
      throw new TypeError(
        `'spec' argument can not be instance of fragment other than ${this.displayName}`
      );
    }

    if (!_.isNil(opts)) {
      utils.isOptions(opts, true);
    }

    const initializedOpts = _.assign({}, opts);
    const initializedSpec = _.assign({}, spec);

    if (!(_.isNil(defaults) || _.isPlainObject(defaults))) {
      throw new TypeError(
        `'defaults' argument must be a nil or plain object but it is ${typeOf(defaults)} (${defaults})`
      );
    }

    if (defaults) {
      const defaultsOpts = defaults.opts;
      const defaultsSpec = defaults.spec;

      if (!(_.isNil(defaultsSpec) || _.isPlainObject(defaultsSpec))) {
        throw new TypeError(
          `'defaults.spec' argument must be a nil or plain object but it is ${typeOf(defaultsSpec)} (${defaultsSpec})`
        );
      }

      if (!(_.isNil(defaultsOpts) || _.isPlainObject(defaultsOpts))) {
        throw new TypeError(
          `'defaults.opts' argument must be a nil or plain object but it is ${typeOf(defaultsOpts)} (${defaultsOpts})`
        );
      }

      if (!_.isEmpty(defaultsSpec)) {
        _.forOwn(defaultsSpec, (v, k) => {
          initializedSpec[k] = _.defaultTo(initializedSpec[k], v);
        });
      }

      if (!_.isEmpty(defaultsOpts)) {
        _.forOwn(defaultsOpts, (v, k) => {
          initializedOpts[k] = _.defaultTo(initializedOpts[k], v);
        });
      }
    }

    return {initializedOpts, initializedSpec};
  }

  /**
   * Makes new fragment class by extending provided base class and adding
   * requested behavior.
   *
   * @param {Fragment} BaseFragment - Class of fragment that must be used as base fragment class
   * @param {Options} [options] - Options
   * @param {array} [options.stateParts] - Used to add state parts behavior. Must be an array where each item is an array of required state part name and optional state part options - see `statePartName` and `options` arguments [here]{@link Fragment.withPartOfStateMixin} for more details
   * @return {Fragment}
   */
  static makeFragmentClass(BaseFragment, options) {
    const opts = utils.initializeOptions(options, {
      defaults: {
        stateParts: []
      },
      validator: ({stateParts}) => {
        let errMsg = null;

        if (!_.isArray(stateParts)) {
          errMsg = `'options.stateParts' argument must be an array but it is ${typeOf(stateParts)} (${stateParts})`
        }

        return errMsg;
      }
    });

    let MadeFragment = BaseFragment;
    const {stateParts} = opts;

    if (!_.isEmpty(stateParts)) {
      for (const statePart of stateParts) {
        let statePartName = statePart;
        let statePartOpts;

        if (_.isArray(statePart)) {
          [statePartName, statePartOpts] = statePart;
        }

        MadeFragment = this.withPartOfStateMixin(MadeFragment, statePartName, statePartOpts);
      }
    }

    return MadeFragment;
  }

  /**
   * Returns new fragment class that is a descendant of base fragment class
   * and, additionally, have methods for part of state. See description of
   * available options for more about additionally generated methods.
   *
   * @todo Improve docs - add names of generated methods, describe their signatures
   *
   * @static
   * @param {*} BaseFragment - Fragment class to extend from
   * @param {array|string} statePartName - Name of state part. When it's a string then it would be used as state part name and also as name of attribute/BEM modifier that holds that part in fragment's selector DOM element. When names differ, for example a case of data attribute, an array of two non-blank strings - a state part name and attribute/BEM modifier name, can be passed
   * @param {Options} [options] - Options
   * @param {string} [options.antonym] - Name of other side of state part. For example, for 'Disabled' part of state other side would be 'Enabled'. Used to generate additional assertion methods, but only when `options.isBoolean` is truthy and `options.isBooleanHas` is falsey. For example, when `options.antonym` is 'Enabled' `expectIsEnabled` and `expectIsNotEnabled` methods would be generated
   * @param {boolean} [options.isBoolean=true] - When truthy additional assertion methods would be generated. For example, when name is 'Disabled' and `options.isBoolean` is truthy `expectIsDisabled` and `expectIsNotDisabled` methods would be generated
   * @param {boolean} [options.isBooleanHas=false] - When truthy then assertion methods would be named with 'Has' instead of 'Is'. For example, `expectHasSomething` and `expectHasNoSomething`
   * @param {string} [options.src='bemModifier'] - Where state part holds it's value. Must be one of 'attribute', or 'bemModifier'
   * @param {boolean|string} [options.waitTil] - Same as `options.waitUntil` but reversed - allows to wait til attribute/BEM modifier exists (boolean) or have specified value. When value is a boolean then state part name would be used to generate name of method, when it's a string then it would be used in method name generation. For example, for part of state named 'Fetched' they would be `waitTilFetched` in case of boolean and `waitTilSomething` in case of string 'something'
   * @param {boolean|string} [options.waitUntil] - When truthy and `options.isBoolean` also truthy fragment's class would have `waitUntil[NameOfStatePart]` method, that is a convenience alias for `expectIs[NameOfStatePart]` method, that can be used to wait until fragment's part of state doesn't have specified value. For example, for part of state named 'Fetched' we can wait if fragment's state part doesn't have specified value
   * @returns {Fragment}
   */
  static withPartOfStateMixin(BaseFragment, statePartName, options) {
    if (!BaseFragment.isFragment) {
      throw new TypeError(
        `'BaseFragmentClass' argument must be a 'Fragment' class or its descendant`
      );
    }

    let _attrName;
    let _partName = statePartName;

    if (_.isArray(statePartName)) {
      [_partName, _attrName] = statePartName;
    }

    if (!utils.isNonBlankString(_partName)) {
      throw new TypeError(
        `Name of state part must be a non-blank string but it is ${typeOf(_partName)} (${_partName})`
      );
    }

    if (!(_.isNil(_attrName) || utils.isNonBlankString(_attrName))) {
      throw new TypeError(
        `Attribute/BEM modifier name that holds value of part of state must be a non-blank string but it is ` +
        `${typeOf(_attrName)} (${_attrName})`
      );
    }

    const opts = utils.initializeOptions(options, {
      defaults: {
        isBoolean: true,
        isBooleanHas: false,
        src: 'bemModifier'
      },
      validator: ({src}) => {
        let msg = null;

        if (!_.includes(['attribute', 'bemModifier'], src)) {
          msg =
            "'options.src' argument must be a nil or one of 'attribute' or 'bemModifier' but it is " +
            `${typeOf(src)} (${src})`;
        }

        return msg;
      }
    });
    const {antonym, isBoolean, isBooleanHas, src, waitTil, waitUntil} = opts;
    const attrName = _attrName || _partName;
    const partName = pascalCase(_partName);

    /**
     * @extends {Fragment}
     */
    class MixedFragment extends BaseFragment {

      /**
       * Obtains value of state's part and returns it.
       *
       * @param {Options} [options] - Options
       * @returns {*} Returns value of state's part.
       */
      async [`get${partName}PartOfState`](options) {
        if (src === 'bemModifier') {
          if (isBoolean) {
            const className = this.cloneBemBase().setMod([attrName]).toString();
            return this.selector.hasClass(className);
          }
          else {
            const modifiers = await this.getBemModifiers(attrName);
            return _.isEmpty(modifiers) ? void(0) : (modifiers[0][1] || void(0));
          }
        }
        else if (src === 'attribute') {
          return isBoolean ?
            this.selector.hasAttribute(attrName) :
            this.selector.getAttribute(attrName);
        }
      }

      /**
       * Does nothing because this part of state is read only.
       *
       * @param {*} value - Doesn't matter
       * @param {Options} [options] - Options
       * @return {Promise<*>} Current value of part of fragment's state after set state operation is done.
       */
      async [`set${partName}PartOfState`](value, options) {
        return this[`get${partName}PartOfState`](options);
      }

      /**
       * Asserts that fragment's state part is equal specified value.
       *
       * @param {*} value - Part of state must match that value to pass assertion
       * @param {Options} [options] - Options
       * @param {boolean} [options.isNot=false] - When truthy assertion would be inverted
       * @return {Promise<void>}
       */
      async [`expect${partName}PartOfStateIs`](value, options) {
        const opts = utils.initializeOptions(options, {defaults: {isNot: false}});
        const {isNot} = opts;

        if (isBoolean) {
          value = !!value;
        }

        if (src === 'bemModifier') {
          if (isBoolean) {
            await this.expectExistsAndConformsRequirements({
              bemModifiers: [
                [[attrName, null], (isNot ? value : !value)]
              ]
            });
          }
          else {
            await this.expectExistsAndConformsRequirements({
              bemModifiers: [
                [[attrName, (value + '')], isNot] // TODO Remove casting to string (#5)
              ]
            });
          }
        }
        else if (src === 'attribute') {
          if (isBoolean) {
            await this.expectExistsAndConformsRequirements({
              attributes: [
                [attrName, null, (isNot ? value : !value)]
              ]
            });
          }
          else {
            await this.expectExistsAndConformsRequirements({
              attributes: [
                [attrName, value, isNot]
              ]
            });
          }
        }
      }
    }

    if (isBoolean) {

      // Boolean part of states have methods named like `expectIsDisabled` and
      // `expectIsNotDisabled`. That methods accepts zero arguments and asserts
      // on boolean `true` and `false` accordingly.
      Object.defineProperties(MixedFragment.prototype, {
        [`expect${isBooleanHas ? 'Has' : 'Is'}${partName}`]: {
          configurable: true,
          enumerable: false,
          writable: true,
          /**
           * Asserts that fragment's state part value equal boolean `true`,
           * which means that fragment selector DOM element has corresponding
           * attribute/BEM modifier.
           *
           * @return {Promise<void>}
           */
          value: async function () {
            await this[`expect${partName}PartOfStateIs`](true);
          }
        },
        [`expect${isBooleanHas ? 'HasNo' : 'IsNot'}${partName}`]: {
          configurable: true,
          enumerable: false,
          writable: true,
          /**
           * Asserts that fragment's state part value equal boolean `false`,
           * which means that fragment selector DOM element has no
           * corresponding attribute/BEM modifier.
           *
           * @return {Promise<void>}
           */
          value: async function () {
            await this[`expect${partName}PartOfStateIs`](false);
          }
        }
      });

      // Handle `options.antonym`.
      if (!(_.isNil(antonym) || utils.isNonBlankString(antonym))) {
        throw new TypeError(
          `'options.antonym' argument must be a non-blank string but it is ${typeOf(antonym)} (${antonym})`
        );
      }

      if (antonym && !isBooleanHas) {
        const antonymPartName = pascalCase(antonym);

        Object.defineProperties(MixedFragment.prototype, {
          [`expectIs${antonymPartName}`]: {
            configurable: true,
            enumerable: false,
            writable: true,
            value: async function () {
              await this[`expectIsNot${partName}`]();
            }
          },
          [`expectIsNot${antonymPartName}`]: {
            configurable: true,
            enumerable: false,
            writable: true,
            value: async function () {
              await this[`expectIs${partName}`]();
            }
          }
        });
      }

      // Handle `options.waitTil`.
      if (!(_.isNil(waitTil) || _.isBoolean(waitTil) || utils.isNonBlankString(waitTil))) {
        throw new TypeError(
          `'options.waitTil' argument must be a boolean or non-blank string but it is ${typeOf(waitTil)} (${waitTil})`
        );
      }

      let waitTilPartName = null;

      if (waitTil === true) {
        waitTilPartName = partName;
      }
      else if (_.isString(waitTil)) {
        waitTilPartName = pascalCase(waitTil);
      }

      if (waitTilPartName) {
        Object.defineProperty(MixedFragment.prototype, `waitTil${waitTilPartName}`, {
          configurable: true,
          enumerable: false,
          writable: true,
          /**
           * Allows to wait til fragment's selector has attribute/BEM modifier
           * used to specify state part. For example, we want to wait til
           * form data is fetching, then we call `someForm.waitTilFetching()`.
           * Waiting period determined by TestCafe's '--assertion-timeout'
           * setting (about 3 seconds by default), but additional delay can be
           * specified using 'options.wait' argument and that delay would be
           * issued before assertion.
           *
           * @param {Options} [options] - Options
           * @param {number} [options.wait] - Number of milliseconds to wait before assertion
           * @return {Promise<void>}
           */
          value: async function (options) {
            const opts = utils.initializeOptions(options);
            const {wait} = opts;

            if (wait) {
              await t.wait(wait);
            }

            await this[`expect${partName}PartOfStateIs`](false);
          }
        });
      }

      // Handle `options.waitUntil`.
      if (!(_.isNil(waitUntil) || _.isBoolean(waitUntil) || utils.isNonBlankString(waitUntil))) {
        throw new TypeError(
          `'options.waitUntil' argument must be a boolean or non-blank string but it is ` +
          `${typeOf(waitUntil)} (${waitUntil})`
        );
      }

      let waitUntilPartName = null;

      if (waitUntil === true) {
        waitUntilPartName = partName;
      }
      else if (_.isString(waitUntil)) {
        waitUntilPartName = pascalCase(waitUntil);
      }

      if (waitUntilPartName) {
        Object.defineProperty(MixedFragment.prototype, `waitUntil${waitUntilPartName}`, {
          configurable: true,
          enumerable: false,
          writable: true,
          /**
           * Allows to wait until fragment's selector has no attribute/BEM
           * modifier used to specify state part. For example, we need to wait
           * until fragment has 'fetched' BEM modifier, then we call
           * `someInput.waitUntilFetched()` - it reads like 'Wait **if not**
           * fetched'.
           * Waiting period determined by TestCafe's '--assertion-timeout'
           * setting (about 3 seconds by default), but additional delay can be
           * specified using 'options.wait' argument and that delay would be
           * issued before assertion.
           *
           * @param {Options} [options] - Options
           * @param {number} [options.wait] - Number of milliseconds to wait before assertion execution
           * @return {Promise<void>}
           */
          value: async function (options) {
            const opts = utils.initializeOptions(options);
            const {wait} = opts;

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
      Object.defineProperties(MixedFragment.prototype, {
        [`expect${partName}Is`]: {
          configurable: true,
          enumerable: false,
          writable: true,
          /**
           * Asserts that fragment's state part value is equal to `value`.
           */
          value: async function (value) {
            await this[`expect${partName}PartOfStateIs`](value, {isNot: false});
          }
        },
        [`expect${partName}IsNot`]: {
          configurable: true,
          enumerable: false,
          writable: true,
          /**
           * Asserts that fragment's state part value is not equal to `value`.
           */
          value: async function (value) {
            await this[`expect${partName}PartOfStateIs`](value, {isNot: true});
          }
        }
      });

    }

    return MixedFragment;
  }

  /**
   * Creates new instance of BEM base using fragment's `bemBase` as its
   * initializer.
   *
   * @returns {BemBase}
   */
  cloneBemBase() {
    return new bem.BemBase(this.bemBase);
  }

  /**
   * Asserts that fragment's selector conforms specified requirements.
   *
   * @param {object} [requirements] - Requirements. Nil means assert only for existence
   * @param {array} [requirements.attributes] - Allows to assert that fragment's selector have or have no specified attribute(-s). Each element of array is:
   - First element is an attribute name which is a string. `RegExp` attribute name is not supported.
   - Second optional element is an attribute value and when it's a `nil` then assertion would be just for presence of attribute with specified name, when it's a `RegExp` then value of attribute must match that value to pass assertion, otherwise attribute value must be equal stringified version of that value to pass assertion.
   - Third optional element can be used to specify that assertion condition must be negated, for example, `['value', 123]` requirement can be used to assert that fragment's selector has 'value' attribute equal to '123' and `['value', 123, true]` requirement can be used to assert that fragment's selector has no 'value' attribute with value equal '123'.
   Because second and third elements are optional we can pass just attribute name to assert that fragment's selector has that attribute, for example, `['disabled']` can be simplified to just `'disabled'`
   * @param {object} [requirements.bemModifiers] - Allows to assert that fragment's selector have or have no specified BEM modifier(-s). Same as for `requirements.attributes` but instead of attribute name and value pass BEM modifier name and value
   * @param {string} [requirements.tagName] - Allows to assert that fragment's selector rendered using specified tag
   * @param {array|string|RegExp} [requirements.text] - Allows to assert that fragment selector's text equal or matches specified value. Condition of assertion can be reversing by passing `Array` where first element is a text and second is a flag that specifies whether condition must be negated or not, for example, `'Qwerty'` can be used to assert that text of fragment's selector is equal 'Qwerty' and `['Qwerty', true]'` can be used to assert that text of `selector` isn't equal 'Qwerty'
   * @param {*} [requirements.textContent] - Allows to assert that fragment selector's text content equal or matches specified value. When value is not regular expression it would be coerced to string as `value + ''`. To negate assertion condition pass `Array` with text content and boolean flag, see `requirements.text` for examples
   * @return {Promise<void>}
   */
  async expectExistsAndConformsRequirements(requirements) {
    await this.expectIsExist();

    if (_.isNil(requirements)) {
      return;
    }

    if (!_.isPlainObject(requirements)) {
      throw new TypeError(
        `'requirements' argument must be a nil or plain object but it is ${typeOf(requirements)} (${requirements})`
      );
    }

    // Attributes asserted by one at a time!
    if (requirements.attributes) {
      if (!_.isArray(requirements.attributes)) {
        throw new TypeError(
          `'requirements.attributes' argument must be an array but it is ` +
          `${typeOf(requirements.attributes)} (${requirements.attributes})`
        );
      }

      for (const item of requirements.attributes) {
        let attrName = item;
        let attrValue = null;
        let isNot = false;

        if (_.isArray(item)) {
          [attrName, attrValue, isNot] = item;
        }

        let errorMessage = `Expected '${this.displayName}' fragment's selector to `;
        const sel = selector.filterByAttribute(this.selector, [attrName, attrValue], {isNot});

        if (isNot) {
          errorMessage += 'not ';
        }

        errorMessage += `return DOM element with attribute '${attrName}'`;

        if (!_.isNil(attrValue)) {
          errorMessage += ` valued '${attrValue}'`;
        }

        await t.expect(sel.count).eql(1, errorMessage);
      }
    }

    // BEM modifiers asserted by one at a time!
    if (requirements.bemModifiers) {
      if (!_.isArray(requirements.bemModifiers)) {
        throw new TypeError(
          `'requirements.bemModifiers' argument must be an array but it is ` +
          `${typeOf(requirements.bemModifiers)} (${requirements.bemModifiers})`
        );
      }

      for (const item of requirements.bemModifiers) {
        let mod = item;
        let isNot = false;

        if (_.isArray(item)) {
          [mod, isNot] = item;
        }

        const assertion = isNot ? 'expectHasNoBemModifier' : 'expectHasBemModifier';
        await this[assertion](mod);
      }
    }

    if (requirements.tagName) {
      if (!utils.isNonBlankString(requirements.tagName)) {
        throw new TypeError(
          `'requirements.tagName' argument must be a nil or non-blank string but it is ` +
          `${typeOf(requirements.tagName)} (${requirements.tagName})`
        );
      }

      await t.expect(this.selector.tagName).eql(requirements.tagName);
    }

    if (_.has(requirements, 'text')) {
      let expectedValue = requirements.text;
      let isNot = false;

      if (_.isArray(requirements.text)) {
        expectedValue = requirements.text[0];
        isNot = !!requirements.text[1];
      }

      // XXX TestCafe, currently, always converts `withText`'s' argument to
      // `RegExp` and so we must use workaround to use string equality.
      // await t.expect(selector.withText(requirements.text).count).eql(1);
      const expectedValueAsRegExp = _.isRegExp(expectedValue) ?
        expectedValue : new RegExp(`^${escapeStringRegexp(expectedValue + '')}$`);

      await t
        .expect(this.selector.withText(expectedValueAsRegExp).count)
        .eql(
          isNot ? 0 : 1,
          `'${this.displayName}' fragment's selector text must ${isNot ? 'not ' : ''}match ${expectedValueAsRegExp}`
        );
    }

    if (_.has(requirements, 'textContent')) {
      let expectedValue = requirements.textContent;
      let isNot = false;

      if (_.isArray(requirements.textContent)) {
        expectedValue = requirements.textContent[0];
        isNot = !!requirements.textContent[1];
      }

      if (_.isRegExp(expectedValue)) {
        const assertion = isNot ? 'notMatch' : 'match';
        await t.expect(this.selector.textContent)[assertion](expectedValue);
      }
      else {
        const assertion = isNot ? 'notEql' : 'eql';
        await t.expect(this.selector.textContent)[assertion](expectedValue + '');
      }
    }
  }

  /**
   * Asserts that fragment's selector has specified BEM modifier.
   *
   * @param {BemModifier|*[]|string} bemModifier - BEM modifier. Examples: ['foo'], ['foo', null], ['foo', 'bar'], 'foo'
   * @return {Promise<void>}
   */
  async expectHasBemModifier(bemModifier) {
    // We don't use `getBemModifier()` here as page may not have DOM element or
    // element may not have modifier right now, for example, remote operation
    // is in progress. Instead we use TestCafe's `expect` directly as it has
    // auto waiting feature.
    const className = this.cloneBemBase().setMod(bemModifier);
    await t
      .expect(this.selector.hasClass(className.toString()))
      .ok(`'${this.displayName}' fragment must have BEM modifier '${bemModifier}' (${className}) but it doesn't`);
  }

  /**
   * Asserts that fragment's selector has no specified BEM modifier.
   *
   * @param {BemModifier|*[]|string} bemModifier - BEM modifier. Examples: ['foo'], ['foo', null], ['foo', 'bar'], 'foo'
   * @return {Promise<void>}
   */
  async expectHasNoBemModifier(bemModifier) {
    // We don't use `getBemModifier()` here as page may not have DOM element or
    // element may not have modifier right now, for example, remote operation
    // is in progress. Instead we use TestCafe's `expect` directly as it has
    // auto waiting feature.
    const className = this.cloneBemBase().setMod(bemModifier);
    await t
      .expect(this.selector.hasClass(className.toString()))
      .notOk(`'${this.displayName}' fragment must not have BEM modifier '${bemModifier}' (${className}) but it does`);
  }

  /**
   * Asserts that fragment has other fragment, named `somethingName`, and that
   * other fragment must be obtained using `somethingSpecification` and
   * `somethingOptions`, and optionally, asserts that other fragment found at
   * position specified by `idx`.
   *
   * It requires that fragment has `#get[somethingName]()` method implemented.
   *
   * @param {string} somethingName - Name of something. For example, in Dialog it can be an Action
   * @param {*} somethingSpecification - See `spec` parameter of Something's constructor
   * @param {*} somethingOptions - See `opts` parameter of Something's constructor
   * @param {Options} [options] - Options
   * @param {number} [options.idx] - Position at which other fragment must be found to pass assertion. Must be an integer greater than or equal zero
   * @return {Promise<void>}
   * @throws {TypeError} When argument aren't valid.
   */
  async expectHasSomething(somethingName, somethingSpecification, somethingOptions, options) {
    const opts = utils.initializeOptions(options);
    const somethingGetterName = `get${ucFirst(somethingName)}`;

    if (!_.isFunction(this[somethingGetterName])) {
      throw new TypeError(
        `'${this.displayName}' fragment must have '${somethingGetterName}' method but it doesn't`
      );
    }

    const something = this[somethingGetterName](somethingSpecification, somethingOptions);
    await something.expectIsExist();

    const {idx} = opts;

    if (_.isInteger(idx)) {
      await something.expectIndexInParentIs(this.selector, idx);
    }
  }

  /**
   * Asserts that fragment has list of other fragments, named `somethingName`,
   * and that other fragments. Optionally, asserts that `this` fragment has
   * only specified other fragments, and, also optionally, asserts that other
   * fragments found in fragment in same order as in
   * `somethingSpecificationsAndOptions`.
   *
   * It requires that fragment has `#expect[somethingName]sCountIs()` and
   * `#expectHas[somethingName]()` methods.
   *
   * @param {string} somethingName - Name of something. For example, in Dialog it can be an Action
   * @param {array} somethingSpecificationsAndOptions - An array where each element is an array of two elements - something's specification and something's options. See `spec` and `opts` arguments of something's constructor
   * @param {Options} [options] - Options
   * @param {boolean} [options.only=false] - When `true` fragment must have only specified other fragments to pass assertion
   * @param {boolean} [options.sameOrder=false] - When `true` other fragments must be found in fragment in same order as in `somethingSpecificationsAndOptions` to pass assertion. Work only in conjunction with `only` parameter
   * @return {Promise<void>}
   * @throws {TypeError} When requirements failed.
   */
  async expectHasSomethings(somethingName, somethingSpecificationsAndOptions, options) {
    const len = somethingSpecificationsAndOptions.length;
    const opts = utils.initializeOptions(options, {defaults: {only: false, sameOrder: false}});
    const {only, sameOrder} = opts;

    if (only === true) {
      const counterMethodName = `expect${ucFirst(somethingName)}sCountIs`;

      if (!_.isFunction(this[counterMethodName])) {
        throw new TypeError(
          `'${this.displayName}' fragment must have '${counterMethodName}' method but it doesn't`
        );
      }

      await this[counterMethodName](len);
    }

    for (let i = 0; i < len; i++) {
      const idx = (only === true && sameOrder === true && i);
      await this.expectHasSomething(
        somethingName,
        somethingSpecificationsAndOptions[i][0],
        somethingSpecificationsAndOptions[i][1],
        {idx}
      );
    }
  }

  /**
   * Asserts that fragment is exist and found in parent at specified index.
   *
   * @param {*} parent - Same as `Fragment` constructor's `spec.parent` argument
   * @param {number} idx - Position at which fragment must be found in parent to pass assertion. Must be an integer greater or equal zero
   * @return {Promise<void>}
   */
  async expectIndexInParentIs(parent, idx) {
    await this.expectIsExist();

    const instAtIndex = new this.constructor({idx, parent});
    await instAtIndex.expectIsExist();

    const srcTextContent = await this.selector.textContent;
    const trgTextContent = await instAtIndex.selector.textContent;
    await t.expect(srcTextContent).eql(trgTextContent);
  };

  /**
   * Asserts that fragment is exist - its selector returns one or more DOM
   * elements.
   *
   * @param {?Options} [options] - Options
   * @param {boolean} [options.allowMultiple=false] - When falsey then fragment's selector must return only one DOM element to pass assertion
   * @param {boolean} [options.isNot=false] - When truthy fragment's selector must not exist (return zero DOM elements) to pass assertion
   * @param {string} [options.message] - Custom message for error
   * @return {Promise<void>}
   */
  async expectIsExist(options) {
    const opts = utils.initializeOptions(options, {
      defaults: {
        allowMultiple: false,
        isNot: false
      }
    });

    let msg = '';
    const {allowMultiple, isNot, message} = opts;

    // ---------------------------------------------------------------------------
    // Handling case when selector must not exist
    // ---------------------------------------------------------------------------

    if (isNot) {
      if (utils.isNonEmptyString(message)) {
        msg = message;
      }
      else {
        msg = `'${this.displayName}' fragment's selector must not return DOM elements but it does`;
      }

      await t
        .expect(this.selector.exists)
        .notOk(msg);

      return;
    }

    // ---------------------------------------------------------------------------
    // Handling case when selector must exist
    // ---------------------------------------------------------------------------

    if (allowMultiple) {
      msg = utils.isNonEmptyString(message) ?
        message : `'${this.displayName}' fragment's selector must return one or more DOM elements but it doesn't`;

      await t
        .expect(this.selector.count)
        .gte(1, msg);
    }
    else {
      msg = utils.isNonEmptyString(message) ?
        message : `'${this.displayName}' fragment's selector must return exactly one DOM element but it doesn't`;

      await t
        .expect(this.selector.count)
        .eql(1, msg);
    }
  }

  /**
   * Asserts that fragment is not exist - its selector returns zero DOM
   * elements.
   *
   * @param {?Options} [options] - Options
   * @param {boolean} [options.allowMultiple=false] - When falsey then fragment's selector must return only one DOM element to pass assertion
   * @param {boolean} [options.isNot=false] - When truthy fragment's selector must exist (return one or more DOM elements) to pass assertion
   * @param {string} [options.message] - Custom message for error
   * @return {Promise<void>}
   */
  async expectIsNotExist(options) {
    const opts = utils.initializeOptions(options, {
      defaults: {
        allowMultiple: false,
        isNot: false
      }
    });

    opts['isNot'] = !opts.isNot;
    await this.expectIsExist(opts);
  }

  /**
   * Asserts that fragment's current state is equal state specified by
   * `stateOrId`.
   *
   * @param {object|string} stateOrId - When it's an object than fragment's current state must be deeply equal it to pass assertion, otherwise it must be a string - id of persisted state to which fragment's current state must be deeply equal to pass assertion
   * @param {Options} [options] - Options. Same as in `#getState()` plus following ones
   * @param {boolean} [options.debug=false] - When truthy then detailed diff would be logged to console on assertion failure
   * @return {Promise<void>}
   * @throws {TypeError} When arguments aren't valid.
   */
  async expectStateIs(stateOrId, options) {
    if (!(_.isPlainObject(stateOrId) || utils.isNonBlankString(stateOrId))) {
      throw new TypeError(
        `'stateOrId' argument must be a plain object or non-blank string but it is ` +
        `${typeOf(stateOrId)} (${stateOrId})`
      );
    }

    const stateToMatch = _.isPlainObject(stateOrId) ? stateOrId : this.getPersistedState(stateOrId);

    if (!_.isPlainObject(stateToMatch)) {
      throw new TypeError(
        `State to match must be a plain object but it is ${typeOf(stateToMatch)} (${stateToMatch})`
      );
    }

    const opts = utils.initializeOptions(options, {defaults: {debug: false}});
    const currentState = await this.getState(_.omit(opts, ['debug']));

    if (opts.debug) {
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
        `'${this.displayName}' fragment's current state doesn't match expected\n` +
        `${JSON.stringify(detailedDiff(stateToMatch, currentState), null, '\t')}\n`
      );
  }

  /**
   * Returns array of CSS class names of fragment's selector that have `name`
   * as name of BEM modifier. When `name` is nil array would contain all CSS
   * class names that have (any) BEM modifier.
   *
   * @param {?string} [modifierName] - BEM modifier name
   * @return {Promise<BemModifier[]>}
   */
  async getBemModifiers(modifierName) {
    if (!(_.isNil(modifierName) || utils.isNonBlankString(modifierName))) {
      throw new TypeError(
        `'modifierName' argument must be a nil or non-blank string but it is ${typeOf(modifierName)} (${modifierName})`
      );
    }

    if (this.bemBase.mod) {
      throw new TypeError(
        `Can not obtain BEM modifiers because fragment's BEM base already have modifier '${this.bemBase.mod}'`
      );
    }

    await this.expectIsExist({allowMultiple: false});

    const bemBasePlusModifierName = modifierName ? `${this.bemBase}--${modifierName}` : `${this.bemBase}--`;
    const bemMods = [];
    const classNames = await this.selector.classNames;

    for (const className of classNames) {
      if (_.startsWith(className, bemBasePlusModifierName)) {
        const bemBase = new bem.BemBase(className);
        bemMods.push(bemBase.mod);
      }
    }

    return bemMods;
  }

  /**
   * Returns fragment's state that was persisted earlier under specified `id`.
   *
   * @param {string} id - Id of state that was persisted earlier
   * @returns {object|null} Persisted state.
   * @throws {TypeError} When argument isn't valid or persisted state identified by `id` not exists.
   */
  getPersistedState(id) {
    if (!utils.isNonBlankString(id)) {
      throw new TypeError(
        `'id' argument must be a non-blank string but it is ${typeOf(id)} (${id})`
      );
    }

    const state = this._persistedStates && this._persistedStates[id];

    if (_.isUndefined(state)) {
      throw new TypeError(
        `Persisted state with id '${id}' does not exist`
      );
    }

    return state;
  }

  /**
   * Returns instance of `FragmentOfSomething` that matches `spec`. Optional BEM
   * base for `FragmentOfSomething` can be provided as `optsOfSomething` when
   * needed.
   *
   * @param {*} FragmentOfSomething - Fragment class of something, must be descendant of `Fragment` class
   * @param {object} [specOfSomething] - See `spec` parameter of `FragmentOfSomething` constructor
   * @param {object} [optsOfSomething] - See `opts` parameter of `FragmentOfSomething` constructor
   * @returns {*}
   * @throws {TypeError} When argument aren't valid.
   */
  getSomething(FragmentOfSomething, specOfSomething, optsOfSomething) {
    if (!(FragmentOfSomething && FragmentOfSomething.isFragment)) {
      throw new TypeError(
        `'FragmentOfSomething' argument must be a fragment class but it is ` +
        `${typeOf(FragmentOfSomething)} (${FragmentOfSomething})`
      );
    }

    if (specOfSomething instanceof Fragment) {
      throw new TypeError(
        `'specOfSomething' argument is a '${specOfSomething.displayName}' fragment but it must be a fragment ` +
        'specification or nil'
      );
    }

    const somethingSpec = _.assign({}, {parent: this.selector}, specOfSomething);
    return new FragmentOfSomething(somethingSpec, optsOfSomething);
  }

  /**
   * Returns class of named fragment that exists as property of fragment, its
   * class or in fragments hierarchy up to `RootFragmentOfSomething`.
   *
   * @param {string} name - Name (without 'Fragment' suffix) of fragment's class to return
   * @param {class} RootFragmentOfSomething - Root of fragments hierarchy
   * @return {class}
   * @throws {TypeError} When matching fragment class not found.
   */
  getSomethingFragment(name, RootFragmentOfSomething) {
    const propName = ucFirst(name) + 'Fragment'; // e.g. 'TextInputFragment'

    const FromInst = this.opts[propName];
    const FromClass = this.constructor[propName];
    const FromParent = (this instanceof RootFragmentOfSomething && this.constructor !== RootFragmentOfSomething && super[propName]);

    const SomethingFragment = FromInst || FromClass || FromParent;

    if (!(SomethingFragment && SomethingFragment.isFragment)) {
      throw new TypeError(
        `'${propName}' must be a fragment class but it is ${typeOf(SomethingFragment)} (${SomethingFragment})`
      );
    }

    return SomethingFragment;
  }

  /**
   * Returns fragment's state (all parts).
   *
   * @param {Options} [options] - Options
   * @param {string[]} [options.omitParts] - Only parts of state that not found in that list would be in returned state. Applied after `options.onlyParts`
   * @param {string[]} [options.onlyParts] - Only parts of state that found in that list would be in returned state. Applied before `options.omitParts`
   * @return {Promise<{}>}
   * @throws {TypeError} When arguments aren't valid.
   */
  async getState(options) {
    let statePartList = this.getStateParts();

    if (!_.isArray(statePartList)) {
      throw new Error(
        `'${this.displayName}#getStateParts()' must return an array of state parts but it return ` +
        `${typeOf(statePartList)} (${statePartList})`
      );
    }
    else {
      statePartList = _.uniq(statePartList);
    }

    const opts = utils.initializeOptions(options);
    const {omitParts, onlyParts, waitBefore} = opts;

    if (waitBefore) {
      await t.wait(waitBefore);
    }

    if (!(_.isNil(omitParts) || (_.isArray(omitParts) && _.every(omitParts, utils.isNonBlankString)))) {
      throw new TypeError(
        `'options.omitParts' argument must be a nil or array of non-blank strings but it is ` +
        `${typeOf(omitParts)} (${omitParts})`
      );
    }

    if (!(_.isNil(onlyParts) || (_.isArray(onlyParts) && _.every(onlyParts, utils.isNonBlankString)))) {
      throw new TypeError(
        `'options.onlyParts' argument must be a nil or array of non-blank strings but it is ` +
        `${typeOf(onlyParts)} (${onlyParts})`
      );
    }

    const state = {};

    if (statePartList.length) {
      const partNames = [];
      const partGetStatePromises = [];

      for (const k of statePartList) {
        let mustBeIncluded = true;
        let mustBeExcluded = false;

        if (onlyParts && !_.includes(onlyParts, k)) {
          mustBeIncluded = false;
        }

        if (omitParts && _.includes(omitParts, k)) {
          mustBeExcluded = true;
        }

        if (mustBeIncluded && !mustBeExcluded) {
          const partOfStateGetterName = `get${pascalCase(k)}PartOfState`;
          partNames.push(k);

          if (!_.isFunction(this[partOfStateGetterName])) {
            throw new TypeError(
              `'${this.displayName}#${partOfStateGetterName}' must be a function but it is ` +
              `${this[partOfStateGetterName]}`
            );
          }

          partGetStatePromises.push(this[partOfStateGetterName](options));
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
   * Returns list of fragment's state parts.
   *
   * @param {Options} [options] - Options
   * @param {boolean} [options.onlyWritable=false] - When truthy then only writable state parts would be returned
   * @return {Array} List of parts of fragment's state.
   */
  getStateParts(options) {
    return [];
  }

  /**
   * Persists fragment's state under specified `id` and returns it. When
   * optional `state` argument is `nil` then fragment's current state would be
   * persisted.
   *
   * @param {string} id - Id that would be used to identify persisted state
   * @param {object} [state] - Optional, state that must be persisted. Pass `nil` to persist fragment's current state
   * @param {Options} [options] - Options. Same as for `#getState()`
   * @return {Promise<{}>} State that was persisted.
   * @throws {TypeError} When arguments aren't valid.
   */
  async persistState(id, state, options) {
    if (!utils.isNonBlankString(id)) {
      throw new TypeError(
        `'id' argument must be a non-blank string but it is ${typeOf(id)} (${id})`
      );
    }

    if (_.isNil(state)) {
      state = await this.getState(options);
    }
    else if (!_.isPlainObject(state)) {
      throw new TypeError(
        `'state' argument must be a nil or plain object but it is ${typeOf(state)} (${state})`
      );
    }

    return this._persistedStates[id] = state;
  }

  /**
   * Sets fragment's state to one that was persisted earlier and identified by
   * passed `id`.
   *
   * @param {string} id - Id of state that was persisted earlier
   * @return {Promise<{}>} Fragment's state after restore state operation is done.
   * @throws {TypeError} When arguments aren't valid.
   */
  async restoreState(id) {
    if (!utils.isNonBlankString(id)) {
      throw new TypeError(
        `'id' argument must be a non-blank string but it is ${typeOf(id)} (${id})`
      );
    }

    const state = this._persistedStates && this._persistedStates[id];

    if (!_.isPlainObject(state)) {
      throw new TypeError(
        `State, persisted under id '${id}', is not valid - it must be a plain object but it is ` +
        `${typeOf(state)} (${state})`
      );
    }

    return this.setState(state);
  }

  /**
   * Sets state of fragment.
   *
   * @param {object|undefined} newState - New state for fragment. Passing `undefined` means "Do nothing and just return current state". Values for read-only parts silently ignored
   * @param {Options} [options] - Options
   * @return {Promise<{}>} Fragment's state, that have only updated (writable) parts, after set state operation was done.
   * @throws {TypeError} When arguments aren't valid.
   */
  async setState(newState, options) {
    if (_.isUndefined(newState)) {
      return this.getState(options);
    }

    if (!_.isPlainObject(newState)) {
      throw new TypeError(
        `'newState' argument must be a plain object but it is ${typeOf(newState)} (${newState})`
      );
    }

    let statePartList = this.getStateParts({onlyWritable: true});
    const state = {};

    if (!_.isArray(statePartList)) {
      throw new Error(
        `'${this.displayName}#getStateParts()' must return an array of state parts but it return ` +
        `${typeOf(statePartList)} (${statePartList})`
      );
    }
    else {
      statePartList = _.uniq(statePartList);
    }

    for (let k of statePartList) {
      const partOfStateSetterName = `set${pascalCase(k)}PartOfState`;

      if (!_.isFunction(this[partOfStateSetterName])) {
        throw new TypeError(
          `'${this.displayName}#${partOfStateSetterName}' must be a function but it is ` +
          `${typeOf(this[partOfStateSetterName])} (${this[partOfStateSetterName]})`
        );
      }

      state[k] = await this[partOfStateSetterName](newState[k], options);
    }

    return state;
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