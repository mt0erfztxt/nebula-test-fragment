import is from "@sindresorhus/is";
import { Selector, t } from "testcafe";
import { BemBase } from "./bem";

/**
 * Represents selector transformation.
 */
export type SelectorTransformation =
  | SelectorTransformationFn
  | SelectorTransformationAlias;

/**
 * Represents selector transformation function.
 */
export type SelectorTransformationFn = (s: Selector, b: BemBase) => Selector;

/**
 * Represents selector transformation alias.
 */
export type SelectorTransformationAlias = [string, unknown];

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
  private readonly _selectorTransformations: SelectorTransformation[] = [];

  /**
   * Creates page object.
   *
   * Accepts variable number of selector transformations that need ot be
   * applied to locate page object. To specify parent page object pass it as first selector transformation.
   */
  constructor(...args: (AbstractPageObject | SelectorTransformation)[]) {
    let parentSelector = Selector("body");
    for (let i = 0; i < args.length; i++) {
      const selectorTransformation = args[i];
      if (selectorTransformation instanceof AbstractPageObject) {
        if (i === 0) {
          parentSelector = selectorTransformation.selector;
        } else {
          throw new Error(
            `${this.displayName} -- only first selector transformation ` +
              `allowed to be parent page object but transformation at ` +
              `index ${i} is page object`
          );
        }
      } else {
        this._selectorTransformations.push(selectorTransformation);
      }
    }

    this._bemBase = new BemBase(
      (<typeof AbstractPageObject>this.constructor).bemBase,
      { frozen: true }
    );

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
      this._selector = is.array(transformation)
        ? this._transformSelector(transformation)
        : transformation(this._selector, this._bemBase.clone());
    }

    this._selectorInitialized = true;
  }

  /**
   * Used to allow custom selector transformation aliases to be added in
   * derived page object classes by overriding {@link AbstractPageObject#transformSelector} method.
   */
  private _transformSelector(
    transformation: SelectorTransformationAlias
  ): Selector {
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
   * Asserts that page object exists -- its selector returns DOM element(-s).
   *
   * @param [options] Options
   * @param [options.allowMultiple=false] Most of the time testing is done against page objects with selector returning exactly one DOM element -- pass `true` to allow selector to pass assertion even when it returns more than one element
   * @param [options.hover=false] When `true` and `isNot` is `false` then {@link AbstractPageObject#hover} would be called additionally
   * @param [options.isNot=false] When `true` page object's selector must not exist (return zero DOM elements) to pass assertion
   * @param [options.message] Custom message for error
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
    // Handling case when selector must not exist (return zero DOM elements)
    // ---------------------------------------------------------------------------

    if (isNot) {
      const elementsCount = await this.selector.count;
      await t
        .expect(this.selector.exists)
        .notOk(
          is.string(message) && message.trim().length > 0
            ? message
            : `${this.displayName}'s selector must not return DOM elements ` +
                `but it returned ${elementsCount} of them`
        );
      return;
    }

    // ---------------------------------------------------------------------------
    // Handling case when selector must exist (return one or more DOM elements)
    // ---------------------------------------------------------------------------

    const elementsCount = await this.selector.count;
    if (allowMultiple) {
      await t
        .expect(elementsCount)
        .gte(
          1,
          is.string(message) && message.trim().length > 0
            ? message
            : `${this.displayName}'s selector must return one or more DOM ` +
                `elements but it returned ${elementsCount} of them`
        );
    } else {
      await t
        .expect(elementsCount)
        .eql(
          1,
          is.string(message) && message.trim().length > 0
            ? message
            : `${this.displayName}'s selector must return exactly one DOM ` +
                `element but it returned ${elementsCount} of them`
        );
    }

    if (hover && !isNot) {
      await this.hover();
    }
  }

  /**
   * Asserts that page object not exists -- its selector returns zero DOM
   * elements.
   *
   * @param [options] Options
   * @param [options.message] Custom message for error
   */
  async expectIsNotExist(options?: { message?: string }): Promise<void> {
    options = options || {};
    await this.expectIsExist({ isNot: true, message: options.message });
  }

  /**
   * Hovers on page object's selector.
   *
   * When selector returns more than one DOM element hover is done on first.
   *
   * Throws when selector doesn't return DOM elements.
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
