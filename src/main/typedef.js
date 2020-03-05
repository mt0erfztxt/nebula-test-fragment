import { Selector } from "testcafe";

/**
 * Namespace for nebula-test-fragment.
 *
 * @namespace NTF
 */

/**
 * Type representing TestCafe's assertion error.
 *
 * @typedef {Error} NTF.AssertionError
 * @property {string} errMsg An error message.
 */

/**
 * Type representing negation of something.
 *
 * @typedef {boolean} NTF.NegationFlag
 */

/**
 * Type representing selector transformation function.
 *
 * @typedef {function(Selector, BemBase): Selector} NTF.PageObjectSelectorTransformationFunction
 */

/**
 * Type representing selector transformation alias.
 *
 * An array where first element is a required alias's name and other elements
 * are optional alias's value.
 *
 * @typedef {(string|*)[]} NTF.PageObjectSelectorTransformationAlias
 */

/**
 * Type representing selector transformation.
 *
 * String and number are reserved for built-in 'cid' and 'idx' selector
 * transformations.
 *
 * @typedef {string|number|NTF.PageObjectSelectorTransformationFunction|NTF.PageObjectSelectorTransformationAlias} NTF.PageObjectSelectorTransformation
 */

/**
 * Type representing parameters of Page object's {@link PageObject.constructor constructor}.
 *
 * @typedef {Selector|PageObject|NTF.PageObjectSelectorTransformation} NTF.PageObjectConstructorParams
 */
