import is from "@sindresorhus/is";
import { Selector, t } from "testcafe";
import { BemBase } from "./bem";

export type SelectorTransformation =
  | SelectorTransformationFn
  | SelectorTransformationAlias;

export type SelectorTransformationFn = (s: Selector, b: BemBase) => Selector;
export type SelectorTransformationAlias = {};

export abstract class AbstractPageObject {
  /**
   * Page object's BEM base -- used to map page object to DOM element with
   * specific CSS class with BEM-like naming.
   */
  static bemBase = "";

  /**
   * Page object's display name -- used mostly for debugging purposes.
   */
  static displayName = "AbstractPageObject";

  /**
   * Holds page object class's BEM base as instance of `BemBase` class. We can
   * work with `AbstractPageObject.bemBase` directly, but using helper class is
   * more convenient.
   */
  protected _bemBase: BemBase;

  /**
   * Store for persisted states.
   */
  protected _persistedStates = {};

  /**
   * Page object's selector scoped into `options.parent`.
   */
  protected _selector: Selector;

  /**
   * Whether page object's selector is initialized or not.
   */
  protected _selectorInitialized = false;

  /**
   * List of transformations that must be applied to selector for it to return
   * DOM element used as root of page object.
   */
  private readonly _selectorTransformations: SelectorTransformation[];

  constructor(
    locator?: SelectorTransformation | SelectorTransformation[],
    options?: { parent?: any }
  ) {
    options = options || {};
    if (!options.parent) {
      options.parent = "body";
    }

    if (is.array(locator)) {
      this._selectorTransformations = is.array(locator) ? locator : [locator];
    }

    this._bemBase = new BemBase(
      (<typeof AbstractPageObject>this.constructor).bemBase,
      { frozen: true }
    );

    // When choosing parent for page object's selector there are following
    // options:
    // 1. Parent is specified and it's a page object -- use that page
    // object's selector as parent selector.
    // 2. Parent is specified and it isn't a page object - use it as
    // initializer to create parent selector.
    // 3. No parent specified -- use 'body' as initializer to create parent
    // selector.
    const { parent } = options;
    const parentSelector =
      parent instanceof AbstractPageObject ? parent.selector : Selector(parent);
    this._selector = parentSelector.find(this._bemBase.toQuerySelector());
  }

  /**
   * Page object's name.
   *
   *
   */
  get displayName() {
    return (<typeof AbstractPageObject>this.constructor).displayName;
  }

  get bemBase(): BemBase {
    return this._bemBase;
  }

  /**
   * Page object's selector.
   *
   * First of all it's narrowed down to parent selector, then by applying
   * selector transformations specified as `locator`.
   */
  get selector(): Selector {
    if (!this._selectorInitialized) {
      this._initializeSelector();
    }

    return this._selector;
  }

  /**
   * Used to initialize page object's selector.
   */
  private _initializeSelector() {
    for (const transformation of this._selectorTransformations) {
      this._selector = is.function_(transformation)
        ? transformation(this._selector, this._bemBase)
        : this._transformSelector(transformation);
    }

    this._selectorInitialized = true;
  }

  /**
   * Used to allow custom selector transformation to be added by derived page
   * object class when required.
   */
  private _transformSelector(transformation: SelectorTransformation): Selector {
    if (this._selectorInitialized) {
      throw new Error(
        `${this.displayName} -- selector is initialized and therefore can ` +
          "not be transformed"
      );
    }

    return this.transformSelector(transformation, this._selector, this.bemBase);
  }

  /**
   * Transforms passed in selector.
   *
   * Don't use `this.selector` here because that cause infinite loop!
   *
   * @param selectorTransformationAlias An object of transformations to apply. Each key:value pair is a transformation
   * @param selector Selector to transform
   * @param bemBase Page object's BEM base
   */
  transformSelector(
    selectorTransformationAlias: SelectorTransformationAlias,
    selector: Selector,
    bemBase: BemBase
  ): Selector {
    return selector;
  }

  /**
   * Asserts that page object exists -- its selector returns one DOM element.
   *
   * @param [options] Options
   * @param [options.allowMultiple=false] By default When `true` then selector allowed to return more than one DOM element to pass assertion
   * @param {Boolean} [options.hover=false] When truthy and `isNot` is falsey then `#hover()` would be called additionally
   * @param {Boolean} [options.isNot=false] When truthy fragment's selector must not exist (return zero DOM elements) to pass assertion
   * @param {String} [options.message] Custom message for error
   * @return {Promise<void>}
   */
  async expectIsExist(options?: {
    allowMultiple?: boolean;
    hover?: boolean;
    isNot?: boolean;
    message?: string;
  }): Promise<void> {
    options = options || {};
    if (is.undefined(options.allowMultiple)) {
      options.allowMultiple = false;
    }
    if (is.undefined(options.hover)) {
      options.hover = false;
    }
    if (is.undefined(options.isNot)) {
      options.isNot = false;
    }

    const { allowMultiple, hover, isNot, message } = options;

    // ---------------------------------------------------------------------------
    // Handling case when selector must not exist
    // ---------------------------------------------------------------------------

    if (isNot) {
      await t
        .expect(this.selector.exists)
        .notOk(
          is.string(message) && message.trim().length > 0
            ? message
            : `${this.displayName} selector must not return DOM elements but it does`
        );
      return;
    }

    // ---------------------------------------------------------------------------
    // Handling case when selector must exist
    // ---------------------------------------------------------------------------

    const elementsCount = await this.selector.count;
    if (allowMultiple) {
      await t
        .expect(elementsCount)
        .gte(
          1,
          is.string(message) && message.trim().length > 0
            ? message
            : `${this.displayName} selector must return one or more DOM ` +
                `elements but it return '${elementsCount}' of them`
        );
    } else {
      await t
        .expect(elementsCount)
        .eql(
          1,
          is.string(message) && message.trim().length > 0
            ? message
            : `${this.displayName} selector must return exactly one DOM ` +
                `element but it return '${elementsCount}' of them`
        );
    }

    if (hover && !isNot) {
      await this.hover();
    }
  }

  /**
   * Hovers on page object's selector.
   *
   * @param [options] Options
   * @param [options.selector=this.selector] Selector to hover on
   * @param [options.wait] Wait specified number of milliseconds after hover is done
   */
  async hover(options?: { selector?: Selector; wait?: number }): Promise<void> {
    options = options || {};
    if (is.undefined(options.selector)) {
      options.selector = this.selector;
    }

    const { selector, wait } = options;
    await t.hover(selector);

    if (wait) {
      await t.wait(wait);
    }
  }
}
