import is from "@sindresorhus/is";
import { detailedDiff } from "deep-object-diff";
import { Selector, t } from "testcafe";
import {
  BemBase,
  BemModifier,
  BemModifierName,
  BemModifierRequirement,
  validateBemModifierName
} from "./bem";
import {
  AttributeName,
  AttributeRequirement,
  AttributeValue,
  filterByAttribute,
  NegationFlag,
  SpecializedExpectDomElementsCountIs
} from "./selector";

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
 * Represents page object class.
 */
export type PageObjectClass<T extends PageObject> = new (
  ...args: PageObjectConstructorArgs
) => T;

/**
 * Represents parameters of {@link PageObject#constructor} function.
 */
export type PageObjectConstructorArgs = (PageObject | SelectorTransformation)[];

/**
 * Represents {@link PageObject#getPageObject} function.
 */
export type GetPageObject<T extends PageObject> = (
  PageObjectClass: PageObjectClass<T>,
  ...extraArgs: GetPageObjectExtraArgs
) => T;

/**
 * Represents specialized version of {@link PageObject#getPageObject} function.
 */
export type SpecializedGetPageObject<T extends PageObject> = (
  ...args: GetPageObjectExtraArgs
) => T;

/**
 * Represents `extraArgs` parameter of {@link PageObject#getPageObject}
 * function.
 */
export type GetPageObjectExtraArgs = SelectorTransformation[];

/**
 * Represents {@link PageObject#expectHasPageObject} function.
 */
export type ExpectHasPageObject<T extends PageObject> = (
  getPageObject: GetPageObject<T>,
  ...extraArgs: ExpectHasPageObjectExtraArgs
) => Promise<T>;

/**
 * Represents specialized version of {@link PageObject#expectHasPageObject}
 * function.
 */
export type SpecializedExpectHasPageObject<T extends PageObject> = (
  ...args: ExpectHasPageObjectExtraArgs
) => Promise<T>;

/**
 * Represents `extraArgs` parameter of {@link PageObject#expectHasPageObject}
 * function.
 */
export type ExpectHasPageObjectExtraArgs = (
  | SelectorTransformation
  | ExpectHasPageObjectExtraArgsOptions
)[];

/**
 * Represents `options` parameter of {@link PageObject#expectHasPageObject}
 * function.
 */
export type ExpectHasPageObjectExtraArgsOptions = {
  equalityCheck?: EqualityCheck;
  idx?: number;
};

/**
 * Represents function used to check two page objects for equality.
 */
export type EqualityCheck = (l: PageObject, r: PageObject) => Promise<void>;

/**
 * Represents {@link PageObject#expectHasPageObjects} function.
 */
export type ExpectHasPageObjects<T extends PageObject> = (
  specializedExpectHasPageObject: SpecializedExpectHasPageObject<T>,
  specializedExpectDomElementsCountIs: SpecializedExpectDomElementsCountIs,
  ...extraArgs: ExpectHasPageObjectsExtraArgs
) => Promise<T>;

/**
 * Represents specialized version of {@link PageObject#expectHasPageObjects}
 * function.
 */
export type SpecializedExpectHasPageObjects<T extends PageObject> = (
  ...args: ExpectHasPageObjectsExtraArgs
) => Promise<T>;

/**
 * Represents `extraArgs` parameter of {@link PageObject#expectHasPageObjects}
 * function.
 */
export type ExpectHasPageObjectsExtraArgs = (
  | SelectorTransformation[]
  | ExpectHasPageObjectsExtraArgsOptions
)[];

/**
 * Represents `options` parameter of {@link PageObject#expectHasPageObjects}
 * function.
 */
export type ExpectHasPageObjectsExtraArgsOptions = {
  equalityCheck?: EqualityCheck;
  only?: boolean;
  sameOrder?: boolean;
};

export type PageObjectState = { cid?: string };

export async function getPartOfState<T extends PageObject>(
  pageObject: T,
  partName: string,
  options?: {
    simple?: boolean;
    src?: "attribute" | "bemModifier";
  }
): Promise<boolean | string | undefined> {
  const { simple = false, src = "bemModifier" } = options || {};
  if (src === "bemModifier") {
    if (simple) {
      return pageObject.selector.hasClass(
        pageObject.bemBase
          .clone()
          .setMod([partName])
          .toString()
      );
    } else {
      const modifiers = await pageObject.getBemModifiers(partName);
      return modifiers.length ? modifiers[0][1] : undefined;
    }
  } else {
    return simple
      ? pageObject.selector.hasAttribute(partName)
      : pageObject.selector.getAttribute(partName);
  }
}

export type TextRequirement =
  | boolean
  | number
  | RegExp
  | string
  | [boolean | number | RegExp | string, NegationFlag?];

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
   * Returns page object (instantiated from specified page object class)
   * contained anywhere inside this page object.
   *
   * Note: 'inside this page object' means this page object would be set as
   * parent for returned page object.
   *
   * @param PageObjectClass Class of page object to be returned
   * @param extraArgs Any number of selector transformations to be used when constructing instance of `PageObjectClass`
   */
  getPageObject<T extends PageObject>(
    PageObjectClass: PageObjectClass<T>,
    ...extraArgs: GetPageObjectExtraArgs
  ): T {
    return new PageObjectClass(this, ...extraArgs);
  }

  /**
   * Asserts that this page object has specified page object inside it.
   *
   * @param specializedGetPageObject Specialized version of {@link PageObject#getPageObject} function that accepts any number of {@link SelectorTransformation}s and returns page object, see {@link PageObject#getPageObject} for implementation of not specialized version
   * @param extraArgs Arguments to be passed when constructing instance of `PageObjectClass`. Last argument can be an object with properties: `equalityCheck` -- allows to use custom logic for equality check (see {@link PageObject#expectIsEqual}), `idx` -- allows to assert that object found at specified position (see {@link PageObject#expectIndexInParentIs}).
   * @returns Found page object.
   */
  async expectHasPageObject<T extends PageObject>(
    specializedGetPageObject: SpecializedGetPageObject<T>,
    ...extraArgs: ExpectHasPageObjectExtraArgs
  ): Promise<T> {
    let options: ExpectHasPageObjectExtraArgsOptions = {};
    let selectorTransformations: SelectorTransformation[] = [];
    const argsLen = extraArgs.length;
    const optionsArgIdx = argsLen - 1;
    for (let i = 0; i < argsLen; i++) {
      const item = extraArgs[i];
      if (is.array(item) || is.function_(item)) {
        selectorTransformations.push(item);
      } else if (i === optionsArgIdx) {
        options = item;
      }
    }

    const pageObject = specializedGetPageObject.call(
      this,
      ...selectorTransformations
    );

    const { equalityCheck, idx } = options;
    if (is.integer(idx)) {
      await pageObject.expectIndexInParentIs(this, idx, { equalityCheck });
    } else {
      await pageObject.expectIsExist();
    }

    return pageObject;
  }

  /**
   * Asserts that this page object has specified page objects inside it.
   *
   * This a convenience version of {@link PageObject#expectHasPageObject} to
   * assert on multiple page objects at once.
   *
   * @param specializedExpectHasPageObject Specialized version of {@link PageObject#expectHasPageObject}
   * @param specializedExpectDomElementsCountIs Specialized version of {@link expectDomElementsCountIs}
   * @param extraArgs Array of arguments to be passed to `specializedExpectHasPageObject` when creating page objects. Last argument can be an options object with properties: `equalityCheck` -- allows to use custom logic for equality check (see {@link PageObject#expectIsEqual}), `only` -- if `true` this page object must have only specified page objects, otherwise it can have more page objects than specified, `sameOrder` -- if `true` page objects must be found in specified order, otherwise order doesn't matter.
   * @returns List of found page objects.
   */
  async expectHasPageObjects<T extends PageObject>(
    specializedExpectHasPageObject: SpecializedExpectHasPageObject<T>,
    specializedExpectDomElementsCountIs: SpecializedExpectDomElementsCountIs,
    ...extraArgs: ExpectHasPageObjectsExtraArgs
  ): Promise<T[]> {
    let options: ExpectHasPageObjectsExtraArgsOptions = {};
    let selectorTransformationsArgs: SelectorTransformation[][] = [];
    const extraArgsLen = extraArgs.length;
    const optionsArgIdx = extraArgsLen - 1;
    for (let i = 0; i < extraArgsLen; i++) {
      const item = extraArgs[i];
      if (is.array(item)) {
        selectorTransformationsArgs.push(item);
      } else if (i === optionsArgIdx) {
        options = item;
      }
    }

    const pageObjectsCount = selectorTransformationsArgs.length;
    const { equalityCheck, only, sameOrder } = options;

    if (only || sameOrder) {
      await specializedExpectDomElementsCountIs.call(this, pageObjectsCount);
    }

    const pageObjects: T[] = [];

    for (let i = 0; i < pageObjectsCount; i++) {
      const options: ExpectHasPageObjectExtraArgsOptions = {
        equalityCheck
      };
      if (sameOrder) {
        options.idx = i;
      }

      const specializedExpectHasPageObjectArgs: ExpectHasPageObjectExtraArgs = [
        ...selectorTransformationsArgs[i],
        options
      ];

      pageObjects.push(
        await specializedExpectHasPageObject.call(
          this,
          ...specializedExpectHasPageObjectArgs
        )
      );
    }

    return pageObjects;
  }

  /**
   * Asserts that page object's selector returns exactly one DOM element and
   * that element conforms specified requirements.
   *
   * @param [requirements] Requirements
   * @param [requirements.attributes] Allows to assert that page object's selector returned DOM element have or have no attributes specified by {@link AttributeRequirement} -- uses same syntax as {@link filterByAttribute}
   * @param [requirements.bemModifiers] Allows to assert that page object's selector returned DOM element have or have no BEM modifiers specified by {@link BemModifierRequirement}. Same as for `requirements.attributes` but instead of attribute's name and value BEM modifier's name and value used. Note: must not be used with `selector` option.
   * @param [requirements.tagName] Allows to assert that page object's selector returned DOM element rendered using specified HTML tag
   * @param [requirements.text] Allows to assert that page object's selector returned DOM element's text conforms specified text requirement
   * @param [options] Options
   * @param [options.selector=this.selector] TestCafe's `Selector` to assert on, page object's selector by default
   */
  async expectExistsAndConformsRequirements(
    requirements?: {
      attributes?: (AttributeRequirement | AttributeName)[];
      bemModifiers?: (BemModifierRequirement | BemModifierName)[];
      tagName?: string;
      text?: TextRequirement;
    },
    options?: { selector?: Selector }
  ): Promise<void> {
    const opts = options || {};
    if (is.undefined(opts.selector)) {
      opts.selector = this.selector;
    }

    let { selector } = opts;
    const elementsCount = await selector.count;
    await t
      .expect(elementsCount)
      .eql(
        1,
        `Selector must return exactly one DOM element but it returned ` +
          `${elementsCount} of them`
      );

    if (is.undefined(requirements)) {
      return;
    }

    for (const item of requirements.attributes || []) {
      const [attrName, attrValue, isNot = false] = is.array(item)
        ? item
        : [item];
      selector = filterByAttribute(selector, [attrName, attrValue, isNot]);
      await t
        .expect(selector.count)
        .eql(
          1,
          `DOM element returned by selector must ` +
            (isNot ? "not " : "") +
            `have '${attrName}` +
            (is.undefined(attrValue) ? "" : `,${attrValue}`) +
            "' attribute but it does" +
            (isNot ? "" : "n't")
        );
    }

    if (
      requirements.bemModifiers &&
      requirements.bemModifiers.length &&
      options &&
      options.selector
    ) {
      throw new Error(
        "`bemModifier` requirements can't be used together with  `selector` " +
          "option"
      );
    }

    for (const item of requirements.bemModifiers || []) {
      const [modName, modValue, isNot = false] = is.array(item) ? item : [item];
      if (isNot) {
        await this.expectHasNoBemModifier([modName, modValue]);
      } else {
        await this.expectHasBemModifier([modName, modValue]);
      }
    }

    if (requirements.tagName) {
      const tagName = await selector.tagName;
      await t
        .expect(selector.tagName)
        .eql(
          requirements.tagName,
          `Tag of DOM element returned by selector must be ` +
            `'${requirements.tagName}' but it is '${tagName}'`
        );
    }

    const { text } = requirements;
    if (!is.undefined(text)) {
      const [stringOrRegExp, isNot = false] = is.array(text) ? text : [text];
      const selectorWithText: Selector = is.regExp(stringOrRegExp)
        ? selector.withText(stringOrRegExp)
        : selector.withExactText("" + stringOrRegExp);
      const isRegExp = is.regExp(stringOrRegExp);
      await t
        .expect(selectorWithText.count)
        .eql(
          isNot ? 0 : 1,
          `Text of DOM element returned by selector must ` +
            (isNot ? "not " : "") +
            (isRegExp ? "match " : "be equal '") +
            `${stringOrRegExp}` +
            (isRegExp ? "" : "'")
        );
    }
  }

  /**
   * Returns page object's state.
   */
  async getState(): Promise<PageObjectState> {
    const state: PageObjectState = {};
    const cid = await this.getCid();

    if (cid) {
      state.cid = cid;
    }

    return state;
  }

  /**
   * Sets page object's state to specified value.
   */
  async setState(_value: PageObjectState): Promise<void> {}

  /**
   * Returns 'cid' part of page object's state.
   */
  async getCid(): Promise<string | undefined> {
    return (await getPartOfState(this, "cid")) as string | undefined;
  }

  /**
   * Asserts that page object's state equal specified.
   *
   * @param state Expected page object's state
   * @param [debug=false] If `true` then detailed diff would be logged to console on assertion failure
   */
  async expectStateIs<T extends { [key: string]: any }>(
    state: T,
    debug?: boolean
  ): Promise<void> {
    const curState = await this.getState();

    if (debug) {
      console.log(
        "// --------------------------------- Actual -----------------------------------"
      );
      console.log(JSON.stringify(curState, null, "\t"));
      console.log(
        "// ----------------------------------------------------------------------------"
      );
      console.log();
      console.log(
        "// -------------------------------- Expected ----------------------------------"
      );
      console.log(JSON.stringify(state, null, "\t"));
      console.log(
        "// ----------------------------------------------------------------------------"
      );
    }

    await t
      .expect(curState)
      .eql(
        state,
        `${this.displayName}'s state doesn't equal expected\n` +
          `${JSON.stringify(detailedDiff(state, curState), null, "\t")}\n`
      );
  }

  /**
   * Asserts that page object's selector returned DOM element's tag is `BUTTON`.
   *
   * @param [options] Options
   * @param [options.text] Text of returned DOM element must conform this text requirement, see `text` requirement of {@link PageObject#expectExistsAndConformsRequirements}
   * @param [options.selector=this.selector] Same as `selector` option of {@link PageObject#expectExistsAndConformsRequirements}
   */
  async expectIsButton(options?: {
    selector?: Selector;
    text?: TextRequirement;
  }): Promise<void> {
    const { selector, text } = options || {};
    await this.expectExistsAndConformsRequirements(
      { tagName: "button", text },
      { selector }
    );
  }

  /**
   * Asserts that page object's selector returned DOM element's tag is `A`.
   *
   * @param [options] Options
   * @param [options.href] `href` attribute of returned DOM element must conform this attribute requirement, see `attributes` requirement of {@link PageObject#expectExistsAndConformsRequirements}
   * @param [options.text] Text of returned DOM element must conform this text requirement, see `text` requirement of {@link PageObject#expectExistsAndConformsRequirements}
   * @param [options.selector=this.selector] Same as `selector` option of {@link PageObject#expectExistsAndConformsRequirements}
   */
  async expectIsLink(options?: {
    href?: AttributeValue | [AttributeValue, NegationFlag?];
    selector?: Selector;
    text?: TextRequirement;
  }): Promise<void> {
    const { href, selector, text } = options || {};
    const [hrefVal, isNot = false] = is.array(href) ? href : [href];
    await this.expectExistsAndConformsRequirements(
      {
        attributes: href ? [["href", hrefVal, isNot]] : [],
        tagName: "a",
        text
      },
      { selector }
    );
  }

  /**
   * Asserts that page object's selector returned DOM element's text conforms
   * specified text requirement.
   *
   * @param text
   * @param [options] Options
   * @param [options.selector=this.selector] Same as `selector` option of {@link PageObject#expectExistsAndConformsRequirements}
   */
  async expectTextIs(
    text: TextRequirement,
    options?: { selector?: Selector }
  ): Promise<void> {
    await this.expectExistsAndConformsRequirements({ text }, options);
  }

  /**
   * Clicks on page object's selector.
   *
   * @param [options] Options
   * @param [options.selector=this.selector] Selector to click on
   * @param [options.wait] Wait specified number of milliseconds after click is done
   */
  async click(options?: { selector?: Selector; wait?: number }): Promise<void> {
    const { selector = this.selector, wait } = options || {};

    await t.click(selector);

    if (wait) {
      await t.wait(wait);
    }
  }
}
