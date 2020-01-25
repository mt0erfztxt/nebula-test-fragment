import { Selector, t } from "testcafe";
import is from "@sindresorhus/is";

import { testCafeAssertion, ValidationResult } from "./utils";

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
  if (error) {
    return { error: `CSS class spec -- ${error}`, value: CssClassSpec };
  } else {
    return { value: [value, isNot] };
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
      `Selector must return exactly one DOM element but '${selLen}' of them returned`
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
        "Selector must have no class names but it have '" +
          `${selectorCssClasses.join(", ")}'`
      );

    return;
  }

  // ---------------------------------------------------------------------------
  // Handling case when selector must have/haven't specified class names
  // ---------------------------------------------------------------------------

  const mustPresentCssClasses = [];

  for (const item of CssClasses) {
    const cssClassSpec: CssClassSpec = is.string(item) ? [item] : item;
    const { error, value } = validateCssClassSpec(cssClassSpec);
    if (error) {
      throw new Error(error);
    }

    const [cssClass, isNot = false] = value;
    const assertion = testCafeAssertion("ok", { isNot });
    const message =
      "Selector must have" +
      (isNot ? " no " : " ") +
      `'${cssClass}' CSS class but it ` +
      (isNot ? "does" : "doesn't");

    if (!isNot) {
      mustPresentCssClasses.push(cssClass);
    }

    // @ts-ignore
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
        `Selector must have only '${mustPresentCssClassText}' class names ` +
          `but it have '${selectorCssClassesText}'`
      );
  }
}

/**
 * Represents attribute name.
 *
 * Valid attribute name is a non-blank string.
 *
 * @example
 * "id"
 * "data-foobar"
 */
export type AttributeName = string;

/**
 * Represents attribute value.
 */
export type AttributeValue = boolean | number | RegExp | string | undefined;

/**
 * Represents attribute spec.
 */
export type AttributeSpec = AttributeName | [AttributeName, AttributeValue?];

export function validateAttributeName(
  attributeName: AttributeName
): ValidationResult<AttributeName> {
  if (is.string(attributeName) && attributeName.trim().length === 0) {
    return {
      error:
        `Attribute name must be a non-blank string but it is ` +
        `'${is(attributeName)}' -- ${attributeName}`,
      value: attributeName
    };
  } else {
    return {
      value: attributeName
    };
  }
}

export function validateAttributeSpec(
  attributeSpec: AttributeSpec
): ValidationResult<AttributeSpec> {
  const [attrName] = is.array(attributeSpec) ? attributeSpec : [attributeSpec];
  const { error, value } = validateAttributeName(attrName);
  if (is.undefined(error)) {
    return { value };
  } else {
    return { error, value: attributeSpec };
  }
}

/**
 * Accepts TestCafe's `Selector` initializer and creates new selector filtered
 * by attribute specified attribute spec.
 *
 * @param selectorInitializer Anything TestCafe's `Selector` accepts as initializer
 * @param attributeSpec Used to filter TestCafe's `Selector` created using `selectorInitializer` parameter by specified attribute spec [N, V?]. When V is `undefined` -- filtering would be done by presence of N in selector's attributes, when regular expression -- filtering would be done by matching selector attribute's value to V, otherwise filtering would be done by strict equality of selector attribute's value to string version of V. When V is `undefined` just N can be passed.
 * @param [options] Options
 * @param [options.isNot=false] When `true` then filter condition would be negated, see examples
 *
 * @example
 * // Filter selector to return DOM nodes that have attribute named 'cid' with value equal '1'
 * filterByAttribute(["cid", 1]) // same as calling with ["cid", "1"],
 *
 * @example
 * // Filter selector to return DOM nodes that have attribute named 'disabled' with any value or even without it
 * filterByAttribute(["disabled", undefined]) // same as calling with ["disabled"] or "disabled"
 *
 * @example
 * // Filter selector to return DOM nodes that have attribute named 'foo' with value matches regular expression /.*bar$/
 * filterByAttribute(["foo", /.*bar$/])
 *
 * @example
 * // Filter selector to return only DOM nodes that have no attribute named 'value' with value equal '123'
 * filterByAttribute(["value", 123], { isNot: true })
 */
export function filterByAttribute(
  selectorInitializer: any,
  attributeSpec: AttributeSpec,
  options: { isNot?: boolean } = { isNot: false }
): Selector {
  const { error, value } = validateAttributeSpec(attributeSpec);
  if (!is.undefined(error)) {
    throw new Error(error);
  }

  const { isNot } = options;
  const attrName: AttributeName = value[0];
  const attrValue: AttributeValue = value[1];

  return Selector(selectorInitializer).filter(
    node => {
      if (!node.hasAttribute(attrName)) {
        return !!options.isNot;
      }

      if (is.nullOrUndefined(attrValue)) {
        return !options.isNot;
      }

      const val = node.getAttribute(attrName);
      if (is.regExp(attrValue)) {
        const matches = is.null_(val) ? false : attrValue.test(val);
        return isNot ? !matches : matches;
      } else {
        const attrValAsStr = attrValue + "";
        return isNot ? attrValAsStr !== val : attrValAsStr === val;
      }
    },
    { attrName, attrValue, isNot } // dependencies
  );
}
