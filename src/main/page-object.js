import is from "@sindresorhus/is";
import { Selector, t } from "testcafe";
import { pascalCase } from "change-case";
import { BemBase, validateBemModifierName } from "./bem";
import { typeAndValue } from "./util";

/**
 * Type representing selector transformation function.
 *
 * @typedef {function(Selector, BemBase): Selector} SelectorTransformationFunction
 */

/**
 * Type representing selector transformation alias.
 *
 * An array where first element is a required alias's name and other elements
 * are optional alias's value.
 *
 * @typedef {(string|*)[]} SelectorTransformationAlias
 */

/**
 * Type representing selector transformation.
 *
 * String and number are reserved for built-in 'cid' and 'idx' selector
 * transformations.
 *
 * @typedef {string|number|SelectorTransformationFunction|SelectorTransformationAlias} SelectorTransformation
 */

/**
 * Class representing page object.
 */
export class PageObject {
  /**
   * Used to map instance of page object class to DOM elements. Mapping is done
   * by adding BEM string to value of `class` attribute of DOM element. Each
   * page object have instance of `BemBase` initialized from its direct or
   * ancestor class. Root [page object class]{@link PageObject} has set it to
   * invalid BEM string so we can stop when climbing up by inheritance chain
   * when searching BEM base in ancestors.
   *
   * @type {BemString|BemBase}
   */
  static bemBase = "";

  /**
   * Used to provide human readable name for page object.
   *
   * @type {string}
   */
  static displayName = "PageObject";

  /**
   * Used to work with page object's BEM base.
   *
   * It can be provided as {@link PageObject.bemBase} property of page object's
   * class or ancestor page object's class.
   *
   * @type {BemBase}
   */
  #bemBase;

  /**
   * Used to work with page object's DOM element.
   *
   * Initialized on first access and scoped into provided parent selector,
   * which is a page body selector by default.
   *
   * @type {Selector}
   */
  #selector;

  /**
   * Used to show whether page object's selector was initialized or not.
   *
   * @type {boolean}
   */
  #selectorInitialized = false;

  /**
   * Used to show whether page object's selector initialization in process or
   * not.
   *
   * @type {boolean}
   */
  #selectorInitializing = false;

  /**
   * Used to store selector transformations that must be applied to page
   * object's selector on first access.
   *
   * @type {SelectorTransformation[]}
   */
  #selectorTransformations = [];

  /**
   * Creates page object.
   *
   * @param {PageObject|SelectorTransformation} args Any number of selector transformations that need to be applied to locate page object's DOM element. To specify parent page object pass it as first (and only first) argument.
   */
  constructor(...args) {
    let parentSelector = Selector("body");
    for (let i = 0; i < args.length; i++) {
      const selectorTransformation = args[i];
      if (selectorTransformation instanceof PageObject) {
        if (i === 0) {
          parentSelector = selectorTransformation.selector;
        } else {
          throw new Error(
            `${this.displayName}: only first selector transformation ` +
              `allowed to be parent page object but transformation at ` +
              `index ${i} is page object`
          );
        }
      } else {
        this.#selectorTransformations.push(selectorTransformation);
      }
    }

    this.#bemBase = new BemBase(
      "" + (this.constructor.bemBase || super.bemBase),
      {
        frozen: true
      }
    );

    this.#selector = parentSelector.find(this.#bemBase.toQuerySelector());
  }

  /**
   * Page object's BEM base.
   *
   * @returns {BemBase}
   */
  get bemBase() {
    return this.#bemBase;
  }

  /**
   * Page object's name.
   *
   * @type {string}
   */
  get displayName() {
    return this.constructor.displayName;
  }

  /**
   * Page object's selector.
   *
   * @type {Selector}
   */
  get selector() {
    if (!this.#selectorInitialized) {
      this.#initializeSelector();
    }

    return this.#selector;
  }

  /**
   * Used to initialize page object's selector.
   */
  #initializeSelector() {
    if (this.#selectorInitialized) {
      throw new Error(
        `${this.displayName}: selector already initialized and therefore ` +
          `can not be transformed`
      );
    }

    if (this.#selectorInitializing) {
      throw new Error(
        `${this.displayName}: selector initialization loop detected`
      );
    }

    this.#selectorInitializing = true;

    for (const transformation of this.#selectorTransformations) {
      switch (is(transformation)) {
        // Built-in 'cid' transformation.
        case "string":
          if (is.emptyStringOrWhitespace(transformation)) {
            throw new Error(
              `${this.displayName}: built-in 'cid' transformation must be ` +
                `non-blank string but it doesn't -- ` +
                typeAndValue(transformation)
            );
          }
          this.#selector = this.#selector.filter(
            this.#bemBase
              .clone()
              .setMod(["cid", transformation])
              .toQuerySelector()
          );
          break;

        // Built-in 'cid' transformation.
        case "number":
          if (is.integer(transformation) && transformation >= 0) {
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
            this.#selector = this.#selector.filter(
              (_, idx) => idx === transformation,
              { transformation }
            );
          } else {
            throw new Error(
              `${this.displayName}: built-in 'idx' transformation must be ` +
                `an integer greater than or equal zero but it doesn't -- ` +
                typeAndValue(transformation)
            );
          }
          break;

        // Selector transformation alias.
        case "Array":
          this.#selector = this.transformSelector(
            transformation,
            this.#selector,
            this.#bemBase
          );
          break;

        // Selector transformation function.
        case "Function":
          this.#selector = transformation(
            this.#selector,
            this.#bemBase.clone()
          );
          break;

        default:
          throw new Error(
            `${this.displayName}: unsupported selector transformation -- ` +
              typeAndValue(transformation)
          );
      }
    }

    this.#selectorInitialized = true;
    this.#selectorInitializing = false;
  }

  /**
   * Transforms passed in selector.
   *
   * Note:
   * - don't use `this.selector` in overrides because that cause infinite loop!
   *
   * @param {SelectorTransformationAlias} selectorTransformationAlias Selector transformation to apply. How transformation is handled is a responsibility of an implementor.
   * @param {Selector} selector Selector to transform.
   * @param {BemBase} bemBase Clone of page object's BEM base.
   * @returns {Selector} Returns transformed page object's selector.
   */
  transformSelector(selectorTransformationAlias, selector, bemBase) {
    return selector;
  }

  /**
   * Asserts that page object exists -- its selector returns exactly one DOM
   * element.
   *
   * @param {Object} [options] Options.
   * @param {boolean} [options.hover=false] When `true` and `isNot` is `false` then {@link PageObject#hover} would be called on page object.
   * @param {boolean} [options.isNot=false] When `true` page object's selector must not exist (return zero DOM elements) to pass assertion.
   * @param {string} [options.message] Custom message for error.
   * @returns {Promise<void>}
   */
  async expectIsExist(options) {
    const { hover = false, isNot = false, message } = options || {};
    const elementsCount = await this.selector.count;

    // ---------------------------------------------------------------------------
    // Handling case when selector must not exist (return zero DOM elements)
    // ---------------------------------------------------------------------------

    if (isNot) {
      await t
        .expect(this.selector.exists)
        .notOk(
          is.string(message) && message.trim().length > 0
            ? message
            : `${this.displayName}: selector must not return DOM elements ` +
                `but it does -- ${elementsCount} returned`
        );
      return;
    }

    // ---------------------------------------------------------------------------
    // Handling case when selector must exist (return exactly one DOM element)
    // ---------------------------------------------------------------------------

    await t
      .expect(elementsCount)
      .eql(
        1,
        is.string(message) && message.trim().length > 0
          ? message
          : `${this.displayName}: selector must return exactly one DOM ` +
              `element but it doesn't -- ${elementsCount} returned`
      );

    if (hover && !isNot) {
      await this.hover();
    }
  }

  /**
   * Asserts that page object not exists -- its selector returns zero DOM
   * elements.
   *
   * @param {Object} [options] Options.
   * @param {string} [options.message] Custom message for error.
   * @returns {Promise<void>}
   */
  async expectIsNotExist(options) {
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
   * @param {Object} [options] Options.
   * @param {Selector} [options.selector=this.selector] Selector to hover on.
   * @param {number} [options.wait] Wait specified number of milliseconds after hover is done.
   * @returns {Promise<void>}
   */
  async hover(options) {
    const { selector = this.selector, wait } = options || {};

    await t.hover(selector);

    if (wait) {
      await t.wait(wait);
    }
  }

  /**
   * Returns an array of BEM modifiers that DOM element, returned by page
   * object's selector, have.
   *
   * @param {BemModifierName} [bemModifierName] If `true` then only BEM modifiers with that name would be in resulting array.
   * @returns {Promise<BemModifier[]>}
   *
   * @example
   * // Having page object Foo in HTML
   * // <div className="foo foo-cid_1 foo--bar">Foo</div>
   * // a call to
   * await this.getBemModifiers(); // returns [["cid", "1"], ["foo"]]
   * await this.getBemModifiers("cid"); // returns [["cid", "1"]]
   */
  async getBemModifiers(bemModifierName) {
    /**
     * @type {BemModifierName}
     */
    let bmn;
    if (is.undefined(bemModifierName)) {
      bmn = "";
    } else {
      const { error, value } = validateBemModifierName(bemModifierName);
      if (error) {
        throw new Error(error);
      }

      bmn = value;
    }

    const classNamePrefix =
      this.bemBase
        .clone()
        .setMod()
        .toString() + `--${bmn}`;
    return (await this.selector.classNames).reduce(
      (acc, className) => {
        if (className.startsWith(classNamePrefix)) {
          acc.push(new BemBase(className).mod);
        }
        return acc;
      },
      /** @type {BemModifier[]}  */ []
    );
  }

  /**
   * Returns state part with specified name.
   *
   * @param {string|string[]} statePartName Name of state part. When it's a string then it would be used as state part name and also as name of attribute/BEM modifier that holds that part in page object's selector DOM element. When names differ, for example a case of data attribute, an array of two non-blank strings -- a state part name and attribute/BEM modifier name, can be passed.
   * @param {Object} [options] Options.
   * @param {boolean} [options.simple=true] If `true` a boolean value is assumed.
   * @param {string} [options.src='bemModifier'] The source of state part. One of 'bemModifier' or 'attribute' of DOM element returned by page object's selector.
   * @returns {Promise<boolean | string | undefined>}
   *
   * @example
   * await this.getStatePartHelper("cid", { simple: false }) // returns promise resolved with 'cid' of widget
   * await this.getStatePartHelper("disabled") // returns promise resolved with `true` when page object has 'disabled' BEM modifier
   * await this.getStatePartHelper("name", { simple: false, src: "attribute" }) // returns promise resolved with value of 'name' attribute
   *
   */
  async getStatePartHelper(statePartName, options) {
    // TODO: Handle `statePartName` as array
    const { simple = false, src = "bemModifier" } = options || {};
    if (src === "bemModifier") {
      if (simple) {
        return this.selector.hasClass(
          this.bemBase
            .clone()
            .setMod([statePartName])
            .toString()
        );
      } else {
        const modifiers = await this.getBemModifiers(statePartName);
        return modifiers.length ? modifiers[0][1] : undefined;
      }
    } else {
      return simple
        ? this.selector.hasAttribute(statePartName)
        : this.selector.getAttribute(statePartName);
    }
  }

  /**
   * Returns 'cid' part of page object's state.
   *
   * @returns {Promise<string | undefined>}
   */
  async getCid() {
    return this.getStatePartHelper("cid", { simple: false });
  }

  /**
   * Returns page object's and its ancestors' state parts mappings merged into
   * one. State parts mappings is an object where keys are state part names and
   * values are state part mode -- `true` for read-write, `false` for
   * read-only.
   *
   * Page object that have additional state parts must override this method
   * using two steps:
   * 1. call `super.getStateParts` to get ancestors' state parts
   * 2. merge additional state parts to result of call above
   *
   * @returns {Object<string, boolean>}
   *
   * @example
   * new TextInput().getStateParts() // { cid: false, value: true }
   */
  getStateParts() {
    return { cid: false };
  }

  /**
   * Returns page object's state.
   *
   * @param {...string} statePartNames Names of state parts to include.
   * @returns {Promise<Object>}
   * @throws {Error} Throws on invalid input.
   */
  async getState(...statePartNames) {
    // Check input validity.
    statePartNames.forEach((statePartName, idx) => {
      if (
        !is.string(statePartName) ||
        is.emptyStringOrWhitespace(statePartName)
      ) {
        throw new Error(
          `${this.displayName}: item at index ${idx} in 'statePartNames' must ` +
            `be a non-blank string but it doesn't -- ` +
            typeAndValue(statePartName)
        );
      }
    });

    const allStatePartNames = Object.keys(this.getStateParts());

    // Check input meaningfulness.
    statePartNames.forEach((statePartName, idx) => {
      if (!allStatePartNames.includes(statePartName)) {
        throw new Error(
          `${this.displayName}: item '${statePartName}' at index ${idx} in ` +
            `'statePartNames' must be a supported state part name but it ` +
            `doesn't -- ${allStatePartNames.sort()}`
        );
      }
    });

    const isAllStatePartsRequested = statePartNames.length === 0;
    const statePartNameToGetterNameMapping = {};
    allStatePartNames.forEach(statePartName => {
      if (isAllStatePartsRequested || statePartNames.includes(statePartName)) {
        const statePartGetterName = `get${pascalCase(statePartName)}`;

        if (!is.function_(this[statePartGetterName])) {
          throw new Error(
            `${this.displayName}: must have '${statePartGetterName}' method ` +
              `but it doesnt`
          );
        }

        statePartNameToGetterNameMapping[statePartName] = statePartGetterName;
      }
    });

    const state = {};
    Object.entries(statePartNameToGetterNameMapping).forEach(
      ([statePartName, statePartGetterName]) => {
        state[statePartName] = this[statePartGetterName]();
      }
    );

    return state;
  }
}
