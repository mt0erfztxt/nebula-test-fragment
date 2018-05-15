import _ from 'lodash';
import {ucFirst} from 'change-case';
import {Selector, t} from 'testcafe';
import typeOf from 'typeof--'

import bem from "./bem";
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
   * Creates new instance of BEM base using fragment's `bemBase` as its
   * initializer.
   *
   * @returns {BemBase}
   */
  cloneBemBase() {
    return new bem.BemBase(this.bemBase);
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