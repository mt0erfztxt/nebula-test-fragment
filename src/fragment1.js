import _ from 'lodash';
import typeOf from 'typeof--'
import { Selector, t } from 'testcafe';

import bem from "./bem";
import Options from "./options";
import utils from './utils';

const _baseFragmentMarker = 'BASE_FRAGMENT';
const { BemBase } = bem;

class Fragment {

  // TODO Allow `locator` to be string/number by providing
  //      `defaultTransformation` on class.
  /**
   * Creates fragment.
   * 
   * @param {*} [locator] Used to create fragment's selector. In general case it is a list of transformations used to transform selector (see 'parent' option) so it returns DOM element(-s) for one or more fragments. Each transformation is a function (receive selector to transform and fragment's BEM base) or an object (key/value pairs are transformation names/values). Built-in transformations are: 'cns' (must be a string), 'cid' (must be a string), 'idx' (must be an integer gte 0).
   * @param {Options|Object} [options] Options
   * @param {*} [options.parent='body'] Used to specify selector to which locator must be applied. It can be fragment, and then its selector would be used, or it can be anything that TestCafe `Selector` accepts as initializer
   */
  constructor(locator, options) {

    /**
     * Locator passed to `constructor`.
     * 
     * @type {*}
     */
    this.locator = locator;

    /**
     * Options passed to `constructor`.
     * 
     * @type {Options}
     */
    this.options = new Options(options, {
      defaults: {
        parent: 'body'
      }
    });

    /**
     * List of transformations that must be applied to selector for it to
     * return DOM element(-s) for one or more fragments.
     * 
     * @private
     * @type {Array<*>}
     */
    this._selectorTransformations = [];

    if (_.isArray(locator)) {
      this._selectorTransformations = locator;
    }
    else if (!_.isNil(locator)) {
      this._selectorTransformations = [locator];
    }

    // Fragment must have BEM base. It can be provided as property of
    // fragment's class or ancestor fragment's class, and can be an instance of
    // `BemBase` or a string.
    const chosenBemBase = this.constructor.bemBase || super.bemBase;
    const chosenBemBaseAsStr = chosenBemBase + '';

    if (!utils.isNonEmptyString(chosenBemBaseAsStr) ||
      chosenBemBaseAsStr === _baseFragmentMarker) {
      throw new TypeError(
        `${this.displayName}.constructor(): can't create fragment without ` +
        'BEM base'
      );
    }

    /**
     * Fragment's BEM base.
     *
     * @private
     * @type {BemBase}
     */
    this._bemBase = new BemBase(chosenBemBase, { isFinal: true });

    // When choosing parent for fragment's selector we have following options:
    // 1. Parent is specified and it's a fragment - we use that fragment's
    // selector as parent selector.
    // 2. Parent is specified and it isn't a fragment - we use it as
    // initializer to create parent selector.
    // 3. No parent specified - we use 'body' as initializer to create parent
    // selector.
    const { parent } = this.options;
    const parentSelector = (parent instanceof Fragment) ?
      parent.selector : Selector(parent);

    /**
     * Fragment's selector, scoped into parent.
     * 
     * @private
     * @type {Selector}
     */
    this._selector = parentSelector.find(`.${this._bemBase}`);

    /**
     * Whether fragment's selector is initialized or not.
     * 
     * @private
     * @type {Boolean}
     */
    this._selectorInitialized = false;
  }

  /**
   * Just a simple check that class is a Fragment or its descendant.
   *
   * @returns {Boolean}
   */
  static get isFragment() {
    return true;
  }

  /**
   * Fragment's BEM base.
   *
   * @returns {BemBase}
   */
  get bemBase() {
    return this._bemBase;
  }

  /**
   * Fragment's display name.
   *
   * @returns {String}
   */
  get displayName() {
    return (this.constructor.displayName || super.displayName);
  }

  /**
   * Fragment's selector.
   * 
   * @returns {Selector}
   */
  get selector() {
    if (!this._selectorInitialized) {
      this._initializeSelector();
    }

    return this._selector;
  }

  /**
   * Used to initialize fragment's selector.
   * 
   * @private
   */
  _initializeSelector() {
    for (const transformation of this._selectorTransformations) {
      const transformedSelector = _.isFunction(transformation) ?
        transformation(this._selector, this.bemBase) :
        this._transformSelector(transformation);

      // TODO How to check more reliably?
      if (!transformedSelector) {
        throw new TypeError(
          `${this.displayName}: selector transformation must return new ` +
          `selector but it return ${typeOf(transformedSelector)} ` +
          `(${transformedSelector})`
        );
      }

      this._selector = transformedSelector;
    }

    this._selectorInitialized = true;
  }

  /**
   * Used to allow custom selector transformation to be added by derived
   * fragment class when required.
   * 
   * @private
   * @param {Object} transformation 
   * @returns {Selector}
   */
  _transformSelector(transformation) {
    if (this._selectorInitialized) {
      throw new Error(
        `${this.displayName}#transformSelector(): can't transform ` +
        'initialized selector'
      );
    }

    return this.transformSelector(
      transformation,
      this._selector,
      this.bemBase
    );
  }

  /**
   * Transforms fragment's selector.
   * 
   * NOTE Don't use `this.selector` here because that cause infinite loop!!!
   * TODO Maybe add a guard that `this.selector` doesn't used or unbind `this`
   *      in `#_transformSelector()`?
   * 
   * @param {Object} transformations A transformations to apply. Each key:value pair is a transformation
   * @param {Selector} selector Selector to transform
   * @param {BemBase} bemBase Fragment's BEM base
   */
  transformSelector(transformations, selector, bemBase) {
    const requestedTransformations = _
      .chain(transformations)
      .keys()
      .filter(_.has)
      .value();

    // TODO Need to find a way to obtain list of all available transformations
    //      in fragment's hierarchy first. Maybe it can be passed as fourth
    //      argument or method like `Fragment#getPartsOfState()` can be used.
    // const unsupportedTransformationsNames = _.filter(
    //   requestedTransformations,
    //   (v) => !_.includes(['cid', 'cns', 'idx'], v)
    // );
    // 
    // if (!_.isEmpty(unsupportedTransformationsNames)) {
    //   throw new TypeError(
    //     `${this.displayName}#transformSelector(): unsupported ` +
    //     `transformation(-s) '${unsupportedTransformationsNames}'`
    //   );
    // }

    // Handle 'cns' (component namespace) transformation.
    if (_.includes(requestedTransformations, 'cns')) {
      const v = transformations.cns;

      if (!utils.isNonEmptyString(v)) {
        throw new TypeError(
          `${this.displayName}#transformSelector(): Built-in 'cns' ` +
          `transformation must be a non-empty string but it is ` +
          `${typeOf(v)} (${v})`
        );
      }

      selector = selector
        .filter(`.${bemBase.setMod(['cns', v], { fresh: true })}`);
    }

    // Handle 'cid' (component id) transformation.
    if (_.includes(requestedTransformations, 'cid')) {
      const v = transformations.cid;

      if (!utils.isNonEmptyString(v)) {
        throw new TypeError(
          `${this.displayName}#transformSelector(): Built-in 'cid'  ` +
          `transformation must be a non-empty string but it is ` +
          `${typeOf(v)} (${v})`
        );
      }

      selector = selector
        .filter(`.${bemBase.setMod(['cid', v], { fresh: true })}`);
    }

    // Handle 'idx' transformation. It respects 'cns' and 'cid' transformations
    //  and so applied after them.
    if (_.includes(requestedTransformations, 'idx')) {
      const v = transformations.idx;

      if (_.isInteger(v) && v >= 0) {
        /*
         * NOTE Don't use `Selector.nth()` because it doesn't work properly,
         * namely, when you try to call `nth()` later, for example, in
         * following transformation, selector would be reseted to state
         * before `nth()` call in 'idx' transformation. Perhaps this is a
         * bug, but tested only in TestCafe '0.16.2'. This misbehavior was
         * discovered first time in '060-specs-composition' tests.
         *
         * THIS WOULD NOT WORK PROPERLY!!!
         * selector = selector.nth(v);
         */
        selector = selector
          .filter((_, idx) => idx === v, { v });
      }
      else {
        throw new TypeError(
          `${this.displayName}#transformSelector(): Built-in 'idx' ` +
          `transformation must be an integer greater than or equal zero ` +
          `but it is ${typeOf(v)} (${v})`
        );
      }
    }

    return selector;
  }

  /**
   * Creates new instance of BEM base using fragment's `bemBase` as its
   * initializer.
   *
   * @returns {BemBase}
   */
  cloneBemBase() {
    return new BemBase(this.bemBase);
  }

  /**
   * Asserts that fragment's selector has specified BEM modifier.
   *
   * @param {String|BemModifier|Array} bemModifier BEM modifier. Examples: 'foo', ['foo'] or ['foo', null], ['foo', 'bar']
   * @return {Promise<void>}
   */
  async expectHasBemModifier(bemModifier) {
    // We don't use `getBemModifier()` here as page may not have DOM element or
    // element may not have modifier right now, for example, remote operation
    // is in progress. Instead we use TestCafe's `expect` directly as it has
    // auto waiting feature.
    const className = this
      .cloneBemBase()
      .setMod(bemModifier)
      .toString();

    await t
      .expect(this.selector.hasClass(className))
      .ok(
        `'${this.displayName}' fragment must have BEM modifier ` +
        `'${bemModifier}' (${className}) but it doesn't`
      );
  }

  /**
   * Asserts that fragment's selector has no specified BEM modifier.
   *
   * @param {String|BemModifier|Array} bemModifier BEM modifier. Examples: 'foo', ['foo'] or ['foo', null], ['foo', 'bar']
   * @return {Promise<void>}
   */
  async expectHasNoBemModifier(bemModifier) {
    // We don't use `getBemModifier()` here as page may not have DOM element or
    // element may not have modifier right now, for example, remote operation
    // is in progress. Instead we use TestCafe's `expect` directly as it has
    // auto waiting feature.
    const className = this
      .cloneBemBase()
      .setMod(bemModifier);

    await t
      .expect(this.selector.hasClass(className.toString()))
      .notOk(
        `'${this.displayName}' fragment must not have BEM modifier ` +
        `'${bemModifier}' (${className}) but it does`
      );
  }

  /**
   * Asserts that fragment has other fragment, named `somethingName`, and that
   * other fragment must be obtained using `somethingLocator` and
   * `somethingOptions`, and optionally, asserts that other fragment found at
   * position specified by `idx`.
   *
   * @param {String} somethingName Name of something. For example, in Dialog it can be an Action
   * @param {*} somethingLocator See `locator` parameter of Something's constructor
   * @param {*} somethingOptions See `options` parameter of Something's constructor
   * @param {Options|Object} [options] Options
   * @param {Boolean} [options.equalityCheck] Same as in `#expectIsEqual()`. Usable only with 'idx' option
   * @param {Function|String} [options.getSomething] When it's a function then it would be used to get something, note that no `this` binding provided. When it's a string then it's must be a name of method of something that must be used to get something. When nil then instance's method named `#getSomething`, where 'Something' part equal to upercased version of `somethingName` argument would be used
   * @param {Number} [options.idx] Position at which other fragment must be found to pass assertion. Must be an integer greater than or equal zero
   * @returns {Promise<Object>} Found something.
   * @throws {AssertionError} When something fragment specified by `somethingLocator` and `somethingOptions` doesn't exist.
   * @throws {TypeError} When arguments aren't valid.
   */
  async expectHasSomething(somethingName, somethingLocator, somethingOptions, options) {
    if (!utils.isNonBlankString(somethingName)) {
      throw new TypeError(
        `'${this.displayName}#expectHasSomething()': 'somethingName' ` +
        `argument must be a non-blank string but it is ` +
        `${typeOf(somethingName)} (${somethingName})`
      );
    }

    const { equalityCheck, getSomething, idx } = new Options(options, {
      validator: ({ getSomething }) => {
        if (!(_.isNil(getSomething) || _.isFunction(getSomething) ||
            utils.isNonBlankString(getSomething))) {
          return (
            `${this.displayName}#expectHasSomething(): 'getSomething' ` +
            `option must be a function or a non-blank string but it is ` +
            `${typeOf(getSomething)} (${getSomething})`
          );
        }
        else {
          return null;
        }
      }
    });

    if (_.isString(getSomething) && !_.isFunction(this[getSomething])) {
      throw new TypeError(
        `'${this.displayName}' fragment must have '${getSomething}' method ` +
        `specified in 'getSomething' option but it doesn't`
      );
    }

    const getSomethingMethodName = `get${ucFirst(somethingName)}`;

    if (_.isNil(getSomething) && !_.isFunction(this[getSomethingMethodName])) {
      throw new TypeError(
        `'${this.displayName}' fragment must have ` +
        `'${getSomethingMethodName}' method or 'getSomething' option set ` +
        `but it doesn't`
      );
    }

    /**
     * @type {Fragment}
     */
    let something;

    if (_.isFunction(getSomething)) {
      something = getSomething(somethingLocator, somethingOptions);
    }
    else {
      const method = getSomething || getSomethingMethodName;
      something = this[method](somethingLocator, somethingOptions);
    }

    if (_.isInteger(idx)) {
      await something.expectIndexInParentIs(this, idx, { equalityCheck });
    }
    else {
      await something.expectIsExist();
    }

    return something;
  }

  /**
   * Asserts that fragment is found in specified parent at specified index.
   *
   * @param {*} parent Same as constructor's 'parent' option
   * @param {Number} idx Position at which fragment must be found in parent to pass assertion. Must be an integer greater or equal zero
   * @param {Options|Object} [options] Options
   * @param {Boolean} [options.equalityCheck] Same as in `#expectIsEqual()`
   * @returns {Promise<void>}
   */
  async expectIndexInParentIs(parent, idx, options) {
    await this.expectIsEqual(new this.constructor({ idx }, { parent }), {
      equalityCheck: _.get(options, 'equalityCheck')
    });
  };

  // TODO: Add option to easily swap default implementation of equality check
  //       to equality by BEM modifier, attribute.
  /**
   * Asserts that `this` fragment is equal `that` fragment.
   * 
   * @param {*} that A fragment to which `this` fragment must be equal to pass assertion
   * @param {Options|Object} [options] Options
   * @param {Boolean|Function} [options.equalityCheck=true] When it is a nil or `true` a default implementation, that asserts on equality of `this` and `that` text content, would be used. When it is a (async) function then it would be called with `this` and `that` fragments and it must throw when fragments aren't equal, note that no `this` binding is provided. Set it to falsey value and override in descendant to get custom equality check logic
   * @throws {AssertionError} When `this` or `that` fragment doesn't exist or they doesn't equal.
   * @throws {TypeError} When `that` is not a fragment of same class as `this`.
   */
  async expectIsEqual(that, options) {
    if (!(that instanceof Fragment)) {
      throw new TypeError(
        `'${this.displayName}#expectIsEqual()': 'that' argument must be a ` +
        `'${this.displayName}' fragment but it's even not a fragment`
      );
    }

    if (!(that instanceof this.constructor)) {
      throw new TypeError(
        `'${this.displayName}#expectIsEqual()': 'that' argument must be a ` +
        `'${this.displayName}' fragment but it is a '${that.displayName}' fragment`
      );
    }

    const { equalityCheck } = _
      .chain(new Options(options, { defaults: { equalityCheck: true } }))
      .update('equalityCheck', (v) => (_.isNil(v) || v === true) ? true : v)
      .value();

    await this.expectIsExist({
      message: `'${this.displayName}#expectIsEqual()': 'this' fragment must ` +
        "exist but it doesn't"
    });
    await that.expectIsExist({
      message: `'${that.displayName}#expectIsEqual()': fragment passed in as ` +
        "'that' argument must exist but it doesn't"
    });

    if (equalityCheck === true) {
      const thisTextContent = await this.selector.textContent;
      const thatTextContent = await that.selector.textContent;
      const msg = `'${this.displayName}#expectIsEqual()': fragments text ` +
        "content doesn't match"

      await t
        .expect(thisTextContent)
        .eql(thatTextContent, msg);
    }
    else if (_.isFunction(equalityCheck)) {
      await equalityCheck(this, that);
    }
    else if (!(_.isNil(equalityCheck) || equalityCheck === false)) {
      throw new TypeError(
        `'${this.displayName}#expectIsEqual()': 'equalityCheck' option must ` +
        `be a boolean or a function but it is ${typeOf(equalityCheck)} ` +
        `(${equalityCheck})`
      );
    }
  }

  /**
   * Asserts that fragment is exist - its selector returns one or more DOM
   * elements.
   *
   * @param {Options|Object} [options] Options
   * @param {Boolean} [options.allowMultiple=false] When falsey then fragment's selector must return only one DOM element to pass assertion
   * @param {Boolean} [options.isNot=false] When truthy fragment's selector must not exist (return zero DOM elements) to pass assertion
   * @param {String} [options.message] Custom message for error
   * @return {Promise<void>}
   */
  async expectIsExist(options) {
    const opts = new Options(options, {
      defaults: {
        allowMultiple: false,
        isNot: false
      }
    });

    let msg = '';
    const { allowMultiple, isNot, message } = opts;

    // ---------------------------------------------------------------------------
    // Handling case when selector must not exist
    // ---------------------------------------------------------------------------

    if (isNot) {
      if (utils.isNonEmptyString(message)) {
        msg = message;
      }
      else {
        msg = `'${this.displayName}' fragment's selector must not return DOM ` +
          'elements but it does';
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
        message :
        `'${this.displayName}' fragment's selector must return one or more DOM ` +
        "elements but it doesn't";

      await t
        .expect(this.selector.count)
        .gte(1, msg);
    }
    else {
      msg = utils.isNonEmptyString(message) ?
        message :
        `'${this.displayName}' fragment's selector must return exactly one DOM ` +
        "element but it doesn't";

      await t
        .expect(this.selector.count)
        .eql(1, msg);
    }
  }

  /**
   * Asserts that fragment is not exist - its selector returns zero DOM
   * elements.
   *
   * @param {Options|Object} [options] Options
   * @param {Boolean} [options.allowMultiple=false] When falsey then fragment's selector must return only one DOM element to pass assertion
   * @param {Boolean} [options.isNot=false] When truthy fragment's selector must exist (return one or more DOM elements) to pass assertion
   * @param {String} [options.message] Custom message for error
   * @return {Promise<void>}
   */
  async expectIsNotExist(options) {
    const opts = new Options(options, {
      defaults: {
        allowMultiple: false,
        isNot: false
      }
    });

    opts['isNot'] = !opts.isNot;
    await this.expectIsExist(opts);
  }

  /**
   * Asserts that count of somethings in fragment equal value specified in
   * `count`.
   *
   * @param {*} somethingSelector TestCafe selector for something
   * @param {Number|Array} count Fragment must have that number of somethings to pass assertion. When you need more flexibility than just equality pass an `Array` with TestCafe assertion name (default to 'eql') as first element and expected value for assertion as second, for example, `['gte', 3]`
   * @param {Options|Object} [options] Options
   * @param {Boolean} [options.isNot=false] When truthy assertion would be negated
   * @return {Promise<void>}
   */
  static async expectSomethingsCountIs(somethingSelector, count, options) {
    let assertionName = 'eql';

    if (_.isArray(count)) {
      [assertionName, count] = count;
    }

    assertionName = utils.buildTestCafeAssertionName(assertionName, options);
    await t.expect(somethingSelector.count)[assertionName](count);
  }

  /**
   * Returns array of CSS class names of fragment's selector that have `name`
   * as name of BEM modifier. When `name` is nil array would contain all CSS
   * class names that have (any) BEM modifier.
   *
   * @param {String} [modifierName] BEM modifier name
   * @return {Promise<BemModifier[]>}
   */
  async getBemModifiers(modifierName) {
    if (!(_.isNil(modifierName) || utils.isNonBlankString(modifierName))) {
      throw new TypeError(
        `'modifierName' argument must be a nil or a non-blank string but it ` +
        `is ${typeOf(modifierName)} (${modifierName})`
      );
    }

    await this.expectIsExist({ allowMultiple: false });

    const bemBaseWithoutMod = this.cloneBemBase().setMod();
    const bemBaseWithModName = `${bemBaseWithoutMod}--` + (modifierName || '');
    const bemMods = [];
    const classNames = await this.selector.classNames;

    for (const className of classNames) {
      if (_.startsWith(className, bemBaseWithModName)) {
        bemMods.push(new BemBase(className).mod);
      }
    }

    return bemMods;
  }

  /**
   * Returns fragment of class `Something`.
   *
   * @param {*} Something Fragment class, must be descendant of `Fragment` class
   * @param {Object|Function|Array} [locator] Same as `locator` parameter of `Something` constructor
   * @param {Options|Object} [options] Same as `options` parameter of `Something` constructor, but 'parent' is forcibly set to this fragment
   * @returns {*}
   * @throws {TypeError} When argument aren't valid.
   */
  getSomething(something, locator, options) {
    const somethingProp = ucFirst(something) + 'Fragment'; // e.g. 'TextInputFragment'
    const Something = this[somethingProp];

    if (!(Something && Something.isFragment)) {
      throw new TypeError(
        `'${this.displayName}' fragment must have '${somethingProp}' getter ` +
        `that returns '${something}' fragment class but it returns ` +
        `${typeOf(Something)} (${Something})`
      );
    }

    if (locator instanceof Fragment) {
      throw new TypeError(
        `'locator' argument is a '${locator.displayName}' fragment but it ` +
        'must be a fragment locator or nil'
      );
    }

    const opts = _
      .chain((options instanceof Options) ? options : new Options(options))
      .set('parent', this)
      .value()

    return new Something(locator, opts);
  }

  /**
   * Returns class of named fragment from one of following places (in specified
   * order) - fragment's option named 'NameFragment' -> fragment's class
   * property named 'NameFragment' -> traversing fragment's ancestors up to
   * `RootFragmentOfSomething`, where 'NameFragment' is an uppercased version
   * of `name` argument plus string 'Fragment', e.g. for `name` 'bar' it would
   * be 'BarFragment'.
   *
   * @param {String} name Name (without 'Fragment' suffix) of fragment's class to return
   * @param {Class} RootFragmentOfSomething Root of fragments hierarchy
   * @return {Class}
   * @throws {TypeError} When matching fragment class not found.
   */
  getSomethingFragment(name, RootFragmentOfSomething) {
    const propName = ucFirst(name) + 'Fragment'; // e.g. 'TextInputFragment'
    const SomethingFragment =
      this.options[propName] ||
      this.constructor[propName] ||
      (
        this instanceof RootFragmentOfSomething &&
        this.constructor !== RootFragmentOfSomething &&
        super[propName]
      );

    if (!(SomethingFragment && SomethingFragment.isFragment)) {
      throw new TypeError(
        `'${propName}' must be a fragment class but it is ` +
        `${typeOf(SomethingFragment)} (${SomethingFragment})`
      );
    }

    return SomethingFragment;
  }
}

Object.defineProperties(Fragment, {
  bemBase: {
    value: _baseFragmentMarker
  },
  displayName: {
    value: 'Fragment'
  }
});

export default Fragment;
