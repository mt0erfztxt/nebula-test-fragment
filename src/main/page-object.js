import expect from "unexpected";
import is from "@sindresorhus/is";
import { Selector, t } from "testcafe";
import { pascalCase } from "change-case";
import { BemBase, validateBemModifierName } from "./bem";
import { typeAndValue } from "./util";

/**
 * Class representing page object.
 */
export default class PageObject {
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
   * @type {NTF.PageObjectSelectorTransformation[]}
   */
  #selectorTransformations = [];

  /**
   * Creates page object.
   *
   * @param {NTF.PageObjectConstructorParams} args Any number of selector transformations that need to be applied to locate page object's DOM element. To specify parent page object pass it as first (and only first) argument.
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
   * @param {NTF.PageObjectSelectorTransformationAlias} selectorTransformationAlias Selector transformation to apply. How transformation is handled is a responsibility of an implementor.
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
   * Clicks on page object's selector.
   *
   * @param {Object} [options] An options.
   * @param {*} [options.selector=this.selector] A selector to click on. Anything TestCafe Selector accepts.
   * @param {number} [options.wait] A number of milliseconds to wait after click.
   * @returns {Promise<void>}
   */
  async click(options) {
    const { selector = this.selector, wait } = options || {};

    await t.click(Selector(selector));

    if (wait) {
      await t.wait(wait);
    }
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
   * Helper to obtain state part's value from BEM modifier or attribute of DOM
   * element returned by page object's selector.
   *
   * @param {string} name A name of BEM modifier or attribute which holds state part's value.
   * @param {Object} [options] Options.
   * @param {string} [options.defaultValue] Default value when `options.simple` is `false`.
   * @param {boolean} [options.simple=true] If `true` only presence of BEM modifier or attribute is checked.
   * @param {string} [options.src='bemModifier'] The source of state part's value. One of 'bemModifier' or 'attribute'.
   * @returns {Promise<boolean | string | undefined>} Returns state part's value.
   * @throws {Error} Throws on invalid input.
   * @todo Add tests for input validation.
   *
   * @example
   * await this.getStatePartHelper("cid", { simple: false }) // returns promise resolved with 'cid' of widget
   * await this.getStatePartHelper("disabled") // returns promise resolved with `true` when page object has 'disabled' BEM modifier
   * await this.getStatePartHelper("data-name", { simple: false, src: "attribute" }) // returns promise resolved with value of 'data-name' attribute
   */
  async getStatePartHelper(name, options) {
    if (!is.string(name) || is.emptyStringOrWhitespace(name)) {
      throw new Error(
        `${this.displayName}: 'name' must be a non-blank string but it ` +
          `doesn't -- ${typeAndValue(name)}`
      );
    }

    if (options && !is.plainObject(options)) {
      throw new Error(
        `${this.displayName}: 'options' must be a plain object but it ` +
          `doesn't -- ${typeAndValue(options)}`
      );
    }

    const { defaultValue, simple = true, src = "bemModifier" } = options || {};

    if (
      is.emptyStringOrWhitespace(defaultValue) ||
      (!is.undefined(defaultValue) && !is.string(defaultValue))
    ) {
      throw new Error(
        `${this.displayName}: 'options.defaultValue' must be a non-blank ` +
          `string but it doesn't -- ${typeAndValue(defaultValue)}`
      );
    }

    if (!is.boolean(simple)) {
      throw new Error(
        `${this.displayName}: 'options.simple' must be a boolean but it ` +
          `doesn't -- ${typeAndValue(simple)}`
      );
    }

    if (!["attribute", "bemModifier"].includes(src)) {
      throw new Error(
        `${this.displayName}: 'options.src' must be one of supported values ` +
          `but it doesn't -- ${typeAndValue(src)}`
      );
    }

    const valueOrDefault = (value, defaultValue) =>
      is.undefined(value) && defaultValue ? defaultValue : value;

    if (src === "bemModifier") {
      if (simple) {
        return this.selector.hasClass(
          this.bemBase
            .clone()
            .setMod([name])
            .toString()
        );
      } else {
        const modifiers = await this.getBemModifiers(name);
        const value = modifiers.length ? modifiers[0][1] : undefined;
        return valueOrDefault(value, defaultValue);
      }
    } else {
      if (simple) {
        return this.selector.hasAttribute(name);
      } else {
        const value = await this.selector.getAttribute(name);
        return valueOrDefault(value, defaultValue);
      }
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
   * Returns page object's state spec (includes its ancestor page objects
   * state specs). State spec is an object where keys are state part names and
   * values are state part specs, where state part spec is a boolean indicating
   * whether state part is writable (`true`) or read-only (`false`).
   *
   * Page object that have additional state parts must override this method
   * using two steps:
   * 1. call `super.getStateSpec` to get ancestors' state parts
   * 2. merge additional state parts to result of call above
   *
   * @returns {Object<string, boolean>}
   *
   * @example
   * // If `TextInput` is a page object with writable state part named 'Value'
   * // then call below return `{ cid: false, value: true }`.
   * new TextInput().getStateSpec()
   */
  getStateSpec() {
    return { cid: false };
  }

  /**
   * Returns page object's state.
   *
   * @param {...string} requestedStatePartNames Names of state parts to include in returned state.
   * @returns {Promise<Object>}
   * @throws {Error} Throws on invalid input.
   */
  async getState(...requestedStatePartNames) {
    // Check input validity.
    requestedStatePartNames.forEach((requestedStatePartName, idx) => {
      if (
        !is.string(requestedStatePartName) ||
        is.emptyStringOrWhitespace(requestedStatePartName)
      ) {
        throw new Error(
          `${this.displayName}: item at index ${idx} in ` +
            `'requestedStatePartNames' must be a non-blank string but it ` +
            `doesn't -- ${typeAndValue(requestedStatePartName)}`
        );
      }
    });

    const allStatePartNames = Object.keys(this.getStateSpec());

    // Check input meaningfulness.
    requestedStatePartNames.forEach((requestedStatePartName, idx) => {
      if (!allStatePartNames.includes(requestedStatePartName)) {
        throw new Error(
          `${this.displayName}: item '${requestedStatePartName}' at index ` +
            `${idx} in 'requestedStatePartNames' must be a supported state ` +
            `part name but it doesn't -- ${allStatePartNames.sort()}`
        );
      }
    });

    const isAllStatePartsRequested = requestedStatePartNames.length === 0;

    /**
     * A list of state part names to getters that retrieves their values.
     *
     * Array used because of ordering is needed when constructing state.
     *
     * @example
     * [["cid", "getCid"], ["value", "getValue"]]
     *
     * @type {string[][]}
     */
    const statePartNameToGetterNameList = [];
    allStatePartNames.forEach(statePartName => {
      if (
        isAllStatePartsRequested ||
        requestedStatePartNames.includes(statePartName)
      ) {
        const statePartGetterName = `get${pascalCase(statePartName)}`;
        if (is.function_(this[statePartGetterName])) {
          statePartNameToGetterNameList.push([
            statePartName,
            statePartGetterName
          ]);
        } else {
          throw new Error(
            `${this.displayName}: must have '${statePartGetterName}' method ` +
              `but it doesn't`
          );
        }
      }
    });

    const statePartValuePromises = [];
    statePartNameToGetterNameList.forEach(([, statePartGetterName]) => {
      statePartValuePromises.push(this[statePartGetterName]());
    });

    const state = {};
    (await Promise.all(statePartValuePromises)).forEach((v, i) => {
      state[statePartNameToGetterNameList[i][0]] = v;
    });

    return state;
  }

  /**
   * Sets page object's state.
   *
   * @param {Object} [newState] New state for page object. It can be full (all state parts present) or partial state and values for read-only state parts silently ignored.
   * @returns {Promise<void>}
   * @throws {Error} Throws on invalid input.
   */
  async setState(newState) {
    if (is.nullOrUndefined(newState)) {
      return;
    }

    // Check input validity.
    if (!is.plainObject(newState)) {
      throw new Error(
        `${this.displayName}: 'newState' must be a plain object but it ` +
          `doesn't -- ${typeAndValue(newState)}`
      );
    }

    const stateSpec = this.getStateSpec();
    const statePartNames = Object.keys(stateSpec);
    const newStatePartNames = Object.keys(newState);

    // Check input meaningfulness.
    newStatePartNames.forEach(statePartName => {
      if (!statePartNames.includes(statePartName)) {
        throw new Error(
          `${this.displayName}: '${pascalCase(statePartName)}' state part ` +
            `is not one of supported state parts -- ${statePartNames.join(",")}`
        );
      }
    });

    for (const statePartName of newStatePartNames) {
      if (stateSpec[statePartName]) {
        const statePartSetterName = `set${pascalCase(statePartName)}`;
        if (is.function_(this[statePartSetterName])) {
          await this[statePartSetterName](newState[statePartName]);
        } else {
          throw new Error(
            `${this.displayName}: must have '${statePartSetterName}' method ` +
              `but it doesn't`
          );
        }
      }
    }
  }

  /**
   * Asserts page object's state satisfies specified value, see
   * [Unexpected]{@link https://unexpected.js.org/assertions/any/to-satisfy/}
   * for details.
   *
   * @param {Object} expectedState State to which page object's state must satisfy.
   * @returns {Promise<void>}
   *
   * @todo Allow {@link PageObject#getState} to accept requested state parts as object -- this allow to reduce number of called nested state's part getters to only required in assertion.
   */
  async expectStateToSatisfy(expectedState) {
    expect(
      await this.getState(...Object.keys(expectedState)),
      "to satisfy",
      expectedState
    );
  }

  /**
   * Returns page object of specified class using this page object as its
   * parent.
   *
   * @param {*} PageObjectClass A page object class which instance to return.
   * @param {NTF.PageObjectConstructorParams} args Same args as in {@link PageObject.constructor} but parent page object is always set to this page object.
   * @returns {*}
   * @throws {Error} Throws on invalid input or output.
   */
  getPageObjectHelper(PageObjectClass, ...args) {
    // Remove passed in parent (if any).
    if (args[0] instanceof PageObject) {
      args.shift();
    }

    const pageObject = new PageObjectClass(this, ...args);
    if (pageObject instanceof PageObject) {
      return pageObject;
    } else {
      throw new Error(
        `${this.displayName}: '${PageObjectClass}' must be a page object ` +
          `class but it doesn't -- ${is(pageObject)}`
      );
    }
  }
}
