import _ from 'lodash';
import {Selector} from 'testcafe';
import typeOf from 'typeof--'

import BemBase from "./bem-base";
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
   * @param {function} [spec.handler] - Used to implement cases when selector for fragment can't be obtained using other specs. Accepts `spec` object and BEM base as parameters. You must handle `cns` and `parent` specs (if any) yourself! So, when possible, use `custom` spec as it handles `cns` and `parent` specs for you
   * @param {number} [spec.idx] - Component index. Would be scoped into `parent` spec. Respects `cns` spec (if any). Must be an integer greater or equal zero
   * @param {*} [spec.parent='body'] - Parent scope for fragment's selector. Can be anything that TestCafe `Selector` accepts
   * @param {*} [spec.selector] - Anything that TestCafe `Selector` accepts. When possible, use `custom` spec as it handles `cns` and `parent` specs for you
   * @param {?Options} [opts] - Options
   * @param {string} [opts.bemBase] - BEM base of component, may be omitted when `handler` or `selector` spec is used
   * @param {selectorCustomizerFn} [opts.selectorCustomizer] - Selector customizer. Used as last resort to augment created fragment's selector somehow. Accepts created fragment selector, `spec` and `opts` (with defaults) arguments passed to fragment's class constructor and must return TestCafe selector that would be used as new selector of fragment
   * @throws {TypeError} When constructor arguments are not valid.
   */
  constructor(spec, opts) {
    if (!(_.isNil(spec) || _.isPlainObject(spec))) {
      throw new TypeError(
        `${this.displayName}.constructor(): 'spec' argument must be a nil or a plain object but it is
         ${typeOf(spec)} (${spec})`
      );
    }

    // Report when spec value is not of supported type:
    // * `cid` - can be omitted, otherwise it must be non-empty string.
    if (spec && !_.isNil(spec.cid) && !utils.isNonEmptyString(spec.cid)) {
      throw new TypeError(
        `${this.displayName}.constructor(): 'spec.cid' argument must be nil or a non-empty string but it is
         ${typeOf(spec.cid)} (${spec.cid})`
      );
    }

    /**
     * Parent selector for new fragment's selector.
     */
    let parentSelector = null;

    /**
     * Would be used to create new fragment's selector.
     */
    let selectorInitializer = null;

    // We need a parent for new fragment's selector and to choose it we must
    // handle three possible cases:
    // 1. Parent is specified and it's a fragment - we use that fragment's
    // selector as parent for new fragment's selector.
    // 2. Parent is specified and it isn't a fragment - we use it as
    // initializer to create parent selector for new fragment's selector.
    // 3. No parent specified - we use 'body' as initializer to create parent
    // selector for new fragment's selector.
    if (spec && spec.parent instanceof Fragment) {
      parentSelector = spec.parent.selector;
    }
    else {
      parentSelector = Selector((spec && spec.parent) || 'body');
    }

    // We must check that `opts` argument is valid - it can be a nil or of type `Options`.
    if (!(_.isNil(opts) || utils.isOptions(opts))) {
      throw new TypeError(
        `${this.displayName}.constructor(): 'opts' argument must be a nil or of type Options but it is
         ${typeOf(opts)} (${opts})`
      );
    }

    // We allow BEM base for new fragment to be set explicitly as
    // `opts.bemBase` or implicitly as `bemBase` property of fragment's class.
    opts = _.defaults(opts, {bemBase: this.constructor.bemBase});

    // Just a shortcut to save some typing.
    const bemBase = new BemBase(opts.bemBase);

    /**
     * Fragment's BEM base.
     *
     * @type {BemBase}
     * @private
     */
    this._bemBase = bemBase;

    /**
     * `opts` argument that was used to create this fragment, all default
     * values are already in place.
     *
     * @protected
     */
    this._opts = opts;

    /**
     * `spec` argument that was used to create this instance of fragment.
     *
     * @protected
     */
    this._spec = spec;

    // New fragment's selector is build using provided `specs` and `opts`, and
    // so we must handle all possible cases:
    // 1. When 'nil' spec (`spec` is `null` or is `undefined`) is provided we
    // suppose that new fragment's selector must be created using only provided
    // BEM base. This means new fragment's selector would see all fragments
    // that have specified BEM base and found in specified parent. In that case
    // 'parent' spec is respected.
    if (_.isNil(spec)) {
      selectorInitializer = parentSelector.find(`.${bemBase}`);
    }
    // DEPRECATED
    // 2. When 'selector' spec is found we do nothing and just use it as
    // selector for new fragment. Seems like that uses case isn't used at all
    // and maybe would be removed in future. In that case 'parent' spec is
    // ignored.
    // else if (spec.selector) {
    //   selectorInitializer = Selector(spec.selector);
    // }
    // DEPRECATED
    // 3. To allow fragments, that were derived from base fragment, to have
    // their own specs we provide 'handler' spec - a function that accepts
    // `spec` argument passed to constructor and BEM base for new fragment and
    // must return anything that TestCafe can use as initializer for selector.
    // In that case 'parent' spec is ignored. Looks like it also not used any
    // more as it was superseded by 'custom' spec, but it still may have its
    // usages.
    // else if (spec.handler) {
    //   if (!_.isFunction(spec.handler)) {
    //     throw new TypeError(
    //       `${this.displayName}.constructor(): 'handler' spec must be a function, but
    //        ${typeOf(spec.handler)} (${spec.handler}) is given`
    //     );
    //   }
    //
    //   // TODO Maybe better to pass `opts` with defaults instead of just BEM base?
    //   selectorInitializer = spec.handler(
    //     _.omit(spec, 'handler'),
    //     bemBase
    //   );
    // }
    // 4. We have number of specs that are built-in into base fragment class
    // but their usage requires that fragment have BEM base:
    else {
      if (!bemBase.isValid()) {
        throw new TypeError(
          `${this.displayName}.constructor(): Built-in specs requires BEM base to be valid but it doesn't (${bemBase})`
        );
      }

      // All built-in spec respects 'parent' spec!
      selectorInitializer = parentSelector.find(`.${bemBase}`);

      // 4.1 'cns' (component namespace) often used to build one widget on top
      // of other widget that provides generic functionality and that spec is
      // for such cases. It respects 'parent' spec.
      if (spec.cns) {
        if (!utils.isNonEmptyString(spec.cns)) {
          throw new TypeError(
            `${this.displayName}.constructor(): Built-in 'cns' spec must be a non-empty string but it is
             ${typeOf(spec.cns)} (${spec.cns})`
          );
        }

        selectorInitializer = selectorInitializer.filter(`.${bemBase.setMod(['cns', spec.cns], {fresh: true})}`);
      }

      // Currently, all following built-in specs is not composable, e.g. you
      // can't choose fragment by 'cid' and 'custom' spec - 'custom' spec wins.

      // 4.2 'custom' spec is used to allow derived fragments to have their own
      // built-in specs. It respects 'cns' and 'parent' specs.
      if (spec.custom) {
        if (!_.isFunction(spec.custom)) {
          throw new TypeError(
            `${this.displayName}.constructor(): Built-in 'custom' spec must be a function but it is
             ${typeOf(spec.custom)} (${spec.custom})`
          );
        }

        selectorInitializer = spec.custom.call(this, selectorInitializer, spec, opts);
      }
      // 4.3 'cid' (component id) often used to get specific fragment. It
      // respects 'cns' and 'parent' specs.
      else if (spec.cid) {
        if (!utils.isNonEmptyString(spec.cid)) {
          throw new TypeError(
            `${this.displayName}.constructor(): Built-in 'cid' spec must be a non-empty string but it is
             ${typeOf(spec.cid)} (${spec.cid})`
          );
        }

        selectorInitializer = selectorInitializer.filter(`.${bemBase.setMod(['cid', spec.cid], {fresh: true})}`);
      }
      // 4.4 'idx' often used to get specific fragment by its index in parent.
      // It respects 'cns' and 'parent' specs.
      else if (_.has(spec, 'idx')) {
        if (!(_.isInteger(spec.idx) && spec.idx >= 0)) {
          throw new TypeError(
            `${this.displayName}.constructor(): Built-in 'idx' spec must be an integer greater or equal zero but it is
             ${typeOf(spec.idx)} (${spec.idx})`
          );
        }

        selectorInitializer = selectorInitializer.nth(spec.idx);
      }
      // Unknown spec throws error to simplify debugging.
      else {
        const unknownSpecs = _.remove(_.keys(spec), it => !_.includes(['cns', 'parent'], it));

        if (!_.isEmpty(unknownSpecs)) {
          throw new TypeError(`${this.displayName}.constructor(): Not supported spec(-s) given: ${unknownSpecs}`);
        }
      }
    }

    /**
     * Store for persisted states.
     *
     * @type {object}
     * @private
     */
    this._persistedStates = {};

    /**
     * TestCafe selector for fragment's DOM element.
     *
     * @type {Selector}
     * @todo Make it private plus getter.
     */
    this.selector = Selector(selectorInitializer);

    // We allow to use function to customize fragment's selector when required.
    if (opts && opts.selectorCustomizer) {
      if (!_.isFunction(opts.selectorCustomizer)) {
        throw new TypeError(
          `${this.displayName}.constructor(): 'opts.selectorCustomizer' must be a function but it is
           ${typeOf(opts.selectorCustomizer)} (${opts.selectorCustomizer})`
        );
      }

      this.selector = opts.selectorCustomizer(this.selector, spec, opts);
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
   * Creates new instance of `BEM` class using fragment's `bemBase` as its
   * initializer.
   *
   * @returns {BemBase} Instance of `BEM` class.
   */
  get bem() {
    return new BemBase(this.bemBase);
  }

  /**
   * Fragment's block BEM base.
   *
   * @returns {BemBase}
   * @throws {TypeError} When fragment was created without BEM base.
   */
  get bemBase() {
    if (this._bemBase) {
      return this._bemBase;
    }

    const bemBase = this._opts.bemBase || this.constructor.bemBase || super.bemBase;
    const bemBaseAsStr = bemBase + '';

    if (!utils.isNonEmptyString(bemBaseAsStr) || bemBaseAsStr === 'BASE_FRAGMENT') {
      throw new TypeError(
        `${this.displayName} fragment was created without BEM base`
      );
    }

    return this._bemBase = new BemBase(bemBase);
  }

  /**
   * Display name of fragment.
   *
   * @return {string}
   */
  get displayName() {
    return (this.constructor.displayName || super.displayName);
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