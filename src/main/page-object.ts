import is from "@sindresorhus/is";
import { Selector, t } from "testcafe";
import {
  BemBase,
  BemModifier,
  BemModifierName,
  validateBemModifierName
} from "./bem";

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

/**
 * Represents arguments for page object constructor.
 */
export type PageObjectConstructorArgs = (PageObject | SelectorTransformation)[];

export class PageObject {
  /**
   * Page object's BEM base -- used to map page object to DOM element with
   * specific CSS class with BEM-like naming.
   */
  static bemBase = "";

  /**
   * Page object's display name -- used mostly for debugging purposes.
   */
  static displayName = "PageObject";

  /**
   * Holds page object class's BEM base as instance of `BemBase` class. We can
   * work with `PageObject.bemBase` directly, but using helper class is
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
  constructor(...args: PageObjectConstructorArgs) {
    let parentSelector = Selector("body");
    for (let i = 0; i < args.length; i++) {
      const selectorTransformation = args[i];
      if (selectorTransformation instanceof PageObject) {
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

    this._bemBase = new BemBase((<typeof PageObject>this.constructor).bemBase, {
      frozen: true
    });

    this._selector = parentSelector.find(this._bemBase.toQuerySelector());
  }

  /**
   * Page object's name.
   *
   *
   */
  get displayName() {
    return (<typeof PageObject>this.constructor).displayName;
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
   * derived page object classes by overriding {@link PageObject#transformSelector} method.
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
   * Default selector transformation aliases 'cid' and 'idx'.
   *
   * Don't use `this.selector` in overrides because that cause infinite loop!
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
    const [n, v] = selectorTransformationAlias;

    if (!["cid", "idx"].includes(n)) {
      return selector;
    }

    if ("cid" === n) {
      if (is.boolean(v) || is.number(v) || (is.string(v) && v.trim().length)) {
        selector = selector.filter(
          bemBase
            .clone()
            .setMod(["cid", "" + v])
            .toQuerySelector()
        );
      } else {
        throw new Error(
          `${this.displayName} -- Built-in 'cid' transformation must be a ` +
            `boolean, number or non-blank string but it is '${is(v)}' -- ${v}`
        );
      }
    } else if ("idx" === n) {
      if (is.integer(v) && v >= 0) {
        /*
         * NOTE: Don't use `Selector.nth()` because it doesn't work properly,
         * namely, when you try to call `nth()` later, for example, in
         * following transformation, selector would be reset to state
         * before `nth()` call in 'idx' transformation. Perhaps this is a
         * bug, but tested only in TestCafe '0.16.2'. This misbehavior was
         * discovered first time in '060-specs-composition' tests.
         *
         * THIS WOULD NOT WORK PROPERLY!!!
         * selector = selector.nth(v);
         */
        selector = selector.filter((_, idx) => idx === v, { v });
      } else {
        throw new Error(
          `${this.displayName} -- Built-in 'idx' transformation must be an ` +
            `integer greater than or equal zero but it is '${is(v)}' -- ${v}`
        );
      }
    }

    return selector;
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

  /**
   * Asserts that page object exists -- its selector returns DOM element(-s).
   *
   * @param [options] Options
   * @param [options.allowMultiple=false] Most of the time testing is done against page objects with selector returning exactly one DOM element -- pass `true` to allow selector to pass assertion even when it returns more than one element
   * @param [options.hover=false] When `true` and `isNot` is `false` then {@link PageObject#hover} would be called additionally
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
   * Asserts that DOM element returned by page object's selector has specified
   * BEM modifier.
   *
   * @param bemModifier BEM modifier that must present for assertion to pass
   *
   * @example
   * expectHasBemModifier(['foo']);
   * expectHasBemModifier(['foo', 'bar']);
   */
  async expectHasBemModifier(bemModifier: BemModifier): Promise<void> {
    // We don't use `getBemModifier()` here as page may not have DOM element or
    // element may not have modifier right now, for example, remote operation
    // is in progress. Instead TestCafe's `expect` used directly as it has
    // auto waiting feature.
    const className = this.bemBase
      .clone()
      .setMod(bemModifier)
      .toString();
    await t
      .expect(this.selector.hasClass(className))
      .ok(
        `DOM element returned by ${this.displayName}'s selector must have ` +
          `'${bemModifier}' BEM modifier but it doesn't`
      );
  }

  /**
   * Asserts that DOM element returned by page object's selector has no
   * specified BEM modifier.
   *
   * @example
   * expectHasNoBemModifier(['foo']);
   * expectHasNoBemModifier(['foo', 'bar']);
   */
  async expectHasNoBemModifier(bemModifier: BemModifier): Promise<void> {
    // We don't use `getBemModifier()` here as page may not have DOM element or
    // element may not have modifier right now, for example, remote operation
    // is in progress. Instead we use TestCafe's `expect` directly as it has
    // auto waiting feature.
    const className = this.bemBase
      .clone()
      .setMod(bemModifier)
      .toString();
    await t
      .expect(this.selector.hasClass(className))
      .notOk(
        `DOM element returned by ${this.displayName}'s selector must not ` +
          `have '${bemModifier}' BEM modifier but it does`
      );
  }

  /**
   * Returns Promise resolving with an array of BEM modifiers that DOM element,
   * returned by page object's selector, have.
   *
   * @param [bemModifierName] If set only BEM modifiers with that name would be in resulting array
   *
   * @example
   * // Having page object Foo in HTML
   * // <div className="foo foo-cid_1 foo--bar">Foo</div>
   * // a call to
   * await this.getBemModifiers(); // returns [["cid", "1"], ["foo"]]
   * await this.getBemModifiers("cid"); // returns [["cid", "1"]]
   */
  async getBemModifiers(
    bemModifierName?: BemModifierName
  ): Promise<BemModifier[]> {
    let bmn: BemModifierName;
    if (is.undefined(bemModifierName)) {
      bmn = "";
    } else {
      const { error, value } = validateBemModifierName(bemModifierName);

      if (error) {
        throw new Error(error);
      }

      bmn = value;
    }

    const bemMods: BemModifier[] = [];

    const bemBaseWithoutMod = this.bemBase.clone().setMod();
    const bemBaseWithModName = `${bemBaseWithoutMod}--${bmn}`;
    const classNames = await this.selector.classNames;
    for (const className of classNames) {
      if (className.startsWith(bemBaseWithModName)) {
        const mod = new BemBase(className).mod;
        if (mod) {
          bemMods.push(mod);
        }
      }
    }

    return bemMods;
  }

  /**
   * Asserts that page object is equal another page object.
   *
   * @param that A page object to which page object must be equal to pass assertion
   * @param [options] Options
   * @param [options.equalityCheck] Allows to provide custom implementation of equality check. A default implementation uses equality of `this` and `that` text contents. Custom implementation must be an async function which would be called with `this` and `that` page objects and it must throw when they aren't equal
   */
  async expectIsEqual(
    that: PageObject,
    options?: {
      equalityCheck?: (l: PageObject, r: PageObject) => Promise<void>;
    }
  ): Promise<void> {
    if (!(that instanceof this.constructor)) {
      throw new Error(
        `'that' argument must be a ${this.displayName} page object but it ` +
          `is a ${that.displayName} page object`
      );
    }

    options = options || {};

    if (options.equalityCheck) {
      await options.equalityCheck(this, that);
    } else {
      const thisTextContent = await this.selector.textContent;
      const thatTextContent = await that.selector.textContent;
      await t
        .expect(thisTextContent)
        .eql(
          thatTextContent,
          `${this.displayName} at left doesn't equal ${this.displayName} at ` +
            `right because their text contents not equal`
        );
    }
  }

  /**
   * Asserts that page object is found in specified parent at specified index.
   *
   * @param parent Parent page object
   * @param idx Position at which this page object must be found in parent to pass assertion. Must be an integer greater or equal zero
   * @param [options] Options
   * @param [options.equalityCheck] Same as in {@link PageObject#expectIsEqual}
   */
  async expectIndexInParentIs(
    parent: PageObject,
    idx: number,
    options?: {
      equalityCheck?: (l: PageObject, r: PageObject) => Promise<void>;
    }
  ) {
    if (!(is.integer(idx) && idx >= 0)) {
      throw new Error(
        `'idx' of ${this.displayName} must be an integer greater or equal ` +
          `zero but it is ${idx}`
      );
    }

    const pageObjectAtIdx = new (this.constructor as typeof PageObject)(
      parent,
      ["idx", idx]
    );
    await this.expectIsEqual(pageObjectAtIdx, options);
  }

  /**
   * Returns page object of specified page object class contained anywhere
   * inside this page object.
   *
   * @param PageObjectClass Class of page object to be returned
   * @param args Arguments to be passed when constructing instance of `PageObjectClass`
   */
  getPageObject<T extends PageObject>(
    PageObjectClass: new (...args: PageObjectConstructorArgs) => T,
    ...args: PageObjectConstructorArgs
  ): T {
    // Remove provided parent (if any).
    if (args[0] instanceof PageObject) {
      args.shift();
    }

    // Add this page object as parent.
    args.unshift(this);

    return new PageObjectClass(...args);
  }
}
