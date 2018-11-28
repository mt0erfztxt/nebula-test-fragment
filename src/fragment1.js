import _ from 'lodash';
import escapeStringRegexp from 'escape-string-regexp';
import typeOf from 'typeof--'
import { detailedDiff } from 'deep-object-diff';
import { pascalCase, ucFirst } from 'change-case';
import { Selector, t } from 'testcafe';

import bem from "./bem";
import Options from "./options";
import selector from "./selector";
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

    /**
     * Store for persisted states.
     *
     * @private
     */
    this._persistedStates = {};
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

  // TODO Clarify - what a difference between `text` and `textContent` requirements.
  /**
   * Asserts that fragment's selector returns one DOM element and conforms
   * specified requirements.
   *
   * @param {Object} [requirements] Requirements. Nil means assert only for existence
   * @param {Array} [requirements.attributes] Allows to assert that fragment's selector have or have no specified attribute(-s). Where array elements are: first element (required) an attribute name which is a string (`RegExp` attribute name is not supported); second (optional) element is an attribute value and when it's a `nil` then assertion would be just for presence of attribute with specified name, when it's a `RegExp` then value of attribute must match that value to pass assertion, otherwise attribute value must be equal stringified version of that value to pass assertion; third (optional) element can be used to specify that assertion condition must be negated, for example, `['value', 123]` requirement can be used to assert that fragment's selector has 'value' attribute equal to '123' and `['value', 123, true]` requirement can be used to assert that fragment's selector has no 'value' attribute with value equal '123'. Because second and third elements are optional we can pass just attribute name to assert that fragment's selector has that attribute, for example, `['disabled']` can be simplified to just `'disabled'`
   * @param {Object} [requirements.bemModifiers] Allows to assert that fragment's selector have or have no specified BEM modifier(-s). Same as for `requirements.attributes` but instead of attribute name and value pass BEM modifier name and value
   * @param {String} [requirements.tagName] Allows to assert that fragment's selector rendered using specified tag
   * @param {String|RegExp|Array} [requirements.text] Allows to assert that fragment selector's text equal or matches specified value. Condition of assertion can be reversed by passing `Array` where first element is a text and second is a flag that specifies whether condition must be negated or not, for example, `'Qwerty'` can be used to assert that text of fragment's selector is equal 'Qwerty' and `['Qwerty', true]'` can be used to assert that text of `selector` isn't equal 'Qwerty'
   * @param {*} [requirements.textContent] Allows to assert that fragment selector's text content equal or matches specified value. When value is not regular expression it would be coerced to string as `value + ''`. To negate assertion condition pass `Array` with text content and boolean flag, see `requirements.text` for examples
   * @param {Options|Object} [options] Options
   * @param {Selector} [options.selector=this.selector] TestCafe selector to assert on. Can be anything that TestCafe `Selector` accepts as initializer, fragment's selector by default
   * @return {Promise<void>}
   */
  async expectExistsAndConformsRequirements(requirements, options) {
    const opts = new Options(options, {
      defaults: {
        selector: this.selector
      }
    });

    let sel = opts.selector;

    if (options && options.selector) {
      sel = Selector(sel);
      await t
        .expect(sel.count)
        .eql(1, "'options.selector' must return one DOM node but it doesn't");
    }
    else {
      await this.expectIsExist();
    }

    if (_.isNil(requirements)) {
      return;
    }

    if (!_.isPlainObject(requirements)) {
      throw new TypeError(
        `'requirements' argument must be a nil or a plain object but it is ` +
        `${typeOf(requirements)} (${requirements})`
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

        let errMsg = `Expected '${this.displayName}' fragment's selector to `;
        sel = selector.filterByAttribute(sel, [attrName, attrValue], { isNot });

        if (isNot) {
          errMsg += 'not ';
        }

        errMsg += `return DOM element with attribute '${attrName}'`;

        if (!_.isNil(attrValue)) {
          errMsg += ` valued '${attrValue}'`;
        }

        await t.expect(sel.count).eql(1, errMsg);
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

        await this[isNot ? 'expectHasNoBemModifier' : 'expectHasBemModifier'](mod);
      }
    }

    if (requirements.tagName) {
      if (!utils.isNonBlankString(requirements.tagName)) {
        throw new TypeError(
          `'requirements.tagName' argument must be a nil or a non-blank ` +
          `string but it is ${typeOf(requirements.tagName)} ` +
          `(${requirements.tagName})`
        );
      }

      await t
        .expect(sel.tagName)
        .eql(requirements.tagName);
    }

    if (_.has(requirements, 'text')) {
      let expectedValue = requirements.text;
      let isNot = false;

      if (_.isArray(requirements.text)) {
        expectedValue = requirements.text[0];
        isNot = !!requirements.text[1];
      }

      // XXX TestCafe, currently, always converts `withText` argument to
      // `RegExp` and so we must use workaround to use string equality.
      // await t.expect(selector.withText(requirements.text).count).eql(1);
      const expectedValueAsRegExp = _.isRegExp(expectedValue) ?
        expectedValue : new RegExp(`^${escapeStringRegexp(expectedValue + '')}$`);

      await t
        .expect(sel.withText(expectedValueAsRegExp).count)
        .eql(
          isNot ? 0 : 1,
          (
            `'${this.displayName}' fragment's selector text must ` +
            `${isNot ? 'not ' : ''}match ${expectedValueAsRegExp}`
          )
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
        await t.expect(sel.textContent)[assertion](expectedValue);
      }
      else {
        const assertion = isNot ? 'notEql' : 'eql';
        await t.expect(sel.textContent)[assertion](expectedValue + '');
      }
    }
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
   * Asserts that fragment has list of something fragments, named
   * `somethingName`. Optionally, asserts that this fragment has only
   * specified something fragments, and, also optionally, asserts that
   * something fragments found in this fragment in same order as in
   * `somethingLocatorAndOptions`.
   *
   * @param {String} somethingName Name of something. For example, in Dialog it can be an Action
   * @param {Array} somethingLocatorAndOptions An array where each element is an array of two elements - something's spec and something's opts. See `spec` and `opts` arguments of something's constructor
   * @param {Options|Object} [options] Options
   * @param {Boolean} [options.equalityCheck] Same as in `#expectHasSomething`. Usable only when assertion on placement order requested (see `options.sameOrder`)
   * @param {Function|String} [options.expectHasSomething] Allows to handle expectation of has something in custom way. It can be a function (no `this` binding provided) or a name (string) of fragment's method. By default it's a `#expectHasSomething()` that would receive `somethingName`
   * @param {Function|String} [options.expectSomethingsCountIs] When it's a function then it would be called with number of something fragments to assert that count is valid, note that no `this` binding provided. When it's a string then it must be a method name of this fragment that would be called with number of something fragments to assert that count is valid. When nil then this fragment's method named `#expectSomethingsCountIs`, where 'Something' part equal to upercased version of `somethingName` argument, would be used
   * @param {Function|String} [options.getSomething] Same as in `#expectHasSomething`
   * @param {Boolean} [options.only=false] When `true` fragment must have only specified something fragments to pass assertion
   * @param {Boolean} [options.sameOrder=false] When `true` something fragments must be found in fragment in same order as in `somethingSpecificationsAndOptions` to pass assertion. Usable only when `options.only` is truthy
   * @returns {Promise<Array>} Found somethings.
   * @throws {AssertionError} When any of expectations failed.
   * @throws {TypeError} When any of arguments aren't valid.
   */
  async expectHasSomethings(somethingName, somethingLocatorAndOptions, options) {
    if (!utils.isNonBlankString(somethingName)) {
      throw new TypeError(
        `'${this.displayName}#expectHasSomethings()': 'somethingName' ` +
        `argument must be a non-blank string but it is ` +
        `${typeOf(somethingName)} (${somethingName})`
      );
    }

    const len = somethingLocatorAndOptions.length;

    for (let i = 0; i < len; i++) {
      const somethingLocatorAndOptionsItem = somethingLocatorAndOptions[i];

      if (!_.isArray(somethingLocatorAndOptionsItem)) {
        throw new TypeError(
          `'${this.displayName}#expectHasSomethings()': each element of ` +
          `'somethingLocatorAndOptions' argument must be an array but it is ` +
          `${typeOf(somethingLocatorAndOptionsItem)} ` +
          `(${somethingLocatorAndOptionsItem})`
        );
      }
    }

    const {
      equalityCheck,
      expectHasSomething,
      expectSomethingsCountIs,
      getSomething,
      only,
      sameOrder
    } = new Options(options, {
      validator: ({ expectHasSomething, expectSomethingsCountIs }) => {
        if (!(_.isNil(expectSomethingsCountIs) ||
            _.isFunction(expectSomethingsCountIs) ||
            utils.isNonBlankString(expectSomethingsCountIs))) {
          return (
            `'expectSomethingsCountIs' option must be a function or a ` +
            `non-blank string but it is ` +
            `${typeOf(expectSomethingsCountIs)} (${expectSomethingsCountIs})`
          );
        }
        else if (!(_.isNil(expectHasSomething) ||
            _.isFunction(expectHasSomething) ||
            utils.isNonBlankString(expectHasSomething))) {
          return (
            `'expectHasSomething' option must be a function or a non-blank ` +
            `string but it is ${typeOf(expectHasSomething)} ` +
            `(${expectHasSomething})`
          );
        }
        else {
          return null;
        }
      },
      defaults: {
        only: false,
        sameOrder: false
      }
    });

    if (only === true) {

      // When `options.expectSomethingsCountIs` is a string, fragment must have
      // correspondingly named method.
      if (_.isString(expectSomethingsCountIs) &&
        !_.isFunction(this[expectSomethingsCountIs])) {
        throw new TypeError(
          `'${this.displayName}' fragment must have ` +
          `'${expectSomethingsCountIs}' method, specified in ` +
          `'expectSomethingsCountIs' option, but it doesn't`
        );
      }

      const expectSomethingsCountIsMethodName =
        `expect${ucFirst(somethingName)}sCountIs`;

      // When `options.expectSomethingsCountIs` not provided, fragment must
      // have method named using something's name, e.g.
      // 'Dialog#expectActionsCountIs`.
      if (_.isNil(expectSomethingsCountIs) &&
        !_.isFunction(this[expectSomethingsCountIsMethodName])) {
        throw new TypeError(
          `'${this.displayName}' fragment must have ` +
          `'${expectSomethingsCountIsMethodName}' method or ` +
          `'expectSomethingsCountIs' option set but it doesn't`
        );
      }

      if (_.isFunction(expectSomethingsCountIs)) {
        await expectSomethingsCountIs(len);
      }
      else {
        const expectFn = (
          expectSomethingsCountIs ||
          expectSomethingsCountIsMethodName
        );
        await this[expectFn](len);
      }
    }

    // When `options.expectHasSomething` is a string, fragment must have
    // correspondingly named method.
    if (_.isString(expectHasSomething) &&
      !_.isFunction(this[expectHasSomething])) {
      throw new TypeError(
        `'${this.displayName}' fragment must have '${expectHasSomething}' ` +
        `method, specified in 'expectHasSomething' option, but it doesn't`
      );
    }

    const expectHasSomethingMethodName = `expectHas${ucFirst(somethingName)}`;

    // When `options.expectHasSomething` not provided, fragment must have
    // method named using something's name, e.g. 'Dialog#expectHasAction`.
    if (_.isNil(expectHasSomething) &&
      !_.isFunction(this[expectHasSomethingMethodName])) {
      throw new TypeError(
        `'${this.displayName}' fragment must have ` +
        `'${expectHasSomethingMethodName}' method or 'expectHasSomething' ` +
        `option set but it doesn't`
      );
    }

    const somethings = [];

    for (let i = 0; i < len; i++) {
      const somethingLocatorAndOptionsItem = somethingLocatorAndOptions[i];
      const expectHasSomethingOptions = {
        equalityCheck,
        getSomething,
        idx: (only === true && sameOrder === true) ? i : void(0)
      };

      let something;

      if (_.isFunction(expectHasSomething)) {
        something = await expectHasSomething(
          somethingLocatorAndOptionsItem[0],
          somethingLocatorAndOptionsItem[1],
          expectHasSomethingOptions
        );
      }
      else if (this[expectHasSomething]) {
        something = await this[expectHasSomething](
          somethingLocatorAndOptionsItem[0],
          somethingLocatorAndOptionsItem[1],
          expectHasSomethingOptions
        );
      }
      else {
        something = await this[expectHasSomethingMethodName](
          somethingLocatorAndOptionsItem[0],
          somethingLocatorAndOptionsItem[1],
          expectHasSomethingOptions
        );
      }

      somethings.push(something);
    }

    return somethings;
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
   * Asserts that fragment's current state is equal state specified by
   * `stateOrId`.
   *
   * @param {String|Object} stateOrId When it's an object than fragment's current state must be deeply equal it to pass assertion, otherwise it must be a string - id of persisted state to which fragment's current state must be deeply equal to pass assertion
   * @param {Options|Object} [options] Options. Same as in `#getState()` plus following ones
   * @param {Boolean} [options.debug=false] When truthy then detailed diff would be logged to console on assertion failure
   * @return {Promise<void>}
   * @throws {TypeError} When arguments aren't valid.
   */
  async expectStateIs(stateOrId, options) {
    if (!(_.isPlainObject(stateOrId) || utils.isNonBlankString(stateOrId))) {
      throw new TypeError(
        `'stateOrId' argument must be a plain object or a non-blank string ` +
        `but it is ${typeOf(stateOrId)} (${stateOrId})`
      );
    }

    const stateToMatch = _.isPlainObject(stateOrId) ?
      stateOrId : this.getPersistedState(stateOrId);

    if (!_.isPlainObject(stateToMatch)) {
      throw new TypeError(
        `State to match must be a plain object but it is ` +
        `${typeOf(stateToMatch)} (${stateToMatch})`
      );
    }

    const opts = new Options(options, {
      defaults: {
        debug: false
      }
    });
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
   * Returns fragment's state that was persisted earlier under specified `id`.
   *
   * @param {String} id Id of state that was persisted earlier
   * @returns {Object|null} Persisted state.
   * @throws {TypeError} When argument isn't valid or persisted state identified by `id` not exists.
   */
  getPersistedState(id) {
    if (!utils.isNonBlankString(id)) {
      throw new TypeError(
        `'id' argument must be a non-blank string but it is ${typeOf(id)} ` +
        `(${id})`
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

  /**
   * Returns fragment's state (all parts).
   *
   * @param {Options|Object} [options] Options
   * @param {String[]} [options.omitParts] Only parts of state that not found in that list would be in returned state. Applied after `options.onlyParts`
   * @param {String[]} [options.onlyParts] Only parts of state that found in that list would be in returned state. Applied before `options.omitParts`
   * @return {Promise<Object>}
   * @throws {TypeError} When arguments aren't valid.
   */
  async getState(options) {
    let statePartList = this.getStateParts();

    if (!_.isArray(statePartList)) {
      throw new Error(
        `'${this.displayName}#getStateParts()' must return an array of ` +
        `state parts but it return ${typeOf(statePartList)} (${statePartList})`
      );
    }
    else {
      statePartList = _.uniq(statePartList);
    }

    const { omitParts, onlyParts, waitBefore } = new Options(options);

    if (waitBefore) {
      await t.wait(waitBefore);
    }

    if (!(_.isNil(omitParts) ||
        (_.isArray(omitParts) && _.every(omitParts, utils.isNonBlankString)))) {
      throw new TypeError(
        `'omitParts' option must be a nil or array of non-blank strings but ` +
        `it is ${typeOf(omitParts)} (${omitParts})`
      );
    }

    if (!(_.isNil(onlyParts) ||
        (_.isArray(onlyParts) && _.every(onlyParts, utils.isNonBlankString)))) {
      throw new TypeError(
        `'onlyParts' option must be a nil or array of non-blank strings but ` +
        `it is ${typeOf(onlyParts)} (${onlyParts})`
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
              `'${this.displayName}#${partOfStateGetterName}' must be a ` +
              `function but it is ${this[partOfStateGetterName]}`
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
   * @param {Options|Object} [options] Options
   * @param {Boolean} [options.onlyWritable=false] When truthy then only writable state parts would be returned
   * @return {Array<String>} List of parts of fragment's state.
   */
  getStateParts(options) {
    return [];
  }

  /**
   * Persists fragment's state under specified `id` and returns it. When
   * optional `state` argument is `nil` then fragment's current state would be
   * persisted.
   *
   * @param {String} id Id that would be used to identify persisted state
   * @param {Object} [state] State that must be persisted. Pass `nil` to persist fragment's current state
   * @param {Options|Object} [options] Options. Same as for `#getState()`
   * @return {Promise<Object>} State that was persisted.
   * @throws {TypeError} When arguments aren't valid.
   */
  async persistState(id, state, options) {
    if (!utils.isNonBlankString(id)) {
      throw new TypeError(
        `'id' argument must be a non-blank string but it is ${typeOf(id)} ` +
        `(${id})`
      );
    }

    if (_.isNil(state)) {
      state = await this.getState(options);
    }
    else if (!_.isPlainObject(state)) {
      throw new TypeError(
        `'state' argument must be a nil or a plain object but it is ` +
        `${typeOf(state)} (${state})`
      );
    }

    return this._persistedStates[id] = state;
  }

  /**
   * Sets fragment's state to one that was persisted earlier and identified by
   * passed `id`.
   *
   * @param {String} id Id of state that was persisted earlier
   * @return {Promise<Object>} Fragment's state after restore state operation is done.
   * @throws {TypeError} When arguments aren't valid.
   */
  async restoreState(id) {
    if (!utils.isNonBlankString(id)) {
      throw new TypeError(
        `'id' argument must be a non-blank string but it is ${typeOf(id)} ` +
        `(${id})`
      );
    }

    const state = this._persistedStates && this._persistedStates[id];

    if (!_.isPlainObject(state)) {
      throw new TypeError(
        `State, persisted under id '${id}', is not valid - it must be a ` +
        `plain object but it is ${typeOf(state)} (${state})`
      );
    }

    return this.setState(state);
  }

  /**
   * Sets state of fragment.
   *
   * @param {Object|undefined} newState New state for fragment. Passing `undefined` means "Do nothing and just return current state". Values for read-only parts silently ignored
   * @param {Options|Object} [options] Options
   * @return {Promise<Object>} Fragment's state, that have only updated (writable) parts, after set state operation is done.
   * @throws {TypeError} When arguments aren't valid.
   */
  async setState(newState, options) {
    if (_.isUndefined(newState)) {
      return this.getState(options);
    }

    if (!_.isPlainObject(newState)) {
      throw new TypeError(
        `'newState' argument must be a plain object but it is ` +
        `${typeOf(newState)} (${newState})`
      );
    }

    let statePartList = this.getStateParts({ onlyWritable: true });
    const state = {};

    if (!_.isArray(statePartList)) {
      throw new Error(
        `'${this.displayName}#getStateParts()' must return an array of ` +
        `state parts but it return ${typeOf(statePartList)} (${statePartList})`
      );
    }
    else {
      statePartList = _.uniq(statePartList);
    }

    for (let k of statePartList) {
      const partOfStateSetterName = `set${pascalCase(k)}PartOfState`;

      if (!_.isFunction(this[partOfStateSetterName])) {
        throw new TypeError(
          `'${this.displayName}#${partOfStateSetterName}' must be a ` +
          `function but it is ${typeOf(this[partOfStateSetterName])} ` +
          `(${this[partOfStateSetterName]})`
        );
      }

      state[k] = await this[partOfStateSetterName](newState[k], options);
    }

    return state;
  }

  //  TODO Improve docs - add names of generated methods, describe their
  //       signatures
  /**
   * Returns new fragment class that is a descendant of base fragment class
   * and, additionally, have methods for part of state. See description of
   * available options for more about additionally generated methods.
   *
   * @static
   * @param {Fragment} BaseFragment Fragment class to extend from
   * @param {Array|String} statePartName Name of state part. When it's a string then it would be used as state part name and also as name of attribute/BEM modifier that holds that part in fragment's selector DOM element. When names differ, for example a case of data attribute, an array of two non-blank strings - a state part name and attribute/BEM modifier name, can be passed
   * @param {Options|Object} [options] Options
   * @param {String} [options.antonym] Name of other side of state part. For example, for 'Disabled' part of state other side would be 'Enabled'. Used to generate additional assertion methods, but only when `options.isBoolean` is truthy and `options.isBooleanHas` is falsey. For example, when `options.antonym` is 'Enabled' `expectIsEnabled` and `expectIsNotEnabled` methods would be generated
   * @param {Boolean} [options.isBoolean=true] When truthy additional assertion methods would be generated. For example, when name is 'Disabled' and `options.isBoolean` is truthy `expectIsDisabled` and `expectIsNotDisabled` methods would be generated
   * @param {Boolean} [options.isBooleanHas=false] When truthy then assertion methods would be named with 'Has' instead of 'Is'. For example, `expectHasSomething` and `expectHasNoSomething`
   * @param {String} [options.src='bemModifier'] Where state part holds it's value. Must be one of 'attribute', or 'bemModifier'
   * @param {Boolean|String} [options.waitTil] Same as `options.waitUntil` but reversed - allows to wait til attribute/BEM modifier exists (boolean) or have specified value. When value is a boolean then state part name would be used to generate name of method, when it's a string then it would be used in method name generation. For example, for part of state named 'Fetched' they would be `waitTilFetched` in case of boolean and `waitTilSomething` in case of string 'something'
   * @param {Boolean|String} [options.waitUntil] When truthy and `options.isBoolean` also truthy fragment's class would have `waitUntil[NameOfStatePart]` method, that is a convenience alias for `expectIs[NameOfStatePart]` method, that can be used to wait until fragment's part of state doesn't have specified value. For example, for part of state named 'Fetched' we can wait if fragment's state part doesn't have specified value
   * @returns {Fragment}
   */
  static withPartOfStateMixin(BaseFragment, statePartName, options) {
    if (!BaseFragment.isFragment) {
      throw new TypeError(
        `'BaseFragmentClass' argument must be a 'Fragment' class or its ` +
        `descendant`
      );
    }

    let _attrName;
    let _partName = statePartName;

    if (_.isArray(statePartName)) {
      [_partName, _attrName] = statePartName;
    }

    if (!utils.isNonBlankString(_partName)) {
      throw new TypeError(
        `Name of state part must be a non-blank string but it is ` +
        `${typeOf(_partName)} (${_partName})`
      );
    }

    if (!(_.isNil(_attrName) || utils.isNonBlankString(_attrName))) {
      throw new TypeError(
        `Attribute/BEM modifier name that holds value of part of state ` +
        `must be a non-blank string but it is ${typeOf(_attrName)} ` +
        `(${_attrName})`
      );
    }

    const {
      antonym,
      isBoolean,
      isBooleanHas,
      src,
      waitTil,
      waitUntil
    } = new Options(options, {
      defaults: {
        isBoolean: true,
        isBooleanHas: false,
        src: 'bemModifier'
      },
      validator: ({ src }) => {
        let msg = null;

        if (!_.includes(['attribute', 'bemModifier'], src)) {
          msg =
            "'options.src' argument must be a nil or one of 'attribute' " +
            `or 'bemModifier' but it is ${typeOf(src)} (${src})`;
        }

        return msg;
      }
    });

    const attrName = _attrName || _partName;
    const partName = pascalCase(_partName);

    /**
     * @extends {Fragment}
     */
    class MixedFragment extends BaseFragment {

      /**
       * Obtains value of state's part and returns it.
       *
       * @param {Options|Object} [options] - Options
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
       * @param {*} value Doesn't matter
       * @param {Options|Object} [options] Options
       * @return {Promise<*>} Current value of part of fragment's state after set state operation is done.
       */
      async [`set${partName}PartOfState`](value, options) {
        return this[`get${partName}PartOfState`](options);
      }

      /**
       * Asserts that fragment's state part is equal specified value.
       *
       * @param {*} value Part of state must match that value to pass assertion
       * @param {Options|Object} [options] Options
       * @param {Boolean} [options.isNot=false] When truthy assertion would be inverted
       * @return {Promise<void>}
       */
      async [`expect${partName}PartOfStateIs`](value, options) {
        const opts = new Options(options, {
          defaults: {
            isNot: false
          }
        });
        const { isNot } = opts;

        if (isBoolean) {
          value = !!value;
        }

        if (src === 'bemModifier') {
          if (isBoolean) {
            await this.expectExistsAndConformsRequirements({
              bemModifiers: [
                [
                  [attrName, null], (isNot ? value : !value)
                ]
              ]
            });
          }
          else {
            await this.expectExistsAndConformsRequirements({
              bemModifiers: [
                [
                  [attrName, (value + '')], isNot
                ] // TODO Remove casting to string (#5)
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
          value: async function() {
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
          value: async function() {
            await this[`expect${partName}PartOfStateIs`](false);
          }
        }
      });

      // Handle `options.antonym`.
      if (!(_.isNil(antonym) || utils.isNonBlankString(antonym))) {
        throw new TypeError(
          `'options.antonym' argument must be a non-blank string but it is ` +
          `${typeOf(antonym)} (${antonym})`
        );
      }

      if (antonym && !isBooleanHas) {
        const antonymPartName = pascalCase(antonym);

        Object.defineProperties(MixedFragment.prototype, {
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
      if (!(_.isNil(waitTil) || _.isBoolean(waitTil) ||
          utils.isNonBlankString(waitTil))) {
        throw new TypeError(
          `'options.waitTil' argument must be a boolean or a non-blank ` +
          `string but it is ${typeOf(waitTil)} (${waitTil})`
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
           * @param {Options|Object} [options] Options
           * @param {number} [options.wait] Number of milliseconds to wait before assertion
           * @return {Promise<void>}
           */
          value: async function(options) {
            const opts = new Options(options);
            const { wait } = opts;

            if (wait) {
              await t.wait(wait);
            }

            await this[`expect${partName}PartOfStateIs`](false);
          }
        });
      }

      // Handle `options.waitUntil`.
      if (!(_.isNil(waitUntil) || _.isBoolean(waitUntil) ||
          utils.isNonBlankString(waitUntil))) {
        throw new TypeError(
          `'options.waitUntil' argument must be a boolean or a non-blank ` +
          `string but it is ${typeOf(waitUntil)} (${waitUntil})`
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
           * @param {Options|Object} [options] Options
           * @param {Number} [options.wait] Number of milliseconds to wait before assertion execution
           * @return {Promise<void>}
           */
          value: async function(options) {
            const opts = new Options(options);
            const { wait } = opts;

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
          value: async function(value) {
            await this[`expect${partName}PartOfStateIs`](value, {
              isNot: false
            });
          }
        },
        [`expect${partName}IsNot`]: {
          configurable: true,
          enumerable: false,
          writable: true,
          /**
           * Asserts that fragment's state part value is not equal to `value`.
           */
          value: async function(value) {
            await this[`expect${partName}PartOfStateIs`](value, {
              isNot: true
            });
          }
        }
      });

    }

    return MixedFragment;
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
