import is from "@sindresorhus/is";
import { Selector, t } from "testcafe";
import {
  TestCafeAssertion,
  testCafeAssertion,
  ValidationResult
} from "./utils";

const escapeStringRegexp = require("escape-string-regexp");

/**
 * Represents CSS class name.
 *
 * Valid CSS class is a non-blank string.
 *
 * @example
 * "TextInput"
 */
export type CssClass = string;

export function validateCssClass(
  cssClass: CssClass
): ValidationResult<CssClass> {
  if (cssClass.trim().length === 0) {
    return {
      error: `CSS class must be a non-blank string but it is '${cssClass}'`,
      value: cssClass
    };
  } else {
    return { value: cssClass };
  }
}

/**
 * Represents CSS class spec.
 *
 * Valid CSS class spec is a tuple where first element is required CSS class
 * and second is optional negation (`false` by default).
 *
 * @example
 * ["TextInput"] // same as ["TextInput", false]
 * ["TextInput", true] // not "TextInput"
 */
export type CssClassSpec = [CssClass, boolean?];

/**
 * Validates CSS class spec.
 *
 * On success `value` property of result is always boolean.
 *
 * @example
 * validateCssClassSpec(["TextInput"]) // result is { value: ["TextInput", false] }
 */
export function validateCssClassSpec(
  CssClassSpec: CssClassSpec
): ValidationResult<CssClassSpec> {
  const [cssClass, isNot = false] = CssClassSpec;
  const { error, value } = validateCssClass(cssClass);
  if (is.undefined(error)) {
    return { value: [value, isNot] };
  } else {
    return { error: `CSS class spec -- ${error}`, value: CssClassSpec };
  }
}

/**
 * Asserts that selector have (no) specified class names.
 *
 * @param selectorInitializer Anything TestCafe's `Selector` accepts as initializer
 * @param CssClasses
 * @param options
 */
export async function expectHasCssClasses(
  selectorInitializer: any,
  CssClasses?: CssClass | (CssClass | CssClassSpec)[],
  options: { only: boolean } = { only: false }
): Promise<void> {
  const sel = Selector(selectorInitializer);

  const selLen = await sel.count;
  await t
    .expect(selLen)
    .eql(
      1,
      `Selector must return exactly one DOM element but it returned ` +
        `${selLen} of them`
    );

  // ---------------------------------------------------------------------------
  // Handling case when selector must not have class names at all
  // ---------------------------------------------------------------------------

  if (is.undefined(CssClasses)) {
    const selectorCssClasses = await sel.classNames;
    await t
      .expect(selectorCssClasses)
      .eql(
        [""],
        "DOM element returned by selector must have no CSS classes but it " +
          `have '${selectorCssClasses.join(", ")}'`
      );

    return;
  }

  // ---------------------------------------------------------------------------
  // Handling case when selector must have/haven't specified class names
  // ---------------------------------------------------------------------------

  const mustPresentCssClasses: CssClass[] = [];

  for (const item of CssClasses) {
    const cssClassSpec: CssClassSpec = is.string(item) ? [item] : item;
    const { error, value } = validateCssClassSpec(cssClassSpec);
    if (error) {
      throw new Error(error);
    }

    const [cssClass, isNot = false] = value;

    if (!isNot) {
      mustPresentCssClasses.push(cssClass);
    }

    const message =
      "DOM element returned by selector must " +
      (isNot ? "not " : "") +
      `have '${cssClass}' CSS class but it ` +
      (isNot ? "does" : "doesn't");
    const assertion = isNot ? "notOk" : "ok";
    await t.expect(sel.hasClass(cssClass))[assertion](message);
  }

  if (options.only) {
    const mustPresentCssClassText = mustPresentCssClasses.join(", ");
    const selectorCssClasses = await sel.classNames;
    const selectorCssClassesText = selectorCssClasses.join(", ");
    await t
      .expect(selectorCssClasses.length)
      .eql(
        mustPresentCssClasses.length,
        `DOM element returned by selector must have only ` +
          `'${mustPresentCssClassText}' CSS class(es) but it have ` +
          `'${selectorCssClassesText}'`
      );
  }
}

export type NegationFlag = boolean;

/**
 * Represents attribute requirement.
 *
 * @example
 * ["foo"] // same as ["foo", undefined, false]
 * ["bar", 1, true] // same as ["bar", "1", true]
 */
export type AttributeRequirement = [
  AttributeName,
  AttributeValue?,
  NegationFlag?
];

/**
 * Represents attribute name.
 *
 * Valid attribute name is a non-blank string.
 *
 * @example
 * "foo"
 * "foo-bar"
 */
export type AttributeName = string;

/**
 * Represents attribute value.
 */
export type AttributeValue = boolean | number | RegExp | string | undefined;

export function validateAttributeName(
  attributeName: AttributeName
): ValidationResult<AttributeName> {
  const result: ValidationResult<AttributeName> = { value: attributeName };

  if (is.string(attributeName) && attributeName.trim().length === 0) {
    result.error =
      `Attribute's name must be a non-blank string but it is ` +
      `'${is(attributeName)}' -- ${attributeName}`;
  }

  return result;
}

export function validateAttributeRequirement(
  attributeRequirement: AttributeRequirement
): ValidationResult<AttributeRequirement> {
  const [attrName, attrValue, isNot = false] = attributeRequirement;
  const { error } = validateAttributeName(attrName);
  if (is.undefined(error)) {
    return {
      error,
      value: attributeRequirement
    };
  } else {
    return { value: [attrName, attrValue, isNot] };
  }
}

/**
 * Accepts TestCafe's `Selector` initializer and returns new selector filtered
 * using specified attribute requirement.
 *
 * @param selectorInitializer Anything TestCafe's `Selector` accepts as initializer
 * @param attributeRequirement Used to filter TestCafe's `Selector` created using `selectorInitializer` parameter so it returns only DOM elements with(out) attribute specified using {@link AttributeRequirement} [N, V?, F?]. When V is `undefined` -- filtering would be done by presence of N in element attributes, when regular expression -- filtering would be done by matching element attribute's value to V, otherwise filtering would be done by strict equality of element attribute's value to string version of V. When V is `undefined` and F is `false` then just N can be passed.
 *
 * @example
 * // Filter selector to return DOM nodes that have attribute named 'foo' with value equal '1'
 * filterByAttribute(["foo", 1]) // same as calling with ["foo", "1"],
 *
 * @example
 * // Filter selector to return DOM nodes that have attribute named 'foo' with any value or even without it
 * filterByAttribute(["foo", undefined]) // same as calling with ["foo"] or "foo"
 *
 * @example
 * // Filter selector to return DOM nodes that have attribute named 'foo' with value matches regular expression /.*bar$/
 * filterByAttribute(["foo", /.*bar$/])
 *
 * @example
 * // Filter selector to return only DOM nodes that have no attribute named 'value' with value equal '123'
 * filterByAttribute(["value", "123", true])
 */
export function filterByAttribute(
  selectorInitializer: any,
  attributeRequirement: AttributeRequirement | AttributeName
): Selector {
  const {
    error,
    value: [attrName, attrValue, isNot = false]
  } = validateAttributeRequirement(
    is.string(attributeRequirement)
      ? [attributeRequirement]
      : attributeRequirement
  );
  if (!is.undefined(error)) {
    throw new Error(error);
  }

  return Selector(selectorInitializer).filter(
    node => {
      if (!node.hasAttribute(attrName)) {
        return isNot;
      }

      if (attrValue == null) {
        return !isNot;
      }

      const val = node.getAttribute(attrName);
      if (attrValue instanceof RegExp) {
        const matches = val === null ? false : attrValue.test(val);
        return isNot ? !matches : matches;
      } else {
        const attrValAsStr = attrValue + "";
        return isNot ? attrValAsStr !== val : attrValAsStr === val;
      }
    },
    { attrName, attrValue, isNot } // dependencies
  );
}

/**
 * Accepts TestCafe's `Selector` initializer and creates new selector filtered
 * by specified text.
 *
 * It's a wrapper around TestCafe's `withText` that provides filtering by text
 * equality -- added because currently (v0.16.2) TestCafe's `withText` always
 * filters by regular expression matching.
 *
 * @param selectorInitializer Anything TestCafe's `Selector` accepts as initializer
 * @param text Text to filter on
 */
export function filterByText(
  selectorInitializer: any,
  text: boolean | number | RegExp | string
): Selector {
  // TestCafe (v0.16.2) always converts `withText` argument to `RegExp` and so
  // we must use workaround to use string equality.
  const textAsRegExp = is.regExp(text)
    ? text
    : new RegExp(`^${escapeStringRegexp("" + text)}$`);

  return Selector(selectorInitializer).withText(textAsRegExp);
}

/**
 * Represents {@link expectDomElementsCountIs} function.
 */
export type ExpectDomElementsCountIs = (
  selector: Selector,
  count: number,
  options?: ExpectDomElementsCountIsOptions
) => Promise<void>;

/**
 * Represents specialized version of {@link expectDomElementsCountIs} function.
 */
export type SpecializedExpectDomElementsCountIs = (
  count: number,
  options?: ExpectDomElementsCountIsOptions
) => Promise<void>;

/**
 * Represents `options` parameter of {@link expectDomElementsCountIs} function.
 */
export type ExpectDomElementsCountIsOptions = {
  assertion?: TestCafeAssertion;
  isNot?: NegationFlag;
};

/**
 * Asserts that count of DOM elements returned by specified selector equal
 * specified value.
 *
 * @param selector TestCafe's selector
 * @param count `selector` must return that number of DOM elements to pass assertion
 * @param [options] Options
 * @param [options.assertion="eql"] TestCafe's assertion to use
 * @param [options.isNot=false] Whether assertion must be negated or not
 *
 * @example
 * const sel = Selector(".foo");
 * expectDomElementsCountIs(sel, 5); // fails if `sel` returned not 5 DOM elements
 * expectDomElementsCountIs(sel, 5, { assertion: "lt" }); // fails if `sel` returned 5 or more DOM elements
 * expectDomElementsCountIs(sel, 5, { assertion: "lt", isNot: true }); // fails if `sel` returned less than 5 DOM elements
 */
export async function expectDomElementsCountIs(
  selector: Selector,
  count: number,
  options?: ExpectDomElementsCountIsOptions
): Promise<void> {
  options = options || {};
  if (is.undefined(options.assertion)) {
    options.assertion = "eql";
  }
  if (is.undefined(options.isNot)) {
    options.isNot = false;
  }

  const { assertion, isNot } = options;
  const assertionMethod = testCafeAssertion(assertion, { isNot });

  // @ts-ignore
  await t.expect(selector.count)[assertionMethod](count);
}
