import _ from 'lodash';
import typeOf from 'typeof--'
import { Selector } from 'testcafe';

import bem from "./bem";
import Options from "./options";
import utils from './utils';

const _baseFragmentMarker = 'BASE_FRAGMENT';
const { BemBase } = bem;

class Fragment {

  /**
   * Creates fragment.
   * 
   * @param {Object|Function|Array} selectorInitializer 
   * @param {Options|Object} options 
   */
  constructor(selectorInitializer, options) {
    const opts = new Options(options, {
      defaults: {
        parent: 'body'
      }
    });

    // TODO Check `selectorInitializer` is supported - function, map or list of
    //      functions and/or maps.
    /**
     * Value used to initialize fragment's selector.
     * 
     * @type {Array<*>}
     */
    this.selectorInitializer = [];

    if (_.isArray(selectorInitializer)) {
      this.selectorInitializer = selectorInitializer;
    }
    else if (!_.isNil(selectorInitializer)) {
      this.selectorInitializer = [selectorInitializer];
    }

    // Fragment must have BEM base. It can be provided as property of
    // fragment's class or ancestor fragment's class, and can be an instance of
    // `BemBase` or a string.
    const chosenBemBase = this.constructor.bemBase || super.bemBase;
    const chosenBemBaseAsStr = chosenBemBase + '';

    if (!utils.isNonEmptyString(chosenBemBaseAsStr) || chosenBemBaseAsStr === _baseFragmentMarker) {
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
    const parentSelector = (opts.parent instanceof Fragment) ?
      opts.parent.selector : Selector(opts.parent);

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
    for (const transformation of this.selectorInitializer) {
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
   * Used to allow custom selector transformation to be added derived fragment
   * class when required.
   * 
   * @private
   * @param {*} transformation 
   * @returns {Selector}
   */
  _transformSelector(transformation) {
    if (this._selectorInitialized) {
      throw new Error(
        `${this.displayName}#transformSelector(): can't transform ` +
        'initialized selector'
      );
    }

    const sel = this.transformSelector(
      transformation,
      this._selector,
      this.bemBase
    );

    if (sel) {
      return sel;
    }
    else {
      if (this.bemBase + '' === _baseFragmentMarker) {
        throw new Error(
          `${this.displayName}: dont't know how to apply selector ` +
          `transformation ${transformation}`
        );
      }

      return super.transformSelector(
        transformation,
        this._selector,
        this.bemBase
      );
    }
  }

  /**
   * Transforms fragment's selector.
   * 
   * NOTE Don't use `this.selector` here!!!
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

    const unsupportedTransformations = _.filter(
      requestedTransformations,
      (v) => !_.includes(['cid', 'cns', 'idx'], v)
    );

    if (!_.isEmpty(unsupportedTransformations)) {
      throw new TypeError(
        `${this.displayName}#transformSelector(): unsupported ` +
        `transformation(-s) '${unsupportedTransformations}'`
      );
    }

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
