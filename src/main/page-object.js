import is from "@sindresorhus/is";
import { Selector } from "testcafe";
import { BemBase } from "./bem";
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
}
